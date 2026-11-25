"""EP12 sound: storm-airfield bed (rain hiss, gusting wind band, distant rolling thunder) under a low tense cello-like drone
in D minor that opens to a warm major chord when the aircraft lands. Jet spool-ups on each go-around, a gate chime per
stabilised gate, an alarm pulse on "batalkan", gear clunks, tyre chirp at touchdown. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell, thunder, rumble

M = Mix(1213)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}

# weather bed: rain hiss + gust band whose level breathes slowly
rain = norm(rng.standard_normal(N) - lowpass(rng.standard_normal(N), 2500))
wind = norm(lowpass(rng.standard_normal(N), 700) - lowpass(rng.standard_normal(N), 90))
gust = .55 + .45 * np.sin(T * .9) * np.sin(T * .37 + 1.2)
e_w = M.env([(0, 1), (S["s6"], 1), (S["s6"] + .5, .35), (S["s7"], 1), (S["s8"], .9), (S["s8"] + 6, .35), (DUR, .2)])
# drone: D minor colour, then D major on the landing
dmin = drone(T, 73.4, ((1, 1), (1.5, .4), (2.38, .22), (1.004, .5)))
dmaj = drone(T, 73.4, ((1, 1), (1.5, .45), (2.52, .25), (2.0, .3)))
land = M.env([(0, 0), (S["s8"], 0), (S["s8"] + 2.5, 1), (DUR, 1)])
e_p = M.env([(0, .6), (S["s3"], .75), (S["s6"], .9), (S["s7"], 1), (END, .7), (DUR - .2, 0), (DUR, 0)])
pad = (dmin * (1 - land) + dmaj * land) * e_p
mono = .05 * rain * e_w + .06 * wind * gust * e_w + .05 * pad
side = .03 * (np.roll(rain, 9001) - rain) * e_w + .02 * np.roll(wind, 4410) * gust + .015 * pad
music = stereo(mono, side) * 1.6
# slow pulse (heartbeat-like low tom) under the tension scenes
for tp in np.arange(S["s4"], S["s8"], .86):
    g(M.thump(.28), tp, .045 if S["s6"] <= tp < S["s7"] else .03)


def spool(at, gain, dur=4.5):
    """Jet spool-up: rising whine plus broadband roar."""
    t = np.arange(int(dur * SR)) / SR
    f = 380 + 1700 * (1 - np.exp(-t * 1.3))
    whine = np.sin(2 * np.pi * np.cumsum(f) / SR) * .25
    roar = norm(lowpass(rng.standard_normal(len(t)), 900)) * np.minimum(1, t / .8)
    env = np.minimum(1, t / .5) * np.minimum(1, (dur - t) / 1.2)
    g((whine + roar) * env, at, gain)


def clunk(at, gain):
    g(M.thump(.35), at, gain)
    g(M.burst(.08, 70, 2), at + .02, gain * .6)


g(thunder(rng, 5.0, .6), .2, .16)
spool(AT["s1:batal"] - .1, .14)
g(M.lib("whoosh-cinematic"), S["s2"] - .3, .06)
g(swell(rng, 3.5, 120, 1400), AT["s2:angin"] - .4, .1)
g(M.lib("click"), AT["s2:Kru"], .05)
g(M.lib("whoosh-cinematic"), S["s3"] - .3, .06)
g(swell(rng, 2.5, 150, 1600), AT["s3:hanyut"] - .3, .08)
g(M.lib("pop"), AT["s3:moncong"] + .4, .05)
g(M.lib("whoosh-cinematic"), S["s4"] - .3, .06)
g(M.lib("click-soft"), AT["s4:rudder"], .07)
g(M.lib("click-soft"), AT["s4:sayap"], .07)
g(M.lib("error"), AT["s4:Terlalu"] + .4, .05)
g(M.lib("whoosh-cinematic"), S["s5"] - .3, .06)
g(swell(rng, 3.0, 200, 2200), AT["s5:Hembusan"] - .2, .12)
for k in ("s5:seribu", "s5:lima"):
    g(M.lib("chime"), AT[k], .06)
for k in ("s5:Kecepatan", "s5:turun", "s5:konfigurasi"):
    g(M.lib("click"), AT[k], .06)
for i in range(3):
    g(M.tone([880, 1108], .16), AT["s5:meleset"] + i * .22, .05)
g(M.lib("impact-bass-1"), AT["s5:batalkan"], .12)
spool(AT["s5:batalkan"], .07, 3)
g(M.lib("whoosh-cinematic"), S["s6"] - .3, .06)
g(M.lib("riser"), S["s6"] + .2, .04)
g(M.lib("sparkle"), AT["s6:tiga"], .06)
g(M.lib("impact-bass-1"), AT["s6:Padahal"] + .3, .08)
g(M.lib("whoosh-cinematic"), S["s7"] - .3, .06)
spool(AT["s7:TOGA"] - .1, .16, 6)
g(rumble(rng, 4, 60, .4), AT["s7:TOGA"], .1)
g(M.lib("whoosh"), AT["s7:hidung"], .05)
clunk(AT["s7:flap"], .06)
clunk(AT["s7:roda"], .1)
clunk(AT["s7:roda"] + 1.8, .07)
g(M.lib("ping"), AT["s7:satu"], .04)
g(M.lib("whoosh-cinematic"), S["s8"] - .3, .06)
td = S["s8"] + 4.2
g(M.burst(.18, 30, 4), td, .1)
g(M.burst(.12, 40, 4), td + .3, .06)
g(rumble(rng, 3, 90, .2), td, .06)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
