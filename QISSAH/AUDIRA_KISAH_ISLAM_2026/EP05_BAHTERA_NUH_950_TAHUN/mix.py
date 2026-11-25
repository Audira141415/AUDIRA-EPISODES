"""EP05 sound: a shipwright's hymn. D Hijaz at 84 bpm: low cello-like drone on D and A, wooden mallet hits on the beat
(densest while the ark is built, locked to the hammer strikes in world3d.js), a sparse oud-like pluck line.
The storm takes over in s5-s6 (rain, wind, thunder on the lightning beats, ocean swell); after "berhentilah" the drone
resolves into D major with a soft pad and the plucks turn to a calm major arpeggio. No voices. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(950)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
CALM = AT["s7:berhentilah"]            # storm ends, major begins
STORM0, STORM1 = K["s5"] - 1.0, CALM + 1.5

# ---------- cello drone (bowed saw, slow vibrato, band-limited)
def bowed(f, dur, att=1.2, rel=1.5):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + .004 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 1.5)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = sum(np.sin(h * ph) / h ** 1.25 for h in range(1, 10))
    return x * np.minimum(1, t / att) * np.minimum(1, (dur - t) / rel)

drone = M.mono()
seg = [(0, CALM + .3, (38, 45)), (CALM - .2, DUR, (38, 45, 54))]   # D2 A2, then add F#3 for D major
for a, b, notes in seg:
    for n in notes:
        M.lay(drone, bowed(mid(n), b - a, 1.5, 2.0), a, .22 if n < 50 else .1)
drone = M.band(drone, 40, 1800)
dr_env = M.env([(0, .55), (K["s2"], .7), (K["s4"], .85), (STORM0, .9), (STORM1, .55), (K["s8"], .8), (END + 1, .7), (DUR - .4, 0), (DUR, 0)])

# ---------- wooden mallet on the beat
beat = 60 / 84
def wood(f=220, dec=34):
    t = np.arange(int(.22 * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * dec) + .6 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * dec * 1.8)
    return x + .4 * M.band(M.burst(.22, 70, 2), 600, 4000)

perc = M.mono()
for b in range(int(DUR / beat)):
    t = b * beat
    q = b % 4
    dens = 0
    if K["s1"] <= t < K["s4"]: dens = 1
    if K["s4"] <= t < K["s5"]: dens = 2
    if K["s5"] <= t < CALM: dens = 1
    if CALM <= t < END: dens = 3
    if dens == 0: continue
    if dens == 3:
        if q == 0: M.lay(perc, wood(150, 18), t, .35)
        continue
    M.lay(perc, wood(160 if q == 0 else 230, 30), t, .55 if q == 0 else .3)
    if dens == 2 and q in (1, 3): M.lay(perc, wood(320, 40), t + beat / 2, .22)
perc_env = M.env([(0, .8), (STORM0, .8), (K["s5"] + 1, .45), (CALM, .4), (DUR, .4)])

# ---------- oud-like pluck: D Hijaz phrases, then D major arpeggio
HIJ = [62, 63, 66, 67, 69, 70, 72, 74]
phr = [0, 1, 2, 1, 0, 2, 3, 4, 3, 2, 1, 0]
pluck = M.mono()
k = 0
for b in range(int(K["s1"] / beat), int(K["s5"] / beat)):
    t = b * beat
    if b % 2 == 0 or (K["s4"] <= t and b % 4 == 3):
        M.lay(pluck, M.note(mid(HIJ[phr[k % len(phr)]] - 12), .9, "pluck", 3.0), t + beat * .5, .22)
        k += 1
MAJ = [50, 54, 57, 62, 66, 69, 66, 62]
for i, t in enumerate(np.arange(CALM + .8, END + 1.5, beat / 2)):
    M.lay(pluck, M.note(mid(MAJ[i % len(MAJ)]), 1.4, "pluck", 2.0), t, .2)
pad = M.mono()
for n in (62, 66, 69, 74):
    M.lay(pad, bowed(mid(n), DUR - CALM, 2.5, 2.5), CALM, .05)

fin = M.env([(0, 1), (END + .4, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drone * dr_env + perc * perc_env * .7 + pluck + pad) * fin
music = stereo(music_m, .3 * pluck * fin - .12 * perc * perc_env * fin)

# ---------- storm and sea ambience
noise = rng.standard_normal(N)
rain = M.band(noise, 900, 9000)
rain /= np.abs(rain).max()
rain_e = M.env([(0, 0), (AT["s5:langit"] - .3, 0), (AT["s5:terbuka"] + .6, 1), (K["s6"], 1), (CALM - .2, .9), (CALM + 1.2, 0), (DUR, 0)])
wind = M.band(rng.standard_normal(N), 150, 900) * (1 + .6 * np.sin(2 * np.pi * .13 * T) * np.sin(2 * np.pi * .07 * T + 1))
wind /= np.abs(wind).max()
wind_e = M.env([(0, .15), (K["s4"], .25), (K["s5"], .6), (K["s6"], 1), (CALM, .6), (CALM + 2, .1), (K["s8"], .06), (DUR, 0)])
sea = M.band(rng.standard_normal(N), 40, 420) * (0.55 + .45 * np.sin(2 * np.pi * T / 6.5))
sea /= np.abs(sea).max()
sea_e = M.env([(0, 0), (K["s5"] + 4, 0), (K["s6"], .7), (AT["s6:Gelombang"], 1), (CALM, .7), (K["s8"], .3), (END + 1, .2), (DUR - .3, 0), (DUR, 0)])
amb = rain * rain_e * .07 + wind * wind_e * .06 + sea * sea_e * .16
M.fx += np.stack([amb, np.roll(amb, 1300)], 1)

def thunder(t0, a=.22):
    n = int(3.2 * SR)
    tt = np.arange(n) / SR
    x = M.band(rng.standard_normal(n), 25, 260) * (np.exp(-tt * 1.3) * (1 + .7 * np.sin(2 * np.pi * 3.1 * tt) ** 2))
    crack = M.band(rng.standard_normal(int(.25 * SR)), 1500, 8000) * np.exp(-np.arange(int(.25 * SR)) / SR * 20)
    g(x / np.abs(x).max(), t0 + .25, a); g(crack / np.abs(crack).max(), t0, a * .35)

for x in K["LT"]:
    thunder(x)

# ---------- SFX keyed to the picture
# s1: 50 pegs pop out of the tally board
for j in range(50):
    g(wood(900 + 40 * (j % 7), 70), AT["s1:lima"] + j * .012, .045)
g(M.lib("impact-bass-1"), AT["s1:lima"] + .1, .12)
g(M.lib("chime"), AT["s1:sedikit"], .05)
# s2: day/night whooshes, cloth rustle
P = 1.7
for t in np.arange(K["s2"] + .2, AT["s2:Tapi"], P):
    g(M.lib("whoosh-short"), t + P * .45, .03)
for t0 in (AT["s2:menyumbat"], AT["s2:menutupi"]):
    for x in rng.uniform(t0, t0 + .9, 30):
        g(M.band(M.burst(.04, 70, 1), 1500, 6000), x, .03 * rng.uniform(.4, 1))
# s3
g(M.lib("whoosh"), K["s3"] - .3, .05)
g(M.lib("sparkle"), AT["s3:Upahku"], .04)
# s4: build. keel/rib thuds, plank knocks, hammer strikes exactly on the pegs
g(M.thump(.45), AT["s4:buatlah"] + .5, .25)
for i in range(13):
    g(wood(130, 22), AT["s4:pengawasan"] - .4 + i * .16 + .95, .12)
for i in range(60):
    g(wood(260 + 30 * (i % 5), 30), AT["s4:Setiap"] - .3 + i * .1 + 1.3, .05)
for x in K["HS"]:
    g(wood(520, 45), x, .3); g(M.thump(.12), x, .08)
g(M.thump(.5), AT["s4:pasak"] + .3, .2)
# s5: sky opens, springs, footsteps up the ramp, the door shuts
g(M.lib("riser"), AT["s5:langit"] - 1.2, .05)
n = int(2.5 * SR)
gush = M.band(rng.standard_normal(n), 300, 3000) * np.minimum(1, np.arange(n) / SR / .3) * np.exp(-np.arange(n) / SR * .8)
g(gush / np.abs(gush).max(), AT["s5:menyemburkan"], .07)
for t in np.arange(AT["s5:sepasang"] - .5, AT["s5:berlabuh"], .26):
    g(M.thump(.1), t, .04); g(wood(200, 50), t + .02, .03)
g(M.thump(.6), AT["s5:berlabuh"] + .85, .3); g(wood(110, 12), AT["s5:berlabuh"] + .85, .2)
# s6: swells and the separating wave
g(M.lib("whoosh-cinematic"), K["s6"] - .3, .06)
g(M.lib("whoosh-cinematic"), AT["s6:Gelombang"] - .2, .08); g(M.lib("impact-bass-1"), AT["s6:Gelombang"] + .6, .1)
# s7: calm, the ark settles on Judi
g(M.lib("chime"), CALM + .2, .06)
g(M.thump(.7), AT["s7:berlabuh"] + .3, .2); g(wood(95, 10), AT["s7:berlabuh"] + .3, .15)
g(M.lib("sparkle"), AT["s7:Kapal"], .04)
# s8 and the outro
g(M.lib("whoosh"), K["s8"] - .3, .04)
g(M.lib("whoosh"), OUT - .2, .05); g(M.lib("chime"), OUT + .3, .07)
M.finish(music)
print("duration", DUR)
