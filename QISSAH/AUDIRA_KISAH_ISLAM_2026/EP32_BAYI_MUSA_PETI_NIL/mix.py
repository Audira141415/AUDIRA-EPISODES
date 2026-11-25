"""EP32 sound: maqam Nahawand on D (D, E, F, G, A, B-flat, C-sharp/C). A soft harp (plucked string partials with a long
ring) plays slow broken chords and short Nahawand phrases at about 66 bpm; a low cello-like drone (D2/A2, slow bowing
swell) holds the floor. No voices. The Nile runs under everything: band-limited water noise with slow ripples and small
droplet plinks, louder while the chest drifts (s4) and in the wide shots; papyrus wind on the banks.
Story cues: a water lap when the chest touches the river (s1, s4), a low dark tone as the village windows go out one by
one after the order (s2, no hits, no violence), soft chisel taps as the midwives' list is carved, a warm swell and a
rising harp run on "Kami akan mengembalikannya" (s3) as the gold line is traced, a muffled near-silence for the mother's
empty heart (s5 cross-cut), soft footsteps for the sister (s6), and the harp turning to D major colour when the chest
comes home (s7). A gentle chime on the sign-off. Music dips for a voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(3232)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
ROOT = 50  # D3
NAHA = [0, 2, 3, 5, 7, 8, 11]
MAJ = [0, 2, 4, 5, 7, 9, 11]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
n = lambda d: np.arange(int(d * SR)) / SR
deg = lambda d, sc=NAHA: ROOT + 12 + sc[d % 7] + 12 * (d // 7)

tSem, tTeg, tMaka, tSen = AT["s5:Sementara"], AT["s5:meneguhkan"], AT["s7:Maka"], AT["s7:senang"]


def harp(f, dur=2.6):
    t = n(dur)
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0004 * h)) * np.exp(-t * (0.9 + 0.9 * h)) / h ** 1.2 for h in range(1, 8))
    pick = M.band(rng.standard_normal(len(t)), 2000, 7000) * np.exp(-t * 160) * .08
    return (x + pick) * np.minimum(1, t / .002) * np.minimum(1, (dur - t) / .08)


hp = M.mono()


def arp(t0, chord, step=.22, amp=.2, sc=NAHA):
    for i, d in enumerate(chord):
        M.lay(hp, harp(hz(deg(d, sc))), t0 + i * step, amp)


def phrase(t0, notes, amp=.22, sc=NAHA):
    t = t0
    for d, b in notes:
        M.lay(hp, harp(hz(deg(d, sc)), max(1.6, b + 1.4)), t, amp)
        t += b


# slow broken chords through the film (i - iv - V - i in Nahawand), major colour after the chest comes home
beat = 60 / 66
prog = [[-7, -5, -3, 0], [-4, -2, 0, 3], [-3, -1, 1, 4], [-7, -5, -3, 0]]
t = .3
i = 0
while t < OUT - 1:
    major = t > tSen - .5
    if not (tSem + .2 < t < tTeg - .3):  # empty heart: the harp stops
        arp(t, prog[i % 4], beat / 2, .13 if not major else .15, MAJ if major else NAHA)
    t += beat * 4
    i += 1
phrase(.6, [(4, .7), (3, .45), (2, .45), (1, .45), (0, 1.6)], .2)
phrase(K["s3"] + .4, [(0, .6), (2, .6), (3, .6), (4, 1.4)], .2)
phrase(AT["s3:mengembalikannya"] - .2, [(0, .2), (2, .2), (4, .2), (6, .2), (7, .2), (9, .25), (11, 1.8)], .19)
phrase(K["s4"] + .3, [(4, .5), (5, .5), (4, .5), (3, .5), (2, 1.4)], .18)
phrase(AT["s5:penyejuk"] - .2, [(7, .6), (6, .4), (4, 1.6)], .17)
phrase(tTeg + .2, [(0, .7), (1, .7), (2, 1.8)], .17)
phrase(K["s6"] + .4, [(2, .45), (3, .45), (4, .45), (5, .45), (4, 1.2)], .16)
phrase(tMaka + .2, [(0, .5), (2, .5), (4, .5), (7, 2.0)], .2, MAJ)
phrase(AT["s7:janji"], [(4, .5), (5, .5), (7, 2.2)], .2, MAJ)
phrase(K["s8"] + .5, [(7, .7), (4, .7), (2, .7), (0, 2.4)], .18, MAJ)
phrase(AT["s8:Kisah"] - .2, [(4, .6), (2, .6), (0, 2.6)], .17, MAJ)

# bowed drone: D2 + A2, slow swell per segment; F turns to F# after the return
dr = M.mono()
seg = 8.0
for t0 in np.arange(-1, DUR, seg - 2.5):
    dt = n(seg)
    major = t0 >= tSen - 3
    for nn, a in ((ROOT - 12, .5), (ROOT - 5, .3), (ROOT + 4 if major else ROOT + 3, .12)):
        f = hz(nn)
        vib = 1 + .002 * np.sin(2 * np.pi * 5 * dt)
        x = sum(np.sin(2 * np.pi * f * h * dt * vib) / h ** 1.5 for h in range(1, 6))
        M.lay(dr, x * np.sin(np.pi * dt / dt[-1]) ** 2, max(0, t0), a)
menv = M.env([(0, .55), (K["s2"], .75), (AT["s2:dibunuh"], .6), (K["s3"], .8), (K["s4"], .85), (tSem - .1, .85), (tSem + .4, .25), (tTeg, .3), (tTeg + 1.5, .8),
              (K["s7"], .85), (tSen, 1.0), (K["s8"], 1.0), (DUR - .6, 0), (DUR, 0)])
music = np.stack([dr * .35 + hp * 1.1, dr * .35 + hp * .8], 1) * menv[:, None]

# ---------- the Nile: water bed + ripples + droplets, papyrus wind
wn = M.band(rng.standard_normal(N), 250, 2200) * .6 + M.band(rng.standard_normal(N), 2200, 6000) * .2
rip = .6 + .4 * np.sin(2 * np.pi * T / 2.3) * np.sin(2 * np.pi * T / 0.9 + 1)
wenv = M.env([(0, .7), (K["s2"], .35), (K["s3"], .2), (AT["s3:mengembalikannya"], .45), (K["s4"], .5), (AT["s4:melepasnya"], 1.0), (AT["s4:dipungut"], .5),
              (tSem, .25), (K["s6"], .4), (tMaka, .3), (K["s8"], .7), (DUR - .5, 0), (DUR, 0)])
M.fx += stereo(wn * rip * wenv * .035, M.band(rng.standard_normal(N), 400, 3000) * wenv * .012)
for k in range(140):
    tt = rng.uniform(0, OUT)
    f = rng.uniform(900, 2200)
    d = n(.09)
    g(np.sin(2 * np.pi * f * d * (1 + 3 * d)) * np.exp(-d * 60) * .05 * float(np.interp(tt, T, wenv)), tt)
wind = M.band(rng.standard_normal(N), 150, 900) * (.5 + .5 * np.sin(2 * np.pi * T / 6.1))
M.fx += stereo(wind * .012, wind * .006)


def lap(dur=1.0):
    t = n(dur)
    return M.band(rng.standard_normal(len(t)), 200, 2400) * np.sin(np.pi * t / dur) ** 1.5 * (1 + .5 * np.sin(2 * np.pi * 7 * t))


def tap():
    return M.band(M.burst(.08, 70, 1), 1500, 6000) * .6 + M.tone([2400, 3300], .08, 60) * .3


def step():
    return M.band(M.burst(.12, 40, 2), 120, 1500)


# s1: chest touches the water, released; "diselamatkan" warm chime
g(lap(1.2) * .16, .5)
g(lap(1.6) * .2, AT["s1:melepasnya"])
g(M.lib("chime") * .1, AT["s1:diselamatkan"])
# panel unrolls: a soft papyrus rustle on each card change
for a in ["s2", "s2:Tapi", "s3", "s3:Jika", "s3:Kami#2", "s4", "s4:Arus", "s5", "s5:Sementara", "s6", "s6:Bayi", "s7", "s7:Maka", "s8"]:
    if a in K:
        t0 = K[a]
    elif a in AT:
        t0 = AT[a]
    else:
        sc, w = a.split(":")
        nth = int(w.split("#")[1]) - 1 if "#" in w else 0
        t0 = M.word(sc, w.split("#")[0], nth)
    g(M.band(M.burst(.28, 14, 2), 1800, 7000) * .05, t0 - .02)
# s2: the order (low dark tone), windows going out (descending soft bell tones), chisel taps for the list
g(M.lib("impact-bass-1") * .14, AT["s2:Firaun"])
for k in range(10):
    g(M.tone([hz(ROOT + 12 - k), hz(ROOT + 24 - k)], 1.2, 3) * .04, AT["s2:dibunuh"] + .2 + k * .32)
for k in range(14):
    g(tap() * .12, AT["s2:mendata"] + k * (AT["s2:hamil"] + .3 - AT["s2:mendata"]) / 14)
g(M.tone([hz(ROOT + 24), hz(ROOT + 31)], 2.5, 1.5) * .06, AT["s2:lahir"])
# s3: promise line traced
g(M.lib("riser") * .08, AT["s3:mengembalikannya"] - 1.2)
g(M.lib("sparkle") * .12, AT["s3:mengembalikannya"] + .2)
# s4: set into the river, drift, lifted onto the terrace
g(lap(1.4) * .24, AT["s4:meletakkan"] + 1.3)
g(M.lib("whoosh-short") * .08, AT["s4:melepasnya"])
g(lap(1.0) * .2, AT["s4:tepi"] + .4)
for k in range(4):
    g(step() * .2, AT["s4:dipungut"] + .2 + k * .32)
g(M.lib("impact-bass-1") * .1, AT["s4:rumah"])
# s5: warm glow, then the empty heart
g(M.lib("chime") * .08, AT["s5:penyejuk"])
sw = M.mono()
st = n(5)
for nn in (ROOT - 12, ROOT - 5):
    M.lay(sw, np.sin(2 * np.pi * hz(nn) * st) * np.minimum(1, st / 1.5) * np.minimum(1, (5 - st) / 2), tSem + .1, .5)
M.fx += stereo(sw * .03, sw * .01)
g(M.tone([hz(ROOT + 12), hz(ROOT + 19)], 3.0, 1.0) * .05, tTeg)
# s6: sister's steps, then the nurses turned away (soft, low)
for k in range(5):
    g(step() * .16, AT["s6:ikutilah"] + .15 + k * .22)
for k in range(3):
    g(step() * .11, AT["s6:menolak"] - .3 + k * 1.05)
    g(step() * .09, AT["s6:menolak"] + .6 + k * 1.05)
# s7: sister climbs, cut home, the lamp warms
for k in range(6):
    g(step() * .14, AT["s7:Kakaknya"] + k * .3)
g(M.lib("whoosh-cinematic") * .08, tMaka - .2)
g(M.lib("sparkle") * .1, tSen)
g(M.lib("chime") * .12, AT["s7:janji"] + .3)
# s8 sign-off
g(M.lib("chime") * .1, AT["s8:Kisah"])
g(M.lib("chime") * .12, OUT)

M.finish(music)
