"""EP43 sound: the deep. A slow D-dorian pad that darkens with depth, a sub drone, sonar pings, and a glassy data arp
(fast sine blips) that only plays while light runs through the cable. It thins out and loses brightness on "redup",
comes back bright on "terang". Above water in the hook: thin night air + a satellite carrier tone that is cut by the red X;
the dive is a filtered splash and pressure whoosh. Repeater: warm pump buzz + erbium shimmer; power: low electric hum;
s7: shark swish, ship engine rumble from above, anchor chain, scrape and a damage hit. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4343)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 84
D3 = 146.83
hz = lambda st, base=D3: base * 2 ** (st / 12)


def blip(f, dur=0.09, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 38) * np.minimum(1, t / 0.002) * a


def bell(f, dur=2.4, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 1.6) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4) + 0.15 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 7)
    return x * np.minimum(1, t / 0.003) * a


def ping(f=1180, dur=2.2, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2)
    echo = np.zeros_like(x)
    d = int(0.38 * SR)
    echo[d:] = 0.35 * x[:-d]
    return (x + echo) * np.minimum(1, t / 0.004) * a


pad, sub, arp, bel = M.mono(), M.mono(), M.mono(), M.mono()
# depth: 0 above water, 1 on the seabed
depth = M.env([(0, 0), (AT["s1:satelit"] - 0.2, 0), (AT["s1:kabel"], 0.7), (AT["s1:dasar"] + 0.5, 1), (DUR, 1)])
chords = [[0, 3, 7, 10], [-2, 2, 5, 9], [-4, 0, 3, 7], [-5, -1, 2, 5]]
step = beat * 8
for i in range(int(DUR / step) + 1):
    t0 = i * step
    n0, n1 = int(t0 * SR), min(N, int((t0 + step + 1.5) * SR))
    if n0 >= N:
        break
    tt = np.arange(n1 - n0) / SR
    env = np.minimum(1, tt / 1.2) * np.minimum(1, (tt[-1] - tt + 1e-3) / 1.5)
    for st in chords[i % 4]:
        f = hz(st)
        pad[n0:n1] += env * (np.sin(2 * np.pi * f * tt + 0.3 * np.sin(tt * 0.5)) + 0.25 * np.sin(2 * np.pi * f * 2.003 * tt)) * 0.22
sub += (np.sin(2 * np.pi * 36.7 * T) + 0.5 * np.sin(2 * np.pi * 55 * T + np.sin(T * 0.3))) * depth * 0.5
# data arp: only while light runs in the cable; dims after "redup", bright again after "terang"
light = M.env([(0, 0), (AT["s1:kabel"] - 0.3, 0), (AT["s1:kabel"], 1), (AT["s5:redup"], 1), (AT["s5:redup"] + 1.5, 0.25),
               (AT["s6:terang"] - 0.2, 0.25), (AT["s6:terang"] + 0.3, 1.1), (AT["s7:terseret"], 1), (AT["s7:terseret"] + 0.3, 0.15),
               (K["s8"], 0.15), (K["s8"] + 1, 1), (END + 1, 0.6), (DUR, 0)])
seq = [12, 19, 15, 24, 22, 19, 17, 15]
t0, i = AT["s1:kabel"] - 0.3, 0
while t0 < DUR - 1:
    a = float(light[min(N - 1, int(t0 * SR))])
    if a > 0.02:
        bright = 1.0 if a > 0.6 else 0.5
        M.lay(arp, blip(hz(seq[i % 8] + (12 if bright == 1.0 and i % 4 == 3 else 0)), 0.09, a), t0)
    t0 += beat / 4
    i += 1
# bells at key words
for w, st in (("s1:kabel", 12), ("s2:enam", 15), ("s2:kilometer", 19), ("s3:baja", 7), ("s4:serat", 24), ("s4:kedipan", 27),
              ("s5:repeater", 19), ("s6:erbium", 22), ("s6:terang", 24), ("s8:cahaya", 19), ("s8:AUDIRA", 24)):
    M.lay(bel, bell(hz(st), 2.6, 0.55), AT[w])
e = M.env([(0, 0.8), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.45 * pad * (0.55 + 0.45 * depth) + 0.4 * sub + 0.32 * arp + 0.4 * bel) * e
side = 0.25 * np.roll(pad + arp, 900) * e
music = stereo(mono, side)


# ---- SFX ----
def noise(dur, lo, hi):
    x = M.band(M.rng.standard_normal(int(dur * SR)), lo, hi)
    return x / (np.abs(x).max() + 1e-9)


def swell(t, dur, a, lo=200, hi=3000, att=0.3):
    x = noise(dur, lo, hi)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (att * SR)) * np.exp(-np.arange(n) / SR * (3 / dur))
    g(x * env, t, a)


def bed(a, b, amp, lo, hi):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = noise(b - a, lo, hi)
    env = np.minimum(1, np.arange(n) / (0.5 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.5 * SR))
    g(x * env, a, amp)


def hum(a, b, f, amp, mod=0.0):
    n = int((b - a) * SR)
    if n <= 0:
        return
    tt = np.arange(n) / SR
    env = np.minimum(1, tt / 0.3) * np.minimum(1, (tt[-1] - tt + 1e-3) / 0.3)
    x = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * 2 * f * tt) + 0.25 * np.sign(np.sin(2 * np.pi * 3 * f * tt)) * 0.3) * (1 + mod * np.sin(tt * 9))
    g(x * env, a, amp)


# hook: night air + satellite carrier tone cut by the X, then the dive
bed(0, AT["s1:kabel"], 0.012, 2000, 8000)
hum(0, AT["s1:tidak"] + 0.05, 1320, 0.012)
g(M.lib("glitch-2"), AT["s1:tidak"], 0.05)
g(M.thump(0.22), AT["s1:tidak"], 0.08)
swell(AT["s1:satelit"] + 0.1, 1.2, 0.07, 300, 6000, 0.05)  # splash
g(M.lib("whoosh-cinematic"), AT["s1:satelit"] - 0.1, 0.06)
g(ping(), AT["s1:dasar"] + 0.2, 0.05)
for s in ("s2", "s4", "s5", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.06)
for s in ("s3", "s6"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
bed(AT["s1:kabel"], END, 0.01, 80, 600)  # water pressure bed
for w in ("s2:enam", "s2:aktif", "s2:direncanakan", "s3:selang", "s3:pantai", "s4:serat", "s4:ponselmu", "s5:penguat", "s6:Listriknya", "s7:pertiga"):
    g(M.lib("click-soft"), AT[w] - 0.03, 0.05)
g(M.lib("riser"), AT["s2:enam"] - 0.6, 0.03)
g(M.lib("sparkle"), AT["s2:kilometer"], 0.05)
g(M.lib("impact-bass-1"), AT["s3:baja"], 0.04)
for j in range(6):
    swell(AT["s3:dikubur"] - 0.1 + j * 0.12, 0.35, 0.03, 150, 1500, 0.02)  # sand
g(M.lib("pop"), AT["s4:ponselmu"], 0.05)
g(M.lib("typing"), AT["s4:kedipan"], 0.025)
swell(AT["s4:melesat"], 1.0, 0.04, 2000, 9000, 0.05)
g(M.lib("error"), AT["s5:redup"], 0.025)
g(ping(880, 2.4), AT["s5:repeater"], 0.06)
g(M.lib("click"), AT["s6:dalam"], 0.06)
hum(AT["s6:Laser"] - 0.1, AT["s6:Listriknya"], 220, 0.018, 0.3)  # pump laser buzz
for j in range(5):
    M.lay(bel, bell(hz(24 + j * 3), 1.4, 0.2), AT["s6:energi"] + j * 0.1)
g(M.lib("chime"), AT["s6:terang"], 0.05)
hum(AT["s6:Listriknya"] - 0.1, K["s7"] - 0.2, 60, 0.03, 0.15)  # power hum
g(M.lib("whoosh-short"), AT["s7:hiu"] - 0.5, 0.05)
g(M.lib("glitch-1"), AT["s7:hiu"] + 0.4, 0.03)
hum(AT["s7:kapal"] - 0.6, K["s8"] - 0.2, 42, 0.03, 0.25)  # engine from above
for j in range(8):
    g(M.lib("click"), AT["s7:jangkar"] + j * 0.12, 0.025)  # chain
bed(AT["s7:jangkar"] + 0.3, AT["s7:terseret"] + 0.6, 0.03, 600, 4000)  # scrape
g(M.lib("impact-bass-1"), AT["s7:terseret"] + 0.2, 0.07)
g(M.lib("glitch-3"), AT["s7:terseret"] + 0.25, 0.045)
g(M.thump(), AT["s7:terseret"] + 0.2, 0.12)
g(M.lib("sparkle"), AT["s8:cahaya"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
