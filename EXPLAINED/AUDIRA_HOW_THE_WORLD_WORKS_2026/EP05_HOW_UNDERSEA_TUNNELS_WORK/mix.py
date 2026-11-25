"""EP05 sound: open sea, then pressure hum as the dive deepens, sonar pings, TBM machinery and hydraulic thuds, concrete landing into the ring, a passing train. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, metal, rumble, swell, pulses

M = Mix(7500)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT = B["AT"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
S = {k: s(k)["start"] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
sea = norm(lowpass(rng.standard_normal(N), 800) - lowpass(rng.standard_normal(N), 160))
sea2 = np.roll(sea, 8123)
deep = norm(lowpass(rng.standard_normal(N), 95))
# TBM: low grind with a tooth rate from the cutter's rotation, ventilation hiss on top
grind = norm(lowpass(rng.standard_normal(N), 260)) * (.7 + .3 * np.sign(np.sin(2 * np.pi * 5.6 * T)))
hiss = norm(M.band(rng.standard_normal(N), 1400, 5200))
e_sea = M.env([(0, 1), (S["s1"] + 6, 1), (S["s2"], .05), (S["s7"] - .1, .05), (S["s7"], .9), (AT["s7:ditenggelamkan"], .05), (DUR, 0)])
e_deep = M.env([(0, 0), (S["s2"] - .5, .3), (S["s2"] + 3, 1), (AT["s2:75"], 1.3), (S["s4"], .7), (S["s5"], .2), (AT["s7:ditenggelamkan"], .3), (S["s8"], .9), (DUR, 0)])
e_gr = M.env([(0, 0), (S["s4"] - .1, 0), (S["s4"], 1), (S["s5"], .75), (S["s6"], .08), (S["s7"], 0), (DUR, 0)])
e_h = M.env([(0, 0), (S["s4"], .3), (S["s6"], .2), (S["s7"], 0), (S["s8"], .9), (END, .7), (DUR - .2, 0), (DUR, 0)])
dr = drone(T, 41.2)
fifth = np.sin(2 * np.pi * 41.2 * 1.5 * T) + .4 * np.sin(2 * np.pi * 82.8 * T)
e_d = M.env([(0, .15), (S["s2"], .8), (S["s4"], 1), (S["s6"], .9), (S["s7"], .55), (S["s8"], .7), (END, .3), (DUR - .2, 0), (DUR, 0)])
e_f = M.env([(0, 0), (S["s3"], .1), (S["s4"], .5), (S["s6"], 1), (AT["s6:rapat"] + .6, .15), (S["s8"], .6), (DUR, 0)])
mono = .05 * sea * e_sea + .17 * deep * e_deep + .14 * grind * e_gr + .016 * hiss * e_h + .05 * dr * e_d + .022 * fifth * e_f
side = .017 * (sea2 - sea) * e_sea + .007 * hiss * e_h
music = stereo(mono, side) * 2.0
# ---- cues ----
g(M.lib("whoosh-cinematic"), S["s1"] + 5.5, .08)
g(swell(rng, 1.2, 300, 2500), S["s2"] - .1, .1)
for k in ("s2:sepuluh", "s2:75", "s2:tujuh"):
    g(M.thump(.34), AT[k], .14)
    g(metal(rng, .9, 140, 5), AT[k], .05)
# sonar
for i in range(4):
    t0 = AT["s3:menyelidiki"] + i * 1.05
    x = np.arange(int(.5 * SR)) / SR
    g(np.sin(2 * np.pi * 1420 * x) * np.exp(-x * 11), t0, .05)
    g(np.sin(2 * np.pi * 1420 * x) * np.exp(-x * 14), t0 + .32, .016)
g(M.lib("ping"), AT["s3:kapur"], .05)
g(rumble(rng, 2.4, 170), AT["s3:lapisan"], .06)
g(M.lib("impact-bass-1"), S["s4"], .11)
g(M.thump(.8), S["s4"], .22)
g(metal(rng, 1.0, 95, 4), AT["s4:pemotongnya"], .05)
g(M.lib("riser"), AT["s4:tekanan"] - 1.2, .03)
g(swell(rng, 2.2, 100, 800), AT["s4:tekanan"], .1)
# erector: one seat per segment
span = max(.5, s("s5")["end"] - S["s5"] - .6)
for i in range(7):
    t0 = S["s5"] + .2 + (i + .92) * span / 7
    g(M.thump(.26), t0, .13)
    g(metal(rng, .36, 110 + i * 7, 15), t0, .04)
    g(M.lib("click-soft"), t0, .05)
g(M.lib("whoosh-cinematic"), S["s6"] - .3, .05)
g(M.lib("click"), AT["s6:gasket"], .07)
for i in range(3):
    g(metal(rng, .16, 620, 26), AT["s6:Baut"] + i * .21, .05)
g(M.thump(.4), AT["s6:rapat"], .15)
g(M.lib("click"), AT["s6:rapat"], .08)
g(M.lib("whoosh-cinematic"), S["s7"] - .3, .06)
g(swell(rng, 4, 60, 500), AT["s7:ditenggelamkan"], .2)
g(M.thump(.7), AT["s7:dirapatkan"], .22)
g(metal(rng, 1.1, 75, 4), AT["s7:dirapatkan"], .06)
g(swell(rng, 2.6, 300, 1600), AT["s7:dipompa"], .07)
# passing train: Doppler pitch fall on a noise and rail tone
ts = AT["s8:Ventilasi"] - 2.2
n = int(5.5 * SR)
x = np.arange(n) / SR
pass_e = np.exp(-((x - 2.4) / 1.25) ** 2)
pt = (norm(lowpass(rng.standard_normal(n), 700)) * .8 + .2 * np.sin(2 * np.pi * (168 * x + 16 * np.tanh((2.4 - x) * 2) * .6))) * pass_e
g(pt, ts, .17)
for i in range(16):
    g(M.lib("click-soft"), ts + 1.0 + i * .19, .035)
g(M.lib("click"), AT["s8:layanan"], .06)
g(M.thump(.5), AT["s8:dikendalikan"], .13)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
