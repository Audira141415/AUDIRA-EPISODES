"""EP02 sound: a modal court theme on strings and horn that loses instruments as the game closes, ending on one tolling bell. Digital ticks sit on top of the medieval bed. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2030)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
down = AT["s6:berakhir"]
A = 110.0
scale = [0, 2, 3, 5, 7, 8, 10]  # natural minor
hz = lambda d: A * 2 ** (d / 12)
beat = 60 / 72
pad, horn, drum = M.mono(), M.mono(), M.mono()
prog = [(0, 7, 12), (5, 8, 12), (3, 7, 10), (7, 10, 14)]
for b in range(0, int(END / beat), 4):
    t0 = b * beat
    for d in prog[(b // 4) % 4]:
        n = M.note(hz(d), beat * 4.2, "saw", .25, .4)
        M.lay(pad, n, t0, .34)
motif = [12, 15, 14, 12, 10, 12, 7]
for b in range(8, int(down / beat), 16):
    for i, d in enumerate(motif):
        M.lay(horn, M.note(hz(d), beat * 1.1, "saw", 1.1, .05), b * beat + i * beat * .75, .36)
for b in range(int(END / beat)):
    t0 = b * beat
    if b % 2 == 0:
        M.lay(drum, M.note(62, .5, "sine", 7), t0, .9)
    M.lay(drum, M.burst(.08, 60, 3), t0 + beat / 2, .1)
pad = M.band(pad, 60, 1700); horn = M.band(horn, 110, 2300)
pe = M.env([(0, .7), (K["s3"], 1), (K["s6"], 1), (down + 2, .45), (K["s7"], .3), (K["s8"], .18), (END, .14), (DUR - .4, 0), (DUR, 0)])
he = M.env([(0, 1), (K["s6"], 1), (down + 1, 0), (DUR, 0)])
de = M.env([(0, .6), (K["s4"], .9), (K["s6"], .8), (down + 2, .2), (K["s7"], 0), (DUR, 0)])
music = stereo(.5 * pad * pe + .4 * horn * he + .45 * drum * de, .14 * pad * pe + .08 * horn * he)
tick = lambda t, a=.04, f=1800: (g(M.tone((f, f * 2), .05, 60), t, a), g(M.lib("click-soft"), t, a))
g(M.thump(.5), .04, .2); g(M.lib("impact-bass-1"), .05, .08)
close = AT["s1:tutup"]
g(M.lib("whoosh-short"), close - .25, .05); g(M.thump(.7), close, .3); g(M.lib("impact-bass-1"), close, .14)
g(M.lib("whoosh-cinematic"), K["s2"] - .3, .05); g(M.lib("whoosh"), K["s3"] - .25, .05)
for k_, f in (("s3:RUBY", 880), ("s3:sRUBY", 1175), ("s3:RUBYx", 1568)):
    g(M.lib("sparkle"), AT[k_], .05); tick(AT[k_], .05, f)
g(M.lib("whoosh"), K["s4"] - .25, .05)
j, b_ = AT["s4:Jual"], AT["s4:bursa"]
for x in np.arange(j, b_, .13):
    g(M.tone((1500 + ((x - j) / (b_ - j)) * 1500,), .03, 90), x, .012)
g(M.band(M.burst(.3, 16, 2), 900, 5000), (j + b_) / 2, .05); g(M.lib("ping"), (j + b_) / 2, .06)
g(M.lib("chime"), b_, .05)
g(M.lib("whoosh"), K["s5"] - .25, .05)
# gems pour in, then burn
for x in rng.uniform(K["s5"], K["s5"] + 1.1, 44):
    g(M.tone((2100 + rng.uniform(0, 1800), 4200), .05, 48), x, .014)
hb, tp = AT["s5:Hyper"], AT["s5:Tapi"]
fl = M.band(rng.standard_normal(N), 90, 1500); fl /= np.abs(fl).max()
fe = M.env([(hb - .1, 0), (hb + .5, 1), (tp, .5), (tp + .8, 0), (DUR, 0)])
M.fx += np.stack([fl * fe * .07, np.roll(fl, 500) * fe * .07], 1)
g(M.lib("riser"), hb - 1.2, .03); g(M.thump(.5), hb + 2.6, .16)
g(M.lib("whoosh-cinematic"), K["s6"] - .3, .05)
def bell(t, a=.16):
    b = sum(M.tone((f,), 3.2, d) * w for f, d, w in ((196, 1.1, 1), (392.8, 1.5, .55), (466.2, 1.9, .4), (588, 2.5, .3), (784, 3.2, .18)))
    g(b, t, a)
bell(down, .16)
g(M.lib("click"), AT["s6:Penjualan"], .08); g(M.lib("click"), AT["s6:Refund"], .08)
# each date tolls; the rail going dead gets a falling blip
bell(AT["s7:Desember"], .15); bell(AT["s7:Januari"], .15)
for i in range(7):
    g(M.tone((1500 - i * 170,), .06, 40), AT["s7:dihapus"] + i * .06, .03)
g(M.lib("click-soft"), AT["s7:dompet"], .07)
bell(s("s8")["start"] + .3, .1)
g(M.lib("sparkle"), s("s8")["start"] + .3, .04)
g(M.lib("chime"), OUT + .3, .07)
M.finish(music)
print("duration", DUR)
