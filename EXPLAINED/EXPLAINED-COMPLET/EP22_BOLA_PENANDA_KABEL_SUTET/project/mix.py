"""EP22 sound: a broadcast briefing-room groove. 100 BPM in A mixolydian: a soft kick + brushed snare, a round bass, and
filtered brass-like saw stabs on scene openings, over a high-wind bed. Helicopter rotor chop (AM noise) in s1, s3, s8;
a 100 Hz corona buzz under the live wires; thunder on "petir"; wood-block taps as the balls pop on; at night the drums
drop out, a slow pad takes over with a lamp hum that stops dead on "dimatikan".
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2222)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 100
A2 = 110.0
hz = lambda st, base=A2: base * 2 ** (st / 12)

drum, bass, stab, pad = M.mono(), M.mono(), M.mono(), M.mono()
prog = [0, -2, 5, 3]  # A, G, D, C
night = lambda t: K["s7"] - 0.2 < t < K["s8"]
i, t0 = 0, 0.05
while t0 < END + 1.0:
    root = prog[(i // 8) % 4]
    if not night(t0):
        if i % 4 == 0:
            M.lay(drum, M.thump(0.3), t0, 0.7)
        if i % 4 == 2:
            M.lay(drum, M.band(M.burst(0.18, 22, 2), 900, 6000), t0, 0.35)
        M.lay(drum, M.band(M.burst(0.03, 150, 1), 7000, 14000), t0 + beat / 4, 0.18)
        if i % 2 == 0:
            M.lay(bass, M.note(hz(root - 12), beat * 0.8, "tri", 3.5), t0, 0.9)
    t0 += beat / 2
    i += 1
for s in ("s1", "s2", "s3", "s4", "s5", "s6", "s8"):
    tt = 0.05 if s == "s1" else K[s] + 0.05
    root = 0 if s in ("s1", "s8") else 5 if s in ("s4", "s6") else -2
    for st in (0, 4, 7):
        M.lay(stab, M.band(M.note(hz(root + st + 12), 0.5, "saw", 5), 250, 2600), tt, 0.4)
pad += (0.35 * np.sin(2 * np.pi * hz(12) * T) + 0.25 * np.sin(2 * np.pi * hz(19) * T + np.sin(T * 0.4)) + 0.2 * np.sin(2 * np.pi * hz(16) * T + 0.5 * np.sin(T * 0.3)))
nightE = M.env([(0, 0.25), (K["s7"] - 0.3, 0.25), (K["s7"] + 0.6, 1), (K["s8"] - 0.2, 1), (K["s8"] + 0.6, 0.3), (DUR, 0.3)])
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.5 * drum + 0.5 * bass + 0.4 * stab + 0.4 * pad * nightE) * e
side = 0.2 * np.roll(stab + pad * nightE, 900) * e
music = stereo(mono, side)


# ---- SFX ----
def bed(a, b, amp, lo, hi, am=0.0, rate=0):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), lo, hi)
    tt = np.arange(n) / SR
    if rate:
        x *= 1 - am + am * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * rate * tt)))
    env = np.minimum(1, tt / 0.4) * np.minimum(1, (tt[-1] - tt) / 0.4)
    g(x / np.abs(x).max() * env, a, amp)


def hum(a, b, amp, f):
    n = int((b - a) * SR)
    if n <= 0:
        return
    tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 2 * f * tt) + 0.2 * np.sign(np.sin(2 * np.pi * f * tt))
    env = np.minimum(1, tt / 0.3) * np.minimum(1, (tt[-1] - tt) / 0.03)
    g(x * env, a, amp)


bed(0, DUR - 1, 0.012, 200, 1500)  # high wind
bed(0, K["s2"], 0.025, 80, 900, 0.7, 17)  # rotor, distant
bed(AT["s3:Helikopter"] - 0.3, K["s4"], 0.04, 80, 900, 0.8, 18)
bed(K["s8"], DUR - 0.6, 0.035, 80, 900, 0.8, 18)
g(M.lib("whoosh-cinematic"), K["s2"] - 0.25, 0.06)
for s in ("s3", "s5", "s6", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
g(M.lib("click-soft"), AT["s2:kokpit"], 0.05)
hum(AT["s2:Kabel"], AT["s2:kokpit"], 0.008, 100)
g(M.lib("error"), AT["s3:menabraknya"], 0.045)
g(M.lib("riser"), AT["s3:menabraknya"] - 1.4, 0.035)
for j in range(7):
    g(M.tone([1400, 2100], 0.08, 40), AT["s3:Karena"] + 0.25 + j * 0.12, 0.05)
hum(AT["s4:bertegangan"] - 0.3, AT["s4:dijepit"] + 0.3, 0.012, 100)
g(M.lib("glitch-1"), AT["s4:bertegangan"], 0.03)
g(M.lib("impact-bass-1"), AT["s4:petir"], 0.08)
th = M.band(M.burst(2.6, 1.6, 6), 30, 900)
g(th / np.abs(th).max(), AT["s4:petir"] + 0.05, 0.12)
for w in ("s5:bergantian", "s5:kuning", "s5:Kedua"):
    g(M.lib("pop"), AT[w], 0.05)
for j in range(3):
    g(M.tone([1200, 1800], 0.08, 40), AT["s5:kurang"] + j * 0.15, 0.05)
g(M.lib("click"), AT["s6:sembilan"], 0.06)
g(M.lib("click"), AT["s6:enam"], 0.06)
g(M.lib("sparkle"), AT["s6:rapat"], 0.04)
hum(AT["s7:menyala"] - 0.1, AT["s7:dimatikan"] + 0.1, 0.01, 100)
g(M.lib("ping"), AT["s7:menyala"], 0.04)
g(M.lib("click"), AT["s7:dimatikan"] + 0.1, 0.08)
g(M.lib("chime"), AT["s8:rambu"], 0.04)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
