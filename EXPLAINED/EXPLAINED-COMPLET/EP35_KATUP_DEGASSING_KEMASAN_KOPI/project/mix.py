"""EP35 sound: FOODFORGE — warm coffee kitchen. A marimba/kalimba melody in Bb major at 88 BPM over a
warm Rhodes-like chord pulse and a breathy pad. Grinder whir and steam hiss on roasting scenes;
valve clicks on mechanism; factory conveyor clinks on history. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(3502)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 88
Bb3 = 233.08
MAJ = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24]
hz = lambda st, base=Bb3: base * 2 ** (st / 12)


def marimba(f, dur=1.0, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t * 5)
         + 0.5 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 12)
         + 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 7)
         + 0.15 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 10))
    return x * np.minimum(1, t / 0.002) * a


def rhodes(f, dur=0.8, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t + 0.2 * np.sin(t * 4.5)) * np.exp(-t * (3 + 2 * h)) / h ** 1.3 for h in range(1, 5))
    return x * np.minimum(1, t / 0.005) * a


def pizz(f, a=1.0):
    t = np.arange(int(0.28 * SR)) / SR
    return sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (15 + 6 * h)) / h for h in range(1, 5)) * a


mar, rho, pad = M.mono(), M.mono(), M.mono()
# Rhodes pulse
prog = [0, 5, 4, 7]
i, t0 = 0, 0.05
while t0 < END + 1:
    root = prog[(i // 12) % 4]
    st = root + (0 if i % 2 == 0 else 7) - 12
    M.lay(rho, rhodes(hz(st), 0.65, 0.8 if i % 4 == 0 else 0.5), t0)
    t0 += beat / 2
    i += 1
# Marimba phrases
phr = {
    "s1": [7, 9, 11, 12],
    "s2": [12, 11, 9, 7, 5],
    "s3": [4, 5, 7, 9],
    "s4": [9, 7, 5, 4, 2],
    "s5": [0, 4, 7, 11, 12],
    "s6": [5, 7, 9, 11, 12, 14],
    "s7": [12, 14, 16, 17],
    "s8": [12, 16, 19, 21, 24],
}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.1
    for j, st in enumerate(notes):
        M.lay(mar, marimba(hz(st), 1.2, 0.8), tt + j * beat * 0.4)
# Accent notes on key words
for w in ("s1:kopi", "s2:katup", "s3:menggembung", "s4:Oksigen", "s5:Goglio", "s6:Piringan", "s7:miliar", "s8:AUDIRA"):
    M.lay(mar, marimba(hz(19), 1.6, 0.55), AT[w])
# Valve click pattern in s6
for w in ("s6:mendorong", "s6:melengkung", "s6:lolos", "s6:kembali", "s6:rapat"):
    M.lay(mar, pizz(hz(12), 0.7), AT[w])
# AUDIRA chord
for st in (0, 4, 7, 11, 14):
    M.lay(mar, marimba(hz(st), 2.5, 0.5), AT["s8:AUDIRA"] + st * 0.01)
# Pad: warm breathy
pad += (0.35 * np.sin(2 * np.pi * 233.1 * T)
        + 0.25 * np.sin(2 * np.pi * 293.7 * T + np.sin(T * 0.35))
        + 0.18 * np.sin(2 * np.pi * 349.2 * T)) * 0.5
# Steam/warmth bed for roasting scenes
steam_env = M.env([(0, 0.3), (K["s2"], 0.5), (K["s4"], 0.3), (K["s5"], 0.1), (K["s6"], 0), (DUR, 0)])
steam = M.band(M.rng.standard_normal(N), 400, 3000) * steam_env * 0.1
# Envelope
e = M.env([(0, 0.8), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.4), (DUR, 0)])
mono = (0.5 * mar + 0.4 * rho + 0.3 * pad + steam) * e
side = 0.2 * np.roll(mar + pad * 0.4, 650) * e
music = stereo(mono, side)


# ---- SFX ----
def grind(t, dur=0.3, a=0.04):
    x = M.band(M.rng.standard_normal(int(dur * SR)), 1500, 8000)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (0.02 * SR)) * np.exp(-np.arange(n) / SR * 8)
    g(x / np.abs(x).max() * env, t, a)


def hiss(t, dur=0.15, a=0.03):
    x = M.band(M.rng.standard_normal(int(dur * SR)), 3000, 12000)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (0.01 * SR)) * np.exp(-np.arange(n) / SR * 15)
    g(x / np.abs(x).max() * env, t, a)


def steambed(a_t, b_t, amp):
    n = int((b_t - a_t) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), 400, 3500)
    env = np.minimum(1, np.arange(n) / (0.4 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.4 * SR))
    g(x / np.abs(x).max() * env, a_t, amp)


# Scene transition whooshes
grind(0.0, 0.4, 0.04)
for s in ("s2", "s4", "s6", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
for s in ("s3", "s5", "s7"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
# Coffee grind sounds on key words
for w in ("s1:Sekilo", "s2:disangrai", "s2:pori-pori", "s3:pelan-pelan", "s4:merusak", "s4:aroma",
          "s5:melubangi", "s6:silikon", "s6:rapat", "s7:Samo", "s8:bernapas"):
    grind(AT[w] - 0.04, 0.25, 0.03)
# Valve hiss on mechanism words
for w in ("s6:mendorong", "s6:melengkung", "s6:lolos"):
    hiss(AT[w], 0.2, 0.04)
# Pops and clicks
g(M.lib("pop"), AT["s1:tombol"], 0.06)
g(M.lib("click-soft"), AT["s2:karbon"], 0.05)
g(M.lib("impact-bass-1"), AT["s3:pecah"], 0.05)
g(M.thump(0.2), AT["s3:pecah"], 0.08)
g(M.lib("click"), AT["s4:apak"], 0.05)
g(M.lib("riser"), AT["s5:Goglio"] - 0.5, 0.04)
g(M.lib("ping"), AT["s5:mematenkannya"], 0.04)
g(M.lib("click-soft"), AT["s6:Piringan"], 0.06)
g(M.lib("pop"), AT["s6:kembali"], 0.05)
# Steam bed for roasting scenes
steambed(K["s1"], K["s3"], 0.015)
steambed(K["s3"], K["s5"], 0.012)
# Factory conveyor clicks in s7
for w in ("s7:Samo", "s7:Smrke", "s7:miliar", "s7:Goglio"):
    g(M.lib("click"), AT[w], 0.05)
g(M.lib("chime"), AT["s7:miliar"] + 0.3, 0.04)
# Outro
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
