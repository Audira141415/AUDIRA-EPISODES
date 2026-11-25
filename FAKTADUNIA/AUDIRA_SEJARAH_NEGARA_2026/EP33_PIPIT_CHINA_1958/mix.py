"""EP33 sound: a print shop in the countryside. A plucked, pentatonic-ish music-box/marimba pattern over a soft
reed-organ drone (original, no borrowed melody), riso-drum clatter for prints and pop-up hinges, paper flaps for the
sparrows, a buzzing swarm for the locusts, muffled gong and pan hits for the villagers (kept soft), clicks for the chain
links and a calm low bell for the famine line. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(3358)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# --- score: marimba plucks over a reed drone ---
def pluck(f, d=1.2):
    tt = np.arange(int(d * SR)) / SR
    x = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 5) + 0.35 * np.sin(2 * np.pi * f * 4 * tt) * np.exp(-tt * 14)
    return x * np.minimum(1, tt / 0.004)

def reed(notes, d):
    tt = np.arange(int(d * SR)) / SR
    x = np.zeros_like(tt)
    for m in notes:
        f = hz(m)
        for h, w in ((1, 1), (2, 0.45), (3, 0.3), (5, 0.12)):
            x += w * np.sin(2 * np.pi * f * h * tt * (1 + 0.002 * np.sin(2 * np.pi * 0.3 * tt)))
    return x

pl = M.mono()
SCALE = [62, 64, 67, 69, 71, 74, 76, 79]
bar = 2.4
pat = [0, 2, 4, 2, 5, 4, 2, 1, 0, 3, 4, 6, 5, 3, 2, 0]
k = 0
for t0 in np.arange(0.0, END, bar / 4):
    m = SCALE[pat[k % 16]] + (0 if (k // 32) % 2 == 0 else -2)
    if (k % 8) != 7:
        M.lay(pl, pluck(hz(m)), t0, 0.8 if k % 4 == 0 else 0.55)
    k += 1
pl /= max(1e-6, np.abs(pl).max())
dr = M.mono()
chords = [[50, 57, 62], [48, 55, 60], [45, 52, 57], [47, 54, 59]]
for i, t0 in enumerate(np.arange(0, DUR, bar * 2)):
    x = reed(chords[i % 4], bar * 2 + 1.0)
    tt = np.arange(len(x)) / SR
    x *= np.minimum(1, tt / 0.8) * np.minimum(1, (len(x) / SR - tt) / 1.0)
    M.lay(dr, x, t0, 1.0)
dr = M.band(dr, 70, 2500)
dr /= max(1e-6, np.abs(dr).max())
s7b = AT["s7:Tapi"]
e_pl = M.env([(0, 0.0), (0.4, 0.9), (s7b - 0.5, 0.9), (s7b + 0.5, 0.25), (K["s8"], 0.25), (K["s8"] + 1.2, 0.95), (END, 0.9), (DUR - 0.4, 0), (DUR, 0)])
e_dr = M.env([(0, 0.0), (1.0, 0.7), (s7b, 0.7), (s7b + 1, 0.9), (END, 0.8), (DUR - 0.4, 0), (DUR, 0)])
mono = 0.45 * pl * e_pl + 0.32 * dr * e_dr
music = stereo(mono, 0.06 * dr * e_dr)

# --- foley ---
def flap(t, n=5, a=0.025):
    for i in range(n):
        x = M.band(rng.standard_normal(int(0.07 * SR)), 600, 5000)
        x *= np.exp(-np.arange(len(x)) / SR * 50)
        g(x / np.abs(x).max(), t + i * 0.085, a)

def swarm(t, d, a=0.03):
    tt = np.arange(int(d * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * tt + rng.random() * 6) for f in (180, 191, 203, 214, 236)) * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * tt))
    x = x * 0.5 + M.band(rng.standard_normal(len(tt)), 1500, 6000) * 0.4
    x *= np.minimum(1, tt / 0.6) * np.minimum(1, (d - tt) / 0.8)
    g(x / np.abs(x).max(), t, a)

def gong(t, f=180, a=0.02):
    tt = np.arange(int(1.6 * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * dk) * w for r, dk, w in ((1, 2.5, 1), (1.48, 3.5, 0.6), (2.31, 5, 0.35)))
    g(x * np.minimum(1, tt / 0.002), t, a)

def press(t, a=0.05):  # riso drum stamp
    g(M.band(M.burst(0.1, 45, 3), 120, 1800), t, a); g(M.tone((95, 140), 0.12, 30), t, a * 0.5)

def bell(t, f, a, d=4.0):
    tt = np.arange(int(d * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * dk) * w for r, dk, w in ((1, 0.9, 1), (2.0, 1.5, 0.4), (2.76, 2.4, 0.25)))
    g(x * np.minimum(1, tt / 0.003), t, a)

# hook
flap(0.2, 6, 0.022); flap(1.4, 5, 0.02)
press(AT["s1:perang"], 0.07); g(M.thump(0.3), AT["s1:perang"], 0.05)
flap(AT["s1:menang"], 8, 0.02)
g(M.lib("riser"), AT["s1:belalang"] - 1.0, 0.03)
swarm(AT["s1:belalang"] - 0.1, 2.6, 0.035); g(M.lib("impact-bass-1"), AT["s1:belalang"], 0.05)
g(M.lib("click"), AT["s1:pipit"], 0.02); g(M.lib("click"), AT["s1:belalang"], 0.02)
# map + four pests
g(M.lib("whoosh"), K["s2"] - 0.5, 0.035); press(K["s2"] - 0.3, 0.05)
for key in ("s2:tikus", "s2:lalat", "s2:nyamuk", "s2:pipit"):
    press(AT[key] - 0.2, 0.04); g(M.lib("pop"), AT[key], 0.018)
press(AT["s2:dua"] - 0.25, 0.05); g(M.lib("click-soft"), AT["s2:gabah"], 0.03)
# 1956
g(M.lib("whoosh"), K["s3"] - 0.5, 0.03); press(K["s3"] - 0.4, 0.05)
g(M.lib("typing"), AT["s3:bukan"] - 0.2, 0.025)
press(AT["s3:tidak"], 0.09); g(M.thump(0.3), AT["s3:tidak"], 0.05)
# gongs (soft, distant)
g(M.lib("whoosh"), K["s4"] - 0.5, 0.03)
for i, t0 in enumerate(np.arange(AT["s4:memukul"], K["s5"] - 0.6, 0.6)):
    gong(t0 + (i % 3) * 0.05, [170, 205, 240][i % 3], 0.016)
flap(AT["s4:Warga"], 6, 0.018); flap(AT["s4:jatuh"], 4, 0.016)
g(M.lib("pop"), AT["s4:dipecahkan"] - 0.1, 0.02); g(M.lib("click-soft"), AT["s4:dipecahkan"], 0.03)
# count: the drum prints rows
g(M.lib("whoosh-cinematic"), K["s5"] - 0.6, 0.03)
t0, t1 = AT["s5:sedikitnya"], AT["s5:juta"] + 0.2
for i in range(11):
    press(t0 + i * (t1 - t0) / 11, 0.03)
g(M.lib("impact-bass-1"), AT["s5:juta"], 0.06)
# field
g(M.lib("whoosh"), K["s6"] - 0.5, 0.03)
g(M.lib("pop"), AT["s6:serangga"], 0.02); flap(AT["s6:Tanpa"], 6, 0.02)
swarm(AT["s6:belalang"] - 0.2, K["s7"] - AT["s6:belalang"] + 0.4, 0.04)
for key in ("s6:pipit", "s6:serangga", "s6:belalang", "s6:sawah"):
    g(M.lib("click"), AT[key], 0.02)
# 1960
g(M.lib("whoosh"), K["s7"] - 0.5, 0.03); press(K["s7"] - 0.4, 0.05)
g(M.lib("whoosh-short"), AT["s7:dicoret"], 0.03); g(M.lib("typing"), AT["s7:kutu"] - 0.1, 0.022)
# causes + famine line (calm)
g(M.lib("whoosh"), s7b - 0.5, 0.03)
for key in ("s7:kekeringan", "s7:banjir", "s7:kebijakan", "s7:kampanye"):
    press(AT[key] - 0.2, 0.04)
g(M.lib("click"), AT["s7:kerusakan"], 0.02)
bell(AT["s7:Kelaparan"], hz(45), 0.06, 5)
# payoff
g(M.lib("whoosh-cinematic"), K["s8"] - 0.4, 0.035)
flap(AT["s8:Setiap"], 10, 0.02)
for i in range(6):
    g(M.lib("click-soft"), AT["s8:rantai"] + i * 0.12, 0.025)
g(M.lib("chime"), AT["s8:rantai"] + 0.7, 0.04)
g(M.lib("chime"), OUT + 0.3, 0.06)
# paper room air
air = M.band(rng.standard_normal(N), 200, 3000)
air /= np.abs(air).max()
M.fx += np.stack([air, np.roll(air, 900)], 1) * 0.003
M.finish(music)
print("duration", DUR)
