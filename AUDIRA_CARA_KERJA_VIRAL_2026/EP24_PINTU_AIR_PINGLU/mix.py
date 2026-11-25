"""EP24 sound: a "music-box canal" bed. A warm toy-theatre waltz in F major: music-box plucks (sine + soft octave
partial, fast decay) over a gentle felt bass, with a low water hum that sinks in pitch while the chamber drains.
SFX: stage footlight hum, wooden gate creaks and a soft clunk when the miter leaves meet, valve ratchet, rushing water
in the culvert, gurgles into the basins, a cash-box "ting" on the water saving, a rubber stamp thud on the record claim.
Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, swell, metal, rumble

M = Mix(2424)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}


def pluck(f, dur=.9, dec=5.5):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 9) + .12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 14)
    return x * np.exp(-t * dec) * np.minimum(1, t / .003)


def felt(f, dur=.7):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 4) * np.minimum(1, t / .01)


def creak(dur=1.0, f0=180):
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (1 + .25 * np.sin(2 * np.pi * 1.3 * t) + .1 * rng.standard_normal(len(t)).cumsum() / SR * 30)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return lowpass(saw, 1400) * np.sin(np.pi * t / dur) ** .6


def water(dur, lo=150, hi=2200):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = norm(lowpass(rng.standard_normal(n), hi) - lowpass(rng.standard_normal(n), lo))
    gur = 1 + .5 * np.sin(2 * np.pi * 5.3 * t) * np.sin(2 * np.pi * .7 * t)
    return x * gur * np.minimum(1, t / .3) * np.minimum(1, (dur - t) / .4)


def gurgle(dur=.6):
    t = np.arange(int(dur * SR)) / SR
    y = np.zeros(len(t))
    for k in range(6):
        a = rng.uniform(0, dur - .12); i = int(a * SR); L = int(.1 * SR)
        tt = np.arange(L) / SR; f = rng.uniform(300, 700) * (1 + 2 * tt / .1)
        y[i:i + L] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 30)
    return y


# --- bed: waltz in F major, 84 bpm (3/4); chords F, Dm, Bb, C ---
bt = 60 / 84
prog = [(174.6, [349.2, 440.0, 523.3]), (146.8, [293.7, 349.2, 440.0]), (116.5, [233.1, 293.7, 349.2]), (130.8, [261.6, 329.6, 392.0])]
mel = [698.5, 880.0, 784.0, 698.5, 587.3, 659.3, 698.5, 523.3, 587.3, 523.3, 466.2, 523.3]
music_m = np.zeros(N)
bar = 0
tp = .2
while tp < END + 1.5:
    root, ch = prog[bar % 4]
    soft = .55 if S["s6"] <= tp < S["s7"] else 1.0
    for beat in range(3):
        tb = tp + beat * bt
        i = int(tb * SR)
        if i >= N:
            break
        sig = felt(root, .8) if beat == 0 else sum(pluck(f, .5, 9) for f in ch) / 3 * .45
        L = min(len(sig), N - i)
        music_m[i:i + L] += sig[:L] * (.55 if beat == 0 else .35) * soft
        if (bar + beat) % 2 == 0:
            f = mel[(bar * 3 + beat) % len(mel)]
            s_ = pluck(f, 1.0, 4.5)
            L = min(len(s_), N - i)
            music_m[i:i + L] += s_[:L] * .32 * soft
    tp += 3 * bt
    bar += 1
env = M.env([(0, .8), (S["s2"], 1), (S["s5"], .8), (S["s7"], 1), (END, .9), (DUR - .2, 0), (DUR, 0)])
music_m *= env
# low water hum that slides down while the chamber drains (s5)
drop = np.clip((T - AT["s5:katup"]) / max(.1, AT["s5:29,6"] + .7 - AT["s5:katup"]), 0, 1)
hum_f = 98 - 24 * drop
hum = np.sin(2 * np.pi * np.cumsum(hum_f) / SR) * (.4 + .6 * np.exp(-((T - (AT["s5:katup"] + AT["s5:29,6"]) / 2) / 6) ** 2))
side = .02 * np.sin(2 * np.pi * T * .13) * music_m
music = stereo(.07 * music_m + .012 * hum, side) * 1.7

# --- SFX ---
g(swell(rng, 3.0, 120, 900), .05, .04)
g(M.lib("pop"), .3, .05)
g(M.thump(.4), AT["s1:pompa"], .1)
g(M.lib("whoosh-cinematic"), S["s2"] - .4, .07)
g(M.lib("ping"), AT["s2:Terusan"], .05)
g(M.lib("click-soft"), AT["s2:CGTN"], .07)
g(M.lib("riser"), AT["s2:enam"] - .9, .035)
g(M.lib("impact-bass-1"), AT["s2:enam"], .07)
g(water(2.5, 100, 1800), AT["s3:terjun"] - .3, .03)
for k, kk in enumerate(("s3:Madao", "s3:Qishi", "s3:Qingnian")):
    g(pluck(523.3 * (1, .84, .67)[k], .6, 6), AT[kk], .12)
    g(M.lib("pop"), AT[kk], .05)
g(M.lib("whoosh"), AT["s3:pintu"] + .2, .05)
# s4: ship enters, gate creaks shut, miter leaves meet with a clunk
g(rumble(rng, 3.0, 90), AT["s4:masuk"], .04)
g(creak(1.4, 150), AT["s4:menutup"], .05)
g(metal(rng, .9, 130, 6.0), AT["s4:menutup"] + 1.35, .05)
g(M.thump(.35), AT["s4:menutup"] + 1.35, .1)
g(M.lib("click"), AT["s4:V"], .06)
g(swell(rng, 1.6, 60, 400), AT["s4:Tekanan"], .05)
# s5: valve ratchet, culvert rush while the level drops
for k in range(8):
    g(M.lib("click-soft"), AT["s5:katup"] - .4 + k * .12, .05)
dur5 = max(2.0, AT["s5:29,6"] + .7 - AT["s5:katup"])
g(water(dur5, 140, 2600), AT["s5:katup"] + .2, .06)
g(M.lib("chime"), AT["s5:29,6"] + .9, .05)
# s6: gurgles into the basins, reverse flow, saving "ting"
g(M.lib("whoosh-cinematic"), S["s6"] - .3, .05)
for k in range(3):
    g(gurgle(.6), AT["s6:menabungnya"] + k * .5, .05)
for k in range(3):
    g(gurgle(.6), AT["s6:mengembalikannya"] + k * .5, .05)
g(M.lib("sparkle"), AT["s6:enam"] - .2, .05)
g(pluck(1046.5, .8, 5), AT["s6:enam"] + .5, .1)
# s7: counter, gate opens, record stamp
g(M.lib("typing"), AT["s7:ribu"], .03)
g(creak(1.6, 120), AT["s7:terbuka"] - .1, .05)
g(water(2.0, 100, 1200), AT["s7:terbuka"] + .2, .035)
g(M.thump(.3), AT["s7:rekor"], .12)
g(M.lib("impact-bass-1"), AT["s7:rekor"], .05)
# s8: curtain call
g(M.lib("whoosh-cinematic"), S["s8"] - .3, .06)
for kk in ("s8:Bukan", "s8:gravitasi", "s8:pintu"):
    g(M.lib("pop"), AT[kk], .06)
for k, f in enumerate((349.2, 440.0, 523.3, 698.5)):
    g(pluck(f, 1.6, 2.5), B["outroAt"] + k * .09, .1)
M.finish(music)
print("duration", DUR)
