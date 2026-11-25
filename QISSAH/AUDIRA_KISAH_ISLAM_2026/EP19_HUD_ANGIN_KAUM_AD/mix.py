"""EP19 sound: D Kurd (D Eb F G A Bb C), 64 bpm. Low bowed drones (root + fifth, slowly beating) that change colour per scene,
a breathy ney-like flute for sparse phrases, a soft frame-drum pulse under the dialogue scenes. Wind is the second
instrument: a light breeze, a hook gust that the simulation rewinds (tape-rewind sweep), then in s6 layers build from a low
rumble to a full roar with whistling highs and sand hiss; it drains in s7 to a dry hiss and then near silence. s8 starts in
silence; the drone and one ney phrase return for the sign-off. HUD foley: scan blips on panels, a soft tick per day/night
of the counter, a low rumble as the fortresses rise. Music dips for a voice later via M.finish. Run from this folder."""
import json, sys, os
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(1919)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
KURD = [0, 1, 3, 5, 7, 8, 10]
ROOT = 62  # D4
BEAT = 60 / 64
deg = lambda d, o=0: ROOT + o + KURD[d % 7] + 12 * (d // 7)

GUST, DESTROY, REW = AT["s1:Ternyata"], AT["s1:menghancurkan"], K["s2"]
STORM, BLOW = AT["s6:Ternyata"], AT["s6:berhembus"]
C0, C1 = BLOW, AT["s7:tersisa"] + .4
CALM = AT["s7:Pendengaran"]


def drone(fs, dur, att=2.2):
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for f in fs:
        for h, a in ((1, 1), (2, .45), (3, .22), (4, .12), (5, .06)):
            x += a * (np.sin(2 * np.pi * f * h * t + .4 * np.sin(2 * np.pi * .13 * t)) + .6 * np.sin(2 * np.pi * f * h * 1.0025 * t))
    x /= len(fs) * 2.5
    return x * np.minimum(1, t / att) * np.minimum(1, (dur - t) / 2.0)


def ney(f, dur):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / .5)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    tone = np.sin(ph) + .18 * np.sin(2 * ph) + .06 * np.sin(3 * ph)
    br = M.band(rng.standard_normal(len(t)), f * .8, f * 3.2)
    br /= max(1e-6, np.abs(br).max())
    env = np.minimum(1, t / .18) * np.minimum(1, (dur - t) / .35)
    return (tone * .8 + br * .35) * env


def drum(dur=.5, f=70):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * f * t * (1 + .4 * np.exp(-t * 30))) * np.exp(-t * 9) + .25 * M.burst(dur, 45, 4)


# ---------- drones: one colour per scene
db = M.mono()
CH = {"Dm": [38, 45], "Eb": [39, 46], "Gm": [43, 50], "Bb": [46, 53], "Dlow": [38, 45, 50]}
plan = [(0, "Dm"), (REW, "Dm"), (K["s3"], "Gm"), (K["s4"], "Bb"), (K["s5"], "Eb"), (K["s6"], "Dlow"), (K["s8"] + 1.6, "Bb"), (AT["s8:Kisah"] - .5, "Dm")]
for i, (t0, c) in enumerate(plan):
    t1 = plan[i + 1][0] if i + 1 < len(plan) else DUR
    M.lay(db, drone([mid(n) for n in CH[c]], t1 - t0 + 2.2), max(0, t0 - .6), 1.0)
de = M.env([(0, .7), (REW - .1, .7), (REW + .1, .15), (REW + 1.2, .6), (K["s3"], .65), (K["s5"], .7), (K["s6"], .8), (STORM, .9), (BLOW + 1, .55), (C1, .25),
            (CALM, .12), (K["s8"] - .2, 0), (K["s8"] + 1.6, 0), (K["s8"] + 4, .55), (END, .55), (DUR - .3, 0), (DUR, 0)])
db *= de

# ---------- ney phrases (sparse)
nb = M.mono()


def phrase(t0, notes, o=0, amp=.4):
    t = t0
    for d, ln in notes:
        if d is not None:
            M.lay(nb, ney(mid(deg(d, o)), ln * BEAT + .2), t, amp)
        t += ln * BEAT


phrase(.5, [(4, 2), (3, 1), (2, 1), (1, 2.5), (0, 3)], 0, .32)                     # hook: falling line under the approaching cloud
phrase(REW + 1.4, [(0, 1), (2, 1), (3, 1.5), (4, 2), (5, 1), (4, 1), (3, 3)], 0, .34)  # s2 reveal of Iram
phrase(AT["s4:kebun"] - .4, [(4, 1), (5, 1), (6, 1.5), (7, 3)], 0, .28)               # s4 blessings
phrase(AT["s5:Hud"] - .2, [(2, 1.5), (1, 1), (0, 3.5)], 0, .3)                         # Hud's answer: calm, low
phrase(K["s8"] + 2.2, [(0, 1.5), (1, 1), (2, 1.5), (1, 1), (0, 4)], 0, .3)            # s8 sign-off

# ---------- frame drum pulse under the dialogue scenes (s3-s5), quiet
dr = M.mono()
for a, b, amp in ((K["s3"] + .3, K["s4"] - .3, .3), (K["s4"] + .3, K["s5"] - .3, .26), (K["s5"] + .3, K["s6"] - .4, .34)):
    i, t = 0, a
    while t < b:
        M.lay(dr, drum(.5, 68 if i % 4 == 0 else 92), t, amp * (1 if i % 4 == 0 else .55))
        t += BEAT; i += 1

fin = M.env([(0, 1), (END + .4, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (db * .6 + nb + dr * .8) * fin
music = stereo(music_m, (.2 * nb - .12 * db) * fin)

# ---------- wind (fx): breeze, hook gust, storm layers building to a roar, sand hiss, silence
def bed(lo, hi):
    x = M.band(rng.standard_normal(N), lo, hi)
    return x / np.abs(x).max()


lfo = M.band(rng.standard_normal(N), .05, .9); lfo = .5 + .5 * lfo / np.abs(lfo).max()
lfo2 = M.band(rng.standard_normal(N), .2, 2.5); lfo2 = .5 + .5 * lfo2 / np.abs(lfo2).max()
rumble, mid_w, high_w, hiss = bed(30, 220), bed(200, 900), bed(900, 3200), bed(3000, 9000)
br_e = M.env([(0, .25), (REW, .25), (REW + .4, .12), (K["s3"], .18), (K["s5"], .2), (K["s6"], .3), (DUR, .3)])
gust_e = M.env([(0, 0), (GUST - .3, 0), (DESTROY, .8), (AT["s1:rumah"], 1), (REW - .1, .9), (REW + .35, 0), (K["s6"] + 1, 0), (AT["s6:hujan"], .2), (STORM, .45),
                (BLOW, 1), (C1 - 1, 1), (CALM, .35), (CALM + 2.5, .12), (K["s8"] - .3, 0), (K["s8"] + 2, 0), (DUR, 0)])
roar_e = M.env([(0, 0), (DESTROY - .2, 0), (AT["s1:rumah"], .55), (REW - .1, .5), (REW + .3, 0), (STORM, 0), (BLOW, .8), (BLOW + 2, 1), (C1 - 1.2, 1), (C1 + .6, .2), (CALM, 0), (DUR, 0)])
hiss_e = M.env([(0, 0), (GUST, 0), (DESTROY, .5), (REW - .1, .5), (REW + .3, 0), (STORM, .2), (BLOW, .7), (C1, .8), (CALM, .45), (CALM + 3, .15), (K["s8"] - .3, 0), (DUR, 0)])
quiet = M.env([(0, 1), (K["s8"] - .4, 1), (K["s8"], 0), (K["s8"] + 2.2, 0), (K["s8"] + 4.5, .35), (DUR - .3, 0), (DUR, 0)])
breeze = mid_w * br_e * lfo * .02 + high_w * br_e * lfo2 * .008
wind = (rumble * .07 * roar_e + mid_w * .05 * gust_e * (.5 + .5 * lfo2) + high_w * .03 * gust_e * lfo + hiss * .022 * hiss_e * (.6 + .4 * lfo2))
# a whistling resonance riding on the storm
wh = np.sin(2 * np.pi * np.cumsum(700 + 260 * lfo + 120 * lfo2) / SR) * roar_e * lfo2 * .006
w_all = (breeze * quiet + wind + wh)
M.fx += np.stack([w_all, np.roll(w_all, 1300) * .9 + .1 * w_all], 1)
# s8 calm: very soft air only after the silence
calm = bed(250, 1800) * M.env([(0, 0), (K["s8"] + 2.2, 0), (K["s8"] + 5, .01), (END, .01), (DUR, 0)]) * lfo
M.fx += np.stack([calm, np.roll(calm, 800)], 1)

# ---------- HUD foley and events
def blip(t, f=1760, a=.018):
    g(M.tone((f, f * 1.5), .07, 30), t, a)

for p in ["s2", "s2:Surah", "s3", "s4", "s4:Jawab", "s5", "s5:Hud", "s6", "s6:Ternyata", "s7", "s7:Pendengaran", "s8", "s8:Kisah"]:
    tp = AT.get(p, K.get(p))
    blip(tp - .36, 1500, .016); blip(tp - .22, 2000, .012); g(M.lib("click-soft"), tp - .37, .03)
for p in ["s1:Ternyata", "s2:belum", "s3:benteng-benteng", "s4:anak-anak", "s4:kebun", "s4:mata", "s4:Ini", "s4:kami", "s5:Aku", "s6:mengira", "s6:berhembus", "s6:tujuh", "s7:tersisa", "s7:penglihatan", "s7:hati", "s8:Menurut"]:
    if p in AT:
        blip(AT[p], 2400, .01)
# hook: the cloud, the cheer (soft), then the gust and the destruction preview
g(M.lib("riser"), GUST - 1.6, .03)
g(M.lib("impact-bass-1"), GUST, .12)
g(M.thump(.5), DESTROY + .3, .07)
for x in np.arange(DESTROY, AT["s1:rumah"] + .6, .09):
    g(M.band(M.burst(.08, 50, 1), 120, 1400), x + rng.uniform(0, .05), .02 * rng.uniform(.4, 1))
# rewind: a tape-rewind sweep and glitch as the sim runs backwards
n = int(.7 * SR); tt = np.arange(n) / SR
sweep = np.sin(2 * np.pi * np.cumsum(np.linspace(1800, 200, n)) / SR) * np.sin(np.pi * tt / .7) * (.6 + .4 * np.sign(np.sin(2 * np.pi * 38 * tt)))
g(sweep, REW - .1, .03); g(M.lib("glitch-1"), REW - .05, .04)
# s2 Iram reveal
g(M.lib("whoosh-cinematic"), AT["s2:Iram"] - .6, .035)
# s3 fortresses rise: a low grinding rumble
rb = M.band(rng.standard_normal(int(4 * SR)), 35, 260); rb = rb / np.abs(rb).max() * np.sin(np.pi * np.arange(len(rb)) / len(rb))
g(rb, AT["s3:istana"] - .3, .06)
for i in range(7):
    g(M.thump(.3), AT["s3:istana"] - .3 + (AT["s3:kekal"] - AT["s3:istana"] + .3) * i / 7 * .85 + .9, .035)
# s5 challenge: one drum accent; Hud's answer: lamp chime
g(M.thump(.45), AT["s5:menantang"], .07)
g(M.lib("chime"), AT["s5:Hud"] + .2, .03)
# s6 storm
g(M.lib("riser"), STORM - 1.8, .045)
g(M.lib("impact-bass-1"), STORM, .14)
# counter ticks: one per day/night phase, lower for nights
for i in range(15):
    t = C0 + (C1 - C0) * i / 15
    g(M.tone((660, 990) if i % 2 == 0 else (440, 660), .09, 22), t, .022)
# s7 erosion: dry crumbling
for x in np.arange(K["s7"], AT["s7:tersisa"] + 1, .07):
    g(M.band(M.burst(.05, 90, 1), 500, 5000), x + rng.uniform(0, .05), .012 * rng.uniform(.3, 1))
# sign-off
g(M.lib("chime"), AT["s8:Kisah"] + .1, .03)
g(M.lib("whoosh"), OUT - .2, .03); g(M.lib("ping"), OUT + .3, .03)
M.finish(music)
print("duration", DUR)
