"""EP02 sound: glass and fire. A slow glass-harmonica pad in E Lydian (sine partials with a soft bowed swell), crystalline
FM-bell arpeggios at 84 BPM, a warm sub pulse, and a furnace roar + crackle bed under the melting and the tin bath.
SFX: glass tings on the hoppers, tweel clunk, roller ticks, cutter score + ting on every cut sheet, a bright chime on 7 mm.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1959)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
E3 = 164.81
beat = 60 / 84
PER = 3.2  # seconds per cut sheet, same as world3d.js


def fm_bell(f, dur, idx=2.2, dec=3.2):
    t = np.arange(int(dur * SR)) / SR
    mod = idx * np.exp(-t * dec * 1.4) * np.sin(2 * np.pi * f * 3.5 * t)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * dec) * np.minimum(1, t / 0.003)


def harmonica(f, dur):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3.01 * f * t)
    swell = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.4)
    return x * swell * (1 + 0.08 * np.sin(2 * np.pi * 0.35 * t))


# ---- pad: E Lydian chords, one per 4 bars ----
pad, arp, sub = M.mono(), M.mono(), M.mono()
chords = [[0, 4, 7, 11], [2, 6, 9, 14], [-3, 4, 7, 11], [6, 9, 13, 16]]  # Emaj7, F#add9-ish, C#m7, A#dim colour (Lydian #4)
bar = 4 * beat
t0, c = 0.0, 0
while t0 < DUR:
    for st in chords[c % 4]:
        M.lay(pad, harmonica(E3 * 2 ** (st / 12), bar * 4 + 1.2), t0, 0.18)
    t0 += bar * 4
    c += 1
# ---- arpeggio: glassy bells, sparse in s1-s2, denser from s3, rest in s6 first half ----
t0, i = 0.0, 0
pattern = [0, 7, 11, 14, 18, 14, 11, 7]
while t0 < END + 1.5:
    dense = K["s3"] < t0 < K["s6"] or t0 > K["s7"]
    if dense or i % 2 == 0:
        st = pattern[i % 8] + chords[int(t0 / (bar * 4)) % 4][0]
        M.lay(arp, fm_bell(E3 * 4 * 2 ** (st / 12), 1.1, 1.8, 3.5), t0, 0.22 if dense else 0.16)
    t0 += beat / 2
    i += 1
# ---- sub pulse from s3 on (the line is running) ----
t0 = K["s3"]
while t0 < END:
    M.lay(sub, M.note(E3 / 4, beat * 0.9, "sine", 3.0, 0.02), t0, 0.5)
    t0 += beat * 2
# ---- furnace roar + crackle bed (s3 'tungku' .. s4 end) ----
roar = M.band(M.rng.standard_normal(N), 40, 260)
roar *= M.env([(0, 0), (AT["s3:tungku"] - 0.5, 0), (AT["s3:tungku"] + 0.8, 0.09), (AT["s3:meleleh"] + 1, 0.12), (K["s5"], 0.06), (K["s6"], 0.0), (DUR, 0)])
crack = np.zeros(N)
rng = np.random.default_rng(7)
for tt in np.arange(AT["s3:tungku"], K["s5"], 0.09):
    if rng.random() < 0.35:
        k = int((tt + rng.random() * 0.08) * SR)
        b = M.band(M.burst(0.02, 300, 1), 2000, 9000)[:N - k]
        crack[k:k + len(b)] += b * 0.05 * rng.random()
e = M.env([(0, 0.7), (K["s2"], 0.9), (K["s3"], 1), (K["s6"], 0.8), (K["s7"], 1), (END + 0.3, 1), (DUR - 0.6, 0.5), (DUR, 0)])
mono = (0.8 * pad + 0.55 * arp + 0.6 * sub) * e + roar + crack
side = 0.25 * np.roll(arp + pad * 0.4, 900) * e
music = stereo(mono, side)


# ---- SFX ----
def ting(t, f=2637, a=0.07):
    g(fm_bell(f, 0.9, 1.2, 5), t, a)
    g(fm_bell(f * 1.5, 0.6, 0.8, 7), t, a * 0.5)


def tick(t, a=0.08):
    g(M.band(M.burst(0.015, 300, 1), 2000, 9000), t, a)


g(M.lib("sparkle"), 0.05, 0.06)
ting(AT["s1:mengapung"], 1975, 0.06)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.3, 0.07)
g(M.lib("whoosh-cinematic"), K["s3"] - 0.4, 0.06)
g(M.lib("click-soft"), AT["s2:1952"], 0.08)
g(M.lib("ping"), AT["s2:diumumkan"], 0.05)
for i, w in enumerate(["s3:Pasir", "s3:soda", "s3:dolomit", "s3:batu", "s3:sodium", "s3:pecahan"]):
    ting(AT[w], 1760 * 2 ** ([0, 2, 4, 7, 9, 12][i] / 12), 0.05)
g(M.thump(0.45), AT["s3:tungku"], 0.12)
g(M.lib("riser"), AT["s3:1.500"] - 1.0, 0.05)
g(M.thump(0.3), AT["s4:dialirkan"], 0.12)  # tweel clunk
tick(AT["s4:dialirkan"], 0.1)
pour = M.band(M.rng.standard_normal(int(2.2 * SR)), 300, 2500) * np.minimum(1, np.arange(int(2.2 * SR)) / (0.3 * SR)) * np.exp(-np.arange(int(2.2 * SR)) / SR * 1.2)
g(pour, AT["s4:dialirkan"] + 0.1, 0.05)
g(M.lib("sparkle"), M.word("s4", "meratakan"), 0.05)
hiss = M.band(M.rng.standard_normal(int(2.5 * SR)), 3000, 10000) * np.sin(np.linspace(0, np.pi, int(2.5 * SR)))
g(hiss, AT["s4:Selimut"], 0.03)
for k in range(6):
    tick(AT["s5:Rol"] + 0.2 + k * 0.28, 0.06)
g(M.lib("chime"), AT["s5:600"], 0.05)
g(M.lib("whoosh"), AT["s5:terowongan"], 0.05)
# cutter: one score + ting per sheet (cut when the world's cycle reaches 0.9), from "dipotong" through s6
n = int(np.ceil(AT["s5:dipotong"] / PER))
while (n + 0.9) * PER < K["s7"]:
    tc = (n + 0.9) * PER
    if tc > AT["s5:dipotong"] - 0.3:
        g(M.band(M.burst(0.12, 25, 1), 4000, 11000), tc - 0.1, 0.03)
        ting(tc, 3136, 0.035)
    n += 1
g(M.lib("pop"), AT["s6:rapat"], 0.06)
g(M.lib("click-soft"), AT["s6:menempel"], 0.07)
g(M.lib("ping"), AT["s6:mendidih"], 0.05)
g(M.lib("sparkle"), AT["s6:Hasilnya"], 0.06)
g(M.lib("riser"), K["s7"] - 1.4, 0.05)
ting(AT["s7:7"], 2637, 0.08)
g(M.lib("chime"), AT["s7:milimeter"], 0.06)
g(M.lib("impact-bass-1"), AT["s7:24"], 0.07)
g(M.lib("whoosh-cinematic"), AT["s8:jendela"] - 0.3, 0.06)
ting(AT["s8:Ikuti"], 1975, 0.06)
g(M.lib("sparkle"), OUT - 0.3, 0.07)
g(M.thump(), OUT, 0.13)
M.finish(music)
