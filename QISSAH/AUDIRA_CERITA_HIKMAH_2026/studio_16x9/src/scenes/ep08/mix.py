# EP08 Mata Cinta Kopi Asin: music + ambience + SFX bed (NO voice). Run from studio_16x9/:
#   python src/scenes/ep08/mix.py
# Music identity: a nylon-string guitar waltz (3/4, F major, I-vi-IV-V, ~66 bpm), additive plucks with
# a soft body resonance; the letter (s10) turns to a sparse music-box melody over a held Dm-Bb-F-C;
# the hikmah brings the guitar back with a held F. Ambience per set: café murmur + cup clinks,
# garden-party chatter, sea waves + gulls, kitchen morning birds + wall clock, quiet room tone.
# All cues come from timeline.json (real voice), the bed dips under every line.
import json, subprocess, numpy as np, soundfile as sf

SR = 48000
SFX = "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/"
tl = json.load(open("src/scenes/ep08/timeline.json", encoding="utf8"))
T = {c["id"]: c["start"] for c in tl["clips"]}
E = {c["id"]: c["end"] for c in tl["clips"]}
TOTAL = tl["total"]
N = int(TOTAL * SR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(8)
db = lambda x: 10 ** (x / 20)

def load(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(p, dtype=np.float32).reshape(-1, 2).copy()
    return a / max(1e-6, np.abs(a).max())

def env(pts):
    return np.interp(t_all, [p[0] for p in pts], [p[1] for p in pts])

def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / (1 + (lo / np.maximum(f, 1)) ** 4)) * (1 / (1 + (f / hi) ** 4))
    return np.fft.irfft(X, len(x))

def put(out, buf, t, vol, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    if buf.ndim == 1: buf = np.stack([buf, buf], 1)
    e = min(N, i + len(buf))
    g = np.array([np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))]) * np.sqrt(2)
    out[i:e] += buf[: e - i] * vol * g

# ---------- set sections (same cuts as story.ts) ----------
SEC = [
    (0, T["s2a"] - 0.5, "cafe"), (T["s2a"] - 0.5, T["s4a"] - 0.6, "party"), (T["s4a"] - 0.6, T["s6a"] - 0.5, "cafe"),
    (T["s6a"] - 0.5, T["s7a"] - 0.6, "sea"), (T["s7a"] - 0.6, T["s8a"] - 0.6, "cafe"), (T["s8a"] - 0.6, T["s9a"] - 0.6, "kitchen"),
    (T["s9a"] - 0.6, T["s10c"] - 0.3, "room"), (T["s10c"] - 0.3, T["s10f"] - 0.3, "cafe"), (T["s10f"] - 0.3, T["s10i"] - 0.1, "room"),
    (T["s10i"] - 0.1, T["s10j"] - 0.2, "kitchen"), (T["s10j"] - 0.2, T["s11b"] - 0.4, "room"), (T["s11b"] - 0.4, TOTAL, "kitchen"),
]
def sec_env(name, xf=0.5):
    pts = [(0, 0)]
    for a, b, n in SEC:
        v = 1.0 if n == name else 0.0
        pts += [(a + 0.001, v), (max(a + 0.002, b - xf), v)]
    pts.append((TOTAL, pts[-1][1]))
    pts.sort(key=lambda p: p[0])
    return env(pts)

# speech envelope (smoothed) for ducking
speech = np.zeros(N)
for c in tl["clips"]:
    speech[int(c["start"] * SR): int(c["end"] * SR)] = 1
k = int(0.4 * SR); cs = np.concatenate([[0], np.cumsum(speech)]); idx = np.arange(N)
speech = (cs[np.clip(idx + k // 2, 0, N)] - cs[np.clip(idx - k // 2, 0, N)]) / k

# ---------- music ----------
music = np.zeros((N, 2))
def pluck(freq, dur, vel=1.0, bright=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    y = np.zeros(n)
    for h in range(1, 9):
        if freq * h > 9000: break
        y += (1 / h ** (1.3 / bright)) * np.sin(2 * np.pi * freq * h * tt * (1 + 0.0004 * h)) * np.exp(-tt * (1.6 + 0.9 * h))
    y += 0.25 * np.sin(2 * np.pi * 110 * tt) * np.exp(-tt * 8)  # body knock
    att = np.minimum(1, tt / 0.004)
    return y * att * vel

def bell(freq, dur, vel=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    y = np.sin(2 * np.pi * freq * tt) * np.exp(-tt * 2.2) + 0.35 * np.sin(2 * np.pi * freq * 2.76 * tt) * np.exp(-tt * 4.5) + 0.15 * np.sin(2 * np.pi * freq * 5.4 * tt) * np.exp(-tt * 7)
    return y * np.minimum(1, tt / 0.002) * vel

def hz(m): return 440 * 2 ** ((m - 69) / 12)
CH = {"F": [41, 53, 57, 60, 65], "Dm": [38, 50, 57, 62, 65], "Bb": [46, 53, 58, 62, 65], "C": [36, 52, 55, 60, 64], "Am": [45, 52, 57, 60, 64]}
BEAT = 60 / 66
letter_a, letter_b = T["s10a"] - 1.0, E["s10k"] + 1.0
hik_a = T["s12a"] - 0.6
prog = ["F", "Dm", "Bb", "C"]
t = 0.4; bar = 0
while t < TOTAL - 4:
    in_letter = letter_a <= t < letter_b
    ch = CH[prog[bar % 4]] if not in_letter else CH[["Dm", "Bb", "F", "C"][bar % 4]]
    if not in_letter:
        # 3/4 waltz: bass on 1, arpeggio eighths on 2 and 3
        put(music, pluck(hz(ch[0]), 3.0, 0.9), t, 0.5, -0.1)
        pat = [ch[1], ch[2], ch[3], ch[4], ch[3], ch[2]]
        for i, m in enumerate(pat):
            put(music, pluck(hz(m), 2.2, 0.55 + 0.1 * (i == 2), 1.2), t + (1 + i * 0.5) * BEAT * 0.666 + 0.02 * rng.random(), 0.42, 0.25 * np.sin(i))
        # a small melody in the party (brighter) and at the hikmah
        sec = [n for a, b, n in SEC if a <= t < b][0] if t < TOTAL else "kitchen"
        if sec == "party" or t >= hik_a:
            mel = [ch[4] + 12, ch[3] + 12, ch[4] + 12 + (2 if bar % 2 else 0)]
            for i, m in enumerate(mel):
                put(music, pluck(hz(m), 1.8, 0.5, 1.4), t + i * BEAT, 0.3, 0.3)
        t += 3 * BEAT
    else:
        # the letter: held soft chord (bowed-like sine pad) + sparse music box
        dur = 4 * BEAT
        n = int(dur * 1.3 * SR); tt = np.arange(n) / SR
        pad = sum(np.sin(2 * np.pi * hz(m + 12) * tt) for m in ch[1:4]) / 3
        pad *= np.minimum(1, tt / 0.8) * np.minimum(1, (n / SR - tt) / 0.8)
        put(music, pad, t, 0.12)
        notes = [ch[4] + 24, ch[3] + 24, ch[2] + 24] if bar % 2 == 0 else [ch[3] + 24, ch[4] + 24]
        for i, m in enumerate(notes):
            put(music, bell(hz(m), 2.5, 0.6), t + i * BEAT * 1.25, 0.22, 0.2 * (i - 1))
        t += dur
    bar += 1
music = np.stack([band(music[:, 0], 60, 9000), band(music[:, 1], 60, 9000)], 1)
level = env([(0, 0), (0.5, 1), (T["s2a"] - 0.5, 1), (T["s9a"] - 1, 1), (T["s9a"] + 1, 0.55), (T["s10a"], 0.8), (E["s10k"] + 1, 0.8), (T["s11a"], 0.6), (hik_a, 1.15), (OUT := TOTAL - 3.4, 1.15), (TOTAL, 0.6)])
duck = 1 - 0.5 * speech
music *= (level * duck)[:, None]

# ---------- ambience ----------
amb = np.zeros((N, 2))
noise = rng.standard_normal((N, 2))
# café murmur: band-limited noise with slow syllable-like amplitude
murm = np.stack([band(noise[:, i], 250, 1600) for i in range(2)], 1)
syll = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 1.7 * t_all + np.sin(2 * np.pi * 0.23 * t_all) * 3))
amb += murm * (syll * sec_env("cafe") * 0.06)[:, None]
# party chatter: brighter, busier, quieter after the guests leave (s3a)
chat = np.stack([band(noise[:, (i + 1) % 2], 300, 2600) for i in range(2)], 1)
syll2 = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 2.6 * t_all) * np.sin(2 * np.pi * 0.9 * t_all + 1))
party_lvl = env([(0, 1), (T["s3a"], 1), (T["s3a"] + 3, 0.25), (TOTAL, 0.25)])
amb += chat * (syll2 * sec_env("party") * party_lvl * 0.08)[:, None]
# sea: waves (slow swells of low noise) + gulls
waves = np.stack([band(noise[:, i], 80, 1200) for i in range(2)], 1)
swell = 0.35 + 0.65 * (0.5 + 0.5 * np.sin(2 * np.pi * t_all / 6.5)) ** 2
amb += waves * (swell * sec_env("sea") * 0.16)[:, None]
for gt in np.arange(T["s6a"], T["s7a"] - 1, 4.7):
    n = int(0.5 * SR); tt = np.arange(n) / SR
    f = 1500 + 700 * np.sin(2 * np.pi * 3 * tt) * np.exp(-tt * 2)
    g = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 5) * np.minimum(1, tt / 0.02)
    put(amb, g, gt + rng.random(), db(-34), pan=rng.uniform(-0.6, 0.6))
# kitchen: morning birds + wall clock tick; room: just the clock (quieter)
for bt in np.arange(0, TOTAL, 2.3):
    if sec_env("kitchen")[min(N - 1, int(bt * SR))] > 0.5:
        n = int(0.18 * SR); tt = np.arange(n) / SR
        f = 3200 + 900 * np.sin(2 * np.pi * 14 * tt)
        put(amb, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 18), bt + rng.random() * 0.8, db(-38), pan=rng.uniform(-0.7, 0.7))
tick = np.zeros(int(0.03 * SR)); tick[:] = band(rng.standard_normal(len(tick)), 1500, 6000) * np.exp(-np.arange(len(tick)) / SR * 300)
clock_env = np.maximum(sec_env("kitchen"), sec_env("room"))
for ct in np.arange(0, TOTAL, 1.0):
    v = clock_env[min(N - 1, int(ct * SR))]
    if v > 0.5:
        put(amb, tick, ct, db(-36) if sec_env("room")[min(N - 1, int(ct * SR))] > 0.5 else db(-42), pan=0.3)
room = np.stack([band(noise[:, i], 60, 400) for i in range(2)], 1)
amb += room * (sec_env("room") * 0.03)[:, None]
amb *= (1 - 0.35 * speech)[:, None]

# ---------- SFX ----------
sfx = np.zeros((N, 2))
cat = {n: load(SFX + n + ".mp3") for n in ["chime", "whoosh", "whoosh-short", "sparkle", "pop", "click-soft", "ping", "riser"]}
for a, b, n in SEC[1:]:
    put(sfx, cat["whoosh-short"], a - 0.25, db(-27))
put(sfx, cat["chime"], 0.6, db(-26))
# cup clinks in the café
for ct in [T["s4a"] + 1.0, T["s4c"] + 0.5, T["s7f"] + 0.4]:
    put(sfx, cat["click-soft"], ct, db(-30), pan=-0.4)
put(sfx, cat["pop"], E["s4f"] + 1.4, db(-30))            # shaker set on the table
put(sfx, cat["ping"], T["s5a"] + 0.2, db(-32))             # heads turn
for k2 in range(5):                                        # salt grains
    put(sfx, cat["click-soft"][: int(0.08 * SR)], T["s5c"] + 1.0 + k2 * 0.35, db(-36), pan=-0.3)
    put(sfx, cat["click-soft"][: int(0.08 * SR)], T["s8b"] + 1.0 + k2 * 0.35, db(-38), pan=-0.2)
put(sfx, cat["sparkle"], T["s7e"] - 0.2, db(-30))          # her memory hoop
for yt in np.linspace(T["s8d"], E["s8d"] + 0.6, 10):      # years flip
    put(sfx, cat["click-soft"][: int(0.06 * SR)], yt, db(-36), pan=0.5)
riser = cat["riser"]; put(sfx, riser, max(0, T["s10a"] - 0.4 - len(riser) / SR), db(-34))
put(sfx, cat["chime"], T["s10h"] - 0.3, db(-30))           # "aku tidak suka kopi asin"
put(sfx, cat["ping"], T["s11a"] + 0.6, db(-32))            # tear drop
put(sfx, cat["ping"], T["s11a"] + 1.8, db(-34))
put(sfx, cat["sparkle"], T["s11d"] - 0.2, db(-30))         # "manis"
put(sfx, cat["chime"], T["s12a"] - 0.4, db(-26))           # hikmah
put(sfx, cat["chime"], TOTAL - 3.3, db(-24))               # outro

mix = music * db(-6) + amb + sfx
fade = env([(0, 0), (0.15, 1), (TOTAL - 0.8, 1), (TOTAL, 0)])
mix *= fade[:, None]
# loudness: aim the bed around -24 LUFS integrated, peak-safe
sf.write("public/audio/ep08/mix_tmp.wav", mix.astype(np.float32), SR, subtype="FLOAT")
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", "public/audio/ep08/mix_tmp.wav", "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float([l for l in r.splitlines() if l.strip().startswith("I:")][-1].split()[1])
mix *= db(-24 - I)
peak = np.abs(mix).max()
if peak > 0.89: mix *= 0.89 / peak
sf.write("public/audio/ep08/mix.wav", mix.astype(np.float32), SR, subtype="PCM_16")
import os; os.remove("public/audio/ep08/mix_tmp.wav")
print(f"mix.wav {TOTAL:.1f}s, measured {I:.1f} LUFS -> -24, peak {peak:.3f}")
