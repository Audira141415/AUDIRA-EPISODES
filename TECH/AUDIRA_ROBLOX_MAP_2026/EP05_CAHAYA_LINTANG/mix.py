"""EP05 sound: a warm music-box waltz over soft bowed strings (D major, 84 BPM in 3/4), a wooden cart rumble with a
soft click each time the voxel shadow snaps, a glass chime per lighting switch, a rubber stamp for USANG, clock ticks
whenever ClockTime moves, and evening crickets under the last scene. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(505)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
# old estimated scene bounds -> locked scene bounds (same mapping as world3d.js N())
OLDB = [0, 0.1, 6.469, 6.629, 23.441, 23.601, 34.525, 34.685, 47.147, 47.307, 57.2, 57.36, 68.767, 68.927, 83.285, 83.445, 93.952, 96.95]
NEWB = [0] + [K[s + e] for s in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8") for e in ("", "e")] + [K["dur"]]


def Nt(x):
    return float(np.interp(x, OLDB, NEWB))

beat = 60 / 84
bar = beat * 3
D = 146.83  # D3
prog = [(0, 4, 7), (9, 12, 16), (5, 9, 12), (7, 11, 14)]  # D, Bm, G, A
box, strings, bass = M.mono(), M.mono(), M.mono()


def bell(f, dur=1.4):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 9) + .2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 18)
    return x * np.exp(-t * 3.2) * np.minimum(1, t / .002)


def bow(f, dur):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + .004 * np.sin(2 * np.pi * 5.2 * t)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    x = sum(np.sin(h * ph) / h ** 1.3 for h in range(1, 7))
    return x * np.minimum(1, t / .5) * np.minimum(1, (dur - t) / .6)


k, t0 = 0, 0.0
mel_pat = [0, 2, 1, 2, 0, 1]  # chord tone order per eighth (6 per bar)
while t0 < DUR:
    ch = prog[k % 4]
    for i, ci in enumerate(mel_pat):
        semi = ch[ci] + (12 if (i == 3 and k % 2) else 0)
        M.lay(box, bell(D * 4 * 2 ** (semi / 12)), t0 + i * beat / 2, .26 if i else .34)
    for semi in ch:
        M.lay(strings, bow(D * 2 ** (semi / 12), bar + .5), t0, .11)
    M.lay(bass, M.note(D / 2 * 2 ** (ch[0] / 12), bar * .9, "tri", 1.2, .02), t0, .3)
    t0 += bar
    k += 1
strings = M.band(strings, 90, 2600)

s5, s6, s8 = K["s5"], K["s6"], K["s8"]
boxEnv = M.env([(0, .9), (s5 - .3, .9), (s5 + .3, .45), (s6 - .2, .45), (s6 + .4, 1), (s8, 1), (END + .5, 1), (DUR, .3)])
strEnv = M.env([(0, .6), (K["s3"], .8), (s5, .6), (s6, 1), (s8, 1.1), (DUR, .5)])
mono = box * boxEnv + strings * strEnv + bass * .8
music = stereo(mono, .1 * np.roll(box, 900) * boxEnv)


def chime(t, a=.16, f=1318.5):
    for j, m in enumerate((1, 1.5, 2)):
        g(bell(f * m, 1.8) * .5, t + j * .06, a)


def tick(t, a=.08, hi=True):
    x = M.band(M.burst(.03, 160, 1), 2500 if hi else 1200, 9000)
    g(x, t, a)


def stampfx(t):
    g(M.thump(.3), t, .32)
    g(M.band(M.burst(.12, 40, 2), 300, 3000), t, .25)


# hook
g(M.lib("sparkle"), .05, .1)
chime(.3, .08, 987.8)
g(M.lib("pop"), AT["s1:kotak"] - .05, .12)
g(M.lib("sparkle"), AT["s1:kotak"], .12)
# scene turns: soft whoosh + page-like window open blip
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - .3, .08)
    g(M.note(880, .07, "square", 30), K[s] + .02, .025)
    g(M.note(1320, .07, "square", 30), K[s] + .09, .02)
# s2 grid + cart
g(M.lib("ping"), AT["s2:berukuran"], .1)
g(M.lib("pop"), AT["s2:Objek"], .1)
t1, t2 = Nt(12.4), Nt(21.6)
n = int((t2 - t1 + .4) * SR)
rum = M.band(M.rng.standard_normal(n), 60, 420) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 3.1 * np.arange(n) / SR)))
rum *= np.minimum(1, np.minimum(np.arange(n) / SR / .6, (n - np.arange(n)) / SR / .6))
g(rum, t1, .05)
# shadow snaps: replay the cart occupancy at 30 fps and click on every change


def cartX(t):
    x = min(1, max(0, (t - t1) / (t2 - t1)))
    x = x * x * x * (x * (6 * x - 15) + 10)
    return -24 + 26 * x


def cells(cx):
    out = []
    for i in range(16):
        a, b = -32 + i * 4, -28 + i * 4
        if (min(cx + 3, b) - max(cx - 3, a)) / 4 >= .45:
            out.append(i)
    return tuple(out)


prev = cells(cartX(Nt(12.0)))
for f in range(int(Nt(12.0) * 30), int(Nt(22) * 30)):
    c = cells(cartX(f / 30))
    if c != prev:
        g(M.lib("click-soft"), f / 30, .16)
        tick(f / 30, .05, False)
    prev = c
g(M.lib("chime"), AT["s2:dihitung"], .08)
# s3 three presets
chime(AT["s3:Technology"], .08, 659.3)
chime(AT["s3:Voxel"], .14, 1046.5)
chime(AT["s3:ShadowMap"], .14, 1318.5)
chime(AT["s3:Future"], .16, 1568.0)
g(M.lib("sparkle"), AT["s3:Future"] + .1, .1)
# s4 deprecated + new switch
stampfx(AT["s4:usang"])
g(M.lib("click"), AT["s4:LightingStyle"], .12)
for w, f in (("s4:Soft", 1174.7), ("s4:Realistic", 1480.0), ("s4:Soft#2", 1174.7), ("s4:Realistic#2", 1480.0)):
    g(M.lib("click"), AT[w] - .05, .1)
    chime(AT[w], .12, f)
# s5 quality meter
g(M.lib("error"), AT["s5:kualitas"] - .1, .05)
chime(AT["s5:kualitas"], .1, 880)
chime(AT["s5:atau"], .1, 740)
g(M.lib("whoosh"), AT["s5:atau"] + .2, .06)
# s6 latitude + clock
g(M.lib("riser"), AT["s6:GeographicLatitude"] - 1.0, .05)
chime(AT["s6:GeographicLatitude"], .1, 1318.5)
ts = AT["s6:Jamnya"]
for x in np.arange(ts, Nt(68.7), .09):
    tick(x, .06)
for x in np.arange(Nt(68.7), Nt(70.0), .22):
    tick(x, .05)
g(M.lib("ping"), AT["s6:ClockTime"], .1)
# s7 Jakarta + day sweep
g(M.lib("pop"), AT["s7:Jakarta"], .12)
chime(AT["s7:Jakarta"] + .1, .1, 1568.0)
for x in np.arange(Nt(70.0), Nt(75.3), .25):
    tick(x, .045)
for x in np.arange(AT["s7:Ditambah"], Nt(82.9), .25):
    tick(x, .045)
# s8 dusk: crickets + warm sparkle on AUDIRA
cs = K["s8"] - .5
n = int((DUR - cs) * SR)
tt = np.arange(n) / SR
chirp = np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 32 * tt) > .2) * (np.sin(2 * np.pi * 1.3 * tt) > .35)
chirp2 = np.sin(2 * np.pi * 4700 * tt) * (np.sin(2 * np.pi * 27 * tt) > .3) * (np.sin(2 * np.pi * .9 * tt + 1) > .45)
cr = (chirp + .7 * chirp2) * np.minimum(1, tt / 1.5) * np.minimum(1, (n - np.arange(n)) / SR / 1.5)
g(np.stack([cr, np.roll(chirp2 * .8 + chirp * .5, 3000)], 1), cs, .03)
g(M.lib("sparkle"), AT["s8:AUDIRA"], .12)
chime(OUT - .3, .12, 1174.7)
M.finish(music)
