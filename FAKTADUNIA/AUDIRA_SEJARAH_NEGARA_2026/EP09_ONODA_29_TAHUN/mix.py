"""EP09 sound: sparse and sombre. A breathy shakuhachi-like line in the in-scale over a low drone, soft taiko pulses,
a jungle bed of insects and rain. Foley: paper rustle, plane drone, distant muffled shots, camera shutter, sword laid on wood,
radio static. Nothing triumphant: the surrender gets a single low bell, not a fanfare. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1974)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# --- drone: D with a soft fifth, slow swell ---
drone = np.zeros(N)
for m, a in ((38, 1.0), (45, 0.5), (50, 0.35)):
    f = hz(m) * (1 + 0.002 * np.sin(2 * np.pi * 0.07 * T + m))
    ph = 2 * np.pi * np.cumsum(f) / SR
    drone += a * (np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.1 * np.sin(3 * ph))
drone *= 0.75 + 0.25 * np.sin(2 * np.pi * T / 11.0)
drone /= np.abs(drone).max()

# --- shakuhachi-like phrases: in-scale (D Eb G A Bb), breath noise, slow vibrato, pitch bend into each note ---
scale = [62, 63, 67, 69, 70, 74, 75]
def flute(m, d):
    t = np.arange(int(d * SR)) / SR
    bend = 1 - 0.03 * np.exp(-t * 6)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5 * t) * np.minimum(1, t / 0.6)
    f = hz(m) * bend * vib
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
    breath = M.band(rng.standard_normal(len(t)), hz(m) * 0.8, hz(m) * 3.5) * 0.9
    breath /= max(1e-6, np.abs(breath).max())
    env = np.minimum(1, t / 0.35) * np.minimum(1, (d - t) / 0.6)
    return (tone * 0.8 + breath * 0.35 * (0.4 + 0.6 * np.exp(-t * 2))) * env
fl = M.mono()
phrases = [(0.4, [2, 1, 0]), (K["s2"] + 0.5, [3, 4, 2]), (K["s3"] + 1, [0, 1]), (K["s4"] + 0.5, [4, 3, 2, 1]),
           (K["s5"] + 0.6, [2, 1, 0]), (AT["s5:Selama"] + 0.4, [1, 0]), (K["s6"] + 0.6, [3, 4, 5]), (K["s7"] + 0.8, [5, 4, 2]),
           (K["s8"] + 0.4, [2, 3, 1, 0])]
for t0, notes in phrases:
    for i, n in enumerate(notes):
        d = 2.2 + 0.6 * (i == len(notes) - 1)
        M.lay(fl, flute(scale[n], d), t0 + i * 2.0, 0.5)
fl /= np.abs(fl).max()

# --- soft taiko: distant, muffled pulses; absent in the victims beat ---
taiko = M.mono()
for t0 in np.arange(0.3, END, 2.4):
    if AT["s5:Selama"] - 0.3 < t0 < K["s6"]:
        continue
    M.lay(taiko, M.thump(0.7), t0, 0.6)
    M.lay(taiko, M.thump(0.5), t0 + 0.6, 0.25)
taiko = M.band(taiko, 30, 400)
taiko /= np.abs(taiko).max()

e = M.env([(0, 0.6), (K["s2"], 0.8), (K["s5"], 0.85), (AT["s5:Selama"], 0.55), (K["s6"], 0.8), (K["s7"], 0.75), (K["s8"], 0.85), (END, 0.8), (DUR - 0.4, 0), (DUR, 0)])
music = stereo(0.42 * drone * e + 0.38 * fl * e + 0.3 * taiko * e, 0.1 * fl * e)

# --- jungle bed: insects (AM-chirped high band) and soft rain, absent on the map ---
ins = M.band(rng.standard_normal(N), 4200, 7600)
ins *= 0.5 + 0.5 * np.maximum(0, np.sin(2 * np.pi * 17 * T)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * T))
rain = M.band(rng.standard_normal(N), 600, 5000)
ins /= np.abs(ins).max(); rain /= np.abs(rain).max()
jungle = M.env([(0, 1), (AT["s2:ia"] - 0.1, 1), (AT["s2:ia"], 0), (AT["s2:Perintahnya"], 0), (AT["s2:Perintahnya"] + 0.1, 1), (K["s8"] - 0.1, 1), (K["s8"], 0.15), (DUR, 0)])
rainE = M.env([(0, 0), (K["s4"], 0), (K["s4"] + 2, 1), (AT["s5:Selama"], 1), (K["s6"], 0.3), (K["s7"], 0)])
M.fx += np.stack([ins * 0.012 * jungle + rain * 0.014 * rainE * jungle, np.roll(ins, 700) * 0.012 * jungle + np.roll(rain, 400) * 0.014 * rainE * jungle], 1)

def paper(t, a=0.06, d=0.35):
    x = M.band(M.burst(d, 8, 4), 900, 7000)
    x *= np.sin(np.linspace(0, np.pi, len(x))) ** 2
    g(x, t, a)

def shot(t, a=0.05):  # distant, low-passed: heard, not celebrated
    x = M.band(M.burst(0.5, 14, 3), 60, 700)
    g(x, t, a); g(M.thump(0.4), t + 0.02, a * 0.8)

# sweeps and panel changes rustle like turned notebook pages
for a in ("s2:ia", "s2:Perintahnya", "s5:Selama"):
    paper(AT[a] - 0.3, 0.08, 0.6)
for k in ("s6", "s7", "s8"):
    paper(K[k] - 0.3, 0.08, 0.6)
# year tag ticks while it counts
for x in np.arange(AT["s1:Tapi"], AT["s1:1974"], 0.12):
    g(M.tone((3600,), 0.012, 300), x, 0.02)
# orders typed
for w in ("s2:jangan", "s2:jangan#2"):
    for i in range(14):
        g(M.band(M.burst(0.03, 120, 2), 1500, 6000), AT[w] + i * 0.04, 0.04)
# 1945: distant assault beyond the hills
for i, x in enumerate(np.arange(AT["s3:merebut"] - 0.5, AT["s3:Onoda"] + 1.5, 0.55)):
    shot(x + rng.uniform(0, 0.3), 0.035 * (0.6 + 0.4 * rng.random()))
# footsteps through the undergrowth
for x in np.arange(AT["s3:Onoda"], K["s3e"] + 0.8, 0.28):
    g(M.band(M.burst(0.08, 40, 3), 200, 2500), x, 0.03)
# leaflets flutter, one torn
for i in range(18):
    paper(AT["s4:selebaran"] - 1.2 + i * 0.2, 0.025, 0.25)
x = M.band(M.burst(0.5, 6, 2), 1200, 8000); x *= np.linspace(0.3, 1, len(x)) ** 2
g(x, AT["s4:menganggapnya"], 0.12)
g(M.lib("impact-bass-1"), AT["s4:propaganda"], 0.05)
# plane drone (Doppler sweep), letters
def drone_pass(t0, d=4.6, a=0.06):
    t = np.arange(int(d * SR)) / SR
    f = 92 * (1 + 0.06 * np.cos(np.pi * t / d))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(h * ph) / h for h in range(1, 7)) * np.sin(np.pi * t / d) ** 2
    x = M.band(x + 0.3 * M.band(rng.standard_normal(len(t)), 200, 1500) * np.sin(np.pi * t / d) ** 2, 50, 2000)
    g(x / np.abs(x).max(), t0, a)
drone_pass(AT["s4:Surat"] - 0.6)
drone_pass(AT["s6:terbang"] - 1.1, 4.0, 0.05)
g(M.lib("impact-bass-1"), AT["s4:tipuan"], 0.05)
# one by one: a soft low bell for each absence
for a in ("s5:menyerah", "s5:1954", "s5:1972"):
    g(M.tone((hz(50), hz(57) * 1.003, hz(62)), 3.0, 1.2), AT[a] + 0.2, 0.06)
shot(M.word("s5", "baku"), 0.03)
# victims: silence of the taiko, embers crackle, red-ink tally scratches
for i in range(30):
    g(M.band(M.burst(0.06, 50, 2), 2500, 8000), AT["s5:menyerang"] + 0.1 * i + 0.05, 0.03)
for x in np.arange(AT["s5:Selama"], K["s6"], 0.13):
    if rng.random() < 0.5:
        g(M.band(M.burst(0.02, 200, 1), 1500, 6000), x + rng.uniform(0, 0.1), 0.02)
# camera shutter
for dt in (0.25, 0.95):
    t = AT["s6:menemukannya"] + dt
    g(M.band(M.burst(0.025, 150, 1), 2000, 9000), t, 0.12); g(M.band(M.burst(0.03, 120, 1), 1500, 7000), t + 0.07, 0.09)
g(M.lib("click"), AT["s6:menolak"], 0.04)
paper(AT["s6:membacakan"] - 0.2, 0.1, 0.5)
# sword laid down on wood
ts = AT["s7:menyerah"] + 0.85
g(M.thump(0.3), ts, 0.25); g(M.tone((1870, 2950), 0.6, 9), ts + 0.01, 0.05); g(M.band(M.burst(0.12, 30, 2), 400, 3000), ts, 0.08)
g(M.tone((hz(38), hz(45)), 4.0, 0.8), ts + 0.3, 0.06)
# radio static and a faint tuning whistle
st = AT["s7:radio"] - 0.4
x = M.band(rng.standard_normal(int(2.6 * SR)), 900, 6000)
x *= (0.6 + 0.4 * (rng.random(len(x)) > 0.995)) * np.minimum(1, np.arange(len(x)) / SR / 0.2) * np.minimum(1, (2.6 - np.arange(len(x)) / SR) / 0.4)
g(x / np.abs(x).max(), st, 0.035)
tt = np.arange(int(1.6 * SR)) / SR
g(np.sin(2 * np.pi * np.cumsum(900 + 500 * tt) / SR) * np.exp(-tt * 1.5) * np.minimum(1, tt / 0.1), st + 0.4, 0.012)
# map: pen on paper for the routes
for a, b in (("s2:ia", "s2:Filipina"), ("s8:Dan", "s8:Indonesia")):
    x = M.band(M.burst(AT[b] - AT[a] + 0.4, 1.0, 2), 2500, 9000)
    g(x, AT[a], 0.03)
g(M.lib("pop"), AT["s8:setia"], 0.03); g(M.lib("pop"), AT["s8:keras"], 0.03)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
