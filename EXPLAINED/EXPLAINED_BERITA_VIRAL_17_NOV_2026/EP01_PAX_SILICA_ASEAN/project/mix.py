"""EP01 PAX SILICA ASEAN sound: a tense geopolitical war room. Low synth pads in E minor at 88 BPM
(Em - C - Am - B), digital pluck arpeggios, a pulsing sub bass, metallic ticks. SFX: wafer spin hum,
monument rise thuds, pillar clicks, crystal chime, tension riser for the two-bloc reveal.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2611)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
A = lambda k: AT[k]

pluck, bass, tick, pad = M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 88
E3 = 164.81
chords = [[0, 3, 7, 12], [-4, 0, 3, 8], [-7, -4, 0, 3], [-1, 3, 7, 11]]  # Em C Am B
pat = [0, 2, 1, 3, 2, 0]
t0, i = 0.0, 0
while t0 < DUR:
    bar = (i // 8) % 4
    ch = chords[bar]
    if i % 8 in (0, 3, 5):
        st = ch[pat[(i // 2) % 6]]
        n = M.note(E3 * 2 * 2 ** (st / 12), beat * 1.8, "sine", 1.5, 0.003)
        n = n * (1 + 0.2 * np.sin(2 * np.pi * 6.0 * np.arange(len(n)) / SR))
        hi = M.note(E3 * 4 * 2 ** (st / 12), beat * 0.5, "tri", 8, 0.002)
        n[: len(hi)] += 0.2 * hi
        M.lay(pluck, n * (0.75 if i % 8 else 0.9), t0, 1)
    if i % 8 == 0:
        M.lay(bass, M.note(E3 / 2 * 2 ** (ch[0] / 12), beat * 3.5, "sine", 0.4, 0.04), t0, 1)
        for st in ch[:3]:
            M.lay(pad, M.note(E3 * 2 ** (st / 12), beat * 4.0, "tri", 0.2, 0.7), t0, 0.16)
    if i % 2 == 1:
        M.lay(tick, M.band(M.burst(0.025, 100, 1), 5000, 12000), t0, 0.04 if i % 4 == 3 else 0.025)
    t0 += beat / 2
    i += 1

e = M.env([(0, 0.65), (K["s1"] + 3, 1), (K["s5"] - 0.3, 1), (K["s5"] + 0.5, 0.75), (K["s6"], 0.6), (K["s7"] - 0.4, 0.6), (K["s7"] + 0.8, 1), (END, 1), (DUR - 0.8, 0.5), (DUR, 0)])
# tension drone under s5-s6 (two-bloc reveal)
dr = np.zeros(N)
a5, b7 = int(K["s5"] * SR), int(K["s7"] * SR)
tt = np.arange(b7 - a5) / SR
dr[a5:b7] = (np.sin(2 * np.pi * 82.4 * tt) + 0.4 * np.sin(2 * np.pi * 123.5 * tt + 0.4 * np.sin(2 * np.pi * 0.15 * tt))) * np.minimum(1, tt / 1.5) * np.minimum(1, (tt[-1] - tt) / 1.2)
mono = (0.5 * pluck + 0.65 * bass + 0.4 * tick + 0.4 * pad) * e + 0.3 * dr
side = 0.15 * np.roll(pluck + pad, 650) * e
room = M.band(M.rng.standard_normal(N), 50, 450) * 0.006
music = stereo(mono + room, side)
# resolve: E major lift at close
for k, st in enumerate([0, 4, 7, 12, 16]):
    M.lay(music[:, 0], M.note(E3 * 2 * 2 ** (st / 12), 2.2, "sine", 0.8, 0.005) * 0.22, K["s8"] + 0.3 + k * 0.16, 1)
    M.lay(music[:, 1], M.note(E3 * 2 * 2 ** (st / 12), 2.2, "sine", 0.8, 0.005) * 0.22, K["s8"] + 0.32 + k * 0.16, 1)


# ---- SFX ----
# wafer hum at start
hum = M.note(220, 4.0, "sine", 0.3, 1.0) * 0.12
M.lay(music[:, 0], hum, 0.2, 1)
M.lay(music[:, 1], hum, 0.22, 1)

# monument rise thuds
for s, tt in [("s2", 0.5), ("s5", 0.5)]:
    thud = M.band(M.burst(0.08, 400, 1), 40, 300) * 1.2
    M.lay(music[:, 0], thud, K[s] + tt, 1)
    M.lay(music[:, 1], thud, K[s] + tt + 0.01, 1)

# crystal chime at s3
chime = M.note(E3 * 4, 1.5, "sine", 3.0, 0.004) * 0.3
M.lay(music[:, 0], chime, K["s3"] + 0.3, 1)
M.lay(music[:, 1], chime, K["s3"] + 0.32, 1)

# pillar clicks at s4
for k in range(5):
    cl = M.band(M.burst(0.015, 60, 1), 3000, 10000) * 0.5
    M.lay(music[:, 0], cl, K["s4"] + 0.8 + k * 0.2, 1)
    M.lay(music[:, 1], cl, K["s4"] + 0.82 + k * 0.2, 1)

# riser into s7
riser_len = int(2.5 * SR)
riser_t = np.arange(riser_len) / SR
riser = np.sin(2 * np.pi * (200 + 600 * riser_t / riser_t[-1]) * riser_t) * riser_t / riser_t[-1] * 0.15
M.lay(music[:, 0], riser, K["s7"] - 2.5, 1)
M.lay(music[:, 1], riser, K["s7"] - 2.48, 1)

# impact at s7
imp = M.band(M.burst(0.12, 600, 1), 30, 400) * 1.5
M.lay(music[:, 0], imp, K["s7"] + 0.1, 1)
M.lay(music[:, 1], imp, K["s7"] + 0.12, 1)

M.finish(music)
