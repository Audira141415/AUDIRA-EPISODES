"""EP18 sound: quiet and respectful. A slow D Dorian pad with a soft felt-piano motif (sparse, low), the steady rail-joint
"clack-clack" of a high-speed set that rises and falls with the trains, small paper-like data blips for balise packets and
radio, a soft two-tone chime for the warning (never an alarm), an air-brake hiss for automatic braking, a dropout hush when
the data dies, and light wind / rain / low rumble textures for the hazard sensors. The news scene (s2) keeps only the pad.
Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell, rumble

M = Mix(1818)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
a = lambda k, d: AT.get(k, d)

# running envelope: mirrors the train motion in world3d (running in s1, stopped s3, rolling s4-s5, stop, fallback creep, s7 run)
run = M.env([(0, 1), (S["s2"] + 2, .5), (S["s3"] - .4, 0), (S["s4"] + .7, 0), (S["s5"], .45), (a("s5:direm", S["s5"] + 8), .8),
             (a("s5:direm", S["s5"] + 8) + 2.4, 0), (S["s6"] + 1.2, 0), (a("s6:data", S["s6"] + 4), .6), (a("s6:berhenti", S["s6"] + 5) + .7, 0),
             (a("s6:Lalu", S["s6"] + 6), 0), (a("s6:Lalu", S["s6"] + 6) + .8, .15), (S["s7"], .2), (a("s7:Sensor", S["s7"] + 5), .9),
             (a("s7:rem", S["s7"] + 9), .9), (a("s7:rem", S["s7"] + 9) + 2.6, 0), (DUR, 0)])

# pad: D Dorian, slow breathing, dimmer and darker in the news scene
pad = drone(T, 73.4, ((1, 1), (1.5, .45), (2.0, .3), (2.38, .14), (3.0, .08)))
pad2 = drone(T, 110.0, ((1, .6), (1.335, .3), (2.0, .2)))
e_pad = M.env([(0, .55), (S["s2"], .75), (S["s3"], .6), (S["s5"], .7), (S["s7"], .8), (END, .7), (DUR - .2, 0), (DUR, 0)])
breath = .8 + .2 * np.sin(2 * np.pi * T / 7.5)
hum = norm(lowpass(rng.standard_normal(N), 220)) * run          # rolling rumble
air = norm(lowpass(rng.standard_normal(N), 2600) - lowpass(rng.standard_normal(N), 500)) * run ** 1.5
mono = .05 * pad * e_pad * breath + .03 * pad2 * e_pad + .05 * hum + .012 * air
side = .015 * pad2 * e_pad + .01 * (np.roll(air, 5003) - air)
music = stereo(mono, side) * 2.0

# felt-piano motif: a few low notes, more space in s2
notes = [146.8, 174.6, 196.0, 220.0, 261.6, 293.7]
tp = .6
while tp < END:
    fq = notes[int(rng.integers(len(notes)))]
    gain = .018 if S["s2"] <= tp < S["s3"] else .024
    g(M.tone([fq, fq * 2.0, fq * 3.0], 2.2, 2.8), tp, gain)
    tp += 1.6 + rng.uniform(0, 1.6) + (1.2 if S["s2"] <= tp < S["s3"] else 0)

# rail joints: clack pairs, cadence tied to the running envelope
def clack(t, gn):
    g(M.burst(.03, 160, 2), t, gn); g(M.burst(.03, 160, 2), t + .09, gn * .8)
tp = .15
while tp < END:
    r = float(np.interp(tp, T[::441], run[::441]))
    if r > .08 and not (S["s2"] + 1.5 <= tp < S["s3"]):
        clack(tp, .05 * r)
    tp += .55 if r > .4 else .9

# s1: hook
g(M.lib("whoosh-cinematic"), .05, .05)
g(M.lib("click-soft"), a("s1:berhenti", 3), .06)
g(M.tone([440, 660], .5, 5), a("s1:Bagaimana", 4.5), .025)
# s2: news, pad only + one soft low tone on the pin
g(swell(rng, 1.6, 600, 120), S["s2"] - .5, .04)
g(M.tone([98.0, 147.0], 3.0, 1.2), a("s2:Toledo", S["s2"] + 5), .05)
# s3: blocks light up
g(M.lib("whoosh"), S["s3"] - .3, .04)
g(M.lib("click"), a("s3:jarak", S["s3"] + 3.5), .05)
for k in range(4):
    g(M.lib("click-soft"), a("s3:blok", S["s3"] + 7) + k * .12, .05)
# s4: cab, balise packets, radio
g(M.lib("whoosh-cinematic"), a("s4:kabin", S["s4"] + 1) - .3, .05)
for k in range(5):
    g(M.tone([1320, 1980], .12, 30), a("s4:balise", S["s4"] + 3) + .4 + k * 1.1, .03)
g(swell(rng, 1.0, 400, 2400), a("s4:radio", S["s4"] + 6) - .3, .03)
g(M.lib("ping"), a("s4:izin", S["s4"] + 7.5), .04)
# s5: curve, warning chime, air brake
g(M.lib("click-soft"), a("s5:kurva", S["s5"] + 1), .05)
for k in range(2):
    g(M.tone([659.3, 987.8], .35, 6), a("s5:peringatan", S["s5"] + 5) + k * .45, .035)
    g(M.tone([523.3, 784.0], .35, 6), a("s5:peringatan", S["s5"] + 5) + .2 + k * .45, .03)
hiss = norm(lowpass(rng.standard_normal(int(SR * 2.4)), 5000) - lowpass(rng.standard_normal(int(SR * 2.4)), 1200))
hiss *= np.minimum(1, np.arange(len(hiss)) / SR / .05) * np.exp(-np.arange(len(hiss)) / SR * 1.4)
g(hiss, a("s5:direm", S["s5"] + 8), .05)
g(M.thump(.3), a("s5:direm", S["s5"] + 8), .06)
# s6: data dies (hush), stop, fallback creep
g(swell(rng, 1.2, 2400, 160), a("s6:data", S["s6"] + 4) - .2, .05)
g(M.lib("glitch-1"), a("s6:data", S["s6"] + 4), .018)
g(hiss[: int(SR * 1.4)], a("s6:berhenti", S["s6"] + 5) - .3, .035)
g(M.lib("click"), a("s6:cadangan", S["s6"] + 7.5), .05)
# s7: sensors
g(M.lib("whoosh-cinematic"), S["s7"] - .3, .05)
g(M.lib("ping"), a("s7:memakai", S["s7"] + 1.5), .035)
wind = norm(lowpass(rng.standard_normal(int(SR * 2.0)), 900)) * np.hanning(int(SR * 2.0))
g(wind, a("s7:angin", S["s7"] + 5.5) - .2, .05)
rain = M.burst(1.6, 1.0, 1) * (rng.random(int(SR * 1.6)) > .985)
g(lowpass(rain, 6000), a("s7:hujan", S["s7"] + 6), .12)
g(rumble(rng, 2.0, 50, .3), a("s7:gempa", S["s7"] + 6.6), .07)
g(M.tone([1760], .2, 12), a("s7:benda", S["s7"] + 7.4), .025)
g(hiss, a("s7:rem", S["s7"] + 9), .05)
g(M.thump(.3), a("s7:rem", S["s7"] + 9), .06)
# s8: quiet close
g(swell(rng, 2.0, 200, 900), S["s8"] - .4, .03)
g(M.tone([146.8, 220.0, 293.7], 3.5, .9), a("s8:Turut", S["s8"] + 4), .035)
g(M.lib("chime"), B["outroAt"] + .05, .07)
M.finish(music)
print("duration", DUR)
