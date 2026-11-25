"""EP47 sound: a calm highland dawn. A soft pad in G (G-D-A open fifths), a breathy flute melody (pentatonic, slow
vibrato), mountain wind under everything and distant cattle bells. Foley: an airy whoosh at every cloud-wipe cut, a
soft chime as the gold crystal lands on 1.400 m, a gentle riser while the level sheets climb (1.000 -> 1.800 m),
wooden knocks for the fortress figures, a low thud for the attack arrows, a paper-tear rip for the 1869 cut,
a flag flutter, water filling the dam, a wool swish for the blanket, a warm swell and AUDIRA glint at the end.
Nothing above the voice bed. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4747)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# --- score: open-fifth pad + breathy flute ---
def pad(f, d):
    tt = np.arange(int(d * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * tt + 0.3 * np.sin(2 * np.pi * 0.07 * tt * h)) / h ** 1.7 for h in range(1, 7))
    return x * (1 + 0.2 * np.sin(2 * np.pi * 0.11 * tt))

def flute(f, d=1.6, a=1.0):
    tt = np.arange(int(d * SR)) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * tt) * np.minimum(1, tt / 0.4)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    x = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    br = M.band(rng.standard_normal(len(tt)), 1500, 6000) * 0.05
    env = np.minimum(1, tt / 0.12) * np.minimum(1, (d - tt) / 0.5)
    return a * (x + br) * env

padb, mel = M.mono(), M.mono()
for t0 in np.arange(0.0, DUR - 1, 7.0):
    for f, a in ((hz(43), 0.6), (hz(50), 0.45), (hz(57), 0.3)):
        d = 8.5; x = pad(f, d); tt = np.arange(len(x)) / SR
        M.lay(padb, x * np.minimum(1, tt / 2.0) * np.minimum(1, (d - tt) / 2.0), t0, a)
SCALE = [67, 69, 71, 74, 76, 79]  # G major pentatonic
q = np.random.default_rng(47)
t0 = 2.0
while t0 < END - 2:
    n = int(q.integers(2, 5))
    for i in range(n):
        d = float(q.choice([0.8, 1.2, 1.6]))
        M.lay(mel, flute(hz(SCALE[q.integers(0, 6)]), d + 0.4, 0.5), t0)
        t0 += d
    t0 += float(q.choice([1.5, 2.5, 3.5]))
padb = M.band(padb, 40, 2400)
for x in (padb, mel):
    x /= max(1e-6, np.abs(x).max())
e = M.env([(0, 0), (0.8, 0.8), (END, 0.85), (DUR - 0.5, 0), (DUR, 0)])
# flute rests during the history cut (s6), swells at the payoff
fe = M.env([(0, 1), (K["s6"], 1), (K["s6"] + 0.6, 0.3), (K["s6e"], 0.3), (K["s7"], 1), (DUR, 1)])
mono = 0.42 * padb * e + 0.34 * mel * e * fe
music = stereo(mono, 0.08 * mel * e)

# --- foley ---
def wind(t, d, a, lo=150, hi=1200):
    x = M.band(rng.standard_normal(int(d * SR)), lo, hi); tt = np.arange(len(x)) / SR
    x *= np.sin(np.pi * tt / d) ** 2 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.3 * tt))
    g(x / np.abs(x).max(), t, a)

def bell(t, f=880, a=0.02, d=2.4, dec=1.6):
    g(M.tone((f, f * 2.76, f * 5.4), d, dec), t, a)

def knock(t, a=0.025):
    g(M.band(M.burst(0.05, 120, 2), 300, 2500), t, a); g(M.tone((260,), 0.12, 30), t, a * 0.5)

# mountain wind bed
for t0 in np.arange(0, DUR - 6, 5.0):
    wind(t0, 7.0, 0.012)
# cloud-wipe cuts
for s in ("s2", "s3", "s4", "s6", "s7"):
    wind(K[s] - 0.6, 1.1, 0.03, 600, 6000)
    g(M.lib("whoosh-short"), K[s] - 0.35, 0.02)
# distant cattle bells on the peaks
for t0 in list(np.arange(1.0, K["s2"], 1.7)) + list(np.arange(K["s4"] + 1, K["s5"], 2.2)) + list(np.arange(K["s7"] + 1, END, 2.4)):
    bell(t0 + q.random() * 0.3, 1200 + 180 * q.integers(0, 3), 0.004, 0.9, 5)
# hook: crystal lands on 1.400 m
bell(AT["s1:titik"] + 0.1, 1568, 0.022, 2.6, 1.3)
g(M.lib("chime"), AT["s1:seribu"] - 0.05, 0.03)
# map: Lesotho rises, border glows, rings close in
g(M.thump(0.3), AT["s2:Lesotho"], 0.035)
g(M.lib("click-soft"), AT["s2:Afrika"], 0.02)
g(M.lib("sparkle"), AT["s2:perbatasannya"], 0.015)
for i in range(3):
    bell(AT["s2:dikelilingi"] - 0.5 + i * 0.35, 660 + 110 * i, 0.012, 1.6, 2.2)
# enclaves pop
for k in ("s3:Vatikan", "s3:San", "s3:Lesotho"):
    g(M.lib("pop"), AT[k] - 0.1, 0.02)
bell(AT["s3:terbesar"], 990, 0.015)
# area count, level sheets climb
for i in range(14):
    g(M.tone((1800 + 60 * (i % 5),), 0.05, 50), AT["s4:tiga"] - 0.2 + i * 0.2, 0.004)
g(M.lib("riser"), AT["s4:seribu"] - 1.2, 0.012)
sw = M.tone((hz(55), hz(62), hz(67)), 3.0, 0.5); tt = np.arange(len(sw)) / SR
g(sw * np.minimum(1, tt / 1.2), AT["s4:delapan"] - 0.3, 0.012)
# fortress: figures pop up, arrows thud against the cliff
for i in range(7):
    knock(AT["s5:Basotho"] - 0.3 + i * 0.08, 0.012)
bell(AT["s5:Raja"], 784, 0.016, 2.4, 1.2)
for i in range(3):
    g(M.thump(0.25), AT["s5:serangan"] + 0.4 + i * 0.12, 0.03)
# history: Boer arrows, 1868 dome hum, 1869 tear
wind(AT["s6:Pemukim"], 1.6, 0.02, 300, 2500)
g(M.tone((220, 330), 1.6, 1.5), AT["s6:perlindungan"] - 0.2, 0.012)
d69 = 1.2
x = M.band(rng.standard_normal(int(d69 * SR)), 300, 5000); tt = np.arange(len(x)) / SR
x *= (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 8 * tt))) * np.minimum(1, tt / 0.08) * np.minimum(1, (d69 - tt) / 0.2)
g(x / np.abs(x).max(), AT["s6:memotong"] - 0.1, 0.03)
g(M.thump(0.5), AT["s6:memotong"], 0.04)
# independence: flag flutter, water fills, wool swish
fl = M.band(rng.standard_normal(int(2.2 * SR)), 400, 3000); tt = np.arange(len(fl)) / SR
fl *= (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 6 * tt))) * np.sin(np.pi * tt / 2.2)
g(fl / np.abs(fl).max(), AT["s7:Empat"], 0.018)
bell(AT["s7:merdeka"], 1046, 0.02, 2.6, 1.2)
wa = M.band(rng.standard_normal(int(2.4 * SR)), 200, 1800); tt = np.arange(len(wa)) / SR
wa *= (0.6 + 0.4 * np.sin(2 * np.pi * 3 * tt)) * np.sin(np.pi * tt / 2.4)
g(wa / np.abs(wa).max(), AT["s7:air"] - 0.2, 0.02)
wind(AT["s7:selimut"] - 0.3, 1.0, 0.02, 800, 5000)
# payoff: warm swell, AUDIRA glint, outro chime
sw = M.tone((hz(55), hz(62), hz(67), hz(71)), 4.0, 0.4); tt = np.arange(len(sw)) / SR
g(sw * np.minimum(1, tt / 1.2), AT["s8:Kerajaan"] - 0.3, 0.018)
bell(AT["s8:AUDIRA"], 1760, 0.015, 1.4, 2.4)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
