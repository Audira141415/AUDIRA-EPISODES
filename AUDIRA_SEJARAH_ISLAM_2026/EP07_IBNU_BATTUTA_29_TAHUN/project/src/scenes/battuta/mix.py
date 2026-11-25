"""EP07 Battuta audio bed (music + ambience + SFX, no voice). Run from project/:
    python src/scenes/battuta/mix.py
Writes public/audio/bed.wav, length = timeline total, 48 kHz stereo.

Identity for this episode: maqam Rast on C (C D E F G A Bb, the half-flat E and B rounded to the
nearest semitone), a travelling 66 bpm. An oud-like low pluck walks under the journey, a ney opens
Tangier and returns at the payoff, a light riq only while the route moves, sea wash at the Sumatra
coast, wind on the long flights and a soft thunder roll at the storm. Reverent, no singing. Every
cue is anchored to a spoken word.
"""
import json
import os
import subprocess

import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "timeline.json"), encoding="utf8"))
TOTAL = TL["total"]
N = int(round(TOTAL * SR))
rng = np.random.default_rng(1325)


def norm(s):
    return "".join(ch for ch in s.lower() if ch.isalnum() or ch == "-")


def W(line, text, nth=1, edge="s"):
    l = next(x for x in TL["lines"] if x["id"] == line)
    hits = [w for w in l["words"] if norm(w["w"]) == norm(text)]
    return hits[nth - 1][edge]


def part(pid):
    return next(p for p in TL["parts"] if p["id"] == pid)


t = np.arange(N) / SR
L = np.zeros(N)
R = np.zeros(N)


def env_lin(points):
    """Piecewise-linear gain curve from [(time, gain), ...]."""
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    gl, gr = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    L[i : i + len(sig)] += sig * gain * gl
    R[i : i + len(sig)] += sig * gain * gr


def lowpass(x, cutoff):
    # one-pole low-pass, vectorised enough via scipy if present
    from scipy.signal import butter, lfilter

    b, a = butter(2, cutoff / (SR / 2))
    return lfilter(b, a, x)


def bandpass(x, lo, hi):
    from scipy.signal import butter, lfilter

    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band")
    return lfilter(b, a, x)


def hz(semis, base=130.81):  # C3
    return base * 2 ** (semis / 12)


# Rast on C (12-TET approximation)
RAST = [0, 2, 4, 5, 7, 9, 10, 12]

# ---------------- drone (C2 + G2) ----------------
drone = np.zeros(N)
for f, a in [(hz(-12), 0.5), (hz(-5), 0.26), (hz(0), 0.12)]:
    drone += a * np.sin(2 * np.pi * f * t + 0.25 * np.sin(2 * np.pi * 0.05 * t))
    drone += a * 0.3 * np.sin(2 * np.pi * f * 1.004 * t)
drone = lowpass(drone, 800)
dg = env_lin([(0, 0), (0.4, 0.45), (part("context")["start"], 0.35), (part("main")["start"], 0.38), (part("explanation")["start"], 0.32),
              (part("payoff")["start"], 0.46), (part("outro")["start"], 0.34), (TOTAL - 0.5, 0.2), (TOTAL, 0)])
add(drone * dg * 0.22, 0)

def pluck(freq, dur=1.6, bright=0.5):
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, p) * bright + rng.uniform(-1, 1, p) * (1 - bright) * 0.3
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    att = np.minimum(1, np.arange(n) / (0.002 * SR))
    return out * att


PLUCK_CACHE = {}


def pl(semis, dur=1.6):
    key = (semis, dur)
    if key not in PLUCK_CACHE:
        PLUCK_CACHE[key] = pluck(hz(semis), dur)
    return PLUCK_CACHE[key]


BEAT = 60 / 66
patterns = {
    "walk": [0, 4, 7, 4, 5, 4, 2, 0],
    "road": [0, 2, 4, 7, 9, 7, 5, 4],
    "town": [7, 5, 4, 2, 4, 5, 7, 4],
    "rise": [7, 9, 10, 12, 14, 12, 10, 9],
}


def arpeggio(start, end, pat, gain, step=0.5, octave=0):
    k = 0
    tt = start
    seq = patterns[pat]
    while tt < end:
        s = seq[k % len(seq)] + octave
        add(pl(s - 12, 2.2), tt, gain * (0.85 + 0.15 * ((k % 4) == 0)), pan=(-0.3 if k % 2 else 0.3))
        k += 1
        tt += BEAT * step


arpeggio(0.6, part("context")["end"], "walk", 0.2, step=1.0)
arpeggio(part("main")["start"], part("main")["end"], "road", 0.19, step=0.5)
arpeggio(part("explanation")["start"], part("explanation")["end"], "town", 0.17, step=1.0, octave=12)
arpeggio(part("payoff")["start"], part("payoff")["end"], "rise", 0.19, step=0.5)
arpeggio(part("outro")["start"], TOTAL - 1.0, "walk", 0.14, step=1.0, octave=12)

def ney(notes, start):
    tt = start
    for semis, dur in notes:
        n = int(dur * SR)
        x = np.arange(n) / SR
        f = hz(semis + 12)
        vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * x) * np.minimum(1, x / 0.4)
        ph = 2 * np.pi * np.cumsum(f * vib) / SR
        tone = np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
        breath = bandpass(rng.normal(0, 1, n), f * 0.8, f * 2.5) * 0.35
        e = np.minimum(1, x / 0.18) * np.minimum(1, (dur - x) / 0.35)
        add((tone + breath) * e, tt, 0.05, pan=0.15)
        tt += dur


ney([(7, 1.4), (9, 0.7), (7, 0.7), (5, 1.4), (4, 1.0), (2, 0.8), (0, 2.4)], W("l02", "namanya"))
ney([(0, 1.0), (2, 0.8), (4, 0.8), (7, 2.0)], W("l07", "ibu"))
ney([(12, 1.3), (10, 0.7), (9, 0.7), (7, 1.4), (5, 1.0), (4, 0.8), (7, 2.8)], W("l10", "menurut"))
ney([(7, 1.2), (4, 0.8), (2, 0.8), (0, 3.0)], part("outro")["start"])

# ---------------- riq: only while the route moves ----------------
def daf(strong=True):
    n = int(0.5 * SR)
    x = np.arange(n) / SR
    body = np.sin(2 * np.pi * (70 if strong else 110) * x * (1 - 0.3 * x)) * np.exp(-x * (9 if strong else 16))
    skin = bandpass(rng.normal(0, 1, n), 1500, 6000) * np.exp(-x * 40) * 0.25
    return body + skin


D1, D2 = daf(True), daf(False)


def drum(start, end, gain):
    tt = start
    k = 0
    while tt < end:
        pos = k % 8
        if pos in (0, 3):
            add(D1, tt, gain)
        elif pos in (4, 6):
            add(D2, tt, gain * 0.6, pan=0.2)
        k += 1
        tt += BEAT / 2


drum(W("l04", "jalannya"), W("l05", "badai", 1, "e"), 0.07)
drum(W("l05", "ia"), part("main")["end"] + 0.3, 0.07)
drum(W("l11", "seluruh"), part("payoff")["end"], 0.09)

# ---------------- ambience: sea at the coast, wind on the flights, thunder at the storm ----------------
sea = lowpass(rng.normal(0, 1, N), 600) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t) ** 2)
sg = env_lin([(0, 0.0), (0.5, 0.06), (W("l02", "tahun"), 0.06), (W("l02", "tangier"), 0.015), (W("l05", "lalu"), 0.02),
              (W("l06", "warga"), 0.06), (W("l07", "tamu"), 0.03), (W("l10", "kota"), 0.03), (part("outro")["start"], 0.025), (TOTAL, 0)])
L += sea * sg
R += np.roll(sea, 2400) * sg
wind = bandpass(rng.normal(0, 1, N), 300, 1800) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * t) ** 2)
wg = env_lin([(0, 0), (W("l02", "tahun") - 0.3, 0), (W("l02", "tahun") + 1.2, 0.05), (W("l02", "tangier"), 0.0),
              (W("l03", "bulan") - 1, 0), (W("l03", "kemudian"), 0.035), (W("l04", "lurus") + 1, 0),
              (W("l10", "kota"), 0), (W("l10", "sumatra"), 0.03), (W("l11", "kilometer"), 0.03), (W("l11", "kilometer") + 1.5, 0), (TOTAL, 0)])
L += wind * wg
R += np.roll(wind, 3100) * wg


def thunder():
    n = int(2.6 * SR)
    x = np.arange(n) / SR
    return lowpass(rng.normal(0, 1, n), 160) * np.exp(-x * 1.6) * np.minimum(1, x / 0.05) * 3


add(thunder(), W("l05", "hancur") - 0.1, 0.22)
add(thunder(), W("l05", "badai") + 0.2, 0.14, pan=0.3)

# ---------------- SFX from the shared AUDIRA library ----------------
SFX_DIRS = [os.path.normpath(os.path.join(os.getcwd(), "../../../shared/assets/sfx")), "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx"]
SFX_DIR = next(d for d in SFX_DIRS if os.path.isdir(d))


def load(name):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(SFX_DIR, name + ".mp3"), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)


CUES = [
    ("impact-bass-1", 0.62, 0.22, 0),  # hook
    ("pop", W("l01", "kota", 1, "e") - 0.1, 0.14, 0.2),  # the town sign
    ("whoosh-cinematic", W("l02", "tahun") - 0.3, 0.22, -0.2),  # flight west
    ("pop", W("l02", "tangier") - 0.3, 0.16, 0.2),  # Tangier pops up
    ("click-soft", W("l03", "haji"), 0.2, 0),  # 16 months chip
    ("whoosh-short", W("l03", "ia") - 0.2, 0.18, 0.2),
    ("pop", W("l04", "timur"), 0.12, -0.2),
    ("pop", W("l04", "asia"), 0.12, 0.2),
    ("pop", W("l04", "delhi"), 0.15, 0),
    ("whoosh-short", W("l05", "tiongkok") - 0.3, 0.18, -0.2),
    ("impact-bass-1", W("l05", "hancur"), 0.2, 0),
    ("whoosh-cinematic", W("l05", "ia") - 0.3, 0.18, 0.2),
    ("whoosh-cinematic", W("l05", "tiba") - 0.4, 0.2, -0.2),  # back down to Sumatra
    ("pop", W("l07", "sumutra"), 0.14, 0),
    ("pop", W("l07", "tiga"), 0.12, -0.2),  # three paper suns
    ("pop", W("l07", "hari"), 0.12, 0),
    ("pop", W("l07", "supaya"), 0.12, 0.2),
    ("chime", W("l09", "asar"), 0.12, 0),
    ("riser", W("l10", "memberi") - 0.6, 0.14, 0),
    ("impact-bass-1", W("l10", "sumatra"), 0.2, 0),  # the island is named
    ("sparkle", W("l10", "sumatra") + 0.1, 0.1, 0.2),
    ("whoosh-cinematic", W("l11", "seluruh") - 0.4, 0.2, 0),
    ("chime", TL["voEnd"] + 0.55, 0.22, 0),  # outro card
]
for name, at, gain, pan in CUES:
    add(load(name), at, gain, pan)

# ---------------- master: soft limiter, fades, write ----------------
fade = np.minimum(1, t / 0.3) * np.minimum(1, (TOTAL - t) / 1.2)
st = np.stack([L * fade, R * fade], axis=1)
peak = np.max(np.abs(st))
st = st / max(peak, 1e-9) * 0.29  # bed sits about -26 LUFS: ~15 dB under the voice after the -5 dB and ducking
st = np.tanh(st * 1.2) / np.tanh(1.2)
os.makedirs("public/audio", exist_ok=True)
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
import wave

with wave.open("public/audio/bed.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"bed.wav {TOTAL:.3f}s, peak {peak:.3f} -> normalised")
