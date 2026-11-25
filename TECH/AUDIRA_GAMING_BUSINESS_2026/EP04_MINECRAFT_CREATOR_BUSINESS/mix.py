"""EP04 sound: wistful music-box piano over wind and birds, wood knocks and block-place thuds. Each terrace adds a note. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(295)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT = B["AT"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
pia = np.zeros(N)
def key(f, t0, a=1.0, dur=2.6):
    i = int(t0 * SR)
    if i >= N: return
    n = min(int(dur * SR), N - i); x = np.arange(n) / SR
    pia[i:i + n] += a * sum(h * np.sin(2 * np.pi * f * k * x) * np.exp(-x * (1.5 + k * .9)) for k, h in zip((1, 2, 3, 5), (1, .42, .2, .06)))
# sparse pentatonic phrase, seeded so the notes stay the same every run
scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25]
beat = 60 / 72
idx = 2
for b in range(int(END / (beat / 2))):
    t0 = b * beat / 2
    if rng.random() < (.42 if b % 2 else .85):
        idx = int(np.clip(idx + rng.integers(-2, 3), 0, 7))
        lift = 1 if t0 > s("s5")["start"] else 0
        key(scale[idx] * (1 + lift * (idx < 4)), t0, .6 + .4 * rng.random())
    if b % 8 == 0:
        root = [130.81, 110.0, 87.31, 98.0][(b // 8) % 4]
        key(root, t0, 1.1, 4); key(root * 1.5, t0 + .02, .5, 4)
wind = M.band(rng.standard_normal(N), 180, 900); wind /= np.abs(wind).max()
windG = M.env([(0, .5), (s("s3")["start"], .7), (s("s5")["start"], 1), (s("s7")["start"], 1.5), (DUR, .7)]) * (.7 + .3 * np.sin(T * .31) * np.sin(T * .17 + 2))
e = M.env([(0, .8), (s("s3")["start"], 1), (END, .9), (DUR - .5, 0), (DUR, 0)])
music = stereo(.15 * pia * e + .02 * wind * windG, .03 * pia * e + .008 * wind * windG) * .8
place = lambda t, a=.1: (g(M.thump(.14), t, a), g(M.burst(.05, 90, 6), t, a * .4))
# ---- birds early, then cues ----
for x in rng.uniform(.4, s("s4")["start"], 9):
    for j in range(3):
        g(M.tone((3300 + j * 300,), .05, 40), x + j * .08, .009)
for name in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), s(name)["start"] - .3, .06)
g(M.lib("sparkle"), .02, .07); place(.05, .14)
for k in ("s2:skin", "s2:adventure", "s2:texture", "s2:add-on"):
    place(AT[k]); g(M.lib("pop"), AT[k], .05)
for i in range(10):
    g(M.tone((1760, 2640), .06, 34), AT["s2:Minecoins"] + i * .06, .03)
for k in ("s3:portofolio", "s3:bisnis", "s3:key", "s3:publisher"):
    place(AT[k], .08)
g(M.lib("click"), AT["s3:direview"], .09); g(M.lib("chime"), AT["s3:direview"] + .3, .05)
g(M.lib("whoosh-short"), AT["s4:App"], .08); g(M.lib("ping"), AT["s4:separuh"], .07)
for i in range(16):
    place(AT["s5:295"] + i * .09, .05)
for i in range(7):
    g(M.tone((1568 + i * 110, 2349 + i * 110), .1, 24), AT["s5:43"] + i * .07, .03)
g(M.thump(.5), AT["s5:252"], .2)
for i in range(6):
    place(AT["s6:perusahaan"] + i * .14, .1)
for i in range(13):
    g(M.tone((220,), .05, 30), AT["s6:26"] + i * .11, .04)
g(M.lib("click"), AT["s7:Catatan"], .08); g(M.lib("riser"), AT["s7:afiliasi"] - 1.9, .03); g(M.lib("sparkle"), AT["s7:afiliasi"], .08)
place(AT["s8:produk"], .12); place(AT["s8:jual"], .1)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
