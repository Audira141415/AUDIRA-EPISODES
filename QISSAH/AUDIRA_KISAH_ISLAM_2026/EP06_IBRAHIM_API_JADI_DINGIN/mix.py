"""EP06 sound: E Hijaz (E F G# A B C D). A low drone on E and B, a hammered-dulcimer (santur) tremolo and oud-like plucks.
The fire is a roaring noise bed with crackle; at "wahai api" in s7 the roar drains away into a soft wind-chime pad in the
same mode. Foley: courtyard wind, footsteps of the crowd, idols toppling and shattering (bronze clangs + shard clatter),
the furnace bricks being laid, the lamp's arc. Panels land with a soft plate-press thud. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(6069)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
w = lambda sc, word, n=0: M.word(sc, word.rstrip(".,:;?!"), n)
HIJ = [0, 1, 4, 5, 7, 8, 10, 12]
E = 52  # E3

IGNITE = w("s6", "api")
THROW = w("s6", "dilemparkan")
COOL0, COOL1 = w("s7", "wahai"), w("s7", "dingin,") + .4
HCOOL = w("s1", "wahai")
SMASH0 = w("s4", "menghancurkan") - .2
SMASH1 = w("s4", "kecuali") - .2


def deg(d, base=E + 12):
    return base + HIJ[d % 7] + 12 * (d // 7)


def santur(f, dur=1.6, dec=2.2):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0007 * h * h)) * np.exp(-t * dec * (1 + .5 * h)) / h for h in range(1, 7))
    x += .5 * np.sin(2 * np.pi * f * 1.003 * t) * np.exp(-t * dec)      # paired course, slight beat
    return x * np.minimum(1, t / .002)


def oud(f, dur=1.2):
    return M.note(f, dur, "pluck", 3.6)


def drone_note(f, dur):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t + .3 * np.sin(2 * np.pi * .2 * t)) / h ** 1.6 for h in range(1, 6))
    return x * np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.2)


# ---------- drone: E2 + B2
drone = M.mono()
for t0 in np.arange(0, DUR, 7.0):
    for n, a in ((E - 12, .5), (E - 5, .3), (E, .12)):
        M.lay(drone, drone_note(mid(n), 8.0), t0, a)
drone *= M.env([(0, .7), (K["s2"], .55), (K["s3"], .75), (K["s4"], .6), (SMASH0, .9), (K["s5"], .7), (K["s6"], .85), (THROW, 1), (COOL0, .6), (K["s8"], .55), (END, .55), (DUR - .4, 0), (DUR, 0)])

# ---------- santur phrases (tremolo on long notes) and oud plucks
san = M.mono()


def phrase(t0, notes, beat=.5, amp=.3, trem=False):
    t = t0
    for d, b in notes:
        if d is not None:
            f = mid(deg(d))
            if trem and b >= 2:
                for k in range(int(b * beat / .09)):
                    M.lay(san, santur(f, .5, 5), t + k * .09, amp * (.55 + .3 * (k % 2)))
            else:
                M.lay(san, santur(f), t, amp)
        t += b * beat


phrase(.2, [(4, 1), (3, 1), (2, 1), (1, 2), (0, 3)], .55, .3)
phrase(K["s2"] + .4, [(0, 1), (1, 1), (2, 2), (3, 1), (2, 1), (1, 2), (0, 4)], .6, .22)
phrase(K["s2"] + 6.6, [(2, 1), (3, 1), (4, 2), (5, 1), (4, 1), (3, 2), (2, 4)], .6, .22)
phrase(K["s3"] + .3, [(7, 4), (6, 2), (5, 2), (4, 6)], .5, .2, True)                       # night
phrase(w("s3", "Yang"), [(4, 2), (5, 1), (7, 3), (8, 2), (9, 6)], .5, .22, True)          # turning to the Creator
phrase(K["s4"] + .3, [(0, 1), (2, 1), (1, 1), (0, 1), (4, 2), (3, 1), (2, 3)], .45, .22)
phrase(K["s5"] + .4, [(4, 1), (5, 1), (4, 1), (2, 1), (1, 2), (0, 4)], .5, .2)
phrase(w("s5", "Mereka"), [(2, 3), (1, 1), (0, 6)], .6, .2)
phrase(K["s7"] + 4.0, [(7, 2), (8, 1), (9, 2), (11, 3), (9, 1), (8, 1), (7, 6)], .55, .2, True)
phrase(K["s8"] + .3, [(0, 2), (2, 1), (4, 2), (5, 1), (4, 1), (2, 2), (0, 6)], .6, .2)
oudb = M.mono()
for base, pat in ((K["s4"] + 4.2, [0, 1, 4, 1, 0, 4, 5, 4, 1, 0]), (K["s6"] + .2, [0, 0, 1, 0, 4, 4, 5, 4, 1, 1, 0, 0, 1, 4])):
    for i, d in enumerate(pat):
        t = base + i * .38
        M.lay(oudb, oud(mid(deg(d, E))), t, .3)
oudb[(T > SMASH0 - .3) & (T < K["s5"])] *= 0

# ---------- frame drum pulse under the march to the fire (s6)
dum = M.thump(.45)
drum = M.mono()
for x in np.arange(K["s6"] + .2, IGNITE, 60 / 84):
    M.lay(drum, dum, x, .7)

# ---------- wind-chime pad after the fire turns cool (E Hijaz, high register)
chime = M.mono()
cr = np.random.default_rng(7)
for (a, b, dens) in ((HCOOL, K["s1e"] + .2, 7), (COOL0 + .2, END + 1.5, 4.5)):
    for x in np.arange(a, b, 1 / dens):
        f = mid(deg(int(cr.integers(7, 15))))
        M.lay(chime, M.tone((f, f * 2.76, f * 5.4), 2.2, 2.4) * (.4 + .6 * cr.random()), x + cr.random() * .15, .16)
pad = M.mono()
for t0 in np.arange(COOL0, END + 2, 4.0):
    for n in (deg(7), deg(9), deg(11)):
        M.lay(pad, drone_note(mid(n), 5.0) * .5, t0, .12)
pad[T < COOL0] = 0

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drone * .55 + san + oudb + drum * .5 + chime + pad) * fin
music = stereo(music_m, (.25 * san + .3 * chime + .1 * drone) * fin)

# ---------- fire roar: hook and s6-s7, draining away at "wahai api"
roar = M.band(rng.standard_normal(N), 40, 900) + .35 * M.band(rng.standard_normal(N), 1200, 4500)
roar *= 1 + .35 * np.sin(2 * np.pi * .7 * T) * np.sin(2 * np.pi * .23 * T + 1)
roar /= np.abs(roar).max()
re_ = M.env([(0, .9), (HCOOL, .9), (K["s1e"], .45), (K["s2"] - .05, .45), (K["s2"], 0), (IGNITE - .1, 0), (IGNITE + .6, 1.1), (THROW + 1.1, 1.3), (COOL0, 1.1), (COOL1, .05), (COOL1 + 1, 0), (DUR, 0)])
M.fx += np.stack([roar * re_ * .16, np.roll(roar, 1300) * re_ * .16], 1)
for x in rng.uniform(0, K["s2"] - .2, 60).tolist() + rng.uniform(IGNITE, COOL1, 120).tolist():
    g(M.band(M.burst(.03, 140, 1), 1500, 8000), x, .05 * rng.uniform(.3, 1))    # crackle
# courtyard wind by day, night air in s3 and s8
wind = M.band(rng.standard_normal(N), 200, 1500) * (1 + .5 * np.sin(2 * np.pi * .13 * T)); wind /= np.abs(wind).max()
we = M.env([(0, 0), (K["s2"], .35), (K["s3"], .6), (K["s4"], .3), (K["s6"], .2), (IGNITE, 0), (K["s8"], 0), (K["s8"] + 1, .4), (END, .4), (DUR, 0)])
M.fx += np.stack([wind * we * .05, np.roll(wind, 800) * we * .05], 1)
for x in np.arange(K["s3"] + .5, K["s4"] - .3, .41):
    if rng.random() < .55:
        g(M.tone((4200, 4270), .05, 30) * .5, x, .01)                           # crickets at night

# ---------- events
press = lambda t: (g(M.thump(.16), t, .05), g(M.band(M.burst(.18, 25, 2), 900, 5000), t, .02))
for p in ["s2", "s2:Ia", "s2:Jawab", "s3", "s3:Bintang", "s3:Yang", "s4", "s4:kenapa", "s4:Lalu", "s5", "s5:Ibrahim", "s5:Mereka", "s6", "s6:Sebuah", "s7", "s7:Yang", "s8"]:
    press(AT.get(p, K.get(p)) - .12)
g(M.lib("whoosh-cinematic"), K["s2"] - .35, .05)
g(M.lib("whoosh-cinematic"), K["s3"] - .2, .04)
g(M.lib("whoosh"), K["s4"] - .1, .04)
# the bodies set: a soft descending ping each
for sc, word, n in (("s3", "terbenam.", 0), ("s3", "terbenam.", 1), ("s3", "terbenam.", 2)):
    t = w(sc, word, n)
    g(M.lib("ping"), t, .03); g(M.tone((mid(deg(4)), mid(deg(4)) * 2), 1.4, 2.5), t + .05, .03)
g(M.lib("sparkle"), w("s3", "menghadap"), .03)
# footsteps: leaving, returning, going to the plaza
for a, b in ((w("s4", "kaumnya"), w("s4", "kaumnya") + 4.5), (K["s5"] - .7, K["s5"] + 3.5), (K["s6"] + .2, K["s6"] + 4.6)):
    for x in rng.uniform(a, b, 120):
        g(M.band(M.burst(.05, 70, 1), 700, 4000), x, .016 * rng.uniform(.4, 1))
# the lamp's questions: a small glass ring
g(M.lib("chime"), w("s2", "bertanya:"), .03)
g(M.lib("click-soft"), w("s4", "makan?"), .05); g(M.lib("click-soft"), w("s4", "menjawab?"), .05)
# idols topple and shatter
gap = (SMASH1 - SMASH0) / 10
clang = lambda f: M.tone((f, f * 2.41, f * 3.9, f * 5.6), 1.6, 3.2)
for i in range(10):
    t = SMASH0 + i * gap + .32
    g(M.thump(.4), t, .22); g(clang(180 + 37 * (i % 4)), t, .05)
    for k in range(9):
        g(M.band(M.burst(.04, 110, 1), 2000, 9000), t + .02 + rng.uniform(0, .5), .04 * rng.uniform(.4, 1))
g(M.lib("impact-bass-1"), SMASH0 + .32, .1)
g(M.lib("riser"), SMASH0 - 1.4, .03)
# the biggest one stays: a low held clang
g(clang(98) * 1.0, w("s4", "besar.") , .05)
# the crowd's anger, bowing heads (a soft drop)
g(M.lib("whoosh-short"), w("s5", "tertunduk."), .04)
# bricks laid course by course
b0, b1 = w("s6", "Sebuah") - .2, IGNITE + .1
for k in range(14):
    t = b0 + (b1 - b0) * (k + .5) / 14.5
    g(M.thump(.12), t, .07); g(M.band(M.burst(.05, 60, 1), 400, 2500), t, .03)
# ignition and the throw
g(M.lib("whoosh-cinematic"), IGNITE - .2, .07); g(M.thump(.7), IGNITE, .25)
g(M.lib("whoosh"), THROW, .06); g(M.thump(.6), THROW + 1.05, .2)
g(M.lib("impact-bass-1"), THROW + 1.05, .08)
# hook: the first cooling
g(M.lib("sparkle"), HCOOL, .035)
# the word that turns the fire: a hush then a bright chime
g(M.lib("riser"), COOL0 - 1.3, .025)
g(M.lib("chime"), COOL0, .07); g(M.lib("sparkle"), w("s7", "keselamatan"), .04)
g(M.lib("chime"), w("s7", "surah"), .04)
g(M.lib("whoosh-short"), w("s7", "mencelakainya"), .03)
g(M.lib("sparkle"), w("s8", "Menurut"), .025)
g(M.lib("whoosh"), OUT - .2, .04); g(M.lib("chime"), OUT + .3, .06)
M.finish(music)
print("duration", DUR)
