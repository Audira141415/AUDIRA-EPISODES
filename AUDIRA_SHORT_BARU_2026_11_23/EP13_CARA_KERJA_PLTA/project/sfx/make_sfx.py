# EP13 PLTA procedural SFX, cues from docs/STORYBOARD.md Audio column. 48 kHz stereo, 88.9 s.
import numpy as np, wave, sys
SR = 48000; DUR = 88.9
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
for c in (5.2, 7.1, 14.2, 26.0, 36.9, 46.1, 56.8, 66.1, 75.1, 80.7): add(whoosh(), c - 0.3, 0.8)
add(drip(), 0.6); add(drip(), 1.4); add(drip(), 83.0, 0.7)
add(zap(), 3.6, 0.7); add(zap(), 53.6, 0.8)
for p in (3.6, 4.0, 10.6, 11.9, 13.0, 21.5, 23.4, 25.0, 35.2, 40.7, 63.5, 64.1, 64.9, 72.9, 75.9, 79.7, 84.5):
    add(pop(760 + (int(p * 10) % 5) * 90), p, 0.55)
add(riser(1.3), 15.2, 0.5); add(impact(0.5), 34.1, 0.7)
add(water(9.0), 26.4, 1.0); add(water(5.0), 75.4, 0.8)
add(hum(8.0, 80, 170), 38.0, 1.0); add(hum(9.5, 170, 200), 46.6, 0.9)
for k in range(12): add(tick(), 43.9 + k * 0.12, 0.6)
add(impact(0.7), 54.9, 0.8); add(riser(1.5), 59.7, 0.5)
for k in range(8): add(tick(), 67.9 + k * 0.1, 0.8)
add(riser(1.35), 68.6, 0.9); add(impact(), PAYOFF := 69.95, 1.0)
add(chime(), 81.4, 0.8); add(sting(), 85.9, 0.9)
out /= max(1e-9, np.abs(out).max()) / 0.8
st = (np.stack([out, out], 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
