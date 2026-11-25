"""EP14 sound: clean premium-product bed. A low electric hum that rises in pitch with road speed (an EV whine, not an engine),
a pulsing minimal sub sequence, glassy synth plucks in a bright Lydian set, wind rush while the car runs, and mechanical
servo clicks when the body lifts and snaps back. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell, metal, rumble

M = Mix(514)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}

# speed envelope mirrors world3d speedAt(): full in s1-s2, freeze in s3-s6, back after "Lintasan"
spd = M.env([(0, 1), (AT["s3:Musuh"] - .2, 1), (AT["s3:Musuh"] + 1.6, 0), (AT["s7:Lintasan"] - .6, 0), (AT["s7:Lintasan"] + 1.4, 1), (DUR, 1)])
# EV whine: frequency follows speed
f = 180 + 520 * spd
ph = 2 * np.pi * np.cumsum(f) / SR
whine = (np.sin(ph) + .35 * np.sin(2 * ph) + .15 * np.sin(3.01 * ph)) * (.2 + .8 * spd)
wind = norm(lowpass(rng.standard_normal(N), 1400) - lowpass(rng.standard_normal(N), 160)) * (.15 + .85 * spd)
pad = drone(T, 82.4, ((1, 1), (1.5, .4), (2.0, .25), (2.52, .12)))
e_p = M.env([(0, .55), (S["s3"], .8), (S["s7"], .9), (END, .6), (DUR - .2, 0), (DUR, 0)])
mono = .012 * whine + .05 * wind + .05 * pad * e_p
side = .02 * (np.roll(wind, 7001) - wind) + .012 * pad * e_p
music = stereo(mono, side) * 2.0
# minimal sub pulse on an eighth grid (~124 bpm), quiet during inspection
bt = 60 / 124 / 2
tp = .2
while tp < END:
    on = 1.0 if (tp < S["s3"] or tp > AT["s7:Lintasan"]) else .45
    g(M.thump(.18), tp, .05 * on)
    tp += bt * 2
# glassy plucks, Lydian on E
notes = [329.6, 370.0, 415.3, 466.2, 493.9, 554.4, 622.3, 659.3]
tp = .8
while tp < END:
    fq = notes[int(rng.integers(len(notes)))]
    g(M.tone([fq, fq * 2.0, fq * 3.01], .9, 5.5), tp, .022)
    tp += .7 + rng.uniform(0, 1.3)

def passby(at, gain):
    g(M.lib("whoosh-cinematic"), at - .35, gain)
    g(swell(rng, 1.2, 300, 3000), at - .6, gain * .6)

# s1: posts flash by once a second
for k in range(1, 6):
    g(M.lib("whoosh-short"), k * 1.0 - .1, .05)
g(M.thump(.4), AT["s1:detik"], .12)
passby(S["s2"], .07)
g(M.lib("riser"), AT["s2:mencapai"] - .3, .05)
g(M.lib("ping"), AT["s2:mencapai"] + 2.2, .05)
passby(AT["s2:Abu"] + .4, .08)
g(M.lib("click"), AT["s2:diakui"], .07)
g(M.lib("chime"), AT["s2:Inilah"], .05)
# s3: freeze
g(M.lib("whoosh-cinematic"), S["s3"] - .3, .06)
g(swell(rng, 1.6, 2400, 200), AT["s3:Musuh"], .06)
g(M.lib("click-soft"), AT["s3:Dua"], .07)
g(M.thump(.5), AT["s3:delapan"], .14)
g(swell(rng, 2.0, 120, 900), AT["s3:delapan"] - .2, .05)
# s4: body lifts (servo), motors spin up
g(metal(rng, 1.4, 160, 3.5), AT["s4:empat"] - .5, .05)
g(swell(rng, 1.2, 80, 500), AT["s4:empat"] - .5, .06)
for kk in ("s4:roda", "s4:kilowatt", "s4:total"):
    g(M.lib("click-soft"), AT[kk], .07)
spin = np.zeros(int(SR * 2.4)); tt = np.arange(len(spin)) / SR
spin = np.sin(2 * np.pi * np.cumsum(200 + 1400 * (tt / 2.4) ** 1.5) / SR) * np.minimum(1, tt * 3) * np.minimum(1, (2.4 - tt) * 4)
g(spin, AT["s4:berputar"], .03)
# s5: electric crackle-free hum + ticks
g(M.lib("whoosh-cinematic"), S["s5"] - .3, .05)
g(M.lib("ping"), AT["s5:volt"], .05)
g(M.lib("click"), AT["s5:tegangan"], .06)
g(M.lib("click"), AT["s5:Panas"], .06)
# s6: tyre macro
g(M.lib("whoosh-cinematic"), S["s6"] - .3, .05)
g(metal(rng, .8, 260, 6), AT["s6:Karet"], .04)
g(swell(rng, 1.6, 200, 1800), AT["s6:sentrifugal"] - .2, .05)
g(M.lib("pop"), AT["s6:selebar"], .07)
# s7: drain, snap shut, launch
g(swell(rng, 2.4, 1600, 200), AT["s7:penuh"], .05)
g(M.thump(.3), AT["s7:Lintasan"] - .2, .14)
g(M.lib("click"), AT["s7:Lintasan"] - .2, .08)
g(M.lib("riser"), AT["s7:Lintasan"] - .1, .05)
passby(AT["s7:kurang"] + .3, .09)
# s8
for kk in ("s8:udara", "s8:listrik", "s8:karet"):
    g(M.lib("click-soft"), AT[kk], .07)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
