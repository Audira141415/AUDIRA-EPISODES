"""EP18 sound: a night wind-tunnel lab. A pulsing pluck arpeggio in D dorian at 104 BPM over a warm detuned pad and a
sub pulse; a filtered wind bed that rises when the tunnel runs (s3), carries the streamlines (s5-s6), turns ragged
at the stall and doubles in pitch and level when the speed doubles (s7). SFX: whooshes on cuts, a stamp thump on
"keliru", soft pings on proof words, a turbulence burst + falling tones on "stall", a riser into "empat", gauge clicks
on "dua", a chime on AUDIRA. Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1818)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 104
D3 = 146.83
hz = lambda st, base=D3: base * 2 ** (st / 12)

arp, pad, sub = M.mono(), M.mono(), M.mono()
# chords (dorian): Dm9, Fmaj7, G6, Am7 — two bars each
prog = [[0, 3, 7, 10, 14], [3, 7, 10, 14, 15], [5, 9, 12, 14, 17], [7, 10, 14, 17, 19]]
i, t0 = 0, 0.05
while t0 < END + 1.5:
    ch = prog[(i // 32) % 4]
    st = ch[(i * 3) % len(ch)] + (12 if i % 8 >= 4 else 0)
    M.lay(arp, M.note(hz(st), 0.4, "pluck", dec=7), t0, 0.8 if i % 4 == 0 else 0.5)
    if i % 8 == 0:
        M.lay(sub, M.note(hz(ch[0] - 12), beat * 3.6, "sine", dec=0.6), t0, 1.0)
    t0 += beat / 2
    i += 1
# warm pad: detuned sines per chord, crossfaded every two bars
bar2 = beat * 8
for k in range(int((END + 2) / bar2) + 1):
    ch = prog[k % 4]
    a = k * bar2
    n = int((bar2 + 0.8) * SR)
    tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * hz(s) * tt) + 0.6 * np.sin(2 * np.pi * hz(s) * 1.004 * tt + 1) for s in ch[:4]) / 6
    env = np.minimum(1, tt / 0.6) * np.minimum(1, (n / SR - tt) / 0.6)
    M.lay(pad, x * env, a, 0.7)
# wind bed whose level and brightness follow the tunnel
wind_lo = M.band(M.rng.standard_normal(N), 150, 1400)
wind_hi = M.band(M.rng.standard_normal(N), 900, 5200)
wind_lo /= np.abs(wind_lo).max()
wind_hi /= np.abs(wind_hi).max()
lvl = M.env([(0, 0.12), (K["s3"], 0.15), (AT["s3:Cambridge"], 0.7), (K["s4"], 0.4), (K["s5"], 0.5), (AT["s5:mengikuti"], 0.7),
             (K["s7"], 0.6), (AT["s7:dua"], 0.6), (AT["s7:dua"] + 0.8, 1.0), (K["s8"], 0.5), (END, 0.4), (DUR, 0)])
bright = M.env([(0, 0), (AT["s7:dua"], 0), (AT["s7:dua"] + 0.8, 1), (K["s8"], 0.3), (DUR, 0.2)])
gust = 1 + 0.25 * np.sin(T * 0.9) * np.sin(T * 0.37 + 1)
# ragged turbulence while stalled
stall_env = M.env([(0, 0), (AT["s6:curam"], 0), (AT["s6:terlepas"], 1), (K["s7"] - 0.2, 1), (K["s7"] + 0.4, 0), (DUR, 0)])
chop = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * T + 3 * np.sin(T * 2.3)))
wind = (wind_lo * (1 - 0.5 * bright) + wind_hi * (0.35 + 0.65 * bright)) * lvl * gust * (1 - 0.6 * stall_env * (1 - chop))
for w in ("s1:keliru", "s3:dulu", "s4:serang", "s5:terlempar", "s6:angkat", "s7:empat", "s8:membelokkan"):
    for j, st in enumerate((12, 19, 24)):
        M.lay(arp, M.note(hz(st + 12), 1.2, "sine", dec=3), AT[w] + j * 0.09, 0.45)
for j, st in enumerate((24, 19, 15, 12, 7)):
    M.lay(arp, M.note(hz(st), 1.6, "sine", dec=2.2), AT["s8:AUDIRA"] + j * 0.06, 0.4)
# music thins under the stall, swells on the payoff
e = M.env([(0, 0.85), (K["s2"], 1), (AT["s6:curam"], 1), (AT["s6:stall"], 0.45), (K["s7"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.45 * arp + 0.35 * pad + 0.4 * sub) * e + 0.32 * wind
side = 0.22 * np.roll(arp + pad * 0.6, 900) * e + 0.12 * np.roll(wind, 2200)
music = stereo(mono, side)


# ---- SFX ----
def falling(t, f0=880, f1=220, dur=0.9, a=0.05):
    tt = np.arange(int(dur * SR)) / SR
    f = f0 * (f1 / f0) ** (tt / dur)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.012) / SR)
    g(x * np.exp(-tt * 2.5) * np.minimum(1, tt / 0.01), t, a)


for s in ("s2", "s3", "s5", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
for s in ("s4", "s6", "s7"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
g(M.lib("impact-bass-1"), AT["s1:keliru"], 0.06)
g(M.thump(0.3), AT["s1:keliru"], 0.12)
g(M.lib("pop"), AT["s2:Udara"], 0.05)
g(M.lib("click-soft"), AT["s2:panjang"], 0.06)
g(M.lib("ping"), AT["s2:bersamaan"] + 0.3, 0.04)
g(M.lib("riser"), AT["s3:terowongan"] - 0.4, 0.035)
g(M.lib("ping"), AT["s3:dulu"], 0.05)
g(M.lib("glitch-1"), AT["s3:lomba"], 0.03)
g(M.lib("click"), AT["s4:menengadah"], 0.05)
g(M.lib("click-soft"), AT["s4:Sudut"], 0.05)
g(M.lib("sparkle"), AT["s4:cembung"], 0.035)
g(M.lib("whoosh"), AT["s5:membelokkan"] - 0.1, 0.04)
g(M.lib("whoosh-short"), AT["s5:terlempar"] - 0.1, 0.045)
g(M.lib("pop"), AT["s6:turun"], 0.05)
g(M.lib("pop"), AT["s6:naik"], 0.05)
g(M.lib("impact-bass-1"), AT["s6:angkat"], 0.05)
g(M.lib("click"), AT["s6:mendorong"], 0.05)
g(M.lib("click"), AT["s6:mendorong#2"], 0.05)
g(M.lib("glitch-2"), AT["s6:terlepas"], 0.035)
falling(AT["s6:anjlok"], 900, 180, 1.0, 0.045)
g(M.lib("error"), AT["s6:stall"], 0.04)
g(M.thump(0.35), AT["s6:stall"], 0.1)
g(M.lib("typing"), AT["s7:FAA"] - 0.2, 0.025)
for j in range(3):
    g(M.lib("click-soft"), AT["s7:dua"] + j * 0.12, 0.05)
g(M.lib("riser"), AT["s7:empat"] - 1.2, 0.04)
g(M.lib("impact-bass-1"), AT["s7:empat"], 0.055)
g(M.lib("chime"), AT["s7:sama"], 0.035)
g(M.lib("whoosh"), AT["s8:membelokkan"] - 0.1, 0.04)
g(M.lib("chime"), AT["s8:AUDIRA"], 0.05)
g(M.lib("click-soft"), AT["s8:Episode"], 0.05)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
