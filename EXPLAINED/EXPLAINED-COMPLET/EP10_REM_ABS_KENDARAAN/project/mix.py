"""EP10 sound: LIDARFORGE neon-void. A pulsing synth bass in E minor at 110 BPM over a sub-bass
drone and a glassy FM pad. Road scenes get tyre-hiss ambience and rain patter; lab scenes get a
clean electronic hum. ABS cycle pulses match the 15x/sec rhythm in s7. SFX: laser sweeps on
scene cuts, brake screech, hydraulic clicks for components, pedal thump for vibration.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1978)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 110
E2 = 82.41
MIN = [0, 3, 7, 10, 12, 15, 19, 24]
hz = lambda st, base=E2: base * 2 ** (st / 12)


def synth_bass(f, dur=0.6, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t + 1.2 * np.sin(2 * np.pi * f * 0.5 * t)) * np.exp(-t * 2.5)
    x += 0.3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 5)
    return x * np.minimum(1, t / 0.003) * a


def glass_tone(f, dur=1.8, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    mod = 3.2 * np.sin(2 * np.pi * 5.1 * t) * np.exp(-t * 1.5)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 1.8)
    x += 0.2 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 6)
    return x * np.minimum(1, t / 0.002) * a


def pulse_click(a=1.0):
    t = np.arange(int(0.06 * SR)) / SR
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 80) * a


bass, lead, pad, grv = M.mono(), M.mono(), M.mono(), M.mono()
# pulsing bass: root on downbeats, fifth on off-beats, shifts per scene pair
prog = [0, 0, -2, -2, 3, 3, 5, 5]
i, t0 = 0, 0.05
while t0 < END + 0.8:
    sc = min(int((t0 - 0.05) / (DUR / 8)), 7)
    root = prog[sc]
    st = root + (0 if i % 2 == 0 else 7) - 12
    M.lay(bass, synth_bass(hz(st), 0.5, 0.85 if i % 4 == 0 else 0.5), t0)
    t0 += beat / 2
    i += 1
# glass-tone phrases at scene starts
phr = {"s1": [12, 15, 19], "s2": [19, 15, 12], "s3": [7, 10, 12, 15], "s4": [24, 19, 15, 12],
       "s5": [12, 15, 19, 24], "s6": [10, 7, 3, 0], "s7": [0, 3, 7, 12, 15], "s8": [15, 19, 24]}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.1
    for j, st in enumerate(notes):
        M.lay(lead, glass_tone(hz(st + 12), 1.6, 0.65), tt + j * beat * 0.45)
# accent tones on key words
for w in ("s1:dilepas", "s4:sensor", "s5:melambat", "s6:siklus", "s7:detik", "s8:AUDIRA"):
    M.lay(lead, glass_tone(hz(27), 2.0, 0.4), AT[w])
# sub-bass drone
drone_env = M.env([(0, 0.6), (K["s2"], 0.8), (K["s4"], 0.4), (K["s5"], 0.7), (K["s7"], 0.9), (END, 0.9), (DUR - 0.5, 0.3), (DUR, 0)])
pad += np.sin(2 * np.pi * 41.2 * T + 0.3 * np.sin(T * 0.6)) * 0.7
pad += np.sin(2 * np.pi * 164.8 * T + 1.5 * np.sin(2 * np.pi * 4.8 * T)) * 0.25
pad *= drone_env
# ABS cycle pulse: rapid clicks in s7 at 15 Hz
abs_env = M.env([(0, 0), (K["s7"], 0), (K["s7"] + 0.3, 1), (AT["s7:detik"] + 0.8, 1), (AT["s7:detik"] + 1.2, 0), (DUR, 0)])
abs_pulse = np.sin(2 * np.pi * 15 * T) * (np.sin(2 * np.pi * 15 * T) > 0.7).astype(float) * abs_env * 0.35
# road tyre hiss ambience for road scenes (s1-s3, s8)
road_env = M.env([(0, 0.5), (K["s2"], 0.7), (K["s4"] - 0.3, 0.7), (K["s4"], 0), (K["s8"], 0), (K["s8"] + 0.3, 0.5), (END, 0.5), (DUR, 0)])
tyre_hiss = M.band(M.rng.standard_normal(N), 800, 5000) * 0.015 * road_env
e = M.env([(0, 0.8), (K["s1"], 1), (END + 0.3, 1), (DUR - 0.5, 0.4), (DUR, 0)])
mono = (0.5 * bass + 0.4 * lead + 0.3 * pad + abs_pulse + tyre_hiss) * e
side = 0.2 * np.roll(lead + pad * 0.4, 700) * e
music = stereo(mono, side)


# ---- SFX ----
def laser_sweep(t, dur=0.4, a=0.06):
    tt = np.arange(int(dur * SR)) / SR
    f = 6000 * np.exp(-tt * 8) + 200
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 5)
    g(x, t, a)


def brake_screech(t, dur=0.5, a=0.04):
    tt = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * 3200 * tt + 8 * np.sin(2 * np.pi * 40 * tt)) * np.exp(-tt * 4)
    x = M.band(x, 1500, 6000)
    g(x / max(1e-9, np.abs(x).max()), t, a)


def hydraulic_click(t, a=0.06):
    tt = np.arange(int(0.08 * SR)) / SR
    x = np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 60) + 0.5 * np.sin(2 * np.pi * 800 * tt) * np.exp(-tt * 40)
    g(x, t, a)


# scene-cut sweeps
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    laser_sweep(K[s] - 0.25, 0.4, 0.07)
# brake screech in s2
brake_screech(AT["s2:terkunci"] - 0.1, 0.6, 0.04)
brake_screech(AT["s2:terseret"] - 0.1, 0.4, 0.03)
# component clicks in s4
for w in ("s4:sensor", "s4:komputer", "s4:katup", "s4:pompa"):
    hydraulic_click(AT[w] - 0.05, 0.06)
# lab hum in s4-s7
n_lab = int((K["s8"] - K["s4"]) * SR)
if n_lab > 0:
    lab_hum = M.band(M.rng.standard_normal(n_lab), 100, 600) * 0.008
    lab_env = np.minimum(1, np.arange(n_lab) / (0.4 * SR)) * np.minimum(1, (n_lab - np.arange(n_lab)) / (0.4 * SR))
    g(lab_hum * lab_env, K["s4"])
# sensor pings in s5
g(M.lib("ping"), AT["s5:melambat"], 0.05)
g(M.lib("ping"), AT["s5:hampir"], 0.05)
# valve and pump clicks in s6
hydraulic_click(AT["s6:menutup"], 0.07)
hydraulic_click(AT["s6:membuang"], 0.06)
g(M.lib("click"), AT["s6:Pompa"], 0.06)
g(M.thump(0.15), AT["s6:getaran"], 0.1)
# rapid ABS clicks in s7
for j in range(15):
    g(pulse_click(0.4), AT["s7:detik"] - 0.5 + j / 15, 0.04)
g(M.lib("impact-bass-1"), AT["s7:Sistem"], 0.05)
# tyre screech + swerve in s8
brake_screech(AT["s8:injak"] - 0.1, 0.3, 0.03)
g(M.lib("whoosh-cinematic"), AT["s8:arahkan"] - 0.15, 0.06)
# outro
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.1)
M.finish(music)
