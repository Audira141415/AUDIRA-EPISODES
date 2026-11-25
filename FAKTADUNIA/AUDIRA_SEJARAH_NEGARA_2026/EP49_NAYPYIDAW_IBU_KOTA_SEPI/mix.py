"""EP49 sound: an almost empty capital. A wide, cold pad in A minor with a soft gong every few bars (Burmese
bronze colour), wind and a faint city hum under everything, and one car passing far away in the hook. Foley follows
the maquette: projector clicks for each projection, lanes ticking on in the hook, crane winches and plaster blocks
setting down in the construction beat, a muffled truck convoy and a crisp marching pulse for the parade, a fortress
wall hum, a scan sweep for the scale beat, tunnel drones, a deep rumble with cracking plaster for the 2025 earthquake
(no screams, no sirens), and a warm low swell at dusk. Calm; nothing above the voice bed.
Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4949)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# --- score: cold pad + bronze gong + sparse bell melody ---
def pad(f, d):
    tt = np.arange(int(d * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * tt * (1 + 0.0015 * np.sin(2 * np.pi * 0.2 * tt))) / h ** 1.6 for h in range(1, 7))
    return x * np.minimum(1, tt / 2.0) * np.minimum(1, (d - tt) / 2.0)

def gong(f=hz(45), d=5.0, a=1.0):
    tt = np.arange(int(d * SR)) / SR
    parts = ((1, 1), (2.02, 0.5), (2.76, 0.35), (4.1, 0.2), (5.4, 0.12))
    x = sum(w * np.sin(2 * np.pi * f * r * tt + 0.3 * np.sin(2 * np.pi * 3 * tt)) * np.exp(-tt * (0.7 + 0.5 * r)) for r, w in parts)
    return a * x * np.minimum(1, tt / 0.01)

def bell(f, d=2.4, a=1.0):
    tt = np.arange(int(d * SR)) / SR
    return a * sum(np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * (1.6 + r)) / r for r in (1, 2.4, 3.9)) * np.minimum(1, tt / 0.004)

P, G, Mel = M.mono(), M.mono(), M.mono()
CH = [(57, 64, 69), (53, 60, 69), (55, 62, 67), (52, 59, 64)]
for k, t0 in enumerate(np.arange(0.0, DUR - 1, 7.0)):
    for n in CH[k % 4]:
        M.lay(P, pad(hz(n - 12), 9.0), t0, 0.33)
for t0 in np.arange(0.4, END, 14.0):
    M.lay(G, gong(), t0, 0.8)
q = np.random.default_rng(49)
SC = [69, 72, 74, 76, 79, 81]
for t0 in np.arange(2.0, END, 1.75):
    if q.random() < 0.45:
        M.lay(Mel, bell(hz(SC[q.integers(0, 6)]), 2.4, 0.4), t0)
P = M.band(P, 40, 3000)
for x in (P, G, Mel):
    x /= max(1e-6, np.abs(x).max())
e = M.env([(0, 0), (0.5, 0.85), (END, 0.9), (DUR - 0.5, 0), (DUR, 0)])
# hold the score back under the quake, swell at dusk
qe = M.env([(0, 1), (AT["s7:gempa"] - 0.3, 1), (AT["s7:gempa"], 0.25), (K["s7e"], 0.5), (K["s8"] + 1, 1.1), (DUR, 1.1)])
mono = (0.45 * P + 0.3 * G + 0.32 * Mel) * e * qe
music = stereo(mono, 0.12 * Mel * e)

# --- ambience: wind + faint empty-city hum ---
wind = M.band(rng.standard_normal(N), 120, 1400); wind /= np.abs(wind).max()
wind *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * T) ** 2
hum = M.band(rng.standard_normal(N), 60, 260); hum /= np.abs(hum).max()
M.fx += np.stack([wind, np.roll(wind, 1300)], 1) * 0.012 + np.stack([hum, hum], 1) * 0.004

def click(t, a=0.02):
    g(M.band(M.burst(0.03, 200, 1), 1500, 8000), t, a); g(M.tone((2200,), 0.05, 60), t, a * 0.3)

def soft(t, a=0.03):
    g(M.band(M.burst(0.08, 70, 2), 150, 2500), t, a); g(M.tone((160,), 0.2, 16), t, a * 0.5)

def whoosh(t, d=1.2, a=0.015):
    x = M.band(rng.standard_normal(int(d * SR)), 300, 4000); tt = np.arange(len(x)) / SR
    g(x / np.abs(x).max() * np.sin(np.pi * tt / d) ** 2, t, a)

# hook: one car far away, lanes ticking on
car = M.band(rng.standard_normal(int(4 * SR)), 80, 900); tc = np.arange(len(car)) / SR
car = car / np.abs(car).max() * np.exp(-((tc - 2) / 1.0) ** 2)
g(np.stack([car * np.clip(1 - tc / 4, 0, 1), car * np.clip(tc / 4, 0, 1)], 1), 0.6, 0.03)
for i in range(20):
    click(AT["s1:dua"] - 0.1 + i * max(0.6, AT["s1:lajur"] + 0.35 - AT["s1:dua"]) / 20, 0.008)
g(M.lib("ping"), AT["s1:kosong"], 0.02)
# camera moves between beats
for a in (K["s1e"] - 0.3, K["s2e"] - 0.2, K["s3e"] - 0.1, K["s4e"] - 0.1, K["s5e"] - 0.1, K["s6e"] - 0.2, AT["s7:Lalu"] - 0.1, K["s7e"]):
    whoosh(a, 1.4, 0.016)
# map board rises; route drawn; 320 km
soft(K["s2"] + 0.2, 0.035)
for i in range(10):
    click(AT["s2:tiga"] - 0.6 + i * 0.14, 0.008)
g(M.lib("pop"), AT["s2:tiga"] + 0.8, 0.02)
# construction: winch whine + plaster blocks set down
for i in range(6):
    t = AT["s3:dimulai"] + i * max(2, AT["s3:nepotisme"] - AT["s3:dimulai"] - 0.6) / 6
    w = M.tone((420 + 30 * i, 630 + 30 * i), 0.9, 2.5); g(w * 0.3, t, 0.01)
    soft(t + 1.2, 0.03)
g(M.lib("impact-bass-1"), AT["s3:korupsi"], 0.03)
# convoy rumble then marching pulse
cv = M.band(rng.standard_normal(int(6 * SR)), 40, 400); tv = np.arange(len(cv)) / SR
g(cv / np.abs(cv).max() * np.sin(np.pi * tv / 6) ** 2, AT["s4:memindahkan"] - 1.4, 0.03)
g(M.thump(0.4), AT["s4:Enam"], 0.04)
for t in np.arange(AT["s4:parade"] - 0.2, K["s5"] + 0.6, 0.38):
    g(M.band(M.burst(0.05, 90, 2), 200, 3000), t, 0.016)
    g(M.band(M.burst(0.04, 120, 2), 1500, 6000), t + 0.19, 0.006)
# reasons: projector clicks, wall hum, gong on benteng
for k in ("s5:Alasan", "s5:tengah", "s5:bergolak"):
    click(AT[k], 0.02)
g(gong(hz(40), 4.0, 1.0), AT["s5:benteng"] - 0.1, 0.02)
wh = M.tone((hz(45), hz(52)), 4.0, 0.3); g(wh * np.minimum(1, np.arange(len(wh)) / SR / 0.6), AT["s5:benteng"], 0.008)
# scale: scan sweep
g(M.lib("riser"), AT["s6:tujuh"] - 1.0, 0.012)
whoosh(AT["s6:tujuh"] - 0.2, 3.2, 0.012)
for k in ("s6:tujuh", "s6:sembilan"):
    g(bell(hz(81), 1.6, 1.0), AT[k] - 0.2, 0.012)
# compound: low tunnel drone
dr = M.tone((hz(33), hz(40)), 5.0, 0.2); td = np.arange(len(dr)) / SR
g(dr * np.minimum(1, td / 1.0) * np.minimum(1, (5 - td) / 1.0), AT["s7:terowongan"] - 0.8, 0.02)
click(AT["s7:sebelas"], 0.02)
# earthquake: deep rumble + plaster cracks, no human sounds
tq = AT["s7:gempa"] - 0.1
rb = M.band(rng.standard_normal(int(4.5 * SR)), 25, 180); tr = np.arange(len(rb)) / SR
rb = rb / np.abs(rb).max() * np.minimum(1, tr / 0.15) * np.exp(-np.maximum(0, tr - 1.2) * 0.9)
g(rb, tq, 0.12)
g(M.thump(0.6), tq, 0.08)
for i in range(18):
    g(M.band(M.burst(0.04, 150, 1), 1200, 9000), tq + 0.1 + rng.random() * 2.0, 0.02 + 0.02 * rng.random())
g(M.lib("impact-bass-1"), AT["s7:delapan"] - 0.2, 0.025)
# dusk: warm swell, AUDIRA glint, outro chime
sw = M.tone((hz(45), hz(52), hz(57)), 5.0, 0.35); ts = np.arange(len(sw)) / SR
g(sw * np.minimum(1, ts / 1.5), AT["s8:megah"] - 0.4, 0.025)
g(gong(hz(45), 5.0, 1.0), AT["s8:Menurut"] - 0.3, 0.025)
g(bell(hz(88), 1.8, 1.0), AT["s8:AUDIRA"], 0.012)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
