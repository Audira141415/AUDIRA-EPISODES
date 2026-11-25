"""EP09 sound: a clean bathroom lab. Wooden marimba in D dorian at 100 BPM over a round sub pulse and a cool glassy pad;
bubble plinks (pitch-rising sine drops) answer key words. The flush is a real arc: button click, flapper clunk, a
filtered-noise rush that swells while the bowl rises, a low roar while the siphon pulls, the "gluguk" gulps (low noise
bursts with a falling pitch), then the thin hiss of the refill. Sewer gas gets a soft dissonant drone. Run from project/:
python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1909)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 100
D3 = 146.83
DOR = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19]
hz = lambda st, base=D3: base * 2 ** (st / 12)


def marimba(f, dur=0.8, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + 0.3 * np.sin(2 * np.pi * f * 3.9 * t) * np.exp(-t * 22) + 0.15 * np.sin(2 * np.pi * f * 10 * t) * np.exp(-t * 60)
    return x * np.minimum(1, t / 0.002) * a


def plink(f0, dur=0.16, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.4 * t / dur)) / SR) * np.exp(-t * 30) * a


def noise(dur, lo, hi):
    x = M.band(M.rng.standard_normal(int(dur * SR)), lo, hi)
    return x / (np.abs(x).max() + 1e-9)


mar, sub, pad, bub = M.mono(), M.mono(), M.mono(), M.mono()
# marimba ostinato, chord root changes every two bars: Dm, C, Bb, C
prog = [0, -2, -4, -2]
i, t0 = 0, 0.05
pat = [0, 7, 12, 7, 3, 7, 10, 7]
while t0 < END + 1.0:
    root = prog[(i // 16) % 4]
    M.lay(mar, marimba(hz(root + pat[i % 8]), 0.7, 0.8 if i % 4 == 0 else 0.5), t0)
    if i % 4 == 0:
        M.lay(sub, marimba(hz(root - 12), 1.2, 1.0), t0)
    t0 += beat / 2
    i += 1
# bubble plinks on key words
for w in ("s1:menyedotnya", "s3:sifonik", "s4:sekat", "s5:puncak", "s6:terbentuklah", "s7:pelampung", "s8:gluguk"):
    for j, st in enumerate((12, 17, 22)):
        M.lay(bub, plink(hz(st + 12), 0.14, 0.7), AT[w] + j * 0.08)
# glassy pad: thin while the tank is still, opens during the siphon
open_ = M.env([(0, 0.3), (K["s5"], 0.4), (AT["s6:terbentuklah"], 1), (K["s7"], 0.5), (K["s8"], 0.8), (DUR, 0.8)])
pad += (0.35 * np.sin(2 * np.pi * 293.7 * T) + 0.25 * np.sin(2 * np.pi * 440 * T + np.sin(T * 0.5)) + 0.2 * np.sin(2 * np.pi * 349.2 * T)) * 0.5
pad += open_ * 0.2 * np.sin(2 * np.pi * 587.3 * T + 0.5 * np.sin(T * 0.8))
# sewer gas drone in s4 (soft tritone), cut by the seal
gas = M.env([(0, 0), (K["s4"], 0), (AT["s4:bau"] - 0.6, 1), (AT["s4:tombol"] - 0.3, 1), (AT["s4:tombol"], 0), (DUR, 0)])
pad += gas * 0.3 * (np.sin(2 * np.pi * 103.8 * T) + np.sin(2 * np.pi * 146.8 * T + np.sin(T * 3)))
# beaker blocks in s7: one marimba stab per volume
for w, st in (("s7:tiga", 0), ("s7:enam", 5), ("s7:empat#2", 7)):
    for j in range(3):
        M.lay(mar, marimba(hz(st + 12 + j * 7), 0.9, 0.7), AT[w] + j * 0.09)
for st in (0, 7, 12, 15, 19):
    M.lay(mar, marimba(hz(st + 12), 1.6, 0.5), AT["s8:AUDIRA"] + st * 0.012)
e = M.env([(0, 0.85), (K["s2"], 1), (AT["s4:menerjang"], 0.75), (K["s7"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.5 * mar + 0.45 * sub + 0.28 * pad + 0.4 * bub) * e
side = 0.22 * np.roll(mar + pad * open_ * 0.5, 700) * e
music = stereo(mono, side)


# ---- SFX ----
def bed(a, b, amp, lo, hi, att=0.4, rel=0.6):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = noise(b - a, lo, hi)
    env = np.minimum(1, np.arange(n) / (att * SR)) * np.minimum(1, (n - np.arange(n)) / (rel * SR))
    g(x * env, a, amp)


def gulp(t, a=0.12):
    d = 0.22
    tt = np.arange(int(d * SR)) / SR
    x = noise(d, 80, 700) * np.sin(2 * np.pi * np.cumsum(180 - 300 * tt) / SR) * np.exp(-tt * 14)
    g(x, t, a)


for s in ("s2", "s3", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
for s in ("s4", "s5", "s6"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
g(M.lib("whoosh-short"), AT["s7:Kloset"] - 0.3, 0.05)
# hook: the frosted half lifts off, then a quick suck
g(M.lib("riser"), AT["s1:menyedotnya"] - 0.9, 0.04)
bed(AT["s1:menyedotnya"] - 0.1, K["s1e"] + 0.2, 0.05, 150, 1800, 0.1, 0.4)
g(M.lib("glitch-1"), AT["s1:mendorong"], 0.02)
# washdown push
bed(AT["s2:dorongan"] - 0.2, K["s3"], 0.04, 300, 3000, 0.2, 0.5)
for w in ("s2:washdown", "s2:Eropa", "s3:sifonik", "s3:melengkung", "s4:sekat", "s5:melimpah", "s5:memenuhi", "s6:sedotan", "s7:pelampung", "s8:Episode"):
    g(M.lib("click-soft"), AT[w] - 0.03, 0.05)
# flush arc
g(M.lib("click"), AT["s4:ditekan"], 0.08)
g(M.thump(0.2), AT["s4:terangkat"], 0.08)
bed(AT["s4:menerjang"] - 0.3, AT["s5:melimpah"] + 0.5, 0.07, 400, 5000, 0.25, 0.8)
bed(AT["s5:melimpah"], AT["s6:penuh"], 0.05, 200, 2500, 0.3, 0.6)
bed(AT["s6:penuh"] - 0.2, AT["s6:putus"], 0.065, 60, 900, 0.3, 0.3)
g(M.lib("impact-bass-1"), AT["s6:terbentuklah"], 0.05)
for j in range(5):
    gulp(AT["s6:udara"] + 0.25 + j * 0.42, 0.1)
for j in range(3):
    gulp(AT["s6:gluguk"] - 0.05 + j * 0.2, 0.14)
g(M.lib("pop"), AT["s6:gluguk"], 0.05)
# refill hiss and drips
bed(AT["s7:keran"] - 0.1, AT["s7:penuh"] + 0.5, 0.03, 2500, 9000, 0.2, 0.5)
for j in range(6):
    tt = np.arange(int(0.12 * SR)) / SR
    g(np.sin(2 * np.pi * np.cumsum((900 + 120 * j) * (1 + 1.2 * tt / 0.12)) / SR) * np.exp(-tt * 40), AT["s7:pelampung"] + j * 0.5, 0.035)
for w in ("s7:tiga", "s7:enam", "s7:empat#2"):
    g(M.lib("pop"), AT[w], 0.06)
g(M.lib("chime"), AT["s7:delapan"] + 0.4, 0.04)
gulp(AT["s8:gluguk"], 0.1)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
