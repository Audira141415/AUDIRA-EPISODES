"""EP25 sound: maqam Hijaz on D (D Eb F# G A Bb C D). Low synth pads (detuned saws through a soft band-pass, slow swells)
hold Hijaz chords under the whole film; a plucked oud answers in short phrases; radio-static blips and telemetry beeps
belong to the satellite HUD (garden brackets, village links, labels). Hook: a dam crack, a water rush, then a reversed
"rewind" sweep back to the intact valley. s4: the oud phrases stretch apart as the villages drift. s5: the real breach
with a long water rush and rumble that dries into wind. s6-s8: wind, thin pad, oud. Panel scan sweeps get a short
filtered noise sweep. Music dips for a voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(2025)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
ROOT = 50  # D3
HJ = [0, 1, 4, 5, 7, 8, 10]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
deg = lambda d: ROOT + 12 + HJ[d % 7] + 12 * (d // 7)
n = lambda d: np.arange(int(d * SR)) / SR

tH = AT["s1:banjir"] + .1
tR0, tR1 = K["s1e"] - .62, K["s2"] - .03
tB = AT["s5:banjir"] - .1
tJ = AT["s4:jauhkanlah"]


def pad(freqs, dur):
    t = n(dur)
    x = np.zeros(len(t))
    for f in freqs:
        for dt in (-.0035, 0, .004):
            ff = f * (1 + dt)
            x += sum(np.sin(2 * np.pi * ff * h * t + h) / h ** 1.6 for h in range(1, 6))
    x = M.band(x, 60, 1400)
    return x * np.sin(np.pi * t / dur) ** 1.5


def oud(f, dur=1.4):
    t = n(dur)
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0006 * h)) * np.exp(-t * (2.2 + 1.2 * h)) / h ** .8 for h in range(1, 10))
    pick = M.band(rng.standard_normal(len(t)), 1800, 6500) * np.exp(-t * 110) * .22
    return (x + pick) * np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .05)


# ---------- pads: Hijaz chords (D, Gm, Cm, D) every ~6.5 s
pads = M.mono()
CH = [[ROOT - 12, ROOT - 5, ROOT + 6 - 12], [ROOT - 7, ROOT - 4, ROOT], [ROOT - 2, ROOT + 1 - 12, ROOT + 5 - 12], [ROOT - 12, ROOT - 5, ROOT + 3 - 12]]
for i, t0 in enumerate(np.arange(-1, DUR, 6.5)):
    M.lay(pads, pad([hz(m) for m in CH[i % 4]], 8.5), max(0, t0), .22)
pads *= M.env([(0, .5), (2.5, .8), (tH, 1.0), (tR0, .9), (tR1, .3), (K["s2"] + .5, .8), (K["s4"], .9), (tB - .3, 1), (tB + .3, .4), (K["s6"], .6), (K["s7"], .8), (END, .8), (DUR - .3, 0), (DUR, 0)])
sub = np.sin(2 * np.pi * hz(ROOT - 24) * T) * (.5 + .5 * np.sin(2 * np.pi * .07 * T)) * M.env([(0, .0), (2, .25), (tB, .35), (tB + 4, .15), (DUR - .3, 0), (DUR, 0)])

# ---------- oud phrases
od = M.mono()


def phrase(t0, notes, amp=.28, stretch=1.0):
    t = t0
    for d, b in notes:
        M.lay(od, oud(hz(deg(d)), max(.7, b + .6)), t, amp)
        t += b * stretch


phrase(.3, [(4, .4), (3, .3), (2, .3), (1, .45), (0, 1.2)], .24)
phrase(K["s2"] + .3, [(0, .3), (1, .3), (2, .3), (3, .3), (4, .6), (5, .3), (4, .9)], .27)
phrase(AT["s2:Makanlah"], [(4, .3), (5, .3), (6, .3), (7, 1.2)], .24)
phrase(K["s3"] + .2, [(7, .4), (6, .3), (5, .3), (4, .9)], .22)
phrase(AT["s3:jalur"], [(0, .25), (2, .25), (4, .25), (5, .25), (4, .25), (2, .25), (1, .25), (0, .8)], .2)
phrase(K["s4"] + .2, [(2, .3), (1, .3), (0, 1.0)], .22)
phrase(tJ, [(4, .3), (5, .3), (4, .3), (2, .3), (1, .3), (0, .3)], .2, stretch=2.4)  # the phrase drifts apart like the villages
phrase(K["s6"] + 1.0, [(0, .5), (1, .4), (2, .4), (1, 1.2)], .2)
phrase(AT["s7:tanda"], [(4, .35), (3, .3), (2, .3), (1, .3), (0, 1.3)], .24)
phrase(AT["s8:Kisah"] - .3, [(4, .4), (5, .3), (4, .3), (2, .4), (0, 1.6)], .24)

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (pads + .4 * sub + od) * fin
music = stereo(music_m, (.1 * od + .08 * pads) * fin)

# ---------- satellite: radio static blips + telemetry beeps
static = lambda d=.12: M.band(rng.standard_normal(int(d * SR)), 1200, 7000) * np.sin(np.pi * n(d) / d) * (1 + .8 * np.sign(np.sin(2 * np.pi * 37 * n(d))))
beep = lambda f=1760, d=.07: M.tone([f], d) * .8
for x in [.15, 1.4, 2.6]:
    g(static(.18), x, .02)
for w in ["s1:kanan", "s1:kiri", "s2:tanda", "s2:kanan", "s2:kiri", "s3:Negeri", "s3:jalur", "s3:diberkahi", "s5:pahit", "s5:atsl", "s5:sidr", "s6:Ma'rib", "s6:abad", "s6:2023", "s7:tanda"]:
    g(beep(1760), AT[w] - .05, .025); g(beep(2349), AT[w] + .04, .018)
for i in range(12):
    g(beep(1320 + 40 * i, .045), AT["s3:kampung-kampung"] - .2 + i * .16, .014)
for x in rng.uniform(3, K["s8"], 22):
    g(static(rng.uniform(.06, .16)), x, rng.uniform(.006, .013))
for x in np.arange(tJ, tJ + 3.6, .45):  # distance meter ticks slowing down
    g(beep(980, .05), x + (x - tJ) * .15, .012)
# scan sweeps on scene changes
sweep = lambda: M.band(rng.standard_normal(int(.6 * SR)), 900, 6000) * np.sin(np.pi * n(.6) / .6) ** 2 * np.linspace(.4, 1, int(.6 * SR))
for k in ["s2", "s3", "s4", "s5", "s6", "s7", "s8"]:
    g(sweep(), K[k] - .2, .022)
for p in ["s2:Makanlah", "s3:Mereka", "s5:Kebun", "s7:Tapi"]:
    g(sweep(), AT[p] - .2, .015)

# ---------- desert wind (always, swells in s6-s8)
wind = M.band(rng.standard_normal(N), 150, 1500) * (1 + .6 * np.sin(2 * np.pi * .08 * T) * np.sin(2 * np.pi * .033 * T + 1))
wind /= np.abs(wind).max()
we = M.env([(0, .25), (2.5, .15), (K["s5"], .15), (K["s6"], .35), (K["s8"], .45), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .04, np.roll(wind, 1500) * we * .04], 1)
# canal trickle while the gardens are irrigated (s2-s3)
tr = M.band(rng.standard_normal(N), 2500, 9000) * (1 + rng.standard_normal(N) ** 2 * .3)
tr /= np.abs(tr).max()
te = M.env([(0, 0), (K["s2"], 0), (K["s2"] + .8, .5), (K["s3e"], .4), (K["s4"], 0), (DUR, 0)])
M.fx += np.stack([tr * te * .012, np.roll(tr, 700) * te * .012], 1)


# ---------- breach + water rush (hook preview and the real flood)
def flood(t0, dur, amp):
    crack = M.band(M.burst(1.0, 5, 1), 60, 5000)
    g(crack, t0, .18 * amp); g(M.lib("impact-bass-1"), t0, .18 * amp); g(M.thump(.6), t0 + .02, .15 * amp)
    for x in rng.uniform(t0 + .1, t0 + 2.2, 26):
        g(M.band(M.burst(rng.uniform(.15, .4), rng.uniform(10, 22), 2), 150, 2500), x, rng.uniform(.01, .03) * amp)
    w = M.band(rng.standard_normal(int(dur * SR)), 80, 2600)
    w *= 1 + .5 * M.band(rng.standard_normal(int(dur * SR)), .5, 6)
    w /= np.abs(w).max()
    e = np.interp(n(dur), [0, .5, 2, dur * .55, dur], [0, 1, .9, .5, 0])
    g(np.stack([w * e, np.roll(w, 900) * e], 1), t0 + .05, .11 * amp)
    rum = M.band(rng.standard_normal(int(dur * SR)), 18, 110); rum /= np.abs(rum).max()
    g(rum * np.interp(n(dur), [0, .2, dur * .5, dur], [0, 1, .4, 0]), t0, .3 * amp)


flood(tH, tR0 - tH + .3, .8)
# rewind: a reversed noise swell rising into s2
rv = M.band(rng.standard_normal(int(.9 * SR)), 300, 8000) * np.linspace(0, 1, int(.9 * SR)) ** 2
g(rv, tR0 - .05, .05); g(M.lib("glitch-1"), tR0, .03); g(M.lib("glitch-2"), tR1 - .25, .025)
g(M.lib("riser"), tB - 1.4, .02)
flood(tB, 7.0, 1.0)
# scrub replacing the fields: dry rustle
rus = M.band(rng.standard_normal(int(4 * SR)), 2000, 8000) * np.sin(np.pi * n(4) / 4) * (1 + 2 * rng.standard_normal(int(4 * SR)) ** 2)
g(rus / np.abs(rus).max(), AT["s5:Kebun"], .012)
# s6: stone settle near the ruin
for x in np.linspace(K["s6"] + .4, K["s6"] + 2.4, 5):
    g(M.band(M.burst(.1, 50, 2), 250, 2200), x + rng.uniform(0, .2), .016)

g(M.lib("chime"), AT["s8:AUDIRA"], .03)
g(M.lib("whoosh"), OUT - .2, .03); g(M.lib("chime"), OUT + .3, .045)
M.finish(music)
print("duration", DUR)
