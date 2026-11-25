"""EP11 sound: a cold avionics bay. Low turbine-like hum in D minor, a soft 100 BPM data pulse that thickens in the
recorder chapters, a paint shimmer on 'oranye', mechanical slides for the exploded module, a heavy impact, fire roar,
pressure creak, a splash into a muffled underwater bed, a stylised one-per-second sonar ping and lab clicks. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell, metal, rumble

M = Mix(1111)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
CEB, LAB = AT["s7:tercebur"], AT["s8:laboratorium"]

# bed: turbine hum + airy noise, muffled under water
hum = drone(T, 36.7, ((1, 1), (2.0, .4), (3.0, .18), (1.004, .6)))
whine = np.sin(2 * np.pi * (587.3 + 2 * np.sin(T * .3)) * T) * .08
air = norm(lowpass(rng.standard_normal(N), 1400) - lowpass(rng.standard_normal(N), 300))
sea = M.env([(0, 0), (CEB + .3, 0), (CEB + .8, 1), (LAB - .3, 1), (LAB + .6, 0), (DUR, 0)])
dry = 1 - sea
bed = .05 * hum * M.env([(0, .6), (S["s2"], .8), (S["s6"], 1), (END, .7), (DUR - .2, 0), (DUR, 0)])
bed += (.02 * air + .012 * whine) * dry
under = norm(lowpass(rng.standard_normal(N), 260)) * .06 * sea
# pad chords Dm - Bb - F - C, slow
chords = [(146.8, 174.6, 220.0), (116.5, 146.8, 174.6), (174.6, 220.0, 261.6), (130.8, 164.8, 196.0)]
pad = np.zeros(N)
seg = 4 * 60 / 100 * 2
for i in range(int(DUR / seg) + 1):
    a, b = int(i * seg * SR), min(N, int((i + 1) * seg * SR) + int(.6 * SR))
    if a >= N:
        break
    tt = np.arange(b - a) / SR
    fade = np.minimum(1, np.minimum(tt / .8, (b - a) / SR - tt) / .8).clip(0, 1)
    pad[a:b] += sum(np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * f * 2.003 * tt) for f in chords[i % 4]) * fade / 3
pad = lowpass(pad, 1100) * M.env([(0, .3), (S["s3"], .5), (S["s6"], .65), (CEB, .4), (LAB, .55), (END, .5), (DUR - .2, 0), (DUR, 0)])
# data pulse: filtered ticks at 100 BPM sixteenths, louder in s3-s4 and s8
pulse = np.zeros(N)
step = 60 / 100 / 4
k = 0
while k * step < END:
    tp = k * step
    acc = 1 if k % 4 == 0 else .45
    x = M.tone([1760 if k % 8 < 4 else 1318.5], .05, 70) * acc
    i = int(tp * SR)
    pulse[i:i + len(x)] += x[: N - i]
    k += 1
pulse *= M.env([(0, .25), (S["s3"], .7), (S["s5"], .35), (S["s6"], .2), (CEB, 0), (LAB, .6), (END, .4), (END + .5, 0), (DUR, 0)])
mono = bed + under + .04 * pad + .025 * pulse
side = .012 * (np.roll(air, 7001) - air) * dry + .02 * np.roll(pad, 1500) * .5
music = stereo(mono, side) * 1.9

# --- SFX ---
o = AT["s1:oranye"]
g(swell(rng, 1.4, 2000, 9000), o - .5, .06)
g(M.lib("sparkle"), o, .07)
g(M.thump(.5), .05, .1)
for sc in ("s2", "s3", "s4", "s6"):
    g(M.lib("whoosh-cinematic"), S[sc] - .35, .06)
g(M.lib("ping"), AT["s2:penyelam"], .035)
g(M.lib("ping"), AT["s2:Florida"], .035)
g(M.lib("click"), AT["s3:dua"], .07)
g(metal(rng, .7, 260, 5), AT["s3:dua"] + .2, .04)
g(M.lib("typing"), AT["s3:parameter"], .03)
g(M.lib("error"), AT["s3:alarm"], .03)
for i in range(10):
    g(M.lib("click-soft"), AT["s4:Rekamannya"] + i * .55, .03)
g(M.lib("glitch-1"), AT["s4:ditimpa"], .05)
g(M.lib("whoosh-cinematic"), AT["s4:Keduanya"], .07)
g(M.lib("riser"), AT["s4:ekor"] - .3, .04)
# exploded module: slides out, then each layer clicks back on its word
g(M.lib("whoosh-short"), S["s5"] - .1, .08)
g(metal(rng, 1.2, 140, 3), S["s5"] + .2, .06)
for w in ("s5:blok", "s5:insulasi", "s5:cangkang"):
    g(metal(rng, .5, 300, 7), AT[w], .05)
    g(M.lib("click"), AT[w] + .1, .06)
g(M.thump(.5), AT["s5:Inilah"] + .3, .14)
# torture rig
hit = AT["s6:benturan"] + .55
g(M.lib("impact-bass-1"), hit, .2)
g(M.thump(.6), hit, .25)
g(M.burst(.25, 18, 2), hit, .12)
fire = norm(lowpass(rng.standard_normal(int(3.2 * SR)), 500)) * np.sin(np.pi * np.arange(int(3.2 * SR)) / (3.2 * SR)) ** .6
g(fire, AT["s6:api"] - .2, .14)
g(M.lib("whoosh"), AT["s6:api"] - .2, .06)
g(rumble(rng, 2.8, 60, .5), AT["s6:tekanan"], .12)
g(metal(rng, 2.0, 70, 1.2), AT["s6:tekanan"] + .8, .05)
g(M.lib("riser"), AT["s6:Warnanya"] - .2, .03)
# splash, sonar pings once per second, landing
g(M.burst(.5, 8, 3), CEB, .16)
g(swell(rng, 2.5, 100, 1200), CEB, .16)
g(M.thump(.5), CEB + 2.3, .1)
tp = AT["s7:Sekali"]
while tp < LAB + .5:
    g(M.tone([1850, 3700], 1.1, 5) * .7 + M.tone([925], 1.1, 7) * .3, tp, .045)
    tp += 1.0
# lab
g(M.lib("glitch-2"), LAB - .3, .05)
g(metal(rng, .8, 200, 4), AT["s8:dibaca"] - .3, .05)
g(M.lib("typing"), AT["s8:dibaca"] + .6, .04)
g(M.lib("chime"), AT["s8:disusun"], .05)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
