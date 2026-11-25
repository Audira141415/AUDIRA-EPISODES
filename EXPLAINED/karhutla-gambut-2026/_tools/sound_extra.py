"""Natural-sound synthesis shared by the series. Each episode's mix.py decides what to use and when."""
from itertools import accumulate

import numpy as np

SR = 44100


def lowpass(x, fc):
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    return np.fromiter(accumulate(x, lambda y, v: y + a * (v - y)), dtype=float, count=len(x))


def norm(x):
    return x / max(1e-9, np.abs(x).max())


def thunder(rng, dur=4.5, crack=1.0):
    """Sharp crack then a rolling low rumble: the nearest channel segment is heard first, far segments later."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    low = norm(lowpass(x, 95))
    mid = norm(lowpass(x, 420) - lowpass(x, 120))
    rolls = sum(rng.uniform(.4, 1) * np.exp(-((t - rng.uniform(.3, dur * .8)) / rng.uniform(.14, .5)) ** 2) for _ in range(9))
    env = rolls / rolls.max() * np.exp(-t / dur * 2.2)
    head = np.exp(-t * 26) * rng.standard_normal(n) * crack
    return low * env + mid * env * .35 + head * .7


def crackle(rng, dur, rate=60):
    """Electric discharge: dense random ticks."""
    n = int(dur * SR)
    x = np.zeros(n)
    for _ in range(int(dur * rate)):
        i = rng.integers(0, max(1, n - 200))
        L = rng.integers(30, 180)
        x[i:i + L] += rng.standard_normal(L)[: n - i] * np.exp(-np.arange(L) / (L / 4))[: n - i] * rng.uniform(.2, 1)
    return norm(x)


def rumble(rng, dur, fc=70, surge=.3):
    """Earth or machinery rumble with slow irregular swell."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = norm(lowpass(rng.standard_normal(n), fc))
    sw = 1 + surge * np.sin(t * 1.3 + rng.uniform(0, 6)) * np.sin(t * .37 + rng.uniform(0, 6))
    return x * sw


def swell(rng, dur, lo=120, hi=900):
    """Massive-water movement: band noise rising and falling."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = norm(lowpass(rng.standard_normal(n), hi) - lowpass(rng.standard_normal(n), lo))
    return x * np.sin(np.pi * t / dur) ** 1.4


def metal(rng, dur, base=210, dec=3.2):
    """Struck steel: inharmonic partials with a fast initial decay."""
    t = np.arange(int(dur * SR)) / SR
    x = sum(a * np.sin(2 * np.pi * base * r * t + rng.uniform(0, 6)) * np.exp(-t * dec * (1 + r * .35))
            for r, a in ((1, 1), (2.41, .6), (3.78, .45), (5.33, .3), (7.11, .18)))
    return norm(x)


def drone(T, f0, partials=((1, 1), (1.003, .8), (2.01, .35))):
    return sum(a * np.sin(2 * np.pi * f0 * r * T + i) for i, (r, a) in enumerate(partials))


def pulses(N, start, stop, gap0, gap_min=.42, accel=.035, f=46):
    """Heartbeat-like low pulse that quickens from start to stop."""
    y = np.zeros(N)
    tp = start
    while tp < stop:
        i = int(tp * SR)
        L = min(int(.22 * SR), N - i)
        if L <= 0:
            break
        x = np.arange(L) / SR
        y[i:i + L] += np.sin(2 * np.pi * (f * x + 24 * (1 - np.exp(-x * 34)) / 34)) * np.exp(-x * 13)
        tp += max(gap_min, gap0 - (tp - start) * accel)
    return y
