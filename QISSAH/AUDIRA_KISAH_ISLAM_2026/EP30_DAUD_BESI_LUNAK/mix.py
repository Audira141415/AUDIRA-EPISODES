"""EP30 sound: maqam Rast on C (C D E-half-flat F G A B-half-flat C), 84 BPM. The rhythm section is the forge itself:
a light anvil 'ting' pattern (doum-tek feel) with a soft frame-drum doum under it, a C-G drone, and a plucked oud in
short Rast phrases at scene turns. Foley follows the world: hammer clangs on every strike (hot strikes louder, with a
spark sizzle), a soft clay-like groan when the iron slumps, one ring clink per link in the chainmail diagram, a shower
of tiny clinks as the coat assembles, birdsong over the mountains, mountain wind, a forge crackle bed indoors and a soft
shimmer under the tasbih bands. Music dips for a voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(3030)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
STR, HOT, LINKS = K["str"], K["hot"], K["links"]
ROOT = 48  # C3
RAST = [0, 2, 3.5, 5, 7, 9, 10.5]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
deg = lambda d: ROOT + 12 + RAST[d % 7] + 12 * (d // 7)
n = lambda d: np.arange(int(d * SR)) / SR
BEAT = 60 / 84


def oud(f, dur=1.4):
    t = n(dur)
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0007 * h)) * np.exp(-t * (2.4 + 1.3 * h)) / h ** .8 for h in range(1, 10))
    pick = M.band(rng.standard_normal(len(t)), 1800, 6500) * np.exp(-t * 110) * .22
    return (x + pick) * np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .05)


def ting(f=2093, dur=.9, dec=7):
    t = n(dur)
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dec * r ** .5) for r, a in [(1, 1), (2.76, .5), (5.4, .25), (8.93, .12)])
    return x * np.minimum(1, t / .001)


def clang(f=880, dur=1.6, hard=1.0):
    t = n(dur)
    x = sum(a * np.sin(2 * np.pi * f * r * t + r) * np.exp(-t * (4 + 2.5 * r ** .6)) for r, a in [(1, 1), (1.52, .7), (2.44, .55), (3.17, .4), (4.6, .28), (6.1, .2)])
    hit = M.band(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-t * 60) * .8
    return (x * .6 + hit) * hard * np.minimum(1, t / .0008)


# ---------- drone, forge rhythm, oud
drone = (np.sin(2 * np.pi * hz(ROOT - 12) * T) + .6 * np.sin(2 * np.pi * hz(ROOT - 5) * T) + .25 * np.sin(2 * np.pi * hz(ROOT) * T + 1)) * (.7 + .3 * np.sin(2 * np.pi * .05 * T))
drone *= M.env([(0, 0), (1.5, .2), (K["s2"], .28), (K["s4"], .22), (K["s6"], .26), (END, .3), (DUR - .3, 0), (DUR, 0)])
rh = M.mono()
pat = [1, 0, 0, 1, 0, 1, 0, 0]
t0 = 0.0
k = 0
while t0 < OUT:
    step = k % 8
    if pat[step]:
        M.lay(rh, ting(2093 if step == 0 else 2637, .7, 9), t0, .09 if step == 0 else .06)
    if step == 0:
        M.lay(rh, M.thump(.35), t0, .32)
    if step == 4:
        M.lay(rh, M.band(M.burst(.08, 70, 2), 300, 3000), t0, .1)
    t0 += BEAT / 2
    k += 1
rh *= M.env([(0, 0), (K["s2"] - .5, 0), (K["s2"], .7), (K["s3"], .45), (K["s4"], .9), (K["s6"], .55), (K["s7"], .9), (END, .8), (OUT, 0), (DUR, 0)])
od = M.mono()


def phrase(t, notes, amp=.26):
    for d, b in notes:
        M.lay(od, oud(hz(deg(d)), max(.8, b + .6)), t, amp)
        t += b


phrase(.2, [(4, .35), (3, .3), (2, .3), (1, .4), (0, 1.1)], .22)
phrase(K["s2"] + .3, [(0, .3), (1, .3), (2, .3), (3, .3), (4, .7), (5, .3), (4, 1.0)])
phrase(AT["s2:Wahai"], [(4, .3), (5, .3), (6, .3), (7, 1.3)], .24)
phrase(K["s3"] + .2, [(7, .4), (6, .3), (5, .3), (4, 1.0)], .22)
phrase(AT["s3:Alam"] - .3, [(2, .3), (3, .3), (4, .3), (5, .3), (4, 1.2)], .22)
phrase(K["s5"] + .2, [(0, .3), (2, .3), (4, .5), (3, .3), (2, 1.0)], .24)
phrase(AT["s5:bersyukur"] if "s5:bersyukur" in AT else K["s5e"] - 1.2, [(4, .5), (2, .5), (0, 1.4)], .24)
phrase(K["s6"] + .4, [(0, .5), (1, .4), (2, .4), (1, 1.2)], .2)
phrase(AT["s7:Ayatnya"] if "s7:Ayatnya" in AT else K["s7"] + 5, [(4, .35), (5, .3), (4, .3), (3, .3), (2, 1.2)], .22)
phrase(AT["s8:Kisah"] - .3, [(4, .4), (3, .3), (2, .3), (1, .4), (0, 1.8)], .26)
fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drone + rh + od) * fin
music = stereo(music_m, (.12 * od + .05 * rh) * fin)

# ---------- hammer strikes, hot sparks, clay slump
hot = set(round(x, 3) for x in HOT)
for s in STR:
    h = round(s, 3) in hot
    g(clang(830 if h else 1040, 1.5, 1.0), s, .16 if h else .09)
    g(M.thump(.3), s, .14 if h else .06)
    if h:
        sz = M.band(rng.standard_normal(int(.7 * SR)), 3000, 10000) * np.exp(-n(.7) * 6)
        g(sz, s + .02, .03)
        for x in rng.uniform(s, s + .5, 8):
            g(M.tone([rng.uniform(4000, 7000)], .03), x, .01)


def slump(t, amp):
    d = 1.2
    tt = n(d)
    f = 180 * np.exp(-tt * 1.4) + 60
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) ** 2
    x += .4 * M.band(rng.standard_normal(len(tt)), 200, 900) * np.sin(np.pi * tt / d)
    g(x, t, amp)


slump(AT["s1:lunak"] - .3, .08)
slump(AT["s4:lunakkan"] - .1, .07)
slump(AT["s4:menjadi"], .08)
# forge heat whoosh as the hot bar comes out
g(M.band(rng.standard_normal(int(1.2 * SR)), 200, 2500) * np.sin(np.pi * n(1.2) / 1.2), AT["s4:Besi"] - .4, .05)

# ---------- chainmail: one clink per link, coat assembly shower
for i, x in enumerate(LINKS):
    g(ting(3136 + 120 * (i % 5), .35, 18), x, .05)
for x in np.sort(rng.uniform(AT["s5:ajarkan"] + .4, AT["s5:besi"] + 1.0, 70)):
    g(ting(rng.uniform(3500, 5200), .2, 30), x, rng.uniform(.012, .025))
g(M.lib("pop"), AT["s5:melindungi"], .05); g(ting(1568, 1.4, 3), AT["s5:melindungi"] + .05, .04)

# ---------- birdsong, wind, forge crackle, tasbih shimmer
def chirp(t):
    d = rng.uniform(.06, .14)
    tt = n(d)
    f0 = rng.uniform(2800, 4200)
    x = np.sin(2 * np.pi * np.cumsum(f0 + 1600 * np.sin(np.pi * tt / d) * rng.choice([-1, 1])) / SR) * np.sin(np.pi * tt / d)
    g(x, t, rng.uniform(.008, .018))


for a, b, cnt in [(0, 3, 10), (K["s2"], K["s3e"], 60), (K["s8"], END, 22)]:
    for x in rng.uniform(a, b, cnt):
        for j in range(rng.integers(1, 4)):
            chirp(x + j * .12)
wind = M.band(rng.standard_normal(N), 120, 1300) * (1 + .6 * np.sin(2 * np.pi * .07 * T) * np.sin(2 * np.pi * .029 * T + 1))
wind /= np.abs(wind).max()
we = M.env([(0, .4), (2.5, .2), (K["s2"], .45), (K["s4"], .12), (K["s8"], .2), (K["s8"] + 3, .45), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .05, np.roll(wind, 1800) * we * .05], 1)
cr = M.band(rng.standard_normal(N), 800, 6000) * (rng.random(N) < .002) * 6
cr = np.convolve(cr, np.exp(-np.arange(300) / 40), mode="same")
cr /= max(1e-6, np.abs(cr).max())
ce = M.env([(0, 0), (2.5, .5), (K["s2"], .1), (K["s4"], .6), (K["s5"], .4), (K["s8"], .3), (K["s8"] + 3, .05), (DUR, 0)])
M.fx += np.stack([cr * ce * .05, np.roll(cr, 400) * ce * .05], 1)
sh = sum(np.sin(2 * np.pi * hz(deg(d) + 12) * T + d) for d in [0, 4, 7]) / 3 * (1 + .3 * np.sin(2 * np.pi * 3 * T))
se = M.env([(0, .5), (2.4, .4), (3.4, 0), (AT["s2:Wahai"] - .3, 0), (AT["s2:Wahai"] + .6, 1), (K["s4"], .8), (K["s4"] + 1.2, 0), (K["s8"] + 1.5, 0), (K["s8"] + 3, .5), (DUR - .3, 0), (DUR, 0)])
M.fx += np.stack([sh * se * .012, np.roll(sh, 900) * se * .012], 1)

# ---------- panel slides, bread, crown glint, sign-off
slide = lambda: M.band(rng.standard_normal(int(.3 * SR)), 1200, 7000) * np.sin(np.pi * n(.3) / .3) ** 2
for key in ["s2", "s3", "s4", "s5", "s6", "s7", "s8"]:
    g(slide(), K[key] - .16, .02)
for w in ["s2:Wahai", "s3:burung-burung", "s4:Perintahnya", "s4:Besi", "s5:Lalu", "s7:Ayatnya"]:
    if w in AT:
        g(slide(), AT[w] - .16, .015)
for i in range(3):
    g(M.lib("pop"), AT["s1:makan"] + i * .18, .025)
g(M.lib("sparkle"), AT["s7:raja"], .035); g(M.lib("sparkle"), AT["s7:hikmah"], .025)
g(M.lib("whoosh"), 1.5, .03)
g(M.lib("chime"), AT["s8:AUDIRA"], .03)
g(M.lib("whoosh"), OUT - .2, .03); g(M.lib("chime"), OUT + .3, .045)
M.finish(music)
print("duration", DUR)
