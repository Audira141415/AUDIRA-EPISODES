"""EP15 sound: a thermal-sensor lab. A dark analog synth bed in D minor at 100 BPM: a pulsing sub bass that breathes
with the alternating current, a glassy bell motif on key words, and a warm filtered pad that heats up (brighter) as the
pan heats in s5 and cools when the hob is switched off in s8. Electrical texture: a low mains hum under the coil
scenes, a soft rising whine when the field appears, a sizzle bed over the hot pan, a slow 50 Hz throb vs a dense
high shimmer in s7. SFX: whooshes on cuts, clicks on panel lines, a clack when the magnet snaps on.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1506)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 100
D3 = 146.83
hz = lambda st, base=D3: base * 2 ** (st / 12)


def bell(f, dur=1.6, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.6) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6) + 0.12 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 11)
    return x * np.minimum(1, t / 0.003) * a


def pluck(f, dur=0.5, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (6 + 4 * h)) / h for h in range(1, 6))
    return x * np.minimum(1, t / 0.004) * a


bel, bass, pad, arp = M.mono(), M.mono(), M.mono(), M.mono()
# heat envelope: hot hook, cold while we look at coil/field, heats in s5, hot through s6, cools after "Matikan"
heat = M.env([(0, 0.8), (K["s2"], 0.8), (K["s2"] + 1.2, 0.2), (AT["s5:menghambat"], 0.2), (AT["s5:panas"] + 0.6, 1), (K["s7"], 1), (K["s7"], 0.5),
              (K["s8"], 0.9), (AT["s8:Matikan"], 0.9), (AT["s8:berhenti"] + 0.8, 0.15), (DUR, 0.15)])
# sub bass pulse in 8ths, minor progression every two bars
prog = [0, -4, -2, -7]  # Dm, Bb, C, G
i, t0 = 0, 0.05
while t0 < END + 1.0:
    root = prog[(i // 16) % 4]
    M.lay(bass, pluck(hz(root - 12), 0.42, 0.9 if i % 4 == 0 else 0.5), t0)
    if i % 2 == 1:
        M.lay(arp, pluck(hz(root + [0, 3, 7, 10][(i // 2) % 4] + 12), 0.3, 0.35), t0)
    t0 += beat / 2
    i += 1
# bell motif on scene openings and key words
phr = {"s1": [0, 3, 7, 12], "s2": [7, 5, 3, 0], "s3": [3, 7, 10, 14], "s4": [12, 10, 7, 3], "s5": [0, 7, 12, 15],
       "s6": [7, 10, 12], "s7": [12, 15, 19, 24], "s8": [12, 10, 7, 3, 0]}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.1
    for j, st in enumerate(notes):
        M.lay(bel, bell(hz(st + 12), 1.4, 0.7), tt + j * beat * 0.5)
for w in ("s1:pancimu", "s3:magnet", "s4:pusar", "s5:panas", "s6:cocok", "s7:transistor", "s8:tungkunya"):
    M.lay(bel, bell(hz(24), 1.8, 0.45), AT[w])
# pad: dark when cold, a brighter warm partial fades in with the heat
pad += (0.4 * np.sin(2 * np.pi * hz(0) * T) + 0.3 * np.sin(2 * np.pi * hz(3) * T + np.sin(T * 0.4)) + 0.25 * np.sin(2 * np.pi * hz(7) * T)) * 0.55
pad += heat * (0.22 * np.sin(2 * np.pi * hz(19) * T + 0.5 * np.sin(T * 0.7)) + 0.16 * np.sin(2 * np.pi * hz(24) * T + np.sin(T * 0.5)))
# mains hum under the coil / field / pan scenes; stops after "Matikan"
hum_env = M.env([(0, 0.4), (K["s2"], 0.4), (AT["s2:menyala"], 1), (K["s6"], 1), (K["s6"], 0.3), (K["s7"], 0.3), (K["s7"], 0), (K["s8"], 0),
                 (K["s8"] + 0.5, 0.6), (AT["s8:Matikan"], 0.6), (AT["s8:Matikan"] + 0.4, 0), (DUR, 0)])
hum = (np.sin(2 * np.pi * 100 * T) + 0.35 * np.sin(2 * np.pi * 200 * T) + 0.15 * np.sin(2 * np.pi * 300 * T)) * hum_env * 0.18
# field whine: a soft rising sine when the field appears in s3
wenv = M.env([(0, 0), (AT["s3:magnet"] - 0.8, 0), (AT["s3:magnet"], 1), (K["s4"], 0.6), (K["s5"], 0), (DUR, 0)])
fw = 600 + 400 * np.clip((T - AT["s3:magnet"] + 0.8) / 3.0, 0, 1)
whine = np.sin(2 * np.pi * np.cumsum(fw) / SR) * wenv * 0.06
# s7: slow 50 Hz throb then a dense high shimmer for "puluhan ribu"
e50 = M.env([(0, 0), (AT["s7:lima"] - 0.2, 0), (AT["s7:lima"], 1), (AT["s7:ribu"], 0.6), (AT["s7:dipatenkan"], 0), (DUR, 0)])
throb = np.sin(2 * np.pi * 50 * T) * (0.5 + 0.5 * np.sin(2 * np.pi * 2.0 * T)) * e50 * 0.35
eK = M.env([(0, 0), (AT["s7:ribu"] - 0.3, 0), (AT["s7:ribu"], 1), (AT["s7:dipatenkan"] + 1.0, 0.4), (K["s8"], 0), (DUR, 0)])
shimmer = (np.sin(2 * np.pi * 3200 * T) + 0.5 * np.sin(2 * np.pi * 4800 * T + np.sin(T * 30))) * eK * 0.03
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.45 * bel + 0.5 * bass + 0.3 * pad + 0.25 * arp + hum + whine + throb + shimmer) * e
side = 0.22 * np.roll(bel + pad * heat * 0.5 + arp * 0.5, 900) * e
music = stereo(mono, side)


# ---- SFX ----
def sizzle(a, b, amp):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), 3000, 11000)
    crack = (M.rng.random(n) > 0.9993) * M.rng.standard_normal(n) * 6
    env = np.minimum(1, np.arange(n) / (0.6 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.4 * SR))
    g((x / np.abs(x).max() + crack * 0.1) * env, a, amp)


g(M.lib("riser"), 0.0, 0.03)
sizzle(0.0, K["s2"], 0.012)  # the hot pan in the hook
for s in ("s2", "s4", "s6", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
for s in ("s3", "s5"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
for w in ("s2:kawat", "s2:mengalir", "s3:berbalik", "s3:menembus", "s4:Namanya", "s5:Hambatan", "s5:panas", "s6:aluminium",
          "s6:menempel", "s6:hangat", "s7:lima", "s7:ribu", "s7:transistor", "s8:tungkunya", "s8:Episode"):
    g(M.lib("click-soft"), AT[w] - 0.03, 0.045)
g(M.lib("ping"), AT["s2:menyala"], 0.04)
g(M.lib("glitch-1"), AT["s3:magnet"], 0.02)
g(M.thump(0.2), AT["s4:diletakkan"], 0.1)
g(M.lib("sparkle"), AT["s4:memancing"], 0.035)
sizzle(AT["s5:panas"] - 0.3, K["s6"], 0.016)
g(M.lib("impact-bass-1"), AT["s5:panas"], 0.045)
g(M.lib("click"), AT["s6:menempel"], 0.09)
g(M.thump(0.12), AT["s6:menempel"], 0.08)
g(M.lib("pop"), AT["s7:dipatenkan"], 0.05)
g(M.lib("pop"), AT["s7:tujuh"], 0.05)
sizzle(K["s8"], AT["s8:Matikan"] + 0.3, 0.012)
g(M.lib("click"), AT["s8:Matikan"], 0.08)
g(M.lib("chime"), AT["s8:AUDIRA"], 0.035)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
