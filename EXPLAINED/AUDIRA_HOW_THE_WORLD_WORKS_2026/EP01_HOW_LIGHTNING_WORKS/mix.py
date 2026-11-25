"""EP01 sound: wind and rain grow with the storm, a low drone tightens as charge separates, leader crackles step by step, and the real thunder arrives on the word guntur. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import thunder, crackle, lowpass, norm, drone, pulses

M = Mix(27000)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT = B["AT"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
S = {k: s(k)["start"] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
wn = rng.standard_normal(N)
wind = norm(lowpass(wn, 340) - lowpass(wn, 70))
wind2 = np.roll(wind, 7001)
gust = .65 + .35 * np.sin(T * .47) * np.sin(T * .19 + 1.1)
rain = norm(M.band(rng.standard_normal(N), 1800, 9000))
rain2 = norm(M.band(rng.standard_normal(N), 1800, 9000))
e_wind = M.env([(0, .9), (S["s2"], .35), (S["s3"] - 1, .9), (S["s3"] + 2, 1.5), (S["s5"], .9), (S["s6"], .8), (S["s7"], .25), (S["s8"], .9), (DUR, 0)]) * gust
e_rain = M.env([(0, 0), (S["s5"] + 1, 0), (S["s5"] + 3, .75), (S["s7"], .1), (S["s8"], 1), (END, .8), (DUR, 0)])
r = AT["s6:arus"]
f0 = 49.0
dr = drone(T, f0)
fifth = np.sin(2 * np.pi * f0 * 1.5 * T) + .5 * np.sin(2 * np.pi * f0 * 3.01 * T)
air = norm(M.band(rng.standard_normal(N), 180, 900))
e_d = M.env([(0, .55), (S["s2"], .35), (S["s4"], .8), (S["s5"], 1), (r, 1.25), (r + .05, .25), (S["s7"], .45), (S["s8"], .5), (END, .25), (DUR - .2, 0), (DUR, 0)])
e_f = M.env([(0, 0), (S["s4"], 0), (S["s4"] + 4, .8), (r, 1), (r + .05, 0), (DUR, 0)])
pulse = pulses(N, S["s4"], r, 1.0)
mono = .06 * dr * e_d + .03 * fifth * e_f + .016 * air * e_d + .1 * pulse + .03 * wind * e_wind + .012 * rain * e_rain
side = .012 * (wind2 - wind) * e_wind + .012 * (rain2 - rain) * e_rain + .006 * air * e_d
music = stereo(mono, side) * 2.0
# ---- cues ----
for t0, gn in ((.12, .22), (AT["s1:pelepasan"], .3)):
    g(thunder(rng, 3.6, 1.2), t0 + .02, gn)
    g(crackle(rng, .3, 140), t0, .08)
g(M.lib("whoosh-cinematic"), S["s2"] - .36, .07)
g(M.lib("whoosh-cinematic"), S["s3"] + .7, .09)
g(M.lib("riser"), S["s3"] - .3, .025)
# inside the cloud: ice ticks
for i in range(52):
    t0 = S["s3"] + 2 + i * (S["s4"] + 6 - S["s3"] - 2) / 52 + rng.uniform(-.05, .05)
    g(M.lib("click-soft"), t0, rng.uniform(.012, .035))
for k in ("s3:kristal", "s3:graupel", "s4:Kristal", "s4:Butiran"):
    g(M.lib("click"), AT[k], .06)
    g(crackle(rng, .22, 90), AT[k], .05)
g(M.lib("whoosh-short"), S["s4"] + 4.8, .06)
# stepped leader: one crackle per step
lead, meet = AT["s5:Jalur"], AT["s6:bertemu"]
for i in range(10):
    g(crackle(rng, .16, 220), lead + (meet - lead) * i / 10, .075)
g(crackle(rng, 1.4, 90) * np.exp(-np.arange(int(1.4 * SR)) / SR * .7), AT["s5:Dari"], .05)
g(M.lib("riser"), r - 2.2, .05)
g(M.lib("impact-bass-1"), r, .14)
g(M.thump(.7), r, .3)
g(thunder(rng, 5.5, 1.5), r + .02, .36)
g(crackle(rng, .4, 300), r, .1)
g(M.lib("ping"), AT["s6:100"], .04)
g(M.lib("whoosh-cinematic"), S["s7"] - .3, .07)
# heat rising tone, then the thunder under the word
n = int((AT["s7:mengembang"] - AT["s7:panas"]) * SR)
x = np.arange(n) / SR
g(np.sin(2 * np.pi * (220 * x + 180 * x * x / max(x[-1], .1))) * np.minimum(1, x) * .5, AT["s7:panas"], .022)
g(M.thump(.9), AT["s7:mengembang"], .24)
g(thunder(rng, 7.0, .8), AT["s7:guntur"] - .08, .4)
g(thunder(rng, 4.5, .1), S["s8"] + 3.0, .13)
g(M.lib("pop"), AT["s8:Segera"], .05)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
