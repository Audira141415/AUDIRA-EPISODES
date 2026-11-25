# EP02 Tempayan Retak — silent-draft mix (music + ambience + SFX, no voice). Run from studio/:
#   python src/scenes/ep02/mix.py
# Music: tanpura drone (D, Sa-Pa) + bansuri-like flute in raga Bhupali (pentatonic, gentle morning raga),
# soft hand-drum pulse only on the walks. Ambience: birds, wind, spring water, footsteps, drips.
# Every cue reads timeline.json, so the mix re-times itself when the real voice replaces the estimate.
import json, subprocess, numpy as np, soundfile as sf

SR = 48000
SFX = "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/"
tl = json.load(open("src/scenes/ep02/timeline.json", encoding="utf8"))
T = {c["id"]: c["start"] for c in tl["clips"]}
E = {c["id"]: c["end"] for c in tl["clips"]}
TOTAL = tl["total"]
N = int(TOTAL * SR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(2)
db = lambda x: 10 ** (x / 20)

def load(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(p, dtype=np.float32).reshape(-1, 2).copy()
    return a / max(1e-6, np.abs(a).max())

def env(pts):
    return np.interp(t_all, [p[0] for p in pts], [p[1] for p in pts])

def lp(x, a):  # one-pole low-pass, a in (0,1): smaller = darker
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s += a * (x[i] - s); y[i] = s
    return y

def lp_fast(x, cutoff):
    # FFT brick-ish low-pass for long noise beds
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))

def bp_fast(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / (1 + (lo / np.maximum(f, 1)) ** 4)) * (1 / (1 + (f / hi) ** 4))
    return np.fft.irfft(X, len(x))

out = np.zeros((N, 2))
def put(buf, t, vol, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    if buf.ndim == 1: buf = np.stack([buf, buf], 1)
    e = min(N, i + len(buf))
    g = np.array([np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))]) * np.sqrt(2)
    out[i:e] += buf[: e - i] * vol * g

# speech envelope from the clip times (for ducking now, and so the bed already sits right under the voice later)
speech = np.zeros(N)
for c in tl["clips"]:
    speech[int(c["start"] * SR): int(c["end"] * SR)] = 1
k = int(0.35 * SR); cs = np.concatenate([[0], np.cumsum(speech)]); idx = np.arange(N)
speech = (cs[np.clip(idx + k // 2, 0, N)] - cs[np.clip(idx - k // 2, 0, N)]) / k

# ---------- music ----------
D = 146.83  # Sa = D3
ratio = {"S": 1, "R": 9 / 8, "G": 5 / 4, "P": 3 / 2, "D": 5 / 3}
music = np.zeros(N)

# tanpura: plucked string with many harmonics and a buzzing "jawari" brightness, cycle P S' S' S
def tanpura_pluck(f0, dur=3.2):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.zeros(n)
    for h in range(1, 14):
        s += np.sin(2 * np.pi * f0 * h * tt + h) * (1 / h ** 0.9) * np.exp(-tt * (0.6 + h * 0.08))
    bright = 1 + 0.6 * np.sin(2 * np.pi * 0.7 * tt) * np.exp(-tt * 0.8)
    return s * bright * np.minimum(1, tt / 0.01)
plucks = [tanpura_pluck(D * 0.75), tanpura_pluck(D), tanpura_pluck(D), tanpura_pluck(D * 0.5)]
cyc = 3.0
tt0 = 0.0
while tt0 < TOTAL:
    for j, p in enumerate(plucks):
        ts = tt0 + j * cyc / 4
        i = int(ts * SR); e = min(N, i + len(p))
        if i < N: music[i:e] += p[: e - i] * 0.11
    tt0 += cyc

# bansuri: breathy sine with slow vibrato; phrases in Bhupali, descending at the sad beats, rising after the reveal
def flute(f, dur, amp):
    n = int(dur * SR); tt = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * tt) * np.minimum(1, tt / 0.5)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    tone = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    breath = lp_fast(rng.standard_normal(n) * 0.25, 2500) * np.sin(ph) ** 2
    a = np.minimum(1, tt / 0.12) * np.minimum(1, (dur - tt) / 0.35)
    return (tone + breath) * np.clip(a, 0, 1) * amp

scale = ["S", "R", "G", "P", "D"]
def note(deg):  # degree index across octaves
    o, s = divmod(deg, 5)
    return D * 2 * ratio[scale[s]] * (2 ** o)
phrases = {
    "open":  [(4, 1.6), (3, 0.8), (2, 1.2), (3, 0.8), (1, 1.0), (0, 2.4)],
    "walk":  [(0, 0.6), (1, 0.6), (2, 0.9), (4, 0.6), (3, 1.2), (2, 0.6), (1, 1.4)],
    "proud": [(5, 0.5), (7, 0.5), (8, 0.9), (7, 0.5), (5, 1.4)],
    "sad":   [(2, 1.2), (1, 0.9), (0, 1.4), (-1, 1.0), (-2, 2.4)],
    "bloom": [(0, 0.5), (2, 0.5), (3, 0.5), (4, 0.9), (5, 0.7), (7, 1.6)],
    "gold":  [(5, 1.2), (7, 0.8), (9, 1.8), (8, 0.8), (7, 1.0), (5, 2.6)],
    "end":   [(4, 1.4), (3, 0.9), (4, 0.9), (5, 1.6), (7, 3.2)],
}
def play(name, t0, amp=0.16):
    t = t0
    for deg, d in phrases[name]:
        put(flute(note(deg), d * 1.15, amp), t, 1.0, pan=-0.15)
        t += d
cues = [("open", 0.3), ("walk", T["s2d"]), ("walk", T["s3a"]), ("proud", T["s3d"] - 0.3), ("sad", T["s3f"]),
        ("sad", T["s4e"]), ("bloom", T["s5a"] + 1.5), ("sad", T["s5c"] + 2), ("gold", T["s6a"] + 1.2),
        ("bloom", T["s6d"]), ("gold", T["s6f"]), ("end", T["s7d"] - 0.5), ("end", TOTAL - 9)]
out[:] = 0
for name, t0 in cues: play(name, t0)
flute_track = out.copy(); out[:] = 0

# hand drum pulse on the walks (~72 bpm, soft "dha/tin")
def drum(f0, dur=0.5, amp=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 0.5 * np.exp(-tt * 30))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * amp
walks = [(T["s2d"] - 0.3, T["s3b"] + 5.6), (T["s5a"], T["s5c"] + 2.8)]
for a, b in walks:
    beat = 60 / 72; t = a; i = 0
    while t < b:
        put(drum(95 if i % 4 in (0, 2) else 180, amp=0.5 if i % 4 == 0 else 0.3), t, 0.25)
        t += beat; i += 1

music = np.stack([music, music], 1) + flute_track + out
out[:] = 0
mus_env = env([(0, 0), (0.6, 1), (T["s6a"], 1), (T["s6a"] + 2, 1.25), (TOTAL - 4, 1.25), (TOTAL, 0)]) * (1 - 0.5 * speech)
music *= mus_env[:, None]
music *= db(-26.5) / np.sqrt(np.mean(music ** 2) + 1e-12)

# ---------- ambience ----------
amb = np.zeros((N, 2))
wind = lp_fast(rng.standard_normal(N), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t_all))
wind /= np.sqrt(np.mean(wind ** 2))
amb += np.stack([wind, np.roll(wind, 3000)], 1) * db(-40)
spring_env = env([(0, 1), (T["s2d"] + 2, 1), (T["s2d"] + 5, 0), (T["s4a"] - 0.3, 0), (T["s4a"], 1), (T["s5a"] + 2, 1), (T["s5a"] + 5, 0), (TOTAL, 0)])
water = bp_fast(rng.standard_normal(N), 900, 6000) * (0.7 + 0.3 * np.abs(np.sin(2 * np.pi * 3.1 * t_all + np.sin(t_all * 7))))
water /= np.sqrt(np.mean(water ** 2))
amb += np.stack([water, np.roll(water, 1500)], 1) * (spring_env * db(-36))[:, None]
# birds: short FM chirps scattered (fewer during the dialogue at the spring, more in bloom scenes)
def chirp(f0, n_notes):
    s = []
    for j in range(n_notes):
        d = 0.06 + rng.random() * 0.05; n = int(d * SR); tt = np.arange(n) / SR
        f = f0 * (1 + 0.35 * np.sin(np.pi * tt / d)) * (1 + 0.1 * j)
        s.append(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) ** 2)
        s.append(np.zeros(int(0.04 * SR)))
    return np.concatenate(s)
t = 1.0
while t < TOTAL - 4:
    dense = 1.6 if (T["s5a"] < t < T["s5c"]) or (T["s6c"] < t < T["s7a"]) else 1.0
    put(chirp(2400 + rng.random() * 1800, int(2 + rng.random() * 4)), t, db(-38) * dense, pan=rng.random() * 1.6 - 0.8)
    t += (1.5 + rng.random() * 3.0) / dense
# footsteps on dry earth
def step():
    n = int(0.09 * SR); tt = np.arange(n) / SR
    return bp_fast(rng.standard_normal(n), 300, 3000) * np.exp(-tt * 45)
for a, b in walks:
    t = a + 0.1; i = 0
    while t < b:
        put(step(), t, db(-30) * (0.8 + 0.2 * (i % 2)), pan=0.15 if i % 2 else -0.15)
        t += 0.42; i += 1
# drips: a clear "plink" whenever a drop is in close-up
def plink(f):
    n = int(0.25 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f * (1 + 0.6 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 22)
drip_times = list(np.arange(1.2, T["s2a"] - 0.5, 1.1)) + list(np.arange(T["s2e"], T["s3a"], 0.55)) + list(np.arange(T["s3b"], T["s3b"] + 4, 0.6)) + [T["s6d"] + 0.55]
for k, dt in enumerate(drip_times):
    put(plink(1900 + (k * 137) % 700), dt, db(-30), pan=0.4)
# time-lapse: fast whoosh texture
tl_a, tl_b = T["s3c"] - 0.2, T["s3d"] - 0.5
amb[int(tl_a * SR): int(tl_b * SR)] *= 0.4

# ---------- SFX ----------
sfx = out
cat = {n: load(SFX + n + ".mp3") for n in ["chime", "whoosh-short", "whoosh-cinematic", "sparkle", "riser", "ping", "pop", "click-soft"]}
put(cat["chime"], 0.9, db(-24))
for cid in ["s2a", "s4a", "s5a", "s7b"]:
    put(cat["whoosh-short"], T[cid] - 0.25, db(-28))
put(cat["whoosh-cinematic"], tl_a - 0.3, db(-26))
riser = cat["riser"]; put(riser, max(0, T["s6a"] + 1.2 - len(riser) / SR), db(-28))
put(cat["sparkle"], T["s6a"] + 1.2, db(-24))
put(cat["sparkle"], T["s7a"] + 0.4, db(-24))
put(cat["chime"], T["s7a"], db(-26))
put(cat["ping"], T["s5a"] + 2.5, db(-30))
for k in range(6):
    put(cat["pop"][: int(0.15 * SR)], T["s5a"] + 3 + k * 1.1, db(-36), pan=0.5)
put(cat["ping"], E["s6d"] - 0.6, db(-28))
put(cat["sparkle"], T["s6c"] + 1.5, db(-32))
put(cat["chime"], TOTAL - 3.3, db(-24))

mix = music + amb + sfx
fade = env([(0, 0), (0.15, 1), (TOTAL - 0.8, 1), (TOTAL, 0)])
mix *= fade[:, None]
peak = np.abs(mix).max()
if peak > 0.89: mix *= 0.89 / peak
sf.write("public/audio/ep02/mix.wav", mix.astype(np.float32), SR, subtype="PCM_16")
print(f"mix.wav {TOTAL:.1f}s peak {peak:.3f}")
