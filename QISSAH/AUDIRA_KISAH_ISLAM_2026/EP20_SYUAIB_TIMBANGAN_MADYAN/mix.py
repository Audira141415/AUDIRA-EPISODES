"""EP20 sound: maqam Hijaz-Kar on C (C Db E F G Ab B C). A plucked oud states short phrases, a breathy ney (sine + vibrato
+ breath noise) holds long tones over a C/G drone, and a riq (frame drum with jingles) keeps a soft 2/4 market pulse in
the busy scenes. Ambience: market bustle (filtered murmur and footfall texture, no voices), coin and brass-weight clinks
on the scales, a lamp flame. s5 thins to drone; s6 builds wind, then one deep thunder blast with a long rumble and
crumbling, then only wind and sand hiss into s7-s8. Panel star-iris transitions get a soft metallic shimmer.
Music dips for a voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(2020)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
ROOT = 48  # C3
HK = [0, 1, 4, 5, 7, 8, 11]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
deg = lambda d: ROOT + 12 + HK[d % 7] + 12 * (d // 7)

tB = AT["s6:suara"] - .05
tSink = AT["s6:seolah"] - .4


def oud(f, dur=1.4):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0006 * h)) * np.exp(-t * (2.0 + 1.1 * h)) / h ** .8 for h in range(1, 10))
    pick = M.band(rng.standard_normal(len(t)), 1800, 6500) * np.exp(-t * 110) * .22
    return (x + pick) * np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .05)


def ney(f, dur, amp=1.0):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / .8)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    x = np.sin(ph) + .18 * np.sin(2 * ph) + .06 * np.sin(3 * ph)
    br = M.band(rng.standard_normal(len(t)), f * .8, f * 4) * .12
    env = np.minimum(1, t / .35) * np.minimum(1, (dur - t) / .5)
    return (x + br) * env * amp


# ---------- drone C2 + G2
drone = M.mono()
dt = np.arange(int(10 * SR)) / SR
for t0 in np.arange(0, DUR, 8.2):
    for n, a in ((ROOT - 12, .5), (ROOT - 5, .26), (ROOT, .12)):
        f = hz(n)
        x = (np.sin(2 * np.pi * f * dt) + .25 * np.sin(2 * np.pi * 2 * f * dt)) * np.sin(np.pi * dt / dt[-1]) ** 2
        M.lay(drone, x, t0, a)
drone *= M.env([(0, .6), (K["s3"], .7), (K["s5"], .9), (K["s6"], .7), (tB - .3, .9), (tB + .2, 0), (K["s6e"], .2), (K["s7"], .5), (K["s8"], .7), (END, .6), (DUR - .4, 0), (DUR, 0)])

# ---------- oud phrases
od = M.mono()


def phrase(t0, notes, amp=.3):
    t = t0
    for d, b in notes:
        M.lay(od, oud(hz(deg(d)), max(.6, b + .6)), t, amp)
        if b >= .9:
            M.lay(od, oud(hz(deg(d)), .6), t + b * .5, amp * .4)
        t += b


phrase(.2, [(4, .45), (3, .3), (2, .3), (1, .5), (0, 1.1)], .26)
phrase(K["s2"] + .2, [(0, .3), (2, .3), (3, .3), (4, .3), (5, .3), (4, .6), (3, .3), (2, .9)], .3)
phrase(AT["s2:Nabi"], [(4, .5), (5, .3), (6, .3), (7, 1.3)], .26)
phrase(AT["s3:Sisa"], [(7, .4), (6, .3), (5, .3), (4, 1.2)], .22)
phrase(K["s4"] + .3, [(2, .3), (1, .3), (2, .3), (0, 1.0)], .24)
phrase(K["s7"] + .4, [(0, .4), (1, .3), (2, .3), (4, 1.1)], .24)
phrase(AT["s7:Minta"], [(4, .3), (3, .3), (2, .3), (1, .3), (0, 1.2)], .22)
phrase(K["s8"] + .2, [(4, .5), (5, .35), (4, .35), (2, .5), (0, 1.4)], .26)

# ---------- ney long tones
ny = M.mono()
for t0, d, dur, a in [(1.2, 4, 3.4, .16), (AT["s3:Penuhilah"], 7, 4.0, .15), (AT["s3:Sisa"] + 1.5, 4, 3.0, .12),
                      (AT["s5:Syu'aib"], 4, 4.2, .14), (K["s6"] + .4, 2, 3.4, .12), (AT["s6:tunggulah"] + .3, 1, 3.6, .12),
                      (K["s7e"] - 2, 4, 3.0, .12), (AT["s8:Kisah"] - .3, 7, 3.2, .15)]:
    M.lay(ny, ney(hz(deg(d)), dur), t0, a)

# ---------- riq: doum / tek / jingle in the market scenes
drum = M.mono()
n = lambda d: np.arange(int(d * SR)) / SR
doum = lambda: np.sin(2 * np.pi * (78 * n(.45) + 30 * (1 - np.exp(-n(.45) * 30)) / 30)) * np.exp(-n(.45) * 10)
tek = lambda: M.band(M.burst(.07, 80, 1), 1000, 5000)
jing = lambda: M.band(M.burst(.18, 22, 1), 5500, 12000)
bt = 60 / 84
for a, b, amp in ((K["s2"] - .2, K["s3"] - .3, 1.0), (K["s4"] + .2, K["s5"] - .3, .7), (K["s8"] + 1, END, .6)):
    for i, x in enumerate(np.arange(a, b, bt / 2)):
        st = i % 8
        if st in (0, 3, 6 if i % 16 < 8 else 5):
            M.lay(drum, doum(), x, .32 * amp)
        elif st in (2, 4, 7):
            M.lay(drum, tek(), x, .12 * amp)
        M.lay(drum, jing(), x, (.05 if st % 2 else .03) * amp)

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drone * .5 + od + ny + drum * .7) * fin
music = stereo(music_m, (.12 * od + .1 * ny + .06 * drone) * fin)

# ---------- market bustle (no voices): mid-band murmur with slow swells, before the blast
mur = M.band(rng.standard_normal(N), 250, 1800)
mur *= 1 + .5 * np.sin(2 * np.pi * .37 * T) * np.sin(2 * np.pi * .13 * T + 1)
mur /= np.abs(mur).max()
me = M.env([(0, .25), (K["s1e"], .3), (K["s2"], .7), (K["s3"], .25), (K["s4"], .45), (K["s5"], .35), (K["s6"], .2), (AT["s6:Saat"], .05), (tB, 0), (DUR, 0)])
M.fx += np.stack([mur * me * .05, np.roll(mur, 900) * me * .05], 1)
step = M.band(M.burst(.1, 40, 2), 120, 1200)
for x in np.arange(K["s2"], K["s3"], .23):
    g(step, x + rng.uniform(0, .1), rng.uniform(.006, .016))

# ---------- coin / brass clinks (inharmonic metal)
def clink(f0=2400, dec=18):
    t = n(.5)
    x = sum(np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * dec * r ** .5) for r in (1, 2.76, 5.4, 8.9)) / 4
    return x * np.minimum(1, t / .001)


for x, f0, a in [(.6, 2600, .03), (AT["s1:timbangan"] + .1, 2200, .035), (AT["s1:sedikit"] - .05, 1700, .05), (AT["s1:sedikit#2"], 3000, .04),
                 (AT["s1:setiap"], 2500, .025)]:
    g(clink(f0), x, a)
for x in rng.uniform(K["s2"], K["s3"] - .5, 12):
    g(clink(rng.uniform(2000, 3600), 25), x, rng.uniform(.008, .018))
# honest scale: grain pour, the beam swing settling, a clear level 'ting'
pour = M.band(rng.standard_normal(int(1.5 * SR)), 2500, 9000) * np.sin(np.pi * n(1.5) / 1.5) * (1 + .5 * rng.standard_normal(int(1.5 * SR)) ** 2)
g(pour, AT["s3:Penuhilah"] - .2, .012)
for k in range(4):
    g(clink(1500 - k * 80, 30), AT["s3:Penuhilah"] + .5 + k * .75, .02 * (1 - k * .2))
g(clink(3150, 6), AT["s3:adil"] + .1, .04)
# lamp lit
g(M.band(M.burst(.4, 9, 2), 300, 3000), AT["s2:Syu'aib"] - .15, .04)
g(M.lib("sparkle"), AT["s2:Syu'aib"], .02)
# stones raised (s5): dull stone knocks
for x in np.linspace(AT["s5:mengancam"] + .1, AT["s5:mengancam"] + 3, 6):
    g(M.band(M.burst(.08, 60, 2), 300, 2500), x + rng.uniform(0, .2), .025)

# ---------- star-iris shimmer on panel changes
shim = lambda: sum(np.sin(2 * np.pi * f * n(.7)) * np.exp(-n(.7) * 6) for f in (1568, 2093, 2637)) / 3
for p in ["s2", "s2:Nabi", "s3", "s3:Sisa", "s4", "s4:Bagi", "s5", "s5:Syu'aib", "s6", "s6:Saat", "s6:Yang", "s7", "s8"]:
    tp = AT.get(p, K.get(p))
    g(shim(), tp - .15, .012)
    g(M.band(rng.standard_normal(int(.5 * SR)), 2500, 8000) * np.sin(np.pi * n(.5) / .5) ** 2, tp - .2, .012)
g(M.lib("whoosh-cinematic"), K["s1e"] - .4, .03)

# ---------- s6: wind rises, thunder blast, rumble, crumble; then wind and sand hiss
wind = M.band(rng.standard_normal(N), 140, 1600) * (1 + .6 * np.sin(2 * np.pi * .09 * T) * np.sin(2 * np.pi * .041 * T + 1))
wind /= np.abs(wind).max()
we = M.env([(0, .12), (K["s5"], .2), (AT["s6:Saat"], .35), (tB - .2, .8), (tB + 2, .9), (K["s6e"], .55), (K["s7"], .35), (K["s8"], .25), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .05, np.roll(wind, 1700) * we * .05], 1)
rum = M.band(rng.standard_normal(N), 16, 120); rum /= np.abs(rum).max()
re = M.env([(0, 0), (tB - .05, 0), (tB + .1, 1), (tB + 3, .6), (K["s6e"], .15), (K["s7"] + 1, 0), (DUR, 0)])
M.fx += np.stack([rum * re * .34, np.roll(rum, 500) * re * .34], 1)
crack = M.band(M.burst(1.2, 4, 1), 60, 5000)
g(crack, tB, .2)
g(M.lib("impact-bass-1"), tB, .2)
g(M.thump(.6), tB + .02, .16)
for x in rng.uniform(tB + .3, tSink + 3, 70):
    g(M.band(M.burst(rng.uniform(.15, .5), rng.uniform(8, 20), 2), 150, 3000), x, rng.uniform(.01, .03))
sand = M.band(rng.standard_normal(int(4 * SR)), 3000, 11000) * np.sin(np.pi * n(4) / 4)
g(sand, tSink, .03); g(sand, tSink + 2.5, .02)
g(M.lib("riser"), AT["s6:Yang"] - 1.2, .02)

g(M.lib("chime"), AT["s8:AUDIRA"], .03)
g(M.lib("whoosh"), OUT - .2, .03); g(M.lib("chime"), OUT + .3, .045)
M.finish(music)
print("duration", DUR)
