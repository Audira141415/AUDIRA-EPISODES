"""EP14 ESKALATOR sound: a mechanical felt-craft music box. A celesta melody in G major at 88 BPM over a soft
felt-piano pulse and a warm pad. The escalator mechanism gets a rhythmic chain-clack groove through s4-s6.
History sections (s2-s3) have a gentle fairground organ flavour. Etymology (s7) winds down to a music-box
outro. SFX: felt whooshes on cuts, mechanical clicks on step/wheel/chain words, gear clinks on motor, a
stamp on 'merek', and chain-loop clicks through the mechanism scenes.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1896)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 88
G4 = 392.0
MAJ = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19]
hz = lambda st, base=G4: base * 2 ** (st / 12)


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

# felt piano pulse: root/fifth alternating in 8ths
prog = [0, -2, 3, -4]  # G, F, B, E roots
i, t0 = 0, 0.05
while t0 < END + 1.2:
    root = prog[(i // 16) % 4]
    st = root + (0 if i % 2 == 0 else 7) - 12
    M.lay(pno, felt(hz(st), 0.8, 0.9 if i % 4 == 0 else 0.55), t0)
    t0 += beat / 2
    i += 1

# music-box phrases at scene openings
phr = {
    "s1": [7, 11, 14, 16],
    "s2": [12, 11, 7, 4, 2],
    "s3": [4, 7, 9, 12],
    "s4": [14, 12, 11, 9, 7],
    "s5": [7, 9, 11, 14, 16],
    "s6": [16, 14, 12, 11, 9],
    "s7": [0, 4, 7, 11, 12],
    "s8": [12, 14, 16, 17, 19],
}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.12
    for j, st in enumerate(notes):
        M.lay(cel, celesta(hz(st), 1.5, 0.8), tt + j * beat * 0.5)

# accent celesta on key words
for w in ("s1:eskalator", "s3:Seeberger", "s4:motor", "s5:terangkat", "s6:mesin", "s7:scala", "s8:berputar"):
    M.lay(cel, celesta(hz(19), 1.8, 0.5), AT[w])

# chain-clack groove: mechanical rhythm through s4-s6
clack = lambda: M.band(M.burst(0.04, 80, 1), 800, 4000)
t0, i = K["s4"], 0
while t0 < K["s7"] - 0.3:
    M.lay(grv, clack(), t0, 0.45 if i % 2 == 0 else 0.28)
    t0 += beat * 0.75
    i += 1

# warm pad: rises through the mechanism explanation
mech_rise = M.env([(0, 0.3), (K["s2"], 0.3), (K["s4"], 0.7), (K["s5"], 1), (K["s6"], 1), (K["s7"], 0.5), (K["s8"], 0.8), (DUR, 0.6)])
pad += (0.4 * np.sin(2 * np.pi * 196.0 * T) + 0.3 * np.sin(2 * np.pi * 293.7 * T + np.sin(T * 0.4)) + 0.2 * np.sin(2 * np.pi * 246.9 * T)) * 0.55
pad += mech_rise * (0.22 * np.sin(2 * np.pi * 523.3 * T + 0.5 * np.sin(T * 0.6)) + 0.15 * np.sin(2 * np.pi * 587.3 * T + np.sin(T * 0.4)))

# chain hum through mechanism sections (subtle low rumble)
chain_env = M.env([(0, 0), (K["s4"], 0), (K["s4"] + 0.5, 0.8), (K["s6e"], 0.8), (K["s7"], 0.2), (K["s8"], 0.1), (DUR, 0)])
chain_hz = 65 + 8 * np.sin(T * 1.3)
chain_hum = (np.sin(2 * np.pi * np.cumsum(chain_hz) / SR) + 0.3 * np.sin(2 * np.pi * np.cumsum(2 * chain_hz) / SR)) * chain_env * 0.4

# pizzicato in etymology section s7
for j in range(5):
    M.lay(cel, pizz(hz(j * 3 - 8)), AT["s7:scala"] + j * 0.15, 0.85)
for st in (0, 4, 7, 12):
    M.lay(cel, celesta(hz(st), 2.0, 0.6), AT["s7:umum"] - 0.3 + st * 0.015)

# outro sparkle
for st in (0, 4, 7, 11, 14):
    M.lay(cel, celesta(hz(st), 2.5, 0.5), AT["s8:AUDIRA"] + st * 0.012)

e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.5 * cel + 0.45 * pno + 0.3 * pad + 0.35 * grv + 0.35 * chain_hum) * e
side = 0.2 * np.roll(cel + pad * mech_rise * 0.4, 800) * e
music = stereo(mono, side)


# ---- SFX ----
def rustle(t, dur=0.3, a=0.04):
    x = M.band(M.rng.standard_normal(int(dur * SR)), 1500, 9000)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (0.03 * SR)) * np.exp(-np.arange(n) / SR * 9)
    g(x / np.abs(x).max() * env, t, a)


def metalclick(t, a=0.05, f0=2200):
    tt = np.arange(int(0.08 * SR)) / SR
    g(np.sin(2 * np.pi * f0 * tt * (1 - 0.3 * tt / 0.08)) * np.exp(-tt * 45), t, a)


# scene transition whooshes
for s in ("s2", "s4", "s7"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
for s in ("s3", "s5", "s6", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)

# felt rustles on key words
for w in ("s1:eskalator", "s1:berbalik", "s2:Jesse", "s2:tanjakan", "s3:Seeberger", "s3:Otis",
          "s4:kereta", "s4:roda", "s4:rantai", "s4:motor",
          "s5:rel", "s5:berjauhan", "s5:terangkat", "s5:undakan",
          "s6:merapat", "s6:bergerigi", "s6:berbalik", "s6:Pegangan",
          "s7:merek", "s7:scala", "s7:lepas",
          "s8:rantai", "s8:Episode"):
    rustle(AT[w] - 0.05, 0.28, 0.035)

# mechanical clicks on step/wheel/chain anatomy
metalclick(AT["s4:kereta"], 0.06, 2400)
metalclick(AT["s4:roda"], 0.05, 2800)
metalclick(AT["s4:rantai"], 0.06, 2000)
g(M.lib("click-soft"), AT["s4:motor"], 0.07)

# step formation clicks in s5
for w in ("s5:rel", "s5:berjauhan", "s5:terangkat"):
    metalclick(AT[w], 0.05, 2500)
g(M.lib("pop"), AT["s5:undakan"], 0.06)
g(M.thump(0.2), AT["s5:terbentuk"], 0.1)

# comb plate click and chain sounds in s6
metalclick(AT["s6:merapat"], 0.06, 3000)
metalclick(AT["s6:bergerigi"], 0.07, 3200)
g(M.lib("click"), AT["s6:berbalik"], 0.06)
g(M.lib("click-soft"), AT["s6:gigi"], 0.06)

# gear engagement chain through mechanism
t0 = K["s4"] + 0.5
j = 0
while t0 < K["s6e"] - 0.5:
    metalclick(t0, 0.025, 2000 + 400 * (j % 3))
    t0 += 0.7 + 0.15 * ((j * 5) % 4)
    j += 1

# trademark stamp in s7
g(M.lib("impact-bass-1"), AT["s7:merek"], 0.05)
g(M.thump(0.25), AT["s7:merek"], 0.1)
g(M.lib("pop"), AT["s7:scala"], 0.06)
g(M.lib("click-soft"), AT["s7:lepas"], 0.05)

# outro
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)

M.finish(music)
