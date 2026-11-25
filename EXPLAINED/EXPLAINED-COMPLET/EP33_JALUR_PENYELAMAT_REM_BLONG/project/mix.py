"""EP33 sound: a heavy-machinery pulse. A low D-minor drone and a ticking 100 BPM pulse (like a gauge needle) under a
diesel rumble on the road; in the brake cutaway a squeal on the brake word, a rising sizzle with the heat and boiling
pops; gravel crunches when the tyre sinks and pushes the pebbles; a water trickle in s6; 25 quick ticks as the gravel
slabs stack in s7, then a brake-out tail when the truck stops. SFX: whooshes on station cuts, impact on "blong",
pops on tags, chime on the stopping distance, sparkle + thump on the outro. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(3301)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 100
D2 = 73.42
hz = lambda st, base=D2: base * 2 ** (st / 12)

drone, pulse, lead, rumble = M.mono(), M.mono(), M.mono(), M.mono()
# drone: D + A + F, slow filter movement, darker on the road, tense (adds Bb) in the brake scene
tense = M.env([(0, 0), (K["s3"], 0), (K["s3"] + 1, 1), (K["s4"], 1), (K["s4"] + 1, 0), (K["s7"], 0), (K["s7"] + 1, 0.4), (K["s8"], 0), (DUR, 0)])
drone += 0.5 * np.sin(2 * np.pi * D2 * T) + 0.3 * np.sin(2 * np.pi * hz(7) * T + 0.3 * np.sin(T * 0.3)) + 0.22 * np.sin(2 * np.pi * hz(15) * T + np.sin(T * 0.21))
drone += tense * 0.25 * np.sin(2 * np.pi * hz(16) * T)
# gauge tick pulse: soft clicks on every beat, accent each bar
t0, i = 0.05, 0
while t0 < END + 1.0:
    M.lay(pulse, M.band(M.burst(0.03, 160, 1), 2500, 7000), t0, 0.5 if i % 4 == 0 else 0.25)
    if i % 2 == 0:
        M.lay(pulse, M.note(hz(-12 + (0 if (i // 8) % 2 == 0 else -2)), 0.35, "sine", 7), t0, 0.7)
    t0 += beat
    i += 1
# pluck motif at scene openings
mot = {"s1": [12, 15, 19], "s2": [12, 17, 19, 24], "s3": [13, 12, 8], "s4": [12, 15, 19, 22], "s5": [7, 10, 12], "s6": [12, 15, 17, 19], "s7": [19, 22, 24, 27], "s8": [12, 15, 19, 24]}
for s, notes in mot.items():
    tt = 0.1 if s == "s1" else K[s] + 0.1
    for j, st in enumerate(notes):
        M.lay(lead, M.note(hz(st + 12), 0.9, "pluck", 3.0), tt + j * beat * 0.5, 0.55)
# 25 rising ticks as the slabs stack
ts = AT["s7:dua"] - 0.15
for k in range(25):
    M.lay(lead, M.note(hz(24 + (k % 5) * 2 + k // 5), 0.18, "tri", 12), ts + k * 0.055 + 0.25, 0.35)
for st in (12, 19, 24, 27):
    M.lay(lead, M.note(hz(st + 12), 2.2, "pluck", 1.4), AT["s8:AUDIRA"] + st * 0.01, 0.4)
# diesel rumble on the road scenes
road = M.env([(0, 1), (K["s3"] - 0.2, 1), (K["s3"], 0), (K["s4"], 0), (K["s4"] + 0.2, 1), (AT["s4:kerikil"] + 1.2, 0.3), (K["s5"], 0), (K["s8"], 0), (K["s8"] + 0.3, 0.4), (DUR, 0.3)])
eng = np.sin(2 * np.pi * np.cumsum(32 + 3 * np.sin(T * 1.7)) / SR)
rumble += road * (0.6 * eng + 0.5 * M.band(M.rng.standard_normal(N), 30, 160) * 4)
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.35 * drone + 0.4 * pulse + 0.5 * lead + 0.3 * rumble) * e
side = 0.2 * np.roll(lead + drone * 0.3, 900) * e
music = stereo(mono, side)


# ---- SFX ----
def crunch(t, dur=0.4, a=0.05, n=7, seed=0):
    r = np.random.default_rng(seed)
    for j in range(n):
        x = M.band(M.burst(0.05, 70, 1), 900, 6000)
        g(x / max(1e-6, np.abs(x).max()), t + j * dur / n + r.random() * 0.02, a * (0.6 + 0.4 * r.random()))


def bed(a, b, amp, lo, hi, seed=1):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = M.band(np.random.default_rng(seed).standard_normal(n), lo, hi)
    env = np.minimum(1, np.arange(n) / (0.4 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.4 * SR))
    g(x / max(1e-6, np.abs(x).max()) * env, a, amp)


def squeal(t, dur=1.0, a=0.03):
    tt = np.arange(int(dur * SR)) / SR
    f = 2600 + 300 * np.sin(tt * 23) + 400 * tt
    g(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, tt / 0.05) * np.exp(-tt * 2.2), t, a)


def bubble(t, a=0.03, f0=500):
    tt = np.arange(int(0.08 * SR)) / SR
    g(np.sin(2 * np.pi * np.cumsum(f0 * (1 + 3 * tt / 0.08)) / SR) * np.exp(-tt * 45), t, a)


crunch(0.05, 0.6, 0.04, 6, 1)
crunch(AT["s1:tenggelam"] - 0.2, 0.7, 0.06, 9, 2)
for s in ("s3", "s4", "s5", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
g(M.lib("whoosh-short"), K["s6"] - 0.2, 0.05)
for w in ("s2:tiga", "s4:tikungan", "s6:gravitasi", "s6:basah", "s8:jangan"):
    g(M.lib("pop"), AT[w], 0.06)
tt = AT["s2:tiga"]
for j in range(3):
    g(M.lib("click-soft"), tt + j * 0.32, 0.06)
squeal(AT["s3:mengerem"] - 0.05, 1.2, 0.025)
bed(AT["s3:panas"] - 0.3, K["s4"] - 0.2, 0.03, 3000, 9000, 3)  # sizzle
tb = AT["s3:mendidih"]
r = np.random.default_rng(7)
while tb < K["s4"] - 0.3:
    bubble(tb, 0.03 + 0.02 * r.random(), 350 + 400 * r.random())
    tb += 0.08 + 0.15 * r.random()
g(M.lib("impact-bass-1"), AT["s3:blong"], 0.07)
g(M.lib("glitch-2"), AT["s3:blong"], 0.03)
g(M.thump(0.3), AT["s3:blong"], 0.12)
g(M.lib("ping"), AT["s4:bercabang"], 0.04)
crunch(AT["s4:kerikil"] + 0.2, 1.2, 0.05, 12, 4)
crunch(AT["s5:amblas"] - 0.25, 0.6, 0.07, 8, 5)
for w in ("s5:didorong", "s5:dipadatkan", "s5:digeser"):
    crunch(AT[w] - 0.05, 0.5, 0.05, 6, 6)
    g(M.lib("click"), AT[w], 0.04)
g(M.lib("riser"), AT["s5:menyedot"] - 0.4, 0.03)
bed(AT["s6:airnya"] - 0.2, AT["s6:Pasir"] + 0.5, 0.025, 1500, 7000, 8)  # water trickle
g(M.thump(0.25), AT["s6:mendadak"], 0.1)
g(M.lib("glitch-1"), AT["s6:mendadak"], 0.02)
g(M.lib("chime"), AT["s7:kali"], 0.04)
crunch(AT["s7:masuk"], AT["s7:meter"] - AT["s7:masuk"] + 0.3, 0.035, 14, 9)
g(M.lib("chime"), AT["s7:seratus"], 0.04)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
