"""EP29 sound: a stone chamber at sunrise. A wordless choir-like pad (stacked detuned vowels on a D-minor-ish
modal drone), a slow low bell every bar, glass dings as each window pane lights, soft bells at the beats, a paper
rustle for the timelines, clicks for the month panes, a crowd-like cheer bed and flutter of bunting for the 2007
millennium. No lyrics, no melody borrowed from any song. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2019)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# --- score ---
def choir(notes, d):
    tt = np.arange(int(d * SR)) / SR
    x = np.zeros_like(tt)
    for m in notes:
        f = hz(m)
        for det in (-0.004, 0, 0.005):
            ph = rng.random() * 6.28
            for h, w in ((1, 1), (2, 0.5), (3, 0.32), (4, 0.12), (5, 0.08)):
                x += w * np.sin(2 * np.pi * f * (1 + det) * h * tt + ph * h) * (1 + 0.04 * np.sin(2 * np.pi * 5.1 * tt + ph))
    return x

def bell(t, f=523, a=0.04, d=3.0):
    tt = np.arange(int(d * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * dk) * w for r, dk, w in ((1, 1.2, 1), (2.0, 1.8, 0.5), (2.76, 2.6, 0.35), (5.4, 4.5, 0.2)))
    g(x * np.minimum(1, tt / 0.003), t, a)

def ding(t, f=1760, a=0.025):
    g(M.tone((f, f * 2.01, f * 3.97), 1.1, 5.5), t, a)

pad = M.mono()
chords = [[50, 57, 62, 65], [48, 55, 60, 64], [46, 53, 58, 62], [45, 52, 57, 61]]
bar = 6.0
for k, t0 in enumerate(np.arange(0, DUR, bar)):
    x = choir(chords[k % 4], bar + 1.5)
    tt = np.arange(len(x)) / SR
    x *= np.minimum(1, tt / 1.2) * np.minimum(1, (len(x) / SR - tt) / 1.5)
    M.lay(pad, x, t0, 1.0)
pad = M.band(pad, 80, 3500)
pad /= max(1e-6, np.abs(pad).max())
low = M.mono()
for t0 in np.arange(0.2, DUR - 1, bar):
    tt = np.arange(int(4 * SR)) / SR
    M.lay(low, np.sin(2 * np.pi * hz(38) * tt) * np.exp(-tt * 0.9) + 0.3 * np.sin(2 * np.pi * hz(50) * 2.76 * tt) * np.exp(-tt * 2), t0, 1)
low /= max(1e-6, np.abs(low).max())
s7 = K["s7"]
e_pad = M.env([(0, 0.0), (1.2, 0.8), (s7, 0.8), (s7 + 1, 1.0), (END, 0.9), (DUR - 0.4, 0), (DUR, 0)])
mono = 0.55 * pad * e_pad + 0.3 * low * e_pad
music = stereo(mono, 0.05 * pad * e_pad)

# --- foley ---
def rustle(t, d=1.0, a=0.04):
    x = M.band(rng.standard_normal(int(d * SR)), 900, 7000)
    tt = np.arange(len(x)) / SR
    x *= np.minimum(1, tt / 0.1) * np.minimum(1, (d - tt) / 0.3) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 6 * tt)))
    g(x / np.abs(x).max(), t, a)

def thunk(t, a=0.1):
    g(M.band(M.burst(0.12, 40, 3), 90, 900), t, a); g(M.tone((140, 210), 0.15, 25), t, a * 0.6)

# hook: 13 panes light, low bell on 2019
bell(0.05, hz(62), 0.06, 4)
tA, tB = AT["s1:satu#2"], AT["s1:bulan"]
SCALE = [74, 76, 77, 79, 81, 83, 84, 86, 88, 89, 91, 93, 96]
for i in range(13):
    ding(tA + i * (tB - tA) / 12, hz(SCALE[i]), 0.02)
bell(AT["s1:2019"] - 0.03, hz(50), 0.09, 5); g(M.thump(0.3), AT["s1:2019"], 0.06)
# map
g(M.lib("whoosh"), K["s2"] - 0.5, 0.035)
bell(AT["s2:Etiopia"], hz(69), 0.035); ding(AT["s2:Ortodoks"], hz(86), 0.02)
# 12 x 30, Pagumen petals, evangelists
g(M.lib("whoosh"), K["s3"] - 0.5, 0.03)
d0, d1 = AT["s3:dua"], AT["s3:hari"]
for i in range(12):
    ding(d0 + i * (d1 - d0) / 12, hz(SCALE[i]), 0.016)
for k in range(5):
    ding(AT["s3:lima"] + k * 0.1, hz(84 + k * 2), 0.018)
bell(AT["s3:enam"], hz(74), 0.05); g(M.lib("sparkle"), AT["s3:enam"], 0.02)
for i, k in enumerate(("s3:Yohanes", "s3:Matius", "s3:Markus", "s3:Lukas")):
    bell(AT[k] - 0.03, hz([67, 69, 72, 74][i]), 0.03, 2.2)
g(M.lib("chime"), AT["s3:kabisatnya"], 0.035)
# Enkutatash: panel 1 flares, jewels rise
bell(AT["s4:sebelas"], hz(62), 0.06, 4)
for k in range(7):
    ding(AT["s4:Enkutatash"] - 0.2 + k * 0.12, hz(88 + (k * 3) % 8), 0.016)
g(M.lib("sparkle"), AT["s4:permata"], 0.03)
# timelines
g(M.lib("whoosh-cinematic"), K["s5"] - 0.6, 0.03)
for key in ("s5:Sekitar", "s5:Eropa"):
    for k in range(14):
        g(M.lib("click-soft"), AT[key] + k * 0.1, 0.012)
for key in ("s5:Annianus", "s5:Dionysius"):
    bell(AT[key], hz(71), 0.035, 2.5)
rustle(AT["s5:delapan"] - 0.1, 0.8, 0.03); thunk(AT["s5:delapan"] + 0.15, 0.1)
# 8 -> 7
g(M.lib("whoosh"), K["s6"] - 0.5, 0.03)
j0, j1 = AT["s6:Januari"], AT["s6:September"] + 0.1
for k in range(9):
    g(M.lib("click"), j0 + k * (j1 - j0) / 8, 0.016)
thunk(AT["s6:delapan"], 0.12)
s0, s1 = AT["s6:Setelah"], AT["s6:September#2"] + 0.2
for k in range(4):
    g(M.lib("click"), s0 + k * (s1 - s0) / 3, 0.016)
bell(AT["s6:tujuh"], hz(69), 0.06, 3); g(M.thump(0.3), AT["s6:tujuh"], 0.07)
# millennium: 2000 struck, 2007 rings, bunting, distant cheer bed
g(M.lib("whoosh-cinematic"), K["s7"] - 0.6, 0.03)
thunk(AT["s7:tapi"], 0.08)
bell(AT["s7:2007"], hz(62), 0.08, 5); g(M.lib("chime"), AT["s7:2007"] + 0.1, 0.04)
for k in range(3):
    rustle(AT["s7:bendera"] - 0.3 + k * 0.16, 0.7, 0.03)
cheer = M.band(rng.standard_normal(int(6 * SR)), 300, 3000)
tt = np.arange(len(cheer)) / SR
cheer *= np.minimum(1, tt / 1.0) * np.minimum(1, (6 - tt) / 2.0) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * tt))
g(cheer / np.abs(cheer).max(), AT["s7:bendera"] - 0.5, 0.02)
for key in ("s7:hijau", "s7:kuning", "s7:merah"):
    ding(AT[key], hz(84), 0.015)
# payoff
g(M.lib("whoosh-cinematic"), K["s8"] - 0.4, 0.035)
bell(AT["s8:planet"], hz(50), 0.07, 5)
g(M.lib("chime"), OUT + 0.3, 0.06)
# stone room air
air = M.band(rng.standard_normal(N), 100, 1200)
air /= np.abs(air).max()
M.fx += np.stack([air, np.roll(air, 1100)], 1) * 0.004
M.finish(music)
print("duration", DUR)
