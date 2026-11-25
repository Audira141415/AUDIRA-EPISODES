"""EP02 sound: a cold sensor ambience. A slow detuned synth pad in A minor (A, C, E, G) that breathes in and out,
soft glassy sine pulses on eighth notes at 92 BPM, and a low compressor hum motif (50/100/150 Hz with a slow
throb) that swells whenever the compressor is on screen. SFX: thermal-scan beeps on the reticle readings,
whooshes on scene changes, a valve hiss, a compressor start clunk, ether bubbles, a chime on 1915.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1915)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]

# ---- pad: four detuned sines per chord, chords change every 4 bars ----
beat = 60 / 92
bar = beat * 4
chords = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67], [52, 55, 59, 64]]  # Am7, Fmaj7, G, Em
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
pad = M.mono()
t0, ci = 0.0, 0
L = bar * 4
while t0 < DUR:
    seg = np.arange(int(min(L + 1.5, DUR - t0 + 0.01) * SR)) / SR
    x = np.zeros(len(seg))
    for m in chords[ci % 4]:
        f = hz(m - 12)
        x += np.sin(2 * np.pi * f * seg) + 0.6 * np.sin(2 * np.pi * f * 1.004 * seg + 1.3) + 0.25 * np.sin(2 * np.pi * f * 2.002 * seg)
    env = np.minimum(1, seg / 1.2) * np.minimum(1, (seg[-1] - seg + 1e-3) / 1.4)
    M.lay(pad, x * env * (0.8 + 0.2 * np.sin(2 * np.pi * seg / 6.0)), t0, 0.05)
    t0 += L
    ci += 1

# ---- glassy pulses on eighths, a short arpeggio of the current chord ----
pulse = M.mono()
n = 0
while n * beat / 2 < DUR:
    tt = n * beat / 2
    ch = chords[int(tt // L) % 4]
    m = ch[(n * 3) % 4] + (12 if n % 8 in (3, 7) else 0)
    a = 0.22 if n % 2 == 0 else 0.12
    M.lay(pulse, M.note(hz(m), 0.32, "sine", 9, 0.003) + 0.3 * M.note(hz(m) * 2, 0.32, "sine", 16, 0.003), tt, a)
    n += 1

# ---- compressor hum motif: always faintly there, swells on compressor shots ----
th = 0.5 + 0.5 * np.sin(2 * np.pi * 1.5 * T)
hum = (np.sin(2 * np.pi * 50 * T) + 0.55 * np.sin(2 * np.pi * 100 * T) + 0.25 * np.sin(2 * np.pi * 150 * T)) * (0.7 + 0.3 * th)
hum_env = M.env([(0, 0.25), (K["s3"], 0.25), (AT["s3:kompresor"], 0.7), (AT["s3:kompresor"] + 1.5, 0.35), (K["s5"], 0.4),
                 (AT["s5:kompresor"], 1.0), (AT["s5:kondensor"], 0.7), (K["s6"], 0.35), (K["s7"], 0.0), (K["s8"], 0.0), (K["s8"] + 0.6, 0.4), (DUR, 0.2)])
hum = hum * hum_env * 0.09

e = M.env([(0, 0.85), (K["s2"], 1), (K["s7"], 1), (K["s7"] + 0.6, 0.7), (K["s8"], 1), (END + 0.3, 1), (DUR - 0.6, 0.5), (DUR, 0)])
mono = (pad + 0.55 * pulse + hum) * e
side = 0.25 * np.roll(pad, 900) * e + 0.15 * np.roll(pulse, 400) * e
air = M.band(M.rng.standard_normal(N), 3000, 9000) * 0.003
music = stereo(mono + air, side)

# ---- SFX ----
def beep(t, f=1760, a=0.05):
    g(M.note(f, 0.06, "sine", 25, 0.002), t, a)
    g(M.note(f * 1.5, 0.05, "sine", 30, 0.002), t + 0.07, a * 0.7)


def hiss(t, dur=1.2, a=0.1):
    x = M.band(M.burst(dur, 2.5, 1), 2500, 10000)
    x *= np.minimum(1, np.arange(len(x)) / (0.03 * SR))
    g(x, t, a)


g(M.lib("click-soft"), 0.05, 0.08)
beep(0.15, 1568, 0.04)
beep(0.45, 2093, 0.04)
g(M.lib("riser"), AT["s1:memindahkan"] - 0.2, 0.05)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.3, 0.08)
g(M.lib("whoosh-cinematic"), K["s3"] - 0.3, 0.07)
beep(AT["s2:hangat"], 1760, 0.05)
g(M.lib("ping"), AT["s2:dibuang"], 0.04)
# components named: a beep each
for w in ("s3:kompresor", "s3:kondensor", "s3:katup", "s3:evaporator"):
    beep(AT[w], 1318, 0.04)
g(M.lib("sparkle"), AT["s3:berputar"], 0.04)
# evaporator: soft cold shimmer while heat leaves the bowl
g(M.lib("chime"), AT["s4:dingin"], 0.04)
beep(AT["s4:dingin"] + 0.1, 1175, 0.035)
# compressor start clunk + squeeze
g(M.thump(0.3), AT["s5:kompresor"] - 0.1, 0.15)
g(M.lib("click"), AT["s5:kompresor"] - 0.1, 0.06)
for k in range(3):
    g(M.thump(0.18), AT["s5:ditekan"] + k * 0.33, 0.08)
beep(AT["s5:panas"], 2093, 0.05)
g(M.lib("whoosh"), AT["s5:mengalir"], 0.05)
# valve hiss when pressure drops
hiss(AT["s6:katup"], 0.9, 0.06)
hiss(AT["s6:Tekanannya"], 1.6, 0.09)
beep(AT["s6:turun"], 988, 0.04)
g(M.lib("whoosh-short"), AT["s6:Siklus"], 0.06)
# ether boiling: tiny bubble pops
rr = np.random.default_rng(7)
for k in range(26):
    tt = AT["s7:mendidihkan"] + k * 0.17 + rr.random() * 0.1
    g(M.note(700 + rr.random() * 900, 0.04, "sine", 60, 0.001), tt, 0.025)
beep(AT["s7:menyerap"], 1175, 0.035)
g(M.lib("chime"), AT["s7:Kulkas"], 0.06)
g(M.lib("impact-bass-1"), AT["s8:pengangkut"], 0.08)
beep(AT["s8:pengangkut"] + 0.05, 2093, 0.04)
g(M.lib("sparkle"), OUT - 0.3, 0.07)
g(M.thump(), OUT, 0.15)
M.finish(music)
