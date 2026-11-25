"""EP04 sound: a minimal premium product bed at 72 BPM (soft detuned pads Fmaj9-Am7-Dm9-Bbmaj7, gentle sine-bell piano,
round sub pulses). The bomb drops the bed into a dark drone. SFX: power-on blips, soft whooshes, a low impact, button clicks,
box lid and crate thuds, a stamp, a glass lift and a chime. Run from this folder: python mix.py"""
import json, sys
sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(404)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]

beat = 60 / 72
F3 = 174.61
chords = [[0, 4, 7, 11, 14], [4, 7, 11, 14], [-3, 0, 4, 7, 11], [-7, -3, 0, 4, 9]]  # Fmaj9, Am7, Dm9, Bbmaj7 (semitones from F)
pad, pno, sub = M.mono(), M.mono(), M.mono()


def padnote(f, dur):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * d * t + ph) for d, ph in ((1, 0), (1.004, 1.1), (0.996, 2.3), (2.0, .4)))
    env = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.0)
    return x * env / 4


def bell(f, dur=2.4):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2) + .3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 4) + .08 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 7)
    return x * np.minimum(1, t / .004)


bar, t0 = 0, 0.0
mel = [7, 11, 14, 12, 7, 4, 9, 7]
while t0 < DUR:
    ch = chords[bar % 4]
    for s in ch:
        M.lay(pad, padnote(F3 * 2 ** (s / 12), beat * 4 + 1.0), t0, .22)
    for k in range(4):
        tt = t0 + k * beat
        M.lay(sub, M.note(F3 / 4 * 2 ** (ch[0] / 12), .5, "sine", 5, .01), tt, .9 if k % 2 == 0 else .5)
    for k, idx in enumerate((0, 2, 1, 3)):
        if (bar + k) % 3 == 2:
            continue
        M.lay(pno, bell(F3 * 2 * 2 ** ((ch[idx % len(ch)] + 12 * (k == 3)) / 12)), t0 + k * beat + .02, .22)
    t0 += beat * 4
    bar += 1
tb = AT["s3:bom"]
drone = M.note(F3 / 4, 7, "saw", .05, .3) + .6 * M.note(F3 / 4 * 1.5, 7, "saw", .05, .3)
drone = M.band(np.pad(drone, (0, max(0, N - len(drone))))[:N], 30, 500)
dr = M.mono(); M.lay(dr, drone[: int(7 * SR)], tb - .2, .5)
bed = M.env([(0, .55), (K["s2"] - .3, .55), (K["s2"] + .8, 1), (tb - .3, 1), (tb + .2, .1), (K["s4"] - .4, .1), (K["s4"] + 1.5, .95), (K["s8"], 1), (END, 1), (DUR, .25)])
mono = (.9 * pad + .7 * pno + .8 * sub) * bed + dr * M.env([(0, 0), (tb - .2, 0), (tb + .3, 1), (K["s4"] - .2, .8), (K["s4"] + 1.2, 0), (DUR, 0)])
music = stereo(mono, .12 * np.roll(pno, 900) * bed)


def blip(t, a=.09):
    g(.6 * M.tone([1046.5], .07, 30), t, a)
    g(.6 * M.tone([1568], .12, 20), t + .07, a)


def click(t, a=.14):
    g(M.lib("click"), t, a)


def thud(t, a=.25):
    g(M.thump(.3), t, a)
    g(M.band(M.burst(.12, 40, 2), 150, 1800), t, a * .5)


# s1 hook
g(M.lib("impact-bass-1"), .02, .14)
g(M.lib("whoosh-cinematic"), .1, .06)
for k in range(4):
    g(M.lib("glitch-1" if k % 2 else "glitch-2"), AT["s1:dinyalakan"] + k * .13, .03)
blip(AT["s1:dinyalakan"] + .5)
g(M.lib("sparkle"), AT["s1:Tetris"], .06)
# s2 rewind to pristine, turntable, medic
g(M.lib("riser"), K["s2"] - 1.0, .05)
g(M.lib("whoosh"), K["s2"] - .1, .1)
g(M.lib("chime"), K["s2"] + .8, .07)
g(M.lib("ping"), AT["s2:dirilis"], .07)
g(M.lib("pop"), AT["s2:dijual"], .07)
g(M.lib("whoosh-short"), AT["s2:Stephan"] - .4, .08)
g(M.lib("click-soft"), AT["s2:Stephan"] + .2, .08)
# s3 bomb
g(M.lib("riser"), tb - 1.4, .05)
g(M.lib("impact-bass-1"), tb - .02, .42)
thud(tb, .45)
g(M.band(M.burst(2.6, 1.6, 6), 60, 2600), tb + .02, .34)
crk = M.band(M.rng.standard_normal(int(4.5 * SR)), 1500, 8000) * (M.rng.random(int(4.5 * SR)) > .9985) * 6
g(crk * np.exp(-np.arange(len(crk)) / SR * .5), tb + .3, .08)
g(M.lib("glitch-3"), AT["s3:parah"], .05)
# s4 box
g(M.lib("whoosh-cinematic"), AT["s4:mengirim"], .1)
thud(AT["s4:Power"] + .1, .18)
g(M.lib("whoosh-short"), AT["s4:berharap"] - .1, .08)
thud(AT["s4:berharap"] + .45, .22)
g(.5 * M.band(M.burst(.5, 5, 1), 1200, 7000), AT["s4:berharap"] + .7, .07)
thud(AT["s4:diganti"], .2)
# s5 bench
g(M.lib("whoosh"), K["s5"] + .5, .1)
thud(AT["s5:menilai"] - .1, .12)
g(M.lib("error"), AT["s5:tertolong"], .08)
blip(AT["s5:menyala"], .12)
g(M.lib("chime"), AT["s5:menyala"] + .3, .07)
click(AT["s5:Start"]); click(AT["s5:Select"])
g(M.lib("click-soft"), AT["s5:kaset"] + .2, .14)
blip(AT["s5:Tetris"], .08)
# s6 replacement + magazine
g(M.lib("whoosh-short"), AT["s6:mengirim"], .1)
g(M.lib("sparkle"), AT["s6:hadiah"], .08)
g(M.lib("whoosh-short"), AT["s6:Surat"] - .3, .07)
g(M.lib("ping"), AT["s6:edisi"], .08)
# s7 museum + crate
g(M.lib("whoosh-cinematic"), K["s7"], .08)
g(M.lib("whoosh"), AT["s7:dipajang"] + .2, .07)
g(M.lib("chime"), AT["s7:York"], .08)
g(M.lib("whoosh-short"), AT["s7:Tahun"] - .1, .08)
g(M.lib("whoosh"), AT["s7:konsol"], .08)
thud(AT["s7:dikembalikan"] + .3, .18)
thud(AT["s7:kantor"] + .3, .22)
# s8 payoff + outro
g(M.lib("whoosh-cinematic"), K["s8"] - .3, .1)
g(M.lib("chime"), AT["s8:tangguh"], .09)
blip(AT["s8:tetap"], .07)
g(M.lib("sparkle"), AT["s8:AUDIRA"], .08)
g(M.lib("whoosh"), OUT - .35, .1)
g(M.thump(), OUT, .16)
M.finish(music)
