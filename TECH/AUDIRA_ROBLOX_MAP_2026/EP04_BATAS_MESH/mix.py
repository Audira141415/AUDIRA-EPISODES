"""EP04 sound: a precise minimal techno pulse at 124 BPM (soft sine kick, sub pulse, ticking hats, a sparse
pentatonic pluck and a low drafting-room drone), drafting-pen scratches whenever lines are drawn, counter ticks,
a buzzer on DITOLAK and soft bumps on the invisible walls. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(404)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)


def hat(dur=.04, dec=120):
    x = M.burst(dur, dec, 1)
    return M.band(x, 6000, 15000) if len(x) > 64 else x


def tick(f=3200, a=1.0):
    return M.tone([f, f * 1.5], .012, 260) * a


kick, sub, hats, pl, pad = M.mono(), M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 124
t0, i = 0.0, 0
minor = [0, 3, 5, 7, 10, 12, 15]
mot = [0, 4, 2, 5, 3, 6, 4, 1]
while t0 < END + 2.5:
    if i % 4 == 0:
        M.lay(kick, M.note(52, .22, "sine", 16), t0, .9); M.lay(kick, M.note(104, .05, "sine", 60), t0, .22)
    if i % 4 == 2:
        M.lay(sub, M.note(hz(33), beat * .45, "sine", 5, .01), t0, .6)
    M.lay(hats, hat(.03 if i % 2 else .05, 150 if i % 2 else 90), t0, .22 if i % 2 else .32)
    if t0 > K["s1e"] and i % 3 == 0 and (i // 16) % 2 == 0:
        M.lay(pl, M.note(hz(69 + minor[mot[(i // 3) % 8]]), .35, "pluck", 6), t0, .28)
    t0 += beat / 4 * 2
    i += 1
lfo = .6 + .4 * np.sin(2 * np.pi * T / 7.3)
pad = (np.sin(2 * np.pi * 55 * T) + .6 * np.sin(2 * np.pi * 82.41 * T) + .25 * np.sin(2 * np.pi * 110.3 * T)) * .25 * lfo
e = M.env([(0, .6), (K["s1e"], .6), (K["s2"], .85), (K["s3"], .9), (K["s4"], 1), (K["s5"], .8), (K["s6"], .95), (K["s7"], .8), (K["s8"], .65), (END + .3, .7), (DUR, .12)])
music = stereo(.75 * kick * e + .55 * sub * e + .45 * hats * e + .4 * pl * e + .35 * pad * e, .1 * np.roll(pl, 900) * e + .05 * np.roll(hats, 400) * e)


def scratch(t, dur=.45, a=.08):
    """Drafting pen: narrow-band noise with a ragged stroke envelope."""
    x = M.burst(dur, 0, 1)
    x = M.band(x, 2200, 7000)
    n = len(x)
    tt = np.arange(n) / SR
    rag = .55 + .45 * np.abs(np.sin(2 * np.pi * (23 + 9 * M.rng.random()) * tt + M.rng.random() * 3))
    envl = np.minimum(1, tt / .03) * np.minimum(1, (dur - tt) / .08)
    g(x * rag * envl / max(1e-6, np.abs(x).max()), t, a)


def bump(t, a=.32):
    g(M.thump(.3), t, a)
    g(M.lib("click-soft"), t, a * .5)


def buzzer(t, dur=.55, a=.12):
    tt = np.arange(int(dur * SR)) / SR
    x = (np.sign(np.sin(2 * np.pi * 98 * tt)) + np.sign(np.sin(2 * np.pi * 104 * tt))) * .5
    x = M.band(x, 80, 3000) * np.minimum(1, tt / .005) * np.minimum(1, (dur - tt) / .03)
    g(x / max(1e-6, np.abs(x).max()), t, a)


def steps(t0, t1, rate=.21, a=.05):
    t = t0
    while t < t1:
        g(M.burst(.04, 90, 6), t, a)
        t += rate


# scene changes: a short whoosh and a pen stroke as each sheet is plotted
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[x] - .2, .14)
    scratch(K[x] - .05, .38, .06)
scratch(0.02, .5, .05)

# s1: counter runs to 20.000, buzzer + stamp on DITOLAK
ta = AT["s1:Model"]
for k in range(34):
    u = k / 34
    g(tick(2600 + 1400 * u, 1), ta + 1.6 * (1 - (1 - u) ** 2), .08)
buzzer(AT["s1:ditolak"], .55, .13)
g(M.thump(), AT["s1:ditolak"], .38)
g(M.lib("error"), AT["s1:ditolak"] + .05, .07)

# s2: each subdivision clicks up a step; over the limit buzzes softly
for k, a in enumerate(["s2:Setiap", "s2:dari", "s2:kecil", "s2:Makin", "s2:halus", "s2:banyak", "s2:segitiganya"]):
    g(M.lib("click"), AT[a], .1)
    g(M.tone([700 + 160 * k], .08, 30), AT[a] + .02, .05)
    for j in range(4 + k * 2):
        g(tick(3000 + 300 * k, 1), AT[a] + .03 + j * .025, .035)
buzzer(AT["s2:segitiganya"] + .1, .3, .06)
g(M.lib("ping"), AT["s2:maksimal"], .1)
scratch(AT["s2:maksimal"] - .1, .5, .07)

# s3: the board is plotted, dimensions, cubes snap up
scratch(K["s3"] + .05, 1.0, .08)
scratch(AT["s3:empat"] - .1, .6, .07)
g(M.lib("ping"), AT["s3:empat"], .08)
g(M.lib("pop"), AT["s3:objek#2"] - .1, .14)
g(M.lib("pop"), AT["s3:objek#3"] - .1, .16)
g(M.thump(.25), AT["s3:objek#3"], .18)
g(M.lib("click-soft"), AT["s3:dua"], .12)
g(M.lib("click-soft"), AT["s3:seribu"], .12)
steps(AT["s3:Tapi"] - .1, AT["s3:Tapi"] + 2.3)

# s4: rings drawn around the camera, three detail levels, a falling ping per ring
scratch(K["s4"] + .1, 1.1, .08)
g(M.lib("click"), K["s4"] + .3, .08)
for a, f in (("s4:detailnya", 1320), ("s4:sedang", 990), ("s4:terendah", 660)):
    g(M.tone([f, f * 2], .4, 7), AT[a], .06)
    scratch(AT[a] - .05, .3, .05)
steps(AT["s4:Di"] - .2, K["s4e"] - .3, .26, .04)

# s5: walk, bump into nothing, the hidden hull is drawn
steps(K["s5"] + .1, AT["s5:tabrakan"], .2, .05)
bump(AT["s5:tabrakan"], .34)
scratch(AT["s5:bentuk#2"] - .1, .8, .08)
g(M.lib("chime"), AT["s5:collision"], .07)

# s6: five options, each one a click and a pen pass, cost tone climbs; the slider ticks
for k, a in enumerate(["s6:Box", "s6:Hull", "s6:Default", "s6:PreciseConvexDecomposition", "s6:Tunable"]):
    g(M.lib("click"), AT[a], .11)
    scratch(AT[a] + .02, .32 + .1 * k, .06)
    g(M.tone([300 + 140 * k, 450 + 210 * k], .25, 8), AT[a] + .05, .045)
g(M.lib("riser"), AT["s6:PreciseConvexDecomposition"] - .2, .06)
for j in range(14):
    g(tick(2400 + 90 * (j % 5), 1), AT["s6:Tunable"] + .3 + j * .1, .04)

# s7: run, bump into the air, the bulging hull flashes
g(M.lib("glitch-1"), AT["s7:tidak"], .05)
steps(AT["s7:Makanya"] + .1, AT["s7:menabrak"], .17, .055)
bump(AT["s7:menabrak"], .36)
g(M.lib("glitch-2"), AT["s7:menabrak"] + .1, .05)

# s8: approval stamp, sign-off
g(M.thump(), AT["s8:pas"], .3)
g(M.lib("impact-bass-1"), AT["s8:pas"], .12)
g(M.lib("sparkle"), AT["s8:AUDIRA"] - .2, .1)
g(M.thump(), OUT, .22)
scratch(OUT, .5, .06)
M.finish(music)
