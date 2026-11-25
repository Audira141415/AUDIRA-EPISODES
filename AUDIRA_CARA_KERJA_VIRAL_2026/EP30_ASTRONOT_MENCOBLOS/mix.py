"""EP30 sound: a "paper music box in orbit" bed. A celesta-like music-box arpeggio (D major pentatonic, 92 bpm) over a
warm two-note pad and a slow space hum; it thins out under the explanation (s6) and swells on the payoff (s7).
Paper foley carries the style: a paper-fold rustle on every panel (the hanging cards), soft paper flutters when the
form, envelope and paper plane fly, a wax-seal thunk + chime on "terenkripsi" / "terkunci", and short data blips
(radio telemetry) while the ballot hops ISS -> TDRS -> White Sands -> Mission Control -> clerk.
Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, swell

M = Mix(3030)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
OUT = B["outroAt"]


def celesta(f, dur=1.6):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + .32 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 6) + .12 * np.sin(2 * np.pi * 4.01 * f * t) * np.exp(-t * 11)
    return x * np.minimum(1, t / .003) * np.exp(-t * 2.6)


def rustle(dur=.32, lo=1800, hi=9000):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = norm(M.band(rng.standard_normal(n), lo, hi))
    am = .55 + .45 * np.abs(np.sin(2 * np.pi * (23 + 9 * rng.random()) * t))
    return x * am * np.minimum(1, t / .015) * np.exp(-t * 9)


def blip(f=1320, dur=.07):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.minimum(1, np.minimum(t / .004, (dur - t) / .01))


def thunk(dur=.25):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * (140 * t + 60 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 18) + .3 * M.burst(dur, 50, 3)


# --- music box arpeggio + pad ---
bt = 60 / 92
scale = [293.7, 329.6, 370.0, 440.0, 493.9, 587.3, 659.3, 740.0]
pattern = [0, 2, 4, 5, 4, 2, 3, 1, 0, 4, 5, 7, 6, 4, 3, 2]
music_m = np.zeros(N)
tp, i = .05, 0
while tp < END + 2.0:
    lvl = .5 if S["s6"] <= tp < S["s7"] else (1.15 if S["s7"] <= tp < S["s8"] else 1.0)
    if i % 2 == 0 or S["s7"] <= tp < S["s8"]:
        x = celesta(scale[pattern[i % 16]])
        j = int(tp * SR); e = min(N, j + len(x)); music_m[j:e] += .05 * lvl * x[: e - j]
    tp += bt / 2
    i += 1
pad = np.sin(2 * np.pi * 146.8 * T) + .7 * np.sin(2 * np.pi * 220.0 * T * 1.002) + .4 * np.sin(2 * np.pi * 73.4 * T)
pad = lowpass(pad * (1 + .25 * np.sin(2 * np.pi * .11 * T)), 900)
e_pad = M.env([(0, .0), (1.2, 1), (S["s6"], 1), (S["s6"] + 1, .6), (S["s7"], 1.2), (END, 1), (END + 1.2, .6), (DUR - .2, 0), (DUR, 0)])
hum = lowpass(rng.standard_normal(N), 160) * 3
music_m = music_m + .022 * pad * e_pad + .012 * hum * e_pad
e_m = M.env([(0, 1), (END, 1), (END + 1.2, .5), (DUR - .2, 0), (DUR, 0)])
music = stereo(music_m * e_m, .25 * music_m * e_m * np.sin(2 * np.pi * T * .05)) * 1.5

# --- paper fold on every hanging panel ---
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(rustle(.36), S[k] - .2, .05)
    g(M.lib("whoosh-short"), S[k] - .3, .025)
g(rustle(.4), .05, .04)

# s1: reveal pull-back + ruler + plane teaser
g(swell(rng, 1.6, 120, 900), max(0, AT["s1:400"] - 1.0), .05)
g(M.lib("pop"), AT["s1:400"], .06)
g(rustle(.5, 2500, 11000), AT["s1:pulang"] - .3, .05)
g(M.lib("whoosh"), AT["s1:pulang"], .035)
# s2
g(M.lib("pop"), AT["s2:Tiga"], .05)
g(M.lib("click-soft"), AT["s2:kabin"], .07)
# s3: form flight, booklet pop-up
g(rustle(.6, 2000, 10000), AT["s3:meminta"], .05)
g(M.lib("click-soft"), AT["s3:meminta"] + 1.3, .06)
g(rustle(.45, 900, 6000), AT["s3:Bab"] - .2, .06)
g(M.lib("pop"), AT["s3:Bab"] + .2, .05)
# s4: envelope, wax seal, rise, keys
g(M.lib("pop"), AT["s4:menyiapkan"], .05)
g(thunk(), AT["s4:terenkripsi"] + .05, .1)
g(M.lib("chime"), AT["s4:terenkripsi"] + .1, .035)
g(rustle(.8, 1500, 8000), AT["s4:Mission"], .04)
g(M.lib("riser"), AT["s4:mengirimnya"] - .3, .025)
for i in range(3):
    g(M.lib("sparkle"), AT["s4:kunci"] + .15 * i, .02)
# s5: typing, plane hops with telemetry blips
g(M.lib("typing"), AT["s5:mengisinya"] - .2, .03)
for k, f in (("s5:naik", 1320), ("s5:TDRS", 1560), ("s5:turun", 1180), ("s5:White", 990), ("s5:Mission", 1100), ("s5:petugas", 1480)):
    for j in range(3):
        g(blip(f), AT[k] + j * .09, .025)
g(M.lib("whoosh-cinematic"), AT["s5:naik"] - .2, .04)
g(M.lib("whoosh-cinematic"), AT["s5:turun"], .04)
g(M.lib("ping"), AT["s5:petugas"] + .4, .04)
# s6: fast laps, ground window, relay
g(swell(rng, 2.0, 200, 2200), AT["s6:melaju"] - .3, .04)
g(M.lib("ping"), AT["s6:antena"], .03)
g(swell(rng, 1.5, 300, 3000), AT["s6:Satelit"] - .2, .035)
g(M.lib("chime"), AT["s6:geostasioner"], .03)
# s7: race along the whole path, seal, keys
g(M.lib("riser"), AT["s7:Total"] - .5, .03)
for j in range(8):
    g(blip(1200 + 90 * j, .05), AT["s7:seperempat"] - .1 + j * .08, .022)
g(M.lib("whoosh-short"), AT["s7:seperempat"], .05)
g(thunk(), AT["s7:terkunci"] + .05, .11)
g(M.lib("impact-bass-1"), AT["s7:terkunci"] + .05, .04)
g(M.lib("click"), AT["s7:hanya"] + .3, .05)
g(M.lib("click"), AT["s7:petugas"] + .3, .05)
# s8: four chips, outro
for k in ("s8:minta", "s8:isi", "s8:kirim", "s8:rahasia"):
    g(M.lib("pop"), AT[k], .04)
g(M.lib("chime"), OUT + .05, .07)
M.finish(music)
print("duration", DUR)
