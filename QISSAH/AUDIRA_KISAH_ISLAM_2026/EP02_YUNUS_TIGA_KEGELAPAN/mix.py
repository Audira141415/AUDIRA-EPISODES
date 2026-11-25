"""EP02 sound: deep ocean at night. A low D drone (D-A fifths, slow beating), a breathy ney-like synth in Maqam Hijaz on D
(D Eb F# G A Bb C D) phrasing slowly with glides, whale-song glides through long reverb, underwater rumble, the muffled
throb of the belly, and for the ship: storm wind, rain, crashing swell, creaking wood and thunder. At the doa the ney falls
silent and the drone opens into a warm swell. No voices. Run from this folder: python mix.py"""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(3505)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
CUT2 = AT["s3:Di"] - .05
CUT3 = AT["s4:berdoa"] - .05
DOA = [AT[k] for k in ("s4:Lā", "s4:ilāha", "s4:illā", "s4:anta", "s4:subḥānaka", "s4:innī", "s4:kuntu", "s4:minaẓ-ẓālimīn")]


def lp(x, fc):
    """One-pole low-pass, vectorised through FFT for long beds."""
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))


def fftconv(x, ir):
    n = len(x) + len(ir)
    L = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[: len(x)]


def ir(sec, seed, dark=3500):
    r = np.random.default_rng(seed)
    n = int(sec * SR); t = np.arange(n) / SR
    x = M.band(r.standard_normal(n), 120, dark) * np.exp(-t * 6.9 / sec)
    x[:int(.012 * SR)] *= np.linspace(0, 1, int(.012 * SR))
    return x / np.sqrt(np.sum(x ** 2))


# ---------- drone: D1 + D2 + A2, slow beating; swells at the doa
dr = (np.sin(2 * np.pi * 36.71 * T) + .8 * np.sin(2 * np.pi * 73.42 * T + .3) + .35 * np.sin(2 * np.pi * 73.62 * T)
      + .45 * np.sin(2 * np.pi * 110.0 * T + 1.1) + .2 * np.sin(2 * np.pi * 146.8 * T)) * (1 + .25 * np.sin(2 * np.pi * .07 * T))
de = M.env([(0, 0), (1.2, .8), (CUT2 - .1, .7), (CUT2, .35), (26.5, .5), (CUT3, .7), (DOA[0], .9), (K["s5"], 1.2), (AT["s5:mengakui"], 1.4),
            (K["s6"] + 1, .9), (AT["s6:Doanya"], 1.0), (K["s7"], .8), (K["s8"], .9), (END, .9), (DUR - .2, 0), (DUR, 0)])
drone = dr * de
# warm major-ish swell on the doa (D, F#, A an octave up), the only bright harmony in the film
sw = sum(np.sin(2 * np.pi * mid(n) * T + i) for i, n in enumerate((50, 54, 57, 62))) / 4 * (1 + .1 * np.sin(2 * np.pi * 4.6 * T))
swell = sw * M.env([(0, 0), (DOA[0] - .2, 0), (DOA[-1] + 1, .35), (K["s5"] + 2, .3), (AT["s5:mengakui"], .32), (AT["s5:mengakui"] + 1.5, .6), (K["s6"] + 1.5, 0), (DUR, 0)])

# ---------- ney: breath + tone, Hijaz on D, glides between notes
HJ = [62, 63, 66, 67, 69, 70, 72, 74]
PHR = [  # (start, [(scale index, beats)]) beat = 0.62 s
    (1.0, [(0, 2), (1, 1), (2, 3), (1, 1), (0, 4)]),
    (8.0, [(4, 2), (3, 1), (2, 2), (1, 1), (2, 2), (0, 4)]),
    (13.0, [(2, 1), (3, 1), (4, 3), (5, 1), (4, 2), (3, 4)]),
    (19.0, [(0, 1), (2, 2), (3, 1), (2, 3)]),
    (28.6, [(4, 2), (5, 1), (4, 1), (3, 2), (2, 1), (1, 1), (0, 4)]),
    (46.6, [(7, 2), (6, 1), (5, 2), (4, 4)]),
    (52.6, [(0, 2), (2, 1), (3, 2), (4, 3), (3, 1), (2, 4)]),
    (59.8, [(4, 1), (5, 1), (6, 2), (7, 5)]),
    (64.6, [(7, 2), (6, 1), (5, 1), (4, 4)]),
    (68.0, [(4, 1), (6, 1), (7, 3), (6, 1), (5, 2), (4, 4)]),
    (74.0, [(2, 2), (3, 1), (4, 2), (5, 1), (4, 4)]),
    (80.5, [(7, 3), (6, 1), (5, 2), (4, 2), (3, 1), (2, 2), (1, 1), (0, 6)]),
]
ney = M.mono()
beat = .62
for t0, notes in PHR:
    durs = [b * beat for _, b in notes]
    total = sum(durs) + .4
    n = int(total * SR); tt = np.arange(n) / SR
    f = np.zeros(n); amp = np.zeros(n)
    pos = 0.0
    prev = mid(HJ[notes[0][0]] - 12)
    for (si, b), d in zip(notes, durs):
        tgt = mid(HJ[si] - 12)
        a, e = int(pos * SR), int((pos + d) * SR)
        k = np.arange(e - a) / SR
        f[a:e] = tgt + (prev - tgt) * np.exp(-k / .06)
        amp[a:e] = np.minimum(1, k / .12) * (1 - .25 * np.minimum(1, k / d))
        prev = tgt; pos += d
    f[int(pos * SR):] = prev
    amp[int(pos * SR):] = amp[int(pos * SR) - 1] * np.exp(-np.arange(n - int(pos * SR)) / SR / .15)
    vib = 1 + .006 * np.sin(2 * np.pi * 5.1 * tt) * np.minimum(1, tt / .8)
    ph = np.cumsum(2 * np.pi * f * vib / SR)
    tone = np.sin(ph) + .28 * np.sin(2 * ph) + .1 * np.sin(3 * ph)
    breath = M.band(rng.standard_normal(n), 700, 4200)
    breath /= np.abs(breath).max()
    sig = (tone * .8 + breath * .35 * (.4 + .6 * np.abs(np.sin(ph / 2)))) * amp * np.minimum(1, tt / .25) * np.minimum(1, (total - tt) / .3)
    M.lay(ney, sig, t0, .5)

# ---------- whale song: slow glides through the long reverb
whale = M.mono()
for t0, (a, b, c), d in [(1.9, (170, 390, 240), 3.2), (26.4, (140, 330, 180), 2.6), (29.2, (210, 450, 300), 3.4), (53.0, (160, 360, 220), 3.6),
                         (57.0, (230, 480, 310), 3.0), (60.2, (180, 520, 260), 2.8), (84.5, (150, 340, 200), 4.0)]:
    n = int(d * SR); tt = np.arange(n) / SR; u = tt / d
    f = a + (b - a) * np.sin(np.pi * np.minimum(1, u * 1.4) / 2) ** 2 - (b - c) * np.clip((u - .6) / .4, 0, 1) ** 2
    f = f * (1 + .02 * np.sin(2 * np.pi * 7 * tt))
    ph = np.cumsum(2 * np.pi * f / SR)
    sig = (np.sin(ph) + .35 * np.sin(2 * ph + .4) + .12 * np.sin(3 * ph)) * np.sin(np.pi * u) ** 1.5
    M.lay(whale, sig, t0, .55)

music_dry = drone * .9 + swell * .55 + ney * .8 + whale * .7
fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_dry *= fin
wetL = fftconv(music_dry, ir(3.8, 1)); wetR = fftconv(music_dry, ir(3.8, 2))
music = np.stack([music_dry * .7 + wetL * .9, music_dry * .7 + wetR * .9], 1)

# ---------- ambience / foley
noise = rng.standard_normal(N)
rumble = lp(noise, 90); rumble /= np.abs(rumble).max()
throb = (.5 + .5 * np.sin(2 * np.pi * .85 * T)) ** 6  # the belly: a slow muffled pulse
re = M.env([(0, 0), (1.5, 0), (1.9, 1), (4.0, .6), (K["s2"] - .3, .5), (K["s2"], 0), (25.8, 0), (26.2, 1), (CUT3, .8), (CUT3 + .2, .6), (K["s6"], .6), (K["s6"] + .3, 1), (60.8, .8), (61.2, 0), (DUR, 0)])
ie = M.env([(0, 0), (CUT3 - .1, 0), (CUT3 + .3, 1), (K["s6"] - .2, 1), (K["s6"], 0), (DUR, 0)])
amb = rumble * re * .35 + lp(noise, 160) / np.abs(lp(noise, 160)).max() * throb * ie * .3
M.fx += np.stack([amb, np.roll(amb, 700)], 1)
# night sea surface: soft lapping waves (hook, shore)
lap = M.band(rng.standard_normal(N), 200, 1800) * (.5 + .5 * np.sin(2 * np.pi * .18 * T)) ** 3; lap /= np.abs(lap).max()
le = M.env([(0, .6), (1.5, .6), (1.9, 0), (K["s3"] - .1, 0), (K["s3"], .6), (CUT2 - .1, .6), (CUT2, 0), (61.0, 0), (61.4, .7), (K["s7"] + 1, .4), (K["s7"] + 3, 0), (K["s8"], 0), (K["s8"] + .5, .35), (END, .3), (DUR, 0)])
M.fx += np.stack([lap * le * .05, np.roll(lap, 1500) * le * .05], 1)
# storm: wind, rain, swell crashes
se = M.env([(0, 0), (CUT2 - .02, 0), (CUT2, 1), (25.7, 1), (26.1, .12), (27.6, 0), (DUR, 0)])
wind = M.band(rng.standard_normal(N), 250, 1400) * (1 + .6 * np.sin(2 * np.pi * .23 * T) * np.sin(2 * np.pi * .41 * T)); wind /= np.abs(wind).max()
rain = M.band(rng.standard_normal(N), 4000, 11000); rain /= np.abs(rain).max()
M.fx += np.stack([(wind * .07 + rain * .035) * se, (np.roll(wind, 3000) * .07 + np.roll(rain, 900) * .035) * se], 1)
for x in np.arange(CUT2 + .3, 25.8, 1.35):
    c = lp(M.burst(1.6, 2.2, 1), 900); g(c / np.abs(c).max(), x, .09)


def thunder(t0, a=.22):
    c = lp(M.burst(3.0, 1.3, 1), 300); c /= np.abs(c).max()
    cr = M.band(M.burst(.5, 9, 1), 900, 6000); cr /= np.abs(cr).max()
    g(cr, t0, a * .4); g(c, t0 + .05, a)


thunder(CUT2, .26); thunder(21.0, .18); thunder(AT["s3:Undian"] - .2, .2); thunder(24.3, .16)


def creak(t0, dur, a=.04):
    """Wood creak: a resonant pulse train whose rate wanders."""
    n = int(dur * SR); tt = np.arange(n) / SR
    rate = 38 + 26 * np.sin(2 * np.pi * tt / dur * 1.3) + 10 * np.sin(2 * np.pi * 3.1 * tt)
    ph = np.cumsum(rate / SR)
    pulses = (np.diff(np.floor(ph), prepend=0) > 0).astype(float)
    res = sum(np.convolve(pulses, np.sin(2 * np.pi * f * np.arange(400) / SR) * np.exp(-np.arange(400) / 60), "same") for f in (480, 910, 1630))
    g(res / np.abs(res).max() * np.sin(np.pi * tt / dur), t0, a)


for x, d in [(K["s3"] + .2, 1.2), (AT["s3:muatan"] - .2, 1.0), (CUT2 + .4, 1.4), (22.6, 1.0), (24.0, 1.3), (25.0, .9)]:
    creak(x, d, .05)
# the lots: wooden clacks as each stick lands and bounces
for i in range(7):
    ts = AT["s3:diundi"] - .05 + i * .07
    for dt, a in ((.4, .07), (.6, .035)):
        c = M.band(M.burst(.05, 90, 1), 700, 3000) + .5 * M.tone((1150 + i * 60, 2300), .05, 70)
        g(c / np.abs(c).max(), ts + dt, a)
g(M.lib("chime"), AT["s3:Yunus"] - .3, .05)
# overboard, splash, the swallow
g(M.lib("whoosh"), AT["s3:keluar"], .05)
sp = M.band(M.burst(1.2, 3.5, 1), 400, 7000); g(sp / np.abs(sp).max(), 25.42, .12)
g(M.lib("whoosh-cinematic"), AT["s3:Seekor"] - .4, .05)
sw_ = lp(M.burst(1.6, 2.4, 1), 250); g(sw_ / np.abs(sw_).max(), AT["s3:menelannya"] - .2, .25); g(M.thump(.6), AT["s3:menelannya"], .25)

# ---------- hook and city
g(M.lib("whoosh-short"), AT["s1:lautan"] + .2, .04)
plunge = lp(M.burst(1.0, 3.5, 1), 600); g(plunge / np.abs(plunge).max(), 1.6, .12)
g(M.lib("whoosh-cinematic"), AT["s1:tiga"] - .5, .05)
g(M.lib("chime"), AT["s1:doa"], .05)


def bell(t0, f=mid(62), a=.06):
    n = int(3 * SR); tt = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * tt) + .5 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 2) + .3 * np.sin(2 * np.pi * f * 5.4 * tt) * np.exp(-tt * 4)) * np.exp(-tt * 1.1)
    g(x * np.minimum(1, tt / .005), t0, a)


bell(AT["s2:diutus"], mid(62)); bell(AT["s2:kaumnya"], mid(66)); bell(AT["s2:Seruannya"], mid(69))
g(M.thump(.5), AT["s2:ditolak"] + .1, .14)
g(M.lib("whoosh"), AT["s2:pergi"], .045)
for k in ("s2", "s3", "s4", "s6", "s7", "s8"):
    x = K[k] - .3
    if abs(x - CUT2) > .5:
        w = M.lib("whoosh-cinematic"); g(np.stack([lp(w[:, 0], 1800), lp(w[:, 1], 1800)], 1), x, .05)

# ---------- s4 layers, doa
for k in ("s4:perut", "s4:laut", "s4:malam"):
    g(M.lib("ping"), AT[k], .03)
g(M.lib("riser"), CUT3 - 1.2, .03)
for i, w in enumerate(DOA):
    s_ = M.lib("sparkle"); g(s_, w, .025 + .004 * i)
bell(AT["s5:Artinya"], mid(57), .045)
g(M.lib("riser"), AT["s5:mengakui"] - 1.4, .035); bell(AT["s5:mengakui"], mid(62), .07); bell(AT["s5:mengakui"] + .05, mid(69), .04)

# ---------- s6: answer, the shore, the vine
g(M.lib("chime"), AT["s6:Doanya"], .05)
surf = lp(M.burst(2.0, 1.8, 1), 1200); g(surf / np.abs(surf).max(), AT["s6:dilemparkan"] - .2, .16)
g(M.lib("whoosh"), AT["s6:dilemparkan"] + .1, .045)
for x in rng.uniform(AT["s6:tumbuh"], AT["s6:tumbuh"] + 2.6, 60):
    g(M.band(M.burst(.04, 80, 1), 2000, 8000), x, .02 * rng.uniform(.4, 1))
g(M.lib("sparkle"), AT["s6:tumbuh"] + .2, .04)

# ---------- s7: lights across the city, the cloud lifts
for i, x in enumerate(np.sort(rng.uniform(AT["s7:seratus"], AT["s7:lebih"] + 1.8, 34))):
    g(M.tone((mid(HJ[i % 8] + 12), mid(HJ[i % 8] + 24)), .25, 12), x, .012)
bell(AT["s7:beriman"], mid(62), .06)
g(M.lib("impact-bass-1"), AT["s7:Surah"] + .2, .05)
lift = M.band(rng.standard_normal(int(3 * SR)), 300, 2500) * np.linspace(0, 1, int(3 * SR)) ** 2 * np.linspace(1, 0, int(3 * SR)) ** .3
g(lift / np.abs(lift).max(), AT["s7:diangkat"] - 1.2, .06)

# ---------- s8, outro
bell(K["s8"] + .3, mid(62), .05)
g(M.lib("chime"), AT["s8:Kapan"], .04)
g(M.lib("whoosh"), OUT - .25, .045); bell(OUT + .3, mid(62), .06); bell(OUT + .32, mid(69), .035)

M.finish(music)
print("duration", DUR)
