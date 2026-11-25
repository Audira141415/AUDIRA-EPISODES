"""EP24 sound: a calm drafting-studio pulse in A major (soft plucked arpeggio, low pad, light tick), Himalayan wind
under the opening, and studio foley: flag-cloth flutter, pen scratches as each construction line is drawn, compass
clicks on every labelled point, rubber stamp thumps (16 DES 1962, DITOLAK), a book slide. Run after node build-video.mjs."""
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

# A major: I - V - vi - IV, two bars each
prog = [[45, 57, 61, 64], [40, 56, 59, 64], [42, 57, 61, 66], [38, 57, 62, 66]]
chord = lambda t: prog[int(t / (beat * 8)) % 4]
pad, arp, tick = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 1.5, beat * 8):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 8.4, "tri", 0.3, 1.0), t0, 0.4)
for k, t0 in enumerate(np.arange(beat * 4, END + 0.5, beat / 2)):
    ch = chord(t0)
    f = hz(ch[1 + k % 3] + 12)
    M.lay(arp, M.tone((f, f * 2.0), 0.5, 7), t0, 0.5 if k % 2 == 0 else 0.3)
for t0 in np.arange(beat * 8, END, beat):
    M.lay(tick, M.band(M.burst(0.02, 220, 1), 3000, 9000), t0, 0.5)
pad = M.band(pad, 90, 1800)
for x in (pad, arp, tick):
    x /= max(1e-6, np.abs(x).max())
s6, s7, s8 = K["s6"], K["s7"], K["s8"]
e_all = M.env([(0, 0.0), (0.5, 0.75), (s6 - 0.3, 0.8), (s6, 0.6), (s7, 0.8), (s8, 0.85), (END, 0.95), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.45 * pad + 0.32 * arp + 0.1 * tick) * e_all
music = stereo(mono, 0.07 * arp * e_all + 0.05 * pad * e_all)

def scratch(t, d=0.5, a=0.03):
    """technical pen on paper: band noise with a fast grainy modulation"""
    n = M.band(M.burst(d, 1.2, 1), 2500, 8000)
    n *= 0.6 + 0.4 * np.sign(np.sin(np.arange(len(n)) / SR * 2 * np.pi * 37))
    g(n, t, a)

def click(t, a=0.04):
    g(M.band(M.burst(0.02, 250, 1), 1800, 9000), t, a); g(M.tone((2400,), 0.03, 120), t, a * 0.3)

def thump(t, a=0.16):
    g(M.thump(0.3), t, a); g(M.band(M.burst(0.05, 90, 2), 200, 2500), t, a * 0.5)

def flutter(t, d=2.0, a=0.02):
    n = M.band(M.burst(d, 0.8, 60), 300, 2500)
    n *= 0.5 + 0.5 * np.abs(np.sin(np.arange(len(n)) / SR * 2 * np.pi * 5.5))
    g(n, t, a)

# hook: Himalayan wind, cloth flutter, low hit on "satu"
wind = M.band(rng.standard_normal(N), 120, 900)
wind /= np.abs(wind).max()
we = M.env([(0, 0.0), (0.4, 1.0), (K["s3"], 0.5), (K["s4"], 0.25), (s6, 0.0), (s8 + 4, 0.0), (s8 + 6, 0.5), (DUR - 0.5, 0.4), (DUR, 0)])
M.fx += np.stack([wind * we, np.roll(wind, 1500) * we], 1) * 0.02
flutter(0.2, 3.0, 0.025)
g(M.lib("impact-bass-1"), AT["s1:satu"], 0.045)
# station changes: plotter scan
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.42, 0.03)
# s2: ghost flags sink, two pennons, pentagon, dimensions
g(M.lib("whoosh"), AT["s2:Nepal"], 0.025)
scratch(AT["s2:dua"] - 0.1, 0.7); scratch(AT["s2:panji"] + 0.1, 0.7)
scratch(AT["s2:segi"] - 0.1, 0.9)
for i in range(5):
    click(AT["s2:segi"] + 0.15 * i, 0.03)
scratch(AT["s2:lebih"] - 0.1, 0.8, 0.025); scratch(AT["s2:lebarnya"] - 0.1, 0.8, 0.025)
# s3: callouts, ray counters
for k in ("s3:Merah", "s3:Tepi", "s3:bulan", "s3:matahari"):
    g(M.lib("pop"), AT[k], 0.03)
for i in range(8):
    click(AT["s3:delapan"] + 0.1 * i, 0.028)
for i in range(12):
    click(AT["s3:dua"] + 0.075 * i, 0.026)
# s4: old pennon rises, faces appear
g(M.lib("riser"), AT["s4:panji"] - 0.3, 0.02)
flutter(AT["s4:panji"] + 0.6, 2.0, 0.02)
g(M.lib("click-soft"), AT["s4:Gorkha"], 0.04)
g(M.lib("sparkle"), AT["s4:wajah"] - 0.5, 0.025)
# s5: stamp, name cards, faces erased
thump(AT["s5:1962"], 0.2)
g(M.lib("click"), AT["s5:Raja"], 0.04); g(M.lib("click"), AT["s5:Shankar"], 0.04)
g(M.band(M.burst(1.2, 2, 80), 1500, 6000), AT["s5:dihapus"] - 0.6, 0.03)
# s6: construction drawn line by line (pen) with a compass click per step
t0, t1 = K["s6"] + 0.9, AT["s6:ukurannya"] + 0.6
for i in range(11):
    t = t0 + (t1 - t0) * i / 11
    scratch(t, 0.55, 0.028); click(t + 0.05, 0.03)
g(M.band(M.burst(0.6, 6, 30), 400, 4000), AT["s6:Konstitusi"] - 0.2, 0.05)
g(M.lib("chime"), AT["s6:lampiran"], 0.025)
# s7: dimensions, punch on 1,219
scratch(AT["s7:perbandingan"] - 0.1, 1.0, 0.025)
g(M.lib("whoosh-short"), AT["s7:1,219"] - 0.45, 0.035)
g(M.lib("ping"), AT["s7:1,219"], 0.035)
# s8: DITOLAK stamp, pull-back
thump(AT["s8:ditolak"], 0.18)
g(M.lib("riser"), AT["s8:Menurut"] - 0.5, 0.025)
flutter(AT["s8:Menurut"] + 0.5, 4.0, 0.02)
g(M.lib("chime"), OUT + 0.3, 0.05)
# room tone
room = M.band(rng.standard_normal(N), 150, 1200)
room /= np.abs(room).max()
M.fx += np.stack([room, np.roll(room, 900)], 1) * 0.004
M.finish(music)
print("duration", DUR)
