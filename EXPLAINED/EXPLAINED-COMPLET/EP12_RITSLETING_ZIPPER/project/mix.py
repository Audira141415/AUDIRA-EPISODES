"""EP12 sound: a sewing-room string trio. A plucked kecapi-like harp in D dorian at 84 BPM over a soft cello drone and a
brushed tick groove that sounds like a needle going through cloth. The history scenes add a treadle-machine rhythm; the
mechanism scenes add tiny brass ticks for every tooth that locks. SFX: real-sounding zip sweeps (band-passed noise with a
tooth-rate buzz) every time the slider moves, clasp pops in s2, a wax-seal thump in s3, a stamp on "ZIP".
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1917)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 84
D3 = 146.83
hz = lambda st, base=D3: base * 2 ** (st / 12)


def pluck(f, dur=1.6, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (2.2 + 1.6 * h)) / h ** 1.2 for h in range(1, 7))
    return x * np.minimum(1, t / 0.003) * a


def tick(f=3200, a=1.0):
    t = np.arange(int(0.05 * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 120) * a


def zipsweep(dur, up=True, a=0.06, rate=60):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = M.band(M.rng.standard_normal(n), 1800, 7000)
    buzz = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * np.cumsum(rate * (0.6 + 0.8 * (t / dur if up else 1 - t / dur))) / SR))
    env = np.minimum(1, t / 0.03) * np.minimum(1, (dur - t) / 0.06)
    return x / (np.abs(x).max() + 1e-9) * buzz * env * a


harp, cel, grv = M.mono(), M.mono(), M.mono()
prog = [0, 5, 3, -2]  # Dm, G, F, C (dorian colour)
DOR = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17]
i, t0 = 0, 0.05
while t0 < END + 1.5:
    root = prog[(i // 8) % 4]
    arp = [0, 7, 12, 15, 12, 7, 3, 7][i % 8]
    M.lay(harp, pluck(hz(root + arp), 1.4, 0.8 if i % 4 == 0 else 0.5), t0)
    t0 += beat / 2
    i += 1
phr = {"s1": [12, 14, 15, 17], "s2": [7, 5, 3, 2], "s3": [3, 5, 7, 10], "s4": [12, 15, 17, 19], "s5": [19, 17, 15, 14, 12],
       "s6": [0, 3, 7, 10, 12], "s7": [7, 9, 10, 12], "s8": [12, 14, 15, 17, 19]}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.12
    for j, st in enumerate(notes):
        M.lay(harp, pluck(hz(st + 12), 1.6, 0.55), tt + j * beat * 0.5)
# cello drone, opens a fifth in the mechanism scenes
open5 = M.env([(0, 0), (K["s4"], 0), (K["s4"] + 1, 1), (K["s7"], 1), (K["s7"] + 0.6, 0.3), (K["s8"], 1), (DUR, 1)])
drone = 0.5 * np.sin(2 * np.pi * 73.42 * T + 0.3 * np.sin(T * 0.5)) + 0.25 * np.sin(2 * np.pi * 146.83 * T) + open5 * 0.22 * np.sin(2 * np.pi * 110 * T + np.sin(T * 0.3))
# needle-through-cloth groove: brushed ticks on 8ths, a treadle "thunk-chk" in the history scenes
t0, i = 0.05, 0
brush = lambda: M.band(M.burst(0.06, 70, 1), 2500, 9000)
while t0 < END:
    M.lay(grv, brush(), t0, 0.35 if i % 2 == 0 else 0.18)
    if K["s2"] <= t0 < K["s4"] - 0.2 and i % 2 == 0:
        M.lay(grv, M.band(M.burst(0.08, 40, 1), 120, 600), t0, 0.5)
    t0 += beat / 2
    i += 1
for w in ("s1:kembar", "s2:Judson", "s3:Gideon", "s4:sepuluh", "s5:masuk", "s6:mengunci", "s7:Zip", "s8:AUDIRA"):
    M.lay(cel, pluck(hz(24), 2.0, 0.4), AT[w])
for st in (0, 3, 7, 10, 14):
    M.lay(cel, pluck(hz(st + 12), 2.4, 0.4), AT["s8:AUDIRA"] + st * 0.012)
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.5 * harp + 0.35 * drone + 0.3 * grv + 0.4 * cel) * e
side = 0.22 * np.roll(harp + cel, 900) * e
music = stereo(mono, side)

# ---- SFX ----
for s in ("s2", "s4", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.06)
for s in ("s3", "s5", "s6"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.045)
# hook: the slider closes slowly
g(zipsweep(max(0.4, K["s1e"] - 0.6), True, 0.035, 30), 0.6)
g(M.lib("ping"), AT["s1:Y"], 0.04)
g(M.lib("pop"), AT["s2:clasp"], 0.05)
for j in range(4):
    g(M.lib("click"), AT["s2:macet"] + j * 0.11, 0.04)
for j in range(6):
    g(M.lib("click-soft"), AT["s2:terbuka"] + j * 0.08, 0.06)
g(M.lib("pop"), AT["s3:Gideon"], 0.05)
g(M.lib("impact-bass-1"), AT["s3:terbit"], 0.05)
g(M.thump(0.25), AT["s3:terbit"], 0.1)
for j in range(6):
    g(tick(2800 + 120 * j), AT["s4:sepuluh"] + j * 0.07, 0.05)
g(M.lib("chime"), AT["s4:tonjolan"], 0.035)
g(M.lib("click-soft"), AT["s4:cekungan"], 0.06)
g(M.lib("click"), AT["s5:masuk"] + 0.3, 0.06)
g(M.lib("click-soft"), AT["s5:sendok"] + 0.35, 0.06)
g(M.lib("sparkle"), AT["s5:cukup"], 0.04)
# s6: three slider moves = three zips, with teeth ticks while closing
g(zipsweep(max(0.4, AT["s6:tarik"] - AT["s6:slider"] + 0.5), False, 0.06), AT["s6:slider"] - 0.2)
du = max(0.4, AT["s6:mengunci"] - AT["s6:atas"] + 0.3)
g(zipsweep(du, True, 0.07), AT["s6:atas"] - 0.1)
for j in range(int(du / 0.06)):
    g(tick(3600, 1), AT["s6:atas"] + j * 0.06, 0.02)
g(M.lib("ping"), AT["s6:mengunci"] + 0.2, 0.04)
g(zipsweep(max(0.4, AT["s6:membelah"] - AT["s6:bawah"] + 0.5), False, 0.07), AT["s6:bawah"] - 0.1)
g(M.lib("glitch-1"), AT["s6:baji"], 0.02)
g(M.lib("pop"), AT["s7:zipper"], 0.05)
g(M.lib("click-soft"), AT["s7:Goodrich"], 0.05)
g(zipsweep(0.4, True, 0.1, 90), AT["s7:Zip"] - 0.15)
g(M.thump(0.2), AT["s7:Zip"] + 0.25, 0.1)
g(M.lib("error"), AT["s8:aus"], 0.025)
g(M.lib("chime"), AT["s8:giginya"], 0.035)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
