"""EP02 sound: dusk on a voxel island. Playful plucked synth and a soft music box at 96 BPM, editor clicks while the pig is modelled,
a fuse hiss and a big boom at the explosion (music ducks), crackle and thunder for the lightning. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2209)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
pl, mb, ba, pad = M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 96
root = 220.0  # A3, mischievous minor with a lifted fourth chord
ch = [[0, 3, 7, 12], [5, 8, 12, 15], [-2, 2, 5, 10], [3, 7, 10, 14]]
pat = [0, 2, 1, 3, 2, 1, 3, 2]
melody = [12, None, 15, 14, None, 12, 10, None, 7, None, 10, 12, None, None, 15, None]


def box(f, dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6) + .2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 11)
    return x * np.minimum(1, t / .002) * np.exp(-t * 2.6)


t0, i = 0.0, 0
while t0 < END + 2.5:
    c = ch[(i // 8) % 4]
    M.lay(pl, M.note(root * 2 ** (c[pat[i % 8]] / 12), .5, "pluck", 6, .002), t0, .5 if i % 2 == 0 else .36)
    if i % 8 == 0:
        M.lay(ba, M.note(root / 2 * 2 ** (c[0] / 12), beat * 3.6, "tri", 1.2, .01), t0, .8)
        for k in c[:3]:
            M.lay(pad, M.note(root * 2 ** (k / 12), beat * 4.2, "sine", .4, .3), t0, .12)
    m = melody[i % 16]
    if m is not None and (i // 16) % 2 == 1:
        M.lay(mb, box(root * 2 * 2 ** ((m + c[0]) / 12)), t0, .22)
    t0 += beat / 2
    i += 1
tB = AT["s6:meledak"]
e = M.env([(0, .7), (K["s2"], .85), (AT["s6:Dia"], .55), (AT["s6:mendesis"], .25), (tB, 0), (tB + .1, 0), (tB + 2.5, .15), (AT["s6:Belakangan"], .7), (K["s7"], .9), (END + .4, 1), (DUR, .2)])
music = stereo(.42 * pl * e + .5 * ba * e + .3 * mb * e + .5 * pad * e, .12 * np.roll(pl + mb, 600) * e)


def click(t, a=.05, f=2600):
    g(M.band(M.burst(.02, 140, 1), 1500, 9000), t, a)
    g(M.note(f, .025, "sine", 90), t, a * .6)


def hiss(t, dur):
    x = M.band(M.burst(dur, 0, 1), 3000, 11000)
    n = len(x)
    ramp_ = np.linspace(.15, 1, n) ** 2
    trem = .7 + .3 * np.sin(2 * np.pi * np.linspace(6, 22, n) * np.arange(n) / SR)
    g(x * ramp_ * trem * np.minimum(1, (n - np.arange(n)) / 400), t, .07)


def boom(t):
    g(M.lib("impact-bass-1"), t, .5)
    g(M.thump(.9), t, .55)
    nz = M.burst(1.6, 2.8, 2)
    g(M.band(nz, 40, 1800), t, .5)
    g(M.band(M.burst(.5, 9, 1), 1500, 8000), t, .18)
    for k in range(18):  # debris clatter
        click(t + .55 + k * .07 + M.rng.random() * .05, .05, 900 + M.rng.random() * 600)


def crackle(t, dur=.5, a=.18):
    n = int(dur * SR)
    x = np.zeros(n)
    idx = M.rng.integers(0, n, 90)
    x[idx] = M.rng.standard_normal(90)
    x = np.convolve(x, np.exp(-np.arange(200) / 25), mode="same")
    g(M.band(x, 1200, 12000) * np.exp(-np.arange(n) / SR * 3), t, a)
    g(M.band(M.burst(2.2, 1.4, 4), 30, 260), t + .12, .35)  # thunder roll


# hook: low hiss rising into a flash
hiss(1.2, AT["s1:bug"] - 1.2)
g(M.lib("glitch-1"), AT["s1:bug"], .2)
g(M.thump(), AT["s1:bug"], .3)
for x in ("s2", "s3", "s4", "s5", "s7", "s8"):
    g(M.lib("whoosh-short"), K[x] - .14, .13)
g(M.lib("whoosh"), K["s6"] - .14, .1)
# editor clicks while the pig is modelled block by block
tb0, tb1 = AT["s2:Minecraft"] - .2, AT["s2:babi"] - .4
k = 0
while tb0 + k * .11 < tb1:
    click(tb0 + k * .11, .035, 2200 + (k % 5) * 180)
    k += 1
g(M.lib("pop"), AT["s2:babi"], .14)
# swap
g(M.lib("glitch-2"), AT["s3:menukar"], .22)
click(AT["s3:menukar"] + .35, .08); click(AT["s3:menukar"] + .7, .08)
g(M.lib("riser"), AT["s3:malah"] - .3, .12)
for j, f in enumerate([330, 392, 494, 587]):
    g(M.note(f, .2, "square", 14), AT["s3:malah"] + .2 + j * .3, .04)
g(M.lib("ping"), AT["s3:kode"], .14)
g(M.lib("chime"), AT["s4:aku"], .12)
g(M.lib("sparkle"), AT["s4:Nama"], .12)
# leaf tiles flutter onto the body
for j in range(26):
    click(AT["s5:hijau"] + j * .075, .03, 3200 + (j % 4) * 300)
g(M.lib("sparkle"), AT["s5:game"], .14)
g(M.lib("click"), AT["s5:AI"], .3)
g(M.thump(.2), AT["s5:AI"], .15)
g(M.note(110, .7, "saw", 3), AT["s5:agresif"], .06)
g(M.lib("chime"), AT["s5:bernama"], .13)
# attack: near-silent steps, fuse hiss, boom
for j in range(9):
    g(M.band(M.burst(.05, 60, 3), 120, 900), AT["s6:Creeper"] + .5 + j * .3, .05)
hiss(AT["s6:mendesis"], tB - AT["s6:mendesis"])
boom(tB)
g(M.lib("error"), AT["s6:terluka"], .12)
# lightning
crackle(AT["s6:Charged"] - .15)
crackle(AT["s6:tersambar"], .35, .12)
# icon shelf
for j, w in enumerate(("merchandise", "iklan")):
    g(M.lib("pop"), AT["s7:" + w], .14)
g(M.lib("sparkle"), AT["s7:lima"], .18)
g(M.thump(.25), AT["s7:lima"], .15)
g(M.lib("ping"), AT["s8:Kamu"], .12)
g(M.lib("sparkle"), OUT - .3, .14)
g(M.thump(), OUT, .22)
M.finish(music)
