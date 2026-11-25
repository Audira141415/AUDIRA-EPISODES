"""EP27 sound: a woodblock sea. Plucked koto phrases in a miyako-bushi scale (D Eb G A Bb) over a slow taiko pulse and a
breathing ocean bed whose swell follows the ship's speed. s3 adds a rising bow-wave rush; in s5 two tones in antiphase
cancel to silence on "meniadakan" (the sound does what the waves do); s7 gets a brassy liner horn and a saw rasp on the cut.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1935)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 72
D4 = 293.66
SCALE = [0, 1, 5, 7, 8, 12, 13, 17, 19, 20, 24]
hz = lambda st: D4 * 2 ** (st / 12)


def koto(f, dur=1.6, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + 0.0015 * h)) * np.exp(-t * (2.6 + 1.8 * h)) / h ** 1.1 for h in range(1, 7))
    bend = np.sin(2 * np.pi * f * 1.003 * t) * np.exp(-t * 3) * 0.2
    return (x + bend) * np.minimum(1, t / 0.003) * a


def taiko(a=1.0):
    t = np.arange(int(0.6 * SR)) / SR
    body = np.sin(2 * np.pi * np.cumsum(70 + 50 * np.exp(-t * 18)) / SR) * np.exp(-t * 6)
    skin = M.band(M.rng.standard_normal(len(t)), 200, 2000) * np.exp(-t * 30) * 0.15
    return (body + skin) * a


kt, drm, pad = M.mono(), M.mono(), M.mono()
# taiko pulse: one strike every two beats, accent on scene starts
t0 = 0.0
i = 0
while t0 < END + 1:
    M.lay(drm, taiko(0.7 if i % 4 == 0 else 0.35), t0)
    t0 += beat * 2
    i += 1
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    M.lay(drm, taiko(1.0), K[s] - 0.02)
# koto phrases at scene openings
phr = {"s1": [5, 7, 8, 12], "s2": [12, 8, 7, 5], "s3": [0, 1, 5, 7, 8], "s4": [13, 12, 8], "s5": [7, 8, 12, 13],
       "s6": [12, 13, 17, 19], "s7": [5, 7, 5, 1, 0], "s8": [12, 13, 17, 19, 24]}
for s, notes in phr.items():
    tt = 0.06 if s == "s1" else K[s] + 0.1
    for j, st in enumerate(notes):
        M.lay(kt, koto(hz(st), 1.8, 0.8), tt + j * beat * 0.5)
for w in ("s1:ombak", "s2:bulbous", "s4:lembah", "s6:sepuluh", "s7:Normandie", "s8:kecepatannya"):
    M.lay(kt, koto(hz(24), 2.2, 0.5), AT[w])
# drone pad (D + A), opens up once the waves cancel
calm = M.env([(0, 0.3), (K["s5"], 0.3), (AT["s5:meniadakan"], 1), (K["s7"], 0.6), (K["s8"], 1), (DUR, 1)])
pad += 0.35 * np.sin(2 * np.pi * 146.8 * T) + 0.25 * np.sin(2 * np.pi * 220 * T + 0.6 * np.sin(T * 0.3))
pad += calm * 0.2 * np.sin(2 * np.pi * 440 * T + np.sin(T * 0.5))
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.5 * kt + 0.45 * drm + 0.3 * pad) * e
side = 0.2 * np.roll(kt + pad * 0.4, 900) * e
music = stereo(mono, side)


# ---- SFX ----
def ocean(a, b, amp, lo=150, hi=1600, swell=0.17):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), lo, hi)
    tt = np.arange(n) / SR
    env = (0.6 + 0.4 * np.sin(2 * np.pi * swell * tt + a)) * np.minimum(1, tt / 0.6) * np.minimum(1, (n - np.arange(n)) / (0.6 * SR))
    g(x / np.abs(x).max() * env, a, amp)


ocean(0.0, END + 2, 0.035)
for s in ("s2", "s4", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.06)
for s in ("s3", "s5", "s6"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
# bow wave rush grows with speed in s3
ocean(AT["s3:atas"] - 0.3, K["s4"], 0.05, 400, 4000, 0.5)
g(M.lib("riser"), AT["s3:Makin"] - 0.2, 0.04)
g(M.lib("pop"), AT["s2:haluan"], 0.05)
g(M.lib("click-soft"), AT["s2:permukaan"], 0.06)
g(M.lib("ping"), AT["s4:lembah"], 0.04)
# antiphase tones: in step until "pas", then the second flips phase and they cancel by "meniadakan"
a0, a1 = AT["s5:pas"] - 0.5, AT["s5:meniadakan"] + 0.4
n = int((a1 - a0) * SR)
tt = np.arange(n) / SR
ph = np.pi * np.clip((tt - (AT["s5:pas"] - a0)) / max(0.3, AT["s5:meniadakan"] - AT["s5:pas"]), 0, 1)
tone = np.sin(2 * np.pi * 330 * tt) + np.sin(2 * np.pi * 330 * tt + ph)
tone *= np.minimum(1, tt / 0.2) * np.minimum(1, (n - np.arange(n)) / (0.2 * SR))
g(tone * 0.5, a0, 0.05)
g(M.lib("chime"), AT["s5:meniadakan"] + 0.1, 0.04)
for w in ("s6:sepuluh", "s6:persen"):
    g(M.lib("click"), AT[w], 0.05)
g(M.lib("pop"), AT["s6:rentang"], 0.05)
# liner horn in s7
hn = int(1.4 * SR)
th = np.arange(hn) / SR
horn = sum(np.sin(2 * np.pi * 110 * k * th) / k for k in range(1, 6)) * np.minimum(1, th / 0.15) * np.minimum(1, (hn - np.arange(hn)) / (0.3 * SR))
g(horn * 0.4, AT["s7:Normandie"], 0.05)
g(M.lib("click-soft"), AT["s7:knot"], 0.06)
g(M.lib("click-soft"), AT["s7:persen"], 0.06)
saw = M.band(M.rng.standard_normal(int(0.7 * SR)), 1500, 6000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * np.arange(int(0.7 * SR)) / SR)))
g(saw / np.abs(saw).max(), AT["s7:dipotong"], 0.03)
g(M.lib("impact-bass-1"), AT["s7:diganti"], 0.05)
g(M.thump(0.25), AT["s8:AUDIRA"], 0.1)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
