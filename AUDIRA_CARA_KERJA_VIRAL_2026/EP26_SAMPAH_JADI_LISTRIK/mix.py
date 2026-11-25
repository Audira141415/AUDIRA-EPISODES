"""EP26 sound: a "claymation workshop" bed. Warm 98 bpm kalimba/marimba ostinato in C major pentatonic over a round,
tuba-like bass and soft brush shuffle; it thins out for the "why" scene (s6) and opens up for the payoff (s7-s8).
Under it: diesel truck idle on the road and deck, a soft furnace roar that comes forward whenever the camera is at the
grate, steam hiss and a rising turbine whine in s5, crane motor whir and a clay "plop" on the grab drop.
Panel changes get a squishy clay plop (pitch-drop sine + soft noise), counters get a soft wooden tick roll.
Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, swell, rumble, crackle

M = Mix(2626)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
OUT = B["outroAt"]


def mallet(f, dur=.5, bright=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + .35 * bright * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t * 18) + .15 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 40)
    return x * np.minimum(1, t / .003) * np.exp(-t * 6)


def tuba(f, dur):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.6 for k in range(1, 6))
    return x * np.minimum(1, t / .03) * np.exp(-t * 2.2)


def brush(dur=.12):
    t = np.arange(int(dur * SR)) / SR
    return norm(M.band(rng.standard_normal(len(t)), 2500, 9000)) * np.exp(-t * 30) * np.minimum(1, t / .01)


def plop(f0=220, dur=.28):
    t = np.arange(int(dur * SR)) / SR
    ph = 2 * np.pi * (f0 * .45 * t + f0 * .55 * (1 - np.exp(-t * 22)) / 22)
    return np.sin(ph) * np.exp(-t * 16) + .2 * M.burst(dur, 45, 6)


def hiss(dur, lo=2500, hi=11000):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return norm(M.band(rng.standard_normal(n), lo, hi)) * np.minimum(1, t / .15) * np.minimum(1, (dur - t) / .3)


def whir(dur, f0, f1):
    t = np.arange(int(dur * SR)) / SR
    f = f0 + (f1 - f0) * t / dur
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + .3 * np.sin(2 * ph) + .15 * np.sin(3.01 * ph)) * np.minimum(1, t / .2) * np.minimum(1, (dur - t) / .25)


# --- music: kalimba ostinato + tuba bass + brushes ---
bt = 60 / 98
scale = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3]
pattern = [0, 2, 4, 5, 4, 2, 3, 1, 0, 2, 4, 7, 6, 4, 3, 2]
bass = [65.4, 65.4, 87.3, 98.0, 65.4, 73.4, 87.3, 98.0]
music_m = np.zeros(N)
side_m = np.zeros(N)


def add_m(x, t0, gain, pan=0.0):
    i = int(t0 * SR)
    e = min(N, i + len(x))
    if i >= N:
        return
    music_m[i:e] += gain * x[: e - i]
    side_m[i:e] += pan * gain * x[: e - i]


tp, i = .05, 0
while tp < END + 1.5:
    thin = S["s6"] <= tp < S["s7"]
    lvl = .55 if thin else (1.15 if tp >= S["s7"] else 1.0)
    n = pattern[i % 16]
    add_m(mallet(scale[n], .55), tp, .05 * lvl, .5 if i % 2 else -.5)
    if not thin and i % 4 == 2:
        add_m(mallet(scale[(n + 2) % 8] * 2, .4, .6), tp + bt / 4, .02 * lvl, .7)
    if i % 2 == 0:
        add_m(tuba(bass[(i // 2) % 8], bt * 1.8), tp, .07 * lvl)
    add_m(brush(), tp + bt / 2, .012 * lvl, -.3)
    tp += bt / 2
    i += 1
e_m = M.env([(0, .9), (END, 1), (END + 1.2, .55), (DUR - .2, 0), (DUR, 0)])
music = stereo(music_m * e_m, side_m * e_m * .6) * 1.5

# --- ambience: trucks, furnace, plant hum ---
eng = norm(lowpass(rng.standard_normal(N), 140)) * (1 + .4 * np.sin(2 * np.pi * 28 * T))
e_eng = M.env([(0, .8), (S["s1"] + 4.5, .7), (AT["s1:dibakar"], .15), (S["s2"], .2), (S["s3"], .7), (AT["s3:diperam"], .2), (S["s4"], .05), (S["s8"], .25), (DUR, 0)])
g(np.stack([eng * e_eng, np.roll(eng, 331) * e_eng], 1), 0, .05)
roar = norm(lowpass(rng.standard_normal(N), 380)) * (1 + .25 * np.sin(2 * np.pi * .7 * T))
e_roar = M.env([(0, .25), (AT["s1:dibakar"] - .5, .3), (AT["s1:dibakar"] + .3, 1), (S["s2"], .5), (S["s3"], .2), (S["s4"], 1), (S["s5"], .45), (S["s6"], .9), (AT["s6:Asapnya"], .3), (S["s7"], .2), (DUR, 0)])
g(np.stack([roar * e_roar, np.roll(roar, 517) * e_roar], 1), 0, .06)
cr = crackle(rng, DUR, 18)
g(cr[:N] * e_roar[: len(cr)], 0, .02)

# --- panel plops on every scene change ---
for n_, k in enumerate(("s2", "s3", "s4", "s5", "s6", "s7", "s8")):
    g(plop(260 - n_ * 12), S[k] - .1, .09)
    g(M.lib("whoosh-short"), S[k] - .4, .035)

# s1 hook
g(M.lib("pop"), AT["s1:ton"], .06)
g(swell(rng, 1.4, 100, 900), AT["s1:dibakar"] - .6, .08)
g(M.lib("impact-bass-1"), AT["s1:tungku"], .07)
g(M.lib("sparkle"), AT["s1:listrik"], .05)
# s2: sign, counter, date
g(plop(330), AT["s2:PSEL"], .06)
tick_end = AT["s2:mengalirkan"] + max(.4, AT["s2:18,6"] - AT["s2:mengalirkan"])
tt = AT["s2:mengalirkan"]
while tt < tick_end:
    g(M.lib("click-soft"), tt, .025)
    tt += .09
g(M.lib("chime"), tick_end, .05)
g(crackle(rng, 1.2, 40), AT["s2:mengalirkan"], .025)
g(M.lib("pop"), AT["s2:Peresmian"], .05)
# s3: tip, drips, crane
g(swell(rng, 1.8, 90, 1400), AT["s3:menumpahkan"] + .2, .09)
for k in range(8):
    g(plop(150 + 30 * (k % 3), .2), AT["s3:menumpahkan"] + .55 + k * .09, .04)
for k in range(10):
    g(M.tone([1300 + 140 * (k % 4)], .07, 40), AT["s3:Airnya"] + k * .32, .025)
g(whir(max(1.0, AT["s3:corong"] - AT["s3:Capit"] + .3), 180, 260), AT["s3:Capit"] - .2, .03)
g(M.lib("click"), AT["s3:Capit"] + .4, .06)
for k in range(5):
    g(plop(190 - k * 8, .22), AT["s3:corong"] + .4 + k * .06, .05)
# s4: grate shuffle and air
for k in range(12):
    g(M.thump(.18), AT["s4:jeruji"] + k * .85, .025)
g(hiss(2.2, 300, 1800), AT["s4:Udara"] - .1, .05)
g(M.lib("pop"), AT["s4:atas"], .04)
g(M.lib("pop"), AT["s4:tengah"], .045)
g(M.lib("pop"), AT["s4:ujung"], .04)
# s5: boil, steam, turbine spin-up, spark
g(rumble(rng, 2.0, 220), AT["s5:merebus"], .04)
g(hiss(5.0), AT["s5:uap"] - .2, .05)
g(whir(max(3.0, S["s6"] - AT["s5:turbin"]), 240, 720), AT["s5:turbin"] - .4, .025)
g(crackle(rng, .9, 50), AT["s5:generator"], .04)
g(M.lib("chime"), AT["s5:Kapasitasnya"] + .3, .04)
g(M.lib("ping"), AT["s5:dijual"], .04)
# s6: tick-tock 2 s, molecule pop, lime/carbon puffs, bags
g(M.lib("riser"), AT["s6:gas"] - .8, .03)
for k in range(8):
    g(M.tone([880 if k % 2 == 0 else 660], .05, 60), AT["s6:gas"] + k * .5, .03)
g(M.lib("impact-bass-1"), AT["s6:dioksin"], .06)
for k in range(6):
    g(plop(400 + 60 * k, .15), AT["s6:dioksin"] + .05 + k * .05, .035)
g(hiss(.7, 1500, 6000), AT["s6:kapur"], .05)
g(hiss(.7, 600, 3000), AT["s6:karbon"], .05)
for k in range(4):
    g(M.thump(.2), AT["s6:kantong"] + k * .2, .03)
# s7: counter, city lights twinkle, ash
tt = AT["s7:Pabriknya"]
while tt < AT["s7:1.000"]:
    g(M.lib("click-soft"), tt, .022)
    tt += .09
g(M.lib("chime"), AT["s7:1.000"], .05)
for k in range(10):
    g(M.tone([1046.5 * (1 + (k % 5) * .125)], .35, 9), AT["s7:setara"] + k * .16, .018)
g(M.thump(.35), AT["s7:Abunya"], .06)
g(swell(rng, 1.2, 80, 600), AT["s7:Abunya"] + .2, .04)
# s8 + outro
g(M.lib("sparkle"), AT["s8:menyalakan"], .05)
g(M.lib("chime"), OUT + .05, .08)
M.finish(music)
print("duration", DUR)
