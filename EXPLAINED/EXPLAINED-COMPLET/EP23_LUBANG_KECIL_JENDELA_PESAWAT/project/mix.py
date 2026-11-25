"""EP23 sound: cathedral bells and organ. A tubular bell melody in D dorian at 72 BPM over a deep organ drone and a
breathy pad that shifts between warm cabin gold and cold outside blue. SFX: glass resonances on reveals, whooshes on
scene cuts, pressure hiss in s4-s6, crack impact in s6, ice crystals in s7, a bell chord on AUDIRA.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2301)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 72
D3 = 146.83
DOR = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19]
hz = lambda st, base=D3: base * 2 ** (st / 12)


def bell(f, dur=2.0, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t * 1.8)
         + 0.5 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 3.5)
         + 0.25 * np.sin(2 * np.pi * f * 3.03 * t) * np.exp(-t * 6)
         + 0.12 * np.sin(2 * np.pi * f * 4.07 * t) * np.exp(-t * 9))
    return x * np.minimum(1, t / 0.003) * a


def organ(f, dur=1.5, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t + 0.3 * np.sin(t * 5)) / h ** 1.2 for h in range(1, 7))
    env = np.minimum(1, t / 0.02) * np.minimum(1, (dur - t) / 0.15)
    return x * env * a


def harp(f, a=1.0):
    t = np.arange(int(0.6 * SR)) / SR
    return sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (8 + 4 * h)) / h for h in range(1, 5)) * a


bel, org, pad, hrp = M.mono(), M.mono(), M.mono(), M.mono()
# organ drone: root/fifth alternating, chord changes every 4 bars
prog = [0, -2, 3, -5]  # D, C, F, A roots (dorian colour)
i, t0 = 0, 0.05
while t0 < END + 1.5:
    root = prog[(i // 8) % 4]
    st = root + (0 if i % 2 == 0 else 7) - 12
    M.lay(org, organ(hz(st), beat * 1.8, 0.7 if i % 4 == 0 else 0.45), t0)
    t0 += beat
    i += 1
# bell melody at scene openings
phr = {"s1": [7, 12, 10], "s2": [5, 7, 10, 12], "s3": [12, 10, 7, 5], "s4": [3, 5, 7, 10, 12],
       "s5": [12, 14, 15, 12], "s6": [10, 7, 5, 3], "s7": [5, 7, 10, 14], "s8": [12, 14, 15, 17, 19]}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.12
    for j, st in enumerate(notes):
        M.lay(bel, bell(hz(st), 2.0, 0.7), tt + j * beat * 0.55)
# accent bells on key words
for w in ("s1:lubang", "s3:tiga", "s4:Selisih", "s5:Udara", "s6:gagal", "s7:bunga", "s8:AUDIRA"):
    M.lay(bel, bell(hz(19), 2.5, 0.45), AT[w])
# harp flourishes at transitions
for w in ("s2:Namanya", "s3:dalam", "s4:kabin", "s5:sama", "s6:alih", "s7:uap"):
    for j, st in enumerate([0, 3, 7, 12]):
        M.lay(hrp, harp(hz(st + 12), 0.6), AT[w] + j * 0.09)
# pad: warm gold in cabin, shifts to cold blue outside, swells at pressure scenes
warm = M.env([(0, 0.3), (K["s1"], 0.3), (K["s3"], 0.5), (K["s4"], 0.8), (K["s5"], 0.9), (K["s6"], 1), (K["s7"], 0.7), (K["s8"], 0.9), (DUR, 0.8)])
pad += (0.4 * np.sin(2 * np.pi * 73.42 * T) + 0.3 * np.sin(2 * np.pi * 110.0 * T + np.sin(T * 0.35)) + 0.2 * np.sin(2 * np.pi * 146.83 * T)) * 0.5
cold = M.env([(0, 0), (AT["s4:tipis"], 0), (AT["s4:tipis"] + 0.5, 0.6), (K["s5"], 0.4), (K["s6"], 0.5), (K["s7"], 0.7), (K["s8"], 0.2), (DUR, 0)])
pad += cold * (0.2 * np.sin(2 * np.pi * 220 * T + 0.4 * np.sin(T * 0.6)) + 0.15 * np.sin(2 * np.pi * 329.6 * T))
# AUDIRA chord
for st in (0, 3, 7, 12, 15):
    M.lay(bel, bell(hz(st + 12), 3.0, 0.5), AT["s8:AUDIRA"] + st * 0.01)
e = M.env([(0, 0.8), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.45 * bel + 0.4 * org + 0.3 * pad + 0.3 * hrp) * e
side = 0.2 * np.roll(bel + pad * cold * 0.4, 900) * e
music = stereo(mono, side)


# ---- SFX ----
def glass_ring(t, a=0.04, f0=2400):
    tt = np.arange(int(0.5 * SR)) / SR
    x = np.sin(2 * np.pi * f0 * tt) * np.exp(-tt * 8) + 0.3 * np.sin(2 * np.pi * f0 * 1.5 * tt) * np.exp(-tt * 12)
    g(x / np.abs(x).max(), t, a)


def hiss(a, b, amp, lo=1800, hi=8000):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), lo, hi)
    env = np.minimum(1, np.arange(n) / (0.4 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.4 * SR))
    g(x / np.abs(x).max() * env, a, amp)


def ice_crackle(t, dur=0.8, a=0.03):
    n = int(dur * SR)
    x = M.band(M.rng.standard_normal(n), 3000, 12000)
    env = np.exp(-np.arange(n) / SR * 6)
    for k in range(5):
        pos = int(k * n / 5 + M.rng.integers(0, n // 10))
        if pos < n:
            env[pos:min(pos + 400, n)] *= 3
    g(x / np.abs(x).max() * env, t, a)


# scene-cut whooshes
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.06)
# glass resonance on key reveals
for w in ("s1:lubang", "s2:kecil", "s2:Namanya", "s3:tiga", "s4:Selisih", "s5:Udara", "s5:sama", "s6:gagal", "s7:bunga"):
    glass_ring(AT[w], 0.035, 2200 + 400 * (hash(w) % 5))
# pressure hiss through s4-s6
hiss(AT["s4:Selisih"] - 0.3, K["s7"], 0.02)
# crack impact when outer pane fails
g(M.lib("impact-bass-1"), AT["s6:gagal"], 0.06)
g(M.thump(0.3), AT["s6:gagal"], 0.1)
# leak hiss
hiss(AT["s6:bocor"] - 0.2, K["s7"], 0.015, 2500, 10000)
# frost / ice crystals in s7
ice_crackle(AT["s7:bunga"] - 0.3, 1.5, 0.03)
glass_ring(AT["s7:uap"], 0.03, 3200)
# passenger arrives in s8
g(M.lib("pop"), K["s8"] + 0.3, 0.04)
g(M.lib("click-soft"), AT["s8:cari"], 0.05)
# outro
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.1)
M.finish(music)
