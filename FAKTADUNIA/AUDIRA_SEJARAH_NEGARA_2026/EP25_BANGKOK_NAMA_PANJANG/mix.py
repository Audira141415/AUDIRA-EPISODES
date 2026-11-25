"""EP25 sound: a calm temple-court score. A low drone on D with a soft fifth, a pentatonic mallet line (ranat-like
wooden bars) at 84 bpm, a small bright cymbal tick on every other beat, and soft gongs at the hook, the record plaque
and the payoff. Foley: paper unrolling, a quill scratch per gold word, a pen strike, water for the river, wax seals,
small bells as each meaning lights up, sparkles for the nine gems, a brass plaque lifting, an abstract muted
guitar chug and record crackle for the 1989 beat (no melody of the song, no lyrics), tile clacks for the short forms.
Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1782)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 84
NAME_N = 21

# --- score ---
def drone(f, d):
    tt = np.arange(int(d * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * tt + h) / h ** 1.6 for h in range(1, 6))
    return x * (1 + 0.15 * np.sin(2 * np.pi * 0.13 * tt))

def mallet(f, d=0.9):
    tt = np.arange(int(d * SR)) / SR
    x = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 7) + 0.45 * np.sin(2 * np.pi * f * 3.98 * tt) * np.exp(-tt * 18) + 0.2 * np.sin(2 * np.pi * f * 9.1 * tt) * np.exp(-tt * 40)
    return x * np.minimum(1, tt / 0.002)

def gong(t, a=1.0, f=98):
    tt = np.arange(int(5.0 * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * r * tt + r) * np.exp(-tt * dk) * w for r, dk, w in ((1, 0.7, 1), (1.47, 1.1, 0.5), (2.09, 1.6, 0.35), (2.76, 2.3, 0.2)))
    x *= (1 + 0.25 * np.sin(2 * np.pi * 3.2 * tt)) * np.minimum(1, tt / 0.01)
    M.lay(gongs, x * a, t, 1.0)

pad, mal, tick, gongs = M.mono(), M.mono(), M.mono(), M.mono()
M.lay(pad, drone(hz(38), DUR) + 0.6 * drone(hz(45), DUR), 0, 0.5)
# pentatonic D-E-F#-A-B, a slow wandering line in two registers
PENT = [62, 64, 66, 69, 71, 74, 76, 78, 81]
q = np.random.default_rng(25)
idx = 4
for k, t0 in enumerate(np.arange(0.4, DUR - 0.6, beat / 2)):
    if k % 8 in (3, 7) and q.random() < 0.6:
        continue
    idx = int(np.clip(idx + q.choice([-2, -1, -1, 1, 1, 2]), 0, len(PENT) - 1))
    M.lay(mal, mallet(hz(PENT[idx]), 0.9), t0, 0.5 if k % 2 == 0 else 0.33)
    if k % 4 == 0:
        M.lay(mal, mallet(hz(PENT[idx] - 12), 1.2), t0, 0.32)
for k, t0 in enumerate(np.arange(0.4, DUR - 0.6, beat)):
    if k % 2 == 1:
        M.lay(tick, M.band(M.burst(0.18, 30, 1), 3500, 11000) + 0.5 * M.tone((2793, 4190), 0.18, 18), t0, 0.5)
gong(0.05, 1.0)
gong(AT["s6:seratus"] - 0.05, 0.8)
gong(OUT - 0.4, 0.9, 87)
pad = M.band(pad, 50, 1600)
for x in (pad, mal, tick, gongs):
    x /= max(1e-6, np.abs(x).max())
s7, s8 = K["s7"], K["s8"]
e_mal = M.env([(0, 0.0), (0.6, 0.6), (s7 - 0.4, 0.6), (s7 + 0.3, 0.25), (AT["s7:Sehari-hari"], 0.25), (AT["s7:Sehari-hari"] + 1, 0.6), (END, 0.65), (DUR - 0.4, 0), (DUR, 0)])
e_pad = M.env([(0, 0.7), (END, 0.8), (DUR - 0.4, 0), (DUR, 0)])
e_tick = M.env([(0, 0), (2, 0.5), (s7 - 0.3, 0.5), (s7, 0.15), (s8, 0.4), (DUR - 0.5, 0), (DUR, 0)])
mono = 0.4 * pad * e_pad + 0.42 * mal * e_mal + 0.12 * tick * e_tick + 0.4 * gongs
music = stereo(mono, 0.06 * mal * e_mal + 0.05 * tick * e_tick)

# --- foley ---
def rustle(t, d=1.0, a=0.05):
    x = M.band(rng.standard_normal(int(d * SR)), 900, 7000)
    tt = np.arange(len(x)) / SR
    x *= np.minimum(1, tt / 0.1) * np.minimum(1, (d - tt) / 0.3) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 6 * tt)))
    g(x / np.abs(x).max(), t, a)

def scratch(t, d=0.18, a=0.03):
    x = M.band(rng.standard_normal(int(d * SR)), 2500, 9000)
    tt = np.arange(len(x)) / SR
    x *= (0.5 + 0.5 * np.sin(2 * np.pi * 34 * tt) ** 2) * np.minimum(1, (d - tt) / 0.05)
    g(x / np.abs(x).max(), t, a)

def thunk(t, a=0.08):
    g(M.band(M.burst(0.12, 40, 3), 90, 900), t, a); g(M.tone((140, 210), 0.15, 25), t, a * 0.6)

def bell(t, f=1318, a=0.04):
    g(M.tone((f, f * 2.76, f * 5.4), 1.4, 3.5), t, a)

def clack(t, a=0.06):
    g(M.band(M.burst(0.05, 120, 1), 1500, 6000), t, a); g(M.tone((900, 1450), 0.08, 45), t, a * 0.6)

# hook: the scroll unrolls while the quill writes 21 words
tW0, tW1 = 0.3, AT["s1:huruf"] - 0.05
dW = (tW1 - tW0) / NAME_N
rustle(0.05, tW1 + 0.4, 0.035)
for i in range(NAME_N):
    scratch(tW0 + i * dW, dW * 0.8, 0.028)
g(M.lib("chime"), AT["s1:huruf"], 0.04)
# pen strike through BANGKOK, then the note
scratch(AT["s1:Bangkok"] - 0.05, 0.4, 0.06)
scratch(AT["s2:Bangkok"] - 0.1, 0.7, 0.035)
g(M.lib("whoosh-short"), AT["s2:Kata"] - 0.3, 0.03)
# map: paper, the river runs, crown and 1782 seal
rustle(K["s3"] - 0.2, 0.8, 0.04)
w = M.band(rng.standard_normal(int(2.2 * SR)), 300, 2500)
tt = np.arange(len(w)) / SR
w *= np.minimum(1, tt / 0.4) * np.minimum(1, (2.2 - tt) / 0.6) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.7 * tt))
g(w / np.abs(w).max(), AT["s3:Sungai"] - 0.4, 0.035)
clack(AT["s3:timur"], 0.06); bell(AT["s3:timur"] + 0.05, 1760, 0.025)
thunk(AT["s3:1782"], 0.16); g(M.thump(0.25), AT["s3:1782"], 0.08)
g(M.lib("whoosh"), AT["s3:Sejak"] - 0.2, 0.03)
# s4: each spoken word gleams
for k in ("s4:Krung", "s4:Thep", "s4:Maha", "s4:Nakhon", "s4:Amon", "s4:Rattanakosin", "s4:Mahintharayutthaya"):
    g(M.lib("sparkle"), AT[k] - 0.03, 0.012)
rustle(AT["s4:dan"], 1.6, 0.03)
# meanings: bells, gems
g(M.lib("whoosh"), K["s5"] - 0.2, 0.03)
for i, k in enumerate(("s5:malaikat", "s5:abadi", "s5:takhta", "s5:istana", "s5:dewa", "s5:Wishwakarma", "s5:Indra")):
    bell(AT[k] - 0.05, [1175, 1318, 1480, 1760, 1976, 2349, 2637][i], 0.035)
for i in range(9):
    g(M.lib("sparkle"), AT["s5:sembilan"] + i * 0.07, 0.014)
# plaque lifts, star seal on "huruf"
g(M.lib("whoosh-short"), AT["s6:Guinness"] - 0.4, 0.04)
g(M.tone((180, 270, 433), 0.6, 6), AT["s6:Guinness"] + 0.2, 0.05)
thunk(AT["s6:huruf"], 0.14); g(M.thump(0.25), AT["s6:huruf"], 0.08)
# 1989: record crackle + an abstract muted chug (no melody of the song)
cr = np.zeros(int(6.0 * SR))
for p in rng.integers(0, len(cr) - 200, 260):
    cr[p:p + 30] += rng.standard_normal(30) * np.exp(-np.arange(30) / 6)
g(M.band(cr, 1500, 9000) / max(1e-6, np.abs(cr).max()), AT["s7:lagu"] - 0.4, 0.03)
for k in range(8):
    t0 = AT["s7:lagu"] + 0.1 + k * beat / 2
    x = M.band(M.note(hz(38 + (5 if k % 4 == 3 else 0)), 0.16, "saw", 30, 0.002), 80, 1400)
    g(np.tanh(3 * x / max(1e-6, np.abs(x).max())), t0, 0.035)
# short forms: tiles clack up
clack(AT["s7:Krung"] - 0.1, 0.07)
for k in ("s7:Ko", "s7:Tho", "s7:Mo"):
    clack(AT[k] - 0.05, 0.07)
# payoff: AUDIRA seal
thunk(AT["s8:panggilan"], 0.16); g(M.thump(0.3), AT["s8:panggilan"], 0.1)
g(M.lib("whoosh-cinematic"), AT["s8:Menurut"] + 0.3, 0.03)
g(M.lib("chime"), OUT + 0.3, 0.06)
# candle room air
air = M.band(rng.standard_normal(N), 120, 1500)
air /= np.abs(air).max()
M.fx += np.stack([air, np.roll(air, 900)], 1) * 0.004
M.finish(music)
print("duration", DUR)
