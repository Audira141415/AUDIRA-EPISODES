"""EP28 sound: a cold, tense naval-strategy bed in D minor (low pulsing pad, muted pluck ostinato, soft war-room tick),
North Atlantic swell under the board, sonar pings, puck clicks as tokens are placed, a metal snip when the trawl wire
is cut, a muffled steel crunch at the ramming, a telegraph-like snap when the diplomatic link breaks, a whistle on the
1976 agreement. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1976)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 92

# D minor: i - VI - III - VII, two bars each
prog = [[38, 50, 53, 57], [34, 50, 53, 58], [41, 48, 53, 57], [36, 48, 52, 55]]
chord = lambda t: prog[int(t / (beat * 8)) % 4]
pad, arp, tick = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 1.5, beat * 8):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 8.4, "tri", 0.3, 1.0), t0, 0.4)
for k, t0 in enumerate(np.arange(beat * 4, END + 0.5, beat / 2)):
    ch = chord(t0)
    f = hz(ch[1 + (k * 2) % 3] + 12)
    M.lay(arp, M.tone((f, f * 2.0), 0.35, 10), t0, 0.5 if k % 4 == 0 else 0.28)
for t0 in np.arange(beat * 8, END, beat):
    M.lay(tick, M.band(M.burst(0.02, 220, 1), 2500, 8000), t0, 0.45)
pad = M.band(pad, 70, 1500)
for x in (pad, arp, tick):
    x /= max(1e-6, np.abs(x).max())
s5, s6, s7, s8 = K["s5"], K["s6"], K["s7"], K["s8"]
e_all = M.env([(0, 0.0), (0.4, 0.8), (s5 - 0.3, 0.8), (s5, 0.9), (s6, 0.95), (s7, 0.8), (s8, 0.85), (END, 0.95), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.48 * pad + 0.3 * arp + 0.1 * tick) * e_all
music = stereo(mono, 0.06 * arp * e_all + 0.05 * pad * e_all)


def click(t, a=0.04):
    g(M.band(M.burst(0.02, 250, 1), 1500, 9000), t, a); g(M.tone((1900,), 0.03, 120), t, a * 0.3)


def sonar(t, a=0.03):
    g(M.tone((1180, 2360), 1.2, 3.2), t, a)


def snip(t, a=0.06):
    g(M.band(M.burst(0.05, 120, 1), 3000, 11000), t, a); g(M.tone((3400, 5100), 0.12, 30), t + 0.01, a * 0.4)


def crunch(t, a=0.2):
    g(M.thump(0.4), t, a); g(M.band(M.burst(0.35, 14, 4), 200, 3000), t, a * 0.6); g(M.tone((180, 270, 410), 0.8, 5), t, a * 0.2)


# North Atlantic swell
sw = M.band(rng.standard_normal(N), 60, 700)
sw /= np.abs(sw).max()
sw *= 0.6 + 0.4 * np.sin(2 * np.pi * T / 6.5) ** 2
se = M.env([(0, 0.0), (0.4, 1.0), (DUR - 0.5, 0.8), (DUR, 0)])
M.fx += np.stack([sw * se, np.roll(sw, 1700) * se], 1) * 0.022

# s1 hook
sonar(0.2, 0.035)
for i in range(3):
    click(AT["s1:kecil"] - 0.2 + i * 0.12)
g(M.lib("whoosh"), AT["s1:Angkatan"] - 0.3, 0.03)
for k in ("s1:menang", "s1:tiga#2", "s1:kali#2"):
    g(M.lib("pop"), AT[k], 0.04)
g(M.lib("impact-bass-1"), AT["s1:kali#2"], 0.05)
snip(AT["s1:gunting"] + 0.3, 0.05)
# station changes
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.35, 0.03)
# s2: cod shimmer, trawlers arrive
g(M.lib("sparkle"), K["s2"] + 1.0, 0.025)
for i in range(4):
    click(AT["s2:Sejak"] - 0.3 + i * 0.25, 0.03)
g(M.lib("whoosh-cinematic"), AT["s2:Sejak"] - 0.4, 0.02)
# s3: zone lines painted
g(M.lib("riser"), AT["s3:empat"] - 0.8, 0.02); g(M.lib("chime"), AT["s3:empat"], 0.03)
g(M.lib("chime"), AT["s3:dua"], 0.03)
for i in range(2):
    click(AT["s3:mengirim"] - 0.3 + i * 0.15, 0.04)
# s4: fleet drum
for i in range(12):
    g(M.thump(0.18), AT["s4:mengerahkan"] + i * 0.18, 0.06)
for i in range(6):
    click(AT["s4:enam"] + i * 0.12, 0.04)
g(M.lib("ping"), AT["s4:patroli"] + 0.3, 0.035)
# s5: 50 nm, cut, ram
g(M.lib("chime"), AT["s5:lima"] - 0.2, 0.03)
snip(AT["s5:jaring#2"] - 0.05, 0.08)
g(M.lib("whoosh-short"), AT["s5:jaring#2"] + 0.05, 0.03)
crunch(AT["s5:tabrak"] - 0.08, 0.22)
# s6: 200 nm, link snaps, alarm-like pings, sonar
g(M.lib("riser"), AT["s6:dua"] - 1.0, 0.025); g(M.lib("chime"), AT["s6:dua"] + 0.4, 0.03)
g(M.lib("glitch-2"), AT["s6:diplomatik"] + 0.15, 0.04); g(M.thump(0.25), AT["s6:diplomatik"] + 0.15, 0.12)
for i in range(3):
    g(M.tone((880, 1320), 0.2, 12), AT["s6:NATO"] - 0.1 + i * 0.25, 0.025)
for i in range(4):
    sonar(AT["s6:mengawasi"] - 0.6 + i * 0.45, 0.03)
# s7: retreat whoosh, score, whistle
g(M.lib("whoosh-cinematic"), AT["s7:mengalah"] - 0.3, 0.03)
g(M.lib("impact-bass-1"), AT["s7:mengalah"], 0.045); g(M.lib("pop"), AT["s7:mengalah"], 0.04)
wh = M.tone((2100, 2160), 0.9, 2.0)
g(wh, AT["s7:menerima"], 0.02)
# s8: wide pull-back, outro chime
g(M.lib("riser"), AT["s8:standar"] - 0.8, 0.02); g(M.lib("sparkle"), AT["s8:standar"], 0.025)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
