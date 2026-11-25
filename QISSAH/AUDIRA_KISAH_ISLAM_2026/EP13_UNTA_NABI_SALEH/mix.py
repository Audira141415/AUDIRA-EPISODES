"""EP13 sound: maqam Bayati on D (D, E half-flat, F, G, A, Bb, C). A plucked oud (additive pluck with a short pick
noise and a wooden body band) plays a slow taqsim over a soft D/A drone; a low frame-drum 'doum' marks calm scenes.
Ambience: desert wind across the valley, a water drip into the well synced to the 3D drop, camel footfalls, the dial
ratchet, paper slides for the section-cut panels. s5 thins to drone at dusk; s6 is a deep rumble with stone crumble
and falling rubble (no voices, no screams). Music dips for a voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(1307)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
D = 50  # D3
BAYATI = [0, 1.5, 3, 5, 7, 8, 10, 12]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

tQ, tStop = AT["s6:gempa"], AT["s5:disembelih"]
tFall0, tFall1 = AT["s6:Rumah-rumah"] - .1, AT["s6:reruntuhan"] + .6
tW0, tW1 = AT["s4:Allah"] - .3, AT["s4:Jangan"] - .1


def oud(f, dur=1.6, bright=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0007 * h)) * np.exp(-t * (1.6 + .95 * h / bright)) / h ** .85 for h in range(1, 11))
    pick = M.band(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 90) * .25
    body = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 18) * .12
    return (x + pick + body) * np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .05)


def deg(d):
    o, i = divmod(d, 7)
    return D + 12 + BAYATI[i] + 12 * o


# ---------- drone: soft D2 + A2 (triangle-ish), slow swell
drone = M.mono()
dt = np.arange(int(9 * SR)) / SR
for t0 in np.arange(0, DUR, 7.6):
    for n, a in ((D - 12, .5), (D - 5, .28), (D, .14)):
        f = hz(n)
        x = (np.sin(2 * np.pi * f * dt) + .3 * np.sin(2 * np.pi * 2 * f * dt) + .12 * np.sin(2 * np.pi * 3 * f * dt)) * np.sin(np.pi * dt / dt[-1]) ** 2
        M.lay(drone, x, t0, a)
de = M.env([(0, .7), (K["s2"], .55), (K["s3"], .6), (K["s5"], .8), (tStop, 1.0), (K["s6"], .25), (tFall1, .2), (K["s7"], .5), (K["s8"], .6), (END, .5), (DUR - .4, 0), (DUR, 0)])
drone *= de

# ---------- oud taqsim phrases (free rhythm)
od = M.mono()


def phrase(t0, notes, amp=.32):
    t = t0
    for d, b in notes:
        if d is not None:
            M.lay(od, oud(hz(deg(d)), max(.6, b + .7)), t, amp)
            if b >= .9:  # tremolo-ish repeat on long notes
                M.lay(od, oud(hz(deg(d)), .7), t + b * .5, amp * .45)
        t += b
    return t


phrase(.15, [(4, .5), (3, .3), (2, .3), (1, .6), (0, 1.2)])
phrase(AT["s1:Aturan"] - .1, [(0, .35), (1, .35), (2, .35), (3, .7), (2, .35), (1, .5), (0, 1.0)], .28)
phrase(K["s2"] + .3, [(4, .45), (5, .3), (4, .3), (3, .3), (4, .9)], .3)
phrase(AT["s2:kebun"] - .2, [(2, .3), (3, .3), (4, .3), (6, .6), (5, .3), (4, .9)], .26)
phrase(AT["s2:Surah"], [(7, .5), (6, .3), (5, .3), (4, 1.2)], .26)
phrase(K["s3"] + .4, [(0, .7), (1, .4), (0, .4), (-1, 1.2)], .22)
phrase(AT["s3:Datangkan"], [(3, .3), (2, .3), (1, .3), (0, 1.4)], .22)
phrase(AT["s4:Datanglah"] + .2, [(0, .4), (2, .4), (4, .4), (7, 1.6)], .3)
phrase(AT["s4:Pesannya"], [(4, .4), (5, .3), (4, .3), (3, .4), (4, 1.0), (2, .4), (1, .4), (0, 1.0)], .26)
phrase(K["s5"] + .2, [(1, .9), (0, .9), (-1, 1.6)], .2)
phrase(K["s7"] + .6, [(0, .5), (2, .4), (3, .4), (4, 1.2)], .24)
phrase(AT["s7:Tapi"] + .2, [(4, .4), (3, .3), (2, .3), (1, .5), (0, 1.2)], .22)
phrase(AT["s7:UNESCO"] - .4, [(4, .3), (5, .3), (7, 1.2)], .24)
phrase(K["s8"] + .3, [(4, .5), (3, .35), (2, .35), (1, .5), (0, 1.4)], .26)
phrase(AT["s8:Kisah"] - .4, [(0, .4), (2, .4), (4, .4), (7, 2.2)], .26)

# ---------- soft doum (frame drum) under the calm scenes
drum = M.mono()
doum = lambda: np.sin(2 * np.pi * (70 * np.arange(int(.5 * SR)) / SR + 30 * (1 - np.exp(-np.arange(int(.5 * SR)) / SR * 30)) / 30)) * np.exp(-np.arange(int(.5 * SR)) / SR * 9)
tek = lambda: M.band(M.burst(.08, 70, 1), 900, 5000)
bt = 60 / 72
for a, b in ((K["s2"], K["s3"] - .3), (AT["s4:Pesannya"], K["s5"] - .2), (K["s7"] + 1, K["s7e"] - .3), (K["s8"], END)):
    for i, x in enumerate(np.arange(a, b, bt)):
        M.lay(drum, doum(), x, .35 if i % 4 == 0 else .18)
        M.lay(drum, tek(), x + bt / 2, .12)

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drone * .5 + od + drum * .6) * fin
music = stereo(music_m, (.15 * od + .08 * drone) * fin)

# ---------- ambience: desert wind
wind = M.band(rng.standard_normal(N), 160, 1500) * (1 + .6 * np.sin(2 * np.pi * .11 * T) * np.sin(2 * np.pi * .043 * T + 1)); wind /= np.abs(wind).max()
we = M.env([(0, .35), (K["s2"], .55), (K["s3"], .4), (K["s5"], .55), (tStop, .8), (K["s6"], .5), (K["s7"], .2), (K["s8"], .45), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .045, np.roll(wind, 1500) * we * .045], 1)

# ---------- water drip into the well (synced to the 3D drop: period 1.7 s, impact 0.4 + fall)
fall = np.sqrt(2 * (2.08 - .6) / 9.8)
dn = int(.35 * SR); dtt = np.arange(dn) / SR
plink = np.sin(2 * np.pi * (1400 * dtt - 900 * (1 - np.exp(-dtt * 25)) / 25)) * np.exp(-dtt * 22) + .3 * M.band(M.burst(.35, 60, 1), 2000, 9000)
dripE = lambda t: 1.0 if t < K["s2"] - .4 or (AT["s4:giliran"] < t < K["s5e"]) or t > K["s8"] + 2 else 0.25
for x in np.arange(.4 + fall, DUR - .5, 1.7):
    g(plink, x, .05 * dripE(x))

# ---------- camel: emergence and footfalls
g(M.lib("chime"), AT["s4:Datanglah"] + .2, .03)
rock = M.band(rng.standard_normal(int(2.5 * SR)), 40, 400) * np.sin(np.pi * np.arange(int(2.5 * SR)) / (2.5 * SR)) ** 2
g(rock, AT["s4:Datanglah"] - .1, .12)
step = M.band(M.burst(.12, 35, 2), 80, 900)
for x in np.arange(tW0 + .2, tW1, .42):
    g(step, x + rng.uniform(0, .04), .05)

# ---------- dial ratchet at every change, a dull stop at the end
DK = [AT["s1:seekor"] - .2, AT["s1:seluruh"] - .2, AT["s1:ujian"], AT["s1:Tsamud"], K["s2"] + .5,
      AT["s4:giliran"] - .15, AT["s4:kalian"] - .1, AT["s4:giliran#2"] + .4]
x = AT["s4:Jangan"] + .4
while x < tStop - .3:
    DK.append(x); x += 1.35
for x in DK:
    for k in range(3):
        g(M.lib("click-soft"), x + k * .07, .05)
g(M.thump(.3), tStop, .06); g(M.band(M.burst(.25, 20, 2), 200, 1500), tStop, .04)

# ---------- panel section-cut slides (paper)
slide = lambda d=.5: M.band(rng.standard_normal(int(d * SR)), 1800, 7000) * np.sin(np.pi * np.arange(int(d * SR)) / (d * SR)) ** 1.5
for p in ["s2", "s2:Surah", "s3", "s3:Jawab", "s4", "s4:Pesannya", "s5", "s5:lalu", "s6", "s6:Surah", "s7", "s7:Tapi", "s8"]:
    tp = AT.get(p, K.get(p))
    g(slide(.45), tp - .15, .025)
for p in ["s2:Asy-Syu'ara", "s3:mengajak", "s4:unta", "s6:gempa", "s6:Asy-Syams"]:
    g(M.tone((1320, 1980), .4, 10), AT[p], .016)

# ---------- s1 day sweeps: a soft whoosh of passing light
for x in (AT["s1:sehari"], AT["s1:sehari#2"]):
    g(M.lib("whoosh"), x - .1, .025)
# crowd s3: soft murmur of shuffling (no voices), lamp flame
shuf = M.band(rng.standard_normal(int(3 * SR)), 300, 2500) * np.sin(np.pi * np.arange(int(3 * SR)) / (3 * SR))
g(shuf, K["s3"], .02); g(shuf, AT["s4:Datanglah"], .015)
# s5: the turn to the sunset, a low swell; then stillness
g(M.lib("riser"), AT["s5:lalu"] - .6, .018)

# ---------- s6 quake: deep rumble, crumble, rubble
rum = M.band(rng.standard_normal(N), 18, 110); rum /= np.abs(rum).max()
re = M.env([(0, 0), (tQ - .8, 0), (tQ + .3, 1.0), (tFall1, .9), (AT["s6:Surah"] + 1, .4), (K["s6e"], .1), (K["s7"] + .5, 0), (DUR, 0)])
M.fx += np.stack([rum * re * .3, np.roll(rum, 600) * re * .3], 1)
g(M.lib("impact-bass-1"), tQ, .16)
crum = lambda: M.band(M.burst(rng.uniform(.15, .5), rng.uniform(8, 25), 2), 150, 3500)
clack = lambda: M.band(M.burst(.06, 80, 1), 1200, 6000)
for x in rng.uniform(tFall0, tFall1 + 1.2, 140):
    g(crum(), x, rng.uniform(.015, .05))
for x in rng.uniform(tFall0 + .3, tFall1 + 1.6, 120):
    g(clack(), x, rng.uniform(.01, .03))
for x in np.linspace(tFall0 + .2, tFall1, 6):
    g(M.thump(.4), x + rng.uniform(0, .2), .08)

# ---------- s7 map: pin, tomb rising, stamp
g(M.lib("whoosh-cinematic"), K["s7"] - .3, .03)
g(M.lib("pop"), AT["s7:Al-Hijr"], .04)
g(M.band(rng.standard_normal(int(1.2 * SR)), 60, 800) * np.linspace(1, 0, int(1.2 * SR)), AT["s7:makam"], .06)
g(M.thump(.3), AT["s7:UNESCO"], .07); g(M.lib("click"), AT["s7:UNESCO"], .04)
g(M.lib("whoosh-short"), K["s8"] - .3, .03)
g(M.lib("chime"), AT["s8:AUDIRA"], .035)
g(M.lib("whoosh"), OUT - .2, .035); g(M.lib("chime"), OUT + .3, .05)
M.finish(music)
print("duration", DUR)
