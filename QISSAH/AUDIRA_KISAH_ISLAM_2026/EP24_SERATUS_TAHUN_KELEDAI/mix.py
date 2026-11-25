"""EP24 sound: maqam Saba on D (D, E half-flat, F, G-flat, A, B-flat, C; quarter tone by 24-TET). Layers of clockwork
carry the film: a slow pendulum tick-tock, a fine escapement tick and a ratchet that accelerate into a whirr whenever the
year-dial races (hook spin, the 100-year time-lapse, the rebuild) and spin backwards on the rewind. A plucked oud states
short Saba phrases over a D/A drone; wind whistles through the ruined town (band noise with hollow resonances). In s6
the bones assemble with soft dry wooden knocks and a rising glass shimmer (never harsh), then the flesh fill gets a warm
swell; the town rebuilds with distant stone settles. From s6:Agar the harmony resolves warmer (D major pad, Saba's
tension released), ending on a gentle dawn bed. Music dips for a voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(2424)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
ROOT = 50  # D3
SABA = [0, 1.5, 3, 4, 7, 8, 10]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
deg = lambda d: ROOT + 12 + SABA[d % 7] + 12 * (d // 7)
n = lambda d: np.arange(int(d * SR)) / SR

tSpin, dSpin = AT["s1:seratus"], 1.6
tRw0, tRw1 = K["s1e"] - .35, K["s2"] + .45
tTL, dTL = AT["s3:mematikannya-0.2"], 3.4
tLift = AT["s6:tulang-tulang"] - .2
tAsm0 = AT["s6:disusun"] - .4
tFl0 = AT["s6:dibalut"] - .1
tReb = AT["s6:Agar"] - .3
tWarm = AT["s6:Agar"]


def oud(f, dur=1.4):
    t = n(dur)
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0006 * h)) * np.exp(-t * (2.2 + 1.1 * h)) / h ** .8 for h in range(1, 10))
    pick = M.band(rng.standard_normal(len(t)), 1800, 6500) * np.exp(-t * 110) * .2
    return (x + pick) * np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .05)


# ---------- drone D2 + A2, warms to D major pad after s6:Agar
drone = M.mono()
dt = n(10)
for t0 in np.arange(0, DUR, 8.0):
    for nn, a in ((ROOT - 12, .5), (ROOT - 5, .24), (ROOT, .1)):
        f = hz(nn)
        x = (np.sin(2 * np.pi * f * dt) + .25 * np.sin(2 * np.pi * 2 * f * dt)) * np.sin(np.pi * dt / dt[-1]) ** 2
        M.lay(drone, x, t0, a)
drone *= M.env([(0, .5), (K["s2"], .7), (K["s3"], .6), (tTL, .4), (tTL + dTL, .8), (K["s5"], .6), (K["s6"], .7), (DUR - .4, 0), (DUR, 0)])
pad = M.mono()
for t0 in np.arange(tWarm - .5, DUR, 6.0):
    pt = n(7.5)
    for nn, a in ((ROOT, .3), (ROOT + 4, .22), (ROOT + 7, .22), (ROOT + 12, .12), (ROOT + 16, .06)):
        f = hz(nn)
        ph = 2 * np.pi * f * pt + .002 * np.sin(2 * np.pi * .3 * pt) * f
        M.lay(pad, (np.sin(ph) + .3 * np.sin(2 * ph) + .1 * np.sin(3 * ph)) * np.sin(np.pi * pt / pt[-1]) ** 2, t0, a)
pad *= M.env([(0, 0), (tWarm - .5, 0), (tWarm + 2, .9), (K["s8"], 1.0), (DUR - .4, 0), (DUR, 0)])

# ---------- oud phrases in Saba
od = M.mono()


def phrase(t0, notes, amp=.3):
    t = t0
    for d, b in notes:
        M.lay(od, oud(hz(deg(d)), max(.6, b + .6)), t, amp)
        if b >= .9:
            M.lay(od, oud(hz(deg(d)), .6), t + b * .5, amp * .4)
        t += b


phrase(.3, [(2, .45), (1, .3), (0, 1.0)], .24)
phrase(K["s2"] + .4, [(0, .3), (1, .3), (2, .3), (3, .6), (2, .3), (1, .3), (0, 1.0)], .26)
phrase(AT["s2:atap-atapnya"], [(3, .4), (4, .3), (3, .3), (2, 1.1)], .22)
phrase(K["s3"] + .2, [(2, .35), (3, .35), (4, .35), (5, .4), (4, 1.1)], .24)
phrase(K["s4"] + .3, [(4, .3), (3, .3), (2, .3), (1, .3), (0, 1.0)], .22)
phrase(AT["s4:Tidak"], [(0, .25), (2, .25), (4, .25), (7, 1.3)], .26)
phrase(K["s5"] + .2, [(4, .35), (3, .35), (2, .7), (1, .3), (0, 1.0)], .2)
# warm resolution: Saba's flat 4th gives way to a natural (major) colour
warm = lambda d: ROOT + 12 + [0, 2, 4, 5, 7, 9, 11][d % 7] + 12 * (d // 7)
for t0, notes, amp in [(tWarm + .2, [(0, .4), (2, .4), (4, .4), (7, 1.4)], .24), (K["s7"] + .5, [(4, .4), (5, .35), (4, .35), (2, .5), (0, 1.3)], .22),
                       (AT["s7:Mahakuasa"], [(7, .5), (6, .3), (4, 1.2)], .2), (K["s8"] + .4, [(0, .5), (2, .4), (4, .5), (2, .4), (0, 1.6)], .24)]:
    tt = t0
    for d, b in notes:
        M.lay(od, oud(hz(warm(d)), max(.6, b + .6)), tt, amp)
        tt += b

# ---------- clockwork: pendulum tick-tock, fine escapement, ratchet whirr when time races
clock = M.mono()
tick = lambda f=2600, dec=120: M.band(M.burst(.04, dec, 1), f * .6, f * 1.8)
tock = lambda: M.band(M.burst(.06, 70, 2), 600, 2400)
# speed of the dial in years/s (sign = direction)
def yr(t):
    eo = lambda x: 1 - (1 - np.clip(x, 0, 1)) ** 3
    sm = lambda x: (lambda c: c * c * (3 - 2 * c))(np.clip(x, 0, 1))
    return np.where(t < tRw0, 100 * eo((t - tSpin) / dSpin), np.where(t < tTL, 100 * (1 - sm((t - tRw0) / (tRw1 - tRw0))), 100 * eo((t - tTL) / dTL)))
tt = np.arange(0, DUR, .01)
Y = yr(tt)
speed = np.abs(np.gradient(Y, tt))
# pendulum at 1 Hz everywhere, quieter under busy moments
ce = M.env([(0, 1), (K["s2"], .7), (K["s3"], .9), (K["s4"], 1.0), (K["s5"], .6), (K["s6"], .4), (tWarm, .25), (K["s8"], .15), (END, .1), (DUR, 0)])
for i, x in enumerate(np.arange(.2, DUR - .5, 1.0)):
    j = int(x * SR)
    a = ce[min(j, N - 1)]
    M.lay(clock, tick(2300) if i % 2 == 0 else tock(), x, .2 * a)
# escapement ticks whose rate follows the dial speed (up to ~40 per second, merging into a whirr)
x = 0.0
while x < DUR - .2:
    k = min(len(speed) - 1, int(x / .01))
    sp = speed[k] + (0 if K["s6"] > x or x > tReb + 3.2 else 25 * np.sin(np.pi * (x - tReb) / 3.2) ** 2 * (x > tReb))
    if sp > 2:
        M.lay(clock, tick(3400 + min(sp, 120) * 8, 160), x, .05 + .05 * min(1, sp / 80))
        x += max(.022, 1.6 / sp)
    else:
        x += .02
# low whirr under the fast spins
wh = M.band(rng.standard_normal(N), 180, 900)
wh /= np.abs(wh).max()
spd = np.interp(T, tt, speed)
spd2 = np.interp(T, tt, [25 * np.sin(np.pi * (q - tReb) / 3.2) ** 2 if tReb < q < tReb + 3.2 else 0 for q in tt])
M.fx += np.stack([wh, np.roll(wh, 700)], 1) * (np.clip((spd + spd2) / 90, 0, 1) * .045)[:, None]

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drone * .5 + pad * .55 + od + clock * .8) * fin
music = stereo(music_m, (.12 * od + .08 * drone + .1 * pad) * fin)

# ---------- wind through the ruins (hollow resonances), strongest at the town in s2
wind = M.band(rng.standard_normal(N), 140, 1500) * (1 + .6 * np.sin(2 * np.pi * .09 * T) * np.sin(2 * np.pi * .041 * T + 1))
wind /= np.abs(wind).max()
whis = sum(M.band(rng.standard_normal(N), f * .97, f * 1.03) for f in (520, 780, 1040))
whis /= np.abs(whis).max()
whis *= .5 + .5 * np.sin(2 * np.pi * .13 * T) ** 2
we = M.env([(0, .25), (K["s2"], .7), (AT["s2:runtuh"], 1.0), (K["s3"], .45), (tTL, .7), (tTL + dTL, .3), (K["s4"], .2), (K["s6"], .3), (tReb, .5), (tReb + 3, .15), (K["s8"], .25), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .05 + whis * we * .012, np.roll(wind, 1500) * we * .05 + np.roll(whis, 600) * we * .012], 1)
# birds at dawn (simple chirps) in s8 and lightly in s5
chirp = lambda f: np.sin(2 * np.pi * (f * n(.09) + 9000 * n(.09) ** 2)) * np.sin(np.pi * n(.09) / .09)
for x0 in list(rng.uniform(K["s8"], END, 9)) + list(rng.uniform(K["s5"], K["s5"] + 3, 3)):
    for k in range(int(rng.integers(2, 4))):
        g(chirp(rng.uniform(2800, 4200)), x0 + k * .13, .012)

# ---------- events
g(M.lib("whoosh-cinematic"), tSpin - .3, .035)
g(M.lib("riser"), tSpin - .9, .02)
g(M.lib("chime"), tSpin + dSpin - .1, .035)  # dial lands on 100
g(M.lib("sparkle"), AT["s1:makanannya"], .03)
# rewind: reversed whoosh + falling ratchet
g(M.lib("whoosh")[::-1], tRw0 - .2, .035)
g(M.lib("whoosh-short"), K["s2"] - .1, .02)
# time-lapse
g(M.lib("riser"), tTL - 1.0, .03)
g(M.lib("chime"), tTL + dTL - .2, .04)
# s4: question and the answer, a soft bell on "Tidak"
g(M.lib("ping"), AT["s4:Tidak"], .03)
g(M.thump(.5), AT["s4:seratus"], .1)
# s5 glisten
g(M.lib("sparkle"), K["s5"] + .2, .03)
g(M.lib("click-soft"), AT["s5:keledaimu"], .025)
# s6 bones: soft dry wooden knocks while they lift and click into place, glass shimmer rising
knock = lambda f: M.band(M.burst(.05, 90, 1), f, f * 3) + .4 * np.sin(2 * np.pi * f * n(.05)) * np.exp(-n(.05) * 80)
for x in np.sort(rng.uniform(tLift, tAsm0 + 1.6, 26)):
    g(knock(rng.uniform(700, 1400)), x, rng.uniform(.012, .028))
shim = sum(np.sin(2 * np.pi * f * n(2.4)) * np.sin(np.pi * n(2.4) / 2.4) ** 2 for f in (1175, 1480, 1760, 2349)) / 4
g(shim, tLift - .1, .03)
swell = sum(np.sin(2 * np.pi * hz(nn) * n(2.6)) for nn in (ROOT, ROOT + 7, ROOT + 12, ROOT + 16)) / 4 * np.sin(np.pi * n(2.6) / 2.6) ** 1.5
g(swell, tFl0 - .3, .09)
g(M.lib("sparkle"), tFl0 + .5, .025)
# town rebuild: distant stone settles
stone = lambda: M.band(M.burst(.18, 25, 3), 120, 1500)
for x in np.sort(rng.uniform(tReb, tReb + 3.2, 20)):
    g(stone(), x, rng.uniform(.01, .025))
# panel sweep: a soft clock-wind tick burst
for p in ["s2", "s2:Seorang", "s3", "s3:Lalu", "s4", "s4:Tidak", "s5", "s5:Tapi", "s6", "s6:Agar", "s7", "s7:Al-Qur'an", "s8"]:
    tp = AT.get(p, K.get(p))
    for k in range(6):
        g(tick(4200 - k * 200, 200), tp - .16 + k * .1, .012)

g(M.lib("chime"), AT["s8:AUDIRA"], .03)
g(M.lib("whoosh"), OUT - .2, .03); g(M.lib("chime"), OUT + .3, .045)
M.finish(music)
print("duration", DUR)
