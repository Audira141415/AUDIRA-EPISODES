"""EP06 sound: warm Pacific. Log-drum and marimba rhythm, ukulele-like plucks over an ocean bed, in F major (I-V-vi-IV).
A clock-tick riser climbs to midnight, then a glass shatter and a held silence for the skipped Friday before the band returns.
Foley: calendar-page tears on every panel change, wave wash, schooner creak, trade-arc whooshes, dial ticks, the sunrise swell.
Run from this folder after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2011)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
MID = AT["s5:malam"] + 0.3
SAT = AT["s5:Sabtu"]

hz = lambda m: 440 * 2 ** ((m - 69) / 12)
chords = [[53, 57, 60], [48, 52, 55, 60], [50, 53, 57], [46, 50, 53, 58]]  # F C Dm Bb
bpm = 96
beat = 60 / bpm
bar = beat * 4
# the band drops out from the tick riser to after Saturday lands
gap = (AT["s5:tepat"] - 0.2, SAT + 0.4)
on = lambda t0: not (gap[0] <= t0 < gap[1]) and t0 < END + 1.0


def chord_at(t0):
    return chords[int(t0 / bar) % 4]


# marimba: wooden bars, fast-decaying sine with a 4x partial
def marimba(f, d=0.6):
    tt = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * f * 3.93 * tt) * np.exp(-tt * 30)) * np.exp(-tt * 7) * np.minimum(1, tt / 0.002)


# ukulele-ish pluck: Karplus-Strong
def pluck(f, d=0.9):
    n = int(d * SR); p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.994
    return M.band(out, 180, 6000) if n > 1000 else out


def logdrum(f=110, d=0.35):
    tt = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * f * tt * (1 + 0.25 * np.exp(-tt * 30))) * np.exp(-tt * 13)


mar, uke, drum, bass = M.mono(), M.mono(), M.mono(), M.mono()
pl_cache = {}
for k, t0 in enumerate(np.arange(0.0, END + 1.0, beat / 2)):
    if not on(t0):
        continue
    ch = chord_at(t0)
    step = k % 8
    # marimba arpeggio, 8ths
    m = ch[[0, 1, 2, 1, 2 if len(ch) < 4 else 3, 1, 2, 0][step] % len(ch)] + 24
    M.lay(mar, marimba(hz(m)), t0, 0.55 if step % 2 == 0 else 0.35)
    # log drum pattern: 1, the and-of-2, 3, 4
    if step in (0, 3, 4, 6):
        M.lay(drum, logdrum(hz(ch[0] + 12) if step != 3 else hz(ch[0] + 19)), t0, 0.8 if step == 0 else 0.5)
    # ukulele strum on 2 and 4
    if step in (2, 6):
        for j, n_ in enumerate(ch[:3]):
            key = n_ + 12
            if key not in pl_cache:
                pl_cache[key] = pluck(hz(key))
            M.lay(uke, pl_cache[key], t0 + j * 0.018, 0.35)
    if step == 0:
        M.lay(bass, M.note(hz(ch[0] - 12), bar * 0.9, "tri", 1.2, 0.01), t0, 0.7)
mar, uke, drum = (M.band(x, 60, 9000) for x in (mar, uke, drum))
bass = M.band(bass, 30, 600)

# ocean bed: slow swells of filtered noise
ocean = M.band(rng.standard_normal(N), 80, 1400)
ocean *= 0.55 + 0.45 * np.sin(2 * np.pi * T / 7.5) ** 2
ocean /= np.abs(ocean).max()

e = M.env([(0, 0.55), (1.0, 0.8), (K["s3"], 0.75), (K["s4"], 0.9), (K["s5"], 0.8), (gap[0], 0.7), (gap[0] + 0.3, 0), (gap[1] - 0.05, 0), (gap[1] + 0.5, 1.0),
           (K["s7"], 0.85), (AT["s7:Kini"], 1.05), (K["s8"], 0.8), (END, 0.8), (DUR - 0.4, 0), (DUR, 0)])
norm = lambda x: x / max(1e-9, np.abs(x).max())
music = stereo(e * (0.42 * norm(mar) + 0.5 * norm(drum) + 0.3 * norm(bass)), e * 0.22 * norm(uke))
oe = M.env([(0, 0.6), (MID - 0.05, 0.6), (MID, 0), (SAT - 0.3, 0), (SAT + 0.6, 0.6), (DUR - 0.5, 0.3), (DUR, 0)])
music += np.stack([ocean, np.roll(ocean, 1300)], 1) * (0.1 * oe)[:, None]


def tear(t, a=0.08):
    x = M.band(M.burst(0.3, 6, 2), 900, 7000)
    x *= np.abs(np.sin(np.arange(len(x)) / SR * 2 * np.pi * 38)) ** 0.5
    g(x, t, a)


# --- hook: Friday page glints, then cracks ---
g(M.lib("sparkle"), 0.15, 0.05)
g(M.tone((2093, 3136), 1.4, 3), 0.3, 0.03)
for i in range(6):
    g(M.band(M.burst(0.05, 80, 2), 3000, 11000), AT["s1:tidak"] + i * 0.12, 0.05)
g(M.lib("impact-bass-1"), AT["s1:ada"], 0.08)
# panels tear like calendar pages
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    tear(K[k] - 0.3)
for a in ("s3:Caranya", "s4:Tertinggal", "s5:Kamis", "s6:Tokelau", "s7:Natal", "s7:Kini"):
    tear(AT[a] - 0.3)
# camera rises to the globe; the date line draws itself
g(M.lib("whoosh-cinematic"), K["s2"] - 0.2, 0.06)
g(M.lib("riser"), AT["s2:garis"] - 0.6, 0.03)
g(M.tone((880, 1320), 1.6, 2), AT["s2:Garis"], 0.04)
# 1892: waves, creaking schooner, the line slides west
for x in np.arange(K["s3"], AT["s3:memakai"], 1.7):
    g(M.band(M.burst(1.2, 2, 6), 120, 1600), x, 0.05)
for x in np.arange(K["s3"] + 0.4, AT["s3:memakai"], 2.3):
    g(M.tone((180 + rng.uniform(0, 60), 260), 0.35, 8), x, 0.02)
g(M.lib("whoosh"), AT["s3:memakai"], 0.06)
g(M.lib("pop"), AT["s3:Senin"], 0.04)
g(M.lib("whoosh-short"), AT["s3:diulang"], 0.05); g(M.lib("pop"), AT["s3:diulang"] + 0.4, 0.05)
g(M.thump(0.4), AT["s3:kemerdekaan"], 0.2)
# 2011: trade arcs to Australia and New Zealand
for a in ("s4:Australia", "s4:Selandia"):
    g(M.lib("whoosh"), AT[a] - 0.1, 0.05); g(M.lib("ping"), AT[a] + 0.8, 0.03)
for i in range(21):
    g(M.tone((3200,), 0.012, 400), AT["s4:21"] + i * 0.055, 0.025)
g(M.lib("chime"), AT["s4:empat"], 0.04)
# PM decides
g(M.thump(0.45), AT["s5:Tuilaepa"], 0.15)
# clock-tick riser to midnight
t0 = AT["s5:Kamis"]
for i, x in enumerate(np.arange(t0, MID, 0.5)):
    g(M.tone((2600, 5200), 0.02, 250), x, 0.03 + 0.04 * (x - t0) / (MID - t0))
rs = MID - AT["s5:tepat"]
tt = np.arange(int(rs * SR)) / SR
rise = np.sin(2 * np.pi * np.cumsum(220 + 600 * (tt / rs) ** 2) / SR) * (tt / rs) ** 2
g(rise + 0.3 * M.band(rng.standard_normal(len(tt)), 2000, 9000) * (tt / rs) ** 3, AT["s5:tepat"], 0.05)
tear(AT["s5:tepat"], 0.1)
# glass shatter, then silence
sh = M.band(M.burst(1.6, 3.5, 1), 1800, 16000)
for i in range(40):
    f = rng.uniform(2500, 7000)
    g(M.tone((f, f * 1.47), 0.4, 12), MID + rng.uniform(0, 0.9), 0.012)
g(sh, MID, 0.16); g(M.thump(0.3), MID, 0.12)
# Saturday lands, band returns
g(M.lib("impact-bass-1"), SAT, 0.1); g(M.lib("chime"), SAT + 0.1, 0.06)
# dial spins a full day
for x in np.linspace(AT["s6:minus"] + 0.2, AT["s6:plus"] + 0.6, 24):
    g(M.tone((1800, 2700), 0.015, 300), x, 0.03)
g(M.lib("ping"), AT["s6:plus"] + 0.6, 0.04)
g(M.lib("pop"), AT["s6:ikut"], 0.05)
# two islands, Christmas, sunrise
g(M.lib("pop"), AT["s7:Samoa"], 0.04); g(M.lib("pop"), AT["s7:Amerika"], 0.04)
g(M.tone((1568, 1976, 2349), 2.0, 1.6), AT["s7:Natal"], 0.04)
g(M.lib("riser"), AT["s7:Kini"] - 0.4, 0.035); g(M.tone((698.5, 880, 1046.5), 3.2, 0.6), AT["s7:Kini"] + 1.0, 0.035)
g(M.lib("pop"), AT["s8:mengulang"], 0.04); g(M.lib("glitch-1"), AT["s8:menghapus"], 0.03)
g(M.lib("chime"), OUT + 0.3, 0.06)
M.finish(music)
print("duration", DUR)
