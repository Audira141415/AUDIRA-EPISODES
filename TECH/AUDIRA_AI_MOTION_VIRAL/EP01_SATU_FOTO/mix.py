"""EP01 sound: warm nylon-pluck waltz that gains instruments as the picture comes alive. Foley is all paper: rustle, fold, scissors, plus wind that starts only when the script says so. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(101)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7")}
pl, bs, pad = M.mono(), M.mono(), M.mono()
beat = 60 / 96
root = 196.0
prog = [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [-5, -1, 2]]
t0, bar = 0.0, 0
while t0 < DUR:
    ch = prog[bar % 4]
    M.lay(bs, M.note(root / 2 * 2 ** (ch[0] / 12), beat * 2.8, "pluck", 1.8), t0, .8)
    for k in (1, 2):
        for j, n in enumerate(ch[1:]):
            M.lay(pl, M.note(root * 2 * 2 ** (n / 12), beat * 1.5, "pluck", 3.0), t0 + k * beat + j * .012, .4)
    M.lay(pad, M.note(root * 2 ** (ch[0] / 12), beat * 3.1, "sine", 0, .5), t0, .3)
    t0 += beat * 3; bar += 1
pop = AT["s1:bergerak"]
e1 = M.env([(0, .25), (pop, .25), (pop + 1.6, 1), (END, 1), (DUR - .6, .7), (DUR, 0)])
e2 = M.env([(0, 0), (K["s3"], 0), (K["s4"], .9), (END, .9), (DUR - .3, 0), (DUR, 0)])
music = stereo(.7 * pl * e1 + .6 * bs * e2 + .5 * pad * e1, .12 * np.roll(pl, 500) * e1)
def rustle(t, d=.4, a=.05):
    x = M.band(M.burst(d, 3 / d, 1), 1800, 9000) * np.sin(np.pi * np.arange(int(d * SR)) / (d * SR))
    g(x, t, a)
def fold(t, a=.06):
    rustle(t - .1, .22, a); g(M.band(M.burst(.05, 90, 1), 400, 2400), t + .1, a * 2.2)
for i, d in enumerate((0, .12, .25, .4, .7)):
    fold(pop + d * 1.6, .055)
g(M.thump(.4), pop + 1.6, .13)
for x in K.values():
    rustle(x - .2, .32, .045)
# wind bed starts at the word
sy = AT["s4:Syalnya"]
wind = M.band(rng.standard_normal(N), 250, 2600)
we = M.env([(0, 0), (sy, 0), (sy + .9, 1), (K["s6"], .6), (K["s7"], 0), (DUR, 0)]) * (.7 + .3 * np.sin(T * 1.3))
M.fx += np.stack([wind * we, np.roll(wind, 900) * we], 1) * .016
g(M.tone([1320, 1760], .5, 8), AT["s4:awan"], .012)
# tick per trial, scissor snips on each cut mark
for w in ("s3:depan", "s3:tengah", "s3:belakang"):
    fold(AT[w], .045)
def snip(t, a=.09):
    g(M.band(M.burst(.03, 180, 1), 2500, 11000), t, a); g(M.band(M.burst(.03, 180, 1), 3500, 12000), t + .08, a * .8)
for k in range(4):
    snip(K["s6"] + 1.3 + k * .8, .08)
c = AT["s7:hidupkan"]
for d in (0, .3, .6):
    fold(c + d, .05)
for k, f in enumerate((392, 494, 587, 784)):
    g(M.note(f, 1.3, "pluck", 2), OUT + .1 + k * .1, .05)
M.finish(music)
print("duration", DUR)
