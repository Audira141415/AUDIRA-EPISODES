"""EP04 sound: a bouncy kids-TV ukulele-and-marimba tune with a wooden shaker. Foley is small and handmade: clay squish, wood blocks, a toy meow at the start and a soft purr under the reveal. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(404)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7")}
uk, mar, sh, bs = M.mono(), M.mono(), M.mono(), M.mono()
step = 60 / 118 / 2
root = 261.63
ch = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]]
mel = [7, 9, 12, 9, 7, 4, 7, 9, 12, 14, 12, 9, 7, 9, 7, 4]
i, t0 = 0, 0.0
while t0 < DUR:
    c = ch[(i // 8) % 4]
    if i % 2 == 1:
        for j, n in enumerate(c):
            M.lay(uk, M.note(root * 2 ** (n / 12), step * 1.8, "pluck", 4.2), t0 + j * .008, .38)
    if i % 4 == 0:
        M.lay(bs, M.note(root / 4 * 2 ** (c[0] / 12), step * 3, "tri", 2), t0, .9)
    if (i // 16) % 2 == 1 and i % 2 == 0:
        M.lay(mar, M.note(root * 2 * 2 ** (mel[(i // 2) % 16] / 12), .4, "sine", 9) + .4 * M.note(root * 8 * 2 ** (mel[(i // 2) % 16] / 12), .4, "sine", 22), t0, .4)
    M.lay(sh, M.band(M.burst(.03, 130, 1), 4000, 13000), t0, .34 if i % 2 else .18)
    t0 += step; i += 1
e = M.env([(0, .75), (K["s3"], .9), (AT["s7:Rahasiaku"] - .3, .9), (AT["s7:Rahasiaku"], .35), (DUR - .4, .3), (DUR, 0)])
music = stereo(uk * e + .55 * bs * e + .75 * mar * e + .4 * sh * e, .16 * np.roll(mar, 600) * e)
def squish(t, a=.05):
    n = int(.12 * SR); x = np.arange(n) / SR
    g(np.sin(2 * np.pi * (140 * x + 900 * x ** 2)) * np.exp(-x * 26) + .3 * M.band(M.burst(.12, 40, 1), 300, 2500), t, a)
def wood(t, f=900, a=.04):
    n = int(.08 * SR); x = np.arange(n) / SR
    g(np.sin(2 * np.pi * f * x) * np.exp(-x * 60), t, a)
n = int(.55 * SR); x = np.arange(n) / SR
f = 520 + 300 * np.sin(np.pi * x / .55) ** 2
g(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / .55) * (.6 + .4 * np.sin(2 * np.pi * 34 * x)), .05, .05)
for v in K.values():
    squish(v - .1)
for w in ("s2:Suara", "s2:wajah", "s3:Karakter", "s3:Punya", "s4:Suara", "s5:Hedra", "s6:Runway"):
    squish(AT[w], .06); wood(AT[w] + .08, 1100, .03)
for w in ("s3:wajah", "s3:mulut", "s4:Tanda", "s4:akting", "s5:Satu", "s5:sepuluh", "s6:rekam", "s6:Standard", "s7:nyata", "s7:Kartun"):
    wood(AT[w], 760, .03)
ra = AT["s7:Rahasiaku"]
pr = np.sin(2 * np.pi * 26 * T) * (.6 + .4 * np.sin(2 * np.pi * 1.1 * T)) * M.env([(0, 0), (ra - .1, 0), (ra + .5, 1), (END, 1), (END + .4, 0), (DUR, 0)])
M.fx += np.stack([pr, pr], 1) * .035
for k, f0 in enumerate((523, 659, 784, 1047)):
    g(M.note(f0, .7, "pluck", 4), OUT + .1 + k * .1, .055)
M.finish(music)
print("duration", DUR)
