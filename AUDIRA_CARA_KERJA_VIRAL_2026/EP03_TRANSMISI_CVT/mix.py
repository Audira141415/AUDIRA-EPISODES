"""EP03 sound: a scooter engine whose pitch follows the ratio programme, belt whir, mechanical clicks for each part, electronic blips for the YECVT chapter. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, metal

M = Mix(303)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
# engine pitch: idle in anatomy, revs up through the roller chapter, steady elsewhere
f = M.env([(0, 70), (S["s3"], 52), (S["s4"], 48), (AT["s4:satu"], 60), (S["s5"], 62), (AT["s5:mulus"], 105), (S["s6"], 80), (S["s7"], 85), (S["s8"], 70), (DUR, 60)])
ph = 2 * np.pi * np.cumsum(f) / SR
eng = np.sin(ph) + .5 * np.sin(2 * ph + .3) + .25 * np.sign(np.sin(ph * .5))
eng = lowpass(eng, 900)
whir = norm(lowpass(rng.standard_normal(N), 2500) - lowpass(rng.standard_normal(N), 600))
pad = drone(T, 65.4, ((1, 1), (1.5, .45), (2.0, .3)))
e_e = M.env([(0, .6), (S["s3"], .3), (S["s4"], .45), (S["s6"], .6), (END, .4), (DUR - .2, 0), (DUR, 0)])
e_p = M.env([(0, .5), (END, .5), (DUR - .2, 0), (DUR, 0)])
mono = .05 * eng * e_e + .025 * whir * e_e + .04 * pad * e_p
side = .012 * (np.roll(whir, 4001) - whir) * e_e + .01 * pad * e_p
music = stereo(mono, side) * 2.0
for k in ("s2:YECVT", "s2:D-CVT", "s3:depan", "s3:belakang", "s4:renggang", "s4:rapat"):
    g(M.lib("click"), AT[k], .08)
g(M.lib("whoosh-cinematic"), S["s2"] - .3, .07)
g(M.lib("whoosh-cinematic"), S["s3"] - .3, .07)
g(metal(rng, 1.2, 160, 4), AT["s3:kerucut"], .08)
g(M.thump(.4), AT["s3:Sabuk"], .14)
g(M.lib("whoosh-short"), S["s4"] - .2, .07)
g(M.thump(.5), AT["s4:satu"], .16)
g(M.lib("whoosh-cinematic"), S["s5"] - .3, .07)
for i in range(6):
    g(metal(rng, .3, 420 + 30 * i, 14), AT["s5:roller"] + i * .08, .05)
g(M.lib("riser"), AT["s5:mulus"] - 1.4, .05)
g(M.lib("whoosh-cinematic"), S["s6"] - .3, .07)
g(M.lib("glitch-1"), AT["s6:motor"], .05)
for i in range(8):
    g(M.tone([1320, 1980], .06), AT["s6:sensor"] + i * .11, .03)
for i in range(3):
    g(M.lib("ping"), AT["s6:tiga"] + i * .35, .05)
g(M.lib("whoosh-cinematic"), S["s7"] - .3, .07)
g(metal(rng, 1.5, 120, 3), AT["s7:gigi"], .09)
g(M.thump(.5), AT["s7:dibagi"], .16)
g(M.lib("sparkle"), AT["s7:persen"], .05)
g(M.lib("whoosh-cinematic"), S["s8"] - .3, .06)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
