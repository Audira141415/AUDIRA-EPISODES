"""EP03 sound: mischievous pizzicato and taiko over a low brain hum, comic stingers on every panel slam. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(3303)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
piz, tk = M.mono(), M.mono()
beat = 60 / 96
scale = [0, 3, 5, 7, 10, 12, 10, 7, 5, 3, 0, -2, 0, 3, 7, 5]
t0, i = 0.0, 0
root = 196.0
while t0 < END + 2:
    if i % 2 == 0 or i % 16 in (3, 11):
        M.lay(piz, M.note(root * 2 ** (scale[i % 16] / 12), .34, "pluck", 11, .002), t0, .55)
    if i % 8 == 0:
        M.lay(tk, M.thump(.45), t0, 1.0)
    if i % 8 == 6:
        M.lay(tk, M.thump(.22), t0, .5)
    t0 += beat / 2; i += 1
hum = np.sin(2 * np.pi * 73.4 * T) + .5 * np.sin(2 * np.pi * 110 * T + np.sin(T * .7))
hum_e = M.env([(0, 0), (K["s4"], 0), (K["s4"] + 1.2, 1), (K["s6"], 1), (K["s6"] + .3, .2), (K["s7"], .2), (K["s7"] + .4, 1), (K["s8"], .3), (DUR, 0)])
e = M.env([(0, .9), (K["s3"], .55), (K["s4"], .9), (K["s7"], .55), (K["s8"], .9), (END + .4, .9), (DUR, .1)])
music = stereo(.45 * piz * e + .55 * tk * e + .12 * hum * hum_e, .08 * np.roll(piz, 540) * e)


def slam(t, a=.14):
    g(M.thump(.2), t, a * .9)
    g(M.band(M.burst(.07, 50, 1), 500, 4000), t, a)


slam(AT["s1:percaya"], .24)
g(M.lib("pop"), AT["s1:percaya"] + .08, .16)
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    slam(K[x])
g(M.lib("typing"), .15, .14)
for k in range(4):
    g(M.lib("click-soft"), K["s3"] + .4 + k * .6, .18)
g(M.lib("error"), AT["s3:Tanya"] + .4, .15)
g(M.lib("riser"), AT["s4:otak"] - .8, .1)
g(M.lib("impact-bass-1"), AT["s4:LLM"], .2)
for k in range(6):
    g(M.note(120, .06, "square", 25), AT["s4:Roblox"] + .4 + k * .14, .05)
g(M.lib("sparkle"), K["s5"] + .3, .12)
for k in range(30):
    g(M.lib("click-soft"), AT["s5:Total"] + k * .055, .05)
g(M.lib("chime"), AT["s5:1.200"], .14)
for k in range(3):
    g(M.lib("impact-bass-1"), AT["s6:bertarung"] + k * .3, .1)
g(M.lib("pop"), AT["s6:mencari"], .16)
g(M.lib("glitch-2"), AT["s7:dibohongi"], .16)
for k in range(5):
    g(M.note(660, .09, "square", 18), AT["s7:putaran"] + k * .26, .03)
g(M.lib("whoosh"), AT["s8:melatih"], .12)
slam(AT["s8:Kalau"], .16)
g(M.thump(), OUT, .22)
M.finish(music)
