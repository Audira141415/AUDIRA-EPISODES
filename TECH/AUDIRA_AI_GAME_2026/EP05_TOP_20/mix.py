"""EP05 sound: newsroom bed, a warm piano over soft mallets that turns thoughtful at the caveats and hopeful at the close, with typewriter and ticker details. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(5505)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
pn, pad, tk = M.mono(), M.mono(), M.mono()
beat = 60 / 88
chords = [[0, 7, 12, 16], [-3, 4, 9, 12], [-7, 0, 5, 9], [-5, 2, 7, 11]]
root = 196.0
t0, i = 0.0, 0
while t0 < END + 2:
    c = chords[(i // 8) % 4]
    M.lay(pn, M.note(root * 2 * 2 ** (c[[0, 2, 3, 2, 1, 2, 3, 2][i % 8]] / 12), 1.1, "pluck", 3, .004), t0, .55)
    if i % 8 == 0:
        for n_ in c[:3]:
            M.lay(pad, M.note(root / 2 * 2 ** (n_ / 12), beat * 4.6, "tri", .25, .4), t0, .35)
    M.lay(tk, M.band(M.burst(.016, 160, 1), 2500, 9000), t0, .14 if i % 2 == 0 else .06)
    t0 += beat / 2; i += 1
e = M.env([(0, .8), (K["s3"], 1), (K["s5"], .55), (K["s7"], .45), (K["s8"], 1), (END + .4, 1), (DUR, .1)])
music = stereo(.42 * pn * e + .5 * pad * e + .2 * tk * e, .1 * np.roll(pn, 800) * e)
g(M.lib("impact-bass-1"), AT["s1:besar"], .24)
g(M.lib("riser"), max(0, AT["s1:besar"] - 2), .1)
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh"), K[x] - .18, .09)
g(M.lib("typing"), K["s2"] + .1, .13)
g(M.lib("ping"), AT["s2:Klaim"], .1)
g(M.lib("chime"), AT["s3:289"], .11); g(M.lib("chime"), AT["s3:217"], .1)
g(M.lib("typing"), AT["s4:80"], .1)
g(M.lib("click"), AT["s4:500.000"] if "s4:500.000" in AT else AT["s4:80"] + 2, .14)
g(M.lib("click-soft"), AT["s5:Dua"], .2); g(M.lib("click-soft"), AT["s5:Seratus"], .2)
g(M.lib("whoosh-cinematic"), AT["s5:Seratus"] + .1, .1)
g(M.lib("glitch-1"), AT["s6:bagian"], .07)
g(M.lib("ping"), AT["s6:Build"], .12)
g(M.note(523, .4, "pluck", 5), AT["s7:Pendapatan"], .1)
g(M.thump(), AT["s7:pemesanan"], .16)
g(M.lib("impact-bass-1"), AT["s7:saham"], .18)
g(M.lib("sparkle"), AT["s8:Dari"], .1)
g(M.thump(), OUT, .22)
M.finish(music)
