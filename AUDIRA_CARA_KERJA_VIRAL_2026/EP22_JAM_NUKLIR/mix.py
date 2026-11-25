"""EP22 sound: a "glass studio" bed. A clean, airy E major pad with slow chorus shimmer, a soft clock tick that
sharpens from a wooden pendulum tock (s3) into a precise glass tick once the laser locks (s5 onward), and crystal
glass-harmonica tones (sine partials with slow attack) on key words. SFX: reactor ghost dissolving, 24 h ring sweep,
quartz buzz, field-line crackle, gamma zap, UV hum, feedback blips, lock chime, deep "30 million years" swell,
dark-matter wave whoosh. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell, metal, crackle

M = Mix(2022)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}


def glass_tone(f0, dur=1.6, att=.06):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f0 * t) + .35 * np.sin(2 * np.pi * f0 * 2.01 * t) + .12 * np.sin(2 * np.pi * f0 * 3.98 * t)
    return x * np.minimum(1, t / att) * np.exp(-t * 2.2)


def tick(f=3200, dur=.03, dec=260):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t * dec)


def tock(dur=.08):
    t = np.arange(int(dur * SR)) / SR
    return M.band(rng.standard_normal(len(t)), 300, 1400) * np.exp(-t * 60) * .6 + np.sin(2 * np.pi * 420 * t) * np.exp(-t * 50)


def hum(dur, f=118):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2 * t) + .2 * np.sin(2 * np.pi * f * 3 * t)
    return x * np.minimum(1, t / .2) * np.minimum(1, (dur - t) / .3)


# bed: E major pad (E2 + B2 + E3 + G#3) with chorus shimmer, airy filtered noise
pad = drone(T, 82.4, ((1, 1), (1.003, .7), (1.5, .45), (2.0, .35), (2.52, .22), (3.0, .12)))
air = norm(lowpass(rng.standard_normal(N), 3000) - lowpass(rng.standard_normal(N), 900))
shim = .5 + .5 * np.sin(2 * np.pi * T / 5.1) ** 2
e_p = M.env([(0, .55), (S["s3"], .8), (S["s5"], 1.0), (S["s6"], .9), (S["s7"], 1.0), (END, .75), (DUR - .2, 0), (DUR, 0)])
mono = .05 * pad * e_p + .012 * air * shim
side = .02 * pad * e_p * np.sin(2 * np.pi * T * .07) + .012 * (np.roll(air, 7001) - air)
music = stereo(mono, side) * 1.8
# clock: soft glass ticks every second in s1-s2, wooden tock with the pendulum in s3, precise ticks from s5
tp = .5
while tp < END:
    if S["s3"] <= tp < S["s4"]:
        g(tock(), tp, .05)
    elif tp >= S["s5"]:
        g(tick(), tp, .03 if tp < AT["s5:terkunci"] else .045)
    elif tp < S["s3"]:
        g(tick(2600, .03, 300), tp, .02)
    tp += 1.0
# crystal tones on key words, E major pentatonic
notes = {"e": 659.3, "f#": 740.0, "g#": 830.6, "b": 987.8, "c#": 1108.7, "e2": 1318.5}

# s1: reactor ghost dissolves into the nucleus
g(swell(rng, 2.5, 200, 1500), .05, .04)
g(M.lib("glitch-1"), AT["s1:tanpa"] if "s1:tanpa" in AT else AT["s1:reaktor"], .04)
g(M.lib("sparkle"), AT["s1:reaktor"] + .2, .05)
g(glass_tone(notes["e"], 2.2), AT["s1:inti"], .09)
g(glass_tone(notes["b"], 2.2), AT["s1:inti"] + .05, .05)
# s2: news, 24 h ring sweep, Vienna/Beijing tablets
g(M.lib("ping"), S["s2"] + .1, .05)
g(M.lib("click-soft"), AT["s2:Wien"], .07)
g(swell(rng, 2.2, 400, 3000), AT["s2:24"] - .4, .045)
for k in range(8):
    g(tick(4000 + 150 * k, .02, 400), AT["s2:24"] - .4 + k * .3, .03)
g(glass_tone(notes["g#"], 1.6), AT["s2:mengoreksi"], .06)
g(M.lib("pop"), AT["s2:Beijing"], .06)


def glide(at, gain=.07):
    g(M.lib("whoosh-cinematic"), at - .5, gain)
    g(swell(rng, 1.3, 300, 4000), at - .7, gain * .7)


# s3: oscillator ladder
glide(S["s3"])
g(glass_tone(notes["e"], 1.2), AT["s3:Bandul"], .05)
q = M.band(rng.standard_normal(int(1.8 * SR)), 2500, 6000) * np.minimum(1, np.arange(int(1.8 * SR)) / SR / .1) * np.exp(-np.arange(int(1.8 * SR)) / SR * 1.5)
g(q, AT["s3:Kuarsa"], .02)
g(glass_tone(notes["c#"], 1.4), AT["s3:Kuarsa"], .05)
g(glass_tone(notes["e2"], 1.6), AT["s3:cesium"], .05)
# s4: atom, disturbance, nucleus, gamma, UV
glide(S["s4"])
g(crackle(rng, 2.4, 90), AT["s4:terganggu"] - .5, .035)
g(M.lib("glitch-2"), AT["s4:terganggu"], .03)
g(swell(rng, 1.6, 1800, 200), AT["s4:Inti"] - .2, .05)
g(glass_tone(notes["e"] / 2, 2.4), AT["s4:terlindung"], .07)
g(M.lib("impact-bass-1"), AT["s4:gamma"], .08)
g(crackle(rng, .4, 200), AT["s4:gamma"], .05)
g(hum(1.8, 236), AT["s4:ultraviolet"], .02)
g(glass_tone(notes["b"], 1.6), AT["s4:ultraviolet"], .05)
# s5: crystal, absorption, drift, sensor, push back, lock
glide(S["s5"])
g(M.lib("sparkle"), AT["s5:Triliunan"], .05)
g(hum(3.0), AT["s5:menyerap"] - .4, .02)
g(swell(rng, 1.2, 900, 400), AT["s5:Melenceng"], .04)
g(M.lib("error"), AT["s5:sensor"], .025)
for k in range(5):
    g(tick(1800 + 300 * k, .03, 200), AT["s5:sensor"] + .25 + k * .22, .035)
g(swell(rng, 1.0, 400, 1400), AT["s5:didorong"], .04)
g(M.lib("chime"), AT["s5:terkunci"], .07)
g(glass_tone(notes["e2"], 2.0), AT["s5:terkunci"] + .05, .05)
# s6: one second vs thirty million years, pillars rise
glide(S["s6"])
g(tick(5200, .03, 300), AT["s6:detik"], .06)
g(swell(rng, 3.0, 60, 400), AT["s6:juta"] - .3, .06)
g(M.lib("impact-bass-1"), AT["s6:juta"] + .2, .05)
g(M.lib("click-soft"), AT["s6:kestabilan"], .06)
g(swell(rng, 1.4, 300, 2400), AT["s6:optik"] - .2, .04)
g(glass_tone(notes["g#"], 1.4), AT["s6:optik"] + .3, .04)
g(glass_tone(notes["b"], 1.4), AT["s6:Beijing"] + .3, .04)
# s7: uses
glide(S["s7"])
g(glass_tone(notes["f#"], 1.6), AT["s7:peka"], .05)
g(M.lib("whoosh"), AT["s7:materi"] - .3, .05)
g(swell(rng, 3.5, 80, 700), AT["s7:materi"] - .2, .04)
g(M.lib("ping"), AT["s7:navigasi"], .045)
# s8: pull back
g(M.lib("whoosh-cinematic"), S["s8"] - .3, .07)
g(glass_tone(notes["e"], 3.0), AT["s8:inti"], .07)
g(glass_tone(notes["b"], 3.0), AT["s8:inti"] + .04, .05)
g(glass_tone(notes["e2"], 3.0), AT["s8:inti"] + .08, .04)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
