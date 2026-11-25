"""EP16 sound: a measuring instrument for the sky. A low A drone whose upper partials open as the log zoom climbs
(brightness follows the zoom exponent e from zoom.json), a soft ruler tick every time the frame crosses a power of ten
(pitch rises with the decade), an airy whoosh whose level follows the zoom speed, and a slow celesta on A-minor pentatonic.
Capture brings a low gravitational 'catch'; the Sun's tug in s7 is a slow pulling glide down. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell

M = Mix(1616)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}

# ---- zoom exponent e(t), same easing as world3d.js ----
Z = json.load(open("zoom.json", encoding="utf8"))["keys"]
kt = [0 if k[0] == "@0" else DUR if k[0] == "@END" else (AT.get(k[0], K.get(k[0]))) + k[1] for k in Z]
def e_at(t):
    i = 0
    while i < len(Z) - 2 and t > kt[i + 1]:
        i += 1
    raw = min(1, max(0, (t - kt[i]) / max(.01, kt[i + 1] - kt[i])))
    s5 = raw ** 3 * (raw * (raw * 6 - 15) + 10)
    k = raw * .08 + s5 * .92
    return Z[i][2] + (Z[i + 1][2] - Z[i][2]) * k
tc = np.arange(0, DUR, 1 / 200)
ec = np.array([e_at(t) for t in tc])
E = np.interp(T, tc, ec)
speed = np.abs(np.gradient(ec, tc))
SP = np.interp(T, tc, np.convolve(speed, np.ones(30) / 30, mode="same"))

# ---- bed ----
air = norm(lowpass(rng.standard_normal(N), 2600) - lowpass(rng.standard_normal(N), 500))
low = drone(T, 55.0, ((1, 1), (1.5, .45), (2.0, .3)))
high = drone(T, 55.0, ((3.0, .3), (4.0, .22), (6.0, .14), (8.0, .08)))
bright = np.clip(E / 11.5, 0, 1)
e_p = M.env([(0, .5), (S["s3"], .65), (S["s5"], .75), (S["s7"], .85), (END, .6), (DUR - .2, 0), (DUR, 0)])
pad = (low + high * bright * 1.4) * e_p
whoo = norm(lowpass(rng.standard_normal(N), 1800)) * np.clip(SP / 6, 0, 1) ** 1.3
mono = .03 * air + .055 * pad + .06 * whoo
side = .014 * (np.roll(air, 9001) - air) + .012 * pad
music = stereo(mono, side) * 2.0

# celesta, A minor pentatonic, sparse
notes = [440.0, 523.3, 587.3, 659.3, 784.0, 659.3, 587.3, 523.3]
tp, i = .5, 0
while tp < END:
    f = notes[i % len(notes)] * (2 if (i // 8) % 3 == 2 else 1)
    g(M.tone([f, f * 2.0, f * 4.01], 2.4, 2.2), tp, .022)
    tp += 1.15 if i % 4 != 3 else 1.9
    i += 1

# ruler tick at every decade crossing; pitch climbs with the exponent
fl = np.floor(ec)
for j in np.nonzero(np.diff(fl))[0]:
    d = int(max(fl[j], fl[j + 1]))
    g(M.tone([700 * 2 ** (d / 12 * 1.5)], .05, 60), tc[j], .05)
    g(M.lib("click-soft"), tc[j], .03)

def catch(at, gain):
    n = int(1.4 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * (90 * t - 18 * t * t)) * np.exp(-t * 2.2)
    g(s, at, gain); g(M.thump(.5), at, gain * .9)

def tug(at, dur, gain):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * (220 * t - 40 * t * t)) * np.sin(np.pi * t / dur) ** 2
    g(s, at, gain)

for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), S[k] - .3, .05)
g(M.lib("ping"), AT["s1:Agustus"], .05)
g(M.lib("typing"), AT["s2:Minor"], .03)
g(M.lib("ping"), AT["s2:QQ8"], .05)
g(M.lib("click"), AT["s2:Teleskop"], .07)
g(M.lib("sparkle"), AT["s2:menemukannya"], .04)
g(M.lib("chime"), AT["s2:manusia"], .045)
g(M.lib("sparkle"), AT["s3:Matahari"] + .6, .04)
g(swell(rng, 2.6, 200, 1400), AT["s3:mendekat"] - .3, .05)
g(swell(rng, 2.4, 300, 2200), AT["s4:Hill"] - .4, .05)
g(M.lib("pop"), AT["s4:tarikan"], .05)
g(M.lib("riser"), AT["s5:negatif"] - 1.6, .04)
catch(AT["s5:negatif"] + .1, .13)
g(M.lib("ping"), AT["s5:paling"], .05)
g(M.lib("glitch-1"), AT["s6:sampah"], .035)
g(M.lib("whoosh-short"), AT["s6:mendorong"], .05)
g(M.lib("click-soft"), AT["s6:kecil"], .06)
g(M.thump(.4), AT["s6:padat"], .12)
g(M.lib("chime"), AT["s6:seirama"], .04)
tug(AT["s7:Matahari"], 3.2, .05)
g(M.lib("whoosh"), AT["s7:lepas"], .05)
g(M.lib("ping"), AT["s7:Desember"], .045)
g(M.lib("chime"), AT["s8:tamu"], .05)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
