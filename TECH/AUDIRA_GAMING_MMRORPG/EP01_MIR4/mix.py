"""EP01 sound: low dungeon drone in D minor, slow war drum, cold ore shimmer. Foley: pick on crystal, furnace roar, chain, the gate slam. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4040)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
AT = json.load(open("PROJECT/beats.json", encoding="utf8"))["AT"]
OUT = json.load(open("PROJECT/beats.json", encoding="utf8"))["outroAt"]
s, g, w = M.scene, M.put, M.word
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
hack, slam, stop = AT["s6:dibobol"], AT["s7:disetop"], AT["s1:disetop"]
saw = lambda f, d=0: sum(np.sin(2 * np.pi * (f + d) * h * T + h) / h for h in range(1, 7))
drone = M.band(saw(36.71) + saw(36.71, .2) + .5 * saw(55) + .3 * saw(73.42, .3), 28, 420); drone /= np.abs(drone).max()
air = M.band(rng.standard_normal(N), 900, 3800); air /= np.abs(air).max()
shim = M.band(sum(np.sin(2 * np.pi * f * T + i) * (.6 + .4 * np.sin(T * (.3 + i * .07))) for i, f in enumerate((587.3, 880, 1174.7, 1318.5))), 400, 2400); shim /= np.abs(shim).max()
e = M.env([(0, .75), (K["s3"], 1), (hack, 1.25), (slam, 1.2), (slam + .6, .4), (K["s8"], .55), (END, .6), (DUR - .4, 0), (DUR, 0)])
se = M.env([(0, 1), (K["s3"], .35), (K["s5"], .6), (hack, .2), (K["s8"], .5), (END, .5), (DUR, 0)])
drum = M.mono()
beat = 60 / 66
for b in range(int(END / beat)):
    t0 = b * beat
    if t0 > slam + .3 and t0 < K["s8"]:
        continue
    k = M.note(52 if b % 2 == 0 else 46, .55, "sine", 6)
    M.lay(drum, k, t0, 1.0 if b % 4 == 0 else .55)
music = stereo(.5 * drone * e + .5 * drum * M.env([(0, .5), (K["s6"], .9), (slam, 1), (K["s8"], .3), (END, .3), (DUR, 0)]) + .11 * shim * se + .03 * air, .05 * shim * se + .03 * drone * e)

def clink(t, a=.12):
    g(M.tone((2150, 3380, 5100), .12, 34), t, a * .55); g(M.band(M.burst(.05, 90, 2), 1800, 9000), t, a); g(M.thump(.1), t, a * .4)
# pick strikes follow the swing rhythm in world3d.js: one every 1/2.3 s, on the downswing
for x in np.arange(.15, K["s3"] - 1.2, 1 / 2.3):
    clink(x, .09 if x < K["s2"] else .05)
g(M.lib("whoosh-short"), AT["s1:kripto"] - .25, .06); g(M.lib("sparkle"), AT["s1:kripto"], .06)
g(M.lib("impact-bass-1"), stop, .16); g(M.thump(.6), stop, .3)
for i in range(6):
    g(M.tone((180 + i * 21, 420), .14, 18), stop + .02 + i * .022, .04)
g(M.lib("whoosh-cinematic"), K["s2"] - .3, .05)
# monster footfalls while it crosses the mine
for x in np.arange(K["s2"] + .4, K["s3"] - .6, 2.24):
    g(M.thump(.5), x, .12)
# furnace bed
sm = AT["s3:smelting"]; dr = AT["s3:DRACO"]
roar = M.band(rng.standard_normal(N), 60, 700); roar /= np.abs(roar).max()
fe = M.env([(sm - .7, 0), (sm + .9, 1), (K["s4"] + 3, .6), (K["s5"], 0), (DUR, 0)])
M.fx += np.stack([roar * fe * .07, np.roll(roar, 400) * fe * .07], 1)
for i in range(30):
    g(M.tone((1300 + (i * 311) % 1500,), .03, 80), sm + .3 + i * .1, .014)
g(M.lib("ping"), dr, .08); g(M.thump(.35), dr, .14); g(M.lib("sparkle"), dr + .05, .05)
g(M.lib("whoosh"), K["s4"] - .25, .05)
for k_, a in (("s4:40", .07), ("s4:WEMIX", .07), ("s4:biaya", .07), ("s4:pajak", .1)):
    g(M.lib("click"), AT[k_], a)
g(M.thump(.4), AT["s4:pajak"], .13)
g(M.lib("whoosh"), K["s5"] - .25, .05)
# chain rattles up the climb
for x in np.arange(K["s5"] + 1, K["s6"], .38):
    g(M.tone((1640 + rng.uniform(0, 500), 2710), .08, 42), x, .018)
g(M.lib("impact-bass-1"), hack, .17); g(M.thump(.8), hack, .34); g(M.lib("glitch-1"), hack, .07)
for i in range(8):
    g(M.tone((1900 + i * 240, 3000), .18, 26), hack + i * .035, .05)
g(M.lib("riser"), AT["s6:mencetak"] - 1.8, .03)
for x in rng.uniform(AT["s6:mencetak"], AT["s6:mencetak"] + 3, 70):
    g(M.tone((3000 + rng.uniform(0, 2500),), .04, 60), x, .012)
g(M.lib("error"), AT["s6:bridge"], .06)
g(M.lib("whoosh-cinematic"), K["s7"] - .3, .05)
# the gate comes down
g(M.band(M.burst(.42, 3, 2), 200, 1500), slam, .05)
land = slam + .42
g(M.lib("impact-bass-1"), land, .22); g(M.thump(1.1), land, .42); g(M.burst(1.3, 5, 1), land, .05)
for i in range(10):
    g(M.tone((240 + i * 37, 610, 1180), .3, 14), land + i * .018, .035)
g(M.lib("click"), AT["s7:Harga"], .07); g(M.thump(.35), AT["s7:Harga"], .1)
g(M.lib("pop"), AT["s8:penghasilan"], .05); g(M.lib("pop"), AT["s8:modal"], .05)
# closing card slams shut like the gate, softer, with the brand chime after
g(M.thump(.4), OUT + .28, .14); g(M.lib("chime"), OUT + .34, .07)
M.finish(music)
print("duration", DUR)
