"""EP16 sound: a restrained documentary pulse in D minor (soft low pulse, sustained pad, sparse piano-like notes),
plus archive-desk foley: paper shuffles under each sliding sheet, typewriter ticks on the letter and telegram,
highlighter squeaks, stamp thumps, a thread pull. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1965)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 72

# D minor: i - VI - III - VII, two bars each (4/4)
prog = [[38, 50, 53, 57], [34, 50, 53, 58], [41, 48, 53, 57], [36, 48, 52, 55]]
chord = lambda t: prog[int(t / (beat * 8)) % 4]

pulse, pad, keys = M.mono(), M.mono(), M.mono()
for k, t0 in enumerate(np.arange(0.05, END + 1.5, beat)):
    ch = chord(t0)
    M.lay(pulse, M.note(hz(ch[0]), beat * 0.9, "tri", 5, 0.01), t0, 1.0 if k % 2 == 0 else 0.55)
for t0 in np.arange(0.05, END + 1.5, beat * 8):
    for m in chord(t0)[1:]:
        M.lay(pad, M.note(hz(m), beat * 8.4, "saw", 0.25, 1.2), t0, 0.35)
mel = [62, 65, 69, 67, 65, 64, 62, 60]
for k, t0 in enumerate(np.arange(beat * 8, END, beat * 2)):
    if k % 4 == 3:
        continue
    f = hz(mel[k % len(mel)] + 12)
    M.lay(keys, M.tone((f, f * 2.01, f * 3.02), 1.6, 3.5), t0, 0.6)
pad = M.band(pad, 120, 2200)
for x in (pulse, pad, keys):
    x /= max(1e-6, np.abs(x).max())
c6, c7, s8 = AT["s6:Tapi"], AT["s7:28"], AT["s8:Sampai"]
e_all = M.env([(0, 0.0), (0.6, 0.8), (c6 - 0.4, 0.8), (c6, 0.55), (c7, 0.75), (s8, 0.9), (END, 0.95), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.45 * pulse + 0.3 * pad + 0.22 * keys) * e_all
music = stereo(mono, 0.06 * keys * e_all + 0.05 * pad * e_all)

# --- foley ---
def shuffle(t, a=0.06):
    """paper slide: band-limited noise swell, then a soft flap"""
    n = M.band(M.burst(0.5, 4, 40), 900, 7000)
    g(n, t, a); g(M.band(M.burst(0.08, 50, 4), 400, 3000), t + 0.45, a * 0.8)

def tick(t, a=0.05):
    g(M.band(M.burst(0.025, 200, 1), 1500, 9000), t, a); g(M.tone((180,), 0.04, 80), t, a * 0.6)

def squeak(t, d=1.0, a=0.03):
    g(M.band(M.burst(d, 1.5, 60), 2500, 6000), t, a)

def stampthump(t, a=0.16):
    g(M.thump(0.3), t, a); g(M.band(M.burst(0.05, 90, 2), 200, 2500), t, a * 0.5)

for k in ("s2:Indonesia", "s3:Pertengahan", "s4:Dalam", "s5:Presiden", "s6:Tapi", "s7:28", "s7:delegasi"):
    shuffle(AT[k] - 0.5)
# hook: placard lifts with a low hit
g(M.lib("impact-bass-1"), 0.05, 0.045)
g(M.lib("whoosh-short"), AT["s1:keluar"] - 0.1, 0.04)
stampthump(AT["s1:Indonesia"], 0.1)
# register highlight + counter
squeak(AT["s2:keenam"] - 0.25, 1.1)
g(M.lib("click-soft"), AT["s2:September"], 0.05)
# map + Security Council card
shuffle(AT["s3:terpilih"] - 0.2, 0.04)
stampthump(AT["s3:berkonfrontasi"], 0.07)
# letter: typewriter ticks across the letter beat, clause highlight
for i, t0 in enumerate(np.arange(AT["s4:Dalam"] + 0.3, AT["s4:Januari"] + 0.6, 0.11)):
    tick(t0 + rng.uniform(0, 0.03), 0.035 + 0.015 * (i % 3 == 0))
g(M.lib("ping"), AT["s4:Januari"] + 0.7, 0.025)
for i in range(3):
    squeak(AT["s4:memutuskan"] - 0.05 + i * 0.55, 0.55, 0.03)
stampthump(AT["s4:keluar"], 0.14)
# CONEFO: marker ring + name card
squeak(AT["s5:CONEFO"] - 0.1, 0.8, 0.03)
g(M.lib("click"), AT["s5:Sukarno"], 0.04)
# telegram: name card, stamp, typed message
g(M.lib("click"), AT["s6:Soeharto"], 0.04)
stampthump(AT["s6:19"], 0.2)
t0, t1 = AT["s6:menyatakan"], AT["s6:penuh"] + 0.4
for t in np.arange(t0, t1, 0.075):
    tick(t + rng.uniform(0, 0.02), 0.04)
g(M.lib("chime"), t1 + 0.1, 0.03)
# calendars: thread pull + 16 TAHUN
g(M.band(M.burst(1.2, 2, 80), 3000, 9000), AT["s7:tepat"], 0.025)
stampthump(AT["s7:enam"], 0.12)
# placard back down, stamps
stampthump(AT["s7:duduk"] + 0.5, 0.1)
stampthump(AT["s7:bukan"], 0.12); stampthump(AT["s7:penghentian"], 0.14)
# payoff: crane up, thread links the exhibits
g(M.lib("riser"), s8 - 0.6, 0.03)
g(M.band(M.burst(4.0, 0.6, 120), 2500, 8000), s8 + 0.6, 0.02)
g(M.lib("pop"), AT["s8:Menurut"], 0.035)
g(M.lib("chime"), OUT + 0.3, 0.05)
# room tone
room = M.band(rng.standard_normal(N), 150, 1200)
room /= np.abs(room).max()
M.fx += np.stack([room, np.roll(room, 900)], 1) * 0.004
M.finish(music)
print("duration", DUR)
