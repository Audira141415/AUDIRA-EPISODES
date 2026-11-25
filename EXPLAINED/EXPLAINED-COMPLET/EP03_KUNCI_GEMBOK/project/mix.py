"""EP03 sound: a precision clockwork bed. A tight escapement tick-tock at 100 BPM (bright tick, darker tock),
a low cello drone with slow bow vibrato in D minor, and a soft detuned synth pad that opens on the payoff.
SFX: metal clicks as each pin drops or sets, a subtle spring boing, key slides (filtered noise sweeps),
a heavy lock clunk on "Klik", wooden knocks for the Egyptian lock, a door lift whoosh and a cover scrape.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1848)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]

tick, cello, pad = M.mono(), M.mono(), M.mono()
beat = 60 / 100


def tk(f, a):
    x = M.band(M.burst(0.035, 140, 1), f, f * 3.2)
    return x * a


t0, i = 0.0, 0
while t0 < DUR:
    M.lay(tick, tk(3400 if i % 2 == 0 else 1900, 1.0 if i % 2 == 0 else 0.7), t0, 0.32)
    if i % 8 == 0:  # tiny gear ratchet every two bars
        for k in range(3):
            M.lay(tick, tk(5200, 0.5), t0 + beat * 0.5 + k * 0.045, 0.14)
    t0 += beat
    i += 1


def bowed(f, dur, a=0.5):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 4.8 * t) * np.minimum(1, t / 0.8)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = sum(np.sin(h * ph) / h ** 1.25 for h in range(1, 10))
    env = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.9)
    return x * env * a


# cello: one long note per scene, D minor walk
roots = {"s1": 73.42, "s2": 73.42, "s3": 87.31, "s4": 82.41, "s5": 77.78, "s6": 73.42, "s7": 65.41, "s8": 73.42}
sc = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"]
for j, s in enumerate(sc):
    a = K[s] - (0.1 if j else 0)
    b = K[sc[j + 1]] + 0.6 if j < 7 else END + 2.5
    M.lay(cello, bowed(roots[s], b - a, 0.5), max(0, a))
# pad: detuned saw chord, low-passed by smoothing; opens wide in s6 payoff and s8
def pad_chord(fs, dur):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * d * t) for f in fs for d in (0.997, 1.0, 1.004))
    x = np.convolve(x, np.ones(40) / 40, mode="same")
    return x * np.minimum(1, t / 1.5) * np.minimum(1, (dur - t) / 1.5)


M.lay(pad, pad_chord([146.83, 174.61, 220.0], K["s3"] - 0.2), 0.0, 0.12)
M.lay(pad, pad_chord([146.83, 220.0, 293.66, 349.23], K["s7"] + 1 - AT["s6:Semua"]), AT["s6:Semua"], 0.16)
M.lay(pad, pad_chord([130.81, 196.0, 261.63], K["s8"] - K["s7"]), K["s7"], 0.1)
M.lay(pad, pad_chord([146.83, 220.0, 293.66, 369.99], DUR - K["s8"]), K["s8"], 0.16)
e = M.env([(0, 0.9), (K["s5"], 0.9), (K["s5"] + 0.4, 0.7), (K["s6"], 0.75), (AT["s6:Klik"], 1.0), (END + 0.3, 1), (DUR - 0.6, 0.5), (DUR, 0)])
mono = (0.55 * tick + 0.6 * cello + 0.5 * pad) * e
side = 0.2 * np.roll(pad + 0.3 * tick, 900) * e
room = M.band(M.rng.standard_normal(N), 50, 300) * 0.012
music = stereo(mono + room, side)


# ---- SFX ----
def click(t, a=0.12, f=2600):
    g(M.band(M.burst(0.025, 180, 1), f, f * 3), t, a)
    g(M.note(f * 0.35, 0.03, "sine", 80), t, a * 0.5)


def boing(t, a=0.05):
    tt = np.arange(int(0.35 * SR)) / SR
    g(np.sin(2 * np.pi * (520 + 140 * np.sin(2 * np.pi * 9 * tt)) * tt) * np.exp(-tt * 11), t, a)


def slide(t, dur, a=0.08, lo=1200, hi=6000):
    x = M.band(M.rng.standard_normal(int(dur * SR)), lo, hi)
    x *= np.minimum(1, np.arange(len(x)) / (0.06 * SR)) * np.minimum(1, (len(x) - np.arange(len(x))) / (0.08 * SR))
    g(x / (np.abs(x).max() + 1e-9), t, a)


def knock(t, a=0.16):
    tt = np.arange(int(0.18 * SR)) / SR
    g(np.sin(2 * np.pi * 180 * tt) * np.exp(-tt * 28) + 0.3 * M.band(M.burst(0.18, 40, 3), 300, 1500), t, a)


PX = [-0.76, -0.38, 0, 0.38, 0.76]
g(M.lib("click"), 0.05, 0.1)
g(M.lib("sparkle"), AT["s1:kode"], 0.05)
g(M.lib("impact-bass-1"), AT["s1:kode"] + 0.2, 0.08)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.3, 0.06)
    click(K[s] - 0.12, 0.07, 3000)
g(M.lib("whoosh-cinematic"), K["s2"] - 0.2, 0.07)  # hero key flies away
g(M.lib("ping"), AT["s2:Linus"], 0.04)
g(M.lib("whoosh-cinematic"), K["s3"] - 0.05, 0.09)  # door lifts away
slide(AT["s3:silinder"] - 0.4, 1.1, 0.06, 400, 3000)  # cover scrape
g(M.thump(0.25), AT["s3:silinder"] + 0.6, 0.06)
g(M.lib("chime"), AT["s3:plug"], 0.04)
g(M.lib("riser"), AT["s3:berputar"] - 0.6, 0.04)
for k in range(5):
    click(AT["s4:deretan"] + 0.15 + k * 0.14, 0.05, 4200)
boing(AT["s4:didorong"] + 0.25, 0.05)
boing(AT["s4:didorong"] + 0.75, 0.04)
# blocked tries (s5)
for a in (AT["s5:tidak"], AT["s5:tetap"]):
    for k in range(2):
        g(M.thump(0.12), a + k * 0.38 + 0.15, 0.1)
        click(a + k * 0.38 + 0.15, 0.08, 1500)
g(M.lib("error"), AT["s5:tidak"] + 0.2, 0.05)
slide(AT["s5:Kalau"] + 0.05, AT["s5:salah"] + 0.2 - AT["s5:Kalau"], 0.07)
for k in range(5):
    click(AT["s5:Kalau"] + 0.2 + k * 0.2, 0.06, 2200)
g(M.lib("error"), AT["s5:tertahan"], 0.06)
slide(K["s5e"] - 0.15, 0.45, 0.05)
# right key: slide in, one pin click per pin as the key settles, then the clunk
ins0, ins1 = AT["s6:kunci"] - 0.1, AT["s6:ketinggian"] + 0.25
slide(ins0, ins1 - ins0, 0.06)
for k in range(9):
    click(ins0 + 0.25 + k * (ins1 - ins0 - 0.3) / 9, 0.045, 3000 + 150 * (k % 3))
for i in range(5):
    click(AT["s6:gerigi"] + i * 0.42 + 0.12, 0.09, 3600)
g(M.lib("chime"), AT["s6:garis"], 0.05)
g(M.lib("riser"), AT["s6:berputar"] - 0.8, 0.05)
g(M.thump(0.4), AT["s6:Klik"], 0.2)
click(AT["s6:Klik"], 0.2, 1800)
g(M.lib("impact-bass-1"), AT["s6:Klik"] + 0.02, 0.1)
# Egyptian wooden lock
slide(AT["s7:berupa"] - 0.2, 0.8, 0.05, 300, 2500)
knock(AT["s7:dengan"], 0.12)
for k in range(3):
    knock(AT["s7:baut"] + k * 0.07, 0.08)
slide(AT["s7:geser"] - 0.05, 0.6, 0.06, 200, 1800)
knock(AT["s7:geser"] + 0.55, 0.14)
g(M.lib("chime"), AT["s7:Linus"] + 0.4, 0.05)
g(M.lib("chime"), AT["s7:menyempurnakannya"], 0.05)
# s8 turns: clunk at each full turn
per = 3.6
tt = K["s8"] + 0.4 + per / 2
while tt < END:
    g(M.thump(0.2), tt, 0.08)
    click(tt, 0.08, 2000)
    tt += per
g(M.lib("ping"), AT["s8:pola"], 0.04)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
