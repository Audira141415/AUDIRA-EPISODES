"""EP01 sound: a playful comic-lab bed at 108 BPM in F major. Pizzicato strings (bright plucks) on a bouncy
I-vi-IV-V, a marimba (sine + 4x partial, fast decay) answering in off-beat figures, a soft 120 Hz electronic hum
that rises while the microwave runs, and a shaker tick. The band thins out for the 1945 lab (s2) and the
door question (s7 opening). SFX: microwave hum + door clunk, start beeps, wave whooshes, a candy sizzle,
molecule ticks, the turntable roll, the final ding. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2450)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]

beat = 60 / 108
F4 = 349.23
# chord roots (semitones from F) and triads: F, Dm, Bb, C
prog = [(0, (0, 4, 7)), (-3, (0, 3, 7)), (-7, (0, 4, 7)), (-5, (0, 4, 7))]
pizz, mar, hum, shk = M.mono(), M.mono(), M.mono(), M.mono()


def marimba(f, dur=0.5, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30)
    return x * np.minimum(1, t / 0.002) * a


quiet = [(K["s2"], AT["s2:Percy"]), (K["s7"], AT["s7:masaknya"])]
t0, i = 0.0, 0
while t0 < DUR - 0.5:
    bar = (i // 4) % 4
    root, tri = prog[bar]
    thin = any(a < t0 < b for a, b in quiet)
    # pizzicato: bass on 1 and 3, chord tones on 2 and 4
    if i % 2 == 0:
        M.lay(pizz, M.note(F4 / 4 * 2 ** (root / 12), beat * 0.9, "pluck", 6, 0.003), t0, 0.9)
    elif not thin:
        for st in tri:
            M.lay(pizz, M.note(F4 / 2 * 2 ** ((root + st) / 12), beat * 0.6, "pluck", 9, 0.003), t0, 0.28)
    # marimba off-beat figure, two bars on, two bars answer higher
    if not thin:
        st = tri[(i + bar) % 3] + (12 if (i // 8) % 2 else 0)
        M.lay(mar, marimba(F4 * 2 ** ((root + st) / 12), 0.45), t0 + beat * 0.5, 0.32 if i % 4 != 3 else 0.2)
    sh = M.band(M.burst(0.05, 80, 1), 5000, 12000)
    M.lay(shk, sh, t0, 0.05)
    M.lay(shk, sh, t0 + beat * 0.5, 0.09)
    t0 += beat
    i += 1

# electronic hum: on while the microwave runs (s1, s4 onward), swells in s4/s5
on = M.env([(0, 1), (K["s2"] - 0.2, 1), (K["s2"] + 0.4, 0), (K["s4"] - 0.3, 0), (K["s4"] + 0.5, 1), (K["s5"], 1.4), (K["s6"], 1), (OUT, 1), (DUR, 0)])
hum = (np.sin(2 * np.pi * 120 * T) + 0.4 * np.sin(2 * np.pi * 240 * T) + 0.15 * np.sin(2 * np.pi * 360 * T)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.5 * T)) * on
# payoff: marimba arpeggio up on the payoff word, held F chord under the outro
for k, st in enumerate((0, 4, 7, 12, 16, 19, 24)):
    M.lay(mar, marimba(F4 * 2 ** (st / 12), 0.8), AT["s8:air"] + k * beat * 0.25, 0.3)
e = M.env([(0, 0.9), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.6, 0.6), (DUR, 0)])
mono = (0.7 * pizz + 0.55 * mar + 0.05 * hum + 0.6 * shk) * e
side = 0.22 * np.roll(mar, 600) * e + 0.1 * np.roll(shk, 300)
music = stereo(mono, side)

# ---- SFX ----
def beep(t, f=1760, a=0.05, d=0.09):
    g(M.note(f, d, "square", 4, 0.002), t, a)


def clunk(t, a=0.16):
    g(M.thump(0.25), t, a)
    g(M.band(M.burst(0.06, 90, 1), 800, 6000), t, a * 0.6)


def mwhum(t, dur, a=0.05):
    tt = np.arange(int(dur * SR)) / SR
    x = (np.sin(2 * np.pi * 60 * tt) + 0.6 * np.sin(2 * np.pi * 120 * tt) + 0.2 * M.band(M.rng.standard_normal(len(tt)), 300, 1200)[: len(tt)])
    x *= np.minimum(1, tt / 0.3) * np.minimum(1, (dur - tt) / 0.5)
    g(x, t, a)


def sizzle(t, dur, a=0.05):
    x = M.band(M.rng.standard_normal(int(dur * SR)), 3000, 11000)
    x *= (0.5 + 0.5 * (M.rng.random(len(x)) > 0.985)) * np.minimum(1, np.arange(len(x)) / (0.2 * SR)) * np.minimum(1, (len(x) - np.arange(len(x))) / (0.4 * SR))
    g(x / max(1e-6, np.abs(x).max()), t, a)


# hook: door clunk, three start beeps, the hum, the shake on "menggoyang"
clunk(0.02, 0.12)
for k in range(3):
    beep(0.15 + k * 0.14, 1760, 0.04)
mwhum(0.3, K["s2"] - 0.3, 0.05)
for k in range(6):
    g(M.band(M.burst(0.03, 120, 1), 2000, 9000), AT["s1:menggoyang"] + k * 0.11, 0.06)
g(M.lib("pop"), AT["s1:panas"], 0.08)
# scene changes: whoosh, plus a page-flip tick (comic panel)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.3, 0.08)
    g(M.band(M.burst(0.08, 50, 2), 1200, 7000), K[s] - 0.05, 0.05)
g(M.lib("whoosh-cinematic"), K["s2"] - 0.25, 0.07)
# 1945 lab: radar pulses, candy sizzle, the melt
g(M.lib("typing"), AT["s2:Percy"], 0.04)
for k in range(10):
    beep(AT["s2:bekerja"] + k * 0.9, 880, 0.02, 0.06)
sizzle(AT["s2:permen"] + 0.2, 2.4, 0.06)
g(M.lib("pop"), AT["s2:meleleh"], 0.07)
g(M.lib("riser"), AT["s3:gelombang"] - 0.5, 0.05)
g(M.lib("impact-bass-1"), AT["s3:Dua"] + 0.4, 0.08)
g(M.lib("ping"), AT["s3:Radarange"], 0.05)
# s4: magnetron spin-up, wave whooshes, label pops
mwhum(K["s4"] + 0.3, K["s6"] - K["s4"], 0.04)
g(M.lib("riser"), AT["s4:magnetron"] - 0.4, 0.05)
for k in range(3):
    g(M.lib("whoosh"), AT["s4:membuat"] + k * 0.7, 0.05)
g(M.lib("pop"), AT["s4:dua"], 0.07)
g(M.lib("pop"), AT["s4:panjang"], 0.07)
# s5: field flips (soft clicks at 1.7 per second), molecules tick, heat sparkle
fl = 1 / (2 * 0.85)
tt = AT["s5:medan"]
while tt < K["s6"]:
    g(M.lib("click-soft"), tt, 0.05)
    tt += fl
g(M.lib("sparkle"), AT["s5:menghasilkan"], 0.06)
sizzle(AT["s5:gerakan"], 2.0, 0.035)
# s6: penetration thud, heat creep, turntable roll
g(M.thump(0.3), AT["s6:sentimeter"], 0.12)
g(M.lib("riser"), AT["s6:merambat"] - 0.4, 0.04)
roll = M.band(M.rng.standard_normal(int(4 * SR)), 100, 700) * (0.7 + 0.3 * np.sin(2 * np.pi * 3 * np.arange(int(4 * SR)) / SR))
g(roll / np.abs(roll).max() * np.minimum(1, np.arange(len(roll)) / (0.3 * SR)) * np.minimum(1, (len(roll) - np.arange(len(roll))) / (0.6 * SR)), AT["s6:piring"] - 0.3, 0.05)
# s7: question sting, cage zap, bounces off the mesh, light chime
g(M.lib("glitch-1"), AT["s7:bocor"], 0.04)
g(M.lib("impact-bass-1"), AT["s7:sangkar"], 0.07)
g(M.lib("chime"), AT["s7:Faraday"], 0.05)
for k in range(4):
    g(M.lib("click"), AT["s7:gelombangnya"] + 0.6 + k * 1.55, 0.05)
g(M.lib("error"), AT["s7:tertahan"], 0.04)
g(M.lib("sparkle"), AT["s7:cahaya"], 0.06)
# s8: payoff ding (bell partials), outro
ding = sum(np.sin(2 * np.pi * f * np.arange(int(1.6 * SR)) / SR) * np.exp(-np.arange(int(1.6 * SR)) / SR * d) * a for f, d, a in ((1568, 2.2, 1), (3136, 4, 0.4), (4704, 6, 0.2)))
g(ding * 0.5, AT["s8:dipanaskan"], 0.12)
g(M.lib("pop"), AT["s8:AUDIRA"], 0.06)
g(ding * 0.5, OUT, 0.1)
M.finish(music)
