"""EP05 audio bed (DEVFORGE): synth arps + pad + sub pulse + soft hats + key clicks, SFX on word-anchored beats.
Run from studio/:  python src/scenes/ep05/mix.py   ->  public/audio/ep05/bed.wav  (no voice; length = total)
Deterministic: numpy RandomState with a fixed seed only.
"""
import json
import os
import subprocess
import wave

import numpy as np
from scipy.signal import lfilter, butter

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "timeline.json"), encoding="utf8"))
TOTAL = TL["total"]
VO_END = TL["voEnd"]
N = int(round(TOTAL * SR))
SFX_DIR = "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx"
OUT = "public/audio/ep05/bed.wav"
rng = np.random.RandomState(505)


def norm(s):
    return "".join(c for c in s.lower() if c.isalnum() or c in "%-")


def w(line_id, text, nth=1):
    line = next(l for l in TL["lines"] if l["id"] == line_id)
    hits = [x for x in line["words"] if norm(x["w"]) == norm(text)]
    return hits[nth - 1]["s"]


L = np.zeros(N)
R = np.zeros(N)


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    sig = sig[: N - i]
    gl = gain * np.sqrt(0.5 * (1 - pan))
    gr = gain * np.sqrt(0.5 * (1 + pan))
    L[i : i + len(sig)] += sig * gl
    R[i : i + len(sig)] += sig * gr


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lowpass(x, fc):
    b, a = butter(2, fc / (SR / 2), "low")
    return lfilter(b, a, x)


def env(n, a=0.005, d=0.2):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
    return e


# ---------------- music ----------------
BPM = 110
BEAT = 60 / BPM
STEP = BEAT / 4
# Am - F - C - G (2 bars each)
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
BASS = [45, 41, 48, 43]
BAR = BEAT * 4


def chord_at(t):
    idx = int(t // (BAR * 2)) % 4
    return idx


START = 0.0
# arps (square-ish, filtered), muted in the first 0.6 s lead, thinner during explain
t = START
step = 0
arp_len = int(STEP * SR * 0.9)
while t < TOTAL - 0.2:
    ci = chord_at(t)
    notes = CHORDS[ci] + [CHORDS[ci][0] + 12]
    n = notes[[0, 1, 2, 3, 2, 1, 3, 1][step % 8]] + 12
    f = midi(n)
    tt = np.arange(arp_len) / SR
    sq = np.sign(np.sin(2 * np.pi * f * tt)) * 0.5 + np.sin(2 * np.pi * f * 2 * tt) * 0.2
    sig = sq * env(arp_len, 0.002, 0.07)
    g = 0.05 if t > 0.5 else 0.0
    add(sig, t, g, pan=0.35 if step % 2 else -0.35)
    t += STEP
    step += 1

# pad (detuned saws)
for k in range(int(TOTAL // (BAR * 2)) + 1):
    t0 = k * BAR * 2
    if t0 >= TOTAL:
        break
    n = int(min(BAR * 2, TOTAL - t0) * SR)
    tt = np.arange(n) / SR
    sig = np.zeros(n)
    for note in CHORDS[k % 4]:
        for det in (-0.12, 0.0, 0.12):
            f = midi(note) * 2 ** (det / 12)
            sig += ((tt * f) % 1.0 * 2 - 1) * 0.06
    e = np.minimum(1, tt / 0.6) * np.minimum(1, (n / SR - tt) / 0.6)
    add(lowpass(sig, 1400) * e, t0, 0.55)

# sub pulse on 8ths
t = 0.6
while t < TOTAL - 0.2:
    ci = chord_at(t)
    n = int(0.22 * SR)
    tt = np.arange(n) / SR
    sig = np.sin(2 * np.pi * midi(BASS[ci]) * tt) * env(n, 0.004, 0.12)
    add(sig, t, 0.32)
    t += BEAT / 2

# soft hats on 16ths (noise burst), kick on beats
t = 0.6
i = 0
while t < TOTAL - 0.2:
    n = int(0.03 * SR)
    hat = np.diff(np.concatenate([[0], rng.randn(n)])) * env(n, 0.0005, 0.012)
    add(hat, t, 0.05 if i % 2 else 0.08, pan=0.2)
    if i % 4 == 0:
        m = int(0.18 * SR)
        tt = np.arange(m) / SR
        kick = np.sin(2 * np.pi * (45 + 80 * np.exp(-tt * 30)) * tt) * env(m, 0.001, 0.09)
        add(kick, t, 0.35)
    t += STEP
    i += 1


# key clicks while typing (hook, prompt message, explain keys, outro typing)
def clicks(a, b, rate=11):
    tt = a
    k = 0
    while tt < b:
        n = int(0.012 * SR)
        c = rng.randn(n) * env(n, 0.0003, 0.003)
        add(lowpass(c, 6000), tt, 0.18, pan=(k % 3 - 1) * 0.3)
        tt += 1 / rate * (0.7 + 0.6 * rng.rand())
        k += 1


clicks(0.6, 4.4)
clicks(w("l04", "satu", 1) - 0.6, w("l04", "satu", 1) + 0.3)
clicks(w("l07", "satu"), w("l07", "spesifik") + 0.4)
clicks(w("l12", "alatnya"), w("l12", "ini") - 0.2)


# ---------------- SFX ----------------
def load(name):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", os.path.join(SFX_DIR, name), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


cache = {}


def sfx(name, at, gain):
    if name not in cache:
        cache[name] = load(name)
    add(cache[name], at, gain)


for line, word in [("l02", "ada"), ("l04", "di"), ("l05", "data"), ("l06", "ada"), ("l07", "untuk"), ("l10", "ingat"), ("l11", "roblox"), ("l12", "alatnya")]:
    sfx("whoosh-cinematic.mp3", w(line, word) - 0.15, 0.45)
sfx("error.mp3", w("l01", "asal-asalan", 1) + 0.25, 0.4)
sfx("glitch-1.mp3", w("l01", "hasilnya"), 0.5)
for line, word in [("l02", "clicker"), ("l02", "arcade"), ("l02", "kumpulkan"), ("l02", "side-scroller"), ("l02", "puzzle"), ("l07", "satu"), ("l08", "dua"), ("l08", "tiga"),
                   ("l09", "siapa"), ("l09", "apa"), ("l09", "kapan"), ("l10", "pemeriksaan"), ("l10", "termasuk"), ("l10", "uji"), ("l10", "visual")]:
    sfx("pop.mp3", w(line, word), 0.45)
sfx("whoosh-short.mp3", w("l04", "satu", 1) + 0.2, 0.4)
sfx("glitch-2.mp3", w("l04", "habis"), 0.3)
sfx("ping.mp3", w("l04", "kreditnya") + 0.3, 0.45)
sfx("impact-bass-1.mp3", w("l05", "14%"), 0.55)
sfx("sparkle.mp3", w("l05", "diterbitkan"), 0.4)
sfx("whoosh-short.mp3", w("l06", "edit"), 0.4)
sfx("impact-bass-1.mp3", w("l06", "permanen"), 0.6)
sfx("click.mp3", w("l08", "pilih"), 0.5)
sfx("riser.mp3", w("l10", "ingat") - 2.0, 0.3)
sfx("chime.mp3", w("l10", "jadi"), 0.45)
sfx("whoosh-short.mp3", w("l11", "jadi"), 0.4)
sfx("click-soft.mp3", w("l11", "rapikan"), 0.5)
sfx("click-soft.mp3", w("l11", "rapikan") + 0.25, 0.4)
sfx("chime.mp3", VO_END + 0.6, 0.5)

# ---------------- master ----------------
tt = np.arange(N) / SR
fade = np.minimum(1, tt / 0.3) * np.clip((TOTAL - tt) / 1.6, 0, 1)
L *= fade
R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
g = 10 ** (-6 / 20) / peak
st = np.stack([L * g, R * g], axis=1)
pcm = (np.clip(st, -1, 1) * 32767).astype("<i2")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with wave.open(OUT, "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes(pcm.tobytes())
print(OUT, f"{TOTAL:.2f}s")
