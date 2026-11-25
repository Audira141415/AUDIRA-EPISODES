"""EP21 sound: maqam Bayati on D (D, E half-flat, F, G, A, Bb, C, D). A breathy ney carries slow, rubato phrases; a qanun
answers with plucked double-course notes and tremolo on long tones; a soft D/A drone sits underneath. A whisper-like breath
pad (band-passed noise with slow swells) rises whenever the prayer is whispered (s1 end, s2-s3, s8). The stone chamber has
a low room tone and a faint lamp flame; glass panel sweeps get a soft crystalline shimmer. s5 blooms (riser + bell
cluster), the second lamp lights with a soft whoof and sparkle, the rosette re-forms with a rising run of tiny glass
tinks. s7 is the silence: the music falls away to drone and pad, three slow day/night swells with a muted heartbeat-free
hush, then a wooden door creaks open onto dawn birds. Music dips for a voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(2121)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
D3 = 146.83
CENTS = [0, 150, 300, 500, 700, 800, 1000, 1200]
hzd = lambda d: D3 * 2 ** ((CENTS[d % 7] + 1200 * (d // 7)) / 1200)
n = lambda d: np.arange(int(d * SR)) / SR

tNight0 = AT["s7:tiga"] - .1
NP = 1.45
tDoor = AT["s7:keluar"] - .1
tLamp2 = AT["s5:Yahya"] - .05
tMake0, tMake1 = AT["s6:ciptakan"] - .1, AT["s6:sekali"] + .2
tBloom = AT["s5:datang"] - .5


def ney(f, dur, amp=1.0, bend=0.0):
    t = n(dur)
    vib = 1 + .007 * np.sin(2 * np.pi * 5.0 * t + 1) * np.minimum(1, t / .9)
    gl = 1 + bend * np.exp(-t * 6)
    ph = 2 * np.pi * f * np.cumsum(vib * gl) / SR
    x = np.sin(ph) + .2 * np.sin(2 * ph) + .07 * np.sin(3 * ph)
    br = M.band(rng.standard_normal(len(t)), f * .7, f * 5) * .16
    env = np.minimum(1, t / .4) * np.minimum(1, (dur - t) / .55)
    return (x + br) * env * amp


def qanun(f, dur=1.6, trem=False):
    t = n(dur)
    def one(ff):
        return sum(np.sin(2 * np.pi * ff * h * t) * np.exp(-t * (2.6 + 1.4 * h)) / h for h in range(1, 8))
    x = one(f) + .8 * one(f * 1.003)
    pick = M.band(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-t * 140) * .25
    y = (x + pick) * np.minimum(1, t / .002) * np.minimum(1, (dur - t) / .05)
    if trem:
        y = y * 0
        for k, s in enumerate(np.arange(0, dur - .2, .085)):
            i = int(s * SR); seg = one(f)[: len(t) - i] * (.55 + .45 * np.exp(-s * 1.2))
            y[i:] += seg * np.exp(-np.arange(len(seg)) / SR * 9)
        y *= np.minimum(1, (dur - t) / .2)
    return y


# ---------- drone D2 + A2
drone = M.mono()
dt = n(10)
for t0 in np.arange(0, DUR, 8.4):
    for f, a in ((D3 / 2, .5), (D3 * .75, .25), (D3, .1)):
        x = (np.sin(2 * np.pi * f * dt) + .2 * np.sin(4 * np.pi * f * dt)) * np.sin(np.pi * dt / dt[-1]) ** 2
        M.lay(drone, x, t0, a)
drone *= M.env([(0, .45), (K["s2"], .65), (tBloom, .7), (tBloom + .8, 1.0), (K["s6"], .7), (K["s7"], .8), (K["s8"], .7), (END, .6), (DUR - .4, 0), (DUR, 0)])

# ---------- ney phrases (degree, beats)
ny = M.mono()


def nphrase(t0, notes, amp=.17, beat=.55):
    t = t0
    for d, b in notes:
        M.lay(ny, ney(hzd(d), b * beat + .5, 1, .01 if d % 2 else 0), t, amp)
        t += b * beat


nphrase(.3, [(4, 2), (3, 1), (2, 1), (1, 1.5), (0, 3)], .16)
nphrase(AT["s1:berdoa"] - .4, [(2, 1.5), (3, 1), (4, 3)], .14)
nphrase(K["s2"] + .3, [(0, 1), (1, 1), (2, 1), (3, 2), (2, 1), (1, 3)], .15)
nphrase(K["s3"] + .1, [(4, 2), (5, 1), (4, 1), (3, 1), (2, 2), (1, 1), (0, 4)], .15, .6)
nphrase(AT["s4:pengalamannya"] - .3, [(2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 3)], .14)
nphrase(AT["s5:Yahya"] - .2, [(7, 2), (6, 1), (7, 1), (9, 4)], .16)
nphrase(AT["s6:hal"], [(4, 1.5), (3, 1), (2, 1), (3, 1), (4, 3)], .14)
nphrase(K["s8"] + .3, [(4, 1.5), (5, 1), (4, 1), (2, 1), (1, 1), (0, 4)], .15)
nphrase(AT["s8:Kisah"] - .4, [(7, 2), (4, 1), (7, 4)], .14)

# ---------- qanun answers
qn = M.mono()


def qphrase(t0, notes, amp=.2, beat=.24):
    t = t0
    for d, b in notes:
        trem = b >= 3
        M.lay(qn, qanun(hzd(d), max(1.2, b * beat + .8), trem), t, amp * (.6 if trem else 1))
        t += b * beat


qphrase(AT["s1:harapannya"], [(7, 1), (6, 1), (5, 1), (4, 4)], .16)
qphrase(AT["s2:kisah"], [(0, 1), (2, 1), (4, 1), (7, 2), (4, 1), (5, 4)], .17)
qphrase(AT["s2:khawatir"], [(3, 1), (2, 1), (1, 1), (0, 4)], .15)
qphrase(AT["s3:kecewa"] + .2, [(7, 1), (8, 1), (7, 1), (4, 5)], .15)
qphrase(K["s4"] + .3, [(0, 1), (1, 1), (2, 2), (0, 4)], .15)
for i in range(9):  # path of inlays: one note each, rising
    M.lay(qn, qanun(hzd(i), 1.4), AT["s4:pengalamannya"] - .2 + i * (AT["s4:mengecewakannya"] + .3 - AT["s4:pengalamannya"] - .2 - .6) / 8, .11)
qphrase(tBloom + .5, [(7, 1), (9, 1), (11, 1), (14, 6)], .15, .2)
qphrase(K["s6"] + .3, [(4, 1), (3, 1), (2, 1), (1, 1), (0, 4)], .13)
qphrase(tDoor + 1.2, [(4, 1), (5, 1), (7, 1), (9, 2), (7, 4)], .14)
qphrase(AT["s8:Tidak"], [(7, 1), (6, 1), (4, 1), (2, 1), (0, 5)], .15)

# ---------- breath pad (the whispered prayer)
pad = M.band(rng.standard_normal(N), 380, 2600)
pad *= 1 + .5 * np.sin(2 * np.pi * .21 * T) * np.sin(2 * np.pi * .087 * T + 1)
pad /= np.abs(pad).max()
pe = M.env([(0, .1), (AT["s1:berdoa"] - .3, .1), (AT["s1:berdoa"] + .3, .55), (K["s1e"], .35), (AT["s2:berdoa"] - .3, .3), (AT["s2:berbisik"], .75),
            (K["s3"], .7), (K["s3e"], .6), (K["s4"] + 1, .25), (K["s7"], .3), (tNight0, .55), (tDoor, .5), (tDoor + 1.5, .15), (K["s8"], .2),
            (AT["s8:Tidak"], .6), (AT["s8:Doa"] + 1.5, .3), (END, .2), (DUR - .3, 0), (DUR, 0)])
# slow breathing swells (in/out every ~3.2 s)
br = .55 + .45 * np.sin(2 * np.pi * T / 3.2) ** 2

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
# s7 silence: melodic voices fall away during the three nights
sil = M.env([(0, 1), (tNight0 - .4, 1), (tNight0 + .4, .15), (tDoor + .2, .15), (tDoor + 1.2, 1), (DUR, 1)])
music_m = (drone * .5 + (ny + qn) * sil + pad * pe * br * .12) * fin
music = stereo(music_m, (.1 * ny + .14 * qn + .06 * pad * pe * br) * fin * sil)

# ---------- room tone + lamp flame
room = M.band(rng.standard_normal(N), 40, 260); room /= np.abs(room).max()
M.fx += np.stack([room * .012, np.roll(room, 700) * .012], 1)
flame = M.band(rng.standard_normal(N), 300, 1800) * (1 + 2 * (rng.random(N) > .9995)); flame /= np.abs(flame).max()
M.fx += np.stack([flame * .004, flame * .004], 1)

# ---------- glass sweep shimmer on panel changes
shim = lambda: sum(np.sin(2 * np.pi * f * n(.8)) * np.exp(-n(.8) * 5) for f in (1760, 2217, 2637, 3520)) / 4
air = lambda: M.band(rng.standard_normal(int(.6 * SR)), 2500, 9000) * np.sin(np.pi * n(.6) / .6) ** 2
for p in ["s2", "s2:khawatir", "s3", "s4", "s5", "s6", "s6:Jawabnya", "s7", "s7:keluar", "s8", "s8:Tidak"]:
    tp = AT.get(p, K.get(p))
    g(shim(), tp - .14, .011)
    g(air(), tp - .2, .012)

# s1: cane tap, wool rustle, lamp sputter
tap = M.band(M.burst(.12, 40, 2), 200, 2500)
g(tap, .25, .03); g(tap, AT["s1:mandul"], .015)
g(M.band(rng.standard_normal(int(.8 * SR)), 1500, 7000) * np.sin(np.pi * n(.8) / .8) ** 2, AT["s1:uban"] - .2, .012)
for x in (AT["s1:habis"] - .2, AT["s1:habis"] + .25):
    g(M.band(M.burst(.25, 20, 2), 300, 3000), x, .02)

# s4: inlay path chimes already in qanun; soft glow swell
g(M.lib("riser"), AT["s4:pengalamannya"] - .6, .012)

# s5: bloom + second lamp
g(M.lib("riser"), tBloom - 1.4, .02)
bell = lambda f: sum(np.sin(2 * np.pi * f * r * n(3)) * np.exp(-n(3) * (1.2 + r * .6)) for r in (1, 2.01, 2.76, 4.1)) / 4
for k, f in enumerate((880, 1108.7, 1318.5)):
    g(bell(f), tBloom + .6 + k * .07, .03)
g(M.band(M.burst(.6, 6, 2), 120, 1500), tLamp2, .035)
g(M.lib("sparkle"), tLamp2 + .05, .022)
g(M.lib("chime"), tLamp2 + .1, .02)

# s6: rosette empties (soft down-sweep), re-forms with tiny glass tinks
tink = lambda f: sum(np.sin(2 * np.pi * f * r * n(.5)) * np.exp(-n(.5) * 14 * r ** .5) for r in (1, 2.4, 4.3)) / 3
g(M.band(rng.standard_normal(int(.7 * SR)), 1200, 6000) * np.exp(-n(.7) * 4), AT["s6:dulu"] - .1, .015)
for i in range(37):
    o = 0 if i == 0 else 1 + (i - 1) // 12 + ((i - 1) % 12) / 12
    ti = tMake0 + (o / 4) * (tMake1 - tMake0 - .5)
    g(tink(1400 + 90 * o * 4 + rng.uniform(-40, 40)), ti, .009)
g(M.lib("chime"), tMake1 - .2, .02)

# s7: three day/night swells (wind breath outside), door creak, dawn birds
wind = M.band(rng.standard_normal(N), 150, 1200); wind /= np.abs(wind).max()
nights = np.zeros(N)
m7 = (T > tNight0 - .4) & (T < tNight0 + 3 * NP + .4)
nights[m7] = .5 - .5 * np.cos(2 * np.pi * (T[m7] - tNight0) / NP)
M.fx += np.stack([wind * nights * .025, np.roll(wind, 1200) * nights * .025], 1)
creak = np.zeros(int(1.3 * SR)); tc = n(1.3)
f0 = 180 + 90 * np.sin(2 * np.pi * 1.3 * tc) + 40 * np.sin(2 * np.pi * 7 * tc)
creak = M.band(np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)) * (rng.random(len(tc)) > .3), 300, 3000) * np.sin(np.pi * tc / 1.3) ** 2
g(creak, tDoor, .02)
g(M.band(M.burst(.3, 15, 2), 80, 800), tDoor + 1.15, .03)


def chirp(f0, dur, up):
    t = n(dur)
    f = f0 * (1 + up * t / dur + .08 * np.sin(2 * np.pi * 30 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) ** 2


for x in np.arange(tDoor + .4, K["s8"] + 1.0, .18):
    if rng.random() < .55:
        for k in range(rng.integers(1, 4)):
            g(chirp(rng.uniform(2800, 4800), rng.uniform(.05, .12), rng.uniform(-.4, .5)), x + k * .09, rng.uniform(.004, .011))
dawn = M.env([(0, 0), (tDoor + .3, 0), (tDoor + 1.5, 1), (K["s8"], 1), (K["s8"] + .5, .15), (DUR, .1)])
M.fx += np.stack([wind * dawn * .012, np.roll(wind, 900) * dawn * .012], 1)
# light-through-glass cut at s8
g(M.lib("whoosh-cinematic"), K["s8"] - .5, .022)
g(shim(), K["s8"] - .1, .02)

# s8: book appears, sign-off
g(M.band(M.burst(.4, 12, 2), 1500, 7000), AT["s8:hikmah"] - .1, .012)
g(M.lib("sparkle"), AT["s8:hikmah"], .012)
g(M.lib("chime"), AT["s8:AUDIRA"], .028)
g(M.lib("whoosh"), OUT - .25, .025); g(M.lib("chime"), OUT + .35, .04)
M.finish(music)
print("duration", DUR)
