"""EP32 sound: a cosy felt-craft bed in G major (soft plucked pad, music-box glockenspiel, light brush shaker) that
darkens to E minor for the damage and the virus, then warms back. Rabbit pops when the crate opens, soft hop taps,
a needle-and-thread zip while the 1901 fence is sewn, a low hum when myxoma drops, a sparkle for the DNA helix.
Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1859)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 100

warm = [[43, 55, 59, 62], [40, 52, 55, 59], [36, 52, 55, 60], [38, 54, 57, 62]]   # G Em C D
dark = [[40, 52, 55, 59], [36, 48, 55, 60], [45, 52, 57, 60], [47, 54, 59, 62]]   # Em C Am B
s6, s7, s8 = K["s6"], K["s7"], K["s8"]
def chord(t):
    p = dark if (s6 <= t < AT["s7:Tapi"]) else warm
    return p[int(t / (beat * 8)) % 4]
pad, box, sh = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 1.5, beat * 8):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 8.4, "tri", 0.25, 1.2), t0, 0.35)
for k, t0 in enumerate(np.arange(beat * 2, END + 0.5, beat)):
    ch = chord(t0)
    f = hz(ch[1 + (k * 2) % 3] + 24)
    M.lay(box, M.tone((f, f * 2.0, f * 3.0), 0.9, 4.5), t0, 0.45 if k % 4 == 0 else 0.25)
for t0 in np.arange(beat * 8, END, beat / 2):
    M.lay(sh, M.band(M.burst(0.05, 70, 1), 4000, 11000), t0, 0.35 if int(t0 / (beat / 2)) % 2 else 0.18)
pad = M.band(pad, 80, 1800)
for x in (pad, box, sh):
    x /= max(1e-6, np.abs(x).max())
e_all = M.env([(0, 0.0), (0.4, 0.8), (s6, 0.8), (s6 + 0.5, 0.65), (s7, 0.6), (AT["s7:Tapi"], 0.8), (s8, 0.85), (END, 0.95), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.45 * pad + 0.3 * box + 0.08 * sh) * e_all
music = stereo(mono, 0.06 * box * e_all + 0.04 * pad * e_all)


def hop(t, a=0.025):
    g(M.band(M.thump(0.12), 80, 900), t, a); g(M.tone((520,), 0.05, 60), t, a * 0.2)


def zip_(t, d, a=0.02):
    n = int(d / 0.09)
    for i in range(n):
        g(M.band(M.burst(0.06, 90, 2), 2500, 9000), t + i * 0.09, a)


# s1 hook: crate pops, rabbits, carpet swell
g(M.lib("pop"), AT["s1:Dua"] - 0.1, 0.05)
for i in range(10):
    g(M.lib("pop"), AT["s1:Dua"] + 0.1 + i * 0.13, 0.025)
for i in range(8):
    hop(AT["s1:Dua"] + 0.4 + i * 0.22)
g(M.lib("riser"), AT["s1:Seratus"] - 0.3, 0.025)
g(M.lib("whoosh-cinematic"), AT["s1:Seratus"] + 0.2, 0.03)
g(M.lib("impact-bass-1"), AT["s1:benua"], 0.045)
# stations
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.35, 0.03)
# s2 rewind, pin, Austin tag, kangaroo
g(M.lib("whoosh"), K["s2"] + 0.1, 0.03)
g(M.lib("ping"), AT["s2:Victoria"], 0.03)
g(M.lib("click-soft"), AT["s2:Thomas"], 0.04)
for i in range(3):
    hop(AT["s2:Padahal"] - 0.5 + i * 0.4, 0.04)
g(M.lib("pop"), AT["s2:tidak"], 0.035)
# s3 crate again
g(M.lib("click"), AT["s3:melepas"] - 0.3, 0.04)
for i in range(12):
    g(M.lib("pop"), AT["s3:melepas"] + 0.2 + i * 0.1, 0.022)
g(M.lib("pop"), AT["s3:melepas"], 0.04)
# s4 pets and babies
for i in range(8):
    hop(AT["s4:peliharaan"] - 1.0 + i * 0.15, 0.022)
for i in range(16):
    g(M.lib("pop"), AT["s4:keturunannya"] + i * 0.11, 0.018)
g(M.lib("pop"), AT["s4:tangguh"], 0.035)
# s5 spread
g(M.lib("riser"), AT["s5:Dalam"] - 0.6, 0.025)
g(M.lib("click"), AT["s5:lima"], 0.035); g(M.lib("click"), AT["s5:juta"], 0.035)
g(M.lib("impact-bass-1"), AT["s5:penyebaran"], 0.04)
# s6 damage, fence sewing
g(M.lib("pop"), AT["s6:Rumput"], 0.03); g(M.lib("pop"), AT["s6:erosi"], 0.03)
g(M.thump(0.3), AT["s6:tergerus"], 0.06)
zip_(AT["s6:membangun"] - 0.2, AT["s6:kilometer"] - AT["s6:membangun"] + 0.4)
g(M.lib("pop"), AT["s6:pagar"], 0.03)
for i in range(5):
    hop(AT["s6:lolos"] - 0.4 + i * 0.18, 0.03)
g(M.lib("glitch-1"), AT["s6:lolos"], 0.02)
# s7 virus, drop, recovery, DNA
for i in range(5):
    g(M.thump(0.25), AT["s7:virus"] + 0.5 + i * 0.22, 0.05)
g(M.tone((110, 165), 2.4, 1.2), AT["s7:virus"], 0.03)
g(M.lib("pop"), AT["s7:myxoma"], 0.03)
g(M.lib("impact-bass-1"), AT["s7:juta#2"], 0.04)
g(M.lib("riser"), AT["s7:naik"] - 0.6, 0.02)
g(M.lib("sparkle"), AT["s7:Studi"], 0.03)
g(M.lib("chime"), AT["s7:berasal"], 0.035)
# s8 emu, question, outro
g(M.lib("pop"), AT["s8:Perang"], 0.04)
g(M.lib("ping"), AT["s8:Menurut"], 0.025)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
