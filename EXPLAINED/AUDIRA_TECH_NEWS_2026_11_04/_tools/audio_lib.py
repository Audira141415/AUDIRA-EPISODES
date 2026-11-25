"""Shared signal helpers for the two episode mixes. The sound identity lives in each episode's mix.py."""
import json
import subprocess
import wave

import numpy as np

SR = 44100
SFX_DIR = "AUDIO/sfx"


class Mix:
    def __init__(self, seed):
        self.TL = json.load(open("timeline.json", encoding="utf8"))
        self.DUR = self.TL["duration"]
        self.N = int(self.DUR * SR)
        self.T = np.arange(self.N) / SR
        self.rng = np.random.default_rng(seed)
        self.fx = np.zeros((self.N, 2))
        self._lib = {}

    def word(self, sc, w, nth=0):
        hits = [x for x in self.TL["words"] if x["scene"] == sc and x["text"].rstrip(".,:;?!") == w]
        return hits[nth]["start"]

    def scene(self, sid):
        return next(s for s in self.TL["scenes"] if s["id"] == sid)

    def env(self, pts):
        xs, ys = zip(*pts)
        return np.interp(self.T, xs, ys)

    def read(self, path):
        p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
        return np.frombuffer(p.stdout, dtype=np.float32).reshape(-1, 2).astype(np.float64)

    def lib(self, name):
        if name not in self._lib:
            self._lib[name] = self.read(f"{SFX_DIR}/{name}.mp3")
        return self._lib[name]

    def put(self, sig, t, g=1.0):
        i = int(t * SR)
        if i >= self.N or i < 0:
            return
        s = sig if sig.ndim == 2 else np.stack([sig, sig], 1)
        e = min(self.N, i + len(s))
        self.fx[i:e] += g * s[: e - i]

    def tone(self, freqs, dur, dec=0):
        t = np.arange(int(dur * SR)) / SR
        x = sum(np.sin(2 * np.pi * f * t) for f in freqs) / len(freqs)
        fade = np.minimum(1, np.minimum(t / .004, (dur - t) / .006))
        return x * fade * (np.exp(-t * dec) if dec else 1)

    def burst(self, dur, dec, smooth=3):
        x = self.rng.standard_normal(int(dur * SR))
        x = np.convolve(x, np.ones(smooth) / smooth, mode="same")
        return x * np.exp(-np.arange(len(x)) / SR * dec)

    def thump(self, dur=.32):
        t = np.arange(int(dur * SR)) / SR
        return np.sin(2 * np.pi * (62 * t + 44 * (1 - np.exp(-t * 40)) / 40)) * np.exp(-t * 14) + .35 * self.burst(dur, 60, 2)

    def band(self, x, lo, hi):
        """FFT band-pass, fine for stationary ambience beds."""
        X = np.fft.rfft(x)
        f = np.fft.rfftfreq(len(x), 1 / SR)
        X[(f < lo) | (f > hi)] = 0
        return np.fft.irfft(X, len(x))

    def finish(self, music):
        """Duck the music under the voice, sum, normalise peak, write the mix and stems."""
        vo = self.read("AUDIO/voiceover.wav")
        n = min(self.N, len(vo))
        voice = np.zeros((self.N, 2))
        voice[:n] = vo[:n]
        w = int(.01 * SR)
        rms = np.sqrt(np.convolve(voice[:, 0] ** 2, np.ones(w) / w, mode="same"))
        gate = (rms > .012).astype(float)
        d = np.empty(self.N)
        s = 0.0
        aa, ar = np.exp(-1 / (.045 * SR)), np.exp(-1 / (.42 * SR))
        for i, v in enumerate(gate):
            c = aa if v > s else ar
            s = c * s + (1 - c) * v
            d[i] = s
        music = music * (1 - .55 * d)[:, None]
        mix = voice + music + self.fx
        pk = np.abs(mix).max()
        print("peak before limit", round(float(pk), 3))
        mix = mix / max(1.0, pk / .95)
        self.save("PROJECT/hyperframes/assets/audio/mix.wav", mix)
        self.save("AUDIO/work/stem-music.wav", music)
        self.save("AUDIO/work/stem-sfx.wav", self.fx)

    @staticmethod
    def save(path, a):
        pcm = (np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes()
        with wave.open(path, "wb") as o:
            o.setnchannels(2)
            o.setsampwidth(2)
            o.setframerate(SR)
            o.writeframes(pcm)


def stereo(m, side, off=.017):
    k = int(off * SR)
    return np.stack([m + side, m - side + np.roll(side, k)], 1)
