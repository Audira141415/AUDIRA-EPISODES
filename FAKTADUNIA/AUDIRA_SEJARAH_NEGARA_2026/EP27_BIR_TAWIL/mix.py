"""EP27 sound: a spare desert measuring-studio bed in D Phrygian-ish minor (low drone, soft plucked ostinato,
light tick), desert wind under the plot shots, ruler clicks as rulers grow, a marker-pen hiss as the 1899 and 1902
lines draw, map taps for pins, a balance creak and thud when Halaib lands, flag cloth flutter and three soft thumps
as the invented flags topple. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2060)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 78

# D minor with a flat second colour: i - bII - i - VII, two bars each
prog = [[38, 50, 53, 57], [39, 51, 55, 58], [38, 50, 53, 57], [36, 48, 52, 55]]
chord = lambda t: prog[int(t / (beat * 8)) % 4]
pad, arp, tick = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 1.5, beat * 8):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 8.4, "tri", 0.25, 1.2), t0, 0.4)
for k, t0 in enumerate(np.arange(beat * 4, END + 0.5, beat / 2)):
    ch = chord(t0)
    if k % 4 == 3:
        continue
    f = hz(ch[1 + k % 3] + 12)
    M.lay(arp, M.note(f, 0.6, "pluck", 5.5), t0, 0.55 if k % 2 == 0 else 0.32)
for t0 in np.arange(beat * 8, END, beat):
    M.lay(tick, M.band(M.burst(0.02, 220, 1), 3000, 9000), t0, 0.45)
pad = M.band(pad, 70, 1600)
for x in (pad, arp, tick):
    x /= max(1e-6, np.abs(x).max())
s3, s6, s7, s8 = K["s3"], K["s6"], K["s7"], K["s8"]
e_all = M.env([(0, 0.0), (0.6, 0.7), (s3, 0.75), (s6, 0.85), (s7, 0.7), (s8, 0.85), (END, 0.95), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.5 * pad + 0.3 * arp + 0.1 * tick) * e_all
music = stereo(mono, 0.07 * arp * e_all + 0.05 * pad * e_all)


def click(t, a=0.035):
    g(M.band(M.burst(0.02, 250, 1), 1800, 9000), t, a); g(M.tone((2600,), 0.03, 120), t, a * 0.3)


def pen(t, d=1.5, a=0.025):
    n = M.band(M.burst(d, 0.6, 1), 2200, 7500)
    n *= 0.65 + 0.35 * np.sign(np.sin(np.arange(len(n)) / SR * 2 * np.pi * 29))
    g(n, t, a)


def thump(t, a=0.14):
    g(M.thump(0.3), t, a); g(M.band(M.burst(0.05, 90, 2), 200, 2500), t, a * 0.5)


def flutter(t, d=2.0, a=0.018):
    n = M.band(M.burst(d, 0.8, 60), 300, 2500)
    n *= 0.5 + 0.5 * np.abs(np.sin(np.arange(len(n)) / SR * 2 * np.pi * 6))
    g(n, t, a)


# desert wind: strong over the plot shots, low over the map
wind = M.band(rng.standard_normal(N), 140, 1100)
wind /= np.abs(wind).max()
we = M.env([(0, 0.0), (0.4, 1.0), (7.0, 0.8), (11.0, 0.35), (s3, 0.25), (s7, 0.25), (s7 + 1.0, 0.9), (AT["s7:laut"], 0.5), (AT["s7:mendirikan"], 0.9), (s8 + 2, 0.3), (AT["s8:Ikuti"], 0.7), (DUR - 0.5, 0.4), (DUR, 0)])
M.fx += np.stack([wind * we, np.roll(wind, 1700) * we], 1) * 0.022
g(M.lib("impact-bass-1"), AT["s1:dua"], 0.04)
# rulers grow: tick run
for i in range(12):
    click(AT["s1:lebih"] + 0.11 * i, 0.022)
g(M.lib("pop"), AT["s1:lebih"], 0.025)
# station changes
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.4, 0.028)
# s2: well creak, crane up, map taps, thermometer rise
g(M.band(M.burst(0.5, 4, 40), 300, 1800), AT["s2:sumur"], 0.03)
g(M.lib("whoosh-cinematic"), AT["s2:tinggi"] + 0.2, 0.025)
g(M.lib("click-soft"), AT["s2:Mesir"], 0.04); g(M.lib("click-soft"), AT["s2:Sudan"], 0.04)
g(M.lib("riser"), AT["s2:suhunya"] - 0.3, 0.02)
g(M.lib("ping"), AT["s2:derajat"] - 0.3, 0.025)
# s3: red line drawn
thump(AT["s3:1899"], 0.12)
pen(AT["s3:garis"] - 0.2, AT["s3:derajat"] - AT["s3:garis"] + 0.5, 0.03)
g(M.lib("click-soft"), AT["s3:lintang"], 0.04)
g(M.lib("click-soft"), AT["s3:Sudan"], 0.04)
# s4: blue line, tents, arrows
thump(AT["s4:1902"], 0.12)
pen(AT["s4:garis"] - 0.2, AT["s4:setempat"] - AT["s4:garis"] + 0.6, 0.026)
for i in range(3):
    g(M.lib("pop"), AT["s4:gembala"] - 0.3 + 0.15 * i, 0.022)
g(M.lib("whoosh"), AT["s4:Kairo"] - 0.6, 0.022)
g(M.lib("whoosh"), AT["s4:Halaib"] - 0.2, 0.022)
g(M.lib("click-soft"), AT["s4:Segitiga"], 0.035)
# s5: claim sweeps
g(M.lib("riser"), AT["s5:Mesir"] - 0.2, 0.018)
g(M.lib("chime"), AT["s5:Halaib"], 0.02)
g(M.lib("riser"), AT["s5:Sudan"] - 0.2, 0.018)
g(M.lib("chime"), AT["s5:Halaib#2"], 0.02)
thump(AT["s5:Sudan#2"], 0.12)
# s6: balance rises, pieces land, Halaib drops
g(M.lib("sparkle"), AT["s6:Bir"], 0.02)
g(M.band(M.burst(1.2, 2.5, 60), 60, 600), AT["s6:Mengklaim"] - 1.1, 0.08)
g(M.lib("whoosh"), AT["s6:Tawil#2"] - 0.15, 0.025); click(AT["s6:Tawil#2"] + 0.95, 0.04)
g(M.lib("whoosh"), AT["s6:Halaib"] - 0.45, 0.028); thump(AT["s6:Halaib"] + 0.75, 0.16)
g(M.band(M.burst(0.7, 5, 30), 500, 2500), AT["s6:Halaib"] + 0.8, 0.03)
g(M.lib("ping"), AT["s6:sepuluh"], 0.03)
thump(AT["s6:mau"], 0.15)
# s7: dry well, ruler to the sea, flags rise and topple
g(M.lib("error"), AT["s7:air"], 0.02); g(M.lib("error"), AT["s7:permukiman"], 0.02)
for i in range(10):
    click(AT["s7:jauh"] - 0.2 + 0.09 * i, 0.02)
for i in range(5):
    g(M.lib("pop"), AT["s7:mendirikan"] + 0.17 * i, 0.022)
flutter(AT["s7:mendirikan"], 4.0, 0.02)
for i in range(5):
    thump(AT["s7:tidak#3"] + 0.19 * i + 0.55, 0.07)
# s8: wide pull-back, question flag, outro
g(M.lib("whoosh-cinematic"), s8 + 0.3, 0.025)
g(M.lib("riser"), AT["s8:Menurut"] - 0.4, 0.02)
flutter(AT["s8:kalau"], 4.0, 0.018)
g(M.lib("chime"), OUT + 0.3, 0.05)
room = M.band(rng.standard_normal(N), 150, 1200)
room /= np.abs(room).max()
M.fx += np.stack([room, np.roll(room, 900)], 1) * 0.004
M.finish(music)
print("duration", DUR)
