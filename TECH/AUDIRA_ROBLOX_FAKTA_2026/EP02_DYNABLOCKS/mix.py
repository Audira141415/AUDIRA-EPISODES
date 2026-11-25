"""EP02 sound: an early-computer square-wave arpeggio with beeps and floppy clicks for 1989-1998, handing over to a warm electric piano from the naming scene on, then a near-silent hush for the 2013 plaque. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2002)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
beat = 60 / 112


def epiano(f, dur, a=1.0):
    """Two-operator FM tine: bright attack that mellows, slow tremolo."""
    t = np.arange(int(dur * SR)) / SR
    idx = 1.6 * np.exp(-t * 4.0)
    x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t)) + .25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6)
    x *= np.exp(-t * 1.4) * (1 + .12 * np.sin(2 * np.pi * 4.5 * t)) * np.minimum(1, t / .004) * np.minimum(1, (dur - t) / .05)
    return a * x


# chords Am F C G, then the warm half moves to C Am F G
A1 = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
A2 = [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 53]]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

sq, bs, ep, epb = M.mono(), M.mono(), M.mono(), M.mono()
pat = [0, 1, 2, 1, 0, 2, 1, 2]
t0, i = 0.0, 0
while t0 < END + 2:
    bar = i // 8
    if t0 < K["s5"] + 1.5:
        c = A1[bar % 4]
        M.lay(sq, M.note(hz(c[pat[i % 8]] + 12), beat * .42, "square", 9, .002), t0, .5)
        if i % 4 == 0:
            M.lay(bs, M.note(hz(c[0] - 12), beat * 1.7, "tri", 1.8, .004), t0, .9)
    if t0 > K["s5"] - 2.5:
        c = A2[bar % 4]
        if i % 8 == 0:
            for k, m in enumerate(c):
                M.lay(ep, epiano(hz(m), beat * 4.2, .5), t0 + k * .012)
            M.lay(epb, epiano(hz(c[0] - 12), beat * 4, .8), t0)
        if i % 8 in (3, 6):
            M.lay(ep, epiano(hz(c[(i // 3) % len(c)] + 12), beat * 1.5, .22), t0)
    t0 += beat / 2; i += 1

sq_e = M.env([(0, .8), (K["s2"], .9), (K["s4"], .8), (K["s5"], .6), (K["s5"] + 1.6, 0), (DUR, 0)])
ep_e = M.env([(0, 0), (K["s5"] - 2.4, 0), (K["s5"] + .8, 1), (K["s7"] - .6, 1), (K["s7"] + .4, .06), (K["s8"] - .4, .06), (K["s8"] + .6, 1), (END + .4, 1), (DUR, .2)])
bs_e = M.env([(0, .8), (K["s5"], .8), (K["s5"] + 1.6, 0), (DUR, 0)])
hush = .03 * np.sin(2 * np.pi * 110 * T) * M.env([(0, 0), (K["s7"] - .2, 0), (K["s7"] + .8, 1), (K["s8"] - .5, 1), (K["s8"] + .3, 0), (DUR, 0)])
mono = .36 * sq * sq_e + .5 * bs * bs_e + .6 * ep * ep_e + .45 * epb * ep_e + hush
music = stereo(mono, .1 * np.roll(ep, 700) * ep_e + .06 * np.roll(sq, 400) * sq_e)


def beep(t, f=880, d=.07, a=.05):
    g(M.note(f, d, "square", 14, .001), t, a)


def blip(t, up=True, a=.04):
    fs = [660, 880, 1320] if up else [1320, 880, 660]
    for k, f in enumerate(fs):
        beep(t + k * .045, f, .05, a)


def snap(t, a=.05):
    g(M.band(M.burst(.03, 90, 1), 1600, 8000), t, a); g(M.note(1200, .03, "sine", 60), t, a * .5)


def rattle(t, n, span, a=.04):
    for k in range(n):
        snap(t + span * k / n + M.rng.random() * .015, a)


def clack(t, a=.12):
    g(M.band(M.burst(.05, 70, 1), 1800, 6500), t, a); g(M.thump(.14), t, a * .7)


# s1: power-on beep, drive whirr, key stomps, name hit
beep(.05, 990, .16, .07); beep(.24, 1980, .08, .04)
g(M.band(M.burst(1.2, 1.5, 3), 200, 1400) * .4, .3, .1)
for k in range(10):
    g(M.lib("click-soft"), .8 + k * .45, .06)
g(M.lib("glitch-1"), AT["s1:DynaBlocks"] - .05, .1)
g(M.thump(), AT["s1:DynaBlocks"], .2)
blip(AT["s1:akarnya"], True, .035)

# scene changes: a stepped blip and a soft dolly whoosh
for x in ("s2", "s3", "s4", "s5", "s6", "s8"):
    blip(K[x] - .1, True, .035)
    g(M.lib("whoosh-short"), K[x] + .5, .08)
g(M.lib("whoosh-short"), K["s7"] + .4, .03)

# s1-s2: the sim on screen, a tick when the ball leaves and a beep when it hits the spring
P = 3.4
n = 0
while n * P < K["s3"]:
    if n * P > .5:
        g(M.lib("click-soft"), n * P, .05)
    beep(n * P + .6 * P, 523 if n % 2 else 659, .09, .035)
    n += 1
g(M.lib("typing"), AT["s2:Knowledge"] - .1, .07)

# s3: drafting, the crate scrapes to the buyer, the price lands
g(M.lib("typing"), K["s3"] + 1.2, .06)
crate = M.band(M.burst(AT["s3:dolar"] + .5 - AT["s3:dibeli"], .6, 4), 80, 700)
g(crate, AT["s3:dibeli"], .22)
g(M.thump(.3), AT["s3:MSC"], .16)
g(M.lib("pop"), AT["s3:dua"] - .1, .12)
g(M.lib("chime"), AT["s3:dua"] + .3, .1)
g(M.thump(.2), AT["s3:dolar"] + .5, .14)

# s4: students pop in, stacks grow
for k in range(10):
    beep(AT["s4:pelajar"] - .2 + k * .07, 700 + k * 40, .04, .025)
rattle(AT["s4:inspirasi"] - .3, 30, 3.6, .035)

# s5: split-flap clacks, the two words, the merge
for x in ("eBlocks", "GoBlocks", "DynaBlocks", "Roblox"):
    clack(AT["s5:" + x] - .28, .12)
    clack(AT["s5:" + x] - .1, .07)
g(M.lib("pop"), AT["s5:robots"] - .1, .1)
g(M.lib("pop"), AT["s5:blocks"] - .1, .1)
g(M.lib("sparkle"), AT["s5:blocks"] + .45, .12)
g(M.lib("chime"), AT["s5:blocks"] + .7, .1)

# s6: the first world, then the testers, then the date
g(M.lib("pop"), AT["s6:Awalnya"], .08)
rattle(AT["s6:membuat"] - .1, 44, AT["s6:lalu"] + .2 - AT["s6:membuat"], .035)
for k in range(12):
    beep(AT["s6:lusin"] - .35 + k * .09, 880 + (k % 4) * 110, .035, .02)
g(M.thump(.3), AT["s6:September"] + .25, .18)
g(M.lib("chime"), AT["s6:September"] + .3, .12)

# s7: nothing but the hush pad

# s8: the drawing rises, the ball rolls down the steps, the question
g(M.lib("riser"), AT["s8:Jadi"] - .3, .07)
rattle(AT["s8:Jadi"] + .3, 45, 2.0, .03)
for k in range(9):
    g(M.thump(.12), AT["s8:membangun"] - .4 + (k + .85) * 2.6 / 9.6, .07)
for k in range(3):
    snap(AT["s8:membangun"] - .9 + k * .7 + .2, .07)
g(M.lib("sparkle"), AT["s8:Kamu"], .1)
blip(OUT - .3, True, .04)
g(M.thump(), OUT, .2)
M.finish(music)
