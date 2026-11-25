"""EP08 sound: "polite rivalry" in G major, 104 bpm. Pizzicato bass and off-beat chords, glockenspiel tune, a tiny brass sting
on every flag swap, a soft string pad under the 2022 signing. Foley: Arctic wind, ice creak and crack, helicopter, ship engine,
flag flap, bottle clink, cork pop, pen scratch. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(808)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda n: 440 * 2 ** ((n - 69) / 12)
beat = 60 / 104

def pizz(f, a=1.0):
    t = np.arange(int(.5 * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (9 + 5 * h)) / h for h in range(1, 6))
    return x * np.minimum(1, t / .003) * a

def glock(f, a=1.0, dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2) + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6) + .15 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 11)
    return x * np.minimum(1, t / .002) * a

def brass(notes, dur=.42, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(sum(np.sin(2 * np.pi * mid(n) * h * t) / h ** 1.3 for h in range(1, 8)) for n in notes) / len(notes)
    env = np.minimum(1, t / .035) * np.exp(-t * 3.2) * np.minimum(1, (dur - t) / .06)
    return M.band(x * env, 120, 3200) * a

# chord grid: G C D G / Em C D G, two bars each chord-pair
PROG = [(43, [55, 59, 62]), (48, [55, 60, 64]), (50, [54, 57, 62]), (43, [55, 59, 62]), (40, [55, 59, 64]), (48, [55, 60, 64]), (50, [54, 57, 62]), (43, [55, 59, 62])]
bass, chords, gl, br = M.mono(), M.mono(), M.mono(), M.mono()
def level(t0):
    if t0 < K["s2"]: return 1.0
    if t0 < K["s4"]: return .55
    if t0 < K["s6"]: return 1.0
    if t0 < K["s7"]: return .35
    return .9
nb = int(END / beat) + 4
for b in range(nb):
    t0 = b * beat
    root, ch = PROG[(b // 4) % len(PROG)]
    lv = level(t0)
    if b % 2 == 0:
        M.lay(bass, pizz(mid(root), .9), t0, lv)
    if lv > .5 and t0 < END + 1:
        for k, n in enumerate(ch):
            M.lay(chords, pizz(mid(n), .35), t0 + beat / 2 + k * .008, lv)
# glock tune: short question-answer phrases
TUNE = [(74, 1), (79, .5), (78, .5), (76, 1), (74, 1), (None, .5), (71, .5), (72, .5), (74, .5), (76, 1), (74, 2)]
def phrase(t0, a=1.0, tr=0):
    t = t0
    for n, d in TUNE:
        if n is not None:
            M.lay(gl, glock(mid(n + tr), a), t, 1)
        t += d * beat
for st, a in ((.2, .8), (K["s4"] + .2, .7), (AT["s5:bergantian"] + .4, .6), (K["s7"] + .3, .7), (K["s8"] + .2, .8)):
    phrase(st, a)
for x in np.arange(K["s2"], K["s4"], beat * 8):
    M.lay(gl, glock(mid(86), .35), x, 1)
# brass stings: each flag swap, a fanfare for "Perang Wiski"
SW = [(AT["s5:benderanya"] - .2, "CA"), (AT["s5:Begitu"], "DK"), (AT["s5:Begitu+0.45"], "CA"), (AT["s5:Begitu+0.9"], "DK"), (AT["s5:Begitu+1.35"], "CA"),
      (AT["s4:menancapkan"], "DK"), (AT["s7:Kanada"], "CA"), (AT["s7:Denmark"], "DK")]
for t0, who in SW:
    M.lay(br, brass([55, 59, 62] if who == "CA" else [57, 61, 64], .38, .9), t0, 1)
M.lay(br, brass([55, 59, 62, 67], .9, 1.1), AT["s5:Perang"], 1)
# string pad under the signing
pad = M.mono()
saw = lambda f, d=0: sum(np.sin(2 * np.pi * (f + d) * h * T + h) / h for h in range(1, 5))
padsig = M.band(saw(mid(55)) + saw(mid(59), .3) + saw(mid(62), -.25) + .7 * saw(mid(43), .1), 60, 1600); padsig /= np.abs(padsig).max()
pad = padsig * M.env([(0, 0), (K["s6"] - .5, 0), (K["s6"] + 1.5, 1), (K["s7"] - .5, 1), (K["s7"] + 1, .3), (K["s8"], .25), (DUR - .5, 0), (DUR, 0)])
musicfade = M.env([(0, 1), (END + .3, 1), (DUR, .55)])
music = stereo((.55 * bass + .32 * chords + .4 * gl + .5 * br + .32 * pad) * musicfade, (.14 * gl + .1 * chords) * musicfade)

# --- foley ---
wind = M.band(rng.standard_normal(N), 180, 2200); wind /= np.abs(wind).max()
wind *= .55 + .45 * np.sin(2 * np.pi * T / 6.1) ** 2
we = M.env([(0, .5), (K["s2"], .5), (AT["s2:Kanada"], 1.0), (K["s3"] + 4, .9), (K["s4"], .4), (K["s6"], .5), (K["s7"], .4), (AT["s7:paling"], .9), (K["s8"], .5), (DUR - .3, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .045, np.roll(wind, 1300) * we * .045], 1)

def creak(t0, a=.05, n=7):
    for i in range(n):
        f = 300 + rng.uniform(0, 500)
        g(M.band(M.burst(.05, 40, 2), f, f * 3), t0 + i * rng.uniform(.04, .09), a * rng.uniform(.5, 1))
def crack(t0, a=.25):
    g(M.band(M.burst(.25, 18, 1), 900, 9000), t0, a); g(M.thump(.5), t0, a * .8); creak(t0 + .1, a * .3, 10)
creak(1.0, .04); creak(K["s2"] + 2, .04); creak(K["s3"] + 3, .03)

# helicopter: rotor chop ~ 17 Hz on low noise
chop = (np.sin(2 * np.pi * 17 * T) > .6).astype(float); chop = np.convolve(chop, np.ones(220) / 220, mode="same")
rot = M.band(rng.standard_normal(N), 60, 700) * chop
rot /= np.abs(rot).max() + 1e-9
he = M.env([(0, 0), (K["s4"], 0), (K["s4"] + 1.2, .5), (AT["s4:mendarat"], 1), (AT["s4:mendarat"] + 2.5, .15), (K["s5"] - .6, .15), (K["s5"] + .3, .9), (K["s5"] + 3.6, 0), (DUR, 0)])
M.fx += np.stack([rot * he * .09, np.roll(rot, 400) * he * .09], 1)
# ship engine putter
pt = (np.sin(2 * np.pi * 8.5 * T) > .2).astype(float); pt = np.convolve(pt, np.ones(220) / 220, mode="same")
eng = M.band(np.sin(2 * np.pi * 58 * T) + .5 * np.sin(2 * np.pi * 116 * T) + .3 * rng.standard_normal(N), 40, 800) * pt
ee = M.env([(0, 0), (AT["s5:membalas"] - 1.6, 0), (AT["s5:membalas"] - .6, .8), (AT["s5:benderanya"], .5), (AT["s5:benderanya"] + 1, .1), (AT["s5:Media"], .1), (AT["s5:Media"] + .6, .7), (AT["s5:Media"] + 3.4, 0), (DUR, 0)])
M.fx += np.stack([eng * ee * .05] * 2, 1)

def flap(t0, a=.06):
    n = int(.7 * SR); x = M.band(rng.standard_normal(n), 300, 3500) * (np.abs(np.sin(2 * np.pi * 9 * np.arange(n) / SR)) ** 3)
    g(x * np.exp(-np.arange(n) / SR * 3), t0, a)
def clink(t0, a=.08):
    g(M.tone((2390, 3910, 5230), .9, 6), t0, a); g(M.tone((2610, 4400), .6, 8), t0 + .012, a * .6)
def cork(t0, a=.12):
    g(M.tone((520, 780), .06, 60), t0, a); g(M.band(M.burst(.05, 90, 1), 1500, 7000), t0, a * .6)

for t0 in (0.05, AT["s1:Bendera"], AT["s4:menancapkan"], AT["s7:Kanada"], AT["s7:Denmark"]) + tuple(t for t, _ in SW[:5]):
    flap(t0)
cork(AT["s1:sebotol"], .08); clink(AT["s1:sebotol"] + .3, .05)
cork(AT["s4:sebotol"]); cork(AT["s5:wiski"]); cork(AT["s8:tanpa"], .08)
clink(AT["s8:pecundang"], .11)
# pen scratch along the crack
for x in np.arange(AT["s6:pembagian"] - .3, AT["s6:retakan"] + .4, .19):
    g(M.band(M.burst(.15, 14, 1), 2200, 7000), x + rng.uniform(0, .05), .03)
crack(AT["s6:separuh-separuh"], .22); creak(K["s7"] - .9, .05)

# panel changes: ice tick + soft whoosh
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh"), K[k] - .3, .045); g(M.band(M.burst(.12, 30, 1), 3000, 12000), K[k] - .14, .05)
for k in ("s2:Luasnya", "s4:Konon", "s5:Media", "s5:Tahun", "s6:pembagian"):
    g(M.band(M.burst(.12, 30, 1), 3000, 12000), AT[k] - .14, .05)
# stamps and pops
for k in ("s2:perairan", "s3:titik", "s4:Konon", "s5:sengketa", "s7:paling"):
    g(M.thump(.4), AT[k], .22); g(M.lib("impact-bass-1"), AT[k], .06)
g(M.lib("impact-bass-1"), AT["s5:Media"], .1); g(M.thump(.6), AT["s5:Media"], .25)
for k in ("s1:hampir", "s1:Bendera", "s1:sebotol", "s3:mengklaim", "s4:pesan", "s5:perangnya", "s5:iklan", "s6:Kanada", "s6:Denmark", "s6:Greenland", "s7:bertetangga", "s8:Menurut"):
    g(M.lib("pop"), AT[k], .05)
g(M.lib("click"), AT["s2:1,3"], .05); g(M.lib("ping"), AT["s2:35"] + 1.1, .05); g(M.lib("ping"), AT["s7:1.280"] + 1.4, .06)
g(M.lib("riser"), AT["s2:Kanada"] - 1.4, .03); g(M.lib("whoosh-cinematic"), AT["s2:Kanada"] - .2, .05)
for i in range(18):
    g(M.tone((1800 + i * 40,), .04, 60), AT["s3:batas"] + i * .14, .015)
g(M.lib("sparkle"), AT["s7:perbatasan"], .05)
g(M.lib("whoosh-short"), OUT - .35, .05); g(M.lib("chime"), OUT + .3, .07)
M.finish(music)
print("duration", DUR)
