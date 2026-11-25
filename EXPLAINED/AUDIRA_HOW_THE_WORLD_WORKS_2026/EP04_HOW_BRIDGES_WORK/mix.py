"""EP04 sound: wind over open water and traffic hum, steel ringing as loads land, an industrial pulse, drafting clicks on the blueprint table. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, metal, rumble, pulses

M = Mix(434)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT = B["AT"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
S = {k: s(k)["start"] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
wind = norm(lowpass(rng.standard_normal(N), 700) - lowpass(rng.standard_normal(N), 160))
wind2 = np.roll(wind, 9001)
traffic = norm(lowpass(rng.standard_normal(N), 220)) * (.75 + .25 * np.sin(T * .9) * np.sin(T * .31))
SU = AT["s5:Suramadu"]
out = M.env([(0, 1), (S["s3"] - .1, 1), (S["s3"], .04), (SU - .1, .04), (SU, 1), (S["s7"] - .1, 1), (S["s7"], .04), (S["s8"] - .1, .04), (S["s8"], 1), (END, .6), (DUR - .2, 0), (DUR, 0)])
dr = drone(T, 55.0)
fifth = np.sin(2 * np.pi * 55 * 1.5 * T) + .4 * np.sin(2 * np.pi * 110.5 * T)
e_d = M.env([(0, .3), (S["s2"], .6), (S["s3"], .9), (S["s6"], 1), (AT["s6:tanah"], 1.25), (S["s7"], .55), (S["s8"], .7), (END, .3), (DUR - .2, 0), (DUR, 0)])
e_f = M.env([(0, 0), (S["s3"], 0), (S["s4"], .6), (S["s6"], 1), (AT["s6:tanah"], 1), (S["s7"], .3), (DUR, 0)])
pulse = pulses(N, S["s3"], S["s8"], .94, .47, .0, 52)
mono = .04 * wind * out + .1 * traffic * out + .05 * dr * e_d + .024 * fifth * e_f + .07 * pulse * e_f
side = .016 * (wind2 - wind) * out + .006 * fifth * e_f
music = stereo(mono, side) * 2.0
for i in range(14):
    t0 = 1.5 + i * .95 + rng.uniform(-.2, .2)
    g(metal(rng, .26, 120, 24), t0, .012)
g(M.lib("whoosh-cinematic"), S["s2"] - .3, .07)
g(M.thump(.4), AT["s2:mati"], .14)
for i in range(3):
    g(M.thump(.3), AT["s2:hidup"] + i * .24, .09)
g(M.lib("whoosh-cinematic"), S["s3"] - .35, .08)
g(metal(rng, 1.2, 180, 4), S["s3"] + .3, .06)
g(M.thump(.5), AT["s3:Tekan"], .2)
g(metal(rng, 1.4, 240, 3.2), AT["s3:Tarik"], .08)
g(metal(rng, 1.6, 95, 3), AT["s3:melengkung"], .08)
for k in ("s4:Balok", "s4:Rangka", "s4:Lengkung", "s5:gantung", "s5:kabel-tetap"):
    g(M.lib("whoosh-short"), AT[k] - .15, .05)
    g(M.lib("click"), AT[k], .07)
    g(metal(rng, .7, 300, 7), AT[k], .03)
g(M.lib("whoosh-cinematic"), SU - .3, .07)
g(M.lib("ping"), SU, .05)
g(rumble(rng, 2.5, 120), AT["s6:truk"], .1)
g(M.thump(.5), AT["s6:dek"], .22)
g(metal(rng, 2.2, 620, 2.2), AT["s6:Kabel"], .1)
g(M.lib("riser"), AT["s6:Pilon"] - 1.2, .03)
g(M.thump(.7), AT["s6:Pilon"], .22)
g(M.thump(.6), AT["s6:fondasi"], .22)
g(rumble(rng, 2.6, 62), AT["s6:tanah"] - .2, .4)
g(M.lib("impact-bass-1"), AT["s6:tanah"], .12)
g(M.lib("whoosh-cinematic"), S["s7"] - .3, .06)
for k, b in (("s7:Panas", 130), ("s7:dingin", 90), ("s7:Bantalan", 70)):
    g(metal(rng, .9, b, 5), AT[k], .07)
g(M.lib("click-soft"), AT["s7:meter"], .08)
g(M.lib("whoosh-cinematic"), S["s8"] - .3, .06)
g(M.thump(.6), AT["s8:Jadi"], .16)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
