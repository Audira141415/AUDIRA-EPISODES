"""EP07 sound: a Saturday-morning comic-book caper. 108 BPM in E minor: a bouncing funk bass, kick + rim backbeat,
brass stabs (stacked saws) that slam with each new panel, and a glockenspiel ping when a number prints.
The groove drops to bass + hi-hat while the gas hisses (s5) and before the spark lands (s7), then the full band
returns on the ignition. SFX: flint-wheel rasp + spark crackle, lever klik, valve pop, boiling blub, gas hiss,
piezo tak + electric zap, flame whoosh, stamp thumps on the test board. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1903)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 108
E2 = 82.41
hz = lambda st, base=E2: base * 2 ** (st / 12)

bass, drm, brs, glk = M.mono(), M.mono(), M.mono(), M.mono()
thin = [(K["s5"], AT["s5:Sekarang"]), (K["s7"], AT["s7:menyalakan"])]
is_thin = lambda t: any(a - 0.1 < t < b for a, b in thin)
# bass: 16-step funk figure, root moves per scene
fig = [0, None, 12, 0, None, 10, 12, None, 0, None, 7, None, 10, 12, None, 3]
roots = {"s1": 0, "s2": 5, "s3": 0, "s4": 3, "s5": 0, "s6": 7, "s7": 5, "s8": 0}
t0, i = 0.0, 0
while t0 < END + 1.0:
    sc = max((s for s in roots if K[s] <= t0 + 0.01), key=lambda s: K[s], default="s1")
    st = fig[i % 16]
    if st is not None:
        M.lay(bass, M.note(hz(st + roots[sc]), beat * 0.45, "saw", dec=7), t0, 0.55)
    if i % 4 == 0 and not is_thin(t0):
        M.lay(drm, M.thump(0.22), t0, 0.8)
    if i % 8 == 4 and not is_thin(t0):
        M.lay(drm, M.band(M.burst(0.12, 30, 2), 900, 7000), t0, 0.6)
    if i % 2 == 0:
        M.lay(drm, M.band(M.burst(0.04, 120, 1), 7000, 14000), t0, 0.18 if i % 4 else 0.1)
    t0 += beat / 4
    i += 1
bass = M.band(bass, 40, 1400)


def stab(t, chord, a=0.5, dur=0.32):
    x = sum(M.note(hz(c, 164.81), dur, "saw", dec=5, att=0.01) for c in chord) / len(chord)
    M.lay(brs, x, t, a)


for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    stab(K[s] - 0.02, [0, 3, 7, 10], 0.55)
    stab(K[s] + beat * 0.75, [2, 5, 9, 12], 0.35, 0.2)
stab(0.05, [0, 3, 7, 12], 0.6)
stab(AT["s6:Pada#2"], [5, 9, 12, 15], 0.45)
stab(AT["s7:menyalakan"] + 0.05, [0, 4, 7, 12], 0.7, 0.6)
brs = M.band(brs, 120, 5000)


def glock(t, f, a=0.5):
    tt = np.arange(int(1.2 * SR)) / SR
    M.lay(glk, (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 8)) * np.exp(-tt * 4), t, a)


for w, n in (("s2:seribu", 19), ("s3:dua", 17), ("s4:nol", 15), ("s6:seratus", 19), ("s7:seribu", 22), ("s8:delapan", 24)):
    glock(AT[w], hz(n, 329.63), 0.45)
    glock(AT[w] + 0.12, hz(n + 7, 329.63), 0.3)
rz = np.arange(int((AT["s7:menyalakan"] - AT["s7:Cukup"] + 1.5) * SR)) / SR
riser = M.band(M.rng.standard_normal(len(rz)), 500, 7000) * (rz / rz[-1]) ** 2
M.lay(drm, riser / np.abs(riser).max(), AT["s7:Cukup"] - 1.5, 0.25)
e = M.env([(0, 1), (END + 0.3, 1), (DUR - 0.6, 0.5), (DUR, 0)])
mono = (0.6 * bass + 0.5 * drm + 0.4 * brs + 0.35 * glk) * e
side = 0.18 * np.roll(brs + glk, 700) * e
music = stereo(mono, side)


# ---- SFX ----
def rasp(t, dur=0.35, a=0.12):
    n = int(dur * SR)
    x = M.band(M.rng.standard_normal(n), 2500, 11000) * (0.6 + 0.4 * np.sign(np.sin(np.arange(n) / SR * 2 * np.pi * 60)))
    g(x / np.abs(x).max() * np.exp(-np.arange(n) / SR * 5), t, a)


def crackle(t, dur=0.8, a=0.05, k=30):
    for _ in range(k):
        g(M.band(M.burst(0.008, 500, 1), 2000, 12000), t + M.rng.random() * dur, a * (0.4 + M.rng.random()))


def hiss(t, dur, a, lo=3000, hi=11000):
    x = M.band(M.rng.standard_normal(int(dur * SR)), lo, hi)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (0.15 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.4 * SR))
    g(x / np.abs(x).max() * env, t, a)


def blub(t, f, a):
    tt = np.arange(int(0.06 * SR)) / SR
    g(np.sin(2 * np.pi * np.cumsum(f * (1 + 3 * tt / 0.06)) / SR) * np.exp(-tt * 60), t, a)


for b in (0.0, AT["s1:terbakar"] - 0.1, AT["s1:tergores"] - 0.1, AT["s6:menggores"] - 0.15, AT["s6:Serpihan"] - 0.1, AT["s7:menyalakan"] - 0.3):
    rasp(max(0, b), 0.35, 0.14)
    crackle(max(0, b) + 0.1, 0.7, 0.06)
g(M.lib("impact-bass-1"), 0.02, 0.12)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.25, 0.08)
g(M.lib("whoosh-short"), AT["s6:Pada#2"] - 0.25, 0.08)
g(M.lib("pop"), AT["s2:besi"], 0.07)
g(M.lib("pop"), AT["s2:cerium"], 0.07)
g(M.lib("pop"), AT["s2:Campuran"], 0.06)
g(M.lib("click-soft"), AT["s2:Carl"], 0.07)
g(M.lib("ping"), AT["s3:butana"], 0.05)
g(M.lib("click"), AT["s4:ditekan"] - 0.05, 0.2)
g(M.thump(0.12), AT["s4:ditekan"] - 0.05, 0.08)
g(M.lib("pop"), AT["s4:katup"], 0.08)
hiss(AT["s4:katup"], 2.0, 0.025)
tb = AT["s4:mendidih"] - 0.2
while tb < K["s5"]:
    if M.rng.random() < 0.6:
        blub(tb, 180 + 400 * M.rng.random(), 0.04 + 0.04 * M.rng.random())
    tb += 0.07
hiss(AT["s5:menyembur"] - 0.2, K["s6"] - AT["s5:menyembur"], 0.06)
g(M.lib("whoosh"), AT["s5:bercampur"], 0.05)
g(M.lib("error"), AT["s5:percikan"], 0.03)
crackle(AT["s6:Serpihan"], 3.0, 0.04, 60)
g(M.lib("click-soft"), AT["s6:palu"], 0.07)
g(M.lib("click"), AT["s6:memukul"], 0.25)
g(M.thump(0.18), AT["s6:memukul"], 0.12)
g(M.lib("glitch-2"), AT["s6:percikan"], 0.09)
g(M.lib("glitch-1"), AT["s6:percikan"] + 0.25, 0.06)
g(M.lib("sparkle"), AT["s7:panas"], 0.05)
hiss(K["s7"], 3.0, 0.015, 1500, 6000)
hiss(AT["s7:menyalakan"], 1.6, 0.09, 200, 3000)
g(M.lib("whoosh-cinematic"), AT["s7:menyalakan"] - 0.05, 0.09)
g(M.lib("click-soft"), AT["s8:pengaman"], 0.07)
xa, xb = AT["s8:menggagalkan"], AT["s8:delapan"]
for j in range(17):
    g(M.thump(0.1), xa + j * (xb - xa + 0.2) / 17, 0.05)
g(M.lib("chime"), AT["s8:Ini"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
