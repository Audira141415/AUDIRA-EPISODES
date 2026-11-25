"""EP03 sound: warm, optimistic studio score. Rhodes-like chords over a brushed pulse, belt rumble as foley, a shutter click when final lands. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(303)
T, DUR, rng = M.T, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
g = M.put
K = {f"s{i}": M.scene(f"s{i}")["start"] for i in range(2, 9)}
beat = 60 / 88
keys, brush, bass = M.mono(), M.mono(), M.mono()
CH = [[196, 246.9, 293.7, 370], [164.8, 246.9, 311.1, 392], [130.8, 261.6, 329.6, 392], [146.8, 220, 293.7, 370]]
i, t0 = 0, 0.0
while t0 < DUR:
    c = CH[(i // 4) % 4]
    if i % 4 == 0:
        for k, f in enumerate(c):
            M.lay(keys, M.note(f, beat * 3.8, "pluck", .9, .01), t0 + k * .012, .3)
        M.lay(bass, M.note(c[0] / 2, beat * 3, "tri", .9), t0, .8)
    if i % 4 == 2:
        M.lay(keys, M.note(c[3] * 2, beat * 1.5, "pluck", 2.5), t0, .18)
    M.lay(brush, M.band(M.burst(.12, 28, 1), 2500, 11000), t0 + beat / 2, .4)
    t0 += beat
    i += 1
env = M.env([(0, .55), (K["s2"], 1), (OUT, 1), (DUR, .25)])
music = stereo((keys + bass + brush) * env, .2 * np.roll(keys, 640) * env)
rumble = M.band(M.rng.standard_normal(M.N), 60, 240) * .012 * M.env([(0, 0), (K["s3"], 0), (K["s3"] + 1, 1), (K["s8"], 1), (K["s8"] + 1, 0), (DUR, 0)])
g(stereo(rumble, rumble * .2), 0, 1)


def flip(t, a=.05):
    d = .07
    g(M.band(M.burst(d, 40, 1), 1800, 8000), t, a)


for v in K.values():
    flip(v - .1)
for w in ("s2:Claude", "s2:audira-motion", "s2:Mesh", "s4:Sudah", "s5:kameranya", "s5:Warnanya"):
    g(M.tone([1400], .05, 60), AT[w], .05)
# shutter on final
n = int(.09 * SR)
x = np.arange(n) / SR
g(M.band(M.burst(.09, 40, 1), 1000, 9000) * (x < .025) + M.band(M.burst(.09, 50, 1), 900, 7000) * (x > .05), K["s6"], .13)
g(M.thump(.35), K["s6"] + .05, .12)
g(M.tone([659, 988], .4, 7), AT["s8:giliranmu"], .06)
for k, f in enumerate((293.7, 370, 440, 587.3)):
    g(M.note(f, 1.3, "pluck", 2.4), OUT + .08 + k * .09, .08)
M.finish(music)
print("duration", DUR)
