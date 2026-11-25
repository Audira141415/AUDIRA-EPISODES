"""EP31 sound: a curious, slightly mischievous sketchbook bed in A minor (soft pizzicato-like plucks, a warm
triangle pad, a ticking pencil pulse), pencil scratches when the city is drawn, a dripping sewer ambience, rat
squeaks and scurries, coin clinks, a scissors snip, a rubber-stamp thump on DIBATALKAN and a small metal clink each
time a link is added to the chain of tags. The 1903 plague numbers get space: the music thins out there.
Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1902)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 96

# A minor: i - VI - iv - V, two bars each
prog = [[45, 57, 60, 64], [41, 57, 60, 65], [38, 57, 62, 65], [40, 56, 59, 64]]
chord = lambda t: prog[int(t / (beat * 8)) % 4]
pad, plk, tick = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 1.5, beat * 8):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 8.4, "tri", 0.35, 1.2), t0, 0.35)
pat = [0, 2, 1, 3, 2, 1, 3, 2]
for k, t0 in enumerate(np.arange(beat * 2, END + 0.5, beat / 2)):
    if k % 8 in (3, 7):
        continue
    ch = chord(t0)
    M.lay(plk, M.note(hz(ch[1 + pat[k % 8] % 3] + 12), 0.4, "pluck", 9), t0, 0.55 if k % 4 == 0 else 0.32)
for t0 in np.arange(beat * 8, END, beat):
    M.lay(tick, M.band(M.burst(0.018, 260, 1), 3000, 9000), t0, 0.4)
pad = M.band(pad, 70, 1600)
for x in (pad, plk, tick):
    x /= max(1e-6, np.abs(x).max())
s7t, s8 = AT["s7:Tahun"], K["s8"]
e_all = M.env([(0, 0.0), (0.3, 0.85), (K["s5"], 0.85), (K["s6"], 0.95), (s7t - 0.5, 0.95), (s7t + 0.5, 0.45), (s8 - 0.3, 0.45), (s8 + 0.5, 0.85), (END, 0.95), (DUR - 0.4, 0), (DUR, 0)])
e_plk = M.env([(0, 1), (s7t - 0.5, 1), (s7t + 0.5, 0.15), (s8 - 0.3, 0.15), (s8 + 0.5, 1), (DUR, 1)])
mono = (0.45 * pad + 0.36 * plk * e_plk + 0.09 * tick) * e_all
music = stereo(mono, 0.07 * plk * e_plk * e_all + 0.04 * pad * e_all)


def squeak(t, a=0.02):
    f0 = 2600 + rng.random() * 1400
    n = int(0.09 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * (f0 * tt + 6000 * tt * tt)) * np.exp(-tt * 30) * np.minimum(1, tt / 0.004)
    g(s, t, a)


def scurry(t, dur, a=0.03):
    x = M.band(M.burst(dur, 0, 1), 2500, 9000)
    x *= (np.sin(2 * np.pi * 23 * np.arange(len(x)) / SR) > 0.3) * np.minimum(1, np.minimum(np.arange(len(x)) / (0.2 * SR), (len(x) - np.arange(len(x))) / (0.3 * SR)))
    g(x, t, a)


def scratch(t, dur, a=0.03):
    x = M.band(M.burst(dur, 0, 1), 1800, 7000)
    x *= 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 5 * np.arange(len(x)) / SR))
    x *= np.minimum(1, np.minimum(np.arange(len(x)) / (0.05 * SR), (len(x) - np.arange(len(x))) / (0.1 * SR)))
    g(x, t, a)


def clink(t, a=0.03):
    g(M.tone((2900, 4350, 6100), 0.35, 14), t, a); g(M.band(M.burst(0.01, 300, 1), 4000, 12000), t, a * 0.6)


def snip(t, a=0.06):
    g(M.band(M.burst(0.05, 120, 1), 3000, 11000), t, a); g(M.tone((3400, 5100), 0.12, 30), t + 0.01, a * 0.4)


# sewer drips + low room tone under the whole film
room = M.band(rng.standard_normal(N), 50, 400); room /= np.abs(room).max()
se = M.env([(0, 0.0), (0.4, 1.0), (DUR - 0.5, 0.8), (DUR, 0)])
M.fx += np.stack([room * se, np.roll(room, 900) * se], 1) * 0.012
for t0 in np.arange(0.8, END, 1.37):
    g(M.tone((1500 + 300 * np.sin(t0), 2250), 0.12, 40), t0 + 0.3 * np.sin(t0 * 3), 0.006)

# s1 hook
g(M.lib("whoosh-short"), max(0, AT["s1:membayar"] - 0.4), 0.03)
for i in range(3):
    clink(AT["s1:membayar"] + 0.3 + i * 0.07, 0.05 - i * 0.012)
g(M.lib("click-soft"), AT["s1:dibunuh"], 0.04)
scurry(AT["s1:Hasilnya"] - 0.2, 2.6, 0.05)
for i in range(7):
    squeak(AT["s1:Hasilnya"] + 0.2 + i * 0.3, 0.018)
g(M.lib("impact-bass-1"), AT["s1:banyak"], 0.05); g(M.lib("pop"), AT["s1:banyak"], 0.04)
# station changes
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.35, 0.028)
# chain links
for k in ("s2:saluran", "s3:berkembang", "s3:wabah", "s4:pemburu", "s5:sen", "s6:memotong", "s6:peternakan", "s7:lebih"):
    clink(AT[k] + 0.25, 0.035); g(M.lib("click"), AT[k] + 0.05, 0.02)
# s2: map, pencil drawing the city, sewer
g(M.lib("chime"), AT["s2:Prancis"] - 0.6, 0.02)
scratch(AT["s2:Prancis"] - 0.6, 3.2, 0.03)
g(M.lib("pop"), AT["s2:Gubernur"], 0.03)
g(M.lib("riser"), AT["s2:lebih"] - 0.8, 0.02)
# s3: highway, cat crossed, climb, flea
scurry(K["s3"], 3.0, 0.04)
g(M.lib("error"), AT["s3:Tanpa"], 0.025)
scurry(AT["s3:berkembang"] - 0.3, 2.0, 0.05)
for i in range(6):
    squeak(AT["s3:naik"] + i * 0.25, 0.016)
g(M.lib("sparkle"), AT["s3:kutu"] - 0.3, 0.02)
# s4: hunters' footsteps, ledger writes
for i in range(10):
    g(M.band(M.burst(0.05, 60, 2), 120, 1500), K["s4"] + 0.2 + i * 0.4, 0.05)
for k in ("s4:turun", "s4:satu", "s4:dua"):
    scratch(AT[k] - 0.05, 0.5, 0.035)
g(M.lib("typing"), AT["s4:melaporkan"], 0.02)
g(M.thump(0.3), AT["s4:tidak"], 0.07)
# s5: queue, coin flip, rejected carcasses
for i in range(14):
    g(M.band(M.burst(0.04, 70, 2), 150, 1800), AT["s5:Siapa"] + i * 0.22, 0.03)
g(M.lib("whoosh"), AT["s5:satu"] - 0.4, 0.025)
for i in range(4):
    clink(AT["s5:satu"] + 0.7 + i * 0.09, 0.05 - i * 0.01)
g(M.lib("click-soft"), AT["s5:Buktinya"], 0.03)
g(M.lib("error"), AT["s5:bangkai"] - 0.2, 0.025)
# s6: snip, release, babies, cart, farm
snip(AT["s6:ekornya"] - 0.05, 0.08)
g(M.lib("whoosh-short"), AT["s6:ekornya"], 0.025)
scurry(AT["s6:melepas"], 1.3, 0.05)
for i in range(7):
    squeak(AT["s6:beranak"] + i * 0.18, 0.014)
for i in range(12):
    g(M.band(M.burst(0.06, 40, 3), 90, 900), AT["s6:Ada"] + i * 0.3, 0.035)
scurry(AT["s6:Bahkan"] - 0.5, 3.5, 0.045)
for i in range(8):
    squeak(AT["s6:peternakan"] + i * 0.22, 0.015)
# s7: stamp, swarm, calm for the plague numbers
g(M.thump(0.35), AT["s7:dibatalkan"] - 0.1, 0.14); g(M.band(M.burst(0.08, 50, 3), 200, 3000), AT["s7:dibatalkan"] - 0.1, 0.05)
scurry(AT["s7:tikusnya"] - 0.3, 3.0, 0.06)
g(M.tone((440, 660), 1.5, 1.6), AT["s7:159"], 0.012)
# s8: pull back, loop closes, outro
g(M.lib("riser"), AT["s8:Sejarawan"] - 0.5, 0.02)
for i in range(4):
    clink(AT["s8:Sejarawan"] + 0.5 + i * 0.2, 0.025)
g(M.lib("sparkle"), AT["s8:kalau"], 0.02)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
