"""EP02 sound: a comic bassoon + pizzicato march in A minor, snare rolls for the army, kookaburra-ish chirps on the farm.
Foley: Lewis gun clatter (synth), the jam clunk, truck putter, stamps, stop-motion plops. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1932)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
K = {x: M.scene(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
macet, truk, kalah = AT["s5:macet"], AT["s5:truk"], AT["s5:kalah"]
hz = lambda n: 440 * 2 ** ((n - 69) / 12)

def bassoon(f, dur):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + .004 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / .2)
    x = sum(np.sin(2 * np.pi * f * h * vib * t + h) / h ** 1.6 for h in range(1, 9))
    return x * np.minimum(1, t / .025) * np.minimum(1, (dur - t) / .04) * np.exp(-t * 1.2)

def pizz(f, dur=.35):
    return M.note(f, dur, "pluck", 7, .002)

# A minor comic march, 112 bpm: bassoon oom on 1 and 3, pizz chords on 2 and 4, a sneaky pizz tune on top
beat = 60 / 112
prog = [(57, [60, 64, 69]), (52, [59, 64, 68]), (57, [60, 64, 69]), (50, [57, 62, 65]), (57, [60, 64, 69]), (52, [59, 62, 68]), (53, [57, 60, 65]), (52, [56, 59, 64])]
tune = [[69, None, 72, 76, 75, 76, None, 72], [71, None, 68, 71, 74, None, 71, None], [69, None, 72, 76, 79, 77, 76, 72], [74, None, 77, 74, 69, None, None, None]]
bass, chords, mel, snare = M.mono(), M.mono(), M.mono(), M.mono()
nb = int(END / beat) + 4
for b in range(nb):
    t0 = b * beat
    bar, pos = divmod(b, 4)
    root, ch = prog[bar % len(prog)]
    if pos in (0, 2):
        M.lay(bass, bassoon(hz(root - 12 + (7 if pos == 2 else 0)), beat * .8), t0, 1)
    else:
        for n in ch:
            M.lay(chords, pizz(hz(n)), t0, .33)
    line = tune[bar % len(tune)]
    for k in range(2):
        n = line[pos * 2 + k]
        if n:
            M.lay(mel, pizz(hz(n), .3), t0 + k * beat / 2, .5)
    # snare: a tap on 2 and 4, a roll into each bar while the army is on screen
    tap = M.band(M.burst(.12, 38, 1), 900, 7000)
    M.lay(snare, tap, t0 + (beat if pos == 3 else 0) * 0, .35 if pos in (1, 3) else 0)
    if pos == 3:
        for r in range(8):
            M.lay(snare, M.band(M.burst(.05, 70, 1), 1200, 8000), t0 + r * beat / 8, .12 + r * .02)
army = M.env([(0, .9), (K["s2"], .9), (K["s2"] + .4, 0), (K["s4"] - .5, 0), (K["s4"] + 1, 1), (K["s6"], 1), (K["s6"] + .5, .15), (K["s7"], .15), (K["s7"] + 1, 0), (DUR, 0)])
mel_e = M.env([(0, 1), (AT["s2:Depresi"], 1), (AT["s2:Depresi"] + .6, .25), (K["s3"], 1), (K["s6"], 1), (K["s6"] + .5, .4), (K["s7"], .7), (DUR, .7)])
gap = M.env([(0, 1), (macet - .02, 1), (macet, .08), (macet + 1.1, .08), (macet + 1.6, 1), (DUR, 1)])
tail = M.env([(0, 1), (END, 1), (DUR - .3, 0), (DUR, 0)])
music = stereo((.55 * bass + .4 * chords + .5 * mel * mel_e + .45 * snare * army) * gap * tail, .12 * chords * gap * tail - .1 * mel * mel_e * gap * tail)
# sad bassoon "wah wah wah waaah" when the truck loses
for k, n in enumerate((45, 44, 43, 42)):
    d = .32 if k < 3 else 1.1
    g(bassoon(hz(n), d) * (1 + .3 * np.sin(np.arange(int(d * SR)) / SR * 2 * np.pi * 6)), kalah + .25 + k * .34, .07)
# outro resolves on A major
for n in (57, 61, 64, 69):
    g(pizz(hz(n), 1.2), OUT + .3, .05)

# kookaburra-ish chirps: rising, rolling laughs on the farm and at the end
def chirp(t, a=.035):
    for k in range(6):
        f0 = 900 + k * 140 + rng.uniform(-60, 60)
        d = .09
        tt = np.arange(int(d * SR)) / SR
        x = np.sin(2 * np.pi * (f0 * tt + 900 * tt * tt / d)) * np.sin(np.pi * tt / d)
        g(x, t + k * .1, a)
for t0 in (K["s2"] + .8, K["s2"] + 4.6, K["s8"] + 1.5, K["s8"] + 6):
    chirp(t0)

# Lewis gun clatter: ~10 rounds/s while firing (the same windows the world uses)
def clatter(a, b, amp=.11):
    for x in np.arange(a, b, .1):
        g(M.thump(.07), x, amp * .5); g(M.band(M.burst(.05, 90, 1), 700, 6000), x, amp)
clatter(AT["s1:tentara"], AT["s1:burung"] + .5, .08)
clatter(AT["s5:seribu"], macet, .1)
clatter(truk + .4, K["s6"] - .2, .06)
clatter(AT["s7:senapan"], AT["s7:tank"] + .7, .05)
for x in np.arange(AT["s7:senapan"] + .05, AT["s7:tank"] + .7, .23):
    g(M.tone((2600, 3900), .05, 60), x, .03)  # ricochet pings off the "tank"
# the jam: clunk, spring, silence
g(M.thump(.5), macet, .35); g(M.tone((180, 260), .25, 18), macet, .1); g(M.tone((1200, 1900), .12, 30), macet + .05, .05); g(M.lib("error"), macet + .2, .04)
# 12 tiny pops on the counter
step = (macet - AT["s5:seribu"] - .35) / 12
for k in range(12):
    g(M.lib("click-soft"), AT["s5:seribu"] + .25 + k * step, .025)
# truck putter while it chases
pt = np.arange(int((K["s6"] - truk) * SR)) / SR
put_ = (np.sin(2 * np.pi * 52 * pt) + .5 * np.sign(np.sin(2 * np.pi * 13 * pt))) * (.6 + .4 * np.sin(2 * np.pi * 13 * pt)) * np.minimum(1, pt / .3)
g(M.band(put_, 30, 900) * np.minimum(1, (pt[-1] - pt) / .3), truk, .07)
# emu crowd: low boom drumming as they arrive, footsteps patter
for x in np.arange(K["s3"] + .5, K["s3"] + 5, .45):
    g(M.tone((58, 61), .3, 9), x, .05)
for x in rng.uniform(K["s3"], K["s3"] + 5.5, 90):
    g(M.band(M.burst(.03, 120, 1), 300, 2500), x, .02)
# rabbits hop
for k in range(12):
    g(M.lib("pop"), AT["s3:kelinci"] + k * .17, .012)
# fence posts snapping, then later hammered in
for k in range(6):
    g(M.tone((420, 640), .08, 40), AT["s3:dirusak"] + k * .1, .04)
for k in range(26):
    x = AT["s7:Petani"] + .2 + k * .32
    if x < OUT:
        g(M.thump(.12), x, .06); g(M.tone((1500, 2300), .04, 80), x, .02)
# stamps: thump + paper slap
for k_ in ("s1:menang", "s4:setuju", "s5:kalah", "s6:ditarik", "s6:dikirim", "s6:diragukan", "s7:ditolak"):
    g(M.thump(.3), AT[k_], .18); g(M.band(M.burst(.08, 40, 2), 400, 5000), AT[k_], .07)
g(M.thump(.3), macet + .02, .12)
# panels plop in, reveals plop
for p in ("s2", "s3", "s4", "s5", "s5:Senapan", "s6", "s6:Sampai", "s7", "s8"):
    t0 = AT.get(p, K.get(p))
    g(M.lib("pop"), t0 - .14, .05); g(M.lib("whoosh-short"), t0 - .3, .025)
for k_ in ("s1:1932", "s2:veteran", "s2:Depresi", "s3:dimakan", "s3:dirusak", "s4:Lewis", "s4:sepuluh", "s5:berpencar", "s6:986", "s6:9.860", "s6:Tepat", "s7:bilang", "s7:pagar", "s8:pagar", "s8:tentara"):
    g(M.lib("pop"), AT[k_], .035)
# crates landing and lids, shells tinkle
for k in range(10):
    g(M.thump(.12), AT["s4:sepuluh"] + k * .09, .05)
    g(M.tone((520, 780), .06, 50), AT["s6:9.860"] - .2 + k * .15, .03)
for x in rng.uniform(AT["s6:9.860"], AT["s6:9.860"] + 2.8, 50):
    g(M.tone((3200 + rng.uniform(0, 1800),), .04, 70), x, .01)
# newspaper rustle, flag ropes, the doubt "boing"
g(M.band(M.burst(.5, 6, 3), 1500, 7000), K["s6"] - .1, .04)
for k_ in ("s6:ditarik", "s6:dikirim"):
    for i in range(5):
        g(M.tone((900 + i * 80,), .05, 40), AT[k_] + i * .1, .012)
bt = np.arange(int(.6 * SR)) / SR
g(np.sin(2 * np.pi * (180 * bt + 120 * np.sin(2 * np.pi * 8 * bt) / (2 * np.pi * 8))) * np.exp(-bt * 5), AT["s6:diragukan"] + .1, .07)
# transitions across the table
for k_ in ("s2", "s4", "s5", "s6", "s7"):
    g(M.lib("whoosh"), K[k_] - .25, .04)
g(M.lib("chime"), OUT + .3, .06)
M.finish(music)
print("duration", DUR)
