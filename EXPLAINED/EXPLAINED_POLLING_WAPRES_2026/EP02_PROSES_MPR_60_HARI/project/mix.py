"""EP02 PROSES MPR 60 HARI sound: a cool archive-room bed. A slow clock pulse (a soft woodblock tick on every beat at
76 BPM, like a ruler counting days), a felt-piano ostinato in D minor that walks Dm - Bb - F - C, a low sine bass and a
quiet air-conditioned room tone. SFX are the table: brass ticks for each date, the acrylic blocks clinking up, a sliding
cursor, a murmuring chamber (band-passed noise swell) when the seats light, gate clicks, a low drone for "one person",
a riser into the term bar, and a resolve on the close.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2602)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put


def S(*xs):
    """Sum mono signals of different lengths (zero-padded)."""
    n = max(len(x) for x in xs)
    out = np.zeros(n)
    for x in xs:
        out[: len(x)] += x
    return out

END = M.TL["speech_end"]


def A(k):
    """Word anchor: from beats.json when the world uses it, else straight from timeline.json ("sN:word#n")."""
    if k in AT:
        return AT[k]
    sc, w = k.split(":", 1)
    w, _, nth = w.partition("#")
    return M.word(sc, w, int(nth or 1) - 1)


piano, bass, tick, pad = M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 76
D3 = 146.83
# Dm - Bb - F - C (semitones from D), a 4-note ostinato per half bar
chords = [[0, 3, 7, 12], [-4, 0, 3, 8], [3, 7, 10, 15], [-2, 2, 5, 10]]
pat = [0, 2, 1, 3, 2, 1, 3, 2]
t0, i = 0.0, 0
while t0 < DUR:
    bar = (i // 8) % 4
    ch = chords[bar]
    vel = 0.7 if i % 8 == 0 else 0.42
    M.lay(piano, M.note(D3 * 2 ** (ch[pat[i % 8]] / 12), beat * 1.4, "pluck", 3.6, 0.005) * vel, t0, 1)
    if i % 8 == 0:
        M.lay(bass, M.note(D3 / 2 * 2 ** (ch[0] / 12), beat * 3.9, "sine", 0.5, 0.03), t0, 1)
        M.lay(pad, M.note(D3 * 2 ** (ch[1] / 12), beat * 4, "tri", 0.3, 0.6) + M.note(D3 * 2 ** (ch[2] / 12), beat * 4, "tri", 0.3, 0.6), t0, 0.25)
    if i % 2 == 0:
        M.lay(tick, S(M.note(1600, 0.035, "sine", 90), 0.4 * M.note(2600, 0.03, "sine", 120)), t0, 0.16 if i % 8 == 0 else 0.09)
    t0 += beat / 2
    i += 1
# a high piano phrase on the hook, the vote and the close
for s, notes in {"s1": [12, 15, 19, 24], "s4": [15, 19, 22, 24], "s8": [12, 15, 19, 17, 24]}.items():
    tt = K[s] + 0.3
    for st in notes:
        M.lay(piano, M.note(D3 * 2 * 2 ** (st / 12), beat * 2, "pluck", 2.4, 0.005) * 0.45, tt, 1)
        tt += beat
e = M.env([(0, 0.85), (K["s2"], 1), (END, 1), (DUR - 0.8, 0.6), (DUR, 0)])
mono = (0.55 * piano + 0.75 * bass + 0.6 * tick + 0.5 * pad) * e
side = 0.15 * np.roll(piano + pad, 700) * e
room = M.band(M.rng.standard_normal(N), 120, 900) * 0.006
music = stereo(mono + room, side)


# ---- SFX ----
def brass_tick(t, a=0.08, f=2400):
    g(S(M.note(f, 0.25, "sine", 18), 0.5 * M.note(f * 2.76, 0.18, "sine", 26)), t, a)


def clink(t, a=0.07):
    g(S(M.note(3100, 0.35, "sine", 12), 0.6 * M.note(4650, 0.3, "sine", 16), 0.3 * M.band(M.burst(0.05, 80, 1), 4000, 12000)), t, a)


def slide(t, dur=0.7, a=0.05):
    n = int(dur * SR)
    x = M.band(M.rng.standard_normal(n), 900, 5000)
    tt = np.arange(n) / SR
    x = x * np.minimum(1, tt / 0.08) * np.minimum(1, (dur - tt) / 0.15)
    g(x / (np.abs(x).max() + 1e-9), t, a)


def murmur(t, dur=2.4, a=0.06):
    n = int(dur * SR)
    x = M.band(M.rng.standard_normal(n), 200, 1400)
    tt = np.arange(n) / SR
    am = (0.6 + 0.4 * np.sin(2 * np.pi * 3.1 * tt) * np.sin(2 * np.pi * 0.7 * tt)) * np.sin(np.pi * tt / dur)
    g(x * am / (np.abs(x).max() + 1e-9), t, a)


g(M.lib("impact-bass-1"), 0.05, 0.1)
brass_tick(0.1, 0.1)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.35, 0.06)
# s1
for k in range(4):
    g(M.lib("click-soft"), A("s1:konstitusi") + k * 0.4, 0.04)
g(M.lib("whoosh"), A("s1:Prosesnya") - 0.2, 0.05)
g(M.thump(0.35), A("s1:pemilu") - 0.05, 0.18)
slide(A("s1:pemilu") + 0.1, 0.4, 0.05)
g(M.lib("sparkle"), A("s1:AUDIRA") - 0.1, 0.04)
# s2
g(M.thump(0.25), A("s2:Pasal"), 0.1)
brass_tick(A("s2:Pasal") + 0.1, 0.05, 1800)
g(M.lib("whoosh-cinematic"), A("s2:mengusulkan") + 0.1, 0.05)
slide(A("s2:dua") - 0.1, 0.8, 0.05)
clink(A("s2:nama") + 0.4, 0.05)
g(M.lib("ping"), A("s2:satu"), 0.06)
# s3: a brass tick on each date, the cursor slides between
brass_tick(A("s3:12"), 0.1)
clink(A("s3:12") + 0.25, 0.06)
slide(A("s3:25") - 0.6, 0.9, 0.06)
brass_tick(A("s3:25"), 0.1, 2700)
clink(A("s3:25") + 0.25, 0.06)
g(M.lib("click"), A("s3:sidang"), 0.05)
# s4: date, chamber murmur, vote, inauguration impact
slide(A("s4:9") - 0.6, 0.9, 0.06)
brass_tick(A("s4:9"), 0.11, 3000)
clink(A("s4:9") + 0.25, 0.06)
g(M.lib("whoosh-cinematic"), A("s4:MPR#2") - 0.6, 0.05)
murmur(A("s4:DPR") - 0.3, 2.2, 0.06)
murmur(A("s4:DPD") - 0.2, 1.8, 0.05)
for k in range(10):
    g(M.lib("click-soft"), A("s4:memilih") - 0.2 + k * 0.07, 0.03)
g(M.lib("impact-bass-1"), A("s4:dilantik"), 0.1)
g(M.lib("chime"), A("s4:dilantik") + 0.1, 0.05)
# s5: one click per gate, a fast slide on the short route
g(M.lib("riser"), A("s5:Pemakzulan") - 0.3, 0.03)
for k in ("s5:DPR", "s5:Konstitusi", "s5:MPR"):
    g(M.lib("click"), A(k), 0.08)
    brass_tick(A(k) + 0.05, 0.04, 1500)
slide(A("s5:Presiden") - 0.1, 0.6, 0.06)
g(M.lib("ping"), A("s5:MPR#2"), 0.06)
g(M.lib("pop"), A("s5:sederhana"), 0.05)
# s6: party blocks pop up, slide in; a low drone for "one person"
for k in ("s6:PAN", "s6:Demokrat", "s6:PKS", "s6:Golkar"):
    g(M.lib("pop"), A(k), 0.06)
for k in range(4):
    slide(A("s6:Prabowo") - 0.4 + k * 0.22, 0.35, 0.03)
dn = int(3.2 * SR)
dt = np.arange(dn) / SR
drone = (np.sin(2 * np.pi * 55 * dt) + 0.5 * np.sin(2 * np.pi * 82.4 * dt)) * np.minimum(1, dt / 0.6) * np.minimum(1, (3.2 - dt) / 0.8)
g(drone, A("s6:Artinya") - 0.2, 0.09)
g(M.thump(0.4), A("s6:satu"), 0.14)
# s7: bar rises, the term splits, riser to "tiga"
g(M.thump(0.3), K["s7"], 0.1)
g(M.lib("whoosh"), A("s7:lima") - 0.2, 0.04)
slide(A("s7:sisa") - 0.1, 1.2, 0.04)
g(M.lib("riser"), A("s7:2029") - 0.8, 0.05)
brass_tick(A("s7:2029") + 0.1, 0.07, 2200)
g(M.lib("impact-bass-1"), A("s7:tiga"), 0.08)
# s8
g(M.lib("whoosh-cinematic"), K["s8"] - 0.3, 0.06)
brass_tick(A("s8:9"), 0.07)
g(M.lib("sparkle"), A("s8:Ikuti") - 0.2, 0.05)
g(M.lib("chime"), OUT - 0.1, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
