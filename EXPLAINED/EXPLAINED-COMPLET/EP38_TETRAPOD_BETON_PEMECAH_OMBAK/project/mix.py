"""EP38 sound: a brutalist coastal breakwater. Deep ocean drone in D minor with concrete-slam impacts on scene cuts,
wave crash textures (filtered noise), a slow heartbeat-like pulse for the tetrapod mass, and metallic resonance
on key reveals. SFX: whoosh on cuts, concrete impact on "menahan", wave crash on s3/s6, Hudson formula reveal.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(38)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 72  # slow, heavy
D2 = 73.42
hz = lambda st, base=D2: base * 2 ** (st / 12)


def slam(dur=0.25, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    n = M.rng.standard_normal(len(t))
    return M.band(n, 60, 400) * np.exp(-t * 12) * a


def wave_tex(dur=2.0, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    n = M.rng.standard_normal(len(t))
    env = np.sin(np.pi * t / dur) ** 0.5
    return M.band(n, 200, 3000) * env * a


def bell(f, dur=2.5, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 2.0) * np.minimum(1, t / 0.003) * a


def pulse(f, dur=0.4, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 5) * a


bel, pad, perc, atm = M.mono(), M.mono(), M.mono(), M.mono()

# drone: D2 + A2, deep oceanic sub
pad += 0.55 * np.sin(2 * np.pi * D2 * T) + 0.2 * np.sin(2 * np.pi * D2 * 2 * T + 0.5 * np.sin(T * 0.3))
pad += 0.2 * np.sin(2 * np.pi * hz(7) * T)  # A2
depth = M.env([(0, 0.6), (K["s3"], 0.9), (K["s6"], 1.0), (K["s7"], 0.7), (K["s8"], 1.0), (DUR, 1.0)])
pad += depth * (0.1 * np.sin(2 * np.pi * hz(12) * T) + 0.06 * np.sin(2 * np.pi * hz(15) * T))

# slow heartbeat pulse (mass of concrete)
t0 = 0.5
while t0 < END + 0.5:
    M.lay(perc, pulse(D2, 0.4, 0.3), t0)
    t0 += beat * 2

# concrete slam on scene openings
for s, st in [("s1", 0), ("s2", 5), ("s3", 7), ("s4", 3), ("s5", 10), ("s6", 5), ("s7", 7), ("s8", 12)]:
    tt = 0.1 if s == "s1" else K[s] + 0.05
    M.lay(perc, slam(0.3, 0.55), tt)
    M.lay(bel, bell(hz(st + 12), 2.5, 0.4), tt + 0.1)

# key word bells
for w in ("s1:menahan", "s3:memantulkannya", "s4:terkunci", "s5:separuh", "s6:habis", "s6:terguling", "s7:delapan", "s8:menjebak"):
    M.lay(bel, bell(hz(24), 2.0, 0.35), AT[w])

# wave crash texture (s3: flat wall, s6: tetrapod gaps)
M.lay(atm, wave_tex(2.5, 0.25), AT.get("s3:pukulan", K["s3"] + 1))
M.lay(atm, wave_tex(3.0, 0.3), AT.get("s6:menyusup", K["s6"] + 1))

# ocean ambient: continuous filtered noise, low
ocean_env = M.env([(0, 0.3), (K["s3"], 0.5), (K["s5"], 0.3), (K["s6"], 0.6), (K["s7"], 0.3), (K["s8"], 0.5), (DUR, 0.4)])
ocean = M.rng.standard_normal(N) * ocean_env * 0.03
ocean = M.band(ocean, 100, 1500)
atm += ocean

# Hudson formula reveal: rising tone
hudson_t = np.arange(int(1.5 * SR)) / SR
hudson_sig = np.sin(2 * np.pi * (hz(12) + hudson_t * 200) * hudson_t) * np.exp(-hudson_t * 1.5) * 0.3
M.lay(bel, hudson_sig, AT.get("s7:Hudson", K["s7"] + 1))

# outro chord
for st in (0, 7, 12, 15, 19):
    M.lay(bel, bell(hz(st + 12), 3.5, 0.3), AT["s8:AUDIRA"] + st * 0.015)

e = M.env([(0, 0.7), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.4), (DUR, 0)])
mono = (0.4 * bel + 0.38 * pad + 0.3 * perc + 0.25 * atm) * e
side = 0.18 * np.roll(bel + perc, 900) * e
music = stereo(mono, side)


# ---- SFX ----
for s in ("s2", "s4", "s6"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.3, 0.06)
for s in ("s3", "s5", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
g(M.lib("impact-bass-1"), AT["s1:menahan"], 0.05)
g(M.lib("impact-bass-1"), AT["s3:memantulkannya"], 0.04)
g(M.lib("impact-bass-1"), AT["s4:terkunci"], 0.04)
g(M.lib("click"), AT["s5:separuh"], 0.05)
g(M.lib("pop"), AT["s6:menyusup"], 0.05)
g(M.lib("glitch-1"), AT["s6:habis"], 0.03)
g(M.lib("riser"), AT["s7:Hudson"] - 1.0, 0.04)
g(M.lib("chime"), AT["s8:menjebak"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)

M.finish(music)
