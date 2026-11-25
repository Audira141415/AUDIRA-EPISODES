"""EP19 sound: a Cold War score that turns calm. Low string drone and a pulsing synth ostinato in D minor at 92 bpm,
soft timpani on each panel cut; from s8 the pulse drops out and the pad resolves to D major. Foley without scary
cues (no sirens, no Geiger): concrete slabs grinding apart, a heavy blast-door clank, ventilation hum in the bunker,
paper unrolling, a rubber stamp, gentle schematic pulses for the blast ring, calendar flips, plastic ticks as places
fill, soft plops as people icons land, box thunks and weight clanks. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1963)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 92
calm = AT["s8:Negara"]
cuts = [AT[k] for k in ("s3:Dasar", "s4:Belakangan", "s5:Ada", "s6:Tahun", "s7:Kini")]

# --- score ---
# Dm - Bb - Gm - A (tense), then D major - G - D (calm)
tense = [[38, 50, 53, 57], [34, 50, 53, 58], [31, 50, 55, 58], [33, 49, 52, 57]]
calmc = [[38, 50, 54, 57], [43, 50, 55, 59], [38, 50, 54, 57], [45, 49, 52, 57]]
bar = beat * 4
def chord(t):
    return (calmc if t >= calm - 0.3 else tense)[int(t / bar) % 4]

def string(f, d, bright=1.0):
    tt = np.arange(int(d * SR)) / SR
    vib = 1 + 0.003 * np.sin(2 * np.pi * 5.0 * tt)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = sum(np.sin(h * ph) / h ** (1.3 - 0.3 * bright) for h in range(1, 8))
    return x * np.minimum(1, tt / 0.6) * np.minimum(1, (d - tt) / 0.6)

pad, ost, bass, timp = M.mono(), M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.0, DUR, bar):
    for m in chord(t0 + 0.01)[1:]:
        M.lay(pad, string(hz(m), bar + 0.7), t0, 0.33)
    M.lay(bass, string(hz(chord(t0 + 0.01)[0]), bar + 0.7, 0.4), t0, 0.7)
# ostinato: 8th-note pulse on the root/fifth, a little Cold War clockwork
for k, t0 in enumerate(np.arange(0.05, calm, beat / 2)):
    ch = chord(t0)
    m = ch[0] + 12 + (7 if k % 4 == 2 else 0) + (12 if k % 8 == 7 else 0)
    M.lay(ost, M.note(hz(m), beat * 0.45, "saw", 7, 0.004), t0, 0.5 if k % 2 == 0 else 0.32)
# calm motif: a soft celesta-like line after s8
for k, t0 in enumerate(np.arange(calm + 0.2, DUR - 0.5, beat)):
    m = [74, 78, 81, 78, 76, 74, 73, 74][k % 8]
    M.lay(timp, M.tone((hz(m), hz(m) * 2.0, hz(m) * 3.01), 1.4, 3.2), t0, 0.22)
def tim(t, a=1.0):
    tt = np.arange(int(1.2 * SR)) / SR
    x = np.sin(2 * np.pi * (hz(38) * tt + 6 * (1 - np.exp(-tt * 20)) / 20)) * np.exp(-tt * 3.2)
    x += 0.3 * M.band(M.burst(1.2, 18, 2), 60, 500)
    M.lay(bass, x * a, t, 1.0)
for c in cuts:
    tim(c - 0.02, 0.9)
tim(0.05, 1.0)
ost = M.band(ost, 90, 2600)
pad = M.band(pad, 80, 3200)
for x in (pad, ost, bass, timp):
    x /= max(1e-6, np.abs(x).max())
e_ost = M.env([(0, 0.0), (0.6, 0.55), (cuts[0], 0.6), (cuts[3], 0.75), (calm - 1.2, 0.7), (calm + 0.4, 0), (DUR, 0)])
e_pad = M.env([(0, 0.6), (calm - 0.5, 0.6), (calm + 1.5, 0.9), (END, 0.9), (DUR - 0.4, 0), (DUR, 0)])
e_bass = M.env([(0, 0.8), (calm, 0.8), (calm + 1.5, 0.45), (DUR - 0.4, 0), (DUR, 0)])
mono = 0.42 * pad * e_pad + 0.3 * ost * e_ost + 0.5 * bass * e_bass + 0.28 * timp
music = stereo(mono, 0.07 * pad * e_pad + 0.05 * timp)

# --- foley ---
def grind(t, d=0.9, a=0.06):
    x = M.band(rng.standard_normal(int(d * SR)), 70, 900)
    tt = np.arange(len(x)) / SR
    x *= np.minimum(1, tt / 0.12) * np.minimum(1, (d - tt) / 0.25) * (0.7 + 0.3 * np.sin(2 * np.pi * 13 * tt))
    g(x / np.abs(x).max(), t, a)

def clank(t, a=0.2):
    """heavy steel door: a deep thump, a low metallic body and a short ring"""
    g(M.thump(0.5), t, a)
    g(M.tone((96, 151, 233, 377), 0.9, 6), t + 0.005, a * 0.5)
    g(M.tone((1210, 1873, 2650), 0.5, 11), t + 0.01, a * 0.12)
    g(M.band(M.burst(0.08, 60, 1), 1500, 8000), t, a * 0.5)

def tick(t, a=0.05):
    g(M.band(M.burst(0.025, 180, 1), 2000, 9000), t, a); g(M.tone((1500,), 0.04, 70), t, a * 0.3)

def plop(t, a=0.04):
    tt = np.arange(int(0.12 * SR)) / SR
    g(np.sin(2 * np.pi * (300 * tt + 600 * (1 - np.exp(-tt * 30)) / 30)) * np.exp(-tt * 30), t, a)

def thunk(t, a=0.08):
    g(M.band(M.burst(0.12, 40, 3), 90, 900), t, a); g(M.tone((140, 210), 0.15, 25), t, a * 0.6)

def flip(t, a=0.04):
    g(M.band(M.burst(0.09, 45, 2), 1200, 7000), t, a)

# panel slide-apart: slabs grind in, meet with a thud, part
for c in cuts:
    grind(c - 0.45, 0.4, 0.05); g(M.thump(0.3), c - 0.06, 0.1); grind(c + 0.08, 0.5, 0.045)
# hook: the cover slabs open, people pop in, the door slams
tR = AT["s1:tempat"] - 0.2
grind(tR, 1.1, 0.07)
for i in range(10):
    plop(AT["s1:semua"] + i * 0.05, 0.03)
g(M.lib("pop"), AT["s1:lebih"], 0.05)
clank(AT["s1:Bahkan"] - 0.25 + 0.3, 0.22)
# ventilation hum while inside the bunker
hum = M.band(rng.standard_normal(N), 70, 420) * 0.6 + 0.4 * np.sin(2 * np.pi * 100 * T)
hum /= np.abs(hum).max()
he = M.env([(0, 0), (tR + 0.6, 0), (tR + 1.4, 1), (cuts[0] - 0.4, 1), (cuts[0], 0), (cuts[4], 0), (cuts[4] + 0.6, 1), (AT["s7:Setiap"] + 1.0, 1), (AT["s7:Setiap"] + 2.5, 0), (DUR, 0)])
M.fx += np.stack([hum * he, np.roll(hum, 400) * he], 1) * 0.012
# 1963: paper unrolls, the stamp lands
g(M.band(M.burst(1.4, 2, 4), 900, 6000) * 0.5, cuts[0] + 0.2, 0.05)
g(M.lib("whoosh-short"), AT["s3:wajib"] - 0.5, 0.04); thunk(AT["s3:wajib"] - 0.1, 0.16); g(M.thump(0.25), AT["s3:wajib"] - 0.1, 0.08)
thunk(AT["s3:Bangunan"] + 0.1, 0.06)
# 1978: schematic pulses, soft and tonal (no explosion)
g(M.lib("ping"), AT["s4:bunker"] - 0.2, 0.04)
for k in range(6):
    tk = AT["s4:menahan"] - 0.2 + k * 0.33 / 0.55
    g(M.tone((220, 330), 0.9, 4), tk, 0.025)
g(M.lib("pop"), AT["s4:megaton"], 0.05); g(M.lib("pop"), AT["s4:tujuh"] + 0.2, 0.04)
clank(AT["s4:menahan"] + 0.3, 0.1)
# tunnel: calendar flips to 4+
for k in range(3):
    flip(AT["s5:lebih"] + k * 0.25, 0.05)
flip(AT["s5:empat"], 0.06); g(M.lib("chime"), AT["s5:empat"] + 0.05, 0.035)
# board: places tick in, people icons land
for i in range(100):
    tick(AT["s6:tiga"] + i / 100 * (AT["s6:5.100"] - AT["s6:tiga"] + 0.3), 0.022)
for i in range(14):
    tick(AT["s6:5.100"] + 0.2 + i * 0.06, 0.03)
for i in range(0, 100, 3):
    plop(AT["s6:114"] - 0.05 + (i % 12) * 0.03 + (i // 12) * 0.07, 0.022)
g(M.lib("riser"), AT["s6:114"] - 1.0, 0.03); g(M.lib("impact-bass-1"), AT["s6:114"] + 0.35, 0.045)
# bars
g(M.lib("whoosh"), AT["s7:Sebagai"] - 0.2, 0.04); tick(AT["s7:Jerman"], 0.06)
# repurposed bunker: door opens, boxes and weights land, stamp
clank(cuts[4] + 0.3, 0.08)
for k in range(4):
    thunk(AT["s7:gudang"] + k * 0.07, 0.07)
for k in range(3):
    g(M.tone((520, 1310, 2210), 0.4, 14), AT["s7:olahraga"] + 0.05 + k * 0.08, 0.04)
thunk(AT["s7:kewajiban"], 0.16); g(M.thump(0.25), AT["s7:kewajiban"], 0.1)
for i in range(16):
    plop(AT["s7:Setiap"] + 0.3 + i * 0.05, 0.022)
# outro
g(M.lib("pop"), AT["s8:Menurut"], 0.04)
g(M.lib("chime"), OUT + 0.3, 0.06)
# outdoor air
air = M.band(rng.standard_normal(N), 150, 1800)
air /= np.abs(air).max()
M.fx += np.stack([air, np.roll(air, 900)], 1) * 0.004
M.finish(music)
print("duration", DUR)
