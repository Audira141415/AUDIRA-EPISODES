"""EP50 sound: soft piano in A minor turning to C major with the gold (sparse, felt-like notes over a warm pad),
porcelain clinks for each prop, a soft crack for 1959 (no gunshot), a thin liquid-gold shimmer while each seam fills,
paper for the name card, the tag and the ballot, a cup set down for mother and daughter. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1960)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 68

# minor before the gold (s1 flash-forward stays major), major from s4
MIN = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62], [40, 47, 52, 56, 59]]
MAJ = [[48, 55, 60, 64, 67], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62]]
def chord(t):
    prog = MIN if K["s2"] <= t < K["s4"] else MAJ
    return prog[int(t / (beat * 8)) % 4]

pad, pno = M.mono(), M.mono()
for t0 in np.arange(0.05, END + 1.5, beat * 8):
    n = int(beat * 8.6 * SR); tt = np.arange(n) / SR
    for m in chord(t0)[:3]:
        v = sum(np.sin(2 * np.pi * hz(m + 12) * d * tt) for d in (0.998, 1.0, 1.003)) / 3
        M.lay(pad, v * np.minimum(1, tt / 1.5) * np.minimum(1, (tt[-1] - tt) / 1.2), t0, 0.3)
q = np.random.default_rng(5)
for k, t0 in enumerate(np.arange(0.2, END + 0.5, beat)):
    ch = chord(t0)
    if k % 8 in (3, 7) and q.random() < 0.5:
        continue
    note = ch[[1, 3, 2, 4, 3, 2, 4, 1][k % 8]] + 12
    x = M.note(hz(note), 2.6, "pluck", 1.6)
    h = M.note(hz(note + 12), 1.4, "sine", 3.0); x[: len(h)] += 0.3 * h
    M.lay(pno, x, t0 + q.random() * 0.02, 0.5 if k % 4 == 0 else 0.32)
    if k % 8 == 0:
        M.lay(pno, M.note(hz(ch[0]), 3.0, "pluck", 1.2), t0, 0.35)
pad = M.band(pad, 100, 2600)
for x in (pad, pno):
    x /= max(1e-6, np.abs(x).max())
e_all = M.env([(0, 0.0), (0.4, 0.8), (K["s3"], 0.75), (K["s3"] + 0.6, 0.45), (K["s4"], 0.5), (K["s4"] + 1.5, 0.85), (K["s8"], 1.0), (END, 1.0), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.55 * pad + 0.5 * pno) * e_all
music = stereo(mono, 0.1 * pno * e_all)


def clink(t, a=0.05, f0=2900):
    x = sum(M.tone((f0 * r,), 1.6, dec) * amp for r, dec, amp in ((1.0, 5, 1.0), (1.51, 7, 0.6), (2.37, 9, 0.35), (3.1, 12, 0.2)))
    b = M.band(M.burst(0.03, 120, 1), 2000, 9000); x[: len(b)] += 0.2 * b
    g(x, t, a)


def paper(t, d=0.4, a=0.04):
    g(M.band(M.burst(d, 7, 1), 1800, 9000), t, a)


def shimmer(t0, d, a=0.025):
    n = int(d * SR); tt = np.arange(n) / SR
    x = M.band(rng.standard_normal(n), 3000, 12000) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * tt))
    for f in (1760, 2217, 2637):
        x += 0.4 * np.sin(2 * np.pi * f * tt + 3 * np.sin(2 * np.pi * 0.7 * tt))
    env = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 0.8
    g(x / max(1e-6, np.abs(x).max()) * env, t0, a)


def crack(t, a=0.08):
    for i in range(7):
        g(M.band(M.burst(0.05, 90, 1), 900, 8000), t + i * 0.045 + rng.random() * 0.02, a * (1 - i * 0.1))
    g(M.thump(0.3), t, a * 0.6)


# s1: gold flows on the finished vase, word written
shimmer(0.05, 1.4, 0.03)
g(M.lib("whoosh-cinematic"), 0.05, 0.02)
clink(1.0, 0.04)
g(M.lib("impact-bass-1"), AT["s1:1960"], 0.035)
g(M.lib("chime"), AT["s1:Sri"], 0.025)
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.3, 0.025)
# s2: name card, dish
paper(K["s2"] + 0.1, 0.35, 0.04)
clink(AT["s2:Ceylon"] + 0.3, 0.035, 2400)
g(M.lib("click-soft"), AT["s2:penasihat"], 0.025)
# s3: crack on the date
crack(AT["s3:1959"] - 0.05, 0.07)
g(M.lib("riser"), AT["s3:goyah"] - 1.0, 0.012)
# s4: gold fills the first crack
shimmer(AT["s4:Juli"] - 0.2, max(1.5, AT["s4:pertama"] - AT["s4:Juli"] + 0.6), 0.035)
g(M.lib("sparkle"), AT["s4:pertama"], 0.035)
g(M.lib("impact-bass-1"), AT["s4:pertama"], 0.03)
g(M.lib("pop"), AT["s4:pertahanan"], 0.02)
# s5: tag, strike, new word
paper(AT["s5:janda"] - 0.3, 0.45, 0.045)
g(M.band(M.burst(0.5, 8, 1), 600, 5000), AT["s5:berarti"] + 0.3, 0.04)
shimmer(AT["s5:stateswoman"] - 0.15, 1.0, 0.03)
g(M.lib("chime"), AT["s5:stateswoman"] + 0.2, 0.03)
# s6: two more seams, dish relabelled
shimmer(AT["s6:tiga"] + 0.25, 1.3, 0.03)
shimmer(AT["s6:2000"] - 0.5, 1.3, 0.03)
clink(AT["s6:tiga"] - 0.2, 0.03); clink(AT["s6:2000"] - 0.2, 0.03, 3300)
g(M.lib("sparkle"), AT["s6:Republik"] - 0.3, 0.03)
# s7: cups set down, gold thread, ballot
clink(K["s7"] + 1.0, 0.05, 2600); clink(AT["s7:Chandrika"] + 0.5, 0.05, 3000)
shimmer(AT["s7:mengangkat"] - 0.1, 1.2, 0.025)
paper(AT["s7:suara"] - 0.4, 0.4, 0.035)
# s8
g(M.lib("whoosh-cinematic"), K["s8"] - 0.4, 0.02)
shimmer(AT["s8:sejarah"] - 0.4, 1.3, 0.03)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
