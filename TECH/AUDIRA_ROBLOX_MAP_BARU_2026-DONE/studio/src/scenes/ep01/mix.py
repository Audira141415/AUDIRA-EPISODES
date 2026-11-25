"""EP01 audio bed (BRICKCRAFT): playful marimba + pluck bass + soft kit, synthesized brick clicks,
library SFX on key words. No voice. Run from studio/:  python src/scenes/ep01/mix.py
Writes public/audio/ep01/bed.wav (48 kHz stereo, length = timeline total). All event times come
from word times in timeline.json (never absolute seconds)."""
import json
import os
import re
import subprocess

import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "timeline.json"), encoding="utf8"))
TOTAL = TL["total"]
VO_END = TL["voEnd"]
SFX_DIR = os.path.abspath(os.path.join(HERE, "../../../../../shared/assets/sfx"))
OUT = os.path.join("public", "audio", "ep01", "bed.wav")
WORDS = [wd for l in TL["lines"] for wd in l["words"]]
rng = np.random.default_rng(101)


def norm(s):
    return re.sub(r"[.,:;!?]+$", "", s.lower())


def w(text, nth=1):
    n = 0
    for x in WORDS:
        if norm(x["w"]) == norm(text):
            n += 1
            if n == nth:
                return x["s"]
    raise KeyError(f"{text} #{nth}")


N = int(TOTAL * SR) + 1
L = np.zeros(N)
R = np.zeros(N)


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0:
        return
    s = sig[: max(0, N - i)] * gain
    gl, gr = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    L[i : i + len(s)] += s * gl
    R[i : i + len(s)] += s * gr


def tt(d):
    return np.arange(int(d * SR)) / SR


def marimba(f, d=0.45):
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + 0.28 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t * 26)) * (1 - np.exp(-t * 900))


def pluck_bass(f, d=0.6):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return x * np.exp(-t * 4.5) * (1 - np.exp(-t * 600))


def kick():
    t = tt(0.25)
    f = 48 + 90 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14)


def hat(d=0.05):
    x = rng.standard_normal(int(d * SR))
    x = np.diff(np.concatenate([[0], x]))
    return x * np.exp(-tt(d) * 70) * 0.5


def brick_click():
    """Two plastic clicks (stud snapping in) a few ms apart."""
    out = np.zeros(int(0.06 * SR))
    for k, off in enumerate((0, 0.011)):
        n = int(0.02 * SR)
        x = rng.standard_normal(n)
        x = np.diff(np.concatenate([[0], x]))
        t = np.arange(n) / SR
        tone = np.sin(2 * np.pi * (2400 + 600 * k) * t)
        sig = (0.6 * x + 0.5 * tone) * np.exp(-t * 320)
        i = int(off * SR)
        out[i : i + n] += sig * (1 if k == 0 else 0.6)
    return out


def pad(freqs, d, level=1.0):
    t = tt(d)
    x = sum(np.sin(2 * np.pi * f * t + p) for f, p in zip(freqs, rng.uniform(0, 6, len(freqs))))
    env = np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8)
    return x * env * level / len(freqs)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------- sections (word-anchored) ----------
T_MELEDAK = w("meledak")
T_DARK = w("Tapi")
T_BEDA = w("beda")
T_BIKIN3 = w("Bikin", 3)

BPM = 112
beat = 60 / BPM
BRIGHT = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]]  # C Am F G
DARK = [[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]]  # Am F Dm E
ARP = [0, 2, 1, 3, 2, 1, 3, 2]

t = 0.35
bar = 0
end_music = VO_END + 2.6
while t < end_music:
    dark = T_DARK - 0.2 <= t < T_BIKIN3 - 0.1
    chords = DARK if dark else BRIGHT
    ch = chords[bar % 4]
    energy = 0.6 if t < T_MELEDAK else 1.0
    for k in range(8):
        tk = t + k * beat / 2
        if tk >= end_music:
            break
        if dark and k % 2 == 1:
            continue
        note = ch[ARP[k]] + (-12 if dark else 12)
        add(marimba(hz(note)), tk, 0.16 * (0.8 if dark else 1.0), pan=0.35 if k % 2 else -0.35)
        if not dark and k % 2 == 1:
            add(hat(), tk, 0.05 * energy, pan=0.4)
    add(pluck_bass(hz(ch[0] - 24)), t, 0.32)
    add(pluck_bass(hz(ch[0] - 24)), t + 2 * beat, 0.24)
    if energy > 0.9 and not dark:
        add(kick(), t, 0.3)
        add(kick(), t + 2 * beat, 0.24)
    add(pad([hz(n - 12) for n in ch], 4 * beat + 0.4, 0.05 if not dark else 0.08), t, 1.0)
    t += 4 * beat
    bar += 1

# final ringing chord into the outro card
add(pad([hz(n) for n in (48, 55, 60, 64, 67)], TOTAL - VO_END, 0.14), VO_END - 0.2)
add(marimba(hz(72), 1.5), VO_END + 0.6, 0.2)

# ---------- synthesized brick clicks on the build beats ----------
def clicks(t0, t1, n, gain=0.18):
    for i in range(n):
        add(brick_click(), t0 + (t1 - t0) * i / max(1, n - 1), gain, pan=float(rng.uniform(-0.5, 0.5)))


clicks(w("tulis"), w("merakitnya") + 0.5, 9)
clicks(w("sekitar"), w("terbit"), 14, 0.12)
clicks(w("Menurut"), w("70.000", 2), 16, 0.1)
clicks(w("naik"), w("lipat"), 4, 0.2)
clicks(w("80%"), w("80%") + 1.0, 10, 0.08)
clicks(w("bermunculan"), w("rilis"), 12, 0.14)
clicks(w("Sekarang"), w("beda"), 8, 0.16)


# ---------- library SFX ----------
def sfx(name):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", os.path.join(SFX_DIR, name), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        capture_output=True,
        check=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


CUES = [
    ("sparkle.mp3", w("Lebih") - 0.1, 0.3),
    ("impact-bass-1.mp3", w("70.000"), 0.35),
    ("typing.mp3", w("tulis") - 0.1, 0.22),
    ("click.mp3", w("merakitnya"), 0.3),
    ("pop.mp3", w("Juli"), 0.3),
    ("pop.mp3", w("9.000"), 0.28),
    ("ping.mp3", w("71%"), 0.25),
    ("whoosh-cinematic.mp3", w("meledak") - 0.5, 0.35),
    ("impact-bass-1.mp3", w("meledak"), 0.45),
    ("pop.mp3", w("500.000") - 0.3, 0.3),
    ("pop.mp3", w("70.000", 2) - 0.3, 0.3),
    ("whoosh-cinematic.mp3", w("ledakan") - 0.6, 0.3),
    ("whoosh-short.mp3", w("Dan", 4) - 0.2, 0.26),
    ("sparkle.mp3", w("80%"), 0.28),
    ("pop.mp3", w("Break") - 0.2, 0.26),
    ("pop.mp3", w("Huss") - 0.2, 0.26),
    ("chime.mp3", w("tembus"), 0.24),
    ("click-soft.mp3", w("turun"), 0.3),
    ("ping.mp3", w("3%"), 0.24),
    ("glitch-1.mp3", w("gelapnya") - 0.1, 0.22),
    ("whoosh.mp3", w("menjiplak"), 0.26),
    ("glitch-2.mp3", w("bermunculan"), 0.18),
    ("sparkle.mp3", w("beda"), 0.32),
    ("whoosh-cinematic.mp3", w("bongkar") - 0.6, 0.28),
    ("chime.mp3", w("Ikuti"), 0.26),
]
cache = {}
for name, at, g in CUES:
    if name not in cache:
        cache[name] = sfx(name)
    add(cache[name], at, g, pan=0.0)

# ---------- soft room tone ----------
room = rng.standard_normal(N)
room = np.convolve(room, np.ones(64) / 64, mode="same") * 0.006
L += room
R += np.roll(room, 997)

# fades and level (~ -24 dBFS RMS so the bed sits well under the -16 LUFS voice)
fade = np.ones(N)
fi = int(0.3 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fo = int(1.2 * SR)
fade[-fo:] = np.linspace(1, 0, fo)
L *= fade
R *= fade
st = np.stack([L, R], axis=1)
rms = np.sqrt(np.mean(st**2))
st *= (10 ** (-24 / 20)) / max(rms, 1e-9)
peak = np.max(np.abs(st))
if peak > 0.89:
    st *= 0.89 / peak

os.makedirs(os.path.dirname(OUT), exist_ok=True)
pcm = (np.clip(st, -1, 1) * 32767).astype("<i2")
import wave

with wave.open(OUT, "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes(pcm.tobytes())
print(f"bed: {OUT} {len(st) / SR:.2f}s rms -24 dBFS peak {20 * np.log10(np.max(np.abs(st))):.1f} dBFS")
