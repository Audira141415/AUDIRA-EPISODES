"""EP04 sound: a warm plucked pentatonic village tune with wooden percussion, in a major key. Foley: slime boing, anvil, coin, wooden block tock that marks the chain. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(9600)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
beat = 60 / 92
lute, bass, wood = M.mono(), M.mono(), M.mono()
penta = [0, 2, 4, 7, 9, 12, 14, 16]
base = 196.0
tune = [4, 5, 3, 4, 2, 3, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2]
worth = AT["s7:lima"]
for i in range(int(END / (beat / 2))):
    t0 = i * beat / 2
    if (i % 32) < 28 and i % 2 == 0:
        M.lay(lute, M.note(base * 2 ** (penta[tune[(i // 2) % 16]] / 12), 1.1, "pluck", 2.4, .002), t0, .5)
    M.lay(lute, M.note(base * 2 ** (penta[(i * 3) % 4] / 12) / 2 * 2, .5, "pluck", 5, .002), t0, .14)
    if i % 4 == 0:
        M.lay(bass, M.note(base / 2 * (1 if (i // 16) % 2 == 0 else 2 ** (5 / 12)), beat * 1.8, "tri", 1.3), t0, .7)
    if i % 2 == 1:
        M.lay(wood, M.tone((720, 1180), .04, 60), t0, .34)
e = M.env([(0, .7), (K["s2"], 1), (worth - .2, 1), (worth + .4, .35), (K["s8"], .7), (END, .7), (DUR - .4, 0), (DUR, 0)])
music = stereo(.5 * lute * e + .45 * bass * e + .18 * wood * e, .13 * np.roll(lute, 700) * e)
# the chain: a low wooden tock every 3 s of film, the same rate the blocks appear on screen
for x in np.arange(3, END, 3):
    g(M.tone((180, 360, 720), .09, 30), x, .035)
def boing(t, a=.05):
    n = int(.22 * SR); x = np.arange(n) / SR
    g(np.sin(2 * np.pi * (240 * x + 900 * x * x)) * np.exp(-x * 13), t, a)
for i in range(4):
    boing(AT["s1:Setiap"] + .3 + i * 1.4)
g(M.lib("pop"), AT["s1:Setiap"] + .3, .06)
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[x] - .28, .045); g(M.lib("click-soft"), K[x], .06)
# anvil
c = AT["s3:Crafting"]
for i in range(5):
    g(M.tone((1320, 2640, 3960), .3, 14), c + .1 + i * .55, .045); g(M.thump(.1), c + .1 + i * .55, .07)
bk = AT["s3:blok"]
for i in range(8):
    g(M.tone((220 + i * 22, 520), .07, 34), bk + i * .45, .05)
g(M.lib("sparkle"), c + 3.2, .05)
g(M.lib("pop"), AT["s4:Shop"], .06)
for i in range(3):
    g(M.tone((2093, 3136), .1, 26), AT["s4:laku"] + i * .07, .05)
g(M.lib("click"), AT["s4:pajak"], .07)
# arena: medals drop and a small crowd swell
md = AT["s5:medali"]
for i in range(18):
    g(M.tone((2500 + (i * 137) % 1200, 3800), .08, 34), md + i * .11 + .78, .02)
cr = M.band(rng.standard_normal(N), 500, 2600); cr /= np.abs(cr).max()
ce = M.env([(s("s5")["start"], 0), (s("s5")["start"] + .9, 1), (AT["s5:Staking"], .3), (AT["s5:Staking"] + .6, 0), (DUR, 0)])
M.fx += np.stack([cr * ce * .022, np.roll(cr, 350) * ce * .022], 1)
g(M.lib("ping"), AT["s5:Staking"], .05)
g(M.lib("whoosh"), AT["s6:WNCG"] - .2, .05); g(M.lib("click"), AT["s6:biaya"], .07)
# coin pile rises, then collapses to its dollar value
u = AT["s7:empat"]
for x in rng.uniform(u - .2, u + 1.4, 90):
    g(M.tone((2300 + rng.uniform(0, 2200), 5100), .07, 40), x, .012)
g(M.thump(.8), worth, .28); g(M.lib("impact-bass-1"), worth, .12)
for x in rng.uniform(worth, worth + 1.1, 70):
    g(M.tone((1600 + rng.uniform(0, 1800),), .06, 40), x, .012)
g(M.lib("pop"), AT["s8:Jadi"], .05)
for i in range(12):
    g(M.tone((180 + i * 16, 360), .05, 40), OUT - .15 + i * .042, .03)
g(M.lib("chime"), OUT + .4, .07)
M.finish(music)
print("duration", DUR)
