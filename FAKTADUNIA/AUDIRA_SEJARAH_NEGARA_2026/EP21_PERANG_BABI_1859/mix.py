"""EP21 sound: a jaunty toy-theatre score. Marimba melody, woodblock ticks and an oom-pah tuba bass in F major at
112 bpm; a toy snare march under the standoff (s5); the music drops to a hush when Baynes refuses (s6); a small
brass fanfare when the arbitration lands (s7); a music-box coda for the pig (s8). Foley: velvet curtain swishes at
every act change, pig snorts, a cork-gun pop, coin clinks and a scale thunk, ships sliding in, fuse hiss and soft
smoke puffs, calendar ticks and confetti. Nothing violent or scary. Run after node build-video.mjs."""
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
beat = 60 / 112
bar = beat * 4
SW = [K["s2"], K["s3"], K["s5"], K["s7"], K["s8"]]
hush0, hush1 = AT["s6:Laksamana"], K["s7"]
march0, march1 = K["s5"], AT["s6:Laksamana"]
coda = K["s8"]

# F - Bb - C - F, then a minor turn for the standoff
prog = [[41, 65, 69, 72], [46, 65, 70, 74], [48, 64, 67, 72], [41, 65, 69, 72]]
tense = [[38, 62, 65, 69], [46, 62, 65, 70], [43, 62, 67, 70], [45, 61, 64, 69]]
def chord(t):
    return (tense if march0 <= t < hush1 else prog)[int(t / bar) % 4]

mar, bass, perc, brass, box = M.mono(), M.mono(), M.mono(), M.mono(), M.mono()
def marimba(f, d=0.5):
    tt = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * f * 3.9 * tt) * np.exp(-tt * 30)) * np.exp(-tt * 7) * np.minimum(1, tt / 0.002)
def tuba(f, d):
    tt = np.arange(int(d * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * tt) / h ** 1.6 for h in range(1, 6))
    return x * np.minimum(1, tt / 0.03) * np.minimum(1, (d - tt) / 0.06)
def wood(a=1.0):
    tt = np.arange(int(0.08 * SR)) / SR
    return (np.sin(2 * np.pi * 1180 * tt) + 0.5 * np.sin(2 * np.pi * 1890 * tt)) * np.exp(-tt * 70) * a
def snare(a=1.0):
    x = M.band(M.burst(0.18, 30, 2), 900, 7000) * a
    x[:4410] += 0.4 * M.tone((190,), 0.1, 40) * a
    return x

mel = [0, 4, 7, 4, 9, 7, 4, 2]
for k, t0 in enumerate(np.arange(0.0, DUR - 0.5, beat / 2)):
    if hush0 - 0.2 <= t0 < hush1 + 0.4 or t0 >= coda - 0.2:
        continue
    ch = chord(t0)
    if k % 2 == 0:
        M.lay(bass if k % 4 == 0 else perc, tuba(hz(ch[0] - 12 + (7 if k % 8 == 4 else 0)), beat * 0.8) if k % 4 == 0 else wood(0.5), t0, 0.8)
    if k % 4 == 2:
        for m in ch[1:]:
            M.lay(mar, marimba(hz(m), 0.3), t0, 0.22)
    if k % 2 == 1 or k % 8 == 0:
        m = ch[1] + mel[(k // 2) % 8] + (12 if (k // 16) % 2 else 0)
        M.lay(mar, marimba(hz(m)), t0, 0.45)
    if march0 <= t0 < march1 and k % 2 == 1:
        M.lay(perc, snare(0.55 if k % 4 == 3 else 0.3), t0, 1.0)
# drum roll into 461 and into the five ships
for t0, d in ((AT["s5:461"] - 1.2, 1.2), (AT["s5:lima"] - 0.9, 0.9)):
    for i in range(int(d / 0.05)):
        M.lay(perc, snare(0.18 + 0.4 * i / (d / 0.05)), t0 + i * 0.05, 1.0)
# fanfare on the arbitration win
tw = AT["s7:memenangkan"]
for i, (m, d) in enumerate([(65, 0.18), (69, 0.18), (72, 0.18), (77, 0.9)]):
    for h in (0, 4, 7):
        M.lay(brass, M.note(hz(m + h - 12), d + 0.1, "saw", 1.2, 0.02), tw + 0.15 + i * 0.2, 0.25)
# music-box coda
for k, t0 in enumerate(np.arange(coda + 0.3, DUR - 0.6, beat)):
    m = [77, 81, 84, 81, 79, 76, 77, 72][k % 8]
    M.lay(box, M.tone((hz(m), hz(m) * 2.0, hz(m) * 4.2), 1.2, 4), t0, 0.35)
for x in (mar, bass, perc, brass, box):
    x /= max(1e-6, np.abs(x).max())
e = M.env([(0, 0.0), (0.3, 1), (hush0 - 0.4, 1), (hush0 + 0.4, 0.12), (hush1 - 0.2, 0.12), (hush1 + 0.4, 1), (coda - 0.4, 1), (coda + 0.1, 0), (DUR, 0)])
eb = M.env([(0, 0), (coda - 0.2, 0), (coda + 0.6, 1), (END, 1), (DUR - 0.3, 0), (DUR, 0)])
mono = (0.5 * mar + 0.55 * bass + 0.4 * perc) * e + 0.5 * brass + 0.5 * box * eb
music = stereo(mono, 0.08 * mar * e + 0.06 * box * eb)

# --- foley ---
def swish(t, d=0.55, a=0.05):
    x = M.band(rng.standard_normal(int(d * SR)), 400, 5000)
    tt = np.arange(len(x)) / SR
    g(x * np.sin(np.pi * tt / d) ** 2 / np.abs(x).max(), t, a)
def snort(t, a=0.07):
    d = 0.32; tt = np.arange(int(d * SR)) / SR
    x = M.band(rng.standard_normal(len(tt)), 150, 1100) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 26 * tt))) * np.sin(np.pi * tt / d)
    g(x / np.abs(x).max(), t, a)
def clink(t, a=0.04):
    g(M.tone((2630, 3970, 5210), 0.35, 14), t, a)
def thunk(t, a=0.08):
    g(M.band(M.burst(0.12, 40, 3), 90, 900), t, a); g(M.tone((150, 220), 0.15, 25), t, a * 0.6)
def puff(t, a=0.03):
    g(M.band(M.burst(0.4, 9, 4), 200, 2500), t, a)

for s in SW:
    swish(s - 0.6, 0.55, 0.05); thunk(s - 0.1, 0.05); swish(s + 0.1, 0.85, 0.045)
swish(0.1, 1.1, 0.05); swish(END - 1.2, 1.2, 0.05)
for t in (0.9, 3.0, AT["s1:Pemicunya"] + 0.3, AT["s1:babi"] - 0.05):
    snort(t, 0.07)
g(M.lib("ping"), AT["s1:babi"] - 0.05, 0.03)
# map: cloth, dashes, question, flags
g(M.band(M.burst(1.0, 3, 4), 700, 5000) * 0.5, K["s2"] + 1.0, 0.04)
for k in ("s2:menarik", "s2:dua", "s2:selat#2"):
    for i in range(10):
        g(wood(0.6), AT[k] + i * 0.11, 0.025)
g(M.lib("pop"), AT["s2:tengah"], 0.04)
for i in range(6):
    g(M.lib("click-soft"), AT["s2:mengklaim"] - 0.1 + i * 0.12, 0.05)
# garden: snorts while rooting, the cork pop, stars
for t in (K["s3"] + 1.2, K["s3"] + 2.8, AT["s3:menembak"] - 0.6):
    snort(t, 0.05)
ts = AT["s3:menembak"] + 0.35
g(M.lib("pop"), ts, 0.09); g(M.thump(0.2), ts, 0.04); puff(ts + 0.02, 0.03); g(M.lib("sparkle"), ts + 0.25, 0.03)
for i in range(4):
    g(M.tone((520,), 0.12, 20), AT["s3:Pemiliknya"] + i * 0.18, 0.02)
# scale: drop on ropes, coins, tip
g(M.lib("whoosh-short"), AT["s4:menawarkan"] - 0.4, 0.04); thunk(AT["s4:menawarkan"] + 0.55, 0.1)
for i in range(2):
    clink(AT["s4:sepuluh"] + i * 0.12)
for i in range(20):
    clink(AT["s4:seratus"] + i * 0.035, 0.03)
thunk(AT["s4:seratus"] + 0.45, 0.08)
g(M.lib("riser"), AT["s4:membesar"] - 1.0, 0.03); g(M.lib("pop"), AT["s4:membesar"] - 0.1, 0.05)
# standoff: Pickett pops up, soldiers spring in, ships slide, guns run out, fuses hiss
g(M.lib("pop"), AT["s5:Kapten"] - 0.1, 0.05)
for i in range(7):
    g(M.lib("click-soft"), AT["s5:enam"] + i * 0.12, 0.04)
for i in range(39):
    g(M.lib("click-soft"), AT["s5:461"] + 0.15 + i * 0.035, 0.02)
for i in range(3):
    g(M.lib("whoosh"), AT["s5:kapal"] - 0.3 + i * 0.35, 0.03)
for i in range(2):
    g(M.lib("whoosh"), AT["s5:lima"] - 0.1 + i * 0.3, 0.03)
for i in range(14):
    thunk(AT["s5:empat"] + i * 0.06, 0.025)
for i in range(10):
    g(M.tone((180, 260), 0.1, 30), AT["s5:tujuh"] + i * 0.05, 0.03)
hiss = M.band(rng.standard_normal(N), 3000, 9000)
he = M.env([(0, 0), (AT["s5:2.140"] - 0.2, 0), (AT["s5:2.140"] + 0.3, 1), (AT["s6:menolak"], 1), (AT["s6:menolak"] + 0.15, 0), (DUR, 0)])
M.fx += np.stack([hiss * he, np.roll(hiss, 300) * he], 1) * 0.006
for i in range(5):
    puff(AT["s6:menolak"] + i * 0.08, 0.025)
water = M.band(rng.standard_normal(N), 120, 900)
we = M.env([(0, 0), (K["s5"], 0), (K["s5"] + 1, 1), (K["s7"] - 0.5, 1), (K["s7"], 0), (DUR, 0)])
M.fx += np.stack([water * we, np.roll(water, 700) * we], 1) * 0.006
g(M.lib("pop"), AT["s6:babi"] - 0.35, 0.05); snort(AT["s6:babi"] - 0.2, 0.05)
# camps: visitors, tags, calendar ticks, Kaiser on wires, gavel, confetti
for i in range(6):
    g(wood(0.5), AT["s7:bersama"] + i * 0.2, 0.03)
g(M.lib("pop"), AT["s7:masing-masing"], 0.04); g(M.lib("pop"), AT["s7:masing-masing"] + 0.25, 0.04)
for i in range(12):
    g(M.lib("click"), AT["s7:selama"] + i * (AT["s7:1872"] - 0.3 - AT["s7:selama"]) / 11, 0.025)
g(M.lib("chime"), AT["s7:1872"], 0.04)
g(M.lib("whoosh-short"), AT["s7:Kaisar"] - 0.5, 0.03); thunk(AT["s7:Kaisar"] + 0.9, 0.06)
thunk(AT["s7:memenangkan"], 0.14); g(M.lib("sparkle"), AT["s7:memenangkan"] + 0.2, 0.04)
# coda
g(M.lib("chime"), K["s8"] + 0.4, 0.04)
g(M.lib("pop"), AT["s8:Menurut"], 0.035)
g(M.lib("chime"), OUT + 0.3, 0.06)
M.finish(music)
print("duration", DUR)
