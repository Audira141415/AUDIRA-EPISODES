"""EP05 Galata audio bed (music + ambience + SFX, no voice). Run from project/:
    python src/scenes/galata/mix.py
Writes public/audio/bed.wav, length = timeline total, 48 kHz stereo.

Identity for this episode: maqam Hijaz on D (D Eb F# G A Bb C), slow 72 bpm. A low D/A drone, a
qanun-like plucked arpeggio (Karplus-Strong), a breathy ney line in the calm parts, a soft frame drum
that only arrives with the chain and grows a little in the payoff, sea wash under the map, wood creak
and rope during the hauling. Reverent, no singing. Every cue is anchored to a spoken word.
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
rng = np.random.default_rng(1453)


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


def hz(semis, base=146.83):  # D3
    return base * 2 ** (semis / 12)


# Hijaz on D: D Eb F# G A Bb C D
HIJAZ = [0, 1, 4, 5, 7, 8, 10, 12]

# ---------------- drone (D2 + A2, slow beating, fades with the parts) ----------------
drone = np.zeros(N)
for f, a in [(hz(-12), 0.5), (hz(-5), 0.28), (hz(0), 0.16)]:
    drone += a * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.07 * t))
    drone += a * 0.35 * np.sin(2 * np.pi * f * 1.003 * t)
drone = lowpass(drone, 900)
dg = env_lin([(0, 0), (0.4, 0.5), (4.3, 0.5), (5.0, 0.32), (part("main")["start"], 0.36), (part("explanation")["start"], 0.3),
              (part("payoff")["start"] - 2, 0.32), (part("payoff")["start"], 0.45), (part("outro")["start"], 0.32), (TOTAL - 0.5, 0.2), (TOTAL, 0)])
add(drone * dg * 0.22, 0, pan=0)

# ---------------- qanun-like plucks (Karplus-Strong) ----------------
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


BEAT = 60 / 72
patterns = {
    "calm": [0, 7, 4, 5, 7, 4, 1, 0],
    "move": [0, 4, 7, 12, 10, 8, 7, 4],
    "rise": [7, 8, 10, 12, 13, 12, 10, 8],
}


def arpeggio(start, end, pat, gain, step=0.5, octave=0):
    k = 0
    tt = start
    seq = patterns[pat]
    while tt < end:
        s = seq[k % len(seq)] + octave
        add(pl(s), tt, gain * (0.85 + 0.15 * ((k % 4) == 0)), pan=(-0.35 if k % 2 else 0.35))
        k += 1
        tt += BEAT * step


arpeggio(0.6, part("context")["end"], "calm", 0.16, step=1.0)
arpeggio(part("main")["start"], part("main")["end"], "calm", 0.15, step=0.5)
arpeggio(part("explanation")["start"], W("l10", "layarnya"), "move", 0.15, step=0.5)
arpeggio(W("l10", "layarnya"), part("explanation")["end"], "move", 0.17, step=0.5, octave=12)
arpeggio(part("payoff")["start"], W("l12", "jatuh", 1, "e"), "rise", 0.18, step=0.5)
arpeggio(W("l13", "trik"), part("payoff")["end"], "calm", 0.15, step=1.0, octave=12)
arpeggio(part("outro")["start"], TOTAL - 1.0, "calm", 0.12, step=1.0)

# ---------------- ney (breathy sine + noise, vibrato) phrases ----------------
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


ney([(7, 1.6), (8, 0.8), (7, 0.8), (4, 1.6), (1, 1.2), (0, 2.2)], part("context")["start"] + 0.3)
ney([(0, 1.0), (1, 0.8), (4, 0.8), (5, 1.2), (7, 2.4)], W("l07", "mehmed"))
ney([(12, 1.4), (10, 0.7), (8, 0.7), (7, 1.4), (4, 1.0), (5, 0.8), (7, 2.6)], W("l13", "trik"))
ney([(7, 1.2), (4, 0.8), (1, 0.8), (0, 3.0)], part("outro")["start"])

# ---------------- frame drum (daf): soft, enters with the chain, grows in the payoff ----------------
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


drum(W("l05", "ditutup"), part("main")["end"] + 0.3, 0.08)
drum(W("l09", "kapal-kapal"), part("explanation")["end"], 0.09)
drum(part("payoff")["start"], W("l12", "jatuh", 1, "e"), 0.13)

# ---------------- ambience: sea wash, wood creak + rope during the hauling ----------------
sea = lowpass(rng.normal(0, 1, N), 600) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t) ** 2)
sg = env_lin([(0, 0.0), (0.5, 0.05), (part("explanation")["start"], 0.05), (W("l08", "setinggi"), 0.025), (W("l11", "meluncur"), 0.03),
              (W("l11", "meluncur") + 2, 0.06), (part("outro")["start"], 0.04), (TOTAL, 0)])
L += sea * sg
R += np.roll(sea, 2400) * sg


def creak():
    n = int(0.7 * SR)
    x = np.arange(n) / SR
    f = 180 + 60 * np.sin(2 * np.pi * 1.3 * x)
    ph = 2 * np.pi * np.cumsum(f) / SR
    grit = (np.sin(ph) > 0.6).astype(float) * 0.6 + np.sin(ph) * 0.4
    return bandpass(grit, 200, 2400) * np.sin(np.pi * x / 0.7) ** 2


CR = creak()
tt = W("l09", "dinaikkan")
k = 0
while tt < part("payoff")["start"]:
    add(CR, tt, 0.06, pan=(-0.4 if k % 2 else 0.4))
    tt += 1.7 + 0.4 * (k % 3)
    k += 1

# ---------------- SFX from the shared AUDIRA library ----------------
SFX_DIRS = [os.path.normpath(os.path.join(os.getcwd(), "../../../shared/assets/sfx")), "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx"]
SFX_DIR = next(d for d in SFX_DIRS if os.path.isdir(d))


def load(name):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(SFX_DIR, name + ".mp3"), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)


CUES = [
    ("impact-bass-1", 0.62, 0.30, 0),  # hook: "Pelabuhan dikunci rantai besi"
    ("whoosh-cinematic", W("l01", "bukit", 1, "e") - 0.2, 0.22, -0.2),  # rewind to the city
    ("pop", W("l02", "1204") - 0.05, 0.18, 0.2),
    ("pop", W("l03", "mehmed"), 0.16, -0.3),
    ("whoosh-short", W("l04", "hadis") - 0.25, 0.2, 0),
    ("whoosh-cinematic", part("main")["start"] - 0.4, 0.22, 0.2),  # dive to the chain
    ("impact-bass-1", W("l05", "rantai"), 0.18, 0),
    ("click", W("l06", "tertahan"), 0.25, 0),  # padlock
    ("impact-bass-1", W("l06", "tertahan") + 0.05, 0.14, 0),
    ("whoosh-short", W("l07", "memutarinya") - 0.2, 0.2, -0.2),
    ("sparkle", W("l08", "dilumasi"), 0.12, 0.3),  # grease sheen
    ("pop", W("l08", "setinggi"), 0.14, 0.2),
    ("whoosh-short", W("l10", "layarnya"), 0.16, -0.2),  # sails up
    ("riser", W("l10", "seolah") - 0.3, 0.16, 0),
    ("impact-bass-1", W("l11", "meluncur"), 0.24, 0),
    ("whoosh-cinematic", W("l11", "rantai") - 0.5, 0.2, 0.3),
    ("whoosh-short", W("l13", "tahun") - 0.2, 0.18, -0.2),  # Venice card
    ("chime", TL["voEnd"] + 0.55, 0.22, 0),  # outro card
]
for name, at, gain, pan in CUES:
    add(load(name), at, gain, pan)

# ---------------- master: soft limiter, fades, write ----------------
fade = np.minimum(1, t / 0.3) * np.minimum(1, (TOTAL - t) / 1.2)
st = np.stack([L * fade, R * fade], axis=1)
peak = np.max(np.abs(st))
st = st / max(peak, 1e-9) * 0.75
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
