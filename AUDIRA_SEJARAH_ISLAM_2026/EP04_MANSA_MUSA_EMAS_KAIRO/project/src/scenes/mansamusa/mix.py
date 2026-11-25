"""EP04 Mansa Musa audio bed (music + ambience + SFX, no voice). Run from project/:
    python src/scenes/mansamusa/mix.py
Writes public/audio/bed.wav, length = timeline total, 48 kHz stereo.

Identity for this episode: West Africa meets Cairo. A kora-like harp (Karplus-Strong, bright,
F major pentatonic, 84 bpm, interlocking two-hand ostinato) over a low F/C drone; an oud-like low
pluck that answers in maqam Rast on F (F G A- Bb C D E- F, quarter-tone thirds) once the caravan
reaches Cairo; a soft ney phrase for al-Umari and the Atlas; a very light shaker + frame drum pulse
in the main part only. Ambience: desert wind on the flights and the map, market murmur at the
balance, Nile water at the crossing. Coins clink (synthesised) on the rain, the dirham stack and the
loan. Reverent, no singing. Every cue is anchored to a spoken word.
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
rng = np.random.default_rng(1324)
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


BEAT = 60 / 84

# ---------------- drone: F1 + C2, slow breathing ----------------
drone = np.zeros(N)
for f, a in [(hz(-24), 0.5), (hz(-17), 0.3), (hz(-12), 0.14)]:
    drone += a * np.sin(2 * np.pi * f * t + 0.25 * np.sin(2 * np.pi * 0.05 * t))
    drone += a * 0.3 * np.sin(2 * np.pi * f * 1.004 * t)
drone = lowpass(drone, 700)
dg = env_lin([(0, 0), (0.4, 0.5), (part("context")["start"], 0.42), (part("main")["start"], 0.36), (part("explanation")["start"], 0.32),
              (part("payoff")["start"], 0.42), (part("outro")["start"], 0.34), (TOTAL - 0.6, 0.2), (TOTAL, 0)])
add(drone * dg * 0.24, 0)


# ---------------- kora-like harp (bright Karplus-Strong) ----------------
def pluck(freq, dur=1.8, bright=0.75, damp=0.997):
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, p) * bright
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * damp
    att = np.minimum(1, np.arange(n) / (0.0015 * SR))
    return out * att


CACHE = {}


def kora(semis):
    key = ("k", semis)
    if key not in CACHE:
        CACHE[key] = pluck(hz(semis + 12), 1.6, 0.8, 0.9965)
    return CACHE[key]


def oud(semis):
    key = ("o", semis)
    if key not in CACHE:
        x = pluck(hz(semis - 12), 1.4, 0.55, 0.995)
        CACHE[key] = lowpass(x, 2200)
    return CACHE[key]


PENTA = {"a": [0, 4, 7, 9, 12, 9, 7, 4], "b": [2, 7, 9, 12, 14, 12, 9, 7], "c": [0, 7, 12, 16, 14, 12, 9, 7]}


def kora_line(start, end, pat, gain, step=0.5, octave=0):
    tt, k = start, 0
    seq = PENTA[pat]
    while tt < end:
        s = seq[k % len(seq)] + octave
        add(kora(s), tt + (0.012 if k % 2 else 0), gain * (1.0 if k % 4 == 0 else 0.8), pan=(-0.4 if k % 2 else 0.4))
        # left-hand bass on the downbeats
        if k % 4 == 0:
            add(kora(seq[0] - 12 + octave), tt, gain * 0.7, pan=-0.1)
        k += 1
        tt += BEAT * step


# Rast on F with quarter-tone third and seventh (A half-flat = 3.5, E half-flat = 10.5)
RAST = [0, 2, 3.5, 5, 7, 9, 10.5, 12]


def oud_line(start, end, seq, gain, step=1.0):
    tt, k = start, 0
    while tt < end:
        add(oud(RAST[seq[k % len(seq)]]), tt, gain, pan=0.25)
        k += 1
        tt += BEAT * step


kora_line(0.5, part("context")["end"], "a", 0.11, step=0.5)
kora_line(part("main")["start"], W("kairo", 2), "b", 0.11, step=0.5)
oud_line(W("kairo", 2) - 0.2, part("main")["end"], [0, 2, 4, 2, 3, 2, 1, 0], 0.13)
kora_line(W("kairo", 2), part("main")["end"], "b", 0.08, step=1.0, octave=12)
kora_line(part("explanation")["start"], part("explanation")["end"], "a", 0.09, step=1.0)
oud_line(W("setelah"), W("menurut"), [4, 3, 2, 1, 0, 1, 2, 0], 0.11, step=1.0)
oud_line(part("payoff")["start"], W("eropa"), [0, 1, 2, 1, 0, 6, 7, 0], 0.12, step=1.0)
kora_line(W("eropa"), part("payoff")["end"], "c", 0.12, step=0.5)
kora_line(part("outro")["start"], TOTAL - 1.2, "a", 0.09, step=1.0, octave=12)


# ---------------- ney phrases ----------------
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


ney([(7, 1.4), (9, 0.7), (7, 0.7), (5, 1.2), (3.5, 1.0), (2, 2.0)], W("sejarawan"))
ney([(12, 1.2), (10.5, 0.8), (9, 0.8), (7, 1.6), (5, 1.0), (7, 2.4)], W("atlas"))
ney([(7, 1.0), (5, 0.8), (3.5, 0.8), (2, 1.0), (0, 2.8)], W("sejarah"), 0.04)


# ---------------- light percussion: shaker + frame drum, main part only ----------------
def daf(low=True):
    n = int(0.45 * SR)
    x = np.arange(n) / SR
    body = np.sin(2 * np.pi * (72 if low else 120) * x * (1 - 0.3 * x)) * np.exp(-x * (10 if low else 17))
    skin = bandpass(rng.normal(0, 1, n), 1500, 6000) * np.exp(-x * 45) * 0.2
    return body + skin


def shaker():
    n = int(0.12 * SR)
    x = np.arange(n) / SR
    return bandpass(rng.normal(0, 1, n), 4000, 11000) * np.exp(-x * 40)


D1, D2, SH = daf(True), daf(False), shaker()
tt, k = part("main")["start"], 0
while tt < part("main")["end"]:
    pos = k % 8
    if pos in (0, 5):
        add(D1, tt, 0.07)
    if pos == 3:
        add(D2, tt, 0.04, pan=0.2)
    add(SH, tt, 0.025 if pos % 2 else 0.04, pan=0.3)
    k += 1
    tt += BEAT / 2

# ---------------- ambience ----------------
wind = lowpass(rng.normal(0, 1, N), 500) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.09 * t) ** 2)
wg = env_lin([(0, 0), (W("namanya") - 0.8, 0.0), (W("musa") + 0.4, 0.09), (W("ia") - 0.5, 0.03), (W("orang"), 0.04), (W("1324"), 0.09),
              (W("berkemah"), 0.03), (W("pasar") - 0.6, 0.07), (W("sejarawan") + 0.8, 0.0),
              (W("namanya", 2), 0.0), (W("eropa"), 0.08), (W("atlas") + 0.8, 0.03), (TOTAL, 0.0)])
L += wind * wg
R += np.roll(wind, 3100) * wg

murmur = bandpass(rng.normal(0, 1, N), 250, 1500) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 0.7 * t + np.sin(2 * np.pi * 0.13 * t))))
mg = env_lin([(0, 0.0), (0.4, 0.035), (W("namanya") - 0.3, 0.035), (W("musa"), 0.0), (W("sejarawan") + 0.5, 0.0), (W("sejarawan") + 1.5, 0.025),
              (W("menurut"), 0.025), (W("tapi"), 0.015), (W("eropa") - 0.5, 0.015), (W("eropa"), 0.0), (TOTAL, 0.0)])
L += murmur * mg
R += np.roll(murmur, 1700) * mg

water = bandpass(rng.normal(0, 1, N), 300, 2500) * (0.4 + 0.6 * np.sin(2 * np.pi * 0.35 * t) ** 2)
ag = env_lin([(0, 0), (W("lalu") - 0.8, 0.0), (W("menyeberangi"), 0.05), (W("kairo", 2) + 0.8, 0.04), (W("musa", 2) + 0.5, 0.0), (TOTAL, 0)])
L += water * ag
R += np.roll(water, 900) * ag


# ---------------- coin clinks (synthesised) ----------------
def clink(seed):
    r = np.random.default_rng(seed)
    n = int(0.35 * SR)
    x = np.arange(n) / SR
    out = np.zeros(n)
    for f in (2400, 3900, 5600, 7300):
        ff = f * (0.95 + 0.1 * r.random())
        out += np.sin(2 * np.pi * ff * x) * np.exp(-x * (18 + 10 * r.random()))
    return out * 0.25


def coin_run(start, end, rate, gain, seed=0):
    tt, k = start, 0
    r = np.random.default_rng(seed)
    while tt < end:
        add(clink(seed * 100 + k), tt, gain * (0.6 + 0.4 * r.random()), pan=r.uniform(-0.5, 0.5))
        tt += rate * (0.6 + 0.8 * r.random())
        k += 1


coin_run(0.3, W("namanya") - 0.2, 0.32, 0.12, 1)  # hook rain
coin_run(W("mengirim"), W("sultan") + 0.4, 0.45, 0.07, 2)  # chest of gold
coin_run(W("setiap"), W("emas", 4) + 0.3, 0.3, 0.1, 3)  # officials each get gold
coin_run(W("dua") - 0.1, W("dirham") + 0.15, 0.04, 0.08, 4)  # 25 dirhams stack up
coin_run(W("turun"), W("dirham", 2) + 0.2, 0.25, 0.1, 5)  # three dirhams fall away
coin_run(W("emas", 6) - 0.2, W("menurut") - 0.3, 0.12, 0.09, 6)  # gold floods
coin_run(W("pada"), W("kairo", 5) + 0.3, 0.2, 0.08, 7)  # loan coins slide

# ---------------- SFX from the shared AUDIRA library ----------------
SFX_DIRS = [os.path.normpath(os.path.join(os.getcwd(), "../../../shared/assets/sfx")), "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx"]
SFX_DIR = next(d for d in SFX_DIRS if os.path.isdir(d))


def load(name):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(SFX_DIR, name + ".mp3"), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)


CUES = [
    ("impact-bass-1", W("jatuh") - 0.05, 0.26, 0),  # hook: gold price falls
    ("whoosh-cinematic", W("namanya") - 0.1, 0.2, -0.2),  # rise to the map
    ("sparkle", W("bambuk") - 0.05, 0.12, -0.3),  # gold fields
    ("pop", W("garam"), 0.12, 0.3),  # salt slabs
    ("whoosh-short", W("berangkat"), 0.14, 0.2),  # route starts drawing
    ("pop", W("makkah"), 0.12, 0.3),
    ("whoosh-cinematic", W("1324") - 0.4, 0.2, 0.2),  # fly to Giza
    ("whoosh-short", W("menyeberangi") - 0.1, 0.12, -0.2),  # boat
    ("impact-bass-1", W("sultan"), 0.12, 0),  # chest set down
    ("whoosh-cinematic", W("pasar") - 1.0, 0.18, -0.2),  # back to the market
    ("typing", W("mencatatnya"), 0.06, 0.3),  # pen on paper (soft)
    ("click-soft", W("mitsqal"), 0.2, -0.3),  # one mitsqal set on the pan
    ("impact-bass-1", W("turun"), 0.14, 0),  # price falls
    ("riser", W("sederhananya") - 0.4, 0.1, 0),
    ("pop", W("dua", 4), 0.12, 0.2),  # ± 12 years
    ("glitch-1", W("twist") - 0.05, 0.05, 0),  # plot twist (very light)
    ("impact-bass-1", W("bekal"), 0.12, 0),
    ("click", W("berutang"), 0.18, 0.2),  # seal
    ("whoosh-cinematic", W("eropa") - 0.6, 0.2, -0.2),  # fly to the Atlas
    ("sparkle", W("bongkah"), 0.16, 0.2),  # the nugget
    ("chime", VO_END + 0.55, 0.22, 0),  # outro card
]
for name, at, gain, pan in CUES:
    add(load(name), at, gain, pan)

# ---------------- master: soft limiter, fades, write ----------------
fade = np.minimum(1, t / 0.3) * np.minimum(1, (TOTAL - t) / 1.2)
st = np.stack([L * fade, R * fade], axis=1)
peak = np.max(np.abs(st))
st = st / max(peak, 1e-9) * 0.75
st = np.tanh(st * 1.2) / np.tanh(1.2)
# sit the bed ~10 dB lower (≈ -27 LUFS) so after the -5 dB + sidechain mix it is ~15 dB under the voice
st = st * 10 ** (-9.5 / 20)
os.makedirs("public/audio", exist_ok=True)
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open("public/audio/bed.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"bed.wav {TOTAL:.3f}s, peak {peak:.3f} -> normalised")
