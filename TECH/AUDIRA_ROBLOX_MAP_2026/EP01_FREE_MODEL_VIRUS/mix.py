"""EP01 sound: a clean minimal electronic bed (glassy sine arps, soft sub, tight ticks at 100 BPM) that gets
bit-crushed and stuttered whenever the hidden script wakes, then resolves to a calm major pad once the scripts are off.
UI clicks, glitch bursts and a soft snap mark the beats. Run from this folder."""
import json
import sys

sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(6801)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
SNAP = AT["s7:Scripts"]

# ---- clean bed ----
arp, sub, tick, pad = M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 100
root = 220.0
minor = [[0, 3, 7, 10, 12, 10, 7, 3], [-4, 0, 3, 7, 8, 7, 3, 0], [-2, 2, 5, 9, 10, 9, 5, 2], [-5, -1, 2, 5, 7, 5, 2, -1]]
major = [[0, 4, 7, 11, 12, 11, 7, 4], [5, 9, 12, 16, 17, 16, 12, 9]]
t0, i = 0.0, 0
while t0 < DUR:
    seq = major[(i // 16) % 2] if t0 >= SNAP + 0.3 else minor[(i // 16) % 4]
    f = root * 2 ** (seq[i % 8] / 12) * 2
    M.lay(arp, M.note(f, .32, "sine", 9, .003), t0, .5)
    M.lay(arp, M.note(f * 2, .2, "sine", 16, .002), t0, .12)
    if i % 4 == 0:
        M.lay(sub, M.note(root / 2 * 2 ** (seq[0] / 12), beat * 1.9, "sine", 1.2, .01), t0, .9)
    if i % 2 == 1:
        M.lay(tick, M.band(M.burst(.035, 120, 1), 5000, 12000), t0, .18)
    t0 += beat / 4
    i += 1
# calm resolve pad after the scripts are disabled
for k, (a, b) in enumerate([(SNAP + .3, K["s8"]), (K["s8"], END + 2.5)]):
    for st in ([0, 4, 7, 11] if k == 0 else [5, 9, 12, 16]):
        x = M.note(root * 2 ** (st / 12), b - a, "tri", .05, .6)
        M.lay(pad, x, a, .16)
e = M.env([(0, .8), (AT["s1:Tapi"], .9), (K["s4"], 1), (SNAP, .85), (END + .3, 1), (DUR - .6, .5), (DUR, 0)])
mono = (.5 * arp + .55 * sub + .25 * tick + .5 * pad) * e
side = .12 * np.roll(arp, 600) * e

# ---- corruption: bitcrush + stutter windows, deterministic per 1/12 s step ----
def h(n):
    x = np.sin(n * 12.9898 + 78.233) * 43758.5453
    return x - np.floor(x)


wins = [(AT["s1:Tapi"], AT["s1:virus"], .35), (AT["s1:virus"], AT["s1:virus"] + .6, 1), (AT["s1:virus"] + .6, K["s1e"], .3),
        (AT["s3:menunggu"], AT["s3:memanggil"], .35), (AT["s3:memanggil"], K["s3e"], .9),
        (AT["s4:diacak"], AT["s4:diacak"] + .9, .7), (AT["s5:kodenya"], AT["s5:kreator"], .3),
        (AT["s6:dicurigai"], AT["s6:dicurigai"] + .55, .8), (K["s7"] + .2, SNAP, .15)]
wins += [(K[s] - .3, K[s] + .18, .8) for s in ("s2", "s3", "s4", "s5", "s6", "s7")]


def corrupt(x):
    y = x.copy()
    for a, b, s in wins:
        ia, ib = int(a * SR), min(len(x), int(b * SR))
        seg = x[ia:ib]
        lv = max(3, int(64 * (1 - s) + 4))
        hold = 1 + int(s * 10)
        cr = np.round(seg * lv) / lv
        cr = np.repeat(cr[::hold], hold)[: len(seg)]
        out = (1 - min(1, s + .2)) * seg + min(1, s + .2) * cr
        step = int(SR / 12)
        for k0 in range(0, len(seg), step):
            n = int((ia + k0) / step)
            if h(n) < s * .6:
                sl = out[k0:k0 + int(step * .3)].copy()
                if len(sl):
                    reps = np.tile(sl, 4)[: min(step, len(out) - k0)]
                    out[k0:k0 + len(reps)] = reps
        y[ia:ib] = out
    # signal lost on "luar": music drops to a hiss
    la, lb = int((AT["s3:luar"] + .05) * SR), int((AT["s3:luar"] + .4) * SR)
    y[la:lb] = 0
    return y


mono, side = corrupt(mono), corrupt(side)
music = stereo(mono, side)
hiss = M.band(M.burst(.35, 0, 1), 2000, 9000)
g(hiss / max(1e-6, np.abs(hiss).max()), AT["s3:luar"] + .05, .08)

# ---- SFX ----
def blip(t, f=1800, a=.05):
    g(M.note(f, .05, "square", 40), t, a)


g(M.lib("click-soft"), .05, .16)
g(M.lib("whoosh-short"), AT["s1:berguna"] - .4, .12)
g(M.lib("pop"), AT["s1:berguna"], .16)
g(M.lib("glitch-1"), AT["s1:Tapi"], .07)
g(M.lib("glitch-2"), AT["s1:virus"], .2)
g(M.lib("impact-bass-1"), AT["s1:virus"], .22)
g(M.lib("error"), AT["s1:virus"] + .25, .1)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("glitch-3"), K[s] - .3, .06 if s == "s8" else .1)
    g(M.lib("whoosh-short"), K[s] - .2, .1)
g(M.lib("sparkle"), AT["s2:jutaan"], .12)
for k in range(18):
    blip(AT["s2:jutaan"] + .05 + k * .07, 2200 + 90 * (k % 5), .025)
g(M.lib("click"), AT["s2:klik"], .2)
g(M.lib("pop"), AT["s2:masuk"] + .3, .16)
g(M.thump(.25), AT["s2:masuk"] + .3, .14)
g(M.lib("ping"), AT["s3:wajar"], .1)
g(M.thump(.2), AT["s3:bergerak"], .12)
g(M.lib("chime"), AT["s3:suara"], .1)
g(M.lib("riser"), AT["s3:menunggu"], .07)
g(M.lib("glitch-1"), AT["s3:memanggil"], .16)
g(M.lib("glitch-2"), AT["s3:luar"], .2)
g(M.lib("error"), AT["s3:luar"] + .1, .12)
g(M.lib("impact-bass-1"), AT["s4:larangan"], .2)
g(M.lib("error"), AT["s4:require"], .08)
g(M.lib("error"), AT["s4:loadstring"], .08)
g(M.lib("glitch-3"), AT["s4:diacak"], .14)
g(M.lib("typing"), AT["s4:diacak"] + .1, .08)
g(M.lib("typing"), AT["s5:kodenya"], .07)
g(M.lib("chime"), AT["s5:rapi"], .12)
for w in ("segitiga", "vertex", "script"):
    g(M.lib("click-soft"), AT["s6:" + w], .14)
g(M.lib("error"), AT["s6:banyak"], .12)
g(M.lib("glitch-1"), AT["s6:dicurigai"], .14)
g(M.lib("click"), AT["s7:Klik"], .16)
g(M.lib("click-soft"), AT["s7:kanan"], .16)
g(M.lib("click"), AT["s7:Disable"], .18)
g(M.lib("sparkle"), SNAP, .14)
g(M.thump(.3), SNAP, .14)
g(M.lib("click"), AT["s7:menyaring"], .16)
g(M.lib("ping"), AT["s7:menyaring"] + .15, .1)
g(M.lib("pop"), AT["s8:dicek"] + .2, .16)
g(M.lib("chime"), AT["s8:dicek"] + .35, .12)
g(M.lib("glitch-3"), AT["s8:gratis"], .05)
g(M.lib("sparkle"), OUT - .3, .12)
g(M.thump(), OUT, .18)
M.finish(music)
