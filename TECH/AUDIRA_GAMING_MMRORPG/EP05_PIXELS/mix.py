"""EP05 sound: a chiptune farm tune (square lead, triangle bass, noise hat) that slows and thins as the day ends. Every SFX is synthesised as a game blip. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(5050)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
lead, bass, hat, nite = M.mono(), M.mono(), M.mono(), M.mono()
base = 261.63
mel = [0, 4, 7, 12, 9, 7, 4, 7, 5, 9, 12, 9, 7, 4, 2, 4]
low = [0, 0, 5, 5, 7, 7, 0, 0]
t0, i = 0.0, 0
stopT = s("s8")["start"]
step = 60 / 128 / 2
while t0 < stopT:
    if i % 2 == 0:
        M.lay(lead, M.note(base * 2 ** (mel[(i // 2) % 16] / 12), step * 1.7, "square", 3.2, .002), t0, .34)
    if i % 4 == 0:
        M.lay(bass, M.note(base / 4 * 2 ** (low[(i // 4) % 8] / 12), step * 3.6, "tri", 1.0, .002), t0, .85)
    M.lay(hat, M.burst(.03, 120, 1), t0, .14 if i % 2 else .07)
    t0 += step; i += 1
# the night version: one slow music-box line
for j, d in enumerate([12, 7, 9, 4, 5, 0, 2, 7, 12, 9, 7, 4]):
    M.lay(nite, M.note(base * 2 ** (d / 12), 1.4, "tri", 1.7, .004), stopT + j * .68, .55)
e = M.env([(0, .9), (K["s6"], .9), (K["s7"], .55), (stopT - .3, .4), (stopT, 0), (DUR, 0)])
ne = M.env([(stopT - .3, 0), (stopT + .1, 1), (END, 1), (DUR - .4, 0), (DUR, 0)])
music = stereo(.3 * lead * e + .5 * bass * e + .12 * hat * e + .5 * nite * ne, .08 * np.roll(lead, 600) * e + .12 * np.roll(nite, 700) * ne)
def blip(t, f0=660, f1=990, d=.09, a=.05, kind="square"):
    n = int(d * SR); x = np.arange(n) / SR
    fr = np.linspace(f0, f1, n)
    ph = np.cumsum(fr) / SR
    sig = (np.sign(np.sin(2 * np.pi * ph)) * .6 if kind == "square" else np.sin(2 * np.pi * ph)) * np.exp(-x * 14) * np.minimum(1, (d - x) / .006)
    g(sig, t, a)
coin = lambda t, a=.045: (blip(t, 988, 988, .07, a), blip(t + .07, 1319, 1319, .2, a))
hoe = lambda t, a=.04: (g(M.band(M.burst(.05, 60, 1), 400, 3000), t, a * 1.6), blip(t, 180, 110, .05, a))
# hoe strikes follow the swing rate in world3d.js
for x in np.arange(.5, K["s2"] - .3, 1 / 1.9):
    hoe(x)
coin(AT["s1:kripto"], .06)
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    for k in range(4):
        blip(K[x] - .16 + k * .04, 440 + k * 180, 520 + k * 180, .05, .022)
# villagers pop in
v = AT["s2:sepuluh"]
for k in range(26):
    blip(v - .4 + k * .077, 700 + (k * 53) % 400, 1000, .04, .012)
blip(AT["s3:Tanam"], 523, 659, .1, .05); blip(AT["s3:panen"], 659, 1047, .12, .05); blip(AT["s3:masak"], 392, 330, .15, .05)
for x in np.arange(K["s3"] + .4, s("s3")["end"] - .4, 1 / 1.9):
    hoe(x, .02)
en = AT["s3:energi"]
for k in range(6):
    blip(en + k * .13, 880 - k * 110, 780 - k * 110, .07, .025)
for k in range(5):
    blip(AT["s3:makanan"] + k * .08, 523 + k * 110, 620 + k * 110, .06, .028)
blip(AT["s4:Speck"], 330, 392, .12, .05)
for k, f in enumerate((523, 659, 784, 1047)):
    blip(AT["s4:NFT"] + k * .09, f, f, .1, .045)
for x in np.arange(AT["s4:sharecropper"], s("s4")["end"], 1 / 1.8):
    hoe(x, .03)
coin(AT["s5:Koin"], .05)
for k, f in enumerate((1047, 1319, 1568, 2093)):
    blip(AT["s5:PIXEL"] + k * .07, f, f, .16, .035, "sine")
for k in range(10):
    blip(AT["s5:Ronin"] + k * .06, 500 + k * 60, 560 + k * 60, .04, .018)
# coins rain from the chest and thin out exactly with the 84% cut
c = AT["s6:Chapter"]
for x in np.arange(K["s6"], c + 2.4, .09):
    p = 1 if x < c else 1 - .84 * min(1, (x - c) / 2.4)
    if rng.random() < p:
        blip(x, 1319 + rng.uniform(0, 600), 1319 + rng.uniform(0, 600), .05, .012)
g(M.thump(.4), AT["s6:84"], .14); blip(AT["s6:84"], 440, 110, .4, .05)
ta = AT["s6:mengambil"]
for k in range(10):
    blip(ta - 1.2 + k * .24, 200, 170, .05, .025)
# stepped price fall, pitch tracks the curve on the board
h = AT["s7:Harga"]
for k in range(44):
    blip(h + k * (2.4 / 44), 1600 * 2 ** (-k / 9), 1600 * 2 ** (-k / 9), .05, .026)
g(M.thump(.5), h + 2.4, .16)
blip(AT["s7:tetap"], 523, 659, .16, .035)
# campfire crackle at night
fi = rng.uniform(stopT, END, 80)
for x in fi:
    g(M.band(M.burst(.02, 200, 1), 1000, 6000), x, .02)
blip(AT["s8:peluang"], 659, 880, .12, .045); blip(AT["s8:hiburan"], 880, 659, .12, .045)
for k, f in enumerate((523, 659, 784, 1047, 1319)):
    blip(OUT + .15 + k * .09, f, f, .3, .04)
M.finish(music)
print("duration", DUR)
