"""EP42 sound: a dark D-minor documentary bed (low strings-like pad, slow pulse, sparse piano notes) that turns cold
in 1816. Eruption: sub booms, rumble bed and ash hiss on the island; the boom ring gets a long rolling thunder to
Batavia; collapse = deep crack + rumble; pyroclastic roar; ash-fall patter. Globe: airy space tone, sulfur shimmer.
Field: wind + snow hush, market creak. Villa: rain on glass, thunder, candle crackle, quill scratch on Frankenstein.
A soft survey ping on every ripple pin. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4215)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 72

# D minor: i - VI - III - VII (cold section: i - iv - i - v)
progA = [[38, 50, 53, 57], [34, 46, 50, 53], [41, 48, 53, 57], [36, 48, 52, 55]]
progB = [[38, 50, 53, 57], [43, 50, 55, 58], [38, 50, 53, 57], [45, 52, 57, 60]]
pad, pul, pno = M.mono(), M.mono(), M.mono()
for k, t0 in enumerate(np.arange(0.05, END + 2, beat * 4)):
    ch = (progB if K["s6"] - 0.5 < t0 < K["s8"] else progA)[k % 4]
    for m in ch:
        M.lay(pad, M.note(hz(m), beat * 4.3, "saw", 0.25, 0.5), t0, 0.22)
for k, t0 in enumerate(np.arange(0.05, END, beat)):
    M.lay(pul, M.tone((hz(38), hz(50)), 0.5, 7), t0, 0.6 if k % 4 == 0 else 0.3)
for k, t0 in enumerate(np.arange(beat * 2, END, beat * 2)):
    if k % 3 == 2:
        continue
    ch = (progB if K["s6"] - 0.5 < t0 < K["s8"] else progA)[int(t0 / (beat * 4)) % 4]
    M.lay(pno, M.note(hz(ch[1 + k % 3] + 24), 1.6, "pluck", 2.2), t0, 0.25)
pad = M.band(pad, 60, 1400)
for x in (pad, pul, pno):
    x /= max(1e-6, np.abs(x).max())
e_all = M.env([(0, 0.0), (0.4, 0.9), (K["s2"], 0.7), (AT["s2:Letusannya"], 0.95), (K["s4"], 0.8), (K["s5"], 0.9), (K["s7"], 0.7), (K["s8"], 0.9), (END, 0.95), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.45 * pad + 0.3 * pul + 0.18 * pno) * e_all
music = stereo(mono, 0.05 * pno * e_all + 0.04 * pad * e_all)


def boom(t, a=0.12):
    g(M.thump(0.9), t, a); g(M.band(M.burst(1.6, 2.2, 6), 30, 400), t, a * 0.9)


def rumble(t0, t1, a=0.04, lo=25, hi=220):
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    s = M.band(rng.standard_normal(n), lo, hi)
    s *= np.sin(np.pi * np.arange(n) / n) ** 0.5
    g(s / max(1e-6, np.abs(s).max()), t0, a)


def hiss(t0, t1, a=0.02, lo=2500, hi=9000):
    n = int((t1 - t0) * SR)
    s = M.band(rng.standard_normal(n), lo, hi) * np.sin(np.pi * np.arange(n) / n) ** 0.4
    g(s / max(1e-6, np.abs(s).max()), t0, a)


def ping(t, a=0.03):
    g(M.tone((1320, 1980), 0.5, 7), t, a); g(M.tone((2640,), 0.2, 20), t, a * 0.3)


# hook: night eruption
boom(0.05, 0.14); rumble(0, K["s2"], 0.06)
g(M.lib("whoosh-cinematic"), 0.05, 0.03)
for k in ("s1:Indonesia", "s1:Eropa"):
    g(M.lib("pop"), AT[k], 0.03)
g(M.lib("chime"), AT["s1:Eropa"] + 0.1, 0.02)
for bt in (0.75, 2.2, 3.9, 5.1):
    g(M.band(M.burst(0.5, 6, 2), 200, 6000), bt, 0.05)
# set changes under ash dips
for k in ("s2", "s3", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.3, 0.03)
for k in ("s2:Dentumannya-0.3", "s5:Gas-0.35", "s6:Di-0.2"):
    g(M.lib("whoosh-short"), AT[k] - 0.1, 0.03)
# s2: calm then eruption, boom rolls to Batavia
rumble(K["s2"], AT["s2:Letusannya"], 0.012, 30, 120)
g(M.lib("riser"), AT["s2:Letusannya"] - 1.0, 0.025)
boom(AT["s2:Letusannya"], 0.16); rumble(AT["s2:Letusannya"], AT["s2:Dentumannya-0.3"], 0.07)
boom(AT["s2:Dentumannya"], 0.12)
rumble(AT["s2:Dentumannya"], AT["s2:Batavia"] + 1.2, 0.06, 30, 600)
g(M.lib("impact-bass-1"), AT["s2:Batavia"], 0.04); g(M.lib("ping"), AT["s2:Batavia"] + 0.05, 0.025)
for i in range(10):
    g(M.lib("click-soft"), AT["s2:seribu"] - 0.3 + i * 0.13, 0.015)
# s3: cut ring, collapse, pyroclastic roar
g(M.lib("sparkle"), AT["s3:Sepertiga"], 0.02)
g(M.band(M.burst(0.4, 9, 1), 800, 8000), AT["s3:menjadi"] - 0.05, 0.06); boom(AT["s3:menjadi"], 0.14)
rumble(AT["s3:menjadi"], AT["s3:meter#2"] + 0.6, 0.08, 20, 300)
for i in range(14):
    g(M.lib("click-soft"), AT["s3:menjadi"] + i * 0.18, 0.012)
rumble(AT["s3:Desa-desa"] - 0.4, K["s4"] + 1.5, 0.08, 40, 1200)
hiss(AT["s3:Desa-desa"], K["s4"] + 1.0, 0.025, 1500, 6000)
# s4: ash fall patter on the sawah
hiss(K["s4"], K["s5"], 0.012, 4000, 11000)
for i in range(60):
    g(M.band(M.burst(0.02, 200, 1), 3000, 9000), K["s4"] + rng.uniform(0, K["s5"] - K["s4"]), 0.012)
g(M.tone((220, 165), 1.4, 1.5), AT["s4:puluhan"], 0.02)
# s5: rise into the plume, space, sulfur shimmer, reflected rays
g(M.lib("riser"), K["s5"] + 0.6, 0.025); rumble(K["s5"], AT["s5:Gas-0.35"], 0.06)
tt = np.arange(int((K["s6"] - AT["s5:Gas"]) * SR)) / SR
sh = np.sin(2 * np.pi * 880 * tt + 3 * np.sin(2 * np.pi * 0.7 * tt)) * 0.5 + np.sin(2 * np.pi * 1320 * tt) * 0.3
sh *= np.sin(np.pi * tt / tt[-1]) ** 0.8
g(sh, AT["s5:Gas"], 0.008)
for i in range(7):
    g(M.lib("sparkle"), AT["s5:memantulkan"] + i * 0.18, 0.012)
# s6: cold wind + snow, market, India monsoon, cholera
wn = int((AT["s6:Di-0.2"] - K["s6"]) * SR)
wind = M.band(rng.standard_normal(wn), 200, 1600) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * np.arange(wn) / SR))
wind *= np.minimum(1, np.minimum(np.arange(wn) / SR / 0.6, (wn - np.arange(wn)) / SR / 0.6))
g(wind / max(1e-6, np.abs(wind).max()), K["s6"], 0.03)
g(M.lib("impact-bass-1"), AT["s6:1816"], 0.04); g(M.lib("chime"), AT["s6:Salju"], 0.02)
g(M.band(M.burst(0.6, 5, 4), 120, 900), AT["s6:Panen"] + 0.2, 0.03)
g(M.lib("glitch-1"), AT["s6:kerusuhan"], 0.012)
rumble(AT["s6:Di-0.2"], K["s7"], 0.03, 200, 3000)
for i in range(16):
    g(M.lib("click-soft"), AT["s6:kolera"] + i * 0.11, 0.01)
# s7: rain, thunder, candle, quill
rn = int((K["s8"] - K["s7"]) * SR)
rain = M.band(rng.standard_normal(rn), 1500, 9000) * np.minimum(1, np.minimum(np.arange(rn) / SR / 0.5, (rn - np.arange(rn)) / SR / 0.5))
g(rain / max(1e-6, np.abs(rain).max()), K["s7"], 0.03)
for lt in (72.9, 76.3, 79.4):
    g(M.band(M.burst(2.4, 1.6, 8), 25, 500), lt + 0.25, 0.08)
for i in range(30):
    g(M.band(M.burst(0.01, 300, 1), 2000, 7000), K["s7"] + rng.uniform(0, K["s8"] - K["s7"]), 0.006)
for i in range(14):
    g(M.band(M.burst(0.07, 40, 1), 3000, 10000), AT["s7:Frankenstein"] + i * 0.075, 0.025)
g(M.lib("sparkle"), AT["s7:Frankenstein"] + 0.4, 0.02)
# ripple pins
for k in ("s2:Dentumannya", "s4:Abu", "s5:belerang", "s6:Salju", "s6:Panen", "s6:kolera", "s7:Frankenstein"):
    ping(AT[k] + 0.25, 0.03)
# s8: today, ripple rings, recap
g(M.lib("riser"), K["s8"] - 0.8, 0.02); g(M.lib("impact-bass-1"), AT["s8:Satu"], 0.03)
for i in range(7):
    ping(AT["s8:Satu"] + 0.5 + i * 0.12, 0.018)
for k in ("s8:cuaca", "s8:perut", "s8:sastra"):
    g(M.lib("pop"), AT[k], 0.03)
g(M.lib("sparkle"), AT["s8:Menurut"], 0.02)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
