"""EP04 sound: a dark sub pad, sonar-like pings that follow the wavefronts, a 2.5 kHz tone kept quiet and brief (the warning tone is described, never reproduced loudly), ringing ear tone in the case chapter. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone

M = Mix(404)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
pad = drone(T, 55.0, ((1, 1), (1.498, .5), (2.0, .35), (3.01, .12)))
air = norm(lowpass(rng.standard_normal(N), 400))
e_p = M.env([(0, .6), (S["s5"], .8), (S["s7"], .5), (END, .5), (DUR - .2, 0), (DUR, 0)])
mono = .05 * pad * e_p + .03 * air
side = .012 * (np.roll(air, 5001) - air) + .01 * pad * e_p
music = stereo(mono, side) * 2.0
for i in range(5):
    g(M.tone([880], .5, 6), .8 + i * 1.1, .04)
g(M.tone([2500], .35), AT["s1:sampai"], .012)
g(M.lib("impact-bass-1"), AT["s1:sampai"] + .4, .12)
g(M.lib("whoosh-cinematic"), S["s2"] - .3, .07)
g(M.lib("glitch-1"), AT["s2:LRAD"], .05)
g(M.tone([2500, 3100], .3), AT["s2:nada"], .01)
g(M.lib("whoosh-cinematic"), S["s3"] - .3, .07)
g(M.lib("ping"), AT["s3:ukuran"], .05)
g(M.lib("riser"), AT["s3:lebar"] - .8, .04)
g(M.thump(.5), AT["s3:gelombang"], .14)
g(M.lib("whoosh-cinematic"), S["s4"] - .3, .07)
g(M.tone([660, 1320], .8, 3), AT["s4:menguatkan"], .04)
g(M.tone([660, 661.5], .8, 3), AT["s4:meredam"], .03)
g(M.lib("click"), AT["s4:derajat"], .08)
g(M.lib("whoosh-cinematic"), S["s5"] - .3, .07)
for k, v in (("s5:sepuluh", .05), ("s5:sakit", .06), ("s5:meter", .08)):
    g(M.lib("click"), AT[k], v)
g(M.lib("impact-bass-1"), AT["s5:meter"] + .2, .1)
g(M.lib("whoosh-cinematic"), S["s6"] - .3, .07)
for i in range(6):
    g(M.tone([1200], .12, 10), AT["s6:melemah"] + i * .35, .05 * (0.5 ** (i * .5)))
g(M.lib("whoosh-cinematic"), S["s7"] - .3, .07)
ring = M.tone([4000], 3.0) * np.exp(-np.arange(int(3.0 * SR)) / SR * 1.2)
g(ring, AT["s7:permanen"], .006)
g(M.lib("click"), AT["s7:dolar"], .08)
g(M.lib("whoosh-cinematic"), S["s8"] - .3, .06)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
