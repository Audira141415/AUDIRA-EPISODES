"""EP25 sound: THERMALFORGE industrial warmth. A low furnace drone in D minor, metallic glass
resonance tones, an anvil-bell melody at scene openings, and a steady thermal pulse. SFX: glass
chimes on cuts, furnace rumble in s6, drip-tings for halftone dots in s7, impact on key words.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2025)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 80


def anvil(f, dur=1.8, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t * 2.5)
         + 0.4 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 6)
         + 0.15 * np.sin(2 * np.pi * f * 5.03 * t) * np.exp(-t * 12))
    return x * np.minimum(1, t / 0.001) * a


def glass_tone(f, dur=2.0, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = (np.sin(2 * np.pi * f * t + 0.3 * np.sin(t * 5))
         + 0.6 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 8))
    return x * np.exp(-t * 1.8) * np.minimum(1, t / 0.003) * a


def pulse(f, dur=0.6, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 5) * np.minimum(1, t / 0.002) * a


D3 = 146.83
Dm = [0, 3, 7, 10, 12, 15, 19, 22, 24]
hz = lambda st, base=D3: base * 2 ** (st / 12)

anv, gls, pad, drn = M.mono(), M.mono(), M.mono(), M.mono()

# thermal pulse: root/fifth in 8ths
prog = [0, -2, 3, -4]
i, t0 = 0, 0.05
while t0 < END + 1.5:
    root = prog[(i // 16) % 4]
    st = root + (0 if i % 2 == 0 else 7) - 12
    M.lay(drn, pulse(hz(st), 0.5, 0.7 if i % 4 == 0 else 0.4), t0)
    t0 += beat / 2
    i += 1

# anvil-bell phrases at scene openings
phr = {
    "s1": [12, 15, 19, 22],
    "s2": [7, 10, 12, 15],
    "s3": [3, 7, 10, 12, 15],
    "s4": [15, 19, 22, 24],
    "s5": [24, 22, 19, 15, 12],
    "s6": [0, 3, 7, 10],
    "s7": [7, 10, 12, 15],
    "s8": [12, 15, 19, 22, 24],
}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.12
    for j, st in enumerate(notes):
        M.lay(anv, anvil(hz(st), 1.6, 0.7), tt + j * beat * 0.5)

# glass resonance on key words
for w in ("s2:dipanggang", "s3:uretan", "s4:ultraviolet", "s5:mencengkeram",
          "s6:dipanaskan", "s7:halftone", "s8:AUDIRA"):
    M.lay(gls, glass_tone(hz(22), 2.0, 0.45), AT[w])

# pad: warm drone base, brightens in furnace scene
furnace_env = M.env([
    (0, 0.3), (K["s3"], 0.3), (K["s4"], 0.4), (K["s6"], 0.2),
    (AT["s6:dipanaskan"], 1), (K["s6e"], 0.8), (K["s7"], 0.4),
    (K["s8"], 0.5), (DUR, 0.5)
])
pad += (0.4 * np.sin(2 * np.pi * 73.4 * T)
        + 0.3 * np.sin(2 * np.pi * 110 * T + np.sin(T * 0.5))
        + 0.2 * np.sin(2 * np.pi * 146.8 * T)) * 0.5
pad += furnace_env * (
    0.3 * np.sin(2 * np.pi * 220 * T + 0.6 * np.sin(T * 0.8))
    + 0.2 * np.sin(2 * np.pi * 293.7 * T + np.sin(T * 0.4))
)

# furnace rumble in s6
furn_env = M.env([
    (0, 0), (K["s6"], 0), (K["s6"] + 0.5, 1),
    (K["s6e"], 1), (K["s7"], 0), (DUR, 0)
])
rumble_f = 42 + 8 * np.sin(T * 1.3)
rumble = (np.sin(2 * np.pi * np.cumsum(rumble_f) / SR)
          + 0.5 * np.sin(2 * np.pi * np.cumsum(2 * rumble_f) / SR)) * furn_env * 0.45

# halftone ting pops in s7
for j in range(6):
    M.lay(gls, glass_tone(hz(12 + j * 3), 1.0, 0.5), AT["s7:koran"] + j * 0.2)

# outro chord
for st in (0, 3, 7, 12, 15):
    M.lay(anv, anvil(hz(st), 2.8, 0.5), AT["s8:AUDIRA"] + st * 0.01)

e = M.env([(0, 0.8), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.45 * anv + 0.4 * drn + 0.3 * pad + 0.35 * gls + 0.4 * rumble) * e
side = 0.2 * np.roll(gls + pad * furnace_env * 0.4, 750) * e
music = stereo(mono, side)


# ---- SFX ----
def chime(t, dur=0.3, a=0.04):
    x = M.band(M.rng.standard_normal(int(dur * SR)), 2000, 8000)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (0.02 * SR)) * np.exp(-np.arange(n) / SR * 12)
    g(x / np.abs(x).max() * env, t, a)


def ting(t, a=0.04, f0=1800):
    tt = np.arange(int(0.15 * SR)) / SR
    g(np.sin(2 * np.pi * f0 * tt) * np.exp(-tt * 30), t, a)


# scene cut whooshes
for s in ("s2", "s4", "s6", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
for s in ("s3", "s5", "s7"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)

# word accents
for w in ("s1:bintik-bintik", "s2:frit", "s2:dipanggang", "s2:dikerok",
          "s3:karet", "s3:merekatkan", "s3:uretan",
          "s4:rusak", "s4:ultraviolet", "s4:payung",
          "s5:mencengkeram", "s5:menyembunyikan",
          "s6:dipanaskan", "s6:dibengkokkan", "s6:terdistorsi", "s6:bertahap",
          "s7:halftone", "s7:koran", "s7:silau",
          "s8:bekerja", "s8:Episode"):
    chime(AT[w] - 0.04, 0.25, 0.03)

# specific impacts
g(M.lib("impact-bass-1"), AT["s1:menempel"], 0.05)
g(M.thump(0.25), AT["s2:dipanggang"], 0.08)
g(M.lib("pop"), AT["s3:uretan"], 0.06)
g(M.lib("click-soft"), AT["s4:sinar"], 0.06)
g(M.lib("ping"), AT["s5:mencengkeram"], 0.04)
g(M.thump(0.2), AT["s6:dipanaskan"], 0.1)
g(M.lib("glitch-1"), AT["s6:terdistorsi"], 0.03)

# halftone dot tings in s7
for j in range(8):
    ting(AT["s7:koran"] + j * 0.15, 0.035, 1600 + j * 200)

g(M.lib("pop"), AT["s7:spion"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)

M.finish(music)
