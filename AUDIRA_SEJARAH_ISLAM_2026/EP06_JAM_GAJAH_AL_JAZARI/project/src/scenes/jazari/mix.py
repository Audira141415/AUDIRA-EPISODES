"""EP06 Jazari bed: music + ambience + SFX, no voice (run from project/).

Identity: "a water clock in a quiet court". A low D drone with a soft fifth, an oud-like plucked motif
(Karplus-Strong, plectrum noise) in D Hijaz (D Eb F# G A Bb C), a slow wooden tick that keeps the
clock's pulse (stops for the payoff), water drips and a bubbling tank under the explanation, and
mechanism SFX synthesised on the story's events: bird whistle, ball roll, cymbal "tang", rope creak.
Every cue is a word of the locked voice. Writes public/audio/bed.wav (length = timeline total).
"""
import json
import subprocess
import wave

import numpy as np
from scipy.signal import lfilter

SR = 48000
TL = json.load(open("src/scenes/jazari/timeline.json", encoding="utf8"))
TOTAL = TL["total"]
N = int(TOTAL * SR)
T = np.arange(N) / SR
rng = np.random.default_rng(606)
SFX = "../../../../shared/assets/sfx"
PARTS = {p["id"]: p for p in TL["parts"]}
WORDS = [w for line in TL["lines"] for w in line["words"]]


def norm(w):
    return "".join(ch for ch in w.lower() if ch.isalnum() or ch in "-'")


TOKS = [norm(w["w"]) for w in WORDS]


def at(phrase, nth=0, which="s"):
    p = [norm(x) for x in phrase.split()]
    hit = 0
    for i in range(len(TOKS) - len(p) + 1):
        if TOKS[i:i + len(p)] == p:
            if hit == nth:
                return WORDS[i]["s"] if which == "s" else WORDS[i + len(p) - 1]["e"]
            hit += 1
    raise KeyError(phrase)


def read(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def save(path, a):
    with wave.open(path, "wb") as o:
        o.setnchannels(2)
        o.setsampwidth(2)
        o.setframerate(SR)
        o.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())


def put(buf, sig, t, g=1.0, pan=0.5):
    i = int(t * SR)
    if i < 0 or i >= len(buf):
        return
    s = sig if sig.ndim == 2 else np.stack([sig * (1 - pan) * 2 ** 0.5, sig * pan * 2 ** 0.5], 1)
    e = min(len(buf), i + len(s))
    buf[i:e] += g * s[: e - i]


def lowpass(x, a):
    return lfilter([a], [1, -(1 - a)], x)


def env_pts(pts):
    xs, ys = zip(*pts)
    return np.interp(T, xs, ys)


part = lambda k: PARTS[k]["start"]
music = np.zeros((N, 2))
fx = np.zeros((N, 2))

# ---- drone: D2 + A2, slow breathing
D2 = 73.42
lfo = 0.5 + 0.5 * np.sin(2 * np.pi * T / 13.0)
drone = np.sin(2 * np.pi * D2 * T) * 0.5 + np.sin(2 * np.pi * D2 * 1.5 * T + 0.4) * 0.25 * lfo + np.sin(2 * np.pi * D2 * 2 * T) * 0.1
dr_env = env_pts([(0, 0), (0.5, 0.5), (part("context"), 0.45), (part("main"), 0.5), (part("explanation"), 0.4), (part("payoff"), 0.65), (TL["voEnd"], 0.6), (TOTAL, 0)])
d = drone * dr_env * 0.15
music[:, 0] += d
music[:, 1] += np.roll(d, 300)

# ---- oud-like plucks, D Hijaz
HIJAZ = [146.83, 155.56, 185.0, 196.0, 220.0, 233.08, 261.63, 293.66]
cache = {}


def oud(freq, dur=1.4):
    key = (round(freq, 2), dur)
    if key in cache:
        return cache[key]
    n = int(dur * SR)
    p = int(SR / freq)
    buf = rng.uniform(-1, 1, p) * np.hanning(p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.994
    pick = rng.standard_normal(int(0.006 * SR)) * 0.4
    out[: len(pick)] += pick
    cache[key] = out * 0.25
    return cache[key]


motifs = [
    (0.75, [0, 1, 2, 4], 0.32),
    (part("context") + 0.3, [4, 3, 2, 1, 0], 0.42),
    (at("jam air"), [0, 2, 4, 7], 0.3),
    (part("main") + 0.2, [2, 4, 5, 4, 2], 0.36),
    (part("explanation") + 0.2, [0, 1, 0], 0.55),
    (at("siklus"), [0, 2, 4, 2, 0], 0.3),
    (part("payoff") + 0.3, [4, 5, 6, 7, 6, 4], 0.38),
    (at("membangunnya"), [7, 6, 4, 2, 0], 0.4),
    (part("outro") + 0.3, [0, 2, 4, 7], 0.42),
]
for t0, notes, step in motifs:
    for k, ni in enumerate(notes):
        put(music, oud(HIJAZ[ni]), t0 + k * step, 0.9, pan=0.4 + 0.2 * np.sin(k))

# ---- clock tick: wooden, every 1.0 s from the hook to the payoff, softer under explanation
tick_n = int(0.06 * SR)
tt = np.arange(tick_n) / SR
tick = (np.sin(2 * np.pi * 1800 * tt) * 0.5 + rng.standard_normal(tick_n) * 0.3) * np.exp(-tt * 90)
t0 = 0.4
while t0 < part("payoff"):
    g = 0.05 if part("explanation") <= t0 < part("payoff") else 0.07
    put(fx, tick * g, t0, pan=0.45 + 0.1 * ((int(t0) % 2) * 2 - 1))
    t0 += 1.0

# ---- water: tank bubbling under the explanation, drips during the inflow
bub = lowpass(rng.standard_normal(N), 0.04)
bub_env = env_pts([(0, 0.15), (part("explanation"), 0.3), (at("air masuk"), 0.9), (at("tenggelam", 0, "e"), 0.5), (part("payoff"), 0.1), (TOTAL, 0.05)])
fx[:, 0] += bub * bub_env * 0.05
fx[:, 1] += np.roll(bub, 700) * bub_env * 0.05


def drip(f0):
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * (f0 + 900 * t) * t) * np.exp(-t * 40) * 0.25


dt = at("lubang")
while dt < at("tenggelam", 0, "e"):
    put(fx, drip(rng.uniform(700, 1100)), dt, 0.5, pan=rng.uniform(0.3, 0.7))
    dt += rng.uniform(0.35, 0.7)


# ---- mechanism SFX
def whistle(dur=0.9):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 1500 + 500 * np.sin(np.pi * t / dur) + 30 * np.sin(2 * np.pi * 7 * t)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + lowpass(rng.standard_normal(n), 0.3) * 0.25
    return tone * np.sin(np.pi * t / dur) * 0.16


def cymbal():
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    parts_ = [1, 1.47, 2.09, 2.56, 3.13, 4.2]
    s = sum(np.sin(2 * np.pi * 620 * p * t + p) / (1 + i * 0.4) for i, p in enumerate(parts_))
    s += rng.standard_normal(n) * 0.5 * np.exp(-t * 18)
    return s * np.exp(-t * 2.2) * 0.12


def roll(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return lowpass(rng.standard_normal(n), 0.06) * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * t)) * np.minimum(1, t / 0.05) * 0.3


def creak():
    n = int(0.8 * SR)
    t = np.arange(n) / SR
    f = 180 + 60 * t
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t * 3) * 0.04


CYM = cymbal()
put(fx, whistle(), at("bersiul"), 1.0, 0.6)
put(fx, whistle(1.2), at("bersiul", 1), 1.0, 0.6)
put(fx, whistle(1.6), at("peluit") - 0.4, 1.0, 0.4)
for a in [0.0, at("bola"), at("melepas")]:
    put(fx, roll(0.7), a, 0.6, 0.6)
for a in [at("simbal"), at("simbal", 1), at("mangkuk", 2) + 0.2]:
    put(fx, CYM, a - 0.03, 1.0, 0.6)
put(fx, roll(1.0), at("menunduk"), 0.5, 0.6)
put(fx, creak(), at("menarik"), 1.0, 0.45)


def sfx(name, t, g, pan=None):
    s = read(f"{SFX}/{name}.mp3")
    put(fx, s, t, g)


sfx("whoosh-cinematic", at("pembuatnya") - 0.4, 0.18)
sfx("pop", at("artuqid"), 0.1)
sfx("click-soft", at("50"), 0.2)
sfx("sparkle", at("gambar"), 0.1)
sfx("whoosh-short", at("terkenal"), 0.14)
sfx("click-soft", at("kastil"), 0.16)
sfx("pop", at("boneka"), 0.1)
sfx("chime", at("pertunjukan"), 0.14)
sfx("whoosh-cinematic", at("rahasianya") - 0.5, 0.18)
sfx("click-soft", at("lubang"), 0.18)
sfx("impact-bass-1", at("tenggelam", 0, "e") - 0.1, 0.16)
sfx("riser", at("replika") - 1.4, 0.14)
sfx("impact-bass-1", at("dubai"), 0.2)
sfx("whoosh-short", at("padahal"), 0.14)
sfx("ping", at("dewasa"), 0.14)
sfx("whoosh-cinematic", at("al-jazari", 1) - 0.3, 0.16)
sfx("chime", TL["voEnd"] + 0.6, 0.2)

bed = music * 0.9 + fx
fade = np.clip(T / 0.3, 0, 1) * np.clip((TOTAL - T) / 1.2, 0, 1)
bed *= fade[:, None]
peak = np.max(np.abs(bed))
bed *= 0.5 / max(peak, 1e-6)
save("public/audio/bed.wav", bed)
print(f"bed.wav {TOTAL:.2f} s, peak {peak:.3f} -> 0.5")
