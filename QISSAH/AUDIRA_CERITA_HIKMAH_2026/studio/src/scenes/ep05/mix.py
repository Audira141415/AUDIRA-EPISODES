# EP05 silent-draft mix: guzheng-like plucked pentatonic + breath flute drone + river ambience + SFX.
# Run from studio/:  python src/scenes/ep05/mix.py   ->  public/audio/ep05/mix.wav (48 kHz stereo)
# All cues read src/scenes/ep05/timeline.json, so the mix re-times with the real voice.
import json, subprocess, os
import numpy as np

SR = 48000
ROOT = os.path.dirname(os.path.abspath(__file__))
tl = json.load(open(os.path.join(ROOT, "timeline.json"), encoding="utf8"))
TOTAL = tl["total"]
N = int(TOTAL * SR)
C = {c["id"]: c for c in tl["clips"]}
T = {k: v["start"] for k, v in C.items()}
E = {k: v["end"] for k, v in C.items()}
def W(cid, prefix):
    for w in C[cid]["words"]:
        if w["w"].lower().startswith(prefix): return w["s"]
    return C[cid]["start"]
T_STING = W("s7a", "menyengat") + 0.05
T_SLIDE = E["s5d"] + 0.7
T_SINK0 = T["s7b"] + 0.8
T_UNDER = T["s8a"] - 0.6
T_RISE = E["s8f"] + 1.4
T_SURF = T["s9a"] + 0.6
T_NAIK, T_TURUN = W("s9f", "naik"), W("s9f", "turun")
rng = np.random.default_rng(5)
t = np.arange(N) / SR

def env(points):
    """piecewise-linear envelope from [(time, value)]"""
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)

def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    from scipy.signal import lfilter
    return lfilter([1 - a], [1, -a], x)

def load(name):
    p = f"F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/{name}.mp3"
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", p, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)

out = np.zeros((N, 2))
def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i + len(sig) <= 0: return
    if sig.ndim == 1: sig = np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    j = min(N, i + len(sig)); s0 = max(0, -i)
    out[max(0, i):j] += sig[s0:s0 + j - max(0, i)] * gain

# ---------- music: plucked string (Karplus-Strong) on D gong pentatonic ----------
def pluck(freq, dur=3.5, bright=0.5):
    n = int(dur * SR); p = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, p)
    buf = np.convolve(buf, [bright, 1 - bright], "same")
    y = np.zeros(n)
    for i in range(n):
        v = buf[i % p]; y[i] = v
        buf[i % p] = 0.4985 * (v + buf[(i + 1) % p])
    # slight pitch bend down at the attack (guzheng press)
    return y * np.exp(-np.arange(n) / SR * 0.9)

D = 146.83
scale = [D * 2 ** (s / 12) for s in (0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24)]
cache = {}
def note(i, dur=3.5):
    key = (i, dur)
    if key not in cache: cache[key] = pluck(scale[i], dur)
    return cache[key]

music = np.zeros((N, 2))
def mplace(sig, at, gain, pan):
    i = int(at * SR)
    if i >= N: return
    j = min(N, i + len(sig))
    music[i:j, 0] += sig[: j - i] * gain * (1 - max(0, pan))
    music[i:j, 1] += sig[: j - i] * gain * (1 + min(0, pan))

# phrases: sparse, unhurried; silence while the tail rises and under the water
beat = 1.0  # 60 BPM
calm_motif = [4, 3, 2, 0, None, 2, 3, 5, 4, None, None, None, 7, 6, 4, 3, None, 2, 0, None, None, None, None, None]
def phrase(t0, t1, motif, gain, pan_seed=0):
    k = 0; tt = t0
    while tt < t1:
        n = motif[k % len(motif)]
        if n is not None:
            mplace(note(n), tt, gain, 0.35 * np.sin(k * 1.7 + pan_seed))
            if k % 6 == 0: mplace(note(max(0, n - 5) if n >= 5 else n, 3.5), tt + 0.02, gain * 0.5, -0.3)
        k += 1; tt += beat
phrase(0.6, T["s6d"] - 1.0, calm_motif, 0.32)
cross_motif = [0, None, 4, None, 2, None, 4, 5, None, 4, None, 2]
phrase(T["s6a"], T["s6d"] - 1.0, cross_motif, 0.2, 2.0)
resolve_motif = [7, None, 5, 4, None, 2, None, None, 4, 3, 2, 0, None, None, None, None]
phrase(T_SURF + 2, TOTAL - 3.0, resolve_motif, 0.3, 4.0)

# breath flute drone (xiao): sine + breath noise, swells per section
def drone(freq, amp_env, breath=0.15):
    ph = 2 * np.pi * freq * t + 0.6 * np.sin(2 * np.pi * 4.8 * t) * 0.02
    tone = np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    nz = lowpass(rng.normal(0, 1, N), 1800) * breath
    return (tone * 0.6 + nz) * amp_env
fl = drone(D, env([(0, 0), (3, 0.05), (T["s2a"], 0.03), (T["s5a"], 0.05), (T["s6d"], 0.02), (T_STING, 0.0), (T_SURF, 0.0), (T["s9c"], 0.05), (TOTAL - 3, 0.04), (TOTAL, 0)]))
music[:, 0] += fl * 0.9; music[:, 1] += fl * 0.7
# tension: low cello-like drone + slow pulse from "Lalu, tepat di tengah sungai" to the sting
tens = env([(0, 0), (T["s6d"] - 0.5, 0), (T_STING - 0.2, 0.22), (T_STING + 0.1, 0.0), (TOTAL, 0)])
low = np.sin(2 * np.pi * D / 2 * t) + 0.5 * np.sin(2 * np.pi * D / 2 * 1.5 * t)
pulse = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 1.4 * t))
music[:, 0] += low * tens * (0.6 + 0.4 * pulse); music[:, 1] += low * tens * (0.6 + 0.4 * pulse)
# underwater: deep sub drone
deep = env([(0, 0), (T_UNDER, 0), (T_UNDER + 2, 0.2), (T_RISE, 0.2), (T_SURF, 0), (TOTAL, 0)])
sub = np.sin(2 * np.pi * 55 * t) * 0.8 + np.sin(2 * np.pi * 82.4 * t) * 0.4 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.1 * t))
music[:, 0] += sub * deep; music[:, 1] += sub * deep

# duck the music under every line (it will sit under the voice later)
duck = np.ones(N)
for c in tl["clips"]:
    duck *= 1 - 0.45 * np.clip(np.minimum((t - c["start"] + 0.3) / 0.3, (c["end"] + 0.4 - t) / 0.4), 0, 1)
music *= duck[:, None]
# underwater muffling of the plucked music
uw = env([(0, 0), (T_UNDER, 0), (T_UNDER + 1, 1), (T_RISE + 1, 1), (T_SURF, 0), (TOTAL, 0)])
for ch in range(2):
    music[:, ch] = music[:, ch] * (1 - uw) + lowpass(music[:, ch], 400) * uw * 1.3

# ---------- ambience ----------
river = lowpass(rng.normal(0, 1, N), 900) - lowpass(rng.normal(0, 1, N), 120)
river *= 0.6 + 0.4 * lowpass(rng.normal(0, 1, N), 0.6) * 8
above = env([(0, 0), (1.5, 1), (T_UNDER, 1), (T_UNDER + 0.8, 0), (T_RISE + 1.5, 0), (T_SURF, 1), (TOTAL - 3, 0.8), (TOTAL, 0)])
amb = np.zeros((N, 2))
amb[:, 0] += river * above * 0.05
amb[:, 1] += np.roll(river, 1200) * above * 0.05
# wind in the pines
wind = lowpass(rng.normal(0, 1, N), 400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.05 * t))
amb[:, 0] += wind * above * 0.03; amb[:, 1] += np.roll(wind, 4000) * above * 0.03
# underwater rumble
rum = lowpass(rng.normal(0, 1, N), 150) * env([(0, 0), (T_UNDER, 0), (T_UNDER + 1, 1), (T_RISE + 1, 1), (T_SURF, 0), (TOTAL, 0)])
amb[:, 0] += rum * 0.35; amb[:, 1] += rum * 0.35
# a few distant birds on the bank (chirp sweeps)
for k in range(9):
    at = 2 + k * 9.5 + rng.uniform(0, 3)
    if at > T["s6c"]: break
    for j in range(rng.integers(2, 4)):
        d = 0.09; n = int(d * SR); tt = np.arange(n) / SR
        f = 3200 + 900 * np.sin(np.pi * tt / d) + rng.uniform(-200, 200)
        ch = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) ** 2
        place(ch, at + j * 0.14, 0.03, rng.uniform(-0.7, 0.7))
out += amb

# ---------- SFX ----------
fx = {k: load(k) for k in ["whoosh", "whoosh-short", "whoosh-cinematic", "pop", "click-soft", "riser", "impact-bass-1", "chime", "sparkle", "ping"]}
place(fx["click-soft"], 3.4, 0.5)                 # title seal stamp
place(fx["whoosh"], T["s2a"] - 0.4, 0.25)          # scroll pan to the bank
place(fx["whoosh-short"], T["s2b"] - 0.2, 0.2)
place(fx["pop"], T["s3a"] - 0.05, 0.18)           # "Apa?"
place(fx["whoosh-short"], T["s5c"] + 1.5, 0.15)   # turtle turns
# splash into the river
n = int(1.2 * SR); sp = lowpass(rng.normal(0, 1, n), 2500) * np.exp(-np.arange(n) / SR * 4)
place(sp, T_SLIDE + 0.6, 0.35)
# paddle strokes while swimming
for k in range(40):
    at = T_SLIDE + 1.6 + k * (2 * np.pi / 2.3)
    if at > T_STING: break
    n = int(0.35 * SR); s = lowpass(rng.normal(0, 1, n), 1200) * np.sin(np.pi * np.arange(n) / n) ** 2
    place(s, at, 0.08, 0.3)
place(fx["riser"], T_STING - len(fx["riser"]) / SR, 0.3)
place(fx["impact-bass-1"], T_STING, 0.6)
place(fx["whoosh-cinematic"], T_UNDER - 0.3, 0.3)
for k in range(14):                               # bubbles while sinking
    at = T_SINK0 + 0.5 + k * 1.3 + rng.uniform(0, 0.6)
    place(fx["pop"][: int(0.15 * SR)], at, 0.06, rng.uniform(-0.5, 0.5))
place(fx["whoosh"], T_RISE + 2.2, 0.25)           # rising through the surface
place(fx["chime"], T["s9c"] - 0.3, 0.3)           # hikmah
place(fx["sparkle"], T_NAIK, 0.22)
place(fx["whoosh-short"], T_TURUN, 0.2)
place(fx["click-soft"], E["s9f"] + 3.2, 0.45)     # closing seal stamp
place(fx["ping"], TOTAL - 3.2, 0.25)              # outro

mixed = out + music * 0.5
fade = env([(0, 0), (0.4, 1), (TOTAL - 1.2, 1), (TOTAL, 0)])
mixed *= fade[:, None]
peak = np.abs(mixed).max()
mixed *= min(1.0, 0.5 / peak) * 10 ** (2.0 / 20)  # bed sits near -24 LUFS, peaks under -2 dBTP
dst = "public/audio/ep05/mix.wav"
raw = (np.clip(mixed, -1, 1) * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", dst], input=raw, check=True)
print("wrote", dst, f"{TOTAL:.1f}s")
