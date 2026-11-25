"""EP05 sound: Andean bed in A minor pentatonic. Low drone, breathy quena-like lead, charango-like plucks, a martial drum for the war and the parade.
Foley: altitude wind, boat engine putter, water lap, rail clack, gavel. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(5050)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda n: 440 * 2 ** ((n - 69) / 12)

# drone: A1 + E2 fifths, slow breathing
saw = lambda f, d=0: sum(np.sin(2 * np.pi * (f + d) * h * T + h) / h for h in range(1, 6))
drone = M.band(saw(55) + saw(55, .15) + .6 * saw(82.41, .2), 30, 500); drone /= np.abs(drone).max()
drone *= .8 + .2 * np.sin(2 * np.pi * T / 7.5)
de = M.env([(0, .55), (K["s3"], .9), (K["s4"], .6), (K["s6"], .7), (K["s7"], .9), (K["s8"], .55), (END, .5), (DUR - .3, 0), (DUR, 0)])

# quena: breathy sine + 2nd harmonic + noise, delayed vibrato
def quena(f, dur):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + .006 * np.sin(2 * np.pi * 5.4 * t) * np.minimum(1, t / .35)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = np.sin(ph) + .28 * np.sin(2 * ph) + .08 * np.sin(3 * ph)
    br = M.band(rng.standard_normal(len(t)), f * .8, f * 3.2) * .5
    x = x + br / max(1e-6, np.abs(br).max()) * .35
    return x * np.minimum(1, t / .08) * np.minimum(1, (dur - t) / .18)
PH = [(76, 1), (74, .5), (72, .5), (69, 1.5), (None, .5), (72, .5), (74, .5), (76, 1), (79, 1), (76, 2), (None, 1),
      (81, 1), (79, .5), (76, .5), (74, 1), (72, .5), (74, .5), (69, 2.5), (None, 1.5)]
lead = M.mono()
beat = 60 / 84
def phrase(t0, gain=1.0, oct=0):
    t = t0
    for n, d in PH:
        if n is not None:
            M.lay(lead, quena(mid(n + oct), d * beat * 1.05), t, gain)
        t += d * beat
    return t
for st, gn in ((K["s2"] + .2, .8), (K["s5"] + .3, .9), (K["s8"] + .1, 1.0)):
    end = phrase(st, gn)
    if st == K["s5"] + .3:
        phrase(end, .7)
lead_e = M.env([(0, 1), (K["s3"], 1), (K["s3"] + .3, 0), (K["s5"], 0), (K["s5"] + .2, 1), (K["s6"], 1), (K["s6"] + .3, 0), (K["s8"], 0), (K["s8"] + .2, 1), (DUR, 1)])
lead *= lead_e

# charango: bright plucked strums on the off-beats
char = M.mono()
CH = [[57, 64, 69, 72], [55, 62, 67, 71], [53, 60, 65, 69], [52, 59, 64, 67]]
for b in range(int(END / (beat / 2))):
    t0 = b * beat / 2
    sec = t0 < K["s3"] or K["s4"] <= t0 < K["s6"] or t0 >= K["s8"]
    if not sec or b % 4 == 0:
        continue
    chord = CH[(b // 16) % 4]
    for k, n in enumerate(chord):
        M.lay(char, M.note(mid(n + 12), .5, "pluck", 7), t0 + k * .011, .22 if b % 2 else .14)

# martial drum: war and parade, 2/4 march
drum = M.mono()
def snare(t0, a):
    M.lay(drum, M.band(M.burst(.16, 30, 1), 900, 6000), t0, a)
for lo, hi in ((AT["s3:memicu"], K["s4"] - .4), (K["s6"], K["s7"] - .2)):
    mb = 60 / 112
    for i, t0 in enumerate(np.arange(lo, hi, mb / 2)):
        if i % 4 == 0:
            M.lay(drum, M.note(58, .5, "sine", 7), t0, 1.0)
        if i % 4 == 2:
            snare(t0, .55)
        if i % 8 == 7:
            snare(t0, .3); snare(t0 + mb / 4, .3)

music = stereo(.5 * drone * de + .32 * lead + .38 * char + .55 * drum, .1 * lead + .14 * char)

# --- foley ---
wind = M.band(rng.standard_normal(N), 250, 2400); wind /= np.abs(wind).max()
wind *= .6 + .4 * np.sin(2 * np.pi * T / 5.3) ** 2
we = M.env([(0, .9), (K["s2"], .6), (K["s2"] + 1, .25), (K["s5"] + 9, .25), (K["s6"], 0), (K["s8"], 0), (K["s8"] + 1, .8), (DUR - .2, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .05, np.roll(wind, 900) * we * .05], 1)
# boat engine putter: low tone gated at ~9 Hz
pt = (np.sin(2 * np.pi * 9.2 * T) > .2).astype(float)
pt = np.convolve(pt, np.ones(200) / 200, mode="same")
eng = M.band(np.sin(2 * np.pi * 62 * T) + .5 * np.sin(2 * np.pi * 124 * T) + .3 * rng.standard_normal(N), 40, 900) * pt
ee = M.env([(0, 1), (3.5, .7), (6.2, 0), (AT["s5:berpatroli"] - .5, 0), (AT["s5:berpatroli"], .35), (K["s6"] - .4, .35), (K["s6"], 0), (K["s8"], 0), (K["s8"] + .5, .8), (DUR - .3, 0), (DUR, 0)])
M.fx += np.stack([eng * ee * .06] * 2, 1)
# water lap
for x in np.arange(.3, 6, .9):
    g(M.band(M.burst(.35, 9, 6), 200, 1600), x + rng.uniform(0, .3), .05)
for x in np.arange(K["s8"] + .3, DUR - .8, .85):
    g(M.band(M.burst(.35, 9, 6), 200, 1600), x + rng.uniform(0, .3), .05)

# beats
g(M.lib("whoosh-cinematic"), 3.0, .06)
g(M.lib("click"), AT["s1:sekitar"], .06)
g(M.lib("whoosh"), K["s2"] - .3, .05)
g(M.lib("sparkle"), AT["s2:1825"], .06); g(M.lib("chime"), AT["s2:pantai"], .05)
g(M.lib("riser"), K["s3"] - 1.6, .04)
g(M.lib("impact-bass-1"), K["s3"], .14); g(M.thump(.6), K["s3"], .25)
for k in ("s3:memicu", "s3:Bolivia", "s3:melawan"):
    g(M.lib("whoosh-short"), AT[k], .05)
g(M.lib("impact-bass-1"), AT["s3:lepas"], .16); g(M.thump(.8), AT["s3:lepas"], .3)
g(M.lib("whoosh"), K["s4"] - .3, .05)
g(M.lib("click"), AT["s4:rel"], .06)
for x in np.arange(AT["s4:La"], K["s5"] + 1, .34):
    g(M.tone((900, 1400), .03, 80), x, .02); g(M.thump(.08), x + .17, .04)
g(M.lib("pop"), AT["s4:berdagang"], .05)
g(M.lib("whoosh"), K["s5"] - .3, .05)
g(M.lib("sparkle"), AT["s5:sungai"], .05)
g(M.lib("ping"), AT["s5:3.812"], .07); g(M.lib("riser"), AT["s5:3.812"] - 1.2, .03)
g(M.lib("whoosh-cinematic"), K["s6"] - .3, .06)
g(M.lib("impact-bass-1"), AT["s6:tuntutan"], .1)
g(M.lib("whoosh-cinematic"), K["s7"] - .3, .06)
for i in range(12):
    g(M.tone((1200 + i * 60, 2400), .1, 30), AT["s7:putusannya"] + i * .1, .02)
def gavel(t, a):
    g(M.thump(.3), t, a); g(M.band(M.burst(.08, 60, 2), 600, 4000), t, a * .7); g(M.tone((420, 980), .12, 40), t, a * .4)
gavel(AT["s7:keluar"], .3); gavel(AT["s7:berunding"], .42); g(M.lib("impact-bass-1"), AT["s7:berunding"], .12)
g(M.lib("whoosh"), K["s8"] - .3, .05)
g(M.lib("pop"), AT["s8:keras"], .05); g(M.lib("pop"), AT["s8:kesetiaan"], .05)
g(M.lib("whoosh-short"), OUT - .35, .05); g(M.lib("chime"), OUT + .3, .07)
M.finish(music)
print("duration", DUR)
