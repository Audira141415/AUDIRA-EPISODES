# EP03 ANJING KECIL: silent-draft music + ambience + SFX bed. Run from studio/:  python src/scenes/ep03/mix.py
# Music identity: a little farmyard band — plucked ukulele strums, wooden marimba tune and a tuba-ish bass
# (G major, 96 bpm) that drops to a lonely music box in E minor at the pond, then comes back brighter for the farmer.
# Everything is keyed to the clip times in timeline.json; music dips under every line to leave room for the voice.
import json, os, subprocess, tempfile
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "timeline.json"), encoding="utf8"))
TOTAL = TL["total"]
N = int(TOTAL * SR)
T = {c["id"]: c["start"] for c in TL["clips"]}
E = {c["id"]: c["end"] for c in TL["clips"]}
SFX = "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/"
OUT = "public/audio/ep03/mix.wav"
rng = np.random.default_rng(3)

def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
def env(n, a=0.005, r=0.3):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)

def pluck(f, dur=0.9, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * h * f * t) * np.exp(-t * (2.5 + h * 1.8 / bright)) / h for h in range(1, 8))
    return y * np.minimum(1, t / 0.003)

def marimba(f, dur=0.7):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + 0.35 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t * 22)) * np.minimum(1, t / 0.002)

def musicbox(f, dur=2.0):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 2.0 * f * t) * np.exp(-t * 3) + 0.25 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 9)) * np.exp(-t * 1.6) * np.minimum(1, t / 0.002)

def tuba(f, dur=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(4 * np.pi * f * t) + 0.2 * np.sin(6 * np.pi * f * t)
    return y * np.minimum(1, t / 0.03) * np.exp(-t * 3.5)

def pad(fs, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * f * (1 + d) * t) for f in fs for d in (-0.003, 0.003))
    a = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.2)
    return y * a / (2 * len(fs))

mus = np.zeros(N)
def put(buf, x, at, g=1.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(x) <= 0: return
    j = min(len(buf), i + len(x)); buf[max(0, i):j] += g * x[max(0, -i):j - i]

# chords as MIDI roots + triad type
MAJ, MIN = (0, 4, 7), (0, 3, 7)
def section(t0, t1, prog, bpm, kind):
    beat = 60 / bpm
    bar = beat * 4
    k = 0
    t = t0
    melody_major = [0, 2, 4, 7, 9, 7, 4, 2]
    while t < t1 - 0.2:
        root, q = prog[k % len(prog)]
        notes = [root + i for i in q]
        if kind == "farm":
            put(mus, tuba(midi(root - 24), beat * 0.9), t, 0.32)
            put(mus, tuba(midi(root - 17), beat * 0.9), t + 2 * beat, 0.26)
            for b, s in enumerate([0, 1, 1.5, 2, 3, 3.5]):  # uke strum pattern
                for j, nn in enumerate(notes + [notes[0] + 12]):
                    put(mus, pluck(midi(nn + 12), 0.6, 1.3), t + s * beat + j * 0.012, 0.07 if s % 1 else 0.1)
            if k % 2 == 0:
                for b in range(8):
                    if rng.random() < 0.75:
                        put(mus, marimba(midi(root + 24 + melody_major[(b + k) % 8] % 12 - (0 if (b + k) % 8 < 4 else 0))), t + b * beat / 2, 0.16)
        elif kind == "sad":
            put(mus, pad([midi(n) for n in notes], bar + 0.8), t, 0.2)
            for b, idx in enumerate([0, 2, 1, 2]):
                put(mus, musicbox(midi(notes[idx] + 24), 2.2), t + b * beat, 0.11)
        elif kind == "hope":
            put(mus, pad([midi(n) for n in notes] + [midi(notes[0] - 12)], bar + 0.8), t, 0.22)
            for b in range(8):
                put(mus, musicbox(midi(notes[b % 3] + 24 + (12 if b == 7 else 0)), 1.6), t + b * beat / 2, 0.06 + 0.05 * (t - t0) / max(1, t1 - t0))
        elif kind == "joy":
            put(mus, tuba(midi(root - 24), beat * 0.9), t, 0.34)
            put(mus, tuba(midi(root - 17), beat * 0.9), t + beat, 0.24)
            put(mus, tuba(midi(root - 24), beat * 0.9), t + 2 * beat, 0.3)
            put(mus, tuba(midi(root - 20), beat * 0.9), t + 3 * beat, 0.24)
            for s in [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]:
                for j, nn in enumerate(notes):
                    put(mus, pluck(midi(nn + 12), 0.45, 1.4), t + s * beat + j * 0.01, 0.075)
            for b in range(8):
                put(mus, marimba(midi(notes[(b * 2) % 3] + 24 + (12 if b in (3, 7) else 0))), t + b * beat / 2, 0.15)
        elif kind == "calm":
            put(mus, pad([midi(n) for n in notes], bar + 1.0), t, 0.2)
            put(mus, pluck(midi(root - 12), 2.5, 0.6), t, 0.2)
            for b, idx in enumerate([0, 1, 2, 1]):
                put(mus, musicbox(midi(notes[idx] + 24), 2.0), t + b * beat, 0.07)
        t += bar; k += 1

G, C_, D, Em, Am, Bm = (55, MAJ), (48, MAJ), (50, MAJ), (52, MIN), (57, MIN), (59, MIN)
section(0.0, T["s5d"], [G, C_, G, D, Em, C_, D, G], 96, "farm")
section(T["s5d"], T["s7d"], [Em, C_, Am, Bm], 66, "sad")
section(T["s7d"], T["s8c"], [C_, G, Am, D], 72, "hope")
section(T["s8c"], E["s8f"] + 0.5, [G, D, Em, C_], 112, "joy")
section(E["s8f"] + 0.5, TOTAL - 2.5, [C_, G, Am, G, C_, D, G, G], 70, "calm")
# final chord under the outro
put(mus, pad([midi(n) for n in (55, 59, 62, 67)], 4.0), TOTAL - 4.0, 0.3)
put(mus, musicbox(midi(79), 3.0), TOTAL - 3.0, 0.12)

# music envelope: duck under every line, swell in the gaps
tt = np.arange(N) / SR
duck = np.ones(N)
for c in TL["clips"]:
    a, b = c["start"], c["end"]
    duck -= 0.45 * np.clip(np.minimum((tt - (a - 0.25)) / 0.25, ((b + 0.35) - tt) / 0.35), 0, 1)
duck = np.clip(duck, 0.5, 1)
# softer during the sad section, fade in/out
duck *= np.clip(tt / 1.5, 0, 1) * np.clip((TOTAL - tt) / 1.5, 0, 1)
mus *= duck
sos = butter(2, 9000, "low", fs=SR, output="sos")
mus = sosfilt(sos, mus)

# ambience: birds by day, pond water + breeze at the pond, crickets by night
amb = np.zeros(N)
def ramp(x, a, b): return np.clip((x - a) / max(1e-3, b - a), 0, 1)
day = 1 - ramp(tt, T["s6a"], T["s6c"])
night = ramp(tt, E["s7d"] - 1, T["s8a"] + 2)
pond = ramp(tt, E["s6a"] - 2, E["s6a"]) * (1 - ramp(tt, T["s8a"], T["s8a"] + 2))
noise = rng.standard_normal(N)
breeze = sosfilt(butter(2, [200, 900], "band", fs=SR, output="sos"), noise) * (0.5 + 0.5 * np.sin(tt * 0.31) ** 2)
amb += breeze * 0.05
water = sosfilt(butter(2, [700, 3500], "band", fs=SR, output="sos"), rng.standard_normal(N)) * (0.5 + 0.5 * np.abs(np.sin(tt * 2.3 + np.sin(tt * 0.7) * 3)))
amb += water * 0.025 * pond
t_b = 0.5
while t_b < TOTAL:
    f0 = 2600 + rng.random() * 1800
    n = int(0.09 * SR); u = np.arange(n) / SR
    for rep in range(rng.integers(2, 5)):
        chirp = np.sin(2 * np.pi * (f0 * u + 9000 * u * u * (1 if rng.random() < 0.5 else -0.6))) * np.sin(np.pi * u / 0.09)
        put(amb, chirp, t_b + rep * 0.12, 0.03 * float(np.interp(t_b, tt[::4800], day[::4800])))
    t_b += 1.2 + rng.random() * 2.5
crick = np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 28 * tt) > 0.3) * (np.sin(2 * np.pi * 0.9 * tt) > -0.2)
amb += crick * 0.012 * night

# SFX from the studio library
def load(name):
    with tempfile.NamedTemporaryFile(suffix=".raw", delete=False) as tf: path = tf.name
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SFX + name + ".mp3", "-f", "f32le", "-ac", "1", "-ar", str(SR), path], check=True)
    x = np.fromfile(path, dtype=np.float32).astype(np.float64); os.remove(path)
    return x
cache = {}
def sfx(name, at, g):
    if name not in cache: cache[name] = load(name)
    put(fx, cache[name], at, g)
fx = np.zeros(N)
sfx("whoosh-cinematic", 0.2, 0.18)
sfx("pop", 1.2, 0.2)                      # title card
for cid in ["s2a", "s3a", "s4a", "s5a"]:  # each new animal
    sfx("whoosh-short", T[cid] - 0.3, 0.16)
for cid in ["s2b", "s3b", "s4b", "s5b", "s5c"]:  # puffing up proudly
    sfx("pop", T[cid] - 0.15, 0.22)
sfx("click-soft", T["s5b"] + 1.2, 0.3)    # new egg
sfx("whoosh", T["s5c"] + 0.2, 0.14)       # mouse dash
sfx("impact-bass-1", T["s5d"] + 0.6, 0.18)  # everyone agrees
sfx("whoosh-cinematic", T["s6a"] - 0.4, 0.14)
sfx("ping", T["s6c"] + 1.0, 0.1)          # the old dog wakes
sfx("riser", T["s7d"] - 2.0, 0.08)
sfx("chime", T["s7d"] + 2.5, 0.16)
sfx("whoosh-cinematic", T["s8a"] - 0.8, 0.14)
sfx("whoosh-short", T["s8c"] + 0.2, 0.2)  # puppy runs
sfx("sparkle", T["s8c"] + 4.9, 0.2)       # jump into his arms
sfx("pop", T["s8c"] + 5.6, 0.2)
sfx("chime", T["s9b"] - 0.3, 0.22)        # hikmah card
sfx("sparkle", TOTAL - 3.2, 0.16)         # outro
# stop-motion footsteps: soft clicks while the puppy trots
for a, b, step in [(T["s1c"] + 0.2, E["s1c"], 0.25), (T["s2e"] + 0.4, T["s3a"] + 2.6, 0.25), (T["s4a"] + 0.3, T["s4a"] + 3.0, 0.25),
                   (T["s5a"] + 0.3, T["s5a"] + 3.8, 0.25), (T["s6a"] + 0.2, E["s6a"] - 0.2, 0.36), (T["s8c"] + 0.2, T["s8c"] + 2.3, 0.13)]:
    x = a
    while x < b:
        sfx("click-soft", x, 0.05); x += step

mix = mus * 0.55 + amb + fx
# gentle stereo: delay the ambience slightly on one side
L = mix + 0.15 * np.roll(amb, 240)
R = mix - 0.15 * np.roll(amb, 240) + 0.0
st = np.stack([L, R], 1)
# target ~ -24 LUFS integrated (approximate with RMS, then verify with ffmpeg ebur128)
rms = np.sqrt(np.mean(st ** 2))
st *= 10 ** (-24.5 / 20) / max(rms, 1e-9)
peak = np.max(np.abs(st))
if peak > 0.89: st *= 0.89 / peak
os.makedirs(os.path.dirname(OUT), exist_ok=True)
pcm = (np.clip(st, -1, 1) * 32767).astype("<i2")
import wave
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"wrote {OUT}: {TOTAL:.1f} s")
