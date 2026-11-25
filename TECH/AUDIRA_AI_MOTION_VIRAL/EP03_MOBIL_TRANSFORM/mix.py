"""EP03 sound: a low cinematic drone with slow timpani pulses and an engine idle bed. Metal foley on every transform, and a very heavy bass drop exactly where the script names it. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(303)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7")}
drone = np.sin(2 * np.pi * 41 * T) + .5 * np.sin(2 * np.pi * 82.2 * T) + .25 * np.sin(2 * np.pi * 123.7 * T + np.sin(T * .6))
pad, tim = M.mono(), M.mono()
for i, t0 in enumerate(np.arange(0, DUR, 60 / 72 * 4)):
    n = [0, 3, -2, 5][i % 4]
    M.lay(pad, M.note(164.8 * 2 ** (n / 12), 60 / 72 * 4.2, "saw", .2, .9), t0, .22)
    M.lay(tim, M.thump(.6), t0, .7)
    M.lay(tim, M.thump(.45), t0 + 60 / 72 * 2, .4)
rise = M.env([(0, .75), (AT["s6:bass"] - .3, 1), (AT["s6:bass"], .35), (K["s7"], .8), (DUR - .5, .7), (DUR, 0)])
music = stereo(.8 * drone * rise + .34 * pad * rise + .9 * tim * rise, .12 * np.roll(pad, 800) * rise)
def metal(t, a=.05, f=2100):
    d = .35; x = np.arange(int(d * SR)) / SR
    g((np.sin(2 * np.pi * f * x) + .6 * np.sin(2 * np.pi * f * 1.47 * x) + .4 * np.sin(2 * np.pi * f * 2.13 * x)) * np.exp(-x * 13) + .4 * M.burst(d, 20, 1), t, a)
def servo(t, d=1.4, a=.03, up=True):
    n = int(d * SR); x = np.arange(n) / SR; f = (160 + 340 * x / d) if up else (500 - 340 * x / d)
    ph = np.cumsum(f) / SR
    g((np.sign(np.sin(2 * np.pi * ph)) * .35 + np.sin(4 * np.pi * ph) * .35) * np.sin(np.pi * x / d), t, a)
def whoosh(t, d=.7, a=.06):
    x = M.band(M.burst(d, 0.01, 1), 300, 5000) * np.sin(np.pi * np.arange(int(d * SR)) / (d * SR)) ** 2
    g(x, t, a)
def transform(t, d=1.6, a=1):
    servo(t, d, .028 * a)
    for k in range(9):
        metal(t + k * d / 9 + rng.uniform(-.03, .03), .022 * a, rng.uniform(1400, 3400))
    g(M.thump(.5), t + d, .22 * a); metal(t + d, .05 * a, 1300)
transform(AT["s1:balap"], 1.6)
servo(K["s2"] - .25, .7, .02, False)
for v in K.values():
    whoosh(v - .3, .55, .035)
for w in ("s2:awal", "s2:akhir"):
    g(M.band(M.burst(.03, 300, 1), 2000, 9000), w and AT[w], .1)
for w in ("s3:sudut", "s3:posisi", "s3:cahaya"):
    g(M.tone([1760], .05, 24), AT[w], .025)
transform(AT["s4:rangka"] - .2, 1.2, .7); transform(AT["s4:balap"] - .2, 1.2, .7)
metal(AT["s5:Panel"], .05); servo(AT["s5:rangka"], 1, .025); metal(AT["s5:roda"], .04, 900)
ba = AT["s6:bass"]
sp = AT["s6:percikan"]
for x in rng.uniform(sp, ba + 3, 120):
    g(M.band(M.burst(.02, 220, 1), 2500, 11000), x, .022)
n = int(2.2 * SR); x = np.arange(n) / SR
g(np.sin(2 * np.pi * (34 * x + 30 * (1 - np.exp(-x * 9)) / 9)) * np.exp(-x * 2.1), ba, .56)
g(M.thump(.5), ba, .35); metal(ba, .06, 700)
g(np.sin(2 * np.pi * 1000 * np.arange(int(.05 * SR)) / SR), AT["s7:label"], .012)
for k, f in enumerate((330, 440, 554, 880)):
    g(M.note(f, 1.5, "sine", 2.2), OUT + .1 + k * .12, .05)
M.finish(music)
print("duration", DUR)
