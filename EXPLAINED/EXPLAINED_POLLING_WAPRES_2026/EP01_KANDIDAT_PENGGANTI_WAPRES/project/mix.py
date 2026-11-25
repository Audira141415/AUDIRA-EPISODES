"""EP01 KANDIDAT PENGGANTI WAPRES sound: a quiet gallery after hours. Soft vibraphone chords in D minor at 92 BPM
(Dm - Bb - F - C), a round sine bass, a clock-like rim tick and a low air bed. SFX are the gallery objects: metal ticks as
aluminium columns rise, brass clinks for the name plates, a walnut thud when the desk lifts, a drone under "survei bukan
keputusan", a riser into the MPR funnel. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2611)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
A = lambda k: AT[k]

vib, bass, tick, pad = M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 92
D3 = 146.83
chords = [[0, 3, 7, 12], [-4, 0, 3, 8], [3, 7, 10, 15], [-2, 2, 5, 10]]  # Dm Bb F C (semitones from D)
pat = [0, 2, 1, 3, 2, 1]
t0, i = 0.0, 0
while t0 < DUR:
    bar = (i // 8) % 4
    ch = chords[bar]
    if i % 8 in (0, 3, 5):
        st = ch[pat[(i // 2) % 6]]
        n = M.note(D3 * 2 * 2 ** (st / 12), beat * 2.2, "sine", 1.2, 0.004)
        n = n * (1 + 0.25 * np.sin(2 * np.pi * 5.2 * np.arange(len(n)) / SR))
        hi = M.note(D3 * 8 * 2 ** (st / 12), beat * 0.6, "sine", 9, 0.002)
        n[: len(hi)] += 0.25 * hi
        M.lay(vib, n * (0.7 if i % 8 else 0.9), t0, 1)
    if i % 8 == 0:
        M.lay(bass, M.note(D3 / 2 * 2 ** (ch[0] / 12), beat * 3.9, "sine", 0.5, 0.03), t0, 1)
        for st in ch[:3]:
            M.lay(pad, M.note(D3 * 2 ** (st / 12), beat * 4.2, "tri", 0.25, 0.6), t0, 0.18)
    if i % 2 == 1:
        M.lay(tick, M.band(M.burst(0.03, 120, 1), 4000, 11000), t0, 0.05 if i % 4 == 3 else 0.03)
    t0 += beat / 2
    i += 1
# the s6 section loses the vibes and keeps only bass + a low drone; s8 resolves
e = M.env([(0, 0.7), (K["s1"] + 3, 1), (K["s6"] - 0.3, 1), (K["s6"] + 0.6, 0.35), (K["s7"] - 0.4, 0.35), (K["s7"] + 0.8, 1), (END, 1), (DUR - 0.8, 0.6), (DUR, 0)])
dr = np.zeros(N)
a6, b6 = int(K["s6"] * SR), int(K["s7"] * SR)
tt = np.arange(b6 - a6) / SR
dr[a6:b6] = (np.sin(2 * np.pi * 73.4 * tt) + 0.5 * np.sin(2 * np.pi * 110 * tt + 0.3 * np.sin(2 * np.pi * 0.2 * tt))) * np.minimum(1, tt / 1.2) * np.minimum(1, (tt[-1] - tt) / 1.0)
mono = (0.55 * vib + 0.7 * bass + 0.5 * tick + 0.45 * pad) * e + 0.35 * dr
side = 0.18 * np.roll(vib + pad, 700) * e
room = M.band(M.rng.standard_normal(N), 60, 500) * 0.007
music = stereo(mono + room, side)
# final resolve: a D major lift on the close
for k, st in enumerate([0, 4, 7, 12, 16]):
    M.lay(music[:, 0], M.note(D3 * 2 * 2 ** (st / 12), 2.4, "sine", 0.9, 0.005) * 0.25, K["s8"] + 0.3 + k * 0.18, 1)
    M.lay(music[:, 1], M.note(D3 * 2 * 2 ** (st / 12), 2.4, "sine", 0.9, 0.005) * 0.25, K["s8"] + 0.32 + k * 0.18, 1)


# ---- SFX ----
def ping(t, f=2400, a=0.05):
    g(M.note(f, 0.5, "sine", 7) + 0.4 * M.note(f * 2.76, 0.5, "sine", 14), t, a)


def clink(t, a=0.04):
    g(M.note(3100, 0.25, "sine", 18) + 0.6 * M.note(4650, 0.25, "sine", 24), t, a)


def rise(t, dur=1.2, a=0.05):
    n = int(dur * SR)
    x = M.band(M.rng.standard_normal(n), 300, 2400)
    ts = np.arange(n) / SR
    x = x * np.minimum(1, ts / 0.1) * np.minimum(1, (dur - ts) / 0.2)
    g(x / (np.abs(x).max() + 1e-9) + 0.4 * M.note(220, dur, "saw", 0.4, 0.2), t, a)


g(M.lib("riser"), max(0, A("s1:kosong") - 1.6), 0.05)
g(M.lib("impact-bass-1"), A("s1:kosong"), 0.11)
for k in range(12):
    clink(A("s1:12") - 0.3 + k * 0.05, 0.025)
g(M.lib("pop"), A("s1:2"), 0.08)
g(M.lib("chime"), A("s1:2") + 0.05, 0.04)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.35, 0.05)
g(M.lib("whoosh-cinematic"), K["s2"] - 0.2, 0.06)
g(M.thump(0.3), A("s2:November"), 0.1)
for k in range(12):
    clink(A("s2:Gibran") + k * 0.07 + 0.4, 0.02)
for k in range(4):
    ping(A("s2:klaster") + k * 0.38, 1600 + k * 200, 0.04)
rise(K["s2e"] - 1.4, 1.4, 0.03)
# columns rise: a metal tick + a short rising tone per column
for kk, f in (("s3:Amran", 1800), ("s3:Yusril", 1600), ("s3:Sjafrie", 1400), ("s4:Dedi", 1800), ("s4:Sherly", 1600), ("s5:Puan", 1800), ("s5:Sultan", 1600), ("s5:Muzani", 1400)):
    g(M.lib("click"), A(kk) + 0.05, 0.07)
    rise(A(kk) + 0.05, 1.2, 0.025)
    ping(A(kk) + 1.3, f, 0.04)
g(M.lib("impact-bass-1"), A("s4:33,7"), 0.1)
g(M.lib("pop"), A("s4:Pramono"), 0.05)
# s6 desk, calendar, blocks
g(M.thump(0.45), A("s6:Presiden") + 0.4, 0.14)
g(M.lib("click"), A("s6:25"), 0.08)
ping(A("s6:25") + 0.05, 2000, 0.05)
for k in range(3):
    g(M.lib("whoosh-short"), A("s6:PAN") - 0.3 + k * 0.42, 0.04)
    g(M.thump(0.2), A("s6:PAN") + 1.1 + k * 0.42, 0.08)
# s7 Dasco plate glows, plates into the funnel, two out of MPR
g(M.lib("sparkle"), A("s7:Dasco"), 0.05)
g(M.lib("riser"), A("s7:Dari") - 0.6, 0.06)
for k in range(12):
    clink(A("s7:Dari") + 0.6 + k * 0.1, 0.025)
g(M.lib("impact-bass-1"), A("s7:2"), 0.1)
g(M.lib("click"), A("s7:MPR"), 0.08)
g(M.lib("click"), A("s7:MPR") + 0.12, 0.07)
# s8
g(M.lib("chime"), A("s8:Ikuti") - 0.2, 0.05)
g(M.thump(), OUT, 0.12)
g(M.lib("whoosh-cinematic"), OUT - 0.4, 0.05)
M.finish(music)
