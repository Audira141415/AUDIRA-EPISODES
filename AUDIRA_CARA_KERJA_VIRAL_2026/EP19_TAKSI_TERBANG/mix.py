"""EP19 sound: a light, airy pastel bed. Soft kalimba-like plucks in a major pentatonic (G), a warm open-fifth pad,
a gentle shaker pulse, lake wind, and an electric rotor hum whose level and pitch follow the lift rotors (formation in s1-s2,
demo aircraft in s3-s5). SFX: spin-up / spin-down sweeps, a soft error blip for the failed motor, data pings for the
satellite links, a sparkle for the energy blocks, a riser into the map view and a stamp for the Indonesia validation.
Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell

M = Mix(1919)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}

# rotor activity envelope (mirrors world3d liftF / liftD roughly)
rot = M.env([(0, 1), (AT["s2:Empat"] - .5, 1), (AT["s2:otomatis"] + .3, .25), (S["s3"], .2), (AT["s3:rotor"] - .6, .2), (AT["s3:diputar"], 1),
             (AT["s4:Begitu"], 1), (AT["s4:berhenti"] + .3, .3), (AT["s5:Otaknya"] + .6, .3), (AT["s5:mengatur"] + .3, 1), (AT["s5:Navigasi"], .9),
             (AT["s5:Navigasi"] + 1.5, .3), (S["s6"], .1), (S["s7"], .2), (DUR, .2)])
f = 92 + 60 * rot
ph = 2 * np.pi * np.cumsum(f) / SR
hum = (np.sin(ph) + .4 * np.sin(2 * ph) + .2 * np.sin(4.02 * ph)) * rot
chop = 1 + .25 * np.sin(2 * np.pi * 21 * T)  # blade-pass flutter
wind = norm(lowpass(rng.standard_normal(N), 900) - lowpass(rng.standard_normal(N), 120))
pad = drone(T, 98.0, ((1, 1), (1.5, .5), (2.0, .3), (3.0, .12)))
e_p = M.env([(0, .5), (S["s3"], .7), (S["s6"], .8), (S["s7"], 1.0), (END, .8), (DUR - .2, 0), (DUR, 0)])
mono = .02 * hum * chop + .035 * wind + .05 * pad * e_p
side = .02 * (np.roll(wind, 9001) - wind) + .015 * pad * e_p
music = stereo(mono, side) * 2.0

# kalimba plucks, G major pentatonic, gently syncopated
notes = [392.0, 440.0, 493.9, 587.3, 659.3, 784.0, 880.0]
step = 60 / 104 / 2
tp, k = .3, 0
while tp < END:
    if rng.random() < .62:
        fq = notes[int(rng.integers(len(notes)))]
        g(M.tone([fq, fq * 2.0, fq * 5.4], .9, 7.5), tp, .026 + .01 * (k % 4 == 0))
    if k % 8 == 0:
        g(M.tone([196.0, 293.7], 1.6, 2.2), tp, .03)
    # soft shaker
    g(M.burst(.05, 90, 1) * .6, tp + step * .5, .012)
    tp += step
    k += 1

def spinup(at, gain, up=True, d=1.4):
    t = np.arange(int(SR * d)) / SR
    fr = (120 + 900 * (t / d) ** 1.4) if up else (1020 - 900 * (t / d) ** .7)
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.minimum(1, t * 6) * np.minimum(1, (d - t) * 5)
    g(x, at, gain)

# s1: rotors already spinning; airy hit on "pilot"
g(swell(rng, 1.4, 300, 2400), 0, .05)
g(M.lib("impact-bass-1"), AT["s1:Tanpa"], .08)
g(M.lib("pop"), AT["s1:Tanpa"] + .05, .06)
# s2
g(M.lib("whoosh-cinematic"), S["s2"] - .3, .06)
g(M.lib("click-soft"), AT["s2:menerbangkan"], .07)
g(M.lib("whoosh"), AT["s2:menerbangkan"] + .4, .05)
g(M.lib("click-soft"), AT["s2:Empat"], .07)
spinup(AT["s2:Empat"], .025, up=False, d=2.0)
g(M.lib("click-soft"), AT["s2:Pesawatnya"], .07)
# s3 swoop to the demo pad, spin-up, lift
g(M.lib("whoosh-cinematic"), S["s3"] - .4, .07)
spinup(AT["s3:rotor"] - .6, .035, up=True, d=1.8)
g(M.lib("click"), AT["s3:diputar"], .06)
g(swell(rng, 2.0, 120, 700), AT["s3:Udara"] - .3, .06)
# s4 pusher, airflow, rotor stop
g(M.lib("click"), AT["s4:pendorong"], .06)
spinup(AT["s4:pendorong"] - .2, .03, up=True, d=1.2)
g(M.lib("whoosh"), AT["s4:melaju"], .06)
g(swell(rng, 1.8, 400, 2200), AT["s4:udara"] - .2, .04)
spinup(AT["s4:Begitu"], .035, up=False, d=1.9)
g(M.lib("ping"), AT["s4:berhenti"] + .3, .05)
# s5 x-ray, motor failure, satellite links
g(M.lib("sparkle"), AT["s5:Otaknya"], .04)
g(M.lib("typing"), AT["s5:mengatur"], .025)
g(M.lib("error"), AT["s5:mati"], .05)
g(M.lib("click-soft"), AT["s5:menambah"], .07)
g(M.lib("whoosh-cinematic"), AT["s5:Navigasi"] - .4, .06)
for kk, dt in (("s5:satelit", 0), ("s5:satelit", .35), ("s5:radio", 0), ("s5:radio", .3)):
    g(M.lib("ping"), AT[kk] + dt, .035)
# s6 energy blocks, map riser
g(M.lib("whoosh-cinematic"), S["s6"] - .4, .06)
g(M.lib("pop"), AT["s6:Baterai"], .07)
for i in range(10):
    g(M.lib("click-soft"), AT["s6:puluhan"] - .6 + i * .18, .04)
g(M.lib("sparkle"), AT["s6:puluhan"], .05)
g(M.lib("riser"), AT["s6:Jangkauan"] - 1.6, .05)
g(M.lib("chime"), AT["s6:dua"], .045)
# s7 route, formation, stamp
g(swell(rng, 2.2, 200, 1400), S["s7"] - .2, .04)
g(M.lib("whoosh-cinematic"), AT["s7:memimpin"] - .9, .07)
g(M.thump(.35), AT["s7:Indonesia"], .12)
g(M.lib("impact-bass-1"), AT["s7:Indonesia"], .05)
# s8
for kk in ("s8:Naik", "s8:terbang", "s8:komputer"):
    g(M.lib("pop"), AT[kk], .06)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
