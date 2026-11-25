"""EP31 sound: maqam Bayati on D (D, E half-flat, F, G, A, B-flat, C; the E sits a quarter tone low). A soft bowed-string
drone (D2 + A2, slow beating) and a breathy ney-like flute (sine + odd partials, breath noise, slow vibrato, slow attack)
playing short, unhurried Bayati phrases. Hill wind under everything.
Story cues: a soft paper tick on each scroll panel; rising glassy motes in s2 (the prayer); water drips and ripples in s3
that die away at "tenang" (near silence, only wind); four sets of wing flaps as the birds arrive (s4); the mist veil as a
soft airy swell and a feather flurry (no harsh sound, nothing violent); feathers whooshing out to the hills; two deep
calls with a ring shimmer at "panggillah" and "memanggil"; the feathers rushing back, then wing flaps and four bright
chirps at "hidup"; a sparkle bloom for the flowers (s6); a warm swell as the sun rises and wings taking off in s8.
Music dips for a voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(3131)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
ROOT = 50  # D3
BAYATI = [0, 1.5, 3, 5, 7, 8, 10]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
deg = lambda d: ROOT + 12 + BAYATI[d % 7] + 12 * (d // 7)
n = lambda d: np.arange(int(d * SR)) / SR
tTen = AT["s3:tenang"]


def ney(f, dur):
    t = n(dur)
    vib = 1 + .006 * np.sin(2 * np.pi * 5.0 * t) * np.minimum(1, t / .6)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    x = np.sin(ph) + .28 * np.sin(3 * ph) + .1 * np.sin(5 * ph) + .12 * np.sin(2 * ph)
    br = M.band(rng.standard_normal(len(t)), f * .8, f * 4) * .35
    env = np.minimum(1, t / .22) * np.minimum(1, (dur - t) / .35)
    return (x + br * (1.2 - .6 * np.minimum(1, t / .4))) * env


# ---------- drone (bowed, slow beating), returns warmer at the end
drone = M.mono()
seg = 10.0
for t0 in np.arange(-1, DUR, seg - 2.5):
    dt = n(seg)
    for nn, a, det in ((ROOT - 12, .5, .0), (ROOT - 5, .28, .12), (ROOT, .16, -.08), (ROOT + 3, .07, .0)):
        f = hz(nn)
        x = np.sin(2 * np.pi * f * dt) + .35 * np.sin(2 * np.pi * 2 * f * dt + .5) + .45 * np.sin(2 * np.pi * (f + det) * dt + 1) + .12 * np.sin(2 * np.pi * 3 * f * dt)
        M.lay(drone, x * np.sin(np.pi * dt / dt[-1]) ** 2, max(0, t0), a)
music_env = M.env([(0, .6), (K["s2"], .8), (K["s3"], .7), (tTen + .2, .35), (K["s4"], .75), (K["s5"], .85), (K["s6"], 1.0), (K["s7"], .85),
                   (K["s8"], 1.0), (DUR - .5, 0), (DUR, 0)])

# ---------- ney phrases
nb = M.mono()


def phrase(t0, notes, amp=.25):
    t = t0
    for d, b in notes:
        M.lay(nb, ney(hz(deg(d)), b + .45), t, amp)
        t += b


phrase(.5, [(4, .9), (3, .5), (2, .5), (1, .5), (2, 1.8)])
phrase(K["s2"] + .6, [(0, .6), (1, .4), (2, 1.0), (3, .6), (4, 1.6)], .22)
phrase(AT["s2:Sebagian"], [(4, .5), (5, .5), (4, .5), (3, .5), (2, 1.6)], .2)
phrase(K["s3"] + .4, [(2, .8), (1, .6), (0, 2.0)], .2)
phrase(tTen + 1.2, [(4, 1.2), (3, .8), (4, 2.4)], .18)
phrase(K["s4"] + .3, [(0, .5), (2, .5), (3, .5), (4, 1.4)], .2)
phrase(K["s5"] + .2, [(4, .5), (5, .5), (7, 1.6)], .22)
phrase(AT["s5:hidup"] - .2, [(7, .4), (8, .4), (9, .4), (7, 1.8)], .24)
phrase(K["s6"] + .5, [(4, .7), (6, .5), (5, .5), (4, .5), (3, .5), (2, 1.8)], .22)
phrase(AT["s6:Yang"], [(0, .6), (2, .6), (4, .6), (7, 2.2)], .2)
phrase(K["s7"] + .5, [(2, .9), (1, .6), (0, 2.2)], .18)
phrase(AT["s7:Para"] + .5, [(3, .7), (2, .7), (1, .7), (2, 2.4)], .17)
phrase(K["s8"] + .4, [(0, .7), (4, .7), (3, .7), (2, 1.0)], .2)
phrase(AT["s8:Kisah"] - .4, [(4, .6), (2, .6), (0, 2.6)], .2)

music = np.stack([drone, drone], 1) * music_env[:, None] * .8 + stereo(nb * music_env * 1.5, nb * music_env * .45)

# ---------- hill wind
wn = M.band(rng.standard_normal(N), 150, 1200) * .5 + M.band(rng.standard_normal(N), 1200, 4000) * .12
gust = .55 + .45 * np.sin(2 * np.pi * T / 8.1) * np.sin(2 * np.pi * T / 3.3 + 1)
wenv = M.env([(0, .7), (K["s2"], .4), (K["s3"], .3), (K["s4"] + 3, .6), (K["s5"], .7), (K["s6"], .8), (K["s7"], .4), (DUR - .4, 0), (DUR, 0)])
w = wn * gust * wenv
M.fx += stereo(w * .045, M.band(rng.standard_normal(N), 300, 2000) * gust * wenv * .02)


# ---------- SFX
def shimmer(dur=1.4, base=1760):
    t = n(dur)
    x = sum(np.sin(2 * np.pi * base * r * t + i) * np.exp(-t * (1.6 + i * .4)) for i, r in enumerate([1, 4 / 3, 3 / 2, 2]))
    return x * np.minimum(1, t / .05) / 4


def flaps(count, rate=7.0, amp=1.0):
    out = M.mono()[: int((count / rate + .3) * SR)]
    for i in range(count):
        b = M.band(M.burst(.09, 40, 2), 250, 2200) * amp * (.7 + .3 * rng.random())
        s = int(i / rate * SR)
        out[s:s + len(b)] += b[: len(out) - s]
    return out


def chirp(f0=2600, f1=4200, dur=.12):
    t = n(dur)
    f = f0 + (f1 - f0) * (t / dur) ** .6
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) ** 1.5


def drip():
    t = n(.25)
    f = 900 + 1400 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22)


def airy(dur, lo=600, hi=5000):
    t = n(dur)
    return M.band(rng.standard_normal(len(t)), lo, hi) * np.sin(np.pi * t / dur) ** 1.2


# scroll panels: a soft paper tick
for a in ["s2", "s2:Sebagian", "s3", "s3:Ibrahim", "s3:Ia", "s4", "s4:Letakkan", "s5", "s5:burung-burung", "s6", "s6:Yang", "s7", "s7:Para", "s8"]:
    t0 = K[a] if a in K else AT[a]
    g(M.lib("click-soft") * .12, t0)
    g(M.band(M.burst(.18, 25, 2), 1500, 7000) * .05, t0)
# s1 hook
g(shimmer(1.8, 1320) * .09, AT["s1:perlihatkan"])
# s2 prayer motes
for i in range(6):
    g(shimmer(1.2, 1760 * (1 + .06 * i)) * .05, AT["s2:berdoa"] + i * .55)
g(M.lib("whoosh") * .1, AT["s2:Sebagian"] + .2)
# s3 water: drips and ripples until "tenang"
for k, tt in enumerate(np.arange(K["s3"] + .4, tTen, .9)):
    g(drip() * (.16 - .02 * k), float(tt))
g(shimmer(2.4, 1175) * .08, tTen)
# s4 birds arrive, mist veil, feather flurry, feathers to the hills
for c in range(4):
    g(flaps(9, 7.5, .5), AT["s4:ambillah"] - .2 + c * .15)
g(airy(1.8, 300, 3000) * .12, AT["s4:cincanglah"] - .35)
g(airy(1.4, 2500, 9000) * .06, AT["s4:cincanglah"] + .3)
g(M.lib("whoosh-cinematic") * .2, AT["s4:Letakkan"])
for c in range(4):
    g(M.lib("whoosh-short") * .1, AT["s4:Letakkan"] + .7 + c * .3)
g(M.lib("chime") * .07, AT["s4:bukit"] + .6)
# s5 two calls: deep swell + ring shimmer; feathers rush back; birds come alive
for tc in [AT["s5:panggillah"], AT["s5:memanggil"]]:
    sw = M.mono()[: int(3 * SR)]
    st = n(3)
    for nn, a in ((ROOT - 12, .5), (ROOT - 5, .3), (ROOT, .2)):
        sw += np.sin(2 * np.pi * hz(nn) * st) * a
    g(sw * np.minimum(1, st / .15) * np.exp(-st * 1.2) * .12, tc)
    g(shimmer(2.0, 880) * .1, tc + .1)
g(M.lib("riser") * .1, AT["s5:memanggil"] + .3)
for c in range(4):
    g(airy(1.5, 800, 6000) * .05, AT["s5:memanggil"] + .45 + c * .12)
g(M.lib("sparkle") * .14, AT["s5:kembali"] - .1)
for c in range(4):
    g(flaps(14, 7.0, .5), AT["s5:kembali"] + c * .1)
    g(chirp(2400 + c * 300, 3900 + c * 300) * .06, AT["s5:hidup"] + c * .22)
    g(chirp(3600 + c * 200, 2800 + c * 200, .1) * .05, AT["s5:hidup"] + c * .22 + .16)
# s6 circling flaps (sparse), four directions, flowers bloom
for k, tt in enumerate(np.arange(K["s6"] + .5, K["s6e"] - .8, 2.3)):
    g(flaps(5, 7, .25), float(tt))
g(M.lib("whoosh") * .1, AT["s6:penjuru"] - .3)
g(M.lib("sparkle") * .16, AT["s6:membangkitkan"] - .2)
g(shimmer(2.6, 1320) * .07, AT["s6:membangkitkan"])
# s7 landing, small chirps
for c in range(4):
    g(flaps(6, 7, .35), K["s7"] + 1.3 + c * .15)
g(chirp(2800, 3600) * .035, AT["s7:Para"] + 1.5)
# s8 sunrise swell + take-off
sw = M.mono()
st = n(8)
for nn, a in ((ROOT, .3), (ROOT + 7, .22), (ROOT + 12, .16), (ROOT + 15, .1)):
    M.lay(sw, np.sin(2 * np.pi * hz(nn) * st) * np.minimum(1, st / 3.5) * np.minimum(1, (8 - st) / 2), K["s8"], a)
M.fx += stereo(sw * .05, sw * .015)
for c in range(4):
    g(flaps(16, 7, .45), AT["s8:Pertanyaan"] + .2 + c * .35)
g(M.lib("chime") * .12, OUT)

M.finish(music)
