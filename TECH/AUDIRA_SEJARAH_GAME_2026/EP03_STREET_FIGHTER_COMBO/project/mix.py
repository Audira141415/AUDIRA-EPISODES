"""EP03 sound: an energetic arcade-fighting groove at 140 BPM in E minor (punchy kick/snare, 16th hats, octave synth bass riff,
saw brass stabs, square arp lead). The bed drops to a filtered 'tape replay' in s4, thins out for the hidden-feature beat in s5,
then rebuilds with a riser into the 8-hit combo. Each counted hit gets impact-bass + a synthetic punch; glitch at "bug". Run from this folder."""
import json, sys
sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(303)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]

bpm = 140
beat = 60 / bpm
s16 = beat / 4
E2 = 82.41
kick, snare, hat, bass, stab, lead = (M.mono() for _ in range(6))


def kick_s():
    t = np.arange(int(.28 * SR)) / SR
    return np.sin(2 * np.pi * (48 * t + 90 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 11) + .25 * M.burst(.28, 90, 1)


def snare_s():
    x = .8 * M.band(M.burst(.22, 16, 2), 900, 9000)
    tn = M.tone([190, 290], .12, 30)
    x[:len(tn)] += .5 * tn
    return x


def hat_s(o=False):
    return M.band(M.burst(.12 if o else .04, 22 if o else 90, 1), 6000, 15000)


KS, SN, HC, HO = kick_s(), snare_s(), hat_s(), hat_s(True)
riff = [0, 0, 12, 0, 3, 0, 5, 7, 0, 0, 12, 0, 10, 7, 5, 3]  # semitones over E
prog = [0, 0, -4, -2]  # Em, Em, C, D (root shift per bar)
t0, bar = 0.0, 0
while t0 < DUR:
    sh = prog[bar % 4]
    for k in range(16):
        tk = t0 + k * s16
        if k in (0, 6, 8, 11):
            M.lay(kick, KS, tk, 1.0 if k in (0, 8) else .7)
        if k in (4, 12):
            M.lay(snare, SN, tk, .8)
        M.lay(hat, HO if k % 4 == 2 else HC, tk, .35 if k % 2 else .22)
        f = E2 * 2 ** ((riff[k] + sh) / 12)
        M.lay(bass, M.note(f, s16 * .95, "saw", 6, .003), tk, .55)
        if k % 2 == 0:
            ar = [0, 7, 12, 15, 12, 7, 3, 7][(k // 2) % 8]
            M.lay(lead, M.note(E2 * 8 * 2 ** ((ar + sh) / 12), s16 * 1.6, "square", 9, .003), tk, .18)
    for k in (0, 3, 6, 10, 14):  # brass stabs (minor triad)
        for semi in (0, 3, 7, 12):
            M.lay(stab, M.note(E2 * 4 * 2 ** ((semi + sh) / 12), s16 * 1.4, "saw", 7, .004), t0 + k * s16, .1)
    t0 += 16 * s16
    bar += 1

bass = M.band(bass, 30, 2400)
stab = M.band(stab, 200, 6000)
drums = kick + snare + hat
full = .9 * drums + .8 * bass + .55 * stab + .45 * lead
lo = M.band(full, 20, 700)  # 'replay tape' version
tR, tU = AT["s4:Adegannya"], AT["s4:ulang"] + 0.4
rep = M.env([(0, 0), (tR - .1, 0), (tR + .1, 1), (K["s5"] - .3, 1), (K["s5"], 0), (DUR, 0)])
hid = M.env([(0, 0), (K["s5"], 0), (K["s5"] + .3, 1), (AT["s6:Ternyata"] - 1.6, 1), (AT["s6:Ternyata"] - .1, 0), (DUR, 0)])
thin = .25 * bass + .5 * lead + .3 * hat  # sparse bed for the hidden-feature beat
lvl = M.env([(0, 1), (K["s2"], .85), (K["s3"], .9), (K["s7"], 1), (END, 1), (OUT + .4, .9), (DUR, 0)])
mono = (full * (1 - rep - hid) + .9 * lo * rep + thin * hid) * lvl
music = stereo(mono, .12 * np.roll(stab + lead, 400) * (1 - rep) * lvl)


def punch(t, a=.2):
    g(M.lib("impact-bass-1"), t - .01, a)
    g(M.thump(.2), t, a * .8)
    g(M.band(M.burst(.08, 50, 1), 1200, 7000), t, a * .9)


# s1 hook combo
for i, h in enumerate(K["h1"]):
    punch(max(0, h), .18 + .03 * i)
    g(M.lib("whoosh-short"), max(0, h - .12), .06)
g(M.lib("glitch-2"), AT["s1:bug"] - .03, .22)
g(M.lib("glitch-1"), AT["s1:bug"] + .35, .12)
g(M.lib("pop"), AT["s1:bug"], .12)
# scene whips
for s in ("s2", "s3", "s4", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - .05, .12)
# s2 arcade
g(M.lib("ping"), AT["s2:Capcom"], .08)
for i in range(12):
    g(M.lib("pop"), AT["s2:dikerjakan"] + i * .1, .05)
# s3 car smashes
for i, h in enumerate(K["h3"]):
    punch(h, .2)
    g(M.lib("glitch-3"), h + .02, .04)
g(M.band(M.burst(.9, 5, 3), 1500, 12000), K["h3"][2] + .02, .2)  # glass
# s4 replay: rewind squeal, then slow punches
n = int((tU - tR) * SR)
tt = np.arange(n) / SR
g(np.sin(2 * np.pi * np.cumsum(900 + 500 * np.sin(tt * 9)) / SR) * .25 * np.minimum(1, tt / .05) * np.minimum(1, (tt[-1] - tt) / .1 + 1e-3), tR, .25)
g(M.lib("click"), tU, .12)
g(M.lib("chime"), AT["s4:aneh"], .1)
for h in K["h4"]:
    g(M.lib("impact-bass-1"), h, .14)
    g(M.thump(.45), h, .12)
# s5 hidden
g(M.lib("error"), AT["s5:sulit"], .08)
g(M.lib("whoosh-cinematic"), AT["s5:dibiarkan"] - .2, .16)
g(M.lib("click"), AT["s5:tersembunyi"] + .2, .2)
# s6 eight hits
g(M.lib("riser"), AT["s6:Ternyata"] - 1.6, .1)
for i, h in enumerate(K["h6"]):
    punch(h, .16 + .02 * i)
g(M.lib("sparkle"), AT["s6:delapan"] + .1, .1)
# s7 official feature + sales
for i in range(10):
    g(M.lib("pop"), AT["s7:resmi"] - .2 + i * .22, .06)
g(M.lib("impact-bass-1"), AT["s7:resmi"], .14)
g(M.lib("sparkle"), AT["s7:standar"], .08)
g(M.lib("chime"), AT["s7:dunia"] - 1.0, .1)
# s8 payoff + outro
g(M.lib("pop"), AT["s8:fitur"], .1)
g(M.lib("sparkle"), AT["s8:AUDIRA"], .1)
g(M.lib("whoosh"), OUT - .35, .12)
punch(OUT, .16)
M.finish(music)
