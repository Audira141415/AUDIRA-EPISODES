"""EP11 sound: D Hijaz (D Eb F# G A Bb C). A low strings-like pad (detuned saw ensemble, slow bow swells), metallic bell chimes
playing Hijaz figures, coin clinks on gold reveals and in the parade, heavy key-chain jingles and footfalls under the porters,
a hush with a soft plucked line for the learned, and a deep earth rumble with cracking glass when the treasury sinks (s7).
Music dips for a voice later via M.finish. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1111)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
HIJ = [0, 1, 4, 5, 7, 8, 10]
D = 50
TC = AT["s7:dibenamkan"]


def deg(d, base=D):
    return base + HIJ[d % 7] + 12 * (d // 7)


def strings(f, dur, att=1.4, rel=1.2):
    """Detuned saw ensemble with a soft top: a bowed string section feel."""
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for dt in (-0.0035, 0.0, 0.0041):
        v = 1 + 0.0025 * np.sin(2 * np.pi * (5.1 + dt * 300) * t + dt * 900)
        ph = 2 * np.pi * f * (1 + dt) * np.cumsum(v) / SR
        x += sum(np.sin(h * ph) / h ** 1.35 for h in range(1, 9))
    env = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, dur - t) / rel)
    return x / 3 * env


def bell(f, dur=2.8, dec=1.6):
    t = np.arange(int(dur * SR)) / SR
    parts = [(1, 1), (2.0, .45), (2.76, .5), (5.4, .22), (8.93, .1)]
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dec * (0.6 + .5 * r)) for r, a in parts) * np.minimum(1, t / .002)


def clink(f=None):
    f = f or rng.uniform(2600, 5200)
    t = np.arange(int(.16 * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + .6 * np.sin(2 * np.pi * f * 1.48 * t) + .3 * np.sin(2 * np.pi * f * 2.31 * t)) * np.exp(-t * 34)


def chain(t0, dens=26, dur=.45, a=.02):
    for x in rng.uniform(0, dur, dens):
        g(clink(rng.uniform(1800, 4200)), t0 + x, a * rng.uniform(.4, 1))


# ---------- strings pad: D drone with Hijaz colour chords per scene
pad = M.mono()
CH = [(0, [0, 7, 12]), (K["s2"], [0, 4, 7]), (K["s3"], [-2, 5, 10]), (K["s4"], [1, 5, 8]), (AT["s4:Al-Qur'an"], [1, 4, 8]),
      (K["s5"], [0, 4, 7]), (K["s6"], [-2, 3, 7]), (TC - .3, None), (K["s8"], [0, 4, 7])]
for i, (t0, ch) in enumerate(CH):
    t1 = CH[i + 1][0] if i + 1 < len(CH) else DUR
    if ch is None:
        continue
    for st in ch:
        M.lay(pad, strings(mid(D - 12 + st), t1 - t0 + 1.4, 1.2, 1.3), t0 - .2, .26)
    M.lay(pad, strings(mid(D - 24), t1 - t0 + 1.4, 1.6, 1.3), t0 - .2, .3)
pe = M.env([(0, .7), (AT["s1:lenyap"], .8), (AT["s1:sekejap"] + .3, .25), (K["s2"], .7), (K["s4"], .8), (K["s5"], .95), (K["s6"], .55),
            (TC - .3, .5), (TC + .2, 0), (K["s8"] - .5, 0), (K["s8"] + 1.5, .65), (END, .6), (DUR - .4, 0), (DUR, 0)])
pad *= pe

# ---------- metallic chimes in Hijaz
ch_ = M.mono()


def figure(t0, degs, beat=.45, base=D + 24, amp=.2, dec=1.6):
    t = t0
    for d, b in degs:
        if d is not None:
            M.lay(ch_, bell(mid(deg(d, base)), 2.6, dec), t, amp)
        t += b * beat


figure(.25, [(4, 1), (3, 1), (2, 1), (1, 2), (0, 3)])
figure(AT["s1:Bayangkan"], [(0, 1), (1, 1), (2, 2), (4, 3)], .42)
figure(K["s2"] + .2, [(7, 2), (6, 1), (5, 1), (4, 3)], .5, D + 12, .16)
figure(AT["s2:perbendaharaan"] - .1, [(4, .5), (5, .5), (7, 1), (8, 1), (7, 3)], .4, D + 24, .2)
figure(K["s3"] + .3, [(0, 2), (2, 2), (1, 2), (0, 4)], .6, D + 12, .13, 1.0)
figure(K["s4"] + .2, [(4, 1), (5, 1), (4, 1), (3, 1), (2, 1), (1, 3)], .45, D + 24, .18)
figure(AT["s4:umat"] - .2, [(1, 2), (0, 2), (-1, 4)], .6, D + 12, .15, 1.0)
for k in range(8):
    figure(K["s5"] + .2 + k * 1.3, [(4 + (k % 3), .5), (2 + (k % 2), .5), (0 + (k % 3), 1)], .32, D + 24, .1)
figure(K["s8"] + 1.4, [(0, 2), (2, 2), (4, 2), (7, 5)], .6, D + 12, .15, .9)
figure(END - 1.6, [(4, 1), (2, 1), (0, 4)], .5, D + 24, .12, .8)

# ---------- s6: soft plucked line by lamp light
pl = M.mono()
t = AT["s6:berilmu"]
for d, b in [(0, 2), (2, 1), (4, 1), (3, 2), (2, 1), (1, 1), (0, 3), (4, 2), (5, 1), (4, 1), (2, 2), (1, 1), (0, 3)]:
    M.lay(pl, M.note(mid(deg(d, D + 12)), 1.6, "pluck", 2.2), t, .22)
    t += b * .36
    if t > K["s6e"]:
        break

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (pad * .6 + ch_ + pl) * fin
music = stereo(music_m, (.25 * ch_ + .08 * pad + .15 * pl) * fin)

# ---------- ambience
room = M.band(rng.standard_normal(N), 60, 500); room /= np.abs(room).max()
re = M.env([(0, .5), (K["s6"], .25), (TC, .6), (K["s8"], .1), (DUR, 0)])
M.fx += np.stack([room * re * .02, np.roll(room, 1100) * re * .02], 1)
crowd = M.band(rng.standard_normal(N), 250, 1400) * (1 + .5 * np.sin(2 * np.pi * .7 * T) * np.sin(2 * np.pi * .23 * T + 2)); crowd /= np.abs(crowd).max()
ce = M.env([(0, 0), (K["s5"], 0), (K["s5"] + 1.5, .7), (K["s6"], .5), (AT["s6:berilmu"], .05), (TC, .05), (TC + 1.2, .4), (K["s8"], 0), (DUR, 0)])
M.fx += np.stack([crowd * ce * .028, np.roll(crowd, 2000) * ce * .028], 1)
# lamp flame breath in s6
fl = M.band(rng.standard_normal(N), 150, 1200) * (1 + .4 * np.sin(2 * np.pi * 3.1 * T)); fl /= np.abs(fl).max()
fe = M.env([(0, 0), (K["s6"], 0), (AT["s6:berilmu"], .6), (K["s6e"], .5), (K["s7"] + .3, 0), (DUR, 0)])
M.fx += np.stack([fl * fe * .02, fl * fe * .02], 1)
crk = M.band(M.burst(.02, 200, 1), 1500, 7000)
for x in rng.uniform(K["s6"], K["s7"], 70):
    g(crk, x, .012)

# ---------- porters: heavy steps and key chains (s1-s2)
for x in np.arange(0.2, 22.2, .82):
    g(M.thump(.22), x, .05); chain(x + .05, 10, .3, .012)
for x in (0.1, AT["s1:dipikul"], AT["s2:kunci"]):
    chain(x, 30, .55, .03)
g(M.band(M.burst(1.2, 3, 2), 60, 400), M.word("s1", "berat"), .08)

# ---------- events
sheen = lambda t, a=.02: g(M.band(M.burst(.6, 6, 1), 4000, 13000) * np.sin(np.linspace(0, np.pi, int(.6 * SR))), t, a)
for p in ["s2", "s2:Allah", "s3", "s4", "s4:Al-Qur'an", "s5", "s5:Orang-orang", "s6", "s7", "s7:Dan", "s8"]:
    tp = AT.get(p, K.get(p))
    sheen(tp - .25, .03); g(M.lib("whoosh-short"), tp - .25, .02)
for p in ["s2:Al-Qasas", "s4:aku", "s4:mengingatkan", "s5:keluar", "s6:menjawab", "s7:dibenamkan", "s7:iri"]:
    g(M.tone((2100, 3150), .6, 7), AT[p], .018)
g(M.lib("impact-bass-1"), 0.1, .1)
# lights dip at "lenyap ... sekejap"
g(M.band(M.burst(1.0, 4, 2), 40, 300), AT["s1:lenyap"], .1)
g(M.lib("impact-bass-1"), AT["s1:sekejap"], .08)
# gold reveals: coin cascades
for t0, n, sp in ((AT["s2:perbendaharaan"], 40, 1.4), (M.word("s2", "luar"), 25, .9), (K["s5"] + .6, 30, 1.0)):
    for x in rng.uniform(0, sp, n):
        g(clink(), t0 + x, .02 * rng.uniform(.4, 1))
g(M.lib("sparkle"), AT["s2:perbendaharaan"], .04)
# s4: orb hum, ghost cities rise and crumble
g(M.tone((110, 165.3, 220.7), 4.5, .3) * np.minimum(1, np.arange(int(4.5 * SR)) / SR / 1.5), K["s4"], .025)
g(M.lib("riser"), AT["s4:umat"] - 1.0, .025)
for k in range(10):
    g(M.band(M.burst(.6, 7, 3), 80, 1400), AT["s4:dibinasakan"] + k * .16, .05 * (1 - k / 12))
g(M.lib("impact-bass-1"), AT["s4:dibinasakan"], .09)
# s5 parade glitter
for x in rng.uniform(K["s5"], K["s6"], 140):
    g(clink(rng.uniform(4000, 7000)), x, .007)
g(M.lib("chime"), AT["s5:kemegahannya"], .03)
# s7: crack, rumble, falling tiles, debris; the onlookers step back
for k in range(9):
    g(M.band(M.burst(.25, 18, 1), 1200, 9000), TC - .35 + k * .09 + rng.uniform(0, .05), .06)
rum = M.band(rng.standard_normal(N), 18, 140); rum /= np.abs(rum).max()
sub = np.sin(2 * np.pi * (31 * T + 4 * np.sin(2 * np.pi * .3 * T)))
rue = M.env([(0, 0), (TC - .2, 0), (TC + .5, 1), (TC + 4, .9), (TC + 8.5, .4), (AT["s7:untung"], .15), (K["s8"] + 2.5, 0), (DUR, 0)])
M.fx += np.stack([(rum * .3 + sub * .12) * rue, (np.roll(rum, 500) * .3 + sub * .12) * rue], 1)
g(M.lib("impact-bass-1"), TC + .2, .16); g(M.thump(.5), TC + .2, .2)
for x in rng.uniform(TC + .2, TC + 2.6, 40):
    g(M.band(M.burst(.18, 25, 2), 150, 2500), x, .03)
for x in rng.uniform(TC + 1, TC + 7, 30):
    g(clink(rng.uniform(1500, 3500)), x, .01)
for x in np.arange(TC + .6, TC + 2.6, .33):
    g(M.band(M.burst(.06, 60, 1), 400, 3000), x + rng.uniform(0, .05), .015)
# s8: the earth closes, then calm
g(M.band(M.burst(2.4, 1.5, 4), 40, 600), K["s8"] - 1.2, .05)
g(M.thump(.4), K["s8"] + 2.0, .08)
g(M.lib("chime"), AT["s8:Kisah"], .04)
g(M.lib("whoosh"), OUT - .2, .035); g(M.lib("chime"), OUT + .3, .05)
M.finish(music)
print("duration", DUR)
