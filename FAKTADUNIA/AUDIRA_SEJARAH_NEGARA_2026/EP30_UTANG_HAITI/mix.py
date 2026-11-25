"""EP30 sound: a hushed marble gallery. Low sustained piano (A minor, slow, sparse) over a soft string-like drone and
gallery room tone. Foley: footsteps on marble during each walk between exhibits, a spotlight click as each exhibit
lights, a soft paper sound for the map, small taps as the 520 dots appear, heavy bronze doors closing and a bar
dropping (terkucil), a low drum pulse for the 14 warships (no gunfire), pen scratches and a stamp for the ledger,
coins for the interest and the balance. Calm and dignified: no impacts louder than the voice bed.
Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1825)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# --- score ---
def piano(f, d=3.5, a=1.0):
    tt = np.arange(int(d * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * tt * (1 + 0.0004 * h * h)) * np.exp(-tt * (0.9 + 0.7 * h)) / h ** 1.3 for h in range(1, 7))
    return a * x * np.minimum(1, tt / 0.004)

def drone(f, d):
    tt = np.arange(int(d * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * tt + 0.3 * np.sin(2 * np.pi * 0.11 * tt * h)) / h ** 1.8 for h in range(1, 6))
    return x * (1 + 0.2 * np.sin(2 * np.pi * 0.07 * tt))

pad, pno = M.mono(), M.mono()
CH = [(45, 52, 57, 60), (41, 48, 57, 60), (43, 50, 55, 59), (40, 47, 55, 59)]  # Am F G Em
bar = 4.8
for k, t0 in enumerate(np.arange(0.2, DUR - 1, bar)):
    c = CH[k % 4]
    M.lay(pad, drone(hz(c[0]), bar + 1.5) * np.minimum(1, np.arange(int((bar + 1.5) * SR)) / SR / 1.2) * np.minimum(1, (bar + 1.5 - np.arange(int((bar + 1.5) * SR)) / SR) / 1.2), t0, 0.5)
    M.lay(pno, piano(hz(c[0] - 12), 4.5, 0.8), t0)
    for j, n in enumerate(c[1:]):
        M.lay(pno, piano(hz(n + 12), 3.5, 0.32), t0 + 1.2 + j * 0.9)
pad = M.band(pad, 40, 1400)
for x in (pad, pno):
    x /= max(1e-6, np.abs(x).max())
e = M.env([(0, 0), (0.8, 0.8), (END, 0.9), (DUR - 0.5, 0), (DUR, 0)])
mono = 0.45 * pad * e + 0.5 * pno * e
music = stereo(mono, 0.08 * pno * e)

# --- foley ---
def step(t, a=0.03):
    x = M.band(M.burst(0.09, 70, 2), 200, 5000); x[:2205] += 0.4 * M.band(M.burst(0.05, 120, 1), 2500, 9000)
    g(x, t, a)

def walk(t0, t1):
    for k, t in enumerate(np.arange(t0, t1, 0.52)):
        step(t, 0.028 * (0.8 + 0.2 * (k % 2)))

def click(t, a=0.03):
    g(M.band(M.burst(0.03, 200, 1), 1500, 8000), t, a); g(M.tone((60,), 0.4, 6), t, a * 0.5)

def coin(t, a=0.03, f=3200):
    g(M.tone((f, f * 1.51, f * 2.37), 0.5, 9), t, a); g(M.band(M.burst(0.02, 300, 1), 4000, 12000), t, a * 0.6)

def scratch(t, d=0.5, a=0.02):
    x = M.band(rng.standard_normal(int(d * SR)), 2500, 9000)
    tt = np.arange(len(x)) / SR
    x *= (0.5 + 0.5 * np.sin(2 * np.pi * 26 * tt) ** 2) * np.minimum(1, (d - tt) / 0.05)
    g(x / np.abs(x).max(), t, a)

def drum(t, a=0.07):
    g(M.thump(0.6), t, a); g(M.tone((55, 82), 0.9, 4), t, a * 0.5)

# hook: spotlight on, slow steps
click(0.15, 0.04)
walk(0.4, 3.0)
g(M.lib("chime"), AT["s1:seratus"], 0.025)
# walks between exhibits (camera moves)
for a, b in ((K["s1e"] - 0.6, K["s2"] + 1.6), (K["s2e"] - 0.7, AT["s3:dari"]), (AT["s3:budak"] + 0.2, AT["s3:1804"]),
             (K["s4e"] - 0.3, AT["s5:empat"] - 0.2), (K["s5e"] - 0.4, AT["s6:berutang"] + 1.0), (K["s6e"] - 0.3, K["s7"] + 1.8),
             (AT["s7:1947"] + 1.0, AT["s7:Tahun"] + 1.2), (K["s7e"] - 0.4, K["s8"] + 1.6)):
    walk(a, b)
for k in ("s2:Ini", "s3:dari", "s3:1804", "s5:empat", "s6:berutang", "s7:pinjaman", "s7:Tahun", "s8:Kemerdekaan"):
    if k in AT:
        click(AT[k] - 0.5, 0.025)
click(K["s2"] + 0.5, 0.025); click(K["s7"] + 0.8, 0.025); click(K["s8"] + 0.7, 0.025)
# map: pin
g(M.lib("click-soft"), AT["s2:Karibia"] + 0.1, 0.04)
# dots: soft taps
fd = max(0.6, AT["s3:penduduknya"] - AT["s3:dari"])
for i in range(26):
    g(M.tone((2400 + 40 * (i % 5),), 0.08, 40), AT["s3:dari"] + i * fd / 26, 0.006)
g(M.tone((180, 270), 1.2, 2), AT["s3:empat"], 0.03)
# 1804: soft bell; doors close and bar drops
g(M.tone((660, 990, 1320), 2.4, 1.6), AT["s3:1804"], 0.03)
d = max(1.0, AT["s4:terkucil"] - AT["s4:mengakui"])
cr = M.band(rng.standard_normal(int(d * SR)), 80, 900); tt = np.arange(len(cr)) / SR
cr *= np.minimum(1, tt / 0.4) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * tt) ** 2)
g(cr / np.abs(cr).max(), AT["s4:mengakui"], 0.02)
drum(AT["s4:terkucil"] - 0.05, 0.09)
g(M.band(M.burst(0.25, 18, 2), 120, 2500), AT["s4:terkucil"] + 0.25, 0.05)
# warships: low drum pulse
for k in range(4):
    drum(AT["s5:empat"] + k * 0.75, 0.05)
g(M.lib("riser"), AT["s5:Tuntutannya"] - 1.2, 0.015)
coin(AT["s5:seratus"], 0.03)
# ledger
scratch(AT["s6:berutang"] - 0.05, 0.8)
scratch(AT["s6:1838"] - 0.1, 0.7)
scratch(AT["s6:diturunkan"], 0.35, 0.03)
scratch(AT["s6:enam"] - 0.15, 0.6)
g(M.thump(0.25), AT["s6:1883"], 0.06); g(M.band(M.burst(0.08, 60, 2), 300, 3000), AT["s6:1883"], 0.04)
# interest: coins one by one along the rail
ti = max(1.0, AT["s7:1947"] - AT["s7:berbunga"])
for k in range(9):
    coin(AT["s7:berbunga"] + k * ti / 9, 0.016, 2900 + 120 * (k % 3))
g(M.tone((440, 660), 2.0, 1.8), AT["s7:1947"], 0.02)
g(M.tone((330, 495), 2.4, 1.4), AT["s7:tanpa"], 0.025)
# balance: coins drop into the pan, the beam tips
for k in range(3):
    for j in range(3):
        coin(AT["s8:dibayar"] - 0.9 + j * 0.22 + k * 0.07 + 0.38, 0.02, 3000 + 200 * j)
g(M.tone((98, 147), 2.5, 1.2), AT["s8:mahal"], 0.04)
g(M.lib("chime"), OUT + 0.3, 0.05)
# gallery room tone
air = M.band(rng.standard_normal(N), 60, 900)
air /= np.abs(air).max()
M.fx += np.stack([air, np.roll(air, 1200)], 1) * 0.005
M.finish(music)
print("duration", DUR)
