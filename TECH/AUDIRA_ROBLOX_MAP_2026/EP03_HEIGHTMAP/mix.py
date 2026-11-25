"""EP03 sound: a cold survey drone (low fifths with slow beating), sonar pings on a 4-second sweep, soft data ticks,
laser sweeps as band-passed noise glides, voxel snap rattles and a rising swell when the island lifts. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(3303)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
K = {s["id"]: s["start"] for s in M.TL["scenes"]}
KE = {s["id"]: s["end"] for s in M.TL["scenes"]}

# drone bed: A1 + E2 + A2 with slow detune beating, plus a filtered air layer
lfo = .5 + .5 * np.sin(2 * np.pi * T / 11)
drone = (np.sin(2 * np.pi * 55 * T) * .6 + np.sin(2 * np.pi * 82.41 * T + .3 * np.sin(2 * np.pi * .07 * T)) * .35
         + np.sin(2 * np.pi * 110.4 * T) * .22 * lfo + np.sin(2 * np.pi * 164.8 * T) * .08 * (1 - lfo))
air = M.band(M.rng.standard_normal(N), 300, 1400) * .05 * (.6 + .4 * lfo)
# sonar pings every 4 s, a glassy sine with a long tail
ping = M.mono()
tp = 0.8
while tp < END + 1:
    M.lay(ping, M.note(1318.5, 1.6, "sine", 2.2, .003) + .4 * M.note(1975.5, 1.6, "sine", 3.5, .003), tp, .22)
    tp += 4.0
# data ticks: quiet 16ths at 120 BPM from s2 on, with accents
tick = M.mono()
tt, i = K["s2"], 0
while tt < END:
    a = .05 if i % 4 == 0 else .022
    M.lay(tick, M.band(M.burst(.02, 160, 1), 4000, 12000), tt, a)
    tt += .125; i += 1
# chord pad shifts by section
pad = M.mono()
for t0, t1, fr in [(0, K["s4"], [220, 261.6, 329.6]), (K["s4"], K["s6"], [196, 246.9, 293.7]), (K["s6"], K["s8"], [174.6, 220, 261.6]), (K["s8"], DUR, [220, 277.2, 329.6])]:
    seg = M.tone(fr, t1 - t0)
    seg = seg * np.minimum(1, np.minimum(np.arange(len(seg)) / SR / 1.5, (len(seg) / SR - np.arange(len(seg)) / SR) / 1.5))
    M.lay(pad, seg, t0, .16)
e = M.env([(0, .8), (1.4, .6), (5.2, 1), (K["s2"], .85), (K["s7"], 1), (END + .4, 1), (DUR, .15)])
te = M.env([(0, 0), (K["s2"], 1), (END, 1), (END + .5, 0), (DUR, 0)])
music = stereo(.55 * drone * e + air * e + .5 * pad * e + .3 * ping * e + tick * te, .25 * np.roll(ping, 900) * e + .4 * np.roll(air, 300) * e)


def sweep(t, dur, f0, f1, a):
    """Laser pass: noise through a gliding band, frame by frame."""
    n = int(dur * SR)
    x = M.rng.standard_normal(n)
    out = np.zeros(n)
    blk = 2048
    for s in range(0, n, blk):
        u = s / n
        fc = f0 * (f1 / f0) ** u
        seg = x[s:s + blk]
        out[s:s + len(seg)] = M.band(np.pad(seg, (0, blk - len(seg))), fc * .8, fc * 1.25)[:len(seg)]
    env = np.sin(np.pi * np.arange(n) / n) ** .7
    g(out * env, t, a)


def tickrun(t, n, span, a=.05, f=2600):
    for k in range(n):
        g(M.note(f + 200 * (k % 3), .025, "sine", 80), t + span * k / n, a)


def snaps(t, n, span, a=.045):
    for k in range(n):
        d = M.band(M.burst(.03, 90, 1), 1500, 8000)
        g(d, t + span * k / n + M.rng.random() * .02, a)


# s1: the image lifts, a swell rises with the laser front
g(M.lib("riser"), .9, .22)
sweep(1.5, 3.6, 300, 4200, .35)
swell = M.tone([110, 165, 220, 330], 4.2)
swell *= np.linspace(0, 1, len(swell)) ** 2
g(swell, 1.2, .2)
g(M.thump(), 5.0, .3)
g(M.lib("impact-bass-1"), AT["s1:empat"], .2)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - .15, .13)
for w in ("s2:Gunung", "s2:lembah", "s2:danau"):
    g(M.lib("ping"), AT[w], .1)
snaps(AT["s2:voxel"], 40, 1.4)
g(M.lib("click"), AT["s2:voxel"], .12)
for w in ("s2:empat", "s2:empat#2", "s2:empat#3"):
    tickrun(AT[w], 3, .12, .06)
tickrun(AT["s3:Dari"], 22, .8, .03)
for w in ("s3:rumput", "s3:pasir", "s3:salju", "s3:es", "s3:batu", "s3:lumpur", "s3:lava", "s3:air"):
    g(M.lib("click-soft"), AT[w], .16)
    g(M.note(1760, .08, "sine", 30), AT[w], .05)
snaps(AT["s3:dicat"], 24, 1.0, .03)
g(M.lib("whoosh"), AT["s4:heightmap"] - .3, .14)
sweep(AT["s4:Area"] - .2, KE["s4"] - AT["s4:Area"], 500, 3000, .22)
g(M.lib("chime"), AT["s4:terang"], .1)
g(M.note(98, .8, "sine", 3), AT["s4:gelap"], .25)
g(M.lib("sparkle"), AT["s5:colormap"], .12)
sweep(AT["s5:colormap"] + .5, 3.0, 2500, 400, .2)
g(M.lib("whoosh-cinematic"), AT["s5:menentukan#2"], .14)
g(M.lib("ping"), AT["s6:piksel"], .12)
g(M.lib("impact-bass-1"), AT["s6:empat#2"], .16)
for w in ("s7:empat", "s7:dikali", "s7:Dengan"):
    g(M.lib("click"), AT[w], .1)
tickrun(AT["s7:belas"], 14, 1.4, .035)
g(M.thump(), AT["s7:belas"] + 1.4, .22)
g(M.lib("impact-bass-1"), AT["s7:koma"], .2)
g(M.lib("riser"), K["s8"] - 1.2, .12)
snaps(K["s8"] + .4, 30, 1.2, .035)
g(M.lib("sparkle"), AT["s8:Kamu"] - .3, .12)
g(M.lib("chime"), OUT - .3, .12)
g(M.thump(), OUT, .2)
M.finish(music)
