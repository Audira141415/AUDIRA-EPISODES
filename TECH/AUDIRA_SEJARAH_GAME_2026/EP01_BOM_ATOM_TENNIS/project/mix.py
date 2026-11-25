"""EP01 sound: sparse 1950s noir. Upright-bass pizzicato walking in D minor at 72 BPM, brushed snare swishes on 2 and 4,
a muted trumpet-like voice (filtered saw with slow vibrato) in short phrases, a soft vibraphone chord under the payoff.
Oscilloscope blips on every ball hit and bounce while the screen is on, switch clicks, crate thuds, a gavel, crowd murmur.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1958)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
P, UB = 1.6, 0.62  # same ball constants as world3d.js

bass, brush, horn, vib = M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 72
D = 73.42  # D2
# walking bass lines (semitones from D), one bar of 4 per chord: Dm, Bb, Gm, A7
walk = [[0, 3, 5, 7], [-4, -2, 0, 1], [-7, -5, -4, -2], [-5, -1, 2, 4]]
t0, i = 0.0, 0
off_a, off_b = AT["s7:dibongkar"] + 0.5, AT["s7:akhir"]
while t0 < DUR:
    if not (off_a < t0 < off_b):  # the band drops out while the game is torn down and forgotten
        st = walk[(i // 4) % 4][i % 4]
        M.lay(bass, M.note(D * 2 ** (st / 12), beat * 0.95, "pluck", 4.5, 0.004), t0, 0.9)
    if i % 2 == 1:
        sw = M.band(M.burst(0.32, 9, 1), 2500, 9000)
        M.lay(brush, sw * np.minimum(1, np.arange(len(sw)) / (0.05 * SR)), t0, 0.22)
    tk = M.band(M.burst(0.05, 70, 1), 4000, 11000)
    M.lay(brush, tk, t0 + beat * 0.66, 0.06)
    t0 += beat
    i += 1


def trumpet(f, dur, a=0.5):
    t = np.arange(int(dur * SR)) / SR
    vibr = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.4)
    ph = 2 * np.pi * np.cumsum(f * vibr) / SR
    x = sum(np.sin(h * ph) / h ** 1.6 for h in range(1, 9))
    env = np.minimum(1, t / 0.07) * np.minimum(1, (dur - t) / 0.18)
    return x * env * a


# trumpet phrases on scene openings (D minor pentatonic, muted and low)
mel = {"s1": [(0, 2, 1.2), (3, 1, 0.6), (5, 1, 0.6), (3, 2, 1.6)], "s3": [(7, 1, 0.8), (5, 1, 0.8), (3, 2, 1.8)],
       "s5": [(0, 1, 0.6), (3, 1, 0.6), (7, 1, 0.6), (10, 2, 1.8)], "s7": [(5, 2, 1.4), (3, 2, 1.4), (0, 3, 2.6)],
       "s8": [(0, 1, 0.7), (3, 1, 0.7), (5, 1, 0.7), (7, 2, 2.2)]}
for s, ph in mel.items():
    tt = K[s] + 0.4
    for st, _, d in ph:
        M.lay(horn, trumpet(293.66 * 2 ** (st / 12), d * beat * 1.1), tt, 0.35)
        tt += d * beat
# vibraphone chord under the payoff and outro
for st in (0, 3, 7, 10):
    x = M.note(293.66 * 2 ** (st / 12), END + 2.5 - K["s8"], "sine", 0.18, 0.02)
    x *= 1 + 0.25 * np.sin(2 * np.pi * 4.5 * np.arange(len(x)) / SR)
    M.lay(vib, x, K["s8"], 0.12)
e = M.env([(0, 0.85), (K["s2"], 1), (off_a, 1), (off_a + 0.6, 0.35), (off_b, 0.5), (off_b + 0.8, 1), (END + 0.3, 1), (DUR - 0.6, 0.5), (DUR, 0)])
mono = (0.75 * bass + 0.5 * brush + 0.55 * horn + 0.45 * vib) * e
side = 0.18 * np.roll(horn + brush, 700) * e
# low tape hiss and room tone through the whole film
room = M.band(M.rng.standard_normal(N), 60, 400) * 0.02 + M.band(M.rng.standard_normal(N), 4000, 12000) * 0.004
music = stereo(mono + room, side)

# ---- SFX ----
def blip(t, f, a=0.05):
    g(M.note(f, 0.07, "sine", 30, 0.002), t, a)


def click(t, a=0.12):
    g(M.band(M.burst(0.02, 200, 1), 1500, 8000), t, a)
    g(M.note(140, 0.04, "sine", 60), t, a * 0.6)


# scope on: hit + bounce blips while the screen shows the game
on_spans = [(0, AT["s7:dibongkar"]), (K["s8"], DUR - 1)]
for a, b in on_spans:
    n = int(np.ceil(a / P))
    while n * P < b:
        if not (K["s6"] < n * P < AT["s6:Tennis"]) and not (K["s3"] < n * P < K["s4"] + 6):
            blip(n * P, 1320, 0.05)
            blip((n + UB) * P, 880, 0.035)
        n += 1
g(M.lib("click"), 0.05, 0.12)
g(M.thump(0.5), AT["s1:bom"], 0.22)
g(M.lib("impact-bass-1"), AT["s1:bom"], 0.12)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    click(K[s] - 0.15, 0.1)
    g(M.lib("whoosh-short"), K[s] - 0.3, 0.07)
g(M.lib("whoosh-cinematic"), K["s3"] - 0.2, 0.08)
g(M.lib("typing"), AT["s2:William"], 0.06)
g(M.lib("ping"), AT["s2:pemimpin"], 0.05)
g(M.lib("typing"), AT["s3:Tahun"], 0.05)
g(M.lib("click-soft"), AT["s3:diam"], 0.08)
for k in range(4):
    g(M.band(M.burst(0.12, 30, 2), 800, 5000), AT["s4:buku"] + 0.1 + k * 0.35, 0.06)  # page flips
g(M.lib("riser"), AT["s4:lintasan"] - 0.3, 0.05)
for k in range(4):
    blip(AT["s4:bola"] + 0.4 + k * 0.35, 990 - k * 90, 0.04)
click(AT["s5:kenop"], 0.14)
click(AT["s5:memukul"], 0.16)
# assembly: soft tool taps then the power-on hum
for k in range(7):
    click(K["s6"] + 0.3 + k * 0.36, 0.07)
g(M.lib("chime"), AT["s6:Delapan"], 0.06)
hum = M.note(60, 1.2, "sine", 1.5, 0.05) + 0.3 * M.note(120, 1.2, "sine", 2, 0.05)
g(hum, AT["s6:Tennis"], 0.1)
blip(AT["s6:Tennis"] + 0.05, 1760, 0.05)
mur = M.band(M.rng.standard_normal(int(4.5 * SR)), 250, 1500)
mur *= (0.6 + 0.4 * np.sin(np.arange(len(mur)) / SR * 2 * np.pi * 1.3)) * np.minimum(1, np.arange(len(mur)) / (0.6 * SR)) * np.minimum(1, (len(mur) - np.arange(len(mur))) / (1.0 * SR))
g(mur / np.abs(mur).max(), AT["s6:Ratusan"] - 0.2, 0.06)
# teardown: CRT power-off zip, crate thuds, lid shut
zt = np.arange(int(0.5 * SR)) / SR
g(np.sin(2 * np.pi * np.cumsum(2400 * np.exp(-zt * 7)) / SR) * np.exp(-zt * 6), AT["s7:dibongkar"], 0.05)
g(M.thump(0.3), AT["s7:dibongkar"] + 1.3, 0.14)
g(M.thump(0.35), AT["s7:dilupakan"] + 0.8, 0.18)
# courtroom: gavel knocks
for k in range(2):
    g(M.thump(0.18), AT["s7:sengketa"] + k * 0.25, 0.16)
    click(AT["s7:sengketa"] + k * 0.25, 0.14)
g(M.lib("ping"), AT["s8:tangan"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.07)
g(M.thump(), OUT, 0.15)
M.finish(music)
