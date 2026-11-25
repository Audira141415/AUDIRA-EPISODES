"""EP27 sound: a "toy harbour at dusk" bed. A soft wooden-block marimba arpeggio (D major pentatonic, 92 bpm) over a warm
detuned pad, with harbour air under it: water lapping on the quay, gulls-free distant hull creaks and one low ship horn in
the hook. The mechanism gets its own foley: wind-turbine whoosh on the island, a cold liquid hiss in the pipe, frost
crackle in the cut tank, a two-stroke chug locked to the cylinder cycle the picture shows (period 2.6 s, pilot tick + burn
thump each cycle), a catalyst shimmer, and one wooden clack for every voxel block that stacks in the tank comparison.
Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, swell, rumble, crackle, metal

M = Mix(2727)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
OUT = B["outroAt"]


def mallet(f, dur=.55):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t * 18) + .12 * np.sin(2 * np.pi * f * 9.1 * t) * np.exp(-t * 40)
    return x * np.minimum(1, t / .003) * np.exp(-t * 6.5)


def clack(f=900, dur=.09):
    t = np.arange(int(dur * SR)) / SR
    return norm(M.band(rng.standard_normal(len(t)), f, f * 4)) * np.exp(-t * 70) + .5 * np.sin(2 * np.pi * f * .5 * t) * np.exp(-t * 55)


def hiss(dur, lo=2500, hi=9000):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return norm(M.band(rng.standard_normal(n), lo, hi)) * np.minimum(1, t / .15) * np.minimum(1, (dur - t) / .3)


# --- marimba arpeggio + pad ---
bt = 60 / 92
scale = [146.8, 164.8, 185.0, 220.0, 246.9, 293.7, 329.6, 370.0]
pattern = [0, 2, 4, 5, 3, 4, 2, 1, 0, 2, 5, 6, 4, 3, 2, 4]
music_m = np.zeros(N)
tp, i = .1, 0
while tp < END + 1.5:
    lvl = .6 if S["s5"] <= tp < S["s7"] else 1.0  # make room for the engine foley
    x = mallet(scale[pattern[i % 16]] * (1 if (i // 32) % 2 == 0 else 1.122))
    j = int(tp * SR); e = min(N, j + len(x))
    music_m[j:e] += .05 * lvl * x[: e - j]
    if i % 4 == 0:
        x = mallet(scale[0] / 2, .9); e = min(N, j + len(x)); music_m[j:e] += .035 * lvl * x[: e - j]
    tp += bt / 2
    i += 1
pad = sum(np.sin(2 * np.pi * f * T + k) * a for k, (f, a) in enumerate(((73.4, 1), (73.6, .8), (110.0, .5), (146.8, .3), (185.0, .18))))
pad = lowpass(pad, 900) * (1 + .15 * np.sin(2 * np.pi * T * .11))
e_m = M.env([(0, .0), (.4, 1), (END, 1), (END + 1.2, .5), (DUR - .2, 0), (DUR, 0)])
music = stereo((music_m + .022 * pad) * e_m, .25 * music_m * e_m * np.sin(2 * np.pi * T * .09)) * 1.5

# --- harbour air: water lapping + soft wind, quieter on the island and inside the engine ---
lap = norm(lowpass(rng.standard_normal(N), 500)) * (0.6 + 0.4 * np.sin(2 * np.pi * T * .33) ** 2)
e_lap = M.env([(0, 1), (S["s3"], .5), (S["s4"], 1), (S["s5"], .25), (S["s7"], .8), (DUR, .6)])
g(np.stack([lap * e_lap, np.roll(lap, 911) * e_lap], 1), 0, .025)
# ship horn in the hook (low, two partials)
hz = np.arange(int(2.6 * SR)) / SR
horn = (np.sin(2 * np.pi * 82 * hz) + .5 * np.sin(2 * np.pi * 164 * hz) + .2 * np.sin(2 * np.pi * 246 * hz)) * np.minimum(1, hz / .25) * np.minimum(1, (2.6 - hz) / .8)
g(lowpass(horn, 700), .25, .05)

# --- s1: carbon crossed out, pilot drop ignites ---
g(M.lib("glitch-1"), AT["s1:karbon"], .03)
g(M.lib("pop"), AT["s1:Tapi"], .05)
g(M.lib("riser"), max(0, AT["s1:solar"] - 1.1), .025)
g(M.burst(.6, 9, 4), AT["s1:solar"] + .05, .05)
g(M.thump(.35), AT["s1:solar"] + .05, .08)
# scene changes: soft whoosh + a mallet accent
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), S[k] - .35, .045)
    g(mallet(587.3, .8), S[k], .03)
# --- s2: counter and stamp ---
g(hiss(max(1.0, AT["s2:ton"] - AT["s2:diisi"] + .5), 1200, 5000), AT["s2:diisi"], .02)
g(M.lib("chime"), AT["s2:ton"], .045)
g(M.lib("impact-bass-1"), AT["s2:Bukan"], .06)
g(M.lib("click"), AT["s2:raksasa"], .05)
# --- s3: turbines, electrolysis bubbles, assembly pops ---
g(swell(rng, 3.5, 150, 1200), S["s3"] - .2, .05)
for k, kk in enumerate(("s3:listrik", "s3:memecah", "s3:udara")):
    g(M.lib("click-soft"), AT[kk], .06)
for k in range(10):
    g(clack(1400 + 120 * k, .05), AT["s3:memecah"] + .12 * k, .012)
for k in range(4):
    g(M.lib("pop"), AT["s3:Satu"] + .2 + k * .25, .045)
g(M.lib("sparkle"), AT["s3:Satu"] + 1.3, .04)
# --- s4: lid lifts, cold hiss, frost crackle, pipe flow ---
g(metal(rng, 1.4, 150, 2.5), S["s4"] - .1, .03)
g(hiss(3.0, 4000, 11000), AT["s4:mendidih"], .02)
cr = crackle(rng, 4.0, 40)
g(cr * .6, AT["s4:mendidih"] + .2, .025)
g(hiss(max(1.0, K["s4e"] - AT["s4:pipa"] + .4), 900, 3500), AT["s4:pipa"], .03)
# --- s5-s6: two-stroke chug locked to the picture's cylinder (period 2.6 s, TDC at multiples of 2.6) ---
P = 2.6
e_eng = M.env([(0, 0), (S["s5"] - .8, 0), (S["s5"] + .4, 1), (S["s7"] - .2, 1), (S["s7"] + .8, 0), (DUR, 0)])
tdc = np.arange(0, DUR, P)
for t0 in tdc:
    a = float(np.interp(t0, T, e_eng))
    if a < .02:
        continue
    g(clack(2600, .04), t0 - .07 * P, .025 * a)          # pilot injector tick
    g(M.thump(.42), t0 + .01, .09 * a)                    # burn
    g(M.burst(.35, 14, 6), t0 + .02, .02 * a)
    g(lowpass(M.burst(.5, 8, 3), 700), t0 + .55 * P, .03 * a)  # exhaust puff
g(M.lib("ping"), AT["s5:651"], .04)
g(M.lib("click"), AT["s5:disemprot"], .05)
g(M.lib("sparkle"), AT["s5:pilot"], .045)
# --- s6: stamp, chips, catalyst shimmer ---
g(M.lib("impact-bass-1"), AT["s6:nol"], .06)
for k in range(3):
    g(M.lib("pop"), AT["s6:Masih"] + .4 + k * .45, .04)
sh = np.arange(int(2.5 * SR)) / SR
shimmer = sum(np.sin(2 * np.pi * f * sh) for f in (1760, 2217, 2637)) / 3 * np.minimum(1, sh / .3) * np.exp(-sh * 1.2)
g(shimmer, AT["s6:Katalis"], .03)
# --- s7: bars + one clack per stacked block (timing mirrors world3d.js) ---
g(M.lib("click-soft"), AT["s7:energi"], .05)
for j in range(8):
    g(clack(700), AT["s7:energi"] - .4 + j * .06 + .3, .05)
step = (AT["s7:tiga"] - AT["s7:tangkinya"] + .5) / 24
for j in range(24):
    g(clack(560 + 15 * (j % 6)), AT["s7:tangkinya"] - .2 + j * step + .3, .045)
g(M.lib("impact-bass-1"), AT["s7:tiga"], .05)
# --- s8: payoff ignition + outro ---
g(M.lib("riser"), AT["s8:dinyalakan"] - 1.0, .025)
g(M.burst(.6, 9, 4), AT["s8:dinyalakan"] + .4, .04)
g(M.lib("chime"), OUT + .05, .08)
M.finish(music)
print("duration", DUR)
