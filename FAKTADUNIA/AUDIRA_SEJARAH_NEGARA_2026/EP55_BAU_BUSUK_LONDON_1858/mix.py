"""EP55 sound: a slow Victorian bed in E minor (bowed low pad, music-box style pluck, soft sub), river lapping and
slow sewage bubbles under the Thames, flies buzzing in the heat beat, a creaking hand pump and the handle being
lifted off, a thick wax-seal stamp + coin clinks for the bill, masonry thuds and a rising embankment rumble,
a steady beam-engine "chuff" when the pumps start, and a clean flowing-water wash at the payoff. One soft drip+click
per pipe-flow segment. Calm, no stinger on the cholera line. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1858)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 76

# E minor: i - VI - III - VII, brighter (major lift) after the sewers are built
prog = [[40, 52, 55, 59], [36, 48, 52, 55], [43, 50, 55, 59], [38, 50, 54, 57]]
chord = lambda t: prog[int(t / (beat * 4)) % 4]
pad, pno, sub = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 2, beat * 4):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 4.3, "saw", 0.3, 0.3), t0, 0.2)
for k, t0 in enumerate(np.arange(beat * 2, END + 0.5, beat / 2)):
    ch = chord(t0)
    if k % 8 in (3, 7):
        continue
    f = hz(ch[1 + (k * 3) % 3] + 24)
    M.lay(pno, M.note(f, 1.1, "pluck", 3.0), t0, 0.32 if k % 4 == 0 else 0.18)
for t0 in np.arange(0.05, END + 1, beat * 2):
    M.lay(sub, M.note(hz(chord(t0)[0] - 12), beat * 1.5, "sine", 1.5, 0.05), t0, 0.55)
pad = M.band(pad, 70, 1500)
for x in (pad, pno, sub):
    x /= max(1e-6, np.abs(x).max())
e_all = M.env([(0, 0.0), (0.4, 0.75), (K["s2"], 0.6), (AT["s3:1831"] - 0.3, 0.42), (K["s4"], 0.6), (K["s5"], 0.7),
               (K["s6"], 0.65), (K["s7"], 0.75), (AT["s7:berhenti"], 0.85), (K["s8"], 0.7), (END, 0.85), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.5 * pad + 0.3 * pno + 0.24 * sub) * e_all
music = stereo(mono, 0.05 * pno * e_all + 0.05 * pad * e_all)


def click(t, a=0.03):
    g(M.band(M.burst(0.02, 250, 1), 1500, 9000), t, a); g(M.tone((1800,), 0.03, 120), t, a * 0.3)


def bubble(t, a=0.02, f0=150):
    n = int(0.16 * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 2.2 * tt / 0.16)
    g(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 20), t, a)


def creak(t, dur=0.5, f0=140, a=0.03):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 0.4 * np.sin(2 * np.pi * 3 * tt))
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.sin(np.pi * tt / dur)
    g(M.band(s, 300, 3000), t, a)


def clink(t, a=0.03, f=3200):
    g(M.tone((f, f * 1.51, f * 2.3), 0.35, 14), t, a)


def chuff(t, a=0.03):
    g(M.band(M.burst(0.22, 18, 1), 200, 2500), t, a)


# river bed: lapping water (band noise, slow swell) present until the clean river, then a brighter flow
riv = M.band(rng.standard_normal(N), 120, 1300)
riv *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * T) * np.sin(2 * np.pi * 0.047 * T + 1)
riv *= M.env([(0, 0), (0.4, 0.8), (K["s4"], 0.8), (K["s4"] + 0.5, 0.25), (K["s5"], 0.9), (K["s7"], 0.7), (DUR - 0.5, 0.6), (DUR, 0)])
riv /= max(1e-6, np.abs(riv).max())
M.fx += np.stack([riv, np.roll(riv, 2200)], 1) * 0.02
clear = M.band(rng.standard_normal(N), 1500, 7000) * M.env([(0, 0), (AT["s7:dialirkan"], 0), (AT["s7:berhenti"], 0.7), (K["s8"] + 3, 0.5), (DUR - 0.5, 0.4), (DUR, 0)])
M.fx += np.stack([clear, np.roll(clear, 1500)], 1) * 0.008

# s1 hook: heavy drone + stench swell, bubbles
hook_n = int((K["s2"] + 0.2) * SR)
dr = M.band(rng.standard_normal(hook_n), 40, 260) * np.minimum(1, np.arange(hook_n) / (0.4 * SR)) * np.minimum(1, (hook_n - np.arange(hook_n)) / (0.8 * SR))
g(dr / np.abs(dr).max(), 0.0, 0.06)
g(M.lib("impact-bass-1"), 0.05, 0.05)
for i in range(10):
    bubble(0.4 + i * 0.62 + 0.13 * np.sin(i * 1.7), 0.018, 120 + 18 * (i % 5))
for k in ("s1:bau", "s1:parlemen"):
    g(M.lib("pop"), AT[k], 0.028)
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.3, 0.022)
# s2 houses popping up, outfalls pouring
for i in range(14):
    click(AT["s2:satu"] + 0.3 + i * (AT["s2:tiga"] - AT["s2:satu"]) / 14, 0.01)
g(M.lib("sparkle"), AT["s2:tiga"], 0.018)
pour = M.band(rng.standard_normal(int(4 * SR)), 200, 2200) * np.sin(np.pi * np.arange(int(4 * SR)) / int(4 * SR))
g(pour, AT["s2:limbah"] - 0.2, 0.025)
# s3 miasma: low swell; cholera line calm
sw = M.band(rng.standard_normal(int(3 * SR)), 60, 500) * np.sin(np.pi * np.arange(int(3 * SR)) / int(3 * SR)) ** 2
g(sw, AT["s3:bau"] - 0.5, 0.04)
# s4 pump: creaks while working, the handle lifted off, a low settle
for i in range(4):
    creak(K["s4"] + 0.4 + i * 1.05, 0.45, 150 + 10 * i, 0.02)
creak(AT["s4:mencopot"], 0.7, 110, 0.035)
g(M.thump(0.25), AT["s4:mencopot"] + 1.0, 0.06); clink(AT["s4:mencopot"] + 1.02, 0.02, 900)
g(M.lib("chime"), AT["s4:turun"], 0.012)
# s5 heat: flies + boiling bubbles + dripping curtains
fly_n = int((K["s6"] - K["s5"]) * SR); tt = np.arange(fly_n) / SR
fly = np.sin(2 * np.pi * (180 * tt + 6 * np.sin(2 * np.pi * 0.9 * tt))) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * tt)) * np.minimum(1, tt / 0.8) * np.minimum(1, (fly_n / SR - tt) / 0.8)
g(M.band(fly, 150, 2400), K["s5"], 0.012)
for i in range(16):
    bubble(AT["s5:mendidih"] + i * 0.4 + 0.1 * np.sin(i), 0.02, 110 + 25 * (i % 4))
for i in range(8):
    g(M.tone((2200 + 300 * (i % 3),), 0.06, 60), AT["s5:kapur"] + 0.4 + i * 0.33, 0.012)
# s6 bill stamp + coins
g(M.thump(0.3), AT["s6:disahkan"], 0.1); g(M.band(M.burst(0.08, 70, 1), 800, 5000), AT["s6:disahkan"], 0.05)
for i in range(12):
    clink(AT["s6:dana"] + i * (AT["s6:poundsterling"] - AT["s6:dana"] + 0.3) / 12, 0.014, 2900 + 200 * (i % 4))
# s7 embankment rumble, masonry, beam engine chuffs, street network ticks
rn = int((AT["s7:membangun"] + 1.0 - AT["s7:Joseph"]) * SR)
rum = M.band(rng.standard_normal(rn), 30, 300) * np.sin(np.pi * np.arange(rn) / rn)
g(rum / np.abs(rum).max(), AT["s7:Joseph"], 0.07)
g(M.thump(0.35), AT["s7:membangun"] + 1.0, 0.08)
for i in range(10):
    click(AT["s7:seribu"] + i * (AT["s7:jalan"] - AT["s7:seribu"]) / 10, 0.012)
t0 = AT["s7:dialirkan"] - 0.4
while t0 < OUT - 0.5:
    chuff(t0, 0.018 if t0 < K["s8"] else 0.01)
    t0 += 2 * np.pi / 1.6 / 2
g(M.lib("riser"), AT["s7:berhenti"] - 1.4, 0.02)
g(M.lib("chime"), AT["s7:berhenti"] + 0.1, 0.025)
# pipe-flow segments: drip + click each
for k in ("s2:limbah", "s3:Kolera", "s4:John", "s5:mendidih", "s6:disahkan", "s7:selokan", "s7:berhenti"):
    bubble(AT[k] + 0.1, 0.025, 260); click(AT[k] + 0.12, 0.02)
# s8 irony: strike, then warm resolve
g(M.band(M.burst(0.12, 40, 1), 1500, 7000), AT["s8:bukan"], 0.03)
g(M.lib("sparkle"), AT["s8:tepat"], 0.02)
g(M.lib("chime"), AT["s8:Menurut"], 0.022)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
