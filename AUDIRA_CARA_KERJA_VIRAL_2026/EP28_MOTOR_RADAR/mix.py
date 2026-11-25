"""EP28 sound: an anime opening-style "road drive" bed. 152 bpm four-on-the-floor with clap, an octave-jumping
synth bass in D minor and a bright square-wave arpeggio, dropping to half-time while the bike stands still in the jam.
Under it: a parallel-twin engine hum whose pitch follows the bike's speed profile, radar chirps (rising sine sweeps)
for emitted pulses and falling pings for echoes, impact hits on the impact frames, ticking indicator relays in the
blind-spot beat, warning beeps on the danger beat, slash whooshes on every panel change.
Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, swell, rumble

M = Mix(2828)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
OUT = B["outroAt"]
STOP_A, STOP_B = AT["s6:berhenti"], AT["s6:perintah"]


def sq(f, dur, n=7):
    t = np.arange(int(dur * SR)) / SR
    return sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 2 * n, 2))


def chirp(f0, f1, dur=.18):
    t = np.arange(int(dur * SR)) / SR
    ph = 2 * np.pi * (f0 * t + (f1 - f0) * t * t / (2 * dur))
    return np.sin(ph) * np.minimum(1, t / .004) * np.exp(-t * 9)


def clap(dur=.16):
    t = np.arange(int(dur * SR)) / SR
    n = M.band(rng.standard_normal(len(t)), 1200, 6000)
    env = np.exp(-t * 28) * (1 + .6 * (np.sin(2 * np.pi * 90 * t) > 0))
    return norm(n) * env


def hat(dur=.04):
    t = np.arange(int(dur * SR)) / SR
    return norm(M.band(rng.standard_normal(len(t)), 7000, 15000)) * np.exp(-t * 110)


# --- drive kit + bass + arpeggio, 152 bpm; half-time and quiet while stopped ---
bt = 60 / 152
roots = [73.42, 73.42, 87.31, 98.0, 58.27, 58.27, 65.41, 65.41]  # D D F G Bb Bb C C (two beats each)
arp = [293.7, 349.2, 440.0, 523.3, 440.0, 349.2]
music_m = np.zeros(N)
tp, i = .05, 0
while tp < END + 1.5:
    stopped = STOP_A - .3 <= tp < STOP_B + .2
    lvl = .45 if stopped else (.7 if S["s6"] <= tp < S["s7"] else 1.0)
    if not stopped or i % 2 == 0:
        g(M.thump(.24), tp, .075 * lvl)
    if i % 2 == 1 and not stopped:
        g(clap(), tp, .03 * lvl)
    g(hat(), tp + bt / 2, .01 * lvl)
    f = roots[(i // 2) % 8] * (2 if i % 2 else 1)
    b = sq(f, bt * .85, 4)
    tt = np.arange(len(b)) / SR
    b = lowpass(b, 900) * np.minimum(1, tt / .006) * np.exp(-tt * 4)
    j = int(tp * SR); e = min(N, j + len(b))
    music_m[j:e] += .045 * lvl * b[: e - j]
    if not stopped:
        for h in range(2):
            ft = arp[(i * 2 + h) % len(arp)]
            a = sq(ft, bt * .4, 3)
            ta = np.arange(len(a)) / SR
            a = lowpass(a, 3200) * np.minimum(1, ta / .004) * np.exp(-ta * 10)
            j = int((tp + h * bt / 2) * SR); e = min(N, j + len(a))
            music_m[j:e] += .012 * lvl * a[: e - j]
    tp += bt
    i += 1
e_m = M.env([(0, 1), (END, 1), (END + 1.2, .5), (DUR - .2, 0), (DUR, 0)])
music = stereo(music_m * e_m, .25 * music_m * e_m * np.sin(2 * np.pi * T * .09)) * 1.6

# --- engine hum: parallel twin firing pulses, pitch follows the speed profile ---
vk = [(0, 13), (AT["s5:cruise"], 13), (AT["s5:cruise"] + 1.6, 11), (AT["s6:macet"], 11), (STOP_A + .5, 0), (STOP_B, 0),
      (STOP_B + 1.6, 7), (AT["s7:mengerem"], 8), (AT["s7:menambah"] + .6, 3.5), (S["s8"], 6), (S["s8"] + 3, 13), (DUR, 13)]
vk = sorted(vk)
v = np.interp(T, [a for a, _ in vk], [b for _, b in vk])
f_eng = 28 + 3.4 * v  # idle ~28 Hz firing, cruise ~72 Hz
ph = 2 * np.pi * np.cumsum(f_eng) / SR
eng = np.sin(ph) + .5 * np.sin(2 * ph + .3) + .25 * np.sign(np.sin(ph)) * .4
eng = lowpass(eng, 420) + .15 * lowpass(rng.standard_normal(N), 300) * (v / 13)
eng = norm(eng)
e_eng = M.env([(0, .8), (S["s3"], .45), (S["s5"], .55), (S["s6"], .7), (S["s8"], .8), (END, .6), (DUR, 0)])
g(np.stack([eng * e_eng, np.roll(eng, 431) * e_eng], 1), 0, .045)
# wind noise rising with speed
wind = lowpass(rng.standard_normal(N), 2200) * (v / 13) ** 1.5
g(np.stack([wind, np.roll(wind, 900)], 1) * .5, 0, .02)

# --- radar chirps (same pulse rhythm as the visual) ---
def pulses(a, b, period, phase, gain, echo=True):
    k = np.ceil((a - phase) / period)
    while phase + k * period < b:
        te = phase + k * period
        g(chirp(1800, 3600), te, gain)
        if echo:
            g(chirp(3200, 2200, .14), te + .55, gain * .6)
        k += 1

pulses(0, S["s2"] - .3, 1.1, 0.0, .022)
pulses(AT["s3:menembakkan"], S["s4"], 1.6, AT["s3:menembakkan"], .03)
pulses(S["s4"], S["s5"], .95, S["s4"], .018)
pulses(AT["s5:Radar"], AT["s5:mengedipkan"], 1.0, AT["s5:Radar"], .02)

# --- panel slashes ---
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), S[k] - .3, .055)
# --- hook ---
g(M.lib("riser"), max(0, AT["s1:pertama"] - 1.6), .03)
g(M.lib("impact-bass-1"), AT["s1:pertama"] + .05, .1)
g(M.lib("glitch-1"), AT["s1:pertama"] + .05, .035)
# --- s2 signs/cards ---
for kk in ("s2:EICMA", "s2:Ducati", "s2:Africa"):
    g(M.lib("pop"), AT[kk], .055)
# --- s3 echo return impact ---
g(M.lib("ping"), AT["s3:gema"], .07)
g(M.lib("impact-bass-1"), AT["s3:gema"] + .1, .07)
g(M.lib("sparkle"), AT["s3:sepertiga"], .04)
g(M.lib("click"), AT["s3:situ"], .05)
# --- s4 doppler: siren-like glide ---
tt = np.arange(int(1.6 * SR)) / SR
siren = np.sin(2 * np.pi * np.cumsum(700 + 260 * np.sin(2 * np.pi * 1.6 * tt) + 160 * tt) / SR) * np.minimum(1, tt / .05) * np.exp(-tt * 1.4)
g(siren, AT["s4:sirene"], .028)
g(M.lib("chime"), AT["s4:selisih"], .04)
# --- s5 blind spot + indicator relay ticks ---
g(M.lib("ping"), AT["s5:titik"], .05)
t0 = AT["s5:mengedipkan"]
while t0 < S["s6"] - .2:
    g(M.lib("click-soft"), t0, .06)
    t0 += .125
g(swell(rng, 1.6, 200, 2400), AT["s5:mengedipkan"] - 1.4, .05)
# --- s6 stop & go ---
g(swell(rng, 1.8, 400, 90), STOP_A - 1.2, .05)
g(M.thump(.3), STOP_A + .4, .06)
g(M.lib("click"), AT["s6:melepas"], .07)
g(M.lib("click"), AT["s6:melepas"] + .14, .05)
g(M.lib("error"), AT["s6:tuas"], .035)
g(M.lib("click-soft"), STOP_B, .08)
g(swell(rng, 1.6, 90, 700), STOP_B + .1, .05)
# --- s7 warning beeps, brake assist, impact ---
for j in range(4):
    g(M.tone([1320, 1980], .09), AT["s7:bahaya"] + j * .18, .035)
g(rumble(rng, 1.4, 70), AT["s7:menambah"], .05)
g(M.lib("impact-bass-1"), AT["s7:sendiri"] + .05, .1)
g(M.lib("glitch-2"), AT["s7:sendiri"] + .05, .03)
# --- s8 + outro ---
g(M.lib("riser"), AT["s8:menyetir"] - 1.0, .03)
g(M.lib("chime"), OUT + .05, .08)
M.finish(music)
print("duration", DUR)
