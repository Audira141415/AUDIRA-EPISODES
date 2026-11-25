"""EP10 sound: D Kurd (D Eb F G A Bb C). A low brass-like drone (soft saw stack, slow swell), a slow horn line in Kurd,
deep anvil hits as the pulse (inharmonic metal partials over a sub thump), bellows breathing in s6, fire crackle and
metal hiss when copper meets iron. Ambience: mountain wind, sea wash in the west, dust storm rumble beyond the pass.
Music dips for a voice later via M.finish. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1083)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
KURD = [0, 1, 3, 5, 7, 8, 10, 12]
D = 50

IRON0, IRON1 = AT["s6:Bawakan"] + .3, AT["s6:gunung"] + .25
BLOW, RED = AT["s6:Tiuplah"], AT["s6:menyala"] + .4
POUR0, POUR1 = AT["s6:tembaga"] - .1, K["s7"] + 1.8


def brass(f, dur, att=.6, bright=7):
    t = np.arange(int(dur * SR)) / SR
    v = 1 + .003 * np.sin(2 * np.pi * 4.6 * t) * np.minimum(1, t / .8)
    ph = 2 * np.pi * f * np.cumsum(v) / SR
    swell = np.minimum(1, t / att)
    x = sum(np.sin(h * ph) / h ** (1.6 - .5 * swell) for h in range(1, bright + 1))
    return x * swell * np.minimum(1, (dur - t) / .5)


def anvil(dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    parts = [(1, 1), (2.76, .55), (5.4, .35), (8.93, .22), (13.3, .12)]
    x = sum(a * np.sin(2 * np.pi * 520 * r * t) * np.exp(-t * (3 + 2.5 * r)) for r, a in parts)
    th = M.thump(.5)
    th = np.pad(th, (0, max(0, len(t) - len(th))))[: len(t)]
    return .55 * x + .9 * th


# ---------- drone: D1/D2/A2 brass stack
drone = M.mono()
seg = 7.0
for t0 in np.arange(0, DUR, seg - 1.2):
    for n, a in ((D - 24, .45), (D - 12, .38), (D - 5, .22)):
        M.lay(drone, brass(mid(n), seg, 1.4, 5), t0, a)
de = M.env([(0, .8), (K["s2"], .55), (K["s3"], .6), (K["s4"], .55), (K["s5"], .75), (K["s6"], .8), (RED, 1.0), (POUR1, 1.0), (K["s7"] + 3, .7), (END, .6), (DUR - .5, 0), (DUR, 0)])
drone *= de

# ---------- horn phrases in Kurd
horn = M.mono()


def phrase(t0, degs, beat=.7, oct=12, amp=.28):
    t = t0
    for d, b in degs:
        if d is not None:
            n = D + oct + KURD[d % 7] + 12 * (d // 7)
            M.lay(horn, brass(mid(n), b * beat + .35, .18, 6), t, amp)
        t += b * beat


phrase(0.4, [(4, 2), (5, 1), (4, 1), (3, 2), (1, 1), (0, 3)])
phrase(K["s2"] + .6, [(0, 2), (1, 1), (3, 2), (4, 3)], .8, 12, .22)
phrase(K["s2"] + 6.5, [(4, 2), (3, 1), (1, 1), (0, 4)], .8, 12, .2)
phrase(K["s3"] + 4.5, [(4, 3), (3, 1), (1, 2), (0, 2), (-1, 4)], .8, 12, .22)       # sunset, falling
phrase(K["s4"] + .5, [(0, 1), (1, 1), (3, 1), (4, 3), (5, 1), (4, 3)], .7, 12, .24)  # sunrise, rising
phrase(K["s5"] + .4, [(1, 2), (0, 2), (1, 1), (3, 1), (1, 4)], .8, 0, .26)
phrase(K["s6"] + .2, [(4, 2), (5, 1), (7, 3), (5, 1), (4, 3)], .7, 12, .24)
phrase(RED - .2, [(7, 3), (8, 1), (7, 1), (5, 1), (4, 4)], .62, 12, .28)
phrase(AT["s7:rahmat"] - .3, [(0, 2), (3, 2), (4, 2), (7, 5)], .8, 12, .24)        # thanks, resolve upward
phrase(K["s8"] + .5, [(4, 2), (3, 1), (1, 1), (0, 5)], .9, 12, .18)

# ---------- anvil pulse: sparse in the journey, driving through the build
AV = anvil()
anv = M.mono()
for t in np.arange(K["s5"] + .2, K["s6"], 60 / 50 * 2):
    M.lay(anv, AV, t, .3)
for t in np.arange(K["s6"] + .1, POUR1, 60 / 84):
    M.lay(anv, AV, t, .45 if t > IRON0 else .3)
for t in (0.1, 2.2, 4.2):
    M.lay(anv, AV, t, .5)
ae = M.env([(0, 1), (K["s2"], 1), (K["s2"] + .4, 0), (K["s5"], 0), (K["s5"] + .3, .8), (K["s6"], .9), (POUR1, 1), (POUR1 + .2, 0), (DUR, 0)])
anv *= ae

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drone * .55 + horn + anv * .8) * fin
music = stereo(music_m, (.2 * horn + .1 * drone) * fin)

# ---------- ambience
wind = M.band(rng.standard_normal(N), 180, 1600) * (1 + .6 * np.sin(2 * np.pi * .13 * T) * np.sin(2 * np.pi * .05 * T + 1)); wind /= np.abs(wind).max()
we = M.env([(0, .3), (K["s2"], .55), (K["s3"], .5), (K["s4"], .35), (K["s5"], .7), (K["s6"], .4), (K["s8"], .5), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .05, np.roll(wind, 1300) * we * .05], 1)
sea = M.band(rng.standard_normal(N), 60, 700) * (1 + .7 * np.sin(2 * np.pi * .09 * T)); sea /= np.abs(sea).max()
se = M.env([(0, 0), (AT["s3:Ia"] - .5, 0), (AT["s3:matahari"], .8), (K["s4"] - .05, .8), (K["s4"], 0), (DUR, 0)])
M.fx += np.stack([sea * se * .08, np.roll(sea, 900) * se * .08], 1)
storm = M.band(rng.standard_normal(N), 25, 260); storm /= np.abs(storm).max()
ste = M.env([(0, .5), (K["s2"] - .05, .5), (K["s2"], 0), (AT["s5:Ya'juj"] - .5, 0), (AT["s5:Ya'juj"] + 1, .9), (K["s6"], .6), (K["s7"], 1.0), (AT["s7:rahmat"], .5), (K["s8"], .15), (DUR, 0)])
M.fx += np.stack([storm * ste * .13, np.roll(storm, 700) * ste * .13], 1)
# fire crackle
crk = M.band(M.burst(.02, 200, 1), 1500, 8000)
fe = lambda t: (1 if t < K["s2"] else 0) * .6 + (1 if BLOW - .2 < t < K["s7"] + 2.5 else 0)
for x in rng.uniform(0, DUR, 900):
    a = fe(x)
    if a > 0:
        g(crk, x, .03 * a * rng.uniform(.3, 1))
fireroar = M.band(rng.standard_normal(N), 80, 900); fireroar /= np.abs(fireroar).max()
fre = M.env([(0, .35), (K["s2"] - .05, .35), (K["s2"], 0), (BLOW - .2, 0), (BLOW + .4, .8), (K["s7"] + .5, .6), (K["s7"] + 3, 0), (DUR, 0)])
M.fx += np.stack([fireroar * fre * .06, np.roll(fireroar, 400) * fre * .06], 1)
# bellows breath: each pump is a swelling filtered breath
for t in np.arange(BLOW, AT["s6:Lalu"] + .6, 2 * np.pi / 5.2):
    n = int(.55 * SR); tt = np.arange(n) / SR
    br = M.band(rng.standard_normal(n), 300, 2400) * np.sin(np.pi * tt / tt[-1]) ** 2
    g(br / np.abs(br).max(), t, .07)
# torch march footfalls, very soft
for a, b in ((AT["s3:Ia"], AT["s3:terbenam"]), (K["s4"], AT["s4:kaum"]), (K["s5"], AT["s5:Sebuah"])):
    for x in np.arange(a, b, .42):
        g(M.band(M.burst(.05, 60, 1), 600, 3500), x + rng.uniform(0, .05), .012)

# ---------- events
hiss = lambda t, a=.05, d=1.2: g(M.band(M.burst(d, 2.5, 1), 3000, 12000) * np.minimum(1, np.linspace(0, 12, int(d * SR))), t, a)
for p in ["s2", "s2:Siapa", "s3", "s3:Ia", "s4", "s4:Di", "s5", "s5:Sebuah", "s6", "s6:Bawakan", "s7", "s7:Tapi", "s8"]:
    tp = AT.get(p, K.get(p))
    g(M.lib("whoosh-short"), tp - .25, .035); hiss(tp - .2, .018, .5)
# verse reference chips: a small metallic ting
for p in ["s2:Al-Kahfi", "s3:kedudukan", "s3:matahari", "s4:terbit", "s5:antara", "s5:mengadu", "s6:menjawab", "s7:Hasilnya", "s7:ini"]:
    g(M.tone((1560, 2340), .5, 9), AT[p], .02)
g(M.lib("impact-bass-1"), 0.1, .12)
g(M.lib("chime"), AT["s2:pemilik"], .04)
g(M.lib("riser"), AT["s3:terbenam"] - 1.2, .025)
g(M.lib("sparkle"), AT["s4:terbit"], .03)
# coins offered (QS 18:94) and pushed back (QS 18:95)
for k in range(9):
    g(M.tone((3200 + 300 * k, 4700), .18, 30), AT["s5:membayarmu"] + k * .06, .015)
g(M.band(M.burst(.4, 9, 1), 900, 5000), AT["s6:lebih"], .04)
# blocks land: a heavy iron clank per row
for r0 in range(16):
    t = IRON0 + (r0 * 12 / 192) * (IRON1 - IRON0 - .55) + .55
    g(AV[: int(.4 * SR)], t, .12); g(M.thump(.25), t, .1)
g(M.lib("impact-bass-1"), IRON1, .14)
# heat rises, then copper pours: big hiss and sizzle
g(M.lib("riser"), RED - 2, .035)
hiss(POUR0, .09, 3.5); hiss(POUR0 + 1.5, .07, 3.0)
sz = M.band(rng.standard_normal(int(4 * SR)), 2000, 9000) * np.exp(-np.arange(int(4 * SR)) / SR * .6)
g(sz, POUR0 + .2, .05)
# s7: dust hits the wall and is stopped
for x in np.arange(K["s7"] + .3, AT["s7:Tapi"], .55):
    g(M.thump(.3), x + rng.uniform(0, .1), .06); g(M.band(M.burst(.3, 12, 2), 200, 2000), x, .03)
g(M.lib("chime"), AT["s7:rahmat"], .05)
g(M.lib("whoosh"), OUT - .2, .04); g(M.lib("chime"), OUT + .3, .06)
M.finish(music)
print("duration", DUR)
