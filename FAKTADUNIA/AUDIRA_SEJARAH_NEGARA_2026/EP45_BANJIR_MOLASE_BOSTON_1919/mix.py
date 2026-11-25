"""EP45 sound: a slow, heavy bed in D minor (low cello-like saw pad, sparse muted piano, sub pulse), harbour wind
and gulls under the waterfront, a creaking tank, rivets popping like gunshots, the burst (deep boom + tearing steel),
a long viscous low-passed roar for the surge, girder groans, slow sticky "gloop" bubbles as it congeals, a gavel in
s7, one soft click per ripple bead. Calm, no stingers on the casualty line. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1919)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 72

# D minor: i - VI - III - VII
prog = [[38, 50, 53, 57], [34, 46, 50, 53], [41, 48, 53, 57], [36, 48, 52, 55]]
chord = lambda t: prog[int(t / (beat * 4)) % 4]
pad, pno, sub = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 2, beat * 4):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 4.3, "saw", 0.25, 0.25), t0, 0.22)
for k, t0 in enumerate(np.arange(beat * 2, END + 0.5, beat)):
    ch = chord(t0)
    if k % 4 == 3:
        continue
    f = hz(ch[1 + (k * 2) % 3] + 12)
    M.lay(pno, M.note(f, 1.6, "pluck", 2.2), t0, 0.5 if k % 4 == 0 else 0.3)
for t0 in np.arange(0.05, END + 1, beat * 2):
    M.lay(sub, M.note(hz(chord(t0)[0] - 12), beat * 1.5, "sine", 1.5, 0.05), t0, 0.6)
pad = M.band(pad, 60, 1400)
for x in (pad, pno, sub):
    x /= max(1e-6, np.abs(x).max())
burst = AT["s4:terbelah"]
e_all = M.env([(0, 0.0), (0.4, 0.8), (K["s2"], 0.65), (burst - 1.5, 0.7), (burst - 0.1, 0.25), (burst + 0.3, 0.9), (K["s6"], 0.8),
               (AT["s6:Dua"] - 0.4, 0.45), (K["s7"], 0.6), (K["s8"], 0.75), (END, 0.85), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.5 * pad + 0.32 * pno + 0.25 * sub) * e_all
music = stereo(mono, 0.05 * pno * e_all + 0.05 * pad * e_all)


def click(t, a=0.035):
    g(M.band(M.burst(0.02, 250, 1), 1500, 9000), t, a); g(M.tone((1800,), 0.03, 120), t, a * 0.3)


def pop_rivet(t, a=0.06):
    g(M.band(M.burst(0.05, 120, 1), 800, 9000), t, a); g(M.tone((2600, 3900), 0.12, 40), t + 0.005, a * 0.35)


def groan(t, dur=1.6, f0=70, a=0.05):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 0.25 * np.sin(2 * np.pi * 0.7 * tt)) * (1 - 0.2 * tt / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + 0.5 * np.sin(2.01 * ph) + 0.3 * np.sin(3.03 * ph)) * np.sin(np.pi * tt / dur) ** 0.7
    s += 0.3 * M.band(rng.standard_normal(n), 200, 1200) * np.sin(np.pi * tt / dur)
    g(s / np.abs(s).max(), t, a)


def gloop(t, a=0.03, f0=180):
    n = int(0.18 * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 2.5 * tt / 0.18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 18)
    g(s, t, a)


# harbour wind + gulls (quiet under the waterfront scenes, out during the surge)
wind = M.band(rng.standard_normal(N), 150, 1600)
wind *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * T)
for k in range(10):
    t0 = rng.uniform(5.5, 40)
    n = int(0.5 * SR); tt = np.arange(n) / SR
    f = 1500 + 700 * np.sin(np.pi * tt / 0.5)
    gl = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.5) ** 2
    i0 = int(t0 * SR); wind[i0:i0 + n] += gl[: N - i0] * 0.25
wind *= M.env([(0, 0), (0.5, 0.6), (burst - 0.2, 0.9), (burst + 0.5, 0.15), (K["s6"], 0.35), (K["s8"], 0.6), (DUR - 0.5, 0.5), (DUR, 0)])
wind /= max(1e-6, np.abs(wind).max())
M.fx += np.stack([wind, np.roll(wind, 1800)], 1) * 0.016

# s1 hook: the wave already moving (slow-motion roar), metal tearing above
roar_n = int((K["s2"] + 0.2) * SR)
roar = M.band(rng.standard_normal(roar_n), 30, 420) * np.minimum(1, np.arange(roar_n) / (0.3 * SR)) * np.minimum(1, (roar_n - np.arange(roar_n)) / (0.6 * SR))
g(roar / np.abs(roar).max(), 0.0, 0.11)
g(M.lib("impact-bass-1"), 0.05, 0.06)
groan(0.4, 2.2, 55, 0.05)
g(M.lib("impact-bass-1"), AT["s1:Bukan"] - 0.05, 0.05)
for k in ("s1:Bukan", "s1:sirup"):
    g(M.lib("pop"), AT[k], 0.03)
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.3, 0.025)
# s2-s4 calm waterfront: tank creaks, counters
for t0 in (K["s2"] + 2.5, AT["s2:berdiri"] + 0.5, AT["s3:bocor"] - 0.2, AT["s4:udara"] + 0.6):
    groan(t0, 1.2, 95, 0.02)
g(M.lib("sparkle"), AT["s2:ton"], 0.02)
for i in range(6):
    gloop(AT["s3:bocor"] + i * 0.35, 0.02, 160 + 30 * i)
hiss = M.band(rng.standard_normal(int(1.6 * SR)), 1500, 7000) * np.sin(np.pi * np.arange(int(1.6 * SR)) / int(1.6 * SR))
g(hiss, AT["s3:dicat"], 0.02)  # paint roller
pump = np.sin(2 * np.pi * 48 * np.arange(int(4 * SR)) / SR) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 1.6 * np.arange(int(4 * SR)) / SR)))
g(M.band(pump, 30, 400) * np.sin(np.pi * np.arange(len(pump)) / len(pump)), AT["s4:mengisi"] - 0.3, 0.035)
# s4 rivets pop one by one (machine-gun like), then the burst
pa = AT["s4:paku"] - 0.25
gap = (AT["s4:lepas"] + 0.3 - pa) / 16
for i in range(16):
    pop_rivet(pa + ((i * 7) % 16) * gap, 0.05)
g(M.lib("riser"), burst - 1.4, 0.025)
g(M.thump(0.6), burst, 0.22); g(M.lib("impact-bass-1"), burst, 0.09)
tear = M.band(M.burst(1.4, 3, 2), 600, 6000)
g(tear, burst + 0.02, 0.07)
groan(burst + 0.1, 1.8, 62, 0.07)
# s5 surge: long heavy roar, girders, house
sn = int((K["s6"] - burst) * SR)
surge = M.band(rng.standard_normal(sn), 25, 520)
env = np.interp(np.arange(sn) / SR, [0, 0.3, AT["s5:menabrak"] - burst, AT["s5:menggeser"] - burst + 1, sn / SR], [0, 1, 1, 0.7, 0.15])
g(surge / np.abs(surge).max() * env, burst, 0.13)
g(M.lib("impact-bass-1"), AT["s5:menabrak"], 0.07); groan(AT["s5:menabrak"] + 0.05, 2.0, 48, 0.08)
g(M.band(M.burst(0.8, 5, 2), 400, 5000), AT["s5:layang"], 0.06)
groan(AT["s5:menggeser"], 1.8, 80, 0.06); g(M.thump(0.4), AT["s5:menggeser"] + 0.3, 0.1)
# s6 congealing: sparse sticky gloops, music dips under the casualty line (no stinger)
for i in range(10):
    gloop(AT["s6:mendingin"] + i * 0.55 + 0.1 * np.sin(i * 2), 0.018, 140 + 15 * (i % 4))
# s7 court
for k in ("s7:menyatakan", "s7:lalai"):
    g(M.thump(0.25), AT[k], 0.08); g(M.band(M.burst(0.06, 90, 1), 1500, 6000), AT[k], 0.05)
g(M.lib("glitch-1"), AT["s7:menyatakan"] + 0.05, 0.015)
for i in range(12):
    click(AT["s7:seratus"] - 0.2 + i * 0.12, 0.012)  # windows lighting
# ripple beads: soft drip + click each
for k in ("s4:paku", "s4:terbelah", "s5:Gelombangnya", "s5:menabrak", "s6:meninggal", "s7:Gugatan"):
    gloop(AT[k] + 0.42, 0.03, 220); click(AT[k] + 0.45, 0.025)
# s8: warm sweetness, rewind and recap pulse
g(M.lib("sparkle"), AT["s8:bau"], 0.02)
g(M.lib("whoosh-cinematic"), AT["s8:Satu"] - 0.9, 0.03)
for i in range(6):
    click(AT["s8:Satu"] + i * 0.12, 0.03)
g(M.lib("chime"), AT["s8:Menurut"], 0.025)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
