"""EP13 sound: a candlelit scriptorium. A lute-like plucked melody in D minor (medieval) over a warm
drone pad and gentle harp arpeggios. Quill scratches sync with writing scenes, wax-seal thump on
the patent, ink drips in s5, a pressurised hiss for the space pen. SFX: paper rustles on cuts,
candle crackle bed, quill scratch bursts on writing beats.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1388)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 80
D4 = 293.66
MINOR = [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19]
hz = lambda st, base=D4: base * 2 ** (st / 12)


def lute(f, dur=1.2, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t * 4.5)
         + 0.45 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 8)
         + 0.2 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 11)
         + 0.08 * np.sin(2 * np.pi * f * 5 * t) * np.exp(-t * 16))
    return x * np.minimum(1, t / 0.003) * a


def harp(f, dur=1.6, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (2.5 + 1.8 * h)) / h ** 1.2 for h in range(1, 5))
    return x * np.minimum(1, t / 0.004) * a


cel, hrp, pad, grv = M.mono(), M.mono(), M.mono(), M.mono()

# harp arpeggios: root-third-fifth-octave rolling every bar
prog = [0, -2, 3, -4]
i, t0 = 0, 0.08
while t0 < END + 1.0:
    root = prog[(i // 8) % 4]
    for j, iv in enumerate([0, 3, 7, 12]):
        st = root + iv - 12
        M.lay(hrp, harp(hz(st), 1.4, 0.55 if j == 0 else 0.4), t0 + j * beat * 0.25)
    t0 += beat * 2
    i += 1

# lute melody phrases at scene openings
phr = {
    "s1": [7, 10, 12, 14],
    "s2": [12, 10, 7, 5],
    "s3": [5, 7, 10, 12, 14],
    "s4": [14, 15, 17, 19],
    "s5": [19, 17, 15, 14, 12],
    "s6": [0, 3, 7, 5],
    "s7": [7, 8, 10, 12],
    "s8": [12, 14, 15, 17, 19],
}
for s, notes in phr.items():
    tt = 0.1 if s == "s1" else K[s] + 0.15
    for j, st in enumerate(notes):
        M.lay(cel, lute(hz(st), 1.3, 0.75), tt + j * beat * 0.45)

# accent lute hits on key words
for w in ("s1:bola", "s3:koran", "s4:terjepit", "s5:gravitasi", "s6:Alur", "s7:gas", "s8:AUDIRA"):
    M.lay(cel, lute(hz(19), 1.6, 0.45), AT[w])

# warm drone pad (low D + A, candle-like warmth)
pad += (0.45 * np.sin(2 * np.pi * 146.8 * T)
        + 0.3 * np.sin(2 * np.pi * 220 * T + np.sin(T * 0.35))
        + 0.18 * np.sin(2 * np.pi * 110 * T)) * 0.55

# scene s5-s6: slightly brighter pad (ink mechanism detail)
mech = M.env([(0, 0), (K["s4"], 0), (K["s5"], 0.6), (K["s6"], 0.8), (K["s7"], 0.3), (END, 0.2), (DUR, 0)])
pad += mech * (0.2 * np.sin(2 * np.pi * 440 * T + 0.4 * np.sin(T * 0.6))
               + 0.12 * np.sin(2 * np.pi * 330 * T)) * 0.4

# outro chord spread
for st in (0, 3, 7, 12, 14):
    M.lay(cel, lute(hz(st), 2.5, 0.5), AT["s8:AUDIRA"] + st * 0.01)

e = M.env([(0, 0.8), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.45), (DUR, 0)])
mono = (0.48 * cel + 0.4 * hrp + 0.32 * pad + 0.25 * grv) * e
side = 0.2 * np.roll(cel + pad * mech * 0.4, 700) * e
music = stereo(mono, side)


# ---- SFX ----
def rustle(t, dur=0.3, a=0.04):
    x = M.band(M.rng.standard_normal(int(dur * SR)), 1800, 9000)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (0.025 * SR)) * np.exp(-np.arange(n) / SR * 10)
    g(x / np.abs(x).max() * env, t, a)


def scratch(t, a=0.035):
    dur = 0.18
    tt = np.arange(int(dur * SR)) / SR
    x = M.band(M.rng.standard_normal(len(tt)), 2000, 8000)
    env = np.minimum(1, tt / 0.005) * np.exp(-tt * 18)
    g(x / np.abs(x).max() * env, t, a)


def drip(t, a=0.04, f0=1100):
    tt = np.arange(int(0.1 * SR)) / SR
    g(np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.5 * tt / 0.1)) / SR) * np.exp(-tt * 45), t, a)


def hiss(a_t, b_t, amp=0.025):
    n = int((b_t - a_t) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), 3000, 12000)
    env = np.minimum(1, np.arange(n) / (0.3 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.3 * SR))
    g(x / np.abs(x).max() * env, a_t, amp)


# scene-transition whooshes
for s in ("s2", "s4", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.065)
for s in ("s3", "s5", "s6"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.045)

# quill scratches during writing scenes (s1, s6, s8)
for w in ("s1:bola", "s1:berputar", "s6:menggeser", "s6:basah", "s6:Alur", "s8:menggelinding"):
    scratch(AT[w] - 0.04, 0.04)

# paper rustles on key words
for w in ("s2:kayu", "s2:Goresannya", "s3:koran", "s3:kental", "s4:ujungnya", "s4:terjepit",
          "s5:tabung", "s5:turun", "s5:membasahi", "s6:menggeser", "s7:terbalik", "s7:menjauh",
          "s7:angkasa", "s7:disegel", "s8:AUDIRA"):
    rustle(AT[w] - 0.04, 0.25, 0.03)

# wax seal thump on patent
g(M.lib("impact-bass-1"), AT["s4:mematenkan"], 0.05)
g(M.thump(0.22), AT["s4:mematenkan"], 0.1)

# ink drips through s5
tb = AT["s5:turun"]
j = 0
while tb < K["s6"] - 0.3:
    drip(tb, 0.03 + 0.015 * (j % 3 == 0), 1000 + 250 * (j % 4))
    tb += 0.6 + 0.25 * ((j * 5) % 3)
    j += 1

# space pen gas hiss in s7
hiss(AT["s7:gas"] - 0.2, AT["s7:disegel"] + 0.5, 0.03)
g(M.lib("pop"), AT["s7:gas"], 0.05)
g(M.lib("click-soft"), AT["s7:disegel"], 0.06)

# water bubbles hint
g(M.lib("ping"), AT["s7:air"], 0.035)

# outro
g(M.lib("sparkle"), OUT - 0.3, 0.055)
g(M.thump(), OUT, 0.1)

M.finish(music)
