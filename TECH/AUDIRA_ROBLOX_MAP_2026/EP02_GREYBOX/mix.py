"""EP02 sound: a calm architectural bed at 84 BPM (marimba arpeggios over soft piano chords and a round low bass, Dmaj7-Bm7-Gmaj7-A6),
block-placement knocks, tape-measure zips, laser zaps for the combat pocket and a long whoosh for the polish swap. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(202)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
K = {x: M.scene(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}

beat = 60 / 84
eighth = beat / 2
D3 = 146.83
chords = [[0, 4, 7, 11], [-3, 0, 4, 7], [-7, -3, 0, 4], [-5, -1, 2, 4]]  # Dmaj7, Bm7, Gmaj7, A6 (semitones from D)
mar, pno, bass = M.mono(), M.mono(), M.mono()


def marimba(f, dur=.6):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + .35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 26) + .12 * np.sin(2 * np.pi * f * 9.8 * t) * np.exp(-t * 60)
    return x * np.minimum(1, t / .002)


bar, t0 = 0, 0.0
pat = [0, 2, 1, 3, 2, 1, 3, 2]
while t0 < END + 4:
    ch = chords[bar % 4]
    for k, idx in enumerate(pat):
        oct = 2 if (k % 4 == 3) else 1
        M.lay(mar, marimba(D3 * 2 * oct * 2 ** (ch[idx] / 12) / (2 if oct == 2 else 1)), t0 + k * eighth, .5 if k % 2 == 0 else .36)
    for semi in ch:
        M.lay(pno, M.note(D3 * 2 ** (semi / 12), beat * 4 + .3, "tri", .55, .02), t0, .16)
    M.lay(bass, M.note(D3 / 2 * 2 ** (ch[0] / 12), beat * 4, "sine", .7, .03), t0, .55)
    t0 += 8 * eighth
    bar += 1
mar = M.band(mar, 180, 7000)
lvl = M.env([(0, .8), (K["s3"], .8), (AT["s3:susah"], .55), (AT["s3:Memperbaikinya"], .55), (AT["s3:Memperbaikinya"] + 1.5, .9), (K["s7"], .9), (AT["s7:diganti"], 1), (END, 1), (DUR, .2)])
mono = (.7 * mar + .9 * pno + .8 * bass) * lvl
music = stereo(mono, .1 * np.roll(mar, 600) * lvl)


def knock(t, a=.3):
    g(M.thump(.18), t, a)
    g(M.band(M.burst(.06, 80, 1), 600, 3200), t, a * .7)


def zip_(t, dur, a=.12):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = M.band(M.rng.standard_normal(n), 2500, 9000) * (.5 + .5 * np.sign(np.sin(2 * np.pi * (40 + 30 * tt / dur) * tt)))
    x *= np.minimum(1, np.minimum(tt / .03, (dur - tt) / .05))
    g(x, t, a)
    g(M.lib("click"), t + dur, a * 1.1)


def zap(t, f0=1800, a=.07):
    n = int(.22 * SR)
    tt = np.arange(n) / SR
    f = f0 * np.exp(-tt * 9) + 220
    g(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-tt * 12) * .6, t, a)


def boing(t, a=.1):
    n = int(.35 * SR)
    tt = np.arange(n) / SR
    f = 220 + 520 * (1 - np.exp(-tt * 10))
    g(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 6), t, a)


def splash(t, a=.22):
    g(M.band(M.burst(.8, 4, 4), 300, 5000), t, a)
    g(M.thump(.25), t, a * .6)


# s1 hook: soft impact, the projector sweep turns the map grey
g(M.lib("impact-bass-1"), .02, .22)
g(M.lib("sparkle"), .4, .08)
g(M.lib("riser"), AT["s1:cantik"] - 1.2, .05)
g(M.lib("whoosh-cinematic"), AT["s1:cantik"], .16)
g(M.lib("glitch-1"), AT["s1:abu-abu"], .05)
# s2 blocks: the avatar places six grey blocks, then test-runs
g(M.lib("whoosh-short"), K["s2"] - .3, .1)
g(M.lib("pop"), AT["s2:Namanya"] + .3, .1)
for i in range(6):
    tp = AT["s2:Developer"] + i * .55
    g(M.lib("click-soft"), tp - .4, .08)
    knock(tp + .42, .26)
for k in range(10):
    g(M.lib("click-soft"), AT["s2:mencoba"] + k * .32, .05)
# s3 problems and fixes
g(M.lib("whoosh-short"), K["s3"] - .3, .1)
for w in ("susah", "keuntungan", "sebanding"):
    g(M.lib("error"), AT["s3:" + w] - .1, .1)
sJ = AT["s3:dilewati"] - .1
boing(sJ, .08)
splash(sJ + .78)
rum = M.band(M.rng.standard_normal(int(1.2 * SR)), 40, 300) * np.sin(np.linspace(0, np.pi, int(1.2 * SR)))
g(rum, AT["s3:titik"] - .1, .25)
tF1 = AT["s3:Memperbaikinya"]
for k, tt in enumerate((tF1, tF1 + .8, tF1 + 1.6)):
    g(M.lib("chime"), tt + .3, .1)
    knock(tt + .1, .16)
# s4 layout from above
g(M.lib("whoosh"), K["s4"] - .2, .12)
g(M.lib("ping"), AT["s4:Zona"], .1)
g(M.lib("ping"), AT["s4:berlawanan"], .1)
for w in ("interior", "tengah", "eksterior"):
    g(M.lib("sparkle"), AT["s4:" + w] - .1, .07)
    g(M.lib("pop"), AT["s4:" + w], .08)
# s5 cross lanes, pockets, lasers
g(M.lib("whoosh-short"), AT["s5:silang"] - .3, .12)
g(M.lib("whoosh-short"), AT["s5:silang"] + .1, .1)
for k in range(6):
    g(M.thump(.25), AT["s5:combat"] + k * .9, .14)
lz0, lz1 = AT["s5:pertempuran"] - .2, AT["s5:keramaian"] + .1
tz = lz0
while tz < lz1:
    zap(tz)
    zap(tz + .18, 2400, .05)
    tz += .52
# s6 measuring
g(M.lib("whoosh-short"), K["s6"] - .3, .1)
zip_(AT["s6:pintu"], AT["s6:stud"] - .1 - AT["s6:pintu"])
zip_(AT["s6:dinding"], AT["s6:stud#2"] - .1 - AT["s6:dinding"])
j1 = AT["s6:dilompati"] - .55
boing(j1); boing(j1 + .72)
knock(j1 + .62, .12); knock(j1 + 1.34, .12)
g(M.lib("chime"), AT["s6:kamera"], .1)
# s7 polish swap
g(M.lib("whoosh-short"), K["s7"] - .3, .1)
g(M.lib("riser"), AT["s7:diganti"] - 1.4, .06)
g(M.lib("whoosh-cinematic"), AT["s7:diganti"], .2)
for w in ("tembok", "jendela", "lampu", "dekorasi"):
    g(M.lib("pop"), AT["s7:" + w], .12)
    g(M.lib("sparkle"), AT["s7:" + w] + .1, .06)
# s8 payoff and outro
g(M.lib("chime"), AT["s8:lahir"], .12)
g(M.lib("pop"), AT["s8:Kamu"], .1)
g(M.lib("sparkle"), AT["s8:AUDIRA"], .1)
g(M.lib("whoosh"), OUT - .35, .12)
g(M.thump(), OUT, .2)
M.finish(music)
