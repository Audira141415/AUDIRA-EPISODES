"""EP05 sound: arcade chiptune at 150 BPM (square arps, triangle bass, noise hats) in a night arcade.
SFX are coin clinks, ticket-feed rattles and a shutter clatter on TUTUP. Run from this folder."""
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

# ---------- music ----------
beat = 60 / 150
s16 = beat / 4
ch = [[0, 3, 7, 12], [-4, 0, 3, 8], [3, 7, 10, 15], [-2, 2, 5, 10]]  # Am F C G (semitones from A)
ch_end = [[3, 7, 10, 15], [-2, 2, 5, 10], [0, 3, 7, 12], [-4, 0, 3, 8]]  # C G Am F, brighter turn for s8
A = 440.0
arp, bas, hat, lead = M.mono(), M.mono(), M.mono(), M.mono()
order = [0, 1, 2, 3, 2, 1, 0, 1]
mel = [12, None, 15, 12, 10, None, 7, None, 8, None, 7, 3, 5, None, 7, None]
i = 0
t0 = 0.0
while t0 < DUR:
    bar = int(t0 / (beat * 4))
    prog = ch_end if t0 >= K["s8"] else ch
    c = prog[bar % 4]
    calm = K["s5"] <= t0 < K["s6"] - 0.2
    # arps: 16ths, calmer 8ths during the announcement
    if not calm or i % 2 == 0:
        f = A * 2 ** ((c[order[i % 8]] + 12) / 12)
        M.lay(arp, M.note(f, s16 * 0.9, "square", 9, .002), t0, .5)
    if i % 2 == 0:
        M.lay(bas, M.note(A / 4 * 2 ** (c[0] / 12), s16 * 1.8, "tri", 3, .003), t0, 1.0)
    if i % 4 == 2 and not calm:
        M.lay(hat, M.band(M.burst(.04, 90, 1), 6000, 14000), t0, .5)
    if i % 8 == 4 and not calm:
        M.lay(hat, M.band(M.burst(.09, 35, 1), 1500, 6000), t0, .45)
    # simple lead line from the hook and the finale
    if (t0 < K["s2"] or t0 >= K["s8"]) and i % 2 == 0:
        n = mel[(i // 2) % 16]
        if n is not None:
            M.lay(lead, M.note(A * 2 ** ((n + c[0] % 12) / 12), s16 * 1.7, "square", 4, .004), t0, .35)
    t0 += s16
    i += 1
e = M.env([(0, .9), (K["s2"], .8), (K["s3"], .85), (K["s5"], .6), (K["s6"], .85), (K["s7"], .75), (K["s8"], 1), (END + .5, 1), (DUR, .15)])
mono = .2 * arp + .55 * bas + .22 * hat + .16 * lead
music = stereo(mono * e, .07 * np.roll(arp, 700) * e)

# ---------- sfx ----------
def clink(t, a=.08, f=2600):
    x = M.tone([f, f * 1.51, f * 2.27], .25, 22)
    g(x, t, a)
    g(M.tone([f * 1.12, f * 1.7], .18, 30), t + .045, a * .6)


def tick(t, a=.05):
    g(M.band(M.burst(.012, 300, 1), 2000, 9000), t, a)


def feed(t, dur, rate=22, a=.045):
    k = 0
    while k / rate < dur:
        tick(t + k / rate, a * (0.8 + .4 * ((k * 7) % 3) / 2))
        k += 1


def blip(t, f0, f1, dur=.12, a=.05):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = np.linspace(f0, f1, n)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .5 * np.minimum(1, (dur - tt) / .01)
    g(x, t, a)


def shutter(t, a=.09):
    k, dt, tt = 0, .028, t
    while tt < t + .5:
        g(M.band(M.burst(.03, 120, 2), 400, 5000), tt, a * (1 - (tt - t) * 1.2))
        tt += dt
        dt *= 1.04
        k += 1
    g(M.thump(.35), t + .5, .3)
    g(M.band(M.burst(.12, 30, 3), 200, 3000), t + .5, .12)


S = lambda x: K[x]
# s1 hook: strip feed + coin stacks
feed(0.15, 5.2, 18, .04)
for k in range(14):
    blip(0.5 + k * 0.42 + .55, 900, 1400, .06, .025)
clink(AT["s1:gratis"] - .1, .08)
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), S(x) - .2, .14)
# s2
g(M.lib("pop"), AT["s2:Tickets"] - .25, .14); feed(AT["s2:Tickets"] - .1, .5, 24, .04)
g(M.lib("pop"), AT["s2:Robux"] - .25, .14); clink(AT["s2:Robux"], .08, 2400)
for w in ("David", "Erik", "John", "Matt"):
    g(M.thump(.18), AT["s2:" + w] - .1, .12); blip(AT["s2:" + w] - .1, 600, 900, .07, .03)
# s3: vault wheel, building ticks, coin flood
g(M.lib("click"), AT["s3:dibeli"] - .2, .12); g(M.lib("whoosh"), AT["s3:dibeli"] - .4, .07)
for k in range(3):
    clink(AT["s3:dibeli"] + .95 + k * .25, .06, 2500 + k * 120)
tb, te = AT["s3:Tix"] + .1, AT["s3:tanpa"]
for k in range(12):
    tk = tb + k * (te - tb) / 12
    g(M.lib("click-soft"), tk + .2, .12); blip(tk + .5, 1000, 1600, .05, .02)
g(M.lib("impact-bass-1"), AT["s3:dibagi"] - .1, .16)
for k in range(40):
    clink(AT["s3:dibagi"] + .5 + k * .06 + (k % 3) * .013, .028, 2200 + (k * 137) % 900)
for k in range(10):
    blip(AT["s3:nilainya"] + k * .17, 700 - k * 40, 600 - k * 45, .14, .03)
g(M.lib("error"), AT["s3:inflasi"], .1)
# s4: daily login, visits, exchange
for k in range(7):
    tt = AT["s4:Tix"] - .15 + k * .27
    blip(tt, 880 * 2 ** (k / 12 * 2), 1320 * 2 ** (k / 12 * 2), .07, .03); feed(tt + .05, .12, 40, .03)
tv0 = AT["s4:Developer"] + .55
for k in range(5):
    g(M.lib("ping"), tv0 + k * .62, .06); feed(tv0 + k * .62 + .1, .15, 40, .03)
feed(AT["s4:menukar"] - .1, .6, 30, .04)
g(M.lib("click"), AT["s4:menukar"] + .35, .1)
clink(AT["s4:Robux"], .1, 2700)
g(M.lib("sparkle"), AT["s4:Robux"] + .1, .1)
# s5: announcement
g(M.lib("chime"), AT["s5:Maret"] - .3, .14)
for k in range(2):
    g(M.lib("click"), AT["s5:tiga"] + k * .12, .1)
g(M.lib("impact-bass-1"), AT["s5:dihentikan"], .2)
g(M.lib("riser"), AT["s5:terbesar"] - 1.6, .07)
g(M.thump(.4), AT["s5:terbesar"], .28)
# s6: reasons
for k in range(3):
    blip(AT["s6:membingungkan"] + k * .3, 500, 900 - k * 150, .12, .03)
for k in range(5):
    g(M.lib("glitch-" + str(k % 3 + 1)), AT["s6:akun"] - .5 + k * .28, .05)
g(M.lib("error"), AT["s6:absen"] - .05, .12); g(M.thump(.2), AT["s6:absen"], .18)
# s7: spending, shutter
sp0 = AT["s7:Pemain"] + .1
for j in range(3):
    for k in range(6):
        tick(sp0 + j * .35 + k * .4 + .45, .05)
for i2 in range(3):
    g(M.lib("pop"), sp0 + 1.4 + i2 * .75, .12)
    blip(sp0 + 1.95 + i2 * .75, 1200, 1800, .08, .03)
shutter(AT["s7:ditutup"])
# s8: tickets blow away, coin stays
g(M.lib("whoosh-cinematic"), AT["s8:Robux"] - .3, .12)
clink(AT["s8:jadi"], .1, 2600)
g(M.lib("sparkle"), AT["s8:Kalau"], .12)
g(M.lib("chime"), OUT - .1, .12)
for k, f in enumerate([523, 659, 784, 1047]):
    blip(OUT + .1 + k * .1, f, f, .1, .04)
M.finish(music)
