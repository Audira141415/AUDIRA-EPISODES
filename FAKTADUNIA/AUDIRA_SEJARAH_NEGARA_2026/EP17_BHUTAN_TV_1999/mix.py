"""EP17 sound: 80s synthwave. A-minor Am-F-C-G progression at 100 bpm: saw arpeggio in 16ths, pulsing octave bass, warm pad,
gated kick/snare. Tape hiss under everything. The ban era (s4-s5) is muffled and thin like a worn VHS; on BBS power-on (s6)
the full band returns. Foley: channel-switch clicks and static bursts on every CRT squeeze, a stamp thump on DILARANG,
signal blips for the spillover arcs, a crowd swell for the 1998 pilot, a tube power-on whine, a clock beep at 19.00,
three slash hits for the banned channels. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1999)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 100
bar = beat * 4
prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
chord = lambda t: prog[int(t / bar) % 4]

arp, bass, pad, drum = M.mono(), M.mono(), M.mono(), M.mono()
for k, t0 in enumerate(np.arange(0.05, DUR, beat / 4)):
    ch = chord(t0)
    m = ch[k % 3] + 12 * ((k // 3) % 2)
    M.lay(arp, M.note(hz(m + 12), beat / 4 * 0.9, "saw", 9), t0, 0.5)
for k, t0 in enumerate(np.arange(0.05, DUR, beat / 2)):
    r = chord(t0)[0] - 24 + (12 if k % 2 else 0)
    M.lay(bass, M.note(hz(r), beat / 2 * 0.85, "saw", 5), t0, 0.8)
for t0 in np.arange(0.05, DUR, bar):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), bar, "tri", 0.3, 0.4), t0, 0.4)
        M.lay(pad, M.note(hz(m) * 1.005, bar, "tri", 0.3, 0.4), t0, 0.3)
def kick():
    tt = np.arange(int(0.3 * SR)) / SR
    return np.sin(2 * np.pi * (50 * tt + 90 * (1 - np.exp(-tt * 30)) / 30)) * np.exp(-tt * 12)
def snare():
    x = M.band(M.burst(0.35, 9, 1), 900, 8000)
    return x * 0.7
for k, t0 in enumerate(np.arange(0.05, DUR, beat)):
    M.lay(drum, kick(), t0, 0.9)
    if k % 2 == 1:
        M.lay(drum, snare(), t0, 0.6)
arp = M.band(arp, 200, 6000)
for x in (arp, bass, pad, drum):
    x /= max(1e-6, np.abs(x).max())

s4, s6 = K["s4"], K["s6"]
# ban era: thin and muffled (bootleg VHS), drums out; full band on power-on
e_full = M.env([(0, 0.6), (3.0, 1), (s4 - 0.3, 1), (s4 + 0.4, 0.0), (s6 - 0.1, 0.0), (s6 + 0.25, 1.1), (s6 + 3, 1), (END, 1), (DUR - 0.4, 0), (DUR, 0)])
e_lofi = M.env([(0, 0), (s4 - 0.3, 0), (s4 + 0.4, 1), (s6 - 0.6, 1), (s6 - 0.3, 0), (DUR, 0)])
e_drum = M.env([(0, 0), (K["s2"] - 0.1, 0), (K["s2"] + 0.3, 1), (s4 - 0.3, 1), (s4 + 0.2, 0), (s6, 0), (s6 + 0.2, 1), (END, 1), (DUR - 0.4, 0), (DUR, 0)])
full = 0.42 * arp + 0.5 * bass + 0.35 * pad
lofi = M.band(0.5 * pad + 0.35 * arp + 0.3 * bass, 250, 2200)
lofi = lofi / max(1e-6, np.abs(lofi).max()) * (1 + 0.04 * np.sin(2 * np.pi * 0.7 * T))  # tape wow
mono = full * e_full + 0.7 * lofi * e_lofi + 0.32 * drum * e_drum
music = stereo(mono, 0.12 * arp * e_full)

# --- foley ---
def click(t, a=0.1):
    g(M.band(M.burst(0.025, 200, 1), 1500, 9000), t, a)
    g(M.tone((900,), 0.03, 80), t, a * 0.5)

def static(t, d=0.35, a=0.05):
    x = M.band(M.burst(d, 4, 1), 800, 12000)
    x *= np.minimum(1, np.arange(len(x)) / (0.02 * SR))
    g(x, t, a)

# CRT squeezes (full-frame cuts) and in-screen content switches
for t in (K["s3"], AT["s3:Tahun#2"], K["s4"], K["s7"], K["s8"]):
    click(t - 0.2, 0.12); g(M.tone((15000 / 2,), 0.12, 30), t - 0.18, 0.01); static(t - 0.05, 0.35, 0.05); click(t + 0.12, 0.08)
for t in (K["s2"], AT["s5:Setelah"], AT["s6:Siarannya"], AT["s7:Beberapa"], K["s5"]):
    click(t - 0.15, 0.09); static(t - 0.05, 0.2, 0.03)
# hook: snow under the first seconds, stamp
static(0.05, 2.6, 0.03)
g(M.lib("impact-bass-1"), 0.05, 0.05)
g(M.thump(0.3), AT["s1:dilarang"], 0.12); click(AT["s1:dilarang"], 0.1)
# spillover arcs: radio blips rising
for a in ("s3:India", "s3:Bangladesh"):
    for i in range(6):
        g(M.tone((1200 + i * 180,), 0.06, 30), AT[a] + i * 0.12, 0.025)
static(AT["s3:bocor"], 1.4, 0.025)
# 1989 ban: icons pop, stamp
g(M.lib("pop"), AT["s3:pesawat"], 0.05); g(M.lib("pop"), AT["s3:parabola"], 0.05)
g(M.lib("riser"), AT["s3:dilarang"] - 1.0, 0.025)
g(M.thump(0.35), AT["s3:dilarang"], 0.2); g(M.lib("impact-bass-1"), AT["s3:dilarang"], 0.05)
# VHS: play button clunk, tape motor
click(AT["s4:film"] - 0.1, 0.14); g(M.thump(0.12), AT["s4:film"] - 0.08, 0.05)
motor = M.band(rng.standard_normal(N), 60, 400); motor /= np.abs(motor).max()
me = M.env([(0, 0), (AT["s4:film"], 0), (AT["s4:film"] + 0.3, 1), (K["s5"] - 0.3, 1), (K["s5"], 0), (DUR, 0)])
M.fx += np.stack([motor * me, motor * me], 1) * 0.008
# 1998 final: stadium crowd swell
crowd = M.band(rng.standard_normal(N), 300, 3500); crowd /= np.abs(crowd).max()
ce = M.env([(0, 0), (K["s5"], 0), (AT["s5:final"], 0.5), (M.word("s5", "1998"), 1), (AT["s5:Ada"], 0.6), (AT["s5:Setelah"] - 0.2, 0.4), (AT["s5:Setelah"], 0), (DUR, 0)])
M.fx += np.stack([crowd * ce, np.roll(crowd, 800) * ce], 1) * 0.03
g(M.lib("ping"), AT["s5:diizinkan"], 0.04)
# payoff: power off, silence, tube power-on whine + bass hit
static(s6 - 0.6, 0.25, 0.05)
tt = np.arange(int(1.2 * SR)) / SR
whine = np.sin(2 * np.pi * (4000 * tt + 3000 * tt ** 2)) * np.minimum(1, tt / 0.05) * np.exp(-tt * 2.2)
g(whine, s6, 0.012)
g(M.thump(0.4), s6, 0.18); g(M.lib("impact-bass-1"), s6 + 0.02, 0.07); g(M.lib("sparkle"), AT["s6:BBS"], 0.05)
g(M.lib("chime"), AT["s6:dua"], 0.035)
# clock beeps, then 19.00
for i in range(3):
    g(M.tone((2000,), 0.08, 10), AT["s6:jam"] + i * 0.42, 0.03)
g(M.tone((2000, 2600), 0.25, 8), AT["s6:tujuh"], 0.05)
# cable tiles multiplying: quick channel clicks
for i in range(26):
    click(K["s7"] + 0.35 + i * 0.12, 0.04)
# banned channels: slash hits
for a in ("s7:WWE", "s7:Fashion", "s7:MTV"):
    g(M.lib("whoosh-short"), AT[a] - 0.1, 0.05); g(M.thump(0.2), AT[a] + 0.15, 0.12); g(M.lib("glitch-1"), AT[a] + 0.1, 0.03)
# outro
g(M.lib("pop"), AT["s8:Menurut"], 0.04)
g(M.lib("chime"), OUT + 0.3, 0.06)
# tape hiss bed
hiss = M.band(rng.standard_normal(N), 3000, 14000); hiss /= np.abs(hiss).max()
M.fx += np.stack([hiss, np.roll(hiss, 1100)], 1) * 0.004
M.finish(music)
print("duration", DUR)
