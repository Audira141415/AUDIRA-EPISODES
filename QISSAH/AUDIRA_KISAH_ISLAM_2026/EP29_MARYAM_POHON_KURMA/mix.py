"""EP29 sound: maqam Rast on C (C D E-half-flat F G A B-half-flat C). A soft synthesized kanun (plucked zither: paired
detuned courses, bright fast-decaying harmonics, tremolo on held notes) plays short, tender phrases over a warm pad
(soft detuned sines/saws through a gentle band-pass) holding Rast drones. Light night wind throughout; a gentle stream
from the moment it sews itself out (s5) to the end; soft muffled felt thuds where each date lands in the shawl (times
from K.drops + the world's fall time). Felt foley: tiny needle ticks for every panel stitch-on and along the path in s2,
a frond rustle when the palm sways, a soft shimmer for the call (no voice), a warm swell into the dawn.
Music dips for a voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(2929)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
FT = 0.7  # date fall time, same as world3d.js
ROOT = 48  # C3
RAST = [0, 2, 3.5, 5, 7, 9, 10.5]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
deg = lambda d: ROOT + 12 + RAST[d % 7] + 12 * (d // 7)
n = lambda d: np.arange(int(d * SR)) / SR


def pad(freqs, dur):
    t = n(dur)
    x = np.zeros(len(t))
    for f in freqs:
        for dt in (-.003, 0, .0035):
            ff = f * (1 + dt)
            x += np.sin(2 * np.pi * ff * t) + .35 * np.sin(2 * np.pi * 2 * ff * t + 1) + .12 * np.sin(2 * np.pi * 3 * ff * t + 2)
    x = M.band(x, 50, 1100)
    return x * np.sin(np.pi * t / dur) ** 1.4


def kanun(f, dur=1.6, trem=0):
    """Plucked zither: two slightly detuned strings, bright harmonics with fast decay, a soft pick. trem>0 re-plucks."""
    def one(f0, d):
        t = n(d)
        x = sum(np.sin(2 * np.pi * f0 * h * t * (1 + .0004 * h)) * np.exp(-t * (1.6 + 1.9 * h)) / h ** .7 for h in range(1, 12))
        pick = M.band(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-t * 160) * .25
        return (x + pick) * np.minimum(1, t / .002) * np.minimum(1, (d - t) / .04)
    x = one(f, dur) + .8 * one(f * 1.0025, dur)
    if trem:
        out = np.zeros(int(dur * SR))
        for k, t0 in enumerate(np.arange(0, dur - .2, 1 / trem)):
            s = one(f * (1 + .0012 * (k % 2)), dur - t0) * (.55 + .45 * (k == 0))
            i = int(t0 * SR); out[i:i + len(s)] += s[: len(out) - i]
        x = out
    return x


# ---------- pad: Rast drones (C+G, F+C, C+G with E-half-flat, G+D) every ~7.5 s
pads = M.mono()
CH = [[ROOT - 12, ROOT - 5, ROOT], [ROOT - 7, ROOT, ROOT + 5], [ROOT - 12, ROOT - 5, ROOT + 3.5], [ROOT - 5, ROOT + 2, ROOT + 7]]
for i, t0 in enumerate(np.arange(-1.5, DUR, 7.5)):
    M.lay(pads, pad([hz(m) for m in CH[i % 4]], 9.5), max(0, t0), .2)
dn = K["s8"]
pads *= M.env([(0, .35), (3, .7), (K["s2"], .8), (K["s4"], .7), (AT["s4:alangkah"], .55), (AT["s5:diseru"], .8), (K["s6"], .9), (K["s7"], .8), (dn, .9), (dn + 3, 1.15), (END, 1.0), (DUR - .3, 0), (DUR, 0)])
sub = np.sin(2 * np.pi * hz(ROOT - 24) * T) * (.5 + .5 * np.sin(2 * np.pi * .06 * T)) * M.env([(0, 0), (2, .2), (DUR - .3, 0), (DUR, 0)])

# ---------- kanun phrases
kn = M.mono()


def phrase(t0, notes, amp=.26, last_trem=0):
    t = t0
    for j, (d, b) in enumerate(notes):
        tr = last_trem if j == len(notes) - 1 else 0
        M.lay(kn, kanun(hz(deg(d)), max(1.0, b + .9), tr), t, amp)
        t += b


phrase(.4, [(4, .45), (3, .3), (2, .3), (1, .4), (0, 1.6)], .2, 9)
phrase(AT["s1:goyangkan"] - .2, [(0, .25), (2, .25), (4, .5)], .2)
phrase(K["s2"] + .3, [(0, .35), (1, .3), (2, .3), (3, .3), (4, .9)], .22)
phrase(AT["s2:timur"], [(4, .3), (5, .3), (6, .3), (7, 1.4)], .2, 10)
phrase(K["s3"] + .2, [(7, .4), (6, .3), (5, .3), (4, 1.0)], .2)
phrase(AT["s3:Jawabnya"] + .3, [(2, .3), (3, .3), (4, .3), (5, .3), (4, 1.4)], .22, 10)
phrase(K["s4"] + .3, [(4, .4), (2, .4), (1, .4), (0, 1.4)], .18)
phrase(AT["s4:alangkah"] + .4, [(2, .6), (1, .6), (0, 2.0)], .14)
phrase(AT["s5:janganlah"], [(0, .3), (2, .3), (4, .3), (7, 1.6)], .22, 11)
phrase(AT["s6:menggugurkan"] + .2, [(7, .2), (6, .2), (5, .2), (4, .2), (3, .2), (2, .2), (1, .2), (0, 1.2)], .17)
phrase(K["s7"] + .4, [(0, .5), (2, .4), (3, .4), (2, 1.4)], .18)
phrase(AT["s7:pertolongan"], [(2, .3), (3, .3), (4, .3), (5, .3), (7, 1.6)], .22, 10)
phrase(AT["s8:Kisah"] - .4, [(4, .4), (5, .3), (4, .3), (2, .4), (0, 1.8)], .22, 9)

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (pads + .35 * sub + kn) * fin
music = stereo(music_m, (.12 * kn + .06 * pads) * fin)

# ---------- night wind (always), swells under the hook and the dawn
wind = M.band(rng.standard_normal(N), 180, 1600) * (1 + .6 * np.sin(2 * np.pi * .09 * T) * np.sin(2 * np.pi * .031 * T + 1))
wind /= np.abs(wind).max()
we = M.env([(0, .5), (4, .4), (K["s2"], .25), (K["s5"], .2), (K["s8"], .3), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([wind * we * .035, np.roll(wind, 1700) * we * .035], 1)

# ---------- gentle stream from its appearance to the end
t_s0 = AT["s5:Tuhanmu"] - .2
st = M.band(rng.standard_normal(N), 900, 7000)
bub = np.clip(M.band(rng.standard_normal(N), 2, 14) * 3, 0, None)
st = st * (.6 + bub)
st /= np.abs(st).max()
se = M.env([(0, 0), (t_s0, 0), (t_s0 + 1.8, .55), (K["s6"], .45), (K["s7"], .35), (END, .4), (DUR - .3, 0), (DUR, 0)])
M.fx += np.stack([st * se * .02, np.roll(st, 900) * se * .02], 1)
for x in rng.uniform(t_s0 + 1, END, 40):  # soft bubbles
    f = rng.uniform(700, 1400); d = .06
    g(M.tone([f], d) * np.linspace(1, 1.6, int(d * SR)) * np.exp(-n(d) * 40), x, .006)


# ---------- felt foley
def tick(f0=5000):
    return M.band(M.burst(.02, 300, 1), f0 * .6, f0 * 1.6)


def needle(t0, k=4, gap=.05, amp=.03):
    for j in range(k):
        g(tick(4200 + 500 * (j % 2)), t0 + j * gap, amp)


def felt_thud(amp):
    t = n(.25)
    body = np.sin(2 * np.pi * (150 * t + 40 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 26)
    fuzz = M.band(rng.standard_normal(len(t)), 120, 900) * np.exp(-t * 40) * .5
    return (body + fuzz) * amp


# panel stitch-on: needle ticks
ins = [K["s2"], AT["s2:Di"], K["s3"], K["s4"], AT["s4:Saat"], K["s5"], K["s6"], AT["s6:Maka"], K["s7"], AT["s7:Tapi"], K["s8"]]
for t0 in ins:
    needle(t0 - .1, 4, .05, .028)
    g(M.band(M.burst(.18, 25, 3), 300, 2500), t0 - .14, .012)  # patch landing
# path sewn in s2: a tick per stitch
tP0, tP1 = AT["s2:mengasingkan"], AT["s2:timur"] + .5
for i in range(44):
    g(tick(3800), tP0 + (tP1 - tP0) * (i + .5) / 44, .012)
g(M.lib("pop"), AT["s2:sebelah"] - .1, .04)
# stars brighten
g(M.lib("sparkle"), AT["s3:tanda"] - .05, .03); g(M.lib("sparkle"), AT["s3:rahmat"] - .05, .025)
# the call: soft shimmer rising from below
for k in range(3):
    t0 = AT["s5:diseru"] + k * .55
    sh = sum(M.tone([f], 2.4) * np.exp(-n(2.4) * 1.4) for f in (hz(deg(7)), hz(deg(9)), hz(deg(11)))) / 3
    g(sh * np.sin(np.pi * n(2.4) / 2.4), t0, .04)
g(M.lib("chime"), AT["s5:diseru"] - .05, .028)
# palm sway: frond rustle
tS = AT["s6:goyanglah"]
ru = M.band(rng.standard_normal(int(5 * SR)), 1400, 7000) * (1 + 1.2 * np.abs(np.sin(2 * np.pi * (4.2 / 6.283) * n(5))))
ru *= np.interp(n(5), [0, .4, 3.6, 5], [0, 1, .7, 0]); ru /= np.abs(ru).max()
g(np.stack([ru, np.roll(ru, 600)], 1), tS - .1, .035)
creak = M.band(M.burst(1.2, 3, 1), 150, 700)
g(creak, tS + .2, .03)
g(M.band(rng.standard_normal(int(1.2 * SR)), 1400, 6000) * np.interp(n(1.2), [0, .2, 1.2], [0, 1, 0]), AT["s7:bergoyang"], .006)
# dates landing in the shawl: soft felt thuds + a little bounce
for td in K["drops"]:
    tl = td + FT
    g(felt_thud(.5 + .3 * rng.uniform()), tl, .11)
    g(felt_thud(.2), tl + .3, .05)
# cup pops up
g(M.lib("pop"), AT["s6:minum"] - .1, .035)
g(M.lib("click-soft"), AT["s6:bersenanghatilah"], .02)
# dawn swell
sw = M.band(rng.standard_normal(int(5 * SR)), 200, 3000) * np.interp(n(5), [0, 3.5, 5], [0, 1, 0])
g(sw / np.abs(sw).max(), K["s8"] - .5, .012)
g(M.lib("chime"), AT["s8:AUDIRA"], .03)
g(M.lib("whoosh"), OUT - .2, .028); g(M.lib("chime"), OUT + .3, .045)
M.finish(music)
print("duration", DUR)
