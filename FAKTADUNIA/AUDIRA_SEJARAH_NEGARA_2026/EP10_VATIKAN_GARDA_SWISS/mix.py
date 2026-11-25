"""EP10 sound: a small Renaissance consort. Lute-like plucked arpeggios in D dorian under a recorder tune;
fife-and-snare march for the 1505-06 walk and the oath; low bowed strings and a drone for 6 May 1527.
Foley: paper folds, card flips, marching feet, bells, crackling fire, halberd clanks. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1506)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
c1, c2, c3, c4 = AT["s2:Kisahnya"], AT["s4:Ujian"], AT["s6:Hingga"], AT["s8:Lima"]
m0, m1 = AT["s3:prajurit"] - 0.6, AT["s3:tiba"] + 0.3
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 0.6
bar = beat * 4

# D dorian progression (i - VII - i - IV), darker in 1527 (i - VI - VII - i in aeolian)
dor = [[50, 57, 62, 65], [48, 55, 60, 64], [50, 57, 62, 65], [43, 55, 59, 62]]
aeo = [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [50, 57, 62, 65]]
chords = lambda t: aeo if c2 <= t < c3 else dor

# lute: plucked arpeggio, eight notes a bar
lute = M.mono()
for k, t0 in enumerate(np.arange(0.05, END + 1, beat / 2)):
    ch = chords(t0)[int(t0 / bar) % 4]
    m = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12, ch[1] + 12, ch[3] + 12, ch[2] + 12][k % 8]
    if c2 <= t0 < c3 and k % 2:
        continue
    M.lay(lute, M.note(hz(m), 1.1, "pluck", 3.4, 0.003), t0, 0.55 if k % 8 == 0 else 0.36)
lute = M.band(lute, 120, 5000)
lute /= np.abs(lute).max()

# recorder: breathy sine with vibrato on a dorian tune, rests during 1527
tune = [74, 76, 77, 79, 77, 76, 74, 72, 74, 69, 72, 74, 76, 74, 72, 69]
rec = M.mono()
for k, t0 in enumerate(np.arange(bar * 0.5, END, beat)):
    if c2 - 0.3 < t0 < c3 or k % 8 == 7:
        continue
    d = beat * 0.95
    tt = np.arange(int(d * SR)) / SR
    f = hz(tune[k % len(tune)]) * (1 + 0.005 * np.sin(2 * np.pi * 5.5 * tt) * np.minimum(1, tt / 0.25))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
    x = x * np.minimum(1, tt / 0.04) * np.minimum(1, (d - tt) / 0.08) + 0.04 * rng.standard_normal(len(tt)) * np.exp(-tt * 10)
    M.lay(rec, x, t0, 0.5)
rec /= np.abs(rec).max()

# low strings + drone for 1527
strings = M.mono()
for t0 in np.arange(c2 - 0.4, c3 + 0.5, bar):
    ch = aeo[int((t0 - c2) / bar) % 4]
    d = bar + 0.7
    tt = np.arange(int(d * SR)) / SR
    env = np.minimum(1, tt / 0.6) * np.minimum(1, (d - tt) / 0.6)
    x = np.zeros(len(tt))
    for v, m in enumerate(ch[:3]):
        f = hz(m - 12) * (1 + 0.003 * np.sin(2 * np.pi * 4.8 * tt + v))
        ph2 = 2 * np.pi * np.cumsum(f) / SR
        x += sum(np.sin(h * ph2 + v) / h ** 1.2 for h in range(1, 8))
    M.lay(strings, x * env, t0, 1.0)
strings = M.band(strings, 40, 1800)
strings /= max(1e-6, np.abs(strings).max())

# fife + snare march windows: the walk to Rome and the oath
def snare_hit(a):
    x = M.band(M.burst(0.16, 28, 1), 1500, 9000)
    b = M.tone((185, 330), 0.08, 40)
    x[: len(b)] += 0.3 * b
    return x * a

march = M.mono()
for w0, w1 in ((AT["s3:150"] - 0.2, m1 + 1.2), (AT["s6:disumpah"] - 0.6, AT["s6:Syaratnya"] + 1.0)):
    for k, t0 in enumerate(np.arange(w0, w1, beat / 2)):
        a = 0.9 if k % 4 == 0 else 0.45 if k % 2 == 0 else 0.3
        M.lay(march, snare_hit(a), t0)
        if k % 8 == 6:
            M.lay(march, snare_hit(0.25), t0 + beat / 4)
    for k, t0 in enumerate(np.arange(w0, w1, beat / 2)):
        m = [81, 83, 84, 86, 84, 83, 81, 79][k % 8]
        tt = np.arange(int(beat / 2 * 0.9 * SR)) / SR
        x = (np.sin(2 * np.pi * hz(m) * tt) + 0.3 * np.sin(4 * np.pi * hz(m) * tt)) * np.minimum(1, tt / 0.01) * np.exp(-tt * 3)
        M.lay(march, x, t0, 0.16)
march /= max(1e-6, np.abs(march).max())

e_lute = M.env([(0, 0.7), (c1, 0.8), (c2 - 0.3, 0.8), (c2 + 0.4, 0.45), (c3, 0.45), (c3 + 0.5, 0.8), (c4, 0.95), (END, 0.9), (DUR - 0.4, 0), (DUR, 0)])
e_rec = M.env([(0, 0.0), (1.5, 0.7), (c2 - 0.3, 0.7), (c2, 0), (c3 + 0.3, 0), (c3 + 1.2, 0.65), (c4, 0.8), (END, 0.8), (DUR - 0.4, 0), (DUR, 0)])
e_str = M.env([(0, 0), (c2 - 0.5, 0), (c2 + 0.5, 1), (AT["s5:gugur"], 1.15), (c3 - 0.2, 0.9), (c3 + 0.6, 0), (DUR, 0)])
music = stereo(0.42 * lute * e_lute + 0.32 * rec * e_rec + 0.55 * strings * e_str + 0.38 * march, 0.1 * lute * e_lute + 0.08 * rec * e_rec)

# --- foley ---
def paper(t, a=0.07, d=0.32):
    x = M.band(M.burst(d, 9, 4), 600, 7000)
    x *= np.sin(np.linspace(0, np.pi, len(x))) ** 2
    g(x, t, a)

def clank(t, a=0.08):
    g(M.tone((1250, 1980, 3170), 0.5, 12), t, a * 0.7); g(M.band(M.burst(0.05, 80, 2), 1500, 9000), t, a)

def step(t, a=0.03):
    g(M.band(M.burst(0.06, 70, 3), 150, 1600), t, a)

def bell(t, f=392, a=0.07):
    g(M.tone((f, f * 2.0, f * 2.76, f * 5.4), 3.5, 1.1), t, a)

# paper fold transitions: fold shut, unfold
for c in (c1, c2, c3, c4):
    paper(c - 0.34, 0.11, 0.3); g(M.thump(0.25), c - 0.04, 0.12); paper(c + 0.08, 0.09, 0.42)
# panel card flips
for k in ("s2", "s3", "s5", "s7"):
    paper(K[k] - 0.15, 0.05, 0.22)
for a in ("s3:150", "s5:Sisanya", "s6:Syaratnya", "s7:dibuat"):
    paper(AT[a] - 0.15, 0.05, 0.22)
# hook: army flats slap up, platoon pops, halberd clank
for i in range(3):
    paper(AT["s1:dunia"] - 1.0 + i * 0.22, 0.06, 0.25)
    g(M.thump(0.3), AT["s1:dunia"] - 0.1 + i * 0.22, 0.08)
clank(AT["s1:135"], 0.07); clank(AT["s1:Swiss"], 0.08)
g(M.lib("pop"), AT["s1:semuanya"], 0.04)
for i in range(3):
    paper(AT["s2:Garda"] - 0.2 + i * 0.12, 0.05, 0.3)
# Vatican bells
bell(AT["s2:Vatikan"], 392, 0.06); bell(AT["s2:Vatikan"] + 0.9, 294, 0.05)
# map: pins, marching feet
g(M.lib("pop"), c1 + 0.25, 0.04); g(M.lib("pop"), AT["s3:Swiss"] - 0.25, 0.04)
for t0 in np.arange(m0, m1, 0.15):
    step(t0 + rng.uniform(0, 0.04), 0.025)
bell(AT["s3:tiba"] + 0.3, 440, 0.05)
g(M.lib("impact-bass-1"), AT["s3:22"], 0.05)
# 1527: fire crackle bed, invaders' feet, the fall
fire = M.mono()
for t0 in np.arange(AT["s4:Penjarahan"] - 0.3, c3, 0.02):
    if rng.random() < 0.35:
        M.lay(fire, M.band(M.burst(0.015, 300, 1), 1500, 9000), t0, 0.5 + rng.random())
roar = M.band(rng.standard_normal(N), 60, 500)
roar /= np.abs(roar).max()
fe = M.env([(0, 0), (AT["s4:Penjarahan"] - 0.4, 0), (AT["s4:Penjarahan"] + 1.2, 1), (c3 - 0.3, 0.8), (c3, 0), (DUR, 0)])
M.fx += np.stack([fire * fe * 0.06 + roar * fe * 0.03, np.roll(fire, 400) * fe * 0.06 + roar * fe * 0.03], 1)
g(M.lib("whoosh-cinematic"), AT["s4:Penjarahan"] - 0.4, 0.05)
for t0 in np.arange(AT["s4:Pasukan"] - 0.3, AT["s4:Pasukan"] + 4.5, 0.12):
    step(t0, 0.035)
g(M.lib("impact-bass-1"), AT["s4:menyerbu"], 0.12); g(M.thump(0.6), AT["s4:menyerbu"], 0.25)
g(M.thump(0.5), AT["s5:147"], 0.2)
for k in range(30):
    paper(AT["s5:gugur"] + 0.05 + k * 0.047, 0.018, 0.12)
bell(AT["s5:gugur"] + 0.9, 196, 0.07)
# escape: feet on stone, then the corridor
for t0 in np.arange(AT["s5:Sisanya"], c3, 0.11):
    step(t0, 0.022)
# oath: halberd stamp, bells
clank(AT["s6:disumpah"], 0.1); g(M.thump(0.4), AT["s6:disumpah"], 0.15)
bell(AT["s6:enam"], 392, 0.05)
for a in ("s6:pria", "s6:Katolik", "s6:berkewarganegaraan", "s6:lajang", "s6:19", "s6:174", "s6:latihan"):
    paper(AT[a] - 0.05, 0.04, 0.18); g(M.lib("click-soft"), AT[a], 0.03)
paper(AT["s6:tinggi"] - 0.5, 0.07, 0.6)
g(M.tone((660, 990), 0.5, 6), AT["s6:174"] + 0.9, 0.04)
# uniform: swatches, sketch drops, the X, the myth stamp, the pattern sheet
for a in ("s7:biru", "s7:merah", "s7:kuning"):
    paper(AT[a] - 0.15, 0.06, 0.25)
paper(AT["s7:Michelangelo"] - 0.9, 0.07, 0.6)
g(M.thump(0.35), AT["s7:Faktanya"], 0.22); g(M.lib("impact-bass-1"), AT["s7:Faktanya"], 0.06)
paper(AT["s7:Jules"] - 0.4, 0.08, 0.6)
g(M.lib("chime"), AT["s7:1914"], 0.04)
# outro
bell(c4 + 0.2, 392, 0.05); bell(c4 + 1.1, 294, 0.045)
g(M.lib("pop"), AT["s8:kenapa"], 0.035)
g(M.lib("chime"), OUT + 0.3, 0.06)
# lamp-lit room tone
room = M.band(rng.standard_normal(N), 150, 1400)
room /= np.abs(room).max()
M.fx += np.stack([room, np.roll(room, 900)], 1) * 0.005
M.finish(music)
print("duration", DUR)
