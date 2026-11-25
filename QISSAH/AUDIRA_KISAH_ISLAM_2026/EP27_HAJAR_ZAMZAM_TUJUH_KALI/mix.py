"""EP27 sound: maqam Bayati on D (D E-half-flat F G A Bb C D; the E is a quarter tone low). A soft plucked oud carries
short Bayati phrases, a breathy ney (filtered noise + sine with slow vibrato) holds long notes, and a low drone keeps
D and A under the whole film. Desert wind throughout. Sewing foley: a tiny needle "tick" per stitch while a lane is
sewn (s1 hook, s5 laps), soft fabric rustle for the hem. s5: a frame drum pulses like a running heartbeat during the
seven laps and speeds up with them; it stops dead at the last lap. s6: three soft ripple tones (the voice), then
water gushing, settling into a steady spring trickle. Card stitch-ins get a short thread-pull swish. Music dips for a
voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(2027)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
ROOT = 50  # D3
BAY = [0, 1.5, 3, 5, 7, 8, 10]  # Bayati, E a quarter tone flat
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
deg = lambda d: ROOT + 12 + BAY[d % 7] + 12 * (d // 7)
n = lambda d: np.arange(int(d * SR)) / SR


def lapf(arr, t):
    xs, ys = zip(*arr)
    return float(np.interp(t, xs, ys))


def oud(f, dur=1.3):
    t = n(dur)
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0005 * h)) * np.exp(-t * (2.6 + 1.3 * h)) / h ** .85 for h in range(1, 10))
    pick = M.band(rng.standard_normal(len(t)), 1800, 6000) * np.exp(-t * 120) * .2
    return (x + pick) * np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .05)


def ney(f, dur):
    t = n(dur)
    vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / .6)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    tone = np.sin(ph) + .25 * np.sin(2 * ph) + .08 * np.sin(3 * ph)
    breath = M.band(rng.standard_normal(len(t)), f * .8, f * 4) * .5
    env = np.minimum(1, t / .35) * np.minimum(1, (dur - t) / .5)
    return (tone * .8 + breath) * env


# ---------- drone (D + A), swelling slowly
drone = (np.sin(2 * np.pi * hz(ROOT - 12) * T) + .6 * np.sin(2 * np.pi * hz(ROOT - 5) * T) + .3 * np.sin(2 * np.pi * hz(ROOT) * T * 1.0015))
drone *= (.6 + .4 * np.sin(2 * np.pi * .05 * T)) * M.env([(0, .0), (1.5, .5), (K["s2"], .55), (K["s5"], .7), (K["s6"], .4), (K["s7"], .6), (END, .6), (DUR - .3, 0), (DUR, 0)])
drone = M.band(drone, 40, 900)

# ---------- oud phrases
od = M.mono()


def phrase(t0, notes, amp=.26):
    t = t0
    for d, b in notes:
        M.lay(od, oud(hz(deg(d)), max(.7, b + .6)), t, amp)
        t += b


phrase(.2, [(4, .3), (3, .3), (2, .3), (1, .3), (0, 1.0)], .22)
phrase(K["s2"] + .4, [(0, .4), (1, .3), (2, .3), (3, .6), (2, .3), (1, 1.0)], .24)
phrase(AT["s2:Ka'bah"], [(4, .4), (3, .3), (4, 1.2)], .22)
phrase(K["s3"] + .3, [(2, .35), (1, .3), (0, 1.1)], .22)
phrase(AT["s3:berkata"], [(0, .3), (2, .3), (3, .3), (4, .9), (3, .3), (2, 1.2)], .22)
phrase(K["s4"] + .3, [(4, .45), (5, .4), (4, .4), (3, .4), (2, 1.4)], .2)
phrase(K["s6"] + .2, [(7, .4), (6, .3), (5, .3), (4, 1.3)], .2)
phrase(AT["s6:Zamzam"] - .1, [(0, .25), (2, .25), (4, .25), (7, 1.6)], .25)
phrase(K["s7"] + .3, [(4, .4), (3, .3), (2, .3), (3, .5), (4, 1.3)], .22)
phrase(AT["s8:Kisah"] - .3, [(4, .4), (5, .3), (4, .3), (2, .4), (0, 1.8)], .24)

# ---------- ney long tones
nb = M.mono()
for t0, d, dur, a in [(K["s2"] + 2.4, 4, 3.4, .16), (AT["s2:air"] - .4, 1, 2.6, .14), (K["s4"] + 2.2, 4, 4.2, .15), (AT["s4:rumah-Mu"], 3, 3.2, .14),
                      (AT["s5:Bayinya"], 1, 2.2, .12), (AT["s6:memancar"] + .6, 7, 3.4, .14), (K["s7"] + 3.2, 4, 3.6, .14), (K["s8"] + .5, 2, 4.4, .13), (AT["s8:Menurut"] + .8, 0, 4.5, .13)]:
    M.lay(nb, ney(hz(deg(d)), dur), t0, a)

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (.35 * drone + od + nb) * fin
music = stereo(music_m, (.12 * od + .1 * nb) * fin)

# ---------- frame drum: running heartbeat during the laps
lapB = K["lapB"]
t0d, t1d = lapB[0][0] - .2, lapB[-1][0]


def drum(low=True):
    d = .35
    t = n(d)
    f0 = 78 if low else 140
    body = np.sin(2 * np.pi * (f0 * t + 30 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * (11 if low else 22))
    skin = M.band(rng.standard_normal(len(t)), 400, 3500) * np.exp(-t * 60) * (.2 if low else .45)
    return body + skin


tt = t0d
while tt < t1d:
    lp = lapf(lapB, tt)
    rate = 1.4 + (lp / 7) * 2.6  # beats per second, rising with the laps
    g(drum(True), tt, .16); g(drum(False), tt + .16 / rate * 1.6, .07)
    tt += 1 / rate
g(M.thump(.5), t1d + .02, .1)

# ---------- sewing ticks: one per stitch while a lane is sewn
tick = lambda: M.band(M.burst(.03, 160, 1), 2500, 9000)
for arr in (K["lapA"],):
    pass
ND = 34
for (a, b) in [(K["lapA"][0][0], K["lapA"][-1][0])]:
    tt = a
    while tt < b:
        g(tick(), tt, .03); tt += (b - a) / (7 * ND) * 3
for i in range(len(lapB) - 1):
    a, b = lapB[i][0], lapB[i + 1][0]
    dl = lapB[i + 1][1] - lapB[i][1]
    if dl <= 0:
        continue
    tt, step = a, (b - a) / (dl * ND) * 2
    while tt < b:
        g(tick(), tt, .022); tt += step

# ---------- desert wind and the spring
wind = M.band(rng.standard_normal(N), 140, 1400) * (1 + .6 * np.sin(2 * np.pi * .07 * T) * np.sin(2 * np.pi * .029 * T + 1))
wind /= np.abs(wind).max()
we = M.env([(0, .2), (K["s2"], .35), (AT["s2:air"], .5), (K["s3"], .3), (K["s4"], .45), (K["s5"], .3), (K["s6"], .25), (K["s7"], .3), (K["s8"], .4), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .045, np.roll(wind, 1700) * we * .045], 1)

tP = AT["s6:memancar"]
gush = M.band(rng.standard_normal(N), 200, 5000) * (1 + .5 * M.band(rng.standard_normal(N), .5, 8))
gush /= np.abs(gush).max()
ge = M.env([(0, 0), (tP - .1, 0), (tP + .15, 1), (tP + 1.8, .7), (AT["s6:membendungnya"] + 1, .3), (K["s7"], .18), (K["s8"] + 2, .1), (DUR - .3, 0), (DUR, 0)])
M.fx += np.stack([gush * ge * .07, np.roll(gush, 600) * ge * .07], 1)
trick = M.band(rng.standard_normal(N), 2500, 9000) * (1 + rng.standard_normal(N) ** 2 * .4)
trick /= np.abs(trick).max()
M.fx += np.stack([trick * ge * .015, np.roll(trick, 900) * ge * .015], 1)
g(M.thump(.6), tP, .12)
for i in range(3):  # the voice: three soft ripple tones
    g(M.tone([hz(deg(7)), hz(deg(11))], 1.6, 2.2) * .6, AT["s6:suara"] + i * .35, .05)
g(M.lib("sparkle"), tP + .2, .03)
# water skin: slosh empties, then fills
sl = M.band(rng.standard_normal(int(1.0 * SR)), 300, 2500) * np.sin(np.pi * n(1.0)) ** 2
g(sl, AT["s5:Air"], .03); g(sl, AT["s6:mengisi"], .04)

# ---------- hem rustle when Hajar moves, footsteps as soft fabric taps
rus = lambda d: M.band(rng.standard_normal(int(d * SR)), 1500, 7000) * np.sin(np.pi * n(d) / d)
for t0, d in [(AT["s2:membawa"], 2.3), (AT["s3:Hajar"], 2.6), (AT["s3:berkata"], 2.2), (AT["s5:naik"], 1.1)]:
    g(rus(d), t0, .012)
tap = lambda: M.band(M.burst(.06, 70, 2), 300, 2500)
for t0, d, step in [(AT["s2:membawa"], 2.3, .32), (AT["s3:berjalan"], 8.0, .55)]:
    for x in np.arange(t0, t0 + d, step):
        g(tap(), x, .012 * (1 - .7 * (x - t0) / d))

# ---------- object stitch-ins, scene changes, card thread-pull swish
swish = lambda: M.band(rng.standard_normal(int(.28 * SR)), 2000, 9000) * np.linspace(1, 0, int(.28 * SR)) ** 2 * np.sin(np.pi * n(.28) / .28) ** .5
for w in ["s2:Ismail", "s3:sekantong", "s3:sedikit"]:
    g(M.lib("pop"), AT[w], .03); g(swish(), AT[w] - .1, .02)
for k in ["s2", "s3", "s4", "s5", "s6", "s7", "s8"]:
    g(swish(), K[k] - .16, .028)
for w in ["s2:Saat", "s3:Hajar", "s5:Ia", "s6:Itulah", "s7:Dan"]:
    if w in AT:
        g(swish(), AT[w] - .16, .02)
g(M.lib("whoosh-short"), K["s2"] - .1, .02)  # thread unpicked
g(M.lib("chime"), AT["s7:asal"], .025)
g(M.lib("chime"), AT["s8:AUDIRA"], .03)
g(M.lib("whoosh"), OUT - .2, .03); g(M.lib("chime"), OUT + .3, .045)
M.finish(music)
print("duration", DUR)
