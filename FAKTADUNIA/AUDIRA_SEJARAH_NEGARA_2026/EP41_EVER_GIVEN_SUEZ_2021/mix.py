"""EP41 sound: a toy-box bed in D phrygian dominant (plucked oud-like notes, soft pad, frame-drum taps) over desert wind
and water lapping. Ship horn on the hook, a tiny excavator clank loop, pen ticks on the route map, a sandstorm swell
in s3-s4 with a hull crunch at "kandas", far horns down the queue, a water-drop "bloop" on every ripple token, a synth
baa, the dredger pump hum, ballast-jet hiss, tug horns and a chime at "lepas". Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2021)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 96

# D phrygian dominant: D Eb F# G A Bb C
SC = [50, 51, 54, 55, 57, 58, 60]
prog = [[38, 50, 54, 57], [39, 51, 55, 58], [38, 50, 54, 57], [36, 48, 51, 55]]
chord = lambda t: prog[int(t / (beat * 4)) % 4]
pad, plk, drm = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 1.5, beat * 4):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 4.2, "tri", 0.5, 0.9), t0, 0.3)
mel = [0, 2, 3, 4, 3, 2, 1, 0, 4, 5, 4, 3, 2, 3, 1, 0]
for k, t0 in enumerate(np.arange(beat * 2, END + 0.5, beat / 2)):
    if k % 8 in (3, 7):
        continue
    f = hz(SC[mel[k % 16]] + 12)
    M.lay(plk, M.note(f, 0.5, "pluck", 5.5), t0, 0.55 if k % 4 == 0 else 0.33)
for k, t0 in enumerate(np.arange(beat * 4, END, beat / 2)):
    if k % 4 == 0:
        M.lay(drm, M.thump(0.25), t0, 0.5)
    elif k % 4 == 3:
        M.lay(drm, M.band(M.burst(0.07, 50, 2), 600, 4000), t0, 0.35)
pad = M.band(pad, 80, 1800)
for x in (pad, plk, drm):
    x /= max(1e-6, np.abs(x).max())
e_all = M.env([(0, 0.0), (0.4, 0.8), (K["s3"], 0.8), (AT["s3:Badai"], 0.55), (K["s5"], 0.75), (K["s6"], 0.95), (K["s7"], 0.85), (END, 0.95), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.38 * pad + 0.4 * plk + 0.16 * drm) * e_all
music = stereo(mono, 0.07 * plk * e_all + 0.04 * pad * e_all)


def click(t, a=0.04):
    g(M.band(M.burst(0.02, 250, 1), 1500, 9000), t, a)


def horn(t, a=0.05, f=110, d=1.4):
    tt = np.arange(int(d * SR)) / SR
    s = sum(np.sin(2 * np.pi * f * h * tt) / h for h in range(1, 7))
    s *= np.minimum(1, tt / 0.08) * np.minimum(1, (d - tt) / 0.3)
    g(M.band(s / np.abs(s).max(), 60, 2500), t, a)


def bloop(t, a=0.04, f0=500):
    n = int(0.22 * SR); tt = np.arange(n) / SR
    f = f0 + 900 * tt / 0.22
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 14)
    g(s, t, a)


def baa(t, a=0.025):
    n = int(0.6 * SR); tt = np.arange(n) / SR
    f = 380 * (1 + 0.05 * np.sin(2 * np.pi * 7 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)) * np.sin(np.pi * tt / 0.6) * (0.7 + 0.3 * np.sin(2 * np.pi * 9 * tt))
    g(M.band(s / np.abs(s).max(), 200, 3000), t, a)


def hum(t0, t1, a=0.02, f=62):
    tt = np.arange(int((t1 - t0) * SR)) / SR
    s = np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * 2 * f * tt)
    s *= 0.8 + 0.2 * np.sin(2 * np.pi * 3 * tt)
    s *= np.minimum(1, np.minimum(tt / 0.4, (tt[-1] - tt) / 0.4))
    g(s / np.abs(s).max(), t0, a)


# desert wind + water lapping bed; the storm swells it
wind = M.band(rng.standard_normal(N), 200, 2200)
wind /= np.abs(wind).max()
storm = M.env([(0, 0.25), (AT["s3:Badai"] - 0.5, 0.25), (AT["s3:Badai"] + 1.0, 1.0), (AT["s4:kandas"] + 0.5, 1.0), (AT["s4:Haluannya"] + 1.0, 0.25), (DUR - 0.5, 0.2), (DUR, 0)])
wind *= storm * (0.8 + 0.2 * np.sin(2 * np.pi * 0.23 * T))
lap = M.band(rng.standard_normal(N), 300, 1400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.6 * T) ** 2)
lap /= np.abs(lap).max()
bed = 0.03 * wind + 0.008 * lap
M.fx += np.stack([bed, np.roll(bed, 1800)], 1)

# s1 hook: horn, excavator clanks, title stamp
horn(0.05, 0.05, 98, 1.8)
for i in range(int(K["s2"] / 0.65)):
    click(0.3 + i * 0.65, 0.03); g(M.band(M.burst(0.08, 40, 3), 200, 1500), 0.3 + i * 0.65 + 0.03, 0.03)
g(M.lib("impact-bass-1"), AT["s1:enam"], 0.05); g(M.lib("pop"), AT["s1:enam"], 0.03)
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.3, 0.03)
# s2 route map: pen ticks, Suez ping
for i in range(14):
    click(K["s2"] + 0.2 + i * 0.2, 0.02)
g(M.lib("ping"), AT["s2:Terusan"], 0.03); g(M.lib("pop"), AT["s2:dua"], 0.03)
g(M.lib("click"), AT["s2:hanya"], 0.04)
# s3
horn(AT["s3:Ever"] - 0.2, 0.04, 92, 1.6)
for i in range(4):
    g(M.lib("pop"), AT["s3:empat#2"] - 0.5 + i * 0.18, 0.025)
g(M.lib("riser"), AT["s3:Badai"] - 0.8, 0.02); g(M.lib("whoosh-cinematic"), AT["s3:Badai"], 0.035)
# s4 sail + crunch
g(M.lib("whoosh"), AT["s4:menangkap"], 0.04)
cr = AT["s4:kandas"] + 0.4
g(M.thump(0.5), cr, 0.12); g(M.band(M.burst(0.7, 6, 5), 80, 1200), cr, 0.08); g(M.lib("impact-bass-1"), cr, 0.06)
g(M.lib("pop"), AT["s4:Haluannya"], 0.03); g(M.lib("pop"), AT["s4:buritannya"], 0.03)
# ripple tokens
for k in ("s4:angin", "s4:kandas", "s5:menunggu", "s6:cip", "s6:domba", "s6:kurcaci"):
    bloop(AT[k], 0.04)
# s5 queue horns far away
for i, t0 in enumerate(np.linspace(AT["s5:antrean"], AT["s5:menunggu"] + 1.5, 7)):
    horn(t0, 0.015 - i * 0.0015, 88 + (i % 3) * 9, 1.0)
for i in range(18):
    click(AT["s5:tiga"] + i * 0.08, 0.015)
g(M.lib("chime"), AT["s5:Barang"] + 0.6, 0.02)
# s6 props
g(M.lib("sparkle"), AT["s6:cip"] + 0.15, 0.02)
baa(AT["s6:domba"] + 0.3); baa(AT["s6:domba"] + 1.0, 0.018)
g(M.lib("pop"), AT["s6:kurcaci"] + 0.15, 0.035)
# s7 rescue
hum(AT["s7:keruk"] - 0.3, AT["s7:ekskavator"], 0.03)
g(M.band(rng.standard_normal(int(2.2 * SR)), 2000, 9000) * np.hanning(int(2.2 * SR)), AT["s7:air"], 0.03)
for i in range(6):
    click(AT["s7:ekskavator"] + i * 0.4, 0.035)
for i in range(5):
    horn(AT["s7:empat"] + i * 0.35, 0.02, 180 + i * 12, 0.5)
g(M.lib("riser"), AT["s7:menarik"] - 0.6, 0.025)
g(M.lib("chime"), AT["s7:lepas"], 0.05); g(M.lib("sparkle"), AT["s7:lepas"] + 0.1, 0.03)
# s8
g(M.lib("impact-bass-1"), AT["s8:seratus"], 0.03)
for i in range(12):
    click(AT["s8:lima"] - 0.2 + i * 0.06, 0.015)
for k, d in (("s8:Satu", 0), ("s8:satu", 0), ("s8:satu#2", 0)):
    bloop(AT[k], 0.04, 420)
horn(AT["s8:satu#2"] + 1.0, 0.03, 98, 1.6)
g(M.lib("sparkle"), AT["s8:Menurut"], 0.02)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
