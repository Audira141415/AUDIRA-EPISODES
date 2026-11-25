"""EP30 sound: a calm hazard-lab score in D dorian at 84 BPM. A soft analog pad and a low pendulum pulse whose tick
follows the sway (one tick per swing, louder when the tower sways more); a glassy marimba motif marks scenes and key
words. A wind bed follows the wind envelope, the hydraulic dampers add a warm hiss in s6, the typhoon adds a low
rumble in s7, and the score settles to a clean major colour in s8. SFX: lab whooshes on cuts, a deep bass hit on the
660-ton reveal, steel pings on the plates, a chime on 'tenang'. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(3001)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
D3 = 146.83
hz = lambda st, base=D3: base * 2 ** (st / 12)


def marimba(f, dur=1.0, a=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 4.5) + 0.25 * np.sin(2 * np.pi * f * 3.9 * t) * np.exp(-t * 14)
    return x * np.minimum(1, t / 0.003) * a


def tick(f=880, a=1.0):
    t = np.arange(int(0.09 * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 60) * a


def noise_bed(a, b, amp, lo, hi, fade=0.6):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), lo, hi)
    env = np.minimum(1, np.arange(n) / (fade * SR)) * np.minimum(1, (n - np.arange(n)) / (fade * SR))
    g(x / np.abs(x).max() * env, a, amp)


mar, pad, pul = M.mono(), M.mono(), M.mono()
# pad: D dorian, Dm9 colour, opens to D major-ish (F# added) at the calm ending
calm = M.env([(0, 0), (K["s8"], 0), (K["s8"] + 2.0, 1), (DUR, 1)])
pad += 0.35 * np.sin(2 * np.pi * hz(0) * T) + 0.25 * np.sin(2 * np.pi * hz(7) * T + 0.4 * np.sin(T * 0.3)) + 0.18 * np.sin(2 * np.pi * hz(10) * T + np.sin(T * 0.21))
pad += (1 - calm) * 0.16 * np.sin(2 * np.pi * hz(15) * T + 0.5 * np.sin(T * 0.4)) + calm * 0.2 * np.sin(2 * np.pi * hz(16) * T + 0.5 * np.sin(T * 0.4))
# pendulum pulse: one soft tick per swing extreme (sway period 3.0 s -> extremes every 1.5 s), level follows the sway
sway = M.env([(0, 0.35), (K["s2"], 0.4), (AT["s2:meter"], 1.0), (K["s3"], 0.6), (K["s4"], 0.4), (AT["s4:besar"], 1.0), (K["s5"], 0.8), (AT["s6:persen"], 0.5), (K["s7"], 0.4), (AT["s7:berayun"], 0.9), (K["s8"], 0.4), (AT["s8:tenang"], 0.15), (DUR, 0.1)])
t0, i = 0.75, 0
while t0 < END + 1.0:
    lv = float(sway[min(N - 1, int(t0 * SR))])
    M.lay(pul, tick(660 if i % 2 == 0 else 587, 0.4 + 0.6 * lv), t0)
    M.lay(pul, M.thump(0.22) * 0.5 * lv, t0)
    t0 += 1.5
    i += 1
# marimba motifs at scene openings and key words
phr = {"s1": [0, 3, 7, 10], "s2": [12, 10, 7, 5], "s3": [3, 7, 10, 14], "s4": [0, 7, 0, 7, 12], "s5": [12, 7, 12, 7], "s6": [5, 3, 0, -2],
       "s7": [0, 5, 7, 10, 12], "s8": [0, 4, 7, 11, 14]}
for s, notes in phr.items():
    tt = 0.08 if s == "s1" else K[s] + 0.12
    for j, st in enumerate(notes):
        M.lay(mar, marimba(hz(st + 12), 1.0, 0.7), tt + j * 0.357)
for w in ("s1:ton", "s3:tertala", "s4:diatur", "s5:melawan", "s6:persen", "s7:terbesar", "s8:tenang"):
    M.lay(mar, marimba(hz(24), 1.6, 0.45), AT[w])
e = M.env([(0, 0.85), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.5 * mar + 0.32 * pad + 0.4 * pul) * e
side = 0.22 * np.roll(mar + pad * 0.5, 900) * e
music = stereo(mono, side)

# ---- SFX ----
noise_bed(0.0, K["s3"], 0.022, 300, 2600)  # wind in the hook and s2
noise_bed(AT["s2:kencang"] - 0.4, AT["s2:mual"], 0.02, 500, 3500, 0.4)  # gust
noise_bed(AT["s4:mendorong"] - 0.3, K["s5"], 0.015, 300, 2400)
for s in ("s2", "s4", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
for s in ("s3", "s5", "s6"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
g(M.lib("impact-bass-1"), AT["s1:ton"], 0.07)
g(M.thump(0.4), AT["s1:ton"], 0.12)
for w in ("s2:meter", "s3:sembilan", "s4:besar", "s5:sebaliknya", "s7:diameter"):
    g(M.lib("click-soft"), AT[w], 0.06)
g(M.lib("pop"), AT["s3:pengunjung"], 0.05)
g(M.lib("ping"), AT["s4:diatur"], 0.05)
# hydraulic hiss in s6, pulsing with the swing
n6 = AT["s6:Hasilnya"] - AT["s6:hidrolik"]
if n6 > 0:
    tt = np.arange(int(n6 * SR)) / SR
    hiss = M.band(M.rng.standard_normal(len(tt)), 1200, 6000) * (0.4 + 0.6 * np.abs(np.cos(2 * np.pi / 3.0 * (tt + AT["s6:hidrolik"]))))
    hiss *= np.minimum(1, tt / 0.4) * np.minimum(1, (len(tt) / SR - tt) / 0.5)
    g(hiss / np.abs(hiss).max(), AT["s6:hidrolik"], 0.03)
g(M.lib("riser"), AT["s6:berkurang"] - 0.8, 0.04)
g(M.lib("chime"), AT["s6:persen"], 0.04)
# 41 plates: a quick run of steel pings as the plates fan out
for j in range(8):
    g(M.lib("ping"), AT["s7:lempeng"] + j * 0.07, 0.025)
# typhoon rumble
noise_bed(AT["s7:topan"] - 0.4, K["s7e"] + 0.4, 0.05, 40, 400, 0.8)
noise_bed(AT["s7:topan"] - 0.2, K["s7e"], 0.025, 600, 4000, 0.6)
g(M.lib("impact-bass-1"), AT["s7:berayun"], 0.05)
g(M.lib("sparkle"), AT["s8:tenang"], 0.05)
g(M.lib("pop"), AT["s8:AUDIRA"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
