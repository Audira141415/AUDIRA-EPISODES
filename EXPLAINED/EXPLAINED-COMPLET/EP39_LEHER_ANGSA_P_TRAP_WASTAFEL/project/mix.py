"""EP39 sound: a stone chapel with water in it. A soft reed-organ drone in D dorian at 72 BPM, glass-harmonica swells
(sine partials with slow attack), a plucked glass-bell motif that answers each scene, and a low sub that darkens while
the seal is broken. SFX: glass chimes on panes, gurgles and pours when water moves, a hiss for the sewer gas, a suction
whoop for the siphon, wind down the vent, a ring clink. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(39)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 72
D3 = 146.83
DOR = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19]
hz = lambda st, base=D3: base * 2 ** (st / 12)


def bell(f, dur=2.2, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 1.6) + 0.45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 8)
    return x * np.minimum(1, t / 0.003) * a


def harmonica(f, dur=3.0, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    env = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 1.0)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 2 * t + 0.3)) * env * a


bel, har, org = M.mono(), M.mono(), M.mono()
# reed-organ drone: root + fifth + a moving third, chord every 2 bars
prog = [0, -2, 3, -4]
i, t0 = 0, 0.0
while t0 < END + 2:
    root = prog[i % 4]
    for st, gain in ((root - 12, 0.5), (root - 5, 0.35), (root + 3 if i % 2 == 0 else root + 2, 0.25)):
        n = int(beat * 8 * SR)
        tt = np.arange(n) / SR
        f = hz(st)
        x = sum(np.sin(2 * np.pi * f * h * tt) / h ** 1.2 for h in (1, 2, 3, 4)) * np.minimum(1, tt / 0.8) * np.minimum(1, (beat * 8 - tt) / 0.8)
        M.lay(org, x * gain * 0.35, t0)
    t0 += beat * 8
    i += 1
# glass-bell motif at each scene start, rising through the film
mot = {"s1": [7, 10, 12], "s2": [12, 10, 7, 5], "s3": [3, 2, 0], "s4": [7, 9, 10, 12], "s5": [12, 14, 15], "s6": [5, 3, 2, 0], "s7": [7, 9, 12, 14], "s8": [12, 14, 15, 19]}
for s, notes in mot.items():
    tt = 0.1 if s == "s1" else K[s] + 0.1
    for j, st in enumerate(notes):
        M.lay(bel, bell(hz(st + 12), 2.4, 0.7), tt + j * beat * 0.5)
for w in ("s1:genangan", "s2:leher", "s4:sumbatnya", "s5:diganti", "s6:atap", "s7:seribu", "s8:alirkan"):
    M.lay(har, harmonica(hz(19), 3.2, 0.5), AT[w] - 0.2)
    M.lay(har, harmonica(hz(24), 3.2, 0.3), AT[w] - 0.1)
# sub that grows while the seal is broken
broken = M.env([(0, 0), (AT["s3:Tanpa"] - 0.5, 0), (AT["s3:Tanpa"], 1), (AT["s4:dibuang"], 1), (AT["s4:tertinggal"], 0), (AT["s6:menyedot"], 0), (AT["s6:menyedot"] + 0.5, 1),
                (AT["s6:tekanannya"], 0), (AT["s6:menguap"], 0.6), (K["s7"], 0), (K["s8"], 0.5), (AT["s8:alirkan"], 0), (DUR, 0)])
sub = np.sin(2 * np.pi * 49 * T + 0.6 * np.sin(2 * np.pi * 0.3 * T)) * broken * 0.6
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.5 * bel + 0.4 * har + 0.45 * org + 0.5 * sub) * e
side = 0.25 * np.roll(bel + har, 900) * e
music = stereo(mono, side)


# ---- SFX ----
def gurgle(t, dur=1.2, a=0.05):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = np.zeros(n)
    for k in range(int(dur * 9)):
        s0 = int((k / 9 + 0.03 * np.sin(k * 7)) * SR)
        if s0 >= n:
            break
        bl = np.arange(min(n - s0, int(0.07 * SR))) / SR
        f0 = 260 + 140 * ((k * 37) % 5)
        x[s0:s0 + len(bl)] += np.sin(2 * np.pi * np.cumsum(f0 * (1 + 2.5 * bl / 0.07)) / SR) * np.exp(-bl * 45)
    g(x * np.minimum(1, tt / 0.1) * np.minimum(1, (dur - tt) / 0.2), t, a)


def pour(a, b, amp):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), 900, 6000)
    env = np.minimum(1, np.arange(n) / (0.2 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.4 * SR))
    g(x / np.abs(x).max() * env, a, amp)


def hiss(a, b, amp):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), 2500, 9000) * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 5))
    env = np.minimum(1, np.arange(n) / (0.5 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.5 * SR))
    g(x / np.abs(x).max() * env, a, amp)


def whoop(t, a=0.06):
    tt = np.arange(int(0.9 * SR)) / SR
    g(M.band(M.rng.standard_normal(len(tt)), 200, 1600) * np.sin(np.pi * tt / 0.9) ** 2 + 0.4 * np.sin(2 * np.pi * np.cumsum(300 - 220 * tt / 0.9) / SR) * np.exp(-tt * 2), t, a)


g(M.lib("chime"), 0.05, 0.04)
hiss(0.0, K["s2"], 0.012)
for s in ("s2", "s4", "s6", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.06)
for s in ("s3", "s5", "s7"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
for w in ("s2:Bentuknya", "s2:samping", "s3:gas", "s3:naik", "s4:menembus", "s5:mendorong", "s5:cincin", "s6:menyedot", "s6:atap", "s6:menguap", "s7:lima", "s7:setengah", "s7:seribu", "s8:alirkan", "s8:Episode"):
    g(M.lib("click-soft"), AT[w] - 0.03, 0.05)
    g(bell(hz(31), 0.8, 0.012), AT[w])
hiss(AT["s3:saluran"] - 0.3, AT["s3:rumah"] + 0.8, 0.03)
gurgle(AT["s3:Tanpa"] - 0.6, 1.0, 0.05)
g(M.lib("error"), AT["s3:rumah"], 0.03)
pour(AT["s4:dibuang"] - 0.5, AT["s4:tertinggal"] + 0.4, 0.035)
gurgle(AT["s4:tertinggal"] - 0.4, 1.2, 0.05)
g(M.thump(0.22), AT["s4:sumbatnya"], 0.1)
g(M.lib("impact-bass-1"), AT["s4:menembus"], 0.04)
pour(AT["s5:mencuci"] - 0.3, AT["s5:terisi"] + 0.4, 0.035)
gurgle(AT["s5:lama"] - 0.2, 1.4, 0.05)
for j in range(3):
    g(bell(hz(36 + j), 0.6, 0.05), AT["s5:cincin"] + 0.5 + j * 0.28)
g(M.lib("ping"), AT["s5:tersangkut"], 0.05)
pour(AT["s6:deras"] - 0.4, AT["s6:menyedot"] + 0.9, 0.04)
whoop(AT["s6:menyedot"], 0.07)
g(M.lib("glitch-1"), AT["s6:jebol"], 0.02)
hiss(AT["s6:menyedot"] + 0.4, AT["s6:udara"] + 0.6, 0.02)
g(M.lib("riser"), AT["s6:udara"] - 0.4, 0.035)
g(M.lib("whoosh"), AT["s6:atap"] - 0.2, 0.05)
hiss(AT["s6:menguap"] - 0.2, K["s7"] - 0.3, 0.015)
g(M.lib("sparkle"), AT["s7:seribu"], 0.04)
hiss(K["s8"] + 0.1, AT["s8:alirkan"], 0.015)
pour(AT["s8:alirkan"] - 0.2, AT["s8:alirkan"] + 2.6, 0.035)
gurgle(AT["s8:alirkan"] + 0.6, 1.2, 0.04)
g(M.lib("chime"), AT["s8:AUDIRA"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
