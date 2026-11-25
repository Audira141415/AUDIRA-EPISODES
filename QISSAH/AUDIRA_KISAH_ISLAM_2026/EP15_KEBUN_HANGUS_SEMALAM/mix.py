"""EP15 sound: C Nahawand (C D Eb F G Ab B). Warm wooden marimba and kalimba-like plucks over a soft breathing pad,
84 bpm. Day = bright kalimba arpeggios and birds; night = crickets and sparse low marimba; s4 = an eerie hush
(music and crickets drain away, only a low airy drone while the clay chars); s5 = tiptoe staccato marimba;
s7 = a rising kalimba hope motif when the sprout appears. Clay foley: squishes on panel pops, soft basket thumps,
a creaking gate, a dry crumble as the orchard chars. Music dips for a voice later via M.finish. Run from this folder."""
import json, sys, os
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(1515)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
NAH = [0, 2, 3, 5, 7, 8, 11]
ROOT = 60
BEAT = 60 / 84
deg = lambda d, o=0: ROOT + o + NAH[d % 7] + 12 * (d // 7)

MORN = AT["s1:Paginya"]
SP0, SP1 = K["s4"] + 0.5, AT["s4:hitam"]
GROW = AT["s7:Semoga"]


def marimba(f, dur=1.2, dec=5.5):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * dec) + .35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * dec * 4) + .12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * dec * 9)
    return x * np.minimum(1, t / .002)


def kalimba(f, dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2) + .28 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 14) + .1 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 5)
    return x * np.minimum(1, t / .0015)


def pad(fs, dur, att=1.8):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * t + .3 * np.sin(2 * np.pi * .21 * t)) + .5 * np.sin(2 * np.pi * f * 1.003 * t) + .25 * np.sin(2 * np.pi * f * 2 * t) for f in fs) / len(fs)
    return x * np.minimum(1, t / att) * np.minimum(1, (dur - t) / 1.6)


# ---------- pad: one chord per scene (Nahawand colours)
padb = M.mono()
CH = {"Cm": [48, 55, 63], "Fm": [53, 56, 60], "Ab": [56, 60, 63], "G": [55, 59, 62], "Cm2": [48, 60, 63, 67]}
plan = [(0, "Cm"), (K["s2"], "Ab"), (K["s2"] + 5.4, "Fm"), (K["s3"], "Cm"), (K["s3"] + 5.6, "G"), (K["s4"], "Cm"), (K["s5"], "Fm"), (K["s6"], "G"), (K["s6"] + 6.7, "Cm"),
        (K["s7"], "Fm"), (GROW, "Ab"), (K["s8"], "Fm"), (K["s8"] + 4, "Cm2")]
for i, (t0, c) in enumerate(plan):
    t1 = plan[i + 1][0] if i + 1 < len(plan) else DUR
    M.lay(padb, pad([mid(n) for n in CH[c]], t1 - t0 + 1.8), max(0, t0 - .4), 1.0)
pe = M.env([(0, .55), (MORN, .55), (MORN + .4, .25), (K["s2"], .5), (K["s4"], .45), (SP0, .3), (SP1, .5), (K["s5"], .35), (K["s6"], .6), (K["s7"], .55), (K["s8"], .7), (END, .7), (DUR - .3, 0), (DUR, 0)])
padb *= pe

# ---------- plucks
pl = M.mono()


def arp(t0, t1, degs, step=.5, o=0, inst=kalimba, amp=.3, swing=0):
    t, i = t0, 0
    while t < t1:
        d = degs[i % len(degs)]
        if d is not None:
            M.lay(pl, inst(mid(deg(d, o))), t + (swing if i % 2 else 0), amp * (1 if i % 4 == 0 else .7))
        t += step * BEAT; i += 1


# s1 night: a few low marimba notes; after the black morning, a single falling line
arp(0.2, MORN - .2, [0, None, 4, None, 3, None, 2, None], .5, -12, marimba, .38)
for k, d in enumerate([4, 3, 2, 0, -1]):
    M.lay(pl, marimba(mid(deg(d, -12)), 2.0, 3), MORN + .5 + k * .8, .32)
# s2 flashback: warm kalimba arpeggio, generous
arp(K["s2"] + .2, K["s3"] - .3, [0, 2, 4, 7, 4, 2, 5, 4], .5, 0, kalimba, .3, .03)
# s3 evening table: lower marimba, then a tense ostinato at the oath
arp(K["s3"] + .2, AT["s3:Mereka"], [0, 4, 2, 4], .5, -12, marimba, .3)
arp(AT["s3:Mereka"], K["s4"] - .3, [0, 1, 0, 6 - 7], .5, -12, marimba, .34)
# s4: hush (no plucks); a single low knock when the char begins
M.lay(pl, marimba(mid(deg(0, -24)), 2.5, 2.2), SP0, .5)
# s5 tiptoe: staccato muted marimba
arp(K["s5"] + .3, K["s6"] - .2, [0, None, 2, None, 1, None, 0, -1], .5, -12, lambda f: marimba(f, .4, 14), .42)
# s6 shock: falling kalimba line, then sparse
for k, d in enumerate([7, 6, 4, 3, 1, 0]):
    M.lay(pl, kalimba(mid(deg(d))), AT["s6:tersesat"] + k * .28, .26)
arp(AT["s6:Yang"], K["s7"] - .2, [0, None, None, 2, None, None, 4, None], .5, -12, marimba, .3)
# s7: confession low; hope motif rises at the sprout
arp(K["s7"] + .2, GROW - .1, [0, None, 3, None, 2, None, 0, None], .5, -12, marimba, .3)
for k, d in enumerate([0, 2, 4, 5, 7, 9]):
    M.lay(pl, kalimba(mid(deg(d)), 2.2), GROW + k * .34, .3)
arp(GROW + 2.4, K["s8"] - .2, [7, 4, 5, 2, 4, 0], .5, 0, kalimba, .22, .03)
# s8: warm resolve
arp(K["s8"] + .2, END - .6, [0, 4, 7, 9, 7, 4, 5, 4], .5, 0, kalimba, .26, .03)
for k, d in enumerate([4, 2, 1, 0]):
    M.lay(pl, kalimba(mid(deg(d)), 2.6), END - 1.8 + k * .5, .3)

fin = M.env([(0, 1), (END + .4, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (padb * .45 + pl) * fin
music = stereo(music_m, (.25 * pl - .1 * padb) * fin)

# ---------- ambience
# crickets: pulsed high tones
cr = M.mono()
for k, f in enumerate((4300, 4700, 5200)):
    puls = (np.sin(2 * np.pi * (14 + k * 3) * T) > .3).astype(float) * (np.sin(2 * np.pi * (.7 + k * .23) * T + k) > -.2)
    cr += np.sin(2 * np.pi * f * T) * puls
cre = M.env([(0, .8), (MORN - .1, .8), (MORN + .3, 0), (K["s3"] + 3, 0), (K["s3"] + 6, .5), (K["s4"], .8), (SP0 - .3, .8), (SP0 + .8, 0), (DUR, 0)])
M.fx += np.stack([cr * cre * .006, np.roll(cr, 900) * cre * .006], 1)
# birds: little chirp sweeps in daylight scenes
def chirp(f0, f1, d):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, len(t))) / SR) * np.sin(np.pi * t / d)
for a, b, n in ((K["s2"], K["s3"] - .2, 26), (GROW + 1.5, K["s8"], 6), (K["s8"], END + 1.5, 16)):
    for x in rng.uniform(a, b, n):
        f0 = rng.uniform(2600, 4200)
        for k in range(rng.integers(1, 4)):
            g(chirp(f0, f0 * rng.uniform(1.15, 1.5), .07), x + k * .11, .012)
# s4 eerie hush: a low airy drone
hush = M.band(rng.standard_normal(N), 60, 420); hush /= np.abs(hush).max()
he = M.env([(0, 0), (K["s4"] - .3, 0), (SP0, .7), (SP1, .9), (K["s5"] + .5, .2), (K["s5"] + 2, 0), (DUR, 0)])
M.fx += np.stack([hush * he * .05, np.roll(hush, 1100) * he * .05], 1)
# soft breeze by day
air = M.band(rng.standard_normal(N), 300, 2500); air /= np.abs(air).max()
ae = M.env([(0, .15), (K["s2"], .35), (K["s3"], .2), (K["s4"], .1), (K["s5"], .2), (K["s6"], .35), (K["s8"], .4), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([air * ae * .02, np.roll(air, 1500) * ae * .02], 1)

# ---------- clay foley and events
def squish(t, a=.05):
    n = int(.18 * SR); tt = np.arange(n) / SR
    x = M.band(rng.standard_normal(n), 150, 1400) * np.exp(-tt * 18) + .5 * np.sin(2 * np.pi * (180 - 300 * tt) * tt) * np.exp(-tt * 20)
    g(x / np.abs(x).max(), t, a)
def crumble(t, d, a):
    for x in np.arange(t, t + d, .03):
        g(M.band(M.burst(.03, 120, 1), 600, 5000), x + rng.uniform(0, .03), a * rng.uniform(.3, 1))

for p in ["s2", "s2:Menurut", "s3", "s3:Mereka", "s4", "s5", "s6", "s6:Yang", "s7", "s7:Semoga", "s8"]:
    tp = AT.get(p, K.get(p))
    squish(tp - .2, .06); g(M.lib("pop"), tp - .05, .05); g(M.lib("whoosh-short"), tp - .3, .02)
for p in ["s2:Al-Qalam", "s3:bersumpah", "s4:bencana", "s5:berbisik", "s6:melihat", "s6:bijak", "s7:menyalahkan"]:
    if p in AT:
        g(M.tone((880, 1320), .35, 12), AT[p], .02)
# hook: lush night, then the black morning
g(M.lib("impact-bass-1"), MORN, .13)
crumble(MORN - .05, .6, .03)
g(M.lib("click-soft"), AT["s1:Tidak"], .03)
# s2 baskets handed over
for p in ["s2:ayah", "s2:menyisihkan", "s2:panen"]:
    g(M.thump(.22), AT[p] + .3, .06); squish(AT[p] + .3, .04)
# s3 oath: a soft low hit
g(M.thump(.4), AT["s3:bersumpah"], .1)
g(M.lib("riser"), AT["s3:tanpa"] - 1.4, .02)
# s4: the char spreads as a dry crumbling hiss
crumble(SP0, SP1 - SP0, .016)
g(M.lib("impact-bass-1"), AT["s4:hitam"], .08)
# s5 tiptoe footsteps
for x in np.arange(K["s5"] + .6, AT["s5:kebunmu"] + .3, BEAT / 2):
    g(M.band(M.burst(.05, 70, 1), 300, 2500), x + rng.uniform(0, .03), .018)
# s6 gate creak, then the shock
n = int(1.1 * SR); tt = np.arange(n) / SR
fr = 220 + 90 * np.sin(2 * np.pi * 1.7 * tt) + 40 * rng.standard_normal(n).cumsum() / SR
creak = np.sign(np.sin(2 * np.pi * np.cumsum(fr) / SR)) * (.5 + .5 * np.sin(2 * np.pi * 23 * tt)) * np.sin(np.pi * tt / 1.1)
g(M.band(creak, 300, 3000), K["s6"] + .15, .025)
g(M.lib("impact-bass-1"), AT["s6:tersesat"], .1)
g(M.thump(.3), AT["s6:apa-apa"], .06)
# s7 kneeling, sprout
for p in ["s7:mengaku"]:
    g(M.thump(.3), AT[p] + .2, .05); squish(AT[p] + .25, .04)
g(M.lib("sparkle"), GROW + .1, .04); g(M.lib("chime"), GROW + .5, .045)
g(M.lib("whoosh"), OUT - .2, .03); g(M.lib("chime"), OUT + .3, .05); squish(OUT, .06)
M.finish(music)
print("duration", DUR)
