"""EP16 sound: D Nahawand (D E F G A Bb C#), 66 bpm. A santur / hammered-dulcimer voice (three slightly detuned
strings per note, bright metallic partials, tremolo rolls on held notes) over a warm breathing pad.
Dry world (s1 before the stomp, s2-s4): dry wind gusts, sparse low santur, a hushed pad; s3-s4 a very still lamp-lit
hush. Stomp: a soft earthy thud. Spring: a splash, then a steady water trickle with bubbles that stays to the end.
s6: the santur opens into rising arpeggios (time-lapse), soft chimes as each house lights; birdsong from s6 on.
s7: three gentle bell-like santur notes on the three praises. Fog-breath swells on the panel wipes.
Music dips for a voice later via M.finish. Run from this folder after node build-video.mjs."""
import json, sys, os
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(1616)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
NAH = [0, 2, 3, 5, 7, 8, 11]
ROOT = 62
BEAT = 60 / 66
deg = lambda d, o=0: ROOT + o + NAH[d % 7] + 12 * (d // 7)

ST1, BU1 = AT["s1:kaki"], AT["s1:memancarkan"]
ST5, BU5 = AT["s5:kakimu"], AT["s5:Inilah"]


def santur(f, dur=2.4, bright=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for det in (1.0, 1.0035, 0.9968):
        ff = f * det
        x += np.sin(2 * np.pi * ff * t) * np.exp(-t * 2.2)
        x += .45 * bright * np.sin(2 * np.pi * ff * 2.003 * t) * np.exp(-t * 4.5)
        x += .22 * bright * np.sin(2 * np.pi * ff * 3.01 * t) * np.exp(-t * 7)
        x += .1 * bright * np.sin(2 * np.pi * ff * 4.2 * t) * np.exp(-t * 12)
    x /= 3
    n = int(.006 * SR)
    x[:n] += M.burst(.006, 400, 1)[:n] * .25 * bright
    return x * np.minimum(1, t / .0012)


def roll(f, dur, rate=11, amp=.6):
    """Santur tremolo: the same note struck repeatedly, fading."""
    out = np.zeros(int((dur + 2) * SR))
    for k in range(int(dur * rate)):
        s = santur(f, 1.2, .7) * (1 - .6 * k / max(1, dur * rate)) * (.7 + .3 * (k % 2))
        i = int(k / rate * SR); out[i:i + len(s)] += s[: len(out) - i]
    return out * amp


def pad(fs, dur, att=2.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * t + .25 * np.sin(2 * np.pi * .17 * t)) + .5 * np.sin(2 * np.pi * f * 1.004 * t) + .2 * np.sin(2 * np.pi * f * 2 * t) for f in fs) / len(fs)
    return x * np.minimum(1, t / att) * np.minimum(1, (dur - t) / 1.8)


# ---------- pad (Nahawand colours)
padb = M.mono()
CH = {"Dm": [50, 57, 65], "Gm": [55, 58, 62], "Bb": [58, 62, 65], "A": [57, 61, 64], "F": [53, 57, 60], "Dm2": [50, 62, 65, 69]}
plan = [(0, "Dm"), (K["s2"], "Gm"), (K["s2"] + 7, "A"), (K["s3"], "Dm"), (K["s3"] + 5.4, "Bb"), (K["s4"], "Gm"), (K["s4"] + 6, "A"),
        (K["s5"], "Dm"), (BU5, "F"), (K["s6"], "Bb"), (K["s6"] + 4.6, "F"), (K["s7"], "Gm"), (K["s7"] + 4.4, "A"), (K["s8"], "Bb"), (K["s8"] + 5, "Dm2")]
for i, (t0, c) in enumerate(plan):
    t1 = plan[i + 1][0] if i + 1 < len(plan) else DUR
    M.lay(padb, pad([mid(n) for n in CH[c]], t1 - t0 + 2), max(0, t0 - .5), 1.0)
padb *= M.env([(0, .5), (ST1, .5), (BU1, .7), (K["s2"], .45), (K["s3"], .4), (K["s4"], .32), (K["s5"], .4), (BU5, .65), (K["s6"], .75), (K["s8"], .8), (END, .8), (DUR - .3, 0), (DUR, 0)])

# ---------- santur line
pl = M.mono()


def arp(t0, t1, degs, step=.5, o=0, amp=.3, bright=1.0):
    t, i = t0, 0
    while t < t1:
        d = degs[i % len(degs)]
        if d is not None:
            M.lay(pl, santur(mid(deg(d, o)), 2.4, bright), t, amp * (1 if i % 4 == 0 else .72))
        t += step * BEAT; i += 1


# s1 hook: sparse low phrase, a roll at the spring
arp(0.15, ST1 - .2, [0, None, 3, None, 2, None, 1, None], .5, -12, .32, .8)
M.lay(pl, roll(mid(deg(4)), 1.4), BU1, .28)
for k, d in enumerate([0, 2, 4, 7]):
    M.lay(pl, santur(mid(deg(d))), BU1 + .15 + k * .22, .26)
# s2 dry: slow falling motif
arp(K["s2"] + .3, K["s3"] - .3, [4, None, 3, None, 2, None, None, None, 1, None, 0, None, None, None, None, None], .5, -12, .3, .7)
# s3 the prayer: single long notes with rolls
for k, tt in enumerate([K["s3"] + .4, AT["s3:ya"], AT["s3:ya"] + 3.2]):
    M.lay(pl, roll(mid(deg([0, 4, 2][k], -12)), 1.6, 9, .5), tt, .28)
# s4 stillness: very sparse
arp(K["s4"] + .5, K["s5"] - .4, [0, None, None, None, None, None, 4, None, None, None, None, None], .5, -12, .26, .6)
# s5: a low knock at the stomp, then the spring opens the line upward
M.lay(pl, santur(mid(deg(0, -24)), 3.0, .5), ST5, .45)
for k, d in enumerate([0, 2, 3, 4, 6, 7]):
    M.lay(pl, santur(mid(deg(d))), BU5 + .1 + k * .2, .27)
arp(BU5 + 1.6, K["s6"] - .2, [0, 4, 2, 4, 3, 4, 1, 4], .5, -12, .24)
# s6 time-lapse: flowing arpeggio, a chime for each house
arp(K["s6"] + .1, K["s7"] - .2, [0, 2, 4, 7, 9, 7, 4, 2], .25, 0, .22)
# s7 three praises: bell-like high notes
for w, d in (("s7:sabar", 7), ("s7:sebaik-baik", 9), ("s7:taat", 11)):
    M.lay(pl, santur(mid(deg(d)), 3.2, 1.2), AT[w], .34)
arp(K["s7"] + .2, AT["s7:sabar"] - .3, [0, None, 4, None, 2, None, 4, None], .5, -12, .24)
# s8 warm resolve
arp(K["s8"] + .2, END - 1.8, [0, 4, 7, 4, 5, 4, 2, 4], .5, -12, .24)
for k, d in enumerate([4, 3, 1, 0]):
    M.lay(pl, santur(mid(deg(d)), 3.0), END - 1.9 + k * .45, .3)
M.lay(pl, roll(mid(deg(0)), 1.2, 10, .5), END + .2, .25)

fin = M.env([(0, 1), (END + .4, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (padb * .42 + pl) * fin
music = stereo(music_m, (.22 * pl - .08 * padb) * fin)

# ---------- ambience
# dry wind with gusts until the spring returns
wind = M.band(rng.standard_normal(N), 180, 1600); wind /= np.abs(wind).max()
gust = .55 + .45 * np.sin(2 * np.pi * .09 * T) * np.sin(2 * np.pi * .23 * T + 1)
we = M.env([(0, .9), (BU1, .7), (BU1 + .6, .2), (K["s2"], .9), (AT["s2:setan"], 1.2), (K["s3"], .7), (K["s4"], .45), (BU5, .4), (BU5 + 1.5, 0), (DUR, 0)])
M.fx += np.stack([wind * gust * we * .03, np.roll(wind * gust, 1700) * we * .03], 1)
# water trickle: filtered noise + bubbles
tr = M.band(rng.standard_normal(N), 1200, 6000); tr /= np.abs(tr).max()
tr *= .6 + .4 * np.abs(np.sin(2 * np.pi * 3.1 * T) * np.sin(2 * np.pi * 1.7 * T + .5))
te = M.env([(0, 0), (BU1 - .05, 0), (BU1 + .2, .8), (K["s2"] - .3, .6), (K["s2"], 0), (BU5 - .05, 0), (BU5 + .3, 1), (K["s6"], .7), (K["s8"], .55), (DUR - .3, 0), (DUR, 0)])
M.fx += np.stack([tr * te * .012, np.roll(tr, 1300) * te * .012], 1)


def bubble(t, a):
    d = rng.uniform(.03, .07); tt = np.arange(int(d * SR)) / SR
    f0 = rng.uniform(500, 1400)
    x = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 2.5 * tt / d)) / SR) * np.sin(np.pi * tt / d) * np.exp(-tt * 30)
    g(x, t, a)


for a, b, n in ((BU1, K["s2"] - .2, 22), (BU5, DUR - .5, 220)):
    for x in rng.uniform(a, b, n):
        bubble(x, .02 * float(np.interp(x, M.T[:: SR // 10], te[:: SR // 10])))


# birdsong from s6
def chirp(f0, f1, d):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, len(t)) * (1 + .03 * np.sin(2 * np.pi * 40 * t))) / SR) * np.sin(np.pi * t / d)


for a, b, n in ((K["s6"] + 2, K["s7"], 7), (K["s7"], END + 1.5, 16)):
    for x in rng.uniform(a, b, n):
        base = rng.uniform(2400, 3800)
        for k in range(rng.integers(2, 6)):
            f = base * (1 + .12 * ((k * 3) % 4))
            g(chirp(f, f * rng.uniform(1.1, 1.35), rng.uniform(.05, .1)), x + k * .12, .011)


# ---------- events
def breath(t, a=.022):
    n = int(.7 * SR); tt = np.arange(n) / SR
    x = M.band(rng.standard_normal(n), 400, 3000) * np.sin(np.pi * tt / .7) ** 2
    g(x / np.abs(x).max(), t, a)


for p in ["s2", "s2:Ia#2", "s3", "s4", "s5", "s5:Kesembuhan", "s6", "s7", "s8"]:
    tp = AT.get(p, K.get(p))
    breath(tp - .35); g(M.lib("click-soft"), tp + .1, .02)
# the glass fogs at the reset
breath(K["s2"] - .6, .05); g(M.lib("whoosh-cinematic"), K["s2"] - .5, .025)


def stomp(t):
    g(M.thump(.45), t, .2)
    g(M.lib("impact-bass-1"), t, .08)
    g(M.band(M.burst(.4, 9, 2), 200, 2500), t, .05)


def splash(t):
    n = int(1.2 * SR); tt = np.arange(n) / SR
    x = M.band(rng.standard_normal(n), 900, 8000) * np.exp(-tt * 3.5) * np.minimum(1, tt / .02)
    g(x / np.abs(x).max(), t, .07); g(M.lib("whoosh-short"), t - .1, .03)


stomp(ST1); splash(BU1)
stomp(ST5); splash(BU5)
g(M.lib("riser"), ST5 - 1.6, .015)
# s2 leaves falling: soft dry rustles
for x in np.arange(AT["s2:penyakit"] + .1, AT["s2:penyakit"] + 6.8, .32):
    g(M.band(M.burst(.08, 50, 2), 2000, 7000), x + rng.uniform(0, .1), .012)
# houses going dark (s1, s2) and lighting up (s6)
for i in range(3):
    g(M.tone((mid(deg(4 - i)),), .5, 8), AT["s1:keluarganya"] + .1 + i * .22, .015)
    g(M.tone((mid(deg(4 - i)),), .5, 8), AT["s2:keluarganya"] + i * .35, .015)
    g(M.lib("chime"), AT["s6:Keluarganya"] + .5 + i * .45, .025)
for i in range(3):
    g(M.lib("pop"), AT["s6:dilipatgandakan"] + i * .3, .03); g(M.lib("ping"), AT["s6:dilipatgandakan"] + .6 + i * .3, .018)
g(M.lib("sparkle"), AT["s6:dilenyapkan"], .03)
for w in ("s7:sabar", "s7:sebaik-baik", "s7:taat"):
    g(M.lib("sparkle"), AT[w], .02)
g(M.lib("whoosh"), OUT - .2, .03); g(M.lib("chime"), OUT + .3, .05)
M.finish(music)
print("duration", DUR)
