# EP25 procedural SFX (whoosh / pop / chime / rumble / coins / riser / impact), 48 kHz stereo, 84 s. No music (adab QISSAH).
import numpy as np, wave, sys
SR = 48000; DUR = 84.0
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
def rumble(d=1.3):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp(rng.standard_normal(n), 40) * 3.0 + np.sin(2 * np.pi * 38 * t) * 0.5) * np.exp(-t * 2.4) * np.minimum(1, t / 0.04) * 0.9
def clink(f):
    n = int(0.25 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + np.sin(2 * np.pi * f * 2.76 * t) * 0.4) * np.exp(-t * 22) * 0.35
# scene cuts
for c in (7.2, 11.8, 17.3, 22.0, 36.3, 37.6, 52.1, 54.2, 69.4, 74.5): add(whoosh(), c - 0.3, 0.8)
add(whoosh(1.0), 0.05, 0.6)
# lontar / text pops
for p in (0.35, 4.2, 7.4, 8.4, 9.85, 10.7, 12.0, 14.4, 16.3, 17.5, 19.2, 20.4, 22.4, 26.3, 31.8, 36.43, 38.2, 42.0, 44.0,
          48.3, 50.6, 52.24, 54.6, 59.95, 61.94, 62.35, 62.99, 63.59, 66.66, 70.25, 72.9, 74.8, 75.0, 75.6, 76.2, 77.3):
    add(pop(760 + (int(p * 10) % 5) * 90), p, 0.55)
# boulder: rolls shut (4.12), falls on the mouth (16.24), shifts after amal 1 and 2
add(rumble(1.6), 3.2, 0.5); add(impact(), 4.12, 0.9); add(rumble(1.4), 4.12, 0.8)
add(rumble(1.2), 15.2, 0.4); add(impact(), 16.24, 0.8)
for c in (36.28, 52.09): add(rumble(1.1), c, 0.7)
# 120 dinar: coins
for i in range(14): add(clink(2400 + (i % 4) * 310), 44.12 + i * 0.05 + 0.3, 0.6)
# seal ring "takutlah kepada Allah", lesson close
for c in (47.4, 79.2): add(chime(), c, 0.7)
# payoff: riser into the final roll + impact
add(riser(1.7), 67.9, 0.9); add(impact(), 70.2, 1.0); add(rumble(1.8), 70.2, 0.8); add(boom(), 70.3, 0.6)
out /= max(1e-9, np.abs(out).max()) / 0.8
st = (np.stack([out, out], 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
