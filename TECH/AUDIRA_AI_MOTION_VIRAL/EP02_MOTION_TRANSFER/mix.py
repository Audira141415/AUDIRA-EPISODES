"""EP02 sound: 112 BPM four-on-floor groove locked to the dancer's beat function, with gamelan-like metallic plucks for the dalang idea. Drums drop when the capture pose is explained. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(202)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7")}
kick, hat, bass, gam = M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 112
root = 55.0
pel = [0, 1, 3, 7, 8]
line = [3, 0, 7, 8, 7, 3, 1, 0]
i, t0 = 0, 0.0
K0 = M.thump(.3)[: int(.3 * SR)]
while t0 < DUR:
    M.lay(kick, K0, t0, .9)
    M.lay(hat, M.band(M.burst(.05, 90, 1), 5000, 14000), t0 + beat / 2, .5)
    M.lay(bass, M.note(root * 2 ** (line[i % 8] / 12), beat * .9, "saw", 3), t0, .35)
    if i % 2 == 0:
        M.lay(gam, M.note(440 * 2 ** (pel[(i // 2) % 5] / 12), 1.6, "sine", 2.2) + .5 * M.note(440 * 2.76 * 2 ** (pel[(i // 2) % 5] / 12), 1.6, "sine", 5), t0 + beat / 4, .3)
    t0 += beat; i += 1
pa = AT["s5:telapak"]
drums = M.env([(0, 0), (AT["s1:bergerak"] - .1, 0), (AT["s1:bergerak"], 1), (pa - .6, 1), (pa, .0), (pa + 2.2, 0), (pa + 3, 1), (K["s7"], .55), (END, .3), (DUR - .4, 0), (DUR, 0)])
gme = M.env([(0, .8), (K["s3"], .7), (K["s7"], 1), (DUR - .3, .4), (DUR, 0)])
music = stereo(.6 * kick * drums + .35 * hat * drums + .6 * bass * drums + .55 * gam * gme, .15 * np.roll(gam, 700) * gme)
def blip(t, f=1400, d=.05, a=.03):
    g(M.tone([f], d, 30), t, a)
def scan(t, a=.04):
    n = int(.34 * SR); x = np.arange(n) / SR
    g(np.sin(2 * np.pi * (500 * x + 4000 * x ** 2)) * np.minimum(1, (.34 - x) / .01) * .6, t, a)
for k, v in K.items():
    scan(v - .05)
g(M.thump(.5), AT["s1:bergerak"], .16)
for w in ("s2:tali", "s2:wayangnya"):
    for k, f in enumerate((660, 880, 990)):
        g(M.note(f, .7, "sine", 4), AT[w] + k * .06, .04)
for w in ("s3:Video", "s3:Gambar", "s3:Prompt"):
    blip(AT[w], 1200); blip(AT[w] + .07, 1600)
g(M.band(M.burst(.25, 14, 1), 300, 2000), AT["s4:rusak"] - 1.1, .12); g(M.thump(.35), AT["s4:rusak"] - 1.1, .1)
for w in ("s6:Kling", "s6:Runway", "s6:Wan"):
    blip(AT[w], 900, .08, .04)
for k in range(6):
    blip(pa + k * .36, 1760, .03, .018)
for k, f in enumerate((440, 523, 660, 880)):
    g(M.note(f, 1.3, "sine", 2.4), OUT + .1 + k * .1, .04)
M.finish(music)
print("duration", DUR)
