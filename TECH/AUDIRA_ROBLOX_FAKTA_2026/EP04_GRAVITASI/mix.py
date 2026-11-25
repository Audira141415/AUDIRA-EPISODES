"""EP04 sound: bouncy marimba + pizzicato groove at 112 BPM on a sunny test field.
Every jump in the film gets a synthesized boing at takeoff and a thud at landing (times from beats.json, same physics as the picture);
the 3 s realistic-gravity floats carry a wind whoosh. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4404)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
JUMPS, XK = K["J"], K["X"]
g = M.put
END = M.TL["speech_end"]
S = {x: M.scene(x)["start"] for x in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}


def marimba(f, dur=.5, dec=7.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + .32 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 26) + .08 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 60)
    return x * np.minimum(1, t / .002) * np.exp(-t * dec) * np.minimum(1, (dur - t) / .01)


# ---- groove
mar, bas, shk, wb = M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 112
root = 261.63
prog = [[0, 4, 7, 9], [-3, 0, 4, 7], [-7, -3, 0, 2], [-5, -1, 2, 4]]  # C, Am, F, G (pentatonic colour)
pat = [0, 2, 1, 3, 2, 1, 3, 2]
t0, i = 0.0, 0
while t0 < END + 2.5:
    ch = prog[(i // 16) % 4]
    if i % 8 != 5:
        oct_ = 2 if pat[i % 8] == 3 and i % 16 > 7 else 1
        M.lay(mar, marimba(root * oct_ * 2 ** (ch[pat[i % 8]] / 12), .45, 8), t0, .5 if i % 2 == 0 else .36)
    if i % 4 in (0, 3):
        bf = root / 2 * 2 ** (ch[0] / 12) * (1.5 if i % 4 == 3 else 1)
        M.lay(bas, M.note(bf / 2 if i % 4 == 0 else bf / 2, .32, "pluck", 9, .002), t0, .9)
    if i % 2 == 1:
        M.lay(shk, M.band(M.burst(.06, 55, 1), 4500, 10000), t0, .18)
    if i % 8 == 6:
        M.lay(wb, marimba(1250, .08, 50), t0, .16)
    t0 += beat / 2
    i += 1
moon = M.env([(0, 0), (S["s8"] - .3, 0), (S["s8"] + .4, 1), (DUR, 1)])
e = M.env([(0, .8), (S["s3"], 1), (S["s6"], .85), (S["s7"], 1), (S["s8"], .75), (END + .4, .9), (DUR, .2)])
music = stereo(.45 * mar * e + .62 * bas * e * (1 - .55 * moon) + .22 * shk * e * (1 - .6 * moon) + .3 * wb * e,
               .12 * np.roll(mar, 700) * e)


# ---- sound design
def boing(kind):
    if kind == 0:
        dur, f0, rise, k, a = .42, 190, 2.3, 11, 1.0
    elif kind == 1:
        dur, f0, rise, k, a = 1.3, 150, 3.4, 2.6, 1.0
    else:
        dur, f0, rise, k, a = 1.0, 120, 1.6, 2.2, .8
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (1 + rise * (1 - np.exp(-t * k))) * (1 + .05 * np.sin(2 * np.pi * (16 if kind else 22) * t) * np.exp(-t * 2.5))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + .25 * (2 / np.pi) * np.arcsin(np.sin(2 * ph))
    return a * x * np.minimum(1, t / .004) * np.exp(-t * (6 if kind == 0 else 1.8)) * np.minimum(1, (dur - t) / .03)


def wind(dur, gain):
    x = M.band(M.rng.standard_normal(int(dur * SR)), 250, 1900)
    u = np.arange(len(x)) / len(x)
    env = np.sin(np.pi * u) ** 1.4
    side = M.band(M.rng.standard_normal(len(x)), 400, 2600) * env * .5
    return np.stack([x * env + side, x * env - side], 1) * gain / max(1e-6, np.abs(x).max())


def tick(t, a=.05, f=2400):
    g(M.note(f, .025, "sine", 120), t, a)
    g(M.band(M.burst(.02, 150, 1), 2500, 9000), t, a * .6)


def step(t, a=.05):
    g(M.band(M.burst(.05, 70, 2), 120, 1400), t, a)


for j in JUMPS:
    t0, v, gr, kind, keep, t1 = j
    g(boing(kind), t0 - .02, {0: .15, 1: .2, 2: .13}[kind])
    if kind == 1:
        g(wind(t1 - t0, .16), t0 + .05)
    if kind == 2:
        g(wind(t1 - t0, .08), t0 + .05)
    g(M.thump(.24), t1, {0: .2, 1: .32, 2: .14}[kind])
    if kind == 1:
        g(M.lib("impact-bass-1"), t1 - .02, .12)

# footsteps on every walk/run segment, one per half stride (2.5 studs)
for (ta, xa), (tb, xb) in zip(XK[:-1], XK[1:]):
    if tb - ta <= 0 or abs(xb - xa) / (tb - ta) < 8 or tb - ta < .8:
        continue
    sp = abs(xb - xa) / (tb - ta)
    t = ta + .05
    while t < tb:
        step(t, .05)
        t += 2.5 / sp

# panels fall in and land, then jump out
ins = [S[x] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")] + [AT["s3:Bumi"], AT["s6:Hitungan"]]
for a in ins:
    g(M.lib("whoosh-short"), a - .34, .07)
    g(M.lib("pop"), a, .09)
# s1
g(M.lib("whoosh"), AT["s1:gravitasinya"], .1)
for k, f in enumerate([523, 659, 784, 1046]):
    g(marimba(f, .4, 7), AT["s1:enam"] + k * .07, .12)
# s2: cube throw, landing, tape
tT = AT["s2:satu"] - .35
g(M.lib("whoosh-short"), tT, .1)
g(M.thump(.2), tT + .29, .26)
g(M.lib("click"), AT["s2:satu"], .12)
for k in range(5):
    tick(AT["s2:dua"] + k * .09, .04)
for k in range(1, 8):
    tick(AT["s2:Dari"] + 1.6 * (1 - (1 - k / 7) ** (1 / 3)) - .05, .035, 2100)
g(M.lib("sparkle"), AT["s2:Dari"] + 1.6, .1)
# s3/s4: bars rise, ghost stack clacks, document slaps down


def rise(t, dur, f0, f1, a):
    tt = np.arange(int(dur * SR)) / SR
    f = f0 * (f1 / f0) ** (tt / dur)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, tt / .02) * (1 - tt / dur) ** .5
    g(x, t, a)


rise(AT["s3:seratus"], 1.1, 180, 720, .09)
g(M.lib("pop"), AT["s3:lima"], .1)
rise(AT["s3:Bumi"], .6, 180, 330, .08)
for k in range(5):
    g(marimba(700 + 90 * k, .12, 40), AT["s3:Hampir"] - .2 + .17 * k + .35, .2)
g(M.lib("chime"), AT["s3:Hampir"] + 1.2, .1)
g(M.band(M.burst(.12, 30, 2), 700, 6000), AT["s4:Dokumen"], .18)
g(M.thump(.18), AT["s4:Dokumen"], .14)
rise(AT["s4:tiga"], .6, 180, 330, .08)
g(M.lib("ping"), AT["s4:tiga"] + .3, .08)
# s5: line, stopwatch
g(M.lib("sparkle"), AT["s5:tujuh"], .09)
tick(AT["s5:setengah"], .07); tick(AT["s5:setengah"] + .54, .07, 3000)
# s6: gravity arrow shrinks, stopwatch through the first float
rise(AT["s6:realistis"], .7, 600, 200, .07)
t = AT["s6:melambung"] - .3
for k in range(13):
    tick(t + k * .25, .03, 2600 if k % 4 == 0 else 2000)
g(M.lib("chime"), AT["s6:Hitungan"], .09)
g(M.lib("ping"), AT["s6:empat"], .08)
# s7: speedometer whir
rise(AT["s7:kilometer"] + .2, .9, 220, 520, .06)
g(M.lib("click-soft"), AT["s7:enam"], .1)
# s8
g(M.lib("sparkle"), AT["s8:bulan"], .1)
g(M.lib("ping"), AT["s8:Kalau"], .09)
# outro card bounces in (bounce.out over 0.7 s from OUT-0.3)
for k, fr in enumerate([.364, .727, .909, 1.0]):
    g(M.thump(.2), OUT - .3 + .7 * fr, .24 / (k + 1) ** .6)
g(M.lib("sparkle"), OUT + .5, .12)
M.finish(music)
