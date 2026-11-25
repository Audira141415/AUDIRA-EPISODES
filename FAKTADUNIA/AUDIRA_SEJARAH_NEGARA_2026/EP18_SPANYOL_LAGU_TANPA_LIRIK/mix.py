"""EP18 sound: an ORIGINAL toy march with a Spanish flavour (not the Marcha Real melody). D harmonic minor, 2/4 at 112 BPM:
fife melody with grace-note ornaments (its on-beat notes match the staff motif in the 3D stadium), brass off-beat chords,
tuba roots, snare and castanets. Thinner under the 1978 beat, a short stop on "dibatalkan". Foley: shape-wipe pops,
stamps, drum taps at 1761, a crown clink, paper slips, calendar flips, a yank and a lid slam. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1761)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 112
T0 = 0.05
bar = beat * 2

# 8-bar loop, two chords per... one chord per bar (2 beats). D harmonic minor.
Dm, Gm, A7, Bb = [50, 57, 62, 65], [43, 55, 58, 62], [45, 57, 61, 64], [46, 58, 62, 65]
prog = [Dm, Dm, A7, A7, Dm, Gm, A7, Dm]
# fife: one main note per beat; bars 1-4 are the staff motif E F E D C# D E A
mainA = [76, 77, 76, 74, 73, 74, 76, 69]
mainB = [77, 81, 79, 77, 76, 73, 74, 74]
melody = mainA + mainB  # 16 beats = 8 bars

def fife(f, d, a=1.0):
    tt = np.arange(int(d * SR)) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 6.0 * tt) * np.minimum(1, tt / 0.12)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    x += 0.05 * M.band(rng.standard_normal(len(tt)), 2500, 9000)
    return a * x * np.minimum(1, tt / 0.02) * np.minimum(1, (d - tt) / 0.03)

def brass(f, d, a=1.0):
    tt = np.arange(int(d * SR)) / SR
    ph = 2 * np.pi * f * tt
    x = sum(np.sin(h * ph) / h ** 1.1 for h in range(1, 8))
    return a * x * np.minimum(1, tt / 0.02) * np.minimum(1, (d - tt) / 0.04)

def snare(a):
    x = M.band(M.burst(0.13, 32, 1), 1500, 9000)
    x[: int(0.05 * SR)] += 0.3 * M.tone((200, 330), 0.05, 40)
    return x * a

def casta(a):
    return M.band(M.burst(0.025, 260, 1), 2000, 8000) * a + 0.3 * a * M.tone((2300, 3100), 0.025, 120)

fifeB, brassB, tubaB, drumB, castB = M.mono(), M.mono(), M.mono(), M.mono(), M.mono()
k = 0
for t0 in np.arange(T0, END + 1.2, beat / 2):
    b, half = k // 2, k % 2
    ch = prog[(b // 2) % 8]
    if half == 0:
        root = ch[0] - 12 if b % 2 == 0 else ch[0] - 5
        M.lay(tubaB, M.note(hz(root), beat * 0.7, "tri", 3, 0.01), t0, 0.9)
        m = melody[b % 16]
        M.lay(fifeB, fife(hz(m), beat * 0.42), t0)
    else:
        for m in ch[1:]:
            M.lay(brassB, brass(hz(m), beat * 0.3, 0.3), t0)
        m = melody[b % 16]
        nb = melody[(b + 1) % 16]
        grace = m + (1 if nb > m else -1) if (b % 4) != 3 else m
        M.lay(fifeB, fife(hz(grace), beat * 0.22, 0.7), t0 + beat * 0.12)
    a = 0.8 if k % 4 == 0 else 0.3 if half == 0 else 0.2
    M.lay(drumB, snare(a), t0)
    if k % 16 == 14:
        for r in range(4):
            M.lay(drumB, snare(0.15 + r * 0.06), t0 + r * beat / 8)
    # castanets: a flamenco-ish triplet figure every other bar
    if k % 8 == 4:
        for r in range(3):
            M.lay(castB, casta(0.8 - r * 0.15), t0 + r * beat / 6)
    k += 1
fifeB = M.band(fifeB, 300, 9000)
for x in (fifeB, brassB, tubaB, drumB, castB):
    x /= max(1e-6, np.abs(x).max())

w1, w2, w3, w4, w5 = K["s2"], K["s3"], K["s5"], K["s6"], K["s8"]
t1978, tBatal = AT["s5:1978"], AT["s7:dibatalkan"]
e_full = M.env([(0, 0.0), (0.6, 1), (t1978 - 0.2, 1), (t1978 + 0.6, 0.45), (w4 - 0.4, 0.45), (w4 + 0.2, 1), (tBatal - 0.05, 1), (tBatal + 0.05, 0), (tBatal + 0.9, 0), (tBatal + 1.6, 1), (END, 1), (DUR - 0.4, 0), (DUR, 0)])
e_fife = M.env([(0, 0.0), (0.6, 1), (tBatal - 0.05, 1), (tBatal + 0.05, 0), (tBatal + 1.2, 0), (tBatal + 1.8, 1), (END, 1), (DUR - 0.4, 0), (DUR, 0)])
mono = 0.42 * tubaB * e_full + 0.26 * brassB * e_full + 0.34 * fifeB * e_fife + 0.36 * drumB * e_full + 0.2 * castB * e_full
music = stereo(mono, 0.07 * fifeB * e_fife + 0.06 * castB * e_full)

# --- foley ---
def click(t, a=0.1):
    g(M.band(M.burst(0.03, 150, 1), 2000, 10000), t, a)
    g(M.tone((520,), 0.07, 40), t + 0.005, a * 0.5)

def rustle(t, d=0.4, a=0.03):
    x = M.band(rng.standard_normal(int(d * SR)), 1500, 8000) * np.hanning(int(d * SR))
    g(x, t, a)

# shape wipes: discs pop in, whoosh, pop out
for c in (w1, w2, w3, w4, w5):
    g(M.lib("whoosh-short"), c - 0.6, 0.06)
    for i in range(6):
        g(M.lib("pop"), c - 0.55 + i * 0.07, 0.018)
    g(M.thump(0.2), c - 0.02, 0.07)
# hook
g(M.lib("impact-bass-1"), 0.05, 0.05)
for a in ("s1:resmi", "s2:tanpa", "s7:dikritik", "s7:dibatalkan"):
    g(M.thump(0.3), AT[a], 0.12); click(AT[a], 0.08)
# flags rise
for a in ("s2:Bosnia", "s2:Kosovo"):
    g(M.lib("whoosh-short"), AT[a] - 0.3, 0.04); click(AT[a] + 0.25, 0.1)
# 1761: drum roll + a fife trill accent
for i in range(10):
    g(snare(0.5 + i * 0.03), AT["s3:1761"] - 0.6 + i * 0.06, 0.12)
g(M.lib("chime"), AT["s3:Granadera"], 0.03)
# crown drops at 1770
g(M.lib("whoosh-short"), AT["s4:1770"] - 0.45, 0.05); g(M.tone((1900, 2870, 4100), 1.1, 5), AT["s4:1770"] + 0.1, 0.04); g(M.thump(0.25), AT["s4:1770"] + 0.1, 0.1)
for a in ("s4:Carlos", "s4:Isabel"):
    click(AT[a], 0.1)
g(M.thump(0.3), AT["s4:kebangsaan"], 0.1); g(M.lib("sparkle"), AT["s4:kebangsaan"] + 0.1, 0.04)
# lyric sheets: stamps, cross, sink at 1978
for i in range(2):
    g(M.thump(0.25), AT["s5:resmi"] + i * 0.18, 0.1)
g(M.lib("glitch-1"), AT["s5:Franco"], 0.03); g(M.thump(0.3), AT["s5:Franco"], 0.1)
g(M.lib("riser"), t1978 + 0.2, 0.02)
g(M.lib("pop"), t1978 + 2.0, 0.05)
for i in range(3):
    g(M.lib("pop"), AT["s5:dimainkan"] - 0.2 + i * 0.2, 0.03)
# contest: slips fall in, then overflow
for t0 in np.arange(AT["s6:Sayembara"] - 0.3, AT["s6:ribuan"], 0.11):
    rustle(t0, 0.25, 0.02)
for t0 in np.arange(AT["s6:ribuan"] - 0.3, AT["s6:ribuan"] + 2.6, 0.06):
    rustle(t0, 0.2, 0.025)
# winner rises, critics pop
g(M.lib("riser"), AT["s7:pemenang"] - 0.6, 0.03); g(M.lib("ping"), AT["s7:pemenang"] + 0.4, 0.04)
for i in range(6):
    g(M.lib("pop"), AT["s7:dikritik"] - 0.1 + i * 0.12, 0.035)
# calendar flips: five days
for i in range(4):
    rustle(AT["s7:lima"] - 0.35 + i * 0.3, 0.15, 0.05); click(AT["s7:lima"] - 0.2 + i * 0.3, 0.06)
# yank and lid slam
g(M.lib("whoosh-cinematic"), AT["s7:ditarik"] - 0.1, 0.05)
g(M.thump(0.4), tBatal + 0.15, 0.2); click(tBatal + 0.15, 0.12)
# outro
g(M.lib("pop"), AT["s8:Menurut"], 0.04)
g(M.lib("chime"), OUT + 0.3, 0.06)
room = M.band(rng.standard_normal(N), 200, 1500)
room /= np.abs(room).max()
M.fx += np.stack([room, np.roll(room, 900)], 1) * 0.003
M.finish(music)
print("duration", DUR)
