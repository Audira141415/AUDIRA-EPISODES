"""EP03 sound: open sea and gulls-free wind, deep-ocean pressure hum, a slow strain creak, the rupture, then a long swell that only grows once the wave shoals. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import thunder, lowpass, norm, drone, rumble, swell, pulses, metal

M = Mix(4600)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT = B["AT"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
S = {k: s(k)["start"] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
L = AT["s2:lepas"]
sea = norm(lowpass(rng.standard_normal(N), 900) - lowpass(rng.standard_normal(N), 160))
sea2 = norm(lowpass(rng.standard_normal(N), 900) - lowpass(rng.standard_normal(N), 160))
waves = .62 + .38 * np.sin(T * .55) * np.sin(T * .21 + .7)
deep = norm(lowpass(rng.standard_normal(N), 110))
hiss = norm(M.band(rng.standard_normal(N), 3500, 9000))
e_sea = M.env([(0, 1), (S["s2"], 1), (S["s2"] + .35, .03), (AT["s5:Kapal"] - .1, .03), (AT["s5:Kapal"], 1), (S["s6"], .1), (S["s6"] + 2, .3), (AT["s7:darat"], 1.3), (S["s8"], .5), (AT["s8:surut"], .12), (DUR, 0)]) * waves
e_deep = M.env([(0, 0), (S["s2"], .2), (S["s2"] + .5, 1), (S["s4"], .8), (AT["s5:Kapal"], .2), (S["s6"], .9), (S["s7"], 1.2), (S["s8"], .4), (END, .2), (DUR - .2, 0), (DUR, 0)])
dr = drone(T, 36.7)
third = np.sin(2 * np.pi * 36.7 * 1.5 * T) + .4 * np.sin(2 * np.pi * 36.7 * 3.02 * T)
e_d = M.env([(0, .15), (S["s2"], .65), (L, 1.1), (L + .1, .35), (S["s4"], .5), (S["s6"], .6), (S["s7"], 1.2), (S["s8"], .55), (END, .25), (DUR - .2, 0), (DUR, 0)])
e_t = M.env([(0, 0), (S["s6"], 0), (AT["s6:meninggi"], .9), (S["s7"] + 2, 1), (S["s8"], .25), (DUR, 0)])
pulse = pulses(N, S["s6"], AT["s7:darat"], 1.0, .38, .05) + pulses(N, S["s2"] + 1, L, 1.0, .5, .07)
mono = .05 * sea * e_sea + .14 * deep * e_deep + .05 * dr * e_d + .024 * third * e_t + .1 * pulse + .004 * hiss * e_sea
side = .018 * (sea2 - sea) * e_sea
music = stereo(mono, side) * 2.0
# ---- cues ----
g(swell(rng, 4), .1, .05)
g(M.lib("whoosh-cinematic"), S["s2"] - .25, .1)
g(swell(rng, 1.2, 200, 2200), S["s2"] + .1, .12)
# strain: rock creaks tighten up to the rupture
n = 9
for i in range(n):
    u = i / n
    g(metal(rng, .32, 70 + u * 60, 16), AT["s2:lempeng"] + (L - AT["s2:lempeng"] - .15) * u, .025 + u * .05)
g(M.lib("impact-bass-1"), L, .16)
g(M.thump(.9), L, .34)
g(thunder(rng, 5.5, .4), L, .36)
g(rumble(rng, 4, 55), L, .3)
g(M.thump(.5), AT["s3:Gempa"], .15)
g(swell(rng, 3.2, 90, 700), AT["s3:kolom"] - .3, .22)
g(M.lib("riser"), AT["s3:menyebar"] - 1.2, .03)
g(M.lib("whoosh-cinematic"), S["s4"] - .35, .07)
g(M.lib("click"), AT["s4:Ombak"], .05)
g(M.thump(.35), AT["s4:Tsunami"], .1)
g(M.lib("ping"), AT["s5:4.600"], .05)
g(M.lib("ping"), AT["s5:765"], .05)
g(swell(rng, 5.0, 60, 340), AT["s5:Kecepatannya"], .12)
g(M.lib("whoosh-short"), AT["s5:Kapal"] - .15, .05)
g(M.lib("whoosh-cinematic"), S["s6"] - .32, .07)
g(M.lib("riser"), AT["s6:meninggi"] - 1.8, .05)
g(swell(rng, 9.0, 80, 760), S["s6"] + 1, .3)
g(M.thump(.8), AT["s7:darat"], .28)
g(M.lib("impact-bass-1"), AT["s7:darat"], .12)
g(swell(rng, 7.0, 150, 1800), AT["s7:darat"], .34)
g(M.lib("click"), AT["s7:Sumatra"], .05)
g(M.lib("whoosh-short"), AT["s8:surut"] - .2, .05)
g(M.lib("pop"), AT["s8:surut"], .06)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
