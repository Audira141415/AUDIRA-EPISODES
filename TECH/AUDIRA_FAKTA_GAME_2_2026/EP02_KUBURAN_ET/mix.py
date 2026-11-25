"""EP02 sound: documentary tension bed (low heartbeat pulse, dark drone, muted piano in A minor) with forensic foley:
truck engines, crate dumps, concrete pour, excavator, camera shutters on evidence, auction gavel. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2202)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]

# --- music bed ---
pulse, drone, piano = M.mono(), M.mono(), M.mono()
bpm = 72
beat = 60 / bpm
t0 = 0.0
while t0 < END + 2:
    M.lay(pulse, M.thump(.28), t0, .55)
    M.lay(pulse, M.thump(.22), t0 + beat * .32, .3)
    t0 += beat * 2
roots = [110.0, 87.31, 73.42, 82.41]  # A2 F2 D2 E2
bar = beat * 4
for i in range(int((END + 4) / (bar * 2)) + 1):
    f = roots[i % 4]
    x = M.note(f, bar * 2 + .5, "saw", .05, .8) + .6 * M.note(f * 1.5, bar * 2 + .5, "sine", .05, .8)
    M.lay(drone, x, i * bar * 2, .5)
drone = M.band(drone, 40, 520)
air = M.band(M.rng.standard_normal(N), 300, 1400) * .05
# muted piano: sparse descending figures, felt-soft (fast decay pluck, low partials)
scale = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0]
pat = [5, 3, 4, 1, 2, 0, 3, 1]
t0, i = 1.0, 0
while t0 < END:
    if (i // 8) % 2 == 0 or t0 > K["s6"]:
        f = scale[pat[i % 8]] * (0.5 if i % 4 == 3 else 1)
        M.lay(piano, M.note(f, 1.6, "pluck", 3.2, .01), t0, .5)
    t0 += beat
    i += 1
piano = M.band(piano, 80, 2600)
e = M.env([(0, .9), (K["s2"], .8), (K["s4"], 1), (K["s5"], .7), (K["s6"], 1), (K["s7"], .85), (K["s8"], .95), (END + .4, 1), (DUR, .15)])
music = stereo(.5 * pulse * e + .55 * drone * e + .42 * piano * e + air * e, .12 * np.roll(piano, 700) * e + .3 * np.roll(air, 300))


def engine(dur, f0=38, g0=.6):
    t = np.arange(int(dur * SR)) / SR
    x = M.band(M.rng.standard_normal(len(t)), 50, 320) * (1 + .6 * np.sin(2 * np.pi * f0 * t))
    x += .5 * np.sin(2 * np.pi * (f0 * 1.5) * t)
    fade = np.minimum(1, np.minimum(t / .4, (dur - t) / .6))
    return x * fade * g0


def crash(a=.2):
    return a * (M.band(M.burst(.4, 9, 2), 120, 3000) + .7 * np.pad(M.thump(.3), (0, int(.4 * SR) - int(.3 * SR))))


def pour(dur):
    t = np.arange(int(dur * SR)) / SR
    x = M.band(M.rng.standard_normal(len(t)), 180, 1300) * (0.7 + .3 * np.sin(2 * np.pi * 5.5 * t) ** 2)
    return x * np.minimum(1, np.minimum(t / .3, (dur - t) / .5))


def shutter(t, a=.16):
    for k, d in enumerate((0, .07)):
        g(M.band(M.burst(.035, 120, 1), 1500, 9000), t + d, a * (1 - .3 * k))
        g(M.note(2400, .02, "sine", 80), t + d, a * .4)


def gavel(t, a=.32):
    g(M.note(820, .12, "sine", 38) + .6 * M.note(1340, .12, "sine", 50), t, a)
    g(M.band(M.burst(.06, 70, 1), 600, 5000), t, a * .8)
    g(M.thump(.18), t, a * .5)


def flip(t, a=.1):
    g(M.band(M.burst(.12, 30, 2), 2000, 9000), t, a)


# s1: trucks idling and dumping, then the concrete
g(engine(8.0), 0.0, .1)
for k in range(3):
    g(M.lib("whoosh-short"), .35 + k * .15, .05)
for k in range(14):
    g(crash(.06 + .04 * (k % 3 == 0)), 1.3 + k * .42 + M.rng.random() * .1, 1)
g(M.lib("impact-bass-1"), AT["s1:Atari"], .2)
g(pour(1.8), 8.3, .045)
g(M.thump(.4), 9.2, .3)
shutter(.05, .12)
shutter(AT["s1:belasan"], .14)

# scene changes
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-cinematic" if x in ("s4", "s6") else "whoosh-short"), K[x] - .2, .12)

# s2: ticking calendar during "five weeks"
for k in range(18):
    g(M.note(1900 if k % 2 else 1500, .025, "sine", 120), AT["s2:lima"] - .2 + k * .25, .05)
for k in range(5):
    flip(AT["s2:lima"] + .15 + k * .45 if k < 4 else AT["s2:liburan"] - .1)
shutter(AT["s2:lima"])
g(M.lib("click-soft"), AT["s2:Steven"], .12)
g(M.lib("click-soft"), AT["s2:Howard"], .12)

# s3: boxes stacking
for k in range(9):
    g(M.thump(.15), AT["s3:lima"] - .2 + k * .13, .1)
for k in range(3):
    g(M.thump(.15), AT["s3:satu#2"] - .1 + k * .16, .12)
g(M.lib("error"), AT["s3:terburuk"], .08)

# s4: newspaper, convoy, pins, concrete replay
flip(K["s4"] + .3, .14)
shutter(AT["s4:sepuluh"])
g(engine(5.0, 30, .5), AT["s4:sepuluh"] + .3, .07)
g(M.lib("ping"), AT["s4:El"], .12)
g(M.lib("impact-bass-1"), AT["s4:Mulai"], .2)
g(pour(3.2), 51.3, .05)

# s5: legend stamp + rumour murmurs
g(M.lib("impact-bass-1"), AT["s5:legenda"], .2)
for a in ("s5:legenda", "s5:Rumornya", "s5:jutaan"):
    g(M.lib("pop"), AT[a] + .05, .09)
g(M.lib("glitch-1"), AT["s5:jutaan"] + .2, .04)

# s6: excavator, cracking cap, recovered count
g(engine(K["s6e"] - K["s6"] - 1.5, 26, .55), K["s6"] + 1.0, .07)
t0 = 64.6
while t0 < K["s6e"] - 1:
    t = np.arange(int(.7 * SR)) / SR
    g(np.sin(2 * np.pi * (300 + 260 * t) * t) * np.exp(-t * 2) * np.minimum(1, t / .05), t0 + .9, .03)
    g(crash(.05), t0 + .85, 1)
    t0 += 3.0
g(crash(.16), 66.0, 1)
shutter(AT["s6:Gamenya"], .18)
g(M.lib("chime"), AT["s6:Gamenya"], .1)
g(M.lib("riser"), AT["s6:Sekitar"] - .8, .07)
g(M.lib("impact-bass-1"), AT["s6:total"], .16)

# s7: auction gavel + tags
for h in ("s7:melelang", "s7:dolar", "s7:dolar#2"):
    gavel(AT[h])
for a in ("s7:delapan", "s7:seratus", "s7:Satu"):
    g(M.lib("click"), AT[a], .1)

# s8: museum reveal
shutter(AT["s8:Jadi"], .14)
g(M.lib("sparkle"), AT["s8:Jadi"] + .2, .08)
g(M.lib("sparkle"), OUT - .4, .1)
g(M.thump(), OUT, .22)
M.finish(music)
