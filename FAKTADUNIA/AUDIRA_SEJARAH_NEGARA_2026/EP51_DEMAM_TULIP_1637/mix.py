"""EP51 sound: a baroque-meets-terminal bed in A minor (harpsichord-like plucks over a soft string pad and a ticking
sub pulse) that speeds up with the bubble and drops out at the crash; terminal ticks for each candle, coin clinks at
the peak, tavern murmur + paper flutters in s4, three gavel knocks and a falling tone at the Haarlem auction, a muted
crash on "total", a paper-page turn for the 1841 book, a calm resolve in s8. One soft order-ticket click per device
token. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1637)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 84

# A minor: i - VI - III - VII (Andalusian-flavoured, baroque arpeggios)
prog = [[45, 57, 60, 64], [41, 53, 57, 60], [48, 55, 60, 64], [43, 55, 59, 62]]
chord = lambda t: prog[int(t / (beat * 4)) % 4]
pad, hps, sub = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 2, beat * 4):
    for m in chord(t0)[1:]:
        M.lay(pad, M.note(hz(m), beat * 4.3, "saw", 0.4, 0.4), t0, 0.18)
crash0, crash1 = AT["s6:pembeli"], AT["s6:total"] + 0.8
for k, t0 in enumerate(np.arange(beat, END + 0.5, beat / 2)):
    if crash0 < t0 < crash1 or (AT["s1:runtuh"] - 0.2 < t0 < K["s2"]):
        continue  # the market stops: arpeggio drops out
    ch = chord(t0)
    f = hz(ch[1 + k % 3] + 12 * (k % 2))
    M.lay(hps, M.note(f, 0.7, "pluck", 4.0), t0, 0.45 if k % 4 == 0 else 0.28)
for t0 in np.arange(0.05, END + 1, beat):
    M.lay(sub, M.note(hz(chord(t0)[0] - 12), beat * 0.6, "sine", 3.0, 0.02), t0, 0.5)
pad = M.band(pad, 80, 1600)
for x in (pad, hps, sub):
    x /= max(1e-6, np.abs(x).max())
e_all = M.env([(0, 0.0), (0.3, 0.8), (AT["s1:runtuh"] - 0.2, 0.85), (AT["s1:runtuh"] + 0.2, 0.3), (K["s2"], 0.6), (K["s4"], 0.7),
               (AT["s5:gulden"], 0.95), (crash0 - 0.2, 0.9), (crash0 + 0.3, 0.3), (crash1, 0.35), (K["s7"], 0.55), (K["s8"], 0.7),
               (END, 0.8), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.45 * pad + 0.4 * hps + 0.22 * sub) * e_all
music = stereo(mono, 0.06 * hps * e_all + 0.04 * pad * e_all)


def tick(t, a=0.02):
    g(M.band(M.burst(0.015, 300, 1), 2000, 9000), t, a); g(M.tone((2400,), 0.02, 160), t, a * 0.3)


def clink(t, a=0.03):
    g(M.tone((3100, 4650, 6200), 0.35, 9), t, a)


def knock(t, a=0.1):
    g(M.thump(0.22), t, a); g(M.band(M.burst(0.05, 80, 1), 600, 4000), t, a * 0.5)


def flutter(t, a=0.015):
    n = int(0.35 * SR); s = M.band(rng.standard_normal(n), 1500, 7000) * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * np.arange(n) / SR)) * np.sin(np.pi * np.arange(n) / n)
    g(s, t, a)


# s1 hook: ticks as candles climb, coins, then a hard drop on "runtuh"
a, b = 0.25, AT["s1:tukang"]
for i in range(20):
    tick(a + (b - a) * i / 20, 0.018)
clink(AT["s1:mahal"], 0.03)
g(M.lib("riser"), AT["s1:runtuh"] - 1.4, 0.02)
g(M.lib("impact-bass-1"), AT["s1:runtuh"], 0.08); g(M.lib("glitch-1"), AT["s1:runtuh"] + 0.02, 0.02)
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.3, 0.022)
# s2 route map: soft pings on the cities
for k in ("s2:Dan", "s2:tulip", "s2:Utsmani"):
    g(M.lib("ping"), AT[k], 0.012)
# s3 virus: small glassy sparkles
g(M.lib("sparkle"), AT["s3:bergaris"], 0.018); g(M.lib("glitch-2"), AT["s3:virus"], 0.012)
# s4 tavern: murmur bed + paper flutters, candle ticks
mur_a, mur_b = AT["s4:berdagang"] - 0.5, K["s5"]
n = int((mur_b - mur_a) * SR)
mur = M.band(rng.standard_normal(n), 250, 1100) * (0.6 + 0.4 * np.sin(2 * np.pi * 3.1 * np.arange(n) / SR) * np.sin(2 * np.pi * 0.7 * np.arange(n) / SR))
mur *= np.minimum(1, np.arange(n) / (0.6 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.6 * SR))
g(mur / np.abs(mur).max(), mur_a, 0.012)
for i in range(8):
    flutter(AT["s4:berdagang"] + 0.3 + i * 0.7)
for i in range(6):
    flutter(AT["s4:berpindah"] - 0.2 + i * 0.35, 0.018)
g(M.lib("click-soft"), AT["s4:kontrak"], 0.03)
for i in range(8):
    tick(AT["s4:1634"] - 0.4 + i * 0.3, 0.014)
# s5 climb to the peak: accelerating ticks, coin shower on "gulden", 10x stamp
a, b = AT["s5:Puncaknya"], AT["s5:gulden"]
for i in range(14):
    tick(a + (b - a) * (1 - (1 - i / 14) ** 1.6), 0.016)
for i in range(7):
    clink(AT["s5:gulden"] + i * 0.07, 0.022)
g(M.lib("chime"), AT["s5:gulden"], 0.02)
g(M.lib("pop"), AT["s5:sepuluh#2"], 0.025)
# s6 Haarlem auction: gavel knocks, falling tone on each price step, crash on "total"
for k in ("s6:pembeli", "s6:diturunkan", "s6:lagi", "s6:lagi#2", "s6:mau"):
    knock(AT[k], 0.09)
for i, k in enumerate(("s6:diturunkan", "s6:lagi", "s6:lagi#2")):
    f0 = 660 / (1.25 ** i); nn = int(0.45 * SR); tt = np.arange(nn) / SR
    g(np.sin(2 * np.pi * np.cumsum(f0 * (1 - 0.35 * tt / 0.45)) / SR) * np.exp(-tt * 5), AT[k] + 0.1, 0.02)
g(M.lib("error"), AT["s6:pembeli"] + 0.15, 0.015)
g(M.thump(0.6), AT["s6:total"], 0.14); g(M.lib("impact-bass-1"), AT["s6:total"], 0.06)
# s7 book page turn + stamp
flutter(AT["s7:buku"], 0.03)
g(M.thump(0.25), AT["s7:membantah"], 0.07); g(M.band(M.burst(0.06, 90, 1), 1500, 6000), AT["s7:membantah"], 0.04)
# device tokens: soft ticket click
for k in ("s2:tulip", "s3:virus", "s4:kontrak", "s5:gulden", "s6:pembeli", "s8:mania"):
    g(M.lib("click"), AT[k] + 0.02, 0.02)
g(M.lib("sparkle"), AT["s8:mania"], 0.02)
g(M.lib("chime"), AT["s8:Menurut"], 0.022)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
