"""EP15 sound: a clinical imaging-suite bed. Glassy sine bells on a slow D-minor arpeggio over a cool airy pad, a soft monitor
blip, and a nervous 5 Hz flutter whenever the tremor is shown. Switching stimulation on brings a power-up chirp and a faint
high buzz, and the pad resolves to a brighter chord. In the beta chapter a wobbling 20 Hz texture smooths out on "Stimulasi".
Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell

M = Mix(1515)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
ON1 = AT["s1:menghentikan"] + .15
ON5 = AT["s5:dinyalakan"]
ST6 = AT["s6:Stimulasi"]

air = norm(lowpass(rng.standard_normal(N), 3200) - lowpass(rng.standard_normal(N), 700))
dark = drone(T, 73.4, ((1, 1), (1.5, .4), (2.0, .25), (2.4, .12)))      # D minor colour
bright = drone(T, 73.4, ((1, 1), (1.5, .4), (2.0, .3), (2.52, .16)))   # major third: resolution after stimulation
onmask = M.env([(0, 0), (ON1, 0), (ON1 + 1, 1), (S["s2"], 1), (S["s2"] + .6, 0), (ON5, 0), (ON5 + 1.2, 1), (S["s6"], 1), (S["s6"] + .6, 0),
                (ST6, 0), (ST6 + 1.2, 1), (DUR, 1)])
e_p = M.env([(0, .55), (S["s3"], .7), (S["s7"], .8), (END, .6), (DUR - .2, 0), (DUR, 0)])
pad = (dark * (1 - onmask) + bright * onmask) * e_p
# tremor flutter: 5 Hz amplitude-modulated low noise while the shaking hand is on screen
tremor = M.env([(0, 1), (ON1, 1), (ON1 + 1.4, 0), (AT["s3:diuji"] - 3, 0), (AT["s3:diuji"] - 2.4, .8), (S["s4"], .8), (S["s4"] + .4, 0),
                (S["s5"] - .3, 0), (S["s5"], 1), (ON5 + .1, 1), (ON5 + 1.6, 0), (DUR, 0)])
flut = lowpass(rng.standard_normal(N), 260) * (0.5 + 0.5 * np.sin(2 * np.pi * 5.1 * T)) ** 2 * tremor
# beta wobble in s6
betam = M.env([(0, 0), (S["s6"], 0), (S["s6"] + .5, 1), (ST6, 1), (ST6 + 1.2, 0), (DUR, 0)])
wob = lowpass(rng.standard_normal(N), 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 20 * T)) * betam
# faint stimulation buzz (130 Hz, heavily filtered) when on
buzz = np.sin(2 * np.pi * 130 * T) * .5 + np.sin(2 * np.pi * 260 * T) * .2
buzz = buzz * onmask * M.env([(0, 1), (END, 1), (DUR - .2, 0), (DUR, 0)])
mono = .035 * air + .05 * pad + .06 * flut + .05 * wob + .012 * buzz
side = .014 * (np.roll(air, 7001) - air) + .014 * pad
music = stereo(mono, side) * 2.0

# glass bells: slow D-minor arpeggio, brighter after each stimulation onset
dm = [293.7, 349.2, 440.0, 587.3, 523.3, 440.0]
dM = [293.7, 370.0, 440.0, 587.3, 659.3, 440.0]
tp, i = .4, 0
while tp < END:
    on = float(np.interp(tp, T, onmask))
    f = (dM if on > .5 else dm)[i % 6]
    g(M.tone([f, f * 2.001, f * 3.003], 2.2, 2.6), tp, .028)
    tp += .75 if i % 6 != 5 else 1.6
    i += 1
# soft monitor blip every 2 s
for tb in np.arange(1.0, END, 2.0):
    g(M.tone([1568.0], .09, 30), tb, .018)

def power_on(at, gain):
    n = int(.7 * SR)
    t = np.arange(n) / SR
    chirp = np.sin(2 * np.pi * (300 * t + 900 * t * t)) * np.exp(-t * 3)
    g(chirp, at, gain)
    g(M.lib("click"), at - .02, gain * .9)
    g(M.thump(.35), at, gain * .8)

power_on(ON1, .12)
g(M.lib("riser"), ON1 - 1.2, .04)
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), S[k] - .3, .055)
g(M.lib("pop"), AT["s2:Jakarta"], .06)
g(M.thump(.45), AT["s2:pertama"], .14)
g(M.lib("click-soft"), AT["s2:dekade"], .07)
g(swell(rng, 2.4, 400, 3000), AT["s3:MRI"] - .2, .05)
g(M.lib("ping"), AT["s3:subtalamikus"], .05)
g(M.lib("ping"), AT["s3:globus"], .04)
g(swell(rng, 2.6, 200, 1200), AT["s3:masuk"] - .3, .05)
for j in range(4):
    g(M.lib("click-soft"), AT["s3:cincin"] + j * .09, .05)
g(swell(rng, 3.0, 300, 1800), AT["s4:Kabelnya"], .05)
g(M.lib("click"), AT["s4:stimulator"], .08)
g(M.lib("chime"), AT["s4:Inilah"], .05)
power_on(ON5, .13)
g(M.lib("typing"), AT["s5:130"] - .1, .03)
g(M.lib("sparkle"), AT["s5:Tremor"], .05)
g(M.lib("glitch-1"), AT["s6:Kenapa"], .035)
power_on(ST6, .09)
g(M.lib("ping"), AT["s7:FDA"], .05)
g(M.lib("click-soft"), AT["s7:mendengar"], .06)
g(M.lib("click-soft"), AT["s7:mengatur"], .06)
g(M.lib("sparkle"), AT["s7:orang"], .05)
g(M.lib("chime"), AT["s8:pengendali"], .05)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
