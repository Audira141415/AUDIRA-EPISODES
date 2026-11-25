"""EP03 sound: maqam Hijaz on D. Frame drum (daf) pulse at 84 bpm, a low brass-like drone, qanun-like tremolo plucks.
The drum marches with the army (s1, s3, s6), holds its breath for Abdul Muthalib's answer (s5) and drops out when the birds arrive;
the swarm of wings takes over the rhythm. Desert wind under everything, elephant trumpets synthesised, no voices.
Run from this folder: python mix.py"""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(105)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
K = {x: M.scene(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
HIJAZ = [62, 63, 66, 67, 69, 70, 72, 74]          # D Eb F# G A Bb C D
beat = 60 / 84


# ---------- instruments
def daf_dum(a=1.0):
    t = np.arange(int(.5 * SR)) / SR
    body = np.sin(2 * np.pi * (78 * t + 30 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 9)
    skin = M.band(M.burst(.5, 18, 2), 120, 900) * .5
    jingle = M.band(M.burst(.5, 10, 1), 5000, 11000) * .18
    return (body + skin + jingle) * a


def daf_tek(a=1.0):
    t = np.arange(int(.25 * SR)) / SR
    slap = M.band(M.burst(.25, 38, 1), 700, 4200)
    ring = np.sin(2 * np.pi * 330 * t) * np.exp(-t * 30) * .4
    jingle = M.band(M.burst(.25, 9, 1), 5000, 12000) * .3
    x = slap / max(1e-6, np.abs(slap).max()) + ring + jingle
    return x * a


DUM, TEK = daf_dum(), daf_tek()
DUM /= np.abs(DUM).max(); TEK /= np.abs(TEK).max()


def qanun(f, dur=1.4, trem=False):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t + h) * np.exp(-t * (2.2 + h * 1.3)) / h ** 1.1 for h in range(1, 8))
    x *= np.minimum(1, t / .002)
    if trem:  # risha tremolo: re-plucks at 14 Hz
        x = x * (0.55 + 0.45 * np.abs(np.sin(np.pi * 14 * t))) * np.exp(-t * .3)
    return x * np.minimum(1, (dur - t) / .03)


drum, drone, pluck = M.mono(), M.mono(), M.mono()


def march(t0, t1, density=1.0):
    """Maqsum-like pattern: DUM tek tek DUM tek per bar."""
    nb = int((t1 - t0) / beat)
    for b in range(nb):
        t = t0 + b * beat
        q = b % 4
        if q == 0:
            M.lay(drum, DUM, t, .9)
        if q == 2:
            M.lay(drum, DUM, t + beat * .5, .65)
        if q in (1, 3):
            M.lay(drum, TEK, t, .45 * density)
        if q in (1, 2) and density > .8:
            M.lay(drum, TEK, t + beat * .5, .3)


march(0.0, K["s2"] - .2, 1.0)
march(K["s3"], K["s4"] - .3, 1.0)
march(K["s4"], AT["s4:Ia"] if "s4:Ia" in AT else K["s4"] + 7, .5)
march(K["s6"] - .2, AT["s6:burung"] - .3, 1.0)
# the drum swells once more on the final line, then rests
march(K["s8"], END - .4, .5)

# drone: saw-ish D2 + A2, low-passed by additive rolloff, slow swell like low brass
t = T
vib = 1 + .004 * np.sin(2 * np.pi * 4.8 * t)
for f, a in ((mid(38), 1.0), (mid(45), .55), (mid(50), .3)):
    drone += a * sum(np.sin(2 * np.pi * f * h * np.cumsum(vib) / SR) / h ** 1.6 for h in range(1, 7))
swell = .65 + .35 * np.sin(2 * np.pi * t / 9.5) ** 2
de = M.env([(0, 0), (.8, 1), (K["s5"], 1), (AT["s5:aku"], .55), (K["s6"], 1), (AT["s6:dijadikan"], 1.25), (K["s7"] + 2, .8), (END, .9), (DUR - .5, 0), (DUR, 0)])
drone *= swell * de

# qanun phrases in Hijaz, sparse, one per bar-ish, rising and falling around the Eb-F# step
PH = [[0, 1, 2, 3, 2, 1, 0], [4, 3, 2, 1, 2], [2, 3, 4, 5, 4, 3], [7, 6, 5, 4, 3, 2, 1, 0], [1, 2, 1, 0]]
def phrase(t0, k, step=.24, oct_=0, a=.5, trem_last=True):
    notes = PH[k % len(PH)]
    for i, n in enumerate(notes):
        last = i == len(notes) - 1
        M.lay(pluck, qanun(mid(HIJAZ[n] + oct_), 2.2 if last else 1.0, trem_last and last), t0 + i * step, a)

phrase(.6, 0, oct_=0)
phrase(4.2, 1)
for i, x in enumerate(np.arange(K["s2"] + .4, K["s3"] - 1, beat * 6)):
    phrase(x, i + 2, .26, 0, .4)
for i, x in enumerate(np.arange(K["s3"] + .2, K["s4"] - 1, beat * 8)):
    phrase(x, i, .2, 12, .32)
for i, x in enumerate(np.arange(K["s4"] + .3, K["s5"] - .8, beat * 6)):
    phrase(x, i + 1, .28, 0, .35)
# s5: the answer gets one slow tremolo note, then a calm descending line
M.lay(pluck, qanun(mid(62), 3.5, True), AT["s5:aku"] - .1, .55)
phrase(AT["s5:Lalu"], 3, .3, 0, .38)
# s6: high tremolo shimmer under the birds
for i, x in enumerate(np.arange(AT["s6:burung"], AT["s6:Surah"], .9)):
    M.lay(pluck, qanun(mid(HIJAZ[(i * 3) % 8] + 12), 1.4, True), x, .28)
phrase(AT["s6:dijadikan"] + .2, 3, .32, 0, .45)
for i, x in enumerate(np.arange(K["s7"] + .5, K["s8"] - .6, beat * 7)):
    phrase(x, i + 1, .34, 0, .3)
M.lay(pluck, qanun(mid(50), 4.0, True), END - 1.0, .5)
M.lay(pluck, qanun(mid(62), 4.0, False), END - .95, .4)

fin = M.env([(0, 1), (END + .4, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drum * .8 + drone * .17 + pluck * .7) * fin
music = stereo(music_m, (.25 * pluck - .12 * drum) * fin)

# ---------- ambience: desert wind with slow gusts
wind = M.band(rng.standard_normal(N), 180, 1400)
wind *= .55 + .45 * np.sin(2 * np.pi * T / 7.3 + 1) * np.sin(2 * np.pi * T / 3.1)
wind /= np.abs(wind).max()
we = M.env([(0, .6), (K["s2"], .35), (K["s4"], .7), (K["s6"], .6), (K["s7"], .9), (END, .7), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .045, np.roll(wind, 4000) * we * .045], 1)


def trumpet(t0, a=.06, f0=330, dur=1.3):
    """Elephant trumpet: buzzy saw with an upward scoop, fast vibrato, nasal formant, breath noise."""
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f0 * (1 + .45 * np.minimum(1, tt / .25)) * (1 + .03 * np.sin(2 * np.pi * 23 * tt)) * (1 - .12 * np.maximum(0, tt - .8))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(h * ph) / h for h in range(1, 14))
    x = M.band(x, 450, 3800) + .3 * M.band(rng.standard_normal(n), 1500, 5000)
    env = np.minimum(1, tt / .06) * np.minimum(1, (dur - tt) / .3)
    x *= env
    g(x / max(1e-6, np.abs(x).max()), t0, a)


def steps(t0, t1, a=.05, rate=1.4):
    """Heavy elephant footfalls."""
    for x in np.arange(t0, t1, 1 / rate):
        g(M.thump(.35), x, a)
        g(M.band(M.burst(.2, 25, 2), 80, 600), x, a * .4)


def rustle(t0, dur=.7, a=.05, n=26, lo=2500, hi=9000):
    for x in rng.uniform(t0, t0 + dur, n):
        g(M.band(M.burst(.03, 90, 1), lo, hi), x, a * rng.uniform(.4, 1))


def wings(t0, t1, peak, a=.05):
    """Swarm: many flutters (amplitude-modulated noise at 12-22 Hz), densest at peak."""
    for x in rng.uniform(t0, t1, int((t1 - t0) * 30)):
        d = rng.uniform(.25, .6); n = int(d * SR); tt = np.arange(n) / SR
        fr = rng.uniform(12, 22)
        s = M.band(rng.standard_normal(n), 700, 4500) * np.abs(np.sin(np.pi * fr * tt)) ** 2 * np.sin(np.pi * tt / d)
        w = np.exp(-((x - peak) / ((t1 - t0) * .45)) ** 2)
        pan = rng.uniform(-.8, .8)
        sig = s / max(1e-6, np.abs(s).max())
        g(np.stack([sig * (1 - pan) / 2, sig * (1 + pan) / 2], 1), x, a * (.25 + w))


# s1: march, trumpet, birds pass over
steps(0.2, K["s2"] - .5, .045)
trumpet(AT["s1:Ka'bah"] - .3, .055)
g(M.lib("riser"), AT["s1:kawanan"] - 1.4, .025)
wings(AT["s1:kawanan"] - 1.2, AT["s1:kawanan"] + 2.6, AT["s1:kawanan"] + .5, .035)
g(M.lib("whoosh-cinematic"), K["s2"] - .35, .055)
# s2: map, labels pop, drafting clicks
for k in ("s2:Yaman", "s2:Habasyah", "s2:Prasasti", "s2:gereja", "s2:Ka'bah"):
    g(M.lib("pop"), AT[k], .045)
g(M.thump(.4), AT["s2:Prasasti"] + .05, .08)
for i in range(6):
    g(M.lib("click-soft"), AT["s2:berziarah"] + i * .08, .025)
g(M.lib("whoosh"), K["s3"] - .25, .05)
# s3: the column sets off
steps(K["s3"] + .2, K["s4"] - .4, .03, 1.8)
trumpet(AT["s3:Mahmud"] - .2, .05, 300, 1.5)
for i in range(3):
    g(M.thump(.3), AT["s3:dikalahkan"] - .3 + i * .28, .08)
    rustle(AT["s3:dikalahkan"] - .3 + i * .28, .3, .03, 10, 300, 2500)
g(M.lib("chime"), AT["s3:perjalanan"], .045)
g(M.lib("whoosh-cinematic"), K["s4"] - .35, .055)
# s4: the herd driven off, the walk to Abrahah
herd = M.band(rng.standard_normal(N), 60, 500) * (1 + .6 * np.sin(2 * np.pi * 3.3 * T)); herd /= np.abs(herd).max()
he = M.env([(0, 0), (AT["s4:merampas"] - .6, 0), (AT["s4:merampas"], .8), (AT["s4:Abdul"] + .6, .7), (AT["s4:Abdul"] + 1.6, 0), (DUR, 0)])
M.fx += np.stack([herd * he * .05, np.roll(herd, 1500) * he * .05], 1)
for i in range(40):
    g(M.lib("click-soft"), AT["s4:dua"] + i * .032, .02)
g(M.lib("pop"), AT["s4:Abdul"], .04)
g(M.lib("whoosh-short"), AT["s4:Ia"], .045)
g(M.lib("pop"), AT["s4:Abrahah"], .04)
g(M.thump(.3), AT["s4:Bukan"], .07)
# s5: hush, then the people leave for the hills
g(M.lib("chime"), AT["s5:aku"] - .05, .05)
g(M.thump(.5), AT["s5:Ka'bah"], .07)
for i in range(14):
    rustle(AT["s5:mengungsi"] - .6 + i * .22, .25, .02, 6, 300, 2200)
g(M.lib("whoosh-cinematic"), K["s6"] - .35, .055)
# s6: march, trumpet, kneel, birds, pebbles, the crumble
steps(K["s6"] - .2, AT["s6:berhenti"] + .3, .05, 1.6)
trumpet(AT["s6:berhenti"] + .1, .07, 280, 1.8)
g(M.thump(.6), AT["s6:berhenti"] + .55, .16)
g(M.lib("riser"), AT["s6:burung"] - 1.6, .03)
wings(AT["s6:burung"] - 1.2, AT["s6:dijadikan"] + 2.4, AT["s6:melempari"] + .8, .06)
for x in rng.uniform(AT["s6:melempari"] - .2, AT["s6:dijadikan"] + .2, 90):
    n = int(.35 * SR); tt = np.arange(n) / SR
    fz = rng.uniform(1800, 3200) * (1 - .5 * tt / .35)
    whistle = np.sin(2 * np.pi * np.cumsum(fz) / SR) * np.sin(np.pi * tt / .35) ** 2
    g(whistle, x, .006)
    g(M.band(M.burst(.05, 80, 1), 600, 4000), x + .35, .02)
g(M.lib("impact-bass-1"), AT["s6:dijadikan"] - .05, .09)
for i in range(18):
    rustle(AT["s6:dijadikan"] - .2 + i * .12, .4, .045, 30, 1800, 9000)
# s7-s8: night wind, a lamp, the last line
g(M.lib("whoosh"), K["s7"] - .25, .045)
g(M.lib("chime"), AT["s7:Nabi"] + .1, .045)
g(M.lib("pop"), AT["s7:Sebagian"], .035)
g(M.lib("whoosh-cinematic"), K["s8"] - .35, .05)
g(M.lib("pop"), AT["s8:Menurut"], .04)
g(M.lib("whoosh"), OUT - .2, .05); g(M.lib("chime"), OUT + .3, .07)
M.finish(music)
print("duration", DUR)
