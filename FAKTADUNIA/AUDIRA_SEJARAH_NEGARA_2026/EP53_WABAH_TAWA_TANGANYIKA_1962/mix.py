"""EP53 sound: a gentle storybook bed in F major (soft triangle pad, kalimba-like plucks, a low warm pulse), lake-shore
ambience (soft water lapping, distant birds), a paper swish under every page turn, soft wooden ticks for the
counters, a glassy bell for each bloom of the ripple map. Laughter is never sampled or imitated: only soft rising
shimmer rings where the arcs appear. The music thins out for the symptoms line and the explanation (calm, no
stingers), and warms up for the ending. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1962)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 84

# F - Dm - Bb - C
prog = [[41, 53, 57, 60], [38, 50, 53, 57], [34, 46, 50, 53], [36, 48, 52, 55]]
chord = lambda t: prog[int(t / (beat * 4)) % 4]
pad, pl, sub = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 2, beat * 4):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m + 12), beat * 4.4, "tri", 0.3, 0.4), t0, 0.2)
pat = [0, 2, 1, 3, 2, 1, 3, 2]
for k, t0 in enumerate(np.arange(beat, END + 0.5, beat / 2)):
    if k % 8 in (5, 7):
        continue
    ch = chord(t0)
    f = hz(ch[1 + pat[k % 8] % 3] + 24)
    M.lay(pl, M.note(f, 0.9, "pluck", 4.0), t0, 0.45 if k % 4 == 0 else 0.25)
for t0 in np.arange(0.05, END + 1, beat * 2):
    M.lay(sub, M.note(hz(chord(t0)[0]), beat * 1.6, "sine", 1.8, 0.05), t0, 0.5)
pad = M.band(pad, 120, 3000)
for x in (pad, pl, sub):
    x /= max(1e-6, np.abs(x).max())
e_all = M.env([(0, 0.0), (0.5, 0.75), (K["s2"], 0.65), (K["s4"], 0.6), (AT["s4:menangis"], 0.42), (K["s5"], 0.6),
               (K["s6"], 0.65), (K["s7"], 0.45), (K["s8"], 0.7), (END, 0.85), (DUR - 0.4, 0), (DUR, 0)])
e_pl = M.env([(0, 0.0), (0.5, 1), (AT["s4:menangis"] - 0.3, 1), (AT["s4:menangis"], 0.35), (K["s5"], 1), (K["s7"], 0.4), (K["s8"], 1), (DUR, 1)])
mono = (0.45 * pad + 0.32 * pl * e_pl + 0.22 * sub) * e_all
music = stereo(mono, 0.06 * pl * e_pl * e_all + 0.04 * pad * e_all)


def tick(t, a=0.02):
    g(M.band(M.burst(0.025, 200, 1), 900, 5000), t, a); g(M.tone((1200,), 0.04, 90), t, a * 0.4)


def bell(t, f=1568, a=0.03):
    g(M.tone((f, f * 2.01, f * 2.98), 1.6, 3.2), t, a)


def shimmer(t, a=0.012, f0=900):
    n = int(0.9 * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 0.6 * tt / 0.9)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.9) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt))
    g(s, t, a)


def swish(t, a=0.05):
    n = int(0.75 * SR); tt = np.arange(n) / SR
    s = M.band(rng.standard_normal(n), 900, 7000) * np.sin(np.pi * tt / 0.75) ** 1.5
    g(s / np.abs(s).max(), t, a)


# lake ambience: lapping water + distant birds, dips under the map and the explanation
lap = M.band(rng.standard_normal(N), 120, 900) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.18 * T) ** 2)
for k in range(14):
    t0 = rng.uniform(1, END)
    n = int(0.28 * SR); tt = np.arange(n) / SR
    f = 2600 + 900 * np.sin(np.pi * tt / 0.28) + 300 * np.sin(2 * np.pi * 18 * tt)
    bd = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.28) ** 2
    i0 = int(t0 * SR); lap[i0:i0 + n] += bd[: N - i0] * 0.3
lap *= M.env([(0, 0), (0.5, 0.7), (K["s2"], 0.25), (AT["s2:ada"], 0.8), (K["s6"], 0.3), (K["s7"], 0.7), (DUR - 0.5, 0.6), (DUR, 0)])
lap /= max(1e-6, np.abs(lap).max())
M.fx += np.stack([lap, np.roll(lap, 2200)], 1) * 0.014

# page turns
for a in ("s2:Tanganyika", "s2:ada", "s5:Ketika", "s6:Total", "s7:virus"):
    swish((K["s7"] if a == "s7:virus" else AT[a]) - 0.3, 0.045)
# hook: arcs appear one by one (soft shimmers), title chip
for i in range(6):
    shimmer(0.3 + i * 0.55, 0.008, 800 + 90 * i)
g(M.lib("pop"), AT["s1:empat"], 0.025)
# map
for a in ("s2:Tanganyika", "s2:merdeka"):
    tick(AT[a], 0.02)
g(M.lib("pop"), AT["s2:Kashasha"], 0.03)
# classroom: first three, then spreading
for i in range(3):
    shimmer(AT["s3:tiga"] + i * 0.2, 0.012, 900 + 120 * i)
for i in range(8):
    shimmer(AT["s3:menular"] + i * 0.35, 0.007, 850 + 60 * i)
for i in range(14):
    tick(AT["s3:Dalam"] + i * 0.16, 0.012)
# symptoms: calm, a single soft tick per icon
for a in ("s4:menangis", "s4:gelisah", "s4:pingsan", "s4:sesak"):
    tick(AT[a], 0.016)
g(M.lib("chime"), AT["s4:guru"], 0.02)
# school closed stamp (soft), walk home, village
g(M.thump(0.25), AT["s5:ditutup"], 0.05)
for i in range(10):
    tick(AT["s5:pulang"] + i * 0.28, 0.006)  # footsteps on the path
for i in range(6):
    shimmer(AT["s5:Nshamba"] + i * 0.3, 0.007, 820 + 70 * i)
for i in range(8):
    tick(AT["s5:Nshamba"] + i * 0.16, 0.011)
for i in range(6):
    tick(AT["s5:Ketika"] + i * 0.3, 0.01)
# totals: one pin tick per school
for i in range(13):
    tick(AT["s6:empat"] + i * (AT["s6:ditutup"] - AT["s6:empat"]) / 13, 0.014)
# ripple-map blooms
notes = [1397, 1568, 1760, 2093, 2349]
for i, a in enumerate(("s3:tiga", "s3:menular", "s5:desa", "s6:seribu", "s6:ditutup")):
    bell(AT[a] + 0.05, notes[i], 0.028)
# explanation: soft "no" taps, then calm
for a in ("s7:virus", "s7:racun"):
    tick(AT[a], 0.02)
g(M.lib("sparkle"), AT["s7:penyakit"], 0.015)
for a in ("s7:aturan", "s7:adat"):
    g(M.lib("click-soft"), AT[a], 0.03)
# ending
g(M.lib("whoosh-cinematic"), K["s8"] + 0.2, 0.02)
bell(AT["s8:beres"], 1046, 0.03)
g(M.lib("chime"), AT["s8:Menurut"], 0.025)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
