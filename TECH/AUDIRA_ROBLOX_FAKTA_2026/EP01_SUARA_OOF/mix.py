"""EP01 RUANG REKAM sound: a lo-fi studio bed (warm electric-piano sevenths, round bass, soft kick, brushed hats, tape hiss) at 84 BPM.
The bed tape-stops when the replacement sound arrives (s5), runs dull and filtered through the quiet years, and rewinds back to full on "kembali" (s6).
No voice-like sound anywhere: the break is a cartoon bonk and a slide whistle. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4101)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7")}
beat = 60 / 84
mf = lambda m: 440 * 2 ** ((m - 69) / 12)


def ep(f, dur, dec=1.1):
    """Electric-piano-ish note: sine body, short bell partials, slow tremolo."""
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3) + .12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 8)
    return x * (1 + .16 * np.sin(2 * np.pi * 4.2 * t)) * np.exp(-t * dec) * np.minimum(1, t / .008) * np.minimum(1, (dur - t) / .05)


keys, bass, kick, hat, rim = M.mono(), M.mono(), M.mono(), M.mono(), M.mono()
prog = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]  # Fmaj7 Em7 Dm7 Cmaj7
bar, t0 = 0, 0.0
while t0 < END + 4:
    ch = prog[bar % 4]
    for k, m in enumerate(ch):
        M.lay(keys, ep(mf(m), beat * 3.6), t0 + k * .018, .22)
        M.lay(keys, ep(mf(m), beat * 1.4, 2.2), t0 + beat * 2.5 + k * .014, .12)
    M.lay(bass, M.note(mf(ch[0] - 24), beat * 1.8, "sine", 1.4, .01), t0, .9)
    M.lay(bass, M.note(mf(ch[0] - 24 + 7), beat * .9, "sine", 2.0, .01), t0 + beat * 2.5, .6)
    for b in range(4):
        tb = t0 + b * beat
        if b in (0, 2):
            M.lay(kick, M.thump(.3), tb, .8)
        if b in (1, 3):
            M.lay(rim, M.band(M.burst(.09, 38, 2), 900, 3800), tb, .5)
        for h in (0, 1):
            M.lay(hat, M.band(M.burst(.05, 70, 1), 5000, 11000), tb + h * beat * .5 + (.06 * beat if h else 0), .35 if h else .22)
    t0 += beat * 4
    bar += 1
hiss = M.band(M.rng.standard_normal(N), 2500, 11000)
hiss = hiss / np.abs(hiss).max()

oof1, kb = AT["s1:oof"], AT["s6:kembali"]
ts = AT["s5:Penggantinya"] - .15
L = 1.0
drums = M.env([(0, 0), (oof1 - .01, 0), (oof1 + .2, 1), (DUR, 1)])
full = .55 * keys + .6 * bass + (.42 * kick + .12 * hat + .2 * rim) * drums
side = .12 * np.roll(keys, 620) - .05 * np.roll(hat, 300) * drums

# tape stop: playback rate falls from 1 to 0 over L seconds
i0, n = int(ts * SR), int(L * SR)
k = np.arange(n)
pos = i0 + k - k ** 2 / (2 * n)
rew_src = full[int((ts - 2.6) * SR):int(ts * SR)].copy()
for arr in (full, side):
    seg = np.interp(pos, np.arange(N), arr) * np.linspace(1, .5, n)
    arr[i0:i0 + n] = seg
main = M.env([(0, 1), (ts + L - .02, 1), (ts + L, 0), (kb - .02, 0), (kb, 1), (END + .4, 1), (DUR, .15)])
dull = M.band(.55 * keys + .6 * bass, 60, 700)
dulle = M.env([(0, 0), (ts + L, 0), (ts + L + 1.6, .5), (kb - .5, .5), (kb, 0), (DUR, 0)])
hisse = M.env([(0, .02), (ts, .02), (ts + L, .04), (kb, .04), (kb + .2, .02), (DUR, .02)])
mono = full * main + dull * dulle + hiss * hisse
music = stereo(mono, side * main)


def bonk(t, a=.3, f0=540, f1=170):
    d = .24
    tt = np.arange(int(d * SR)) / SR
    f = f1 + (f0 - f1) * np.exp(-tt * 24)
    g(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 13), t, a)
    g(M.thump(.32), t, a * .9)


def tick(t, a=.05, lo=1500, hi=8000):
    g(M.band(M.burst(.03, 90, 1), lo, hi), t, a)


def clack(t, a=.08):
    g(M.band(M.burst(.05, 60, 2), 300, 2500), t, a)
    g(M.thump(.12), t, a * .5)


def slide(t0, t1, a=.05, f0=1300, f1=420):
    d = t1 - t0
    tt = np.arange(int(d * SR)) / SR
    f = f0 + (f1 - f0) * (tt / d) ** 1.4
    x = np.sin(2 * np.pi * np.cumsum(f * (1 + .012 * np.sin(2 * np.pi * 6 * tt))) / SR) * np.minimum(1, tt / .05) * np.minimum(1, (d - tt) / .04)
    g(x, t0, a)


def steps(a, b, amp=.05):
    t = a
    while t < b:
        g(M.band(M.burst(.04, 80, 3), 150, 1400), t, amp)
        t += .224


def whir(t, d, up=True, a=.1):
    tt = np.arange(int(d * SR)) / SR
    x = M.band(M.rng.standard_normal(len(tt)), 700, 5200) * (1 + .6 * np.sin(2 * np.pi * (18 + 30 * tt / d) * tt))
    f = (300 + 1600 * (tt / d) ** 1.5) if up else (1900 - 1600 * tt / d)
    x = .5 * x / np.abs(x).max() + .5 * np.sin(2 * np.pi * np.cumsum(f) / SR)
    g(x * np.minimum(1, tt / .05) * np.minimum(1, (d - tt) / .06), t, a)


def riser(t1, d, a=.08):
    tt = np.arange(int(d * SR)) / SR
    x = M.band(M.rng.standard_normal(len(tt)), 400, 9000) * (tt / d) ** 2
    x = x / np.abs(x).max() + .4 * np.sin(2 * np.pi * np.cumsum(200 + 700 * (tt / d) ** 2) / SR) * (tt / d)
    g(x, t1 - d, a)


# s1: wobble, slide-whistle fall, bonk, parts clatter, the wall spike
slide(1.15, oof1 - .02, .05)
bonk(oof1, .34)
g(M.lib("impact-bass-1"), oof1, .16)
for j, dt in enumerate((.55, .61, .66, .7, .74, .8)):
    clack(oof1 + dt, .07 - j * .006)
# scene changes: tape transport clunk + short whoosh
for x in ("s2", "s3", "s4", "s5", "s6", "s7"):
    g(M.lib("click-soft"), K[x] - .1, .14)
    g(M.lib("whoosh-short"), K[x] - .16, .1)
# s2
bonk(AT["s2:oof"], .16, 420, 160)
for x in ("s2:meme", "s2:video", "s2:remix"):
    g(M.lib("pop"), AT[x], .1)
re1 = s("s2")["end"] - 1.55
for j in range(6):
    clack(re1 + .1 + j * .12, .05)
g(M.lib("sparkle"), re1 + .9, .1)
# walks between stations
legs = [(s("s2")["end"] - .2, K["s3"] + 2.3), (K["s4"] + .1, K["s4"] + 2.2), (K["s5"] + .1, K["s5"] + 2.0), (K["s7"] + .1, K["s7"] + 2.0)]
for a, b in legs:
    steps(a + .1, b - .05)
    g(M.lib("whoosh"), a + .2, .07)
# s3: CRT power-on, cassette, name plates
crt = AT["s3:Messiah"] - .15
g(M.thump(.25), crt, .12)
tt = np.arange(int(.6 * SR)) / SR
g(np.sin(2 * np.pi * 60 * tt) * np.exp(-tt * 5) * .6 + M.band(M.burst(.6, 6, 2), 2000, 7000) * .2, crt, .12)
g(M.lib("click"), AT["s3:2000"], .12)
g(M.lib("click-soft"), AT["s3:Tommy"] - .1, .16)
g(M.lib("click-soft"), AT["s3:Joey"] - .1, .16)
# s4: dispute, flip, stamp, coin, tag
g(M.thump(.2), AT["s4:2019"], .14)
g(M.lib("error"), AT["s4:mempersoalkan"], .08)
g(M.lib("click"), AT["s4:2020"], .14)
g(M.lib("whoosh-short"), AT["s4:2020"], .08)
g(M.lib("whoosh-short"), AT["s4:sepakat"] - .45, .1)
g(M.lib("impact-bass-1"), AT["s4:sepakat"], .2)
clack(AT["s4:sepakat"], .12)
g(M.lib("ping"), AT["s4:satu"], .12)
g(M.lib("sparkle"), AT["s4:satu"] + .4, .08)
g(M.lib("pop"), AT["s4:seratus"], .1)
# s5: date block, eject, cross, tape stop, dull slump
g(M.thump(.2), AT["s5:Juli"], .14)
clack(AT["s5:dihapus"], .14)
g(M.lib("click"), AT["s5:dihapus"] + .04, .14)
g(M.lib("glitch-1"), AT["s5:dihapus"] + .1, .07)
g(M.lib("error"), AT["s5:lisensi"], .1)
dull_thud = M.band(M.thump(.4), 40, 400)
g(dull_thud, AT["s5:datar"], .3)
g(M.lib("glitch-2"), AT["s5:Banyak"], .05)
# s6: flip, riser into the comeback, rewind whir, return
g(M.lib("click"), AT["s6:Juli"], .14)
riser(AT["s6:Suara"], 1.6, .07)
whir(AT["s6:Suara"] - .05, kb - AT["s6:Suara"] + .1, True, .1)
rw = rew_src[::-1]
idx = np.linspace(0, len(rw) - 1, int(.5 * SR))
g(np.interp(idx, np.arange(len(rw)), rw) * np.linspace(.2, 1, len(idx)), kb - .5, .5)
clack(kb, .1)
g(M.lib("impact-bass-1"), kb, .18)
g(M.lib("sparkle"), kb + .5, .12)
g(M.lib("whoosh-short"), AT["s6:file"], .1)
# s7: ticks, the question
for x in ("s7:cek", "s7:lisensi", "s7:suara#2"):
    tick(AT[x], .08)
    g(M.lib("click-soft"), AT[x], .12)
g(M.lib("pop"), AT["s7:Kamu"], .12)
g(M.lib("whoosh-cinematic"), OUT - .5, .1)
g(M.thump(), OUT, .2)
M.finish(music)
