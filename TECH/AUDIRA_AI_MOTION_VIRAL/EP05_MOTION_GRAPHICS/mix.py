"""EP05 sound: minimal techno-click score that starts from one flat office sine and gains layers exactly as the sheets split. Foley is UI: key clicks while the editor types, frame ticks during render. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(505)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7")}
kick, clk, sub, stab = M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 124
i, t0 = 0, 0.0
root = 73.42
stabs = [0, 3, -2, 5]
while t0 < DUR:
    M.lay(kick, M.thump(.2)[: int(.2 * SR)], t0, .8)
    M.lay(clk, M.band(M.burst(.012, 400, 1), 3000, 13000), t0 + beat / 2, .7)
    if i % 2 == 1:
        M.lay(sub, M.note(root * 2 ** (stabs[(i // 8) % 4] / 12), beat * .8, "tri", 2.5), t0, .8)
    if i % 8 == 6:
        for n in (0, 7, 10):
            M.lay(stab, M.note(root * 4 * 2 ** ((stabs[(i // 8) % 4] + n) / 12), .5, "saw", 7), t0, .24)
    t0 += beat; i += 1
ko = AT["s1:kode"]; sl = AT["s7:Slide"]
drum = M.env([(0, 0), (ko, 0), (ko + .01, 1), (sl, 1), (sl + 1.2, 0), (DUR, 0)])
syn = M.env([(0, 0), (AT["s2:Lapisan"], 0), (AT["s2:Lapisan"] + .5, 1), (sl, 1), (sl + 1.2, 0), (DUR, 0)])
hum = np.sin(2 * np.pi * 220 * T) * .3 * M.env([(0, .55), (ko - .02, .55), (ko, 0), (sl + .6, 0), (sl + 1.4, .3), (DUR - .3, .2), (DUR, 0)])
music = stereo(.9 * kick * drum + .7 * clk * drum + .9 * sub * drum + .5 * stab * syn + .5 * hum, .14 * np.roll(stab, 500) * syn)
def click(t, a=.03, f=2600):
    n = int(.018 * SR); x = np.arange(n) / SR
    g(np.sin(2 * np.pi * f * x) * np.exp(-x * 320) + .5 * M.burst(.018, 280, 1), t, a)
def cut(t, a=.08):
    d = .13; n = int(d * SR); x = np.arange(n) / SR
    g(M.band(M.burst(d, 16, 1), 900, 8000) * np.minimum(1, x / .01), t, a)
g(M.thump(.45), ko, .2); cut(ko, .1)
for v in K.values():
    cut(v - .08)
for w in ("s2:Kamera", "s2:Lapisan", "s2:kata", "s4:GSAP", "s4:render", "s4:Apache", "s5:Gratis", "s5:lisensi"):
    click(AT[w], .05, 1800)
# typing, one key per printed character cadence
a = AT["s3:Tugasmu"]; b = K["s4"] - .6
for x in np.arange(a, b, .058):
    if rng.random() > .25:
        click(x + rng.uniform(-.01, .01), .012, rng.uniform(1800, 3200))
hf = AT["s4:HyperFrames"]
for k in range(22):
    click(hf + .8 + k * .13, .018, 1200 + k * 40)
for k in range(70):
    pass
# remotion: one tick per second of its frame counter
pa = AT["s5:Panel"]
for k in range(int(K["s6"] - pa)):
    click(pa + k, .02, 1000)
g(M.thump(.35), AT["s6:Angka"], .18); g(M.tone([1320, 1980], .25, 12), AT["s6:Angka"], .05)
n = int(.7 * SR); x = np.arange(n) / SR
g(np.sin(2 * np.pi * np.cumsum(1500 * np.exp(-x * 3) + 200) / SR) * np.exp(-x * 3) * .5, sl, .05)
for k, f in enumerate((293.7, 440, 587.3)):
    g(M.note(f, 1.1, "tri", 3), OUT + .08 + k * .1, .06)
M.finish(music)
print("duration", DUR)
