"""EP01 sound: maqam Bayati on D, slow (60 bpm). A plucked oud-like voice (doubled courses, risha tremolo on long notes)
over a low D/A drone that breathes. Ambience: cave drips and wind through the mouth, a soft day/night tone.
Paper foley on every fold, coin clink for the silver coin, page flicks for the 1-300-309 counter. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(18)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]

D3 = 146.83
# Bayati on D: D, E half-flat, F, G, A, Bb, C, D (semitone steps, 1.5 = three-quarter tone)
STEPS = [0, 1.5, 3, 5, 7, 8, 10, 12, 13.5, 15, 17]
fq = lambda deg, octv=0: D3 * 2 ** ((STEPS[deg] + 12 * octv) / 12)


def oud(f, dur, amp=1.0):
    """Two slightly detuned courses, fast-decaying upper partials, a body resonance."""
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for det in (0.0, 1.6):
        ff = f + det
        x += sum(np.sin(2 * np.pi * ff * h * t + h) * np.exp(-t * (2.2 + 1.4 * h)) / h ** 0.9 for h in range(1, 8))
    x += 0.25 * np.sin(2 * np.pi * 110 * t) * np.exp(-t * 9)
    x *= np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .03)
    return amp * x / 2.5


def tremolo(f, dur, rate=11, amp=.6):
    """Risha tremolo: rapid re-plucks on one pitch."""
    out = np.zeros(int(dur * SR))
    for k, x in enumerate(np.arange(0, dur - .05, 1 / rate)):
        s = oud(f, min(.4, dur - x), amp * (.75 + .25 * (k % 2)))
        i = int(x * SR)
        out[i:i + len(s)] += s[: len(out) - i]
    return out * np.minimum(1, np.linspace(0, 6, len(out)))


lead, drone = M.mono(), M.mono()
beat = 1.0
# phrases: (degree, beats); the melody stays around the lower tetrachord and resolves on D
PHR = [
    [(0, 1), (1, 1), (2, 2), (1, 1), (0, 3)],
    [(2, 1), (3, 1), (4, 2), (3, .5), (2, .5), (1, 1), (2, 2)],
    [(4, 1), (5, 1), (4, 1), (3, 1), (2, 1), (1, 1), (0, 2)],
    [(0, .5), (1, .5), (2, 1), (3, 1), (2, 1), (1, 2), (0, 2)],
]
t = 0.6
pi = 0
while t < END + 1:
    for deg, bl in PHR[pi % 4]:
        d = bl * beat
        if bl >= 2:
            M.lay(lead, tremolo(fq(deg), d * .95), t, .33)
        else:
            M.lay(lead, oud(fq(deg), d * 1.6), t, .5)
        t += d
    t += 2 * beat   # breathing space between phrases
    pi += 1
# drone: D2 + A2 + soft D3, slow swell
dr = sum(np.sin(2 * np.pi * f * T + i) * a for i, (f, a) in enumerate([(D3 / 2, 1), (D3 * .75, .55), (D3, .3), (D3 / 2 * 1.003, .6)]))
drone = dr * (0.7 + 0.3 * np.sin(2 * np.pi * T / 9.0))
# a low frame-drum pulse (bendir-like) only in the signature sun arc and the 309 reveal
bend = M.mono()
for a, b in ((K["s4"], K["s4e"]), (AT["s6:tiga"] - 1, K["s6e"])):
    for x in np.arange(a, b, 2 * beat):
        M.lay(bend, M.thump(.5), x, .35)
        M.lay(bend, M.thump(.3), x + beat * 1.5, .18)
fin = M.env([(0, 0), (1.2, 1), (END + .4, 1), (DUR - .2, 0), (DUR, 0)])
music_m = (lead + .55 * drone + bend) * fin
music = stereo(music_m, .18 * lead * fin)

# ---------- ambience: wind at the cave mouth, drips inside
wind = M.band(rng.standard_normal(N), 180, 900)
wind *= (0.6 + 0.4 * np.sin(2 * np.pi * T / 7.3) * np.sin(2 * np.pi * T / 3.1 + 1))
wind /= np.abs(wind).max()
cave = M.env([(0, 1), (K["s2"] - .5, 1), (K["s2"], .35), (K["s3"], .35), (K["s3"] + 1, 1), (K["s6"], 1), (K["s6"] + 1, .5), (K["s7"], 1), (DUR - .3, 0), (DUR, 0)])
M.fx += np.stack([wind * cave * .03, np.roll(wind, 1500) * cave * .03], 1)


def drip(x, a=.05):
    n = int(.35 * SR)
    tt = np.arange(n) / SR
    f = 1400 * np.exp(-tt * 9) + 700
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 18)
    g(s, x, a)
    g(s * .3, x + .11, a)   # echo off the cave wall


for x in np.sort(rng.uniform(0, DUR - 1, 46)):
    if x < K["s2"] - .5 or K["s3"] + 1 < x:
        drip(x, .03 + .03 * rng.random())

# city murmur in s2 (low, no words)
mur = M.band(rng.standard_normal(N), 250, 1300) * (1 + .5 * np.sin(2 * np.pi * .6 * T))
mur /= np.abs(mur).max()
me = M.env([(0, 0), (K["s2"], 0), (K["s2"] + 1, 1), (K["s3"] - .5, .4), (K["s3"] + .5, 0), (AT["s5:kota"], 0), (AT["s5:kota"] + 1, .6), (K["s6"] + .5, 0), (DUR, 0)])
M.fx += np.stack([mur * me * .018, np.roll(mur, 900) * me * .018], 1)


def paper(x, dur=.45, a=.05):
    """A sheet folding: a short crinkle burst and a soft crease thump."""
    for y in rng.uniform(x, x + dur, 16):
        g(M.band(M.burst(.035, 80, 1), 2000, 8000), y, a * rng.uniform(.3, 1))
    g(M.thump(.18), x + dur * .7, a * .8)


def chime(x, a=.05, base=fq(4, 1)):
    for k, f in enumerate((base, base * 1.5, base * 2.01)):
        g(M.tone((f,), 2.0, 2.2 + k), x + k * .03, a / (k + 1))


# panel unfolds and scene turns
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - .35, .03)
    paper(K[k] - .2, .5, .045)
for k in ("s4:Anjing", "s5:Satu", "s6:Ibnu", "s7:Di"):
    paper(AT[k] - .2, .4, .035)
# s1: time-lapse riser, the 309 stamp
g(M.lib("riser"), AT["s1:Padahal"] - .3, .03)
for i in range(14):
    g(M.tone((900 + 60 * i,), .05, 60), AT["s1:309"] + i * .075, .02)
g(M.lib("impact-bass-1"), AT["s1:309"] + 1.05, .12)
chime(AT["s1:309"] + 1.05, .05)
# s2/s3: footsteps on sand as the youths walk to the cave
for x in np.arange(AT["s2:Mereka"], K["s3"] + 2.6, .32):
    g(M.band(M.burst(.06, 60, 2), 300, 2500), x, .025)
chime(AT["s3:Ya"], .035, fq(2, 1))
# sleep falls: a low swell and the walkers folding down
n = int(2.5 * SR); tt = np.arange(n) / SR
g(np.sin(2 * np.pi * fq(0, -1) * tt) * np.sin(np.pi * tt / 2.5) ** 2, AT["s3:menidurkan"], .08)
paper(AT["s3:menidurkan"] + .1, .6, .04)
# s4: the sun rises (right) and sets (left), panned with it
n = int(4.2 * SR); tt = np.arange(n) / SR
sw = sum(np.sin(2 * np.pi * fq(d, 1) * tt) for d in (0, 4, 7)) * np.sin(np.pi * tt / 4.2) ** 2 / 3
pan = np.linspace(1, -1, n)
g(np.stack([sw * (1 - pan) / 2, sw * (1 + pan) / 2], 1), AT["s4:Matahari"] - .2, .06)
chime(AT["s4:terbit"] if "s4:terbit" in AT else AT["s4:Matahari"] + .6, .04)
for k in range(5):
    g(M.band(M.burst(.4, 8, 3), 200, 1200), AT["s4:Tubuh"] + .9 + k * .55, .02)   # cloth rustle as they turn
g(M.lib("pop"), AT["s4:Anjing"] + .1, .03)
# s5: waking, the coin, steps to the city
g(M.lib("sparkle"), AT["s5:dibangunkan"], .03)
chime(AT["s5:dibangunkan"] + .2, .04, fq(0, 1))
for k, f in enumerate((3150, 4720, 6380, 8410)):
    g(M.tone((f,), .9, 7 + k * 2), AT["s5:uang"] + k * .004, .03 / (1 + k * .5))
    g(M.tone((f * 1.01,), .6, 9 + k * 2), AT["s5:uang"] + .16, .02 / (1 + k * .5))
for x in np.arange(AT["s5:Satu"] + .4, AT["s5:jangan"] + .6, .36):
    g(M.band(M.burst(.05, 60, 2), 300, 2500), x, .022)
# s6: calendar flicks 1..300, the +9, the two rulers unrolling
a, b = AT["s6:tiga"], AT["s6:tahun"] + .3
for i in range(18):
    g(M.band(M.burst(.03, 120, 1), 1500, 7000), a + i * (b - a) / 18, .03)
for i in range(9):
    g(M.band(M.burst(.03, 120, 1), 1500, 7000), AT["s6:sembilan"] + i * .066, .035)
g(M.thump(.4), AT["s6:ditambah"], .14); g(M.lib("click"), AT["s6:ditambah"], .04)
g(M.lib("impact-bass-1"), AT["s6:sembilan"] + .6, .1)
paper(AT["s6:matahari"] - .3, .8, .035); paper(AT["s6:setara"] - .1, .8, .035)
chime(AT["s6:setara"] + .7, .045)
# s7: the guesses pop, then fold away; dawn for "besok"
for k in ("s7:tiga", "s7:lima", "s7:tujuh"):
    g(M.lib("pop"), AT[k], .035)
paper(AT["s7:Tuhanku"], .6, .04)
chime(AT["s7:Tuhanku"] + .3, .04, fq(0, 1))
chime(AT["s7:insya"], .045, fq(4, 1))
# s8 and the closing card unfolding
g(M.lib("riser"), K["s8"] + 4, .02)
paper(OUT - .15, .5, .04)
g(M.lib("whoosh"), OUT - .2, .03)
chime(OUT + .35, .06, fq(0, 1))
M.finish(music)
print("duration", DUR)
