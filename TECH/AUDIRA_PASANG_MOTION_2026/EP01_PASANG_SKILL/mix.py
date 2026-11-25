"""EP01 sound: a drafting-table score. Dry plucked notes on a slow pulse, pencil scratch on panel changes, a soft snap when the part lands. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(101)
T, DUR, rng = M.T, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
g = M.put
K = [M.scene(f"s{i}")["start"] for i in range(2, 9)]
pl, bass, pad = M.mono(), M.mono(), M.mono()
beat = 60 / 96
CH = [[146.8, 220, 293.7, 370], [123.5, 185, 246.9, 311], [130.8, 196, 261.6, 329.6], [110, 164.8, 220, 277.2]]
i, t0 = 0, 0.0
while t0 < DUR:
    c = CH[(i // 8) % 4]
    M.lay(pl, M.note(c[[0, 2, 1, 3, 2, 1, 3, 2][i % 8]] * 2, .9, "pluck", 3), t0, .55)
    if i % 4 == 0:
        M.lay(bass, M.note(c[0] / 2, beat * 3.6, "tri", .7), t0, .8)
        for f in c[1:]:
            M.lay(pad, M.note(f, beat * 4.2, "sine", .15, .5), t0, .22)
    t0 += beat
    i += 1
fade = M.env([(0, 0), (.4, 1), (OUT, 1), (DUR, .25)])
music = stereo((pl + bass + pad) * fade, .22 * np.roll(pl, 700) * fade)


def scratch(t, d=.28, a=.05):
    n = int(d * SR)
    x = np.arange(n) / SR
    g(M.band(M.burst(d, 5, 1), 2500, 9000) * np.sin(np.pi * x / d) ** .5, t, a)


def tick(t, a=.05, f=2100):
    n = int(.02 * SR)
    x = np.arange(n) / SR
    g(np.sin(2 * np.pi * f * x) * np.exp(-x * 300), t, a)


for v in K:
    scratch(v - .1)
for w in ("s2:Isinya", "s4:folder", "s4:titik", "s4:skills", "s4:audira-motion", "s7:mengunduh", "s7:tes"):
    tick(AT[w], .06)
g(M.thump(.35), AT["s4:audira-motion"] + .9, .16)
g(M.thump(.45), AT["s5:menemukannya"], .22)
g(M.tone([180, 188], .28, 8), AT["s5:menemukannya"], .05)
g(M.tone([880, 1320], .3, 9), AT["s5:terlihat"], .05)
g(M.tone([880, 1320], .3, 9), AT["s6:Muncul"], .05)
g(M.thump(.3), AT["s8:kita"], .12)
for k, f in enumerate((293.7, 370, 440)):
    g(M.note(f, 1.1, "pluck", 3), OUT + .08 + k * .1, .07)
M.finish(music)
print("duration", DUR)
