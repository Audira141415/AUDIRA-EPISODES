"""EP09 sound: D Saba (D, E half-flat, F, Gb, A, Bb, C). A plucked oud (paired courses, quick pitch settle) playing slow taqsim phrases,
soft temple bells with inharmonic partials, a low warm drone. No koto, no voices.
s1 one bell and a water plip for the bird; s3 a walking oud ostinato; s4 the boat crack (ceramic clink), then near-silence when the lamp
goes out; s5 cold wind and sparse high bells, a shimmer when the wall is sealed with gold; s6 the music warms, a low frame drum under the
king's fleet, a bell when the lamp is re-lit, a cascade at the chest; s7-s8 full warm resolution. Ambience: sea swell, shore wash.
Run from this folder: python mix.py"""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(909)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
SABA = [0, 1.5, 3, 4, 7, 8, 10]      # from D, quarter tone on the 2nd degree
D = 50                                 # D3
deg = lambda d, base=D: base + SABA[d % 7] + 12 * (d // 7)


def oud(f, dur=1.8, bright=1.0):
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros_like(t)
    for det in (1.0, 1.0035):
        gl = 1 + .006 * np.exp(-t * 35)
        ph = 2 * np.pi * f * det * np.cumsum(gl) / SR
        out += sum(np.sin(h * ph) * np.exp(-t * (2.0 + h * .85 / bright)) / h ** .85 for h in range(1, 11))
    pick = M.band(rng.standard_normal(len(t)), 1200, 5000) * np.exp(-t * 90) * .25
    return (out * .5 + pick) * np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .02)


def bell(f, dur=4.5, amp=1.0):
    t = np.arange(int(dur * SR)) / SR
    parts = [(1, 1, .8), (2.0, .45, 1.3), (2.76, .35, 1.8), (4.07, .2, 2.6), (5.4, .12, 3.4), (.5, .25, .6)]
    x = sum(a * np.sin(2 * np.pi * f * p * t + p) * np.exp(-t * d) for p, a, d in parts)
    return amp * x * np.minimum(1, t / .002) * np.minimum(1, (dur - t) / .05) / 2.2


def clink(f0=2500, amp=1.0):
    t = np.arange(int(.6 * SR)) / SR
    x = sum(a * np.sin(2 * np.pi * f0 * p * t) * np.exp(-t * d) for p, a, d in [(1, 1, 22), (1.58, .6, 30), (2.37, .45, 38), (3.11, .3, 50)])
    return amp * (x + .3 * M.band(M.burst(.6, 160, 1), 3000, 9000)) / 2


# ---------- drone: D2 + A2, warm and low, breathing
drone = M.mono()
dn = .5 * np.sin(2 * np.pi * mid(D - 12) * T) + .22 * np.sin(2 * np.pi * mid(D - 5) * T) + .1 * np.sin(2 * np.pi * mid(D) * T + .3) + .05 * np.sin(2 * np.pi * mid(D - 12) * 3 * T)
dn *= 1 + .18 * np.sin(2 * np.pi * .09 * T)
tOut = AT["s4:membunuhnya"] + .25
de = M.env([(0, .55), (K["s2"], .6), (K["s3"], .7), (K["s4"], .8), (AT["s4:Kedua"], .6), (tOut - .2, .5), (tOut + .1, .12), (K["s5"] - .3, .2), (K["s5"] + 1, .5),
            (K["s6"], .7), (AT["s6:raja"], .9), (AT["s6:Anak"], .6), (AT["s6:beriman"], .8), (K["s7"], 1), (K["s8"], .8), (END, .8), (DUR - .4, 0), (DUR, 0)])
drone = dn * de

# ---------- oud phrases (scale degree, beats)
od = M.mono()


def phrase(t0, notes, beat=.42, amp=.3, base=D + 12):
    t = t0
    for d, b in notes:
        if d is not None and t < END + 2:
            M.lay(od, oud(mid(deg(d, base)), max(1.2, b * beat + .8)), t, amp)
            if b >= 3:   # tremolo on long notes, like a risha
                for k in range(1, int(b * beat / .11)):
                    M.lay(od, oud(mid(deg(d, base)), .5, .7), t + k * .11, amp * .35 * (1 - k * .11 / (b * beat)))
        t += b * beat


phrase(.6, [(4, 2), (3, 1), (2, 1), (1, 1), (2, 2), (0, 4)])
phrase(K["s2"] + .4, [(0, 2), (1, 1), (2, 2), (3, 1), (2, 1), (1, 3)], .5, .22)
phrase(AT["s2:menunjukkan"], [(2, 1), (3, 1), (4, 2), (5, 1), (4, 1), (3, 1), (2, 4)], .45, .24)
# s3 walking ostinato: D A D C . low register
for i, x in enumerate(np.arange(AT["s3:berangkat"], AT["s3:batu"], .42)):
    M.lay(od, oud(mid(deg([0, 4, 0, 6][i % 4], D)), .9, .8), x, .2 if i % 4 == 0 else .13)
phrase(AT["s3:melompat"] + .1, [(4, 1), (5, 1), (6, 1), (7, 3)], .3, .26)
phrase(AT["s3:Musa#2"], [(2, 2), (1, 1), (0, 2), (1, 1), (2, 1), (3, 4)], .45, .22)
phrase(K["s4"] + .1, [(0, 1), (2, 1), (3, 1), (4, 2), (3, 1), (2, 2)], .38, .24)
phrase(AT["s4:protes"] - .1, [(3, 1), (2, 1), (1, 3)], .32, .22, D)
phrase(AT["s4:Kedua"] + .1, [(4, 3), (3, 2), (2, 4)], .5, .16, D)
# s5 sparse, cold
phrase(AT["s5:Khidir"], [(4, 2), (None, 1), (3, 2), (2, 3)], .5, .14)
phrase(AT["s5:bertanya"], [(2, 2), (1, 2), (0, 5)], .5, .18)
# s6 the music warms
phrase(K["s6"] + .2, [(0, 1), (2, 1), (4, 1), (5, 1), (7, 4)], .34, .26)
phrase(AT["s6:beriman"], [(4, 1), (5, 1), (7, 2), (6, 1), (5, 1), (4, 3)], .38, .25)
phrase(AT["s6:tersimpan"] - .2, [(7, 1), (8, 1), (9, 1), (11, 4)], .36, .24)
# s7 and s8 resolution
phrase(K["s7"] + .3, [(0, 2), (1, 1), (2, 1), (3, 2), (4, 4), (3, 1), (2, 1), (1, 2), (0, 5)], .48, .24)
phrase(K["s8"] + .3, [(4, 2), (5, 1), (4, 1), (3, 2), (2, 1), (1, 1), (0, 6)], .52, .22)
phrase(AT["s8:Pernahkah"], [(0, 2), (2, 1), (4, 2), (7, 6)], .55, .2)
oe = M.env([(0, 1), (tOut - .3, 1), (tOut, .05), (K["s5"], .05), (K["s5"] + .5, .9), (DUR, 1)])
od *= oe

# ---------- bells (music bed): on scene changes and on gold moments
bl = M.mono()
for t0, n, a in [(.1, D + 24, .5), (K["s2"] - .1, D + 19, .35), (K["s3"] - .1, D + 24, .3), (AT["s5:negeri"], D + 31, .18), (AT["s5:dinding"] + .6, D + 36, .14),
                 (K["s6"], D + 24, .4), (K["s7"], D + 12, .5), (K["s7"] + .02, D + 24, .3), (K["s8"], D + 19, .35), (OUT + .2, D + 12, .55), (OUT + .22, D + 24, .3)]:
    M.lay(bl, bell(mid(n), 5), t0, a)
for i, d in enumerate([7, 9, 11, 12, 14]):     # gold seal on the wall
    M.lay(bl, bell(mid(deg(d, D + 12)), 3), AT["s5:roboh"] + .2 + i * .14, .16)
M.lay(bl, bell(mid(D + 24), 6), AT["s6:beriman"] + .05, .45)   # the lamp re-lit
for i, d in enumerate([4, 7, 9, 11, 14, 16]):  # the chest
    M.lay(bl, bell(mid(deg(d, D + 12)), 3.5), AT["s6:tersimpan"] + .1 + i * .12, .15)
for i, d in enumerate([0, 4, 7, 11, 14]):      # the bowl seams
    M.lay(bl, bell(mid(deg(d, D + 12)), 4), AT["s8:penyelamat"] + i * .2, .14)

# ---------- low frame drum under the king's fleet
fd = M.mono()
dum = M.thump(.5)
for i, x in enumerate(np.arange(AT["s6:miskin"] - .6, AT["s6:baik"] + .8, .62)):
    M.lay(fd, dum, x, .55 if i % 2 == 0 else .3)
fd *= M.env([(0, 0), (AT["s6:miskin"] - .6, .5), (AT["s6:raja"], 1), (AT["s6:baik"] + .8, .3), (AT["s6:Anak"] + .6, 0), (DUR, 0)])

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drone * .5 + od + bl * .8 + fd * .9) * fin
music = stereo(music_m, (.2 * od + .25 * bl) * fin)

# ---------- ambience: sea swell and shore wash, cold wind in the village
sea = M.band(rng.standard_normal(N), 50, 700); sea /= np.abs(sea).max()
wash = M.band(rng.standard_normal(N), 1200, 5200); wash /= np.abs(wash).max()
swell = .55 + .45 * np.sin(2 * np.pi * T / 6.5) ** 2
se = M.env([(0, .9), (K["s2"], .6), (K["s3"], .8), (K["s4"], 1), (AT["s4:Kedua"] + .3, .15), (K["s5"], .1), (K["s6"], .6), (AT["s6:raja"], .9), (AT["s6:Anak"] + .4, .2), (AT["s6:Dan"], .5), (K["s7"], .55), (K["s8"], .35), (END, .3), (DUR - .4, 0), (DUR, 0)])
amb = (sea * .08 + wash * .03 * swell) * swell * se
M.fx += np.stack([amb, np.roll(amb, 1500)], 1)
wind = M.band(rng.standard_normal(N), 300, 1800) * (1 + .6 * np.sin(2 * np.pi * .17 * T)); wind /= np.abs(wind).max()
we = M.env([(0, 0), (AT["s4:Kedua"], 0), (AT["s4:anak"], .35), (K["s5"], .5), (AT["s5:upah"], .45), (K["s6"], 0), (DUR, 0)])
M.fx += np.stack([wind * we * .045, np.roll(wind, 900) * we * .045], 1)

# ---------- events
def drip(t0, a=.05, f0=1400):
    t = np.arange(int(.22 * SR)) / SR
    x = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.4 * np.exp(-t * 25))) / SR) * np.exp(-t * 22)
    g(x, t0, a)


def splash(t0, a=.06, dur=.8):
    x = M.band(M.burst(dur, 6, 1), 400, 6000); x /= np.abs(x).max()
    g(x * np.minimum(1, np.linspace(0, 30, len(x))), t0, a)


drip(2.3, .07)
g(M.lib("sparkle"), AT["s1:Sebanyak"], .02)
for p in ["s2", "s2:Allah", "s3", "s3:Musa#2", "s4", "s4:Kedua", "s5", "s5:Musa", "s6", "s6:Anak", "s6:Dan", "s7", "s8"]:   # panel seams: a soft clink
    tp = AT.get(p, K.get(p))
    g(clink(2300 + 400 * (len(p) % 3)), tp - .12, .035)
g(M.lib("whoosh-short"), K["s2"] - .25, .03)
g(M.lib("chime"), AT["s2:aku"], .025)
g(M.lib("sparkle"), AT["s2:menunjukkan"], .03)
for x in rng.uniform(AT["s3:berangkat"], AT["s3:batu"], 40):   # steps on sand
    g(M.band(M.burst(.05, 60, 1), 900, 5000), x, .01)
g(clink(1900, .8), AT["s3:batu"] - .05, .03)   # basket set on the rock
g(M.lib("whoosh-short"), AT["s3:melompat"], .03); splash(AT["s3:melompat"] + .7, .07)
g(M.lib("sparkle"), AT["s3:situlah"], .03)
# s4 boat
g(M.lib("whoosh"), AT["s4:perahu"] - .4, .025)
tH = AT["s4:dilubangi"]
for k in range(5):
    g(clink(2600 + 500 * k, .9), tH - .2 + k * .06, .05)
g(M.thump(.3), tH, .1); splash(tH + .3, .035, .5)
# lamp out: a soft puff, then quiet
puff = M.band(M.burst(.5, 9, 2), 200, 1500); puff /= np.abs(puff).max()
g(puff, tOut, .05)
# s5 wall: chips fall, wall rises, gold seals
for i in range(6):
    g(clink(1700 + 300 * i, .8), AT["s5:negeri"] + i * .22 + .55, .035)
g(M.lib("riser"), AT["s5:menegakkan"] - .4, .025)
g(M.thump(.5), AT["s5:roboh"] + .1, .14)
g(M.lib("sparkle"), AT["s5:roboh"] + .2, .035)
g(M.lib("whoosh-short"), AT["s5:situlah"], .02)
# s6
g(M.lib("whoosh-cinematic"), K["s6"] + .1, .035)
g(M.lib("sparkle"), AT["s6:Perahu"] + .2, .035)
g(M.lib("impact-bass-1"), AT["s6:raja"], .07)
g(M.lib("whoosh"), AT["s6:baik"] - .2, .03)
g(M.lib("chime"), AT["s6:beriman"], .03)
for k in range(4):
    g(clink(2000 + 350 * k, .8), AT["s6:tersimpan"] - .3 + k * .08, .035)
g(M.thump(.4), AT["s6:tersimpan"] + .5, .09)
g(M.lib("sparkle"), AT["s6:harta"], .04)
# s7, s8
g(M.lib("riser"), K["s7"] - .9, .02)
g(M.lib("sparkle"), AT["s7:apa"], .03)
for i in range(6):
    g(clink(2100 + 200 * i, .7), K["s8"] + .3 + i * .22, .03)
g(M.lib("sparkle"), AT["s8:penyelamat"], .04)
g(M.lib("whoosh"), OUT - .2, .03); g(M.lib("chime"), OUT + .3, .05)
M.finish(music)
print("duration", DUR)
