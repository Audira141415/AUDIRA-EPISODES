"""EP04 KOREK API sound: a microscope-lab bed at 84 BPM. Glassy FM bells over a breathing sine pad (Dm9 - Bbmaj7 - Fmaj7 - C6),
a soft heartbeat sub and a granular 'brownian' fizz of tiny clicks. The dive at the strike drops into a filtered drone,
the ignition opens the bed back up. SFX: real strike scrape + ignition whoosh synthesized here, splashes for the dips,
a wood peel rumble, chops, a stamp on PEWARNA, counters and the outro. Run from this folder: python mix.py"""
import json, sys
sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4404)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]

beat = 60 / 84
D3 = 146.83
chords = [[0, 3, 7, 10, 14], [-4, 0, 3, 7, 10], [3, 7, 10, 14], [-2, 2, 5, 9]]  # Dm9, Bbmaj7, Fmaj7, C6 (semitones from D)
pad, bell, sub, fizz = M.mono(), M.mono(), M.mono(), M.mono()


def padnote(f, dur):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * d * t + ph) for d, ph in ((1, 0), (1.003, 1.3), (0.997, 2.1), (2.001, .5)))
    lfo = 1 + .25 * np.sin(2 * np.pi * .25 * t)
    return x * lfo * np.minimum(1, t / 1.4) * np.minimum(1, (dur - t) / 1.2) / 4


def fm(f, dur=2.2, idx=2.2):
    t = np.arange(int(dur * SR)) / SR
    mod = idx * np.exp(-t * 3) * np.sin(2 * np.pi * f * 3.5 * t)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.4) * np.minimum(1, t / .003)


bar, t0 = 0, 0.0
pat = [0, 2, 4, 1, 3, 2, 4, 0]
while t0 < DUR:
    ch = chords[bar % 4]
    for s in ch:
        M.lay(pad, padnote(D3 * 2 ** (s / 12), beat * 4 + 1.2), t0, .2)
    for k in range(4):
        M.lay(sub, M.note(D3 / 4 * 2 ** (ch[0] / 12), .45, "sine", 6, .01), t0 + k * beat, .9 if k % 2 == 0 else .45)
    for k in range(8):
        if (bar * 8 + k) % 5 == 3:
            continue
        s = ch[pat[(bar + k) % 8] % len(ch)] + 12 * (k % 4 == 3)
        M.lay(bell, fm(D3 * 4 * 2 ** (s / 12)), t0 + k * beat / 2 + .01, .16 if k % 2 == 0 else .1)
    t0 += beat * 4
    bar += 1
# brownian fizz: sparse tiny band-passed clicks
cl = (M.rng.random(N) > .9993).astype(float) * M.rng.uniform(.3, 1, N)
fizz = M.band(np.convolve(cl, np.exp(-np.arange(120) / 18), mode="same"), 2500, 9000)

tP, tN = AT["s6:panas"], AT["s6:menyala"]
drone = M.band(M.note(D3 / 2, 9, "saw", .02, .4) + .5 * M.note(D3 / 2 * 1.498, 9, "saw", .02, .4), 40, 700)
dr = M.mono(); M.lay(dr, drone, tP - .3, .5)
bed = M.env([(0, .6), (K["s2"] - .3, .6), (K["s2"] + .8, 1), (tP - .2, 1), (tP + .4, .15), (tN - .1, .15), (tN + .6, 1), (END, 1), (DUR, .3)])
dre = M.env([(0, 0), (tP - .3, 0), (tP + .5, 1), (tN, 1), (tN + .5, 0), (DUR, 0)])
mono = (.9 * pad + .75 * bell + .8 * sub) * bed + .25 * fizz + dr * dre
music = stereo(mono, .14 * np.roll(bell, 1300) * bed + .08 * np.roll(fizz, 400))


def scrape(dur=.45):
    n = int(dur * SR)
    x = M.band(M.rng.standard_normal(n), 900, 7000) * (M.rng.random(n) > .6)
    t = np.arange(n) / SR
    return x * np.minimum(1, t / .02) * np.exp(-t * 3)


def ignite(dur=1.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = M.band(M.rng.standard_normal(n), 120, 2400)
    return x * np.minimum(1, t / .05) * np.exp(-t * 2.2) + .4 * np.sin(2 * np.pi * (70 * t + 30 * t * t)) * np.exp(-t * 3)


def splash(a=.12):
    return M.band(M.burst(.5, 7, 2), 300, 5000) * a


def blip(t, a=.08, f=1318.5):
    g(.6 * M.tone([f], .07, 30), t, a)
    g(.6 * M.tone([f * 1.5], .1, 20), t + .07, a)


# s1 hook
g(M.lib("impact-bass-1"), .02, .14)
g(M.lib("whoosh-cinematic"), .08, .06)
for w in ("dinding", "batu", "sepatu"):
    g(M.lib("error"), AT[f"s1:{w}"] + .05, .045)
g(M.lib("chime"), AT["s1:kotak"], .08)
g(M.lib("sparkle"), AT["s1:Setengah"], .05)
# s2 history
g(M.lib("whoosh-cinematic"), K["s2"] - .2, .1)
g(M.lib("riser"), K["s2"] - 1.0, .04)
g(ignite(.6), AT["s2:menyala"], .08)
g(M.lib("glitch-2"), AT["s2:racunnya"], .04)
g(M.lib("whoosh-short"), AT["s2:memisahkan"], .1)
g(M.lib("ping"), AT["s2:Pasch"], .06)
g(M.lib("pop"), AT["s2:bahannya"], .08)
for i in range(6):
    g(M.lib("click-soft"), AT["s2:bersaudara"] + i * .16, .06)
# s3 log
g(M.lib("whoosh-cinematic"), K["s3"] - .2, .1)
g(M.band(M.burst(4.5, .4, 30), 60, 700), AT["s3:dikupas"] - .2, .12)
for i in range(10):
    g(M.lib("click"), AT["s3:dipotong"] + i * .57, .05)
g(M.lib("ping"), AT["s3:370.000"], .07)
# s4 tank + belt + paraffin
g(M.lib("whoosh"), K["s4"] - .1, .1)
g(splash(.18), AT["s4:direndam"])
g(M.lib("sparkle"), AT["s4:amonium"], .05)
g(M.lib("whoosh-short"), AT["s4:ditancapkan"] - .1, .08)
for i in range(5):
    g(M.lib("click"), AT["s4:ditancapkan"] + .15 + i * .14, .05)
g(splash(.14), AT["s4:parafin"])
g(M.lib("chime"), AT["s4:merambat"] if "s4:merambat" in AT else AT["s4:parafin"] + 1.5, .05)
# s5 paste + ingredients + drying + coater
g(M.lib("whoosh"), K["s5"] - .1, .09)
g(splash(.16), AT["s5:dicelup"])
for i, w in enumerate(("kalium", "belerang", "bubuk", "lem", "pewarna")):
    blip(AT[f"s5:{w}"], .06, 1046.5 * 2 ** (i * 2 / 12))
g(M.lib("whoosh-cinematic"), AT["s5:Sabuk"], .08)
g(M.lib("whoosh-short"), AT["s5:Kotaknya"] - .2, .08)
g(M.band(M.burst(1.2, 2, 8), 200, 2500), AT["s5:Kotaknya"] + .2, .06)
# s6 strike + dive + reaction
g(M.lib("whoosh-short"), K["s6"] - .1, .08)
g(M.thump(), AT["s6:pewarna"], .14)
g(M.lib("click"), AT["s6:pewarna"], .1)
g(scrape(), AT["s6:digesek"], .3)
g(M.lib("riser"), tP - .3, .07)
g(M.lib("whoosh-cinematic"), tP + .2, .14)
g(M.lib("glitch-1"), AT["s6:mengubah"], .04)
g(M.lib("sparkle"), AT["s6:reaktif"], .07)
g(M.lib("riser"), tN - 2.2, .06)
g(M.lib("impact-bass-1"), tN, .3)
g(ignite(), tN, .28)
# s7 field + counter
g(M.lib("whoosh-cinematic"), K["s7"] + .2, .11)
for i in range(14):
    g(M.lib("click-soft"), K["s7"] + .6 + i * .11, .035)
g(M.lib("ping"), AT["s7:juta"], .08)
# s8 + outro
g(M.lib("whoosh"), K["s8"] - .2, .09)
g(M.lib("chime"), AT["s8:bertemu"], .08)
g(M.lib("sparkle"), AT["s8:AUDIRA"], .07)
g(M.lib("whoosh"), OUT - .35, .1)
g(M.thump(), OUT, .16)
M.finish(music)
