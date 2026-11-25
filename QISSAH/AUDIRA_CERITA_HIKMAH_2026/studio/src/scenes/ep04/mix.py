# EP04 PERSAUDARAAN silent-draft mix: music bed + ambience + SFX, timed from timeline.json.
# Run from studio/:  python src/scenes/ep04/mix.py   ->  public/audio/ep04/mix.wav (48 kHz stereo)
# Music: a plucked kecapi-like string (Karplus-Strong) in a slendro-ish pentatonic at 64 BPM over a soft
# bamboo-flute (suling) line that enters on the nights and swells at the meeting. Ambience: daytime birds and
# breeze; night crickets and frogs, following the same day/night wheel as the film. Music dips under every line.
import json, subprocess, os
import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
tl = json.load(open(os.path.join(HERE, "timeline.json"), encoding="utf8"))
TOTAL = tl["total"]
N = int(TOTAL * SR)
T = {c["id"]: c["start"] for c in tl["clips"]}
E = {c["id"]: c["end"] for c in tl["clips"]}
rng = np.random.default_rng(404)
t = np.arange(N) / SR

def movavg(x, n):
    c = np.cumsum(np.concatenate([np.zeros(1), x]))
    y = (c[n:] - c[:-n]) / n
    pad = len(x) - len(y)
    return np.concatenate([np.full(pad // 2, y[0]), y, np.full(pad - pad // 2, y[-1])])

def ss(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)

def env_lin(keys):
    ks = np.array(keys, dtype=float)
    return np.interp(t, ks[:, 0], ks[:, 1])

# ---- day / night (same keys as Film.tsx WHEEL) ----
PI = np.pi
M0 = E["s4e"] + 1.4
M1 = T["s5c"] + 1.0
WHEEL = [(0, PI), (T["s2a"] - 1.4, PI), (T["s2a"] + 1.8, 2 * PI), (E["s2g"] + 0.4, 2 * PI), (T["s3a"] + 2.4, 3 * PI),
         (M0, 3 * PI), (M1, 8 * PI), (E["s5e"] + 0.2, 8 * PI), (T["s6a"] + 1.8, 9 * PI), (T["s7d"] - 1.0, 9 * PI), (TOTAL - 3.4, 10 * PI)]
wheel = np.full(N, WHEEL[-1][1])
for (a, va), (b, vb) in zip(WHEEL[:-1], WHEEL[1:]):
    m = (t >= a) & (t <= b)
    wheel[m] = va + (vb - va) * ss((t[m] - a) / max(1e-3, b - a))
first = t < WHEEL[0][0]
wheel[first] = WHEEL[0][1]
night = (1 - np.cos(wheel)) / 2

# ---- instruments ----
def pluck(freq, dur, bright=0.5, seed=0):
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    r = np.random.default_rng(seed)
    buf = r.uniform(-1, 1, p)
    buf = np.convolve(buf, [bright, 1 - bright], mode="same")
    out = np.zeros(n)
    for i in range(n):
        v = buf[i % p]
        out[i] = v
        buf[i % p] = 0.4985 * (v + buf[(i + 1) % p])
    out *= np.exp(-np.arange(n) / SR * 1.6)
    return out

def flute(freq, dur, seed=0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * PI * 5.2 * tt) * ss(tt / 0.6)
    ph = 2 * PI * freq * np.cumsum(vib) / SR
    tone = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    breath = np.random.default_rng(seed).normal(0, 1, n)
    breath = np.convolve(breath, np.ones(30) / 30, mode="same") * 0.08
    a = ss(tt / 0.35) * ss((dur - tt) / 0.6)
    return (tone + breath) * a

# slendro-like pentatonic around D
BASE = 293.66
SCALE = [0, 2.4, 4.8, 7.2, 9.6]  # semitone-ish steps of slendro
def note(deg, octave=0):
    o, d = divmod(deg, 5)
    return BASE * 2 ** ((SCALE[d] + 12 * (o + octave)) / 12)

music = np.zeros((N, 2))
def put(sig, at, gain, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    s = sig[: N - i]
    music[i:i + len(s), 0] += s * gain * (1 - pan) * 0.5 * 2 ** 0.5
    music[i:i + len(s), 1] += s * gain * (1 + pan) * 0.5 * 2 ** 0.5

BEAT = 60 / 64
# kecapi pattern: a slow repeating 8-step figure, varying by section
PATTERN = [0, 2, 4, 2, 3, 1, 2, 0]
cache = {}
def pl(deg, oc, dur=2.6):
    k = (deg, oc)
    if k not in cache:
        cache[k] = pluck(note(deg, oc), dur, bright=0.55, seed=deg * 7 + oc + 50)
    return cache[k]

start = 0.6
step = 0
tt = start
while tt < TOTAL - 3.0:
    sec_night = np.interp(tt, t[::SR // 10], night[::SR // 10])
    deg = PATTERN[step % 8] + (2 if (step // 16) % 2 else 0)
    put(pl(deg, -1), tt, 0.26, pan=-0.3 + 0.6 * ((step % 4) / 3))
    if step % 4 == 0:
        put(pl(0 if (step // 8) % 2 == 0 else 3, -2, 3.5), tt, 0.22)
    # day sections a little busier: an extra off-beat pluck
    if sec_night < 0.4 and step % 2 == 1:
        put(pl(deg + 5, -1), tt + BEAT / 2, 0.1, pan=0.4)
    tt += BEAT
    step += 1

# suling phrases: nights and the meeting
def phrase(at, degs, durs, gain, oc=1):
    x = at
    for d, du in zip(degs, durs):
        put(flute(note(d, oc), du * BEAT + 0.3, seed=int(x * 10)), x, gain, pan=0.15)
        x += du * BEAT

phrase(T["s3a"] + 1.0, [4, 2, 3, 2, 0], [2, 1, 1, 2, 4], 0.09)
phrase(T["s4a"] + 0.5, [2, 4, 5, 4, 2], [2, 1, 1, 2, 4], 0.09)
phrase(T["s6a"] + 0.2, [0, 2, 4, 5, 7, 5], [2, 2, 2, 2, 3, 4], 0.11)
phrase(T["s6g"] - 0.5, [7, 5, 4, 5, 4, 2, 0], [3, 1, 1, 2, 2, 2, 6], 0.14)
phrase(T["s7c"] - 0.4, [4, 5, 7, 5, 4, 2], [2, 2, 3, 2, 2, 5], 0.1)

# music shaping: dips under lines (room for the voice later), fade in/out
duck = np.ones(N)
for c in tl["clips"]:
    a, b = c["start"], c["end"]
    m = (t > a - 0.3) & (t < b + 0.3)
    duck[m] = np.minimum(duck[m], 0.5)
duck = movavg(duck, int(0.25 * SR))
mshape = ss(t / 1.5) * ss((TOTAL - t) / 2.5)
# swell into the embrace, then soften for the lesson
mshape *= 1 + 0.5 * env_lin([(0, 0), (T["s6g"] - 1, 0), (T["s6g"] + 1, 1), (E["s6g"] + 1.2, 1), (T["s7a"] + 0.5, 0), (TOTAL, 0)])
music *= (duck * mshape)[:, None]

# ---- ambience ----
amb = np.zeros((N, 2))
def bandnoise(lo, hi, n, seed):
    r = np.random.default_rng(seed)
    x = r.normal(0, 1, n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(X, n)
    return y / (np.abs(y).max() + 1e-9)

breeze = bandnoise(80, 900, N, 1) * (0.5 + 0.5 * np.sin(2 * PI * 0.07 * t + 1))
amb[:, 0] += breeze * 0.05 * (1 - night)
amb[:, 1] += np.roll(breeze, 3000) * 0.05 * (1 - night)
# crickets: 4.4 kHz carrier gated in fast pulses, two "fields" left/right
for ch, (f0, rate, seed) in enumerate([(4400, 17, 2), (4700, 19, 3)]):
    car = np.sin(2 * PI * f0 * t)
    gate = (np.sin(2 * PI * rate * t) > 0.3).astype(float)
    slow = (np.sin(2 * PI * (0.31 + ch * 0.07) * t + seed) > -0.2).astype(float)
    g = movavg(gate * slow, 96)
    amb[:, ch] += car * g * 0.018 * night
# frogs: low croaks at random night moments
for i in range(int(TOTAL * 0.8)):
    at = rng.uniform(0, TOTAL)
    if np.interp(at, t[::SR // 10], night[::SR // 10]) < 0.6: continue
    n = int(0.16 * SR)
    tt2 = np.arange(n) / SR
    cro = np.sin(2 * PI * (190 + 40 * rng.random()) * tt2) * (np.sin(2 * PI * 32 * tt2) > 0) * np.sin(PI * tt2 / 0.16)
    put_ch = int(rng.integers(0, 2))
    j = int(at * SR)
    amb[j:j + n, put_ch][: max(0, min(n, N - j))] += cro[: max(0, min(n, N - j))] * 0.04
# day birds: short chirp sweeps
for i in range(int(TOTAL * 0.7)):
    at = rng.uniform(0, TOTAL)
    if np.interp(at, t[::SR // 10], night[::SR // 10]) > 0.3: continue
    n = int(0.09 * SR)
    tt2 = np.arange(n) / SR
    f = 3200 + 1600 * tt2 / 0.09 * (1 if rng.random() > 0.5 else -1)
    ch = np.sin(2 * PI * np.cumsum(f) / SR) * np.sin(PI * tt2 / 0.09)
    for rep in range(int(rng.integers(1, 4))):
        j = int((at + rep * 0.13) * SR)
        if j + n < N:
            amb[j:j + n, rep % 2] += ch * 0.03

# footsteps on the earthen path (soft thumps), for the main walks
def steps(a, b, rate, gain, pan):
    x = a
    while x < b:
        n = int(0.07 * SR)
        thump = bandnoise(60, 700, n, int(x * 100)) * np.exp(-np.arange(n) / SR * 60)
        j = int(x * SR)
        if j + n < N:
            amb[j:j + n, 0] += thump * gain * (1 - pan)
            amb[j:j + n, 1] += thump * gain * (1 + pan)
        x += rate
steps(T["s3e"] + 0.6, T["s3e"] + 3.2, 0.42, 0.08, -0.3)
steps(E["s3e"] + 0.2, T["s3g"] + 0.1, 0.4, 0.08, 0.0)
steps(T["s4e"] + 0.3, E["s4e"] + 0.1, 0.4, 0.07, 0.2)
steps(T["s6b"] - 0.8, T["s6c"] + 0.6, 0.55, 0.06, -0.4)
steps(T["s6b"] - 0.6, T["s6c"] + 0.6, 0.58, 0.06, 0.4)

amb *= ss(t / 1.2)[:, None] * ss((TOTAL - 3.2 - t) / 1.0)[:, None]

# ---- SFX ----
SFX_DIR = "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/"
def load(name):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", SFX_DIR + name + ".mp3", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
sfx = np.zeros((N, 2))
def cue(name, at, gain):
    s = load(name)
    j = int(at * SR)
    if j >= N: return
    s = s[: N - j]
    sfx[j:j + len(s)] += s * gain

cue("click-soft", T["s1a"] + 1.1, 0.25)               # sack lifted
cue("sparkle", T["s1b"] + 1.3, 0.22)                   # the sack returns by itself
cue("pop", T["s1b"] + 1.4, 0.2)
cue("chime", 2.3, 0.18)                                # title card
cue("whoosh-cinematic", T["s2a"] - 1.4, 0.2)           # dawn, the wheel turns
for i in range(10):
    cue("pop", T["s2e"] + 2.4 + i * 0.32, 0.08)        # the harvest splits in two
cue("whoosh", E["s2g"] + 0.4, 0.16)                    # dusk
cue("click-soft", T["s3e"] + 3.6, 0.25)                # adik lifts a sack
cue("pop", T["s3g"] + 0.6, 0.16)                       # ...sets it in his brother's stack
cue("click-soft", T["s4e"] + 3.4, 0.25)
cue("pop", E["s4e"] + 0.7, 0.16)
cue("whoosh-cinematic", M0, 0.16)                      # the years turn
cue("whoosh-short", (M0 + M1) / 2, 0.12)
cue("ping", T["s5c"] + 3.2, 0.12)                      # the count is still ten
cue("whoosh", E["s5e"] + 0.3, 0.14)                    # the full-moon night falls
cue("riser", T["s6c"] - 4.5, 0.12)
cue("impact-bass-1", T["s6c"] + 0.6, 0.1)              # they meet
cue("click-soft", T["s6f"] + 1.4, 0.2)                 # sacks set down
cue("chime", T["s7c"] - 0.3, 0.16)                     # hikmah
cue("whoosh-short", TOTAL - 3.3, 0.14)                 # outro card
cue("chime", TOTAL - 2.9, 0.14)

mix = music * 0.9 + amb + sfx
peak = np.abs(mix).max()
mix = mix / max(peak, 1e-9) * 0.5
out = os.path.join("public", "audio", "ep04", "mix.wav")
tmp = out + ".raw.wav"
import wave
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open(tmp, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
# loudness: a quiet bed for a silent draft (~ -24 LUFS), true peak safe
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-24:TP=-3:LRA=11", "-ar", str(SR), "-ac", "2", out], check=True)
os.remove(tmp)
print("wrote", out, f"{TOTAL:.1f} s")
