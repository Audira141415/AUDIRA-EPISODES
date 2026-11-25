# EP03 Kenapa Es Mengapung procedural SFX, cues from docs/STORYBOARD.md Audio column. 48 kHz stereo, 87.2 s.
import numpy as np, wave, sys
SR = 48000; DUR = 87.2
out = np.zeros(int(SR * DUR))
rng = np.random.default_rng(13)
def add(sig, at, gain=1.0):
    i = int(at * SR); n = min(len(sig), len(out) - i)
    if n > 0: out[i:i + n] += sig[:n] * gain
def lp(x, k): return np.convolve(x, np.ones(k) / k, mode='same')
def whoosh(d=0.55):
    n = int(d * SR); x = rng.standard_normal(n); t = np.linspace(0, 1, n); y = np.zeros(n)
    for k, seg in ((24, slice(0, n // 2)), (8, slice(n // 2, n))): y[seg] = lp(x, k)[seg]
    return y * np.sin(np.pi * t) ** 1.5 * 0.9
def pop(f=880):
    n = int(0.09 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (f + 600 * np.exp(-t * 60)) * t) * np.exp(-t * 45) * 0.7
def drip():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (1400 - 900 * t / 0.12) * t) * np.exp(-t * 40) * 0.6
def tick():
    n = int(0.03 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 200) * 0.5
def zap():
    n = int(0.35 * SR); t = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * (120 + 40 * np.sin(2 * np.pi * 30 * t)) * t)) * lp(rng.standard_normal(n), 2) * np.exp(-t * 10) * 0.35
def chime(f=1046.5):
    n = int(1.6 * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * m * t) * a for m, a in ((1, 1), (2.01, .4), (3.02, .2))) * np.exp(-t * 3) * 0.35
def riser(d):
    n = int(d * SR); t = np.arange(n) / SR; f = 200 + 900 * (t / d) ** 2
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + lp(rng.standard_normal(n), 6) * 0.25 * (t / d)
    return s * (t / d) ** 1.5
def impact(g=0.9):
    n = int(1.4 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * (55 + 90 * np.exp(-t * 18)) * t) * np.exp(-t * 4) + lp(rng.standard_normal(n), 3) * np.exp(-t * 25) * 0.5) * g
def hum(d, f0=90, f1=160):
    n = int(d * SR); t = np.arange(n) / SR; f = f0 + (f1 - f0) * t / d
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(2 * np.pi * 2 * np.cumsum(f) / SR)
    e = np.minimum(1, np.minimum(t / 0.8, (d - t) / 0.8))
    return s * e * 0.12
def water(d):
    n = int(d * SR); t = np.arange(n) / SR
    e = np.minimum(1, np.minimum(t / 0.6, (d - t) / 0.6))
    return lp(rng.standard_normal(n), 14) * e * 0.18
def sting():
    return chime(784) + chime(1174.7) * 0.7
def splash():
    n = int(0.5 * SR); t = np.arange(n) / SR
    return lp(rng.standard_normal(n), 4) * np.exp(-t * 9) * 0.5
def plop():
    n = int(0.2 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (300 + 500 * np.exp(-t * 30)) * t) * np.exp(-t * 22) * 0.7
def crack():
    n = int(0.35 * SR); t = np.arange(n) / SR
    return rng.standard_normal(n) * (rng.random(n) > 0.97) * np.exp(-t * 8) * 0.9 + lp(rng.standard_normal(n), 2) * np.exp(-t * 30) * 0.3
def buzz():
    n = int(0.4 * SR); t = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * 110 * t)) * np.exp(-t * 6) * 0.25
def shimmer(d=1.4):
    n = int(d * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * t) for f in (1568, 2093, 2637)) * np.sin(np.pi * t / d) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t)) * 0.08
def bubbles(d=0.8):
    s = np.zeros(int(d * SR))
    for k in range(6):
        b = drip() * 0.6; i = int(rng.random() * (len(s) - len(b))); s[i:i + len(b)] += b
    return s
for c in (6.9, 18.8, 27.0, 35.4, 49.7, 59.4, 74.8, 79.1): add(whoosh(), c - 0.3, 0.8)
for s in (0.45, 1.6, 3.55): add(splash(), s, 0.8)
add(plop(), 14.4, 0.9)
for p in (1.1, 2.4, 5.6, 6.25, 11.0, 15.0, 17.0, 25.0, 30.1, 33.35, 34.05, 41.0, 42.75, 44.5, 52.0, 56.6, 57.2, 58.2, 63.7, 67.3, 73.7, 75.9, 82.3):
    add(pop(760 + (int(p * 10) % 5) * 90), p, 0.55)
for k in range(19): add(tick(), 19.6 + k * 0.1, 0.5)
for k in range(18): add(tick(), 22.5 + k * 0.1, 0.5)
add(riser(2.0), 32.6, 0.5); add(impact(0.8), 34.7, 0.9); add(crack(), 34.7, 0.8)
add(chime(880), 39.8, 0.6); add(shimmer(), 47.5, 1.0)
add(buzz(), 50.6, 0.8)
add(crack(), 61.7, 0.7); add(bubbles(), 68.5, 0.8); add(impact(0.45), 70.5, 0.8)
add(riser(1.5), 75.0, 0.6); add(impact(), 76.5, 1.0)
for k in range(9): add(tick(), 76.0 + k * 0.18, 0.6)
add(chime(), 80.5, 0.7); add(sting(), 84.2, 0.9)
out /= max(1e-9, np.abs(out).max()) / 0.8
st = (np.stack([out, out], 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
