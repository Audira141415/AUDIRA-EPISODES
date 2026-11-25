"""EP05 sound: a clean, precise workshop groove. Wooden marimba arpeggios in G major pentatonic at 104 BPM, a soft
felt kick, shaker ticks, and a warm sine pad that opens up under the payoff. The music thins out in s6 (wind tunnel)
so the airflow hiss reads. SFX follow the machines: roller hum, powder hiss, press clank and heat sizzle, mould
close, fill shimmer, trim snip, spray hiss, pad-print tap, clear-coat sparkle, x-ray hum, robot swing and hit,
wind tunnel air, two launches. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1905)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]

bpm = 104
beat = 60 / bpm
G3 = 196.0
pent = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]
chords = [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]]  # G, Em, C, D


def marimba(f, dur=0.5, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 9) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 28) + 0.12 * np.sin(2 * np.pi * f * 10 * t) * np.exp(-t * 60)
    return x * np.minimum(1, t / 0.002) * a


mar, kick, shk, pad = M.mono(), M.mono(), M.mono(), M.mono()
thin_a, thin_b = K["s6"] + 0.2, K["s7"] - 0.2
i, t0 = 0, 0.0
while t0 < DUR - 1.0:
    bar = i // 8
    ch = chords[bar % 4]
    thin = thin_a < t0 < thin_b
    # eighth-note marimba pattern walking up and down the chord + pentatonic passing tones
    pat = [0, 1, 2, 1, 0, 2, 1, 3]
    st = ch[pat[i % 8] % 3] + (12 if pat[i % 8] == 3 else 0)
    if not thin or i % 4 == 0:
        M.lay(mar, marimba(G3 * 2 ** (st / 12), 0.6, 0.55 if i % 2 == 0 else 0.38), t0)
    if i % 4 == 0 and not thin:
        k = M.note(55, 0.3, "sine", 12, 0.002) * 1.0
        M.lay(kick, k, t0, 0.8)
    if i % 2 == 1 and not thin:
        M.lay(shk, M.band(M.burst(0.06, 60, 1), 5000, 12000), t0, 0.12)
    if i % 8 == 0:
        for s in ch:
            x = M.note(G3 * 2 ** (s / 12), beat * 8 + 0.3, "sine", 0.15, 0.25)
            M.lay(pad, x * (1 + 0.15 * np.sin(np.arange(len(x)) / SR * 2 * np.pi * 0.5)), t0, 0.16)
    t0 += beat / 2
    i += 1
# high melody bell at scene openings (pentatonic phrase)
for s, ph in {"s1": [9, 7, 4, 7], "s3": [4, 7, 9, 12], "s5": [12, 9, 7, 9], "s7": [7, 9, 12, 16], "s8": [16, 12, 9, 7]}.items():
    for j, st in enumerate(ph):
        M.lay(mar, marimba(G3 * 4 * 2 ** (st / 12), 0.9, 0.3), K[s] + 0.2 + j * beat * 0.75)
e = M.env([(0, 0.9), (K["s2"], 1), (thin_a, 1), (thin_a + 0.5, 0.55), (thin_b, 0.55), (thin_b + 0.6, 1.1), (END + 0.3, 1.1), (DUR - 0.8, 0.6), (DUR, 0)])
mono = (0.8 * mar + 0.55 * kick + 0.5 * shk + 0.6 * pad) * e
side = 0.2 * np.roll(mar + shk, 640) * e
room = M.band(M.rng.standard_normal(N), 80, 600) * 0.01
music = stereo(mono + room, side)


# ---- SFX ----
def clank(t, a=0.16, f=520):
    g(M.note(f, 0.35, "sine", 9), t, a)
    g(M.note(f * 2.76, 0.25, "sine", 16), t, a * 0.6)
    g(M.band(M.burst(0.05, 80, 1), 2000, 9000), t, a * 0.5)


def click(t, a=0.1):
    g(M.band(M.burst(0.02, 200, 1), 1500, 8000), t, a)


def hiss(t, dur, a, lo=2500, hi=11000, fade=0.25):
    x = M.band(M.rng.standard_normal(int(dur * SR)), lo, hi)
    n = np.arange(len(x)) / SR
    x *= np.minimum(1, n / fade) * np.minimum(1, (dur - n) / fade)
    g(x / (np.abs(x).max() + 1e-9), t, a)


g(M.lib("whoosh-cinematic"), 0.0, 0.08)
g(M.lib("ping"), AT["s1:lubang"], 0.06)
g(M.lib("riser"), AT["s1:golf"] - 0.6, 0.05)
g(M.thump(0.4), K["s1e"] - 0.1, 0.16)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.35, 0.08)
    click(K[s] - 0.1, 0.07)
# s2: knife scratches on the old ball
for k in range(4):
    hiss(AT["s2:tergores"] + 0.05 + k * 0.55, 0.3, 0.05, 3000, 9000, 0.05)
g(M.lib("chime"), AT["s2:dicetak"], 0.05)
# s3: roller hum, powder, slugs, press clank + heat sizzle
hum = M.note(70, K["s3e"] - K["s3"], "saw", 0.0, 0.3)
hum = M.band(hum, 60, 400) * np.minimum(1, (len(hum) - np.arange(len(hum))) / (0.5 * SR))
g(hum / (np.abs(hum).max() + 1e-9), K["s3"] + 0.2, 0.05)
hiss(AT["s3:dicampur"], 2.6, 0.035, 4000, 12000, 0.4)
for k in range(4):
    click(AT["s3:dipotong"] + k * 0.3, 0.09)
clank(AT["s3:dipanggang"] - 0.05, 0.14, 380)
hiss(AT["s3:dipanggang"] + 0.3, 2.0, 0.03, 3000, 10000, 0.3)
# s4: mantle swell, mould slides and closes, fill shimmer, open
g(M.lib("sparkle"), AT["s4:lapisan"], 0.05)
g(M.lib("whoosh"), AT["s4:kulit"], 0.06)
clank(AT["s4:menutup"] + 0.5, 0.18, 300)
g(M.thump(0.3), AT["s4:menutup"] + 0.5, 0.14)
hiss(AT["s4:rongganya"] - 0.1, 1.0, 0.04, 1500, 6000, 0.2)
g(M.lib("pop"), AT["s4:Rongga"], 0.08)
g(M.lib("ping"), AT["s4:tiga"], 0.05)
# s5: trim, spray, pad print, clear coat, x-ray, robot
click(AT["s5:dibuang"], 0.12)
click(AT["s5:dibuang"] + 0.12, 0.1)
hiss(AT["s5:dicat"] - 0.05, AT["s5:logo"] - AT["s5:dicat"] + 0.1, 0.06, 2000, 9000, 0.1)
g(M.lib("click-soft"), AT["s5:logo"] + 0.4, 0.12)
g(M.lib("sparkle"), AT["s5:pernis"], 0.07)
xr = M.note(120, 1.6, "saw", 0.4, 0.2)
g(M.band(xr, 100, 1500) / 4, AT["s5:memastikan"] - 0.3, 0.06)
g(M.lib("ping"), AT["s5:memastikan"] + 0.4, 0.05)
g(M.lib("whoosh-short"), AT["s5:jaraknya"] - 0.4, 0.1)
g(M.lib("impact-bass-1"), AT["s5:jaraknya"] - 0.1, 0.1)
clank(AT["s5:jaraknya"] - 0.1, 0.1, 900)
# s6: wind tunnel air under the whole scene, a deeper rumble while the big wake swirls
hiss(K["s6"] + 0.2, K["s6e"] - K["s6"], 0.035, 300, 3000, 0.8)
rum = M.band(M.rng.standard_normal(int(4 * SR)), 40, 160)
rum *= np.minimum(1, np.arange(len(rum)) / (0.8 * SR)) * np.minimum(1, (len(rum) - np.arange(len(rum))) / (1.0 * SR))
g(rum / np.abs(rum).max(), AT["s6:pusaran"], 0.08)
g(M.lib("glitch-1"), AT["s6:bergolak"], 0.025)
g(M.lib("chime"), AT["s6:separuh"], 0.05)
# s7: two launches, landing taps, speed tick
g(M.lib("whoosh-cinematic"), AT["s7:Hasilnya"] + 0.1, 0.08)
g(M.thump(0.2), AT["s7:Hasilnya"] + 0.15 + 1.8, 0.08)
g(M.thump(0.2), AT["s7:Hasilnya"] + 0.15 + 2.4, 0.1)
g(M.lib("riser"), AT["s7:kecepatan"] - 0.4, 0.05)
g(M.lib("impact-bass-1"), AT["s7:280"], 0.08)
g(M.lib("ping"), AT["s8:hiasan"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.07)
g(M.thump(), OUT, 0.14)
M.finish(music)
