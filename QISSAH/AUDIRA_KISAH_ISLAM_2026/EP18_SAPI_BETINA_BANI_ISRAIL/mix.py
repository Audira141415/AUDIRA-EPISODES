"""EP18 sound: D Hijaz (D Eb F# G A Bb C D). A plucked qanun carries the melody: bright metal-string plucks on paired,
slightly detuned courses, with the qanun's rapid tremolo (repeated plucks) on long notes. A daf/frame drum plays a soft
maqsum at 80 bpm (doum-tek-tek-doum-tek). Under it a low D/A drone. Sound design is ceramic: every tile flip is a short
glazed click, so drop-ins, cow filters, the mural reveal and the panel flips all sound like tiles turning; sinking cows
grind softly into the floor; the rock cracks at s7 and water runs until the end. Music dips for a voice via M.finish."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(1818)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
HIJAZ = [0, 1, 4, 5, 7, 8, 10]
D = 62
BPM = 80
BEAT = 60 / BPM


def deg(d, octv=0):
    return mid(D + 12 * octv + HIJAZ[d % 7] + 12 * (d // 7))


def pluck(f, dur, amp=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for det in (-0.0012, 0.0012):                     # paired courses
        x += sum(np.sin(2 * np.pi * f * (1 + det) * h * t + h * .7) * np.exp(-t * (2.6 + 2.2 * h)) / h ** 0.9 for h in range(1, 10))
    nz = M.band(M.burst(.02, 300, 1), 2000, 8000)
    x[: min(len(t), len(nz))] += .15 * nz[: len(t)]          # pick noise
    return amp * x * .5 * np.minimum(1, t / .002) * np.minimum(1, (dur - t) / .02)


def note(buf, f, dur, t0, amp):
    if dur > .9:                                       # qanun tremolo on long notes
        n = int(dur / .075)
        for k in range(n):
            M.lay(buf, pluck(f, .32, amp * (.55 + .2 * np.sin(k * .7))), t0 + k * .075)
    else:
        M.lay(buf, pluck(f, dur + .5, amp), t0)


qanun = M.mono()


def phrase(t0, notes, octv=0, amp=.5):
    t = t0
    for d, b in notes:
        if d is not None:
            note(qanun, deg(d, octv), b * BEAT, t, amp)
        t += b * BEAT
    return t


phrase(0.15, [(4, .5), (3, .5), (2, .5), (1, .5), (0, 2), (1, .5), (2, .5), (3, 1), (2, 2)], 1)
phrase(K["s2"] + .3, [(0, 1), (1, .5), (2, .5), (3, 1), (4, 3), (3, .5), (2, .5), (1, 2), (0, 3)], 1, .42)
phrase(AT["s2:mengejek"] - .2, [(5, 1), (4, 1), (2, 2)], 1, .38)
for k, a in enumerate(["s3:tua", "s3:muda", "s3:Kuning", "s4:membajak", "s4:mengairi", "s4:belang"]):
    phrase(AT[a] + .5, [(4 - k % 3, .5), (3 - k % 3, .5), (2, 1)], 1, .36)   # a short descending figure per filter
phrase(K["s3"] + .3, [(0, 2), (2, 1), (1, 1), (0, 2)], 1, .32)
phrase(K["s4"] + .3, [(2, 2), (3, 1), (2, 1), (1, 2)], 1, .32)
phrase(K["s5"] + .2, [(4, 1), (5, 1), (6, 1), (7, 3), (6, .5), (5, .5), (4, 2)], 1, .44)
phrase(AT["s5:nyaris"], [(1, 1), (0, 3)], 1, .4)
phrase(K["s6"] + .4, [(0, 2), (1, 2), (0, 4)], 0, .36)
phrase(AT["s6:sembunyikan"] - .2, [(0, .5), (2, .5), (4, .5), (7, 3)], 1, .48)
phrase(K["s7"] + .3, [(4, 2), (3, 1), (1, 1), (0, 4)], 0, .34)
phrase(AT["s7:terbelah"] - .3, [(0, .5), (4, .5), (7, .5), (9, 3)], 1, .4)
phrase(K["s8"] + .4, [(4, 2), (3, 1), (2, 1), (1, 2), (0, 2)], 1, .36)
phrase(AT["s8:Kisah"] - .2, [(0, 1), (4, 1), (7, 4)], 1, .4)

drone = M.mono()
for f, a in ((mid(D - 24), .5), (mid(D - 17), .25), (mid(D - 12), .12)):
    drone += a * np.sin(2 * np.pi * f * T) * (1 + .12 * np.sin(2 * np.pi * .17 * T))
drone *= M.env([(0, .4), (K["s6"], .5), (K["s6"] + 1, 1.0), (AT["s6:sembunyikan"], 1.0), (K["s7"], .7), (K["s8"], .5), (DUR - .4, 0), (DUR, 0)])


def doum():
    t = np.arange(int(.38 * SR)) / SR
    x = np.sin(2 * np.pi * (70 * t + 45 * (1 - np.exp(-t * 28)) / 28)) * np.exp(-t * 10)
    nz = M.band(M.burst(.05, 60, 2), 100, 900)
    x[: len(nz)] += .2 * nz
    return x


def tek():
    return M.band(M.burst(.07, 75, 1), 1800, 7000) + .3 * M.tone((2350,), .07, 60)


DM, TK = doum(), tek()
drum = M.mono()
MAQSUM = [(0, "D", 1), (1, "T", .7), (3, "T", .6), (4, "D", .8), (6, "T", .7)]   # in eighths of a 4/4 bar
bar = 4 * BEAT
for b0 in np.arange(0.15, END, bar):
    for e, k, a in MAQSUM:
        M.lay(drum, DM if k == "D" else TK, b0 + e * BEAT / 2, a * (.85 if k == "D" else .32))
drum *= M.env([(0, .8), (K["s2"], .5), (K["s3"], .9), (K["s5"], .8), (K["s6"] - .2, .8), (K["s6"], .1), (AT["s6:sembunyikan"], .1), (AT["s6:sembunyikan"] + .5, .6), (K["s7"], .2), (AT["s7:terbelah"], .6), (K["s8"], .45), (END, .2), (END + .4, 0), (DUR, 0)])

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (qanun + drone * .3 + drum * .55) * fin
music = stereo(music_m, (.22 * qanun) * fin)

# ---------- ceramic tile clicks
def click(f):
    return M.band(M.burst(.04, 260, 1), 2500, 9000) * .6 + M.tone((f, f * 1.51), .04, 90) * .5


def clicks(t0, dur, n, gain=.02):
    for x in np.sort(rng.uniform(t0, t0 + dur, n)):
        g(click(rng.uniform(2600, 4200)), x, gain * rng.uniform(.5, 1))


clicks(0, 2.2, 90, .016)                                 # medallion tiles rain in
clicks(1.15, 1.2, 30, .014)                              # the name band
clicks(AT["s1:sapi"], .45, 16, .016)
clicks(AT["s1:bertanya"] - .1, 1.0, 30, .016)
clicks(AT["s2:sapi"] - .1, 1.0, 26, .016)
FIL = ["s3:tua", "s3:muda", "s3:Kuning", "s4:membajak", "s4:mengairi", "s4:belang"]
grind = lambda d: M.band(M.burst(d, 2.2, 4), 70, 500)
for k, a in enumerate(FIL):
    clicks(AT[a], .5, 40 if k < 3 else 16, .02)
    g(grind(1.2), AT[a] + .55, .06 if k < 3 else .04)
    g(M.thump(.3), AT[a] + 1.55, .05)
g(M.lib("chime"), AT["s4:belang"] + 1.2, .05)
g(M.lib("sparkle"), AT["s5:Setiap"], .035)
g(grind(2.2), AT["s5:menyembelihnya"] + .3, .05)
clicks(AT["s5:menyembelihnya"] + .7, 1.0, 30, .016)
clicks(AT["s6:pembunuhan"], .5, 30, .016)
g(M.lib("impact-bass-1"), AT["s6:pembunuhan"], .06)
clicks(AT["s6:dituduhkan"], .5, 22, .016)
g(M.band(M.burst(.9, 4, 1), 1500, 8000), AT["s6:pukullah"] + .2, .025)   # the gold tile flies
g(M.lib("ping"), AT["s6:bagian"] + .55, .04)
clicks(AT["s6:sembunyikan"] - .1, 1.2, 60, .018)
g(M.lib("sparkle"), AT["s6:sembunyikan"], .05)
g(M.lib("chime"), AT["s6:sembunyikan"] + .3, .05)
g(M.lib("whoosh-cinematic"), K["s6e"] - .5, .03)
g(M.lib("pop"), AT["s7:hati"], .025)
clicks(AT["s7:keras"], .6, 40, .018)
g(grind(1.3), AT["s7:batu"], .07)
g(M.thump(.45), AT["s7:keras#2"], .1)
clicks(AT["s7:keras#2"], .3, 20, .014)
# the rock splits
crk = M.band(M.burst(.4, 9, 1), 300, 6000)
g(crk, AT["s7:terbelah"], .12); g(M.thump(.5), AT["s7:terbelah"] + .05, .14)
# water: gushing band noise + bubbles, from the spring to the end
tw = AT["s7:memancarkan"] - .1
flow = M.band(rng.standard_normal(N), 350, 4200) * (1 + .35 * np.sin(2 * np.pi * 1.7 * T) * np.sin(2 * np.pi * .31 * T)); flow /= np.abs(flow).max()
fe = M.env([(0, 0), (tw, 0), (tw + .4, 1), (K["s8"] + 3, .7), (AT["s8:Kisah"], .35), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([flow * fe * .05, np.roll(flow, 900) * fe * .05], 1)
for x in rng.uniform(tw, DUR - 1, 220):
    f0 = rng.uniform(380, 1300); d = rng.uniform(.03, .07)
    t = np.arange(int(d * SR)) / SR
    g(np.sin(2 * np.pi * f0 * (1 + 3 * t / d) * t) * np.exp(-t * 60), x, .012 * float(fe[min(N - 1, int(x * SR))]))
# s8 paths
clicks(AT["s8:sederhana"], .5, 30, .016)
clicks(AT["s8:mempersulitnya"], 1.2, 50, .016)
g(M.lib("pop"), AT["s8:mudah"], .03); g(M.lib("glitch-1"), AT["s8:rumit"], .015)
# courtyard air
air = M.band(rng.standard_normal(N), 150, 1800); air /= np.abs(air).max()
M.fx += np.stack([air * .006, np.roll(air, 4000) * .006], 1)

# panel flips: a short run of tile clicks and a soft whoosh
for p in ["s2", "s2:Jawab", "s3", "s4", "s5", "s5:nyaris", "s6", "s6:Allah", "s7", "s7:Padahal", "s8", "s8:Kisah"]:
    tp = AT.get(p, K.get(p))
    g(M.lib("whoosh-short"), tp - .3, .025)
    clicks(tp - .16, .3, 7, .014)
g(M.lib("impact-bass-1"), 0.12, .08)
g(M.lib("whoosh"), OUT - .2, .035); g(M.lib("chime"), OUT + .3, .05)
M.finish(music)
print("duration", DUR)
