# EP32 WATER HAMMER ARRESTOR — INFLATABLE candy toy studio.
# Bouncy toy piano, bubbly bass, warm pad, playful percussion.
# Run from project/: python mix.py
import json, sys
sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(32)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]

BPM = 108; beat = 60 / BPM
scale = [0, 2, 4, 7, 9]  # Bb major pentatonic
hz = lambda st, base=466.16: base * 2 ** (st / 12)

# --- synths ---
def toyPiano(f, dur=0.22, a=0.24):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2*np.pi*f*t) + 0.4*np.sin(4*np.pi*f*t) + 0.15*np.sin(6*np.pi*f*t)
    return x * np.exp(-8*t) * np.minimum(1, t/0.005) * a

def bounceBass(f, dur=0.3, a=0.30):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-5*t) * np.minimum(1, t/0.008)
    return env * np.sin(2*np.pi*f*t + 0.6*np.sin(np.pi*f*t)) * a

def warmPad(f, dur=2.5, a=0.09):
    t = np.arange(int(dur * SR)) / SR
    env = np.minimum(t/0.4, 1) * np.maximum(1 - (t - dur + 0.6)/0.6, 0)
    return env * (np.sin(2*np.pi*f*t) + 0.6*np.sin(2*np.pi*f*1.003*t) + 0.3*np.sin(2*np.pi*f*0.998*t)) * a

def bubble(f0, a=0.18):
    t = np.arange(int(0.12 * SR)) / SR
    return np.exp(-18*t) * np.sin(2*np.pi*(f0 + 300*np.exp(-25*t))*t) * a

# --- tracks ---
cel, bass, lo, grv = M.mono(), M.mono(), M.mono(), M.mono()
rng = M.rng

# toy piano arpeggios on scene starts
for key in ["s1e","s2","s3","s4","s5","s6","s7","s8"]:
    if key not in K: continue
    t0 = K[key]
    for i in range(3):
        note = hz(scale[rng.integers(5)])
        M.lay(cel, toyPiano(note, 0.25), t0 + i*beat*0.5)

# bouncy bass pulse
t0 = K.get("s2", 6.0)
idx = 0
while t0 < OUT - 1:
    root = hz(scale[idx % 5] - 12, 233.08)
    M.lay(bass, bounceBass(root, 0.25), t0)
    t0 += beat * 2; idx += 1

# warm pad under scenes
for i, key in enumerate(["s2","s3","s4","s5","s6","s7","s8"]):
    if key not in K: continue
    t0 = K[key]
    nxt = f"s{i+3}"
    dur = (K[nxt] if nxt in K else OUT) - t0
    root = hz(scale[i % 5], 233.08)
    seg = min(dur, 3.5)
    for j in range(int(dur / seg) + 1):
        M.lay(lo, warmPad(root, seg), t0 + j*seg)

# bubbles on key words
for w in ["s1:dug", "s1:tabrakan", "s2:momentum", "s4:Lonjakan", "s5:dentuman", "s7:Kantong"]:
    if w in AT:
        for k in range(3):
            M.lay(grv, bubble(1200 + rng.integers(800)), AT[w] + k*0.06)

# outro toy piano
M.lay(cel, toyPiano(466.16, 0.4), OUT)
M.lay(cel, toyPiano(587.33, 0.4), OUT + 0.25)
M.lay(cel, toyPiano(698.46, 0.5), OUT + 0.5)

# stereo
mono = cel + bass + lo + grv
side = M.mono()
side += cel * 0.35
side -= bass * 0.15
music = stereo(mono, side)

# --- SFX ---
for key in ["s2","s3","s4","s5","s6","s7","s8"]:
    if key in K: g(M.lib("whoosh-cinematic"), K[key] - 0.15, 0.07)

if "s1:dug" in AT: g(M.lib("impact-bass-1"), AT["s1:dug"], 0.08)
if "s3:menutup" in AT: g(M.lib("impact-bass-1"), AT["s3:menutup"], 0.06)
if "s5:dentuman" in AT:
    g(M.lib("impact-bass-1"), AT["s5:dentuman"], 0.07)
    g(M.thump(), AT["s5:dentuman"], 0.10)
if "s6:tabung" in AT: g(M.lib("click"), AT["s6:tabung"], 0.05)
if "s4:Lonjakan" in AT: g(M.lib("riser"), AT["s4:Lonjakan"] - 0.3, 0.06)
if "s6:bantalan" in AT: g(M.lib("pop"), AT["s6:bantalan"], 0.05)
if "s6:mendorong" in AT: g(M.lib("pop"), AT["s6:mendorong"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)

M.finish(music)
