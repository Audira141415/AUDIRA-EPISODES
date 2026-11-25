"""EP04 sound: D Hijaz (D Eb F# G A Bb C). Low bowed-string drone and slow string phrases, frame drums (bendir/daf: deep dum, dry tek)
that enter with Firaun's army and build to the strike. The strike stops the band; rushing wind as the sea splits, a long drone of awe,
drums return urgent for the chase, a crash when the walls close, then only the drone and a soft plucked line until the outro.
Ambience: sea roar, desert night wind and crickets, sand shuffle of the march, chariot rumble and hooves. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2663)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
w = lambda sc, word, n=0: M.word(sc, word.rstrip(".,:;?!"), n)

STRIKE = w("s5", "tongkatmu.") + .45
SPLIT1 = w("s5", "belahan,")
CHASE = w("s6", "Firaun") + .2
CLOSE0, CLOSE1 = w("s6", "ombak"), w("s6", "mereka.") + .6
HIJAZ = [0, 1, 4, 5, 7, 8, 10, 12]   # from D
D = 50                                 # D3


def bow(f, dur, att=.35, vib=5.2, bright=6):
    """Bowed string: saw partials, slow attack, delayed vibrato."""
    t = np.arange(int(dur * SR)) / SR
    v = 1 + .004 * np.sin(2 * np.pi * vib * t) * np.minimum(1, t / .6)
    ph = 2 * np.pi * f * np.cumsum(v) / SR
    x = sum(np.sin(h * ph) / h ** 1.25 for h in range(1, bright + 1))
    return x * np.minimum(1, t / att) * np.minimum(1, (dur - t) / .4)


def pluck(f, dur=1.4, dec=3.0):
    return M.note(f, dur, "pluck", dec)


# ---------- drone: D2 + A2, swelling with the story
drone = M.mono()
seg = 6.0
for t0 in np.arange(0, DUR, seg - 1.0):
    for n, a in ((D - 12, .5), (D - 5, .28), (D, .14)):
        M.lay(drone, bow(mid(n), seg, 1.0, 4.0, 5), t0, a)
de = M.env([(0, .7), (K["s2"], .5), (K["s3"], .7), (K["s4"], .85), (STRIKE, 1), (STRIKE + .1, .5), (SPLIT1, 1.1), (K["s6"], .9), (CLOSE0, 1), (CLOSE1, .4), (K["s7"], .6), (END, .6), (DUR - .5, 0), (DUR, 0)])
drone *= de

# ---------- string phrases in Hijaz (scale degrees, beats)
strings = M.mono()


def phrase(t0, degs, beat=.62, oct=12, amp=.32):
    t = t0
    for d, b in degs:
        if d is not None:
            n = D + oct + HIJAZ[d % 7] + 12 * (d // 7)
            M.lay(strings, bow(mid(n), b * beat + .3, .12), t, amp)
        t += b * beat


phrase(0.3, [(4, 2), (3, 1), (2, 1), (1, 2), (0, 3)])                        # hook: A G F# Eb D
phrase(K["s1"] + 4.6, [(2, 1), (3, 1), (4, 2), (5, 1), (4, 3)])
phrase(K["s2"] + 1.0, [(0, 2), (1, 2), (2, 3), (None, 1), (1, 2), (0, 4)], .8, 12, .22)   # night, slow and low
phrase(K["s2"] + 8.0, [(4, 2), (5, 1), (4, 1), (2, 2), (1, 1), (0, 4)], .8, 12, .22)
phrase(K["s4"] + .3, [(4, 1), (5, 1), (6, 1), (7, 2), (6, 1), (5, 1), (4, 3)], .55, 12, .3)   # tension climbs
phrase(K["s4"] + 5.4, [(5, 1), (6, 1), (7, 1), (8, 2), (7, 1), (6, 3)], .5, 12, .32)
phrase(w("s4", "tenang:"), [(7, 3), (6, 1), (5, 1), (4, 4)], .7, 12, .26)    # calm answer
phrase(SPLIT1 - .6, [(7, 4), (8, 2), (9, 2), (11, 6)], .7, 0, .3)           # awe at the walls
phrase(K["s7"] + .5, [(4, 3), (2, 1), (1, 2), (0, 5)], .8, 12, .2)
phrase(K["s8"] + .2, [(0, 2), (2, 2), (4, 3), (5, 1), (4, 5)], .8, 12, .2)

# plucked line (oud-like) for the calm after
plk = M.mono()
for i, d in enumerate([0, 2, 4, 2, 1, 0, 4, 5, 4, 2, 1, 0]):
    for base in (K["s7"] + 2.5, K["s8"] + .8):
        t = base + i * .62
        if t < END:
            M.lay(plk, pluck(mid(D + 12 + HIJAZ[d])), t, .18)

# ---------- frame drums
dum = M.thump(.45)
tek = M.band(M.burst(.08, 70, 1), 1500, 7000); tek /= np.abs(tek).max()
ring = M.band(M.burst(.4, 9, 2), 180, 900); ring /= np.abs(ring).max()
drums = M.mono()


def drums_from(t0, t1, bpm, dense=0):
    beat = 60 / bpm
    pat = [("d", 0), ("t", .5), ("t", 1), ("d", 1.5), ("t", 2), ("d", 2.5), ("t", 3), ("t", 3.5)]
    for bar in np.arange(t0, t1, 4 * beat):
        for kind, b in pat:
            t = bar + b * beat
            if t >= t1:
                break
            if kind == "d":
                M.lay(drums, dum, t, .8); M.lay(drums, ring, t, .25)
            elif dense or b in (1, 3):
                M.lay(drums, tek, t, .38 if b in (1, 3) else .22)


drums_from(K["s3"] - .3, K["s4"], 76)
drums_from(K["s4"], STRIKE - .05, 92, 1)
drums_from(CHASE - .4, CLOSE0, 120, 1)
dre = M.env([(0, 0), (K["s3"] - .3, .5), (K["s3"] + 4, .8), (K["s4"], .9), (w("s4", "tenang:"), .55), (STRIKE - .3, 1), (STRIKE, 1), (STRIKE + .05, 0), (CHASE - .4, .9), (CLOSE0, 1), (CLOSE0 + .05, 0), (DUR, 0)])
drums *= dre

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drone * .55 + strings + plk + drums * .9) * fin
music = stereo(music_m, (.22 * strings + .12 * drone) * fin)

# ---------- ambience
roar = M.band(rng.standard_normal(N), 40, 650) + .4 * M.band(rng.standard_normal(N), 900, 3000)
roar *= 1 + .5 * np.sin(2 * np.pi * .11 * T) * np.sin(2 * np.pi * .07 * T + 1)
roar /= np.abs(roar).max()
re_ = M.env([(0, .8), (K["s2"] - .1, .8), (K["s2"], .1), (K["s2"] + 8, .25), (K["s3"], .35), (K["s4"], .7), (w("s4", "tenang:"), .45), (STRIKE, .9), (STRIKE + .2, .3), (CLOSE0, .5), (CLOSE0 + .4, 1.2), (CLOSE1 + 1, .5), (K["s7"], .35), (END, .3), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([roar * re_ * .09, np.roll(roar, 1700) * re_ * .09], 1)
# desert night: soft wind and crickets in s2
wind = M.band(rng.standard_normal(N), 250, 1400) * (1 + .6 * np.sin(2 * np.pi * .19 * T)); wind /= np.abs(wind).max()
we = M.env([(0, 0), (K["s2"] - .05, 0), (K["s2"] + .2, .5), (K["s3"], .4), (K["s3"] + 2, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .05, np.roll(wind, 900) * we * .05], 1)
for x in np.arange(K["s2"] + .3, K["s3"] - .3, .37):
    if rng.random() < .7:
        g(M.tone((4400, 4460), .05, 30) * (1 + np.sin(np.linspace(0, 60, int(.05 * SR)))) * .5, x, .012)
# sand shuffle of the march
for x in rng.uniform(K["s2"] + 1, K["s3"] - .4, 160):
    g(M.band(M.burst(.06, 50, 1), 1200, 6000), x, .012 * rng.uniform(.4, 1))
# chariot rumble and hooves while the army moves
rum = M.band(rng.standard_normal(N), 30, 180); rum /= np.abs(rum).max()
ce = M.env([(0, .4), (K["s2"] - .1, .4), (K["s2"], 0), (w("s3", "mengumpulkan"), 0), (w("s3", "Saat"), .4), (w("s3", "menyusul.") + .5, .9), (K["s4"] + 2, .3), (K["s5"], .15), (CHASE, .2), (CHASE + 1, .9), (CLOSE0 + .3, .9), (CLOSE0 + .8, 0), (DUR, 0)])
M.fx += np.stack([rum * ce * .12, np.roll(rum, 600) * ce * .12], 1)
hoof = M.band(M.burst(.03, 120, 1), 400, 2600); hoof /= np.abs(hoof).max()
for a, b in ((w("s3", "Saat"), K["s4"] + 1.5), (CHASE, CLOSE0 + .3)):
    for x in np.arange(a, b, .19):
        for k in range(3):
            g(hoof, x + k * .045 + rng.uniform(0, .02), .03 * rng.uniform(.5, 1))

# ---------- events
brush = lambda t, a=.035: g(M.band(M.burst(.45, 7, 2), 1800, 9000) * np.minimum(1, np.linspace(0, 6, int(.45 * SR))), t, a)
for p in ["s2", "s2:Allah", "s3", "s3:Katanya", "s3:Saat", "s4", "s4:Musa#2", "s5", "s5:Laut", "s5:Surah", "s6", "s6:Saat", "s7", "s7:Menariknya", "s8"]:
    tp = AT.get(p, K.get(p))
    brush(tp - .16)
# seal stamps: a soft wooden thud on every verse reference
for sc, word in [("s1", "tidak."), ("s2", "surah"), ("s3", "kota-kota"), ("s3", "sekelompok"), ("s3", "terbit,"), ("s4", "panik:"), ("s4", "sesungguhnya"),
                 ("s5", "pukullah"), ("s5", "Thaha"), ("s6", "selamat."), ("s6", "menggulung"), ("s6", "berkata:"), ("s7", "berfirman:")]:
    g(M.thump(.18), w(sc, word), .03); g(M.band(M.burst(.05, 80, 1), 600, 3000), w(sc, word), .02)
g(M.lib("whoosh-cinematic"), K["s2"] - .3, .04)
g(M.lib("chime"), w("s1", "sekali-kali"), .04)
g(M.lib("chime"), w("s4", "Tuhanku"), .045)
g(M.lib("riser"), w("s3", "matahari") - .5, .03)
# the strike
g(M.lib("riser"), STRIKE - 1.6, .045)
g(M.thump(.8), STRIKE, .35); g(M.lib("impact-bass-1"), STRIKE, .16)
g(M.band(M.burst(.6, 6, 1), 800, 6000), STRIKE, .06)          # splash
# rushing wind as the walls rise
n = int((SPLIT1 - STRIKE + 2.5) * SR)
tt = np.arange(n) / SR
rush = M.band(rng.standard_normal(n), 200, 5000)
rush = rush / np.abs(rush).max() * np.minimum(1, tt / .5) * np.minimum(1, (tt[-1] - tt) / 1.4)
sw = np.sin(2 * np.pi * np.cumsum(300 + 900 * tt / tt[-1]) / SR)
g(rush * (.7 + .3 * sw), STRIKE + .1, .09)
g(M.lib("whoosh-cinematic"), STRIKE + .2, .05)
g(M.thump(.6), SPLIT1 - .5, .15)
# crossing footsteps on dry seabed
for x in rng.uniform(w("s5", "jalan") - .3, CHASE, 140):
    g(M.band(M.burst(.05, 60, 1), 900, 5000), x, .014)
# the walls close
g(M.lib("riser"), CLOSE0 - 1.4, .04)
crash = M.band(M.burst(3.0, 1.1, 1), 120, 9000); crash /= np.abs(crash).max()
g(crash, CLOSE0 + .35, .22); g(M.thump(.9), CLOSE0 + .35, .4); g(M.lib("impact-bass-1"), CLOSE0 + .35, .16)
g(M.thump(.7), CLOSE0 + .9, .22)
# after
g(M.lib("whoosh"), K["s7"] - .2, .03)
g(M.lib("sparkle"), w("s8", "langkah"), .025)
g(M.lib("whoosh"), OUT - .2, .04); g(M.lib("chime"), OUT + .3, .06)
M.finish(music)
print("duration", DUR)
