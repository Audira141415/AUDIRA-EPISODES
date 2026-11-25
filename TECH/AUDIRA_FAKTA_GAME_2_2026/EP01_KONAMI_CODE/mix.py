"""EP01 sound: an original 8-bit chiptune at 150 BPM (pulse lead, triangle bass, noise drums), a blip per code input,
a power-up arpeggio, an original game-over jingle and factory clanks. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1986)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]


def pulse(f, dur, duty=.25, dec=3.0, att=.003):
    t = np.arange(int(dur * SR)) / SR
    x = np.where((t * f) % 1 < duty, 1.0, -1.0) * .5
    return x * np.minimum(1, t / att) * np.minimum(1, (dur - t) / .01) * np.exp(-t * dec)


def noise(dur, dec, hp=2000):
    x = M.burst(dur, dec, 1)
    return M.band(x, hp, 14000) if len(x) > 64 else x


lead, bass, drum = M.mono(), M.mono(), M.mono()
beat = 60 / 150
# A minor-ish loop, i - VI - III - VII, eight bars, its own melody
prog = [57, 53, 60, 55]
mel = [[12, 15, 19, 15, 17, 15, 12, 10], [8, 12, 15, 12, 13, 12, 8, 7], [15, 19, 22, 19, 20, 19, 17, 15], [14, 17, 19, 17, 15, 14, 12, 10]]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
t0, i = 0.0, 0
while t0 < END + 2.5:
    bar = (i // 8) % 4
    root = prog[bar]
    if i % 2 == 0:
        M.lay(bass, M.note(hz(root - 12), beat * .9, "tri", 1.2, .004), t0, .8)
    else:
        M.lay(bass, M.note(hz(root), beat * .45, "tri", 4, .004), t0, .45)
    # lead only from scene 2 on, sparse in the hook so the input blips read
    if t0 > K["s1e"] and (i % 8) not in (7,):
        M.lay(lead, pulse(hz(root + mel[bar][i % 8]), beat * .42, .25 if bar % 2 else .125, 5), t0, .32)
    if i % 4 == 0:
        M.lay(drum, M.note(110, .12, "sine", 22), t0, .7); M.lay(drum, noise(.05, 70, 200), t0, .35)
    if i % 4 == 2:
        M.lay(drum, noise(.12, 28, 1500), t0, .45)
    M.lay(drum, noise(.03, 160, 6000), t0 + beat / 4, .18)
    t0 += beat / 2
    i += 1
e = M.env([(0, .55), (K["s1e"], .55), (K["s2"], .9), (K["s3"], .8), (K["s4"], 1), (K["s5"], .85), (K["s6"], .8), (K["s7"], 1), (K["s8"], .55), (END + .3, .65), (DUR, .15)])
# the game-over moments dip the band so the jingle owns them
music = stereo(.5 * lead * e + .6 * bass * e + .5 * drum * e, .12 * np.roll(lead, 700) * e)


def blip(t, f, a=.12):
    g(pulse(f, .09, .5, 18), t, a)
    g(pulse(f * 2, .05, .25, 30), t + .045, a * .6)


def arp(t, base, n=12, step=.035, a=.1):
    for k in range(n):
        g(pulse(hz(base + [0, 4, 7, 12][k % 4] + 12 * (k // 4)), .06, .25, 20), t + k * step, a)


def gameover(t, a=.09):
    for k, (m, d) in enumerate([(72, .14), (67, .14), (64, .14), (60, .4)]):
        g(pulse(hz(m), d, .5, 4), t + [0, .15, .3, .45][k], a)


def clank(t, a=.14):
    g(M.note(180, .2, "square", 26) * .5, t, a); g(noise(.15, 30, 900), t, a)


# hook: one blip per spoken input, pitched by direction
pitch = {"U": 988, "D": 659, "L": 784, "R": 880, "B": 523, "A": 1046}
seq = ["U", "U", "D", "D", "L", "R", "L", "R", "B", "A"]
keys = ["s1:Atas", "s1:atas", "s1:bawah#1", "s1:bawah#2", "s1:kiri#1", "s1:kanan#1", "s1:kiri#2", "s1:kanan#2", "s1:B", "s1:A"]
for k, s in zip(keys, seq):
    blip(AT[k], pitch[s], .13)
arp(AT["s1:A"] + .05, 72, 16, .03, .1)
g(M.lib("impact-bass-1"), AT["s1:A"], .35)
g(M.lib("sparkle"), AT["s1:A"] + .1, .14)

for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[x] - .18, .16)
    blip(K[x] + .05, 1500, .05)
# s2 bench
g(M.lib("click-soft"), AT["s2:Kazuhisa"], .14)
g(M.lib("riser"), AT["s2:memindahkan"], .07)
blip(AT["s2:Gradius"], 660, .08)
g(M.lib("pop"), AT["s2:NES"] - .1, .16)
# s3: the ship keeps dying, a jingle each loop
LOOP = 2.9
tt = K["s3"] + 1.75
while tt < AT["s4:kode"] - .4:
    g(noise(.35, 9, 300), tt, .11)
    gameover(tt + .4)
    tt += LOOP
g(M.lib("error"), AT["s3:tamat"], .1)
# s4 pause + code + power-up
blip(AT["s4:kode"] - .3, 1200, .1); blip(AT["s4:kode"] - .15, 1200, .1)
t1, t2 = AT["s4:kode"] + .25, AT["s4:dijeda"] + .4
for k in range(10):
    blip(t1 + (t2 - t1) * k / 10, pitch[seq[k]], .08)
g(M.lib("whoosh"), AT["s4:Hasilnya"] - .1, .12)
arp(AT["s4:semua"], 64, 20, .03, .11)
g(M.lib("sparkle"), AT["s4:langsung"], .14)
ts, te = AT["s4:padahal"], AT["s4:sedikit#2"] + .4
for k in range(6):
    blip(ts + (te - ts) * (k + 1) / 6 - .05, 700 + 60 * k, .06)
# s5 even steps vs mashing
tA = K["s5"] + .3
step = (AT["s5:penguji"] + .3 - tA) / 10
for k in range(10):
    blip(tA + k * step, pitch[seq[k]], .07)
arp(tA + 10 * step, 76, 8, .04, .07)
tb = AT["s5:sulit"] - .2
k = 0
while tb + k * .2 < K["s5e"]:
    blip(tb + k * .2, 300 + 700 * M.rng.random(), .045)
    k += 1
g(M.lib("error"), AT["s5:sulit"] + .5, .09)
# s6 checklist, factory, stamp, bug
g(M.lib("glitch-1"), AT["s6:terlewat"], .1)
tp = AT["s6:diproduksi"]
for k in range(16):
    clank(tp - .3 + k * .32, .1)
g(M.thump(), AT["s6:membiarkannya"], .4)
g(M.lib("impact-bass-1"), AT["s6:membiarkannya"], .22)
g(M.lib("glitch-2"), AT["s6:bug"], .1)
# s7 1986, 30 lives, the code spreading
g(M.lib("chime"), AT["s7:1986"] if "s7:1986" in AT else K["s7"] + 1.9, .1)
arp(AT["s7:tiga"], 69, 30, .025, .06)
for k in range(20):
    blip(AT["s7:kejutan"] + ((k * 7) % 20) * .08, 900 + (k % 5) * 110, .035)
g(M.lib("ping"), AT["s7:Bank"], .12)
# s8 quiet tribute, then the sign
g(M.lib("chime"), AT["s8:tapi"], .1)
for k in range(10):
    blip(AT["s8:kodenya"] + k * .32, pitch[seq[k]], .04)
g(M.lib("sparkle"), AT["s8:AUDIRA"] - .2, .12)
g(M.thump(), OUT, .25)
arp(OUT + .05, 69, 12, .04, .07)
M.finish(music)
