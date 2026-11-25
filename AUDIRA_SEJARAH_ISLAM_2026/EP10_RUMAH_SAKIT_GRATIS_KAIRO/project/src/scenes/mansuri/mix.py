"""EP10 Mansuri bed: music + ambience + SFX, no voice (run from project/).

Identity: "a courtyard of running water". A soft D drone, oud-like plucks walking maqam Bayati on D
(D E-half F G A Bb C D), a qanun run into each part, one ney phrase per part, a soft felt-mallet pulse
only under the waqf town, the fountain trickle under everything, and a lone oud at night for the
"musik dan pendongeng" beat. Shared SFX on key beats. Every time comes from timeline.json words.
Writes public/audio/bed.wav, then public/audio/full.wav (bed ducked under public/audio/vo.wav).
"""
import json
import re
import subprocess
import wave

import numpy as np
from scipy.signal import lfilter

SR = 48000
TL = json.load(open("src/scenes/mansuri/timeline.json", encoding="utf8"))
TOTAL = TL["total"]
VO_END = TL["voEnd"]
N = int(TOTAL * SR)
T = np.arange(N) / SR
rng = np.random.default_rng(1010)
import os


def _ws_root():
    """Workspace root = first folder upward with shared/ and CHANNEL_BRAND/ (series may sit in <WS>/<CODE>/)."""
    d = os.path.abspath(".")
    while True:
        if os.path.isdir(os.path.join(d, "shared")) and os.path.isdir(os.path.join(d, "CHANNEL_BRAND")):
            return d
        up = os.path.dirname(d)
        if up == d:
            raise SystemExit("workspace root not found")
        d = up


SFX = os.path.join(_ws_root(), "shared", "assets", "sfx")
PART = {p["id"]: p for p in TL["parts"]}
WORDS = {}
for ln in TL["lines"]:
    WORDS.setdefault(ln["part"], []).extend(ln["words"])


def norm(w):
    return re.sub(r"[^\w'-]", "", w.lower())


def at(pid, phrase, nth=0, which="s"):
    ws = WORDS[pid]
    toks = [norm(w["w"]) for w in ws]
    p = [norm(x) for x in phrase.split()]
    hit = 0
    for i in range(len(toks) - len(p) + 1):
        if toks[i:i + len(p)] == p:
            if hit == nth:
                return ws[i]["s"] if which == "s" else ws[i + len(p) - 1]["e"]
            hit += 1
    raise KeyError(f"{pid}: {phrase} #{nth}")


def read(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def save(path, a):
    with wave.open(path, "wb") as o:
        o.setnchannels(2)
        o.setsampwidth(2)
        o.setframerate(SR)
        o.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())


def put(buf, sig, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0 or i >= len(buf):
        return
    s = sig if sig.ndim == 2 else np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    e = min(len(buf), i + len(s))
    buf[i:e] += g * s[: e - i]


def lowpass(x, a):
    return lfilter([a], [1, -(1 - a)], x)


def env_pts(pts):
    xs, ys = zip(*pts)
    return np.interp(T, xs, ys)


p = lambda k: PART[k]["start"]
music = np.zeros((N, 2))
fx = np.zeros((N, 2))

konon = at("payoff", "Konon")
lima = at("payoff", "Rumah sakit ini bekerja")
night = np.clip((T - (konon - 0.3)) / 1.2, 0, 1) * np.clip(1 - (T - (lima - 0.2)) / 1.2, 0, 1)

# --- drone: D2 + A2 + D3, slow breathing; dips at night so the lone oud can sing ---
D = 73.42
trem = 0.6 + 0.4 * np.sin(2 * np.pi * T / 19.0)
drone = (np.sin(2 * np.pi * D * T) * 0.5 + np.sin(2 * np.pi * D * 1.5 * T + 0.4) * 0.22 * trem
         + np.sin(2 * np.pi * D * 2 * T + 1.3) * 0.12 + np.sin(2 * np.pi * D * 3.003 * T) * 0.03)
mood = env_pts([(0, 0), (1.0, .75), (p("context"), .6), (p("main"), .75), (p("explanation"), .8),
                (p("payoff"), .85), (konon, .35), (lima, .9), (p("outro"), .8), (VO_END, .9), (TOTAL, 0)])
music[:, 0] += drone * mood * 0.3
music[:, 1] += np.roll(drone, int(0.013 * SR)) * mood * 0.3

# --- maqam Bayati on D (E half-flat) ---
BAYATI = [0, 1.5, 3, 5, 7, 8, 10, 12]


def oud(f, dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    bend = 1 + 0.004 * np.exp(-t * 18)
    ph = 2 * np.pi * np.cumsum(f * bend) / SR
    tone = sum(np.sin(ph * h) * np.exp(-t * (2.2 + h * 1.3)) / (h ** 1.2) for h in range(1, 7))
    return lowpass(tone, 0.25) * np.minimum(1, t / 0.004) * 0.3


def qanun(f, dur=2.0):
    t = np.arange(int(dur * SR)) / SR
    return sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (3 + h * 1.8)) / h for h in range(1, 8)) * np.minimum(1, t / 0.002) * 0.22


def ney(f, dur):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + 0.005 * np.sin(2 * np.pi * 5.0 * t) * np.minimum(1, t / 0.7)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    tone = np.sin(ph) + 0.15 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
    breath = lowpass(rng.standard_normal(len(t)), 0.07) * 0.4
    a = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.7)
    return (tone + breath * (0.6 + 0.4 * np.sin(ph * 0.5))) * a * 0.16


note = lambda deg, octv=2: D * octv * 2 ** (BAYATI[deg % 8] / 12 + deg // 8)

# oud walks through the film; at night it plays alone, a little faster and louder
pr = np.random.default_rng(10)
figure = [0, 1, 2, 3, 2, 1, 0, 1, 3, 4, 3, 2, 1, 2, 0, 0]
beat = 0.82
tt = 1.2
k = 0
while tt < VO_END + 1.5:
    n_ = night[min(N - 1, int(tt * SR))]
    if pr.random() < 0.7 + 0.3 * n_:
        put(music, oud(note(figure[k % len(figure)], 2), 1.4), tt, 0.5 + 0.35 * n_, pan=-0.25)
    if k % 4 == 0:
        put(music, oud(note(0, 1), 2.0), tt, 0.3, pan=-0.1)
    tt += beat * (2 if k % 4 == 3 else 1) * (0.75 if n_ > 0.5 else 1)
    k += 1

for pid in ("context", "main", "explanation", "payoff", "outro"):
    for j, deg in enumerate([0, 2, 3, 4, 7]):
        put(music, qanun(note(deg, 4)), p(pid) - 0.75 + j * 0.12, 0.42, pan=0.3)

for pid, degs in (("context", [4, 3, 2]), ("main", [3, 4, 2]), ("explanation", [5, 4, 3]), ("payoff", [7, 5, 4]), ("outro", [4, 2, 0])):
    t0 = p(pid) + 1.4
    for j, deg in enumerate(degs):
        put(music, ney(note(deg, 4), 2.4 + j * 0.3), t0 + j * 2.1, 0.45, pan=0.15)


def mallet():
    t = np.arange(int(0.3 * SR)) / SR
    return np.sin(2 * np.pi * 110 * t) * np.exp(-t * 14) + 0.1 * lowpass(rng.standard_normal(len(t)), .1) * np.exp(-t * 40)


# soft felt-mallet pulse only under the waqf town
bt = at("explanation", "mewakafkan")
while bt < at("explanation", "pelayan"):
    put(music, mallet(), bt, 0.07)
    bt += beat * 2

# --- ambience: fountain trickle + droplets, room tone (warmer at night) ---
water = lowpass(rng.standard_normal(N), 0.08) - lowpass(rng.standard_normal(N), 0.01)
wmod = 0.7 + 0.3 * np.clip(lowpass(rng.standard_normal(N), 0.0004) * 8, -1, 1)
fx[:, 0] += water * wmod * 0.035
fx[:, 1] += np.roll(water * wmod, 777) * 0.035
dr = np.random.default_rng(33)
tt = 0.3
while tt < TOTAL - 1:
    n = int(0.05 * SR)
    tq = np.arange(n) / SR
    f0 = dr.uniform(900, 2200)
    drop = np.sin(2 * np.pi * (f0 * tq + 9000 * tq * tq)) * np.exp(-tq * 90)
    put(fx, drop, tt, 0.035 * dr.uniform(0.4, 1), pan=dr.uniform(-0.5, 0.5))
    tt += dr.uniform(0.12, 0.9)
room = lowpass(rng.standard_normal(N), 0.003) * 6
fx[:, 0] += room * (0.02 + 0.02 * night)
fx[:, 1] += np.roll(room, 911) * (0.02 + 0.02 * night)

# --- SFX library (shared/assets/sfx) ---
lib = {n: read(f"{SFX}/{n}.mp3") for n in ("whoosh-cinematic", "whoosh-short", "chime", "riser", "impact-bass-1", "sparkle", "click-soft", "ping", "pop")}
for pid in ("context", "main", "explanation", "outro"):
    put(fx, lib["whoosh-cinematic"], p(pid) - 1.0, 0.11)
put(fx, lib["chime"], at("hook", "gratis") - 0.05, 0.09)
put(fx, lib["sparkle"], at("context", "obat") - 0.1, 0.08)
put(fx, lib["pop"], at("context", "Damaskus"), 0.08)
put(fx, lib["chime"], at("context", "menjadi sultan"), 0.1)
put(fx, lib["whoosh-short"], at("main", "pembangunan dimulai"), 0.1)
for w in ("demam", "mata", "luka", "jiwa"):
    put(fx, lib["pop"], at("main", w) - 0.1, 0.08)
put(fx, lib["click-soft"], at("main", "Laki-laki"), 0.14)
put(fx, lib["chime"], at("explanation", "Wakaf") - 0.05, 0.12)
for w in ("pasar", "toko", "rumah sewa", "pemandian", "tanah"):
    put(fx, lib["pop"], at("explanation", w) - 0.12, 0.08)
for w in ("obat", "makanan", "dokter", "ahli bedah", "pelayan"):
    put(fx, lib["click-soft"], at("explanation", w) - 0.1, 0.12)
put(fx, lib["whoosh-short"], at("explanation", "Pintunya"), 0.09)
put(fx, lib["sparkle"], at("payoff", "pakaian") - 0.15, 0.09)
for j in range(3):
    put(fx, lib["ping"], at("payoff", "uang saku") + j * 0.09, 0.05)
put(fx, lib["whoosh-short"], at("payoff", "Rumah sakit ini bekerja"), 0.08)
put(fx, lib["riser"], at("payoff", "sejak 1915") - 1.2, 0.06)
put(fx, lib["chime"], at("payoff", "sejak 1915") + 0.1, 0.11)
put(fx, lib["pop"], at("outro", "Kalau kamu"), 0.08)
put(fx, lib["impact-bass-1"], VO_END + 0.5, 0.1)
put(fx, lib["sparkle"], VO_END + 0.7, 0.09)

music *= 0.05 / max(1e-6, float(np.sqrt(np.mean(music ** 2))))
bed = music + fx
bed *= np.minimum(1, np.minimum(T / 0.8, (TOTAL - T) / 1.5))[:, None]
bed /= max(1.0, np.abs(bed).max() / 0.9)
save("public/audio/bed.wav", bed)

SC = ("[1:a]aformat=channel_layouts=stereo,asplit=2[v1][v2];[0:a]volume=-5dB[b];"
      "[b][v1]sidechaincompress=threshold=0.02:ratio=4:attack=20:release=450[bd];"
      "[bd][v2]amix=inputs=2:normalize=0:duration=first[mx];"
      # the compressor drops ~0.2 s at the tail: pad back to the film length (silence under the outro card)
      f"[mx]apad=whole_dur={TOTAL:.3f}[m]")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "public/audio/bed.wav", "-i", "public/audio/vo.wav", "-filter_complex", SC,
                "-map", "[m]", "-ar", "48000", "-ac", "2", "public/audio/full.wav"], check=True)
print("bed", round(TOTAL, 3), "s -> public/audio/bed.wav, public/audio/full.wav")
