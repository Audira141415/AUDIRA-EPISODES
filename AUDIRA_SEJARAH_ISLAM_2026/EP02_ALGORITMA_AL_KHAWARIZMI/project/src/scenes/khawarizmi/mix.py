"""EP02 Khawarizmi bed: music + ambience + SFX, no voice (run from project/).

Identity: "ink by candlelight". A soft A drone (A1 + E2, slow tremolo on the fifth), oud-like
plucks (low harmonics, a tiny pitch fall) walking maqam Rast on A (A B C#- D E F# G), rare
qanun-like runs at part openings, one breathy ney phrase per part, a very light frame-drum pulse
only under the balance and the numerals, and foley: room tone, candle crackle, quill scratches
while words are written, sand scraping for the canal and the numerals. Shared SFX on key beats.
Every time comes from the words of timeline.json (no absolute seconds).
Writes public/audio/bed.wav, then public/audio/full.wav (bed ducked under public/audio/vo.wav).
"""
import json
import re
import subprocess
import wave

import numpy as np
from scipy.signal import lfilter

SR = 48000
TL = json.load(open("src/scenes/khawarizmi/timeline.json", encoding="utf8"))
TOTAL = TL["total"]
VO_END = TL["voEnd"]
N = int(TOTAL * SR)
T = np.arange(N) / SR
rng = np.random.default_rng(820)
SFX = "../../../shared/assets/sfx"
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

# --- drone: A1 + E2 + A2, fifth with a slow tremolo; level follows the story ---
A = 55.0
trem = 0.6 + 0.4 * np.sin(2 * np.pi * T / 17.0)
drone = (np.sin(2 * np.pi * A * T) * 0.5 + np.sin(2 * np.pi * A * 1.5 * T + 0.4) * 0.24 * trem
         + np.sin(2 * np.pi * A * 2 * T + 1.3) * 0.14 + np.sin(2 * np.pi * A * 4.005 * T) * 0.03)
mood = env_pts([(0, 0), (1.2, .7), (p("context"), .6), (p("main"), .8), (p("explanation"), .75),
                (p("payoff"), .9), (at("payoff", "Dari papan"), 1.0), (p("outro"), .8), (VO_END, .9), (TOTAL, 0)])
music[:, 0] += drone * mood * 0.3
music[:, 1] += np.roll(drone, int(0.013 * SR)) * mood * 0.3

# --- maqam Rast on A (quarter-tone third and seventh) ---
RAST = [0, 2, 3.5, 5, 7, 9, 10.5, 12]


def oud(f, dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    bend = 1 + 0.004 * np.exp(-t * 18)
    ph = 2 * np.pi * np.cumsum(f * bend) / SR
    tone = sum(np.sin(ph * h) * np.exp(-t * (2.2 + h * 1.3)) / (h ** 1.2) for h in range(1, 7))
    body = lowpass(tone, 0.25)
    return body * np.minimum(1, t / 0.004) * 0.3


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


note = lambda deg, octv=2: A * octv * 2 ** (RAST[deg % 8] / 12 + deg // 8)

# oud walks: a slow 2-bar figure through the film, sparser under dense narration
pr = np.random.default_rng(9)
figure = [0, 2, 3, 4, 3, 2, 1, 0, 4, 5, 4, 3, 2, 3, 1, 0]
beat = 0.78
tt = 1.4
k = 0
while tt < VO_END + 1.5:
    if pr.random() < 0.72:
        put(music, oud(note(figure[k % len(figure)], 2), 1.4), tt, 0.5, pan=-0.25)
    if k % 4 == 0:
        put(music, oud(note(0, 1), 2.0), tt, 0.32, pan=-0.1)
    tt += beat * (2 if k % 4 == 3 else 1)
    k += 1

# qanun run into every part opening
for pid in ("context", "main", "explanation", "payoff", "outro"):
    for j, deg in enumerate([0, 2, 4, 5, 7]):
        put(music, qanun(note(deg, 4)), p(pid) - 0.75 + j * 0.12, 0.45, pan=0.3)

# one ney phrase per part
for pid, degs in (("context", [4, 3, 4]), ("main", [2, 3, 1]), ("explanation", [5, 4, 3]), ("payoff", [7, 5, 4]), ("outro", [4, 2, 0])):
    t0 = p(pid) + 1.2
    for j, deg in enumerate(degs):
        put(music, ney(note(deg, 4), 2.4 + j * 0.3), t0 + j * 2.1, 0.5, pan=0.15)


# light frame drum under the balance and the numerals only
def drum():
    t = np.arange(int(0.35 * SR)) / SR
    return (np.sin(2 * np.pi * (65 * t + 25 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 11)
            + 0.15 * lowpass(rng.standard_normal(len(t)), .2) * np.exp(-t * 30))


for a, b in ((at("main", "Caranya"), at("main", "diseimbangkan", which="e")),
             (at("explanation", "Buku aritmetikanya"), at("explanation", "Arab", which="e"))):
    bt = a
    while bt < b:
        put(music, drum(), bt, 0.09)
        put(music, drum(), bt + beat * 0.5, 0.04)
        bt += beat * 2

# --- ambience: library room tone + candle crackle ---
room = lowpass(rng.standard_normal(N), 0.003) * 6
fx[:, 0] += room * 0.025
fx[:, 1] += np.roll(room, 911) * 0.025
cr = np.random.default_rng(31)
tt = 0.5
while tt < TOTAL - 1:
    n = int(0.012 * SR)
    pop = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 400)
    put(fx, lowpass(pop, 0.4), tt, 0.05 * cr.uniform(0.4, 1), pan=cr.uniform(-0.6, 0.6))
    tt += cr.uniform(0.25, 2.2)


def scratch(dur, bright=0.35, rate=11):
    """Quill (bright) or stylus-in-sand (dark) scratching, in short strokes."""
    t = np.arange(int(dur * SR)) / SR
    noise = lowpass(rng.standard_normal(len(t)), bright) - lowpass(rng.standard_normal(len(t)), bright * 0.1)
    strokes = np.clip(np.sin(2 * np.pi * rate * t + 2 * np.sin(2 * np.pi * 2.3 * t)), 0, 1) ** 2
    return noise * strokes * np.minimum(1, np.minimum(t / 0.05, (dur - t) / 0.1)) * 0.35


def write_span(a, b, bright, g, rate=11):
    if b > a:
        put(fx, scratch(b - a, bright, rate), a, g, pan=0.1)


# quill: the equation words, the payoff pseudo-script; sand: canal and numerals
write_span(at("main", "x kuadrat sama dengan"), at("main", "kuadrat", 1, "e"), 0.45, 0.22)
write_span(at("payoff", "Semua persamaan") + 0.1, at("payoff", "Semua persamaan") + 1.85, 0.45, 0.2)
write_span(at("main", "menggali") - 0.1, at("main", "kanal", which="e") + 0.25, 0.08, 0.35, 6)
write_span(at("explanation", "angka India") - 0.15, at("explanation", "angka Arab") + 0.35, 0.1, 0.3, 7)
# sweep of the sand
put(fx, scratch(0.8, 0.05, 2), at("explanation", "Buku aritmetikanya"), 0.35)

# --- SFX library (shared/assets/sfx) ---
lib = {n: read(f"{SFX}/{n}.mp3") for n in ("whoosh-cinematic", "whoosh-short", "chime", "riser", "impact-bass-1", "sparkle", "click-soft", "typing", "ping", "pop")}
for pid in ("context", "main", "explanation", "outro"):
    put(fx, lib["whoosh-cinematic"], p(pid) - 1.0, 0.12)
put(fx, lib["chime"], at("hook", "Itu nama orang") - 0.05, 0.1)
put(fx, lib["pop"], at("context", "Khwarazm"), 0.09)
put(fx, lib["pop"], at("context", "dan bekerja") + 1.0, 0.07)
put(fx, lib["whoosh-short"], at("main", "dipindah"), 0.12)
put(fx, lib["click-soft"], at("main", "diseimbangkan"), 0.16)
put(fx, lib["whoosh-short"], at("main", "menjadi"), 0.1)
put(fx, lib["sparkle"], at("explanation", "hilang") - 0.3, 0.12)
put(fx, lib["chime"], at("explanation", "Dixit") - 0.05, 0.13)
put(fx, lib["sparkle"], at("explanation", "algorithm") - 0.2, 0.1)
for ph in ("x", "tambah", "sama dengan"):
    put(fx, lib["click-soft"], at("payoff", ph), 0.18)
put(fx, lib["riser"], at("payoff", "Dari papan") - 1.2, 0.08)
put(fx, lib["whoosh-short"], at("payoff", "papan pasir"), 0.08)
put(fx, lib["whoosh-short"], at("payoff", "naskah Latin"), 0.08)
put(fx, lib["typing"], at("payoff", "kode program"), 0.1)
put(fx, lib["ping"], at("payoff", "feed"), 0.12)
put(fx, lib["impact-bass-1"], VO_END + 0.5, 0.11)
put(fx, lib["sparkle"], VO_END + 0.7, 0.1)

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
