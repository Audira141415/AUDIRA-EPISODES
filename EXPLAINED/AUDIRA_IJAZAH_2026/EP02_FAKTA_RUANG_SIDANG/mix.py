"""EP02 sound: harpsichord-like plucks over a viol drone, like an archive being read aloud. Quill, paper and a gear ratchet. Run from this folder."""
import sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from scorelib import paper, murmur

M = Mix(1980)
DUR, rng, g = M.DUR, M.rng, M.put
END = M.TL["speech_end"]
K = {s["id"]: s["start"] for s in M.TL["scenes"]}
w = M.word
hz = lambda d: 110.0 * 2 ** (d / 12)
beat = 60 / 76
drone, plk = M.mono(), M.mono()
prog = [(0, 7, 12), (-2, 5, 10), (-4, 3, 8), (-5, 2, 7)]
arp = [12, 19, 15, 24, 19, 15, 12, 15]
for b in range(0, int(DUR / beat), 8):
    c = prog[(b // 8) % 4]
    for d in c:
        M.lay(drone, M.note(hz(d), beat * 8.3, "saw", 0.12, 0.8), b * beat, 0.3)
for b in range(int(END / beat)):
    c = prog[(b // 8) % 4]
    M.lay(plk, M.note(hz(arp[b % 8] + c[0]), 1.1, "pluck", 3.2), b * beat, 0.42)
drone = M.band(drone, 70, 1200)
de = M.env([(0, .6), (K["s3"], .85), (K["s6"], 1), (K["s8"], .7), (END, .4), (DUR - .5, 0), (DUR, 0)])
pe = M.env([(0, .75), (K["s6"], .5), (K["s7"], .35), (K["s8"], .55), (END, .4), (DUR - .4, 0), (DUR, 0)])
music = stereo(.6 * drone * de + .5 * plk * pe, .16 * drone * de + .1 * plk * pe)

for s in K:
    if s != "s1":
        g(paper(rng, .34, 14), K[s] - .22, .13)
up = w("s1", "mengangkat")
for i in range(4):
    g(paper(rng, .2, 7), up - .1 + i * .09, .14)
g(murmur(M, 2, .05), up + .1, 1)
g(M.thump(.45), up, .1)
g(M.thump(.35), w("s2", "SMA"), .1)
for a in ("SD", "SMP", "SMA", "Fakultas"):
    g(M.lib("click-soft"), w("s3", a), .06)
for a in ("Ujian", "Ijazah", "Wisuda"):
    t0 = w("s4", a)
    for i in range(7):
        g(M.burst(.018, 300, 2), t0 + i * .07, .05)
    g(M.lib("ping"), t0 + .4, .03)
for i in range(3):
    g(paper(rng, .16, 5), w("s5", "tiga") + i * .12, .1)
for a, off in (("2005", 0), ("2005", .35), ("2005", .7), ("2019", -.7), ("2019", 0)):
    g(M.thump(.22), w("s5", a) + off, .08)
for a in ("beda", "bawah", "watermark", "fotonya"):
    g(M.lib("click-soft"), w("s6", a), .05)
g(M.lib("click"), w("s7", "tanpa"), .08)
g(M.lib("click"), w("s7", "mengizinkan"), .08)
g(M.band(M.burst(.9, 2.4, 1), 2400, 8000), w("s8", "mencatatnya") - .2, .012)
g(M.lib("chime"), END + .55, .05)
M.save_to = None
M.finish_path = None
import os
os.makedirs("AUDIO/work", exist_ok=True)
import audio_lib
_orig = Mix.save
Mix.save = staticmethod(lambda path, a: _orig("AUDIO/mix.wav" if path.endswith("mix.wav") else path, a))
M.finish(music)
print("duration", DUR)
