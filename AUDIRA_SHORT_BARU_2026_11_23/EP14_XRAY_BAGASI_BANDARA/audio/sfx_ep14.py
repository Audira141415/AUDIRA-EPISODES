# Procedural SFX for EP14 X-ray bagasi: whoosh on scene cuts, pop on cards/labels (times read from Xray.tsx),
# scan ticks in S2, riser + impact when the CT bag forms (71.8). Output 48 kHz stereo WAV (normalise later to -20 LUFS).
import numpy as np, wave, sys, re
SR = 48000
DUR = 93.35
out = np.zeros(int(SR * DUR))
rng = np.random.default_rng(14)

def add(sig, t, gain=1.0):
    i = int(t * SR); j = min(len(out), i + len(sig))
    if i < 0 or i >= len(out): return
    out[i:j] += sig[: j - i] * gain

def env(n, a, d):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    e[na:] = np.exp(-np.linspace(0, d, n - na)); return e

def whoosh(dur=0.55):
    n = int(dur * SR); x = rng.standard_normal(n)
    k = np.linspace(40, 6, n).astype(int); y = np.empty(n); c = np.cumsum(np.concatenate([[0], x]))
    for i in range(n):
        a = max(0, i - k[i]); y[i] = (c[i + 1] - c[a]) / (i + 1 - a)
    return y * np.sin(np.linspace(0, np.pi, n)) ** 2 * 1.6

def pop(f=880, dur=0.12):
    n = int(dur * SR); tt = np.arange(n) / SR
    fr = f * (1 + 0.8 * np.exp(-tt * 40))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.003, 9) * 0.5

def riser(dur=2.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = 180 * (2 ** (tt / dur * 2.5))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + rng.standard_normal(n) * 0.08 * (tt / dur)
    return s * (tt / dur) ** 2

def impact(dur=1.2):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = 70 * np.exp(-tt * 3) + 38
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 6)
    return body * 0.9 + rng.standard_normal(n) * env(n, 0.001, 30) * 0.4

def blip(dur=0.08):
    n = int(dur * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * 1600 * tt) * env(n, 0.001, 20) * 0.25

src = open(sys.argv[2], encoding='utf8').read()
pops = sorted(set(round(float(x), 2) for x in re.findall(r'pop(?:IO)?\(t,\s*([\d.]+)', src)))
pops = [p for i, p in enumerate(pops) if i == 0 or p - pops[i - 1] > 0.12]  # merge near-duplicates
add(whoosh(), 0.0, 0.5)
for t in [8.2, 19.7, 34.6, 52.5, 66.9, 83.5]: add(whoosh(), t - 0.25, 0.7)
for i, t in enumerate(pops): add(pop(700 + (i % 5) * 120), t, 0.75)
for k in range(14): add(blip(), 15.0 + k * 0.18, 0.6)   # scan line ticks (S2)
add(riser(2.0), 69.8, 0.8)
add(impact(), 71.8, 1.0)
out = np.tanh(out * 0.9)
st = np.stack([out, out], 1)
pcm = (st / max(1e-9, np.abs(st).max()) * 0.8 * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', sys.argv[1], len(pops), 'pops')
