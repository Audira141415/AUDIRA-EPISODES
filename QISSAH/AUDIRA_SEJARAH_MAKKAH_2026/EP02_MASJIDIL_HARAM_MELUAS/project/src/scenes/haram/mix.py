"""EP02 MASJIDIL HARAM MELUAS: music + ambience + SFX bed (no voice), then duck under the voice.

Run from project/:  python src/scenes/haram/mix.py
Writes public/audio/bed.wav + full.wav (long) and short0N_bed.wav + short0N_full.wav.

Sound identity for this episode ("the courtyard that keeps growing"): a warm D drone, a qanun-like
plucked ostinato in D Bayati-ish steps (no microtones) whose density grows chapter by chapter the
way the mosque grows, a breathy ney-like tone at each chapter title, and a very light frame-drum
pulse only in the hook and payoff. No singing. Chapter 7 and the 2015 crane sentence stay sparse.
"""
import json
import subprocess
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
import os
SFX = next(d for d in ("../../../shared/assets/sfx", "../../../../shared/assets/sfx") if os.path.isdir(d))  # seri selesai ada di <WS>/<KODE_CHANNEL>/<SERI>
TL = json.load(open("src/scenes/haram/timeline.json", encoding="utf8"))
D = 146.83  # D3
SCALE = [0, 3, 5, 7, 10, 12, 15, 17, 19]  # D F G A C D F G A (semitones)
ROOTS = {  # pad root (semitones from D) per chapter: slow harmonic travel, home at the end
    "c00_hook": 0, "c01_intro": 0, "c02_halaman": 0, "c03_khalifah": 5, "c04_kubah": -2,
    "c05_beton": 3, "c06_fahd": 5, "c07_terbesar": 7, "c08_tersisa": -2, "c09_payoff": 0, "c10_cta": 0, "end": 0,
}
DENSITY = {  # plucks per second
    "c00_hook": 1.1, "c01_intro": 0.6, "c02_halaman": 0.35, "c03_khalifah": 0.5, "c04_kubah": 0.6,
    "c05_beton": 0.75, "c06_fahd": 0.85, "c07_terbesar": 0.95, "c08_tersisa": 0.25, "c09_payoff": 1.2, "c10_cta": 0.5, "end": 0.4,
}


def read(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def save(path, a):
    with wave.open(path, "wb") as o:
        o.setnchannels(2)
        o.setsampwidth(2)
        o.setframerate(SR)
        o.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)


def reverb(x, sec=3.2, wet=0.32, seed=3):
    rng = np.random.default_rng(seed)
    n = int(sec * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 6.9 / sec)
    ir = lp(ir, 5200)
    ir /= np.sqrt(np.sum(ir ** 2))
    return x * (1 - wet) + wet * fftconvolve(x, ir)[: len(x)]


class Bed:
    def __init__(self, dur, sections, seed):
        """sections: list of (start, end, key) on this bed's clock."""
        self.N = int(dur * SR)
        self.dur = dur
        self.sections = sections
        self.rng = np.random.default_rng(seed)
        self.mus = np.zeros(self.N)
        self.ply = np.zeros((self.N, 2))
        self.fx = np.zeros((self.N, 2))
        self._lib = {}

    def key_at(self, t):
        for s, e, k in self.sections:
            if s <= t < e:
                return k
        return self.sections[-1][2]

    def lay(self, buf, sig, t, g=1.0):
        i = int(t * SR)
        if i < 0 or i >= self.N:
            return
        e = min(self.N, i + len(sig))
        buf[i:e] += g * sig[: e - i]

    def sfx(self, name, t, g):
        if name not in self._lib:
            self._lib[name] = read(f"{SFX}/{name}.mp3")
        self.lay(self.fx, self._lib[name], t, g)

    def drone(self):
        t = np.arange(self.N) / SR
        root = np.array([ROOTS[self.key_at(x)] for x in np.arange(0, self.dur, 0.5)])
        root = np.repeat(root, int(SR * 0.5))[: self.N]
        root = np.pad(root, (0, self.N - len(root)), mode="edge")
        # glide between chapter roots over ~3 s
        k = int(3 * SR)
        pad = np.pad(root.astype(np.float64), (k, k), mode="edge")
        cs = np.concatenate([[0.0], np.cumsum(pad)])
        root = ((cs[k:] - cs[:-k]) / k)[k // 2 : k // 2 + len(root)]
        f0 = D / 2 * 2 ** (root / 12)
        ph = 2 * np.pi * np.cumsum(f0) / SR
        x = 0.5 * np.sin(ph) + 0.3 * np.sin(ph * 1.5 + 0.3) + 0.22 * np.sin(ph * 2.002) + 0.12 * np.sin(ph * 3.0)
        swell = 0.75 + 0.25 * np.sin(2 * np.pi * t / 14.0)
        self.mus += lp(x * swell, 900) * 0.16
        # soft air / courtyard ambience
        n = self.rng.standard_normal(self.N)
        self.mus += bp(n, 180, 900) * 0.018 * (0.7 + 0.3 * np.sin(2 * np.pi * t / 23.0))

    def pluck(self, f, dur=2.2):
        t = np.arange(int(dur * SR)) / SR
        x = sum(np.sin(2 * np.pi * f * h * t + h) * np.exp(-t * (2.2 + 1.6 * h)) / h for h in range(1, 7))
        att = np.minimum(1, t / 0.003)
        return x * att

    def plucks(self, quiet=()):
        t = 0.6
        last = 2
        while t < self.dur - 1:
            key = self.key_at(t)
            dens = DENSITY[key]
            if any(a <= t < b for a, b in quiet):
                dens *= 0.15
            step = self.rng.integers(-2, 3)
            last = int(np.clip(last + step, 0, len(SCALE) - 1))
            f = D * 2 ** ((SCALE[last] + ROOTS[key]) / 12)
            g = 0.06 * (0.6 + 0.4 * self.rng.random())
            pan = self.rng.uniform(-0.5, 0.5)
            s = self.pluck(f) * g
            self.lay(self.ply[:, 0], s * (1 - pan) * 0.8, t)
            self.lay(self.ply[:, 1], s * (1 + pan) * 0.8, t + 0.011)
            # second-voice octave answer, now and then
            if self.rng.random() < 0.25:
                self.lay(self.ply[:, 0], self.pluck(f * 2) * g * 0.4, t + 0.21)
                self.lay(self.ply[:, 1], self.pluck(f * 2) * g * 0.45, t + 0.22)
            t += (1 / max(dens, 0.05)) * self.rng.choice([0.5, 1, 1, 1.5])

    def ney(self, t0, f, dur=4.5, g=0.05):
        t = np.arange(int(dur * SR)) / SR
        vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 1.2)
        ph = 2 * np.pi * np.cumsum(f * vib) / SR
        env = np.minimum(1, t / 0.7) * np.minimum(1, (dur - t) / 1.4)
        breath = bp(self.rng.standard_normal(len(t)), f * 0.9, f * 3.2) * 0.35
        x = (np.sin(ph) + 0.25 * np.sin(2 * ph) + breath) * env
        self.lay(self.mus, x * g, t0)

    def drum(self, a, b, bpm=70, g=0.06):
        beat = 60 / bpm
        t = a
        i = 0
        while t < b:
            n = int(0.35 * SR)
            tt = np.arange(n) / SR
            low = np.sin(2 * np.pi * (70 * tt + 30 * (1 - np.exp(-tt * 30)) / 30)) * np.exp(-tt * 11)
            skin = bp(self.rng.standard_normal(n), 900, 3000) * np.exp(-tt * 40) * 0.25
            acc = 1.0 if i % 4 == 0 else 0.55
            self.lay(self.mus, (low + skin) * g * acc, t)
            t += beat
            i += 1

    def render(self, voEnd):
        mus = reverb(self.mus, 3.5, 0.3)
        ply = np.stack([reverb(self.ply[:, 0], 2.8, 0.38, 5), reverb(self.ply[:, 1], 2.8, 0.38, 7)], 1)
        m = np.stack([mus, mus], 1) + ply
        # end: resolve and fade out
        t = np.arange(self.N) / SR
        out = np.clip((self.dur - t) / 3.0, 0, 1)
        m *= out[:, None]
        bed = m + self.fx
        pk = np.abs(bed).max()
        return bed / max(1.0, pk / 0.9)


def ch(cid):
    return next(c for c in TL["chapters"] if c["id"] == cid)


def word(cid, text, nth=0):
    hits = [w for c in TL["clips"] if c["chapter"] == cid for w in c["words"] if w["w"].strip(".,;:?!").lower() == text.lower()]
    return hits[nth]["s"]


def duck_combine(bed, vo, out):
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", bed, "-i", vo, "-filter_complex",
         "[1:a]aformat=channel_layouts=stereo,apad,asplit=2[v1][v2];[0:a]volume=-5dB[b];[b][v1]sidechaincompress=threshold=0.02:ratio=4:attack=20:release=450[bd];[bd][v2]amix=inputs=2:normalize=0:duration=first[m]",
         "-map", "[m]", "-ar", "48000", "-ac", "2", out], check=True)


# ---------- long-form bed ----------
total, voEnd = TL["total"], TL["voEnd"]
secs = [(0 if i == 0 else c["start"] - 0.6, (TL["chapters"][i + 1]["start"] - 0.6) if i + 1 < len(TL["chapters"]) else voEnd, c["id"]) for i, c in enumerate(TL["chapters"])]
secs.append((voEnd, total + 1, "end"))
crane = word("c07_terbesar", "crane")
bed = Bed(total, secs, seed=2026)
bed.drone()
bed.plucks(quiet=[(crane - 4, crane + 12), (ch("c08_tersisa")["start"], ch("c08_tersisa")["end"])])
for i, c in enumerate(TL["chapters"][2:9]):  # chapter title cards (ch1..ch7)
    bed.sfx("whoosh-cinematic", c["start"] - 0.9, 0.16)
    bed.ney(c["start"] - 0.4, D * 2 ** ((ROOTS[c["id"]] + 7) / 12), 4.8, 0.045)
bed.ney(1.0, D * 2 ** (7 / 12), 6.0, 0.05)
bed.drum(1.0, ch("c00_hook")["end"], 70, 0.05)
bed.drum(ch("c09_payoff")["start"], ch("c09_payoff")["end"], 70, 0.045)
# payoff ring reveals: one chime per era figure
for w, n in [("seribu", 0), ("delapan", 0), ("enam", 0), ("lima", 1), ("juta", 0)]:
    try:
        bed.sfx("chime", word("c09_payoff", w, n) - 0.05, 0.07)
    except IndexError:
        pass
bed.sfx("impact-bass-1", word("c00_hook", "juta") - 0.1, 0.12)
bed.sfx("riser", ch("c10_cta")["end"] - 2.2, 0.05)
long = bed.render(voEnd)
save("public/audio/bed.wav", long)
duck_combine("public/audio/bed.wav", "public/audio/vo.wav", "public/audio/full.wav")
print("long bed", round(total, 2), "s")

# ---------- short beds (same identity, own clock) ----------
for n in ("01", "02"):
    S = json.load(open(f"src/scenes/haram/short{n}.json", encoding="utf8"))
    secs = []
    for sg in S["segments"]:
        key = sg["chapter"] if sg["chapter"] in ROOTS else ("c00_hook" if sg["kind"] == "hook" else "c09_payoff")
        secs.append((sg["start"], sg["end"] + 0.5, key))
    secs.append((S["voEnd"], S["total"] + 1, "end"))
    b = Bed(S["total"], secs, seed=int(n) * 77)
    b.drone()
    b.plucks()
    b.ney(0.0, D * 2 ** (7 / 12), 3.5, 0.05)
    b.drum(0.0, S["segments"][0]["end"] + 0.4, 76, 0.06)
    b.sfx("impact-bass-1", 0.0, 0.12)
    b.sfx("whoosh-cinematic", S["segments"][-1]["start"] - 0.6, 0.12)
    save(f"public/audio/short{n}_bed.wav", b.render(S["voEnd"]))
    duck_combine(f"public/audio/short{n}_bed.wav", f"public/audio/short{n}_vo.wav", f"public/audio/short{n}_full.wav")
    print("short", n, S["total"])
