"""EP04 Kiswah bed: music, ambience and SFX only (no voice). Run from project/:
    python src/scenes/kiswah/mix.py
Sound identity "benang dan alat tenun": a D drone in maqam Hijaz colour, breathy ney-like phrases at
each chapter, qanun-like plucks on the gold reveals, a soft frame-drum "dum" per chapter, quiet thread
ticks while stitching, library whooshes/sparkles. Reverent, no voice, no singing.
Writes public/audio/bed.wav (length = total), public/audio/vo.wav (copy), public/audio/full.wav,
and per short short0N_bed.wav + short0N_full.wav (bed cut contiguously from the long bed)."""
import json
import os
import re
import shutil
import subprocess

import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
EP = os.path.dirname(PROJ)
OUT = os.path.join(PROJ, "public", "audio")
SFX = next(d for d in (os.path.abspath(os.path.join(EP, *[".."] * n, "shared", "assets", "sfx")) for n in (2, 3)) if os.path.isdir(d))  # seri selesai ada di <WS>/<KODE_CHANNEL>/<SERI>
TL = json.load(open(os.path.join(HERE, "timeline.json"), encoding="utf8"))
TOTAL = TL["total"]
N = int(np.ceil(TOTAL * SR))
rng = np.random.default_rng(404)
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())


def W(ch, w, n=0):
    hits = [x for c in TL["clips"] if c["chapter"] == ch for x in c["words"] if norm(x["w"]) == norm(w)]
    return hits[n]["s"]


CH = {c["id"]: c for c in TL["chapters"]}
bed = np.zeros((N, 2), dtype=np.float32)


def put(sig, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or len(sig) == 0:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    s = sig if sig.ndim == 2 else np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    e = min(N, i + len(s))
    bed[i:e] += (g * s[: e - i]).astype(np.float32)


def read(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).reshape(-1, 2)


def env_adsr(n, att, rel):
    t = np.arange(n) / SR
    d = n / SR
    return np.minimum(1, np.minimum(t / max(att, 1e-3), np.maximum(0, (d - t) / max(rel, 1e-3))))


# ---------- 1. drone (whole film), D2 + A2 + soft D3, slow breathing ----------
t = np.arange(N, dtype=np.float64) / SR
drone = np.zeros(N, dtype=np.float64)
for f, g, det in [(73.42, 0.5, 0.11), (110.0, 0.32, 0.07), (146.83, 0.14, 0.05), (220.0, 0.05, 0.03)]:
    drone += g * (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * (f + det) * t + 1.3))
lfo = 0.75 + 0.25 * np.sin(2 * np.pi * t / 23.0)
# swell in the gaps between chapters, fade in at the start, fade before the outro
gate = np.full(N, 0.55)
for c in TL["chapters"]:
    a = int(max(0, c["start"] - 1.4) * SR)
    b = int(min(TOTAL, c["start"] + 1.2) * SR)
    gate[a:b] = np.maximum(gate[a:b], 0.9)
cs = np.concatenate([[0.0], np.cumsum(gate)])
half = SR // 2
idx = np.arange(N)
lo = np.clip(idx - half, 0, N)
hi = np.clip(idx + half, 0, N)
gate = (cs[hi] - cs[lo]) / np.maximum(1, hi - lo)
del cs, idx, lo, hi
fade = np.minimum(1, t / 3.0) * np.clip((TOTAL - 0.5 - t) / 3.0, 0, 1)
drone *= lfo * gate * fade * 0.06
bed[:, 0] += drone.astype(np.float32)
bed[:, 1] += (np.roll(drone, 240) * 0.95).astype(np.float32)
del drone, lfo, gate

# ---------- 2. breath air: noise lowpassed, very low ----------
air = rng.standard_normal(N).astype(np.float32)
air = np.convolve(air, np.ones(48) / 48, mode="same").astype(np.float32)
air = np.convolve(air, np.ones(48) / 48, mode="same").astype(np.float32)
air *= (0.012 * (0.7 + 0.3 * np.sin(2 * np.pi * t / 17.0)) * fade).astype(np.float32)
bed[:, 0] += air
bed[:, 1] += np.roll(air, 4000)
del air, t

# ---------- 3. ney-like phrases (Hijaz on D4) ----------
HIJAZ = [293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 523.25, 587.33]


def ney(f, d):
    n = int(d * SR)
    tt = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * tt) * np.minimum(1, tt / 0.4)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    tone = np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    br = rng.standard_normal(n)
    br = np.convolve(br, np.ones(12) / 12, mode="same") * 0.25
    return (tone + br * np.sin(ph) ** 2) * env_adsr(n, 0.18, 0.45)


for k, c in enumerate(TL["chapters"]):
    r = np.random.default_rng(100 + k)
    t0 = max(0.2, c["start"] - 1.25)
    steps = [0, 2, 3, 4, 3, 2, 1, 0] if k % 2 else [4, 5, 4, 3, 2, 1, 2, 0]
    n_notes = 4 + r.integers(0, 3)
    tt = t0
    for i in range(n_notes):
        d = [0.45, 0.6, 0.35, 0.9][(i + k) % 4]
        put(ney(HIJAZ[steps[i % len(steps)]], d + 0.3), tt, 0.05, pan=-0.2)
        tt += d

# ---------- 4. qanun-like plucks on gold reveals ----------


def pluck(f, d=1.6):
    n = int(d * SR)
    p = int(SR / f)
    buf = rng.uniform(-1, 1, p)
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out * env_adsr(n, 0.002, 0.3)


PL = {f: pluck(f) for f in (293.66, 369.99, 440.0, 587.33, 739.99)}
gold_moments = [
    W("c00_hook", "emasnya"),
    W("c01_intro", "kiswah"),
    W("c02_tubba", "bergaris"),
    W("c04_warna", "hitam", 1),
    W("c05_mesir", "membiayai"),
    W("c06_1927", "terpasang"),
    W("c07_pabrik", "sebenarnya"),
    W("c07_pabrik", "lima", 2),
    W("c08_ganti", "tirai"),
    W("c09_payoff", "lapisan"),
]
for m in gold_moments:
    for i, f in enumerate((293.66, 440.0, 587.33, 739.99)):
        put(PL[f], m + i * 0.11, 0.06, pan=0.25)

# ---------- 5. soft frame-drum "dum" at each chapter ----------


def dum():
    n = int(0.9 * SR)
    tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * (62 + 30 * np.exp(-tt * 18)) * tt) * np.exp(-tt * 5.5)
    skin = rng.standard_normal(n) * np.exp(-tt * 60) * 0.25
    return body + np.convolve(skin, np.ones(20) / 20, mode="same")


D = dum()
for c in TL["chapters"][2:]:
    put(D, c["start"] - 0.25, 0.12)
    put(D, c["start"] + 0.42, 0.06)

# ---------- 6. thread ticks while the needle works ----------


def tick():
    n = int(0.07 * SR)
    x = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 70)
    return np.convolve(x, np.ones(6) / 6, mode="same")


for a, b in [(CH["c00_hook"]["start"], W("c00_hook", "dulu")), (W("c07_pabrik", "disulam"), W("c07_pabrik", "bahannya")), (W("c07_pabrik", "timbul"), W("c07_pabrik", "hasilnya")), (W("c09_payoff", "kerja"), W("c09_payoff", "menurutmu"))]:
    tt = a
    while tt < b:
        put(tick(), tt, 0.03, pan=float(rng.uniform(-0.3, 0.3)))
        tt += 0.32 + rng.uniform(0, 0.25)

# ---------- 7. library SFX ----------
whoosh = read(os.path.join(SFX, "whoosh-cinematic.mp3"))
sparkle = read(os.path.join(SFX, "sparkle.mp3"))
riser = read(os.path.join(SFX, "riser.mp3"))
impact = read(os.path.join(SFX, "impact-bass-1.mp3"))
chime = read(os.path.join(SFX, "chime.mp3"))
for c in TL["chapters"][1:]:
    put(whoosh, c["start"] - 1.1, 0.14)
for m in gold_moments:
    put(sparkle, m - 0.05, 0.08)
put(impact, W("c00_hook", "ton"), 0.12)
put(impact, W("c06_1927", "darurat"), 0.1)
put(riser, W("c09_payoff", "lapisan") - 3.2, 0.08)
put(chime, TL["voEnd"] + 0.4, 0.1)
put(chime, TOTAL - 3.0, 0.12)

# ---------- write, loudness-normalise, combine ----------
os.makedirs(OUT, exist_ok=True)
raw = os.path.join(PROJ, "out", "bed_raw.f32")
os.makedirs(os.path.dirname(raw), exist_ok=True)
bed.tofile(raw)
bed_wav = os.path.join(OUT, "bed.wav")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-af", f"loudnorm=I=-24:TP=-3:LRA=12,apad=whole_dur={TOTAL:.3f},atrim=0:{TOTAL:.3f}", "-ar", str(SR), bed_wav], check=True)
os.remove(raw)
shutil.copyfile(os.path.join(EP, "audio", "vo.wav"), os.path.join(OUT, "vo.wav"))

FC = "[1:a]aformat=channel_layouts=stereo,asplit=2[v1][v2];[0:a]volume=-5dB[b];[b][v1]sidechaincompress=threshold=0.02:ratio=4:attack=20:release=450[bd];[bd][v2]amix=inputs=2:normalize=0:duration=first[m]"


def combine(bedf, vof, dst, dur):
    # the snippet's chain, plus a pad so the mix is exactly as long as the timeline
    fc = FC.replace("duration=first[m]", f"duration=first,apad=whole_dur={dur:.3f},atrim=0:{dur:.3f}[m]")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", bedf, "-i", vof, "-filter_complex", fc, "-map", "[m]", "-ar", "48000", "-ac", "2", dst], check=True)


combine(bed_wav, os.path.join(OUT, "vo.wav"), os.path.join(OUT, "full.wav"), TOTAL)
print("long full.wav done")

# shorts: contiguous slice of the long bed, so the hook flows into the reused span
for sid in ("short01", "short02"):
    spec = json.load(open(os.path.join(HERE, f"{sid}.json"), encoding="utf8"))
    a = spec["srcStart"] - spec["bodyStart"]
    d = spec["duration"]
    sb = os.path.join(OUT, f"{sid}_bed.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{a:.3f}", "-t", f"{d:.3f}", "-i", bed_wav, "-af", f"afade=t=in:d=0.6,afade=t=out:st={d - 2.5:.3f}:d=2.5,apad=whole_dur={d:.3f}", "-ar", str(SR), sb], check=True)
    combine(sb, os.path.join(OUT, f"{sid}_vo.wav"), os.path.join(OUT, f"{sid}_full.wav"), d)
    print(sid, "full done")
