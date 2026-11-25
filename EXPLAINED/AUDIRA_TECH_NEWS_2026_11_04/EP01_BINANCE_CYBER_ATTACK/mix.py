"""EP01 sound: server hall hum, keyboard, alerts, glitch, blockchain ticks, bass hits, tension riser. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(6300)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
K, AT = B["K"], B["AT"]
w = M.word

# server room: fan noise band + 60 Hz mains family, fades as the camera leaves the building
fan = M.band(rng.standard_normal(N), 180, 1400)
fan /= np.abs(fan).max()
hum = .5 * np.sin(2 * np.pi * 60 * T) + .28 * np.sin(2 * np.pi * 120 * T) + .1 * np.sin(2 * np.pi * 180 * T)
e_hall = M.env([(0, 1), (K["s4"], 1), (K["s4"] + 3, 0), (DUR, 0)])
# dark score: minor drone + slow pulse climbing to the laundering run, then opening out for the question
drift = 1 + .0014 * np.sin(2 * np.pi * .06 * T)
drone = sum(a * np.sin(2 * np.pi * f * drift * T + p) for f, a, p in [(49, 1, 0), (49.25, .7, 1), (73.42, .42, 2), (98.2, .3, .5), (116.54, .16, 1.2)])
times, t = [], .2
while t < DUR - 3.2:
    times.append(t)
    t += 60 / np.interp(t, [0, K["breach"], K["rest"], K["s6"], K["s7"], DUR], [62, 76, 112, 84, 70, 60])
pulse = np.zeros(N)
L = int(.38 * SR)
tt = np.arange(L) / SR
kick = np.sin(2 * np.pi * (44 * tt + 30 * (1 - np.exp(-tt * 28)) / 28)) * np.exp(-tt * 10)
for k in times:
    i = int(k * SR)
    pulse[i:i + L] += kick[: N - i]
cluster = sum(a * np.sin(2 * np.pi * f * T + p) for f, a, p in [(740, .5, 0), (784, .4, 1), (1174.7, .2, 2)]) * (.6 + .4 * np.sin(2 * np.pi * .19 * T))
e_d = M.env([(0, .55), (K["breach"], .7), (K["rest"], 1), (K["s6"], .7), (K["s7"], .85), (K["q"], .45), (DUR - 1.2, .3), (DUR, 0)])
e_p = M.env([(0, .4), (K["breach"], .7), (K["rest"], 1), (K["s6"], .55), (K["s7"], .7), (K["q"] - .3, .6), (K["q"], 0), (DUR, 0)])
e_c = M.env([(0, 0), (K["breach"], 0), (K["breach"] + 2, .5), (K["s3"] + 5, .4), (K["rest"], 1), (K["s6"], 0), (K["q"], 0), (K["q"] + 3, .7), (K["end"], 0), (DUR, 0)])
mono = .05 * drone * e_d + .17 * pulse * e_p + .009 * cluster * e_c + .018 * hum * e_hall
side = .016 * fan * e_hall + .009 * cluster * e_c
music = stereo(mono + .014 * fan * e_hall, side) * 1.8

# ---- SFX ----
g = M.put
g(M.thump(), 0.02, .2)
g(M.lib("impact-bass-1"), .12, .08)
# keyboard while the attacker prepares, under the clock
g(M.lib("typing"), w("s2", "Menurut") - .1, .05)
g(M.lib("typing"), K["s3"] + 2, .03)
# transaction blips inbound: soft, regular, a healthy system
for i in range(int(K["breach"] * 3.2)):
    g(M.tone((1568,), .035, 60), .4 + i / 3.2, .012)
# breach: alarm two-tone, glitch, bass
for i in range(5):
    g(M.tone((880, 1320), .16, 6), K["breach"] + i * .34, .032)
g(M.lib("glitch-2"), K["breach"] - .05, .08)
g(M.lib("impact-bass-1"), K["breach"], .1)
g(M.thump(), K["breach"], .2)
# the clock runs: fast outbound blips falling in pitch
for i in range(46):
    g(M.tone((2200 - i * 18,), .03, 70), K["breach"] + .3 + i * .12, .012)
g(M.lib("riser"), K["s3"] - 2.2, .03)
g(M.lib("glitch-1"), K["s3"], .05)
for key in ("s3:laptop", "s3:menemukan", "s3:Laporan"):
    g(M.lib("click"), AT[key], .1)
g(M.thump(.2), AT["s3:Belum"], .16)
g(M.lib("whoosh-cinematic"), K["s4"] - .25, .08)
g(M.lib("riser"), w("s4", "Korea") - 2.0, .04)
g(M.lib("impact-bass-1"), w("s4", "Korea"), .1)
g(M.thump(), w("s4", "Korea"), .2)
g(M.lib("pop"), AT["s4:TraderTraitor"], .07)
g(M.lib("whoosh-short"), K["s5"] - .3, .1)
# freezing: glassy high ticks as blocks lock
for i in range(14):
    g(M.tone((3136 + i * 40, 4186), .05, 50), K["frozen"] + i * .06, .016)
# laundering: chain confirmations pile up, density and pitch rise with the wallet count
tb = rng.uniform(K["rest"], K["next"], 150)
for x in np.sort(tb):
    f = 900 + 1700 * (x - K["rest"]) / (K["next"] - K["rest"]) + rng.uniform(-120, 120)
    g(M.tone((f,), .028, 80), x, .012)
g(M.lib("glitch-3"), K["next"] - .1, .05)
for key in ("s5:DeFi", "s5:instant"):
    g(M.lib("whoosh-short"), AT[key] - .08, .08)
    g(M.thump(.18), AT[key], .1)
g(M.lib("whoosh-cinematic"), K["s6"] - .5, .09)
# recovery: each disc locks in, a clean rising chain
for i in range(19):
    g(M.tone((392 * 2 ** (i / 12),), .1, 26), K["replace"] + i * .1, .026)
g(M.lib("chime"), AT["s6:US$6"], .05)
g(M.lib("whoosh-short"), K["s7"] - .3, .07)
g(M.thump(), AT["s7:membantah"], .18)
g(M.lib("impact-bass-1"), AT["s7:membantah"], .07)
g(M.lib("whoosh-cinematic"), K["s7e"] - .4, .07)
for key in ("s8:seberapa", "s8:aman", "s8:aset", "s8:kita"):
    g(M.thump(.16), AT[key], .09)
g(M.lib("chime"), B["outroAt"] + .05, .08)

M.finish(music)
print("duration", DUR)
