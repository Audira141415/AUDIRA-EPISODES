"""EP44 sound: a stadium-to-war bed in A minor (warm Latin-tinged nylon pluck ostinato over a low pad, soft brush-snare
tick), a distant crowd murmur under the pitch that thins as the board becomes a map, a referee whistle on the hook,
puck clicks, a match strike + flame flick, LED scoreboard blips on each score, a crowd roar that turns into riot noise,
the diplomatic link snapping, propeller drones for the raid and dogfight, a long whistle for the ceasefire, and three
heavy can thuds for TANAH, KEMISKINAN, MIGRASI. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1969)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 96

# A minor: i - VI - VII - V, two bars each
prog = [[45, 57, 60, 64], [41, 57, 60, 65], [43, 55, 59, 62], [40, 56, 59, 64]]
chord = lambda t: prog[int(t / (beat * 8)) % 4]
pad, pl, tick = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 1.5, beat * 8):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 8.4, "tri", 0.3, 1.0), t0, 0.35)
pattern = [0, 2, 1, 2, 3, 2, 1, 2]
for k, t0 in enumerate(np.arange(beat * 4, END + 0.5, beat / 2)):
    ch = chord(t0)
    f = hz(ch[1 + pattern[k % 8] % 3] + 12)
    M.lay(pl, M.tone((f, f * 2.01, f * 3.0), 0.5, 7), t0, 0.5 if k % 4 == 0 else 0.3)
for k, t0 in enumerate(np.arange(beat * 8, END, beat / 2)):
    M.lay(tick, M.band(M.burst(0.05, 60, 2), 3000, 9000), t0, 0.5 if k % 2 else 0.22)
pad = M.band(pad, 70, 1600)
for x in (pad, pl, tick):
    x /= max(1e-6, np.abs(x).max())
s4, s6, s7, s8 = K["s4"], K["s6"], K["s7"], K["s8"]
e_all = M.env([(0, 0.0), (0.4, 0.8), (s4 - 0.3, 0.8), (s4, 0.9), (s6, 1.0), (s7, 0.75), (s8, 0.85), (END, 0.95), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.46 * pad + 0.32 * pl + 0.1 * tick) * e_all
music = stereo(mono, 0.06 * pl * e_all + 0.05 * pad * e_all)


def click(t, a=0.04):
    g(M.band(M.burst(0.02, 250, 1), 1500, 9000), t, a); g(M.tone((1900,), 0.03, 120), t, a * 0.3)


def whistle(t, dur=0.5, a=0.03):
    x = M.tone((2950, 3010), dur, 1.5)
    x *= 0.75 + 0.25 * np.sin(2 * np.pi * 34 * np.arange(len(x)) / SR)
    g(x, t, a)


def blip(t, a=0.03):
    g(M.tone((1320,), 0.06, 30), t, a); g(M.tone((1760,), 0.06, 30), t + 0.07, a)


def prop(t, dur, a=0.05):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = M.band(rng.standard_normal(n), 80, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 38 * tt))
    x *= np.minimum(1, np.minimum(tt / 0.6, (dur - tt) / 0.8)); x /= max(1e-6, np.abs(x).max())
    g(x, t, a)


def crowd(t, dur, a, lo=250, hi=2600):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = M.band(rng.standard_normal(n), lo, hi); x /= max(1e-6, np.abs(x).max())
    x *= np.minimum(1, np.minimum(tt / 0.4, (dur - tt) / 0.9))
    g(x, t, a)


# stadium murmur under the pitch, thins as the map takes over
crowd(0.0, AT["s2:Amerika"] + 1.0, 0.018)

# s1 hook
whistle(0.15, 0.55, 0.03)
for i in range(6):
    click(-0.1 + i * 0.1 if i else 0.02, 0.03)
for k in ("s1:Tiga", "s1:pertandingan", "s1:bola"):
    blip(AT[k] + 0.05)
g(M.lib("whoosh-cinematic"), AT["s1:berperang"] - 0.5, 0.03); g(M.lib("impact-bass-1"), AT["s1:berperang"] - 0.2, 0.05)
g(M.band(M.burst(0.18, 25, 2), 1500, 9000), AT["s1:korek"], 0.05)  # match strike
g(M.band(M.burst(0.6, 4, 6), 200, 2500), AT["s1:apinya"], 0.025)   # flame
# station changes
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.35, 0.03)
# s2 reveal + map
g(M.lib("riser"), AT["s2:Amerika"] - 1.0, 0.02); g(M.lib("sparkle"), AT["s2:Amerika"], 0.025)
for i in range(5):
    g(M.lib("pop"), AT["s2:lima"] - 0.2 + i * 0.22, 0.025)
for i in range(10):
    click(AT["s2:tiga"] - 0.3 + i * 0.24, 0.022)
# s3 plots flip, pawns pushed
for i in range(8):
    click(AT["s3:diambil"] - 0.1 + i * 0.11, 0.03)
g(M.lib("whoosh"), AT["s3:terusir"] - 0.6, 0.03)
g(M.tone((110, 165), 1.6, 1.2), AT["s3:Ketegangan"], 0.03)
# s4 matches, roar, riot
blip(AT["s4:satu"]); crowd(AT["s4:satu"] - 0.2, 1.4, 0.03)
blip(AT["s4:tiga"]); crowd(AT["s4:tiga"] - 0.2, 1.4, 0.03)
crowd(AT["s4:Kerusuhan"] - 0.1, 2.0, 0.04, 150, 1800)
g(M.thump(0.3), AT["s4:Kerusuhan"], 0.1); g(M.lib("glitch-1"), AT["s4:Kerusuhan"] + 0.1, 0.02)
# s5 decider, extra time, link snaps
whistle(AT["s5:Meksiko"] - 0.2, 0.35, 0.02)
blip(AT["s5:dua"]); crowd(AT["s5:dua"], 1.6, 0.03)
whistle(AT["s5:waktu"] if "s5:waktu" in AT else AT["s5:dua"] + 1.4, 0.9, 0.02)
g(M.lib("glitch-2"), AT["s5:diplomatik"] + 0.1, 0.04); g(M.thump(0.25), AT["s5:diplomatik"] + 0.1, 0.12)
# s6 raid, strikes, troops, dogfight
prop(AT["s6:pesawat"] - 0.4, 3.0, 0.05)
for d in (0.1, 0.35):
    g(M.lib("impact-bass-1"), AT["s6:bandara"] + d, 0.045)
for i in range(8):
    g(M.thump(0.16), AT["s6:pasukan"] + i * 0.2, 0.05)
prop(AT["s6:Ini"] - 0.4, K["s7"] - AT["s6:Ini"] + 0.8, 0.045)
# s7 counter, ceasefire whistle, refugees, civil war pulse
for i in range(10):
    blip(K["s7"] + 0.1 + i * (AT["s7:seratus"] - K["s7"]) / 10, 0.012)
whistle(AT["s7:gencatan"], 1.3, 0.025)
g(M.lib("chime"), AT["s7:gencatan"] + 0.2, 0.025)
g(M.lib("whoosh-cinematic"), AT["s7:Puluhan"] - 0.3, 0.025)
for i in range(3):
    g(M.tone((98, 147), 0.7, 3), AT["s7:memicu"] + i * 0.6, 0.035)
# s8 peace, ball returns, fuel cans
g(M.lib("chime"), AT["s8:Perjanjian"], 0.03)
g(M.band(M.burst(0.18, 25, 2), 1500, 9000), AT["s8:pemicu"] + 0.1, 0.045)
for k in ("s8:tanah", "s8:kemiskinan", "s8:migrasi"):
    g(M.thump(0.3), AT[k] - 0.15, 0.13); g(M.tone((240, 360), 0.4, 9), AT[k] - 0.12, 0.02)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
