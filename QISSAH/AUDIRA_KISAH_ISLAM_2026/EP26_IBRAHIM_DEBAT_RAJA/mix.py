"""EP26 sound: maqam Hijaz on D (D, E-flat, F-sharp, G, A, B-flat, C). Deep drones (D1/A1 with slow beating fifths and a
sub swell) carry the throne hall; a single plucked oud states short Hijaz phrases, sparse and unhurried. Desert wind
runs under everything (band noise with slow gusts), stronger once the camera looks out to the horizon.
Story cues: stone crack + low impact when the gate words split (s1 "terdiam"), a soft glassy shimmer whenever a sentence is
carved in light, heavy stone grinds and thumps as the king's letters rise (s3), quick dry clicks as the letters are
shuffled (s4 "memainkan"), a slow warm swell as the sun rises (s5). At s6 "Maka bingunglah" the music stops: about 2.4 s of
held silence with only faint wind, then a dry sand hiss as the king's words crumble, and the drone returns warmer
(D major colour) for s7-s8. Music dips for a voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(2626)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
ROOT = 50  # D3
HIJAZ = [0, 1, 4, 5, 7, 8, 10]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
deg = lambda d: ROOT + 12 + HIJAZ[d % 7] + 12 * (d // 7)
n = lambda d: np.arange(int(d * SR)) / SR

tCr = AT["s1:terdiam"] - 0.05
tSil0, tSil1 = K["s6"] + 0.05, AT["s6:Kekuasaannya"] - 0.1
tCrum = AT["s6:Kekuasaannya"] + 1.0
tWarm = K["s7"] - 0.3


def oud(f, dur=1.4):
    t = n(dur)
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0007 * h)) * np.exp(-t * (2.0 + 1.2 * h)) / h ** .85 for h in range(1, 10))
    pick = M.band(rng.standard_normal(len(t)), 1800, 6000) * np.exp(-t * 120) * .18
    return (x + pick) * np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .05)


# ---------- drones: D1 + A1 + D2, slow beating; turns warmer (F# major third) after the silence
drone = M.mono()
seg = 9.0
for t0 in np.arange(-1, DUR, seg - 2):
    dt = n(seg)
    warm = t0 >= tWarm - 3
    for nn, a, det in ((ROOT - 24, .55, .0), (ROOT - 17, .3, .15), (ROOT - 12, .22, -.1), (ROOT - 8 if warm else ROOT - 11, .1, .0)):
        f = hz(nn)
        x = np.sin(2 * np.pi * f * dt) + .3 * np.sin(2 * np.pi * 2 * f * dt) + .5 * np.sin(2 * np.pi * (f + det) * dt + 1)
        M.lay(drone, x * np.sin(np.pi * dt / dt[-1]) ** 2, max(0, t0), a)
sub = np.sin(2 * np.pi * hz(ROOT - 36) * T) * M.env([(0, 0), (1, .3), (K["s2"], .5), (K["s3"], .4), (K["s5"], .6), (DUR, .2)])
music_env = M.env([(0, .55), (K["s2"], .8), (K["s4"], .7), (K["s5"], .85), (tSil0 - .25, .9), (tSil0, 0), (tSil1, 0), (tSil1 + 1.8, .85), (K["s7"], 1.0),
                   (K["s8"], 1.0), (DUR - .5, 0), (DUR, 0)])

# ---------- oud phrases in Hijaz (sparse)
od = M.mono()


def phrase(t0, notes, amp=.28, scale=deg):
    t = t0
    for d, b in notes:
        M.lay(od, oud(hz(scale(d)), max(.7, b + .7)), t, amp)
        t += b


phrase(.4, [(4, .5), (3, .35), (2, .35), (1, 1.2)], .24)
phrase(K["s2"] + .5, [(0, .4), (1, .3), (2, .8), (3, .4), (2, .4), (1, .4), (0, 1.4)], .26)
phrase(AT["s2:kerajaan"] - .2, [(4, .45), (5, .3), (4, 1.2)], .22)
phrase(K["s3"] + .3, [(2, .4), (1, .4), (0, 1.3)], .22)
phrase(K["s4"] + .4, [(0, .5), (1, .5), (2, 1.4)], .2)
phrase(AT["s4:Itulah"], [(5, .3), (4, .3), (3, .3), (2, 1.2)], .2)
phrase(K["s5"] + .3, [(0, .4), (2, .4), (4, .4), (5, .4), (7, 1.6)], .24)
warm = lambda d: ROOT + 12 + [0, 2, 4, 5, 7, 9, 11][d % 7] + 12 * (d // 7)
phrase(tWarm + .4, [(0, .5), (2, .5), (4, 1.6)], .22, warm)
phrase(AT["s7:Bukan"], [(4, .4), (3, .4), (2, .4), (1, .4), (0, 1.6)], .2, deg)
phrase(K["s8"] + .5, [(0, .6), (4, .6), (2, .6), (0, 2.0)], .22, warm)
phrase(AT["s8:Kisah"], [(7, .5), (4, .5), (0, 2.2)], .2, warm)

music = np.stack([drone + .25 * sub, drone + .25 * sub], 1) * music_env[:, None] + stereo(od * music_env * 1.6, od * music_env * .5)

# ---------- desert wind (band noise, slow gusts); louder when looking out (s5) and in the silence it is all that remains
wn = M.band(rng.standard_normal(N), 180, 1400) * .5 + M.band(rng.standard_normal(N), 1400, 3800) * .15
gust = .55 + .45 * np.sin(2 * np.pi * T / 7.3) * np.sin(2 * np.pi * T / 3.1 + 1)
wenv = M.env([(0, .5), (K["s2"], .35), (K["s5"], .45), (K["s5"] + 2.5, .9), (tSil0, .8), (tSil1, .8), (K["s7"], .5), (DUR - .4, 0), (DUR, 0)])
w = wn * gust * wenv
M.fx += stereo(w * .05, M.band(rng.standard_normal(N), 300, 2000) * gust * wenv * .02)


# ---------- SFX
def shimmer(dur=1.4):
    t = n(dur)
    x = sum(np.sin(2 * np.pi * f * t + i) * np.exp(-t * (1.5 + i * .4)) for i, f in enumerate([1760, 2349, 2794, 3520]))
    return x * np.minimum(1, t / .05) / 4


def grind(dur=.9):
    t = n(dur)
    return M.band(rng.standard_normal(len(t)), 60, 500) * np.sin(np.pi * t / dur) ** .5 * (1 + .5 * np.sin(2 * np.pi * 13 * t))


def crack():
    x = M.burst(.5, 18, 1) * .6
    hi = M.band(M.burst(.25, 30, 1), 1500, 6000) * .5
    x[:len(hi)] += hi
    th = M.thump(.5)
    x[:len(th)] += .9 * th[:len(x)]
    return x


# hook: lamp lights, the sentence carves, beam reaches, the gate cracks
g(shimmer(1.6) * .1, AT["s1:Satu"])
g(M.lib("riser") * .12, tCr - 1.4)
g(crack() * .22, tCr)
g(M.lib("impact-bass-1") * .32, tCr)
g(M.lib("whoosh-cinematic") * .3, tCr + 1.0)
# panel carve beams: a faint glassy tick on each panel change
for a in ["s2", "s2:Para", "s3", "s3:Raja", "s4", "s4:Itulah", "s5", "s5:Allah", "s6", "s6:Kekuasaannya", "s7", "s7:Bukan", "s8"]:
    t0 = K[a] if a in K else AT.get(a)
    if t0 is None:
        hit = [x for x in M.TL["words"] if x["scene"] == a.split(":")[0] and x["text"].rstrip(".,:;?!") == a.split(":")[1]]
        t0 = hit[0]["start"]
    if tSil0 - .2 < t0 < tSil1:
        continue
    g(shimmer(.6) * .045, t0 - .05)
g(M.lib("whoosh") * .14, K["s2"] + .1)
g(M.lib("chime") * .1, AT["s2:kerajaan"])
# s3: light sentence carved, then the king's letters grind up out of the floor
g(shimmer(2.2) * .14, AT["s3:Yang"] - .1)
g(grind(1.0) * .3, AT["s3:sombong"] - .3)
for k in ["s3:aku", "s3:pun", "s3:bisa"]:
    g(grind(.6) * .2, AT[k])
    g(M.thump(.35) * .26, AT[k] + .38)
# s4: prisoners; one fades (low breath of air), one released (metal shackle drop), then letters shuffled
g(M.band(M.burst(1.6, 2, 3), 100, 700) * .15, AT["s4:dieksekusi"] + .1)
g(M.lib("click") * .25, AT["s4:dibebaskan"] + .4)
g(M.tone([1180, 1630, 2410], .7, 7) * .1, AT["s4:dibebaskan"] + .42)
for i in range(10):
    g(M.lib("click-soft") * .22, AT["s4:memainkan"] - .05 + i * .08)
for i in range(10):
    g(M.lib("click-soft") * .16, AT["s4:pertanyaan"] + .3 + i * .07)
# s5: rise over the throne, then the sun
g(M.lib("whoosh-cinematic") * .18, K["s5"] + .6)
sw = M.mono()
st = n(6)
for nn, a in ((ROOT, .3), (ROOT + 7, .25), (ROOT + 12, .2), (ROOT + 16, .12)):
    M.lay(sw, np.sin(2 * np.pi * hz(nn) * st) * np.minimum(1, st / 3) * np.minimum(1, (6 - st) / 1.5), AT["s5:matahari"] - .3, a)
M.fx += stereo(sw * .07, sw * .02)
g(shimmer(1.8) * .12, AT["s5:timur"])
g(shimmer(1.8) * .1, AT["s5:terbitkanlah"])
# s6: silence, then the crumble to sand
sand = M.mono()
dur = 4.2
ht = n(dur)
M.lay(sand, M.band(rng.standard_normal(len(ht)), 2500, 9000) * np.sin(np.pi * ht / dur) ** .7 * (1 + .4 * np.sin(2 * np.pi * 9 * ht)), tCrum, 1)
M.lay(sand, M.band(rng.standard_normal(len(ht)), 120, 600) * np.sin(np.pi * ht / dur), tCrum + .2, .7)
M.fx += stereo(sand * .06, sand * .02)
g(M.thump(.4) * .25, tCrum + .1)
# s8: lamp flicker and the small light sentence
g(shimmer(1.6) * .1, AT["s8:paling#2"] - .2)
fl = M.band(rng.standard_normal(N), 300, 2500) * M.env([(0, 0), (K["s8"], 0), (K["s8"] + 1.5, 1), (OUT - .3, 1), (OUT, 0), (DUR, 0)]) * (0.6 + .4 * np.sin(2 * np.pi * 5.3 * T))
M.fx += stereo(fl * .008, fl * .004)
g(M.lib("chime") * .14, OUT)

M.finish(music)
