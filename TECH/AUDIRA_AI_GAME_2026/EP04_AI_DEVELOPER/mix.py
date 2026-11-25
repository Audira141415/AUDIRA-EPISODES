"""EP04 sound: a machine-room sequencer in 7/8 with relay ticks; test passes are green chirps, the failing design score is a low buzz. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4404)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
seq, low, tick = M.mono(), M.mono(), M.mono()
step = 60 / 124 / 2
pat = [0, 0, 7, 0, 10, 7, 3]
hits = {0, 3, 5}
t0, i = 0.0, 0
root = 98.0
while t0 < END + 2:
    k = i % 7
    M.lay(seq, M.note(root * 2 * 2 ** (pat[k] / 12), step * 1.3, "square", 9, .002), t0, .22)
    if k in hits:
        M.lay(low, M.note(root / 2, step * 1.6, "saw", 5, .003), t0, .6)
    M.lay(tick, M.band(M.burst(.012, 200, 1), 3000, 12000), t0, .3 if k in hits else .12)
    t0 += step; i += 1
hum = np.sin(2 * np.pi * 60 * T) + .4 * np.sin(2 * np.pi * 120 * T)
e = M.env([(0, .75), (K["s2"], .55), (K["s4"], .85), (K["s5"], 1), (K["s7"], .4), (K["s8"], .55), (END + .4, .55), (DUR, .05)])
music = stereo(.42 * seq * e + .6 * low * e + .28 * tick * e + .06 * hum, .1 * np.roll(seq, 720) * e)


def chirp(t, a=.05):
    g(M.note(1320, .05, "square", 25), t, a); g(M.note(1760, .08, "square", 20), t + .05, a)


def buzz(t, a=.09):
    g(M.note(70, .4, "saw", 3), t, a); g(M.note(73, .4, "square", 3), t, a * .5)


for k in range(9):
    chirp(.1 + k * .2, .03)
buzz(AT["s1:desainnya"], .14)
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[x] - .14, .13)
    g(M.lib("click"), K[x], .14)
g(M.lib("typing"), AT["s3:spesifikasi"], .13)
for k in range(5):
    g(M.lib("click-soft"), AT["s3:spesifikasi"] + .1 + k * .55, .16)
for k in range(8):
    g(M.lib("click"), AT["s4:Kode"] + k * .28, .1)
g(M.lib("ping"), AT["s4:Satu-satunya"], .12)
g(M.note(520, .14, "square", 12), AT["s5:Melompat"], .05)
g(M.lib("impact-bass-1"), AT["s5:rintangan"], .16)
g(M.lib("whoosh"), AT["s5:jatuh"], .18)
g(M.note(390, .1, "square", 16), AT["s5:bangkit"], .05); g(M.note(780, .16, "square", 12), AT["s5:bangkit"] + .08, .05)
g(M.lib("chime"), AT["s5:Nol"], .16)
g(M.lib("riser"), AT["s6:44"] - .3, .08)
for k in range(24):
    g(M.lib("click-soft"), AT["s6:44"] + k * .065, .05)
buzz(AT["s7:progres"], .08)
for k in range(4):
    g(M.note(240 - 30 * k, .22, "square", 8), AT["s7:progres"] + k * .55, .04)
g(M.lib("ping"), AT["s8:tugas"], .12)
g(M.thump(), OUT, .2)
M.finish(music)
