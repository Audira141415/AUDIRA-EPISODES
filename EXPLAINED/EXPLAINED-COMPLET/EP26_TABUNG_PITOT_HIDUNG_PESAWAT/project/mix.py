"""EP26 sound: bouncy INFLATABLE pitot tube. Bright F major with airy wind whooshes, playful FM bells,
a jet-engine hum undertone, and wasp buzz (s7). SFX: pop, whoosh, buzz.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(26)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 120
F3 = 174.61
hz = lambda st, base=F3: base * 2 ** (st / 12)


def bell(f, dur=2.0, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * t + 2 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t * 3.0)
            * np.minimum(1, t / 0.002) * a)


def wind(dur=2.0, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    n = M.rng.standard_normal(len(t))
    env = np.sin(np.pi * t / dur) ** 0.7
    return M.band(n, 300, 4000) * env * a


def buzz(dur=1.0, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * 220 * t) + 0.5 * np.sin(2 * np.pi * 440 * t) + 0.3 * np.sin(2 * np.pi * 660 * t)) * np.exp(-t * 2) * a


bel, pad, perc, atm = M.mono(), M.mono(), M.mono(), M.mono()

# airy pad: F + A + C
pad += 0.3 * np.sin(2 * np.pi * F3 * T) + 0.18 * np.sin(2 * np.pi * hz(4) * T) + 0.12 * np.sin(2 * np.pi * hz(7) * T)
air = M.env([(0, 0.6), (K["s4"], 0.9), (K["s7"], 0.5), (K["s8"], 1.0), (DUR, 1.0)])
pad += air * 0.08 * np.sin(2 * np.pi * hz(16) * T + 2 * np.sin(T * 0.5))

# jet engine undertone
jet_env = M.env([(0, 0.2), (K["s3"], 0.4), (K["s6"], 0.5), (K["s7"], 0.3), (K["s8"], 0.4), (DUR, 0.3)])
atm += jet_env * 0.06 * np.sin(2 * np.pi * 80 * T + 0.5 * np.sin(T * 0.2))

# FM bells on scene openings
for s, st in [("s1", 0), ("s2", 5), ("s3", 7), ("s4", 4), ("s5", 9), ("s6", 7), ("s7", 0), ("s8", 12)]:
    tt = 0.1 if s == "s1" else K[s] + 0.1
    M.lay(bel, bell(hz(st + 12), 2.0, 0.4), tt)

# wind texture on key moments
M.lay(atm, wind(2.0, 0.15), AT.get("s1:angin", K["s1"] + 2))
M.lay(atm, wind(2.5, 0.2), AT.get("s4:terbang", K["s4"] + 2))
M.lay(atm, wind(1.5, 0.12), AT.get("s6:kecepatan", K["s6"] + 2))

# key word bells
for w in ("s2:pitot", "s4:tekanan", "s5:statis", "s6:kecepatan", "s7:tawon", "s8:ditutup"):
    if w in AT:
        M.lay(bel, bell(hz(24), 2.0, 0.35), AT[w])

# wasp buzz (s7)
if "s7:tawon" in AT:
    M.lay(atm, buzz(2.0, 0.2), AT["s7:tawon"])
if "s7:tersumbat" in AT:
    M.lay(atm, buzz(1.5, 0.15), AT["s7:tersumbat"])

# outro chord
for st in (0, 4, 7, 12, 16):
    M.lay(bel, bell(hz(st + 12), 3.5, 0.3), AT["s8:AUDIRA"] + st * 0.012)

e = M.env([(0, 0.7), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.4), (DUR, 0)])
mono = (0.4 * bel + 0.32 * pad + 0.2 * perc + 0.22 * atm) * e
side = 0.15 * np.roll(bel, 600) * e
music = stereo(mono, side)


# ---- SFX ----
for s in ("s2", "s4", "s6"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.3, 0.05)
for s in ("s3", "s5", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.04)
g(M.lib("pop"), AT.get("s1:tabung", 1.0), 0.05)
g(M.lib("pop"), AT.get("s3:hidung", K["s3"] + 2), 0.05)
g(M.lib("click"), AT.get("s5:statis", K["s5"] + 1), 0.05)
g(M.lib("impact-bass-1"), AT.get("s7:jatuh", K["s7"] + 5), 0.04)
g(M.lib("glitch-1"), AT.get("s7:tersumbat", K["s7"] + 3), 0.03)
g(M.lib("chime"), AT.get("s8:ditutup", K["s8"] + 2), 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)

M.finish(music)
