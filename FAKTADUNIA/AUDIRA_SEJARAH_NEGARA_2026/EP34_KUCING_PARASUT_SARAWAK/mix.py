"""EP34 sound: a bouncy toon bed in F major (marimba-like plucks, soft pad, shaker), jungle birds under the village,
a propeller drone when the transport passes, parachute pops, crate thuds, a mosquito whine and spray hiss in s3,
synth meows, rat squeaks in the paddy, a click on every chain link, stamps on MITOS / BELUM TERBUKTI.
Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1960)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 104

# F major: I - vi - IV - V
prog = [[41, 53, 57, 60], [38, 50, 53, 57], [46, 50, 53, 58], [48, 52, 55, 60]]
chord = lambda t: prog[int(t / (beat * 4)) % 4]
pad, mar, shk = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 1.5, beat * 4):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 4.2, "tri", 0.4, 0.8), t0, 0.3)
pat = [0, 2, 1, 3, 2, 1, 3, 2]
for k, t0 in enumerate(np.arange(beat * 2, END + 0.5, beat / 2)):
    ch = chord(t0)
    if k % 8 in (3, 7) and k % 16 != 15:
        continue
    f = hz(ch[1 + pat[k % 8] % 3] + 12)
    M.lay(mar, M.tone((f, f * 4.0), 0.3, 14), t0, 0.55 if k % 4 == 0 else 0.32)
for k, t0 in enumerate(np.arange(beat * 4, END, beat / 2)):
    M.lay(shk, M.band(M.burst(0.05, 70, 1), 4000, 11000), t0, 0.5 if k % 2 else 0.25)
pad = M.band(pad, 80, 1800)
for x in (pad, mar, shk):
    x /= max(1e-6, np.abs(x).max())
e_all = M.env([(0, 0.0), (0.3, 0.85), (K["s4"] - 0.3, 0.85), (K["s4"], 0.6), (K["s5"], 0.75), (K["s6"], 0.95), (K["s7"], 0.85), (END, 0.95), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.4 * pad + 0.36 * mar + 0.08 * shk) * e_all
music = stereo(mono, 0.06 * mar * e_all + 0.04 * pad * e_all)


def click(t, a=0.04):
    g(M.band(M.burst(0.02, 250, 1), 1500, 9000), t, a); g(M.tone((2200,), 0.03, 120), t, a * 0.3)


def meow(t, a=0.03, f0=620):
    n = int(0.42 * SR); tt = np.arange(n) / SR
    f = f0 * (1 + 0.45 * np.sin(np.pi * tt / 0.42)) * (1 - 0.15 * tt / 0.42)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * np.sin(np.pi * tt / 0.42) ** 0.6
    g(s / np.abs(s).max(), t, a)


def squeak(t, a=0.015):
    n = int(0.09 * SR); tt = np.arange(n) / SR
    f = 3200 + 1600 * tt / 0.09
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.09)
    g(s, t, a)


def thud(t, a=0.1):
    g(M.thump(0.3), t, a); g(M.band(M.burst(0.2, 25, 3), 150, 1500), t, a * 0.5)


def drone(t0, t1, a=0.03):
    tt = np.arange(int((t1 - t0) * SR)) / SR
    s = np.sin(2 * np.pi * 92 * tt) + 0.6 * np.sin(2 * np.pi * 184 * tt) + 0.3 * np.sin(2 * np.pi * 47 * tt)
    s *= 0.7 + 0.3 * np.sin(2 * np.pi * 17 * tt)
    s *= np.sin(np.pi * tt / tt[-1]) ** 1.2
    g(M.band(s / np.abs(s).max(), 40, 900), t0, a)


# jungle birds and insects under the village scenes
amb = M.band(rng.standard_normal(N), 2500, 7000) * 0.15
for k in range(int(DUR * 0.8)):
    t0 = rng.uniform(0.3, END)
    f = rng.uniform(1800, 3200)
    tw = M.tone((f, f * 1.5), 0.12, 25)
    i0 = int(t0 * SR); amb[i0:i0 + len(tw)] += tw[: len(amb) - i0] * 0.5
in_map = [(K["s2"] - 0.1, K["s3"] - 0.1), (K["s6"] - 0.1, AT["s6:dimasukkan"] - 0.1)]
emask = np.ones(N)
for a, b in in_map:
    emask[int(a * SR):int(b * SR)] = 0.1
emask = np.convolve(emask, np.ones(4000) / 4000, mode="same")
amb *= emask * M.env([(0, 0), (0.5, 1), (DUR - 0.5, 0.8), (DUR, 0)])
amb /= max(1e-6, np.abs(amb).max())
M.fx += np.stack([amb, np.roll(amb, 2100)], 1) * 0.012

# s1 hook: plane passes, chutes flutter, crate lands
drone(0.0, K["s2"], 0.035)
g(M.lib("whoosh-cinematic"), 0.05, 0.03)
meow(AT["s1:kucing"], 0.03)
land = AT["s1:lelucon"] - 0.15
thud(land, 0.12); g(M.lib("pop"), land + 0.05, 0.03)
g(M.lib("impact-bass-1"), AT["s1:lelucon"] - 0.15, 0.05)
for k in ("s1:1960", "s1:Angkatan", "s1:lelucon"):
    g(M.lib("pop"), AT[k], 0.035)
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.3, 0.03)
# s2 map
g(M.lib("pop"), AT["s2:Sarawak"], 0.04); g(M.lib("sparkle"), AT["s2:Sarawak"] + 0.1, 0.02)
for i in range(8):
    click(AT["s2:berbatasan"] - 0.1 + i * 0.13, 0.025)
# s3 mosquito whine + spray hiss
tt = np.arange(int((K["s4"] - K["s3"]) * SR)) / SR
wh = np.sin(2 * np.pi * (620 + 40 * np.sin(2 * np.pi * 7 * tt)) * tt) * np.clip(1 - np.maximum(0, tt - (AT["s3:membasmi"] + 1.0 - K["s3"])) / 1.2, 0, 1)
g(M.band(wh, 400, 3000), K["s3"], 0.012)
hiss = M.band(rng.standard_normal(int(4.5 * SR)), 3000, 12000) * np.sin(np.pi * np.arange(int(4.5 * SR)) / int(4.5 * SR)) ** 0.3
for k in range(3):
    g(hiss[: int(1.2 * SR)], AT["s3:DDT"] + k * 1.5, 0.03)
# chain links
for k in ("s3:DDT", "s4:serangga", "s4:cicak", "s4:kucing", "s5:tikus", "s6:parasut"):
    click(AT[k], 0.05); g(M.lib("pop"), AT[k] + 0.02, 0.025)
# s4
g(M.tone((330, 247), 0.6, 3), AT["s4:mati"], 0.03)
g(M.lib("impact-bass-1"), AT["s4:belum"], 0.035); g(M.lib("error"), AT["s4:belum"] + 0.1, 0.02)
meow(AT["s4:menjilati"] + 0.1, 0.02, 700)
# s5 rats
for i in range(18):
    squeak(AT["s5:tikus"] - 0.3 + i * 0.22 + 0.05 * np.sin(i * 3), 0.012)
g(M.band(M.burst(0.6, 6, 4), 300, 3000), AT["s5:merusak"], 0.05)
# s6 route + drop
g(M.lib("riser"), AT["s6:Operation"] - 0.6, 0.02); g(M.lib("impact-bass-1"), AT["s6:Operation"], 0.04)
g(M.lib("whoosh"), AT["s6:diterbangkan"], 0.03)
drone(AT["s6:dimasukkan"] - 0.2, K["s7"] - 0.1, 0.035)
for i in range(6):
    g(M.lib("whoosh-short"), AT["s6:dijatuhkan"] + i * 0.35, 0.02)
    g(M.band(M.burst(0.18, 18, 2), 200, 4000), AT["s6:parasut"] - 0.1 + i * 0.3, 0.05)
# s7 myth vs fact
g(M.lib("riser"), AT["s7:empat"] - 0.5, 0.02)
g(M.lib("glitch-2"), AT["s7:mitos"], 0.03); g(M.lib("impact-bass-1"), AT["s7:mitos"], 0.05)
for i in range(23):
    g(M.lib("pop"), AT["s7:dua"] - 0.2 + i * 0.016, 0.008)
g(M.lib("chime"), AT["s7:berhasil"], 0.035)
for i in range(6):
    squeak(AT["s7:Operasinya"] + i * 0.12, 0.012)
meow(AT["s7:Operasinya"] + 0.2, 0.025, 560)
# s8 recap
for k in ("s8:Semprot", "s8:nyamuk", "s8:mati", "s8:datang", "s8:terjun"):
    click(AT[k], 0.04)
drone(AT["s8:kucing#2"] - 1.5, AT["s8:kucing#2"] + 4, 0.025)
for i in range(6):
    click(AT["s8:seluruh"] + i * 0.09, 0.035)
g(M.lib("sparkle"), AT["s8:Menurut"], 0.02)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
