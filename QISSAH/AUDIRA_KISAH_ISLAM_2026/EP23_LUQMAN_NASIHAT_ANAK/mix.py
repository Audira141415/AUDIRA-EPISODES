"""EP23 sound: maqam Rast on D (D E F+ G A B- C D, with the E and B a quarter tone flat). A warm plucked oud states
short calm phrases over a soft D/A drone, and a bendir frame drum (low doum, dry tek, no jingles) keeps an unhurried
76 bpm pulse in the gentle scenes (s1, s4, s6, s8). Foley is the notebook itself: graphite pencil scratch whenever the
pencil draws (keyed to the same word anchors the world uses), paper rustle on every page turn, a soft paper flap when a
sketch pops up, the eraser rub in s7, the book closing at the end. Birds chirp around the tree (s1, s8) and in the sky
of s5. Music dips for the voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(2323)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
ROOT = 50  # D3
RAST = [0, 2, 3.5, 5, 7, 9, 10.5]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
deg = lambda d: ROOT + 12 + RAST[d % 7] + 12 * (d // 7)
n = lambda d: np.arange(int(d * SR)) / SR
A = lambda k: AT[k]
FE = {s: K[s] - 0.3 + 0.5 for s in ["s2", "s3", "s4", "s5", "s6", "s7", "s8"]}
tC1 = A("s8:Kisah") - 0.05 + 1.35


def oud(f, dur=1.4):
    t = n(dur)
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0005 * h)) * np.exp(-t * (1.8 + 1.0 * h)) / h ** .85 for h in range(1, 10))
    pick = M.band(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 120) * .2
    return (x + pick) * np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .05)


# ---------- drone D2 + A2, breathing
drone = M.mono()
dt = n(10)
for t0 in np.arange(-2, DUR, 8.0):
    for nn, a in ((ROOT - 12, .5), (ROOT - 5, .24), (ROOT, .1)):
        f = hz(nn)
        x = (np.sin(2 * np.pi * f * dt) + .22 * np.sin(2 * np.pi * 2 * f * dt)) * np.sin(np.pi * dt / dt[-1]) ** 2
        M.lay(drone, x, max(0, t0), a)
drone *= M.env([(0, .5), (K["s3"], .7), (K["s5"], .8), (K["s7"], .6), (K["s8"], .7), (END, .6), (DUR - .4, 0), (DUR, 0)])

# ---------- oud phrases (Rast)
od = M.mono()


def phrase(t0, notes, amp=.3):
    t = t0
    for d, b in notes:
        M.lay(od, oud(hz(deg(d)), max(.7, b + .7)), t, amp)
        if b >= .9:
            M.lay(od, oud(hz(deg(d)), .7), t + b * .5, amp * .35)
        t += b


phrase(.2, [(0, .45), (1, .3), (2, .3), (3, .55), (4, 1.2)], .26)
phrase(A("s1:berharga") + .6, [(4, .3), (5, .3), (4, .3), (3, .3), (2, .9)], .24)
phrase(A("s1:bijak") - .3, [(2, .3), (1, .3), (0, 1.3)], .24)
phrase(K["s2"] + .9, [(0, .3), (2, .3), (4, .3), (5, .6), (4, 1.0)], .24)
phrase(A("s2:bersyukurlah"), [(4, .3), (5, .3), (6, .3), (7, 1.3)], .26)
phrase(K["s3"] + 1.0, [(7, .5), (6, .3), (5, .3), (4, 1.2)], .22)
phrase(A("s3:Wahai"), [(4, .45), (3, .3), (2, .3), (1, .3), (0, 1.4)], .22)
phrase(K["s4"] + 1.0, [(0, .3), (1, .3), (2, .6), (1, .3), (0, 1.1)], .22)
phrase(A("s4:Bersyukurlah"), [(2, .3), (3, .3), (4, .9), (2, .3), (4, 1.2)], .24)
phrase(K["s5"] + 1.0, [(4, .4), (3, .3), (2, .3), (3, .3), (4, 1.0)], .2)
phrase(A("s5:Allah"), [(4, .3), (5, .3), (6, .3), (7, 1.4)], .26)
phrase(K["s6"] + .7, [(0, .3), (2, .3), (3, .3), (4, .3), (5, .3), (4, .9)], .22)
phrase(K["s7"] + .8, [(4, .45), (2, .45), (0, 1.2)], .2)
phrase(A("s7:Sederhanakan"), [(0, .4), (1, .4), (2, .4), (3, .4), (4, 1.1)], .2)
phrase(K["s8"] + .6, [(4, .5), (5, .35), (4, .35), (2, .5), (0, 1.4)], .26)
phrase(A("s8:Kisah"), [(0, .4), (2, .4), (4, .4), (7, 1.8)], .24)

# ---------- bendir (frame drum)
drum = M.mono()
doum = lambda: np.sin(2 * np.pi * (70 * n(.5) + 28 * (1 - np.exp(-n(.5) * 26)) / 26)) * np.exp(-n(.5) * 8) + .15 * M.band(M.burst(.5, 18, 2), 60, 400)
tek = lambda: M.band(M.burst(.08, 70, 1), 900, 4500)
bt = 60 / 76
for a, b, amp in ((A("s1:berharga"), K["s2"] - .4, .8), (K["s4"] + .3, K["s5"] - .4, .7), (K["s6"] + .2, K["s7"] - .4, .9), (K["s8"] + .8, END, .65)):
    for i, x in enumerate(np.arange(a, b, bt / 2)):
        st = i % 8
        if st in (0, 3, 6):
            M.lay(drum, doum(), x, .3 * amp)
        elif st in (2, 5, 7):
            M.lay(drum, tek(), x, .1 * amp)

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drone * .45 + od + drum * .7) * fin
music = stereo(music_m, (.12 * od + .06 * drone) * fin)

# ---------- pencil scratch: graphite on paper while the pencil draws
W = [(.15, A("s1:berharga") - .3), (A("s1:berharga") + .2, A("s1:diabadikan") + 2.1), (A("s1:raja") - .25, A("s1:raja") + .6), (A("s1:panglima") - .25, A("s1:panglima") + .62),
     (FE["s2"], A("s2:hikmah") - .4), (A("s2:hikmah") - .1, A("s2:hikmah") + .25), (A("s2:hikmah#2") - .1, A("s2:hikmah#2") + 1.0), (A("s2:bersyukurlah") - .25, A("s2:bersyukurlah") + 1.45),
     (FE["s3"], A("s3:fondasi") - .25), (A("s3:fondasi") + .35, A("s3:Wahai") - .25), (A("s3:Wahai") - .15, A("s3:Wahai") + 1.1), (A("s3:Sesungguhnya") + .4, A("s3:kezaliman") + .9),
     (A("s4:Allah") + .1, A("s4:ibu") - .25), (A("s4:lemah") - .05, A("s4:lemah") + 1.2), (A("s4:menyapih") - .55, A("s4:menyapih") + .1), (A("s4:dua") - .4, A("s4:dua") + .7), (A("s4:Bersyukurlah") - .1, A("s4:kedua") - .2),
     (FE["s5"], A("s5:luput") - .45), (A("s5:Wahai") - .35, A("s5:Wahai") + .55), (A("s5:Wahai") + 1.25, A("s5:biji") + .65), (A("s5:batu") - .05, A("s5:batu") + .2), (A("s5:langit") - .05, A("s5:langit") + .2), (A("s5:bumi") - .05, A("s5:bumi") + .2), (A("s5:mendatangkannya") - .1, A("s5:mendatangkannya") + .6),
     (FE["s6"], A("s6:ajak") + .5), (A("s6:ajak") + .55, A("s6:cegah") - .1), (A("s6:cegah") - .05, A("s6:bersabarlah") - .2), (A("s6:bersabarlah") - .05, A("s6:bersabarlah") + 1.0), (A("s6:Semua") - .1, A("s6:Semua") + .9), (A("s6:penting") - .3, A("s6:penting") + .2),
     (FE["s7"], FE["s7"] + .45), (FE["s7"] + .5, A("s7:sombong") - .3), (A("s7:sombong") + .1, A("s7:angkuh") - .05), (A("s7:Sederhanakan") + .5, A("s7:lunakkan") - .15), (A("s7:lunakkan") - .05, A("s7:lunakkan") + .35), (A("s7:lunakkan") + .5, A("s7:lunakkan") + 1.1), (A("s7:lunakkan") + 1.2, A("s7:keledai") - .85), (A("s7:keledai") + .05, A("s7:keledai") + .55),
     (FE["s8"], A("s8:tauhid") + 1.15), (A("s8:tauhid") + 2.0, A("s8:Nasihat") + 1.2)]
gate = np.zeros(N)
for a, b in W:
    i0, i1 = int(max(0, a) * SR), int(min(DUR, b) * SR)
    if i1 > i0:
        gate[i0:i1] = 1
gate = np.convolve(gate, np.ones(int(.03 * SR)) / int(.03 * SR), mode="same")
sc = M.band(rng.standard_normal(N), 2200, 9000)
sc /= np.abs(sc).max()
# stroke rhythm: short strokes at 5-11 Hz with grainy pressure changes
rate = 7 + 3 * np.sin(2 * np.pi * .23 * T) + 1.5 * np.sin(2 * np.pi * .71 * T + 1)
ph = 2 * np.pi * np.cumsum(rate) / SR
press = (.35 + .65 * np.abs(np.sin(ph)) ** 1.5) * (1 + .4 * M.band(rng.standard_normal(N), 20, 80) / .05).clip(.3, 1.8)
body = M.band(rng.standard_normal(N), 500, 1800)
body /= np.abs(body).max()
scratch = (sc * .8 + body * .25) * press * gate
M.fx += np.stack([scratch * .05, np.roll(scratch, 400) * .045], 1)

# ---------- page turns: paper rustle with a swish peak
def rustle(dur=1.0):
    t = n(dur)
    x = M.band(rng.standard_normal(len(t)), 700, 9000) * (1 + 1.5 * M.band(rng.standard_normal(len(t)), 15, 60) / .03).clip(0, 3)
    env = np.exp(-((t - dur * .45) / (dur * .22)) ** 2) + .3 * np.exp(-t * 18)
    return x / np.abs(x).max() * env


for s in ["s2", "s3", "s4", "s5", "s6", "s7", "s8"]:
    g(rustle(.6), K[s] - .32, .1)
    g(M.band(M.burst(.25, 20, 2), 120, 900), K[s] + .5, .05)

# ---------- pop-up flaps (a sketch stands up off the page)
def flap():
    x = M.band(M.burst(.18, 30, 2), 200, 2500)
    c = M.band(M.burst(.05, 90, 1), 2000, 6000)
    x[:len(c)] += .4 * c
    return x
for k in ["s1:berharga", "s2:hikmah", "s3:fondasi", "s4:ibu", "s4:kedua", "s5:luput", "s7:sombong"]:
    g(flap(), A(k) - .2, .06)
for t0 in [A("s1:diabadikan") + 2.2, A("s3:Wahai") + 1.2, A("s4:menyapih") + .15, A("s5:Wahai") + .6, A("s7:lunakkan") - .45, A("s7:keledai") - .75, A("s8:tauhid") + 1.25]:
    g(flap(), t0, .06)

# strike-throughs (crown, helmet), the crack, the emphasis ticks: firmer pencil slashes
slash = lambda: M.band(M.burst(.16, 22, 1), 1500, 8000)
for t0 in [A("s1:raja") + .38, A("s1:raja") + .5, A("s1:panglima") + .38, A("s1:panglima") + .5, A("s6:penting") - .3, A("s6:penting") - .05]:
    g(slash(), t0, .08)
g(M.band(M.burst(.6, 6, 2), 60, 900), A("s3:kezaliman"), .08)
g(M.thump(.5), A("s3:kezaliman") + .02, .07)

# ---------- eraser rub (s7)
e0, e1 = A("s7:angkuh") + .1, A("s7:Sederhanakan") + .5
er = M.band(rng.standard_normal(int((e1 - e0) * SR)), 350, 3000) * (.4 + .6 * np.abs(np.sin(2 * np.pi * 4.1 * n(e1 - e0)))) * np.sin(np.pi * n(e1 - e0) / (e1 - e0)) ** .5
g(er / np.abs(er).max(), e0, .07)

# ---------- watercolour gold seeds (s5) and the lamp lit (s2)
for k in ["s5:batu", "s5:langit", "s5:bumi"]:
    g(M.lib("sparkle"), A(k), .025)
g(M.lib("chime"), A("s2:hikmah"), .025)
g(M.band(M.burst(.5, 8, 2), 400, 3000), A("s2:hikmah") - .05, .03)

# ---------- birds around the tree and in the sky
def chirp(f0=3200):
    t = n(.12)
    f = f0 * (1 + .35 * np.sin(np.pi * t / .12)) * (1 - .2 * t / .12)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .12) ** 2


for a, b, cnt in [(A("s1:berharga") + 1, K["s1e"] - .5, 10), (A("s5:luput"), A("s5:Wahai"), 3), (A("s8:tauhid") + 2.2, A("s8:Kisah") - .8, 7)]:
    for x in rng.uniform(a, b, cnt):
        f0 = rng.uniform(2600, 4200)
        for j in range(int(rng.integers(2, 5))):
            g(chirp(f0 * rng.uniform(.95, 1.08)), x + j * rng.uniform(.09, .15), rng.uniform(.008, .016))

# donkey: a soft, low two-tone reed figure (no braying imitation), then the voice is softened in s7
def reed(f, dur):
    t = n(dur)
    x = np.sign(np.sin(2 * np.pi * f * t)) * .5 + np.sin(2 * np.pi * f * t)
    return M.band(x, 100, 1500) * np.sin(np.pi * t / dur) ** 2


g(reed(196, .32), A("s7:keledai") + .05, .02)
g(reed(165, .4), A("s7:keledai") + .4, .018)

# ---------- room tone: quiet desk ambience
room = M.band(rng.standard_normal(N), 80, 500)
room /= np.abs(room).max()
M.fx += np.stack([room * .008, np.roll(room, 2000) * .008], 1)

# ---------- the notebook closes, AUDIRA, outro
g(rustle(.8), A("s8:Kisah") - .05, .07)
g(M.thump(.45), tC1 - .05, .16)
g(M.band(M.burst(.4, 14, 2), 80, 1200), tC1 - .05, .08)
g(M.lib("chime"), A("s8:AUDIRA"), .03)
g(rustle(.7), OUT - .3, .06)
g(M.lib("chime"), OUT + .3, .04)
M.finish(music)
print("duration", DUR)
