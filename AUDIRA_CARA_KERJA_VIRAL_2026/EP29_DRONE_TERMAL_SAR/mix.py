"""EP29 sound: a calm, respectful night-instrument bed. A slow D-minor-add9 pad that breathes, a soft sensor pulse
(a sine "ping" every two bars, like a thermal camera's frame tick, never an alarm), cold mountain wind, a far volcanic
rumble, and a gentle quad-rotor hum that follows the drone. Small glassy ticks mark panel reveals; the scan line has a
soft filtered sweep. No sirens, no impacts on sensitive lines. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, rumble, swell, drone

M = Mix(2929)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
OUT = B["outroAt"]


def bell(f, dur=1.6, dec=2.6):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3) + .15 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6)
    return x * np.minimum(1, t / .004) * np.exp(-t * dec)


def sweep(dur, f0=300, f1=3000):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = M.band(rng.standard_normal(n), 200, 6000)
    ph = np.cumsum(f0 * (f1 / f0) ** (t / dur)) / SR
    return norm(x * (.6 + .4 * np.sin(2 * np.pi * ph))) * np.sin(np.pi * t / dur) ** 2


# --- pad: Dm(add9) -> Bb(maj7) -> F(add9) -> C(sus2), 8 s per chord, quiet in the chip scenes, lifts at s7/s8 ---
chords = [(146.8, 174.6, 220.0, 329.6), (116.5, 146.8, 174.6, 220.0), (130.8, 174.6, 220.0, 261.6), (130.8, 146.8, 196.0, 293.7)]
pad = np.zeros(N)
CL = 8.0
for i in range(int(DUR / CL) + 1):
    t0 = i * CL
    L = min(N - int(t0 * SR), int((CL + 3) * SR))
    if L <= 0:
        break
    tt = np.arange(L) / SR
    env = np.minimum(1, tt / 2.5) * np.minimum(1, np.maximum(0, (CL + 3 - tt) / 3))
    x = sum(drone(tt, f, ((1, 1), (1.004, .7), (2.0, .22))) for f in chords[i % 4]) / 4
    j = int(t0 * SR)
    pad[j:j + L] += lowpass(x, 1400) * env
lvl = M.env([(0, .7), (S["s2"], .8), (S["s4"], .55), (S["s6"], .75), (S["s7"], .9), (S["s8"], 1.0), (END, 1.0), (END + 1.2, .5), (DUR - .2, 0), (DUR, 0)])
pad_m = pad * lvl * (1 + .08 * np.sin(2 * np.pi * T / 9))
music = stereo(pad_m, .25 * pad_m * np.sin(2 * np.pi * T * .05)) * .16

# sensor pulse: soft sine ping every 2 bars (4 s), muted under the hook's first line
for tp in np.arange(1.0, END + 1, 4.0):
    g(bell(1318.5, 1.0, 5.5), tp, .016)
    g(bell(659.3, 1.2, 4.0), tp + .5, .010)

# --- ambience: wind (strong on the slope, gone in the chip), far volcanic rumble, drone hum ---
wind = norm(lowpass(rng.standard_normal(N), 700) - lowpass(rng.standard_normal(N), 120)) * (1 + .35 * np.sin(2 * np.pi * T / 7.3) * np.sin(2 * np.pi * T / 3.1))
e_w = M.env([(0, .9), (S["s4"] - .4, .9), (S["s4"], .05), (S["s6"] - .2, .05), (S["s6"] + .3, .9), (S["s8"], .7), (END + 1, .4), (DUR, 0)])
g(np.stack([wind * e_w, np.roll(wind, 1301) * e_w], 1), 0, .03)
rb = rumble(rng, DUR, 45, .5)
e_r = M.env([(0, .8), (S["s2"], .5), (S["s4"], 0), (S["s6"], .4), (AT["s6:fumarol"], .9), (S["s7"], .3), (DUR, 0)])
g(rb[:N] * e_r[: len(rb)], 0, .05)
hum_m = norm(lowpass(drone(T, 98, ((1, 1), (2, .5), (3.02, .3), (4.1, .2))) * (1 + .3 * np.sin(2 * np.pi * T * 23)), 900))
e_h = M.env([(0, .35), (S["s2"], .3), (AT["s2:menerbangkan"], .55), (S["s3"], .2), (AT["s3:Kaca"], .5), (S["s4"], 0), (S["s6"], 0), (S["s7"], .25), (AT["s7:menyapu"], .5), (S["s8"], .3), (END, .15), (DUR, 0)])
g(np.stack([hum_m * e_h, np.roll(hum_m, 411) * e_h], 1), 0, .025)
# fumarole hiss
hiss = norm(M.band(rng.standard_normal(N), 1800, 9000))
e_f = M.env([(0, 0), (AT["s6:fumarol"] - 1.2, 0), (AT["s6:fumarol"], 1), (S["s7"], .2), (S["s7"] + 1, 0), (DUR, 0)])
g(hiss * e_f, 0, .012)

# --- scene changes: soft air whoosh + glass tick ---
for k in ("s2", "s3", "s5", "s7", "s8"):
    g(M.lib("whoosh-short"), S[k] - .35, .035)
    g(bell(1760, .5, 9), S[k] + .02, .02)
# lens dives (s3 -> s4, s5 -> s6): filtered sweep
g(sweep(1.4, 200, 4000), S["s4"] - .9, .05)
g(sweep(1.2, 3000, 300), S["s6"] - .7, .045)
# hook: scan line reveal on "panas"
g(sweep(1.0, 400, 5000), AT["s1:panas"] - .2, .05)
g(bell(880, 2.2, 1.8), AT["s1:panas"] + .4, .03)
# s2 reveals
for kk in ("s2:November", "s2:dimulai", "s2:ketiga"):
    g(M.lib("click-soft"), AT[kk], .05)
g(M.lib("ping"), AT["s2:menerbangkan"], .03)
# s3: IR rings, glass, germanium
g(swell(rng, 2.2, 200, 1500), AT["s3:inframerah"] - .3, .03)
g(M.lib("click"), AT["s3:Kaca"], .04)
g(bell(1174.7, 1.4, 3), AT["s3:germanium"], .03)
# s4: pixels warm, scan reads
g(swell(rng, 1.8, 400, 3000), AT["s4:menghangatkan"] - .2, .03)
g(M.lib("click-soft"), AT["s4:hambatan"], .05)
for i in range(6):
    g(M.lib("click-soft"), AT["s4:Chip"] + i * .31, .022)
# s5: colour + number
g(M.lib("sparkle"), AT["s5:warna"], .03)
g(bell(1318.5, 1.6, 2.4), AT["s5:membedakan"] + .2, .028)
# s6: blockers (soft ticks), false signals (low tone, not an alarm)
for kk in ("s6:daun", "s6:batu", "s6:kaca", "s6:air"):
    g(M.lib("click-soft"), AT[kk], .045)
g(bell(220, 2.4, 1.6), AT["s6:palsu"] - .2, .03)
# s7: sweep, mark, lock
g(sweep(2.4, 300, 1200), AT["s7:menyapu"], .03)
g(M.lib("ping"), AT["s7:menandai"], .035)
g(M.lib("click"), AT["s7:mengunci"], .045)
g(bell(987.8, 1.4, 3), AT["s7:mengunci"] + .1, .025)
# s8 + outro
g(bell(587.3, 3.0, 1.2), AT["s8:memastikan"], .03)
g(bell(880, 3.0, 1.1), OUT + .05, .035)
M.fx *= 2.2
M.finish(music)
print("duration", DUR)
