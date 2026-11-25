"""EP04 sound: koto-like plucks on a miyako-bushi scale, a low shamisen line and taiko accents at 84 BPM; paper card
shuffles, a soft taxi horn, a spring boing for the Ultra Hand and seal-stamp thuds. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4889)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]


def koto(f, dur=1.4, bend=0.0):
    t = np.arange(int(dur * SR)) / SR
    ff = f * (1 + bend * np.exp(-t * 9))
    ph = 2 * np.pi * np.cumsum(ff) / SR
    x = sum(np.sin(ph * h) * np.exp(-t * (2.2 + h * 1.4)) / h ** 1.1 for h in range(1, 7))
    return x * np.minimum(1, t / .002)


def shami(f, dur=.5):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (7 + h * 3)) / h for h in range(1, 10))
    return x * np.minimum(1, t / .001) + .25 * M.band(M.burst(dur, 90, 1), 1500, 6000)[: len(t)]


def taiko(a=1.0):
    t = np.arange(int(.7 * SR)) / SR
    return a * (np.sin(2 * np.pi * (48 * t + 30 * (1 - np.exp(-t * 25)) / 25)) * np.exp(-t * 6) + .3 * M.band(M.burst(.7, 30, 4), 60, 400))


# miyako-bushi scale on E: E F A B C
scale = [0, 1, 5, 7, 8, 12, 13, 17, 19, 20]
root = 329.63
beat = 60 / 84
ko, sh, tk = M.mono(), M.mono(), M.mono()
phr = [[4, 3, 2, 0], [5, 4, 2, 3], [7, 5, 4, 2], [3, 2, 1, 0]]
t0, i = 0.0, 0
while t0 < END + 1:
    bar = (i // 8) % 4
    if i % 2 == 0 or i % 8 == 7:
        nn = phr[bar][(i // 2) % 4]
        M.lay(ko, koto(root * 2 ** (scale[nn] / 12), 1.6, .012 if i % 4 == 0 else 0), t0, .55)
    if i % 8 in (0, 3, 6):
        M.lay(sh, shami(root / 2 * 2 ** (scale[[0, 2, 3, 0][bar]] / 12)), t0, .45)
    if i % 16 == 0:
        M.lay(tk, taiko(), t0, .8)
    if i % 16 == 12:
        M.lay(tk, taiko(.5), t0, .6)
    t0 += beat / 2
    i += 1
# the share-price fall: music thins out
e = M.env([(0, .8), (K["s2"], 1), (K["s5"], .55), (K["s5e"], .55), (K["s6"], .9), (AT["s6:Ultra"], 1.1), (K["s7"], .8), (K["s8"], 1), (END + .4, 1), (DUR, .2)])
music = stereo(.5 * ko * e + .4 * sh * e + .55 * tk * e, .12 * np.roll(ko, 700) * e)


def flick(t, a=.05):
    d = M.band(M.burst(.025, 140, 1), 2000, 9000)
    g(d, t, a)


def shuffle(t, n=18, span=.8, a=.05):
    for k in range(n):
        flick(t + span * k / n + M.rng.random() * .02, a * (.7 + .3 * M.rng.random()))


def stamp(t, a=.32):
    g(taiko(.9), t, a)
    g(M.band(M.burst(.12, 45, 2), 150, 1500), t, a * .5)


def horn(t, a=.06):
    x = np.concatenate([M.note(392, .16, "square", 6), np.zeros(int(.06 * SR)), M.note(494, .22, "square", 5)])
    g(M.band(x, 200, 2500), t, a)


def boing(t, a=.18):
    tt = np.arange(int(.9 * SR)) / SR
    f = 180 + 420 * np.exp(-tt * 5) * (1 + .25 * np.sin(2 * np.pi * 14 * tt))
    g(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.2), t, a)


shuffle(.05, 22, 1.1, .045)
shuffle(AT["s1:kartu"] - .2, 20, .7, .05)
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[x] - .16, .13)
    g(taiko(.6), K[x], .22)
for k in range(9):
    g(M.band(M.burst(.05, 60, 2), 300, 2500), K["s2"] + .3 + k * 1.1, .07)
g(M.lib("chime"), AT["s2:serahkan"], .12)
stamp(AT["s2:tidak"])
shuffle(AT["s3:Penjualannya"], 26, 1.2, .05)
g(M.lib("riser"), AT["s3:melonjak"] - .8, .07)
g(M.lib("click-soft"), AT["s3:jenuh"], .2)
horn(AT["s4:Daiya"])
g(M.lib("pop"), AT["s4:nasi"] - .3, .12)
g(M.band(M.burst(1.2, 2, 6), 400, 3000), AT["s4:penyedot"], .03)
for k in range(3):
    stamp(AT["s4:Semuanya"] + .05 + k * .25, .26)
g(taiko(1), AT["s5:1964"] if "s5:1964" in AT else K["s5"] + 1.5, .2)
for k in range(5):
    g(M.note(660 - k * 90, .3, "pluck", 5), AT["s5:jatuh"] + k * .32, .1)
stamp(AT["s5:enam"], .22)
boing(AT["s6:mainan"] - .2)
g(M.lib("pop"), AT["s6:Gunpei"] + .1, .1)
stamp(AT["s6:Ultra"] - .3, .22)
g(M.lib("sparkle"), AT["s6:Ultra"], .12)
for k in range(4):
    g(M.band(M.burst(.18, 20, 3), 800, 5000), AT["s6:laku"] + k * .2, .05)
g(M.lib("whoosh"), AT["s7:Ternyata"] + .1, .1)
g(M.lib("whoosh"), AT["s7:Ternyata"] + .4, .1)
stamp(AT["s7:buktinya"], .34)
shuffle(AT["s7:laporan"], 8, .3, .05)
shuffle(AT["s7:koran"], 8, .3, .05)
g(M.band(M.burst(1.8, 1.2, 8), 300, 4000), K["s8"] + .4, .025)
for x in ("kartu", "taksi", "nasi"):
    g(koto(root * 2, 1.0), AT["s8:" + x], .14)
g(M.lib("chime"), AT["s8:Menurutmu"], .12)
stamp(AT["s8:AUDIRA"] - .1, .24)
g(M.lib("sparkle"), OUT - .4, .12)
g(taiko(1), OUT, .26)
M.finish(music)
