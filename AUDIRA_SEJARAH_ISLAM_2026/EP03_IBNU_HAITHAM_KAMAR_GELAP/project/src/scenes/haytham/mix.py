"""EP03 Haytham bed: music + ambience + SFX, no voice (run from project/).

Identity: "a candle in a shut room". A low C drone with a slow fifth that swells and recedes, a
breathy ney-like voice (sine + band noise, gentle vibrato) playing sparse phrases in C Kurd
(C Db Eb F G Ab Bb), qanun-like plucks (Karplus-Strong) at each part opening, a soft frame-drum
heartbeat only during the experiment, candle crackle and room tone. Every cue is a word of the
locked voice. Writes public/audio/bed.wav (length = timeline total).
"""
import json
import subprocess
import wave

import numpy as np
from scipy.signal import lfilter

SR = 48000
TL = json.load(open("src/scenes/haytham/timeline.json", encoding="utf8"))
TOTAL = TL["total"]
N = int(TOTAL * SR)
T = np.arange(N) / SR
rng = np.random.default_rng(303)
SFX = "../../../shared/assets/sfx"
PARTS = {p["id"]: p for p in TL["parts"]}
WORDS = [w for line in TL["lines"] for w in line["words"]]


def norm(w):
    return "".join(ch for ch in w.lower() if ch.isalnum() or ch in "-'")


def at(phrase, nth=0, which="s"):
    p = [norm(x) for x in phrase.split()]
    toks = [norm(w["w"]) for w in WORDS]
    hit = 0
    for i in range(len(toks) - len(p) + 1):
        if toks[i:i + len(p)] == p:
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


def put(buf, sig, t, g=1.0):
    i = int(t * SR)
    if i < 0 or i >= len(buf):
        return
    s = sig if sig.ndim == 2 else np.stack([sig, sig], 1)
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

# ---- drone: C2 + G2, slow swell; darker in the experiment, opens in the payoff
C2 = 65.41
lfo = 0.5 + 0.5 * np.sin(2 * np.pi * T / 11.0)
drone = (np.sin(2 * np.pi * C2 * T) * 0.5 + np.sin(2 * np.pi * C2 * 1.5 * T + 0.3) * 0.28 * lfo + np.sin(2 * np.pi * C2 * 2 * T) * 0.12)
drone_env = env_pts([(0, 0.0), (0.6, 0.55), (part("context"), 0.5), (part("main"), 0.55), (part("explanation"), 0.42), (part("payoff"), 0.65), (TL["voEnd"], 0.6), (TOTAL, 0.0)])
d = drone * drone_env * 0.16
music[:, 0] += d
music[:, 1] += np.roll(d, 240)

# ---- ney-like breathy phrases (C Kurd), sparse
KURD = [261.63, 277.18, 311.13, 349.23, 392.0, 415.3, 466.16, 523.25]


def ney(freq, dur, amp=0.12):
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 0.4, 0, 1)
    ph = 2 * np.pi * np.cumsum(freq * vib) / SR
    tone = np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    breath = lowpass(rng.standard_normal(n), 0.08) * 0.35
    a = np.minimum(1, t / 0.18) * np.minimum(1, (dur - t) / 0.35).clip(0, 1)
    return (tone + breath) * a * amp


phrases = [
    (0.9, [4, 3, 2, 1, 0], 0.55),
    (part("context") + 0.4, [0, 2, 3, 4], 0.6),
    (part("main") + 0.3, [4, 5, 4, 3, 2], 0.5),
    (at("konon") + 0.2, [1, 0, 1, 0], 0.7),
    (part("explanation") + 0.2, [0, 1, 2], 0.8),
    (at("kesimpulannya"), [2, 3, 4, 7], 0.55),
    (part("payoff") + 0.3, [4, 5, 6, 7, 6, 4], 0.45),
    (at("obscura", 0, "e"), [7, 6, 4], 0.7),
    (part("outro") + 0.2, [4, 3, 2, 1, 0], 0.6),
]
for t0, notes, step in phrases:
    for k, ni in enumerate(notes):
        sig = ney(KURD[ni] / 2, step * 1.3, 0.09)
        pan = 0.5 + 0.2 * np.sin(k)
        put(music, np.stack([sig * (1 - pan) * 1.4, sig * pan * 1.4], 1), t0 + k * step)


# ---- qanun plucks (Karplus-Strong) at part openings
def pluck(freq, dur=1.6, amp=0.22):
    n = int(dur * SR)
    p = int(SR / freq)
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out * amp


plucks = {}
for pid in ["context", "main", "explanation", "payoff", "outro"]:
    t0 = part(pid)
    for k, ni in enumerate([0, 4, 7]):
        f = KURD[ni]
        if f not in plucks:
            plucks[f] = pluck(f)
        put(music, plucks[f], t0 - 0.15 + k * 0.11, 0.8)

# ---- frame-drum heartbeat during the experiment only
beat = np.exp(-np.arange(int(0.35 * SR)) / SR * 14) * np.sin(2 * np.pi * 58 * np.arange(int(0.35 * SR)) / SR)
t0, t1 = at("lilin"), at("kesimpulannya")
bt = t0
while bt < t1:
    put(music, beat * 0.22, bt)
    put(music, beat * 0.12, bt + 0.32)
    bt += 1.5

# ---- ambience: room tone + candle crackle (louder around the candle experiment)
room = lowpass(lowpass(rng.standard_normal(N), 0.02), 0.05) * 0.5
fx[:, 0] += room * 0.05
fx[:, 1] += np.roll(room, 900) * 0.05
crack_env = env_pts([(0, 0.6), (part("context"), 0.35), (part("explanation"), 0.4), (at("lilin"), 1.0), (at("kesimpulannya"), 0.6), (part("payoff"), 0.25), (TOTAL, 0.1)])
for _ in range(int(TOTAL * 3)):
    tt = rng.uniform(0, TOTAL)
    n = int(rng.uniform(0.004, 0.02) * SR)
    c = rng.standard_normal(n) * np.exp(-np.arange(n) / n * 5) * rng.uniform(0.02, 0.06)
    put(fx, c * crack_env[min(N - 1, int(tt * SR))], tt)


# ---- wood clunk for the door bar
def clunk():
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 110 * t) * 0.7 + np.sin(2 * np.pi * 173 * t) * 0.3 + rng.standard_normal(n) * 0.25 * np.exp(-t * 60)) * np.exp(-t * 11) * 0.5


put(fx, clunk(), at("dikurung") + 0.1)

# ---- library SFX on the key beats
def sfx(name, t, g):
    put(fx, read(f"{SFX}/{name}.mp3"), t, g)


sfx("whoosh-cinematic", at("sekitar") - 0.3, 0.22)
sfx("pop", at("ibnu"), 0.12)
sfx("click-soft", at("sinar"), 0.25)
sfx("whoosh-short", at("khalifah") - 0.1, 0.15)
sfx("impact-bass-1", at("konon") - 0.05, 0.28)
sfx("whoosh-cinematic", at("cahaya", 0, "e") - 0.6, 0.2)
for k in range(3):
    sfx("click-soft", at("lilin") + k * 0.5, 0.18)
sfx("whoosh-short", at("tutup"), 0.14)
sfx("ping", at("kembali") - 0.1, 0.16)
sfx("riser", at("kepler", 0, "e") - 1.2, 0.16)
sfx("whoosh-cinematic", at("pula"), 0.22)
sfx("chime", at("camera"), 0.18)
sfx("impact-bass-1", at("2015"), 0.18)
sfx("whoosh-short", at("memotret"), 0.16)
sfx("sparkle", at("ponselmu"), 0.14)
sfx("chime", TL["voEnd"] + 0.6, 0.2)

bed = music * 0.9 + fx
# fade in/out
fade = np.clip(T / 0.4, 0, 1) * np.clip((TOTAL - T) / 1.2, 0, 1)
bed *= fade[:, None]
peak = np.max(np.abs(bed))
bed *= 0.62 / max(peak, 1e-6)
save("public/audio/bed.wav", bed)
print(f"bed.wav {TOTAL:.2f} s, peak {peak:.3f} -> 0.62")
