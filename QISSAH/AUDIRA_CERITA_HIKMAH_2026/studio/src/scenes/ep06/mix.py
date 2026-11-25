# EP06 JESSICA silent-draft mix: music box lullaby + felt-free string pad, night ambience, SFX.
# Run from studio/:  python src/scenes/ep06/mix.py   ->  public/audio/ep06/mix.wav (48 kHz stereo)
# All cue times come from timeline.json (same beat formulas as Film.tsx), so the mix re-times with the voice.
import json, subprocess, wave
import numpy as np

SR = 48000
tl = json.load(open("src/scenes/ep06/timeline.json", encoding="utf8"))
TOTAL = tl["total"]
T = {c["id"]: c["start"] for c in tl["clips"]}
E = {c["id"]: c["end"] for c in tl["clips"]}
N = int(TOTAL * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(6)

ENTER = T["s2c"] + 0.6
AT_DESK = ENTER + 2.8
SHOUT = T["s3f"]
WEEKS0 = T["s4a"] - 0.6
AFTERNOON = T["s4c"] - 0.4
IMPACT = T["s4c"] + 1.9
BOOK_SHOT = T["s4f"] - 0.5
GRIEF = T["s5a"] - 0.6
OPEN_READ = T["s5e"] + 1.6
FREE = T["s6a"] + 0.4
OUTRO = TOTAL - 3.2

def ramp(a, b):
    k = np.clip((t - a) / max(1e-4, b - a), 0, 1)
    return k * k * (3 - 2 * k)

def env_keys(keys):
    xs = [k[0] for k in keys]; ys = [k[1] for k in keys]
    return np.interp(t, xs, ys)

def lp(x, a):  # one-pole low-pass, a in (0,1): smaller = darker
    from scipy.signal import lfilter
    return lfilter([a], [1, a - 1], x)

def hp(x, a):
    return x - lp(x, a)

def db(x):
    return 10 ** (x / 20)

# ---------- music: a music-box lullaby in D major, 3/4, ~66 bpm ----------
BPM = 66
beat = 60 / BPM
def note_hz(n):  # n = semitones from A4
    return 440 * 2 ** (n / 12)
D = -7  # D4
scale = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16]
# melody in scale degrees (None = rest), one per beat, 3 beats a bar
mel = [4, 2, 0, 1, 2, None, 4, 5, 4, 2, None, None,
       0, 1, 2, 4, 2, 1, 0, None, None, 2, 1, 0,
       4, 2, 0, 1, 2, 4, 5, 4, 2, 1, None, None,
       2, 1, 0, -3, 0, None, 0, None, None, None, None, None]
chords = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]]  # I IV V I (semitones over D3)

def musicbox(f0, dur, amp):
    n = int(dur * SR); tt = np.arange(n) / SR
    tone = np.sin(2 * np.pi * f0 * tt) + 0.35 * np.sin(2 * np.pi * f0 * 2.76 * tt) * np.exp(-tt * 9) + 0.18 * np.sin(2 * np.pi * f0 * 5.4 * tt) * np.exp(-tt * 18)
    return amp * tone * np.exp(-tt * 2.6) * np.minimum(1, tt / 0.003)

def pad(f0, dur, amp):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f0 * d * tt + p) for d, p in [(1, 0), (1.004, 1.3), (0.997, 2.1), (2.0, 0.4)])
    a = np.minimum(1, tt / 1.2) * np.minimum(1, (dur - tt) / 1.4)
    return amp * s * np.clip(a, 0, 1) / 4

mbox = np.zeros(N)
padL = np.zeros(N)

def place(buf, x, at):
    i = int(at * SR)
    if i >= N or i + len(x) <= 0: return
    j = min(N, i + len(x))
    buf[max(0, i):j] += x[max(0, -i):j - i]

def lullaby(start, end, tempo=1.0, detune=0.0, amp=0.16):
    b = beat / tempo
    k = 0
    at = start
    while at < end:
        deg = mel[k % len(mel)]
        if deg is not None:
            semis = scale[deg] if deg >= 0 else scale[deg + 7] - 12
            f = note_hz(D + 12 + semis + detune * np.sin(k * 1.7))
            place(mbox, musicbox(f, min(4.0, b * 3.5), amp), at + rng.uniform(-0.01, 0.01))
        if k % 6 == 0:
            ch = chords[(k // 6) % 4]
            for s in ch:
                place(padL, pad(note_hz(D + s), b * 6.3, 0.06), at)
        k += 1
        at += b

lullaby(0.3, SHOUT - 0.2)  # night: the lullaby with Jessica
lullaby(WEEKS0, AFTERNOON - 1.0, tempo=0.9, amp=0.11)  # two weeks: thinner, slower
# afternoon: just ambience; silence after the impact
# grief: low D minor drone pad
for at in np.arange(BOOK_SHOT, OPEN_READ, 6.0):
    for s in [0, 3, 7]:
        place(padL, pad(note_hz(D - 12 + s), 6.6, 0.07), at)
# reading: the lullaby returns slowly, hesitant at first
lullaby(OPEN_READ, OUTRO + 1.5, tempo=0.82, amp=0.15)

music = mbox + padL * 1.0
# after the shout: the lullaby stops mid-phrase; the pad holds one cold chord
music *= 1 - ramp(SHOUT - 0.1, SHOUT + 0.15) * (1 - ramp(WEEKS0 - 0.5, WEEKS0 + 0.5))
for s in [0, 3, 8]:
    place(music, pad(note_hz(D - 12 + s), WEEKS0 - SHOUT, 0.05), SHOUT + 0.2)
music *= 1 - ramp(IMPACT - 0.1, IMPACT + 0.05) * (1 - ramp(BOOK_SHOT - 1, BOOK_SHOT + 0.5))
music = lp(music, 0.55)

# dips under spoken lines (room for the voice later)
duck = np.ones(N)
for c in tl["clips"]:
    duck = np.minimum(duck, 1 - 0.45 * (np.clip((t - (c["start"] - 0.25)) / 0.25, 0, 1) * np.clip(((c["end"] + 0.35) - t) / 0.35, 0, 1)))
music *= duck
music *= 1 - ramp(OUTRO + 2.2, TOTAL)

# ---------- ambience ----------
amb = np.zeros(N)
white = rng.standard_normal(N)
# night room tone + crickets outside
night = (1 - ramp(WEEKS0, WEEKS0 + 1)) + ramp(T["s6a"], T["s6a"] + 3)
crick = np.zeros(N)
for k, f in enumerate([4300, 4700, 5100]):
    gate = (np.sin(2 * np.pi * (1.3 + k * 0.4) * t + k) > 0.6).astype(float) * (np.sin(2 * np.pi * 28 * t) > 0)
    crick += np.sin(2 * np.pi * f * t) * lp(gate, 0.02) * 0.012
amb += crick * night
amb += lp(white, 0.02) * 0.04 * (night + 0.6 * ramp(GRIEF, GRIEF + 1) * (1 - ramp(T["s6a"], T["s6a"] + 3)))
# study clock ticking in the night scenes
for sec in np.arange(1.0, WEEKS0, 1.0):
    n = int(0.02 * SR)
    tick = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 400) * (0.05 if int(sec) % 2 else 0.035)
    place(amb, hp(tick, 0.3), sec)
# two weeks: day birds alternate with the night tone
dayK = np.where((t > WEEKS0) & (t < AFTERNOON), 0.5 - 0.5 * np.cos((t - WEEKS0) / ((T["s4c"] - 0.6 - WEEKS0) / 1.5) * 2 * np.pi), 0)
for at in np.arange(WEEKS0, AFTERNOON, 0.7):
    n = int(0.18 * SR); tt = np.arange(n) / SR
    f = 2600 + 900 * np.sin(tt * 40) + rng.uniform(-300, 300)
    chirp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.18) * 0.03
    place(amb, chirp * float(np.interp(at, t[::4800], dayK[::4800])), at + rng.uniform(0, 0.4))
# afternoon street: warm air, distant birds, then the sudden silence
aft = ramp(AFTERNOON, AFTERNOON + 0.6) * (1 - ramp(IMPACT, IMPACT + 0.08))
amb += lp(white, 0.05) * 0.05 * aft
# muffled two-tone siren far away during the ambulance beat
sirK = ramp(T["s4e"] - 0.4, T["s4e"] + 1) * (1 - ramp(E["s4f"], E["s4f"] + 2.5))
sir = np.sin(2 * np.pi * np.where(np.sin(2 * np.pi * 0.7 * t) > 0, 740, 590) * t)
amb += lp(sir, 0.08) * 0.03 * sirK
# end: soft night wind
amb += lp(white, 0.01) * 0.06 * ramp(T["s6a"], T["s6a"] + 4) * (1 - ramp(OUTRO, TOTAL))
amb *= 0.6 + 0.4 * duck

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

cue("whoosh-cinematic", T["s1b"] + 0.3, -16, dark=0.3)  # the paper facade swings open
cue("sparkle", AT_DESK + 0.5, -18)  # the fairy rises from the pages
cue("chime", AT_DESK + 0.9, -24)
cue("click-soft", SHOUT, -14)  # a pen slapped down on the desk
cue("whoosh-short", WEEKS0, -22, dark=0.3)
cue("whoosh-short", AFTERNOON, -22, dark=0.3)
cue("impact-bass-1", IMPACT - 0.05, -12, dark=0.12)  # heard, never seen
cue("ping", T["s4g"] + 1.2, -30, dark=0.2)  # the fairy light goes out
cue("whoosh-cinematic", GRIEF, -24, dark=0.2)
for fl in [T["s5g"] + 0.1, T["s5g"] + 2.7, T["s5h"] + 1.6]:  # page turns (paper noise)
    n = int(0.45 * SR); tt = np.arange(n) / SR
    page = hp(rng.standard_normal(n), 0.5) * np.sin(np.pi * tt / 0.45) ** 2 * 0.05
    place(sfx, page, fl)
cue("sparkle", OPEN_READ + 0.4, -22)
cue("sparkle", T["s5i"] + 1.0, -18)
cue("chime", FREE + 0.5, -18)
cue("riser", T["s6b"] - 2.2, -26, dark=0.25)
cue("chime", OUTRO + 0.3, -16)

# ---------- level and write ----------
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x[np.abs(x) > 1e-5] ** 2)) + 1e-12)
music *= db(-27 - rms_db(music))
mix = music + amb + sfx
peak = np.max(np.abs(mix))
if peak > db(-3): mix *= db(-3) / peak
fade = np.minimum(1, t / 0.4) * np.minimum(1, (TOTAL - t) / 0.6)
mix *= fade
st = np.stack([mix, mix], axis=1)
# slight stereo width: music box a touch left, pad a touch right via tiny delays
d = int(0.006 * SR)
st[d:, 1] = 0.85 * st[d:, 1] + 0.15 * mix[:-d]
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open("public/audio/ep06/mix.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"mix.wav {TOTAL:.1f}s  music rms {rms_db(music):.1f} dB  peak {20*np.log10(np.max(np.abs(mix))):.1f} dB")
