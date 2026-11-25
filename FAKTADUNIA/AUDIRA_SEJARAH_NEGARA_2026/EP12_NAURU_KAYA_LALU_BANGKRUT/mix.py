"""EP12 sound: warm minimal piano + soft mallets in F major. The texture thins as the reserves run out (s5-s6)
until only one sustained note remains through the bank closing; a sparse, quiet piano returns for s7-s8.
Foley: placard slides, CNC milling grind while the island is cut, metal clicks for the bars, a draining tank,
the brass plaque thud, the cash plane drone and crate thuds, the name plate flip. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1968)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 0.66
bar = beat * 4
thin0, thin1 = K["s5"], AT["s6:Dana"]          # texture thins across here
hold0, hold1 = AT["s6:Dana"], K["s7"] + 0.4    # single sustained note
back0 = K["s7"]

prog = [[53, 60, 65, 69], [50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64]]  # F - Dm - Bb - C


def piano(f, d, vel):
    t = np.arange(int(d * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + 0.0004 * h * h)) * np.exp(-t * (1.1 + 0.9 * h)) / h ** 1.1 for h in range(1, 7))
    return vel * x * np.minimum(1, t / 0.004) * np.minimum(1, (d - t) / 0.05)


def mallet(f, d, vel):
    t = np.arange(int(d * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2) + 0.25 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t * 14)
    return vel * x * np.minimum(1, t / 0.003)


# density: 1 = full, 0 = only the held note
dens = lambda t: 1.0 if t < thin0 else max(0.0, 1 - (t - thin0) / (thin1 - thin0)) if t < back0 else 0.45
pn = M.mono(); ml = M.mono()
for k, t0 in enumerate(np.arange(0.1, END + 1.5, beat / 2)):
    if hold0 <= t0 < back0:
        continue
    d = dens(t0)
    ch = prog[int(t0 / bar) % 4]
    step = k % 8
    if step % 2 == 1 and rng.random() > d:          # off-beats drop out first
        continue
    if step % 4 == 2 and d < 0.5:
        continue
    m = [ch[0], ch[2], ch[1] + 12, ch[2], ch[3], ch[2], ch[1] + 12, ch[3]][step]
    M.lay(pn, piano(hz(m), 2.2, 0.5 if step == 0 else 0.3), t0)
    if step == 0:
        M.lay(pn, piano(hz(ch[0] - 12), 3.0, 0.45), t0)
    if d > 0.6 and step in (3, 7):
        M.lay(ml, mallet(hz(ch[3] + 12 + (2 if step == 7 else 0)), 1.2, 0.35), t0)
pn /= np.abs(pn).max(); ml /= max(1e-6, np.abs(ml).max())

# the single sustained note (C5, soft sine with slow tremolo), plus a low A for the bank closing
held = M.mono()
d = hold1 - hold0 + 2.0
tt = np.arange(int(d * SR)) / SR
x = (np.sin(2 * np.pi * hz(72) * tt) + 0.2 * np.sin(4 * np.pi * hz(72) * tt)) * (1 + 0.08 * np.sin(2 * np.pi * 0.7 * tt))
x *= np.minimum(1, tt / 1.2) * np.minimum(1, (d - tt) / 1.6)
M.lay(held, x, hold0 - 0.8)
held /= np.abs(held).max()

e_pn = M.env([(0, 0.0), (0.4, 0.85), (thin0, 0.85), (thin1, 0.5), (hold0 + 0.1, 0), (back0, 0), (back0 + 1.0, 0.55), (END, 0.7), (DUR - 0.4, 0), (DUR, 0)])
e_ml = M.env([(0, 0.6), (thin0, 0.6), (thin0 + 3, 0), (DUR, 0)])
e_hd = M.env([(0, 0), (hold0 - 0.8, 0), (hold0 + 0.6, 0.6), (hold1 - 0.3, 0.6), (hold1 + 1.2, 0), (DUR, 0)])
music = stereo(0.55 * pn * e_pn + 0.3 * ml * e_ml + 0.5 * held * e_hd, 0.08 * pn * e_pn + 0.06 * ml * e_ml)


# --- foley ---
def slide(t, a=0.05):
    x = M.band(M.burst(0.38, 6, 6), 400, 3500)
    x *= np.sin(np.linspace(0, np.pi, len(x))) ** 1.5
    g(x, t, a)


def click(t, a=0.05):
    g(M.tone((2100, 3300), 0.12, 40), t, a * 0.6); g(M.band(M.burst(0.03, 120, 1), 2000, 9000), t, a)


def thud(t, a=0.2):
    g(M.thump(0.45), t, a); g(M.tone((180, 412, 655), 0.9, 5), t, a * 0.25)


# placards slide along the rail at each panel change
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    slide(K[k] - 0.2, 0.05)
for a in ("s3:Sejak", "s4:Uang", "s5:Yang", "s6:Dana", "s6:Tahun", "s7:Tahun"):
    slide(AT[a] - 0.2, 0.05)
# hook: bars rise with ratchet clicks, plaque slam, plane drone + crates
for i in range(10):
    click(AT["s1:terkaya"] - 0.5 + i * 0.1, 0.035)
thud(AT["s1:tutup"] + 0.3, 0.22); g(M.lib("impact-bass-1"), AT["s1:tutup"] + 0.3, 0.06)
p0 = AT["s1:diterbangkan"] - 1.3
pd = 3.6
tt = np.arange(int(pd * SR)) / SR
drone = (np.sin(2 * np.pi * 96 * tt) + 0.5 * np.sin(2 * np.pi * 192.5 * tt) + 0.3 * M.band(rng.standard_normal(len(tt)), 200, 1200) / 3) * np.sin(np.pi * tt / pd) ** 2
g(np.stack([drone * np.linspace(1, 0.3, len(tt)), drone * np.linspace(0.3, 1, len(tt))], 1), p0, 0.08)
for i in range(3):
    td = p0 + (0.42 + i * 0.11) * 3.4
    g(M.thump(0.3), td + 0.25, 0.12); click(td + 0.27, 0.03)
# 21 km2: orange rim rises
g(M.lib("chime"), AT["s2:21"], 0.04)
# 1900 phosphate glints
g(M.lib("sparkle"), AT["s3:fosfat"], 0.04)
# CNC milling: grinding bed while the island is cut (1906 -> s5)
grind = M.band(rng.standard_normal(N), 900, 4200) * (1 + 0.5 * np.sin(2 * np.pi * 13 * T)) + 0.4 * np.sin(2 * np.pi * 220 * T + 3 * np.sin(2 * np.pi * 7 * T))
grind /= np.abs(grind).max()
ge = M.env([(0, 0), (AT["s3:1906"], 0), (AT["s3:1906"] + 0.6, 0.6), (K["s3e"], 0.5), (K["s4"], 0.15), (K["s4e"], 0.15), (K["s5"], 0.7), (AT["s5:Yang"], 0.7), (AT["s5:Yang"] + 0.8, 0), (DUR, 0)])
M.fx += np.stack([grind * ge, np.roll(grind, 300) * ge], 1) * 0.012
# 1968: orange tick rises with a bright mallet
g(mallet(hz(77), 1.5, 1.0), AT["s4:1968"], 0.05); click(AT["s4:kemudian"], 0.04)
# money flows: ratchet clicks as bars rise, tank fills (soft pour)
for i in range(14):
    click(AT["s4:Uang"] + 0.15 + i * 0.09, 0.03)
pour = M.band(rng.standard_normal(N), 300, 2500)
pour /= np.abs(pour).max()
fe = M.env([(0, 0), (AT["s4:Uang"], 0), (AT["s4:Uang"] + 0.5, 1), (AT["s4:terkaya"] + 0.5, 0), (AT["s6:tergerus"] - 0.2, 0), (AT["s6:tergerus"] + 0.3, 1.2), (AT["s6:investasi"] + 1.0, 0.4), (AT["s6:investasi"] + 1.6, 0), (DUR, 0)])
M.fx += np.stack([pour * fe, np.roll(pour, 500) * fe], 1) * 0.01
for i in range(6):      # glugs as the trust fund drains
    g(M.tone((180 + 30 * i, 360 + 50 * i), 0.18, 18), AT["s6:tergerus"] + 0.2 + i * 0.32, 0.03)
# reserves gone: bar sinks with a descending scrape
g(M.tone((330, 220), 1.2, 2.5), AT["s6:habis"], 0.03)
# bank plaque drops
thud(AT["s6:2006"] + 0.7, 0.26); g(M.lib("impact-bass-1"), AT["s6:2006"] + 0.7, 0.08)
# income wedges rise
for a in ("s7:izin", "s7:pusat"):
    click(AT[a], 0.04); g(M.thump(0.25), AT[a] + 0.4, 0.07)
# name plate flips
g(M.lib("whoosh-short"), AT["s7:berganti"] - 0.1, 0.04); g(M.tone((520, 1040, 1560), 1.2, 4), AT["s7:berganti"] + 0.85, 0.04)
# outro
g(M.lib("chime"), OUT + 0.3, 0.05)
# gallery room tone
room = M.band(rng.standard_normal(N), 100, 900)
room /= np.abs(room).max()
M.fx += np.stack([room, np.roll(room, 700)], 1) * 0.004
M.finish(music)
print("duration", DUR)
