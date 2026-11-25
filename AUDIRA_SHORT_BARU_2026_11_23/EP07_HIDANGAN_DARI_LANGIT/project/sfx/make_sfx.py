# EP07 procedural SFX (whoosh / pop / chime / riser / impact / boom), 48 kHz stereo, 85 s.
import numpy as np, wave, sys
SR = 48000; DUR = 85.0
out = np.zeros(int(SR * DUR))
rng = np.random.default_rng(7)
def add(sig, at, gain=1.0):
    i = int(at * SR); n = min(len(sig), len(out) - i)
    if n > 0: out[i:i + n] += sig[:n] * gain
def env(n, a, r):
    e = np.ones(n); A = int(a * SR); R = int(r * SR)
    if A: e[:A] = np.linspace(0, 1, A)
    if R: e[-R:] *= np.linspace(1, 0, R) ** 2
    return e
def lp(x, k):
    return np.convolve(x, np.ones(k) / k, mode='same')
def whoosh(d=0.55):
    n = int(d * SR); x = rng.standard_normal(n)
    t = np.linspace(0, 1, n); y = np.zeros(n)
    for k, seg in ((24, slice(0, n // 2)), (8, slice(n // 2, n))):
        y[seg] = lp(x, k)[seg]
    return y * np.sin(np.pi * t) ** 1.5 * 0.9
def pop(f=880):
    n = int(0.09 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (f + 600 * np.exp(-t * 60)) * t) * np.exp(-t * 45) * 0.7
def chime(f=1046.5):
    n = int(1.6 * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * m * t) * a for m, a in ((1, 1), (2.01, .4), (3.02, .2))) * np.exp(-t * 3) * 0.35
def riser(d):
    n = int(d * SR); t = np.arange(n) / SR; f = 200 + 900 * (t / d) ** 2
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + lp(rng.standard_normal(n), 6) * 0.25 * (t / d)
    return s * (t / d) ** 1.5
def impact():
    n = int(1.4 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * (55 + 90 * np.exp(-t * 18)) * t) * np.exp(-t * 4) + lp(rng.standard_normal(n), 3) * np.exp(-t * 25) * 0.5) * 0.9
def boom():
    n = int(2.0 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 42 * t) * np.exp(-t * 2.2) * 0.8
for c in (13.6, 20.8, 23.7, 39.4, 48.4, 60.7, 70.0, 74.5): add(whoosh(), c - 0.3, 0.8)
add(whoosh(1.0), 0.05, 0.6)
for p in (5.2, 13.8, 16.7, 21.2, 26.0, 29.7, 35.3, 39.8, 41.55, 42.6, 44.13, 46.53, 53.7, 57.0, 59.0, 70.3, 73.5, 74.6, 77.1, 79.1, 9.3):
    add(pop(760 + (int(p * 10) % 5) * 90), p, 0.55)
for c in (0.45, 31.4, 49.7, 77.2): add(chime(), c, 0.8)
add(riser(3.6), 58.45, 0.9); add(impact(), 62.0, 1.0); add(boom(), 63.5, 0.9); add(boom(), 65.6, 0.5)
out /= max(1e-9, np.abs(out).max()) / 0.8
st = (np.stack([out, out], 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
