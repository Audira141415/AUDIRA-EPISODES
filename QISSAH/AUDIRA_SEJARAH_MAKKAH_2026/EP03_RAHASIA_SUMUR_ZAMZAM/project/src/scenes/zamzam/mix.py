"""EP03 Zamzam bed: music + ambience + SFX, no voice (run from project/).

Identity: "water under stone". A low D drone with a slow-breathing fifth, a ney-like breathy
voice (sine + band noise, gentle vibrato) playing sparse phrases in D Hijaz, rare qanun-like
plucks at chapter openings, and synthesized water drips. Percussion is a very soft frame-drum
pulse only in the two technical chapters. Writes public/audio/bed.wav and full.wav, and
short0N_bed.wav / short0N_full.wav for the shorts.
"""
import json
import subprocess
import wave

import numpy as np
from scipy.signal import lfilter

SR = 48000
TL = json.load(open("src/scenes/zamzam/timeline.json", encoding="utf8"))
TOTAL = TL["total"]
N = int(TOTAL * SR)
T = np.arange(N) / SR
rng = np.random.default_rng(303)
import os
SFX = next(d for d in ("../../../shared/assets/sfx", "../../../../shared/assets/sfx") if os.path.isdir(d))  # seri selesai ada di <WS>/<KODE_CHANNEL>/<SERI>
CH = {c["id"]: c for c in TL["chapters"]}


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
    """One-pole low-pass (a = 0..1)."""
    return lfilter([a], [1, -(1 - a)], x)


def env_pts(pts):
    xs, ys = zip(*pts)
    return np.interp(T, xs, ys)


c = lambda k: CH[k]["start"]
music = np.zeros((N, 2))
fx = np.zeros((N, 2))

# --- drone: D2 + A2 + D3; the fifth breathes slowly; level follows the chapter mood ---
D = 73.42
lfo = 0.5 + 0.5 * np.sin(2 * np.pi * T / 23.0)
drone = (np.sin(2 * np.pi * D * T) * 0.5 + np.sin(2 * np.pi * D * 1.5 * T + 0.3) * 0.22 * lfo
         + np.sin(2 * np.pi * D * 2 * T + 1.1) * 0.16 + np.sin(2 * np.pi * D * 3.01 * T) * 0.05)
mood = env_pts([(0, 0), (1.5, .8), (c("c02_lembah"), .7), (c("c03_hilang"), .85), (c("c04_timba"), .7), (c("c05_anatomi"), 1.0),
                (c("c06_perjalanan"), .8), (c("c07_sains"), .6), (c("c08_ekspor"), .75), (c("c09_penutup"), 1.0), (TOTAL - 4, .9), (TOTAL, 0)])
music[:, 0] += drone * mood * 0.32
music[:, 1] += np.roll(drone, int(0.011 * SR)) * mood * 0.32

# --- ney-like phrases in D Hijaz (D Eb F# G A Bb C D) ---
HIJAZ = [0, 1, 4, 5, 7, 8, 10, 12]


def ney(f, dur):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.6)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    tone = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    breath = lowpass(rng.standard_normal(len(t)), 0.08) * 0.35
    a = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.6)
    return (tone + breath * (0.6 + 0.4 * np.sin(ph * 0.5))) * a * 0.18


pr = np.random.default_rng(7)
for ch in TL["chapters"]:
    for k in range(int((ch["end"] - ch["start"]) / 14) + 1):
        tt = ch["start"] + 0.4 + k * 14 + pr.uniform(0, 3)
        if tt > ch["end"] - 3:
            break
        deg = int(pr.choice([3, 4, 5, 4, 2, 6]))
        for j in range(3):
            f = D * 2 * 2 ** (HIJAZ[(deg + [0, -1, 1][j]) % 8] / 12)
            put(music, ney(f, 2.6 + pr.uniform(0, 1.2)), tt + j * 2.2, 0.55)


# --- qanun-like plucks at chapter openings (title cards) ---
def pluck(f, dur=2.2):
    t = np.arange(int(dur * SR)) / SR
    return sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (3 + h * 1.6)) / h for h in range(1, 7)) * np.minimum(1, t / 0.003) * 0.25


for ch in TL["chapters"][2:]:
    for j, deg in enumerate([0, 4, 5, 7]):
        put(music, pluck(D * 4 * 2 ** (HIJAZ[deg] / 12)), ch["start"] - 0.6 + j * 0.16, 0.5)


# --- very soft frame-drum pulse in the technical chapters ---
def drum():
    t = np.arange(int(0.35 * SR)) / SR
    return (np.sin(2 * np.pi * (70 * t + 30 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 12)
            + 0.15 * lowpass(rng.standard_normal(len(t)), .2) * np.exp(-t * 30))


for cid in ("c05_anatomi", "c06_perjalanan"):
    ch = CH[cid]
    bt = ch["start"] + 2
    while bt < ch["end"] - 2:
        put(music, drum(), bt, 0.10)
        put(music, drum(), bt + 0.75, 0.05)
        bt += 2.4

# --- ambience: underground room tone + water drips ---
room = lowpass(rng.standard_normal(N), 0.004) * 6
water_env = env_pts([(0, .3), (c("c02_lembah"), .15), (c("c03_hilang"), .05), (c("c04_timba"), .2), (c("c05_anatomi"), .6), (c("c06_perjalanan"), .7),
                     (c("c07_sains"), .2), (c("c08_ekspor"), .15), (c("c09_penutup"), .5), (TOTAL, .3)])
fx[:, 0] += room * 0.03 * water_env
fx[:, 1] += np.roll(room, 777) * 0.03 * water_env


def drip(f0):
    t = np.arange(int(0.18 * SR)) / SR
    return np.sin(2 * np.pi * (f0 * t + 900 * t * t)) * np.exp(-t * 28) * 0.4


dr = np.random.default_rng(11)
tt = 2.0
while tt < TOTAL - 4:
    put(fx, drip(dr.uniform(700, 1400)), tt, 0.25 * float(water_env[int(tt * SR)]))
    tt += dr.uniform(1.4, 4.5)

# --- SFX library (shared/assets/sfx) ---
lib = {n: read(f"{SFX}/{n}.mp3") for n in ("whoosh-cinematic", "chime", "riser", "impact-bass-1", "sparkle")}
for ch in TL["chapters"][1:]:
    put(fx, lib["whoosh-cinematic"], ch["start"] - 1.1, 0.18)
for ch in TL["chapters"][2:]:
    put(fx, lib["chime"], ch["start"] - 0.2, 0.12)
put(fx, lib["riser"], c("c00_hook") + 0.2, 0.08)
put(fx, lib["impact-bass-1"], TL["voEnd"] + 0.2, 0.12)
put(fx, lib["sparkle"], TOTAL - 3.0, 0.12)

music *= 0.05 / max(1e-6, float(np.sqrt(np.mean(music ** 2))))
bed = music + fx
bed *= np.minimum(1, np.minimum(T / 1.0, (TOTAL - T) / 1.5))[:, None]
bed /= max(1.0, np.abs(bed).max() / 0.9)
save("public/audio/bed.wav", bed)

SC = ("[1:a]aformat=channel_layouts=stereo,asplit=2[v1][v2];[0:a]volume=-5dB[b];"
      "[b][v1]sidechaincompress=threshold=0.02:ratio=4:attack=20:release=450[bd];"
      "[bd][v2]amix=inputs=2:normalize=0:duration=first[m]")


def combine(bedf, vof, out):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", bedf, "-i", vof, "-filter_complex", SC, "-map", "[m]", "-ar", "48000", "-ac", "2", out], check=True)


combine("public/audio/bed.wav", "public/audio/vo.wav", "public/audio/full.wav")

# shorts: bed cut from the long bed along each short's segments (hook/outro use the opening/closing bed)
for n in ("01", "02"):
    sj = json.load(open(f"src/scenes/zamzam/short{n}.json", encoding="utf8"))
    M = int(sj["duration"] * SR)
    sb = np.zeros((M, 2))
    xf = int(0.3 * SR)
    segs = sj["segments"]
    for k, seg in enumerate(segs):
        a = c("c00_hook") if seg["kind"] == "hook" else c("c09_penutup") if seg["kind"] == "outro" else seg["srcStart"]
        i0 = int(seg["start"] * SR)
        i1 = int(segs[k + 1]["start"] * SR) + xf if k + 1 < len(segs) else M
        L = min(i1 - i0, M - i0)
        piece = bed[int(a * SR): int(a * SR) + L].copy()
        idx = np.arange(len(piece))
        sb[i0:i0 + len(piece)] += piece * np.minimum(1, np.minimum(idx / xf, (len(piece) - idx) / xf))[:, None]
    idx = np.arange(M)
    sb *= np.minimum(1, np.minimum(idx / (0.5 * SR), (M - idx) / (1.0 * SR)))[:, None]
    save(f"public/audio/short{n}_bed.wav", sb)
    combine(f"public/audio/short{n}_bed.wav", f"public/audio/short{n}_vo.wav", f"public/audio/short{n}_full.wav")
print("bed", TOTAL, "s")
