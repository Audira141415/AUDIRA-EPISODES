"""EP22 sound: light comic jazz. Walking upright-bass line, brushed swing hats and a muted-trumpet-like square lead
in F major at 132 bpm swing; a clock tick under the hook and the record chase. Foley in comic register: page-wipe
whooshes, cartoon punches on the big beats, a ringing alarm bell while the counter rolls, paper flutter, a crack for
the split map, seat pops, footsteps and a door for the mediators, a padlock click, calculator beeps, rubber stamps,
a bell for each record, a crowd cheer and confetti for the swearing-in, coin clinks for the 17 billion.
Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(589)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 132
cuts = [AT[k] for k in ("s2:Ini", "s3:Pemilu", "s4:Negosiasi", "s5:Belgia", "s6:Hari", "s7:Akhirnya", "s7:Kesepakatannya", "s8:Hampir")]

# --- score: F - D7 - Gm7 - C7 turnaround, swung eighths ---
prog = [[41, 57, 60, 64], [38, 54, 57, 60], [43, 58, 62, 65], [36, 52, 55, 58]]
bar = beat * 4
bass, comp, lead, hats = M.mono(), M.mono(), M.mono(), M.mono()
for bi, t0 in enumerate(np.arange(0.0, DUR, bar)):
    ch = prog[bi % 4]
    walk = [ch[0], ch[0] + 4, ch[0] + 7, ch[0] + 9 if bi % 2 else ch[0] + 5]
    for k, m in enumerate(walk):
        M.lay(bass, M.note(hz(m), beat * 0.9, "pluck", 4.0), t0 + k * beat, 0.9)
    for k in (1, 3):  # comp stabs on 2 and 4
        for m in ch[1:]:
            M.lay(comp, M.note(hz(m), 0.18, "tri", 9), t0 + k * beat + 0.01, 0.35)
    for k in range(4):
        sw = beat * 0.66
        M.lay(hats, M.band(M.burst(0.05, 70, 1), 6000, 14000), t0 + k * beat, 0.5)
        M.lay(hats, M.band(M.burst(0.04, 90, 1), 6000, 14000), t0 + k * beat + sw, 0.3)
mel = [72, 74, 76, 79, 77, 76, 74, 72, 70, 72, 74, 77, 76, 74, 72, 69]
for k, t0 in enumerate(np.arange(bar * 2, DUR - 1, beat * 2)):
    if (k // 8) % 2 == 1:
        continue
    M.lay(lead, M.note(hz(mel[k % 16]), beat * 1.5, "square", 3.0, 0.02), t0 + (beat * 0.66 if k % 2 else 0), 0.22)
bass = M.band(bass, 40, 1200); comp = M.band(comp, 150, 3500); lead = M.band(lead, 300, 3200)
for x in (bass, comp, lead, hats):
    x /= max(1e-6, np.abs(x).max())
e = M.env([(0, 0.0), (0.4, 1), (END, 1), (DUR - 0.4, 0), (DUR, 0)])
e_lead = M.env([(0, 0), (AT["s2:Ini"], 0), (AT["s2:Ini"] + 1, 0.8), (AT["s8:Menurut"], 0.8), (AT["s8:Menurut"] + 1, 0.4), (DUR, 0.3)])
mono = (0.5 * bass + 0.28 * comp + 0.22 * hats) * e + 0.3 * lead * e_lead * e
music = stereo(mono, 0.06 * comp * e + 0.05 * hats * e)

# --- foley ---
def tick(t, a=0.04):
    g(M.band(M.burst(0.02, 200, 1), 2500, 9000), t, a)

def punch(t, a=0.18):
    g(M.thump(0.35), t, a); g(M.band(M.burst(0.12, 30, 2), 200, 3000), t, a * 0.5)

def bell(t, d=0.8, a=0.05):
    for k in range(int(d / 0.045)):
        g(M.tone((2100, 3150, 4730), 0.05, 40), t + k * 0.045, a * (1 - k * 0.045 / d))

def ding(t, a=0.06):
    g(M.tone((1568, 2352, 3921), 1.4, 3), t, a)

def step(t, a=0.03):
    g(M.band(M.burst(0.05, 60, 2), 150, 1500), t, a)

def beep(t, f=1800, a=0.04):
    g(M.tone((f,), 0.08), t, a)

def flutter(t, d=0.4, a=0.03):
    x = M.band(rng.standard_normal(int(d * SR)), 1500, 7000); tt = np.arange(len(x)) / SR
    g(x * (0.5 + 0.5 * np.sin(2 * np.pi * 26 * tt)) * np.minimum(1, (d - tt) / 0.1) / np.abs(x).max(), t, a)

for c in cuts:
    g(M.lib("whoosh"), c - 0.45, 0.05); punch(c + 0.02, 0.08)
# hook: clock ticks, counter rolls with bell, pages flutter, punch on 589
for k in np.arange(0.1, AT["s1:selama"], beat):
    tick(k, 0.05)
bell(AT["s1:selama"] - 0.05, AT["s1:hari"] - AT["s1:selama"] + 0.5, 0.035)
for k in range(10):
    flutter(AT["s1:selama"] + k * 0.25, 0.3, 0.02)
for k in np.arange(AT["s1:selama"], AT["s1:hari"], 0.06):
    tick(k, 0.03)
punch(AT["s1:hari"], 0.22); g(M.lib("impact-bass-1"), AT["s1:hari"], 0.05)
g(M.lib("pop"), AT["s1:benar-benar"], 0.05)
# map split
g(M.band(M.burst(0.5, 8, 1), 300, 6000), AT["s2:terbelah"], 0.1); punch(AT["s2:terbelah"], 0.14)
g(M.lib("pop"), AT["s2:Flandria"], 0.05); g(M.lib("pop"), AT["s2:Wallonia"], 0.05)
# parliament: 11 party pops, bars, N-VA
for i in range(11):
    ta = AT["s3:sebelas"] - 0.1 + i * ((AT["s3:parlemen"] - AT["s3:sebelas"] + 0.6) / 11)
    g(M.tone((hz(60 + [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17][i]),), 0.12, 20), ta, 0.05)
g(M.lib("riser"), AT["s3:lebih"] - 0.6, 0.03)
for i in range(11):
    tick(AT["s3:lebih"] - 0.4 + i * 0.07, 0.04)
punch(AT["s3:dua#2"], 0.15); g(M.lib("chime"), AT["s3:dua#2"] + 0.1, 0.04)
# negotiation: BUNTU punch, footsteps and door
punch(AT["s4:buntu"], 0.18)
for i in range(5):
    ts = AT["s4:menunjuk"] - 0.2 + i * 0.62
    for k in range(8):
        step(ts + k * 0.14 + (0.4 if k > 3 else 0), 0.025)
    g(M.band(M.burst(0.2, 20, 3), 200, 2000), ts + 1.9, 0.03)
g(M.lib("pop"), AT["s4:Yves"], 0.04)
g(M.lib("click"), AT["s4:wewenang"] + 0.05, 0.08); punch(AT["s4:wewenang"] + 0.05, 0.06)
# budget: beeps, error buzz, stamps
for k, f in enumerate((1800, 1600, 2000)):
    beep(AT["s5:tidak"] + k * 0.1, f)
g(M.note(110, 0.4, "square", 2) * 0.6, AT["s5:2011"] + 0.4, 0.06)
punch(AT["s5:2011"] + 0.2, 0.1)
for i in range(4):
    kt = AT["s5:diperpanjang"] - 0.1 + i * 0.55
    flutter(kt - 0.35, 0.3, 0.025); beep(kt, 2200, 0.03); punch(kt + 0.15, 0.08)
# records: clock ticks while the token runs, bells on each record
for k in np.arange(AT["s6:Hari"] + 0.3, AT["s7:Akhirnya"] - 0.5, beat):
    tick(k, 0.03)
ding(AT["s6:memecahkan"], 0.07); punch(AT["s6:memecahkan"], 0.12)
flutter(AT["s6:Satu"], 0.5, 0.04)
ding(AT["s6:menyamai"], 0.07); ding(AT["s6:menyamai"] + 0.18, 0.05); punch(AT["s6:menyamai"], 0.12)
# swearing-in: cheer + confetti
cheer = M.band(rng.standard_normal(int(3.0 * SR)), 300, 3500)
tt = np.arange(len(cheer)) / SR
cheer *= np.minimum(1, tt / 0.3) * np.exp(-tt * 0.9) * (0.7 + 0.3 * np.sin(2 * np.pi * 3.3 * tt))
g(cheer / np.abs(cheer).max(), AT["s7:dilantik"], 0.05)
g(M.lib("sparkle"), AT["s7:dilantik"] + 0.1, 0.05); punch(AT["s7:dilantik"], 0.12)
g(M.lib("pop"), AT["s7:lima"], 0.05)
# 17 billion: coin clinks
for i in range(28):
    tc = AT["s7:memindahkan"] + i * ((AT["s7:wilayah"] - AT["s7:memindahkan"] + 0.4) / 28) + 0.7
    g(M.tone((3200 + 300 * (i % 4), 4700, 6100), 0.18, 25), tc, 0.025)
g(M.lib("chime"), AT["s7:tujuh"], 0.04)
# ending
bell(AT["s8:Hampir"] + 0.05, 1.0, 0.03)
g(M.lib("whoosh-cinematic"), AT["s8:Menurut"], 0.05)
g(M.lib("pop"), AT["s8:Menurut"] + 0.1, 0.04)
g(M.lib("chime"), OUT + 0.3, 0.06)
M.finish(music)
print("duration", DUR)
