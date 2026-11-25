"""EP01 PENSIL sound: a warm sketchbook bed. Felt-piano arpeggios in F major at 84 BPM, a soft sine bass, pencil-scratch
hats (short band-passed noise strokes) and a woodblock tick. SFX are the workshop drawn in pencil: scribbles when lines
appear, paper flips on scene changes, kiln roar, wax bubbles, the slat thunk, press hiss, knife slice, a stamp, lacquer drips.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1795)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
A = lambda k: AT[k]

piano, bass, hats, wood = M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 84
F3 = 174.61
# F - Dm - Bb - C (semitones from F), arpeggio of 8 eighths per bar
chords = [[0, 4, 7, 12], [-3, 0, 4, 9], [-7, -3, 0, 5], [-5, -1, 2, 7]]
pat = [0, 1, 2, 3, 2, 1, 2, 3]
t0, i = 0.0, 0
while t0 < DUR:
    bar = (i // 8) % 4
    ch = chords[bar]
    st = ch[pat[i % 8]]
    vel = 0.55 if i % 8 else 0.8
    M.lay(piano, M.note(F3 * 2 ** (st / 12), beat * 1.6, "pluck", 3.2, 0.004) * vel, t0, 1)
    if i % 8 == 0:
        M.lay(bass, M.note(F3 / 2 * 2 ** (ch[0] / 12), beat * 3.8, "sine", 0.6, 0.02), t0, 1)
    if i % 2 == 1:
        sc = M.band(M.burst(0.07, 45, 1), 3000, 9000)
        M.lay(hats, sc, t0, 0.12 if i % 4 == 3 else 0.07)
    if i % 4 == 2:
        M.lay(wood, M.note(1250, 0.05, "sine", 70) + 0.5 * M.note(1870, 0.05, "sine", 90), t0, 0.12)
    t0 += beat / 2
    i += 1
# a soft high piano line on hook, sandwich and payoff
for s, notes in {"s1": [12, 16, 19, 24], "s5": [16, 14, 12, 7], "s7": [12, 16, 19, 21, 24]}.items():
    tt = K[s] + 0.2
    for st in notes:
        M.lay(piano, M.note(F3 * 2 * 2 ** (st / 12), beat * 2, "pluck", 2.2, 0.004) * 0.5, tt, 1)
        tt += beat
e = M.env([(0, 0.8), (K["s2"], 1), (END, 1), (DUR - 0.8, 0.6), (DUR, 0)])
mono = (0.6 * piano + 0.7 * bass + 0.6 * hats + 0.5 * wood) * e
side = 0.16 * np.roll(piano + hats, 600) * e
room = M.band(M.rng.standard_normal(N), 80, 600) * 0.008
music = stereo(mono + room, side)


# ---- SFX ----
def scribble(t, dur=0.6, a=0.06):
    n = int(dur * SR)
    x = M.band(M.rng.standard_normal(n), 1800, 7000)
    tt = np.arange(n) / SR
    am = 0.5 + 0.5 * np.sin(2 * np.pi * 9 * tt + 3 * np.sin(2 * np.pi * 2.3 * tt))
    x = x * am * np.minimum(1, tt / 0.03) * np.minimum(1, (dur - tt) / 0.06)
    g(x / (np.abs(x).max() + 1e-9), t, a)


def paper(t, a=0.07):
    x = M.band(M.burst(0.35, 9, 2), 600, 6000)
    g(x / (np.abs(x).max() + 1e-9), t, a)


def thunk(t, a=0.16):
    g(M.thump(0.25), t, a)
    g(M.note(220, 0.12, "sine", 30), t, a * 0.4)


g(M.lib("whoosh-short"), 0.0, 0.06)
scribble(A("s1:mengandung") - 0.1, 0.5, 0.05)
g(M.thump(0.4), A("s1:timbal"), 0.18)
scribble(A("s1:Sama") - 0.1, 0.35, 0.09)
scribble(A("s1:sekali") + 0.05, 0.35, 0.09)
g(M.lib("impact-bass-1"), A("s1:sekali") + 0.1, 0.1)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    paper(K[s] - 0.25, 0.08)
    g(M.lib("whoosh-short"), K[s] - 0.35, 0.05)
# s2
scribble(A("s2:abad"), 1.2, 0.04)
scribble(A("s2:menemukan") - 0.4, 0.6, 0.05)
g(M.lib("pop"), A("s2:mengira") - 0.1, 0.07)
scribble(A("s2:keliru"), 0.4, 0.08)
thunk(A("s2:cat"), 0.1)
# s3
for k in ("s3:grafit", "s3:tanah", "s3:air"):
    scribble(A(k) - 0.5, 0.35, 0.04)
    g(M.lib("pop"), A(k) + 0.05, 0.05)
for k in range(3):
    g(M.band(M.burst(0.18, 20, 3), 300, 2500), A("s3:Adonan") - 0.3 + k * 0.25, 0.06)
hiss = M.band(M.rng.standard_normal(int(1.4 * SR)), 2500, 9000) * np.exp(-np.arange(int(1.4 * SR)) / SR * 1.6)
g(np.stack([hiss, hiss], 1) / np.abs(hiss).max(), A("s3:dipres"), 0.05)
g(M.thump(0.3), A("s3:dipres") + 0.1, 0.12)
squeeze = M.note(70, 2.2, "saw", 0.4, 0.2) * 0.4
g(squeeze, A("s3:didorong") - 0.2, 0.06)
for k in range(6):
    g(M.lib("click"), A("s3:dipotong") + 0.2 + k * 0.27, 0.06)
g(M.lib("chime"), A("s3:dikeringkan"), 0.04)
# s4 kiln roar + dial + wax bubbles
rd = int((A("s4:Lalu") - A("s4:dibakar") + 0.6) * SR)
roar = M.band(M.rng.standard_normal(rd), 60, 700)
rt = np.arange(rd) / SR
roar = roar * np.minimum(1, rt / 0.8) * np.minimum(1, (rd / SR - rt) / 0.8)
g(roar / np.abs(roar).max(), A("s4:dibakar") - 0.2, 0.1)
g(M.lib("riser"), A("s4:suhu") - 0.4, 0.05)
g(M.lib("ping"), A("s4:derajat") + 0.2, 0.05)
scribble(A("s4:oksigen") - 0.1, 0.5, 0.08)
for k in range(9):
    g(M.note(300 + 140 * ((k * 7) % 5), 0.06, "sine", 40), A("s4:direndam") + k * 0.21, 0.05)
# s5 sandwich
thunk(A("s5:Papan"), 0.1)
scribble(A("s5:diberi"), 0.8, 0.05)
g(M.band(M.burst(0.6, 5, 4), 400, 3000), A("s5:Lem"), 0.04)
for k in range(9):
    g(M.note(900 + k * 40, 0.05, "sine", 60), A("s5:isi") - 0.1 + k * 0.17 + 0.3, 0.05)
g(M.lib("whoosh"), A("s5:ditutup") - 0.1, 0.06)
thunk(A("s5:kedua") + 0.1, 0.2)
g(np.stack([hiss, hiss], 1) / np.abs(hiss).max(), A("s5:dipres") - 0.2, 0.06)
g(M.thump(0.4), A("s5:dipres") + 0.1, 0.16)
sl = np.arange(int(0.5 * SR)) / SR
shing = np.sin(2 * np.pi * np.cumsum(5200 - 2600 * sl) / SR) * np.exp(-sl * 7) * 0.5 + M.band(M.burst(0.5, 8, 1), 4000, 11000) * 0.5
g(shing, A("s5:pisau") + 0.1, 0.07)
for k in range(9):
    g(M.lib("click-soft"), A("s5:beberapa") + k * 0.06, 0.04)
g(M.thump(0.3), A("s5:dibor") + 0.05, 0.2)
g(M.lib("impact-bass-1"), A("s5:dibor") + 0.05, 0.08)
# s6 ratio: disc taps, two pencil strokes (light then heavy)
for k in range(7):
    g(M.note(520, 0.05, "sine", 50), A("s6:tanah") - 0.3 + k * 0.29, 0.05)
    g(M.note(380, 0.06, "sine", 40), A("s6:grafit") - 0.4 + k * 0.32, 0.06)
scribble(A("s6:goresannya") - 0.1, 1.3, 0.05)
scribble(A("s6:lunak") - 0.4, 1.4, 0.11)
g(M.lib("pop"), A("s6:H"), 0.06)
g(M.lib("pop"), A("s6:B"), 0.06)
# s7 sanding, eight coats, ferrule, eraser, the field
san = M.band(M.rng.standard_normal(int(1.0 * SR)), 1000, 6000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 7 * np.arange(int(1.0 * SR)) / SR)))
g(san / np.abs(san).max(), A("s7:diampelas"), 0.05)
c0, c1 = A("s7:dicat") - 0.1, A("s7:lebih") + 0.2
for k in range(8):
    g(M.note(F3 * 4 * 2 ** ([0, 2, 4, 5, 7, 9, 11, 12][k] / 12), 0.12, "sine", 18), c0 + (c1 - c0) * (k + 1) / 8, 0.04)
g(M.lib("click"), A("s7:logam") + 0.1, 0.12)
g(M.note(2400, 0.4, "sine", 9) * 0.6, A("s7:logam") + 0.1, 0.05)
g(M.lib("pop"), A("s7:penghapus"), 0.08)
for k in range(24):
    g(M.note(700 + 60 * (k % 7), 0.04, "sine", 70), A("s7:pabrik") + k * 0.12, 0.03)
g(M.lib("riser"), A("s7:lebih#2") - 0.6 if "s7:lebih#2" in AT else A("s7:miliar") - 0.8, 0.05)
g(M.lib("impact-bass-1"), A("s7:miliar"), 0.08)
# s8
g(M.lib("whoosh-cinematic"), K["s8"] - 0.3, 0.07)
g(M.lib("sparkle"), A("s8:Ikuti") - 0.2, 0.05)
g(M.lib("chime"), OUT - 0.1, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
