"""EP01 sound: turboprop drone over a smoky wind bed, a hissing cold layer when the ice sublimates, warm low pad that cools to a bright fifth when the lid weakens. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, rumble, swell

M = Mix(1501)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
air = norm(lowpass(rng.standard_normal(N), 520) - lowpass(rng.standard_normal(N), 90))
prop = np.sin(2 * np.pi * 96 * T + 2 * np.sin(2 * np.pi * 7 * T)) * .5 + .5 * np.sin(2 * np.pi * 48 * T)
hiss = norm(rng.standard_normal(N) - lowpass(rng.standard_normal(N), 3000))
e_prop = M.env([(0, .9), (S["s2"] - .5, .9), (S["s2"] + .8, 0), (S["s5"] - .2, 0), (S["s5"] + .4, .8), (S["s6"] + 1, .3), (S["s7"], 0), (DUR, 0)])
e_air = M.env([(0, .7), (S["s4"] - .1, .7), (S["s4"], .1), (S["s5"] - .1, .1), (S["s5"], .7), (S["s7"], 1), (END, .6), (DUR - .2, 0), (DUR, 0)])
e_hiss = M.env([(0, 0), (S["s4"], .25), (AT["s4:gas"], 1), (S["s5"], .2), (S["s6"], 0), (DUR, 0)])
warm = drone(T, 49.0)
cool = np.sin(2 * np.pi * 98 * 1.5 * T) + .5 * np.sin(2 * np.pi * 294.7 * T)
e_w = M.env([(0, .5), (S["s3"], .9), (AT["s6:mendingin"], .9), (AT["s6:naik"] + 1, .25), (S["s8"], .5), (END, .3), (DUR - .2, 0), (DUR, 0)])
e_c = M.env([(0, 0), (S["s4"], .2), (S["s5"], .3), (AT["s6:mendingin"], .8), (S["s7"] + 2, 1), (AT["s7:jam"], .4), (S["s8"], .3), (DUR, 0)])
mono = .05 * air * e_air + .045 * prop * e_prop + .05 * warm * e_w + .018 * cool * e_c + .03 * hiss * e_hiss
side = .02 * (np.roll(air, 7001) - air) * e_air + .008 * cool * e_c
music = stereo(mono, side) * 2.0
g(M.lib("whoosh-cinematic"), S["s2"] - .35, .08)
g(rumble(rng, 2.0, 70), S["s2"] + 1.5, .2)
g(M.thump(.5), AT["s2:50"], .2)
g(M.lib("click"), AT["s2:BMKG"], .07)
g(M.lib("click"), AT["s2:800"], .07)
g(M.lib("whoosh-cinematic"), S["s3"] - .35, .07)
g(M.lib("ping"), AT["s3:inversi"], .05)
g(M.thump(.45), AT["s3:hangat"], .16)
g(M.lib("impact-bass-1"), AT["s3:panci"], .1)
g(M.lib("whoosh-short"), S["s4"] - .2, .08)
g(M.lib("sparkle"), AT["s4:minus"], .05)
g(swell(rng, 2.5, 1500, 7000), AT["s4:gas"] - .4, .07)
g(M.lib("riser"), AT["s4:kilogram"] - 1, .04)
g(M.thump(.5), AT["s4:kilogram"] + .4, .14)
g(M.lib("whoosh-cinematic"), S["s5"] - .35, .08)
g(M.lib("click-soft"), AT["s5:menyerap"], .07)
g(swell(rng, 3.0, 2000, 8000), AT["s5:ditabur"], .05)
g(M.lib("whoosh-cinematic"), S["s6"] - .35, .07)
g(M.lib("riser"), AT["s6:naik"] - 1.2, .05)
g(swell(rng, 4.0, 60, 400), AT["s6:naik"], .25)
g(M.lib("chime"), AT["s6:menyebar"], .05)
g(M.lib("whoosh-cinematic"), S["s7"] - .35, .07)
g(M.lib("click"), AT["s7:pertama"], .07)
g(M.lib("glitch-1"), AT["s7:hipotesis"], .05)
g(M.lib("whoosh-cinematic"), S["s8"] - .35, .06)
g(rumble(rng, 2.6, 90), AT["s8:darat"] - .2, .2)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
