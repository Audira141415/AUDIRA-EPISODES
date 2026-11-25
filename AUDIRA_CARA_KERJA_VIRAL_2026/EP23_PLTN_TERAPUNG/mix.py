"""EP23 sound: a calm "drafting room at sea" bed. Neutral, not ominous: a warm A-major-ish pad (A2 + E3 + C#4, slow
chorus), a soft sea wash (filtered noise breathing on a 9 s swell), and a pen-plotter tick pattern at 84 bpm that lightens
in the explanation. SFX: pen strokes on panel draws, soft clicks on fission, a low steady turbine hum in s5, water flow in
s6, a distant tug horn tone in s7, a paper stamp on the rule change. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell, crackle, rumble

M = Mix(2323)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}


def pen(dur=.35):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = norm(M.band(rng.standard_normal(n), 2500, 7000))
    return x * np.minimum(1, t / .01) * np.minimum(1, (dur - t) / .08) * (.6 + .4 * np.sin(2 * np.pi * 9 * t) ** 2)


def tone(f, dur, dec=1.5):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * dec) * np.minimum(1, t / .05)


# bed: warm pad + sea wash
pad = drone(T, 110.0, ((1, 1), (1.003, .7), (1.5, .45), (2.52, .18), (3.0, .12)))
sea = norm(lowpass(rng.standard_normal(N), 700) - lowpass(rng.standard_normal(N), 120))
sea_env = .45 + .55 * np.sin(2 * np.pi * T / 9.0) ** 2
e_p = M.env([(0, .55), (S["s3"], .8), (S["s5"], 1.0), (S["s7"], .9), (END, .7), (DUR - .2, 0), (DUR, 0)])
e_s = M.env([(0, 1), (S["s3"] - .3, 1), (S["s3"] + .5, .35), (S["s5"], .5), (S["s6"], 1.2), (S["s7"], .7), (S["s8"], 1), (DUR - .2, 0), (DUR, 0)])
mono = .045 * pad * e_p + .03 * sea * sea_env * e_s
side = .015 * pad * e_p * np.sin(2 * np.pi * T * .09) + .018 * (np.roll(sea, 7001) - sea) * sea_env * e_s
music = stereo(mono, side) * 1.9
# plotter ticks, 84 bpm, quieter in s6
bt = 60 / 84
tp, i = .2, 0
while tp < END:
    on = .5 if S["s6"] <= tp < S["s7"] else 1.0
    g(M.lib("click-soft"), tp, (.022 if i % 4 else .034) * on)
    tp += bt / 2
    i += 1

# panel draws: a pen stroke for every plotted reveal
for k, v in AT.items():
    if k.startswith(("s2:Rosatom", "s2:swasta", "s2:dua", "s3:Neutron", "s3:Batang", "s4:dipompa", "s4:sirkuit", "s5:batu", "s5:kabel", "s6:kondensor", "s6:menyentuh", "s6:hangat", "s7:dirakit", "s7:Akademik", "s7:Rencananya", "s1:aturan")):
        g(pen(), v - .05, .035)
# scene turns: soft paper whoosh
for sc in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), S[sc] - .25, .05)
# s1
g(M.lib("chime"), .05, .04)
g(M.lib("click"), AT["s1:lokasi"], .05)
g(M.thump(.3), AT["s1:daratan"], .07)
# s2
g(M.lib("ping"), AT["s2:Oktober"], .045)
g(M.lib("pop"), AT["s2:dua"], .05)
g(M.lib("click"), AT["s2:megawatt"], .05)
g(M.lib("error"), AT["s2:izin"] + .3, .02)
# s3: section, dive, fission clicks, rods
g(swell(rng, 1.6, 200, 1500), AT["s3:Jantungnya"] - .3, .05)
g(M.lib("whoosh-cinematic"), AT["s3:Neutron"] - .5, .06)
for k in range(10):
    g(M.lib("click-soft"), AT["s3:menabrak"] + k * .31 * (1 + .1 * (k % 3)), .04)
g(M.lib("sparkle"), AT["s3:terbelah"], .03)
g(swell(rng, 1.4, 900, 160), AT["s3:Batang"], .05)
g(M.thump(.25), AT["s3:menyerap"] + .3, .06)
# s4: pump pulse + flow
for k in range(6):
    g(M.thump(.18), AT["s4:dipompa"] + k * .55, .03)
g(swell(rng, 2.5, 300, 2500), AT["s4:sirkuit"], .035)
g(crackle(rng, 1.2, 40), AT["s4:uap"], .02)
# s5: turbine hum spins up, cable pulse
hs = AT["s5:Uap"] - .3
hd = S["s6"] - hs + .5
th = np.arange(int(hd * SR)) / SR
spin = np.minimum(1, th / 1.6)
hum = (np.sin(2 * np.pi * np.cumsum(55 + 45 * spin) / SR) + .4 * np.sin(2 * np.pi * np.cumsum(110 + 90 * spin) / SR)) * spin * np.minimum(1, (hd - th) / .6)
g(np.stack([hum, hum], 1), hs, .025)
g(M.lib("riser"), AT["s5:kabel"] - 1.0, .03)
g(M.lib("ping"), AT["s5:daratan"], .04)
# s6: water flow, warm discharge
g(swell(rng, 3.0, 150, 900), AT["s6:lautnya"] - .2, .05)
g(rumble(rng, 3.0, 90), AT["s6:kondensor"], .03)
g(M.lib("click"), AT["s6:menyentuh"], .04)
g(swell(rng, 2.0, 600, 200), AT["s6:hangat"] - .3, .04)
# s7: route map, tug horn, return
g(M.lib("whoosh-cinematic"), S["s7"] - .5, .07)
g(tone(98, 1.6, 1.2), AT["s7:tunda"], .04)
g(tone(146.8, 1.4, 1.4), AT["s7:tunda"] + .05, .02)
g(M.lib("pop"), AT["s7:Akademik"], .04)
g(M.lib("chime"), AT["s7:2020"], .03)
g(swell(rng, 2.0, 200, 1200), AT["s7:pulang"] - .3, .04)
# s8: stamp + outro
g(M.lib("whoosh-cinematic"), S["s8"] - .4, .06)
g(M.lib("impact-bass-1"), AT["s8:perairan"], .06)
g(pen(.5), AT["s8:perairan"] - .3, .04)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
