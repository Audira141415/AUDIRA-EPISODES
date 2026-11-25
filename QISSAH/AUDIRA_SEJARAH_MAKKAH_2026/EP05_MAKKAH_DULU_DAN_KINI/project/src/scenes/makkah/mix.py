"""EP05 MAKKAH DULU DAN KINI: music + ambience + SFX bed (no voice). Run from project/.

Identity for this episode: maqam Hijaz on D, a slow engraver's drone, ney-like breathed phrases at each
chapter door, sparse qanun-like plucks, and the world's own sound (wind in the valley, rain and running
water for the floods, sea swell for the voyage, a low city hum for the modern chapter). Percussion is a
barely-there frame-drum pulse. No singing.

Writes public/audio/bed.wav (= timeline total), then the shorts' beds, then combines each bed with its
voice (ffmpeg sidechaincompress, voice on top) into public/audio/full.wav and short0N_full.wav.
"""
import json
import subprocess
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
TL = json.load(open("src/scenes/makkah/timeline.json", encoding="utf8"))
TOTAL = TL["total"]
N = int(TOTAL * SR)
rng = np.random.default_rng(1360)
import os
SFX = next(d for d in ("../../../shared/assets/sfx/", "../../../../shared/assets/sfx/") if os.path.isdir(d))  # seri selesai ada di <WS>/<KODE_CHANNEL>/<SERI>
CH = {c["id"]: c for c in TL["chapters"]}


def sos(kind, f):
    return butter(2, f, btype=kind, fs=SR, output="sos")


def band(x, lo, hi):
    return sosfilt(sos("bandpass", [lo, hi]), x)


def lp(x, f):
    return sosfilt(sos("lowpass", f), x)


def hp(x, f):
    return sosfilt(sos("highpass", f), x)


def env(points, n=N):
    xs, ys = zip(*points)
    return np.interp(np.arange(n) / SR, xs, ys)


def read(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def save(path, a):
    pcm = (np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes()
    with wave.open(path, "wb") as o:
        o.setnchannels(2)
        o.setsampwidth(2)
        o.setframerate(SR)
        o.writeframes(pcm)


L = np.zeros(N)
R = np.zeros(N)


def put(sig, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0 or i >= N:
        return
    if sig.ndim == 1:
        th = (pan + 1) * np.pi / 4
        sig = np.stack([sig * np.cos(th), sig * np.sin(th)], 1)
    e = min(N, i + len(sig))
    L[i:e] += g * sig[: e - i, 0]
    R[i:e] += g * sig[: e - i, 1]


# ---------------------------------------------------------------- instruments
D4 = 293.66
HIJAZ = [0, 1, 4, 5, 7, 8, 10, 12]  # D Eb F# G A Bb C D


def hz(step, octave=0):
    o, s = divmod(step, len(HIJAZ) - 1)
    return D4 * 2 ** ((HIJAZ[s] + 12 * (o + octave)) / 12)


def ney(f, dur, g=1.0):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + 0.0055 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.6)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    tone = np.sin(ph) + 0.28 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    breath = band(rng.standard_normal(len(t)), f * 1.5, min(f * 6, 9000)) * 0.9
    a = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.6)
    return g * a * (0.75 * tone + breath * (0.35 + 0.25 * np.exp(-t * 3)))


def pluck(f, dur=2.2, g=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + 0.0007 * h)) * np.exp(-t * (2.2 + 1.4 * h)) / h for h in range(1, 8))
    return g * x * np.minimum(1, t / 0.002)


def daf(g=1.0):
    t = np.arange(int(0.5 * SR)) / SR
    body = np.sin(2 * np.pi * (58 * t + 30 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 9)
    slap = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 60) * 0.25
    return g * (body + slap)


def phrase(t0, steps, octave=0, beat=0.72, g=0.5, pan=0.0):
    t = t0
    for st, ln in steps:
        put(ney(hz(st, octave), ln * beat + 0.25, g), t, 1.0, pan)
        t += ln * beat
    return t


# ---------------------------------------------------------------- drone (whole film)
t = np.arange(N) / SR
swell = 0.55 + 0.45 * np.sin(2 * np.pi * t / 37.0) ** 2
drone = np.zeros(N)
for f, a in [(73.42, 1.0), (110.0, 0.55), (146.83, 0.35), (220.0, 0.16)]:
    drone += a * (np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * f * 2.003 * t))
drone = lp(drone, 900) * swell
# chapter colour of the drone: thinner in the floods, warmer at the payoff
dl = env([(0, 0.7), (CH["c02_lembah"]["start"], 0.6), (CH["c04_banjir_1941"]["end"], 0.5), (CH["c06_nusantara"]["start"], 0.6),
          (CH["c09_payoff"]["start"], 0.75), (TL["voEnd"], 0.9), (TOTAL - 1.5, 0.6), (TOTAL, 0)])
put(np.stack([drone * dl, np.roll(drone, 700) * dl], 1), 0, 0.22)

# ---------------------------------------------------------------- ambience per world
def noise(n):
    return rng.standard_normal(n)


def region(cid_a, cid_b=None, pre=1.0, post=1.0):
    a = CH[cid_a]["start"] - pre
    b = CH[cid_b or cid_a]["end"] + post
    return max(0, a), min(TOTAL, b)


def amb(a, b, sig_fn, g, fade=2.0):
    n = int((b - a) * SR)
    x = sig_fn(n)
    tt = np.arange(n) / SR
    x *= np.minimum(1, np.minimum(tt / fade, (b - a - tt) / fade))
    put(np.stack([x, np.roll(x, 911)], 1), a, g)


wind = lambda n: band(noise(n), 250, 1400) * (0.6 + 0.4 * np.sin(2 * np.pi * np.arange(n) / SR / 9.0) ** 2)
water = lambda n: band(noise(n), 300, 3500) * (0.7 + 0.3 * np.sin(2 * np.pi * np.arange(n) / SR / 3.1))
rain = lambda n: hp(noise(n), 3000) * 0.8 + band(noise(n), 600, 2000) * 0.4
sea = lambda n: lp(noise(n), 500) * (0.35 + 0.65 * np.sin(2 * np.pi * np.arange(n) / SR / 7.5) ** 4)
city = lambda n: band(noise(n), 90, 400) * 0.8
trickle = lambda n: band(noise(n), 1500, 6000) * (0.5 + 0.5 * (np.sin(2 * np.pi * np.arange(n) / SR * 0.7) > 0.2))

amb(0, CH["c00_hook"]["end"], water, 0.05)
amb(*region("c02_lembah"), wind, 0.05)
amb(*region("c03_banjir_klasik"), water, 0.06)
amb(*region("c04_banjir_1941"), rain, 0.04)
amb(*region("c04_banjir_1941"), water, 0.05)
amb(*region("c05_zubaidah"), trickle, 0.03)
amb(*region("c06_nusantara"), sea, 0.12)
amb(*region("c06_nusantara"), wind, 0.025)
amb(*region("c07_ajyad_menara"), wind, 0.03)
amb(*region("c08_kota_modern"), city, 0.06)
amb(TL["voEnd"] - 2, TOTAL, wind, 0.03)

# ---------------------------------------------------------------- melody: ney at chapter doors, plucks inside
motifs = [
    [(4, 1.5), (3, 0.5), (2, 1), (1, 1), (0, 2)],
    [(0, 1), (1, 1), (2, 1.5), (4, 0.5), (3, 2)],
    [(4, 1), (5, 1), (4, 0.5), (3, 0.5), (2, 2)],
    [(2, 1), (3, 1), (4, 2), (2, 1), (1, 2)],
]
for k, c in enumerate(TL["chapters"]):
    phrase(c["start"] - 1.1, motifs[k % len(motifs)], octave=0 if k % 2 else -1, g=0.34, pan=-0.3 if k % 2 else 0.3)
    # qanun figures under the first clip of each chapter, sparse
    for j in range(6):
        st = [0, 2, 4, 3, 1, 0][j]
        put(pluck(hz(st, -1 + (j % 2)), 2.4, 0.22), c["start"] + 2.5 + j * 1.45, 1.0, 0.4 if j % 2 else -0.4)
# frame-drum pulse, very light, only in the voyage and the modern city
for cid, bpm in [("c06_nusantara", 66), ("c08_kota_modern", 72)]:
    a, b = region(cid, pre=0, post=0)
    beat = 60 / bpm
    k = 0
    while a + k * beat < b - 1:
        put(daf(0.12 if k % 4 == 0 else 0.05), a + k * beat)
        k += 1
# end screen: full ney phrase over the drone
phrase(TL["voEnd"] + 0.6, [(0, 1), (1, 1), (2, 1), (4, 2), (3, 1), (2, 1), (1, 1), (0, 3)], octave=-1, beat=1.0, g=0.36)

# ---------------------------------------------------------------- SFX
lib = {n: read(SFX + n + ".mp3") for n in ["whoosh-cinematic", "chime", "impact-bass-1", "riser", "whoosh-short"]}
for c in TL["chapters"][1:]:
    put(lib["whoosh-cinematic"], c["start"] - 1.3, 0.16)
    put(lib["chime"], c["start"] + 0.2, 0.09)
put(lib["impact-bass-1"], 0.6, 0.22)
put(lib["riser"], CH["c07_ajyad_menara"]["start"] + 52, 0.08)
put(lib["riser"], CH["c09_payoff"]["start"] - 2.5, 0.08)

bed = np.stack([L, R], 1)
bed[-int(1.5 * SR):] *= np.linspace(1, 0, int(1.5 * SR))[:, None]
save("out/_bed_raw.wav", bed / max(1e-6, np.abs(bed).max()) * 0.9)


def loudnorm(src, dst, target):
    p = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", f"loudnorm=I={target}:TP=-2:LRA=14:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    blk = p.stderr[p.stderr.rindex("{"):]
    m = json.loads(blk[: blk.index("}") + 1])
    af = (f"loudnorm=I={target}:TP=-2:LRA=14:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af", af, "-ar", str(SR), "-ac", "2", dst], check=True)


loudnorm("out/_bed_raw.wav", "public/audio/bed.wav", -26)

SC = ("[1:a]aformat=channel_layouts=stereo,asplit=2[v1][v2];[0:a]volume=-5dB[b];"
      "[b][v1]sidechaincompress=threshold=0.02:ratio=4:attack=20:release=450[bd];[bd][v2]amix=inputs=2:normalize=0:duration=first[m]")


def combine(bedf, vof, out):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", bedf, "-i", vof, "-filter_complex", SC, "-map", "[m]", "-ar", "48000", "-ac", "2", out], check=True)


combine("public/audio/bed.wav", "public/audio/vo.wav", "public/audio/full.wav")

# ---------------------------------------------------------------- shorts: bed cut from the long bed along each short's world clock
long_bed = read("public/audio/bed.wav")
for sid in ["short01", "short02"]:
    S = json.load(open(f"src/scenes/makkah/{sid}.json", encoding="utf8"))
    n = int(S["total"] * SR)
    out = np.zeros((n, 2))
    segs = S["segments"]
    xf = int(0.06 * SR)
    for k, g in enumerate(segs):
        a = int(g["start"] * SR)
        b = int((segs[k + 1]["start"] if k + 1 < len(segs) else S["total"]) * SR)
        src0 = int(g["worldStart"] * SR) if g["kind"] != "outro" else int((TL["voEnd"] + 2) * SR)
        seg = long_bed[src0 : src0 + (b - a) + xf].copy()
        if len(seg) < (b - a) + xf:
            seg = np.pad(seg, ((0, (b - a) + xf - len(seg)), (0, 0)))
        seg[:xf] *= np.linspace(0, 1, xf)[:, None]
        seg[-xf:] *= np.linspace(1, 0, xf)[:, None]
        e = min(n, a + len(seg))
        out[a:e] += seg[: e - a]
    out[: int(0.3 * SR)] *= np.linspace(0.4, 1, int(0.3 * SR))[:, None]
    out[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))[:, None]
    # hook hit
    hit = lib["impact-bass-1"][: n]
    out[: len(hit)] += 0.18 * hit
    save(f"public/audio/{sid}_bed.wav", out)
    combine(f"public/audio/{sid}_bed.wav", f"public/audio/{sid}_vo.wav", f"public/audio/{sid}_full.wav")
    print(sid, "bed", round(S["total"], 2), "s")
print("bed", round(TOTAL, 3), "s")
