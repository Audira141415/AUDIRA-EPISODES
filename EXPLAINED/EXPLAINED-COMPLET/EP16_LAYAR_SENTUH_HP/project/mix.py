"""EP16 sound: a circuit-board groove. Clean digital plucks in A minor at 112 BPM over a tight sub pulse, a glassy
FM bell on key words, and a soft data shimmer. The resistive scene gets a muffled press creak and a contact spark;
the grid scene gets a ticking row scan (one tick per row step, matching the visual 7 rows per second); finger touches
get a soft sine drop (capacitance falling); the 192 count rises as a fast arpeggio. SFX: whooshes on cuts, clicks on
panel lines. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1616)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 112
A3 = 220.0
hz = lambda st, base=A3: base * 2 ** (st / 12)


def fm(f, dur=1.4, a=1.0, idx=2.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t + idx * np.exp(-t * 5) * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t * 2.8)
    return x * np.minimum(1, t / 0.003) * a


def pluck(f, dur=0.35, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    sq = np.sign(np.sin(2 * np.pi * f * t)) * 0.3 + np.sin(2 * np.pi * f * t)
    return sq * np.exp(-t * 14) * np.minimum(1, t / 0.002) * a


bel, bass, arp, pad = M.mono(), M.mono(), M.mono(), M.mono()
prog = [0, -4, 3, -2]  # Am, F, C, G
i, t0 = 0, 0.05
while t0 < END + 1.0:
    root = prog[(i // 16) % 4]
    if i % 2 == 0:
        M.lay(bass, pluck(hz(root - 12), 0.3, 0.8 if i % 4 == 0 else 0.5), t0)
    M.lay(arp, pluck(hz(root + [0, 7, 12, 15, 12, 7, 3, 7][i % 8] + 12), 0.2, 0.28), t0)
    t0 += beat / 2
    i += 1
phr = {"s1": [0, 7, 12, 15], "s2": [12, 10, 7], "s3": [3, 7, 10, 15], "s4": [0, 3, 7, 10, 12], "s5": [12, 15, 19],
       "s6": [7, 12, 15, 19], "s7": [12, 15, 19, 24], "s8": [24, 19, 15, 12, 7]}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.1
    for j, st in enumerate(notes):
        M.lay(bel, fm(hz(st + 12), 1.2, 0.6), tt + j * beat * 0.5)
for w in ("s1:listrik", "s3:menghantarkan", "s4:jaring", "s5:kapasitor", "s6:mencatat", "s7:CERN", "s8:dicuri"):
    M.lay(bel, fm(hz(31), 1.6, 0.4, 3.0), AT[w])
pad += (0.35 * np.sin(2 * np.pi * hz(0) * T) + 0.3 * np.sin(2 * np.pi * hz(7) * T + np.sin(T * 0.3)) + 0.2 * np.sin(2 * np.pi * hz(15) * T)) * 0.5
# 192 count: a rising arpeggio from "dua" to "titik"
a0, a1 = AT["s7:dua"], AT["s7:titik"]
nstep = 24
for j in range(nstep):
    M.lay(arp, pluck(hz(12 + (j * 5) % 24), 0.18, 0.4), a0 + (a1 - a0) * j / nstep)
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.45 * bel + 0.5 * bass + 0.32 * arp + 0.3 * pad) * e
side = 0.22 * np.roll(bel + arp * 0.6 + pad * 0.4, 700) * e
music = stereo(mono, side)


# ---- SFX ----
def tick(t, a=0.03, f=2400):
    tt = np.arange(int(0.03 * SR)) / SR
    g(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 160), t, a)


def drop(t, a=0.05):
    tt = np.arange(int(0.35 * SR)) / SR
    g(np.sin(2 * np.pi * np.cumsum(900 * np.exp(-tt * 5)) / SR) * np.exp(-tt * 7), t, a)


g(M.lib("riser"), 0.0, 0.03)
g(M.lib("click-soft"), 1.2, 0.07)  # finger touches the phone in the hook
for s in ("s2", "s4", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
for s in ("s3", "s5", "s6"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
for w in ("s2:kapasitif", "s2:resistif", "s3:bening", "s3:indium", "s4:mendatar", "s4:tegak", "s5:kapasitor", "s5:denyut",
          "s6:turun", "s6:bersamaan", "s6:gagal", "s7:titik", "s7:tujuh", "s8:dicuri", "s8:Episode"):
    g(M.lib("click-soft"), AT[w] - 0.03, 0.045)
g(M.thump(0.15), AT["s2:ditekan"], 0.08)
g(M.lib("glitch-2"), AT["s2:bersentuhan"], 0.03)
g(M.lib("sparkle"), AT["s3:menghantarkan"], 0.035)
# row scan ticks: 7 per second from "denyut" until the fingers arrive in s6
tb = AT["s5:denyut"]
while tb < AT["s6:mendekat"]:
    tick(tb, 0.02)
    tb += 1 / 7
drop(AT["s6:turun"], 0.06)
g(M.lib("ping"), AT["s6:mencatat"], 0.045)
drop(AT["s6:bersamaan"], 0.05)
g(M.lib("error"), AT["s6:gagal"], 0.035)
g(M.lib("pop"), AT["s7:seratus"], 0.06)
g(M.lib("chime"), AT["s7:titik"], 0.04)
g(M.lib("pop"), AT["s7:CERN"], 0.05)
g(M.lib("click-soft"), K["s8"] + 1.0, 0.06)
g(M.lib("chime"), AT["s8:AUDIRA"], 0.035)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
