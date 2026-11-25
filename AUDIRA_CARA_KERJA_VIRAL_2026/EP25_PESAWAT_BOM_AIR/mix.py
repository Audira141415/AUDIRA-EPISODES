"""EP25 sound: a "Saturday-morning comic" bed. Tight 116 bpm funk kit (kick, snare crack, ticking hats), a bouncy E-minor
bass ostinato and bright brass-like stabs that punch each new panel. Under it: a four-turboprop drone that follows the
tanker (near in flight scenes, far at the airport and lake), a fire-crackle bed over the forest, water-gush splashes on
both drops, a scooper skim hiss, page-turn whooshes on panel changes and stamp hits on the comic stamps.
Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, swell, rumble, crackle

M = Mix(2525)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
OUT = B["outroAt"]


def saw(f, dur, n=9):
    t = np.arange(int(dur * SR)) / SR
    return sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, n + 1))


def stab(freqs, dur=.32):
    t = np.arange(int(dur * SR)) / SR
    x = sum(saw(f, dur) for f in freqs) / len(freqs)
    x = lowpass(x, 2600)
    return norm(x) * np.minimum(1, t / .006) * np.exp(-t * 7)


def snare(dur=.2):
    t = np.arange(int(dur * SR)) / SR
    n = M.band(rng.standard_normal(len(t)), 900, 7000)
    return norm(n) * np.exp(-t * 22) + .4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)


def hat(dur=.05):
    t = np.arange(int(dur * SR)) / SR
    return norm(M.band(rng.standard_normal(len(t)), 6000, 14000)) * np.exp(-t * 90)


def gush(dur=2.6, lo=200, hi=3500):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = norm(M.band(rng.standard_normal(n), lo, hi))
    return x * np.minimum(1, t / .08) * np.exp(-t * 1.1) * (1 + .3 * np.sin(2 * np.pi * 7 * t))


# --- funk kit + bass, 116 bpm, quieter in the explanation (s6) and over the peat beat ---
bt = 60 / 116
bass_notes = [82.4, 82.4, 98.0, 110.0, 123.5, 110.0, 98.0, 73.4]
music_m = np.zeros(N)
tp, i = .05, 0
while tp < END + 1.5:
    lvl = .55 if (S["s6"] <= tp < S["s7"] or AT["s7:Tapi"] <= tp < S["s8"]) else 1.0
    if i % 4 in (0, 2):
        g(M.thump(.26), tp, .07 * lvl)
    if i % 4 in (1, 3):
        g(snare(), tp, .028 * lvl)
    g(hat(), tp, .012 * lvl)
    g(hat(), tp + bt / 2, .008 * lvl)
    f = bass_notes[i % 8]
    b = saw(f, bt * .9, 5)
    tt = np.arange(len(b)) / SR
    b = lowpass(b, 600) * np.minimum(1, tt / .01) * np.exp(-tt * 3.5)
    j = int(tp * SR)
    e = min(N, j + len(b))
    music_m[j:e] += .05 * lvl * b[: e - j]
    tp += bt
    i += 1
e_m = M.env([(0, 1), (END, 1), (END + 1.2, .5), (DUR - .2, 0), (DUR, 0)])
music = stereo(music_m * e_m, .2 * music_m * e_m * np.sin(2 * np.pi * T * .07)) * 1.6

# --- brass stabs on every panel change ---
chords = [(164.8, 196.0, 246.9), (146.8, 185.0, 220.0), (130.8, 164.8, 196.0), (146.8, 185.0, 246.9)]
for n_, k in enumerate(("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")):
    t0 = max(.02, S[k] - .05)
    g(stab(chords[n_ % 4]), t0, .06)
    g(stab(chords[n_ % 4]), t0 + bt / 2, .035)
    if k != "s1":
        g(M.lib("whoosh-short"), S[k] - .35, .05)

# --- turboprop drone that follows the tanker ---
prop = norm(lowpass(saw(55, DUR, 6), 400) * (1 + .5 * np.sin(2 * np.pi * 18.3 * T)) + .4 * lowpass(rng.standard_normal(N), 250))
e_prop = M.env([(0, .9), (S["s2"], .7), (S["s2"] + 6, .15), (S["s3"], .05), (AT["s4:terbang"] - .5, .1), (AT["s4:terbang"] + .5, .8),
                (S["s5"], .9), (S["s6"], .75), (S["s7"], .35), (AT["s7:Tapi"], .1), (S["s8"], .25), (END, .2), (DUR, 0)])
g(np.stack([prop * e_prop, np.roll(prop, 701) * e_prop], 1), 0, .05)
# fire crackle bed over the forest
cr = crackle(rng, DUR, 26)
e_cr = M.env([(0, .8), (S["s3"] - .5, .8), (S["s3"], .1), (S["s5"], .7), (S["s7"], .15), (AT["s7:Tapi"], .9), (S["s8"], .5), (DUR, 0)])
g(cr[:N] * e_cr[: len(cr)], 0, .03)

# --- s1 hook drop + jump ---
g(M.lib("riser"), max(0, AT["s1:dijatuhkan"] - 1.2), .03)
g(gush(3.2), AT["s1:dijatuhkan"], .09)
g(M.lib("impact-bass-1"), AT["s1:dijatuhkan"] + .9, .09)
g(swell(rng, .7, 300, 2400), AT["s1:melompat"] - .15, .06)
g(M.lib("pop"), AT["s1:melompat"] + .05, .07)
# s2: badges, stamp
for kk in ("s2:tiga", "s2:Hercules"):
    g(M.lib("pop"), AT[kk], .06)
g(M.lib("impact-bass-1"), AT["s2:militer"], .08)
g(M.lib("click"), AT["s2:militer"] + .02, .06)
# s3: river X, hose fill, counter
g(M.lib("error"), AT["s3:sungai"], .04)
g(M.thump(.3), AT["s3:sungai"], .08)
fill = gush(max(1.0, AT["s3:liter"] - AT["s3:mengisi"] + .6), 150, 1400)
g(fill, AT["s3:mengisi"], .05)
g(M.lib("chime"), AT["s3:liter"], .05)
g(M.lib("click-soft"), AT["s3:menit"], .07)
# s4: takeoff, lane, hazard
g(swell(rng, 2.2, 90, 900), AT["s4:terbang"] - .6, .07)
g(M.lib("whoosh-cinematic"), AT["s4:terbang"] + .4, .06)
g(M.lib("sparkle"), AT["s4:menandai"], .04)
g(M.lib("glitch-1"), AT["s4:mengecek"], .03)
# s5: doors, main drop (slow motion)
g(M.lib("click"), AT["s5:pintu"], .08)
g(M.lib("click"), AT["s5:pintu"] + .18, .06)
g(lowpass(gush(6.5, 120, 2400), 1800), AT["s5:Air"], .11)
g(M.lib("impact-bass-1"), AT["s5:Air"] + 1.5, .08)
g(rumble(rng, 3.0, 60), AT["s5:Air"] + 1.2, .05)
# s6: jump
g(swell(rng, 1.4, 200, 2000), AT["s6:terdorong"] - .5, .07)
g(M.lib("pop"), AT["s6:terdorong"] + .05, .07)
g(M.lib("impact-bass-1"), AT["s6:terdorong"] + .05, .06)
# s7: scooper skim, counter end, peat
sk = gush(max(1.0, AT["s7:detik"] - AT["s7:menyendok"] + .4), 1500, 9000)
g(sk, AT["s7:menyendok"], .06)
g(M.lib("chime"), AT["s7:6.137"] + .2, .04)
g(M.lib("whoosh-cinematic"), AT["s7:Tapi"] - .3, .06)
g(rumble(rng, 2.6, 45), AT["s7:gambut"] - .2, .07)
g(M.lib("impact-bass-1"), AT["s7:gambut"], .07)
# s8: payoff + outro
g(M.lib("riser"), AT["s8:membeli"] - 1.0, .03)
g(M.lib("pop"), AT["s8:membeli"], .06)
g(M.lib("chime"), OUT + .05, .08)
M.finish(music)
print("duration", DUR)
