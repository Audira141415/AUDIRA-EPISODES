"""EP07 sound: maqam Rast on C (C D E-half-flat F G A B-half-flat C), light and gentle. A kanun (Karplus-Strong plucked
strings with tremolo runs) carries the melody, a soft harp answers with rolled figures, a low tanbur-like drone holds C and G.
No drums except a distant soft frame-drum heartbeat for the approaching army in s1/s3, which stops when the army stops (s4).
Ambience: insects and crickets in the ant valley, birdsong over the flock, paper and wind on the map, water under the glass
floor in the palace, evening crickets at the end. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2707)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
A = lambda k: AT[k]
CUT1, CUT2, BLINK = A("s5:kabar"), A("s8:Kekuasaan"), A("s7:berkedip") + .12
RAST = [0, 2, 3.5, 5, 7, 9, 10.5, 12]      # semitones from C, quarter tones kept
C4 = 60
hz = lambda m: 440 * 2 ** ((m - 69) / 12)


def ks(f, dur=1.6, bright=.6, dec=.996):
    """Karplus-Strong string, block-vectorised."""
    n = int(dur * SR)
    P = max(2, int(round(SR / f)))
    y = np.zeros(n + P + 1)
    burst = rng.uniform(-1, 1, P)
    k = max(1, int(1 + (1 - bright) * 6))
    burst = np.convolve(burst, np.ones(k) / k, mode="same")
    y[1:P + 1] = burst
    i = P + 1
    while i < n + P + 1:
        e = min(i + P, n + P + 1)
        a = y[i - P:e - P]
        b = y[i - P - 1:e - P - 1]
        y[i:e] = .5 * (a + b) * dec
        i = e
    out = y[P + 1:P + 1 + n]
    return out * np.minimum(1, (dur - np.arange(n) / SR) / .05)


def kanun(m, dur=1.3, amp=1.0):
    return ks(hz(m), dur, .75, .9965) * amp


def harp(m, dur=2.4):
    return ks(hz(m), dur, .3, .9985)


def deg(d, base=C4 + 12):
    return base + RAST[d % 7] + 12 * (d // 7)


# ---------- drone (tanbur-like: two soft plucked-bowed tones C3 + G3 re-struck)
music = M.mono()
drone = M.mono()
for t0 in np.arange(0, DUR, 3.2):
    M.lay(drone, ks(hz(48), 3.6, .25, .9992), t0, .35)
    M.lay(drone, ks(hz(55), 3.6, .25, .9992), t0 + 1.6, .22)
de = M.env([(0, .7), (K["s2"], .8), (K["s4"], .6), (CUT1, .7), (K["s6"], .8), (K["s8"], .7), (END, .6), (DUR - .4, 0), (DUR, 0)])
drone *= de

# ---------- kanun phrases: (degree, beats); tremolo on long notes
kan = M.mono()


def phrase(t0, notes, beat=.42, amp=.5, base=C4 + 12):
    t = t0
    for d, b in notes:
        if d is not None:
            m = deg(d, base)
            if b >= 2:   # kanun tremolo: quick repeated plucks
                for r in np.arange(0, b * beat, .085):
                    M.lay(kan, kanun(m, .35, .45 * (1 - .4 * r / (b * beat))), t + r, amp)
            else:
                M.lay(kan, kanun(m), t, amp)
        t += b * beat
    return t


phrase(.2, [(4, 1), (3, 1), (2, 1), (1, 1), (2, 2), (0, 3)])
phrase(K["s1"] + 3.4, [(2, 1), (3, 1), (4, 2), (5, 1), (4, 3)])
phrase(K["s2"] + .4, [(0, 1), (1, 1), (2, 1), (3, 1), (4, 2), (5, 1), (4, 1), (3, 1), (2, 3)], .4, .42)
phrase(K["s2"] + 5.2, [(4, 1), (5, 1), (6, 1), (7, 2), (6, 1), (5, 1), (4, 3)], .4, .42)
phrase(K["s3"] + .5, [(2, 1), (1, 1), (0, 2), (None, 1), (2, 1), (3, 1), (2, 1), (1, 1), (0, 3)], .44, .38)
phrase(A("s3:wahai") - .2, [(4, 1), (4, 1), (5, 1), (4, 1), (3, 1), (2, 2)], .3, .45)
phrase(K["s4"] + .3, [(7, 2), (6, 1), (5, 1), (4, 3)], .55, .4)                       # the smile
phrase(A("s4:berdoa"), [(4, 2), (5, 1), (6, 1), (7, 4), (6, 1), (5, 1), (4, 4)], .5, .34)  # the prayer
phrase(K["s5"] + .2, [(0, 1), (2, 1), (4, 1), (7, 2), (4, 1), (2, 1), (0, 2)], .32, .4)
phrase(CUT1 + .2, [(4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 2), (7, 3)], .26, .42)       # flight to Saba
phrase(A("s5:singgasana"), [(2, 1), (3, 1), (4, 2), (3, 1), (2, 1), (1, 3)], .36, .36, C4)
phrase(K["s6"] + .3, [(4, 1), (5, 1), (4, 1), (3, 1), (2, 2), (4, 3)], .38, .38)
phrase(A("s6:bismillah"), [(7, 4), (6, 1), (5, 1), (4, 4)], .5, .32)
phrase(A("s6:menolak"), [(4, 1), (2, 1), (0, 3)], .4, .4)
phrase(K["s7"] + .2, [(0, 1), (1, 1), (2, 1), (4, 2), (2, 1), (1, 1), (0, 2)], .36, .34)
phrase(A("s7:Lalu") + .1, [(4, 1), (6, 1), (7, 2), (6, 1), (4, 1), (2, 3)], .42, .34)
phrase(A("s7:kaca"), [(7, 1), (9, 1), (11, 3)], .3, .32)
phrase(K["s8"] + .3, [(4, 2), (3, 1), (2, 1), (1, 2), (0, 4)], .55, .32)
phrase(CUT2 + .8, [(0, 1), (2, 1), (4, 1), (5, 1), (4, 2), (2, 1), (1, 1), (0, 4)], .5, .32)

# ---------- harp: rolled Rast figures between phrases
hp = M.mono()
for t0, root in [(K["s1"] + 1.2, 0), (K["s2"] + 3.0, 0), (K["s3"] + 4.0, 3), (K["s4"] + 2.5, 0), (A("s4:Kekuasaan"), 4), (K["s5"] + 3.5, 0),
                 (A("s5:Saba"), 4), (A("s5:menyembah"), 1), (A("s6:Sang"), 0), (A("s6:hadiah"), 3), (A("s7:memindahkan"), 4), (BLINK, 0),
                 (A("s7:kolam"), 2), (A("s8:berserah"), 0), (A("s8:Kalau"), 4), (END + .1, 0)]:
    for k, d in enumerate([root, root + 2, root + 4, root + 7]):
        M.lay(hp, harp(deg(d, C4)), t0 + k * .09, .3)
fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])

# ---------- distant frame drum heartbeat of the army (s1, s3), it stops when the army stops
dumb = M.band(M.thump(.5), 30, 400); dumb /= np.abs(dumb).max()
drum = M.mono()
for a, b in ((.6, K["s1e"]), (K["s3"], A("s4:tersenyum") - .1)):
    for x in np.arange(a, b, .72):
        M.lay(drum, dumb, x, .5); M.lay(drum, dumb, x + .24, .25)
drum *= M.env([(0, .5), (K["s1e"], .9), (K["s2"], 0), (K["s3"], .4), (A("s3:menyadari"), 1), (A("s4:tersenyum"), 0), (DUR, 0)])

music_m = (drone * .6 + kan + hp + drum * .55) * fin
music = stereo(music_m, (.25 * hp + .15 * kan) * fin)

# ---------- ambience
zoneA = M.env([(0, 1), (CUT1 - .2, 1), (CUT1 + .2, 0), (CUT2 - .2, 0), (CUT2 + .3, 1), (DUR - .4, 0), (DUR, 0)])
zoneM = 1 - zoneA
# insect bed (high band) with cricket chirps
ins = M.band(rng.standard_normal(N), 3500, 9000); ins /= np.abs(ins).max()
ins *= .6 + .4 * np.sin(2 * np.pi * 7.5 * T) ** 2
M.fx += np.stack([ins, np.roll(ins, 900)], 1) * (zoneA * .018)[:, None]
for x in np.arange(.2, DUR - .5, .41):
    if zoneA[min(N - 1, int(x * SR))] > .5 and rng.random() < .6:
        ch = M.tone((4700, 4760), .06, 25) * np.sin(np.linspace(0, 40, int(.06 * SR))) ** 2
        for k in range(3):
            g(ch, x + k * .07, .01 * rng.uniform(.5, 1))
# birdsong: FM chirps, thicker over the flocks (s2, s5)
def chirp(f0, f1, d):
    n = int(d * SR); tt = np.arange(n) / SR
    f = np.linspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR + 3 * np.sin(2 * np.pi * 38 * tt)) * np.sin(np.pi * tt / d) ** 1.5
bird_rate = M.env([(0, .15), (K["s2"], .5), (K["s3"], .2), (K["s5"], .7), (CUT1, .4), (K["s6"], .25), (K["s7"], .15), (CUT2, .2), (END, .1), (DUR, 0)])
for x in np.arange(.3, DUR - .6, .23):
    if rng.random() < bird_rate[int(x * SR)]:
        f0 = rng.uniform(2400, 4200)
        for k in range(rng.integers(1, 4)):
            g(chirp(f0, f0 * rng.uniform(.7, 1.4), rng.uniform(.05, .12)), x + k * .11, .014)
# hoopoe call "oop-oop-oop" when the hud-hud arrives and at Saba
def hoop(t):
    for k in range(3):
        n = int(.13 * SR); tt = np.arange(n) / SR
        g(np.sin(2 * np.pi * 420 * tt) * np.sin(np.pi * tt / .13) ** 2, t + k * .3, .05)
for k in ("s5:hud-hud", "s5:Saba", "s6:dibuka"):
    hoop(A(k) + .1)
# wing flaps for the hoopoe
for a, b in ((A("s5:Tak"), A("s5:hud-hud") + .5), (CUT1 + .2, CUT1 + 1.7), (K["s6"], A("s6:dibuka") + .4)):
    for x in np.arange(a, b, .13):
        g(M.band(M.burst(.06, 60, 2), 200, 1500), x, .018)
# wind and paper on the map
wind = M.band(rng.standard_normal(N), 200, 1200) * (1 + .5 * np.sin(2 * np.pi * .13 * T)); wind /= np.abs(wind).max()
M.fx += np.stack([wind, np.roll(wind, 700)], 1) * (zoneM * .03)[:, None]
# water under the glass floor
wat = M.band(rng.standard_normal(N), 300, 2500); wat /= np.abs(wat).max()
we = M.env([(0, 0), (BLINK, 0), (BLINK + .5, .5), (A("s7:kolam"), 1), (A("s7:kaca"), .35), (CUT2, .25), (CUT2 + .3, 0), (DUR, 0)])
M.fx += np.stack([wat, np.roll(wat, 500)], 1) * (we * .03)[:, None]
for x in np.arange(BLINK + .5, CUT2, .37):
    if rng.random() < .5:
        g(M.tone((rng.uniform(700, 1400),), .08, 30), x, .012)
# ants: tiny ticks while they stream in and out
for a, b, n in ((1.3, K["s1e"], 120), (A("s3:masuklah"), A("s3:menyadari") + .2, 260), (CUT2 + 1, END, 160)):
    for x in rng.uniform(a, b, n):
        g(M.band(M.burst(.012, 300, 1), 3000, 9000), x, .008)
# the army: low rumble that grows, stops on "tersenyum"
rum = M.band(rng.standard_normal(N), 25, 160); rum /= np.abs(rum).max()
re_ = M.env([(0, .3), (K["s1e"], .7), (K["s2"], .4), (K["s3"], .4), (A("s3:menyadari"), 1), (A("s4:tersenyum") + .3, 0), (DUR, 0)])
M.fx += np.stack([rum, np.roll(rum, 400)], 1) * (re_ * .1)[:, None]
for sc_w in ("s3:terinjak",):
    g(M.thump(.6), A(sc_w), .14)

# ---------- events
swish = lambda t, a=.03: g(M.band(M.burst(.5, 6, 3), 1200, 7000) * np.minimum(1, np.linspace(0, 5, int(.5 * SR))), t, a)
for p in ["s2", "s2:Bala", "s3", "s3:wahai", "s4", "s4:Kekuasaan", "s5", "s5:Tak", "s6", "s6:Sang", "s6:Sulaiman#2", "s7", "s7:Lalu", "s8", "s8:Kekuasaan"]:
    tp = AT.get(p, K.get(p))
    swish(tp - .16)
g(M.lib("chime"), A("s1:tersenyum"), .035)
g(M.lib("chime"), A("s4:tersenyum"), .04)
g(M.lib("sparkle"), A("s4:berdoa"), .025)
g(M.lib("whoosh-cinematic"), CUT1 - .45, .035)
g(M.lib("whoosh-cinematic"), CUT2 - .45, .035)
# pop-up paper folds at Saba
paper = lambda t, a=.03: g(M.band(M.burst(.18, 25, 1), 900, 6000), t, a)
for k, off in (("s5:Saba", -.2), ("s5:Saba", .1), ("s5:Saba", .35), ("s5:ratu", 0), ("s5:singgasana", -.1)):
    paper(A(k) + off)
g(M.thump(.3), A("s5:singgasana"), .08)
g(M.lib("pop"), A("s5:singgasana"), .03)
g(M.lib("riser"), A("s5:menyembah") - .9, .02)
# the letter: falls, paper unroll
g(M.lib("whoosh-short"), A("s6:dibuka") + .3, .03)
g(M.thump(.2), A("s6:dibuka") + .78, .05)
paper(A("s6:bismillah") - .3, .04); paper(A("s6:bismillah"), .03)
g(M.lib("chime"), A("s6:bismillah") + .1, .04)
# gifts slide out, the seal stamps, they come back
for x in rng.uniform(A("s6:hadiah"), A("s6:menolak"), 30):
    g(M.band(M.burst(.05, 50, 2), 400, 2500), x, .012)
g(M.lib("riser"), A("s6:menolak") - 1.0, .025)
g(M.thump(.7), A("s6:menolak"), .3); g(M.lib("impact-bass-1"), A("s6:menolak"), .09)
# the throne: shimmer, streak, blink
g(M.lib("sparkle"), A("s7:memindahkan") + .1, .04)
g(M.lib("riser"), A("s7:memindahkan") + .4, .025)
g(M.lib("whoosh"), BLINK - .5, .035)
g(M.lib("click-soft"), BLINK, .05)
g(M.lib("sparkle"), BLINK + .05, .04)
g(M.lib("chime"), A("s7:kaca"), .045)
g(M.lib("ping"), A("s7:kaca") + .3, .015)
g(M.lib("sparkle"), A("s8:berserah"), .03)
g(M.lib("whoosh"), OUT - .2, .035); g(M.lib("chime"), OUT + .3, .05)
M.fx *= 1.8   # gentle ambience sat ~6 dB under batch 1; lift to match
M.finish(music)
print("duration", DUR)
