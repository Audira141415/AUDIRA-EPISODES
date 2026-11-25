"""EP31 sound: a night nocturne in E aeolian at 76 BPM for a leadlight road. Glass-bell arpeggios (bright partials,
long decay) over a low string-like drone and a soft heartbeat-slow bass; the bells shimmer each time a cat's eye
lights up. A car engine bed swells as the headlights approach (s1-s5), a rain bed and a tyre thud fill s6, a muffled
blackout drone in s7, and the last chord opens to E major on 'menatap balik'. SFX: glass glints on lens words,
ray sweeps in s4/s5, a heavy tyre thump, drips. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(3101)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
E3 = 164.81
hz = lambda st, base=E3: base * 2 ** (st / 12)
beat = 60 / 76


def bell(f, dur=2.2, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 1.8) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 8)
    return x * np.minimum(1, t / 0.002) * a


def bed(a, b, amp, lo, hi, fade=0.6, shape=None):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), lo, hi)
    env = np.minimum(1, np.arange(n) / (fade * SR)) * np.minimum(1, (n - np.arange(n)) / (fade * SR))
    if shape is not None:
        env = env * shape[int(a * SR):int(a * SR) + n]
    g(x / np.abs(x).max() * env, a, amp)


bel, drn, bas = M.mono(), M.mono(), M.mono()
major = M.env([(0, 0), (AT["s8:menatap"] - 0.3, 0), (AT["s8:menatap"] + 1.2, 1), (DUR, 1)])
drn += 0.35 * np.sin(2 * np.pi * hz(-12) * T) + 0.22 * np.sin(2 * np.pi * hz(-5) * T + 0.3 * np.sin(T * 0.25))
drn += (1 - major) * 0.15 * np.sin(2 * np.pi * hz(3) * T + np.sin(T * 0.3)) + major * 0.18 * np.sin(2 * np.pi * hz(4) * T + np.sin(T * 0.3))
t0, i = 0.05, 0
while t0 < END + 1.0:
    M.lay(bas, M.thump(0.3) * 0.6, t0)
    t0 += beat * 2
    i += 1
# arpeggios: one per scene start, rising; key words get a high bell
arp = {"s1": [0, 7, 12, 15], "s2": [-4, 3, 8, 12], "s3": [0, 3, 7, 10], "s4": [7, 12, 15, 19, 22], "s5": [22, 19, 15, 12, 7],
       "s6": [-2, 5, 10, 14], "s7": [-7, 0, 3, 8], "s8": [0, 4, 7, 11, 16]}
for s, notes in arp.items():
    tt = 0.08 if s == "s1" else K[s] + 0.12
    for j, st in enumerate(notes):
        M.lay(bel, bell(hz(st + 12), 2.2, 0.6), tt + j * beat * 0.5)
for w in ("s1:pinjaman", "s2:Halifax", "s3:pasang", "s4:titik", "s5:balik", "s6:membersihkannya", "s7:juta", "s8:menatap"):
    M.lay(bel, bell(hz(27), 2.6, 0.4), AT[w])
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.45 * bel + 0.3 * drn + 0.28 * bas) * e
side = 0.25 * np.roll(bel, 1100) * e
music = stereo(mono, side)

# ---- SFX ----
eng = M.env([(0, 0.25), (K["s2"], 0.35), (K["s3"], 0.5), (K["s4"], 0.6), (AT["s5:pulang"], 1), (K["s6"], 0), (K["s7"], 0), (AT["s7:ditutup"], 0.5), (K["s8"], 0.5), (DUR, 0)])
hum = (np.sin(2 * np.pi * 48.0 * T) + 0.5 * np.sin(2 * np.pi * 96.0 * T)) * eng * 0.5
g(hum, 0.0, 0.08)
for s in ("s2", "s4", "s6", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
for s in ("s3", "s5", "s7"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
for w in ("s1:lampu", "s3:Kubah", "s3:besi", "s4:Lensanya", "s5:pengemudi"):
    g(M.lib("click-soft"), AT[w], 0.05)
for w in ("s1:mobilmu", "s4:pemantul", "s5:memantul", "s8:menyorot"):
    g(M.lib("sparkle"), AT[w], 0.04)
g(M.lib("riser"), AT["s4:membelokkan"] - 0.4, 0.035)
g(M.lib("whoosh-short"), AT["s5:sama"] - 0.6, 0.04)
g(M.lib("pop"), AT["s2:Percy"], 0.05)
# truck tyre: rumble in, heavy thump on the press, roll away
bed(AT["s6:dilindas"] - 0.6, AT["s6:tertekan"] + 0.4, 0.05, 40, 300, 0.4)
g(M.lib("impact-bass-1"), AT["s6:tertekan"] - 0.4, 0.08)
g(M.thump(0.45), AT["s6:tertekan"] - 0.4, 0.14)
g(M.lib("click"), AT["s6:turun"], 0.05)
g(M.lib("whoosh-short"), AT["s6:disapu"], 0.04)
bed(AT["s6:Air"] - 0.3, K["s7"], 0.03, 2500, 9000, 0.5)  # rain
for j in range(10):
    tt = np.arange(int(0.1 * SR)) / SR
    g(np.sin(2 * np.pi * np.cumsum(900 + 400 * (j % 3) + 1500 * tt / 0.1) / SR) * np.exp(-tt * 45), AT["s6:membilas"] - 0.8 + j * 0.24, 0.03)
bed(AT["s6:membersihkannya"] - 0.4, K["s7"], 0.035, 40, 300, 0.4)
# blackout drone
bed(AT["s7:pemadaman"] - 0.2, AT["s7:juta"] - 0.5, 0.03, 80, 500, 0.5)
g(M.lib("click"), AT["s7:ditutup"], 0.05)
for j in range(6):
    g(M.lib("ping"), AT["s7:juta"] + j * 0.09, 0.025)
g(M.lib("pop"), AT["s8:AUDIRA"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
