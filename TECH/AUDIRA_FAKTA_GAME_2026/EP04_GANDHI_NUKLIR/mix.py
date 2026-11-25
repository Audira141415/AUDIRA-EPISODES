"""EP04 sound: a wry chamber-pizzicato bed (plucked strings, bassoon-ish staccato bass, woodblock) at 100 BPM over a paper board,
with paper rustles, a typewriter tick for code, a cartoon rocket that fizzles, and a gentle gong on the plot twist. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4404)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}

# ---- music: sneaky pizzicato in D minor, a little mischievous ----
pz, bs, wb, hi = M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 100
root = 293.66  # D4
prog = [[0, 3, 7, 10], [5, 8, 12, 15], [-2, 2, 5, 9], [-5, -1, 2, 7]]  # Dm7, Gm7, C, A7-ish
mel = [0, None, 2, 1, None, 3, 2, None, 1, 0, None, 2, 3, None, 1, None]
t0, i = 0.0, 0
while t0 < END + 3:
    bar = (i // 16) % 4
    c = prog[bar]
    k = mel[i % 16]
    if k is not None:
        f = root * 2 ** (c[k] / 12)
        M.lay(pz, M.note(f, .32, "pluck", 9, .0015), t0, .55 if i % 4 == 0 else .4)
    if i % 4 == 0:
        M.lay(bs, M.note(root / 4 * 2 ** (c[0] / 12), beat * .45, "saw", 7, .01), t0, .5)
    if i % 8 == 6:
        M.lay(bs, M.note(root / 4 * 2 ** ((c[0] + 7) / 12), beat * .35, "saw", 8, .01), t0, .35)
    if i % 4 == 2:
        wbk = M.note(1250, .06, "sine", 55) + .4 * M.note(1890, .06, "sine", 70)
        M.lay(wb, wbk, t0, .3)
    if i % 2 == 1:
        M.lay(hi, M.band(M.burst(.04, 120, 1), 5000, 12000), t0, .06)
    t0 += beat / 4
    i += 1
# soften the saw bass into something reedy
bs = M.band(bs, 40, 1400)
# plot twist: music thins out, then returns
e = M.env([(0, .8), (K["s2"], .9), (K["s3"], 1), (K["s4"], .85), (K["s7"] - .1, .9), (K["s7"] + .05, .15), (K["s7"] + 2.6, .9),
           (K["s8"], 1), (END + .4, 1), (DUR, .15)])
music = stereo(.5 * pz * e + .6 * bs * e + .3 * wb * e + .25 * hi * e, .12 * np.roll(pz, 700) * e)


# ---- sound design ----
def rustle(t, dur=.45, a=.12):
    """Paper rustle: dense crinkle clicks in a band."""
    n = int(dur * SR)
    x = np.zeros(n)
    for _ in range(int(dur * 140)):
        j = int(M.rng.random() * (n - 300))
        x[j:j + 200] += M.rng.standard_normal(200) * np.exp(-np.arange(200) / 40) * M.rng.random()
    x = M.band(x, 1500, 9000)
    env = np.sin(np.linspace(0, np.pi, n)) ** .7
    g(x * env, t, a)


def fold(t, a=.14):
    rustle(t, .3, a)
    g(M.band(M.burst(.06, 60, 3), 300, 2500), t + .26, a * 1.4)


def tick(t, a=.07):
    """Typewriter-ish key."""
    g(M.band(M.burst(.025, 160, 1), 1500, 7000), t, a)
    g(M.note(2200, .02, "sine", 120), t, a * .4)


def typing(t, n, span, a=.06):
    for k in range(n):
        tick(t + span * k / n + M.rng.random() * .02, a)


def ding(t, a=.08):
    g(M.note(2637, .9, "sine", 4) + .3 * M.note(3951, .9, "sine", 6), t, a)


def stamp(t, a=.3):
    g(M.thump(.25), t, a)
    g(M.band(M.burst(.08, 50, 2), 200, 3000), t, a * .7)


def rocket_up(t, dur=2.6, a=.12):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 180 + 520 * (tt / dur) ** 1.4
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .35 + M.band(M.rng.standard_normal(n), 400, 3500) * .6
    g(x * np.minimum(1, tt / .3) * np.minimum(1, (dur - tt) / .05), t, a)


def fizzle(t, a=.12):
    dur = .9
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 700 * np.exp(-tt * 3.2) + 90
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3)
    g(x, t, a)
    g(M.band(M.burst(.5, 7, 1), 800, 5000), t + .05, a * .6)


def gong(t, a=.22):
    dur = 5.0
    tt = np.arange(int(dur * SR)) / SR
    parts = [(98, 1, 0.6), (196.5, .6, .9), (263, .45, 1.2), (331, .35, 1.6), (467, .25, 2.2), (588, .18, 3.0)]
    x = sum(am * np.sin(2 * np.pi * f * tt * (1 + .004 * np.exp(-tt * 2))) * np.exp(-tt * d) for f, am, d in parts)
    x *= np.minimum(1, tt / .015)
    g(x / 2.4, t, a)


def boing(t, a=.08):
    tt = np.arange(int(.35 * SR)) / SR
    f = 300 + 200 * np.sin(tt * 40) * np.exp(-tt * 6)
    g(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 8), t, a)


# s1: rocket climbs, freezes on "mitos"
rocket_up(.25, AT["s1:mitos"] - .3, .1)
fizzle(AT["s1:mitos"] - .05, .12)
stamp(AT["s1:mitos"], .32)
# panel folds on every scene change
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    fold(K[x] - .16)
# s2
g(M.lib("pop"), AT["s2:satu"], .12)
rustle(AT["s2:demokrasi"] - .25, .45, .14)
tick(AT["s2:minus"]); ding(AT["s2:minus"] + .25, .06)
# s3: register ripples, bar shoots, story rockets
for k in range(8):
    tick(AT["s3:minus#2"] + .12 + k * .085, .06)
ding(AT["s3:meluap"] + .3, .08)
g(M.lib("riser"), AT["s3:Gandhi"] - .3, .12)
g(M.lib("impact-bass-1"), AT["s3:Gandhi"] + .9, .2)
for k in range(3):
    boing(AT["s3:Gandhi"] + .6 + k * .08, .05)
rocket_up(AT["s3:menembakkan"], 1.6, .1)
fizzle(K["s4"] + .3, .1)
# s4: leaflets multiply
for k in range(7):
    rustle(AT["s4:menyebar"] + k * .45, .35, .09)
typing(AT["s4:wiki"], 10, .7, .05)
stamp(AT["s4:bukti"], .28)
# s5
fold(AT["s5:Brian"] - .2, .12)
for k in range(9):
    g(M.note(520, .05, "sine", 60), AT["s5:tiga"] + k * .03, .05)
g(M.lib("click"), AT["s5:tiga"] + .3, .1)
g(M.lib("chime"), AT["s5:sepertiga"], .12)
typing(AT["s5:variabel"], 12, .8, .055)
# s6: book opens, code types, X lands
rustle(AT["s6:memoarnya"] - .3, .9, .16)
typing(AT["s6:bahasa"], 12, .9, .055)
ding(AT["s6:tetap"], .06)
g(M.lib("error"), AT["s6:tidak"], .08)
stamp(AT["s6:tidak"], .18)
# s7: plot twist
gong(K["s7"] - .02, .26)
typing(AT["s7:dua"] - .3, 8, .5, .055)
rocket_up(AT["s7:membangun"], .9, .07)
fizzle(AT["s7:memakai"] + .2, .14)
g(M.lib("sparkle"), AT["s7:lelucon"], .14)
for k in range(4):
    boing(AT["s7:lelucon"] + .1 + k * .14, .04)
# s8
stamp(AT["s8:bukan"], .3)
g(M.lib("pop"), AT["s8:Kamu"], .1)
fold(OUT - .3, .14)
g(M.lib("chime"), OUT + .2, .1)
M.finish(music)
