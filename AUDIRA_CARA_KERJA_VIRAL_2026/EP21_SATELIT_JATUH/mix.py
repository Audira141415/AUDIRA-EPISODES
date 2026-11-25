"""EP21 sound: a calm "re-entry lab" bed. A low open-fifth drone in A, a slow 72 bpm instrument tick (the lab clock that
tracks the forecast), soft sonar-like radar pings, and a high thin wind that thickens as the orbit decays. Re-entry
brings a filtered plasma roar under s6, breakup crackle and metal in s7, then everything settles for the outro.
SFX: streak whoosh, radar pings, sun swell, tug spin-out, altitude clicks, shock roar, breakup, risk meter, BRIN chime.
Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell, metal, rumble, crackle

M = Mix(2121)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}


def ping(f0=1320, dur=.9):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f0 * t) + .3 * np.sin(2 * np.pi * f0 * 2.01 * t)) * np.exp(-t * 6) * np.minimum(1, t / .003)


def tick(f0=2400):
    t = np.arange(int(.03 * SR)) / SR
    return np.sin(2 * np.pi * f0 * t) * np.exp(-t * 180)


def roar(dur, lo=60, hi=900):
    n = int(dur * SR)
    x = norm(lowpass(rng.standard_normal(n), hi) - lowpass(rng.standard_normal(n), lo))
    t = np.arange(n) / SR
    return x * np.minimum(1, t / .6) * np.minimum(1, (dur - t) / .8)


# bed: A open-fifth drone + thin high wind that grows with orbital decay
pad = drone(T, 55.0, ((1, 1), (1.003, .7), (1.5, .4), (2.0, .25), (3.0, .08)))
wind = norm(lowpass(rng.standard_normal(N), 2600) - lowpass(rng.standard_normal(N), 700))
e_p = M.env([(0, .55), (S["s3"], .8), (S["s5"], 1.0), (S["s6"], 1.1), (S["s7"] + 6, .85), (END, .6), (DUR - .2, 0), (DUR, 0)])
e_w = M.env([(0, .5), (S["s2"], .2), (S["s4"], .35), (S["s5"], .7), (S["s6"], 1.0), (S["s7"] + 6, .3), (END, .15), (DUR, 0)])
mono = .05 * pad * e_p + .02 * wind * e_w
side = .016 * pad * e_p * np.sin(2 * np.pi * T * .09) + .012 * (np.roll(wind, 7001) - wind) * e_w
music = stereo(mono, side) * 1.9
# lab clock: 72 bpm tick, quieter under the plasma (s6)
bt = 60 / 72
tp = .2
while tp < END:
    on = .4 if S["s6"] <= tp < S["s7"] + 5 else 1.0
    g(tick(2400 if int(tp / bt) % 4 else 1800), tp, .05 * on)
    tp += bt
# radar pings every ~4 bars in the orbit scenes
tp = S["s2"] + .4
while tp < S["s6"]:
    g(ping(1320 if rng.random() > .4 else 990), tp, .022)
    tp += 3.3 + rng.uniform(0, 1.2)


def dive(at, gain=.07):
    g(M.lib("whoosh-cinematic"), at - .45, gain)
    g(swell(rng, 1.4, 150, 2200), at - .7, gain * .7)


# s1: streak crossing, ignition glow, breakup sparkle
g(roar(4.0, 80, 1400), .0, .05)
g(M.lib("whoosh-cinematic"), max(0, AT["s1:terbakar"] - .8), .08)
g(crackle(rng, 1.4, 50), AT["s1:terbakar"] + .3, .03)
g(M.lib("sparkle"), AT["s1:terbakar"] + .5, .035)
g(M.lib("impact-bass-1"), AT["s1:jatuh"], .06)
# s2: lab station, counters, stamps
dive(S["s2"])
g(M.lib("ping"), AT["s2:Swift"], .05)
g(M.lib("typing"), AT["s2:tahun"], .03)
g(M.lib("click-soft"), AT["s2:korban"], .07)
g(M.lib("click-soft"), AT["s2:puing"], .07)
# s3: orbit vectors
g(M.lib("pop"), AT["s3:jatuh"], .05)
g(M.lib("pop"), AT["s3:cepat"], .05)
g(M.lib("whoosh-short"), AT["s3:meleset"], .05)
g(swell(rng, 2.4, 1500, 6000), AT["s3:udara"] - .2, .03)
g(M.lib("click"), AT["s3:mencuri"], .05)
# s4: sun flare, atmosphere swells, tug spins away
g(M.lib("riser"), AT["s4:Matahari"] - 1.0, .045)
g(swell(rng, 3.0, 60, 500), AT["s4:memanas"] - .3, .07)
g(M.thump(.45), AT["s4:mengembang"], .1)
g(M.lib("error"), AT["s4:mesin"], .03)
g(M.lib("glitch-1"), AT["s4:gagal"], .03)
g(metal(rng, 1.0, 520, 5.0), AT["s4:gagal"] + .2, .025)
# s5: altitude steps
for kk in ("s5:Oktober", "s5:November"):
    g(M.lib("click-soft"), AT[kk], .08)
    g(M.thump(.3), AT[kk] + .05, .05)
g(M.lib("chime"), AT["s5:diakhiri"], .035)
g(M.lib("riser"), AT["s5:rendah"] - .2, .04)
# s6: into the plasma
dive(S["s6"], .08)
g(roar(S["s7"] + (AT["s7:melesat"] - S["s7"]) - AT["s6:batas"] + .5, 50, 700), AT["s6:batas"], .09)
g(rumble(rng, 5.0, 60), AT["s6:termampatkan"] - .5, .06)
g(M.lib("impact-bass-1"), AT["s6:bukan"], .07)
# s7: breakup, SE streak, risk meter, BRIN times
g(crackle(rng, 1.6, 90), AT["s7:Panel"], .05)
g(metal(rng, 1.4, 300, 3.0), AT["s7:hancur"], .05)
g(crackle(rng, 2.0, 140), AT["s7:hancur"] + .1, .04)
g(M.lib("sparkle"), AT["s7:Tungsten"], .035)
g(M.lib("whoosh-cinematic"), AT["s7:melesat"] - .3, .07)
g(M.lib("ping"), AT["s7:tenggara"], .045)
g(M.lib("click"), AT["s7:Risiko"], .06)
g(M.lib("click-soft"), AT["s7:ambang"], .07)
g(M.lib("error"), AT["s7:NASA"] + .3, .025)
g(M.lib("typing"), AT["s7:Prakiraan"], .03)
g(M.lib("chime"), AT["s7:nyatanya"], .06)
# s8: settle
g(swell(rng, 2.2, 1800, 140), S["s8"] - .3, .04)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
