"""Bed for SEJARAH MAKKAH EP01 (run from project/): music + ambience + SFX, no voice.

Identity: a reverent Hijaz-on-D drone bed. Soft D/A drone, a breathy ney-like line in maqam Hijaz
at chapter openings, qanun-like plucked arpeggios (Karplus-Strong) on chapter cards, a very light
daf pulse in the hook and payoff only. Ambience follows the set: desert wind, the Red Sea shore in
chapter 2, rain and running water in chapter 7. SFX from <WS>/shared/assets/sfx/.

Writes public/audio/bed.wav (length = timeline total), then full.wav (voice on top, bed ducked by
sidechaincompress), and the two shorts' beds + full mixes.
"""
import json, re, subprocess, wave
import numpy as np

SR = 48000
TL = json.load(open("src/scenes/kabah/timeline.json", encoding="utf8"))
TOTAL = TL["total"]
N = int(TOTAL * SR)
rng = np.random.default_rng(1631)
import os
SFX = next(d for d in ("../../../shared/assets/sfx", "../../../../shared/assets/sfx") if os.path.isdir(d))  # seri selesai ada di <WS>/<KODE_CHANNEL>/<SERI>
norm = lambda s: re.sub(r"[.,:;?!]", "", s.lower())


def ch(cid):
    return next(c for c in TL["chapters"] if c["id"].startswith(cid))


def W(cid, word, nth=0):
    k = 0
    for c in TL["clips"]:
        if c["chapter"].startswith(cid):
            for x in c["words"]:
                if norm(x["w"]) == word:
                    if k == nth:
                        return x["s"]
                    k += 1
    raise KeyError((cid, word, nth))


def env(pts, t):
    xs, ys = zip(*pts)
    return np.interp(t, xs, ys)


def lowpass(x, a):
    from scipy.signal import lfilter
    return lfilter([1 - a], [1, -a], x)


def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += (sig[: j - i] * gain).astype(np.float32)


def load_sfx(name):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{SFX}/{name}.mp3", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


L = np.zeros(N, np.float32)
R = np.zeros(N, np.float32)
CH_S = 30 * SR  # continuous layers are synthesised in 30 s chunks (float64 time inside a chunk)

# ---------------------------------------------------------------- drone (D2 + A2 + D3) and desert wind, breathing slowly
c8 = ch("c08")["start"]
DARK = [(0, 0), (c8 + 20, 0), (c8 + 26, 1), (c8 + 40, 1), (c8 + 50, 0), (TOTAL, 0)]
FADE = [(0, 0), (1.5, 1), (TOTAL - 4, 1), (TOTAL, 0.4)]
# wind: heavily low-passed noise synthesised at 2400 Hz, then interpolated up
WSR = 2400
wn = lowpass(lowpass(rng.standard_normal(int(TOTAL * WSR) + 10), 0.95), 0.9)
wn = wn / (np.abs(wn).max() + 1e-9)
for i0 in range(0, N, CH_S):
    i1 = min(N, i0 + CH_S)
    t = np.arange(i0, i1) / SR
    dr = np.zeros(i1 - i0)
    for f, a_ in [(73.42, 1.0), (110.0, 0.55), (146.83, 0.35), (220.0, 0.12)]:
        lfo = 0.75 + 0.25 * np.sin(2 * np.pi * t / (19 + f % 7) + f)
        dr += a_ * lfo * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.07 * t))
    dr *= 0.06 * env(FADE, t) * (1 - 0.35 * env(DARK, t))
    w = np.interp(t * WSR, np.arange(len(wn)), wn) * 0.05 * (0.6 + 0.4 * np.sin(2 * np.pi * t / 23) ** 2)
    w2 = np.interp(t * WSR + 120, np.arange(len(wn)), wn) * 0.05 * (0.6 + 0.4 * np.sin(2 * np.pi * t / 23) ** 2)
    L[i0:i1] += (dr + w).astype(np.float32)
    R[i0:i1] += (dr * 0.97 + w2).astype(np.float32)

# ---------------------------------------------------------------- ney-like phrases in Hijaz (D)
HIJAZ = [293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 523.25, 587.33]


def ney(notes, dur_each, amp=0.05):
    out = []
    for idx in notes:
        f = HIJAZ[idx]
        n = int(dur_each * SR)
        t = np.arange(n) / SR
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 0.4, 0, 1)
        ph = 2 * np.pi * np.cumsum(f * vib) / SR
        tone = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
        breath = lowpass(rng.standard_normal(n), 0.9) * 0.25
        e = np.clip(t / 0.18, 0, 1) * np.clip((dur_each - t) / 0.35, 0, 1)
        out.append((tone + breath * (0.5 + 0.5 * e)) * e * amp)
    return np.concatenate(out)


PHRASES = [[0, 1, 2, 3, 2, 1, 0], [4, 3, 2, 1, 2, 0], [0, 2, 3, 4, 5, 4, 3], [7, 6, 5, 4, 3, 2], [3, 4, 5, 4, 2, 1, 0]]
for i, c in enumerate(TL["chapters"][2:]):
    p = ney(PHRASES[i % len(PHRASES)], 0.9 if i % 2 else 1.1, 0.032)
    place(L, p, c["start"] - 0.4, 0.95)
    place(R, p, c["start"] - 0.38, 1.0)
# a longer line under the payoff and the end screen
for k, t0 in enumerate([ch("c10")["start"] + 23, TL["voEnd"] + 0.5, TL["voEnd"] + 9]):
    p = ney(PHRASES[(k + 2) % 5], 1.3, 0.04)
    place(L, p, t0)
    place(R, p, t0 + 0.02)


# ---------------------------------------------------------------- qanun plucks on the chapter cards
def pluck(f, dur=1.6, amp=0.12):
    n = int(dur * SR)
    period = int(SR / f)
    buf = rng.uniform(-1, 1, period)
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = 0.996 * 0.5 * (buf[i % period] + buf[(i + 1) % period])
    return out * amp


ARP = [146.83, 220.0, 293.66, 369.99, 440.0]
plucks = {f: pluck(f) for f in ARP}
for c in TL["chapters"][2:]:
    for k, f in enumerate(ARP):
        place(L, plucks[f], c["start"] + 0.05 + k * 0.16, 0.9 if k % 2 else 0.6)
        place(R, plucks[f], c["start"] + 0.05 + k * 0.16, 0.6 if k % 2 else 0.9)


# ---------------------------------------------------------------- daf, very light, hook and payoff only
def daf(amp=0.18):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (58 + 30 * np.exp(-t * 30)) * t) * np.exp(-t * 9)
    slap = lowpass(rng.standard_normal(n), 0.6) * np.exp(-t * 60) * 0.25
    return (body + slap) * amp


d = daf()
for span in [(1.0, ch("c00")["end"]), (ch("c10")["start"], TL["voEnd"])]:
    t0 = span[0]
    beat = 60 / 72
    k = 0
    while t0 < span[1]:
        place(L, d, t0, 1.0 if k % 4 == 0 else 0.45)
        place(R, d, t0, 1.0 if k % 4 == 0 else 0.45)
        t0 += beat * (2 if k % 4 in (1, 3) else 1)
        k += 1

# ---------------------------------------------------------------- ambience in its windows only
def windowed(t0, t1, make, pts):
    i0, i1 = int(max(0, t0) * SR), int(min(TOTAL, t1) * SR)
    t = np.arange(i0, i1) / SR
    e = env(pts, t)
    l, r = make(len(t), t)
    L[i0:i1] += (l * e).astype(np.float32)
    R[i0:i1] += (r * e).astype(np.float32)


def sea(n, t):
    x = lowpass(rng.standard_normal(n + 4000), 0.97) * 0.018
    sw = 0.5 + 0.5 * np.sin(2 * np.pi * t / 6.5) ** 2
    return x[:n] * sw, x[4000:4000 + n] * sw


k0, k1 = W("c03", "kayunya"), W("c03", "koptik")
windowed(k0 - 1, k1 + 5, sea, [(k0 - 1, 0), (k0 + 1, 1), (k1 + 2, 1), (k1 + 5, 0)])


def rain_water(n, t):
    rn = (rng.standard_normal(n + 900) - lowpass(rng.standard_normal(n + 900), 0.8)) * 0.02
    wt = lowpass(rng.standard_normal(n + 1500), 0.92) * 0.03 * 1.0
    return rn[:n] + wt[:n], rn[900:900 + n] + wt[1500:1500 + n]


h0, u0, r0 = W("c08", "hujan"), W("c08", "utara"), W("c08", "runtuh")
windowed(h0 - 1, r0 + 1.5, rain_water, [(h0 - 1, 0), (h0 + 1, 1), (u0, 1), (r0 + 1.5, 0)])

# ---------------------------------------------------------------- SFX from the library
whoosh, chime, impact, sparkle, riser = (load_sfx(n) for n in ["whoosh-cinematic", "chime", "impact-bass-1", "sparkle", "riser"])


def sfx(sig, t0, g):
    place(L, sig[:, 0], t0, g)
    place(R, sig[:, 1], t0, g)


sfx(impact, 0.9, 0.35)
sfx(impact, W("c00", "seribu") - 0.1, 0.25)
for c in TL["chapters"][2:]:
    sfx(whoosh, c["start"] - 1.6, 0.22)
    sfx(chime, c["start"] + 0.1, 0.16)
sfx(sparkle, W("c04", "hijr"), 0.18)
sfx(sparkle, W("c05", "perak"), 0.16)
sfx(sparkle, W("c07", "perak"), 0.16)
sfx(riser, ch("c10")["start"] - 4.5, 0.12)
sfx(impact, TL["total"] - 3.0, 0.3)

# ---------------------------------------------------------------- write + loudness trim to -26 LUFS
mixd = np.stack([L, R], 1)
del L, R
mixd /= max(1.0, float(np.abs(mixd).max()) / 0.9)


def write(path, a):
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())


def lufs(path):
    e = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", e)[-1])


write("public/audio/bed.wav", mixd)
gain = 10 ** ((-26 - lufs("public/audio/bed.wav")) / 20)
mixd *= np.float32(gain)
write("public/audio/bed.wav", mixd)
print("bed LUFS", lufs("public/audio/bed.wav"))

FILTER = "[1:a]aformat=channel_layouts=stereo,asplit=2[v1][v2];[0:a]volume=-5dB[b];[b][v1]sidechaincompress=threshold=0.02:ratio=4:attack=20:release=450[bd];[bd][v2]amix=inputs=2:normalize=0:duration=first[m]"


def combine(bed, vo, out):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", bed, "-i", vo, "-filter_complex", FILTER, "-map", "[m]", "-ar", "48000", "-ac", "2", out], check=True)


combine("public/audio/bed.wav", "public/audio/vo.wav", "public/audio/full.wav")
print("full LUFS", lufs("public/audio/full.wav"))

# ---------------------------------------------------------------- shorts: the long bed, continuous from before the reused span
for sid in ["short01", "short02"]:
    sh = json.load(open(f"src/scenes/kabah/{sid}.json", encoding="utf8"))
    body = sh["segments"][1]
    start = max(0.0, body["src0"] - body["at"])
    a = mixd[int(start * SR): int((start + sh["duration"]) * SR)].copy()
    n = int(sh["duration"] * SR)
    if len(a) < n:
        a = np.concatenate([a, np.zeros((n - len(a), 2))])
    fade = np.clip(np.arange(n) / (0.4 * SR), 0, 1) * np.clip((n - np.arange(n)) / (1.2 * SR), 0, 1)
    a *= fade[:, None]
    # opening hit and the end card chime
    for sig, t0, g in [(impact, 0.05, 0.3), (chime, sh["segments"][2]["at"], 0.2), (impact, sh["duration"] - 3.0, 0.3)]:
        i = int(t0 * SR); j = min(n, i + len(sig)); a[i:j] += sig[: j - i] * g
    write(f"public/audio/{sid}_bed.wav", a)
    combine(f"public/audio/{sid}_bed.wav", f"public/audio/{sid}_vo.wav", f"public/audio/{sid}_full.wav")
    print(sid, "full LUFS", lufs(f"public/audio/{sid}_full.wav"))
