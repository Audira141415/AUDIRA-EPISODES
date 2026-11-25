"""EP03 sound: fast sci-fi arpeggio with a reversed-feeling sub, a time-tick clock under everything, a ring whoosh on each dive. Foley: loot chime, sand, forge clang, market ticks. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(3090)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
beat = 60 / 104
arp, bass, clock = M.mono(), M.mono(), M.mono()
seq = [0, 7, 12, 15, 19, 15, 12, 7]
roots = [146.83, 146.83, 116.54, 130.81]
for i in range(int(END / (beat / 2))):
    t0 = i * beat / 2
    r = roots[(i // 16) % 4]
    M.lay(arp, M.note(r * 2 ** (seq[i % 8] / 12) * 2, beat * .7, "saw", 5.5, .004), t0, .34)
    if i % 4 == 0:
        M.lay(bass, M.note(r / 2, beat * 1.9, "saw", 1.4, .01), t0, .62)
    if i % 2 == 0:
        M.lay(clock, M.tone((3300, 5200), .022, 180), t0, .3)
arp = M.band(arp, 180, 5200); bass = M.band(bass, 35, 420)
chart = AT["s7:Harga"]
ae = M.env([(0, .55), (K["s2"], .8), (K["s4"], 1), (K["s6"], .8), (chart, .35), (K["s8"], .3), (END, .3), (DUR - .4, 0), (DUR, 0)])
be = M.env([(0, .8), (K["s4"], 1), (chart, 1), (chart + 2.2, .4), (K["s8"], .4), (END, .35), (DUR - .4, 0), (DUR, 0)])
music = stereo(.42 * arp * ae + .5 * bass * be + .1 * clock * ae, .16 * np.roll(arp, 900) * ae)
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    t = K[x]
    g(M.lib("whoosh-cinematic"), t - .45, .07); g(M.tone((210, 420), .5, 7), t - .02, .05); g(M.thump(.3), t, .1)
l = AT["s1:loot"]
g(M.lib("click"), l - .3, .08); g(M.lib("chime"), l, .07); g(M.lib("sparkle"), l + .1, .07)
g(M.thump(.3), l, .1)
# fight
h = AT["s2:melawan"]; d = AT["s2:drop"]
for x in (h, h + .35, h + .8):
    g(M.band(M.burst(.12, 34, 2), 900, 7000), x, .09); g(M.thump(.25), x, .14)
g(M.lib("impact-bass-1"), d - .15, .1); g(M.lib("sparkle"), d, .07); g(M.lib("ping"), d + .05, .06)
g(M.lib("pop"), AT["s3:Kosmetik"], .07); g(M.lib("pop"), AT["s3:SPACE"], .07)
# hourglass: sand hiss runs only while it drains
tk, hb = AT["s4:Token"], AT["s4:Habis"]
san = M.band(rng.standard_normal(N), 3200, 11000); san /= np.abs(san).max()
se = M.env([(tk - .3, 0), (tk + .1, 1), (hb - .1, 1), (hb, 0), (DUR, 0)])
M.fx += np.stack([san * se * .035, np.roll(san, 300) * se * .035], 1)
for i in range(6):
    t = tk + .25 + i * .5 + 2.3
    g(M.tone((1350, 2030, 3100), .22, 18), t, .045)
g(M.lib("riser"), hb + .2, .035); g(M.tone((440, 660, 880), 1.2, 3), hb + 1.2, .05)
# forge strikes
f = AT["s5:Forge"]; o = AT["s5:Open"]
x = f
while x < o:
    g(M.tone((1150, 2390, 3720, 5100), .4, 11), x + .1, .05); g(M.thump(.16), x + .1, .1)
    x += 1 / 1.25
for x in np.arange(o, s("s5")["end"], .24):
    g(M.tone((1900 + rng.uniform(0, 1500),), .03, 90), x, .012)
g(M.lib("error"), AT["s5:diekspor"] - .5, .03)
# cage slams shut around production
p = AT["s6:produksi"]
for i in range(12):
    g(M.tone((720 + i * 60, 1440), .1, 36), p + .04 + i * .045, .025)
g(M.thump(.5), p + .6, .18)
g(M.thump(.6), AT["s7:Maret"], .16); g(M.lib("ping"), AT["s7:Maret"] + .3, .05)
# the chart falls in pitch with the line
for i in range(44):
    g(M.tone((1760 * 2 ** (-i / 11),), .05, 40), chart + i * .05, .03)
g(M.lib("impact-bass-1"), chart + 2.2, .15); g(M.thump(.7), chart + 2.2, .22)
g(M.lib("pop"), AT["s1:loot"] + 3.2, .0)
g(M.lib("riser"), OUT - 1.4, .025); g(M.lib("chime"), OUT + .3, .07)
M.finish(music)
print("duration", DUR)
