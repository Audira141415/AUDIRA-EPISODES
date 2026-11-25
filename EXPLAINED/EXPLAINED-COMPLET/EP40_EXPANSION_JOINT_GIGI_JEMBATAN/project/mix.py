"""EP40 sound: a BUILDFORGE construction site. Steel percussion bed (anvil hits, girder clangs) in D minor at 110 BPM,
a low rumbling foundation drone, metallic pluck melody at scene transitions and key words. The thermometer
(s3-s4) gets a warm tonal rise; the locked bridge (s5) adds stress tones and crack impacts; the finger joint
(s6) introduces a rhythmic clicking like interlocking gears. SFX: whooshes on cuts, metallic clangs on key
words, impact on "dikunci"/"retak", car-on-joint bumps. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4040)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 110
D3 = 146.83
MIN = [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19]
hz = lambda st, base=D3: base * 2 ** (st / 12)


def anvil(f, dur=0.9, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 4.5) + 0.4 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 12) + 0.2 * np.sin(2 * np.pi * f * 5.02 * t) * np.exp(-t * 18)
    return x * np.minimum(1, t / 0.001) * a


def steelpulse(f, dur=0.7, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (5 + 3 * h)) / h ** 1.2 for h in range(1, 5))
    return x * np.minimum(1, t / 0.003) * a


def girder(f, a=1.0):
    t = np.arange(int(0.3 * SR)) / SR
    return sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (15 + 6 * h)) / h for h in range(1, 6)) * a


mel, pno, pad, grv = M.mono(), M.mono(), M.mono(), M.mono()
# steel pulse: root/fifth alternating in 8ths
prog = [0, -2, 3, -4]  # D, C, F, Bb
i, t0 = 0, 0.05
while t0 < END + 1.0:
    root = prog[(i // 16) % 4]
    st = root + (0 if i % 2 == 0 else 7) - 12
    M.lay(pno, steelpulse(hz(st), 0.65, 0.85 if i % 4 == 0 else 0.5), t0)
    t0 += beat / 2
    i += 1
# anvil melody at scene openings and key words
phr = {"s1": [7, 10, 12, 14], "s2": [12, 10, 7, 5], "s3": [5, 7, 10, 12, 14], "s4": [14, 15, 17, 19],
       "s5": [19, 17, 15, 14, 12], "s6": [0, 3, 7, 5], "s7": [7, 10, 12, 14], "s8": [12, 14, 17, 19, 24]}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.12
    for j, st in enumerate(notes):
        M.lay(mel, anvil(hz(st), 1.2, 0.75), tt + j * beat * 0.5)
for w in ("s1:sengaja", "s3:panas", "s4:derajat", "s5:dikunci", "s6:sisir", "s7:enam", "s8:bernapas"):
    M.lay(mel, anvil(hz(24), 1.5, 0.45), AT[w])
# low rumbling drone
drone_env = M.env([(0, 0.5), (K["s3"], 0.6), (K["s5"], 0.9), (K["s5e"], 0.5), (K["s6"], 0.4), (K["s8"], 0.6), (DUR, 0.3)])
pad += (0.5 * np.sin(2 * np.pi * 73.4 * T) + 0.3 * np.sin(2 * np.pi * 110 * T + np.sin(T * 0.3)) + 0.15 * np.sin(2 * np.pi * 55 * T)) * drone_env
# stress tones in s5 (locked bridge)
stress = M.env([(0, 0), (K["s5"], 0), (AT["s5:dikunci"], 0.8), (AT["s5:melengkung"], 1), (AT["s5:retak"], 0.6), (K["s5e"], 0), (DUR, 0)])
pad += stress * 0.35 * (np.sin(2 * np.pi * 185 * T) + 0.5 * np.sin(2 * np.pi * 233 * T))
# gear clicking in s6 (finger joint)
t0 = AT["s6:sisir"] - 0.3
while t0 < K["s6e"]:
    M.lay(grv, girder(hz(12), 0.6), t0, 0.4)
    t0 += beat * 0.5
# pizzicato count in s7
for j in range(3):
    M.lay(mel, girder(hz(j * 3)), AT["s7:tiga"] + j * 0.2, 0.8)
for st in (0, 5, 7, 12, 14):
    M.lay(mel, anvil(hz(st), 2.2, 0.45), AT["s8:AUDIRA"] + st * 0.01)
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.5 * mel + 0.45 * pno + 0.3 * pad + 0.3 * grv) * e
side = 0.2 * np.roll(mel + pad * drone_env * 0.4, 800) * e
music = stereo(mono, side)


# ---- SFX ----
def clang(t, dur=0.25, a=0.04):
    x = M.band(M.burst(dur, 80, 2), 1200, 5000)
    g(x / max(1e-6, np.abs(x).max()) * M.env([(0, 1), (dur, 0)])[: len(x)], t, a)


for s in ("s2", "s4", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
for s in ("s3", "s5", "s6"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
for w in ("s1:sengaja", "s1:retak", "s2:melintas", "s3:panas", "s3:dingin", "s3:menyusut",
          "s4:derajat", "s4:sejuta", "s5:muai", "s5:melengkung",
          "s6:terperosok", "s6:sisir", "s6:menjauh", "s6:rata",
          "s7:enam", "s7:setengah", "s8:bernapas", "s8:Episode"):
    clang(AT[w] - 0.04, 0.2, 0.03)
g(M.lib("impact-bass-1"), AT["s5:dikunci"], 0.08)
g(M.thump(0.3), AT["s5:dikunci"], 0.14)
g(M.lib("error"), AT["s5:retak"], 0.06)
g(M.thump(0.2), AT["s5:retak"], 0.1)
g(M.lib("pop"), AT["s6:sisir"], 0.06)
g(M.lib("click-soft"), AT["s4:sejuta"], 0.06)
g(M.lib("click"), AT["s7:tiga"], 0.05)
g(M.lib("ping"), AT["s7:setengah"], 0.04)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
