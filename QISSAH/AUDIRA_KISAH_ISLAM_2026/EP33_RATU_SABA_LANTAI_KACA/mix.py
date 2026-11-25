"""EP33 sound: maqam Kurd on D (D, E-flat, F, G, A, B-flat, C). A synthesized qanun (bright triple-course plucks, the
long notes played as the qanun's fast tremolo) states short Kurd phrases over a glass pad (sine partials with slow
beating, like rubbed glass) and a low D/A drone. Ambience changes with the place: water lapping under the glass floor in
Sulaiman's palace, warm hall air with a faint lamp hiss in the Saba court.
Story cues: a water ripple when the queen lifts her garment (s1, s7) and a rising glass shimmer when the floor is revealed
as glass; a soft chime as the letter descends and a small seal crack plus written-light glissando on "dengan nama
Allah" (s2); two low frame-drum hits on "kuat ... berperang", a dry glass shatter as the city maquette breaks
(s3); a whoosh as the gift travels, a deep glass "thoom" and ring at the refusing gate, an ascending glass arpeggio as the
pillars light (s4); a riser while the light gathers, then impact + bright bloom at "berkedip" (s5); a sparkle sweep as the
throne changes and two detuned glass tones that settle into unison on "seakan-akan itulah dia" (s6). Music opens into a
warmer close (D with a major third) at the surrender and the sign-off. Music dips for a voice later via M.finish."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(3327)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
ROOT = 50  # D3
KURD = [0, 1, 3, 5, 7, 8, 10]
WARM = [0, 2, 4, 5, 7, 9, 10]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
deg = lambda d, sc=KURD: ROOT + 12 + sc[d % 7] + 12 * (d // 7)
n = lambda d: np.arange(int(d * SR)) / SR


def qanun(f, dur=1.2, trem=False):
    """Triple-course plucked string; long notes as fast tremolo re-plucks."""
    t = n(dur)
    def pluck(tt):
        x = np.zeros(len(tt))
        for c in (-0.0012, 0, 0.0013):
            x += sum(np.sin(2 * np.pi * f * (1 + c) * h * tt * (1 + .0004 * h)) * np.exp(-tt * (3.0 + 1.6 * h)) / h ** .7 for h in range(1, 11))
        return x / 3
    x = pluck(t)
    if trem:
        step = .072
        for k, s in enumerate(np.arange(step, dur - .1, step)):
            i = int(s * SR)
            x[i:] += pluck(t[: len(t) - i]) * (.62 - .25 * (k % 2)) * np.exp(-s * .6)
    pick = M.band(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-t * 160) * .25
    return (x + pick) * np.minimum(1, t / .002) * np.minimum(1, (dur - t) / .08)


def phrase(buf, t0, notes, amp=.26, sc=KURD):
    t = t0
    for d, b in notes:
        M.lay(buf, qanun(hz(deg(d, sc)), max(.8, b + .6), trem=b >= .9), t, amp)
        t += b


def glassnote(f, dur=2.0, dec=1.4):
    t = n(dur)
    x = sum(a * np.sin(2 * np.pi * f * r * t) for r, a in ((1, 1), (2.76, .45), (5.4, .25), (8.93, .12)))
    return x * np.exp(-t * dec) * np.minimum(1, t / .004) / 1.8


def shimmer(dur=1.6, f0=1760, up=True):
    t = n(dur)
    out = np.zeros(len(t))
    for i in range(10):
        s = (i / 10) * dur * .7
        f = f0 * 2 ** ((i if up else 9 - i) / 7)
        k = int(s * SR)
        nt = glassnote(f, dur - s, 3.5)[: len(t) - k]
        out[k:k + len(nt)] += nt * .4
    return out


# ---------- drone + glass pad (Kurd colour; warmer third for the surrender)
tWarm = AT["s7:berserah"] - .6
drone = M.mono()
seg = 9.0
for t0 in np.arange(-1, DUR, seg - 2):
    dt = n(seg)
    warm = t0 >= tWarm - 4
    for nn, a, det in ((ROOT - 24, .5, 0), (ROOT - 17, .28, .12), (ROOT - 12, .2, -.1)):
        f = hz(nn)
        x = np.sin(2 * np.pi * f * dt) + .3 * np.sin(2 * np.pi * 2 * f * dt) + .45 * np.sin(2 * np.pi * (f + det) * dt + 1)
        M.lay(drone, x * np.sin(np.pi * dt / dt[-1]) ** 2, max(0, t0), a)
    # glass pad: rubbed-glass partials with slow beating
    for nn, a in ((ROOT + 12, .08), (ROOT + 19, .06), (ROOT + (16 if warm else 15), .05), (ROOT + 24, .035)):
        f = hz(nn)
        x = np.sin(2 * np.pi * f * dt) * (1 + .35 * np.sin(2 * np.pi * .7 * dt)) + .5 * np.sin(2 * np.pi * (f * 1.003) * dt)
        M.lay(drone, x * np.sin(np.pi * dt / dt[-1]) ** 2, max(0, t0), a)
music_env = M.env([(0, .6), (K["s2"], .8), (K["s3"], .75), (K["s4"], .8), (K["s5"], .7), (AT["s5:berkedip"] - .2, .55), (AT["s5:berkedip"] + .6, .95),
                   (K["s6"], .85), (K["s7"], .9), (tWarm, 1.0), (K["s8"], 1.0), (DUR - .5, 0), (DUR, 0)])

qn = M.mono()
phrase(qn, .3, [(4, .45), (3, .3), (2, .3), (1, .3), (0, 1.2)], .22)
phrase(qn, K["s2"] + .4, [(0, .35), (1, .35), (2, .7), (4, .35), (3, .35), (2, 1.2)], .24)
phrase(qn, AT["s2:dengan"] + .2, [(4, .5), (5, .4), (4, 1.4)], .2)
phrase(qn, K["s3"] + .3, [(2, .35), (1, .35), (0, 1.0)], .22)
phrase(qn, AT["s3:Ia#3"] if "s3:Ia#3" in AT else K["s3"] + 7.4, [(5, .35), (4, .35), (3, .35), (2, .35), (1, 1.1)], .2)
phrase(qn, AT["s3:memilih"], [(0, .4), (2, .4), (4, .9)], .2)
phrase(qn, K["s4"] + .3, [(4, .35), (3, .35), (1, .35), (0, 1.0)], .2)
phrase(qn, AT["s4:Allah"] - .2, [(0, .3), (2, .3), (4, .3), (5, .3), (7, 1.2)], .2)
phrase(qn, AT["s5:Sulaiman"] + .2, [(7, .4), (6, .4), (5, .4), (4, 1.0), (2, .4), (4, 1.4)], .22)
phrase(qn, K["s6"] + .3, [(2, .35), (3, .35), (4, .7), (3, .35), (2, 1.1)], .2)
phrase(qn, AT["s6:Tidak"], [(4, .4), (2, .4), (3, .4), (1, .4), (0, 1.2)], .2)
phrase(qn, K["s7"] + .3, [(0, .4), (1, .4), (2, .9)], .2)
phrase(qn, tWarm + .5, [(0, .5), (2, .5), (4, .5), (7, 1.6)], .22, WARM)
phrase(qn, K["s8"] + .6, [(7, .5), (4, .5), (5, .5), (4, .5), (2, 1.2)], .2, WARM)
phrase(qn, AT["s8:Kisah"], [(4, .5), (2, .5), (0, 2.2)], .2, WARM)

music = np.stack([drone, drone], 1) * music_env[:, None] + stereo(qn * music_env * 1.5, qn * music_env * .45)

# ---------- ambience: water lapping in the palace, warm hall air in Saba
inB = M.env([(0, 1), (K["s2"] - .3, 1), (K["s2"] + 1.6, 0), (AT["s3:lalu"], 0), (K["s4"] + .3, 1), (DUR, 1)])
lap = M.band(rng.standard_normal(N), 120, 900) * (.5 + .5 * np.sin(2 * np.pi * T / 2.3) * np.sin(2 * np.pi * T / 5.1 + 1)) ** 2
lap += M.band(rng.standard_normal(N), 1800, 5000) * .12 * (.5 + .5 * np.sin(2 * np.pi * T / 1.7))
air = M.band(rng.standard_normal(N), 200, 1500) * (.7 + .3 * np.sin(2 * np.pi * T / 6.2))
amb_env = M.env([(0, .6), (DUR - .4, .6), (DUR, 0)])
M.fx += stereo((lap * inB * .035 + air * (1 - inB) * .02) * amb_env, M.band(rng.standard_normal(N), 400, 2400) * amb_env * .008)


def ripple(dur=1.4):
    t = n(dur)
    x = np.sin(2 * np.pi * (380 * t + 900 * t * t)) * np.exp(-t * 9) * .5
    x += M.band(rng.standard_normal(len(t)), 300, 2500) * np.exp(-t * 3.5) * np.sin(np.pi * t / dur) * .35
    return x


def shatter():
    out = np.zeros(int(1.4 * SR))
    for i in range(16):
        s = rng.uniform(0, .45)
        nt = glassnote(rng.uniform(2200, 6500), .8, 9) * rng.uniform(.25, .6)
        k = int(s * SR)
        out[k:k + len(nt)] += nt[: len(out) - k]
    out[:int(.3 * SR)] += M.band(M.burst(.3, 25, 1), 2000, 9000) * .5
    return out


def drum(dur=.6):
    t = n(dur)
    return np.sin(2 * np.pi * (70 * t + 30 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 7) + .25 * M.band(M.burst(dur, 30, 2), 200, 1500)


# hook: steps, ripple at the lifted garment, water, glass revealed
g(ripple() * .3, AT["s1:menyingkap"] + .1)
g(ripple(1.0) * .2, AT["s1:air"] - .25)
g(stereo(shimmer(2.0, 1320), shimmer(2.0, 1480) * .5) * .16, AT["s1:Ternyata"] - .05)
g(glassnote(hz(ROOT + 36), 2.5, 1.2) * .1, AT["s1:Ternyata"] + .4)
# panel changes: a faint glass tick
for a in ["s2", "s2:dengan", "s2:Janganlah", "s3", "s3:Mereka", "s3:Ia#3", "s3:Maka", "s4", "s4:Lalu", "s5", "s5:Sulaiman", "s6", "s6:serupa", "s6:Tidak", "s7", "s7:Ia", "s8"]:
    t0 = K[a] if a in K else AT.get(a)
    if t0 is not None:
        g(glassnote(2637, .6, 7) * .05, t0 - .04)
# s1 -> s2 glide over the dunes
g(M.lib("whoosh-cinematic") * .2, K["s2"] - .3)
# s2 letter descends, seal cracks, light written
g(glassnote(hz(ROOT + 31), 2.6, 1.0) * .12, AT["s2:Saba"])
g(M.lib("click") * .2, AT["s2:dengan"])
g(M.band(M.burst(.2, 40, 1), 1500, 7000) * .2, AT["s2:dengan"])
g(shimmer(2.6, 1175, up=False) * .14, AT["s2:dengan"] + .3)
# s3 council: drums on strength, war-table soldiers, shatter of the city
g(drum() * .35, AT["s3:kuat"])
g(drum() * .3, AT["s3:berperang"] if "s3:berperang" in AT else AT["s3:kuat"] + .9)
for i in range(8):
    g(M.lib("click-soft") * .12, AT["s3:memasuki"] + i * .19)
g(shatter() * .3, AT["s3:merusaknya"])
g(M.thump(.4) * .18, AT["s3:merusaknya"])
g(glassnote(hz(ROOT + 24), 2.2, 1.1) * .14, AT["s3:memilih"])
g(M.lib("whoosh") * .22, AT["s3:mengirim"] + .3)
# s4 refusal at the gate, return, pillars light
thoom = glassnote(hz(ROOT - 12), 3.0, 1.2)
thoom[:int(.6 * SR)] += M.thump(.6) * .6
g(thoom * .32, AT["s4:menolak"])
g(stereo(glassnote(hz(ROOT + 26), 2.4, 1.5), glassnote(hz(ROOT + 26) * 1.004, 2.4, 1.5)) * .1, AT["s4:menolak"] + .05)
g(M.lib("whoosh-short") * .16, AT["s4:menolak"] + .55)
for i in range(7):
    g(glassnote(hz(deg(i)) * 4, 1.6, 2.2) * .07, AT["s4:Allah"] - .4 + i * .22)
# s5 gathering, flash, gratitude
g(M.lib("riser") * .18, AT["s5:membawanya"] - .3)
g(M.lib("impact-bass-1") * .36, AT["s5:berkedip"])
g(stereo(shimmer(2.4, 1760), shimmer(2.4, 1975) * .6) * .18, AT["s5:berkedip"] + .02)
g(M.lib("sparkle") * .14, AT["s5:berkedip"] + .3)
for i in range(6):
    g(glassnote(hz(deg(4 + i % 3, WARM)) * 2, 1.8, 1.8) * .05, AT["s5:Sulaiman"] + .4 + i * .7)
# s6 the change, the ghost settling into unison
g(M.lib("sparkle") * .16, AT["s6:diubah"] - .1)
g(shimmer(1.8, 1568, up=False) * .12, AT["s6:diubah"])
ts, dd = AT["s6:seakan-akan"], AT["s6:itulah"] + .9 - AT["s6:seakan-akan"]
tt = n(dd + 1.6)
f0 = hz(ROOT + 24)
bend = np.interp(tt, [0, dd, dd + 1.6], [1.03, 1.0, 1.0])
uni = (np.sin(2 * np.pi * f0 * tt) + np.sin(2 * np.pi * np.cumsum(f0 * bend) / SR)) * np.minimum(1, tt / .3) * np.minimum(1, (tt[-1] - tt) / .6) * .5
g(uni * .1, ts - .2)
# s7 ripple, glass revealed, surrender
g(M.lib("whoosh") * .1, AT["s7:diminta"])
g(ripple() * .32, AT["s7:kolam"] + .1)
g(ripple(1.0) * .2, AT["s7:air"] + .15)
g(stereo(shimmer(2.4, 1320), shimmer(2.4, 1480) * .5) * .18, AT["s7:ternyata"] - .05)
g(glassnote(hz(ROOT + 36), 3.0, 1.0) * .1, AT["s7:kaca"])
sw = M.mono()
st = n(7)
for nn, a in ((ROOT, .3), (ROOT + 7, .25), (ROOT + 12, .2), (ROOT + 16, .12)):
    M.lay(sw, np.sin(2 * np.pi * hz(nn) * st) * np.minimum(1, st / 3) * np.minimum(1, (7 - st) / 2), AT["s7:berserah"] - .4, a)
M.fx += stereo(sw * .06, sw * .02)
g(M.lib("chime") * .12, OUT)

M.finish(music)
