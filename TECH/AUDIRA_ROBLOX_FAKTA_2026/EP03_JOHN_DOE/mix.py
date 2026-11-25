"""EP03 sound: noir detective bed. Walking upright bass and brushed swing kit at 92 BPM over a low vibraphone haze,
a ticking clock under the database scene, typewriter keys on card reveals, a rubber stamp thud on HOAKS. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(303)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}
W = M.word

bass, kit, vib, pad = M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 92
# minor ii-V-i turnaround in A minor: Bm7b5 E7 Am7 Am7 / Dm7 G7 Cmaj7 E7
A = 55.0
prog = [
    [2, 5, 8, 0], [7, 11, 2, 5], [0, 3, 7, 10], [0, 3, 7, 10],
    [5, 8, 0, 3], [10, 2, 5, 8], [3, 7, 10, 2], [7, 11, 2, 5],
]
hz = lambda semi, base=A: base * 2 ** (semi / 12)


def upright(f, dur):
    """Plucked upright bass: fast thumb attack, woody body, short release."""
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (3.2 + h * 1.6)) / (h ** 1.25) for h in range(1, 7))
    x += .25 * M.band(M.burst(dur, 120, 2), 80, 900)[: len(t)] * np.exp(-t * 60)
    return x * np.minimum(1, t / .004) * np.minimum(1, (dur - t) / .03)


def brush(dur, dec):
    return M.band(M.burst(dur, dec, 1), 2500, 11000)


bar, t0 = 0, 0.0
while t0 < END + 3:
    ch = prog[bar % 8]
    root = ch[0]
    walk = [root, ch[2] if bar % 2 else ch[1], ch[2], (prog[(bar + 1) % 8][0] + (1 if bar % 3 else -1)) % 12]
    for k in range(4):
        f = hz(walk[k] % 12, A if walk[k] % 12 < 7 else A / 2 * 2)
        f = f if f < 95 else f / 2
        M.lay(bass, upright(f, beat * .95), t0 + k * beat + (.012 if k % 2 else 0), .9 if k == 0 else .75)
        # swing ride: on the beat and the late "and"
        M.lay(kit, brush(.12, 34), t0 + k * beat, .16)
        if k % 2 == 1:
            M.lay(kit, brush(.32, 9), t0 + k * beat, .22)  # brush sweep on 2 and 4
        M.lay(kit, brush(.06, 60), t0 + k * beat + beat * 2 / 3, .1)
    # soft vibraphone chord, low, once a bar
    for i, semi in enumerate(ch):
        f = hz(semi, 220)
        n = M.note(f, beat * 3.6, "sine", .55, .01) * (1 + .25 * np.sin(2 * np.pi * 5.2 * np.arange(int(beat * 3.6 * SR)) / SR))
        M.lay(vib, n, t0 + .02 * i, .14)
    t0 += 4 * beat
    bar += 1

drone = M.band(M.rng.standard_normal(N), 60, 240) * .5 + .4 * np.sin(2 * np.pi * 55 * T) * (0.6 + .4 * np.sin(2 * np.pi * .13 * T))
pad += drone

# arrangement: s1 only tension drone + bass, kit arrives on s2, falls away for the stamp, lamp-warm ending
e_bass = M.env([(0, .55), (K["s2"] - .1, .8), (K["s2"], 1), (AT["s7:bukti"] - .1, 1), (AT["s7:bukti"], .0), (AT["s7:bukti"] + 1.0, .0), (AT["s7:bukti"] + 1.6, 1), (END + .4, 1), (DUR, .15)])
e_kit = M.env([(0, 0), (K["s2"] - .2, 0), (K["s2"], 1), (K["s6"], 1.15), (AT["s7:bukti"] - .1, 1.15), (AT["s7:bukti"], 0), (AT["s7:bukti"] + 1.6, 0), (AT["s7:bukti"] + 2.2, .9), (K["s8"], .5), (END + .4, .5), (DUR, 0)])
e_vib = M.env([(0, .4), (K["s2"], .8), (K["s6"], .6), (K["s8"], 1.2), (DUR, .3)])
e_pad = M.env([(0, 1), (K["s2"] + .5, .35), (K["s6"], .8), (K["s7"], .3), (K["s8"], .15), (DUR, .1)])
music = stereo(.6 * bass * e_bass + .45 * pad * e_pad + .5 * vib * e_vib, .5 * kit * e_kit + .12 * np.roll(vib, 700) * e_vib)


def key(t, a=.06):
    """One typewriter key strike."""
    k = M.band(M.burst(.035, 110, 1), 1200, 7000)
    g(k, t, a); g(M.note(180, .03, "sine", 80) * .6, t, a)


def typing(t, n, span, a=.06, bell=False):
    for i in range(n):
        key(t + span * i / n + M.rng.random() * .02, a * (.8 + .4 * M.rng.random()))
    if bell:
        g(M.note(2093, .5, "sine", 7), t + span + .05, .05)


def paper(t, a=.12):
    """Paper slide / card swish."""
    x = M.band(M.burst(.3, 10, 1), 900, 6000) * np.sin(np.linspace(0, np.pi, int(.3 * SR)))
    g(x, t, a)


def tick(t, a=.07, f=3200):
    g(M.band(M.burst(.02, 200, 1), f * .6, f * 1.6), t, a)


# s1: phone buzz + glitch on the warning
for k in range(3):
    g(M.note(155, .22, "square", 3) * .5, .15 + k * .32, .05)
g(M.lib("glitch-1"), W("s1", "Maret") - .05, .12)
g(M.lib("glitch-2"), W("s1", "meretas"), .08)
g(M.note(73.4, 2.4, "saw", .6) * .4, W("s1", "Siapa") - .1, .1)

# scene changes: paper slides
for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    paper(K[x] - .18, .13)

# s2: cards rise out of the file box with typewriter keys
for w in ("satu", "dua", "tiga"):
    paper(AT["s2:" + w] - .05, .08)
    typing(AT["s2:" + w] + .1, 6, .35, .055, bell=(w == "tiga"))
g(M.thump(.22), AT["s2:Doe"] + .5, .12)

# s3: red string pulled taut, dictionary typed
for w in ("John", "Jane"):
    g(M.band(M.burst(.5, 6, 1), 300, 2200) * np.linspace(0, 1, int(.5 * SR)), AT["s3:" + w], .05)
typing(AT["s3:samaran"], 10, .6, .05)
typing(AT["s3:Fulan"], 6, .4, .05, bell=True)
g(M.thump(.3), AT["s3:contoh"], .2); g(M.band(M.burst(.08, 50, 1), 200, 3000), AT["s3:contoh"], .12)

# s4: ticking clock under the database scene; three clocks snap to the same second
t = K["s4"] + .1
while t < K["s5"] - .3:
    sync = t > AT["s4:sama"] + .4
    tick(t, .065 if sync else .045, 3400 if int(t) % 2 else 2600)
    t += 1.0 if sync else .5
g(M.lib("ping"), AT["s4:sama"] + .4, .12)
g(M.lib("whoosh-short"), AT["s4:API"], .08)
typing(AT["s4:Februari"], 10, .5, .05)
typing(AT["s4:UTC"] - .4, 7, .45, .05, bell=True)
f = np.linspace(1500, 300, int(.6 * SR)); g(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.linspace(1, 0, len(f)) * .5, AT["s4:empat"] + .5, .05)
g(M.lib("error"), AT["s4:Tidak"], .1)

# s5: tiny footsteps along the tape, a ping on #156
a0 = K["s5"] + 1.5
r1 = AT["s5:delapan"] + .2
t = a0
while t < r1:
    tick(t, .03, 1800); t += .085
g(M.lib("pop"), AT["s5:builderman"], .12)
g(M.lib("chime"), r1, .12)
typing(AT["s5:delapan"], 8, .45, .05, bell=True)

# s6: rumor spreads: notification pops multiply, glitches
sw0, sw1 = K["s6"] + .6, AT["s6:TikTok"] + .3
for i in range(22):
    u = i / 22
    tt = sw0 + (sw1 - sw0) * (1 - (1 - u) ** 2.2) * .92
    g(M.note(1320 if i % 2 else 1760, .09, "sine", 30), tt, .035)
g(M.lib("glitch-3"), AT["s6:rumor"], .12)
g(M.lib("glitch-1"), AT["s6:TikTok"], .1)
g(M.lib("riser"), K["s7"] - 1.6, .1)

# s7: stamp thud on HOAKS, plate slides in, password field alarm
tS = AT["s7:bukti"]
g(M.thump(.45), tS, .42); g(M.band(M.burst(.12, 30, 1), 120, 2500), tS, .2); g(M.lib("impact-bass-1"), tS, .16)
paper(AT["s7:diblokir"] - .1, .1); g(M.lib("click"), AT["s7:diblokir"] + .3, .1)
g(M.lib("error"), AT["s7:password"], .12)
g(M.lib("glitch-2"), AT["s7:penipuan"], .12); g(M.thump(.3), AT["s7:penipuan"], .2)

# s8: lamp chain click, the case closes
g(M.lib("click"), K["s8"] + .12, .16)
g(M.band(M.burst(.4, 8, 1), 3000, 9000), K["s8"] + .15, .02)
g(M.lib("sparkle"), OUT - .4, .1)
g(M.thump(), OUT, .22)
M.finish(music)
