# EP09 MEMAAFKAN bed: soft wooden marimba + breathy flute pad (pentatonic), town ambience, wind, SFX.
# No voice. Run from studio_16x9/:  python src/scenes/ep09/mix.py  ->  public/audio/ep09/mix.wav (48 kHz stereo)
# All cue times come from timeline.json with the same beat formulas as Film.tsx.
import json, subprocess, wave
import numpy as np
from scipy.signal import lfilter

SR = 48000
tl = json.load(open("src/scenes/ep09/timeline.json", encoding="utf8"))
TOTAL = tl["total"]
T = {c["id"]: c["start"] for c in tl["clips"]}
E = {c["id"]: c["end"] for c in tl["clips"]}
N = int(TOTAL * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(9)

HOOK_END = T["s2a"] - 0.6
TEAR = T["s5e"] - 0.25
RAISE = T["s5d"] + 0.4
PICKUP = T["s4g"] + 0.6
BACK_UP = T["s6a"] - 0.3
DUSK_IN = T["s7a"] - 0.6
OUTRO = TOTAL - 3

def ramp(a, b):
    k = np.clip((t - a) / max(1e-4, b - a), 0, 1)
    return k * k * (3 - 2 * k)
def lp(x, a): return lfilter([a], [1, a - 1], x)
def hp(x, a): return x - lp(x, a)
def db(x): return 10 ** (x / 20)
def hz(n): return 440 * 2 ** (n / 12)  # semitones from A4
def place(buf, x, at):
    i = int(at * SR)
    if i >= N or i + len(x) <= 0: return
    j = min(N, i + len(x))
    buf[max(0, i):j] += x[max(0, -i):j - i]

# ---------- instruments ----------
def marimba(f0, amp, dur=1.6):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * f0 * tt) * np.exp(-tt * 3.2) + 0.28 * np.sin(2 * np.pi * f0 * 3.93 * tt) * np.exp(-tt * 14) + 0.1 * np.sin(2 * np.pi * f0 * 9.2 * tt) * np.exp(-tt * 40)
    return amp * x * np.minimum(1, tt / 0.002)

def flute_pad(f0, dur, amp):
    n = int(dur * SR); tt = np.arange(n) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 4.8 * tt)
    s = np.sin(2 * np.pi * f0 * np.cumsum(vib) / SR) + 0.3 * np.sin(2 * np.pi * f0 * 2 * tt + 0.5) + 0.12 * np.sin(2 * np.pi * f0 * 3 * tt)
    breath = lp(rng.standard_normal(n), 0.25) * 0.08
    a = np.clip(np.minimum(tt / 1.6, (dur - tt) / 1.8), 0, 1)
    return amp * (s + breath) * a / 1.4

mar = np.zeros(N); padb = np.zeros(N)

C = -9  # C4
MAJ = [0, 2, 4, 7, 9, 12, 14, 16]       # C major pentatonic
MIN = [0, 3, 5, 7, 10, 12, 15, 17]      # A minor pentatonic (relative)
motif = [4, 3, 2, None, 3, 2, 0, None, 1, 2, 4, 3, None, 2, None, None]
dusk_motif = [4, None, 3, 2, None, None, 0, None, 1, None, 0, None, None, None, None, None]
CH_MAJ = [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]]
CH_MIN = [[-3, 0, 4], [5, 9, 12], [0, 4, 7], [-5, -1, 2]]

def phrase(start, end, bpm, scale, mot, base, amp, chords, pad_amp=0.05, octave=12):
    b = 60 / bpm
    k = 0; at = start
    while at < end:
        d = mot[k % len(mot)]
        if d is not None:
            place(mar, marimba(hz(base + octave + scale[d]), amp * rng.uniform(0.85, 1.0)), at + rng.uniform(-0.008, 0.008))
        if k % 8 == 0:
            for s in chords[(k // 8) % len(chords)]:
                place(padb, flute_pad(hz(base + s), b * 8.6, pad_amp), at)
        k += 1; at += b

# hook: airy, a few notes over the wind
phrase(0.6, HOOK_END, 84, MAJ, [4, None, None, 2, None, None, 0, None], C, 0.12, CH_MAJ, 0.03)
# the town and the confession: gentle, slow
phrase(HOOK_END + 0.4, T["s4a"], 76, MAJ, motif, C, 0.11, CH_MAJ, 0.045)
# the teacher's order: pad only, a held moment
for at in np.arange(T["s4a"], T["s4g"], 7.0):
    for s in [-3, 0, 4]: place(padb, flute_pad(hz(C + s), 7.6, 0.05), at)
# the walk down: walking rhythm
phrase(T["s4g"], T["s5d"] - 0.5, 92, MAJ, [0, 2, 4, 2, 3, None, 2, None, 0, 2, 4, 5, 4, None, 2, None], C, 0.1, CH_MAJ, 0.04)
# the burst: rising flurry of notes carried by the wind
for i in range(48):
    at = TEAR + i * 0.16 + rng.uniform(0, 0.05)
    deg = (i * 3) % 8
    place(mar, marimba(hz(C + 12 + MAJ[deg] + 12 * (i % 3 == 0)), 0.09 * (1 - i / 60), 1.2), at)
for s in [0, 4, 7, 12]: place(padb, flute_pad(hz(C + s), E["s5g"] + 1.5 - TEAR, 0.05), TEAR)
# relief, then back up the hill: pad
for at in np.arange(T["s5h"], T["s6d"], 6.5):
    for s in [0, 4, 9]: place(padb, flute_pad(hz(C + s), 7.0, 0.045), at)
# "not yet": a low single note, then a cold fifth
place(mar, marimba(hz(C - 12), 0.14, 3.0), T["s6d"] + 0.1)
for s in [-12, -5]: place(padb, flute_pad(hz(C + s), DUSK_IN - T["s6d"], 0.05), T["s6d"])
# dusk search: sparse minor marimba
phrase(DUSK_IN + 0.5, T["s8a"] - 0.5, 60, MIN, dusk_motif, C - 3, 0.1, CH_MIN, 0.045)
# hikmah: warm resolution, the motif slow
phrase(T["s8a"], OUTRO + 1.5, 70, MAJ, motif, C, 0.1, [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]], 0.055)

music = lp(mar + padb, 0.6)
duck = np.ones(N)
for c in tl["clips"]:
    duck = np.minimum(duck, 1 - 0.45 * (np.clip((t - (c["start"] - 0.25)) / 0.25, 0, 1) * np.clip(((c["end"] + 0.35) - t) / 0.35, 0, 1)))
music *= duck
music *= 1 - ramp(OUTRO + 2.2, TOTAL)

# ---------- ambience ----------
white = rng.standard_normal(N)
amb = np.zeros(N)
# wind: always a little, gusting in the square and in the burst
gust = 0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t) * np.sin(2 * np.pi * 0.037 * t + 1)
windK = 0.25 + 0.75 * (1 - ramp(HOOK_END, HOOK_END + 1)) + 0.6 * ramp(T["s5c"], T["s5c"] + 2) * (1 - ramp(E["s5g"], T["s5h"] + 2)) + 0.5 * ramp(TEAR - 0.3, TEAR + 0.3) * (1 - ramp(TEAR + 6, TEAR + 12))
wind = lp(hp(white, 0.02), 0.06)
amb += wind * 0.09 * windK * (0.6 + 0.4 * gust)
# fountain trickle when we are in the square
inSquare = (1 - ramp(HOOK_END, HOOK_END + 0.5)) + ramp(T["s5c"], T["s5c"] + 1) * (1 - ramp(BACK_UP, BACK_UP + 0.5)) + ramp(DUSK_IN, DUSK_IN + 1) * (1 - ramp(T["s8a"], T["s8a"] + 3))
trickle = hp(white, 0.35) * (0.6 + 0.4 * lp(np.abs(rng.standard_normal(N)), 0.002) * 3)
amb += lp(trickle, 0.5) * 0.012 * inSquare
# day birds (until dusk)
day = 1 - ramp(T["s7a"], T["s7a"] + 4)
for at in np.arange(HOOK_END, T["s7a"] + 3, 1.3):
    n = int(0.16 * SR); tt = np.arange(n) / SR
    f = 3000 + 800 * np.sin(tt * 45) + rng.uniform(-400, 400)
    place(amb, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.16) * 0.012 * float(day[min(N - 1, int(at * SR))]), at + rng.uniform(0, 0.8))
# crickets at dusk
crk = np.zeros(N)
for k, f in enumerate([4200, 4650, 5050]):
    gate = (np.sin(2 * np.pi * (1.2 + k * 0.37) * t + k) > 0.55).astype(float) * (np.sin(2 * np.pi * 26 * t) > 0)
    crk += np.sin(2 * np.pi * f * t) * lp(gate, 0.02) * 0.008
amb += crk * ramp(T["s7c"], T["s7d"]) * (1 - ramp(OUTRO, TOTAL))
amb *= 0.65 + 0.35 * duck

# ---------- SFX ----------
SFX = "F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/"
def load(name):
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", SFX + name + ".mp3", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
sfx = np.zeros(N)
def cue(name, at, gain_db, dark=None):
    x = load(name) * db(gain_db)
    if dark: x = lp(x, dark)
    place(sfx, x, at)

cue("whoosh-cinematic", 0.2, -20, dark=0.3)          # opening gust
cue("whoosh-short", HOOK_END, -22, dark=0.3)          # into the story
cue("chime", T["s4a"] + 0.6, -26)                     # the teacher's smile
cue("pop", PICKUP + 0.4, -26, dark=0.4)               # pillow picked up
cue("riser", RAISE - 1.6, -24, dark=0.25)             # arms up
# fabric rip: band-passed noise burst with a grainy tear
n = int(0.5 * SR); tt = np.arange(n) / SR
rip = hp(rng.standard_normal(n), 0.4) * (np.abs(np.sin(2 * np.pi * 38 * tt)) ** 3) * np.exp(-tt * 5) * 0.16
place(sfx, rip, TEAR - 0.12)
cue("whoosh-cinematic", TEAR + 0.05, -14, dark=0.4)  # the feathers burst
cue("sparkle", TEAR + 0.5, -24)
cue("whoosh", T["s5g"] - 0.3, -22, dark=0.3)         # over the rooftops
cue("whoosh-short", BACK_UP, -24, dark=0.3)
cue("impact-bass-1", T["s6d"] + 0.05, -22, dark=0.12) # "not yet"
cue("whoosh-short", DUSK_IN, -24, dark=0.25)
for p in [T["s7b"] + 1.4, T["s7b"] + 4.4]:            # picking feathers
    cue("click-soft", p, -30, dark=0.5)
cue("chime", T["s7f"] + 0.4, -24)                     # he understands
cue("sparkle", T["s8f"] - 0.2, -22)                   # the hikmah line
cue("chime", OUTRO + 0.3, -16)

# footsteps on the walks (soft taps)
for a, b, step in [(HOOK_END + 0.3, T["s3a"] - 0.5, 0.48), (PICKUP + 1.4, T["s5c"] + 4.4, 0.42), (DUSK_IN, T["s7b"] - 0.2, 0.5)]:
    for at in np.arange(a, b, step):
        m = int(0.05 * SR); tt = np.arange(m) / SR
        place(sfx, lp(rng.standard_normal(m), 0.15) * np.exp(-tt * 70) * 0.05, at + rng.uniform(-0.02, 0.02))

# ---------- level and write ----------
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x[np.abs(x) > 1e-5] ** 2)) + 1e-12)
music *= db(-27 - rms_db(music))
mix = music + amb + sfx
peak = np.max(np.abs(mix))
if peak > db(-3): mix *= db(-3) / peak
mix *= np.minimum(1, t / 0.4) * np.minimum(1, (TOTAL - t) / 0.6)
st = np.stack([mix, mix], axis=1)
d = int(0.007 * SR)
st[d:, 1] = 0.82 * st[d:, 1] + 0.18 * mix[:-d]
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open("public/audio/ep09/mix.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"mix.wav {TOTAL:.1f}s  music rms {rms_db(music):.1f} dB  peak {20*np.log10(np.max(np.abs(mix))):.1f} dB")
