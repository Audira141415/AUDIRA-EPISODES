"""EP22 sound: maqam Kurd on D (D Eb F G A Bb C D). A sparse wooden marimba (tuned-bar partials 1 and ~3.93) plays short
phrases with long rests over a soft bass drone on D/A. Ambience: sea waves (slow filtered-noise swells), distant gulls,
net rustle when nets are hung (s2), slipped into the water (s4) and hung again (s8); fish splashes when the fish crowd
the surface on Sabat (s1, s3). Panel changes get a paper slide + a soft print-drum thunk (the misregistered print
slide). s6 thins the marimba out, the drone drops and darkens with a low swell under the dissolve (no impacts, no
horror), then s7-s8 return to calm waves and a gentle phrase. Music dips for a voice later via M.finish."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(2222)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
ROOT = 50  # D3
KURD = [0, 1, 3, 5, 7, 8, 10]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
deg = lambda d: ROOT + 12 + KURD[d % 7] + 12 * (d // 7)
n = lambda d: np.arange(int(d * SR)) / SR


def marimba(f, dur=1.6, bright=1.0):
    t = n(dur)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.6) + .32 * bright * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 9) \
        + .08 * bright * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 22)
    mallet = M.band(rng.standard_normal(len(t)), 600, 3000) * np.exp(-t * 160) * .15
    return (x + mallet) * np.minimum(1, t / .002) * np.minimum(1, (dur - t) / .05)


# ---------- bass drone D2 + A2 (darkens in s6)
drone = M.mono()
dt = n(9)
for t0 in np.arange(-1, DUR, 7.5):
    for m_, a in ((ROOT - 12, .55), (ROOT - 5, .22)):
        f = hz(m_)
        x = (np.sin(2 * np.pi * f * dt) + .2 * np.sin(2 * np.pi * 2 * f * dt) + .06 * np.sin(2 * np.pi * 3 * f * dt)) * np.sin(np.pi * dt / dt[-1]) ** 2
        M.lay(drone, x, max(0, t0), a)
low = M.mono()
lt = n(DUR - AT["s6:dilupakan"] + 1)
low_sig = np.sin(2 * np.pi * hz(ROOT - 24) * lt) * (1 + .3 * np.sin(2 * np.pi * .23 * lt))
M.lay(low, low_sig, AT["s6:dilupakan"] - .5, 1)
low *= M.env([(0, 0), (AT["s6:dilupakan"], 0), (AT["s6:ditimpa"], .55), (AT["s6:hina"] + 1, .6), (K["s7"] + 2, .1), (K["s7e"], 0), (DUR, 0)])
drone *= M.env([(0, .5), (K["s3"], .6), (K["s4"], .7), (K["s6"], .8), (AT["s6:ditimpa"], .45), (K["s7"] + 1, .55), (K["s8"], .65), (END, .6), (DUR - .4, 0), (DUR, 0)])

# ---------- marimba phrases (sparse; rests matter)
mr = M.mono()


def phrase(t0, notes, amp=.3, bright=1.0):
    t = t0
    for d, b in notes:
        if d is not None:
            M.lay(mr, marimba(hz(deg(d)), max(1.0, b + .9), bright), t, amp)
        t += b


phrase(.25, [(4, .42), (3, .42), (1, .42), (0, 1.3)], .3)
phrase(AT["s1:ikan-ikan"] - .1, [(7, .2), (6, .2), (4, .2), (7, .2), (9, .9)], .2, 1.2)
phrase(AT["s1:Ujian"], [(2, .5), (1, .5), (0, 1.5)], .26)
phrase(K["s2"] + .3, [(0, .4), (1, .4), (2, .4), (4, .8), (3, .4), (2, 1.2)], .28)
phrase(AT["s2:Penduduknya"], [(4, .5), (5, .5), (4, .5), (2, 1.4)], .24)
phrase(AT["s3:ikan-ikan"] - .1, [(7, .2), (6, .2), (4, .2), (7, .2), (9, .9)], .2, 1.2)
phrase(AT["s3:Ayatnya"], [(4, .55), (3, .55), (1, .55), (0, 1.6)], .26)
phrase(K["s4"] + .2, [(0, .35), (None, .35), (0, .35), (1, .35), (2, .9)], .24)
phrase(AT["s4:Sebagian"], [(1, .45), (0, .9)], .2, .7)
phrase(AT["s4:Sebagian#2"], [(4, .45), (5, .9)], .22)
phrase(AT["s4:kelompok"], [(3, .45), (2, .45), (None, .4), (3, .9)], .2, .8)
phrase(K["s5"] + .2, [(7, .7), (6, .5), (5, .5), (4, 1.6)], .24)
phrase(AT["s5:bertakwa"] - .3, [(2, .5), (4, 1.4)], .2)
phrase(AT["s6:diselamatkan"], [(4, .5), (7, 1.6)], .22)
phrase(K["s7"] + .4, [(0, .6), (1, .6), (3, 1.4)], .22, .8)
phrase(AT["s7:peringatan"] + 1, [(4, .5), (3, .5), (1, .5), (0, 1.6)], .2, .8)
phrase(K["s8"] + .3, [(4, .45), (5, .45), (4, .45), (2, .45), (1, .45), (0, 1.6)], .26)
phrase(AT["s8:Kamu"], [(7, .6), (6, .6), (4, 1.4)], .2)
phrase(AT["s8:Kisah"], [(4, .45), (2, .45), (1, .45), (0, 2.2)], .26)
# a few far, quiet echoes of single notes (gives the 'print room' air)
for x in np.arange(3, END, 6.3):
    if not (AT["s6:ditimpa"] - 1 < x < K["s7"]):
        M.lay(mr, marimba(hz(deg(int(rng.integers(0, 7)) + 7)), 1.2, .6), x + rng.uniform(0, .5), .06)

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (drone * .55 + low * .5 + mr) * fin
music = stereo(music_m, (.14 * mr + .05 * drone) * fin)

# ---------- waves: two swell layers
wv = M.band(rng.standard_normal(N), 120, 2600)
wv /= np.abs(wv).max()
sw1 = np.clip(np.sin(2 * np.pi * T / 6.4), 0, 1) ** 2
sw2 = np.clip(np.sin(2 * np.pi * T / 8.9 + 2), 0, 1) ** 2
hiss = M.band(rng.standard_normal(N), 2500, 9000); hiss /= np.abs(hiss).max()
we = M.env([(0, .8), (K["s2"], .55), (K["s2"] + 2, .45), (K["s3"], .85), (K["s4"], .75), (K["s6"], .7), (AT["s6:ditimpa"], .5), (K["s7"], .6), (K["s8"], .9), (DUR - .4, 0), (DUR, 0)])
wl = (wv * (.25 + .75 * sw1) + .4 * hiss * sw1 ** 3) * we
wr = (np.roll(wv, 2300) * (.25 + .75 * sw2) + .4 * np.roll(hiss, 900) * sw2 ** 3) * we
M.fx += np.stack([wl * .05, wr * .05], 1)


# ---------- gulls: descending squawks, distant
def gull():
    d = .42; t = n(d)
    f = 1500 * (1 - .35 * t / d) + 120 * np.sin(2 * np.pi * 18 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) + .4 * np.sin(2 * ph) + .2 * np.sin(3 * ph)) * np.sin(np.pi * t / d) ** 1.5
    return M.band(x, 700, 6000)


for x in [1.4, 4.2, 8.6, K["s2"] + 2.4, K["s3"] + 1.2, K["s3"] + 5.5, K["s8"] + 1.4, K["s8"] + 4.8, K["s8"] + 8.6]:
    g(gull(), x, .012)
    g(gull(), x + .5, .008)

# ---------- fish splashes when fish crowd the surface
splash = lambda: M.band(M.burst(rng.uniform(.08, .2), rng.uniform(25, 45), 2), 900, 7000)
for t0 in (AT["s1:ikan-ikan"] - .3, AT["s1:Ujian"], AT["s3:ikan-ikan"] - .35, AT["s3:demikianlah"]):
    for x in t0 + rng.uniform(0, 2.2, 22):
        g(splash(), x, rng.uniform(.008, .022))
# jumping fish: a few clear plops
for x in (AT["s1:Ujian"] + 1.4, AT["s1:godaan"], AT["s3:ikan-ikan"] + 1.1):
    g(M.band(M.burst(.25, 18, 2), 300, 3000), x, .03)

# ---------- net rustle (hung s2, slipped into water s4, hung again s8)
rustle = lambda d: M.band(rng.standard_normal(int(d * SR)), 1800, 7500) * np.sin(np.pi * n(d) / d) * (.5 + .5 * (rng.random(int(d * SR)) < .2))
g(rustle(1.4), AT["s2:Penduduknya"] + 1.2, .02)
g(rustle(1.8), AT["s4:celah"] - .4, .024)
g(M.band(M.burst(.6, 6, 2), 200, 2500), AT["s4:celah"] + .8, .02)  # net enters the water
g(rustle(1.4), K["s7"] + 2.2, .016)

# ---------- calendar ticks: soft wooden clicks as the day cursor sweeps
tick = lambda: M.band(M.burst(.05, 90, 1), 1200, 6000)
for t0 in (AT["s1:Di"], AT["s3:Pada"]):
    for i in range(6):
        g(tick(), t0 + i * (.3 if t0 == AT["s1:Di"] else .32), .02)

# ---------- question marks (s4), raised hands (s4), print-out of the crowd split
g(M.lib("pop"), AT["s4:bertanya"] - .1, .025)
g(M.lib("whoosh-short"), AT["s4:terbelah"], .03)
g(M.lib("sparkle"), AT["s6:diselamatkan"] - .3, .02)
# s6: ink dissolve = a low soft swell of filtered noise, no impact
ink = M.band(rng.standard_normal(int(4 * SR)), 60, 900) * np.sin(np.pi * n(4) / 4) ** 2
g(ink, AT["s6:ditimpa"] - .2, .06)

# ---------- misregistered print slide on every panel change: paper slide + soft drum thunk
for p in ["s2", "s2:Penduduknya", "s3", "s3:Ayatnya", "s4", "s5", "s6", "s6:Yang", "s7", "s8"]:
    tp = AT.get(p, K.get(p))
    slide = M.band(rng.standard_normal(int(.35 * SR)), 1500, 8000) * np.sin(np.pi * n(.35) / .35) ** 2
    g(slide, tp - .2, .02)
    g(M.thump(.18), tp + .06, .035)
g(M.lib("whoosh-cinematic"), K["s1e"] - .4, .025)

g(M.lib("chime"), AT["s8:AUDIRA"], .03)
g(M.lib("whoosh"), OUT - .2, .03); g(M.lib("chime"), OUT + .3, .045)
M.finish(music)
print("duration", DUR)
