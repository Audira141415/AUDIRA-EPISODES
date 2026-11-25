"""EP44 sound: a GLASSCRAFT lighthouse at night. A glass-bell celesta melody in E minor (like a music box
inside a lens), a soft sustained pad that brightens when the beam sweeps toward the camera, a foghorn drone
in the low register, and crystalline chime arpeggios when the exhibit lens morphs (s5). SFX: waves lapping,
glass chimes on key words, deep foghorn bursts on scene changes, sparkle when the beam flashes.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1823)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 84
E3 = 164.81
MIN = [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 20, 22, 24]
hz = lambda st, base=E3: base * 2 ** (st / 12)


def bell(f, dur=1.6, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.8) + 0.45 * np.sin(2 * np.pi * f * 2.003 * t) * np.exp(-t * 5.5) + 0.2 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 9) + 0.1 * np.sin(2 * np.pi * f * 5.99 * t) * np.exp(-t * 16)
    return x * np.minimum(1, t / 0.001) * a


def foghorn(f, dur=2.5, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) + 0.3 * np.sin(2 * np.pi * f * 0.5 * t + np.sin(t * 0.8) * 0.6))
    return x * np.minimum(1, t / 0.15) * np.minimum(1, (dur - t) / 0.3) * np.exp(-t * 0.6) * a


def crystal(f, a=1.0):
    t = np.arange(int(0.5 * SR)) / SR
    return sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (8 + 7 * h)) / h ** 0.8 for h in range(1, 7)) * a


cel, pno, pad, grv = M.mono(), M.mono(), M.mono(), M.mono()
# soft sustained pad: low E drone + fifth, with brightness envelope following "beam near camera" feel
bright = M.env([(0, 0.3), (K["s1"], 0.5), (K["s3"], 0.4), (K["s5"], 0.7), (K["s6"], 0.8), (K["s7"], 1), (K["s8"], 0.6), (DUR, 0.3)])
pad += (0.4 * np.sin(2 * np.pi * 82.4 * T) + 0.3 * np.sin(2 * np.pi * 123.5 * T + np.sin(T * 0.35)) + 0.2 * np.sin(2 * np.pi * 164.8 * T)) * 0.55
pad += bright * 0.25 * (np.sin(2 * np.pi * 329.6 * T + np.sin(T * 0.6)) + 0.6 * np.sin(2 * np.pi * 493.9 * T))
# bell pulse: root/third alternating gently
prog = [0, -2, 3, -4]
i, t0 = 0, 0.08
while t0 < END + 1.0:
    root = prog[(i // 12) % 4]
    st = root + (0 if i % 2 == 0 else 3) - 12
    M.lay(pno, bell(hz(st), 0.9, 0.6 if i % 4 == 0 else 0.35), t0)
    t0 += beat / 2
    i += 1
# bell phrases at scene openings
phr = {"s1": [7, 10, 12, 15], "s2": [12, 10, 7, 5], "s3": [3, 5, 7, 10, 12], "s4": [12, 14, 15, 17],
       "s5": [17, 15, 14, 12, 10], "s6": [0, 3, 7, 10], "s7": [7, 10, 12, 15], "s8": [12, 15, 17, 19, 24]}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.12
    for j, st in enumerate(notes):
        M.lay(cel, bell(hz(st), 1.5, 0.7), tt + j * beat * 0.5)
for w in ("s1:lampunya", "s2:Augustin", "s4:permukaan", "s5:bertingkat", "s6:Prisma", "s7:tiga", "s8:lampu"):
    M.lay(cel, bell(hz(24), 1.8, 0.4), AT[w])
# crystal arpeggios when the lens morphs (s5)
for j in range(5):
    M.lay(cel, crystal(hz(12 + j * 3), 0.6), AT["s5:dipotong"] + j * 0.12)
for j in range(4):
    M.lay(cel, crystal(hz(15 + j * 2), 0.5), AT["s5:ringan"] + j * 0.15)
# foghorn bursts at key dramatic moments
for tt in (K["s3"] + 0.3, AT["s5:dipotong"] - 0.5, K["s6"] + 0.5, K["s7"] + 0.8):
    M.lay(grv, foghorn(41.2, 2.0, 0.7), tt)
# pizzicato count for 30 km (s7)
for j in range(3):
    M.lay(cel, crystal(hz(j * 5), 0.5), AT["s7:kelas"] + j * 0.2)
for st in (0, 3, 7, 12, 15):
    M.lay(cel, bell(hz(st), 2.5, 0.5), AT["s8:AUDIRA"] + st * 0.01)
e = M.env([(0, 0.8), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.5 * cel + 0.4 * pno + 0.3 * pad + 0.2 * grv) * e
side = 0.2 * np.roll(cel + pad * bright * 0.4, 900) * e
music = stereo(mono, side)


# ---- SFX ----
def shimmer(t, dur=0.4, a=0.03):
    x = M.band(M.burst(dur, 50, 3), 3000, 10000)
    g(x / max(1e-6, np.abs(x).max()) * M.env([(0, 0.8), (dur, 0)])[: len(x)], t, a)


def wave(t, dur=0.6, a=0.015):
    x = M.band(M.rng.standard_normal(int(dur * SR)), 200, 2500)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (0.08 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.15 * SR))
    g(x / max(1e-6, np.abs(x).max()) * env, t, a)


# ambient waves throughout
t0 = 0.5
while t0 < DUR - 1:
    wave(t0, 0.8 + 0.4 * (t0 % 3), 0.012)
    t0 += 2.2 + 0.5 * (t0 % 2)
for s in ("s2", "s4", "s6", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.06)
for s in ("s3", "s5", "s7"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
for w in ("s1:lampunya", "s1:berputar", "s2:Augustin", "s2:Cordouan",
          "s3:berat", "s3:terserap", "s4:permukaan", "s4:dibuang",
          "s5:dipotong", "s5:bertingkat", "s5:ringan",
          "s6:ditangkap", "s6:cakrawala", "s6:tajam",
          "s7:menyapu", "s7:kelas", "s7:setengah",
          "s8:lampu", "s8:berikutnya"):
    shimmer(AT[w] - 0.04, 0.3, 0.025)
g(M.lib("chime"), AT["s5:dipotong"], 0.06)
g(M.lib("chime"), AT["s5:bertingkat"], 0.05)
g(M.lib("ping"), AT["s6:Prisma"], 0.05)
g(M.lib("pop"), AT["s7:tiga"], 0.05)
g(M.lib("sparkle"), AT["s7:kilometer"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.1)
M.finish(music)
