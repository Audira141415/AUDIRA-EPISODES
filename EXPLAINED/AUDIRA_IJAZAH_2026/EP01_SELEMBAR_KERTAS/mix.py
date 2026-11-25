"""Selembar Kertas sound: low strings and a dry piano that take no side, plus paper you can almost touch. No real courtroom audio. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1985)
N, DUR, rng = M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
K = {x: M.scene(x)["start"] for x in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9")}

# Score: D minor drone and a two-note piano question that never resolves, matching a case with no verdict.
hz = lambda d: 73.42 * 2 ** (d / 12)
beat = 60 / 58
pad, low, keys = M.mono(), M.mono(), M.mono()
chords = [(0, 7, 12, 15), (-2, 5, 10, 14), (-4, 3, 8, 12), (-5, 2, 7, 12)]
for b in range(0, int(DUR / beat), 4):
    for d in chords[(b // 4) % 4]:
        M.lay(pad, M.note(hz(d), beat * 4.4, "saw", 0.2, 0.7), b * beat, 0.3)
    M.lay(low, M.note(hz(chords[(b // 4) % 4][0] - 12), beat * 4.2, "sine", 0.25, 0.3), b * beat, 0.8)
for b in range(4, int(END / beat), 8):
    for i, d in enumerate((24, 27)):
        M.lay(keys, M.note(hz(d), 2.2, "pluck", 2.4), (b + i * 1.5) * beat, 0.42)
pad = M.band(pad, 55, 1300)
keys = M.band(keys, 120, 3600)
pe = M.env([(0, 0.55), (K["s3"], 0.85), (K["s6"], 1), (K["s8"], 1.05), (K["s9"], 0.7), (END, 0.45), (DUR - 0.5, 0), (DUR, 0)])
ke = M.env([(0, 0.8), (K["s3"], 0.6), (K["s5"], 0.9), (K["s9"], 1.0), (END, 0.8), (DUR - 0.3, 0), (DUR, 0)])
music = stereo(0.55 * pad * pe + 0.55 * low * pe + 0.42 * keys * ke, 0.16 * pad * pe + 0.06 * keys * ke)


def paper(dur=0.28, grains=9):
    """Sheet noise: short bright grains under a soft envelope."""
    n = int(dur * SR)
    out = np.zeros(n)
    for _ in range(grains):
        L = int(rng.uniform(0.012, 0.05) * SR)
        i = int(rng.uniform(0, max(1, n - L)))
        out[i:i + L] += rng.standard_normal(L) * np.hanning(L) * rng.uniform(0.3, 1)
    X = np.fft.rfft(out)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < 1400) | (f > 9500)] = 0
    y = np.fft.irfft(X, n)
    return y / max(1e-6, np.abs(y).max())


def stamp():
    return M.thump(0.3) * 0.9 + M.burst(0.3, 34, 2) * 0.15


def crowd(dur, level):
    """Unintelligible murmur made from filtered noise, never a recording of the actual hearing."""
    n = int(dur * SR)
    x = M.band(rng.standard_normal(n), 240, 1900)
    wob = 0.65 + 0.35 * np.sin(2 * np.pi * np.cumsum(rng.uniform(1.5, 5, n)) / SR)
    e = np.minimum(1, np.minimum(np.arange(n) / (0.08 * SR), (n - np.arange(n)) / (0.9 * SR)))
    y = x * wob * e
    return y / max(1e-6, np.abs(y).max()) * level


# Each transition is a page turn.
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"):
    g(paper(0.34, 14), K[s] - 0.22, 0.13)
g(M.lib("whoosh-short"), K["s3"] - 0.2, 0.05)
g(M.lib("whoosh-short"), K["s6"] - 0.2, 0.05)
g(M.lib("whoosh-short"), K["s9"] - 0.2, 0.04)

# Opening room and the raised diploma.
g(crowd(K["s2"] + 1, 0.05), 0, 1)
up = AT["s1:terangkat"]
for i in range(4):
    g(paper(0.22, 8), up - 0.1 + i * 0.09, 0.15)
g(crowd(2.2, 0.075), up + 0.05, 1)
g(M.thump(0.5), up, 0.12)

# Security rings: footfalls spreading outward, then one hit on the small number.
base = AT["s3:6.770"]
for x in np.sort(rng.uniform(base, base + 2.6, 34)):
    g(M.burst(0.05, 80, 8), x, 0.018)
g(M.lib("riser"), AT["s3:80"] - 1.4, 0.022)
g(M.thump(0.45), AT["s3:80"], 0.2)

# Paper trail.
for k, t in (("s4:2019", 0.1), ("s4:2022", 0.1), ("s4:2025", 0.1)):
    g(paper(0.2, 7), AT[k] - 0.1, 0.1)
    g(M.lib("click-soft"), AT[k], 0.06)
g(stamp(), AT["s4:dicabut"], 0.25)
g(M.band(M.burst(0.25, 18, 2), 1800, 6500), AT["s4:2025"] + 0.2, 0.012)

# Type history: time runs backwards to 1932, then a stack of theses rises.
y32 = AT["s5:1932"]
g(M.lib("whoosh-cinematic"), y32 - 0.5, 0.05)
g(M.lib("chime"), y32 + 0.5, 0.035)
r0 = AT["s5:ribuan"]
for x in np.sort(rng.uniform(r0, r0 + 1.3, 26)):
    g(paper(0.06, 2), x, 0.035)

# Light table: a lamp hum during the test, a soft tone on the match, a pencil on the disputed signature.
a, b = AT["s6:menguji"], AT["s6:Hasilnya"]
hum = M.tone((100, 200, 300), b - a + 0.2)
g(hum * np.minimum(1, np.minimum(np.arange(len(hum)) / (0.15 * SR), (len(hum) - np.arange(len(hum))) / (0.2 * SR))), a, 0.022)
g(M.lib("ping"), AT["s6:identik"], 0.05)
p0 = AT["s6:mempersoalkan"]
g(M.band(M.burst(0.8, 2.2, 1), 2400, 8000), p0, 0.012)

# Name tags rise, three fold.
for i in range(8):
    g(paper(0.09, 3), AT["s7:8"] + i * 0.08, 0.05)
for i in range(3):
    g(paper(0.2, 7), AT["s7:berdamai"] + i * 0.12, 0.1)
g(M.thump(0.4), AT["s7:terdakwa"], 0.13)

# Crowd turning: low note and a slowly widening murmur.
g(M.thump(0.8), AT["s8:18"], 0.2)
g(crowd(K["s9"] - AT["s8:18"], 0.03), AT["s8:18"], 1)

# Ending: everything thins out, one card stands, then silence before the logo chime.
g(paper(0.3, 10), AT["s9:Kertasnya"], 0.13)
g(paper(0.22, 7), AT["s9:Putusannya"], 0.12)
g(M.thump(0.35), AT["s9:Putusannya"], 0.08)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
