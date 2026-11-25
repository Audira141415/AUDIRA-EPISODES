"""EP43 sound: a gentle paper-studio bed in D major (felt piano plucks, warm pad, soft brush shaker), cabin wind and
a jet engine drone in the sky scenes, paper rustle on every paper-sheet wipe, calculator clicks, a drip in the tank,
the fuel-pressure alarm and the "bong" when both engines die, then silence of the glide (wind only, music thins),
gear thunk, the nose scrape and a crowd-free relief chime. A paper flick on every ripple card.
Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1983)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 96

# D major: I - V - vi - IV
prog = [[38, 50, 54, 57], [45, 49, 52, 57], [47, 50, 54, 59], [43, 50, 55, 59]]
chord = lambda t: prog[int(t / (beat * 4)) % 4]
pad, pno, shk = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 1.5, beat * 4):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 4.3, "tri", 0.35, 0.9), t0, 0.3)
arp = [1, 2, 3, 2, 1, 3, 2, 3]
for k, t0 in enumerate(np.arange(beat * 2, END + 0.5, beat / 2)):
    if k % 8 == 7:
        continue
    ch = chord(t0)
    M.lay(pno, M.note(hz(ch[arp[k % 8]] + 12), 0.9, "pluck", 3.2), t0, 0.5 if k % 4 == 0 else 0.3)
for k, t0 in enumerate(np.arange(beat * 4, END, beat / 2)):
    M.lay(shk, M.band(M.burst(0.07, 50, 1), 3000, 9000), t0, 0.35 if k % 2 else 0.18)
pad = M.band(pad, 70, 1600)
for x in (pad, pno, shk):
    x /= max(1e-6, np.abs(x).max())
glide0, glide1 = AT["s5:Enam"], AT["s6:Gimli"]
e_all = M.env([(0, 0.0), (0.4, 0.8), (K["s5"] - 0.2, 0.85), (AT["s5:alarm"], 0.45), (glide0, 0.35), (glide1, 0.6), (K["s7"], 0.75),
               (AT["s7:Tidak"], 0.95), (END, 0.95), (DUR - 0.4, 0), (DUR, 0)])
e_beat = M.env([(0, 1), (AT["s5:alarm"], 1), (AT["s5:alarm"] + 0.5, 0.15), (glide1, 0.2), (AT["s7:Tidak"], 1), (DUR, 1)])
mono = (0.42 * pad + 0.36 * pno * e_beat + 0.07 * shk * e_beat) * e_all
music = stereo(mono, 0.05 * pno * e_all + 0.04 * pad * e_all)


def click(t, a=0.04):
    g(M.band(M.burst(0.02, 250, 1), 1500, 9000), t, a)


def rustle(t, a=0.05, dur=0.6):
    x = M.band(M.burst(dur, 4, 2), 1200, 9000) * (0.6 + 0.4 * rng.random(int(dur * SR)) ** 4)
    x *= np.sin(np.pi * np.arange(len(x)) / len(x)) ** 0.6
    g(x / np.abs(x).max(), t, a)


def flick(t, a=0.04):
    g(M.band(M.burst(0.06, 70, 1), 2500, 10000), t, a); g(M.tone((1400, 2100), 0.05, 60), t, a * 0.3)


def bed(t0, t1, lo, hi, a, seed_mod=1.0):
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    x = M.band(rng.standard_normal(n), lo, hi)
    x *= np.minimum(1, np.minimum(np.arange(n) / (0.4 * SR), (n - np.arange(n)) / (0.4 * SR)))
    g(x / np.abs(x).max(), t0, a)


def engine(t0, t1, a, die=None):
    tt = np.arange(int((t1 - t0) * SR)) / SR
    f = 110 * np.ones_like(tt)
    amp = np.ones_like(tt)
    if die is not None:
        d = np.clip((tt - (die - t0)) / 1.6, 0, 1)
        f = 110 * (1 - 0.6 * d); amp = 1 - d
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3.01 * ph)) * amp
    s += 0.6 * M.band(rng.standard_normal(len(tt)), 300, 3000) * amp
    s *= np.minimum(1, np.minimum(tt / 0.5, (tt[-1] - tt) / 0.5))
    g(s / np.abs(s).max(), t0, a)


# sky 1: wind + engines, the gauge needle falls
sky1 = (0.0, K["s2"])
bed(*sky1, 200, 2500, 0.02)
engine(*sky1, 0.022)
g(M.lib("whoosh-cinematic"), 0.05, 0.03)
g(M.tone((660, 520), 0.5, 4), AT["s1:kehabisan"] + 0.4, 0.025)
for k in ("s1:kilometer", "s1:angka", "s1:salah"):
    g(M.lib("pop"), AT[k], 0.035)
g(M.lib("impact-bass-1"), AT["s1:salah"], 0.045)
# paper-sheet wipes on every cut
for c in (K["s2"], K["s3"], K["s5"], AT["s8:Satu"]):
    rustle(c - 0.35, 0.06, 0.8)
for k in ("s4", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.3, 0.025)
# map: pins, dashes
for k in ("s2:1983", "s2:Kanada", "s2:Air"):
    g(M.lib("pop"), AT[k], 0.03)
for i in range(10):
    click(AT["s2:1983"] + i * 0.4, 0.015)
# bench: broken gauge rattle, dripstick, drip, calculator
for i in range(5):
    click(AT["s3:rusak"] + i * 0.07, 0.03)
g(M.lib("error"), AT["s3:rusak"] + 0.05, 0.02)
g(M.band(M.burst(0.5, 6, 3), 200, 1500), AT["s3:tongkat"], 0.04)
for i in range(3):
    g(M.tone((1200, 1800), 0.12, 30), AT["s3:celup"] + 0.2 + i * 0.35, 0.02)
for i, k in enumerate(("s3:liter", "s3:satu", "s3:koma", "s3:tujuh", "s3:tujuh#2")):
    g(M.lib("click-soft"), AT[k], 0.04)
g(M.lib("typing"), AT["s3:tujuh#2"] + 0.1, 0.02)
g(M.lib("impact-bass-1"), AT["s3:pon"], 0.045); g(M.lib("pop"), AT["s3:pon"] + 0.5, 0.03)
# tank fills (bubbly glug), computer pops up and says OK
for i in range(8):
    g(M.tone((180 + 30 * i, 260 + 30 * i), 0.18, 18), AT["s4:membawa"] + i * 0.18, 0.02)
g(M.lib("chime"), AT["s4:percaya"], 0.025)
g(M.lib("click"), AT["s4:Komputer"], 0.03)
# sky 2: engines, alarm, bong, engines die, then only wind
e0 = K["s5"]
engine(e0, AT["s5:kiri"] + 2.0, 0.02, die=AT["s5:kiri"])
engine(e0, AT["s5:kanan"] + 2.0, 0.02, die=AT["s5:kanan"])
bed(e0, K["s7"] + 2, 300, 2200, 0.025)
for i in range(int((K["s6"] - AT["s5:alarm"]) / 0.5)):
    t0 = AT["s5:alarm"] + i * 0.5
    g(M.tone((880,), 0.22, 2) if i % 2 == 0 else M.tone((660,), 0.22, 2), t0, 0.014 * max(0.0, 1 - i / 18))
bong = M.tone((392, 196, 98), 2.2, 1.6)
g(bong, AT["s5:kanan"] + 0.1, 0.05)
g(M.lib("glitch-1"), AT["s5:Layar"], 0.02)
for k in ("s5:alarm", "s5:kiri", "s5:Enam"):
    g(M.lib("pop"), AT[k], 0.03)
# glide: soft paper creases (fold), gear down
for i in range(10):
    flick(AT["s6:layang"] - 0.5 + i * 0.13, 0.025)
g(M.lib("sparkle"), AT["s6:melayangkan"], 0.02)
g(M.thump(0.3), AT["s6:sirkuit"] - 0.6, 0.06)
# race: two engines rev at "lomba"
tt = np.arange(int(2.4 * SR)) / SR
rev = np.sin(2 * np.pi * np.cumsum(140 + 120 * np.clip(tt / 1.6, 0, 1)) / SR) * np.sin(np.pi * tt / tt[-1])
g(M.band(rev + 0.3 * rng.standard_normal(len(tt)), 80, 2000), AT["s6:balap"], 0.02)
# landing: touchdown, gear fold, scrape, stop
g(M.thump(0.35), AT["s7:Roda"] + 0.5, 0.09)
g(M.band(M.burst(0.3, 12, 2), 100, 1800), AT["s7:terkunci"], 0.06)
sc = int((AT["s7:berhenti"] - AT["s7:hidung"]) * SR)
scrape = M.band(rng.standard_normal(sc), 1500, 7000) * (0.7 + 0.3 * np.sin(2 * np.pi * 23 * np.arange(sc) / SR))
scrape *= np.linspace(1, 0.15, sc)
g(scrape / np.abs(scrape).max(), AT["s7:hidung"], 0.05)
g(M.lib("impact-bass-1"), AT["s7:berhenti"], 0.04)
g(M.lib("chime"), AT["s7:Tidak"], 0.04)
# s8
g(M.lib("pop"), AT["s8:Gimli"], 0.04); g(M.lib("sparkle"), AT["s8:Gimli"] + 0.1, 0.02)
g(M.lib("riser"), AT["s8:Satu"] - 0.8, 0.015)
# ripple cards: a paper flick and a soft ping each time the ring goes out
for k in ("s3:koma", "s3:pon", "s4:separuhnya", "s5:kanan", "s6:menit", "s7:berhenti"):
    flick(AT[k], 0.045); g(M.lib("ping"), AT[k] + 0.03, 0.012)
for i in range(6):
    flick(AT["s8:Satu"] + i * 0.09, 0.03)
g(M.lib("sparkle"), AT["s8:Menurut"], 0.02)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
