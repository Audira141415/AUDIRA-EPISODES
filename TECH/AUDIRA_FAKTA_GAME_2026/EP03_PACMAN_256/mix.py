"""EP03 sound: an original arcade-style square/noise bed at 128 BPM in A minor, our own alternating chomp blips,
binary ticks for the register, crunchy glitch bursts at each overflow and a stamp thud. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(3256)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g, w = M.put, M.word
END = M.TL["speech_end"]

# ---- music bed: square lead arpeggio, triangle bass, noise hats ----
lead, bass, hat = M.mono(), M.mono(), M.mono()
beat = 60 / 128
A = 220.0
prog = [[0, 3, 7, 12], [-4, 0, 3, 8], [-2, 2, 5, 10], [-5, -1, 2, 7]]   # Am F G Em, own voicing
mel = [0, 2, 1, 3, 2, 1, 3, 0, 1, 3, 2, 0, 3, 2, 1, 2]
t0, i = 0.0, 0
while t0 < END + 2.5:
    c = prog[(i // 16) % 4]
    M.lay(lead, M.note(A * 2 ** (c[mel[i % 16]] / 12), beat * .45, "square", 7, .002), t0, .32)
    if i % 4 == 0:
        M.lay(bass, M.note(A / 4 * 2 ** (c[0] / 12), beat * 1.9, "tri", 1.2, .003), t0, .9)
    if i % 2 == 1:
        M.lay(hat, M.band(M.burst(.05, 70, 1), 5000, 12000), t0, .25)
    if i % 8 == 4:
        M.lay(hat, M.band(M.burst(.14, 22, 2), 600, 5000), t0, .5)
    t0 += beat / 4; i += 1
e = M.env([(0, .8), (K["s3"], .55), (K["s4"], .9), (K["s5"], .5), (K["s6"], 1), (K["s7"], .7), (K["s8"], .95), (END + .4, 1), (DUR, .15)])
# overflow points: music drops out for a beat
for x in (w("s3", "kembali"), w("s4", "meluap"), w("s5", "kill")):
    e = e * (1 - .85 * np.exp(-np.maximum(0, T - x) * 3) * (T >= x) * (T < x + 1.2))
music = stereo(.38 * lead * e + .6 * bass * e + .18 * hat * e, .08 * np.roll(lead, 700) * e)


def waka(ta, tb, a=.045):
    """Own alternating chomp blips: two short square sweeps."""
    t, k = ta, 0
    while t < tb:
        n = int(.11 * SR); tt = np.arange(n) / SR
        f = (330 + 260 * tt / .11) if k % 2 == 0 else (590 - 260 * tt / .11)
        x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-tt * 10) * np.minimum(1, tt / .002)
        g(x, t, a); t += .135; k += 1


def tick(t, a=.05, f=2400):
    g(M.note(f, .018, "square", 120, .0005), t, a)


def glitch(t, a=.2):
    g(M.lib("glitch-2"), t, a)
    x = M.burst(.35, 6, 1)
    x = np.sign(x) * np.minimum(1, np.abs(x) * 3)          # crunch
    x = np.repeat(x[::6], 6)[: len(x)]                       # bit-crush
    g(x * np.exp(-np.arange(len(x)) / SR * 5), t, a * .35)


def stamp(t, a=.32):
    g(M.thump(.4), t, a); g(M.band(M.burst(.08, 50, 2), 200, 3000), t, a * .5)


# hook
g(M.lib("glitch-1"), .05, .12)
waka(.1, 5.4)
glitch(w("s1", "separuh"), .16)
g(M.thump(), w("s1", "tidak"), .2)
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[x] - .14, .12)
    g(M.note(880, .05, "square", 40), K[x] - .05, .03)
# s2 play
waka(K["s2"] + 1.0, w("s2", "naik") - .1)
for k in range(4):
    g(M.note(196 * 2 ** (k / 12), .09, "tri", 12), w("s2", "empat") + k * .12, .08)
for k, f in enumerate([523, 659, 784, 1047, 784, 1047]):
    g(M.note(f, .08, "square", 18), w("s2", "naik") + k * .07, .04)
g(M.lib("pop"), w("s2", "ikon"), .1)
# s3 register: ticks follow every value change of the counter
for k in range(8):
    tick(w("s3", "Delapan") + k * .11, .04, 1800 + k * 120)
nol, lew = w("s3", "nol"), w("s3", "Lewat")
last, lt = 0, -1
for tt in np.arange(nol, lew, 1 / 240):
    v = min(254, int(254 * min(1, (tt - nol) / (lew - .25 - nol)) ** 1.7))
    if v != last and tt - lt > .03:
        tick(tt, .035, 2000 + (v % 8) * 90); lt = tt
    last = v
tick(lew, .07, 1600); tick(w("s3", "itu"), .08, 1500)
glitch(w("s3", "kembali"), .24)
g(M.thump(.3), w("s3", "kembali") + .45, .14)
g(M.lib("error"), w("s3", "integer"), .12)
# s4 fruit drawing then overflow
d0, d1 = w("s4", "menggambar"), w("s4", "tujuh") + .3
for k in range(7):
    g(M.note(660 * 2 ** (k * 2 / 12), .07, "square", 22), d0 + k * (d1 - d0) / 7, .04)
glitch(w("s4", "meluap"), .2)
m2 = w("s4", "menggambar", 1)
for k in range(6):
    g(M.note(990 + 40 * k, .05, "square", 30), m2 + k * .14, .035)
ga, gb = AT["s4:Gambarnya"] - 1.4, w("s4", "acak") + .2
crackle = M.band(M.rng.standard_normal(int((gb - ga) * SR)), 1500, 9000)
crackle *= (M.rng.random(len(crackle)) < .02).astype(float) * 6 + .15
g(crackle * np.linspace(.3, 1, len(crackle)), ga, .05)
for k in range(10):
    tick(ga + k * (gb - ga) / 10, .05, 700 + 110 * (k % 4))
glitch(w("s4", "menimpa"), .16)
# s5 stuck
waka(K["s5"] + .9, w("s5", "dimakan"))
for k in range(5):
    g(M.note(300, .07, "square", 30), w("s5", "dimakan") + .2 + k * .35, .03)
stamp(w("s5", "kill"))
g(M.lib("glitch-3"), w("s5", "kill") + .05, .12)
# s6 odometer roll
a6, b6 = w("s6", "tiga"), w("s6", "puluh", 1) + .3
for k in range(36):
    u = k / 36
    tick(a6 + (b6 - a6) * (1 - (1 - u) ** .5), .035, 1300)
g(M.lib("chime"), b6 + .1, .15)
g(M.lib("click"), w("s6", "Billy"), .12)
# s7 letter
g(M.band(M.burst(.6, 4, 2), 1500, 7000), K["s7"] - .3, .05)
g(M.lib("whoosh"), K["s7"] - .2, .1)
g(M.lib("ping"), w("s7", "Jeffrey"), .1)
g(M.lib("riser"), w("s7", "melewati") - 1.2, .1)
g(M.lib("pop"), w("s7", "melewati"), .14)
stamp(w("s7", "terbukti"))
# s8
waka(K["s8"] + 1.1, END)
g(M.lib("sparkle"), OUT - .4, .12)
g(M.thump(), OUT, .2)
M.finish(music)
