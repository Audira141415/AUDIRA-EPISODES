"""EP11 sound: an OSINT briefing room. A tense minimal synth pulse (D minor, 96 bpm) under Moluccan-flavoured plucked strings
in a pentatonic scale, with tifa-like hand-drum hits used sparingly (hook, siege, Breda, payoff). s5 drops to a bare drone.
Foley: sea bed near Banda, harbour bustle under the skyline, radar pings on the reticles, scan sweeps on panels. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1667)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda n: 440 * 2 ** ((n - 69) / 12)
beat = 60 / 96

def pluck(f, a=1.0, dur=1.2):
    """Karplus-Strong string: bright attack, woody decay."""
    n = int(dur * SR); p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .996
    return out * a * np.minimum(1, np.arange(n) / 40)

def tifa(a=1.0, slap=False):
    t = np.arange(int(.6 * SR)) / SR
    x = np.sin(2 * np.pi * (110 * t + 60 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 9)
    x += .5 * np.sin(2 * np.pi * 173 * t) * np.exp(-t * 14)
    if slap: x += .6 * M.burst(.6, 45, 2)[: len(t)]
    return x * a

# pulse: filtered saw 16ths on D, level follows the story
def level(t0):
    if t0 < K["s2"]: return .9
    if t0 < K["s4"]: return .6
    if t0 < K["s5"]: return 1.0
    if t0 < K["s6"]: return 0.0
    if t0 < K["s8"]: return .8
    return .65
pulse = M.mono()
ROOT = [38, 38, 34, 36]  # D D Bb C
nb = int(END / (beat / 4)) + 8
for i in range(nb):
    t0 = i * beat / 4
    lv = level(t0)
    if lv <= 0 or t0 > END + 1.5: continue
    r = ROOT[int(t0 / (beat * 8)) % 4]
    acc = 1.0 if i % 4 == 0 else .55
    M.lay(pulse, M.note(mid(r), .16, "saw", dec=14) * acc, t0, lv)
pulse = M.band(pulse, 40, 1800)

# plucked strings: pentatonic phrases (D F G A C), Moluccan sasando/ukulele flavour
PENT = [62, 65, 67, 69, 72, 74, 77]
strings = M.mono()
PH = [[0, 2, 3, 4, 3, 2], [4, 5, 4, 3, 2, 0], [2, 3, 4, 6, 5, 4], [0, 1, 2, 3, 2, 1]]
def phrase(t0, k, a=1.0):
    for j, d in enumerate(PH[k % len(PH)]):
        M.lay(strings, pluck(mid(PENT[d]), a), t0 + j * beat / 2, 1)
for k, st in enumerate([.3, K["s2"] + .4, AT["s2:penghasil"], K["s3"] + .3, AT["s3:Kapten"], K["s6"] + 1.5, K["s7"] + .3, AT["s7:Inggris"], K["s8"] + .2, AT["s8:pohon"]]):
    phrase(st, k, .8)

# s5: bare drone, no rhythm
drone = M.band(np.sin(2 * np.pi * mid(38) * T) + .6 * np.sin(2 * np.pi * mid(45) * T + .4) + .25 * rng.standard_normal(N), 40, 600)
drone = drone / np.abs(drone).max() * M.env([(0, 0), (K["s5"] - .5, 0), (K["s5"] + 1.5, 1), (K["s6"] - .2, .9), (K["s6"] + 1.5, 0), (DUR, 0)])
pad = M.band(sum(np.sin(2 * np.pi * mid(n) * h * T + h) / h for n in (50, 57, 62) for h in range(1, 4)), 60, 1400)
pad = pad / np.abs(pad).max() * M.env([(0, .3), (K["s2"], .2), (K["s6"], .2), (K["s7"], .5), (K["s8"], .6), (END, .5), (DUR, 0)])
musicfade = M.env([(0, 1), (END + .3, 1), (DUR, .5)])
music = stereo((.5 * pulse + .55 * strings + .45 * drone + .25 * pad) * musicfade, (.18 * strings + .08 * pad) * musicfade)

# tifa hits, sparingly
for t0, a, s in ((0.05, .5, True), (AT["s1:ditukar"], .4, False), (AT["s4:VOC"], .5, True), (AT["s4:mengepung"], .45, False), (AT["s4:1620"], .5, True),
                 (AT["s7:Breda"], .45, True), (AT["s7:Inggris"] + .15, .35, False), (AT["s8:Menurut"], .45, True)):
    g(tifa(1, s), t0, a * .5)

# --- foley ---
sea = M.band(rng.standard_normal(N), 120, 1400); sea /= np.abs(sea).max()
sea *= .6 + .4 * np.sin(2 * np.pi * T / 7.3) ** 2
se = M.env([(0, .4), (K["s2"], .6), (K["s5"], .3), (K["s6"], .2), (K["s6"] + 2, 0), (K["s7"], 0), (AT["s7:Run"], .3), (DUR - .3, 0), (DUR, 0)])
M.fx += np.stack([sea * se * .03, np.roll(sea, 900) * se * .03], 1)
city = M.band(rng.standard_normal(N), 200, 3000); city /= np.abs(city).max()
ce = M.env([(0, 0), (AT["s8:Manhattan"], 0), (AT["s8:Manhattan"] + 1.5, .7), (END, .6), (DUR, 0)])
M.fx += np.stack([city * ce * .02] * 2, 1)

def ping(t0, a=.05): g(M.tone((1760, 2637), .9, 5), t0, a)
for t0 in (.2, 1.4, 3.2, AT["s2:Banda"], AT["s6:Manhattan"], AT["s7:Run"] + .4): ping(t0)
# panel scan sweeps
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - .3, .04); g(M.band(M.burst(.25, 12, 1), 2500, 9000), K[k] - .14, .025)
for k in ("s2:Panjangnya", "s3:Kapten", "s4:Courthope", "s7:Inggris"):
    g(M.lib("whoosh-short"), AT[k] - .3, .035)
g(M.lib("glitch-1"), K["s2"] - .35, .04)
g(M.lib("glitch-2"), AT["s7:Run"] - .1, .04)
# altitude moves
g(M.lib("whoosh-cinematic"), K["s2"] + .4, .05); g(M.lib("riser"), AT["s2:Panjangnya"] - 1.5, .025)
g(M.lib("riser"), K["s6"], .035); g(M.lib("whoosh-cinematic"), K["s6"] + 1.2, .06); g(M.lib("whoosh-cinematic"), AT["s6:Amsterdam"] - .8, .05)
# reveals
for k in ("s1:New", "s2:abad", "s2:mahal", "s3:bersekutu", "s3:takut", "s3:Kapten", "s3:benteng", "s4:pasukannya", "s6:Inggris", "s6:menamainya", "s7:mengesahkan", "s8:Manhattan", "s8:pohon"):
    g(M.lib("click-soft"), AT[k], .05)
for i in range(16):  # nutmeg markers pop in
    g(M.tone((2400 + i * 60,), .05, 50), AT["s2:penghasil"] + i * .1, .012)
g(M.lib("click"), AT["s2:tiga"], .05)
for k in ("s4:mengepung", "s4:1620"):
    g(M.thump(.45), AT[k], .2); g(M.lib("impact-bass-1"), AT[k], .05)
for i in range(24):  # day counter ticks
    g(M.tone((1500,), .03, 80), AT["s4:bertahan"] + i * .1, .012)
for k in ("s7:memegang", "s7:dilepas"):
    g(M.lib("pop"), AT[k], .05); g(M.thump(.3), AT[k], .1)
g(M.lib("whoosh-short"), AT["s7:Inggris"] + .15, .04)
for i in range(20):  # skyline rising
    g(M.band(M.burst(.08, 40, 1), 300, 1800), AT["s8:Manhattan"] + i * .1, .02)
g(M.lib("sparkle"), AT["s8:pohon"], .04)
g(M.lib("pop"), AT["s8:Menurut"], .05)
g(M.lib("whoosh-short"), OUT - .35, .05); g(M.lib("chime"), OUT + .3, .07)
M.finish(music)
print("duration", DUR)
