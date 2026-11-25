"""EP24 sound: a quiet kintsugi workshop. Koto-like plucks in the D "in" scale at 84 BPM over a low drone and a breathy
bamboo-flute tone; a cold glassy shimmer while the window fogs; a soft electrical hum while current runs through the
lines that warms (more harmonics) as the lines heat; a gentle steam hiss as the dew evaporates. SFX: soft whooshes on
cuts, a squeegee sweep and a kiln roar in the lab, a button click, ceramic taps on the patent tablets, a scratch and a
cloth wipe in s8. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2424)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 84
D3 = 146.83
IN = [0, 1, 5, 7, 8, 12, 13, 17, 19, 20, 24]  # D Eb G A Bb ...
hz = lambda st, base=D3: base * 2 ** (st / 12)


def koto(f, dur=1.8, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t + 0.3 * h) * np.exp(-t * (2.2 + 1.8 * h)) / h ** 1.1 for h in range(1, 7))
    x *= 1 + 0.004 * np.sin(2 * np.pi * 5 * t)  # slight string bend
    return x * np.minimum(1, t / 0.003) * a


def flute(f, dur, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.6)
    tone = np.sin(2 * np.pi * np.cumsum(f * vib) / SR) + 0.18 * np.sin(2 * np.pi * np.cumsum(2 * f * vib) / SR)
    breath = M.band(M.rng.standard_normal(len(t)), f * 0.8, f * 3) * 0.18
    env = np.minimum(1, t / 0.25) * np.minimum(1, (dur - t) / 0.5)
    return (tone + breath / max(1e-6, np.abs(breath).max()) * 0.25) * env * a


kt, fl, pad = M.mono(), M.mono(), M.mono()
# koto pattern: sparse arpeggio over the scale, phrase shape changes per scene
R = np.random.default_rng(24)
t0, i = 0.05, 0
while t0 < END + 1.0:
    st = IN[(i * 3 + (i // 8)) % 7] + (12 if i % 8 in (3, 6) else 0)
    M.lay(kt, koto(hz(st), 1.6, 0.8 if i % 4 == 0 else 0.5), t0)
    t0 += beat * (1 if i % 4 != 3 else 1.5)
    i += 1
# flute lines on scene openings
for s, st in (("s2", 19), ("s4", 17), ("s6", 24), ("s8", 19)):
    M.lay(fl, flute(hz(st), 3.2, 0.5), K[s] + 0.2)
# drone + cold shimmer while fogged, warming when the lines heat
pad += 0.5 * np.sin(2 * np.pi * D3 / 2 * T) + 0.25 * np.sin(2 * np.pi * D3 * 0.75 * T + 0.4 * np.sin(T * 0.3))
cold = M.env([(0, 0), (K["s2"], 0), (AT["s2:embun"], 0.8), (K["s4"], 0.8), (K["s4"] + 0.5, 0), (K["s5"], 0.7), (AT["s6:menguap"], 0.7), (AT["s6:mencair"] + 1, 0), (DUR, 0)])
pad += cold * (0.16 * np.sin(2 * np.pi * 1174.7 * T + np.sin(T * 1.7)) + 0.12 * np.sin(2 * np.pi * 1567.98 * T + np.sin(T * 1.3)))
warm = M.env([(0, 0), (AT["s5:mengubah"], 0), (AT["s5:panas"] + 0.3, 1), (AT["s6:mati"], 1), (AT["s6:hangat"] + 0.5, 0.2), (K["s7"], 0), (DUR, 0)])
pad += warm * (0.22 * np.sin(2 * np.pi * hz(7) * T) + 0.14 * np.sin(2 * np.pi * hz(12) * T + 0.5 * np.sin(T * 0.6)))
# electrical hum while current flows
flow = M.env([(0, 0), (AT["s5:tombolnya"], 0), (AT["s5:mengalir"] + 0.4, 1), (AT["s6:mati"], 1), (AT["s6:mati"] + 0.8, 0), (DUR, 0)])
hum = (np.sin(2 * np.pi * 100 * T) + 0.35 * np.sin(2 * np.pi * 200 * T) + warm * 0.3 * np.sin(2 * np.pi * 300 * T)) * flow * 0.3
# ceramic taps on the patents
for j in range(10):
    M.lay(kt, koto(hz(24 + IN[j % 5]), 0.6, 0.35), AT["s7:paten"] - 0.9 + j * 0.1)
for st in (0, 7, 12, 19, 24):
    M.lay(kt, koto(hz(st), 2.6, 0.45), AT["s8:AUDIRA"] + st * 0.01)
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.5 * kt + 0.4 * fl + 0.3 * pad + 0.35 * hum) * e
side = 0.22 * np.roll(kt + pad * cold * 0.6, 900) * e
music = stereo(mono, side)


# ---- SFX ----
def noise(t, dur, lo, hi, a, att=0.03, dec=6.0):
    x = M.band(M.rng.standard_normal(int(dur * SR)), lo, hi)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (att * SR)) * np.exp(-np.arange(n) / SR * dec)
    g(x / np.abs(x).max() * env, t, a)


def bed(a, b, amp, lo, hi):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), lo, hi)
    env = np.minimum(1, np.arange(n) / (0.4 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.4 * SR))
    g(x / np.abs(x).max() * env, a, amp)


g(M.lib("chime"), 0.05, 0.04)
g(M.lib("sparkle"), AT["s1:pemanas"], 0.05)
for s in ("s2", "s4", "s5", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.06)
for s in ("s3", "s6"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
for w in ("s1:dicetak", "s2:embun", "s2:es", "s2:spion", "s3:dingin", "s3:menempel", "s4:keramik", "s4:perak", "s4:sejajar",
          "s6:menguap", "s7:watt", "s7:lampu", "s7:Heinz", "s8:lembut", "s8:Episode"):
    g(M.lib("click-soft"), AT[w] - 0.03, 0.04)
bed(AT["s3:Uap"] - 0.3, K["s3e"], 0.012, 2000, 7000)  # vapour drift
noise(AT["s4:dicetak"] - 0.4, 1.4, 600, 3000, 0.035, att=0.2, dec=1.2)  # squeegee sweep
bed(AT["s4:dipanggang"] - 0.1, AT["s4:menyatu"] + 0.8, 0.03, 60, 500)  # kiln roar
g(M.lib("ping"), AT["s4:menyatu"], 0.04)
for j in range(4):
    g(M.lib("click-soft"), AT["s4:sejajar"] + j * 0.2, 0.04)
g(M.lib("click"), AT["s5:tombolnya"], 0.08)
g(M.lib("riser"), AT["s5:mengubah"] - 0.4, 0.035)
g(M.lib("impact-bass-1"), AT["s5:panas"], 0.045)
bed(AT["s6:menguap"] - 0.2, AT["s6:mencair"] + 1.2, 0.028, 3000, 9000)  # steam hiss
g(M.lib("chime"), AT["s6:jernih"], 0.05)
g(M.lib("pop"), AT["s6:sepuluh"], 0.05)
g(M.lib("pop"), AT["s7:Dayanya"], 0.05)
g(M.lib("pop"), AT["s7:paten"], 0.05)
noise(AT["s8:tergores"] - 0.1, 0.5, 2500, 8000, 0.05, att=0.01, dec=5)  # scratch
g(M.lib("glitch-1"), AT["s8:tergores"] + 0.3, 0.02)
noise(AT["s8:bersihkan"] - 0.1, 1.6, 300, 2500, 0.03, att=0.25, dec=1.0)  # cloth wipe
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
