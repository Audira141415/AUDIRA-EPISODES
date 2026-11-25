"""EP04 sound: a calm architectural bed at 66 BPM (felt piano on Dmaj9-Bm11-Gmaj7#11-A6sus, soft bowed-string pad, a low
cello pedal). Every rope snap pulls the bed down into a short tension riser, then a metal clamp lands and the bed returns.
SFX: rope snaps, metal clamps, ratchet clicks, motor hum, governor whirr, power-cut thunk, elevator ding, crowd murmur.
Run from this folder: python mix.py"""
import json, sys
sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1854)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]

beat = 60 / 66
D3 = 146.83
chords = [[0, 4, 7, 11, 16], [-3, 0, 2, 7, 10], [-7, -3, 0, 4, 8], [-5, -1, 2, 4, 7]]  # semitones from D
pno, pad, cel = M.mono(), M.mono(), M.mono()


def felt(f, dur=3.2):
    """Felt piano: soft hammer, quick top decay, warm body."""
    t = np.arange(int(dur * SR)) / SR
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t * 1.6) + .35 * np.sin(2 * np.pi * f * 2.003 * t) * np.exp(-t * 3.5)
         + .12 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 6))
    thud = M.band(M.rng.standard_normal(len(t)), 80, 900) * np.exp(-t * 60) * .15
    return (x + thud) * np.minimum(1, t / .012)


def bow(f, dur):
    """Soft bowed string: detuned saw-ish partials with slow swell and gentle vibrato."""
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + .003 * np.sin(2 * np.pi * 5.1 * t)
    x = sum(np.sin(2 * np.pi * f * h * vib * t + h) / (h ** 1.4) for h in range(1, 7))
    x += sum(np.sin(2 * np.pi * f * 1.003 * h * t) / (h ** 1.6) for h in range(1, 5)) * .6
    return x * np.minimum(1, t / 1.6) * np.minimum(1, (dur - t) / 1.2) / 4


bar, t0 = 0, 0.0
arp = [0, 2, 4, 1, 3, 2]
while t0 < DUR:
    ch = chords[bar % 4]
    for s in ch[:4]:
        M.lay(pad, bow(D3 * 2 ** (s / 12), beat * 4 + 1.4), t0, .2)
    M.lay(cel, bow(D3 / 2 * 2 ** (ch[0] / 12), beat * 4 + 1.0), t0, .5)
    for k, idx in enumerate(arp):
        if (bar + k) % 5 == 4:
            continue
        f = D3 * 2 * 2 ** ((ch[idx % len(ch)]) / 12)
        M.lay(pno, felt(f), t0 + k * beat * 4 / 6 + .01, .26 if k == 0 else .17)
    t0 += beat * 4
    bar += 1

snaps = [AT["s1:putus"] + .1, AT["s2:putus"] + .15, AT["s3:putus"] + .05, AT["s3:menantang"] + .15, AT["s7:putus"] + .05]
pts = [(0, .85), (DUR, .85)]
env = M.env(pts)
for s in snaps:
    env = env * (1 - .7 * np.exp(-((T - s - .5) / .7) ** 2))
env = env * (1 - .3 * np.exp(-((T - AT["s7:padam"] - 1.0) / 1.0) ** 2))
env = env * np.minimum(1, T / .6 + .4) * np.clip((DUR - T) / 1.5, 0, 1)
mono = (.9 * pno + .8 * pad + .55 * cel) * env
music = stereo(mono, .1 * np.roll(pno, 700) * env)


def snap(t, a=.3):
    """Steel rope snap: sharp crack, whip, and a short ring."""
    g(M.band(M.burst(.08, 70, 1), 1500, 9000), t, a)
    g(.5 * M.tone([1320, 1810, 2470], .5, 9), t + .005, a * .35)
    g(M.band(M.burst(.4, 9, 2), 300, 3000), t + .04, a * .35)


def clamp(t, a=.32):
    """Wedges biting steel: thump, metallic ring, grind."""
    g(M.thump(.3), t, a)
    g(.6 * M.tone([523, 784, 1187, 1568], 1.1, 4.5), t, a * .3)
    grind = M.band(M.burst(.45, 7, 1), 900, 6000)
    g(grind, t, a * .3)


def ratchet(t0, n, gap, a=.06):
    for k in range(n):
        g(M.lib("click"), t0 + k * gap, a)


def riser(t, dur=1.4, a=.07):
    tt = np.arange(int(dur * SR)) / SR
    x = M.band(M.rng.standard_normal(len(tt)), 400, 7000) * (tt / dur) ** 2
    x += .4 * np.sin(2 * np.pi * (220 * tt + 300 * tt ** 2 / dur))* (tt / dur) ** 2
    g(x, t - dur, a)


def hum(t0, t1, f=58, a=.05):
    n = int((t1 - t0) * SR)
    tt = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * tt) + .5 * np.sin(2 * np.pi * f * 2 * tt) + .25 * np.sin(2 * np.pi * f * 3 * tt)) * np.minimum(1, np.minimum(tt / .4, (n / SR - tt) / .4))
    g(x, t0, a)


def ding(t, a=.12):
    g(M.tone([1318.5], 1.4, 2.6), t, a)
    g(M.tone([1046.5], 1.6, 2.2), t + .42, a)


def whirr(t0, t1, a=.05, rise=True):
    n = int((t1 - t0) * SR)
    tt = np.arange(n) / SR
    fr = 30 + (80 * tt / (t1 - t0) if rise else 0)
    ph = 2 * np.cumsum(np.pi * fr) / SR
    x = M.band(M.rng.standard_normal(n), 500, 4000) * (.5 + .5 * np.sign(np.sin(ph * 4))) * np.minimum(1, (n / SR - tt) / .1)
    g(x, t0, a)


# s1 hook
g(M.lib("whoosh-cinematic"), .05, .06)
hum(0, AT["s1:putus"] + .1, a=.05)
riser(snaps[0], .9, .06)
snap(snaps[0], .34)
clamp(AT["s1:putus"] + .52, .36)
g(M.lib("whoosh"), K["s1e"] - .4, .09)
# s2 factory
g(M.lib("whoosh-short"), K["s2"] + .2, .07)
ratchet(AT["s2:butuh"], 10, .14, .035)
g(M.lib("ping"), AT["s2:Elisha"], .06)
riser(snaps[1], 1.1, .06)
snap(snaps[1], .3)
fall = AT["s2:putus"] + .15 + .8
g(M.lib("impact-bass-1"), fall, .3); g(M.thump(.4), fall, .4)
g(M.band(M.burst(1.4, 3, 6), 80, 2000), fall + .02, .16)
# s3 invention + Crystal Palace
g(M.lib("whoosh"), K["s3"] - .1, .08)
ratchet(K["s3"] + .2, 9, .13, .03)
g(M.lib("sparkle"), AT["s3:pengaman"], .06)
riser(snaps[2], .8, .05)
snap(snaps[2], .26)
clamp(snaps[2] + .25, .3)
ratchet(snaps[2] + .3, 3, .06, .06)
g(M.lib("whoosh-cinematic"), AT["s3:Tahun"] + .1, .09)
crowd = M.band(M.rng.standard_normal(int(9 * SR)), 250, 2200)
crowd *= (1 + .4 * np.sin(2 * np.pi * 1.3 * np.arange(len(crowd)) / SR) * np.sin(2 * np.pi * .37 * np.arange(len(crowd)) / SR))
crowd *= np.minimum(1, np.minimum(np.arange(len(crowd)) / SR / 1.2, (len(crowd) / SR - np.arange(len(crowd)) / SR) / 1.5))
g(crowd, AT["s3:memamerkannya"] - .5, .025)
riser(snaps[3], 1.6, .08)
snap(snaps[3], .3)
clamp(snaps[3] + .3, .36)
cheer = M.band(M.rng.standard_normal(int(2.6 * SR)), 400, 3500) * np.exp(-np.arange(int(2.6 * SR)) / SR * 1.2)
g(cheer, snaps[3] + .55, .09)
# s4 store
g(M.lib("whoosh"), K["s4"] + .1, .08)
ding(AT["s4:penumpang"] - .2, .1)
hum(AT["s4:penumpang"], AT["s4:Prinsip"], 70, .03)
g(M.lib("whoosh-cinematic"), AT["s4:Prinsip"] + .4, .08)
# s5 traction
hum(K["s5"], K["s6"], 55, .06)
g(M.lib("click-soft"), AT["s5:puli"], .08)
g(M.lib("ping"), AT["s5:pemberat"], .06)
g(M.lib("whoosh-short"), AT["s5:pemberat"] - .5, .07)
g(M.lib("sparkle"), AT["s5:rel"], .05)
# s6 governor
g(M.lib("whoosh"), K["s6"] - .1, .07)
g(M.lib("ping"), AT["s6:governor"], .07)
whirr(AT["s6:jatuh"] - .25, AT["s6:bekerja"], .07)
clamp(AT["s6:bekerja"], .34)
# s7 brake, power cut, Seattle
hum(K["s7"], AT["s7:padam"], 50, .07)
g(M.lib("click"), AT["s7:terbuka"], .1)
g(M.lib("click-soft"), AT["s7:pegas"], .1)
g(M.thump(.5), AT["s7:padam"], .4); g(M.lib("impact-bass-1"), AT["s7:padam"], .14)
clamp(AT["s7:padam"] + .12, .22)
g(M.lib("click"), AT["s7:mengunci"], .12)
g(M.lib("whoosh-cinematic"), AT["s7:Tahun"] - .2, .08)
riser(snaps[4], 1.2, .07)
snap(snaps[4], .32)
whirr(snaps[4], AT["s7:governor"], .07)
clamp(AT["s7:governor"], .38)
# s8 payoff
g(M.lib("whoosh"), K["s8"] - .2, .08)
hum(K["s8"], END, 62, .035)
ding(AT["s8:salah"] + .2, .11)
g(M.lib("sparkle"), AT["s8:AUDIRA"], .07)
g(M.lib("whoosh"), OUT - .35, .09)
ding(OUT + .1, .09)
M.finish(music)
