"""EP13 sound: modern cinematic strings (sustained pads + low spiccato ostinato in D) under a breathy ney-like flute
that plays a D hijaz motif. Stone rumble when monoliths rise, whoosh + slab thud on every letterform wipe,
metal sign flips in the hook, typewriter and press stamps at the law dates. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1928)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 0.6
bar = beat * 4
cuts = [AT[k] for k in ("s2:Ini", "s4:Tahun", "s5:Komisi", "s6:Satu", "s7:Aturannya", "s8:Satu")]

# chords: Dm - Bb - Gm - A (harmonic minor turn), brighter D major lift for the payoff
PROG = [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]]
LIFT = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]]
chords = lambda t: LIFT if t >= cuts[5] else PROG

def bowed(f_list, d, att=0.5, rel=0.7, vib=4.8):
    tt = np.arange(int(d * SR)) / SR
    env = np.minimum(1, tt / att) * np.minimum(1, (d - tt) / rel)
    x = np.zeros(len(tt))
    for v, f0 in enumerate(f_list):
        f = f0 * (1 + 0.003 * np.sin(2 * np.pi * vib * tt + v * 1.3))
        ph = 2 * np.pi * np.cumsum(f) / SR
        x += sum(np.sin(h * ph + v) / h ** 1.25 for h in range(1, 9))
    return x * env

pads = M.mono()
for t0 in np.arange(0.0, END + bar, bar):
    ch = chords(t0)[int(t0 / bar) % 4]
    M.lay(pads, bowed([hz(m) for m in ch], bar + 0.8), t0, 1.0)
pads = M.band(pads, 60, 4200)
pads /= np.abs(pads).max()

# low spiccato ostinato: root and fifth in eighths
osti = M.mono()
for k, t0 in enumerate(np.arange(0.0, END, beat / 2)):
    ch = chords(t0)[int(t0 / bar) % 4]
    m = ch[0] - 12 + (7 if k % 4 == 2 else 0)
    M.lay(osti, M.note(hz(m), 0.22, "saw", 14, 0.004), t0, 0.9 if k % 2 == 0 else 0.55)
osti = M.band(osti, 40, 1400)
osti /= np.abs(osti).max()

# ney: breathy sine + noise, slow glides, D hijaz (D Eb F# G A Bb C)
HIJ = [62, 63, 66, 67, 69, 70, 72, 74]
phrases = [[(4, 1.2), (3, 0.6), (2, 0.6), (1, 1.6)], [(4, 0.6), (5, 0.6), (4, 0.6), (3, 0.6), (2, 1.8)],
           [(7, 1.2), (6, 0.6), (5, 0.6), (4, 2.0)], [(2, 0.6), (3, 0.6), (4, 1.2), (1, 0.6), (0, 2.2)]]
ney = M.mono()
def ney_note(m0, m1, d):
    tt = np.arange(int(d * SR)) / SR
    glide = m0 + (m1 - m0) * np.minimum(1, tt / 0.12)
    f = hz(glide) * (1 + 0.006 * np.sin(2 * np.pi * 5.2 * tt) * np.minimum(1, tt / 0.4))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + 0.12 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
    breath = M.band(rng.standard_normal(len(tt)), 600, 5000) * 0.18
    env = np.minimum(1, tt / 0.18) * np.minimum(1, (d - tt) / 0.3)
    return (tone + breath) * env
for p_i, t0 in enumerate([0.6, cuts[0] + 0.4, AT["s3:Usulan"] - 1.0, cuts[1] + 2.0, cuts[3] + 1.0, cuts[5] + 0.6]):
    prev = None
    t = t0
    for idx, d in phrases[p_i % 4]:
        m = HIJ[idx]
        M.lay(ney, ney_note(prev if prev is not None else m - 1, m, d + 0.15), t, 0.5)
        prev = m
        t += d
ney /= max(1e-6, np.abs(ney).max())

e_pad = M.env([(0, 0.0), (0.4, 0.7), (cuts[0], 0.75), (cuts[3], 0.85), (cuts[5], 1.0), (END, 1.0), (DUR - 0.4, 0), (DUR, 0)])
e_ost = M.env([(0, 0), (AT["s1:mengganti"] - 0.3, 0), (AT["s1:mengganti"], 0.7), (cuts[0], 0.35), (AT["s3:Usulan"], 0.5), (cuts[1], 0.8),
               (cuts[3], 1.0), (cuts[5] - 0.2, 1.0), (cuts[5] + 0.6, 0.3), (END, 0.25), (DUR - 0.4, 0), (DUR, 0)])
music = stereo(0.5 * pads * e_pad + 0.32 * osti * e_ost + 0.3 * ney, 0.12 * pads * e_pad + 0.06 * ney)

# --- sound design ---
def rumble(t, d=1.4, a=0.08):
    x = M.band(M.burst(d, 1.6, 6), 30, 260)
    x *= np.minimum(1, np.arange(len(x)) / (0.25 * SR))
    g(x, t, a)

def flip(t, a=0.03):
    g(M.tone((1450, 2320), 0.18, 22), t, a * 0.6); g(M.band(M.burst(0.08, 50, 2), 1200, 8000), t, a)

def key(t, a=0.04):
    g(M.band(M.burst(0.035, 140, 1), 1800, 9000), t, a); g(M.thump(0.06), t, a * 0.6)

def press(t, a=0.16):
    g(M.thump(0.45), t, a); g(M.band(M.burst(0.12, 30, 2), 200, 3000), t, a * 0.4); g(M.tone((180, 270), 0.4, 9), t, a * 0.2)

# wipes: whoosh in, slab thud at the cover, whoosh out
for c in cuts:
    g(M.lib("whoosh-cinematic"), c - 0.55, 0.06); g(M.thump(0.4), c - 0.05, 0.14); g(M.lib("whoosh-short"), c + 0.08, 0.04)
# hook: sign flip wave
fl = AT["s1:mengganti"] - 0.3
for i in range(14):
    flip(fl + i * 0.16 + rng.uniform(0, 0.05), 0.03 - i * 0.0012)
g(M.lib("pop"), AT["s1:Koran"], 0.03); g(M.lib("pop"), AT["s1:papan"], 0.03); g(M.lib("pop"), AT["s1:buku"], 0.035)
# calligraphy hall: a low bell
g(M.tone((147, 294, 405, 588), 4.0, 0.9), cuts[0] + 0.3, 0.05)
# vowel gap: soft chimes as vowels cycle
for i in range(6):
    g(M.tone((hz(HIJ[(i * 2) % 8] + 12),), 0.6, 6), AT["s3:vokal"] + i * 0.75, 0.025)
rumble(AT["s3:Usulan"] + 0.2, 1.6, 0.08); rumble(AT["s3:ditentang"], 1.8, 0.09)
g(M.lib("impact-bass-1"), AT["s3:ditentang"], 0.06)
# 1928, wall rises, gold
rumble(AT["s4:Komisi"] + 0.3, 2.4, 0.1)
g(M.lib("riser"), AT["s4:29"] - 1.4, 0.04); g(M.lib("impact-bass-1"), AT["s4:29"], 0.07)
g(M.lib("sparkle"), AT["s4:khusus"], 0.05)
# 5 years sink, 3 months rise
rumble(AT["s5:memangkasnya"], 1.6, 0.1); g(M.thump(0.5), AT["s5:tiga"], 0.16); rumble(AT["s5:tiga"] - 0.3, 1.2, 0.08)
for i in range(13):
    g(M.lib("click-soft"), AT["s5:berkeliling"] + i * 0.2, 0.02)
# law dates: typewriter runs and press stamps
for a in ("s6:November", "s6:Desember", "s6:Januari"):
    for i in range(10):
        key(AT[a] - 0.9 + i * 0.075 + rng.uniform(0, 0.02), 0.035)
    press(AT[a] + 0.1, 0.15)
    g(M.tone((1760, 2640), 0.3, 12), AT[a] - 0.12, 0.02)
for a in ("s6:koran", "s6:iklan", "s6:papan", "s6:komunikasi", "s6:buku"):
    g(M.lib("click"), AT[a], 0.025)
g(M.band(M.burst(0.5, 6, 4), 600, 7000), AT["s6:koran"] - 0.2, 0.05)
# 2013, Q W X, fence and tape
rumble(AT["s7:2013"] - 0.2, 1.2, 0.07)
for a in ("s7:Q", "s7:W", "s7:X"):
    g(M.thump(0.35), AT[a], 0.12); g(M.tone((620, 930), 0.3, 10), AT[a], 0.02)
g(M.lib("error"), AT["s7:dilarang"], 0.04); press(AT["s7:dilarang"] + 0.05, 0.12)
# payoff and outro
g(M.lib("riser"), cuts[5] - 1.6, 0.03); g(M.tone((147, 220, 294, 370), 4.5, 0.7), cuts[5] + 0.1, 0.05)
g(M.lib("pop"), AT["s8:Menurut"], 0.03)
g(M.lib("chime"), OUT + 0.3, 0.06)
# large room air
room = M.band(rng.standard_normal(N), 80, 900)
room /= np.abs(room).max()
M.fx += np.stack([room, np.roll(room, 1100)], 1) * 0.004
M.finish(music)
print("duration", DUR)
