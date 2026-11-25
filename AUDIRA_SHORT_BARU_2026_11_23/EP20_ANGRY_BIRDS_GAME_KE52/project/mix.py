"""EP20 sound: 8-bit chiptune. Square lead arps, triangle bass, noise drums at 112 BPM in E minor (the lean
years, s1-s5), lifting to G major from the release (s6) to the outro. SFX mark cuts and key words and are ducked
under the VO. Run from this folder: python mix.py"""
import json
import sys

sys.path.insert(0, "lib")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2009)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]

# ---- music bed ----
bpm = 112
beat = 60 / bpm
bar = beat * 4
root = 164.81  # E
minor = [[0, 3, 7], [-4, 0, 3], [-7, -3, 0], [-2, 2, 5]]  # Em C G D
major = [[3, 7, 10], [-2, 2, 5], [-4, 0, 3], [3, 7, 10]]  # G D C G
lead, bass, kick, snare, hat = M.mono(), M.mono(), M.mono(), M.mono(), M.mono()
for b in range(int(DUR / bar) + 1):
    t0 = b * bar
    prog = major if t0 >= K["s6"] - .1 else minor
    ch = prog[b % 4]
    M.lay(bass, M.note(root / 2 * 2 ** (ch[0] / 12), beat * 1.9, "tri", 1.2, .004), t0, .8)
    M.lay(bass, M.note(root / 2 * 2 ** (ch[0] / 12), beat * 1.9, "tri", 1.2, .004), t0 + beat * 2, .7)
    pat = [0, 1, 2, 1, 0, 2, 1, 2]
    for k in range(8):
        f = root * 2 * 2 ** ((ch[pat[k]] + (12 if k >= 4 and b % 2 else 0)) / 12)
        M.lay(lead, M.note(f, beat * .42, "square", 9, .002), t0 + k * beat / 2, .2)
    for k in range(4):
        tb = t0 + k * beat
        if k in (0, 2):
            M.lay(kick, M.thump(.2), tb, .7)
        if k in (1, 3):
            M.lay(snare, M.band(M.burst(.12, 30, 1), 1200, 8000), tb, .28)
        M.lay(hat, M.band(M.burst(.025, 160, 1), 7000, 14000), tb + beat / 2, .12)

drums_env = M.env([(0, .3), (K["s2"] - .2, .3), (K["s2"], .8), (K["s3"], .8), (K["s3"] + .2, .35), (K["s5"], 1), (K["s6"], 1),
                   (K["s7"], 1.1), (END + .3, 1), (DUR - .8, .4), (DUR, 0)])
mel_env = M.env([(0, .8), (K["s2"], 1), (K["s3"], .7), (K["s5"], 1), (K["s7"], 1.1), (DUR - .8, .5), (DUR, 0)])
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


A = AT
# s1 hook: one blip per GAME OVER screen, error on "hit", riser -> impact on "ke-52", sparkle on "menyelamatkan"
for k in range(17):
    blip(.1 + k * (3.8 / 17), 330 + 22 * (k % 5), .05, .035)
g(M.lib("error"), A["s1:hit"], .07)
g(M.lib("riser"), A["s1:game#2+0.6"] - 1.3, .07)
g(M.lib("impact-bass-1"), A["s1:game#2+0.6"], .14)
g(M.lib("sparkle"), A["s1:menyelamatkan"], .1)
# cuts
cuts = [K[s] for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")] + [A["s2:Bertahun-tahun"], A["s4:Musuhnya"], A["s5:Digarap"],
                                                                     A["s6:Februari"], A["s7:Filmnya"], A["s7:Tahun"]]
for c in cuts:
    g(M.lib("whoosh-short"), c - .3, .1)
    blip(c, 196, .05, .035, "square")
# s2 snowy Helsinki: wind, chime on students, pops for client boxes
noise(K["s2"], 5.5, 300, 1800, .025)
g(M.lib("chime"), A["s2:mahasiswa"], .08)
for k in range(6):
    g(M.lib("pop"), A["s2:pesanan"] + k * .16, .06)
# s3 near-bankrupt: thunder, falling blips while staff shrinks, ping on "satu"
noise(A["s3:bangkrut"], 1.4, 40, 600, .16)
g(M.thump(.35), A["s3:bangkrut"], .16)
for k in range(8):
    blip(A["s3:menyusut"] + k * .18, 660 * 2 ** (-k / 12), .07, .04)
g(M.lib("ping"), A["s3:satu"], .08)
# s4 designer: scribble, pop on the bird, error on wings/legs, pop on pig, thump on "konon"
g(M.lib("typing"), A["s4:menggambar"], .06)
g(M.lib("pop"), A["s4:marah"], .12)
g(M.lib("error"), A["s4:sayap"], .05)
g(M.lib("error"), A["s4:kaki"], .05)
g(M.lib("pop"), A["s4:babi"], .1)
g(M.thump(.3), A["s4:konon"], .14)
# s5 the level: creak on pull, whoosh on release, impact + glitch + pop on topple, coins on cost x4
g(M.note(140, .5, "saw", 4, .05), A["s5:tarik"], .05)
g(M.lib("whoosh"), A["s5:lepaskan"], .1)
g(M.lib("impact-bass-1"), A["s5:lepaskan"] + .95, .14)
g(M.lib("glitch-1"), A["s5:lepaskan"] + .95, .05)
g(M.lib("pop"), A["s5:robohkan"] + .1, .1)
for k in range(4):
    coin(A["s5:membengkak"] + k * .42, .035)
# s6 release + chart climb
g(M.lib("ping"), A["s6:US$0,99"], .08)
for k in range(9):
    blip(A["s6:Februari"] + .3 + k * ((A["s6:nomor"] - A["s6:Februari"] - .4) / 9), 392 * 2 ** (k / 12), .07, .04)
g(M.lib("chime"), A["s6:nomor"], .1)
# s7 payoff: riser -> impact on 5 billion, coins on the film, impact on Sega
noise(K["s7"], 2.5, 300, 2500, .02)
g(M.lib("riser"), A["s7:5"] - 1.3, .08)
g(M.lib("impact-bass-1"), A["s7:5"], .15)
for k in range(3):
    noise(A["s7:5"] + k * .35, .4, 200, 4000, .05)
for k in range(8):
    coin(A["s7:US$352"] + .1 + k * .22, .03)
g(M.lib("impact-bass-1"), A["s7:Sega"], .11)
g(M.lib("sparkle"), A["s7:€706"], .08)
# s8 resolve
g(M.lib("chime"), A["s8:latihan"], .1)
g(M.lib("sparkle"), A["s8:latihan"] + .2, .08)
g(M.lib("ping"), A["s8:Tulis"], .08)
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
