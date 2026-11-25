"""EP02 sound: night street hum and crackling fire, a clean electric pad inside the cell, ion ticks while charging, a rising heat drone and crackle that quickens through the runaway, then calm. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, crackle, rumble, swell, pulses

M = Mix(2026)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
street = norm(lowpass(rng.standard_normal(N), 300))
hum = np.sin(2 * np.pi * 50 * T) + .3 * np.sin(2 * np.pi * 100 * T)
pad = drone(T, 82.4, ((1, 1), (1.5, .5), (2.003, .4)))
heat = drone(T, 41.2)
e_st = M.env([(0, .9), (S["s3"] - .1, .9), (S["s3"], 0), (S["s7"] - .1, 0), (S["s7"], .7), (END, .5), (DUR - .2, 0), (DUR, 0)])
e_pad = M.env([(0, 0), (S["s3"], .7), (S["s5"], .7), (S["s5"] + 3, .2), (S["s6"], 0), (S["s7"], .3), (S["s8"], .7), (END, .4), (DUR - .2, 0), (DUR, 0)])
e_h = M.env([(0, .2), (S["s3"], 0), (S["s5"], .1), (AT["s5:bertemu"], 1), (S["s6"], 1), (AT["s6:500"], 1.4), (S["s7"] - .1, 1), (S["s7"], .05), (DUR, 0)])
mono = .05 * street * e_st + .01 * hum * e_st + .04 * pad * e_pad + .06 * heat * e_h
side = .015 * (np.roll(street, 9001) - street) * e_st + .01 * pad * e_pad
music = stereo(mono, side) * 2.0
g(crackle(rng, 8.0, 50), .3, .12)
g(M.lib("impact-bass-1"), .4, .12)
g(M.lib("whoosh-cinematic"), S["s2"] - .35, .08)
g(M.lib("glitch-2"), AT["s2:Penyebab"], .05)
g(M.lib("click"), AT["s2:kontrolernya"], .08)
g(M.lib("click"), AT["s2:BMS-nya"], .08)
g(M.lib("riser"), AT["s2:masuk"] - .6, .04)
g(M.lib("whoosh-cinematic"), S["s3"] - .3, .08)
for k in ("s3:anoda", "s3:katoda", "s3:elektrolit", "s3:sekat"):
    g(M.lib("pop"), AT[k], .07)
g(M.lib("whoosh-short"), S["s4"] - .2, .07)
for i in range(30):
    g(M.lib("click-soft"), AT["s4:dicas"] + i * .32, .02)
g(M.lib("ping"), AT["s4:BMS"], .05)
g(M.lib("whoosh-cinematic"), S["s5"] - .3, .07)
g(M.lib("riser"), AT["s5:90"] - 1, .04)
g(crackle(rng, 3.0, 25), AT["s5:90"], .06)
g(M.lib("glitch-3"), AT["s5:130"], .05)
g(M.lib("impact-bass-1"), AT["s5:bertemu"], .14)
g(crackle(rng, 14.0, 90), S["s6"], .1)
g(swell(rng, 3.0, 300, 3000), AT["s6:oksigen"], .1)
g(M.thump(.6), AT["s6:menyala"], .2)
g(M.lib("impact-bass-1"), AT["s6:500"], .12)
for i in range(6):
    g(M.thump(.35), AT["s6:sebelahnya"] + i * .55, .12 - i * .012)
g(M.lib("whoosh-cinematic"), S["s7"] - .35, .08)
for k in ("s7:charger", "s7:menggembung", "s7:pemadam"):
    g(M.lib("click"), AT[k], .07)
g(M.lib("whoosh-cinematic"), S["s8"] - .3, .06)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
