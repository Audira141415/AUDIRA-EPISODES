"""EP05 sound: inside a 1978 arcade cabinet. A 4-step low pulse whose tempo follows the alien count (beats from the same simulation as the CRT),
CRT hum, a dark phosphor pad, solder hiss, laser zaps, explosion blips and a power-on thunk on every panel. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1978)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
SIM, BEATS = K["sim"], K["beats"]

# ---- music ----
pulse, pad, hum, arp = M.mono(), M.mono(), M.mono(), M.mono()
PAT = [55.0, 65.41, 55.0, 41.2]  # own 4-step figure: A1 C2 A1 E1
for i, bt in enumerate(BEATS):
    nb = BEATS[i + 1] if i + 1 < len(BEATS) else bt + 1
    d = min(.5, max(.08, (nb - bt) * .85))
    f = PAT[i % 4]
    x = M.note(f, d, "square", 7, .003) * .7 + M.note(f / 2, d, "sine", 5, .003) * .8
    x[: int(.01 * SR)] += M.burst(.01, 300, 2)[: int(.01 * SR)] * .3
    M.lay(pulse, x, bt, 1)
for f, a in [(110, .5), (130.81, .35), (164.81, .3), (220, .12)]:
    pad += a * np.sin(2 * np.pi * f * T + np.sin(2 * np.pi * .13 * T) * 2) * (0.7 + 0.3 * np.sin(2 * np.pi * .07 * T + f))
hum = .5 * np.sin(2 * np.pi * 60 * T) + .25 * np.sin(2 * np.pi * 120 * T) + .12 * np.sin(2 * np.pi * 180 * T)
hum += .05 * M.band(M.rng.standard_normal(N), 3000, 9000)
s7 = K["s7"]
beat = 60 / 128
t0, i = s7 + .3, 0
while t0 < END + 1.5:
    f = [440, 523.25, 659.25, 880, 659.25, 523.25][i % 6]
    M.lay(arp, M.note(f, .16, "square", 14, .002), t0, .35)
    t0 += beat / 2; i += 1
gameOn = M.env([(0, 1), (K["s2"], .55), (K["s4"] - .3, .55), (K["s4"], 1), (K["s5"], .45), (K["s6"], 1), (K["s7"], .7), (END, .7), (DUR, .3)])
padE = M.env([(0, .5), (K["s2"], .8), (K["s4"], .5), (K["s5"], .9), (K["s6"], .5), (K["s7"], 1), (END + .5, 1), (DUR, .2)])
arpE = M.env([(0, 0), (s7, 0), (s7 + 1, 1), (END + .4, 1), (DUR, 0)])
music = stereo(1.0 * pulse * gameOn + .22 * pad * padE + .07 * hum + .3 * arp * arpE, .06 * np.roll(pad, 700) * padE + .1 * np.roll(arp, 400) * arpE)


# ---- sfx ----
def zap(t, a=.05):
    d = .09; tt = np.arange(int(d * SR)) / SR
    fr = 1700 * np.exp(-tt * 22) + 220
    g(np.sign(np.sin(2 * np.pi * np.cumsum(fr) / SR)) * .5 * np.exp(-tt * 18), t, a)


def blip(t, a=.06, big=1.0):
    nb = M.band(M.burst(.16 * big, 22 / big, 2), 150, 3200) * 1.4
    sq = np.zeros_like(nb); s = M.note(170, .07 * big, "square", 25); sq[: len(s)] += s
    g(nb + sq, t, a)


def power_on(t, a=.16):
    g(M.thump(.24), t, a)
    d = .14; tt = np.arange(int(d * SR)) / SR
    g(np.sin(2 * np.pi * np.cumsum(1800 + 5000 * tt / d) / SR) * np.exp(-tt * 18) * .25, t, a * .5)
    g(M.band(M.burst(.05, 80, 1), 3000, 12000), t, a * .3)


def power_off(t, a=.05):
    d = .12; tt = np.arange(int(d * SR)) / SR
    g(np.sin(2 * np.pi * np.cumsum(4000 * np.exp(-tt * 25) + 200) / SR) * np.exp(-tt * 12), t, a)


def hiss(t, d=.5, a=.035):
    x = M.band(M.rng.standard_normal(int(d * SR)), 2500, 9000)
    e = np.minimum(1, np.arange(len(x)) / (.05 * SR)) * np.exp(-np.arange(len(x)) / SR * 2.5)
    x = x * e
    for _ in range(8):
        k = int(M.rng.random() * (len(x) - 200)); x[k:k + 60] += M.rng.standard_normal(60) * 2.5
    g(x, t, a)


# segment starts: CRT degauss thunk
for sg in SIM["segs"][1:]:
    g(M.thump(.3), sg["t0"], .2)
    tt = np.arange(int(.3 * SR)) / SR
    g(np.sign(np.sin(2 * np.pi * 60 * tt)) * np.exp(-tt * 10) * .3, sg["t0"], .08)
# shots and hits
for si, sg in enumerate(SIM["segs"]):
    soft = .55 if si == 0 else 1
    for k in sg["kills"]:
        zap(k[0] - .2, .045 * soft)
        blip(k[0], .05 * soft)
    for m in sg["misses"]:
        zap(m, .07)
g(M.lib("impact-bass-1"), K["hitT"], .3); blip(K["hitT"], .1, 1.8); g(M.lib("sparkle"), K["hitT"] + .1, .14)

# panels: power-on in, power-off out
ins = [K["s2"], AT["s2:Inspirasinya"], K["s3"], AT["s3:Layarnya"], K["s4"], K["s5"], K["s6"], AT["s6:Belakangan"], K["s7"], K["s8"]]
for t in ins:
    power_off(t - .22); power_on(t - .12)
# s1
g(M.lib("glitch-1"), AT["s1:bukan"], .1)
g(M.lib("error"), AT["s1:prosesor"], .07)
# s2 workbench
g(M.lib("pop"), AT["s2:1978"], .14)
g(M.lib("pop"), AT["s2:Tomohiro"], .14)
t = K["s2"] + .6
while t < AT["s2:Inspirasinya"] - .6:
    if not (AT["s2:Intel"] - .6 < t < AT["s2:Intel"] + .8):
        hiss(t, .45)
    t += 1.15
for k in range(12):
    t = AT["s2:selama"] + (AT["s2:setahun"] + .7 - AT["s2:selama"]) * k / 12
    g(M.lib("click-soft"), t, .07)
for k in range(6):
    g(M.lib("click"), AT["s2:merancang"] + k * .32 + .3, .08)
g(M.lib("impact-bass-1"), AT["s2:Intel"] - .15, .16); g(M.lib("ping"), AT["s2:Intel"], .09)
for w in ("Breakout", "War"):
    g(M.lib("whoosh-short"), AT["s2:" + w] - .15, .1); g(M.lib("pop"), AT["s2:" + w], .1)
# s3 wishes crossed out
g(M.lib("pop"), AT["s3:berwarna"], .12); g(M.lib("pop"), AT["s3:lebih"], .12)
g(M.lib("error"), AT["s3:tidak"], .12); g(M.lib("error"), AT["s3:kuat"], .1)
g(M.lib("glitch-2"), AT["s3:Layarnya"], .08)
# s4 discovery
g(M.lib("chime"), AT["s4:sesuatu"], .12)
# s5 patch toggle
g(M.lib("click-soft"), AT["s5:menambalnya"] + .4, .12)
g(M.lib("click"), AT["s5:memilih"] + .3, .14)
g(M.lib("impact-bass-1"), AT["s5:mekanik"], .3)
# s7 world hit
g(M.lib("riser"), AT["s7:hit"] - 1.4, .1)
g(M.lib("sparkle"), AT["s7:hit"], .14)
for k in range(10):
    g(M.lib("ping"), AT["s7:hit"] + .2 + k * .3, .03)
tt = np.arange(int(1.7 * SR)) / SR
g(np.sin(2 * np.pi * np.cumsum(220 + 900 * (tt / 1.7) ** 4) / SR) * .3 * np.minimum(1, (1.7 - tt) / .1), AT["s7:kesulitan"], .1)
# s8 + outro
g(M.lib("whoosh-cinematic"), K["s8"] - .6, .12)
g(M.lib("pop"), AT["s8:Kamu"], .1)
power_on(OUT - .1, .2)
g(M.lib("chime"), OUT + .2, .12)
M.finish(music)
