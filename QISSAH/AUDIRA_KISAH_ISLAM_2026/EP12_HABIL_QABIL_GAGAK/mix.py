"""EP12 sound: maqam Saba on D (D, E half-flat, F, G flat, A, Bb, C). A solo low bowed string (cello-like, rosin noise,
slow vibrato) holds a D/A drone and speaks a few sparse Saba phrases. Frame-drum heartbeats under the confrontation,
quickening as Qabil's shadow looms, then nothing at the iris. Ambience: night wind over a rocky plain. Foley: crow caws and
wing beats, fire roar for the accepted offering, a staff clattering, the crow's digging scrapes, soft bells as the lights
multiply. Music dips for a voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(1212)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
SABA = [0, 1.5, 3, 4, 7, 8, 10, 12]
D = 38  # D2

KILL = AT["s5:membunuh"]; SHUT, OPEN = KILL + .3, KILL + 1.05
LAND = AT["s6:gagak"] + .75; DIG0 = AT["s6:menggali"] + .15; DIG1 = K["s7"] + 1.2
WOE = AT["s6:celaka"]; FLY = AT["s8:Kisah"] - 1.6
GROW = AT["s7:satu#2"] + .25


def bow(f, dur, att=.5, rel=.6, vib=.004, bright=10):
    t = np.arange(int(dur * SR)) / SR
    v = 1 + vib * np.sin(2 * np.pi * 5.1 * t + 1.3) * np.minimum(1, t / 1.2)
    ph = 2 * np.pi * f * np.cumsum(v) / SR
    x = sum(np.sin(h * ph) / h ** 1.25 * (1 + .25 * np.sin(2 * np.pi * (.3 + .07 * h) * t)) for h in range(1, bright + 1))
    rosin = M.band(rng.standard_normal(len(t)), 1500, 6000) * .06
    env = np.minimum(1, t / att) * np.minimum(1, (dur - t) / rel)
    return (x + rosin) * env


def caw(dur=.42, f0=560):
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (1 - .22 * t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(h * ph) / h ** .7 for h in range(1, 14))
    rough = 1 + .6 * np.sin(2 * np.pi * 72 * t)
    x = M.band(x * rough + .4 * rng.standard_normal(len(t)), 700, 3800)
    env = np.minimum(1, t / .02) * np.exp(-t * 2.5) * np.minimum(1, (dur - t) / .05)
    return x / np.abs(x).max() * env


def flap(n, t0, rate=7.0, a=.05):
    for k in range(n):
        x = M.band(M.burst(.12, 28, 2), 150, 1800)
        g(x / np.abs(x).max(), t0 + k / rate, a)


def heart(t, a=.5):
    for dt, gain in ((0, 1), (.24, .6)):
        th = M.thump(.35)
        skin = M.band(M.burst(.08, 50, 2), 200, 1200)
        th[: len(skin)] += .3 * skin
        g(th, t + dt, a * gain)


# ---------- bowed drone: D2 + A2, re-bowed every ~7 s, swelling at the confrontation
drone = M.mono()
for t0 in np.arange(0, DUR, 6.2):
    M.lay(drone, bow(mid(D), 7.4, 1.8, 1.6, .002, 8), t0, .5)
    M.lay(drone, bow(mid(D + 7), 7.4, 2.2, 1.6, .002, 6), t0 + 1.4, .22)
de = M.env([(0, .55), (K["s2"], .5), (K["s3"], .75), (K["s5"], .95), (KILL, 1), (SHUT, .0), (OPEN + .3, 0), (OPEN + 2.5, .5), (K["s6"], .5), (K["s7"], .55), (K["s8"], .5), (END, .45), (DUR - .4, 0), (DUR, 0)])
drone *= de

# ---------- solo bowed phrases in Saba (low register, sparse)
solo = M.mono()


def phrase(t0, degs, beat=.75, oct=12, amp=.3):
    t = t0
    for d, b in degs:
        if d is not None:
            n = D + oct + SABA[d % 7] + 12 * (d // 7)
            M.lay(solo, bow(mid(n), b * beat + .5, .14, .35, .006, 9), t, amp)
        t += b * beat


phrase(.6, [(0, 2), (1, 1), (2, 1), (3, 3), (2, 1), (1, 1), (0, 3)])
phrase(K["s2"] + .8, [(2, 2), (3, 1), (4, 2), (3, 1), (2, 3)], .8)
phrase(AT["s2:diterima"] - .3, [(4, 2), (5, 1), (4, 1), (3, 1), (2, 3)], .7)
phrase(K["s3"] + 4.2, [(3, 2), (2, 1), (1, 1), (0, 4)], .8)
phrase(K["s4"] + .4, [(0, 1), (1, 1), (2, 1), (3, 2), (4, 3), (3, 1), (2, 3)], .78, 12, .26)
phrase(OPEN + 1.8, [(3, 3), (2, 1), (1, 2), (0, 5)], .85, 12, .3)                  # lament after the iris
phrase(WOE + .2, [(4, 2), (3, 1), (2, 1), (1, 2), (0, 4)], .8, 12, .3)
phrase(AT["s7:memelihara"] - .2, [(0, 1), (2, 1), (4, 2), (5, 1), (7, 4)], .7, 12, .26)  # rising to the field of lights
phrase(K["s8"] + 1.0, [(4, 2), (3, 1), (2, 1), (1, 1), (0, 5)], .9, 12, .22)

# ---------- frame-drum heartbeats
hb = []
t = K["s3"] + .3
while t < KILL - .1:
    hb.append(t)
    lo = np.clip((t - AT["s5:nafsu"]) / max(.1, KILL - AT["s5:nafsu"]), 0, 1)
    t += 1.55 - .75 * lo
for x in hb:
    heart(x, .32 + .2 * (x > AT["s5:nafsu"]))
for x in np.arange(K["s6"] + .5, K["s7"], 2.6):
    heart(x, .16)
heart(.15, .35)

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drone * .6 + solo) * fin
music = stereo(music_m, (.25 * solo + .08 * drone) * fin)

# ---------- ambience: wind over the plain, gusting after the iris
wind = M.band(rng.standard_normal(N), 120, 1400) * (1 + .7 * np.sin(2 * np.pi * .11 * T) * np.sin(2 * np.pi * .043 * T + 1)); wind /= np.abs(wind).max()
we = M.env([(0, .5), (K["s3"], .35), (KILL, .3), (SHUT, .05), (OPEN - .1, .05), (OPEN + .4, 1.0), (K["s6"], .55), (K["s7"], .35), (K["s8"], .5), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .06, np.roll(wind, 1500) * we * .06], 1)
hiwind = M.band(rng.standard_normal(N), 2500, 7000) * (1 + np.sin(2 * np.pi * .19 * T)); hiwind /= np.abs(hiwind).max()
M.fx += np.stack([hiwind * we * .012, np.roll(hiwind, 800) * we * .012], 1)
# film projector flutter, barely there
proj = np.sign(np.sin(2 * np.pi * 24 * T)) * M.band(rng.standard_normal(N), 800, 3000); proj /= np.abs(proj).max()
M.fx += np.stack([proj * .0035, proj * .0035], 1)

# ---------- crow
g(caw(), AT["s1:gagak"] - .05, .07); g(caw(.38, 600), AT["s1:gagak"] + .7, .055)
flap(6, AT["s1:mengubur"] + .1, 9, .02)
flap(14, K["s2"] - .2, 7.5, .04)
g(caw(.5, 520), K["s2"] + .9, .035)
flap(16, AT["s6:gagak"] - 1.3, 8, .04)
g(caw(.45, 540), LAND + .3, .06)
g(caw(.36, 610), AT["s6:gagak#2"] - .05, .06); g(caw(.4, 580), AT["s6:gagak#2"] + .6, .045)
flap(18, FLY, 7, .045); g(caw(.5, 560), FLY + .5, .05); g(caw(.5, 520), FLY + 1.6, .035)

# digging scrapes: one rake per cycle while the crow digs (pauses while it looks at Qabil)
P = .82
for k in range(int((DIG1 - DIG0) / P) + 1):
    t0 = DIG0 + k * P + .1
    if WOE - .2 < t0 < WOE + 1.8 or t0 > DIG1:
        continue
    sc = M.band(M.burst(.22, 14, 1), 1500, 7000) * np.sin(np.linspace(0, np.pi, int(.22 * SR)))
    g(sc / np.abs(sc).max(), t0, .05)
    for j in range(5):
        g(M.band(M.burst(.03, 120, 1), 2000, 9000), t0 + .2 + j * .05 + rng.uniform(0, .04), .012)

# ---------- offering fire
fa = M.env([(0, 0), (AT["s2:diterima"] - .5, 0), (AT["s2:diterima"] + .2, 1), (AT["s2:Tradisi"], .9), (K["s3"] + 1.2, .15), (K["s4"], .1), (K["s5"], 0), (DUR, 0)])
roar = M.band(rng.standard_normal(N), 60, 900); roar /= np.abs(roar).max()
M.fx += np.stack([roar * fa * .09, np.roll(roar, 500) * fa * .09], 1)
crk = M.band(M.burst(.02, 200, 1), 1500, 8000)
for x in rng.uniform(AT["s2:diterima"] - .3, K["s4"], 260):
    g(crk, x, .035 * float(np.interp(x, T, fa)) * rng.uniform(.3, 1))
g(M.lib("riser"), AT["s2:diterima"] - 1.4, .03)
g(M.thump(.6), AT["s2:diterima"] - .3, .25)

# ---------- the iris: a low hit, then silence, then the staff falls in the wind
g(M.lib("impact-bass-1"), KILL + .05, .16)
g(M.thump(.5), KILL + .05, .2)
knock = lambda a: M.band(M.burst(.09, 45, 1), 300, 3000) * a
g(knock(1), OPEN + .62, .1); g(knock(.6), OPEN + .8, .08); g(knock(.35), OPEN + .93, .06)

# ---------- s7: bells as the single light returns and multiplies
bell = lambda f, d=2.5: M.tone((f, f * 2.76, f * 5.4), d, 2.2)
g(bell(mid(74)), AT["s7:satu"], .03)
g(M.lib("whoosh-short"), AT["s7:semua"] - .2, .02)
g(bell(mid(74)), AT["s7:satu#2"], .035)
for k in range(12):
    n = 62 + 12 + SABA[k % 7] + 12 * (k // 7)
    g(bell(mid(n), 1.8), GROW + k * .24, .012 + .002 * k)
g(M.lib("sparkle"), GROW + 2.5, .02)

# ---------- intertitle iris changes: a soft projector click
for p in ["s2", "s3", "s4", "s5", "s6", "s7", "s8", "s8:Kisah"]:
    tp = AT.get(p, K.get(p))
    g(M.lib("click-soft"), tp - .25, .03)
g(M.lib("chime"), OUT + .3, .05)
M.finish(music)
print("duration", DUR)
