"""EP28 sound: an analyst's briefing room. A low sub drone with a slow radar sweep ping, a muted glassy arpeggio in
E minor (pentatonic) on 16ths, data ticks on every reveal. Scale jumps get a descending "zoom" sweep; water molecules
landing in s5 are tiny pitched droplets that stop dead (they stick); the hot plate in s6 hisses; the map in s7 gets a
radar sweep chord that widens as the area grows. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1919)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 100
E3 = 164.81
PENT = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24]
hz = lambda st: E3 * 2 ** (st / 12)


def glass(f, dur=0.5, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + 0.3 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 14)
    return x * np.minimum(1, t / 0.002) * a


def ping(f, a=1.0):
    t = np.arange(int(1.2 * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 3.5) * np.minimum(1, t / 0.004) * a


arp, drn, pg = M.mono(), M.mono(), M.mono()
# glassy arpeggio, 16ths, pattern shifts per scene
pats = [[0, 7, 12, 15], [3, 10, 15, 19], [5, 12, 17, 22], [0, 7, 12, 17]]
i, t0 = 0, 0.05
sc_ids = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"]
while t0 < END + 1.0:
    sc = sum(1 for s in sc_ids if K[s] <= t0) - 1
    p = pats[max(0, sc) % 4]
    M.lay(arp, glass(hz(p[i % 4] + 12), 0.4, 0.6 if i % 4 == 0 else 0.35), t0)
    t0 += beat / 4
    i += 1
# radar sweep ping every two bars
t0 = 0.3
while t0 < END:
    M.lay(pg, ping(1318.5, 0.5), t0)
    t0 += beat * 8
# sub drone, darker in the pores, brighter in the lab
lift = M.env([(0, 0.4), (K["s4"], 0.2), (K["s6"], 0.8), (K["s7"], 0.6), (K["s8"], 1), (DUR, 1)])
drn += 0.5 * np.sin(2 * np.pi * 41.2 * T) + 0.3 * np.sin(2 * np.pi * 82.4 * T + 0.4 * np.sin(T * 0.2))
drn += lift * 0.15 * np.sin(2 * np.pi * 329.6 * T + np.sin(T * 0.6))
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.4 * arp + 0.5 * drn + 0.3 * pg) * e
side = 0.22 * np.roll(arp + pg, 700) * e
music = stereo(mono, side)


# ---- SFX ----
def zoom(t, a=0.05, f0=2400, f1=180, dur=0.7):
    tt = np.arange(int(dur * SR)) / SR
    f = f0 * (f1 / f0) ** (tt / dur)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2) + 0.4 * M.band(M.rng.standard_normal(len(tt)), 300, 3000) * np.exp(-tt * 4)
    g(x / np.abs(x).max(), t, a)


def drop(t, f, a=0.03):
    tt = np.arange(int(0.07 * SR)) / SR
    g(np.sin(2 * np.pi * np.cumsum(f * (1 + 0.8 * tt / 0.07)) / SR) * np.exp(-tt * 50), t, a)


for s in ("s2", "s4", "s6", "s7", "s8"):
    zoom(K[s] - 0.35, 0.05)
for s in ("s3", "s5"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
for w in ("s1:menempel", "s2:sepatu", "s2:tas", "s2:botol", "s2:silikon", "s2:kuarsa", "s2:acak", "s3:dipatenkan", "s3:Walter", "s4:dua", "s5:adsorpsi",
          "s6:sepertiga", "s6:seratus", "s7:enam", "s7:delapan", "s7:lapangan", "s8:dimakan", "s8:Episode"):
    g(M.lib("click-soft"), AT[w] - 0.03, 0.05)
g(M.lib("glitch-2"), AT["s1:spons"], 0.025)
# hard bead bounce on "keras"
td = AT["s3:keras"] - 0.5
for k in range(5):
    g(M.lib("click"), td + 0.26 + k * 0.5 * np.exp(-k * 0.45), 0.07 * np.exp(-k * 0.5))
g(M.lib("typing"), AT["s3:dipatenkan"], 0.025)
g(M.lib("ping"), AT["s4:nanometer"], 0.04)
# molecules landing and sticking
R = np.random.default_rng(7)
for k in range(24):
    drop(AT["s5:masuk"] + 0.2 + k * 0.11 + R.random() * 0.08, 1400 + 600 * R.random(), 0.025)
g(M.lib("pop"), AT["s5:menempel"], 0.05)
g(M.lib("error"), AT["s5:meresap"], 0.02)
# hot plate hiss
n = int((K["s7"] - AT["s6:dipanaskan"]) * SR)
if n > 0:
    hs = M.band(M.rng.standard_normal(n), 3000, 9000)
    hs *= np.minimum(1, np.arange(n) / (0.8 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.3 * SR))
    g(hs / np.abs(hs).max(), AT["s6:dipanaskan"], 0.02)
g(M.lib("chime"), AT["s6:seratus"], 0.04)
# radar chord widening on the map
for j, st in enumerate((0, 7, 12, 19)):
    M.put(np.stack([ping(hz(st + 12), 0.5)] * 2, 1), AT["s7:enam"] + j * 0.15, 0.04)
g(M.lib("riser"), AT["s7:delapan"] - 0.6, 0.03)
g(M.lib("impact-bass-1"), AT["s7:lapangan"], 0.05)
g(M.lib("error"), AT["s8:tersedak"], 0.025)
g(M.thump(0.25), AT["s8:AUDIRA"], 0.1)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
