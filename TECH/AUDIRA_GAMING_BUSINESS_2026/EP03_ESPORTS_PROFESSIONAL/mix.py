"""EP03 sound: arena roar and PA slapback, four-on-floor stadium kick and a brass-like stab, data beeps from the broadcast truck. The roar dies at the salary scene. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(5680)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT = B["AT"]
s, g = M.scene, M.put
beat = 60 / 128
END = M.TL["speech_end"]
# roar: wide speech-band noise with slow surges, one big swell at the viewer record
roar = M.band(rng.standard_normal(N), 240, 3400); roar /= np.abs(roar).max()
roar2 = M.band(rng.standard_normal(N), 240, 3400); roar2 /= np.abs(roar2).max()
surge = .7 + .3 * np.sin(T * .63) * np.sin(T * .27 + 1)
v = AT["s4:5,68"]
e_roar = M.env([(0, 1), (s("s2")["start"], .7), (v - .5, .55), (v + .2, 1.5), (v + 2.5, .7), (s("s5")["start"], .35), (s("s6")["start"], .12), (s("s8")["start"], .1), (DUR, 0)]) * surge
kick = np.zeros(N); stab = np.zeros(N); hat = np.zeros(N)
roots = [55, 55, 65.41, 49]
for b in range(int(END / beat)):
    t0 = b * beat; i = int(t0 * SR)
    n = min(int(.3 * SR), N - i); x = np.arange(n) / SR
    kick[i:i + n] += np.sin(2 * np.pi * (50 * x + 30 * (1 - np.exp(-x * 40)) / 40)) * np.exp(-x * 12)
    if b % 2 == 1:
        n2 = min(int(.05 * SR), N - i); hat[i:i + n2] += rng.standard_normal(n2) * np.exp(-np.arange(n2) / SR * 80)
    if b % 8 == 0:
        f = roots[(b // 8) % 4]; n3 = min(int(beat * 3.5 * SR), N - i); y = np.arange(n3) / SR
        tone = sum(np.sin(2 * np.pi * f * m * y + m) / m for m in (1, 2, 3, 4, 6, 8)) + sum(np.sin(2 * np.pi * f * 1.5 * m * y) / m for m in (2, 4))
        stab[i:i + n3] += tone * np.exp(-y * .9) * np.minimum(1, y / .01)
hat = M.band(hat, 5000, 14000)
stab = M.band(stab, 60, 1800); stab /= np.abs(stab).max()
e_beat = M.env([(0, .85), (s("s5")["start"] - .3, 1), (s("s5")["start"], .45), (s("s6")["start"], .22), (s("s7")["start"], .3), (s("s8")["start"], .55), (END, .3), (DUR - .3, 0), (DUR, 0)])
# PA slapback colours the kick like a big room
slap = np.roll(kick, int(.19 * SR)) * .25 + np.roll(kick, int(.38 * SR)) * .1
mono = .15 * (kick + slap) * e_beat + .055 * stab * e_beat + .014 * hat * e_beat + .026 * roar * e_roar
side = .03 * (roar2 - roar) * e_roar * .5 + .012 * stab * e_beat
music = stereo(mono, side) * 2.2
# ---- cues ----
g(M.lib("impact-bass-1"), .03, .11); g(M.thump(.6), .03, .26)
g(M.lib("click"), AT["s1:Tapi"], .08); g(M.thump(.3), AT["s1:Tapi"], .15)
for name in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), s(name)["start"] - .36, .07)
for k in ("s2:30", "s2:dua"):
    g(M.tone((1319, 1976), .08, 28), AT[k], .04); g(M.lib("click"), AT[k], .06)
for k in ("s3:Counter-Strike", "s3:Valorant", "s3:Mobile", "s3:Free"):
    g(M.tone((988, 1480), .07, 30), AT[k], .036); g(M.thump(.18), AT[k], .09)
g(M.lib("riser"), v - 2.1, .04); g(M.lib("impact-bass-1"), v, .13); g(M.thump(.6), v, .3); g(M.burst(1.3, 3, 8), v, .05)
g(M.lib("ping"), AT["s4:Satu"], .07)
g(M.thump(.5), AT["s4:nol-empat"], .2); g(M.lib("glitch-2"), AT["s4:nol-empat"], .04)
g(M.lib("click"), AT["s5:20"], .08); g(M.lib("click"), AT["s5:sisanya"], .08); g(M.thump(.3), AT["s5:kontrak"], .17); g(M.lib("click"), AT["s5:kontrak"], .08)
g(M.lib("ping"), AT["s6:240.000"], .06); g(M.lib("ping"), AT["s6:165.000"], .06)
g(M.lib("sparkle"), AT["s7:22,5"], .06); g(M.lib("click"), AT["s7:Whitemon"], .08)
g(M.lib("pop"), AT["s8:dukung"], .08); g(M.lib("pop"), AT["s8:cadangan"], .08); g(M.thump(.3), AT["s8:Jadi"], .14)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
