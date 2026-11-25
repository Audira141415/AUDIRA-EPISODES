"""EP08 sound: a clean precision lab. A muted sine-pluck arpeggio in E lydian at 112 BPM over a soft sub pulse and a
glassy pad, a tight hi-hat tick (like a timing gate) that joins in the lab scenes. The bed thins to a held breath
before the ignition (s4) and the crash, then opens up on the deployment. SFX: sensor beeps, data chirps, the crash
thump with debris, igniter crack, gas rush, the bag pop, vent hiss, timing ticks, belt click.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(808)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 112
E3 = 164.81
LYD = [0, 2, 4, 6, 7, 9, 11, 12, 14, 16, 18, 19]
hz = lambda st, base=E3: base * 2 ** (st / 12)


def pluck(f, dur=0.9, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 9) + 0.08 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 14)
    return x * np.minimum(1, t / 0.003) * a


def beep(f, dur=0.08, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.002) * np.minimum(1, (dur - t) / 0.01) * a


ar, pd, hh, sb = M.mono(), M.mono(), M.mono(), M.mono()
tPem, tTem, tDor = AT["s4:pemantik"], AT["s3:tembok"], AT["s5:mendorong"]
holds = [(AT["s3:Patokannya"] + 0.3, tTem), (AT["s4:arus"] - 0.2, tPem)]
held = lambda t: any(a < t < b for a, b in holds)
cells = {"s1": [0, 4, 7, 11], "s2": [0, 7, 9, 14], "s3": [2, 6, 9, 14], "s4": [-3, 4, 7, 9], "s5": [0, 4, 6, 11], "s6": [-1, 2, 7, 9], "s7": [0, 4, 7, 12], "s8": [0, 7, 11, 16]}
scn = lambda t: max((s for s in cells if K[s] - 0.05 <= t), key=lambda s: K[s], default="s1")
i, t0 = 0, 0.05
while t0 < END + 1.0:
    if not held(t0):
        c = cells[scn(t0)]
        M.lay(ar, pluck(hz(c[i % 4] + (12 if i % 8 >= 4 else 0)), 0.8, 0.8 if i % 2 == 0 else 0.5), t0)
    t0 += beat / 2
    i += 1
# sub pulse on every beat, hats from s2
t0, i = 0.05, 0
while t0 < END + 0.5:
    if not held(t0):
        tt = np.arange(int(0.3 * SR)) / SR
        M.lay(sb, np.sin(2 * np.pi * 55 * tt * (1 + 0.6 * np.exp(-tt * 30))) * np.exp(-tt * 9), t0, 0.8 if i % 4 == 0 else 0.45)
        if t0 > K["s2"]:
            for h in (0, beat / 2):
                M.lay(hh, M.band(M.burst(0.04, 80, 1), 6000, 14000), t0 + h, 0.12 if h else 0.07)
    t0 += beat
    i += 1
# glassy pad: E lydian chord tones, detuned
pad = sum(np.sin(2 * np.pi * hz(st, 82.41) * T * d + st) for st in (0, 7, 16, 18) for d in (1.0, 1.003)) / 8
pad_env = M.env([(0, 0.5), (K["s2"], 0.8), (holds[0][0], 1.0), (tTem, 1.0), (tTem + 0.5, 0.6), (K["s5"], 0.8), (END, 0.8), (DUR, 0)])
pd += pad * pad_env
# risers into the crash and the ignition
for a, b in holds:
    rz = np.arange(int((b - a) * SR)) / SR
    x = M.band(M.rng.standard_normal(len(rz)), 800, 7000) * (rz / rz[-1]) ** 2
    M.lay(pd, x / np.abs(x).max(), a, 0.35)
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.5 * ar + 0.45 * sb + 0.3 * hh + 0.4 * pd) * e
side = 0.18 * np.roll(ar + hh, 700) * e
music = stereo(mono, side)


# ---- SFX ----
def hiss(t, dur, a, lo=2500, hi=10000):
    x = M.band(M.rng.standard_normal(int(dur * SR)), lo, hi)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (0.08 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.6 * SR))
    g(x / np.abs(x).max() * env, t, a)


g(M.lib("riser"), 0.0, 0.03)
hiss(0.2, 3.0, 0.025, 1500, 8000)
g(M.lib("glitch-1"), AT["s1:listrik"], 0.05)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.25, 0.06)
g(M.lib("whoosh-short"), AT["s3:Patokannya"] - 0.3, 0.06)
g(M.lib("whoosh-short"), AT["s7:Menurut"] - 0.3, 0.05)
# sensor + ECU: beeps and data chirps
for w in ("s2:percepatan", "s2:mengukur", "s2:melambat"):
    g(beep(1760, 0.07), AT[w], 0.05)
tc = K["s2"] + 1.0
while tc < AT["s3:Patokannya"]:
    g(beep(2400 + 400 * ((tc * 7) % 3), 0.025), tc, 0.018)
    tc += 0.21
g(beep(880, 0.12), AT["s3:memutuskan"], 0.05)
g(beep(1320, 0.3), AT["s3:keras"], 0.06)
# crash: thump, metal crunch, debris
g(M.thump(0.5), tTem, 0.3)
g(M.lib("impact-bass-1"), tTem, 0.12)
hiss(tTem, 0.9, 0.08, 300, 4000)
for j in range(24):
    g(M.band(M.burst(0.02, 300, 1), 2000, 9000), tTem + 0.05 + M.rng.random() * 1.4, 0.02 + 0.03 * M.rng.random())
g(M.lib("ping"), AT["s3:tiga"], 0.05)
# inflator: current, igniter crack, reaction crackle, gas rush
g(M.lib("glitch-2"), AT["s4:arus"], 0.04)
g(M.lib("click"), tPem, 0.2)
g(M.burst(0.05, 120, 1) * 0.8, tPem, 0.12)
for j in range(30):
    g(M.band(M.burst(0.012, 400, 1), 1500, 8000), AT["s4:bereaksi"] + M.rng.random() * 1.6, 0.02 + 0.03 * M.rng.random())
hiss(AT["s4:menghasilkan"] - 0.2, 2.4, 0.07, 400, 6000)
# deployment: pop + whoosh, dashboard bag
g(M.lib("impact-bass-1"), tDor, 0.16)
g(M.burst(0.08, 60, 1) * 0.8, tDor, 0.1)
g(M.lib("whoosh-cinematic"), tDor - 0.05, 0.07)
g(M.lib("whoosh"), AT["s5:dasbor"] - 0.3, 0.05)
g(M.lib("pop"), AT["s5:penuh"], 0.05)
# head press + vent hiss
g(M.thump(0.3), AT["s6:kepalamu"] + 0.1, 0.1)
hiss(AT["s6:sebagian"], AT["s6:mendadak"] - AT["s6:sebagian"] + 0.6, 0.04, 1500, 9000)
# timing ticks along the rail
tk = AT["s7:selesai"]
while tk < AT["s7:detik"] + 0.2:
    g(beep(3200, 0.012), tk, 0.03)
    tk += 0.1
g(M.lib("chime"), AT["s7:lima"], 0.04)
# belt clicks, child seat
g(M.lib("click"), AT["s8:sabuk"], 0.12)
g(M.lib("click-soft"), AT["s8:sabuk#2"], 0.1)
g(M.lib("click-soft"), AT["s8:anak"], 0.08)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
