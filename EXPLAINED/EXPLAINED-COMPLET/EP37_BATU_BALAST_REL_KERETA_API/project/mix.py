"""EP37 sound: a train-yard diorama. A warm sub-bass drone in E mixolydian with metallic harmonics that ring like rails;
a gentle woodblock ostinato taps the sleeper rhythm. Stone clicks and grinds for the ballast, a heat shimmer drone (s6),
rain patter through gaps (s6), a mechanical tamper chug (s7), and a final open chord on "fondasi" (s8).
SFX: rail clank on cuts, stone crunch on interlocking, rain patter, tamper vibration, wind.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(37)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 88
E2 = 82.41
hz = lambda st, base=E2: base * 2 ** (st / 12)


def bell(f, dur=2.0, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 2.5) * np.minimum(1, t / 0.003) * a


def metallic(f, dur=1.5, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t * 3.0) * a


def click(dur=0.03, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 80) * a


def crunch(dur=0.15, a=1.0):
    n = int(dur * SR)
    x = M.band(M.rng.standard_normal(n), 800, 5000)
    return x / max(1e-6, np.abs(x).max()) * np.exp(-np.arange(n) / SR * 12) * a


bel, pad, perc, atm = M.mono(), M.mono(), M.mono(), M.mono()

# drone: E + B, warm sub with metallic shimmer
pad += 0.5 * np.sin(2 * np.pi * E2 * T) + 0.25 * np.sin(2 * np.pi * E2 * 2 * T + 0.3 * np.sin(T * 0.4))
pad += 0.18 * np.sin(2 * np.pi * hz(7) * T)  # B2
warmth = M.env([(0, 0.7), (K["s4"], 0.9), (K["s6"], 0.5), (K["s7"], 0.8), (K["s8"], 1.0), (DUR, 1.0)])
pad += warmth * (0.12 * np.sin(2 * np.pi * hz(12) * T) + 0.08 * np.sin(2 * np.pi * hz(16) * T))

# metallic ring on scene openings (like rails humming)
for s, st in [("s1", 0), ("s2", 7), ("s3", 4), ("s4", 12), ("s5", 7), ("s6", 5), ("s7", 9), ("s8", 12)]:
    tt = 0.1 if s == "s1" else K[s] + 0.1
    M.lay(bel, metallic(hz(st + 12), 2.0, 0.5), tt)
    M.lay(bel, bell(hz(st + 24), 1.5, 0.3), tt + beat * 0.5)

# woodblock ostinato (sleeper rhythm): tap every beat, accent on 1
t0 = 0.3
while t0 < END + 0.5:
    accent = int((t0 - 0.3) / beat) % 4 == 0
    M.lay(perc, click(0.025, 0.45 if accent else 0.25), t0)
    t0 += beat

# key word bells
for w in ("s1:amblas", "s3:tajam", "s4:beban", "s5:mengunci", "s5:mencengkeram", "s6:memuai", "s7:gandar", "s8:fondasi"):
    M.lay(bel, bell(hz(24), 2.5, 0.4), AT[w])

# stone crunch cluster on "mencengkeram" (interlocking stones)
for j in range(6):
    M.lay(perc, crunch(0.12, 0.35), AT["s5:mencengkeram"] + j * 0.08)

# heat shimmer drone (s6): high harmonic wobble
heat_env = M.env([(0, 0), (AT["s6:terik"] - 0.5, 0), (AT["s6:memuai"], 1), (AT["s6:hujan"] - 0.3, 0.5), (AT["s6:rumput"], 0), (DUR, 0)])
atm += heat_env * 0.15 * np.sin(2 * np.pi * 880 * T + 3 * np.sin(T * 1.5))

# rain patter (s6): rapid tiny clicks
rain_env = M.env([(0, 0), (AT["s6:hujan"] - 0.5, 0), (AT["s6:hujan"], 1), (K["s7"] - 0.3, 0.5), (K["s7"], 0), (DUR, 0)])
rain = M.rng.standard_normal(N) * rain_env * 0.04
rain = M.band(rain, 2000, 8000)
atm += rain

# tamper chug (s7): rhythmic mechanical vibration
for j in range(12):
    tt = AT["s7:pemadat"] + j * 0.18
    if tt < K["s8"]:
        M.lay(perc, click(0.015, 0.4), tt)
        M.lay(perc, crunch(0.08, 0.2), tt + 0.05)

# outro chord
for st in (0, 7, 12, 16, 19):
    M.lay(bel, bell(hz(st + 12), 3.5, 0.35), AT["s8:AUDIRA"] + st * 0.012)

e = M.env([(0, 0.8), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.4 * bel + 0.35 * pad + 0.3 * perc + 0.25 * atm) * e
side = 0.2 * np.roll(bel + perc, 800) * e
music = stereo(mono, side)


# ---- SFX ----
for s in ("s2", "s3", "s5", "s7"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
for s in ("s4", "s6", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.3, 0.06)
g(M.lib("impact-bass-1"), AT["s1:amblas"], 0.04)
g(M.lib("impact-bass-1"), AT["s4:Roda"], 0.05)
g(M.lib("click"), AT["s3:pecah"], 0.06)
for j in range(3):
    g(M.lib("click"), AT["s5:mencengkeram"] + j * 0.15, 0.05)
g(M.lib("pop"), AT["s5:kelereng"], 0.06)
g(M.lib("riser"), AT["s7:pemadat"] - 1.0, 0.04)
g(M.lib("glitch-1"), AT["s6:memuai"], 0.03)
g(M.lib("chime"), AT["s8:fondasi"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)

M.finish(music)
