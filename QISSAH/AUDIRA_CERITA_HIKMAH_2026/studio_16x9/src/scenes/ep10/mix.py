# EP10 Cinta dan Waktu — music + ambience + SFX bed (no voice). Run from studio_16x9/:
#   python src/scenes/ep10/mix.py
# Music: a "cathedral" bed — glass-harmonica bells (soft FM) over a reed-organ drone, D Dorian while the
# island lives and floods, a low tremolo cello pulse under the storm, then D major and a rising bell
# line when Time arrives; the hikmah closes on a warm major chord. Ambience: surf, wind, rain, thunder.
# All cue times come from the locked voice timeline (clip ids).
import json, subprocess, numpy as np, soundfile as sf

SR = 48000
SFX = "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/"
tl = json.load(open("src/scenes/ep10/timeline.json", encoding="utf8"))
T = {c["id"]: c["start"] for c in tl["clips"]}
E = {c["id"]: c["end"] for c in tl["clips"]}
TOTAL = tl["total"]
N = int(TOTAL * SR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(10)
db = lambda x: 10 ** (x / 20)


def load(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(p, dtype=np.float32).reshape(-1, 2).copy()
    return a / max(1e-6, np.abs(a).max())


def env(pts):
    return np.interp(t_all, [p[0] for p in pts], [p[1] for p in pts])


def filt(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    if lo: X *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi: X *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X, len(x))


out = np.zeros((N, 2))


def put(buf, t, vol, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    if buf.ndim == 1: buf = np.stack([buf, buf], 1)
    e = min(N, i + len(buf))
    g = np.array([np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))]) * np.sqrt(2)
    out[i:e] += buf[: e - i] * vol * g


# speech envelope for ducking (the bed already sits right under the voice)
speech = np.zeros(N)
for c in tl["clips"]:
    speech[int(c["start"] * SR): int(c["end"] * SR)] = 1
k = int(0.4 * SR); cs = np.concatenate([[0], np.cumsum(speech)]); idx = np.arange(N)
speech = (cs[np.clip(idx + k // 2, 0, N)] - cs[np.clip(idx - k // 2, 0, N)]) / k
duck = 1 - 0.45 * speech

# story envelopes
storm = env([(0, 0.6), (T["s2a"] - 1, 0.6), (T["s2a"], 0), (T["s3a"], 0), (T["s3b"] + 1, 1), (T["s8d2"], 1), (E["s8d2"], 0.15), (T["s9a"], 0), (TOTAL, 0)])
major = env([(0, 0), (T["s8a"], 0), (T["s8b"] + 2, 1), (TOTAL, 1)])

# ---------- music ----------
def note(f, dur, amp=1.0, kind="bell"):
    n = int(dur * SR); tt = np.arange(n) / SR
    if kind == "bell":  # glass harmonica-ish: soft FM, slow attack, long decay
        mod = np.sin(2 * np.pi * f * 2.0 * tt) * 0.9 * np.exp(-tt * 1.5)
        y = np.sin(2 * np.pi * f * tt + mod) * (1 - np.exp(-tt * 30)) * np.exp(-tt * 0.9)
        y += 0.25 * np.sin(2 * np.pi * f * 3.01 * tt) * np.exp(-tt * 2.2)
    elif kind == "organ":
        y = sum(a * np.sin(2 * np.pi * f * h * tt) for h, a in [(1, 1), (2, 0.5), (3, 0.25), (4, 0.12)])
        a = np.minimum(1, tt / 1.5) * np.minimum(1, (dur - tt) / 1.5)
        y *= a
    else:  # cello tremolo
        y = (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2 * tt) + 0.2 * np.sin(2 * np.pi * f * 3 * tt))
        y *= (0.6 + 0.4 * np.sin(2 * np.pi * 7 * tt)) * np.minimum(1, tt / 0.3) * np.minimum(1, (dur - tt) / 0.5)
    return y * amp


def hz(m): return 440 * 2 ** ((m - 69) / 12)

music = np.zeros(N)
# drone: D2 + A2 organ, chord colour follows the story (Dm7 -> D major)
BAR = 60 / 66 * 4
chords_minor = [[50, 57, 60, 65], [48, 55, 60, 64], [46, 53, 58, 62], [45, 52, 57, 60]]  # Dm, C, Bb, Am
chords_major = [[50, 57, 62, 66], [55, 59, 62, 67], [47, 54, 59, 62], [45, 52, 57, 61]]  # D, G, Bm, A
t0 = 0.0; bar = 0
while t0 < TOTAL - 1:
    i = int(t0 * SR); mj = major[min(i, N - 1)]
    ch = chords_major[bar % 4] if mj > 0.5 else chords_minor[bar % 4]
    for m in ch:
        y = note(hz(m), BAR + 1.2, 0.05, "organ")
        e = min(N, i + len(y)); music[i:e] += y[: e - i]
    t0 += BAR; bar += 1
# bells: D Dorian / D major melody fragments, sparser under dialogue
scale_minor = [62, 64, 65, 67, 69, 71, 72, 74]
scale_major = [62, 64, 66, 67, 69, 71, 73, 74]
step = 60 / 66
t0 = 0.6; j = 0
mel = rng.integers(0, 8, 4000)
while t0 < TOTAL - 3:
    i = int(t0 * SR)
    if rng.random() < 0.55 - 0.35 * speech[i]:
        sc = scale_major if major[i] > 0.5 else scale_minor
        m = sc[mel[j] % 8] + (12 if rng.random() < 0.2 else 0)
        y = note(hz(m), 3.5, 0.11)
        e = min(N, i + len(y)); music[i:e] += y[: e - i]
    t0 += step * (1 if rng.random() < 0.7 else 2); j += 1
# storm cello pulse (low D tremolo)
for t0 in np.arange(T["s3a"], T["s8b"], BAR):
    y = note(hz(38), BAR + 0.4, 0.09, "cello")
    i = int(t0 * SR); e = min(N, i + len(y)); music[i:e] += y[: e - i] * storm[i]
# rescue: rising bell line, and the hikmah closing chord
for n_, m in enumerate([62, 66, 69, 74, 78]):
    y = note(hz(m), 4, 0.16); i = int((T["s8b"] + n_ * 0.45) * SR); e = min(N, i + len(y)); music[i:e] += y[: e - i]
for m in [50, 57, 62, 66, 69, 74]:
    y = note(hz(m), 9, 0.07, "organ"); i = int(T["s10e"] * SR); e = min(N, i + len(y)); music[i:e] += y[: e - i]
    y = note(hz(m + 12), 6, 0.06); e = min(N, i + len(y)); music[i:e] += y[: e - i]
music = filt(music, lo=40, hi=7000)
music *= env([(0, 0), (0.5, 1), (TOTAL - 4, 1), (TOTAL - 0.3, 0.6), (TOTAL, 0)]) * duck
mus2 = np.stack([music, np.roll(music, int(0.012 * SR)) * 0.95], 1)  # tiny stereo width
out += mus2 * db(-10)

# ---------- ambience ----------
noise = rng.standard_normal(N)
surf = filt(noise, lo=80, hi=900) * (0.55 + 0.45 * np.sin(2 * np.pi * t_all / 6.5) ** 2)
wind = filt(rng.standard_normal(N), lo=150, hi=1400) * (0.5 + 0.5 * np.sin(2 * np.pi * t_all / 9.0 + 1) ** 2)
rain = filt(rng.standard_normal(N), lo=2500, hi=9000)
amb = surf * (0.35 + 0.65 * storm) * 0.5 + wind * storm * 0.6 + rain * storm * 0.25
amb *= env([(0, 0), (1, 1), (TOTAL - 3.5, 1), (TOTAL - 1, 0), (TOTAL, 0)]) * (1 - 0.3 * speech)
amb /= np.abs(amb).max()
out += np.stack([amb, np.roll(amb, int(0.02 * SR))], 1) * db(-22)

# thunder at the lightning flashes (same list as story.ts flashAt)
flashes = [T["s3a"] + 1.6, T["s3b"] + 0.4, T["s3b2"] + 2.4, T["s3c"] + 0.2, T["s4a"] - 0.6, T["s5e"] + 0.3, T["s7a"] + 0.2, T["s7e"] + 0.4, T["s7e"] + 3.0, T["s8a"] + 0.2, 1.4]
for f0 in flashes:
    n = int(3.5 * SR); tt = np.arange(n) / SR
    th = filt(rng.standard_normal(n), hi=220) * np.exp(-tt * 1.3) * (1 - np.exp(-tt * 25))
    crack = filt(rng.standard_normal(n), lo=1500) * np.exp(-tt * 18)
    y = th / np.abs(th).max() + 0.35 * crack / np.abs(crack).max()
    put(y, f0 + 0.15, db(-14), pan=rng.uniform(-0.4, 0.4))

# ---------- SFX ----------
S = {n: load(SFX + n + ".mp3") for n in ["chime", "ping", "whoosh", "whoosh-short", "whoosh-cinematic", "riser", "sparkle", "impact-bass-1"]}
for i in range(7):
    put(S["ping"], 0.5 + i * 0.65, db(-26), pan=-0.6 + i * 0.2)  # panes lighting up in the hook
put(S["chime"], T["s1c"] - 0.1, db(-18))
put(S["whoosh-cinematic"], T["s2a"] - 1.4, db(-22))
for i in range(5):
    put(S["ping"], T["s2a"] - 0.3 + i * 0.6, db(-28), pan=-0.5 + i * 0.25)
put(S["impact-bass-1"], T["s3a"] - 0.1, db(-18))
put(S["whoosh-short"], T["s3d"] + 0.6, db(-24))
for sid, pan in [("s4a", -0.5), ("s5a", 0.5), ("s6a", -0.5), ("s7a", 0.5)]:
    put(S["whoosh"], T[sid] - 0.3, db(-25), pan=pan)  # a boat panel slides in
for sid, pan in [("s4e", -0.6), ("s5d", -0.6), ("s6e", -0.6), ("s7d", 0.6)]:
    put(S["whoosh-short"], T[sid], db(-27), pan=pan)  # and slides away
put(S["riser"], T["s8a"] - 3.0, db(-22))
put(S["chime"], T["s8b"], db(-20), pan=0.4)
put(S["whoosh-cinematic"], T["s8d2"], db(-24))
put(S["sparkle"], T["s9d"] + 1.2, db(-20), pan=0.5)
put(S["chime"], T["s9g"] + 1.8, db(-20))
for i, sid in enumerate(["s10a", "s10b", "s10c", "s10d"]):
    put(S["ping"], T[sid] - 0.2, db(-26), pan=-0.6 + i * 0.4)
put(S["sparkle"], T["s10e"], db(-20))
put(S["chime"], TOTAL - 3.0, db(-17))

# master: keep the bed well under the voice (voice -16 LUFS goes on top later)
out *= db(6)  # bed around -24 LUFS
peak = np.abs(out).max()
out *= db(-3) / peak if peak > db(-3) else 1
sf.write("public/audio/ep10/mix.wav", out.astype(np.float32), SR, subtype="PCM_16")
print("mix.wav", round(TOTAL, 2), "s, peak", round(20 * np.log10(np.abs(out).max() + 1e-9), 1), "dBFS")
