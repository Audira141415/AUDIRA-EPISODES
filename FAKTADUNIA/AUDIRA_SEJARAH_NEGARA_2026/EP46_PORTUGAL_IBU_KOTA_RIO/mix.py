"""EP46 sound: a soft fado-like bed in A minor (plucked guitar arpeggios, low bass, warm pad), sea swell under the
harbour and ocean scenes, ceramic clinks as tiles land and flip, distant drums for Napoleon's march, rope creaks for
boarding, a bell for Rio as capital, a gold chime for the balance, a cracking rattle for the crisis, a warm swell
with distant cheering for 7 September 1822. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1807)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 84

# A minor fado turn: i - iv - V - i ... (Am, Dm, E, Am / F, Dm, E, Am)
prog = [[45, 57, 60, 64], [50, 57, 62, 65], [40, 56, 59, 64], [45, 57, 60, 64], [41, 57, 60, 65], [50, 57, 62, 65], [40, 56, 59, 62], [45, 57, 60, 64]]
chord = lambda t: prog[int(t / (beat * 4)) % len(prog)]
gtr, bass, pad = M.mono(), M.mono(), M.mono()
for k, t0 in enumerate(np.arange(0.05, END + 1.5, beat / 2)):
    ch = chord(t0)
    m = ch[1 + [0, 1, 2, 1, 2, 3, 2, 1][k % 8] % 3] + 12
    M.lay(gtr, M.note(hz(m), 1.4, "pluck", 2.8), t0, 0.45 if k % 2 == 0 else 0.3)
for t0 in np.arange(0.05, END + 1.5, beat * 2):
    M.lay(bass, M.note(hz(chord(t0)[0]), beat * 1.8, "pluck", 1.6), t0, 0.7)
for t0 in np.arange(0.05, END + 2, beat * 4):
    for m in chord(t0)[1:]:
        M.lay(pad, M.note(hz(m), beat * 4.3, "tri", 0.35, 0.3), t0, 0.15)
pad = M.band(pad, 120, 2500)
for x in (gtr, bass, pad):
    x /= max(1e-6, np.abs(x).max())
e_all = M.env([(0, 0.0), (0.3, 0.75), (K["s2"], 0.6), (K["s3"], 0.7), (K["s6"], 0.65), (AT["s6:krisis"], 0.45),
               (K["s7"], 0.7), (AT["s7:Tujuh"], 0.95), (K["s8"], 0.75), (END, 0.85), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.45 * gtr + 0.3 * bass + 0.35 * pad) * e_all
music = stereo(mono, 0.07 * gtr * e_all)


def clink(t, a=0.02, f=None):
    f = f or rng.uniform(2400, 3600)
    g(M.tone((f, f * 1.51, f * 2.27), 0.18, 28), t, a)
    g(M.band(M.burst(0.02, 300, 1), 2000, 9000), t, a * 0.6)


def creak(t, dur=0.8, a=0.025):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = 180 + 60 * np.sin(2 * np.pi * 1.3 * tt)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.sin(np.pi * tt / dur)
    g(M.band(s, 300, 2500) * 0.5, t, a)


# sea swell bed: under s1, s3-s6
sea = M.band(rng.standard_normal(N), 80, 1400)
sea *= 0.55 + 0.45 * np.sin(2 * np.pi * 0.11 * T) ** 2
sea *= M.env([(0, 0), (1.5, 0.7), (K["s2"], 0.25), (K["s3"], 0.6), (K["s4"], 1.0), (K["s5"], 0.5), (K["s6"], 0.4),
              (AT["s6:April"], 0.9), (K["s7"], 0.4), (K["s8"], 0.5), (DUR - 0.5, 0.3), (DUR, 0)])
sea /= max(1e-6, np.abs(sea).max())
M.fx += np.stack([sea, np.roll(sea, 2200)], 1) * 0.02

# s1 hook: tiles rain onto the wall
for i in range(46):
    clink(0.0 + i * 0.045 + rng.uniform(0, 0.05), 0.012 + 0.008 * rng.random())
g(M.thump(0.4), 1.6, 0.08)
g(M.lib("whoosh-cinematic"), AT["s1:memindahkan"] - 0.4, 0.03)
g(M.lib("sparkle"), AT["s1:samudra"], 0.02)
for k in ("s1:1807",):
    for i in range(8):
        clink(AT[k] - 0.1 + i * 0.05, 0.015)
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.35, 0.025)
# panel flips: a run of ceramic clinks along the wave
for k, dur in (("s2:Portugal", 1.2), ("s3:pasukan", 1.4), ("s4:tiba", 1.4), ("s5:menampung", 1.2), ("s6:April", 1.3), ("s7:Tujuh", 1.4)):
    t0 = AT[k] - 0.3
    for i in range(22):
        clink(t0 + dur * i / 22 + rng.uniform(0, 0.03), 0.011)
# s2 drums of the march
for i in range(16):
    t0 = AT["s2:bergerak"] - 0.3 + i * 0.36
    g(M.thump(0.22), t0, 0.04 if i % 4 == 0 else 0.022)
    g(M.band(M.burst(0.05, 70, 1), 300, 3000), t0 + 0.18, 0.012)
g(M.lib("pop"), AT["s2:Pangeran"], 0.03)
# s3 boarding: rope creaks, footsteps, departure
for i in range(6):
    creak(AT["s3:Hampir"] + i * 0.9, 0.7, 0.018)
for i in range(14):
    g(M.band(M.burst(0.03, 120, 1), 200, 2500), AT["s3:Hampir"] + i * 0.28, 0.02)
g(M.lib("whoosh"), AT["s3:Beberapa"] - 0.2, 0.025)
for i in range(10):
    g(M.thump(0.2), AT["s3:pasukan"] + i * 0.4, 0.03)
# s4 wind and gates
wind = M.band(rng.standard_normal(int(9 * SR)), 300, 3000) * np.sin(np.pi * np.arange(int(9 * SR)) / int(9 * SR))
g(wind / np.abs(wind).max(), K["s4"], 0.02)
creak(AT["s4:membuka"] - 0.1, 1.1, 0.04)
g(M.lib("chime"), AT["s4:membuka"] + 0.5, 0.025)
# s5 bell for the new capital, reverse whoosh for PEMBALIKAN
for i in range(3):
    g(M.tone((392, 392 * 2.01, 392 * 2.74), 2.5, 1.4), AT["s5:ibu"] + i * 0.9, 0.035)
g(M.lib("riser"), AT["s5:pembalikan"] - 1.0, 0.02)
g(M.lib("whoosh-cinematic")[::-1].copy(), AT["s5:pembalikan"] - 0.6, 0.025)
for i in range(30):
    g(M.band(M.burst(0.2, 20, 3), 300, 2500), AT["s5:menampung"] + rng.uniform(0, 3), 0.008)
# s6 balance chime, crisis rattle, ship back
g(M.lib("chime"), AT["s6:setara"], 0.03)
rt0, rt1 = AT["s6:krisis"] - 0.1, AT["s6:April"] - 0.3
for i in range(int((rt1 - rt0) / 0.07)):
    clink(rt0 + i * 0.07 + rng.uniform(0, 0.04), 0.006 + 0.01 * i / ((rt1 - rt0) / 0.07), rng.uniform(1500, 2500))
g(M.thump(0.3), AT["s6:April"] - 0.3, 0.06)
creak(AT["s6:April"] + 0.6, 1.0, 0.025)
# s7 independence: warm swell, distant cheers
g(M.lib("riser"), AT["s7:Tujuh"] - 1.2, 0.025)
g(M.lib("impact-bass-1"), AT["s7:Tujuh"] - 0.05, 0.05)
cn = int(4.5 * SR)
cheer = M.band(rng.standard_normal(cn), 500, 3500) * (0.6 + 0.4 * np.abs(np.sin(np.arange(cn) / SR * 7))) * np.sin(np.pi * np.arange(cn) / cn)
g(cheer / np.abs(cheer).max(), AT["s7:merdeka"] - 0.2, 0.018)
g(M.lib("sparkle"), AT["s7:merdeka"], 0.025)
# s8
g(M.lib("whoosh-cinematic"), AT["s8:negara"] - 0.5, 0.025)
g(M.lib("chime"), AT["s8:Menurut"], 0.025)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
