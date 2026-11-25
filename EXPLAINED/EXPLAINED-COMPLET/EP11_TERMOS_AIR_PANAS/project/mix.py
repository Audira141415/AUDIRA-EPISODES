"""EP11 sound: THERMALFORGE warm-cool duality. A kalimba melody in D major at 100 BPM over a warm
sub-bass pad that cools (filter closes) when discussing vacuum/cold. Conduction demo gets metallic
taps, convection gets soft airflow, radiation gets a shimmer. Lab scene (s7) shifts to a cold,
sparse texture. SFX: glass tones for the flask, hiss for vacuum pump, silver chime for reflection.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1892)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 100
D3 = 146.83
MAJ = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]
hz = lambda st, base=D3: base * 2 ** (st / 12)


def kalimba(f, dur=1.2, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 4) + 0.5 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 10)
    x += 0.2 * np.sin(2 * np.pi * f * 5 * t) * np.exp(-t * 14)
    return x * np.minimum(1, t / 0.001) * a


def glass_bell(f, dur=2.0, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 1.5) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3)
    x += 0.15 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6)
    return x * np.minimum(1, t / 0.001) * a


def metal_tap(f=1800, a=1.0):
    t = np.arange(int(0.08 * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.3 * t)) * np.exp(-t * 55) * a


kal, bel, pad = M.mono(), M.mono(), M.mono()
# kalimba pulse: thirds alternating, warm
prog = [0, 4, 2, -3]
i, t0 = 0, 0.05
while t0 < END + 0.8:
    root = prog[(i // 8) % 4]
    st = root + (0 if i % 2 == 0 else 4)
    M.lay(kal, kalimba(hz(st), 0.9, 0.8 if i % 4 == 0 else 0.5), t0)
    t0 += beat / 2
    i += 1
# glass bell at scene starts and key moments
phr = {"s1": [12, 16, 19], "s2": [19, 16, 12], "s3": [9, 12, 14, 16], "s4": [0, 4, 7, 12],
       "s5": [12, 9, 7, 4], "s6": [4, 7, 9, 12, 16], "s7": [24, 21, 19, 16, 12], "s8": [12, 16, 19, 24]}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.1
    for j, st in enumerate(notes):
        M.lay(bel, glass_bell(hz(st + 12), 1.8, 0.5), tt + j * beat * 0.45)
# accent on key words
for w in ("s1:gas", "s3:ganda", "s4:Konduksi", "s5:hampir", "s6:perak", "s7:Thermos", "s8:AUDIRA"):
    M.lay(bel, glass_bell(hz(26), 2.2, 0.35), AT[w])
# warm pad: bright when hot, closes for vacuum/cold
warmth = M.env([(0, 0.8), (K.get("s2", 5), 0.7), (K["s4"], 0.6), (K["s5"], 0.2), (AT["s5:hampir"], 0.1),
                (K["s6"], 0.4), (K["s7"], 0.15), (AT["s7:nitrogen"], 0.1), (K["s8"], 0.5), (END, 0.6), (DUR, 0)])
pad += np.sin(2 * np.pi * 73.4 * T + 0.3 * np.sin(T * 0.5)) * 0.6
pad += warmth * (0.3 * np.sin(2 * np.pi * 293.7 * T + np.sin(T * 0.8)) + 0.2 * np.sin(2 * np.pi * 440 * T + 0.5 * np.sin(T * 0.6)))
pad += (1 - warmth) * 0.2 * np.sin(2 * np.pi * 110 * T) * M.env([(0, 0), (K["s5"], 0), (K["s5"] + 0.5, 1), (K["s7"], 1), (K["s8"], 0), (DUR, 0)])
e = M.env([(0, 0.85), (K.get("s1", 0.1), 1), (END + 0.3, 1), (DUR - 0.5, 0.4), (DUR, 0)])
mono = (0.45 * kal + 0.4 * bel + 0.35 * pad) * e
side = 0.2 * np.roll(bel + pad * warmth * 0.4, 700) * e
music = stereo(mono, side)


# ---- SFX ----
def hiss(t, dur=0.5, a=0.04):
    x = M.band(M.rng.standard_normal(int(dur * SR)), 2000, 8000)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (0.05 * SR)) * np.exp(-np.arange(n) / SR * 4)
    g(x / max(1e-9, np.abs(x).max()) * env, t, a)


def bubble(t, a=0.04, f0=800):
    tt = np.arange(int(0.15 * SR)) / SR
    g(np.sin(2 * np.pi * np.cumsum(f0 * (1 - 0.5 * tt / 0.15)) / SR) * np.exp(-tt * 25), t, a)


# scene cuts
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
# glass flask sounds in s3
g(M.lib("ping"), AT["s3:botol"], 0.06)
g(M.lib("ping"), AT["s3:kaca"], 0.05)
# conduction taps in s4
metal_snd = metal_tap()
g(metal_snd, AT["s4:Konduksi"], 0.07)
g(metal_snd, AT["s4:bersentuhan"], 0.06)
# convection: soft air
hiss(AT["s4:konveksi"], 0.4, 0.025)
# radiation shimmer
g(M.lib("sparkle"), AT["s4:radiasi"], 0.04)
# vacuum pump hiss in s5
hiss(AT["s5:menyedot"], 0.8, 0.05)
hiss(AT["s5:celah"], 0.4, 0.03)
# particles leaving
for j in range(5):
    bubble(AT["s5:partikel"] + j * 0.12, 0.03, 700 + j * 100)
# silver chime in s6
g(M.lib("chime"), AT["s6:perak"], 0.06)
g(M.lib("ping"), AT["s6:memantulkan"], 0.04)
g(M.lib("click"), AT["s6:leher"], 0.05)
# heat leak through neck
hiss(AT["s6:bocor"], 0.3, 0.03)
# nitrogen cold vapour in s7
hiss(AT["s7:nitrogen"] - 0.1, 0.6, 0.04)
g(M.lib("impact-bass-1"), AT["s7:Thermos"], 0.05)
g(M.thump(0.2), AT["s7:menggugat"], 0.08)
# outro
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.1)
M.finish(music)
