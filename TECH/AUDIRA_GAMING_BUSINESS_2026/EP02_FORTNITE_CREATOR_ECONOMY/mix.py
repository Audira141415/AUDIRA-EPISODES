"""EP02 sound: slow synth arp with sub pulses at dusk, water pour into the tank, digital payout ticks. Rises by a step each act. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4040)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT = B["AT"]
s, g = M.scene, M.put
beat = 60 / 92
# saw pad through a slow FFT lowpass, chord stack climbs across the film
chords = [(0, (55, 110, 164.81, 220)), (s("s3")["start"], (65.41, 130.81, 196, 246.94)), (s("s5")["start"], (73.42, 146.83, 220, 277.18)), (s("s7")["start"], (49, 98, 146.83, 196)), (s("s8")["start"], (55, 110, 164.81, 246.94))]
pad = np.zeros(N)
for i, (t0, fs) in enumerate(chords):
    t1 = chords[i + 1][0] if i < len(chords) - 1 else DUR
    env = np.clip((T - t0 + .9) / 1.8, 0, 1) * np.clip((t1 - T + .9) / 1.8, 0, 1)
    pad += sum(sum(np.sin(2 * np.pi * f * h * T + h) / h for h in range(1, 6)) for f in fs) * env
pad = M.band(pad, 40, 1400); pad /= np.abs(pad).max()
# arp: eighth notes with soft pluck, chord tones
arp = np.zeros(N)
def chord_at(t):
    c = chords[0][1]
    for a, fs in chords:
        if t >= a: c = fs
    return c
step = beat / 2
for b in range(int(M.TL["speech_end"] / step)):
    t0 = b * step; c = chord_at(t0)
    f = c[1 + b % 3] * (2 if b % 8 > 3 else 1)
    i = int(t0 * SR); n = min(int(.42 * SR), N - i)
    x = np.arange(n) / SR
    arp[i:i + n] += (np.sin(2 * np.pi * f * x) + .4 * np.sin(4 * np.pi * f * x)) * np.exp(-x * 7) * (.7 + .3 * (b % 4 == 0))
# sub pulse on the beat, ducks like a heart under the voice
sub = np.zeros(N)
for b in range(int(M.TL["speech_end"] / beat)):
    if b % 2 == 0:
        i = int(b * beat * SR); n = min(int(.5 * SR), N - i); x = np.arange(n) / SR
        sub[i:i + n] += np.sin(2 * np.pi * (46 * x + 18 * (1 - np.exp(-x * 30)) / 30)) * np.exp(-x * 6)
e = M.env([(0, .75), (s("s3")["start"], 1), (s("s7")["start"], .7), (s("s8")["start"], .95), (M.TL["speech_end"], .8), (DUR - .6, 0), (DUR, 0)])
wave_bed = M.band(rng.standard_normal(N), 180, 1100); wave_bed /= np.abs(wave_bed).max()
wave_bed *= .55 + .45 * np.sin(T * .9)
mono = (.10 * pad + .07 * arp + .13 * sub) * e + .018 * wave_bed
music = stereo(mono, .022 * arp * e + .006 * wave_bed) * 1.4
# ---- cues ----
g(M.thump(.6), .04, .24); g(M.lib("impact-bass-1"), .05, .09)
g(M.lib("glitch-1"), AT["s1:Bukan"], .05); g(M.lib("click"), AT["s1:Bukan"], .07)
for name in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-cinematic" if name in ("s3", "s7") else "whoosh-short"), s(name)["start"] - .34, .08)
g(M.lib("ping"), AT["s2:island"], .06); g(M.lib("ping"), AT["s2:75"], .06)
# pour: filtered noise swells for the fill, plus a low glug
a = AT["s3:40"]; n = int(3.4 * SR)
pour = M.band(rng.standard_normal(n), 500, 3800); pour /= np.abs(pour).max()
g(pour * np.minimum(1, np.arange(n) / (.3 * SR)) * np.minimum(1, (n - np.arange(n)) / (.8 * SR)), a - .1, .05)
g(M.thump(.4), a, .16)
for i in range(10):
    g(M.tone((180 + i * 12,), .1, 22), a + i * .3, .05)
g(M.lib("click"), AT["s3:Island"], .07)
for k in ("s4:waktu", "s4:kembali", "s4:pemain#2"):
    g(M.lib("click"), AT[k], .07)
g(M.lib("sparkle"), AT["s4:75"], .07)
for i in range(8):
    g(M.tone((1760, 2637), .07, 40), AT["s5:item"] + i * .13, .022)
g(M.thump(.25), AT["s5:74"], .13); g(M.lib("ping"), AT["s5:74"], .06)
g(M.thump(.25), AT["s5:37"], .13); g(M.lib("pop"), AT["s5:3.000"], .08)
for k in ("s6:18", "s6:20", "s6:atau"):
    g(M.lib("click"), AT[k], .07)
for i in range(30):
    g(M.tone((2093,), .018, 90), AT["s6:30"] + i * .073, .018)
g(M.lib("riser"), AT["s7:empat"] - 2, .03); g(M.lib("impact-bass-1"), AT["s7:empat"], .09); g(M.thump(.5), AT["s7:empat"], .2)
g(M.lib("pop"), AT["s8:baru"], .08); g(M.lib("pop"), AT["s8:balik"], .08)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
