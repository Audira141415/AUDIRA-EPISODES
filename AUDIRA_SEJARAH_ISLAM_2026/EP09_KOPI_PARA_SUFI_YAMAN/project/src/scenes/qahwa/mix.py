"""EP09 Qahwa audio bed (music + ambience + SFX, no voice). Run from project/:
    python src/scenes/qahwa/mix.py
Writes public/audio/bed.wav, length = timeline total, 48 kHz stereo.

Identity for this episode: a Yemeni Sufi night. A low D drone with a soft fifth, an oud-like pluck in
maqam Hijaz on D, 72 bpm, slow and spacious; a breathy ney over the zawiyah and the outro; a gentle
daf pulse only while the Sufis sit in the circle (main part). Foley from the tabletop: beans ticking
onto wood, coffee pouring, a brass stamp, a small fire, wooden word tiles, water for the flood.
Reverent, no singing. Every cue is anchored to a spoken word.
"""
import json
import os
import subprocess
import wave

import numpy as np
from scipy.signal import butter, lfilter

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "timeline.json"), encoding="utf8"))
TOTAL = TL["total"]
VO_END = TL["voEnd"]
N = int(round(TOTAL * SR))
rng = np.random.default_rng(1511)
WORDS = [w for l in TL["lines"] for w in l["words"]]


def norm(s):
    return "".join(ch for ch in s.lower() if ch.isalnum() or ch == "-")


def W(text, nth=1, edge="s"):
    hits = [w for w in WORDS if norm(w["w"]) == norm(text)]
    return hits[nth - 1][edge]


def part(pid):
    return next(p for p in TL["parts"] if p["id"] == pid)


t = np.arange(N) / SR
L = np.zeros(N)
R = np.zeros(N)


def env_lin(points):
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N or gain == 0:
        return
    sig = sig[: N - i]
    gl, gr = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    L[i : i + len(sig)] += sig * gain * gl
    R[i : i + len(sig)] += sig * gain * gr


def lowpass(x, cutoff, order=2):
    b, a = butter(order, cutoff / (SR / 2))
    return lfilter(b, a, x)


def bandpass(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band")
    return lfilter(b, a, x)


def hz(semis, base=174.61):  # F3
    return base * 2 ** (semis / 12)



BEAT = 60 / 72


def hz(semis, base=146.83):  # D3
    return base * 2 ** (semis / 12)


# ---------------- drone: D1 + A1, slow breathing ----------------
drone = np.zeros(N)
for f, a in [(hz(-24), 0.5), (hz(-17), 0.28), (hz(-12), 0.12)]:
    drone += a * np.sin(2 * np.pi * f * t + 0.2 * np.sin(2 * np.pi * 0.04 * t))
    drone += a * 0.3 * np.sin(2 * np.pi * f * 1.003 * t)
drone = lowpass(drone, 650)
dg = env_lin([(0, 0), (0.5, 0.45), (part("context")["start"], 0.38), (part("main")["start"], 0.42), (part("explanation")["start"], 0.34),
              (W("dilarang") - 0.2, 0.42), (W("dibatalkan"), 0.3), (part("payoff")["start"], 0.36), (part("outro")["start"], 0.34), (TOTAL - 0.6, 0.2), (TOTAL, 0)])
add(drone * dg * 0.24, 0)


def pluck(freq, dur=1.6, bright=0.6, damp=0.996):
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, p) * bright
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * damp
    att = np.minimum(1, np.arange(n) / (0.002 * SR))
    return out * att


CACHE = {}
HIJAZ = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16]  # maqam Hijaz on D


def oud(deg, octave=0):
    key = (deg, octave)
    if key not in CACHE:
        x = pluck(hz(HIJAZ[deg] + octave - 12), 1.5, 0.55, 0.9955)
        CACHE[key] = lowpass(x, 2400)
    return CACHE[key]


def oud_line(start, end, seq, gain, step=1.0, octave=0):
    tt, k = start, 0
    while tt < end:
        d = seq[k % len(seq)]
        if d >= 0:
            add(oud(d, octave), tt, gain * (1.0 if k % 4 == 0 else 0.78), pan=0.25 if k % 2 else -0.15)
        k += 1
        tt += BEAT * step


oud_line(0.4, part("context")["end"], [0, -1, 2, 1, 0, -1, 4, 2], 0.12)
oud_line(part("main")["start"], part("main")["end"], [0, 1, 2, 3, 4, 3, 2, 1], 0.1)
oud_line(part("explanation")["start"], W("dilarang"), [4, 3, 2, 1, 0, -1, 1, 0], 0.11)
oud_line(W("tapi", 2), part("explanation")["end"], [0, 2, 4, 5, 4, -1, -1, -1], 0.11)
oud_line(part("payoff")["start"], part("payoff")["end"], [0, 2, 4, 7, 6, 4, 5, 4], 0.11, step=0.5)
oud_line(part("outro")["start"], TOTAL - 1.2, [0, -1, 2, -1, 1, -1, 0, -1], 0.1, octave=12)


def ney(notes, start, gain=0.045):
    tt = start
    for semis, dur in notes:
        n = int(dur * SR)
        x = np.arange(n) / SR
        f = hz(semis + 12)
        vib = 1 + 0.006 * np.sin(2 * np.pi * 5.0 * x) * np.minimum(1, x / 0.4)
        ph = 2 * np.pi * np.cumsum(f * vib) / SR
        tone = np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.07 * np.sin(3 * ph)
        breath = bandpass(rng.normal(0, 1, n), f * 0.8, f * 2.6) * 0.35
        e = np.minimum(1, x / 0.2) * np.minimum(1, np.maximum(0, dur - x) / 0.4)
        add((tone + breath) * e, tt, gain, pan=0.15)
        tt += dur


ney([(7, 1.6), (8, 0.8), (7, 0.8), (5, 1.2), (4, 1.0), (1, 1.0), (0, 2.4)], W("menurut"))
ney([(12, 1.4), (10, 0.8), (8, 0.8), (7, 1.8), (4, 1.0), (5, 2.6)], W("malam"))
ney([(7, 1.2), (5, 0.8), (4, 0.8), (1, 1.0), (0, 3.0)], W("jadi", 2), 0.04)


def daf(low=True):
    n = int(0.45 * SR)
    x = np.arange(n) / SR
    body = np.sin(2 * np.pi * (70 if low else 118) * x * (1 - 0.3 * x)) * np.exp(-x * (10 if low else 17))
    skin = bandpass(rng.normal(0, 1, n), 1500, 6000) * np.exp(-x * 45) * 0.2
    return body + skin


D1, D2 = daf(True), daf(False)
tt, k = W("malam"), 0
while tt < part("main")["end"] + 0.3:
    if k % 4 == 0:
        add(D1, tt, 0.07)
    if k % 4 == 2:
        add(D2, tt, 0.04, pan=0.2)
    k += 1
    tt += BEAT

# ---------------- ambience: room tone + night crickets in the zawiyah ----------------
room = lowpass(rng.normal(0, 1, N), 400)
rg = env_lin([(0, 0.0), (0.5, 0.03), (TOTAL - 1, 0.03), (TOTAL, 0)])
L += room * rg
R += np.roll(room, 2300) * rg
crick = bandpass(rng.normal(0, 1, N), 4200, 5200) * (np.sin(2 * np.pi * 28 * t) > 0.6) * (np.sin(2 * np.pi * 0.6 * t) > 0)
cg = env_lin([(0, 0), (W("malam") - 0.5, 0.0), (W("malam") + 0.8, 0.02), (part("main")["end"], 0.02), (part("main")["end"] + 1.0, 0), (TOTAL, 0)])
L += crick * cg
R += np.roll(crick, 4100) * cg


# ---------------- tabletop foley (synthesised) ----------------
def tick(seed, bright=1.0):
    r = np.random.default_rng(seed)
    n = int(0.12 * SR)
    x = np.arange(n) / SR
    out = bandpass(r.normal(0, 1, n), 1800 * bright, 6500) * np.exp(-x * 70)
    out += np.sin(2 * np.pi * (900 + 400 * r.random()) * x) * np.exp(-x * 60) * 0.5
    return out


def knock(f=180):
    n = int(0.3 * SR)
    x = np.arange(n) / SR
    return np.sin(2 * np.pi * f * x) * np.exp(-x * 22) + bandpass(rng.normal(0, 1, n), 600, 2500) * np.exp(-x * 60) * 0.4


def pour(dur):
    n = int(dur * SR)
    x = np.arange(n) / SR
    g = bandpass(rng.normal(0, 1, n), 500, 3000) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * x) ** 2)
    return g * np.minimum(1, x / 0.15) * np.minimum(1, (dur - x) / 0.3)


def crackle(dur):
    n = int(dur * SR)
    x = np.arange(n) / SR
    pops = (rng.random(n) > 0.9993) * rng.uniform(0.3, 1, n)
    pops = lfilter([1], [1, -0.85], pops)
    hiss = lowpass(rng.normal(0, 1, n), 1800) * 0.15
    return (pops + hiss) * np.minimum(1, x / 0.3) * np.minimum(1, (dur - x) / 0.6)


# hook: beans landing on the brass tray (1.2 s + 0.55 s steps, as in QahwaSet FallingBeans)
for i in range(7):
    add(tick(10 + i, 1.2), 1.2 + i * 0.55, 0.22, pan=(-0.3 + 0.1 * i))
for key in ["yaman", "tanamannya", "kaldi"]:
    add(tick(40 + len(key), 0.9), W(key) + 0.12, 0.2, pan=-0.2)
add(pour(1.6), W("dituang") + 0.35, 0.05, pan=0.1)
for i in range(7):
    add(tick(60 + i, 0.7), W("dibagikan") + i * 0.18 + 0.7, 0.1, pan=-0.4 + 0.12 * i)
for key in ["ahli", "dokter", "musik", "permainan"]:
    add(knock(160), W(key) + 0.1, 0.18, pan=0.15)
for i in range(5):
    add(tick(80 + i, 1.6), W("taruhan") + i * 0.12, 0.12, pan=0.3)
add(knock(90), W("dilarang"), 0.3, pan=0)
add(crackle(2.4), W("dibakar") - 0.2, 0.1, pan=0.3)
for i, (key, nth) in enumerate([("qahwa", 1), ("kahve", 1), ("koffie", 1), ("kopi", 6)]):
    add(knock(220 - i * 15), W(key, nth) + 0.25, 0.22, pan=-0.2 + i * 0.13)
water = bandpass(rng.normal(0, 1, int(2.0 * SR)), 300, 2500)
water *= np.minimum(1, np.arange(len(water)) / (0.3 * SR)) * np.minimum(1, (len(water) - np.arange(len(water))) / (0.8 * SR))
add(water, W("banjir") - 0.3, 0.06, pan=-0.2)
add(knock(120), W("1711") + 0.3, 0.24, pan=0.2)
add(tick(99, 0.8), W("pagimu") + 0.1, 0.2, pan=0.3)

# ---------------- SFX from the shared AUDIRA library ----------------
SFX_DIRS = [os.path.normpath(os.path.join(os.getcwd(), "../../../../shared/assets/sfx")), "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx"]
SFX_DIR = next(d for d in SFX_DIRS if os.path.isdir(d))


def load(name):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(SFX_DIR, name + ".mp3"), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)


CUES = [
    ("impact-bass-1", W("diadili") - 0.05, 0.22, 0),  # hook: put on trial
    ("whoosh-cinematic", W("bukti") - 0.4, 0.16, -0.2),  # to the map
    ("whoosh-short", W("legenda") + 0.6, 0.12, 0.2),  # to the zawiyah
    ("whoosh-short", W("berzikir") + 0.5, 0.12, -0.2),  # back to the map
    ("whoosh-cinematic", W("tahun", 4) + 0.3, 0.14, 0.2),  # to the council
    ("chime", W("dibatalkan"), 0.12, 0),  # ban lifted
    ("whoosh-short", W("namanya") - 0.6, 0.12, -0.2),  # to the tiles
    ("whoosh-short", W("kita") + 0.1, 0.12, 0.2),  # to Java
    ("sparkle", W("tumbuh", 2), 0.1, 0.2),  # the seedling grows
    ("whoosh-short", W("eropa") - 0.2, 0.12, -0.2),  # back to the cup
    ("chime", VO_END + 0.55, 0.2, 0),  # outro card
]
for name, at, gain, pan in CUES:
    add(load(name), at, gain, pan)

# ---------------- master: soft limiter, fades, write ----------------
fade = np.minimum(1, t / 0.3) * np.minimum(1, (TOTAL - t) / 1.2)
st = np.stack([L * fade, R * fade], axis=1)
peak = np.max(np.abs(st))
st = st / max(peak, 1e-9) * 0.75
st = np.tanh(st * 1.2) / np.tanh(1.2)
# sit the bed ~10 dB lower so after the -5 dB + sidechain mix it is ~15 dB under the voice
st = st * 10 ** (-5.5 / 20)
os.makedirs("public/audio", exist_ok=True)
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open("public/audio/bed.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"bed.wav {TOTAL:.3f}s, peak {peak:.3f} -> normalised")
