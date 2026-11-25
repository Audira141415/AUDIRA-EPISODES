"""EP07 sound: a 16-bit chiptune march in G major with an Alpine folk lilt (square lead with yodel-ish octave flips,
triangle bass, noise snare rolls). Foley: marching boots, horn call, crowd cheer at the return, the "?" chime, muskets laid down.
The music turns minor and sparse in the night legend, and to a music box for the disbanding. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1866)
T, DUR, rng = M.T, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda n: 440 * 2 ** ((n - 69) / 12)


def sq(f, dur, duty=.5, dec=3.0, vib=0.0):
    t = np.arange(int(dur * SR)) / SR
    ph = f * t + (vib * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / .25) / (2 * np.pi * 5.5) * f if vib else 0)
    x = np.where((ph % 1) < duty, 1.0, -1.0) * .5
    return x * np.minimum(1, t / .004) * np.minimum(1, (dur - t) / .01) * np.exp(-t * dec)


def tri(f, dur, dec=2.0):
    return M.note(f, dur, "tri", dec, .004)


def noise(dur, dec):
    x = rng.uniform(-1, 1, int(dur * SR))
    x = np.repeat(x[::4], 4)[: int(dur * SR)]  # NES-ish coarse noise
    return x * np.exp(-np.arange(len(x)) / SR * dec)


beat = 60 / 116
# G major oom-pah: I I V I / IV I V I ; night: E minor sparse
prog = [(43, [59, 62, 67]), (43, [59, 62, 67]), (38, [57, 62, 66]), (43, [59, 62, 67]), (48, [60, 64, 67]), (43, [59, 62, 67]), (38, [57, 60, 66]), (43, [55, 59, 62])]
tune = [[67, 71, 74, 79, 78, 74, 71, 74], [72, 71, 69, 67, 69, None, 66, None], [67, 71, 74, 83, 81, 79, 78, 76], [74, 78, 81, 74, 79, None, None, None]]
bass, chords, lead, drums = M.mono(), M.mono(), M.mono(), M.mono()
nights = (K["s6"], K["s7"])
for b in range(int(END / beat) + 6):
    t0 = b * beat
    bar, pos = divmod(b, 4)
    night = nights[0] - .2 < t0 < nights[1] - .2
    winter = t0 >= K["s7"] - .2
    root, ch = prog[bar % len(prog)]
    if night:
        root, ch = [(40, [55, 59, 64]), (36, [55, 60, 64]), (38, [54, 57, 62]), (35, [54, 59, 63])][bar % 4]
    if pos in (0, 2):
        M.lay(bass, tri(hz(root + (7 if pos == 2 else 0)), beat * .9, 1.5), t0, 1)
    elif not night:
        for n in ch:
            M.lay(chords, sq(hz(n), beat * .45, .25, 6), t0, .16)
    line = tune[bar % len(tune)]
    if night:
        if pos == 0:
            M.lay(lead, sq(hz(ch[-1] + 12), beat * 3, .5, .8, vib=.006), t0, .22)
    elif winter:
        for k in range(2):
            n = line[pos * 2 + k]
            if n:
                M.lay(lead, M.note(hz(n + 12), .5, "sine", 6), t0 + k * beat / 2, .55)  # music box
    else:
        for k in range(2):
            n = line[pos * 2 + k]
            if n:
                d = beat / 2 * (1.9 if line[min(7, pos * 2 + k + 1)] is None else .95)
                M.lay(lead, sq(hz(n), d, .125 if bar % 2 else .25, 2.0, vib=.004), t0 + k * beat / 2, .5)
                # yodel flip: grace note an octave up on every bar start
                if pos == 0 and k == 0:
                    M.lay(lead, sq(hz(n + 12), .07, .25, 10), t0 - .07, .3)
    if not night and not winter:
        M.lay(drums, noise(.12, 30), t0 + (beat if pos in (1, 3) else 0) * 0, .35 if pos in (1, 3) else .12)
        M.lay(drums, tri(hz(36), .12, 25), t0, .5 if pos in (0, 2) else 0)
        if pos == 3 and bar % 2:
            for r in range(8):
                M.lay(drums, noise(.04, 80), t0 + r * beat / 8, .1 + r * .025)
music_e = M.env([(0, 1), (K["s4"] - .4, 1), (K["s4"], .8), (AT["s4:Mereka"], .55), (K["s5"], .55), (AT["s5:dan"], 1.1), (K["s6"] - .3, 1.1), (K["s6"], .9), (DUR, .9)])
tail = M.env([(0, 1), (END, 1), (DUR - .3, 0), (DUR, 0)])
music = stereo((.7 * bass + .5 * chords + .6 * lead + .5 * drums) * music_e * tail, .14 * chords * tail - .08 * lead * tail)
for n in (55, 59, 62, 67, 71):
    g(M.note(hz(n + 12), 1.4, "sine", 2.5), OUT + .3 + (n - 55) * .03, .05)

# marching boots: two files, crunchy steps on the beat while the column walks
def boots(a, b, amp=.05, snow=False):
    for x in np.arange(a, b, beat / 2):
        g(M.band(M.burst(.06, 70, 2), 120 if snow else 200, 2500 if snow else 4000), x + rng.uniform(-.01, .01), amp)
        g(M.thump(.08), x, amp * .5)
boots(0, K["s2"] - .2, .06)
boots(K["s4"], AT["s4:Mereka"], .05)
boots(AT["s5:dan"], K["s6"], .06)
boots(K["s6"], K["s7"] - .3, .035)
# horn call (square fifths) as the army is handed over and at the pass
for k, n in enumerate((67, 74, 79, 74, 79)):
    g(sq(hz(n), .22 if k < 4 else .6, .5, 1.5), AT["s3:menyerahkan"] + k * .2, .05)
for k, n in enumerate((62, 69, 74)):
    g(sq(hz(n), .3 if k < 2 else .7, .25, 1.2), AT["s4:Mereka"] + .3 + k * .26, .04)
# campfire crackle and night wind at the pass
for x in rng.uniform(AT["s4:Mereka"], AT["s5:dan"], 70):
    g(M.band(M.burst(.02, 200, 1), 1500, 7000), x, .02)
wt = int((AT["s4:Dua"] - AT["s4:Mereka"]) * SR)
g(M.band(rng.standard_normal(wt), 200, 900) * np.sin(np.linspace(0, np.pi, wt)), AT["s4:Mereka"], .02)
# Garibaldi arrow: low warning blips
for k in range(4):
    g(sq(hz(43), .16, .5, 6), AT["s4:Italia"] + k * .3, .06)
# crowd cheer at the return: filtered noise swell + little chiptune whistles
ct = int((K["s6"] - AT["s5:dan"]) * SR)
cheer = M.band(rng.standard_normal(ct), 400, 3500) * np.minimum(1, np.arange(ct) / SR / .5) * np.minimum(1, (ct - np.arange(ct)) / SR / .4)
g(cheer, AT["s5:dan"], .05)
for x in np.arange(AT["s5:dan"] + .2, K["s6"] - .3, .35):
    g(sq(hz(rng.choice([79, 83, 86])), .08, .25, 12), x, .025)
g(M.lib("sparkle"), AT["s5:disambut"], .05)
# the 80 -> 81 tick, the "?" chime, candidate blips, the stamp
for k in range(3):
    g(sq(hz(84 + k * 4), .06, .5, 10), AT["s6:satu"] + k * .06, .05)
g(M.lib("chime"), AT["s6:satu"] + .25, .07)
for n, d in ((76, 0), (80, .14), (83, .28), (88, .5)):
    g(M.note(hz(n), 1.2, "sine", 2), AT["s6:Siapa"] + d, .05)
for k_ in ("s6:perwira", "s6:petani"):
    g(sq(hz(72), .07, .5, 8), AT[k_], .05); g(sq(hz(79), .1, .5, 8), AT[k_] + .08, .05)
g(M.thump(.3), AT["s6:legenda"], .18); g(M.band(M.burst(.08, 40, 2), 400, 5000), AT["s6:legenda"], .06)
# muskets laid down row by row in the snow, then soldiers dissolve
for r in range(8):
    x = AT["s7:membubarkan"] + .15 + r * .12
    g(M.tone((420, 610), .09, 35), x, .04); g(M.band(M.burst(.05, 60, 2), 300, 3000), x, .05)
for k in range(12):
    g(M.lib("glitch-1") if k % 4 == 0 else sq(hz(96 - k * 2), .05, .5, 20), AT["s7:netral"] + k * .1, .015)
g(M.thump(.35), AT["s7:netral"], .15)
# snow wind bed
st = int((DUR - K["s7"]) * SR)
g(M.band(rng.standard_normal(st), 300, 1500) * .5 * np.minimum(1, np.arange(st) / SR / 1.5), K["s7"], .02)
# stamps and reveals
for k_ in ("s1:konon", "s3:populer", "s7:netral"):
    g(M.thump(.25), AT[k_], .12)
for k_ in ("s1:delapan", "s2:1866", "s3:hanya", "s3:melawan", "s5:22", "s7:tidak", "s8:pertempuran", "s8:bertambah", "s8:dibubarkan", "s8:berani", "s8:naif"):
    g(sq(hz(84), .05, .5, 12), AT[k_], .04); g(sq(hz(91), .06, .5, 12), AT[k_] + .05, .03)
# pixel-dissolve wipes
for T0 in (K["s2"], K["s3"], K["s4"], AT["s4:Mereka"], AT["s4:Dua"], K["s5"], AT["s5:dan"], K["s6"], K["s7"]):
    for k in range(6):
        g(noise(.04, 60), T0 - .25 + k * .05, .03 + k * .006)
    g(M.lib("whoosh-short"), T0 - .3, .03)
M.finish(music)
print("duration", DUR)
