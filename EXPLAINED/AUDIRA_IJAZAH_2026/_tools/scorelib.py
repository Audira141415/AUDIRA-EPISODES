"""Paper, stamp and crowd textures shared by EP02-EP04 mixes. Musical identity stays in each mix.py."""
import numpy as np
from audio_lib import SR


def paper(rng, dur=0.28, grains=9):
    n = int(dur * SR)
    out = np.zeros(n)
    for _ in range(grains):
        L = int(rng.uniform(0.012, 0.05) * SR)
        i = int(rng.uniform(0, max(1, n - L)))
        out[i:i + L] += rng.standard_normal(L) * np.hanning(L) * rng.uniform(0.3, 1)
    X = np.fft.rfft(out)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < 1400) | (f > 9500)] = 0
    y = np.fft.irfft(X, n)
    return y / max(1e-6, np.abs(y).max())


def murmur(M, dur, level):
    """Unintelligible room tone made from noise, never a recording of the hearing."""
    n = int(dur * SR)
    x = M.band(M.rng.standard_normal(n), 240, 1900)
    wob = 0.65 + 0.35 * np.sin(2 * np.pi * np.cumsum(M.rng.uniform(1.5, 5, n)) / SR)
    i = np.arange(n)
    y = x * wob * np.minimum(1, np.minimum(i / (0.08 * SR), (n - i) / (0.9 * SR)))
    return y / max(1e-6, np.abs(y).max()) * level
