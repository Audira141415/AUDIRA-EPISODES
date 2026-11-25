"""Bed for SEJARAH ISLAM EP01 Al-Qarawiyyin (run from project/): music + ambience + SFX, no voice.

Identity (differs from the Makkah Hijaz bed): a calm maqam Bayati colour on G (G A-half-flat Bb C D),
a soft G/D drone with slow breathing, a ney-like line on part openings, qanun-like plucked figures
(Karplus-Strong) when the mosaic re-lays itself, a muted bendir pulse only under the hook and the
payoff, a courtyard ambience (fountain trickle) in the mosque beats, a quiet room tone in the library.
SFX from <WS>/shared/assets/sfx/ on key beats: tile clinks on each mosaic wave, the key turns, the
door opening, the outro chime. Every time is a word of the locked voice (timeline.json).

Writes public/audio/bed.wav (length = timeline total).
"""
import json, re, subprocess, wave
import numpy as np
from scipy.signal import lfilter

SR = 48000
TL = json.load(open("src/scenes/qarawiyyin/timeline.json", encoding="utf8"))
TOTAL = TL["total"]
N = int(TOTAL * SR)
rng = np.random.default_rng(859)
SFX = "../../../shared/assets/sfx"
norm = lambda s: re.sub(r"[.,:;?!]", "", s.lower())


def W(word, nth=0):
    k = 0
    for line in TL["lines"]:
        for x in line["words"]:
            if norm(x["w"]) == word:
                if k == nth:
                    return x["s"]
                k += 1
    raise KeyError((word, nth))


def part(pid):
    return next(p for p in TL["parts"] if p["id"] == pid)


def env(pts, t):
    xs, ys = zip(*pts)
    return np.interp(t, xs, ys)


def lowpass(x, a):
    return lfilter([1 - a], [1, -a], x)


L = np.zeros(N, np.float32)
R = np.zeros(N, np.float32)


def place(sig, t0, gl=1.0, gr=None):
    gr = gl if gr is None else gr
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0:
        return
    j = min(N, i + len(sig))
    L[i:j] += (sig[: j - i] * gl).astype(np.float32)
    R[i:j] += (sig[: j - i] * gr).astype(np.float32)


def load_sfx(name):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{SFX}/{name}.mp3", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


# ---------------------------------------------------------------- drone G2 + D3 + G3, breathing; dips in the payoff build
VOEND = TL["voEnd"]
FADE = [(0, 0), (1.2, 1), (VOEND + 1.0, 1), (TOTAL, 0.0)]
LIFT = [(0, 0.8), (part("payoff")["start"], 0.8), (W("membukanya"), 1.15), (W("tempat"), 1.0), (TOTAL, 1.0)]
CH = 30 * SR
for i0 in range(0, N, CH):
    i1 = min(N, i0 + CH)
    t = np.arange(i0, i1) / SR
    dr = np.zeros(i1 - i0)
    for f, a in [(98.0, 1.0), (146.83, 0.5), (196.0, 0.3), (293.66, 0.08)]:
        lfo = 0.72 + 0.28 * np.sin(2 * np.pi * t / (17 + f % 5) + f)
        dr += a * lfo * np.sin(2 * np.pi * f * t + 0.25 * np.sin(2 * np.pi * 0.05 * t))
    dr *= 0.055 * env(FADE, t) * env(LIFT, t)
    L[i0:i1] += dr.astype(np.float32)
    R[i0:i1] += (dr * 0.96).astype(np.float32)

# ---------------------------------------------------------------- ney-like phrases in Bayati on G (quarter-flat A)
BAYATI = [392.0, 427.5, 466.16, 523.25, 587.33, 622.25, 698.46, 783.99]


def ney(notes, dur, amp):
    out = []
    for idx in notes:
        f = BAYATI[idx]
        n = int(dur * SR)
        t = np.arange(n) / SR
        vib = 1 + 0.0045 * np.sin(2 * np.pi * 5.0 * t) * np.clip(t / 0.35, 0, 1)
        ph = 2 * np.pi * np.cumsum(f * vib) / SR
        tone = np.sin(ph) + 0.16 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
        breath = lowpass(rng.standard_normal(n), 0.9) * 0.28
        e = np.clip(t / 0.2, 0, 1) * np.clip((dur - t) / 0.4, 0, 1)
        out.append((tone + breath * (0.5 + 0.5 * e)) * e * amp)
    return np.concatenate(out)


PHRASES = [[0, 1, 2, 3, 2, 1, 0], [4, 3, 2, 1, 2, 0], [2, 3, 4, 5, 4, 3], [0, 2, 1, 0], [4, 5, 4, 3, 2, 1, 0]]
for k, p in enumerate(["context", "main", "explanation", "payoff", "outro"]):
    ph = ney(PHRASES[k], 1.0 if k % 2 else 1.15, 0.028)
    place(ph, part(p)["start"] - 0.5, 0.9, 1.0)
place(ney([0, 1, 2, 1, 0], 1.4, 0.034), VOEND + 0.3, 1.0, 0.9)


# ---------------------------------------------------------------- qanun plucks when the mosaic re-lays itself
def pluck(f, dur=1.5, amp=0.1):
    n = int(dur * SR)
    period = int(SR / f)
    buf = rng.uniform(-1, 1, period)
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = 0.996 * 0.5 * (buf[i % period] + buf[(i + 1) % period])
    return out * amp


ARP = [196.0, 233.08, 293.66, 392.0, 466.16]
plucks = {f: pluck(f) for f in ARP}
WAVES = [W("bukan"), W("abad", 0), W("menurut", 1), W("tumbuh"), W("tahun", 2), W("dijaga"), W("tempat")]
for n, t0 in enumerate(WAVES):
    seq = ARP if n % 2 == 0 else ARP[::-1]
    for k, f in enumerate(seq):
        place(plucks[f], t0 + 0.1 + k * 0.14, 0.85 if k % 2 else 0.55, 0.55 if k % 2 else 0.85)


# ---------------------------------------------------------------- bendir, muted, hook and payoff only
def bendir(amp=0.16):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (62 + 26 * np.exp(-t * 30)) * t) * np.exp(-t * 8)
    slap = lowpass(rng.standard_normal(n), 0.55) * np.exp(-t * 55) * 0.22
    return (body + slap) * amp


d = bendir()
for a, b in [(0.7, part("hook")["end"] + 0.4), (W("empat", 2), W("hewan") + 0.5)]:
    t0, k = a, 0
    while t0 < b:
        place(d, t0, 1.0 if k % 4 == 0 else 0.4)
        t0 += (60 / 76) * (2 if k % 4 in (1, 3) else 1)
        k += 1


# ---------------------------------------------------------------- ambience windows
def windowed(t0, t1, gen, pts):
    i0, i1 = int(max(0, t0) * SR), int(min(TOTAL, t1) * SR)
    t = np.arange(i0, i1) / SR
    e = env(pts, t)
    l, r = gen(len(t))
    L[i0:i1] += (l * e).astype(np.float32)
    R[i0:i1] += (r * e).astype(np.float32)


def trickle(n):
    x = rng.standard_normal(n + 3000)
    hp = x - lowpass(x, 0.7)
    am = 0.6 + 0.4 * np.abs(np.sin(np.arange(n + 3000) / SR * 2 * np.pi * 3.1)) ** 3
    y = lowpass(hp * am, 0.45) * 0.012
    return y[:n], y[3000:3000 + n]


a0, a1 = W("airnya"), W("tahun", 2)
windowed(a0 - 0.8, a1 + 1.0, trickle, [(a0 - 0.8, 0), (a0 + 0.8, 1), (a1, 0.7), (a1 + 1.0, 0)])


def room(n):
    y = lowpass(lowpass(rng.standard_normal(n + 2000), 0.985), 0.9) * 0.05
    return y[:n], y[2000:2000 + n]


l0, l1 = W("tahun", 2), W("ruang", 1)
windowed(l0, l1 + 1.0, room, [(l0, 0), (l0 + 1.5, 1), (l1, 1), (l1 + 1.0, 0)])

# ---------------------------------------------------------------- SFX
impact, whoosh, chime, sparkle, riser, click, clicks, pop = (load_sfx(n) for n in ["impact-bass-1", "whoosh-cinematic", "chime", "sparkle", "riser", "click", "click-soft", "pop"])


def sfx2(sig, t0, g):
    i = int(t0 * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    L[i:j] += (sig[: j - i, 0] * g).astype(np.float32)
    R[i:j] += (sig[: j - i, 1] * g).astype(np.float32)


sfx2(impact, 0.62, 0.3)
sfx2(impact, W("empat", 1) - 0.05, 0.2)
for t0 in WAVES:
    sfx2(whoosh, t0 - 0.9, 0.16)
    for k in range(6):  # tesserae landing: soft clicks over the wave
        sfx2(clicks, t0 + 0.5 + k * 0.22 + rng.uniform(0, 0.08), 0.1)
sfx2(sparkle, W("kairouan", 0), 0.12)
sfx2(sparkle, W("perempuan"), 0.1)
sfx2(pop, W("859"), 0.14)
for k in range(5):  # walls rising course by course
    sfx2(clicks, W("membangun", 0) + 0.3 + k * 1.3, 0.09)
sfx2(chime, W("ijazah"), 0.14)
sfx2(sparkle, W("sultan"), 0.12)
for t0 in [W("empat", 2), W("dipegang"), W("empat", 3), W("orang")]:
    sfx2(click, t0 + 0.45, 0.22)  # key goes in
for k in range(4):
    sfx2(click, W("keempatnya") + k * 0.16 + 0.3, 0.16)  # key turns
sfx2(riser, W("membukanya") - 1.6, 0.14)
sfx2(impact, W("membukanya") + 0.2, 0.26)
sfx2(sparkle, W("dalamnya"), 0.12)
sfx2(whoosh, W("1963") - 0.7, 0.16)
sfx2(chime, TL["voEnd"] + 0.6, 0.18)

# ---------------------------------------------------------------- write
st = np.stack([L, R], 1)
peak = np.abs(st).max()
if peak > 0.9:
    st *= 0.9 / peak
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open("public/audio/bed.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("bed.wav", round(len(pcm) / SR, 2), "s, peak", round(float(peak), 3))
