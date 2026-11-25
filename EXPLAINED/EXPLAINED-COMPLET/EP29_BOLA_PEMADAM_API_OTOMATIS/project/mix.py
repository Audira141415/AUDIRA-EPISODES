# EP29 FIRE EXTINGUISHER BALL — NANOFORGE dark microscopy.
# Low electronic pulse, glass celesta, metallic pizz, alarm pad.
# Run from project/: python mix.py
import json, sys
sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(29)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]

BPM = 96; beat = 60 / BPM
scale = [0, 3, 5, 7, 10]  # C minor pentatonic
hz = lambda st, base=261.63: base * 2 ** (st / 12)

# --- synths ---
def celesta(f, dur=0.3, a=0.22):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2*np.pi*f*t)*np.exp(-t*6) + 0.3*np.sin(4*np.pi*f*t)*np.exp(-t*10)
    return x * np.minimum(1, t/0.002) * a

def pad_note(f, dur=2.0, a=0.10):
    t = np.arange(int(dur * SR)) / SR
    env = np.minimum(t/0.3, 1) * np.maximum(1 - (t - dur + 0.5)/0.5, 0)
    return env * (np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*f*1.002*t)) * a

def pizz(f, a=0.28):
    t = np.arange(int(0.18 * SR)) / SR
    return np.exp(-12*t) * np.sin(2*np.pi*f*t) * (1 + 0.3*np.sin(6*np.pi*f*t)) * a

def alarm(f, dur=0.6, a=0.12):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-3*t) * np.minimum(t/0.02, 1)
    return env * np.sin(2*np.pi*f*t + 1.8*np.sin(2*np.pi*4*t)) * a

# --- tracks ---
cel, pno, lo, grv = M.mono(), M.mono(), M.mono(), M.mono()
rng = M.rng

# celesta arpeggios on scene starts
for key in ["s1e","s2","s3","s4","s5","s6","s7","s8"]:
    if key not in K: continue
    t0 = K[key]
    for i in range(4):
        note = hz(scale[rng.integers(5)], 523.25)
        M.lay(cel, celesta(note, 0.3), t0 + i*beat*0.5)

# low pad drones under each scene
for i, key in enumerate(["s2","s3","s4","s5","s6","s7","s8"]):
    if key not in K: continue
    t0 = K[key]
    nxt = f"s{i+3}"
    dur = (K[nxt] if nxt in K else OUT) - t0
    root = hz(scale[i % 5], 130.81)
    seg = min(dur, 4.0)
    for j in range(int(dur / seg) + 1):
        M.lay(lo, pad_note(root, seg), t0 + j*seg)

# pizzicato bass pulse
t0 = K.get("s2", 6.0)
idx = 0
while t0 < OUT - 1:
    root = hz(scale[idx % 5] - 12, 130.81)
    M.lay(grv, pizz(root), t0)
    t0 += beat * 2; idx += 1

# alarm accents at key moments
for w in ["s5:memecahkan", "s4:menyala", "s6:memutus"]:
    if w in AT: M.lay(pno, alarm(880, 0.5), AT[w])

# outro fade celesta
M.lay(cel, celesta(523.25, 0.5), OUT)
M.lay(cel, celesta(659.25, 0.5), OUT + 0.3)
M.lay(cel, celesta(783.99, 0.6), OUT + 0.6)

# stereo
mono = cel + pno + lo + grv
side = M.mono()
side += cel * 0.3
side -= pno * 0.2
music = stereo(mono, side)

# --- SFX ---
for key in ["s2","s3","s4","s5","s6","s7","s8"]:
    if key in K: g(M.lib("whoosh-cinematic"), K[key] - 0.15, 0.07)

if "s5:memecahkan" in AT: g(M.lib("impact-bass-1"), AT["s5:memecahkan"], 0.08)
if "s3:melempar" in AT: g(M.lib("whoosh-short"), AT["s3:melempar"], 0.05)
if "s4:menyala" in AT: g(M.lib("riser"), AT["s4:menyala"] - 0.4, 0.06)
if "s6:monoamonium" in AT: g(M.lib("click"), AT["s6:monoamonium"], 0.05)
if "s3:seribu" in AT: g(M.lib("ping"), AT["s3:seribu"], 0.04)
if "s8:standar" in AT: g(M.lib("chime"), AT["s8:standar"], 0.04)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)

M.finish(music)
