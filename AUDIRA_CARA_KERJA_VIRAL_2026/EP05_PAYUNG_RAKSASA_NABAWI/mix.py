"""EP05 sound: open-air courtyard bed, soft oud-like plucked drone in a hijaz colour, a long mechanical hydraulic sweep when the umbrellas open, fabric snaps as the membrane goes taut, mist hiss and an evening pad. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell, metal

M = Mix(250)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
air = norm(lowpass(rng.standard_normal(N), 900) - lowpass(rng.standard_normal(N), 200))
pad = drone(T, 73.4, ((1, 1), (1.5, .45), (2.0, .3), (1.06, .12)))
e_p = M.env([(0, .5), (S["s3"], .7), (S["s7"], .8), (END, .5), (DUR - .2, 0), (DUR, 0)])
mono = .04 * air + .045 * pad * e_p
side = .015 * (np.roll(air, 6001) - air) + .012 * pad * e_p
music = stereo(mono, side) * 2.0
# plucked notes on a hijaz-like set, sparse
notes = [146.8, 155.6, 185.0, 196.0, 220.0, 233.1, 277.2, 293.7]
tp = .6
while tp < END:
    f = notes[int(rng.integers(len(notes)))]
    g(M.tone([f, f * 2.003], 1.4, 3.5), tp, .03)
    tp += .9 + rng.uniform(0, 1.6)
def opening(at, gain):
    g(swell(rng, 3.0, 80, 600), at - .2, gain)
    g(metal(rng, 2.5, 90, 1.5), at, gain * .5)
opening(AT["s1:mekar"] - .4, .18)
g(M.lib("whoosh-cinematic"), S["s2"] - .3, .06)
g(M.lib("click"), AT["s2:meter"], .07)
g(M.lib("whoosh-cinematic"), S["s3"] - .3, .06)
g(M.lib("ping"), AT["s3:mozaik"], .04)
opening(AT["s4:perintah"], .16)
for k in ("s4:diagonal", "s4:tengah", "s4:pendukung"):
    g(metal(rng, .6, 220, 6), AT[k], .05)
    g(M.lib("click-soft"), AT[k], .07)
g(M.thump(.4), AT["s4:kelopak"], .12)
g(M.lib("whoosh-cinematic"), S["s5"] - .3, .06)
g(M.burst(.12, 40, 2), AT["s5:PTFE"], .12)
g(M.burst(.12, 40, 2), AT["s5:PTFE"] + .25, .08)
g(M.lib("whoosh-cinematic"), S["s6"] - .3, .06)
g(M.lib("chime"), AT["s6:atap"], .05)
g(M.lib("whoosh-cinematic"), S["s7"] - .3, .06)
g(swell(rng, 4.0, 3000, 9000), AT["s7:kipas"], .04)
g(M.lib("sparkle"), AT["s7:lampu"], .05)
opening(AT["s8:Menutup"], .14)
opening(AT["s8:membukanya"], .12)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
