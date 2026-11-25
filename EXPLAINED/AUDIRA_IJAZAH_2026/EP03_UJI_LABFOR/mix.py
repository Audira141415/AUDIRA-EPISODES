"""EP03 sound: a lab that hums. Sine pads and a clean pulse, pen plots and relay clicks, one unresolved interval at the end. Run from this folder."""
import sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from scorelib import paper

M = Mix(2025)
DUR, rng, g = M.DUR, M.rng, M.put
END = M.TL["speech_end"]
K = {s["id"]: s["start"] for s in M.TL["scenes"]}
w = M.word
hz = lambda d: 55.0 * 2 ** (d / 12)
beat = 60 / 88
pad, pulse = M.mono(), M.mono()
chords = [(0, 12, 15, 22), (-3, 12, 16, 19), (-5, 10, 14, 19), (-7, 12, 15, 17)]
for b in range(0, int(DUR / beat), 8):
    for d in chords[(b // 8) % 4]:
        M.lay(pad, M.note(hz(d), beat * 8.4, "tri", .08, 1.0), b * beat, .32)
for b in range(int(END / beat)):
    M.lay(pulse, M.note(hz(24 + (7 if b % 8 == 6 else 0)), .16, "sine", 16), b * beat, .32)
pad = M.band(pad, 50, 1800)
pe = M.env([(0, .7), (K["s2"], .85), (K["s4"], 1), (K["s8"], .8), (END, .55), (DUR - .5, 0), (DUR, 0)])
ue = M.env([(0, .45), (K["s2"], .7), (K["s4"], 1), (K["s7"], .6), (K["s8"], .3), (END, 0), (DUR, 0)])
music = stereo(.65 * pad * pe + .42 * pulse * ue, .14 * pad * pe)


def plot(t0, dur, a=.012):
    """Pen plotter: a run of short high ticks."""
    for x in np.arange(t0, t0 + dur, .055):
        g(M.tone((2600 + rng.uniform(-300, 500),), .012, 180), x, a)


for s in K:
    if s != "s1":
        g(M.lib("whoosh-short"), K[s] - .2, .04)
plot(.2, 1.4)
kb = w("s1", "keberatan")
g(M.thump(.5), kb, .22)
g(paper(rng, .1, 3), kb, .1)
plot(K["s2"] + .2, 1.3)
g(M.lib("click"), w("s2", "Apabila"), .09)
plot(w("s2", "file"), 1.3)
g(M.lib("click-soft"), w("s3", "Labfor"), .08)
g(M.lib("click-soft"), w("s3", "dokumen"), .08)
g(M.lib("click"), w("s3", "ditenteng"), .05)
hum = M.tone((120, 240, 360), w("s4", "Jokowi") - w("s4", "Error") + .2)
i = np.arange(len(hum))
g(hum * np.minimum(1, np.minimum(i / (.2 * SR), (len(hum) - i) / (.3 * SR))), w("s4", "Error"), .016)
for x in np.sort(rng.uniform(w("s4", "Error"), w("s4", "Jokowi"), 22)):
    g(M.lib("click-soft"), x, .018)
g(M.thump(.4), w("s5", "Yang"), .12)
g(M.burst(.7, 5, 6), w("s5", "Yang"), .018)
g(M.lib("ping"), w("s6", "identik"), .05)
g(M.lib("riser"), w("s6", "independen") - 1, .018)
press = w("s7", "sudah")
g(M.thump(.3), press, .2)
g(paper(rng, .08, 3), press + .02, .1)
g(M.lib("click"), w("s8", "apabila"), .08)
g(M.tone((220, 233), 3.2, .9), END - 1.6, .035)
g(M.lib("chime"), END + .55, .05)
import os
os.makedirs("AUDIO/work", exist_ok=True)
_orig = Mix.save
Mix.save = staticmethod(lambda path, a: _orig("AUDIO/mix.wav" if path.endswith("mix.wav") else path, a))
M.finish(music)
print("duration", DUR)
