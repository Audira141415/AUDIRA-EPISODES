"""EP01 sound: bright toy-box marimba over a walking bass, coin clinks, plastic clicks. It turns minor at the pyramid base and slump. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1440)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
AT = json.load(open("PROJECT/beats.json", encoding="utf8"))["AT"]
w, s, g = M.word, M.scene, M.put
BPM = 116
beat = 60 / BPM
# chord roots per bar, major until the median lands
major = [(261.63, 329.63, 392.0), (220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (196.0, 246.94, 293.66)]
minor = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (130.81, 164.81, 196.0), (146.83, 174.61, 220.0)]
turn, back = AT["s6:Tapi"], s("s8")["start"]
mar = np.zeros(N); bas = np.zeros(N)
def note(f, t0, dur, dec, buf, amp=1.0, harm=(1, 4, 10), hg=(1, .35, .12)):
    i = int(t0 * SR); n = int(dur * SR)
    if i >= N: return
    x = np.arange(min(n, N - i)) / SR
    buf[i:i + len(x)] += amp * sum(h * np.sin(2 * np.pi * f * k * x) * np.exp(-x * dec * (1 + k * .3)) for k, h in zip(harm, hg))
pat = [0, 1, 2, 1, 2, 0, 1, 2]
for b in range(int(DUR / beat * 2)):
    t0 = b * beat / 2
    if t0 > M.TL["speech_end"] + 1.2: break
    bar = (b // 8) % 4
    ch = (minor if turn <= t0 < back else major)[bar]
    if b % 2 == 0 or rng.random() < .5:
        note(ch[pat[b % 8]] * 2, t0, .5, 7, mar, .9 if b % 8 else 1.1)
    if b % 4 == 0:
        note(ch[0] / 2, t0, beat * 1.7, 2.6, bas, 1.0, (1, 2), (1, .25))
    elif b % 4 == 2:
        note(ch[2] / 2, t0, beat * .9, 4, bas, .7, (1, 2), (1, .25))
e = M.env([(0, .9), (s("s2")["start"], 1), (turn, .8), (s("s7")["start"], .55), (s("s7")["end"], .7), (M.TL["speech_end"], .8), (DUR - .5, 0), (DUR, 0)])
music = stereo(.13 * mar * e + .17 * bas * e, .03 * mar * e) * 1.15

def clink(t, a=.05):
    g(M.tone((2093, 3136), .09, 34), t, a); g(M.tone((3951,), .06, 50), t + .012, a * .5)
# ---- cues ----
g(M.lib("pop"), .05, .08)
for i in range(30):
    g(M.lib("click-soft"), AT["s1:Puncaknya"] + i * .11 + rng.uniform(0, .05), .03)
g(M.lib("riser"), AT["s1:Puncaknya"] - .2, .03); g(M.lib("sparkle"), AT["s1:Puncaknya"] + 3, .07)
g(M.lib("whoosh-short"), s("s2")["start"] - .3, .08)
for x in np.arange(AT["s2:Pemain"], s("s2")["end"], .75):
    clink(x, .035)
g(M.lib("pop"), AT["s2:Game"], .07); g(M.lib("pop"), AT["s2:Developer"], .07)
for i in range(6):
    clink(AT["s2:70"] + i * .07, .045)
g(M.lib("whoosh-short"), s("s3")["start"] - .3, .08)
for x in np.arange(AT["s3:30.000"], AT["s3:114"], .2):
    g(M.thump(.12), x, .025)
g(M.lib("click"), AT["s3:13"], .07)
g(M.lib("ping"), AT["s3:114"], .08); clink(AT["s3:114"], .05)
g(M.lib("whoosh-cinematic"), s("s4")["start"] - .35, .07)
g(M.lib("sparkle"), AT["s4:1,5"], .07)
for k in ("s4:Steal", "s4:Grow", "s4:Fisch"):
    g(M.thump(.3), AT[k], .14); g(M.lib("whoosh-short"), AT[k], .05)
g(M.lib("whoosh-short"), s("s5")["start"] - .3, .08)
g(M.lib("impact-bass-1"), AT["s5:menolak"] + .4, .09); g(M.thump(.4), AT["s5:menolak"] + .42, .18)
g(M.lib("click"), AT["s5:separuh"], .09)
g(M.lib("whoosh-cinematic"), s("s6")["start"] - .4, .07)
g(M.lib("sparkle"), AT["s6:1.000"], .08)
g(M.lib("whoosh-cinematic"), AT["s6:Tapi"], .09); g(M.thump(.5), AT["s6:1.440"], .2); g(M.lib("impact-bass-1"), AT["s6:1.440"], .09)
g(M.lib("click"), AT["s6:120"], .08)
g(M.lib("whoosh-short"), s("s7")["start"] - .3, .08)
g(M.lib("impact-bass-1"), AT["s7:turun"], .1)
for i in range(26):
    g(M.tone((180 + rng.uniform(0, 220),), .05, 40), AT["s7:turun"] + rng.uniform(.05, 1.3), .05)
g(M.lib("click"), AT["s7:pengguna"], .07)
g(M.lib("whoosh-short"), s("s8")["start"] - .3, .08)
g(M.lib("pop"), AT["s8:garap"], .08); g(M.lib("pop"), AT["s8:jual"], .08)
g(M.lib("chime"), json.load(open("PROJECT/beats.json"))["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
