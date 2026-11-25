"""EP02 audio bed (DATAPHYSICAL): minimal museum pulse + machined metal ticks + soft pad,
SFX from shared/assets/sfx on word-anchored beats. No voice. Run from studio/:
    python src/scenes/ep02/mix.py
Writes public/audio/ep02/bed.wav (48 kHz stereo, length = timeline total)."""
import json
import os
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
STUDIO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SFX_DIR = os.path.abspath(os.path.join(STUDIO, "..", "..", "shared", "assets", "sfx"))
OUT = os.path.join(STUDIO, "public", "audio", "ep02", "bed.wav")
SR = 48000

tl = json.load(open(os.path.join(HERE, "timeline.json"), encoding="utf8"))
TOTAL = tl["total"]
VO_END = tl["voEnd"]
N = int(TOTAL * SR)
words = [w for l in tl["lines"] for w in l["words"]]


def norm(w):
    return w.lower().rstrip(".,:;!?")


def W(text, n=1):
    k = 0
    for w in words:
        if norm(w["w"]) == norm(text):
            k += 1
            if k == n:
                return w["s"]
    sys.exit(f"word not found: {text} #{n}")


rng = np.random.default_rng(2802)
t = np.arange(N) / SR
L = np.zeros(N)
R = np.zeros(N)


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    L[i : i + len(sig)] += sig * gain * (1 - max(0, pan))
    R[i : i + len(sig)] += sig * gain * (1 + min(0, pan))


# ---- pad: A minor add9, slow swell, two detuned voices per note ----
pad = np.zeros(N)
for f, g in [(110.0, 0.5), (164.81, 0.35), (261.63, 0.25), (246.94, 0.18), (329.63, 0.12)]:
    for d in (-0.6, 0.6):
        pad += g * np.sin(2 * np.pi * (f + d) * t + rng.uniform(0, 6))
lfo = 0.75 + 0.25 * np.sin(2 * np.pi * t / 11.0)
env = np.clip(t / 3.0, 0, 1) * np.clip((TOTAL - t) / 3.0, 0, 1)
pad *= 0.05 * lfo * env
L += pad
R += np.roll(pad, 240)

# ---- pulse: 96 BPM soft sine kick + metal ticks on eighths ----
BPM = 96
beat = 60 / BPM
k_len = int(0.28 * SR)
kt = np.arange(k_len) / SR
kick = np.sin(2 * np.pi * (48 + 60 * np.exp(-kt * 30)) * kt) * np.exp(-kt * 14)
tk_len = int(0.09 * SR)
tt = np.arange(tk_len) / SR


def tick(freq):
    n = rng.standard_normal(tk_len) * np.exp(-tt * 70)
    ring = np.sin(2 * np.pi * freq * tt) * np.exp(-tt * 45)
    return 0.35 * n * 0.25 + ring * 0.6


# pulse density follows the story: sparse hook, full in main/explain, thins in payoff, stops at outro card
def density(x):
    if x < W("Data"):
        return 0.5
    if x < W("Tapi"):
        return 1.0
    if x < W("Jadi"):
        return 0.9
    if x < W("Soal"):
        return 0.6
    return 0.35


x = 1.0
step = 0
while x < VO_END + 0.4:
    d = density(x)
    if step % 2 == 0:
        add(kick, x, 0.22 * d)
    if d >= 0.6 or step % 2 == 0:
        add(tick(3100 + 400 * (step % 3)), x, 0.07 * d, pan=0.35 if step % 2 else -0.35)
    if step % 8 == 7 and d >= 0.9:
        add(tick(5200), x + beat / 4, 0.05, pan=0.6)
    x += beat / 2
    step += 1

# ---- SFX ----
cache = {}


def sfx(name):
    if name in cache:
        return cache[name]
    p = os.path.join(SFX_DIR, name + ".mp3")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    cache[name] = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    return cache[name]


CUES = [
    ("impact-bass-1", W("Hampir") - 0.05, 0.30, 0.0),
    ("click-soft", W("28%"), 0.35, -0.2),
    ("click-soft", W("28%") + 0.5, 0.3, 0.2),
    ("click-soft", W("28%") + 1.0, 0.3, -0.1),
    ("pop", W("90"), 0.3, 0.0),
    ("whoosh-cinematic", W("Artinya") - 0.1, 0.32, 0.3),
    ("riser", W("Map") - 0.9, 0.22, 0.0),
    ("impact-bass-1", W("menyalip"), 0.26, 0.0),
    ("whoosh-cinematic", W("breakout") + 0.3, 0.3, 0.3),
    ("pop", W("Grow"), 0.25, -0.3),
    ("pop", W("Steal"), 0.25, 0.3),
    ("sparkle", W("20"), 0.28, 0.0),
    ("whoosh-cinematic", W("sekaligus") + 0.3, 0.3, 0.3),
    ("typing", W("Dalam"), 0.18, -0.4),
    ("chime", W("1,7"), 0.22, 0.0),
    ("ping", W("devex"), 0.2, -0.3),
    ("riser", W("totalnya") - 0.5, 0.2, 0.0),
    ("impact-bass-1", W("5"), 0.3, 0.0),
    ("whoosh-short", W("Tapi") - 0.15, 0.32, -0.3),
    ("impact-bass-1", W("65,7"), 0.36, 0.0),
    ("pop", W("10,8"), 0.26, 0.0),
    ("pop", W("1,4"), 0.22, 0.0),
    ("click", W("1.500"), 0.3, 0.0),
    ("whoosh-short", W("Jadi"), 0.25, 0.3),
    ("sparkle", W("83%"), 0.3, 0.0),
    ("whoosh-short", W("Yang", 3), 0.25, -0.3),
    ("click-soft", W("tapi", 3) + 0.3, 0.25, 0.0),
    ("click-soft", W("tapi", 3) + 1.0, 0.25, 0.2),
    ("click-soft", W("tapi", 3) + 1.8, 0.25, -0.2),
    ("chime", W("betah"), 0.26, 0.0),
    ("whoosh-cinematic", W("Soal"), 0.25, 0.0),
    ("impact-bass-1", VO_END + 0.6, 0.3, 0.0),
]
for name, at, gain, pan in CUES:
    add(sfx(name), at, gain * 1.6, pan)

mix = np.stack([L, R], axis=1)
fade = int(1.2 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
peak = np.abs(mix).max()
mix *= 0.35 / peak  # ~15 dB under the voice after -5 dB + sidechain; headroom; the voice sits on top after sidechain
os.makedirs(os.path.dirname(OUT), exist_ok=True)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
import wave

with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"bed.wav {TOTAL:.2f}s peak-norm 0.35, {len(CUES)} cues -> {OUT}")
