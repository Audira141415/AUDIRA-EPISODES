"""EP05 sound: an original folk-dance tune in D harmonic minor (128 BPM, oom-pah bass, square-wave lead, balalaika-style
tremolo plucks). Not based on any existing Tetris melody. SFX: terminal clicks, block landings, line-clear chimes,
the ELORG stamp and 1996 coins. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(505)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 128
D5 = 587.33
st = lambda s, base=D5: base * 2 ** (s / 12)

lead, trem, bass, stab, kick, hat = (M.mono() for _ in range(6))
A_ = [(-5, 1), (0, 1), (3, 1), (2, .5), (0, .5), (-2, 1), (-4, 1), (-5, 2), (-2, 1), (0, .5), (2, .5), (3, 1), (5, 1), (7, 1.5), (5, .5), (3, 1), (2, 1)]
B_ = [(3, 1), (2, .5), (3, .5), (5, 1), (3, 1), (2, 1), (0, 1), (-2, 2), (0, 1), (-2, .5), (-4, .5), (-5, 1), (-4, 1), (-2, 1), (-1, 1), (0, 2)]
CH_A = [[0, 3, 7], [3, 7, 10], [-7, -4, 0], [-5, -1, 2]]
CH_B = [[-4, 0, 3], [-2, 2, 5], [-7, -4, 0], [-5, -1, 2]]
t0, ph = 0.0, 0
while t0 < END + 3:
    mel, ch = (A_, CH_A) if ph % 2 == 0 else (B_, CH_B)
    tt = t0
    for s, d in mel:
        dur = d * beat
        M.lay(lead, M.note(st(s), dur * .92, "square", 2.2, .004), tt, .16)
        k = 0
        while k * beat / 4 < dur * .9:
            M.lay(trem, M.note(st(s - 12), beat / 4, "pluck", 9, .002), tt + k * beat / 4, .32)
            k += 1
        tt += dur
    for bar in range(4):
        c = ch[bar]
        for b in range(4):
            tb = t0 + (bar * 4 + b) * beat
            if b % 2 == 0:
                root = c[0] if b == 0 else c[2] - 12
                M.lay(bass, M.note(st(root - 24), beat * .8, "tri", 3, .004), tb, .9)
                M.lay(kick, M.thump(.22), tb, .5)
            else:
                for n in c:
                    M.lay(stab, M.note(st(n - 12), beat * .35, "square", 9, .003), tb, .09)
            M.lay(hat, M.band(M.burst(.05, 70, 1), 5000, 12000), tb + beat / 2, .18)
    t0 += 16 * beat
    ph += 1

E = M.env
e_lead = E([(0, .9), (K["s2"], .55), (K["s4"], .8), (K["s6"], .5), (AT["s7:1996"], 1), (K["s8"], .85), (END + .4, .8), (DUR, 0)])
e_trem = E([(0, .7), (K["s2"], 0), (K["s4"], .6), (K["s6"], .25), (AT["s7:1996"], .9), (K["s8"], .8), (END + .4, .7), (DUR, 0)])
e_beat = E([(0, 1), (K["s2"], .6), (K["s4"], .9), (K["s6"], .55), (AT["s7:1996"], 1), (K["s8"], .9), (END + .4, .8), (DUR, 0)])
music = stereo(.5 * lead * e_lead + .8 * bass * e_beat + .4 * stab * e_beat + .5 * kick * e_beat + .3 * hat * e_beat,
               .35 * np.roll(trem, 300) * e_trem + .1 * np.roll(lead, 700) * e_lead)


def click(t, a=.06, lo=2200, hi=7000):
    g(M.band(M.burst(.025, 140, 1), lo, hi), t, a)


def land(t, a=.12):
    click(t, a * .6, 1500, 6000)
    g(M.thump(.18), t, a)


def bell(t, f, a=.06, dec=5):
    x = M.note(f, .5, "sine", dec, .002)
    y = M.note(f * 2.76, .3, "sine", dec * 2, .002)
    x[:len(y)] += .4 * y
    g(x, t, a)


# s1: blocks landing on the wall
for p in K["P"]:
    if 0 <= p["t"] < K["s2"]:
        land(p["t"])
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[x] - .16, .13)
# s2/s3: terminal
g(M.lib("typing"), AT["s2:membuat"], .14)
g(M.lib("typing"), AT["s2:Elektronika"], .12)
n = 0
while K["s2"] + n * .34 < K["s3e"]:
    tt = K["s2"] + n * .34
    if tt > K["s3"] - .2:
        click(tt, .07, 1200, 4000)
    n += 1
g(M.lib("glitch-1"), AT["s3:grafis"], .07)
# s4: pentominoes in, one square drops off each, seven tetrominoes pop in, the ball bounces
for k in range(12):
    click(AT["s4:pentomino"] - .2 + k * .07 + .1, .05)
for k in range(12):
    tt = AT["s4:menyederhanakannya"] + k * .05
    g(M.note(900 - k * 30, .12, "square", 20), tt, .025)
for k in range(7):
    g(M.note(st(k * 2 - 5, 880), .2, "pluck", 6), AT["s4:tujuh"] + .15 + k * .12 + .15, .09)
tb = AT["s4:tenis"] - .15
k = 1
while tb + k * .5 < K["s5"]:
    pk = M.note(520, .07, "sine", 60); pk[:1764] += .5 * M.band(M.burst(.04, 120, 1), 800, 4000)
    g(pk, tb + k * .5, .12 * max(.35, 1 - k * .12))
    k += 1
# s5: colour
g(M.lib("sparkle"), AT["s5:berwarna"], .14)
for k, s in enumerate([0, 3, 7, 12]):
    bell(AT["s5:berwarna"] + .05 + k * .07, st(s), .04)
# s6: flights, the stamp, no royalty
for f in range(8):
    g(M.lib("whoosh-short"), AT["s6:menyebar"] - .4 + f * .42, .035)
st_t = AT["s6:ELORG"]
g(M.thump(.4), st_t, .32)
g(M.band(M.burst(.12, 30, 2), 150, 2500), st_t, .22)
g(M.lib("impact-bass-1"), st_t, .1)
g(M.lib("error"), AT["s6:royalti"] + .1, .08)
# s7: copies, 1996, coins
for k in range(18):
    click(AT["s7:Game"] + k * .06 + .25, .035)
g(M.lib("impact-bass-1"), AT["s7:juta"], .14)
g(M.lib("chime"), AT["s7:1996"], .16)
for i in range(20):
    tt = AT["s7:akhirnya"] + i * .09 + .45
    bell(tt, [1568, 1760, 2093][i % 3], .045, 7)
# s8: line clears, last piece
for q, key in enumerate(("s8:Jadi", "s8:jutaan", "s8:ketagihan", "s8:lama")):
    tc = AT[key] + (.25 if q == 0 else 0)
    for k in range(4):
        bell(tc + k * .055, st(k * 4 + q * 2), .05, 6)
    g(M.band(M.burst(.3, 10, 3), 2000, 9000), tc + .1, .03)
    land(tc + .38, .07)
land(AT["s8:Kamu"] + .2, .12)
g(M.lib("sparkle"), OUT - .3, .12)
g(M.thump(), OUT, .2)
M.finish(music)
