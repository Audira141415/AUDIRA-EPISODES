"""EP54 sound: a dense, curious bed in A minor pentatonic (plucked dulcimer-like notes, soft electric-piano pad,
light pulse), a city hum (traffic, fans, distant voices) under the megablock, two low jet fly-overs toward Kai Tak
(s1, s4), a stone-stamped 1898 lease, wall stones whooshing and thudding onto the runway (s3), hammering while the
block grows floor by floor (s4), a dripping, buzzing dark alley (s5-s6), small factory/school/dentist foley (s6),
a demolition rumble with dust (s7), birds in the park and a soft synth shimmer for the sci-fi ghost (s8),
one wooden click per device step. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1993)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 96

# A minor: Am - F - C - G, pentatonic plucks
prog = [[45, 57, 60, 64], [41, 53, 57, 60], [48, 55, 60, 64], [43, 55, 59, 62]]
penta = [57, 60, 62, 64, 67, 69, 72]
chord = lambda t: prog[int(t / (beat * 8)) % 4]
pad, plk, pul = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 2, beat * 8):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 8.4, "saw", 0.3, 0.3), t0, 0.2)
q = np.random.default_rng(54)
for k, t0 in enumerate(np.arange(beat, END + 0.5, beat / 2)):
    if q.random() < 0.45:
        continue
    M.lay(plk, M.note(hz(penta[int(q.integers(0, 7))] + (12 if k % 7 == 0 else 0)), 0.9, "pluck", 3.5), t0, 0.35)
for t0 in np.arange(0.05, END + 1, beat):
    M.lay(pul, M.note(hz(chord(t0)[0] - 12), beat * 0.6, "sine", 3.0, 0.01), t0, 0.5)
pad = M.band(pad, 80, 1800)
for x in (pad, plk, pul):
    x /= max(1e-6, np.abs(x).max())
alleyA, alleyB = AT["s5:Lorong"] - 0.4, AT["s6:Tapi"]
e_all = M.env([(0, 0.0), (0.3, 0.8), (K["s2"], 0.7), (K["s4"], 0.75), (alleyA, 0.75), (alleyA + 0.6, 0.35), (alleyB, 0.4),
               (alleyB + 0.6, 0.8), (K["s7"], 0.7), (K["s8"], 0.8), (END, 0.85), (DUR - 0.4, 0), (DUR, 0)])
e_plk = M.env([(0, 0.6), (alleyA, 0.6), (alleyA + 0.5, 0.1), (alleyB, 0.1), (alleyB + 0.5, 0.7), (DUR, 0.7)])
mono = (0.45 * pad + 0.32 * plk * e_plk + 0.22 * pul) * e_all
music = stereo(mono, 0.06 * plk * e_plk * e_all + 0.04 * pad * e_all)


def click(t, a=0.03):
    g(M.band(M.burst(0.02, 250, 1), 1500, 9000), t, a); g(M.tone((1600,), 0.03, 120), t, a * 0.3)


def jet(t0, dur=6.0, a=0.07):
    n = int(dur * SR); tt = np.arange(n) / SR
    roar = M.band(rng.standard_normal(n), 60, 2500)
    env = np.exp(-((tt - dur * 0.55) / (dur * 0.22)) ** 2)
    whine = np.sin(2 * np.pi * np.cumsum(1900 * (1 - 0.12 * np.tanh((tt - dur * 0.55) * 2))) / SR) * 0.08
    s = (roar / np.abs(roar).max() + whine) * env
    g(s, t0, a)


def hammer(t, a=0.025):
    g(M.band(M.burst(0.05, 80, 1), 500, 6000), t, a); g(M.tone((420, 900), 0.06, 60), t, a * 0.4)


def thud(t, a=0.04):
    g(M.thump(0.22), t, a); g(M.band(M.burst(0.12, 40, 2), 120, 1500), t, a * 0.5)


# city hum under the block (out on the fort/map beats, in after the war)
hum = M.band(rng.standard_normal(N), 90, 1400)
hum += 0.4 * np.sin(2 * np.pi * 120 * T) * 0.05
hum *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.05 * T)
hum /= max(1e-6, np.abs(hum).max())
hum *= M.env([(0, 0), (0.4, 0.8), (AT["s2:Awalnya"], 0.8), (AT["s2:Awalnya"] + 1.5, 0.15), (AT["s4:pengungsi"], 0.2),
              (AT["s4:Tingginya"], 0.8), (alleyA, 0.8), (alleyA + 0.5, 0.35), (alleyB + 0.5, 0.9), (AT["s7:Antara"], 0.8),
              (AT["s7:taman"], 0.25), (DUR - 0.5, 0.2), (DUR, 0)])
M.fx += np.stack([hum, np.roll(hum, 2200)], 1) * 0.018

# s1 hook: counter ticks, the plane, stamp
g(M.lib("impact-bass-1"), 0.05, 0.05)
for i in range(10):
    click(0.1 + i * 0.1, 0.012)
jet(AT["s1:lapangan"] + 0.3 - 1.5, 6.5, 0.08)
g(M.lib("pop"), AT["s1:lahan"], 0.03)
g(M.thump(0.25), AT["s1:terpadat"], 0.08); g(M.lib("impact-bass-1"), AT["s1:terpadat"], 0.04)
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.3, 0.025)
# s2 rewind and fort rising, lease stamp
g(M.lib("whoosh-cinematic"), AT["s2:Awalnya"] - 0.4, 0.035)
for i in range(4):
    thud(AT["s2:Awalnya"] + 0.25 + i * 0.22, 0.025)
g(M.lib("riser"), AT["s2:Inggris"] - 0.8, 0.018)
g(M.thump(0.3), AT["s2:dikecualikan"], 0.1); g(M.band(M.burst(0.08, 60, 1), 300, 5000), AT["s2:dikecualikan"], 0.05)
# s3 wall stones fly to Kai Tak
for i in range(14):
    t0 = AT["s3:membongkar"] - 0.2 + i * (AT["s3:Kai"] - AT["s3:membongkar"] + 0.6) / 14
    g(M.lib("whoosh-short"), t0, 0.012); thud(t0 + 1.4, 0.022)
# s4 refugees (footsteps), hammering growth, jet over the 14-floor line
for i in range(16):
    g(M.band(M.burst(0.03, 120, 1), 200, 2500), AT["s4:pengungsi"] - 0.8 + i * 0.27, 0.012)
for i in range(30):
    hammer(AT["s4:Mereka"] + i * (AT["s4:belas"] - AT["s4:Mereka"]) / 30 + 0.05 * np.sin(i * 3), 0.018)
jet(AT["s4:rendah"] - 0.6 - 2.5, 6.5, 0.1)
g(M.lib("pop"), AT["s4:belas"], 0.03)
# s5 counters, then the alley: drips, fluorescent buzz, low drone
for k in ("s5:ratus", "s5:juta"):
    g(M.lib("sparkle"), AT[k], 0.018)
an = int((alleyB - alleyA + 1) * SR); ta = np.arange(an) / SR
buzz = (np.sign(np.sin(2 * np.pi * 100 * ta)) * 0.25 + M.band(rng.standard_normal(an), 40, 200)) * np.minimum(1, ta / 0.6) * np.minimum(1, (an / SR - ta) / 0.6)
g(M.band(buzz, 60, 3000), alleyA, 0.02)
for i in range(12):
    t0 = alleyA + 0.5 + i * 0.55 + 0.2 * np.sin(i)
    g(M.tone((1400 + 300 * (i % 3),), 0.08, 50), t0, 0.012)
g(M.lib("glitch-1"), AT["s6:Geng"], 0.012)
# s6 cutaway foley: machine, chalk, dentist drill (soft)
mn = int(1.6 * SR); tm = np.arange(mn) / SR
g(M.band(np.sin(2 * np.pi * 55 * tm) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 6 * tm))), 40, 800) * np.sin(np.pi * tm / 1.6), AT["s6:pabrik"], 0.03)
for i in range(5):
    g(M.band(M.burst(0.06, 60, 1), 2000, 8000), AT["s6:sekolah"] + i * 0.11, 0.01)
dn = int(1.0 * SR); td = np.arange(dn) / SR
g(np.sin(2 * np.pi * 2600 * td + 3 * np.sin(2 * np.pi * 40 * td)) * np.sin(np.pi * td / 1.0) ** 2, AT["s6:dokter"], 0.008)
# s7 decision gavel + demolition rumble + dust
g(M.thump(0.25), AT["s7:dibongkar"], 0.09)
dm = int((AT["s7:diratakan"] - AT["s7:Antara"] + 2.0) * SR)
rum = M.band(rng.standard_normal(dm), 25, 600)
rum *= np.interp(np.arange(dm) / SR, [0, 0.5, dm / SR - 1.5, dm / SR], [0, 1, 0.8, 0])
g(rum / np.abs(rum).max(), AT["s7:Antara"], 0.07)
for i in range(10):
    thud(AT["s7:Antara"] + 0.3 + i * (AT["s7:diratakan"] - AT["s7:Antara"]) / 10, 0.03)
g(M.lib("sparkle"), AT["s7:taman"], 0.02)
for i in range(8):  # birds
    t0 = AT["s7:taman"] + 0.4 + i * 0.9
    n = int(0.25 * SR); tt = np.arange(n) / SR
    g(np.sin(2 * np.pi * np.cumsum(3000 + 900 * np.sin(2 * np.pi * 14 * tt)) / SR) * np.sin(np.pi * tt / 0.25) ** 2, t0, 0.006)
# s8 sci-fi ghost shimmer, question, outro
gn = int(3.0 * SR); tg = np.arange(gn) / SR
shim = sum(np.sin(2 * np.pi * hz(m) * tg) for m in (69, 76, 81, 88)) * np.minimum(1, tg / 1.2) * np.minimum(1, (3 - tg) / 1.0)
g(shim / np.abs(shim).max(), AT["s8:bentuknya"] - 0.2, 0.02)
g(M.lib("chime"), AT["s8:Sanggupkah"], 0.025)
# device steps: wooden click per step
for k in ("s2:dikecualikan", "s4:pengungsi", "s4:empat", "s5:menempel", "s7:dibongkar", "s7:taman"):
    click(AT[k] + 0.05, 0.025); click(AT[k] + 0.2, 0.015)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
