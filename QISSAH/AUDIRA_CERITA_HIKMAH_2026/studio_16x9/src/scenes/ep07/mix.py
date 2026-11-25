# EP07 DUKA DI PERJALANAN music + ambience + SFX (no voice): a late-night noir jazz trio in D minor
# (brushed snare, upright bass, a soft electric piano and a muted horn line), city rain, the car,
# a traffic whistle, paper. Run from studio_16x9/:  python src/scenes/ep07/mix.py
#   -> public/audio/ep07/mix.wav (48 kHz stereo, length = film). Cue times come from timeline.json.
import json, subprocess, wave
import numpy as np
from scipy.signal import lfilter

SR = 48000
tl = json.load(open("src/scenes/ep07/timeline.json", encoding="utf8"))
TOTAL = tl["total"]
CL = tl["clips"]
T = {c["id"]: c["start"] for c in CL}
E = {c["id"]: c["end"] for c in CL}
N = int(TOTAL * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
OUTRO = TOTAL - 3.0

def ramp(a, b):
    k = np.clip((t - a) / max(1e-4, b - a), 0, 1)
    return k * k * (3 - 2 * k)
def win(a, b, fi=0.6, fo=0.8):
    return ramp(a - fi, a) * (1 - ramp(b, b + fo))
def lp(x, a): return lfilter([a], [1, a - 1], x)
def hp(x, a): return x - lp(x, a)
def db(x): return 10 ** (x / 20)
def place(buf, x, at):
    i = int(at * SR)
    if i >= len(buf) or i + len(x) <= 0: return
    j = min(len(buf), i + len(x)); buf[max(0, i):j] += x[max(0, -i):j - i]
def hz(n): return 440 * 2 ** (n / 12)  # n = semitones from A4

# voice ducking envelope: music dips ~8 dB under every line
voice = np.zeros(N)
for c in CL:
    voice = np.maximum(voice, win(c["start"] - 0.15, c["end"] + 0.1, 0.25, 0.5))
duck = 1 - 0.6 * voice

# ---------- music ----------
BPM = 63; beat = 60 / BPM; bar = 4 * beat
D3 = -19  # semitones from A4
# progression (two bars each): Dm9, Bbmaj7, Gm9, A7b9 ; the ending resolves to Dmaj9
prog = [[0, 3, 7, 10, 16], [-4, 0, 3, 7, 14], [-7, -2, 2, 5, 12], [-5, -1, 2, 5, 8]]
END_CHORD = [0, 4, 7, 11, 16]

music = np.zeros(N)
def epiano(f0, dur, amp):
    n = int(dur * SR); tt = np.arange(n) / SR
    mod = np.sin(2 * np.pi * f0 * 1.0 * tt) * 1.2 * np.exp(-tt * 3)
    x = np.sin(2 * np.pi * f0 * tt + mod) * np.exp(-tt * 1.1) * (1 - np.exp(-tt * 200))
    x *= 1 + 0.18 * np.sin(2 * np.pi * 4.5 * tt)  # tremolo
    return x * amp
def pluck(f0, dur, amp):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f0 * tt) + 0.35 * np.sin(4 * np.pi * f0 * tt) + 0.12 * np.sin(6 * np.pi * f0 * tt))
    return lp(x * np.exp(-tt * 3.2) * (1 - np.exp(-tt * 400)), 0.3) * amp
def horn(f0, dur, amp):
    n = int(dur * SR); tt = np.arange(n) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * tt) * np.clip(tt / 0.4, 0, 1)
    ph = 2 * np.pi * np.cumsum(f0 * vib) / SR
    saw = sum(np.sin(k * ph) / k for k in range(1, 9))
    env = np.clip(tt / 0.12, 0, 1) * np.clip((dur - tt) / 0.25, 0, 1)
    return lp(saw * env, 0.06) * amp

# section intensities (0..1) for each layer
keys_k = np.clip(win(0.0, T["s2a"], 1.5, 1.0) * 0.9 + win(T["s2a"], T["s3a"]) + win(T["s3b"], T["s5a"]) * 0.7
                 + win(T["s5a"], T["s7a"]) * 0.8 + win(T["s7a"], OUTRO + 1.5, 0.8, 2.5), 0, 1)
bass_k = np.clip(win(T["s2a"], T["s2h"]) + win(T["s3b"], T["s5a"]) * 0.8 + win(T["s7c"], OUTRO, 1, 2) * 0.7, 0, 1)
brush_k = np.clip(win(T["s2c"], T["s2h"], 1, 0.3) + win(T["s4a"], T["s5a"]) * 0.5, 0, 1)
horn_k = np.clip(win(T["s5e"], T["s7a"]) + win(T["s8a"], OUTRO), 0, 1)

nb = int(TOTAL / beat) + 1
for b in range(nb):
    at = b * beat
    ci = (b // 8) % len(prog)
    final = at >= T["s8c"]
    chord = END_CHORD if final else prog[ci]
    if b % 4 == 0:  # chord on the bar, soft spread
        k = float(np.interp(at, t[::480], keys_k[::480]))
        if k > 0.02:
            for i, n in enumerate(chord):
                place(music, epiano(hz(D3 + 12 + n), bar * 1.1, 0.05 * k), at + i * 0.025)
    if b % 4 == 2 and rng.random() < 0.5:  # an answering upper note
        k = float(np.interp(at, t[::480], keys_k[::480]))
        if k > 0.02:
            place(music, epiano(hz(D3 + 24 + chord[rng.integers(2, 5)]), beat * 2, 0.03 * k), at + 0.1)
    kb = float(np.interp(at, t[::480], bass_k[::480]))
    if kb > 0.02:  # walking bass: root, fifth, chord tones, approach note
        walk = [chord[0], chord[2] if len(chord) > 2 else 7, chord[1], chord[0] + (11 if b % 2 else 13)]
        place(music, pluck(hz(D3 - 12 + walk[b % 4]), beat * 1.2, 0.22 * kb), at)
    kr = float(np.interp(at, t[::480], brush_k[::480]))
    if kr > 0.02:  # brushes: swish on every beat, slap on 2 and 4
        n = int(beat * SR); tt = np.arange(n) / SR
        sw = hp(rng.standard_normal(n), 0.4) * np.sin(np.pi * np.clip(tt / beat, 0, 1)) * 0.012 * kr
        place(music, sw, at)
        if b % 2 == 1:
            m = int(0.18 * SR); tm = np.arange(m) / SR
            place(music, hp(rng.standard_normal(m), 0.3) * np.exp(-tm * 28) * 0.05 * kr, at)

# the muted horn: a slow lament during the note and again under the hikmah
lament = [(5, 2), (3, 1), (2, 1), (0, 3), (None, 1), (-2, 1.5), (0, 0.5), (2, 2), (-3, 3), (None, 2)]
for start in [T["s6a"] - 0.5, T["s6f"] - 0.3, T["s8a"] + 0.2]:
    at = start
    for n, d in lament:
        if n is not None:
            k = float(np.interp(at, t[::480], horn_k[::480]))
            place(music, horn(hz(D3 + 12 + n), d * beat * 0.98, 0.07 * k), at)
        at += d * beat
# tension under the amber light: a held tritone + clock tick (heartbeat) until the red
ten = win(T["s2f"], E["s2j"], 0.3, 1.0)
music += (np.sin(2 * np.pi * hz(D3 + 12) * t) + np.sin(2 * np.pi * hz(D3 + 18) * t)) * 0.02 * ten
for at in np.arange(T["s2f"], E["s2j"], 0.42):
    m = int(0.09 * SR); tm = np.arange(m) / SR
    place(music, np.sin(2 * np.pi * 55 * tm) * np.exp(-tm * 30) * 0.25, at)
# a final Dmaj9 swell into the outro
music += sum(np.sin(2 * np.pi * hz(D3 + 12 + n) * t) for n in END_CHORD) * 0.012 * win(T["s8e"], TOTAL - 0.5, 1.5, 1.0)
music = lp(music, 0.35) * duck

# ---------- ambience ----------
white = rng.standard_normal(N)
inside = np.zeros(N)  # inside the car = rain muffled on the roof
for a, b in [(T["s2f"], E["s2g"]), (T["s5a"], T["s5c"]), (T["s5e"], T["s7a"])]:
    if b > a: inside = np.maximum(inside, win(a, b, 0.2, 0.2))
rain_out = hp(lp(white, 0.25), 0.02) * 0.05
rain_in = lp(white, 0.02) * 0.08
amb = rain_out * (1 - inside) + rain_in * inside
# drops / drips on glass and metal (random clicks)
for at in np.sort(rng.uniform(0, TOTAL, int(TOTAL * 9))):
    m = int(0.02 * SR); tm = np.arange(m) / SR
    place(amb, np.sin(2 * np.pi * rng.uniform(1800, 4200) * tm) * np.exp(-tm * 260) * rng.uniform(0.005, 0.02), at)
# distant thunder once in the hook and once before the note
for at in [T["s1b"] - 0.5, T["s6a"] - 3.0]:
    m = int(4 * SR); tm = np.arange(m) / SR
    place(amb, lp(rng.standard_normal(m), 0.004) * np.exp(-tm * 1.2) * (1 - np.exp(-tm * 8)) * 1.6, at)
# the car engine: rpm follows each driving shot
eng = np.zeros(N)
def engine(a, b, r0, r1, gain):
    k = win(a, b, 0.3, 0.6)
    rpm = r0 + (r1 - r0) * ramp(a, b)
    ph = 2 * np.pi * np.cumsum(rpm / 60 * 2) / SR
    x = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sign(np.sin(ph * 0.5))
    return lp(x, 0.02) * gain * k
eng += engine(T["s2a"], T["s2c"], 900, 1000, 0.03)
eng += engine(T["s2c"], T["s2d"], 1100, 1300, 0.07)
eng += engine(T["s2d"], T["s2f"], 1300, 3400, 0.12)
eng += engine(T["s2f"], E["s2g"], 3200, 3600, 0.07)
eng += engine(T["s2i"], T["s3a"], 3600, 3900, 0.14)
eng += engine(T["s3b"], E["s3c"], 2000, 800, 0.08)
eng += engine(T["s7c"], T["s8a"], 900, 1000, 0.06)
eng += engine(T["s8a"], TOTAL - 1, 650, 650, 0.03)
amb += eng
amb *= 0.65 + 0.35 * (1 - voice)

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
def noise_burst(at, dur, gain, hpa=0.5, shape=2):
    m = int(dur * SR); tm = np.arange(m) / SR
    place(sfx, hp(rng.standard_normal(m), hpa) * np.sin(np.pi * tm / dur) ** shape * gain, at)

cue("impact-bass-1", 0.15, -16, dark=0.15)  # open on the red
cue("whoosh-cinematic", T["s2a"] - 0.4, -20, dark=0.25)  # rewind into the story
cue("whoosh-short", T["s2c"] - 0.1, -24, dark=0.3)
cue("click", T["s2f"] - 0.05, -22)  # relay click: amber
cue("click", T["s2h"] - 0.05, -18)  # red
cue("impact-bass-1", T["s2h"] + 0.05, -18, dark=0.15)
cue("whoosh-cinematic", T["s2i"] + 1.6, -18, dark=0.35)  # the car tears past
# the traffic whistle: two hard blasts with a pea trill
for i, (at, dur) in enumerate([(T["s3a"] + 1.2, 0.35), (T["s3a"] + 1.75, 0.8)]):
    m = int(dur * SR); tm = np.arange(m) / SR
    f = 2950 + 160 * np.sign(np.sin(2 * np.pi * 34 * tm))
    w = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.clip(tm / 0.02, 0, 1) * np.clip((dur - tm) / 0.05, 0, 1)
    place(sfx, w * 0.09, at)
# tyres on wet road while pulling over
noise_burst(T["s3b"] + 1.5, 3.0, 0.03, 0.2, 1)
# door open / slam as Jack jumps out, and again getting back in
for at in [T["s4a"] + 0.2, T["s5a"] + 0.4]:
    noise_burst(at, 0.12, 0.05, 0.6)
    m = int(0.25 * SR); tm = np.arange(m) / SR
    place(sfx, lp(np.sin(2 * np.pi * 70 * tm) * np.exp(-tm * 18), 0.2) * 0.5, at + 0.55)
# pen scribbles on the ticket book
for at in np.arange(T["s4k"] + 0.8, E["s4k"] + 1.0, 0.33):
    noise_burst(at + rng.uniform(0, 0.1), rng.uniform(0.12, 0.25), 0.012, 0.85, 1)
# window crank, paper slipping in, paper unfolding
for at in np.arange(T["s5c"] + 0.4, T["s5c"] + 1.4, 0.22):
    noise_burst(at, 0.08, 0.02, 0.7)
noise_burst(E["s5c"], 0.5, 0.03, 0.5)
noise_burst(T["s5e"] + 0.5, 0.7, 0.045, 0.5)
noise_burst(T["s5f"] + 0.2, 0.5, 0.035, 0.5)
cue("riser", T["s6a"] - 2.6, -28, dark=0.25)
cue("whoosh-short", T["s6e"] - 0.1, -26, dark=0.3)
cue("whoosh-short", T["s6f"] - 0.1, -26, dark=0.3)
cue("whoosh-cinematic", T["s7a"] - 0.3, -24, dark=0.25)
cue("ping", T["s7b"] + 0.6, -30, dark=0.2)  # the empty post
cue("click", E["s8c"] + 0.35, -24)  # the light turns green
cue("chime", OUTRO + 0.3, -16)

# ---------- level and write ----------
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x[np.abs(x) > 1e-5] ** 2)) + 1e-12)
music *= db(-27 - rms_db(music))
amb *= db(-33 - rms_db(amb))
mix = music + amb + sfx
peak = np.max(np.abs(mix))
if peak > db(-3): mix *= db(-3) / peak
mix *= np.minimum(1, t / 0.3) * np.minimum(1, (TOTAL - t) / 0.8)
st = np.stack([mix, mix], axis=1)
d = int(0.007 * SR)
st[d:, 1] = 0.82 * st[d:, 1] + 0.18 * mix[:-d]
pcm = (np.clip(st, -1, 1) * 32767).astype(np.int16)
with wave.open("public/audio/ep07/mix.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f"mix.wav {TOTAL:.1f}s  music rms {rms_db(music):.1f} dB  amb rms {rms_db(amb):.1f} dB  peak {20*np.log10(np.max(np.abs(mix))):.1f} dB")
