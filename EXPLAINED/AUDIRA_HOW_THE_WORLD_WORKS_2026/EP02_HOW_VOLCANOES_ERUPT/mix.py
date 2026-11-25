"""EP02 sound: forest air on the surface, the earth's rumble underground, boiling bubbles that grow with pressure, lava hiss on the thin flow, then the blast and rolling rock. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import thunder, crackle, lowpass, norm, drone, rumble, pulses

M = Mix(1980)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT = B["AT"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
S = {k: s(k)["start"] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
G = AT["s6:ganas"]
air = norm(M.band(rng.standard_normal(N), 300, 2400))
air2 = norm(M.band(rng.standard_normal(N), 300, 2400))
under = rumble(rng, DUR, 62, .45)[:N]
under = np.pad(under, (0, max(0, N - len(under))))
lava = norm(M.band(rng.standard_normal(N), 2500, 9000)) * (.7 + .3 * np.sin(T * 3.1) * np.sin(T * 1.3))
ash = norm(M.band(rng.standard_normal(N), 200, 1400))
ash2 = norm(M.band(rng.standard_normal(N), 200, 1400))
e_air = M.env([(0, 1), (S["s1"] + 3, 1), (S["s2"] + 1, .05), (S["s5"] - .1, .05), (S["s5"], .8), (S["s6"], .5), (S["s6"] + 1, .1), (DUR, 0)])
e_und = M.env([(0, .2), (S["s1"] + 2.5, .4), (S["s2"] + 2, 1), (S["s4"], 1.1), (S["s5"] - .1, 1.25), (S["s5"], .25), (S["s6"], .9), (G - .05, 1.5), (G + .4, 1.5), (S["s7"], .85), (S["s8"], .6), (END, .35), (DUR - .2, 0), (DUR, 0)])
e_lava = M.env([(0, 0), (AT["s5:Magma"], 0), (AT["s5:Magma"] + .8, .8), (S["s6"] - .1, .8), (S["s6"], 0), (DUR, 0)])
e_ash = M.env([(0, 0), (G, 0), (G + .25, 1.3), (S["s7"], .85), (S["s8"], .7), (END, .4), (DUR, 0)])
dr = drone(T, 41.2)
minor = np.sin(2 * np.pi * 41.2 * 1.2 * T) + .5 * np.sin(2 * np.pi * 41.2 * 2.4 * T)
e_d = M.env([(0, .1), (S["s2"], .5), (S["s4"], .9), (S["s5"], .35), (S["s6"], 1), (G, 1.2), (G + .1, .35), (S["s8"], .55), (END, .25), (DUR - .2, 0), (DUR, 0)])
e_m = M.env([(0, 0), (S["s3"], 0), (S["s4"], .5), (S["s5"], .2), (S["s6"], .9), (G, 1), (G + .1, 0), (DUR, 0)])
pulse = pulses(N, AT["s6:Magma"], G, 1.0, .3, .12)
mono = .03 * air * e_air + .22 * under * e_und + .012 * lava * e_lava + .05 * ash * e_ash + .05 * dr * e_d + .024 * minor * e_m + .12 * pulse
side = .012 * (air2 - air) * e_air + .018 * (ash2 - ash) * e_ash + .004 * lava * e_lava
music = stereo(mono, side) * 2.0
# ---- cues ----
g(M.lib("whoosh-cinematic"), S["s1"] + 2.3, .08)
g(rumble(rng, 2.5, 90), S["s2"] + .4, .16)
g(M.lib("impact-bass-1"), AT["s2:magma"], .07)
# boiling: bubble pops get lower and larger as they grow
def bub(f, dec, dur=.09):
    x = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * (f * x + f * .9 * x * x / dur)) * np.exp(-x * dec) * np.minimum(1, x / .002)

gel, end4 = AT["s4:gelembung"], S["s5"]
for i in range(60):
    u = i / 60
    t0 = gel - .3 + u * (end4 - gel) + rng.uniform(-.06, .06)
    g(bub(rng.uniform(900, 1500) * (1 - u * .68), 34 - 18 * u, .07 + .08 * u), t0, .045 + .03 * u)
g(M.lib("riser"), end4 - 2.4, .03)
g(M.lib("whoosh-cinematic"), S["s5"] - .35, .08)
g(thunder(rng, 2.4, .2), AT["s5:Magma"], .05)
g(M.lib("click"), AT["s5:mengalir"], .05)
# sticky magma: slower, fatter pops under the plug, then silence before the blast
tt = AT["s6:Magma"]
while tt < G - .55:
    g(bub(rng.uniform(170, 300), 12, .2), tt, .1)
    tt += rng.uniform(.28, .55)
g(M.lib("riser"), G - 2.1, .06)
g(M.lib("impact-bass-1"), G, .16)
g(M.thump(.9), G, .34)
g(thunder(rng, 7.0, 1.8), G, .36)
for i in range(40):
    t0 = G + .5 + i * .13 + rng.uniform(-.05, .05)
    x = rng.standard_normal(int(.04 * SR)) * np.exp(-np.arange(int(.04 * SR)) / SR * 90)
    g(lowpass(x, rng.uniform(400, 1500)), t0, rng.uniform(.04, .12))
g(M.lib("click"), AT["s6:abu"], .05)
g(M.lib("whoosh-cinematic"), S["s7"] - .35, .07)
g(rumble(rng, 9.0, 140), AT["s7:aliran"], .17)
g(M.lib("ping"), AT["s7:100"], .05)
g(M.lib("ping"), AT["s7:ratusan"], .05)
g(M.thump(.5), AT["s8:gas"], .13)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
