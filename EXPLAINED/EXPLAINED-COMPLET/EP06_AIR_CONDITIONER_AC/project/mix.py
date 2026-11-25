"""EP06 sound: a paper-craft music box. A celesta / music-box melody in F lydian at 96 BPM over a felt-piano pulse and an
airy pad that cools (brighter, wider) once the AC runs. The print shop gets a press clack groove; the bedroom gets a soft
fan bed; the outdoor unit adds a low compressor hum that follows the inverter speed; the PK chart counts in with pizzicato
blocks. SFX: paper whooshes on cuts, paper flaps on panel pops, press clacks, drips in s5, a stamp on "bocor", block
pops in s7. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1902)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 96
F4 = 349.23
LYD = [0, 2, 4, 6, 7, 9, 11, 12, 14, 16, 18, 19]
hz = lambda st, base=F4: base * 2 ** (st / 12)


def celesta(f, dur=1.4, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2) + 0.35 * np.sin(2 * np.pi * f * 4.01 * t) * np.exp(-t * 9) + 0.12 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 5)
    return x * np.minimum(1, t / 0.002) * a


def felt(f, dur=0.9, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (3 + 2.5 * h)) / h ** 1.4 for h in range(1, 6))
    return x * np.minimum(1, t / 0.008) * a


def pizz(f, a=1.0):
    t = np.arange(int(0.35 * SR)) / SR
    return sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (12 + 5 * h)) / h for h in range(1, 5)) * a


cel, pno, pad, grv = M.mono(), M.mono(), M.mono(), M.mono()
# felt piano pulse: root/fifth alternating in 8ths, chord changes every two bars
prog = [0, -3, 2, -5]  # F, D, G, C roots (lydian colour)
i, t0 = 0, 0.05
while t0 < END + 1.2:
    root = prog[(i // 16) % 4]
    st = root + (0 if i % 2 == 0 else 7) - 12
    M.lay(pno, felt(hz(st), 0.8, 0.9 if i % 4 == 0 else 0.55), t0)
    t0 += beat / 2
    i += 1
# music-box phrases at scene openings and key words
phr = {"s1": [7, 11, 14, 16], "s2": [12, 11, 7, 4], "s3": [4, 6, 7, 11, 14], "s4": [14, 16, 18, 19], "s5": [19, 18, 16, 14, 11],
       "s6": [0, 4, 7, 6], "s7": [7, 9, 11, 12], "s8": [12, 14, 16, 18, 19]}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.12
    for j, st in enumerate(notes):
        M.lay(cel, celesta(hz(st), 1.5, 0.8), tt + j * beat * 0.5)
for w in ("s1:kertas", "s3:Willis", "s4:evaporator", "s5:mengembun", "s6:inverter", "s8:pengering"):
    M.lay(cel, celesta(hz(23), 1.8, 0.5), AT[w])
# print-shop groove: press clacks on beats through s2/s3
clack = lambda: M.band(M.burst(0.05, 90, 1), 700, 3500)
t0, i = K["s2"], 0
while t0 < K["s4"] - 0.3:
    M.lay(grv, clack(), t0, 0.5 if i % 2 == 0 else 0.3)
    t0 += beat
    i += 1
# pad: dark-warm in the shop, opens bright and wide once the room cools
cool = M.env([(0, 0.2), (K["s3"], 0.2), (AT["s3:mendinginkan"], 0.7), (K["s4"], 0.4), (AT["s4:dingin"], 1), (K["s6"], 1), (K["s6"] + 1, 0.4), (K["s7"], 0.5), (K["s8"], 1), (DUR, 1)])
pad += (0.4 * np.sin(2 * np.pi * 174.6 * T) + 0.3 * np.sin(2 * np.pi * 261.6 * T + np.sin(T * 0.4)) + 0.2 * np.sin(2 * np.pi * 220 * T)) * 0.6
pad += cool * (0.25 * np.sin(2 * np.pi * 523.3 * T + 0.5 * np.sin(T * 0.7)) + 0.18 * np.sin(2 * np.pi * 659.3 * T + np.sin(T * 0.5)))
# compressor hum in s6 that follows the inverter speed
tmp = lambda x: 0.5 + 0.32 * np.sin(x * 1.1) + 0.12 * np.sin(x * 2.3 + 1)
spd = np.where(T > AT["s6:inverter"], tmp(T - 0.35), 0.85)
hum_env = M.env([(0, 0), (K["s6"], 0), (AT["s6:kompresor"] - 0.5, 0), (AT["s6:kompresor"], 1), (K["s6e"], 1), (K["s7"], 0), (DUR, 0)])
fhz = 55 + 30 * spd
hum = (np.sin(2 * np.pi * np.cumsum(fhz) / SR) + 0.4 * np.sin(2 * np.pi * np.cumsum(2 * fhz) / SR)) * hum_env * 0.5
# block pizzicato in s7
for j in range(4):
    M.lay(cel, pizz(hz(j * 4 - 12)), AT["s7:sembilan"] + j * 0.18, 0.9)
M.lay(cel, pizz(hz(7)), AT["s7:tujuh"], 0.9)
for j in range(3):
    M.lay(cel, celesta(hz(12 + j * 4), 1.2, 0.8), AT["s7:tiga"] + j * 0.22)
for st in (0, 4, 7, 11, 14):
    M.lay(cel, celesta(hz(st), 2.5, 0.5), AT["s8:AUDIRA"] + st * 0.012)
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.5 * cel + 0.45 * pno + 0.3 * pad + 0.35 * grv + 0.4 * hum) * e
side = 0.22 * np.roll(cel + pad * cool * 0.5, 800) * e
music = stereo(mono, side)


# ---- SFX ----
def rustle(t, dur=0.35, a=0.05):
    x = M.band(M.rng.standard_normal(int(dur * SR)), 1500, 9000)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (0.03 * SR)) * np.exp(-np.arange(n) / SR * 9)
    g(x / np.abs(x).max() * env, t, a)


def drip(t, a=0.05, f0=1200):
    tt = np.arange(int(0.12 * SR)) / SR
    g(np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.2 * tt / 0.12)) / SR) * np.exp(-tt * 40), t, a)


def airbed(a, b, amp, lo=300, hi=2500):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), lo, hi)
    env = np.minimum(1, np.arange(n) / (0.5 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.5 * SR))
    g(x / np.abs(x).max() * env, a, amp)


rustle(0.0, 0.5, 0.05)
airbed(0.0, K["s2"], 0.02)  # the hook machine blowing
for s in ("s2", "s4", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
for s in ("s3", "s5", "s6"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
for w in ("s2:percetakan", "s2:lembap", "s2:mengembang", "s2:meleset", "s3:mendinginkan", "s3:mengatur", "s4:dua", "s4:evaporator", "s4:Kipas",
          "s5:mengembun", "s5:selang", "s6:refrigeran", "s6:kompresor", "s6:membuang", "s6:inverter", "s7:sembilan", "s7:tujuh", "s8:pendingin", "s8:Episode"):
    rustle(AT[w] - 0.05, 0.3, 0.035)
g(M.lib("glitch-1"), AT["s2:meleset"], 0.025)
g(M.lib("pop"), AT["s3:merancang"], 0.06)
g(M.lib("click-soft"), AT["s4:unit"], 0.07)
airbed(AT["s4:Kipas"] - 0.3, K["s6"], 0.025, 400, 3000)
# condensation drips through s5, then the hose drip
tb = AT["s5:mengembun"]
j = 0
while tb < K["s6"]:
    drip(tb, 0.035 + 0.02 * (j % 3 == 0), 1000 + 300 * (j % 4))
    tb += 0.55 + 0.2 * ((j * 7) % 3)
    j += 1
g(M.lib("impact-bass-1"), AT["s5:bocor"], 0.05)
g(M.thump(0.25), AT["s5:bocor"], 0.12)
g(M.lib("ping"), AT["s6:inverter"], 0.04)
airbed(AT["s6:kipasnya"] - 0.3, K["s6e"], 0.02, 200, 1800)
g(M.lib("pop"), AT["s7:PK"], 0.06)
for j in range(4):
    g(M.lib("click-soft"), AT["s7:sembilan"] + j * 0.18, 0.06)
g(M.lib("pop"), AT["s7:tujuh"], 0.06)
for j in range(3):
    g(M.lib("click"), AT["s7:tiga"] + j * 0.22, 0.05)
g(M.lib("chime"), AT["s7:tiga"] + 0.7, 0.04)
airbed(K["s8"], END, 0.015, 400, 3000)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
