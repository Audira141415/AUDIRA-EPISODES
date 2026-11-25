"""EP03 sound: 1960s light jazz-pop in F (walking bass, brushed drums, vibraphone, swing at 116 bpm).
The band holds its breath at 04.50 (only a held vibraphone chord and the clock ticking) and comes back on a crash at 05.00.
Foley: idling engines, indicator relays, sign flips, plastic, paint, tape, crowd murmur, a train on the left track. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1967)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT = B["AT"], B["outroAt"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
H0, H1 = AT["s5:04.50"], AT["s5:tepat"]          # held breath, release
mid = lambda m: 440 * 2 ** ((m - 69) / 12)


def vib(f, dur=1.6, dec=1.5):
    t = np.arange(int(dur * SR)) / SR
    x = (np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 6)) * (1 + .35 * np.sin(2 * np.pi * 5.5 * t))
    return x * np.minimum(1, t / .004) * np.exp(-t * dec) * np.minimum(1, (dur - t) / .02)


ride = M.band(M.burst(.32, 16), 5200, 12500); ride /= np.abs(ride).max()
brush = M.band(M.burst(.22, 13, 3), 1400, 7000); brush /= np.abs(brush).max()
kick = M.thump(.24)
CH = [(41, (57, 60, 62, 65)), (38, (57, 60, 62, 65)), (43, (58, 62, 65, 69)), (36, (58, 62, 64, 67))]  # F6 Dm7 Gm7 C7
beat = 60 / 116
bass, drums, keys = M.mono(), M.mono(), M.mono()


def band_from(t0, t1):
    nb = int((t1 - t0) / beat)
    for b in range(nb):
        t = t0 + b * beat
        bar, q = divmod(b, 4)
        root, chord = CH[bar % 4]
        nxt = CH[(bar + 1) % 4][0]
        walk = [root, root + (3 if bar % 4 in (1, 2) else 4), root + 7, nxt + (1 if (bar % 2) else -1)][q]
        M.lay(bass, M.note(mid(walk), beat * .95, "pluck", 3.2), t, .9)
        M.lay(drums, ride, t, .32 if q % 2 else .42)
        if q in (1, 3):
            M.lay(drums, ride, t + beat * 2 / 3, .2)
            M.lay(drums, brush, t, .5)
        if q == 0:
            M.lay(drums, kick, t, .5)
        if q == 0 or (q == 2 and bar % 2):
            off = 0 if q == 0 else beat * 2 / 3
            for i, n in enumerate(chord):
                M.lay(keys, vib(mid(n + 12)), t + off + i * .012, .16)
        if q == 3 and bar % 4 == 3:
            M.lay(keys, vib(mid(chord[-1] + 24), .8, 3), t + beat * 2 / 3, .1)


band_from(0.0, H0 + .05)
band_from(H1, DUR - 1.2)
# the held breath: one suspended chord swelling, a C pedal underneath
hold = M.mono()
for i, n in enumerate((60, 65, 67, 70, 74)):
    M.lay(hold, vib(mid(n + 12), H1 - H0 + .6, .12), H0 + .2 + i * .06, .035)
M.lay(hold, M.note(mid(36), H1 - H0, "sine", .1, .3), H0 + .1, .12)
cut = M.env([(0, 1), (H0 - .05, 1), (H0 + .25, 0), (H1 - .01, 0), (H1, 1), (DUR, 1)])
fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (bass * cut * .9 + drums * cut * .55 + keys * cut + hold) * fin
music = stereo(music_m, .25 * keys * cut * fin - .15 * drums * cut * fin)

# ---------- foley
idle = M.band(rng.standard_normal(N), 35, 170) + .6 * sum(np.sin(2 * np.pi * f * T + i) for i, f in enumerate((31, 62, 93)))
idle *= (1 + .4 * np.sin(2 * np.pi * 12.5 * T)); idle /= np.abs(idle).max()
ie = M.env([(0, .5), (K["s2"], .5), (K["s2"] + 1, 0), (K["s4"], 0), (K["s4"] + 2, .3), (K["s5"], .45), (H0, .75), (H1, .75), (H1 + .4, 1), (H1 + 2, .5), (K["s6"], .4), (K["s7"] + 3, .2), (K["s8"], .35), (END, .3), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([idle * ie * .05, np.roll(idle, 900) * ie * .05], 1)


def relay(a, b):
    """Indicator relay clicks matching the blink in world3d.js (on every 1/3.2 s, alternating)."""
    for k, x in enumerate(np.arange(a, b, 1 / 3.2)):
        g(M.tone((2600, 4100), .018, 120), x, .05 if k % 2 == 0 else .03)
        g(M.band(M.burst(.02, 200, 1), 1500, 6000), x, .05)


def rustle(t0, dur=.7, a=.05):
    for x in rng.uniform(t0, t0 + dur, 26):
        g(M.band(M.burst(.03, 90, 1), 2500, 9000), x, a * rng.uniform(.4, 1))


def rip(t0, dur=.45, a=.06):
    n = int(dur * SR)
    x = M.band(rng.standard_normal(n), 900, 7000) * np.abs(np.sin(np.linspace(0, 40 * np.pi, n))) ** 3
    g(x * np.linspace(.4, 1, n) * np.minimum(1, np.linspace(dur, 0, n) / .05), t0, a / max(1e-6, np.abs(x).max()))


def brake(t0, a=.04):
    n = int(.9 * SR)
    x = M.band(rng.standard_normal(n), 1800, 4200) * np.exp(-np.linspace(0, 4, n))
    g(x / np.abs(x).max(), t0, a)


# s1 hook: everyone brakes, indicators, glide
brake(AT["s1:Semua"], .03)
relay(AT["s1:Semua"], AT["s1:kanan"] + .8)
g(M.lib("whoosh-short"), AT["s1:kiri"] - .1, .05)
g(M.lib("whoosh-cinematic"), K["s2"] - .35, .05)
g(M.lib("pop"), AT["s2:Norwegia"], .05); g(M.lib("pop"), AT["s2:Finlandia"], .05)
g(M.lib("click"), AT["s2:90"], .05)
# s3
g(M.lib("riser"), AT["s3:83"] - .6, .025); g(M.thump(.4), AT["s3:83"], .12); g(M.lib("click"), AT["s3:83"], .06)
g(M.lib("whoosh"), AT["s3:Tapi"] - .2, .05)
fa, fb = AT["s3:jadi"], AT["s3:juta#2"] + .4
for i in range(20):
    g(M.tone((900 + i * 40, 1800), .05, 50), fa + i / 20 * (fb - fa), .03)
g(M.lib("whoosh"), AT["s3:Tahun"] - .2, .05)
g(M.thump(.3), AT["s3:parlemen"], .12); g(M.thump(.3), AT["s3:parlemen"] + .22, .1)
# s4: signs flip, counter, plastic, paint, tape
g(M.lib("whoosh-short"), K["s4"] - .2, .05)
for i in range(30):
    g(M.lib("click-soft"), AT["s4:350.000"] + i * .045, .025)
for i in range(8):
    g(M.lib("click"), AT["s4:diganti"] + i * .13 + .25, .04)
for i in range(4):
    g(M.thump(.25), AT["s4:lampu"] + i * .14 + .1, .05)
    rustle(AT["s4:plastik"] + i * .14, .5, .035)
n = int(.7 * SR)
spray = M.band(rng.standard_normal(n), 3000, 9500) * np.minimum(1, np.linspace(0, 7, n)) * np.minimum(1, np.linspace(7, 0, n))
g(spray / np.abs(spray).max(), AT["s4:dicat"], .03)
for i in range(4):
    rip(AT["s4:selotip"] + i * .08, .35, .035)
# s5: peel, unwrap, monolith, crowd, the stop, the glide, 05.00
crowd = M.band(rng.standard_normal(N), 250, 1700) * (1 + .5 * np.sin(2 * np.pi * .7 * T) * np.sin(2 * np.pi * .23 * T)); crowd /= np.abs(crowd).max()
ce = M.env([(0, 0), (AT["s5:Hari"] - 1, 0), (AT["s5:Dagen"], .6), (H0, .4), (H1 - .1, .25), (H1 + .3, 1), (H1 + 2.5, .4), (K["s6"] + 2, 0), (DUR, 0)])
M.fx += np.stack([crowd * ce * .03, np.roll(crowd, 2000) * ce * .03], 1)
for i in range(8):
    rip(AT["s5:Hari"] + i * .08, .5, .04)
rustle(AT["s5:disebut"], 1.0, .045)
g(M.lib("riser"), AT["s5:Dagen"] - 1.4, .03); g(M.lib("impact-bass-1"), AT["s5:Dagen"] + .25, .14); g(M.thump(.7), AT["s5:Dagen"] + .25, .25)
a_, b_ = AT["s5:04.50"], AT["s5:lima"]
for i in range(10):
    g(M.tone((1760, 3520), .03, 60), a_ + i * (b_ - a_) / 10, .045)
brake(AT["s5:04.50"] + .2, .04)
relay(AT["s5:04.50"], AT["s5:kanan"] + .9)
g(M.lib("whoosh-cinematic"), AT["s5:pindah"] - .1, .05)
g(M.thump(.3), AT["s5:berhenti#2"], .1)
g(M.lib("chime"), b_, .06)
crash = M.band(M.burst(2.2, 1.6, 1), 3000, 14000); crash /= np.abs(crash).max()
g(crash, H1, .1); g(M.thump(.5), H1, .25)
n = int(2.2 * SR)
tt = np.arange(n) / SR
rev = sum(np.sin(2 * np.pi * np.cumsum(f * (1 + .9 * np.minimum(1, tt / 1.1))) / SR) / k for k, f in ((1, 45), (2, 90), (3, 135)))
g(rev * np.minimum(1, tt / .1) * np.exp(-tt * .9), H1 + .05, .1)
# s6
g(M.lib("whoosh-cinematic"), K["s6"] - .3, .05)
g(M.lib("pop"), AT["s6:157"], .05); g(M.lib("pop"), AT["s6:125"], .05); g(M.lib("click"), AT["s6:ekstra"], .06)
# s7: the train
g(M.lib("whoosh"), K["s7"] - .2, .05); g(M.thump(.35), AT["s7:1969"], .1)
for x in np.arange(AT["s7:Dan"] - 1.5, K["s8"] + 2, .62):
    for d in (0, .11):
        g(M.band(M.burst(.05, 70, 1), 300, 3000), x + d, .05)
        g(M.thump(.12), x + d, .03)
n = int(1.1 * SR)
tt = np.arange(n) / SR
horn = (np.sin(2 * np.pi * 370 * tt) + np.sin(2 * np.pi * 466 * tt) + .4 * np.sin(2 * np.pi * 740 * tt)) * np.minimum(1, tt / .05) * np.minimum(1, (1.1 - tt) / .2)
g(horn / 2.4, AT["s7:kereta"] + .4, .04)
# s8 and the closing card wiping in from the left
g(M.lib("whoosh-cinematic"), K["s8"] - .3, .05)
g(M.lib("pop"), AT["s8:Indonesia"], .05)
g(M.lib("whoosh"), OUT - .2, .05); g(M.lib("chime"), OUT + .3, .07)
M.finish(music)
print("duration", DUR)
