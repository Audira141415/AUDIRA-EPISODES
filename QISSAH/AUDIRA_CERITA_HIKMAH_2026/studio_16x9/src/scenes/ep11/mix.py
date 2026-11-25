# EP11 KEARIFAN SEGENGGAM GARAM: music bed + ambience + SFX (no voice), timed from timeline.json.
# Run from studio_16x9/:  python src/scenes/ep11/mix.py  ->  public/audio/ep11/mix.wav (48 kHz stereo)
# Music identity: a "glass harmonica" (rubbed-glass sine partials with slow bloom and shimmer) playing a calm
# D major pentatonic at ~60 BPM over a soft low drone; a dry wooden kalimba pluck for the forest walk, and
# water-drop plinks when salt meets water. The glass voice suits a story told entirely inside glass.
# Ambience: cold-morning birds, forest breeze, lake lapping at the shore, crickets at night.
# Music dips under every voice line so the voice sits on top after scripts/combine-vo.sh.
import json, os, subprocess
import numpy as np
import soundfile as sf

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
tl = json.load(open(os.path.join(HERE, "timeline.json"), encoding="utf8"))
TOTAL = tl["total"]
N = int(TOTAL * SR)
T = {c["id"]: c["start"] for c in tl["clips"]}
E = {c["id"]: c["end"] for c in tl["clips"]}
rng = np.random.default_rng(1107)
t = np.arange(N) / SR

def db(x): return 10 ** (x / 20)
def ss(x):
    x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)
def env(keys):
    k = np.array(keys, dtype=float); return np.interp(t, k[:, 0], k[:, 1])
out = np.zeros((N, 2))
def put(sig, t0, gain=1.0, pan=0.0, buf=None):
    b = out if buf is None else buf
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0: return
    if sig.ndim == 1: sig = np.stack([sig * (1 - max(0, pan)), sig * (1 + min(0, pan))], 1)
    j = max(0, -i); i = max(0, i)
    n = min(len(sig) - j, N - i)
    b[i:i + n] += sig[j:j + n] * gain

# ---- scenes: day / place weights ----
morning = env([(0, 1), (T["s5b"], 1), (T["s6a"], 0)])
lake = env([(0, 0), (T["s5d"] - 1, 0), (T["s5d"] + 2, 1), (T["s8a"] + 3, 1), (T["s8b"], 0)])
forest = env([(0, 0.4), (T["s5a"], 0.4), (T["s5b"], 1), (T["s5d"], 1), (T["s6a"], 0.3)])
night = env([(0, 0), (E["s7k"], 0), (T["s8b"], 1), (TOTAL, 1)])

# ---- voice dips (music ducks under every spoken line) ----
speech = np.zeros(N)
for c in tl["clips"]:
    a, b = int((c["start"] - 0.15) * SR), int((c["end"] + 0.2) * SR)
    speech[max(0, a):min(N, b)] = 1
k = int(0.35 * SR)
c_ = np.cumsum(np.concatenate([np.zeros(k), speech]))
speech = np.roll((c_[k:] - c_[:-k]) / k, -k // 2)
duck = 1 - 0.55 * speech

# ---- instruments ----
D4 = 293.66
SCALE = [0, 2, 4, 7, 9]  # major pentatonic
def note(deg):
    o, i = divmod(deg, 5); return D4 * 2 ** ((SCALE[i] + 12 * o) / 12)
def glass(f, dur, amp=0.12):
    n = int(dur * SR); tt = np.arange(n) / SR
    a = np.minimum(1, tt / 0.35) * np.exp(-np.maximum(0, tt - dur * 0.55) * 2.2)
    vib = 1 + 0.0025 * np.sin(2 * np.pi * 5.2 * tt)
    s = (np.sin(2 * np.pi * f * vib * tt) + 0.32 * np.sin(2 * np.pi * 2.0 * f * tt) * np.exp(-tt * 1.5)
         + 0.12 * np.sin(2 * np.pi * 3.01 * f * tt) * np.exp(-tt * 3))
    return s * a * amp
def kalimba(f, amp=0.1):
    n = int(1.6 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * 5.4 * f * tt) * np.exp(-tt * 18)) * np.exp(-tt * 3.2) * amp
def drop(f=1400, amp=0.12):
    n = int(0.25 * SR); tt = np.arange(n) / SR
    ff = f * (1 + 1.4 * np.exp(-tt * 40))
    return np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-tt * 22) * amp

music = np.zeros((N, 2))
# drone (D2 + A2), breathing
for f, g in [(73.42, 0.05), (110.0, 0.035), (146.83, 0.02)]:
    dr = np.sin(2 * np.pi * f * t) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.05 * t + f))
    music[:, 0] += dr * g; music[:, 1] += dr * g * 0.9
# glass harmonica phrases
phr = {
    "open": [(4, 2.0), (3, 1.5), (2, 1.5), (4, 3.0)],
    "home": [(0, 1.5), (2, 1.5), (3, 1.0), (2, 3.0)],
    "sad": [(2, 2.0), (1, 1.5), (0, 2.0), (-1, 3.0)],
    "salt": [(5, 1.0), (4, 1.0), (2, 1.5), (1, 3.0)],
    "open2": [(0, 1.0), (2, 1.0), (4, 1.0), (5, 1.5), (7, 3.5)],
    "calm": [(4, 2.0), (5, 1.5), (4, 1.5), (2, 3.5)],
    "lesson": [(2, 2.0), (4, 2.0), (5, 2.0), (7, 4.0)],
    "end": [(4, 1.8), (2, 1.5), (3, 1.5), (0, 4.5)],
}
def play(name, t0, amp=0.11, oct_=0):
    tt = t0
    for deg, d in phr[name]:
        put(glass(note(deg + 5 * oct_), d * 1.3, amp), tt, 1.0, pan=0.15 * np.sin(tt), buf=music); tt += d
cues = [("open", 0.4), ("home", T["s2a"]), ("home", T["s2d"]), ("sad", T["s3c"]), ("sad", T["s3f"]),
        ("salt", T["s4a"]), ("sad", T["s4f"]), ("open2", T["s5d"] - 0.5), ("salt", T["s6b"]), ("calm", T["s6e"]),
        ("calm", T["s7a"]), ("lesson", T["s7e"]), ("lesson", T["s7h"]), ("open2", T["s7k"]), ("end", T["s8b"]), ("end", TOTAL - 10)]
for nme, t0 in cues: play(nme, t0)
# kalimba walking figure on the two walks
for a, b in [(T["s2d"], E["s2f"]), (T["s5a"] + 2.6, T["s5d"] + 2.5), (T["s8a"], T["s8b"])]:
    tt = a; i = 0
    while tt < b:
        put(kalimba(note([0, 2, 4, 2, 3, 1][i % 6] + 5), 0.07), tt, 1.0, pan=0.3, buf=music); tt += 0.75; i += 1
music *= duck[:, None]

# ---- ambience ----
amb = np.zeros((N, 2))
noise = rng.standard_normal((N, 2))
from scipy.signal import butter, sosfilt
def band(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x, axis=0)
breeze = band(noise, 150, 900) * (0.012 + 0.01 * np.sin(2 * np.pi * 0.07 * t))[:, None]
amb += breeze * (0.6 + 0.6 * forest)[:, None]
lap = band(rng.standard_normal((N, 2)), 300, 1600) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t) ** 2)[:, None] * 0.016
amb += lap * lake[:, None]
def chirp(f0):
    n = int(0.12 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * (f0 + 2500 * tt) * tt) * np.sin(np.pi * tt / 0.12) * 0.03
tt = 0.5
while tt < TOTAL:
    w = float(np.interp(tt, t[::SR], (morning + 0.5 * forest)[::SR]))
    if w > 0.15:
        f0 = rng.uniform(2600, 4200)
        for j in range(rng.integers(2, 5)): put(chirp(f0), tt + j * 0.14, w * 0.8, pan=rng.uniform(-0.8, 0.8), buf=amb)
    tt += rng.uniform(1.2, 3.5)
crick = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 28 * t) > 0.3) * (np.sin(2 * np.pi * 0.9 * t) > 0) * 0.006
amb[:, 0] += crick * night; amb[:, 1] += np.roll(crick, 9000) * night

# ---- SFX ----
sfx = np.zeros((N, 2))
SFXD = "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/"
def load(name):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SFXD + name + ".mp3", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
cat = {n: load(n) for n in ["whoosh", "whoosh-short", "whoosh-cinematic", "sparkle", "chime", "ping", "riser", "click-soft", "impact-bass-1"]}
put(cat["chime"], 0.3, db(-26), buf=sfx)
put(cat["whoosh-cinematic"], T["s2a"] - 0.6, db(-26), buf=sfx)
put(cat["whoosh-short"], T["s2c"] + 1.0, db(-28), buf=sfx)
for k in range(10): put(drop(rng.uniform(1500, 2600), 0.05), T["s4a"] + 1.1 + k * 0.17, 1.0, pan=0.2, buf=sfx)
put(cat["sparkle"], T["s4a"] + 1.0, db(-32), buf=sfx)
for k in range(14): put(cat["click-soft"][: int(0.08 * SR)], T["s4b"] + 0.3 + k * 0.29, db(-38), buf=sfx)  # spoon on glass
put(cat["whoosh-cinematic"], T["s5a"] - 0.2, db(-25), buf=sfx)
put(cat["riser"], T["s5d"] - 2.0, db(-32), buf=sfx)
put(cat["sparkle"], T["s6b"] + 0.6, db(-26), buf=sfx)
for k in range(16): put(drop(rng.uniform(1200, 2400), 0.06), T["s6b"] + 1.6 + k * 0.12, 1.0, pan=rng.uniform(-0.4, 0.4), buf=sfx)
for k in range(5): put(band(rng.standard_normal((int(0.5 * SR), 2)), 200, 1200) * 0.08 * np.hanning(int(0.5 * SR))[:, None], T["s6c"] + 0.6 + k * 0.9, 1.0, buf=sfx)
put(cat["ping"], T["s6d"] + 0.4, db(-30), buf=sfx)
for k in range(4): put(drop(900, 0.05), T["s6g"] + 1.6 + k * 0.3, 1.0, buf=sfx)
put(cat["whoosh"], T["s7e"] + 0.5, db(-28), buf=sfx)
put(cat["impact-bass-1"], T["s7f"], db(-30), buf=sfx)
put(cat["whoosh-short"], T["s7j"] - 0.2, db(-28), buf=sfx)
put(cat["chime"], T["s7j"] + 0.2, db(-26), buf=sfx)
put(cat["whoosh-cinematic"], T["s7k"] + 0.2, db(-26), buf=sfx)
put(cat["sparkle"], T["s7k"] + 1.0, db(-28), buf=sfx)
put(cat["whoosh-short"], T["s8b"] - 0.4, db(-30), buf=sfx)
put(cat["whoosh"], T["s8d"] - 0.3, db(-30), buf=sfx)
put(cat["chime"], TOTAL - 3.2, db(-24), buf=sfx)

mix = (music + amb + sfx) * db(4.0)
fade = env([(0, 0), (0.2, 1), (TOTAL - 0.8, 1), (TOTAL, 0)])
mix *= fade[:, None]
peak = np.abs(mix).max()
if peak > 0.89: mix *= 0.89 / peak
sf.write("public/audio/ep11/mix.wav", mix.astype(np.float32), SR, subtype="PCM_16")
print(f"mix.wav {TOTAL:.1f}s peak {peak:.3f}")
