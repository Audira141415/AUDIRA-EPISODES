"""EP36 sound: a deep-sea dive. A slow sub drone in D dorian that darkens as the camera goes down, a sonar ping every
two bars, glassy FM bells for the living light (electrons), a bubbling arp once the battery runs (s5), a tick-clock in
s7 that fills the year, a warm brass pad for the 1824 hologram, and an open, airy chord when the dock drains (s8).
SFX: underwater whooshes on cuts, electric crackle on conduction, weld hiss + bolt clanks in s4, zinc fizz in s6,
drain rush in s8. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(36)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 84
D3 = 146.83
hz = lambda st, base=D3: base * 2 ** (st / 12)


def bell(f, dur=2.0, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    mod = 2.0 * np.exp(-t * 3) * np.sin(2 * np.pi * f * 3.5 * t)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.2) * np.minimum(1, t / 0.003) * a


def ping(f=1180, a=1.0):
    t = np.arange(int(1.6 * SR)) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 3.5) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 6)) * a


def bubble(f, a=1.0):
    t = np.arange(int(0.12 * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 2.0 * t / 0.12)) / SR) * np.exp(-t * 30) * a


bel, arp, pad, son = M.mono(), M.mono(), M.mono(), M.mono()
# drone: D + A, slow filter-ish wobble; depth darkens it (less upper partials) through s2-s3, brightens at s8
dark = M.env([(0, 0.6), (K["s2"], 0.4), (K["s3"], 0.2), (K["s4"], 0.4), (K["s6"], 0.3), (K["s7"], 0.5), (K["s8"], 1.0), (DUR, 1.0)])
pad += 0.5 * np.sin(2 * np.pi * 73.4 * T) + 0.35 * np.sin(2 * np.pi * 110 * T + 0.6 * np.sin(T * 0.3))
pad += dark * (0.22 * np.sin(2 * np.pi * 293.7 * T + np.sin(T * 0.5)) + 0.16 * np.sin(2 * np.pi * 440 * T + 0.5 * np.sin(T * 0.7)) + 0.1 * np.sin(2 * np.pi * 349.2 * T))
# brass-ish pad for 1824 (amber hologram)
br = M.env([(0, 0), (AT["s7:Davy"] - 1.2, 0), (AT["s7:Davy"], 1), (AT["s7:dihentikan"], 1), (K["s8"], 0), (DUR, 0)])
pad += br * sum(0.12 / h * np.sin(2 * np.pi * 220 * h * T) for h in range(1, 6))
# sonar ping every two bars (stops when the dock drains)
t0 = 0.2
while t0 < K["s8"] + 0.5:
    M.lay(son, ping(1180, 0.6), t0)
    t0 += beat * 8
# bells on scene openings + key words
phr = {"s1": [0, 7, 12, 14], "s2": [12, 10, 7], "s3": [7, 10, 12, 15], "s4": [5, 9, 12], "s5": [12, 14, 17, 19], "s6": [19, 17, 14, 12], "s7": [9, 12, 16], "s8": [12, 14, 17, 19, 24]}
for s, notes in phr.items():
    tt = 0.1 if s == "s1" else K[s] + 0.15
    for j, st in enumerate(notes):
        M.lay(bel, bell(hz(st + 12), 2.2, 0.6), tt + j * beat * 0.5)
for w in ("s1:habis", "s3:elektron", "s4:seng", "s5:mengalir", "s6:korban", "s8:pengawal"):
    M.lay(bel, bell(hz(31), 2.6, 0.45), AT[w])
# bubbling arp while the battery runs (s5 -> s6 buritan)
i, t0 = 0, AT["s5:tersambung"]
seq = [0, 7, 12, 15, 12, 7]
while t0 < AT["s6:buritan"]:
    M.lay(arp, bubble(hz(seq[i % 6] + 24) * 0.5, 0.8) * 0.6, t0)
    t0 += beat / 2
    i += 1
# year clock ticks in s7 (one tick per ingot)
for j in range(11):
    tt = AT["s7:ampere"] - 0.2 + (AT["s7:seng"] + 0.2 - AT["s7:ampere"] + 0.2) * j / 11
    M.lay(arp, bell(hz(24 + (j % 2) * 5), 0.4, 0.5), tt)
for st in (0, 5, 9, 12, 16):
    M.lay(bel, bell(hz(st + 12), 3.0, 0.4), AT["s8:AUDIRA"] + st * 0.015)
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.45 * bel + 0.3 * arp + 0.32 * pad + 0.35 * son) * e
side = 0.25 * np.roll(bel + son, 900) * e
music = stereo(mono, side)


# ---- SFX ----
def wash(a, b, amp, lo=80, hi=900):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), lo, hi)
    env = np.minimum(1, np.arange(n) / (0.6 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.6 * SR))
    g(x / np.abs(x).max() * env, a, amp)


def crackle(t, dur=0.6, a=0.04):
    n = int(dur * SR)
    x = M.band(M.rng.standard_normal(n), 2500, 9000) * (M.rng.random(n) < 0.02)
    g(x / max(1e-6, np.abs(x).max()) * np.exp(-np.arange(n) / SR * 3), t, a)


wash(0.0, K["s8"], 0.02)  # the sea around the camera
for s in ("s2", "s4", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.3, 0.06)
for s in ("s3", "s5", "s6"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
g(M.lib("whoosh-cinematic"), AT["s6:buritan"] - 0.2, 0.06)
for w in ("s1:habis", "s2:berkarat", "s3:larut", "s6:larut"):
    g(M.lib("impact-bass-1"), AT[w], 0.04)
crackle(AT["s2:menghantarkan"], 1.0, 0.05)
crackle(AT["s3:elektron"], 0.8, 0.04)
crackle(AT["s5:mengalir"], 1.4, 0.05)
for k in range(8):
    g(bubble(600 + 140 * (k % 3), 0.5), AT["s3:larut"] + 0.15 * k, 0.04)
# weld hiss + bolt clanks
n = int(0.9 * SR)
hiss = M.band(M.rng.standard_normal(n), 3000, 10000) * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 23))
g(hiss / np.abs(hiss).max() * np.minimum(1, (n - np.arange(n)) / (0.2 * SR)), AT["s4:dilas"], 0.04)
for j in range(2):
    g(M.lib("click"), AT["s4:dibaut"] + j * 0.25, 0.07)
g(M.thump(0.2), AT["s4:dilas"] - 0.05, 0.1)
g(M.lib("ping"), AT["s5:volt"], 0.05)
g(M.lib("sparkle"), AT["s5:baterai"], 0.05)
for k in range(10):  # zinc fizz
    g(bubble(900 + 90 * (k % 4), 0.4), AT["s6:larut"] + 0.12 * k, 0.03)
g(M.lib("glitch-1"), AT["s6:udara"], 0.03)
g(M.lib("pop"), AT["s7:sebelas"], 0.06)
g(M.lib("riser"), AT["s7:Davy"] - 1.4, 0.04)
g(M.lib("glitch-2"), AT["s7:dihentikan"], 0.035)
wash(K["s8"], AT["s8:naik"] + 1.2, 0.06, 150, 2500)  # the dock drains
g(M.lib("chime"), AT["s8:pengawal"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
