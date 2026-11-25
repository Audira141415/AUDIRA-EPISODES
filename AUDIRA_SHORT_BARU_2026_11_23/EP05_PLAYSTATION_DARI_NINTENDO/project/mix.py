"""EP05 sound: 16-bit chiptune. Square-wave lead arps, triangle bass and noise drums at 118 BPM in A minor,
lifting to C major for the release (s7) and the outro. SFX mark cuts and key words; SFX are ducked under the VO too.
Run from this folder: python mix.py"""
import json
import sys

sys.path.insert(0, "lib")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1994)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]

# ---- music bed ----
bpm = 118
beat = 60 / bpm
bar = beat * 4
root = 220.0  # A
minor = [[0, 3, 7], [-4, 0, 3], [-7, -3, 0], [-2, 2, 5]]  # Am F C G
major = [[3, 7, 10], [-2, 2, 5], [-4, 0, 3], [3, 7, 10]]  # C G F C
lead, bass, kick, snare, hat = M.mono(), M.mono(), M.mono(), M.mono(), M.mono()
for b in range(int(DUR / bar) + 1):
    t0 = b * bar
    prog = major if t0 >= K["s7"] - .1 else minor
    ch = prog[b % 4]
    M.lay(bass, M.note(root / 2 * 2 ** (ch[0] / 12), beat * 1.9, "tri", 1.2, .004), t0, .8)
    M.lay(bass, M.note(root / 2 * 2 ** (ch[0] / 12), beat * 1.9, "tri", 1.2, .004), t0 + beat * 2, .7)
    pat = [0, 1, 2, 1, 0, 2, 1, 2]
    for k in range(8):
        f = root * 2 * 2 ** ((ch[pat[k]] + (12 if k >= 4 and b % 2 else 0)) / 12)
        M.lay(lead, M.note(f, beat * .42, "square", 9, .002), t0 + k * beat / 2, .22)
    for k in range(4):
        tb = t0 + k * beat
        if k in (0, 2):
            M.lay(kick, M.thump(.2), tb, .7)
        if k in (1, 3):
            M.lay(snare, M.band(M.burst(.12, 30, 1), 1200, 8000), tb, .28)
        M.lay(hat, M.band(M.burst(.025, 160, 1), 7000, 14000), tb + beat / 2, .12)

drums_env = M.env([(0, .3), (K["s2"] - .2, .3), (K["s2"], 1), (K["s6"], 1), (K["s6"] + .2, .5), (K["s7"], 1), (END + .3, 1), (DUR - .8, .4), (DUR, 0)])
mel_env = M.env([(0, .8), (K["s2"], 1), (K["s6"], .7), (K["s7"], 1.1), (DUR - .8, .5), (DUR, 0)])
drums = (kick + snare + hat) * drums_env
mono = (.5 * lead + .7 * bass) * mel_env + .5 * drums
side = .14 * np.roll(lead, 700) * mel_env + .04 * np.roll(hat, 300) * drums_env
music = stereo(mono, side)


# ---- SFX ----
def blip(t, f, dur=.06, a=.05, kind="square"):
    g(M.note(f, dur, kind, 30, .002), t, a)


def coin(t, a=.05):
    blip(t, 988, .05, a); blip(t + .05, 1319, .12, a)


def noise(t, dur, lo, hi, a):
    g(M.band(M.burst(dur, 3 / max(dur, .05), 3), lo, hi), t, a)


g(M.lib("sparkle"), .05, .1)
for k in range(3):
    blip(AT["s1:seratus"] + k * .08, 660 * 2 ** (k * 4 / 12), .08, .05)
g(M.lib("glitch-1"), AT["s1:dipermalukan"], .08)
g(M.thump(.3), AT["s1:dipermalukan"], .18)
cuts = [K[s] for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")] + [AT["s2:Sony#2"], AT["s4:Bos"], AT["s5:Keesokan"]]
for c in cuts:
    g(M.lib("whoosh-short"), c - .3, .1)
    blip(c, 196, .05, .04, "square")
g(M.lib("chime"), AT["s2:meminta"], .08)
g(M.lib("pop"), AT["s2:CD"], .12)
g(M.lib("click"), AT["s2:kaset"] + .45, .14)
g(M.lib("click-soft"), AT["s2:CD#2"] + .45, .14)
g(M.lib("sparkle"), AT["s2:Play"], .12)
g(M.lib("typing"), AT["s3:merancang"], .06)
for k, st in enumerate([0, 4, 7, 12]):
    blip(AT["s3:chip"] + k * .12, 523 * 2 ** (st / 12), .1, .045)
g(M.lib("chime"), AT["s3:Bapak"], .1)
noise(K["s4"], .5, 2000, 8000, .03)
g(M.thump(.25), AT["s4:hak"], .16)
g(M.lib("click"), AT["s4:hak"], .14)
for k in range(6):
    coin(AT["s4:Keuntungan"] + k * .3, .035)
g(M.note(55, 1.2, "tri", 1.5, .02), AT["s4:takut"], .3)
for k in range(10):
    g(M.lib("click-soft"), K["s5"] + .6 + k * .37, .06)
g(M.lib("pop"), AT["s5:bangga"], .1)
g(M.lib("riser"), AT["s5:Keesokan"] - 1.2, .06)
g(M.lib("impact-bass-1"), AT["s5:Philips"], .14)
g(M.lib("error"), AT["s5:Philips"] + .15, .06)
for tt in (AT["s6:dipermalukan"], AT["s6:dipermalukan"] + 2.6):
    noise(tt, 1.0, 60, 900, .12)
for k in range(12):
    g(M.lib("pop"), AT["s6:dua"] + k * .15, .05)
g(M.thump(.35), AT["s6:memutuskan"], .22)
g(M.lib("impact-bass-1"), AT["s6:memutuskan"], .12)
g(M.lib("sparkle"), AT["s6:konsol"], .1)
noise(K["s7"], 2.5, 300, 2500, .025)
for k in range(8):
    coin(AT["s7:Totalnya"] + .2 + k * .25, .03)
g(M.lib("riser"), AT["s7:seratus"] - 1.4, .08)
g(M.lib("impact-bass-1"), AT["s7:seratus"], .14)
for k in range(3):
    noise(AT["s7:seratus"] + k * .35, .4, 200, 4000, .06)
g(M.lib("error"), AT["s8:tidak"], .06)
noise(AT["s8:batal"], .35, 1500, 9000, .08)
g(M.lib("chime"), AT["s8:lahirlah"], .1)
g(M.lib("sparkle"), AT["s8:lahirlah"] + .2, .1)
g(M.lib("ping"), AT["s8:Ikuti"], .08)
g(M.lib("sparkle"), OUT - .3, .1)
g(M.thump(), OUT, .16)

# duck SFX under the voice as well (sidechain-style, ratio ~ -8 dB on speech)
vo = M.read("../audio/VO_MASTER.wav")
n = min(N, len(vo))
v = np.zeros(N)
v[:n] = np.abs(vo[:n, 0])
w = int(.02 * SR)
env = np.sqrt(np.convolve(v ** 2, np.ones(w) / w, mode="same"))
gate = (env > .015).astype(float)
k = int(.35 * SR)
hold = np.convolve(gate, np.ones(k) / k, mode="same")
M.fx = M.fx * (1 - .6 * np.clip(hold * 2, 0, 1))[:, None]
M.finish(music)
