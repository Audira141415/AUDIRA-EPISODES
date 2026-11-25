"""EP38 sound: a quiet sewing room. A slow drone in D (tanpura-like, D-A) with a soft plucked melody and a gentle
tabla-like pulse (low dayan "dha" + high tap). Foley: fabric rustle on every camera move across the cloth, a needle
pierce (tiny tick + thread pull) for each sewn line, soft taps as tags and patches land, card flicks and a wooden chess
thunk for the legend, a brass ring for the 1713 plaque, a fabric tear-like rip for the 1947 line, quick pops for the
trapped patches, village ambience, a ticking clock that races then strikes twelve at midnight, and a warm swell at
the payoff. Calm and warm; nothing above the voice bed.
Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(3838)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# --- score: tanpura drone + plucks + soft tabla ---
def drone(f, d):
    tt = np.arange(int(d * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * tt + 0.4 * np.sin(2 * np.pi * 0.09 * tt * h)) / h ** 1.4 for h in range(1, 9))
    return x * (1 + 0.25 * np.sin(2 * np.pi * 0.13 * tt))

def pluck(f, d=2.2, a=1.0):
    tt = np.arange(int(d * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * tt) * np.exp(-tt * (1.6 + 1.1 * h)) / h for h in range(1, 7))
    return a * x * np.minimum(1, tt / 0.003)

def dha(a=1.0):
    tt = np.arange(int(0.7 * SR)) / SR
    f = 95 + 60 * np.exp(-tt * 14)
    return a * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 6)

def tap(a=1.0, f=1900):
    tt = np.arange(int(0.18 * SR)) / SR
    return a * (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 38) + 0.4 * M.band(M.burst(0.18, 60, 1), 2000, 7000)[: len(tt)])

pad, mel, perc = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.0, DUR - 1, 6.0):
    for f, a in ((hz(50), 0.6), (hz(57), 0.45), (hz(62), 0.35)):
        d = 7.5; x = drone(f, d); tt = np.arange(len(x)) / SR
        M.lay(pad, x * np.minimum(1, tt / 1.5) * np.minimum(1, (d - tt) / 1.5), t0, a)
SCALE = [62, 64, 65, 67, 69, 70, 72, 74]  # D dorian-ish
q = np.random.default_rng(38)
beat = 0.75
for k, t0 in enumerate(np.arange(1.5, END, beat)):
    if k % 8 in (0, 3, 5) and q.random() < 0.8:
        M.lay(mel, pluck(hz(SCALE[q.integers(0, 8)]), 2.4, 0.5), t0)
    if k % 4 == 0:
        M.lay(perc, dha(0.8), t0)
    elif k % 4 == 2:
        M.lay(perc, tap(0.5), t0)
    elif q.random() < 0.35:
        M.lay(perc, tap(0.25, 2400), t0 + 0.375)
pad = M.band(pad, 40, 2200)
for x in (pad, mel, perc):
    x /= max(1e-6, np.abs(x).max())
e = M.env([(0, 0), (0.6, 0.8), (END, 0.85), (DUR - 0.5, 0), (DUR, 0)])
# hush the pulse in the census beat (hardship) and swell in the payoff
pe = M.env([(0, 1), (K["s6"], 1), (K["s6"] + 0.5, 0.35), (K["s6e"], 0.35), (K["s7"], 1), (DUR, 1)])
mono = 0.38 * pad * e + 0.42 * mel * e + 0.32 * perc * e * pe
music = stereo(mono, 0.1 * mel * e)

# --- foley ---
def rustle(t, d=1.0, a=0.02):
    x = M.band(rng.standard_normal(int(d * SR)), 900, 7000); tt = np.arange(len(x)) / SR
    x *= np.sin(np.pi * tt / d) ** 2 * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 5 * tt)))
    g(x / np.abs(x).max(), t, a)

def pierce(t, a=0.025):
    g(M.band(M.burst(0.02, 300, 1), 3000, 11000), t, a)
    x = M.band(rng.standard_normal(int(0.22 * SR)), 1500, 6000); tt = np.arange(len(x)) / SR
    g(x / np.abs(x).max() * np.exp(-tt * 9) * np.minimum(1, tt / 0.04), t + 0.05, a * 0.5)

def sewing(t0, t1, rate=0.18, a=0.018):
    for t in np.arange(t0, t1, rate):
        pierce(t, a)

def soft(t, a=0.03):
    g(M.band(M.burst(0.06, 90, 2), 200, 3000), t, a); g(M.tone((180,), 0.2, 18), t, a * 0.4)

def bell(t, f=880, a=0.03, d=2.5, dec=1.4):
    g(M.tone((f, f * 2.76, f * 5.4), d, dec), t, a)

# camera moves across the cloth
for a_, b_ in ((K["s1e"] - 0.4, K["s1e"] + 0.8), (K["s2e"] - 0.4, K["s3"] + 0.9), (K["s3e"] - 0.3, AT["s4:1947"] + 1.0),
               (K["s4e"] - 0.8, K["s5"] + 0.6), (K["s5e"] - 0.4, K["s6"] + 1.2), (K["s6e"] - 0.4, K["s7"] + 0.8),
               (AT["s7:Tengah"] + 0.2, AT["s7:seratus"] - 0.4), (K["s7e"] - 0.2, AT["s8:Peta"] + 1.5)):
    rustle(a_, max(0.6, b_ - a_), 0.022)
# hook: each layer lights up
for k in ("s1:India", "s1:Bangladesh", "s1:India#2", "s1:Bangladesh#2"):
    soft(AT[k] - 0.05, 0.03); g(M.tone((hz(74),), 0.6, 5), AT[k], 0.008)
sewing(AT["s1:Satu-satunya"] - 0.15, AT["s1:Satu-satunya"] + 0.7, 0.12, 0.02)
bell(AT["s1:Satu-satunya"] + 0.75, 1320, 0.02)
# pitch + chitmahal
sewing(AT["s2:lapangan"] - 0.3, AT["s2:lapangan"] + 1.1, 0.1, 0.016)
soft(AT["s2:chitmahal"] - 0.1, 0.035)
# legend: cards and chess king, plaque
g(M.lib("pop"), AT["s3:Konon"], 0.02)
for i in range(3):
    g(M.band(M.burst(0.05, 120, 1), 1500, 9000), AT["s3:kartu"] - 0.5 + i * 0.12 + 0.4, 0.03)
g(M.thump(0.25), AT["s3:catur"] - 0.05, 0.05); g(M.tone((420, 860), 0.25, 20), AT["s3:catur"] - 0.05, 0.02)
bell(AT["s3:1713"] - 0.1, 520, 0.03, 3.0, 1.1)
sewing(AT["s3:menetapkan"] - 0.1, AT["s3:jelas"] + 0.1, 0.24, 0.014)
# 1947: the line is sewn like a tear across the cloth
d47 = max(1.0, AT["s4:dibagi"] + 0.45 - AT["s4:1947"] - 0.2)
x = M.band(rng.standard_normal(int(d47 * SR)), 300, 5000); tt = np.arange(len(x)) / SR
x *= (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 7 * tt))) * np.minimum(1, tt / 0.1) * np.minimum(1, (d47 - tt) / 0.2)
g(x / np.abs(x).max(), AT["s4:1947"] + 0.2, 0.03)
g(M.thump(0.5), AT["s4:1947"], 0.05)
soft(AT["s4:Koch"] - 0.1, 0.03); soft(AT["s4:Pakistan"] - 0.1, 0.03)
dt = max(0.8, AT["s4:terjebak"] - AT["s4:Ratusan"] + 0.6)
for i in range(30):
    g(M.tone((1500 + 90 * (i % 6),), 0.07, 45), AT["s4:Ratusan"] - 0.2 + i * dt / 30, 0.006)
# counts: tag lands in gold
for k in ("s5:seratus", "s5:dua#2", "s5:Dahala"):
    soft(AT[k] - 0.25, 0.03); bell(AT[k] - 0.2, 990, 0.014, 1.6, 2.0)
# village ambience: distant birds and a soft wind
for i in range(10):
    t = K["s6"] + 1.0 + i * 0.85
    g(M.tone((3200 + 300 * (i % 3), 3600 + 300 * (i % 2)), 0.12, 25), t, 0.004)
wind = M.band(rng.standard_normal(int(9 * SR)), 150, 900); tw = np.arange(len(wind)) / SR
g(wind / np.abs(wind).max() * np.sin(np.pi * tw / 9) ** 2, K["s6"] + 0.6, 0.01)
for i in range(12):
    g(M.tone((700 + 40 * (i % 4),), 0.06, 50), AT["s6:Sensus"] + 1.0 + i * 0.28, 0.006)
bell(AT["s6:lima"] - 0.2, 660, 0.015, 1.8, 2.0)
# clock: ticks, a racing whirr, strike twelve
for t in np.arange(K["s7"] + 0.4, AT["s7:baru"], 0.5):
    g(M.band(M.burst(0.015, 400, 1), 2500, 9000), t, 0.012)
dr = max(1.0, AT["s7:Tengah"] - AT["s7:baru"])
for t in np.arange(AT["s7:baru"], AT["s7:Tengah"] - 0.1, 0.06):
    g(M.band(M.burst(0.012, 500, 1), 2500, 9000), t, 0.008)
for i in range(3):
    bell(AT["s7:Tengah"] + i * 0.9, 392, 0.035 - i * 0.006, 3.2, 0.9)
g(M.lib("riser"), AT["s7:seratus"] - 1.3, 0.012)
sewing(AT["s7:seratus"] - 0.35, AT["s7:ditukar"] + 0.1, 0.09, 0.012)
soft(AT["s7:memilih"], 0.025)
# payoff: warm swell, AUDIRA tag glint
sw = M.tone((hz(62), hz(69), hz(74)), 4.0, 0.4); tt = np.arange(len(sw)) / SR
g(sw * np.minimum(1, tt / 1.2), AT["s8:disederhanakan"] - 0.4, 0.02)
bell(AT["s8:AUDIRA"], 1760, 0.015, 1.4, 2.4)
g(M.lib("chime"), OUT + 0.3, 0.05)
# room tone
air = M.band(rng.standard_normal(N), 80, 1200)
air /= np.abs(air).max()
M.fx += np.stack([air, np.roll(air, 900)], 1) * 0.004
M.finish(music)
print("duration", DUR)
