"""EP34 sound: maqam Saba on D (D, E-half-flat, F, G-flat, A, B-flat, C; the quarter tone is approximated at -0.5 semitone).
Saba is the maqam of grief and tenderness, which fits a man who still prays for the people who hurt him.
Bed: a soft synth drone (detuned saws through a slow low-pass "breath") on D with an A fifth, plus a plucked oud
stating short Saba phrases. A survey texture runs under the city: a faint scanner sweep (filtered noise chirp) every few
seconds and soft data ticks. Story cues:
 s1 scan reveal (rising sweep), an amber ping when the man appears at the edge of the city;
 s2 three warm bell tones as the three lights enter the gate (two, then the third);
 s2-s3 a low red pulse when the people reject them, harder on "rajam" (no impact sounds of stones);
 s4 quick footsteps (soft noise taps) while the amber trail runs, a whoosh on arrival;
 s5 a warm swell on "beriman"; glitch crackle when the idols go hollow ("menolongku");
 s6 the music thins to the drone alone after "membunuhnya", a slow single oud line for the prayer, then near-silence;
    a soft shimmering chord and a long swell when the gate of light opens on "masuklah";
 s7 the oud returns, gentler, in D major colour (the man's words in paradise);
 s8 drone fades out with the amber memorial ping and a final chime at the outro.
Music dips for a voice later through M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(3434)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
ROOT = 50  # D3
SABA = [0, 1.5, 3, 4, 7, 8, 10]
MAJ = [0, 2, 4, 5, 7, 9, 11]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
deg = lambda d, sc=SABA: ROOT + 12 + sc[d % 7] + 12 * (d // 7)
n = lambda d: np.arange(int(d * SR)) / SR

tBunuh, tDoa, tMati, tMasuk = AT["s6:membunuhnya"], AT["s6:berdoa"], AT["s6:kematiannya"], AT["s6:masuklah"]


def oud(f, dur=1.4):
    t = n(dur)
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0006 * h)) * np.exp(-t * (2.2 + 1.3 * h)) / h ** .8 for h in range(1, 10))
    pick = M.band(rng.standard_normal(len(t)), 1800, 6000) * np.exp(-t * 120) * .16
    return (x + pick) * np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .05)


# ---------- synth drone: detuned saws, slow breathing filter (approximated with a moving blend of harmonics)
drone = M.mono()
seg = 10.0
for t0 in np.arange(-1, DUR, seg - 3):
    dt = n(seg)
    maj = t0 >= K["s7"] - 4
    breath = .55 + .45 * np.sin(2 * np.pi * dt / 7.0 + t0)
    for nn, a in ((ROOT - 24, .5), (ROOT - 17, .28), (ROOT - 12, .2), (ROOT - 8 if maj else ROOT - 9, .08)):
        f = hz(nn)
        x = np.zeros(len(dt))
        for det in (-.12, .0, .13):
            for h in range(1, 6):
                x += np.sin(2 * np.pi * (f + det) * h * dt + h * .7) / h * (breath if h > 2 else 1)
        M.lay(drone, x / 3 * np.sin(np.pi * dt / dt[-1]) ** 2, max(0, t0), a)
sub = np.sin(2 * np.pi * hz(ROOT - 36) * T) * M.env([(0, 0), (1.5, .35), (K["s3"], .55), (K["s4"], .45), (tBunuh, .5), (tMati, .25), (tMasuk, .5), (DUR, .2)])
music_env = M.env([(0, .6), (K["s2"], .8), (K["s4"], .85), (K["s5"], .8), (tBunuh, .8), (tBunuh + 1.5, .45), (tMati, .35), (tMasuk - .3, .3), (tMasuk + 2, .95),
                   (K["s8"], .9), (OUT - .2, .5), (DUR - .4, 0), (DUR, 0)])
oud_env = M.env([(0, 1), (tBunuh, 1), (tBunuh + 1.2, .55), (K["s7"], .9), (DUR, .9)])

od = M.mono()


def phrase(t0, notes, amp=.26, sc=SABA):
    t = t0
    for d, b in notes:
        M.lay(od, oud(hz(deg(d, sc)), max(.7, b + .7)), t, amp)
        t += b


phrase(.5, [(0, .45), (1, .35), (2, .35), (3, 1.3)], .22)
phrase(AT["s1:bergegas"], [(4, .25), (3, .25), (2, .25), (1, .25), (0, 1.2)], .22)
phrase(K["s2"] + .4, [(0, .5), (2, .4), (3, .9), (2, .4), (1, .4), (0, 1.4)], .24)
phrase(K["s3"] + .3, [(3, .5), (2, .5), (1, 1.4)], .2)
phrase(AT["s4:wahai"] - .2, [(4, .4), (5, .4), (4, .4), (3, .4), (2, 1.4)], .24)
phrase(K["s5"] + .3, [(0, .5), (1, .4), (2, .4), (3, .5), (4, 1.6)], .22)
phrase(AT["s5:beriman"] - .3, [(7, .5), (6, .4), (5, .4), (4, 1.8)], .24)
phrase(tDoa, [(2, .7), (1, .7), (0, 2.4)], .18)
phrase(K["s7"] + .3, [(0, .5), (2, .5), (4, .5), (7, 2.0)], .22, MAJ)
phrase(AT["s7:kaumku"] - .2, [(4, .45), (3, .45), (2, .45), (0, 1.8)], .2, MAJ)
phrase(K["s8"] + .4, [(2, .6), (1, .6), (0, 2.0)], .2)
phrase(AT["s8:Kisah"] - .2, [(0, .5), (4, .5), (7, 2.4)], .2, MAJ)

music = np.stack([drone + .25 * sub, drone + .25 * sub], 1) * music_env[:, None] + stereo(od * oud_env * 1.5, od * oud_env * .45)


# ---------- survey texture: scanner sweeps and data ticks
def sweep(dur=1.6, lo=400, hi=3200):
    t = n(dur)
    f = lo * (hi / lo) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * .3 + M.band(rng.standard_normal(len(t)), 1200, 5000) * .4
    return x * np.sin(np.pi * t / dur) ** 2


scan_env = M.env([(0, 1), (tBunuh, 1), (tBunuh + 2, .35), (tMasuk, .35), (tMasuk + 2, .7), (DUR, .5)])
for t0 in np.arange(.2, OUT - 1, 6.5):
    g(sweep(1.4) * .025 * float(np.interp(t0, T, scan_env)), t0)
tick = M.tone([3200], .02, 80)
for t0 in np.arange(.3, OUT, .55):
    if rng.random() < .55:
        g(tick * .02 * float(np.interp(t0, T, scan_env)), t0)
air = M.band(rng.standard_normal(N), 150, 1200) * M.env([(0, .6), (tMati, .4), (tMasuk, .8), (DUR - .4, 0), (DUR, 0)])
M.fx += stereo(air * .02, M.band(rng.standard_normal(N), 300, 1800) * .008)


# ---------- SFX
def shimmer(dur=1.6, fs=(1760, 2349, 2637, 3520)):
    t = n(dur)
    x = sum(np.sin(2 * np.pi * f * t + i) * np.exp(-t * (1.4 + i * .4)) for i, f in enumerate(fs))
    return x * np.minimum(1, t / .05) / len(fs)


def bell(f, dur=2.5):
    t = n(dur)
    return sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t * (1.2 + r)) * a for r, a in ((1, 1), (2.76, .35), (5.4, .15))) * np.minimum(1, t / .004)


def pulse(dur=.8, f=55):
    t = n(dur)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 5) * np.minimum(1, t / .01)


def step():
    return M.band(M.burst(.09, 70, 2), 200, 2400)


# s1: scan reveal + amber ping at the edge of the city
g(sweep(2.6, 200, 4000) * .07, 0.05)
g(M.lib("riser") * .06, 0.0)
g(M.tone([hz(ROOT + 24), hz(ROOT + 31)], 1.2, 3) * .08, AT["s1:lelaki"])
g(M.lib("ping") * .1, AT["s1:lelaki"] + .05)
# s2: drone sweep, three warm bell lights
g(M.lib("whoosh-cinematic") * .16, K["s2"] + .3)
t2 = AT["s2:dua"]
g(bell(hz(ROOT + 19)) * .09, t2 - .3)
g(bell(hz(ROOT + 24)) * .09, t2)
g(bell(hz(ROOT + 31)) * .1, AT["s2:ketiga"] - .5)
# rejection: red pulses
g(pulse(1.0, 49) * .3, AT["s2:mendustakan"])
g(pulse(1.0, 46) * .3, AT["s2:menolak"])
g(pulse(.8, 52) * .26, AT["s3:sial"])
g(pulse(1.4, 41) * .42, AT["s3:rajam"])
g(M.lib("impact-bass-1") * .18, AT["s3:rajam"])
# s4: footsteps along the trail, arrival whoosh, ring on "ikutilah"
tr0, tr1 = AT["s4:datanglah"] + .15, AT["s4:wahai"] - .15
g(M.lib("riser") * .08, tr0 - .4)
for k, t0 in enumerate(np.arange(tr0 + .2, tr1, .21)):
    g(step() * (.18 if k % 2 else .14), t0)
g(M.lib("whoosh") * .14, tr1 - .2)
g(shimmer(1.4, (1175, 1480, 1760)) * .08, AT["s4:ikutilah"])
g(M.lib("chime") * .07, AT["s4:imbalan"])
# s5: idols glitch, swell on "beriman"
g(M.lib("glitch-1") * .1, AT["s5:menolongku"])
g(M.lib("glitch-3") * .08, AT["s5:menolongku"] + .5)
sw = M.mono()
st = n(4.5)
for nn, a in ((ROOT, .3), (ROOT + 7, .25), (ROOT + 12, .2), (ROOT + 15, .1)):
    M.lay(sw, np.sin(2 * np.pi * hz(nn) * st) * np.minimum(1, st / 1.8) * np.minimum(1, (4.5 - st) / 1.5), AT["s5:beriman"] - .6, a)
M.fx += stereo(sw * .06, sw * .02)
g(M.tone([hz(ROOT + 24)], .9, 3) * .06, AT["s5:dengarkanlah"])
# s6: one low pulse, then the light dims (a falling soft tone), the prayer, the gate opening
g(pulse(1.6, 38) * .22, tBunuh)
t = n(3.0)
fall = np.sin(2 * np.pi * np.cumsum(hz(ROOT + 24) * (1 - .25 * t / 3)) / SR) * np.exp(-t * 1.1) * np.minimum(1, t / .05)
g(fall * .05, tBunuh + .4)
g(shimmer(2.4, (880, 1175, 1320)) * .05, tDoa + .2)
g(M.lib("riser") * .1, tMasuk - 1.6)
ch = M.mono()
ct = n(7)
for nn, a in ((ROOT + 12, .25), (ROOT + 16, .2), (ROOT + 19, .2), (ROOT + 24, .14), (ROOT + 28, .08)):
    M.lay(ch, np.sin(2 * np.pi * hz(nn) * ct) * np.minimum(1, ct / 2.0) * np.minimum(1, (7 - ct) / 2.5), tMasuk - .1, a)
M.fx += stereo(ch * .07, ch * .03)
g(shimmer(3.0) * .1, tMasuk)
g(M.lib("sparkle") * .08, tMasuk + .3)
# s7: soft ping on "kaumku"
g(M.lib("ping") * .07, AT["s7:kaumku"])
# s8: amber memorial ping, sign-off chime
g(M.tone([hz(ROOT + 24), hz(ROOT + 28), hz(ROOT + 31)], 1.6, 2) * .07, AT["s8:kaumnya"])
g(sweep(2.0, 300, 3000) * .04, AT["s8:Kisah"])
g(M.lib("chime") * .13, OUT)

M.finish(music)
