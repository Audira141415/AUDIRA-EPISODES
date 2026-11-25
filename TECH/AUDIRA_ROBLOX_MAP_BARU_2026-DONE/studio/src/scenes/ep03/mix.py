"""EP03 audio bed (ISOCRAFT): bouncy comic percussion + plucked bass/melody, machine hum, clock ticks,
and SFX anchored to word times of the locked voice. No voice in here.
Run from studio/:  python src/scenes/ep03/mix.py   -> public/audio/ep03/bed.wav
"""
import json, os, re, subprocess, wave
import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "timeline.json"), encoding="utf8"))
TOTAL = TL["total"]
VO_END = TL["voEnd"]
OUTRO = VO_END + 0.6
SFX_DIR = "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx"
OUT = os.path.join("public", "audio", "ep03", "bed.wav")
N = int(TOTAL * SR)
rng = np.random.default_rng(303)  # seeded


def norm(s):
    return re.sub(r"[^\w-]", "", s.lower())


def line(i):
    return next(l for l in TL["lines"] if l["id"] == i)


def W(i, word, nth=1):
    hits = [w for w in line(i)["words"] if norm(w["w"]) == norm(word)]
    return hits[nth - 1]["s"]


def L(i):
    return line(i)["start"]


bed = np.zeros((N, 2))


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    if sig.ndim == 1:
        bed[i : i + len(sig), 0] += sig * gain * l * 1.414
        bed[i : i + len(sig), 1] += sig * gain * r * 1.414
    else:
        bed[i : i + len(sig)] += sig * gain


def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
    return e


# ---------- instruments ----------
def kick(n=int(0.35 * SR)):
    t = np.arange(n) / SR
    f = 50 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def clap(n=int(0.22 * SR)):
    x = rng.standard_normal(n)
    x = np.convolve(x, np.ones(6) / 6, "same") - np.convolve(x, np.ones(40) / 40, "same")
    return x * env(n, 0.001, 0.05) * 0.8


def wood(freq=1700, n=int(0.09 * SR)):
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.7 * t)) * np.exp(-t * 60)


def pluck(freq, dur=0.5, bright=0.5):
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = (1 - bright * 0.5) * 0.5 * (buf[i % p] + buf[(i + 1) % p]) + bright * 0.25 * buf[i % p]
    return out * env(n, 0.001, dur * 0.6)


def bass(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)
    return np.tanh(x * 1.4) * env(n, 0.004, dur * 0.5)


# ---------- music: 112 BPM, C major bounce (C F G Am) ----------
BPM = 112
BEAT = 60 / BPM
END_MUSIC = OUTRO - 0.2
prog = [(130.81, [523.25, 659.25, 783.99]), (174.61, [698.46, 880.0, 523.25]), (196.0, [783.99, 987.77, 587.33]), (220.0, [880.0, 659.25, 523.25])]
pl_cache = {}


def cached_pluck(f, d=0.45, b=0.6):
    k = (round(f, 2), d, b)
    if k not in pl_cache:
        pl_cache[k] = pluck(f, d, b)
    return pl_cache[k]


K, C, Wd = kick(), clap(), wood()
beat = 0
t = 0.6
while t < END_MUSIC:
    bar, pos = divmod(beat, 4)
    root, mel = prog[bar % 4]
    sec = int(t // 16)
    full = t > 2.0  # sparse start under the hook headline
    add(K, t, 0.55 if pos in (0, 2) else 0.0)
    if full and pos in (1, 3):
        add(C, t, 0.35, 0.1)
    add(Wd, t + BEAT * 0.5, 0.12, -0.4)
    if full and pos == 3:
        add(wood(2300), t + BEAT * 0.75, 0.08, 0.4)
    add(bass(root / 2 if pos % 2 else root, BEAT * 0.9), t, 0.28)
    if full and (beat % 2 == 0):
        note = mel[(beat // 2 + sec) % 3]
        add(cached_pluck(note), t + (BEAT * 0.5 if bar % 2 else 0), 0.16, 0.35 if pos == 0 else -0.35)
    beat += 1
    t += BEAT

# ---------- ambience: machine hum + clock ticks ----------
tt = np.arange(N) / SR
hum = (0.5 * np.sin(2 * np.pi * 55 * tt) + 0.25 * np.sin(2 * np.pi * 110 * tt + 0.3)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.2 * tt))
bed[:, 0] += hum * 0.02
bed[:, 1] += hum * 0.02
tick = wood(3200, int(0.03 * SR))
s = 0.6
while s < END_MUSIC:
    add(tick, s, 0.05, 0.6)
    s += 1.0

# music fade into the outro
fade = np.clip((END_MUSIC + 0.6 - tt) / 1.6, 0, 1)
bed *= fade[:, None]


# ---------- SFX ----------
def load(name):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{SFX_DIR}/{name}.mp3", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)


SF = {}


def sfx(name, t, gain):
    if name not in SF:
        SF[name] = load(name)
    add(SF[name], t, gain)


cues = [
    ("impact-bass-1", W("l01", "60"), 0.30),
    ("whoosh-short", W("l01", "kabur"), 0.25),
    ("error", W("l01", "tanda"), 0.18),
    ("pop", W("l02", "menjelaskan"), 0.22),
    ("sparkle", W("l03", "rekomendasi"), 0.22),
    ("whoosh-cinematic", L("l04") - 0.3, 0.18),
    ("pop", W("l04", "play"), 0.22),
    ("whoosh-short", W("l04", "masuk"), 0.2),
    ("whoosh-cinematic", L("l05") - 0.3, 0.18),
    ("pop", W("l05", "first"), 0.22),
    ("error", W("l05", "ini"), 0.2),
    ("pop", W("l06", "berapa"), 0.22),
    ("ping", W("l06", "pertama"), 0.18),
    ("ping", W("l06", "ketujuh"), 0.18),
    ("ping", W("l06", "delapan"), 0.2),
    ("pop", W("l07", "keempat"), 0.22),
    ("riser", W("l07", "bermain"), 0.12),
    ("pop", W("l08", "sinyal"), 0.22),
    ("chime", W("l08", "belanja"), 0.2),
    ("whoosh-cinematic", L("l09") - 0.3, 0.18),
    ("click", W("l09", "update"), 0.25),
    ("whoosh", W("l09", "gelombang"), 0.22),
    ("chime", W("l10", "jangkauannya"), 0.2),
    ("whoosh-cinematic", L("l11") - 0.3, 0.16),
    ("pop", W("l11", "rdc"), 0.2),
    ("sparkle", W("l11", "28"), 0.22),
    ("whoosh-cinematic", L("l12") - 0.3, 0.16),
    ("pop", W("l12", "muda"), 0.2),
    ("pop", W("l12", "tua"), 0.2),
    ("whoosh-cinematic", L("l13") - 0.3, 0.16),
    ("pop", W("l13", "ajarkan"), 0.22),
    ("whoosh-short", W("l13", "langsung"), 0.25),
    ("error", W("l13", "menu"), 0.16),
    ("click", W("l14", "level"), 0.22),
    ("click", W("l14", "gampang"), 0.22),
    ("click", W("l14", "naik"), 0.22),
    ("sparkle", W("l14", "penasaran"), 0.22),
    ("pop", W("l15", "thumbnail-mu"), 0.2),
    ("whoosh", W("l15", "tenggelam"), 0.2),
    ("chime", OUTRO, 0.25),
]
for name, t0, g in cues:
    sfx(name, t0, g)

# ---------- level + write ----------
rms = np.sqrt(np.mean(bed[: int(VO_END * SR)] ** 2))
bed *= 10 ** (-26.5 / 20) / max(rms, 1e-9)
peak = np.max(np.abs(bed))
if peak > 0.89:
    bed *= 0.89 / peak
os.makedirs(os.path.dirname(OUT), exist_ok=True)
pcm = (np.clip(bed, -1, 1) * 32767).astype(np.int16)
with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"bed: {OUT} {TOTAL:.2f}s rms -26.5 dBFS, {len(cues)} sfx cues")
