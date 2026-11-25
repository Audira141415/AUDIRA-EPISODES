"""EP03 sound: a pastel marimba-and-music-box bed at 100 BPM (Dmaj7 - Bm9 - Gmaj7 - A6sus), round sub, soft brushed shaker.
Factory foley follows the 3D schedule exactly: press thunks + cup clinks on every cupping stroke, a hydraulic slide and
dome thunk on the bodymaker stroke, quick ironing strokes, trimmer snip, spray hiss, oven hum, seam whirr, aluminium pings.
Run from this folder: python mix.py"""
import json, sys
sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(303)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
A = lambda k: AT[k]

beat = 60 / 100
D3 = 146.83
chords = [[0, 4, 7, 11], [-3, 0, 4, 7, 11], [-7, -3, 0, 4], [-5, -1, 2, 4]]
mar, box, sub, shk = M.mono(), M.mono(), M.mono(), M.mono()


def marimba(f, dur=.9):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + .35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 22) + .12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 40)
    return x * np.minimum(1, t / .002)


def musicbox(f, dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2) + .25 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 9) + .1 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 18)
    return x * np.minimum(1, t / .002)


pat = [0, 2, 1, 3, 2, 1, 3, 2]
mel = [11, 7, 9, 4, 7, 14, 11, 9]
bar, t0 = 0, 0.0
while t0 < DUR:
    ch = chords[bar % 4]
    for k in range(8):
        tt = t0 + k * beat / 2
        M.lay(mar, marimba(D3 * 2 * 2 ** (ch[pat[k] % len(ch)] / 12)), tt, .3 if k % 2 == 0 else .2)
        M.lay(shk, M.band(M.burst(.06, 70, 1), 5000, 12000), tt + (beat / 4 if k % 2 else 0), .1)
    for k in range(4):
        M.lay(sub, M.note(D3 / 2 * 2 ** (ch[0] / 12), .45, "sine", 5, .01), t0 + k * beat, .8 if k % 2 == 0 else .45)
    if bar % 2 == 1:
        for k, s in enumerate(mel[(bar // 2) % 2 * 4:(bar // 2) % 2 * 4 + 4]):
            M.lay(box, musicbox(D3 * 4 * 2 ** (s / 12)), t0 + k * beat, .16)
    t0 += beat * 4
    bar += 1
bed = M.env([(0, .7), (K["s2"], .8), (K["s3"], 1), (K["s6"] - .2, 1), (K["s6"] + .4, .75), (K["s7"], 1), (END, 1), (DUR, .3)])
mono = (.8 * mar + .8 * box + .7 * sub + .6 * shk) * bed
music = stereo(mono, .1 * np.roll(box, 800) * bed)


def ping(t, a=.06, f=2100):
    g(.6 * M.tone([f, f * 2.71], .5, 9), t, a)


def thunk(t, a=.2):
    g(M.thump(.24), t, a)
    g(M.band(M.burst(.08, 50, 2), 300, 3000), t, a * .5)


def hiss(t, dur, a=.04, lo=3000, hi=11000):
    x = M.band(M.rng.standard_normal(int(dur * SR)), lo, hi)
    n = len(x); e = np.minimum(1, np.minimum(np.arange(n) / (.08 * SR), (n - np.arange(n)) / (.15 * SR)))
    g(x * e, t, a)


# s1 hook: soft spin, seamless scan shimmer, rewind into a disc
g(M.lib("impact-bass-1"), .02, .1)
g(M.lib("sparkle"), A("s1:tidak"), .07)
hiss(A("s1:tidak"), 1.2, .02, 6000, 14000)
g(M.lib("whoosh-short"), A("s1:Seluruh") - .1, .08)
for k, w in enumerate(["s1:dulu", "s1:cuma", "s1:satu", "s1:cakram"]):
    g(M.lib("click-soft"), A(w), .1)
ping(A("s1:cakram") + .35, .08, 1760)
# s2 coil + lube
g(M.lib("whoosh-cinematic"), K["s2"] - .3, .08)
g(M.lib("pop"), A("s2:jalur"), .07)
g(M.lib("pop"), A("s2:terpisah"), .07)
hum = M.band(M.rng.standard_normal(int(7 * SR)), 60, 400)
g(hum * np.minimum(1, np.arange(len(hum)) / SR) * np.minimum(1, (len(hum) / SR - np.arange(len(hum)) / SR)), K["s2"], .05)
for i in range(6):
    g(M.tone([1400 + 200 * (i % 3)], .06, 40), A("s2:dilumasi") - .6 + i * .21, .03)
# s3 cupping press: same schedule as world3d (T3, PER3, T3E)
T3, PER3, T3E = K["s3"] - .3, .75, K["s4"] + .6
nmax = int((T3E - T3) // PER3)
for n in range(nmax):
    ts = T3 + n * PER3
    thunk(ts + .5 * PER3, .2)
    if n < 14:
        ping(ts + PER3, .05, 2400 + 60 * (n % 5))
g(M.lib("ping"), A("s3:Ratusan"), .06)
# s4 bodymaker: cup transfer, slow stroke through the rings, dome, then fast strokes
g(M.lib("whoosh-short"), K["s4"] - .1, .08)
g(M.lib("click"), A("s4:pembentuk") + .3, .1)
hiss(A("s4:Batang"), A("s4:melewati") - A("s4:Batang") + .2, .03, 200, 2000)
for w in ["s4:satu", "s4:tiga", "s4:cincin#2", "s4:setrika"]:
    g(M.lib("click"), A(w), .08)
riser = M.lib("riser")
g(riser, A("s4:menipis") - .6, .05)
thunk(A("s4:kubah"), .32)
g(M.lib("impact-bass-1"), A("s4:kubah"), .16)
tF, PERF, tFE = A("s4:Semua") + .3, .6, K["s5"] + .9
k = 0
while tF + k * PERF < tFE:
    thunk(tF + k * PERF + .55 * PERF, .12)
    g(M.lib("whoosh-short"), tF + k * PERF + .2 * PERF, .025)
    k += 1
g(M.lib("chime"), A("s4:seperlima"), .07)
# s5 finishing line: belt rumble + station sounds keyed to their words
rum = M.band(M.rng.standard_normal(int((K["s5e"] - K["s5"] + 1) * SR)), 80, 900)
g(rum * .7, K["s5"], .03)
g(M.lib("click"), A("s5:dipotong"), .1); g(.5 * M.band(M.burst(.25, 18, 1), 3000, 9000), A("s5:dipotong") + .05, .08)
hiss(A("s5:dicuci"), .6, .035, 1500, 6000)
for i in range(4):
    g(M.lib("click-soft"), A("s5:dicetak") + i * .12, .08)
hiss(A("s5:dipanggang"), 1.0, .03, 100, 900)
hiss(A("s5:disemprot"), .7, .05, 4000, 12000)
g(M.lib("pop"), A("s5:dipersempit"), .08)
g(M.lib("pop"), A("s5:ditekuk"), .08)
g(M.lib("whoosh-short"), A("s5:diisi"), .06)
whirr = M.note(420, 1.0, "saw", 1.2, .05)
g(.4 * M.band(np.pad(whirr, (0, 0)), 200, 4000), A("s5:dikunci"), .07)
ping(A("s5:gulungan") + .2, .07)
# s6 why
g(M.lib("whoosh-cinematic"), K["s6"] - .3, .08)
g(M.lib("click-soft"), A("s6:Tutup"), .1)
g(M.lib("pop"), A("s6:diameternya"), .07)
g(M.lib("click"), A("s6:Dasar"), .09)
g(M.lib("riser"), A("s6:tekanan") - 1.0, .05)
thunk(A("s6:6"), .18)
g(M.lib("ping"), A("s6:6") + .1, .07)
g(M.lib("pop"), A("s6:ban"), .07)
# s7 payoff
g(M.lib("whoosh"), K["s7"] - .2, .08)
g(M.lib("sparkle"), A("s7:milimeter"), .07)
g(M.lib("click-soft"), A("s7:Kaleng"), .09)
for i in range(3):
    g(M.tone([1800], .05, 40), A("s7:13") + i * .09, .04)
g(M.lib("chime"), A("s7:gram"), .08)
# s8 loop + pyramid + outro
for w in ["s8:cakram", "s8:langkah", "s8:detik", "s8:jadilah"]:
    g(M.lib("click-soft"), A(w), .09)
ping(A("s8:kaleng"), .07, 1980)
for i in range(10):
    ping(A("s8:Ikuti") - .9 + i * .09 + .3, .03, 2200 + 90 * (i % 4))
g(M.lib("sparkle"), A("s8:AUDIRA"), .08)
g(M.lib("whoosh"), OUT - .35, .1)
g(M.thump(), OUT, .14)
M.finish(music)
