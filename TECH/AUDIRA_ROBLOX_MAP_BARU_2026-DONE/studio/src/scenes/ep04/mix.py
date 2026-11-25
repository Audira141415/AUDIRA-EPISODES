"""EP04 audio bed (ARCADECRT): midnight-arcade chiptune (pulse lead, triangle bass, noise hats),
a low CRT hum + flyback whine, water drips, and SFX anchored to word times of the locked voice.
No voice in here. Seeded, deterministic.
Run from studio/:  python src/scenes/ep04/mix.py   -> public/audio/ep04/bed.wav
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
OUT = os.path.join("public", "audio", "ep04", "bed.wav")
N = int(TOTAL * SR)
rng = np.random.default_rng(404)


def norm(s):
    return re.sub(r"[.,:;!?\"]", "", s.lower())


def W(lid, word, nth=0):
    line = next(l for l in TL["lines"] if l["id"] == lid)
    hits = [w for w in line["words"] if norm(w["w"]) == norm(word)]
    return hits[nth]["s"]


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


def env(n, a=0.003, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def pulse(freq, dur, duty=0.25):
    n = int(dur * SR)
    ph = (np.arange(n) * freq / SR) % 1.0
    return np.where(ph < duty, 1.0, -1.0)


def tri(freq, dur):
    n = int(dur * SR)
    ph = (np.arange(n) * freq / SR) % 1.0
    return 4 * np.abs(ph - 0.5) - 1


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------- music: 112 BPM, A minor arcade loop ----------
BPM = 112
BEAT = 60 / BPM
STEP = BEAT / 4  # 16th
BAR = BEAT * 4
PROG = [57, 53, 48, 55]  # Am F C G (bass roots, MIDI)
ARP = {57: [69, 72, 76, 72], 53: [65, 69, 72, 69], 48: [64, 67, 72, 67], 55: [67, 71, 74, 71]}
LEAD = [76, None, 74, 72, None, 72, 74, 76, 79, None, 76, None, 74, None, 72, None]

music_end = OUTRO + 3.0


def section_gain(t):
    # softer under dense explanation, fuller in hook and payoff
    if t < 4.4:
        return 1.0
    if t < W("l11", "Jadi") - 0.3:
        return 0.7
    return 1.0


t = 0.0
bar_i = 0
while t < music_end:
    root = PROG[bar_i % 4]
    g = section_gain(t)
    # triangle bass: 8ths
    for k in range(8):
        tt = t + k * BEAT / 2
        n = (root - 12) if k % 2 == 0 else root
        s = tri(mtof(n), BEAT / 2 * 0.9) * env(int(BEAT / 2 * 0.9 * SR), 0.004, 0.25)
        add(s, tt, 0.16 * g)
    # pulse arpeggio: 16ths
    for k in range(16):
        tt = t + k * STEP
        n = ARP[root][k % 4]
        s = pulse(mtof(n), STEP * 0.8, 0.125) * env(int(STEP * 0.8 * SR), 0.002, 0.07)
        add(s, tt, 0.045 * g, pan=-0.35)
    # lead every other bar (lighter during explanation)
    if bar_i % 2 == 1 or t < 4.4 or t > W("l11", "Jadi"):
        for k, n in enumerate(LEAD):
            if n is None:
                continue
            tt = t + k * STEP
            s = pulse(mtof(n), STEP * 1.6, 0.5) * env(int(STEP * 1.6 * SR), 0.004, 0.18)
            add(s, tt, 0.05 * g * (0.6 if 4.4 < t < W("l11", "Jadi") else 1.0), pan=0.3)
    # drums: kick on 1 and 3, noise snare on 2 and 4, hats on 8ths
    for k in range(4):
        tt = t + k * BEAT
        if k % 2 == 0:
            n = int(0.18 * SR)
            f = 120 * np.exp(-np.arange(n) / SR * 22) + 45
            s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.09)
            add(s, tt, 0.32 * g)
        else:
            n = int(0.12 * SR)
            s = rng.uniform(-1, 1, n) * env(n, 0.001, 0.045)
            add(s, tt, 0.09 * g)
    for k in range(8):
        n = int(0.03 * SR)
        s = np.diff(rng.uniform(-1, 1, n + 1)) * env(n, 0.0005, 0.01)
        add(s, t + k * BEAT / 2, 0.05 * g, pan=0.4)
    t += BAR
    bar_i += 1

# fade music under the outro card
fade = np.ones(N)
i0, i1 = int((OUTRO + 1.0) * SR), int(min(TOTAL, OUTRO + 3.2) * SR)
fade[i0:i1] = np.linspace(1, 0, i1 - i0)
fade[i1:] = 0
bed *= fade[:, None]

# ---------- ambience: CRT hum (60 Hz + harmonics), faint flyback whine, water drips ----------
tt = np.arange(N) / SR
hum = 0.012 * np.sin(2 * np.pi * 60 * tt) + 0.006 * np.sin(2 * np.pi * 120 * tt) + 0.003 * np.sin(2 * np.pi * 180 * tt)
whine = 0.0016 * np.sin(2 * np.pi * 15734 * tt)
amb = (hum + whine) * np.minimum(1, tt / 0.8) * np.clip((TOTAL - tt) / 1.5, 0, 1)
bed[:, 0] += amb
bed[:, 1] += amb
for d in np.arange(1.3, VO_END, 2.9):
    tdrip = d + rng.uniform(-0.6, 0.6)
    n = int(0.12 * SR)
    f = 900 + 900 * np.exp(-np.arange(n) / SR * 40)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.03)
    add(s, tdrip, 0.03, pan=rng.uniform(-0.7, 0.7))


# ---------- SFX ----------
def load(name):
    p = os.path.join(SFX_DIR, name + ".mp3")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def blip(freqs, dur=0.06):
    out = np.concatenate([pulse(f, dur, 0.5) * env(int(dur * SR), 0.001, dur * 0.7) for f in freqs])
    return out


S = {k: load(k) for k in ["impact-bass-1", "whoosh-cinematic", "whoosh-short", "pop", "click", "glitch-1", "glitch-2", "ping", "riser", "sparkle", "chime", "error"]}

cues = [
    ("glitch-1", 0.05, 0.25),  # CRT power-on
    ("impact-bass-1", W("l01", "Tanpa") - 0.05, 0.3),
    ("whoosh-short", W("l01", "Roblox") + 0.25, 0.22),  # avatar jumps onto the TV
    ("whoosh-cinematic", W("l02", "Gambar") - 0.4, 0.2),
    ("ping", W("l03", "wajib"), 0.2),  # feed tick
    ("whoosh-short", W("l03", "Thumbnail") - 0.2, 0.2),
    ("error", W("l03", "tidak"), 0.22),  # default stamp
    ("whoosh-cinematic", W("l04", "Formatnya") - 0.2, 0.18),
    ("pop", W("l04", "16:9") - 0.15, 0.22),
    ("pop", W("l04", "1920×1080") - 0.15, 0.22),
    ("pop", W("l04", "3") - 0.15, 0.22),
    ("riser", W("l05", "personalisasi") - 1.0, 0.16),
    ("pop", W("l05", "2") - 0.1, 0.2),
    ("pop", W("l05", "5") - 0.1, 0.2),
    ("sparkle", W("l05", "memilih"), 0.2),
    ("whoosh-cinematic", W("l06", "Dalam") - 0.2, 0.18),
    ("impact-bass-1", W("l06", "8,5%") - 0.2, 0.22),
    ("impact-bass-1", W("l06", "50%") - 0.2, 0.28),
    ("click", W("l07", "video?"), 0.25),
    ("pop", W("l07", "gameplay") - 0.2, 0.2),
    ("pop", W("l07", "tanpa") - 0.2, 0.2),
    ("pop", W("l07", "maksimal") - 0.2, 0.2),
    ("whoosh-short", W("l08", "Hati-hati") - 0.3, 0.22),
    ("error", W("l08", "tidak"), 0.24),
    ("whoosh-short", W("l09", "Judul") - 0.2, 0.2),
    ("glitch-2", W("l09", "sesuai") - 0.05, 0.2),
    ("whoosh-short", W("l10", "Moments") - 0.4, 0.2),
    ("click", W("l10", "diklik") + 0.1, 0.3),
    ("ping", W("l10", "penuh") - 0.3, 0.16),
    ("whoosh-cinematic", W("l11", "Jadi") - 0.2, 0.18),
    ("sparkle", W("l11", "sentuhanmu") - 0.1, 0.22),
    ("pop", W("l12", "buat"), 0.18),
    ("pop", W("l12", "beberapa"), 0.18),
    ("pop", W("l12", "versi"), 0.18),
    ("riser", W("l12", "data") - 1.2, 0.16),
    ("chime", W("l12", "pemenangnya") - 0.1, 0.26),
    ("whoosh-cinematic", W("l13", "Episode") - 0.2, 0.16),
    ("impact-bass-1", OUTRO, 0.22),
]
for name, at, g in cues:
    add(S[name], at, g)

# chip blips on avatar landings
for lid, w in [("l04", "Formatnya"), ("l07", "Mau"), ("l11", "Jadi")]:
    add(blip([660, 880, 1320]), W(lid, w) + 0.9, 0.05)

peak = np.max(np.abs(bed))
if peak > 0.89:
    bed *= 0.89 / peak
bed *= 0.5  # bed sits ~15 dB under the voice after the -5 dB + sidechain in the mix step
os.makedirs(os.path.dirname(OUT), exist_ok=True)
pcm = (np.clip(bed, -1, 1) * 32767).astype("<i2")
with wave.open(OUT, "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes(pcm.tobytes())
print("wrote", OUT, round(N / SR, 3), "s, peak", round(float(peak), 3))
