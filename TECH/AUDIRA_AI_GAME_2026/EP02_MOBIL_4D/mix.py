"""EP02 sound: dark synthwave pulse in the drafting room that opens into a driving beat when the car leaves, plus an engine that follows the drive. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2202)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
arp, bass, kick, hat = M.mono(), M.mono(), M.mono(), M.mono()
step = 60 / 112 / 4
seq = [0, 7, 12, 15, 12, 7, 3, 7]
prog = [0, 0, -4, -2]
t0, i = 0.0, 0
base = 110.0
while t0 < END + 2:
    r = prog[(i // 32) % 4]
    M.lay(arp, M.note(base * 2 * 2 ** ((seq[i % 8] + r) / 12), step * 1.6, "saw", 8, .003), t0, .32)
    if i % 2 == 0:
        M.lay(bass, M.note(base / 2 * 2 ** (r / 12), step * 1.9, "saw", 4, .004), t0, .7)
    if i % 4 == 0:
        M.lay(kick, M.thump(.26), t0, .8)
    if i % 4 == 2:
        M.lay(hat, M.burst(.04, 90, 1), t0, .16)
    t0 += step; i += 1
drive_on = M.env([(0, 0), (K["s6"] - .2, 0), (K["s6"] + .3, 1), (K["s8"], 1), (K["s8"] + 1.5, .3), (DUR, 0)])
e_arp = M.env([(0, .7), (K["s3"], .35), (K["s4"], .7), (K["s6"], 1), (K["s8"], .75), (END + .4, .7), (DUR, .1)])
music = stereo(.5 * arp * e_arp + .5 * bass * (.45 + .55 * drive_on) + .55 * kick * (.18 + .82 * drive_on) + .25 * hat * drive_on, .12 * np.roll(arp, 600) * e_arp)

# engine: two detuned low saws whose pitch rises with the drive
a = np.clip((T - K["s6"]) / 1.6, 0, 1)
f = 48 + 42 * a + 6 * np.sin(T * 1.1)
ph = np.cumsum(f) / SR
eng = sum(np.sin(2 * np.pi * h * ph) / h for h in range(1, 6))
g(eng * drive_on * .022, 0)
g(M.lib("riser"), max(0, AT["s1:mobil"] - .9), .16)
g(M.lib("impact-bass-1"), AT["s1:masuk"], .24)
g(M.lib("whoosh-cinematic"), AT["s1:menyetirnya"] - .3, .2)
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[x] - .14, .14)
g(M.lib("click"), AT["s3:bongkah"], .2)
for k in range(5):
    g(M.note(180 + k * 8, .07, "square", 30), AT["s3:rodanya"] + k * .16, .035)
g(M.lib("error"), AT["s3:rodanya"] + .3, .14)
g(M.lib("whoosh-cinematic"), AT["s4:lima"], .16)
g(M.lib("click"), AT["s4:bodi"], .2)
for k in range(4):
    g(M.lib("click-soft"), AT["s4:roda"] + k * .12, .2)
g(M.lib("glitch-1"), AT["s5:skrip"], .1)
g(M.lib("ping"), AT["s5:ukuran"], .12)
g(M.lib("sparkle"), AT["s5:berputar"], .12)
g(M.lib("impact-bass-1"), K["s6"], .22)
g(M.lib("whoosh"), AT["s7:pesawat"], .18)
g(M.lib("whoosh-cinematic"), AT["s7:naga"], .16)
g(M.lib("chime"), AT["s7:64"], .13)
g(M.lib("sparkle"), AT["s8:ribuan"], .14)
g(M.thump(), OUT, .22)
M.finish(music)
