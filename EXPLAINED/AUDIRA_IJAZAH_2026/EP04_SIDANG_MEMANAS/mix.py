"""EP04 sound: dry drums and an upright-bass figure that speed up with the argument, drop out at the adjournment, return small. Run from this folder."""
import sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from scorelib import paper, murmur

M = Mix(1630)
DUR, rng, g = M.DUR, M.rng, M.put
END = M.TL["speech_end"]
K = {s["id"]: s["start"] for s in M.TL["scenes"]}
w = M.word
hz = lambda d: 55.0 * 2 ** (d / 12)
beat = 60 / 112
kick, hat, bass = M.mono(), M.mono(), M.mono()
fig = [0, 0, 3, 5, 0, 7, 5, 3]
for b in range(int(END / (beat / 2))):
    t0 = b * beat / 2
    if b % 4 == 0:
        M.lay(kick, M.thump(.18)[: int(.18 * SR)], t0, .9)
    if b % 8 == 4:
        M.lay(hat, M.burst(.1, 26, 2), t0, .5)
    M.lay(hat, M.burst(.03, 120, 1), t0, .12)
    M.lay(bass, M.note(hz(fig[b % 8]), beat * .46, "tri", 4), t0, .8)
hat = M.band(hat, 1500, 12000)
sk = K["s5"]
env = M.env([(0, .35), (K["s2"], .4), (K["s3"], .55), (K["s4"], 1), (sk - .05, 1.1), (sk + .02, 0), (K["s6"] - .4, 0), (K["s6"], .5), (w("s6", "Hakim"), .85), (K["s7"], .3), (K["s8"], .18), (END, .1), (DUR - .4, 0), (DUR, 0)])
music = stereo(.6 * kick * env + .35 * hat * env + .6 * bass * env, .06 * hat * env)

for s in K:
    if s not in ("s1", "s5"):
        g(M.lib("whoosh-short"), K[s] - .18, .05)
for a, s_, gn in (("ditegur", "s1", .24), ("Hakim", "s2", .2)):
    t0 = w(s_, a)
    g(M.thump(.5), t0, gn)
    g(M.burst(.05, 90, 3), t0, .07)
g(M.lib("pop"), w("s2", "bukan"), .07)
g(M.lib("pop"), w("s3", "Jokowi"), .06)
g(M.lib("pop"), w("s3", "Refly", 1), .08)
for a, n in (("Jaksa", 0), ("Refly", 0), ("Jaksa", 1)):
    g(M.lib("click"), w("s4", a, n), .09)
g(M.lib("riser"), w("s4", "Suara") - .2, .026)
g(murmur(M, K["s5"] - w("s4", "Suara"), .035), w("s4", "Suara"), 1)
s0 = w("s5", "skors")
g(M.thump(.8), s0, .36)
g(M.burst(.08, 70, 3), s0, .12)
g(M.lib("impact-bass-1"), s0, .1)
g(M.lib("click"), w("s6", "berteriak"), .08)
g(M.thump(.4), w("s6", "telunjuk"), .2)
t0 = K["s7"] + .6
for i in range(16):
    g(M.tone((1700,), .02, 160), t0 + i * .2, .018)
g(M.lib("click"), w("s7", "hakim"), .07)
hb = w("s8", "bersalaman")
g(paper(rng, .16, 6), hb, .08)
g(M.thump(.25), hb + .1, .06)
g(M.lib("chime"), END + .55, .05)
import os
os.makedirs("AUDIO/work", exist_ok=True)
_orig = Mix.save
Mix.save = staticmethod(lambda path, a: _orig("AUDIO/mix.wav" if path.endswith("mix.wav") else path, a))
M.finish(music)
print("duration", DUR)
