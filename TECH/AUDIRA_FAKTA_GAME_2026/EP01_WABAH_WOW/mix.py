"""EP01 PETA WABAH sound: dark fantasy drone in D minor with a low taiko pulse that grows as the plague spreads,
heartbeat thumps under the damage ticks, a synth choir pad on the reset, quiet lab ticks for the CDC beat. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2005)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
w = M.word

# drone: detuned saws on D1/A1, band-limited, slow breathing
f0 = 36.71
dr = sum(np.sin(2 * np.pi * f0 * h * (1 + d) * T) / h for h in range(1, 7) for d in (-.003, .003))
dr += .6 * sum(np.sin(2 * np.pi * f0 * 1.5 * h * T) / h for h in range(1, 5))
dr = M.band(dr, 30, 520) * (0.75 + 0.25 * np.sin(2 * np.pi * T / 9))
air = M.band(M.rng.standard_normal(N), 300, 1400) * .05 * (0.6 + 0.4 * np.sin(2 * np.pi * T / 13 + 1))

# taiko pulse at 72 BPM, density/level follow the spread
taiko = M.mono()
beat = 60 / 72


def drum(dur=.5, f=58):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * (f * t + 30 * (1 - np.exp(-t * 25)) / 25)) * np.exp(-t * 7) + .25 * M.band(M.burst(dur, 30, 2), 80, 900)


sw = w("s6", "server", 1) + .3
spread = M.env([(0, .9), (K["s1e"], 1), (K["s2"] + .8, .25), (w("s2", "Corrupted"), .6), (K["s3"], .45), (w("s3", "dikeluarkan"), .7), (K["s3e"], 1),
                (K["s4"], .35), (K["s4e"], .4), (K["s5"], .55), (w("s5", "keramaian"), 1), (sw - .1, 1), (sw + .4, 0), (K["s8"], 0), (DUR, 0)])
t0, i = 0.0, 0
while t0 < sw:
    a = spread[min(N - 1, int(t0 * SR))]
    if a > .05:
        M.lay(taiko, drum(), t0, a * (1 if i % 4 == 0 else .55))
        if a > .7 and i % 2 == 1:
            M.lay(taiko, drum(.3, 74), t0 + beat / 2, a * .35)
    t0 += beat; i += 1

# heartbeat during the damage ticks
hb = M.mono()
k0 = w("s4", "dua")
for k in range(5):
    tk = k0 + k * 1.95
    M.lay(hb, drum(.35, 46), tk, 1.0); M.lay(hb, drum(.3, 50), tk + .26, .7)

# synth choir pad on the reset: D major, vowel-ish band
pad = M.mono()
pt = np.arange(int(5.5 * SR)) / SR
ch = sum(np.sin(2 * np.pi * f * (1 + d) * pt) + .4 * np.sin(4 * np.pi * f * (1 + d) * pt) for f in (146.83, 185.0, 220.0, 293.66) for d in (-.004, 0, .004))
ch = M.band(ch, 200, 2600) * np.minimum(1, pt / 1.2) * np.minimum(1, (5.5 - pt) / 1.5)
M.lay(pad, ch, sw - .3, .22)

# lab layer: thin cyan sine fifths and soft ticks; dawn: warm open fifth
lab = M.mono()
lt = np.arange(int((K["s8"] - K["s7"]) * SR)) / SR
labp = (np.sin(2 * np.pi * 293.66 * lt) + np.sin(2 * np.pi * 440 * lt) * .7) * np.minimum(1, lt / 1.5) * np.minimum(1, (lt[-1] - lt) / 1.0)
M.lay(lab, labp, K["s7"], .12)
dwt = np.arange(int((DUR - K["s8"]) * SR)) / SR
dwp = sum(np.sin(2 * np.pi * f * dwt) for f in (146.83, 220.0, 293.66, 369.99)) * np.minimum(1, dwt / 2) * np.minimum(1, (dwt[-1] - dwt) / 1.5)
M.lay(lab, dwp, K["s8"], .1)

denv = M.env([(0, 1), (K["s7"] - .5, 1), (K["s7"] + 1, .35), (K["s8"], .4), (DUR - 1, .3), (DUR, 0)])
music = stereo(.5 * dr * denv + .9 * taiko + .8 * hb + pad + lab + air * denv, .25 * np.roll(air, 700) + .12 * np.roll(pad, 400))

# SFX
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[x] - .3, .14)
g(M.lib("impact-bass-1"), .05, .3)
for kk in range(7):
    g(M.thump(.25), .6 + kk * .75, .08)
g(M.lib("riser"), w("s2", "Bosnya") - 1.2, .12)
g(M.lib("impact-bass-1"), w("s2", "Corrupted"), .3)
g(M.lib("glitch-2"), w("s2", "menular"), .1)
g(M.thump(), w("s2", "dikalahkan") + .2, .25)
g(M.lib("pop"), w("s3", "menyimpan"), .16); g(M.lib("sparkle"), w("s3", "menyimpan") + .1, .1)
g(M.lib("whoosh"), w("s3", "Developer"), .1)
g(M.lib("pop"), w("s3", "dikeluarkan"), .2); g(M.thump(), w("s3", "dikeluarkan") + .1, .2)
for kk in range(12):
    g(M.note(700 + 40 * (kk % 5), .06, "sine", 40), w("s3", "dikeluarkan") + 1.0 + kk * .18, .05)
for k in range(5):
    g(M.lib("click"), k0 + k * 1.95, .12)
g(M.lib("impact-bass-1"), k0 + 4 * 1.95 + .35, .26)
g(M.lib("ping"), w("s4", "NPC"), .12)
g(M.lib("chime"), w("s5", "healer"), .16)
g(M.lib("click-soft"), w("s5", "berjaga"), .2)
g(M.lib("whoosh-short"), w("s5", "sengaja") - .3, .15)
g(M.thump(), w("s5", "keramaian"), .22); g(M.lib("glitch-1"), w("s5", "keramaian") + .1, .08)
g(M.thump(.4), w("s6", "karantina"), .2)
g(M.lib("glitch-3"), w("s6", "restart"), .14); g(M.lib("glitch-1"), w("s6", "restart") + .7, .1)
g(M.lib("error"), w("s6", "muncul"), .1)
g(M.lib("riser"), sw - 1.6, .16)
g(M.lib("impact-bass-1"), sw, .26); g(M.lib("whoosh-cinematic"), sw + .05, .14)
g(M.lib("sparkle"), w("s6", "Oktober"), .18)
g(M.lib("typing"), w("s7", "CDC") + .3, .07)
tk = K["s7"] + .2
while tk < K["s8"] - .3:
    g(M.band(M.burst(.02, 120, 1), 2500, 9000), tk, .035); tk += .5
g(M.lib("error"), w("s7", "bug"), .12); g(M.thump(.3), w("s7", "bug"), .2)
for kk in range(6):
    g(M.lib("whoosh-short"), w("s7", "jurnal") - .4 + kk * .42, .05)
g(M.lib("chime"), w("s8", "Kalau"), .1)
g(M.lib("sparkle"), OUT - .4, .14)
g(M.thump(), OUT, .2)
M.finish(music)
