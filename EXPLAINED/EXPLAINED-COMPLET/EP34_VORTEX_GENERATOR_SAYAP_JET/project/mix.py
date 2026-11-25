"""EP34 sound: MANUSCRIPT — medieval codex of flight. A lute-like plucked melody in D dorian at 80 BPM over a
drone fifth and a warm reed pad. Scene transitions marked by quill-scratch rustles and ink-drip pops.
Wind bed grows through boundary-layer scenes; stall zone gets low rumble. Boeing history station gets
pizzicato counting. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(3401)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 80
D3 = 146.83
DOR = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19, 21, 22, 24]
hz = lambda st, base=D3: base * 2 ** (st / 12)


def lute(f, dur=1.2, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t * 4.5)
         + 0.45 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 8)
         + 0.2 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 11)
         + 0.1 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 14))
    return x * np.minimum(1, t / 0.003) * a


def reed(f, dur=0.8, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t + 0.3 * np.sin(t * 5)) * np.exp(-t * (2.5 + 1.5 * h)) / h ** 1.2 for h in range(1, 5))
    return x * np.minimum(1, t / 0.01) * a


def pizz(f, a=1.0):
    t = np.arange(int(0.3 * SR)) / SR
    return sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (14 + 6 * h)) / h for h in range(1, 5)) * a


lut, drn, pad = M.mono(), M.mono(), M.mono()
# drone: root + fifth, gentle pulse
prog = [0, 5, 3, 7]
i, t0 = 0, 0.05
while t0 < END + 1:
    root = prog[(i // 12) % 4]
    st = root + (0 if i % 2 == 0 else 7) - 12
    M.lay(drn, reed(hz(st), 0.7, 0.75 if i % 4 == 0 else 0.45), t0)
    t0 += beat / 2
    i += 1
# lute phrases at scene openings
phr = {
    "s1": [7, 10, 12, 14],
    "s2": [12, 10, 7, 5],
    "s3": [5, 7, 9, 10, 12],
    "s4": [14, 12, 10, 9, 7],
    "s5": [3, 5, 7, 10],
    "s6": [0, 3, 7, 12, 14],
    "s7": [7, 9, 10, 12],
    "s8": [12, 14, 17, 19, 21],
}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.1
    for j, st in enumerate(notes):
        M.lay(lut, lute(hz(st), 1.4, 0.8), tt + j * beat * 0.45)
# accent notes on key words
for w in ("s1:sirip", "s2:vortex", "s3:Lapisan", "s4:lepas", "s5:stall", "s6:pusaran", "s7:Boeing", "s8:AUDIRA"):
    M.lay(lut, lute(hz(19), 1.8, 0.55), AT[w])
# pizzicato counting in s7
for j in range(4):
    M.lay(lut, pizz(hz(j * 3), 0.9), AT["s7:empat"] + j * 0.2)
M.lay(lut, pizz(hz(10), 0.9), AT["s7:sepuluh"])
# AUDIRA chord
for st in (0, 3, 7, 12, 14):
    M.lay(lut, lute(hz(st), 2.8, 0.5), AT["s8:AUDIRA"] + st * 0.01)
# pad: warm dorian drone
pad += (0.35 * np.sin(2 * np.pi * 146.8 * T)
        + 0.25 * np.sin(2 * np.pi * 220 * T + np.sin(T * 0.3))
        + 0.18 * np.sin(2 * np.pi * 174.6 * T)) * 0.55
# wind bed grows through boundary layer scenes (s3-s5)
wind_env = M.env([(0, 0), (K["s3"], 0), (K["s3"] + 0.5, 0.4), (K["s4"], 0.6), (K["s5"], 0.8), (K["s5"] + 2, 0.3), (K["s6"], 0), (DUR, 0)])
wind = M.band(M.rng.standard_normal(N), 200, 2000) * wind_env * 0.15
# envelope
e = M.env([(0, 0.8), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.4), (DUR, 0)])
mono = (0.5 * lut + 0.4 * drn + 0.3 * pad + wind) * e
side = 0.2 * np.roll(lut + pad * 0.4, 700) * e
music = stereo(mono, side)


# ---- SFX ----
def quill(t, dur=0.3, a=0.04):
    x = M.band(M.rng.standard_normal(int(dur * SR)), 2000, 10000)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (0.02 * SR)) * np.exp(-np.arange(n) / SR * 10)
    g(x / np.abs(x).max() * env, t, a)


def inkdrop(t, a=0.04, f0=900):
    tt = np.arange(int(0.1 * SR)) / SR
    g(np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.5 * tt / 0.1)) / SR) * np.exp(-tt * 45), t, a)


def windbed(a_t, b_t, amp, lo=300, hi=2500):
    n = int((b_t - a_t) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), lo, hi)
    env = np.minimum(1, np.arange(n) / (0.4 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.4 * SR))
    g(x / np.abs(x).max() * env, a_t, amp)


# scene transition whooshes
quill(0.0, 0.4, 0.05)
for s in ("s2", "s4", "s6", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
for s in ("s3", "s5", "s7"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
# quill scratches on key words
for w in ("s1:berputar", "s1:menjaga", "s2:Siripnya", "s2:dipasang", "s3:kulit", "s3:batas",
          "s4:tekanan", "s4:berbalik", "s5:anjlok", "s5:Bilah",
          "s6:memutar", "s6:tornado", "s6:menempel", "s7:menurunkan", "s8:cari", "s8:Episode"):
    quill(AT[w] - 0.04, 0.25, 0.03)
# ink drops at section starts
for w in ("s2:vortex", "s3:Udara", "s4:belakang", "s5:aliran", "s6:Sirip"):
    inkdrop(AT[w], 0.035, 800 + 200 * hash(w) % 400)
# pops and clicks
g(M.lib("pop"), AT["s1:sirip"], 0.05)
g(M.lib("click-soft"), AT["s2:tepi"], 0.06)
g(M.lib("click"), AT["s3:lambat"], 0.05)
g(M.lib("impact-bass-1"), AT["s4:lepas"], 0.05)
g(M.thump(0.2), AT["s5:stall"], 0.1)
g(M.lib("riser"), AT["s6:miring"] - 0.5, 0.04)
g(M.lib("ping"), AT["s6:pusaran"], 0.04)
# wind bed for airflow scenes
windbed(K["s1"], K["s2"], 0.015, 400, 2000)
windbed(K["s3"], K["s5"] + 2, 0.02, 300, 2500)
# Boeing history clicks
for j in range(4):
    g(M.lib("click-soft"), AT["s7:empat"] + j * 0.2, 0.05)
g(M.lib("pop"), AT["s7:sepuluh"], 0.05)
g(M.lib("chime"), AT["s7:sepuluh"] + 0.3, 0.04)
# outro
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
