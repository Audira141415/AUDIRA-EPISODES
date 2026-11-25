"""EP05 sound: a warm acoustic kitchen at dusk. Koto-like plucks on a D yo pentatonic (D E F# A B) at 84 BPM,
a soft marimba ostinato, a wood-block + shaker groove that only joins in the workshop scene, and a low warm drone.
The bed thins to a held breath when the water runs out (s6) and blooms into a bright chord on the "klik".
SFX: bowl clinks, steam hiss, bubbling pops while water boils, timer ticks and ding, burnt crackle, the switch klik,
pot-lid rattles, conveyor clunks. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1955)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 84
D4 = 293.66
YO = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]  # D yo pentatonic, two octaves
hz = lambda st, base=D4: base * 2 ** (st / 12)


def koto(f, dur=1.6, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + 0.0008 * h)) * np.exp(-t * (2.2 + 1.6 * h)) / h ** 0.9 for h in range(1, 8))
    nz = M.band(M.burst(0.012, 300, 1), 2000, 8000)
    x[: len(nz)] += 0.25 * nz
    bend = 1 + 0.004 * np.exp(-t * 6)  # small pitch drop after the pluck, like a koto string
    x2 = np.sin(2 * np.pi * np.cumsum(f * bend) / SR) * np.exp(-t * 2.5)
    return (0.7 * x + 0.3 * x2) * np.minimum(1, t / 0.002) * a


def marimba(f, a=1.0):
    t = np.arange(int(0.7 * SR)) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + 0.3 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 22)) * np.minimum(1, t / 0.003) * a


kt, mr, pc, dr = M.mono(), M.mono(), M.mono(), M.mono()
tHab, tKlik = AT["s6:habis"], AT["s6:Klik"]
breath = (AT["s6:Termostat"], tKlik)  # held breath: only the drone and a riser
# marimba ostinato in 8ths, shifts between two cells by scene
cellA, cellB = [0, 7, 12, 7, 4, 7, 12, 14], [-3, 4, 9, 4, 2, 4, 9, 12]
i, t0 = 0, K["s2"] - 0.1
while t0 < END + 1.5:
    if not (breath[0] - 0.2 < t0 < breath[1]) and not (K["s4"] < t0 < K["s5"] and i % 2):
        cell = cellB if (K["s4"] < t0 < K["s5"] or K["s7"] < t0 < AT["s7:Keberhasilannya"]) and (i // 8) % 2 else cellA
        M.lay(mr, marimba(hz(cell[i % 8], 146.83), 0.9 if i % 2 == 0 else 0.6), t0)
    t0 += beat / 2
    i += 1
# koto phrases on scene openings and key words
phr = {"s1": [0, 4, 7, 9], "s2": [12, 9, 7], "s3": [7, 9, 12, 14, 12], "s4": [9, 7, 4, 2], "s5": [0, 2, 4, 7], "s7": [12, 14, 16, 19, 16], "s8": [7, 9, 12, 16, 19]}
for s, notes in phr.items():
    tt = (0.05 if s == "s1" else K[s] + 0.15)
    for j, st in enumerate(notes):
        M.lay(kt, koto(hz(st), 1.8, 0.9), tt + j * beat * 0.75)
for w in ("s3:Toshiba", "s5:titik", "s7:Fumiko", "s8:membaca"):
    M.lay(kt, koto(hz(19), 2.0, 0.6), AT[w])
# bright chord on the klik
for st in (0, 4, 7, 12, 16):
    M.lay(kt, koto(hz(st), 2.6, 0.55), tKlik + 0.06 + st * 0.004)
# light percussion: wood block on 2 and 4, shaker 8ths, from the workshop to the end of speech
blk = lambda: M.band(M.burst(0.06, 70, 1), 900, 2200) + 0.6 * np.sin(2 * np.pi * 1300 * np.arange(int(0.06 * SR)) / SR) * np.exp(-np.arange(int(0.06 * SR)) / SR * 60)
t0, i = K["s7"], 0
while t0 < END:
    if i % 4 in (1, 3):
        M.lay(pc, blk(), t0, 0.35)
    for h in (0, beat / 2):
        M.lay(pc, M.band(M.burst(0.07, 45, 1), 5000, 12000), t0 + h, 0.1 if h else 0.06)
    t0 += beat
    i += 1
# warm drone D2 + A2, swells under the breath
drone = 0.5 * np.sin(2 * np.pi * 73.42 * T) + 0.3 * np.sin(2 * np.pi * 110 * T) + 0.1 * np.sin(2 * np.pi * 146.83 * T + np.sin(T * 0.3))
dr += drone * (0.5 + 0.5 * M.env([(0, 0), (breath[0], 0), (breath[0] + 0.5, 1), (tKlik, 1), (tKlik + 1, 0), (DUR, 0)]))
rz = np.arange(int((tKlik - breath[0]) * SR)) / SR
riser = M.band(M.rng.standard_normal(len(rz)), 600, 6000) * (rz / rz[-1]) ** 2
M.lay(dr, riser / np.abs(riser).max(), breath[0], 0.25)
e = M.env([(0, 0.8), (K["s2"], 1), (breath[0], 1), (breath[0] + 0.4, 0.55), (tKlik, 0.55), (tKlik + 0.1, 1.05), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.55 * kt + 0.5 * mr + 0.45 * pc + 0.35 * dr) * e
side = 0.2 * np.roll(kt + pc, 900) * e
room = M.band(M.rng.standard_normal(N), 80, 600) * 0.012
music = stereo(mono + room, side)


# ---- SFX ----
def clink(t, a=0.08, f0=2100):
    tt = np.arange(int(0.8 * SR)) / SR
    x = sum(np.sin(2 * np.pi * f0 * r * tt) * np.exp(-tt * d) for r, d in ((1, 6), (1.57, 9), (2.48, 12), (3.9, 18)))
    g(x * np.minimum(1, tt / 0.001), t, a)


def hiss(t, dur, a):
    x = M.band(M.rng.standard_normal(int(dur * SR)), 2500, 10000)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (0.4 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.8 * SR)) * (0.8 + 0.2 * np.sin(np.arange(n) / SR * 2.1))
    g(x / np.abs(x).max() * env, t, a)


def pop(t, f, a):
    tt = np.arange(int(0.035 * SR)) / SR
    g(np.sin(2 * np.pi * np.cumsum(f * (1 + 2.5 * tt / 0.035)) / SR) * np.exp(-tt * 90), t, a)


clink(0.05, 0.07)
hiss(0.0, K["s2"] + 0.5, 0.025)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.3, 0.06)
g(M.lib("whoosh-cinematic"), AT["s2:Isinya"] - 0.1, 0.06)  # the shell slides away
g(M.lib("click-soft"), AT["s2:pemanas"], 0.07)
g(M.lib("click-soft"), AT["s2:mangkuk"], 0.07)
g(M.lib("ping"), AT["s2:termostat"], 0.05)
g(M.lib("pop"), AT["s2:otaknya"], 0.06)
g(M.lib("chime"), AT["s3:Mitsubishi"], 0.04)
g(M.lib("click"), AT["s3:otomatis#2"], 0.06)
g(M.lib("chime"), AT["s3:Desember"], 0.05)
# timer ticks through s4, a ding on "timer", burnt crackle on "gosong"
tt0 = K["s4"] + 0.6
while tt0 < K["s5"] - 0.3:
    g(M.band(M.burst(0.015, 300, 1), 2500, 7000), tt0, 0.05)
    tt0 += 0.5
clink(AT["s4:timer"] + 0.4, 0.06, 2600)
for j in range(40):
    g(M.band(M.burst(0.01, 400, 1), 1500, 9000), AT["s4:gosong"] - 0.2 + M.rng.random() * 1.6, 0.03 + 0.03 * M.rng.random())
g(M.lib("error"), AT["s4:belum"], 0.03)
# boiling: bubble pops while water remains, then they thin out as it runs dry
hiss(K["s5"], tHab - K["s5"] + 1.0, 0.03)
tb = K["s5"] + 0.3
while tb < tHab + 0.6:
    dens = 1 if tb < tHab - 1 else max(0.1, (tHab + 0.6 - tb) / 1.6)
    if M.rng.random() < dens:
        pop(tb, 250 + 600 * M.rng.random(), 0.02 + 0.03 * M.rng.random())
    tb += 0.045
g(M.lib("ping"), AT["s6:mendeteksi"], 0.05)
# the switch: click + body thump + small spring ring
g(M.lib("click"), tKlik, 0.2)
g(M.thump(0.25), tKlik, 0.16)
clink(tKlik + 0.01, 0.03, 3200)
# workshop: pot-lid rattles, then the conveyor clunks in
for j in range(10):
    clink(AT["s7:percobaan"] + j * 0.28, 0.018, 1700 + 300 * (j % 3))
hiss(AT["s7:percobaan"], 3.0, 0.015)
tk = AT["s7:Keberhasilannya"]
for j in range(10):
    g(M.thump(0.18), tk - 0.3 + j * 0.1, 0.06)
    g(M.lib("click-soft"), tk - 0.28 + j * 0.1, 0.03)
# serving: lid opens with a steam rush, paddle into the bowl
hiss(AT["s8:membaca"] - 0.1, 3.5, 0.045)
g(M.lib("whoosh"), AT["s8:membaca"] - 0.2, 0.04)
clink(AT["s8:bukan"] + 2.0, 0.06, 1900)
g(M.lib("click"), AT["s8:klik"], 0.12)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
