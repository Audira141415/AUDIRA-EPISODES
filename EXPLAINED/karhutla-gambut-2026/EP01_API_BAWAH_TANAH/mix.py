"""Sound for API BAWAH TANAH: smoulder hiss and earth under everything, water on hot ground, boiling blisters, rain that stops, and one clean major interval when the peat is wet again. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import crackle, lowpass, norm, drone, rumble, swell

M = Mix(1210)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT = B["AT"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
S = {k: s(k)["start"] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
E = {k: s(k)["end"] for k in S}

# beds
hiss = norm(M.band(rng.standard_normal(N), 2600, 9500)) * (.75 + .25 * np.sin(T * 2.3) * np.sin(T * .9))
under = rumble(rng, DUR, 58, .5)[:N]
under = np.pad(under, (0, max(0, N - len(under))))
air = norm(M.band(rng.standard_normal(N), 180, 1100))
air2 = norm(M.band(rng.standard_normal(N), 180, 1100))
rainb = norm(M.band(rng.standard_normal(N), 1400, 11000))
rainb2 = norm(M.band(rng.standard_normal(N), 1400, 11000))
cr = crackle(rng, DUR, 26)[:N]
cr = np.pad(cr, (0, max(0, N - len(cr))))
e_hiss = M.env([(0, 1), (AT["s1:Air"] + .4, 1.5), (E["s2"] - .3, 1.2), (S["s3"], .22), (E["s4"], .3), (S["s5"], .05), (S["s8"], .25), (AT["s8:disuntik"], .9), (AT["s8:Api"], .25), (AT["s8:basah"], 0), (DUR, 0)])
e_und = M.env([(0, .5), (S["s3"], 1.15), (AT["s3:ambles"], 1.5), (E["s4"], 1.1), (S["s5"], .2), (S["s6"], .3), (S["s7"], .3), (S["s8"], 1), (AT["s8:Api"], .5), (END, .15), (DUR - .2, 0), (DUR, 0)])
e_air = M.env([(0, .55), (S["s3"], .05), (S["s5"], .75), (S["s6"], 1), (AT["s6:orang"], 1.35), (S["s7"], .3), (S["s8"], .05), (AT["s8:Ia"], .4), (DUR, 0)])
e_rain = M.env([(0, 0), (S["s7"] - .1, 0), (S["s7"] + .3, 1), (AT["s7:Tiga"] - .7, 1), (AT["s7:Tiga"] + .25, 0), (DUR, 0)])
e_cr = M.env([(0, .6), (S["s3"] - .1, .6), (S["s3"], .22), (E["s4"], .3), (S["s5"], 0), (AT["s7:lima"], 0), (AT["s7:lima"] + .9, 1), (S["s8"] - .1, .9), (S["s8"], .22), (AT["s8:Api"], 0), (DUR, 0)])
# score: a minor drone that resolves to a plain open fifth with the last sentence
d0 = drone(T, 49.0)
mn = np.sin(2 * np.pi * 49 * 1.2 * T) + .5 * np.sin(2 * np.pi * 49 * 2.4 * T)
op = np.sin(2 * np.pi * 98 * T) + .7 * np.sin(2 * np.pi * 147 * T) + .35 * np.sin(2 * np.pi * 196 * T)
e_d = M.env([(0, .35), (S["s3"], .7), (AT["s3:ambles"], 1), (S["s5"], .55), (S["s6"], .8), (AT["s6:diperkirakan"], 1), (S["s7"], .3), (S["s8"], .7), (AT["s8:Ia"], .35), (END, .25), (DUR - .2, 0), (DUR, 0)])
e_m = M.env([(0, 0), (S["s3"], .2), (S["s4"], .5), (S["s5"], .2), (S["s6"], .5), (AT["s6:diperkirakan"], .85), (S["s7"], 0), (DUR, 0)])
e_o = M.env([(0, 0), (AT["s8:Ia"] - .2, 0), (AT["s8:basah"], .62), (END, .55), (DUR - .15, 0), (DUR, 0)])
mono = .036 * hiss * e_hiss + .24 * under * e_und + .05 * air * e_air + .055 * d0 * e_d + .024 * mn * e_m + .02 * op * e_o + .06 * cr * e_cr + .05 * rainb * e_rain
side = .02 * (air2 - air) * e_air + .03 * (rainb2 - rainb) * e_rain + .012 * hiss * e_hiss
music = stereo(mono, side) * 1.2


def bub(f, dec, dur=.09):
    x = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * (f * x + f * .9 * x * x / dur)) * np.exp(-x * dec) * np.minimum(1, x / .002)


def sizzle(dur, att=.05):
    x = rng.standard_normal(int(dur * SR))
    x = x - lowpass(x, 2400)
    t = np.arange(len(x)) / SR
    return norm(x) * np.minimum(1, t / att) * np.exp(-t / dur * 2.6)


# cues
g(sizzle(4.5, .03), AT["s1:Air"] + .4, .22)
tt, stop = AT["s1:Tapi"], E["s2"] - 1.5
while tt < stop:
    g(bub(rng.uniform(180, 620), rng.uniform(14, 32), rng.uniform(.08, .18)), tt, rng.uniform(.05, .14))
    tt += rng.uniform(.06, .24)
g(M.thump(.5), AT["s1:bergolak"], .16)
g(M.lib("whoosh-cinematic"), AT["s2:bukan"] - .25, .05)
g(M.lib("impact-bass-1"), AT["s2:bukan"], .08)
g(M.lib("riser"), E["s2"] - 2.0, .05)
g(M.lib("whoosh-cinematic"), S["s3"] - .4, .1)
g(M.thump(.9), S["s3"], .22)
g(M.lib("click"), AT["s3:tumpukan"], .05)
g(swell(rng, 2.0, 80, 260), AT["s3:Bara"] - .2, .2)
g(rumble(rng, 2.4, 110), AT["s3:ambles"] - .15, .42)
g(M.thump(.8), AT["s3:ambles"] + .1, .34)
for i in range(30):
    t0 = AT["s3:ambles"] + .2 + i * .07 + rng.uniform(-.03, .03)
    x = rng.standard_normal(int(.035 * SR)) * np.exp(-np.arange(int(.035 * SR)) / SR * 100)
    g(lowpass(x, rng.uniform(300, 1200)), t0, rng.uniform(.04, .12))
g(M.lib("click"), AT["s4:proyek"], .05)
g(swell(rng, 3.4, 140, 900), AT["s4:kanal"] - .2, .12)
g(M.lib("whoosh-short"), AT["s4:El"], .05)
g(M.lib("whoosh-cinematic"), S["s5"] - .3, .08)
g(M.lib("glitch-1"), AT["s5:sensor"] - .1, .05)
g(M.lib("ping"), AT["s5:sensor"] + .3, .05)
rot = norm(np.sin(2 * np.pi * 174 * np.arange(int((E["s5"] - S["s5"]) * SR)) / SR) + .6 * np.sin(2 * np.pi * 349 * np.arange(int((E["s5"] - S["s5"]) * SR)) / SR)) * np.minimum(1, np.arange(int((E["s5"] - S["s5"]) * SR)) / SR)
g(rot, S["s5"], .008)
g(M.lib("whoosh-cinematic"), S["s6"] - .3, .08)
for k in ("s6:mencatat", "s6:juta", "s6:sekitar"):
    g(M.lib("ping"), AT[k] if k in AT else S["s6"], .035)
g(M.lib("impact-bass-1"), AT["s6:diperkirakan"], .09)
g(M.lib("whoosh-cinematic"), S["s7"] - .3, .07)
for i in range(5):
    g(M.thump(.4), AT["s7:lima"] + i * .26, .1)
    g(sizzle(.9, .01), AT["s7:lima"] + i * .26, .06)
g(M.lib("whoosh-cinematic"), S["s8"] - .3, .07)
for i in range(3):
    g(M.lib("impact-bass-1"), AT["s8:disuntik"] - .1 + i * .11, .05)
g(sizzle(5.0, .12), AT["s8:disuntik"] + .2, .13)
g(M.thump(.6), AT["s8:disekat"], .24)
g(rumble(rng, 1.3, 240), AT["s8:sumur"], .11)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.fx *= .75
M.finish(music)
print("duration", DUR)
