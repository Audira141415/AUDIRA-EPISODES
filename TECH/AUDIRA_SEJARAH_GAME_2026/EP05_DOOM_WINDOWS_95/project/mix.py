"""EP05 sound: late-90s glossy electronic. Bubbly sine/tri arps over airy pads, soft sub and a light breakbeat at 112 BPM,
in a bright major key (Lydian lift). Floppy-drive seeks, modem-ish chirps, clicks, sparkles and whooshes mark the beats.
Run from this folder: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1993)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]

# ---- music bed ----
bpm = 112
beat = 60 / bpm
root = 261.63  # C
prog = [[0, 4, 7, 11], [5, 9, 12, 16], [2, 6, 9, 14], [-3, 0, 4, 7]]  # Cmaj7, Fmaj7, D(lydian), Am
arp, sub, pad, kick, snare, hat = M.mono(), M.mono(), M.mono(), M.mono(), M.mono(), M.mono()
bar = beat * 4
nb = int(DUR / bar) + 1
for b in range(nb):
    t0 = b * bar
    ch = prog[b % 4]
    for st in ch:
        M.lay(pad, M.note(root * 2 ** (st / 12), bar + .4, "tri", .15, .35), t0, .12)
    M.lay(sub, M.note(root / 2 * 2 ** (ch[0] / 12), bar * .95, "sine", .9, .02), t0, .7)
    pat = [0, 1, 2, 3, 2, 1, 3, 2]
    for k in range(16):
        st = ch[pat[k % 8]] + (12 if k % 8 >= 4 else 0)
        f = root * 2 * 2 ** (st / 12)
        M.lay(arp, M.note(f, .22, "sine", 11, .002), t0 + k * beat / 4, .42)
        M.lay(arp, M.note(f * 2.005, .12, "tri", 18, .002), t0 + k * beat / 4, .1)
    for k in range(4):
        tb = t0 + k * beat
        if k in (0, 2):
            M.lay(kick, M.thump(.28), tb, .8)
        if k in (1, 3):
            M.lay(snare, M.band(M.burst(.16, 22, 2), 900, 7000), tb, .32)
        for hh in range(2):
            M.lay(hat, M.band(M.burst(.03, 140, 1), 6500, 14000), tb + hh * beat / 2 + beat / 4, .16)
    if b % 2 == 1:  # breakbeat ghost kick
        M.lay(kick, M.thump(.2), t0 + beat * 2.75, .45)

# intro without drums for 1 bar under the hook title, drop at s2, thin out at s7 (the "warning" scene), outro swell
drums_env = M.env([(0, .35), (K["s2"] - .2, .35), (K["s2"], 1), (K["s7"], 1), (K["s7"] + .3, .45), (K["s8"], .9), (END + .3, 1), (DUR - .8, .4), (DUR, 0)])
mel_env = M.env([(0, .85), (K["s2"], 1), (K["s7"], .8), (K["s8"], 1), (DUR - .8, .5), (DUR, 0)])
drums = (kick + snare + hat) * drums_env
mono = (.55 * arp + .6 * sub + .55 * pad) * mel_env + .5 * drums
side = (.16 * np.roll(arp, 900) + .08 * np.roll(pad, 1400)) * mel_env + .04 * np.roll(hat, 300) * drums_env
music = stereo(mono, side)


# ---- SFX ----
def chirp(t, f0, f1, dur=.09, a=.05):
    tt = np.arange(int(dur * SR)) / SR
    ph = 2 * np.pi * (f0 * tt + (f1 - f0) * tt ** 2 / (2 * dur))
    g(np.sin(ph) * np.minimum(1, (dur - tt) / .01) * np.minimum(1, tt / .003), t, a)


def floppy_seek(t, n=5, a=.08):
    for k in range(n):
        x = M.band(M.burst(.035, 90, 1), 300, 2500) + .4 * M.note(140 + 30 * (k % 2), .035, "square", 50)
        g(x, t + k * .07, a)


def modem(t, a=.035):
    for k in range(6):
        chirp(t + k * .07, 1200 + 400 * (k % 3), 2400 - 300 * (k % 2), .06, a)


g(M.lib("sparkle"), .05, .12)
floppy_seek(.2, 4, .06)
for k in range(10):
    g(M.note(1600 + 120 * (k % 4), .04, "sine", 40), AT["s1:lebih"] + k * .09, .03)
g(M.lib("ping"), AT["s1:Windows"], .1)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - .45, .12)
    g(M.lib("click-soft"), K[s] - .1, .12)
g(M.lib("pop"), AT["s2:Doom"] - .35, .2)
g(M.lib("sparkle"), AT["s2:Doom"], .1)
g(M.lib("chime"), AT["s2:Software"], .08)
g(M.lib("typing"), AT["s2:komputer"], .08)
floppy_seek(AT["s3:shareware"], 6, .07)
for i in range(6):
    g(M.lib("pop"), AT["s3:disalin"] - .5 + i * .12 + .2, .1)
g(M.lib("click"), AT["s3:Dua"], .18)
g(M.lib("error"), AT["s3:dibeli"], .07)
g(M.lib("sparkle"), AT["s4:persen"], .14)
g(M.lib("chime"), AT["s4:persen"] + .1, .1)
for k in range(20):
    g(M.note(2400 + 200 * (k % 3), .05, "sine", 30), AT["s4:menghasilkan"] + k * .11 + .3, .04)
g(M.lib("riser"), AT["s5:versi"] - .4, .06)
for d in range(5):
    modem(AT["s5:versi"] - .6 + d * .55, .03)
g(M.lib("ping"), AT["s5:juta"], .12)
floppy_seek(AT["s5:Setiap"], 5, .06)
g(M.lib("riser"), K["s6"], .08)
g(M.thump(.35), AT["s6:lebih"] + 1.2, .2)
g(M.lib("impact-bass-1"), AT["s6:lebih"] + 1.2, .14)
g(M.lib("click"), AT["s6:diperkirakan"], .16)
g(M.lib("sparkle"), AT["s6:lebih"] + 1.1, .12)
g(M.lib("whoosh-cinematic"), AT["s7:Bill"] - .3, .1)
g(M.lib("glitch-1"), AT["s7:disisipkan"], .1)
g(M.lib("glitch-2"), AT["s7:digital"], .07)
g(M.lib("pop"), AT["s7:Gates"], .14)
g(M.thump(.3), AT["s7:perkiraan"], .2)
g(M.lib("click"), AT["s7:perkiraan"], .16)
g(M.lib("sparkle"), AT["s8:gratis"], .12)
for i in range(8):
    g(M.lib("pop"), AT["s8:menyebar"] + i * .14, .06)
g(M.lib("whoosh"), AT["s8:menyebar"], .1)
g(M.lib("chime"), AT["s8:Kamu"], .08)
g(M.lib("sparkle"), OUT - .3, .12)
g(M.thump(), OUT, .18)
M.finish(music)
