"""EP42 sound: bouncy INFLATABLE ionization detector. Playful C major with bright FM bells on word hits,
a steady Geiger-like tick for the ionization current (s5), alarm buzzer (s6), and sparkly pads.
SFX: pop on inflatable bounces, whoosh on cuts, alarm on "alarm berbunyi".
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(42)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 110  # upbeat
C3 = 130.81
hz = lambda st, base=C3: base * 2 ** (st / 12)


def bell(f, dur=2.0, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * t + 2.5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t * 3.0)
            * np.minimum(1, t / 0.002) * a)


def tick(dur=0.02, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * 4800 * t) * np.exp(-t * 120) * a


def buzzer(dur=0.8, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return (np.sign(np.sin(2 * np.pi * 440 * t)) * 0.5 + 0.5 * np.sin(2 * np.pi * 880 * t)) * np.exp(-t * 1.5) * a


bel, pad, perc, atm = M.mono(), M.mono(), M.mono(), M.mono()

# bright pad: C + E + G
pad += 0.35 * np.sin(2 * np.pi * C3 * T) + 0.2 * np.sin(2 * np.pi * hz(4) * T) + 0.15 * np.sin(2 * np.pi * hz(7) * T)
sparkle = M.env([(0, 0.5), (K["s3"], 0.8), (K["s6"], 0.4), (K["s7"], 0.7), (K["s8"], 1.0), (DUR, 1.0)])
pad += sparkle * 0.1 * np.sin(2 * np.pi * hz(16) * T + 3 * np.sin(T * 0.7))

# FM bells on scene openings
for s, st in [("s1", 0), ("s2", 4), ("s3", 7), ("s4", 5), ("s5", 9), ("s6", 0), ("s7", 7), ("s8", 12)]:
    tt = 0.1 if s == "s1" else K[s] + 0.1
    M.lay(bel, bell(hz(st + 12), 2.0, 0.45), tt)
    M.lay(bel, bell(hz(st + 19), 1.2, 0.25), tt + beat * 0.5)

# key word bells
for w in ("s1:ionisasi", "s2:ionisasi", "s3:amerisium", "s4:bermuatan", "s5:mengalir", "s6:alarm", "s7:radiasi", "s8:utuh"):
    M.lay(bel, bell(hz(24), 2.5, 0.35), AT[w])

# Geiger tick: steady current (s2-s5), disrupted in s6
t0 = K["s2"]
while t0 < K["s6"]:
    M.lay(perc, tick(0.02, 0.3), t0)
    t0 += beat * 0.5

# disrupted ticks in s6 (fewer, irregular)
t0 = K["s6"] + 0.5
while t0 < K["s7"]:
    M.lay(perc, tick(0.02, 0.15), t0)
    t0 += beat * 1.5 + M.rng.random() * beat

# alarm buzzer on "alarm berbunyi"
M.lay(atm, buzzer(1.2, 0.3), AT.get("s6:alarm", K["s6"] + 5))

# light bouncy ostinato
t0 = 0.3
while t0 < END + 0.5:
    accent = int((t0 - 0.3) / beat) % 4 == 0
    M.lay(perc, tick(0.015, 0.2 if accent else 0.12), t0)
    t0 += beat

# outro chord
for st in (0, 4, 7, 12, 16):
    M.lay(bel, bell(hz(st + 12), 3.5, 0.3), AT["s8:AUDIRA"] + st * 0.012)

e = M.env([(0, 0.7), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.4), (DUR, 0)])
mono = (0.4 * bel + 0.3 * pad + 0.3 * perc + 0.2 * atm) * e
side = 0.18 * np.roll(bel + perc, 700) * e
music = stereo(mono, side)


# ---- SFX ----
for s in ("s2", "s4", "s6"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.3, 0.05)
for s in ("s3", "s5", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.04)
g(M.lib("pop"), AT["s1:ionisasi"], 0.05)
g(M.lib("pop"), AT["s3:amerisium"], 0.05)
g(M.lib("click"), AT["s4:bermuatan"], 0.05)
g(M.lib("impact-bass-1"), AT["s6:alarm"], 0.05)
g(M.lib("glitch-1"), AT.get("s6:Arus", K["s6"] + 3), 0.04)
g(M.lib("riser"), AT.get("s6:Saat", K["s6"]) - 0.5, 0.04)
g(M.lib("chime"), AT["s8:utuh"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.lib("pop"), AT.get("s2:kecil", K["s2"] + 1), 0.04)
g(M.lib("pop"), AT.get("s5:Ion", K["s5"]), 0.04)
g(M.thump(), OUT, 0.12)

M.finish(music)
