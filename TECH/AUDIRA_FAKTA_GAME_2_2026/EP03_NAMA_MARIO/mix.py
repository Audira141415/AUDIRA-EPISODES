"""EP03 sound: a comic-book funk groove at 112 BPM (slap-style saw bass, brass stabs, tight kit), page-flip rustles on
every panel, knock-knock, a record scratch for version B and a quiet bare bed for the obituary panel. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(303)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
K = {x: M.scene(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
Ke = {x: M.scene(x)["end"] for x in ("s6", "s7")}

beat = 60 / 112
six = beat / 4
bass, brass, kick, snare, hat, pad = (M.mono() for _ in range(6))
root = 87.31  # F2
prog = [0, 5, -2, 5]
bpat = [(0, 0, .22), (3, 0, .1), (6, 12, .1), (8, 10, .18), (10, 7, .1), (12, 5, .14), (14, 3, .1)]
bar, t0 = 0, 0.0
while t0 < END + 3:
    rt = prog[bar % 4]
    for pos, semi, ln in bpat:
        f = root * 2 ** ((rt + semi) / 12)
        M.lay(bass, M.note(f, ln + .05, "saw", 7, .003), t0 + pos * six, .5)
    for pos in (6, 14):
        for semi in (0, 4, 7, 10):
            M.lay(brass, M.note(root * 2 * 2 ** ((rt + semi + 12) / 12), .2, "saw", 9, .012), t0 + pos * six, .14)
    for pos in (0, 7, 8):
        M.lay(kick, M.thump(.22), t0 + pos * six, .6 if pos != 7 else .35)
    for pos in (4, 12):
        M.lay(snare, M.burst(.16, 26, 2), t0 + pos * six, .5); M.lay(kick, M.note(190, .12, "sine", 30), t0 + pos * six, .2)
    for pos in range(0, 16, 2):
        M.lay(hat, M.burst(.035, 120, 1), t0 + pos * six, .18 if pos % 4 else .1)
    for semi in (0, 4, 7):
        M.lay(pad, M.note(root * 4 * 2 ** ((rt + semi) / 12), beat * 4, "tri", .4, .4), t0, .1)
    t0 += 16 * six
    bar += 1
hat = M.band(hat, 5000, 14000)
snare = M.band(snare, 900, 7000)
brass = M.band(brass, 200, 3200)

tT = AT["s6:Tapi"]
full = M.env([(0, .85), (K["s2"], 1), (tT - .02, 1), (tT + .25, 0), (AT["s6:Don"] - .3, 0), (AT["s6:Don"], .9), (Ke["s6"], .9), (K["s7"] + .6, 0), (Ke["s7"] - .3, 0), (K["s8"] + .2, 1), (END + .4, 1), (DUR, .15)])
quiet = M.env([(0, 0), (K["s7"] - .2, 0), (K["s7"] + .8, 1), (Ke["s7"], 1), (K["s8"] + .4, 0), (DUR, 0)])
low = M.env([(0, 1), (K["s7"], 1), (K["s7"] + .6, .35), (Ke["s7"], .35), (K["s8"], 1), (DUR, 1)])
drums = .9 * kick + .55 * snare + .35 * hat
mono = .6 * bass * np.maximum(full, .35 * quiet) * low + .35 * brass * full + drums * full + pad * (.25 * full + .9 * quiet)
music = stereo(mono, .12 * np.roll(brass, 400) * full + .1 * np.roll(pad, 700) * quiet)


def rustle(t, a=.09):
    x = M.band(M.burst(.32, 9, 1), 1500, 8000) * np.sin(np.linspace(0, np.pi, int(.32 * SR))) ** .5
    g(x, t, a)


def knock(t, a=.32):
    g(M.thump(.14), t, a)
    g(M.band(M.burst(.05, 70, 1), 500, 2600), t, a * .8)


def scratch(t, a=.22):
    n = int(.62 * SR)
    tt = np.arange(n) / SR
    f = 260 + 900 * np.abs(np.sin(2 * np.pi * 3.2 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = .35 * np.sign(np.sin(ph)) + M.rng.standard_normal(n) * .5
    x = M.band(x, 350, 5200) * np.abs(np.sin(2 * np.pi * 3.2 * tt + .3)) * np.exp(-tt * 1.6)
    g(x, t, a)


def boing(t, a=.12):
    n = int(.32 * SR)
    tt = np.arange(n) / SR
    f = 260 + 700 * (1 - np.exp(-tt * 9))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR + 2 * np.sin(2 * np.pi * 18 * tt)) * np.exp(-tt * 6)
    g(x, t, a)


def poof(t, a=.3):
    x = M.band(M.burst(.55, 7, 3), 120, 2600)
    g(x, t, a)
    g(M.thump(.3), t, a * .7)


# hook
g(M.lib("impact-bass-1"), .02, .3)
g(M.lib("sparkle"), .5, .1)
g(M.lib("pop"), AT["s1:pemilik"] if "s1:pemilik" in AT else 3.9, .12)
# page turns between panels
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    rustle(K[x] - .55)
    g(M.lib("whoosh-short"), K[x] - .35, .12)
# s2 names
g(M.lib("pop"), AT["s2:1981"], .16); g(M.thump(.2), AT["s2:1981"], .2)
for w in ("Ossan", "Jumpman", "Mister"):
    g(M.lib("whoosh-short"), AT["s2:" + w] - .12, .1)
    g(M.lib("click"), AT["s2:" + w] + .2, .16)
boing(AT["s2:Jumpman"])
# s3 vanish
g(M.lib("riser"), AT["s3:kalau"] - .2, .05)
poof(AT["s3:hilang"])
g(M.lib("sparkle"), AT["s3:hilang"] + .15, .1)
# s4 rain bed + warehouse
rn = M.band(M.rng.standard_normal(int((K["s5"] - K["s4"] + .6) * SR)), 2500, 9000)
rn *= np.minimum(1, np.minimum(np.arange(len(rn)) / SR / .5, (len(rn) / SR - np.arange(len(rn)) / SR) / .5))
g(rn, K["s4"] - .3, .025)
g(M.thump(), AT["s4:menyewa"], .28); g(M.lib("click"), AT["s4:menyewa"], .12)
g(M.lib("pop"), AT["s4:Tukwila"], .14)
g(M.lib("pop"), AT["s4:Pemiliknya"], .1)
g(M.lib("chime"), AT["s4:Mario"], .14)
# s5 version A
g(M.lib("whoosh"), K["s5"] + .1, .1)
for k in (0, .22, .62, .84):
    knock(AT["s5:Segale"] + .05 + k)
g(M.lib("impact-bass-1"), AT["s5:telat"] - .1, .2)
g(M.lib("glitch-2"), AT["s5:berdebat"], .1); g(M.thump(), AT["s5:berdebat"], .25)
g(M.lib("click"), AT["s5:Minoru"], .12)
g(M.lib("whoosh-cinematic"), AT["s5:Setelah"], .12)
g(M.thump(), AT["s5:Setelah"] + .6, .22)
g(M.lib("sparkle"), AT["s5:Mario"], .16); g(M.lib("chime"), AT["s5:Mario"] + .05, .14)
# s6 version B
scratch(tT - .05)
g(M.lib("impact-bass-1"), tT + .05, .16)
g(M.lib("pop"), AT["s6:Don"], .12)
g(M.lib("pop"), AT["s6:lelucon"] - .05, .14)
for k in range(4):
    g(M.note(520 - 60 * (k % 2), .1, "square", 20), AT["s6:lelucon"] + .5 + k * .16, .03)
g(M.lib("ping"), AT["s6:tidak"], .12)
g(M.lib("pop"), AT["s6:pernah"], .1)
# s7 quiet
g(M.lib("chime"), AT["s7:2018"], .1)
rustle(AT["s7:obituarinya"], .07)
for k in range(5):
    g(M.thump(.12), AT["s7:menghindari"] + .2 + k * .5, .07)
# s8 vote
g(M.lib("pop"), AT["s8:Kamu"], .14)
for k in range(5):
    g(M.lib("click-soft"), AT["s8:Kamu"] + k / 1.6, .12)
g(M.lib("sparkle"), OUT - .4, .14)
rustle(OUT - .3, .1)
g(M.thump(), OUT, .22)
M.finish(music)
