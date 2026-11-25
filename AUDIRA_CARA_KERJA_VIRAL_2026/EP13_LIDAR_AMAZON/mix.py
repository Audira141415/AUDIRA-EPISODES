"""EP13 sound: dawn rainforest bed (insect shimmer, sparse bird chirps), a warm low pad in D dorian, a scanner tick that follows the laser,
glassy return pings for the three echoes, a rising point-cloud shimmer, and a deep swell when the bare earth appears. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell, metal

M = Mix(1313)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}

# forest bed: band-limited insect shimmer with slow amplitude flutter, quieter in the void chapters
ins = norm(M.band(rng.standard_normal(N), 4200, 7800)) * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * T) ** 2)
air = norm(lowpass(rng.standard_normal(N), 700) - lowpass(rng.standard_normal(N), 120))
forest = M.env([(0, 1), (AT["s1:laser"], 1), (AT["s1:lingkaran"], .35), (S["s2"], .7), (S["s4"], .25), (S["s6"], .7), (S["s7"], .15), (S["s8"], .9), (DUR, .6)])
pad = drone(T, 73.4, ((1, 1), (1.5, .5), (2.0, .32), (2.38, .14), (3.0, .1)))
low = drone(T, 36.7, ((1, 1), (2, .3)))
e_p = M.env([(0, .55), (S["s3"], .7), (S["s5"], .85), (S["s7"], 1.0), (END, .6), (DUR - .2, 0), (DUR, 0)])
mono = .012 * ins * forest + .035 * air + .05 * pad * e_p + .03 * low * e_p
side = .01 * (np.roll(ins, 3001) - ins) * forest + .012 * pad * e_p
music = stereo(mono, side) * 2.0

# birds: short chirp sweeps, only in the daylight chapters
def chirp(f0, f1, d):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * (f0 * t + (f1 - f0) * t * t / (2 * d))) * np.sin(np.pi * t / d) ** 2
for a, b in ((0, S["s1"] + 3), (S["s2"], S["s3"]), (S["s8"], END)):
    tb = a + .4
    while tb < b:
        f = rng.uniform(2200, 3600)
        for k in range(int(rng.integers(2, 4))):
            g(chirp(f, f * rng.uniform(1.15, 1.4), .07), tb + k * .1, .02)
        tb += 1.2 + rng.uniform(0, 2.2)

# sparse pad notes (D dorian, high, glassy)
notes = [293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3, 587.3]
tp = 1.0
while tp < END:
    f = notes[int(rng.integers(len(notes)))]
    g(M.tone([f, f * 2.002, f * 3.01], 2.2, 2.4), tp, .018)
    tp += 1.1 + rng.uniform(0, 1.8)

def scan(a, b, gain, rate=24):
    t = a
    while t < b:
        g(M.tone([3100, 4650], .012, 200), t, gain)
        t += 1 / rate

# s1 hook: the sweep
g(M.lib("riser"), AT["s1:laser"] - 1.6, .07)
scan(.8, AT["s1:lingkaran"] + .6, .012)
g(swell(rng, 2.5, 60, 400), AT["s1:lingkaran"] - .3, .14)
g(M.lib("sparkle"), AT["s1:lingkaran"], .07)
# s2
g(M.lib("whoosh-cinematic"), S["s2"] - .3, .07)
g(M.lib("click-soft"), AT["s2:Acre"], .06)
for i in range(14):
    g(M.lib("pop"), AT["s2:432"] + i * .1, .025)
g(M.lib("chime"), AT["s2:36"], .05)
# s3 aircraft
g(M.lib("whoosh-cinematic"), S["s3"] - .3, .07)
eng = drone(np.arange(int((S["s4"] - S["s3"]) * SR)) / SR, 88, ((1, 1), (2, .5), (3.03, .25)))
eng *= np.minimum(1, np.minimum(np.arange(len(eng)) / SR / 1.2, (len(eng) / SR - np.arange(len(eng)) / SR) / 1.0))
g(eng, S["s3"], .045)
scan(AT["s3:terbang"], S["s4"] + .4, .01)
scan(AT["s3:juta"], AT["s3:juta"] + 2.0, .014, 48)
# s4 echoes
g(M.lib("whoosh-short"), S["s4"] - .2, .06)
for k, f in (("s4:puncak", 1760), ("s4:ranting", 1320), ("s4:tanah", 880)):
    g(M.tone([f, f * 1.5], .9, 5), AT[k], .07)
    g(M.tone([f, f * 1.5], .9, 5), AT[k] + .32, .025)
g(M.lib("ping"), AT["s4:Waktu"], .05)
# s5 GNSS / IMU / classification
g(M.lib("whoosh-cinematic"), S["s5"] - .3, .07)
for i in range(6):
    g(M.tone([2400], .05, 30), AT["s5:GNSS"] + .5 + i * .22, .03)
g(metal(rng, .8, 260, 5), AT["s5:IMU"], .04)
g(swell(rng, 3.0, 2500, 9000), AT["s5:pantulan"], .03)
g(M.lib("click"), AT["s5:31"], .06)
g(M.lib("glitch-1"), AT["s5:pohon"], .035)
g(swell(rng, 2.0, 1500, 7000), AT["s5:pohon"], .05)
# s6 satellite
g(M.lib("whoosh-cinematic"), S["s6"] - .3, .07)
g(M.lib("typing"), AT["s6:atap"], .025)
scan(AT["s6:Laser"], AT["s6:tanah"], .009, 12)
g(M.lib("error"), AT["s6:terlewat"] - .5, .03)
# s7 bare earth
g(M.lib("impact-bass-1"), S["s7"], .09)
g(swell(rng, 4.0, 50, 300), AT["s7:matahari"] - .5, .12)
g(M.lib("chime"), AT["s7:lingkaran"], .05)
g(M.lib("chime"), AT["s7:persegi"], .04)
g(M.lib("riser"), AT["s7:Totalnya"] - .8, .05)
for i in range(20):
    g(M.tone([1200 + 60 * i], .04, 40), AT["s7:Totalnya"] + .2 + i * .2, .012)
# s8 dawn
g(M.lib("whoosh-cinematic"), S["s8"] - .3, .06)
g(swell(rng, 4.5, 80, 500), S["s8"] + .2, .08)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
