"""EP08 sound: C Nahawand (C D Eb F G Ab B C). A breathy ney-like flute over a low drone, a frame drum (dum/tek) that walks the
fourteen years at a steady 84 bpm, stopping for the drought and returning softer with the rain. Ambience: wind over fields and the
Nile, a dry hot wind in the drought, rain at year 15. Foley: grain pouring into silos, a soft sheaf thump per year, brass plate
slides on panel changes, a chime for the stars, a heavy door and a key. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1247)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
w = lambda key: AT[key]

HY = [w("s4:Bercocok") + k * 0.88 for k in range(7)]
DY = [w("s5:datang") + k * 0.74 for k in range(7)]
RY = w("s6:hujan") - 0.3
NAH = [0, 2, 3, 5, 7, 8, 11, 12]
C = 48  # C3


def ney(f, dur, att=.18, vib=5.0):
    """Breathy end-blown flute: soft sine stack, delayed vibrato, band-limited breath noise riding the note."""
    t = np.arange(int(dur * SR)) / SR
    v = 1 + .006 * np.sin(2 * np.pi * vib * t) * np.minimum(1, t / .5)
    ph = 2 * np.pi * f * np.cumsum(v) / SR
    tone = np.sin(ph) + .28 * np.sin(2 * ph) + .1 * np.sin(3 * ph)
    br = M.band(rng.standard_normal(len(t)), f * .8, f * 3.2)
    br /= max(1e-6, np.abs(br).max())
    env = np.minimum(1, t / att) * np.minimum(1, (dur - t) / .35)
    return (tone + .55 * br * (1.2 - np.minimum(1, t / .4))) * env


def drone_tone(f, dur):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0007 * h)) / h ** 1.6 for h in range(1, 7))
    return x * np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.2)


# ---------- drone (C + G), breathing with the story
drone = M.mono()
for t0 in np.arange(0, DUR, 7.0):
    for n, a in ((C - 12, .5), (C - 5, .3), (C, .12)):
        M.lay(drone, drone_tone(mid(n), 8.0), t0, a)
drone *= M.env([(0, .55), (K["s2"], .7), (K["s3"], .5), (K["s4"], .8), (w("s5:Karena"), .9), (DY[6] + .6, .5), (RY, .8), (K["s7"], .7), (END, .7), (DUR - .4, 0), (DUR, 0)])

# ---------- ney phrases in Nahawand
flute = M.mono()


def phrase(t0, degs, beat=.5, oct=12, amp=.3):
    t = t0
    for d, b in degs:
        if d is not None:
            n = C + oct + NAH[d % 7] + 12 * (d // 7)
            M.lay(flute, ney(mid(n), b * beat + .25), t, amp)
        t += b * beat


phrase(.2, [(4, 2), (5, 1), (4, 1), (3, 1), (2, 3)])                         # hook: G Ab G F Eb
phrase(3.1, [(2, 1), (3, 1), (4, 2), (6, 1), (7, 3)])
phrase(K["s2"] + .6, [(0, 2), (2, 1), (3, 1), (4, 3), (None, 1), (3, 1), (2, 1), (1, 2), (0, 3)], .55, 12, .24)  # dream told
phrase(w("s2:Para"), [(5, 2), (4, 1), (3, 1), (2, 4)], .6, 12, .22)
phrase(K["s3"] + .4, [(0, 3), (1, 1), (2, 2), (1, 1), (0, 4)], .7, 12, .2)           # the cell, low and slow
phrase(w("s3:sebelas") - .4, [(7, 2), (8, 1), (9, 1), (10, 2), (9, 1), (8, 1), (7, 4)], .5, 12, .26)  # stars
phrase(K["s4"] + .3, [(4, 1), (5, 1), (6, 1), (7, 3), (6, 1), (4, 3)], .5, 12, .26)  # the plan
phrase(HY[3], [(7, 1), (8, 1), (9, 2), (8, 1), (7, 1), (6, 2), (7, 4)], .45, 12, .22)
phrase(w("s5:Ibnu"), [(4, 2), (3, 1), (2, 1), (3, 2), (4, 4)], .6, 12, .2)
phrase(w("s5:Karena"), [(2, 3), (1, 1), (0, 2), (6, 1, ), (0, 4)], .7, 0, .26)         # drought, low register
phrase(RY + .2, [(4, 1), (5, 1), (7, 2), (9, 1), (8, 1), (7, 4)], .5, 12, .26)        # rain
phrase(w("s6:Mimpi"), [(7, 2), (9, 1), (10, 1), (11, 4)], .55, 12, .3)              # payoff
phrase(K["s7"] + .4, [(2, 2), (3, 1), (4, 1), (5, 2), (4, 4)], .6, 12, .2)
phrase(w("s7:jadikan"), [(4, 1), (6, 1), (7, 2), (8, 1), (7, 1), (6, 1), (7, 4)], .5, 12, .26)
phrase(K["s8"] + .3, [(0, 2), (2, 2), (4, 3), (3, 1), (2, 2), (0, 5)], .65, 12, .2)

# ---------- frame drum: steady through the harvest years, silent in the drought, gentle with the rain
dum = M.thump(.42)
tek = M.band(M.burst(.07, 75, 1), 1600, 7000); tek /= np.abs(tek).max()
skin = M.band(M.burst(.35, 10, 2), 160, 800); skin /= np.abs(skin).max()
drums = M.mono()


def drums_from(t0, t1, bpm, amp=1.0):
    beat = 60 / bpm
    pat = [("d", 0), ("t", 1), ("t", 1.5), ("d", 2), ("t", 3)]
    for bar in np.arange(t0, t1, 4 * beat):
        for kind, b in pat:
            t = bar + b * beat
            if t >= t1:
                break
            if kind == "d":
                M.lay(drums, dum, t, .8 * amp); M.lay(drums, skin, t, .22 * amp)
            else:
                M.lay(drums, tek, t, .3 * amp)


drums_from(K["s2"] + 2.0, K["s3"] - .2, 72, .6)
drums_from(K["s4"] - .1, w("s5:Karena") - .1, 84)
drums_from(RY, K["s7"] - .2, 84, .7)
drums_from(w("s7:jadikan") - .1, K["s8"] - .2, 78, .55)
drums *= M.env([(0, 0), (K["s2"] + 2, .7), (K["s3"], .7), (K["s3"] + .2, 0), (K["s4"] - .2, .8), (w("s5:Ibnu"), .55), (w("s5:Karena"), .55), (w("s5:Karena") + .2, 0),
                (RY, .7), (K["s7"], .7), (K["s7"] + .2, 0), (w("s7:jadikan"), .6), (K["s8"], .5), (K["s8"] + .2, 0), (DUR, 0)])

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drone * .5 + flute + drums * .9) * fin
music = stereo(music_m, (.24 * flute + .1 * drone) * fin)

# ---------- ambience
def bed(lo, hi, rate, seed_shift):
    x = M.band(rng.standard_normal(N), lo, hi) * (1 + .5 * np.sin(2 * np.pi * rate * T + seed_shift))
    return x / np.abs(x).max()


wind = bed(200, 1600, .13, 0)                      # wind over the fields and the river
we = M.env([(0, .5), (K["s3"] - .2, .5), (K["s3"], .15), (K["s4"] + 1.5, .15), (HY[0], .5), (w("s5:Karena"), .5), (DY[0], 1.0), (DY[6] + .5, 1.0), (RY, .3), (K["s7"], .3), (K["s7"] + 1, .12), (K["s8"], .5), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .045, np.roll(wind, 1300) * we * .045], 1)
hot = bed(2500, 7000, .4, 1)                       # dry hiss of the drought years
he = M.env([(0, 0), (DY[0] - .3, 0), (DY[0] + .5, .5), (DY[6] + .8, .5), (RY, 0), (DUR, 0)])
M.fx += np.stack([hot * he * .02, np.roll(hot, 700) * he * .02], 1)
river = bed(60, 500, .07, 2)
re_ = M.env([(0, .4), (K["s3"], .4), (K["s3"] + .3, .05), (K["s4"] + 2, .05), (HY[0], .3), (K["s7"], .3), (K["s7"] + 1, .05), (K["s8"], .5), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([river * re_ * .05, np.roll(river, 2100) * re_ * .05], 1)
# rain at year 15
rainn = M.band(rng.standard_normal(N), 900, 9000); rainn /= np.abs(rainn).max()
ra = M.env([(0, 0), (RY - .3, 0), (RY + .6, .9), (w("s6:memeras") + .3, .8), (w("s6:Mimpi") + .6, 0), (DUR, 0)])
M.fx += np.stack([rainn * ra * .05, np.roll(rainn, 900) * ra * .05], 1)
for x in rng.uniform(RY, w("s6:Mimpi"), 260):
    g(M.band(M.burst(.03, 140, 1), 2000, 9000), x, .02 * rng.uniform(.3, 1))
g(M.thump(.9) * .6, RY + .2, .12)                  # distant thunder roll
# cell: a slow drip in the dark
for x in np.arange(K["s3"] + .5, K["s4"] - .3, 1.7):
    g(M.tone((1900, 2400), .08, 40), x, .015)

# ---------- events
plate = lambda t, a=.03: g(M.band(M.burst(.4, 9, 2), 1200, 8000) * np.minimum(1, np.linspace(0, 5, int(.4 * SR))), t, a)
for p in ["s2", "s2:Para", "s3", "s3:Sejak", "s4", "s4:Hasil", "s5", "s5:Karena", "s6", "s6:Mimpi", "s7", "s7:Setelah", "s7:jadikan", "s8"]:
    tp = AT.get(p, K.get(p))
    plate(tp - .18); g(M.tone((880, 1320), .25, 14), tp - .02, .012)
# the dream in s1 and s2: cows sink, lean cows step
for key in ("s1:dimakan", "s2:dimakan"):
    for i in range(7):
        g(M.thump(.3), w(key) + .3 + i * .07, .05)
    g(M.lib("whoosh-cinematic"), w(key) - .2, .03)
g(M.lib("riser"), w("s2:menceritakan") - .4, .025)
for key in ("s2:tangkai", "s2:lainnya"):
    for i in range(7):
        g(M.band(M.burst(.08, 50, 1), 1500, 6000), w(key) + i * .08, .02)
g(M.lib("glitch-1"), w("s2:kosong"), .015)
g(M.lib("sparkle"), w("s2:kosong") + .1, .03)
# the cell
g(M.lib("chime"), w("s3:teringat"), .035)
for i in range(11):
    g(M.tone((mid(C + 24 + NAH[i % 7]),), .9, 5), w("s3:sebelas") + i * .06, .018)
g(M.lib("chime"), w("s3:matahari"), .03)
g(M.lib("sparkle"), w("s3:bersujud"), .04)
for x in np.arange(w("s4:Yusuf"), w("s4:Bercocok") + .4, .11):          # reed pen scratching
    g(M.band(M.burst(.05, 90, 1), 2500, 8000), x + rng.uniform(0, .04), .01)
# harvest years: a soft sheaf thump per stack and grain pouring into the silos
for k, ty in enumerate(HY):
    for j in range(k + 1):
        g(M.thump(.22), ty + j * .05 + .38, .035)
    g(M.lib("click-soft"), ty, .03)
pour = M.band(rng.standard_normal(N), 1800, 9000); pour /= np.abs(pour).max()
pe = M.env([(0, 0), (HY[0] - .2, 0), (HY[0] + .3, 1), (HY[6] + .6, 1), (HY[6] + 1.2, 0), (DUR, 0)])
grains = np.zeros(N)
for x in rng.uniform(HY[0], HY[6] + 1.1, 2200):
    i = int(x * SR)
    if i < N - 200:
        grains[i:i + 60] += rng.standard_normal(60) * np.exp(-np.arange(60) / 12)
grains = M.band(grains, 2000, 10000)
grains /= max(1e-6, np.abs(grains).max())
M.fx += np.stack([(pour * .4 + grains) * pe * .03, (np.roll(pour, 500) * .4 + grains) * pe * .03], 1)
# drought years: hollow aluminium knocks, a draining trickle, the seed glints
for k, ty in enumerate(DY):
    g(M.tone((520, 780), .35, 9), ty, .02)
g(M.lib("riser"), w("s5:Karena") - .8, .025)
g(M.lib("sparkle"), w("s5:bibit"), .04)
# rain year: grapes and press
g(M.lib("pop"), w("s6:kembali"), .02); g(M.lib("pop"), w("s6:kembali") + .15, .018); g(M.lib("pop"), w("s6:kembali") + .3, .016)
g(M.band(M.burst(.5, 6, 3), 200, 1500), w("s6:memeras"), .05)
# payoff: cows return over the columns, counter to 14
for i in range(14):
    g(M.tone((mid(C + 12 + NAH[i % 7] + 12 * (i // 7)),), .5, 7), w("s6:Mimpi") + .3 + (i % 7) * .08 + (.35 if i >= 7 else 0), .015)
g(M.thump(.6), w("s6:empat") + .7, .14); g(M.lib("impact-bass-1"), w("s6:empat") + .7, .07)
# gate, cleared name, treasury
g(M.thump(.5), w("s7:menolak") + .2, .08)
g(M.lib("sparkle"), w("s7:bersalah"), .035)
creak = M.band(M.burst(1.4, 1.5, 4), 150, 900) * (1 + .5 * np.sin(np.linspace(0, 40, int(1.4 * SR))))
g(creak, w("s7:meminta") - .4, .08); g(M.thump(.7), w("s7:jadikan") + .4, .1)
g(M.lib("chime"), w("s7:bendaharawan"), .04)
g(M.tone((2600, 3900), .25, 18), w("s7:negeri") + .6, .03); g(M.lib("click"), w("s7:negeri") + .75, .03)   # key turns
g(M.band(M.burst(.25, 18, 2), 1500, 7000), w("s7:menjaga"), .03)                                           # ledger page
g(M.lib("whoosh"), K["s8"] - .2, .03)
g(M.lib("whoosh"), OUT - .2, .04); g(M.lib("chime"), OUT + .3, .06)
M.finish(music)
print("duration", DUR)
