"""EP01 sound: bright ukulele-like plucks and hand claps at 108 BPM on a wooden table, with plastic brick clicks as the sound effects. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1101)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
pl, ba, cl = M.mono(), M.mono(), M.mono()
beat = 60 / 108
ch = [[0, 4, 7, 12], [5, 9, 12, 17], [7, 11, 14, 19], [4, 7, 12, 16]]
root = 261.63
pat = [0, 2, 1, 3, 0, 2, 3, 1]
t0, i = 0.0, 0
while t0 < END + 2:
    c = ch[(i // 8) % 4]
    M.lay(pl, M.note(root * 2 ** (c[pat[i % 8]] / 12), .7, "pluck", 4.5, .002), t0, .5)
    if i % 4 == 0:
        M.lay(ba, M.note(root / 4 * 2 ** (c[0] / 12), beat * 1.8, "tri", 1.5, .004), t0, .9)
    if i % 4 == 2:
        M.lay(cl, M.band(M.burst(.08, 40, 1), 900, 5000), t0, .22)
    t0 += beat / 2; i += 1
e = M.env([(0, .75), (K["s4"], 1), (K["s7"], .7), (K["s8"], 1), (END + .4, 1), (DUR, .2)])
music = stereo(.42 * pl * e + .55 * ba * e + .2 * cl * e, .1 * np.roll(pl, 500) * e)


def snap(t, a=.05):
    d = M.band(M.burst(.03, 90, 1), 1800, 9000)
    g(d, t, a); g(M.note(1400, .03, "sine", 60), t, a * .5)


def rattle(t, n, span, a=.032):
    for k in range(n):
        snap(t + span * k / n + M.rng.random() * .015, a)


g(M.lib("typing"), .05, .1)
rattle(AT["s1:game"], 16, .9, .05)
g(M.thump(), AT["s1:game"], .25)
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[x] - .14, .14)
g(M.lib("typing"), K["s3"] + .1, .1)
g(M.lib("pop"), K["s3"] + 3, .1) if K["s4"] > K["s3"] + 3 else None
g(M.lib("whoosh"), AT["s4:rencananya"] - .2, .12)
rattle(AT["s4:kode"], 16, .7)
rattle(AT["s4:dunia"], 34, 1.1)
g(M.thump(), AT["s4:karakter"] + .3, .22)
rattle(AT["s4:tampilan"], 12, .5)
for k, f in enumerate([523, 659, 784]):
    g(M.note(f, .28, "pluck", 6), AT["s4:suara"] + k * .1, .12)
for k in range(3):
    g(M.note(880 - 80 * k, .14, "square", 18), AT["s5:mainkan"] + 1 + k * .75, .035)
g(M.lib("sparkle"), AT["s5:diubah"], .16)
g(M.lib("chime"), AT["s6:71"], .16)
for x in ("Selandia", "Singapura", "Serbia", "Thailand"):
    g(M.thump(.2), AT["s7:" + x], .14); snap(AT["s7:" + x], .08)
g(M.lib("click-soft"), AT["s7:Indonesia"], .22)
g(M.lib("sparkle"), OUT - .4, .14)
g(M.thump(), OUT, .22)
M.finish(music)
