"""EP20 sound: a "liquid lab" bed. A dark, slowly beating sub drone in D minor, a soft 96 bpm pulse, glassy bubble plinks
(rising-pitch sine blips, like bubbles in a fuel tank) that thicken while the tank fills, and a fluid swell under every dive
between scales. SFX: pump gurgle, sensor ticks, injector hiss, ignition crack + thump, corrosion fizz, factory rumble.
Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell, metal, rumble, crackle

M = Mix(2006)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}


def bubble(f0, dur=.12, rise=2.2):
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (1 + rise * t / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 34) * np.minimum(1, t / .002)


def hiss(dur, lo=2500, hi=9000):
    n = int(dur * SR)
    x = norm(M.band(rng.standard_normal(n), lo, hi))
    t = np.arange(n) / SR
    return x * np.minimum(1, t / .02) * np.minimum(1, (dur - t) / .05)


# bed: D minor drone with slow beating, filtered noise "fluid" layer
pad = drone(T, 73.4, ((1, 1), (1.004, .7), (1.5, .35), (2.0, .22), (2.38, .1)))
fluid = norm(lowpass(rng.standard_normal(N), 500) - lowpass(rng.standard_normal(N), 90))
fl_env = .5 + .5 * np.sin(2 * np.pi * T / 7.3) ** 2
e_p = M.env([(0, .5), (S["s3"], .85), (S["s5"], 1.0), (S["s7"], .85), (END, .7), (DUR - .2, 0), (DUR, 0)])
mono = .05 * pad * e_p + .035 * fluid * fl_env
side = .015 * pad * e_p * np.sin(2 * np.pi * T * .11) + .02 * (np.roll(fluid, 9001) - fluid)
music = stereo(mono, side) * 1.9
# soft pulse, 96 bpm, lighter in the explanation (s6)
bt = 60 / 96
tp = .25
while tp < END:
    on = .55 if S["s6"] <= tp < S["s7"] else 1.0
    g(M.thump(.22), tp, .045 * on)
    tp += bt
# bubble plinks: dense while filling (s1-s2), sparse through the film, D minor pentatonic
notes = [587.3, 698.5, 784.0, 880.0, 1046.5, 1174.7]
tp = .15
while tp < END:
    dense = tp < S["s3"] + .5
    fq = notes[int(rng.integers(len(notes)))] * (1 if rng.random() > .3 else .5)
    g(bubble(fq, .1 + rng.uniform(0, .08)), tp, (.03 if dense else .022) * rng.uniform(.6, 1))
    tp += (.09 + rng.uniform(0, .25)) if dense else (.5 + rng.uniform(0, 1.2))


def dive(at, gain=.07):
    g(M.lib("whoosh-cinematic"), at - .45, gain)
    g(swell(rng, 1.4, 120, 1800), at - .7, gain * .8)
    for k in range(10):
        g(bubble(400 + 90 * k, .09), at - .3 + k * .05, .02)


# s1: pump flow + gurgle
g(swell(rng, 4.0, 90, 600), .1, .05)
g(M.lib("pop"), AT["s1:minum"], .05)
g(M.thump(.3), AT["s1:tangki"], .08)
# s2: news
g(M.lib("ping"), S["s2"] + .1, .05)
g(crackle(rng, .6, 70), AT["s2:listrik"], .03)
for kk in ("s2:metanol", "s2:bensin", "s2:campurannya"):
    g(M.lib("click-soft"), AT[kk], .07)
g(M.lib("impact-bass-1"), AT["s2:pertama"], .09)
g(M.lib("click"), AT["s2:Indy"], .06)
# s3: into the tank, molecule tour, sensor
dive(S["s3"], .09)
for kk in ("s3:karbon", "s3:oksigen", "s3:hidrogen"):
    g(M.lib("pop"), AT[kk], .06)
g(swell(rng, 1.8, 200, 1400), AT["s3:Cair"] - .2, .05)
g(crackle(rng, 1.4, 40), AT["s3:Sensor"], .025)
g(M.lib("typing"), AT["s3:komputer"], .03)
# s4: energy cubes, injector pulses, cold
dive(S["s4"])
g(swell(rng, 1.2, 1600, 200), AT["s4:separuh"], .05)
g(M.lib("click-soft"), AT["s4:separuh"] + .2, .07)
for k in range(4):
    g(hiss(.5 if k % 2 == 0 else 1.0), AT["s4:injektor"] + k * 1.1, .03)
g(hiss(1.6, 4000, 11000), AT["s4:Injeksi"], .03)
g(M.lib("sparkle"), AT["s4:beku"] - .3, .04)
g(crackle(rng, .25, 120), AT["s4:beku"], .04)
# s5: compression, cooling, ignition
g(swell(rng, 1.8, 80, 600), AT["s5:piston"] - .1, .06)
g(hiss(2.2, 1500, 7000), AT["s5:menguap"], .025)
g(M.lib("riser"), AT["s5:Busi"] - 1.0, .04)
g(crackle(rng, .3, 160), AT["s5:Busi"], .06)
g(M.thump(.5), AT["s5:Busi"] + .1, .16)
g(M.lib("impact-bass-1"), AT["s5:Busi"] + .1, .08)
g(M.lib("pop"), AT["s5:karbon"], .05)
g(M.lib("pop"), AT["s5:air"], .05)
# s6: corrosion fizz, swelling, new parts click in
dive(S["s6"])
fz = hiss(2.0, 3000, 9000) * (.5 + .5 * np.sin(np.arange(int(2.0 * SR)) / SR * 40) ** 2)
g(fz, AT["s6:menyerang"], .03)
g(swell(rng, 1.4, 60, 300), AT["s6:membengkak"] - .3, .06)
g(M.lib("error"), AT["s6:membengkak"] + .2, .03)
g(metal(rng, 1.2, 420, 4.0), AT["s6:baja"] + .2, .045)
g(M.lib("chime"), AT["s6:khusus"], .05)
# s7: factory
dive(S["s7"])
g(rumble(rng, 4.0, 70), AT["s7:Kebanyakan"] - .3, .05)
g(M.lib("glitch-1"), AT["s7:batu"], .025)
g(M.lib("sparkle"), AT["s7:tangkapan"], .045)
g(M.lib("riser"), AT["s7:Indonesia"] - .9, .04)
g(M.lib("ping"), AT["s7:Indonesia"] + 1.2, .05)
# s8: rewind out to the car
g(M.lib("whoosh-cinematic"), S["s8"] - .3, .08)
g(swell(rng, 1.8, 2400, 150), S["s8"] - .3, .05)
for kk in ("s8:Satu", "s8:dua", "s8:mesin"):
    g(M.lib("click-soft"), AT[kk], .07)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
