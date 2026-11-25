"""EP02 sound: a warm lo-fi groove at 84 BPM with swing (soft Rhodes chords Fmaj7-Em7-Am7-Dm7/G, marimba and bell plucks,
round bass, brushed kick/snare, vinyl crackle). SFX follow the coin schedule exactly: synthesised clinks for every landing coin,
paddle blips on every ball hit, a rewind sweep, phone trill, stamps and a rising-pitch clink ladder as the coins stack. Run from this folder."""
import json, sys
sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1972)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
C = json.load(open("coins.json", encoding="utf8"))
g = M.put
END = M.TL["speech_end"]
A = lambda k: AT[k]
rng = np.random.default_rng(72)

# ---------------- music ----------------
bpm = 84
beat = 60 / bpm
sw = beat * 0.58  # swung eighth (long-short)
F2 = 87.31
chords = [[5, 9, 12, 16], [4, 7, 11, 14], [9, 12, 16, 19], [2, 5, 9, 12]]  # Fmaj7, Em7, Am7, Dm7 (semitones from C)
bassn = [5, 4, 9, 2]
C3 = 130.81
rh, mar, bell, bass, kick, snr, hat = (M.mono() for _ in range(7))


def rhodes(f, dur):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + .28 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3) + .08 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 6)
    trem = 1 + .18 * np.sin(2 * np.pi * 4.6 * t)
    return x * trem * np.minimum(1, t / .03) * np.exp(-t * .9) * np.minimum(1, (dur - t) / .1)


def marimba(f, dur=.5):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 8) + .3 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30)
    return x * np.minimum(1, t / .002)


def bellp(f, dur=1.2):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 3) + .4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6) + .2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 10)) * np.minimum(1, t / .002)


def kickd():
    t = np.arange(int(.35 * SR)) / SR
    return np.sin(2 * np.pi * (52 * t + 70 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 9)


def brush(dur, dec, lo, hi):
    return M.band(rng.standard_normal(int(dur * SR)), lo, hi) * np.exp(-np.arange(int(dur * SR)) / SR * dec)


KD, SN, HT = kickd(), brush(.25, 18, 900, 6000), brush(.06, 60, 5000, 12000)
mpat = [0, 2, 3, 1, 2, 3, 1, 2]
bar, t0 = 0, 0.0
while t0 < DUR:
    ch = chords[bar % 4]
    for semi in ch:
        M.lay(rh, rhodes(C3 * 2 ** (semi / 12), beat * 4 + .4), t0 + .02, .16)
    M.lay(bass, M.note(C3 / 2 * 2 ** (bassn[bar % 4] / 12), beat * 2.6, "sine", .8, .02), t0, .55)
    M.lay(bass, M.note(C3 / 2 * 2 ** ((bassn[bar % 4] + 7) / 12), beat * 1.2, "sine", 1.2, .02), t0 + beat * 2.5, .4)
    for k in range(8):
        tk = t0 + (k // 2) * beat + (sw if k % 2 else 0)
        idx = mpat[(k + bar) % 8]
        if (k + bar) % 3 != 2:
            M.lay(mar, marimba(C3 * 2 * 2 ** (ch[idx] / 12)), tk, .42 if k % 2 == 0 else .3)
        M.lay(hat, HT, tk, .25 if k % 2 == 0 else .16)
    if bar % 2 == 1:
        M.lay(bell, bellp(C3 * 4 * 2 ** (ch[3] / 12)), t0 + beat * 3 + sw, .22)
    for k in (0, 2.5):
        M.lay(kick, KD, t0 + k * beat, .6)
    for k in (1, 3):
        M.lay(snr, SN, t0 + k * beat, .32)
    t0 += 4 * beat
    bar += 1
crack = np.zeros(N)
idx = rng.integers(0, N, int(DUR * 7))
crack[idx] = rng.uniform(-.5, .5, len(idx))
crack = M.band(crack, 1500, 9000) + .004 * M.band(rng.standard_normal(N), 200, 3000)
drums = M.env([(0, 1), (K["s2"] - .2, 1), (K["s2"] + .3, 0), (A("s2:Dua"), 0), (A("s2:Dua") + 1, .8), (K["s3"], .8), (A("s3:Permainannya"), .5), (K["s4"], 1), (A("s5:bermasalah"), 1), (A("s5:bermasalah") + .3, 0), (A("s5:meluap") - .6, 0),
                (A("s5:meluap"), 1), (K["s7"], 1), (A("s7:menolak") + .2, .35), (A("s7:kredit"), .35), (A("s7:kredit") + .2, 1), (END, 1), (OUT + 1.5, .6), (DUR, 0)])
lvl = M.env([(0, .9), (END, 1), (OUT + .5, 1.05), (DUR - 1.2, .8), (DUR, 0)])
mono = (.75 * rh + .6 * M.band(mar, 200, 8000) + .45 * bell + .9 * bass + drums * (.75 * kick + .5 * snr + .35 * hat) + .25 * crack) * lvl
music = stereo(mono, (.12 * np.roll(mar, 700) + .08 * np.roll(bell, 900)) * lvl)

# ---------------- SFX ----------------
def clink(f0, a=1.0, dec=1.0):
    n = int(.3 * SR)
    t = np.arange(n) / SR
    x = sum(w * np.sin(2 * np.pi * f0 * r * t + p) * np.exp(-t * d * dec) for r, w, d, p in ((1, 1, 18, 0), (2.32, .6, 26, .7), (4.25, .35, 38, 1.3), (6.8, .2, 50, 2.1)))
    x += .3 * M.band(rng.standard_normal(n), 3000, 12000) * np.exp(-t * 160)
    return x * a * np.minimum(1, t / .0008)


def blip(t, f=480, a=.06):
    n = int(.07 * SR)
    tt = np.arange(n) / SR
    g(np.sign(np.sin(2 * np.pi * f * tt)) * .5 * np.minimum(1, (.07 - tt) / .01), t, a)


def stampfx(t, a=.25):
    g(M.thump(.3), t, a)
    g(M.band(M.burst(.08, 60, 1), 400, 3000), t, a * .6)


fr = lambda x: x - np.floor(x)
# hook cascade (only coins that land before the rewind)
for i, (t0, d) in enumerate(C["c1"]):
    tl = t0 + d
    if 0 < tl < C["tR0"]:
        g(clink(2300 + 1500 * fr(i * .618), .05 + .03 * fr(i * .37)), tl, 1)
for i in range(0, 30):
    tt = .02 + i * .17
    if tt < C["tR0"]:
        g(clink(3200 + 900 * fr(i * .41), .025), tt, 1)
g(M.lib("impact-bass-1"), .02, .16)
for k in range(1, 8):
    if k * .8 < A("s1:rusak"):
        blip(k * .8, 480 if k % 2 else 240, .05)
g(M.lib("glitch-1"), A("s1:rusak"), .07)
# rewind sweep into 1972
tR0, tR1 = C["tR0"], C["tR1"]
n = int((tR1 - tR0 + .3) * SR)
tt = np.arange(n) / SR
f = 1800 * np.exp(-tt * 3) + 120
g(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / tt[-1]) * .5 + .3 * M.band(rng.standard_normal(n), 800, 6000) * np.sin(np.pi * tt / tt[-1]), tR0, .12)
g(M.lib("whoosh-cinematic")[::-1].copy(), tR0 - .2, .12)
# s2 carry in
g(M.lib("pop"), A("s2:seribu"), .08)
for k in range(int((A("s2:menaruh") + .5 - A("s2:Dua")) / .36)):
    g(M.thump(.12), A("s2:Dua") + k * .36, .05)
g(M.thump(.25), A("s2:menaruh") + .5, .14)
g(M.lib("pop"), A("s2:Nolan"), .08); g(M.lib("pop"), A("s2:Allan"), .08)
g(M.lib("chime"), A("s2:Andy"), .08)
# s3 TV out and in
g(M.lib("whoosh-short"), A("s3:televisi") - .3, .1)
g(M.lib("pop"), A("s3:seharga"), .1)
g(M.lib("whoosh-short"), A("s3:dimasukkan") - .1, .1)
g(M.thump(.2), A("s3:dimasukkan") + .5, .16); g(M.lib("click"), A("s3:dimasukkan") + .5, .12)
g(M.lib("pop"), A("s3:jukebox"), .1); g(M.lib("pop"), A("s3:pinball"), .1)
g(M.lib("whoosh"), A("s3:Permainannya") - .2, .1)
k0 = int(np.ceil((A("s3:Permainannya") - .3) / .8))
k = k0
while k * .8 < K["s3e"]:
    blip(k * .8, 480 if k % 2 else 240, .07)
    k += 1
# s4 crowd: murmur bed + pops
mur = M.band(rng.standard_normal(N), 250, 1400) * (1 + .5 * np.sin(2 * np.pi * 1.3 * T)) * M.env([(0, 0), (A("s4:ramai") - .5, 0), (A("s4:ramai"), .5), (A("s4:makin"), .6), (K["s4e"], 1), (A("s5:Lalu") + .3, 1), (A("s5:Lalu") + 1, 0), (DUR, 0)])
M.fx += np.stack([mur, np.roll(mur, 300)], 1) * .03
for i in range(10):
    tin = A("s4:ramai") - .5 + i * .12 if i < 4 else A("s4:makin") - .2 + (i - 4) * .22
    g(M.lib("pop"), tin, .05)
g(M.lib("sparkle"), A("s4:satu"), .07)
# s5 trouble, phone, door, flood
g(M.lib("glitch-2"), A("s5:bermasalah") - .15, .08)
n = int(.55 * SR)
tt = np.arange(n) / SR
trill = (np.sin(2 * np.pi * 440 * tt) + np.sin(2 * np.pi * 480 * tt)) * (np.sin(2 * np.pi * 20 * tt) > 0) * .4
for k in range(3):
    g(trill, A("s5:menelepon") + k * .75, .07)
g(M.lib("click"), A("s5:dibuka") - .1, .14)
n = int(.5 * SR); tt = np.arange(n) / SR
g(np.sin(2 * np.pi * np.cumsum(300 + 200 * tt + 30 * np.sin(2 * np.pi * 9 * tt)) / SR) * np.exp(-tt * 4) * .3, A("s5:dibuka"), .1)
for i, (t0, d) in enumerate(C["c2"]):
    if t0 > 0:
        g(clink(2100 + 1700 * fr(i * .618), .045 + .03 * fr(i * .29)), t0 + d, 1)
g(M.lib("impact-bass-1"), A("s5:meluap"), .14)
g(M.lib("sparkle"), A("s5:koin"), .07)
# s6 decision + factory
g(M.lib("whoosh-cinematic"), K["s6"] - .3, .13)
g(M.lib("chime"), A("s6:pikiran") - .2, .1)
g(M.lib("whoosh-short"), A("s6:menjual"), .1)
stampfx(A("s6:lain"), .2)
g(M.lib("whoosh-short"), A("s6:Mereka") - .2, .08)
tB = A("s6:memutuskan") - .2
g(M.lib("pop"), tB, .08)
for k in range(7):
    g(M.thump(.15), tB + k * .7 + .4, .12)
    g(M.lib("click-soft"), tB + k * .7 + .4, .08)
# s7 bank
g(M.lib("whoosh-cinematic"), K["s7"] - .3, .13)
stampfx(A("s7:menolak"))
g(M.lib("error"), A("s7:menolak") + .05, .07)
g(M.lib("pop"), A("s7:pinball"), .1)
g(M.thump(.2), A("s7:mafia"), .12)
g(M.lib("whoosh-short"), A("s7:Tapi"), .09)
stampfx(A("s7:kredit"))
g(M.lib("chime"), A("s7:kredit") + .1, .12)
g(M.lib("sparkle"), A("s7:November"), .09)
# s8 stacks: clink ladder rising with height, hero coin ring
g(M.lib("whoosh-cinematic"), K["s8"] - .3, .13)
for i, (ts, ds, c, h) in enumerate(C["st"]):
    if i % 2 == 0:
        g(clink(1700 * 2 ** (h / 48) * (1 + .04 * c), .035), ts + ds, 1)
hl = C["hero"] + .75
g(clink(1200, .2, .35), hl, 1); g(clink(1800, .1, .5), hl + .02, 1)
g(M.lib("sparkle"), hl + .05, .1)
g(M.lib("pop"), A("s8:Kalau"), .08)
g(M.lib("sparkle"), A("s8:AUDIRA"), .09)
g(M.lib("whoosh"), OUT - .35, .12)
g(M.thump(), OUT, .18)
g(clink(2600, .08, .4), OUT + .2, 1)
M.finish(music)
