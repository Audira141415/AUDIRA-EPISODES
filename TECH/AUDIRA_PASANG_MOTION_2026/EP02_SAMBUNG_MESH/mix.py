"""EP02 sound: dark electronic pulse that stays filtered until the plug seats, then the full chord opens. Keyboard foley while commands type. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(202)
T, DUR, rng = M.T, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
g = M.put
K = [M.scene(f"s{i}")["start"] for i in range(2, 9)]
seat = AT["s5:claude"] + 1.1
beat = 60 / 112
low, arp, pad = M.mono(), M.mono(), M.mono()
ROOT = [55.0, 55.0, 65.41, 49.0]
i, t0 = 0, 0.0
while t0 < DUR:
    r = ROOT[(i // 16) % 4]
    M.lay(low, M.note(r, beat * .85, "saw", 3.5), t0, .55)
    M.lay(arp, M.note(r * [4, 6, 8, 6, 9.5, 8, 6, 4][i % 8], beat * .6, "square", 7), t0, .16)
    if i % 16 == 0:
        for m in (2, 3, 4.76):
            M.lay(pad, M.note(r * m, beat * 16.2, "sine", .05, 1.2), t0, .3)
    t0 += beat
    i += 1
open_ = M.env([(0, .15), (seat - .1, .22), (seat + .3, 1), (OUT, 1), (DUR, .2)])
music = stereo(low * (.5 + .5 * open_) + arp * open_ + pad * (.3 + .7 * open_), .25 * np.roll(arp, 620) * open_)


def click(t, a=.02, f=2600):
    n = int(.018 * SR)
    x = np.arange(n) / SR
    g(np.sin(2 * np.pi * f * x) * np.exp(-x * 320) + .5 * M.burst(.018, 280, 1), t, a)


for a, n_ch, cps in ((AT["s3:clone"], 69, 40), (AT["s4:npm"], 11, 26), (AT["s5:claude"], 130, 30)):
    for k in range(n_ch):
        if rng.random() > .2:
            click(a + k / cps + rng.uniform(-.006, .006), .016, rng.uniform(1700, 3100))
for v in K:
    g(M.band(M.burst(.1, 30, 1), 1200, 7000), v - .08, .05)
# Hook overload: rising noise, then a clipped stab on "penuh".
pen = AT["s1:penuh"]
d = 2.2
n = int(d * SR)
g(M.band(M.burst(d, 0, 1), 800, 6000) * (np.arange(n) / n) ** 2.5, pen - d, .05)
g(M.thump(.5), pen, .22)
g(M.thump(.5), seat, .3)
g(M.tone([440, 660, 880], .5, 5), seat + .03, .06)
g(M.tone([880, 1320], .3, 9), AT["s7:connected"], .06)
g(M.tone([880, 1320], .3, 9), AT["s7:online"], .06)
for k, f in enumerate((220, 329.6, 440)):
    g(M.note(f, 1.1, "tri", 3), OUT + .08 + k * .1, .07)
M.finish(music)
print("duration", DUR)
