"""EP28 sound: a wayang night in maqam Hijaz on D (D Eb F# G A Bb C). A gamelan-like metallophone (saron/gender
timbre: inharmonic bronze partials with slow beating) plays a slow ostinato on Hijaz degrees, a kendang-style hand drum
(low "dhung" with a pitch drop, dry "tak" slap) keeps a soft 76 bpm cycle, a gong ageng closes each 8-beat cycle, and a
plucked oud carries short Hijaz phrases. Foley: the blencong flame hiss, the dalang's cempala knocks on scene changes,
rope rustle while the illusions crawl (s4), a deep swallow whoosh when the staff's serpent swallows them (s5), a soft
leather flap for every gunungan pass. Music thins under Firaun's anger and turns to a single held gong at the sujud.
Music dips for a voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(2028)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
ROOT = 50  # D3
HJ = [0, 1, 4, 5, 7, 8, 10]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
deg = lambda d: ROOT + 12 + HJ[d % 7] + 12 * (d // 7)
n = lambda d: np.arange(int(d * SR)) / SR
BEAT = 60 / 76


def metal(f, dur=2.2, br=1.0):
    t = n(dur)
    parts = [(1, 1, 1.6), (2.76, .45, 3.2), (5.4, .22, 6), (8.9, .1, 9)]
    x = sum(a * np.sin(2 * np.pi * f * r * t + r) * np.exp(-t * d * br) for r, a, d in parts)
    x += .35 * np.sin(2 * np.pi * f * 1.004 * t) * np.exp(-t * 1.6 * br)  # paired-tuning beat (ombak)
    strike = M.band(rng.standard_normal(len(t)), 2000, 9000) * np.exp(-t * 160) * .2
    return (x + strike) * np.minimum(1, t / .002) * np.minimum(1, (dur - t) / .05)


def oud(f, dur=1.4):
    t = n(dur)
    x = sum(np.sin(2 * np.pi * f * h * t * (1 + .0006 * h)) * np.exp(-t * (2.2 + 1.2 * h)) / h ** .8 for h in range(1, 10))
    pick = M.band(rng.standard_normal(len(t)), 1800, 6500) * np.exp(-t * 110) * .22
    return (x + pick) * np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .05)


def dhung(dur=.5):
    t = n(dur)
    return np.sin(2 * np.pi * (95 * t + 50 * (1 - np.exp(-t * 18)) / 18)) * np.exp(-t * 7) + .15 * M.burst(dur, 80, 3)


def tak(dur=.12):
    return M.band(M.burst(dur, 55, 1), 700, 5000) * 1.2


def gong(dur=7.0, f=hz(ROOT - 24)):
    t = n(dur)
    x = np.sin(2 * np.pi * f * t) * (1 + .4 * np.sin(2 * np.pi * 2.6 * t)) + .5 * np.sin(2 * np.pi * f * 2.02 * t) * np.exp(-t * .6) + .25 * np.sin(2 * np.pi * f * 3.1 * t) * np.exp(-t * 1.2)
    return x * np.exp(-t * .45) * np.minimum(1, t / .02)


# ---------- section gains: full in s1-s3, thinner in s4 (tension), swell in s5, gong-only at sujud, hushed in s7
tAng, tJaw = AT["s7:murka"], AT["s7:Jawab"]
tSuj = AT["s6:merunduk"]
lvl = M.env([(0, .7), (2, 1), (K["s4"], 1), (K["s4"] + 1, .55), (AT["s5:wahyu"], .55), (AT["s5:wahyu"] + 1.5, 1), (tSuj - .5, 1), (tSuj + .3, .25),
             (K["s7"], .25), (tAng, .12), (tJaw, .12), (tJaw + 1.5, .55), (K["s8"], .8), (END, .8), (DUR - .3, 0), (DUR, 0)])

# ---------- metallophone ostinato (saron) on Hijaz degrees, one note per beat, 8-beat cycles
sar = M.mono()
PAT = [0, 2, 1, 0, 4, 3, 2, 1, 4, 5, 4, 2, 1, 2, 1, 0]
beats = np.arange(0.2, DUR, BEAT)
for i, b in enumerate(beats):
    if K["s4"] + .5 < b < AT["s5:wahyu"] + 1:
        if i % 2:  # sparser, lower during the illusions
            continue
    M.lay(sar, metal(hz(deg(PAT[i % 16]) - 12), 2.0), b, .16)
    if i % 4 == 3:  # gender-like upper answer
        M.lay(sar, metal(hz(deg(PAT[(i + 5) % 16])), 2.6, .7), b + BEAT / 2, .07)
# ---------- kendang
kd = M.mono()
for i, b in enumerate(beats):
    c = i % 8
    if c in (0, 5):
        M.lay(kd, dhung(), b, .32)
    if c in (2, 3, 6) or (c == 7 and i % 16 == 15):
        M.lay(kd, tak(), b + (BEAT / 2 if c == 3 else 0), .14)
kd_lvl = M.env([(0, 1), (K["s4"], 1), (K["s4"] + 1, .4), (AT["s5:Lemparkan"], .4), (AT["s5:Lemparkan"] + .5, 1.2), (tSuj - .3, 1), (tSuj + .3, 0), (tJaw + 1.5, 0), (tJaw + 3, .6), (K["s8"] + 2, .5), (END, .4), (DUR, 0)])
# ---------- gong ageng: every 8 beats and at the sujud
gg = M.mono()
for i, b in enumerate(beats):
    if i % 8 == 0:
        M.lay(gg, gong(), b, .22)
M.lay(gg, gong(9.0), tSuj, .45)
M.lay(gg, gong(9.0), AT["s1:bersujud"], .35)

# ---------- oud phrases (Hijaz)
od = M.mono()


def phrase(t0, notes, amp=.26, stretch=1.0):
    t = t0
    for d, b in notes:
        M.lay(od, oud(hz(deg(d)), max(.7, b + .6)), t, amp)
        t += b * stretch


phrase(.4, [(4, .4), (3, .3), (2, .3), (1, .45), (0, 1.2)], .22)
phrase(K["s2"] + .4, [(0, .3), (1, .3), (2, .6), (1, .3), (0, 1.0)], .24)
phrase(AT["s2:pagi"] - .2, [(2, .3), (3, .3), (4, .3), (5, .3), (4, 1.0)], .22)
phrase(K["s3"] + .3, [(4, .3), (5, .3), (6, .3), (7, .9)], .22)
phrase(AT["s3:bertanya"], [(7, .3), (6, .3), (5, .3), (4, .3), (3, .3), (2, .9)], .2)
phrase(AT["s4:Musa"], [(1, .5), (0, .5), (1, 1.4)], .2)
phrase(AT["s5:wahyu"] + .3, [(0, .35), (2, .35), (4, .35), (7, 1.6)], .26)
phrase(AT["s6:paham"], [(4, .3), (3, .3), (2, .3), (1, .3), (0, 1.4)], .22)
phrase(tJaw + .8, [(0, .45), (1, .45), (2, .45), (4, 1.6)], .24)
phrase(AT["s8:Kisah"] - .3, [(4, .4), (5, .3), (4, .3), (2, .4), (0, 1.8)], .24)

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = ((sar + .5 * kd * kd_lvl) * lvl + .6 * gg * np.maximum(lvl, .5) + od) * fin
music = stereo(music_m, (.12 * sar * lvl + .08 * od) * fin)

# ---------- foley
# blencong flame: a quiet hiss with soft crackles, nervous in fear and anger
hiss = M.band(rng.standard_normal(N), 1500, 7000); hiss /= np.abs(hiss).max()
M.fx += np.stack([hiss, np.roll(hiss, 400)], 1) * .006 * M.env([(0, 1), (DUR - .4, 1), (DUR, 0)])[:, None]
for x in rng.uniform(1, END, 40):
    g(M.band(M.burst(.03, 300, 1), 1500, 8000), x, rng.uniform(.01, .025))
for x in np.concatenate([rng.uniform(AT["s4:Musa"], AT["s4:Seorang"], 10), rng.uniform(tAng, tJaw, 12)]):
    g(M.band(M.burst(.06, 120, 1), 800, 6000), x, .03)
# cempala knocks (dalang's wooden knocker) on scene changes
knock = lambda: M.band(M.burst(.08, 90, 1), 400, 3500) + .5 * M.tone([820, 1240], .08, 60)
for k in ["s2", "s3", "s4", "s5", "s6", "s7", "s8"]:
    g(knock(), K[k] - .15, .07); g(knock(), K[k] + .05, .05)
# gunungan passes: leather flap + whoosh
flap = lambda: M.band(M.burst(.35, 14, 4), 150, 2500)
g(flap(), K["s2"] - .7, .12); g(M.lib("whoosh-cinematic"), K["s2"] - .75, .05)
g(flap(), K["s8"] - .1, .1); g(M.lib("whoosh"), K["s8"] - .1, .035)
# magicians' bows (soft leather brushes)
for i in range(5):
    g(M.band(M.burst(.25, 18, 6), 300, 3000), AT["s1:bersujud"] - .3 + i * .12, .03)
    g(M.band(M.burst(.25, 18, 6), 300, 3000), tSuj - .25 + i * .14, .035)
# walking in (s3)
for i in range(14):
    g(M.band(M.burst(.05, 90, 2), 300, 2500), K["s3"] + .1 + i * .19, .02)
# rope rustle while the illusions crawl
r0, r1 = K["s4"] + .35, AT["s5:Tongkat"] + 1.5
L = int((r1 - r0) * SR)
rus = M.band(rng.standard_normal(L), 900, 6000) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.7 * n(r1 - r0)) * np.sin(2 * np.pi * .43 * n(r1 - r0)))
rus /= np.abs(rus).max()
re = np.interp(n(r1 - r0), [0, .6, (AT["s5:Tongkat"] - r0), (AT["s5:buat"] - r0), r1 - r0], [0, 1, .9, .1, 0])
g(np.stack([rus * re, np.roll(rus, 600) * re], 1), r0, .03)
for x in np.arange(K["s4"] + .35, K["s4"] + 1.2, .13):
    g(M.band(M.burst(.08, 40, 2), 250, 3000), x, .04)  # ropes landing
# throw + swallow
g(M.lib("whoosh-short"), AT["s5:Lemparkan"] + .2, .05)
g(M.thump(.5), AT["s5:Tongkat"] - .5, .1)
sw0 = AT["s5:Tongkat"]
sd = 2.6
t = n(sd)
sweep = np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, sd], [120, 38])) / SR) * np.interp(t, [0, .3, sd * .7, sd], [0, 1, .8, 0])
gul = M.band(rng.standard_normal(len(t)), 60, 900) * np.interp(t, [0, .4, sd], [0, 1, 0])
g(sweep * .5 + gul * .25, sw0, .5)
g(M.lib("whoosh-cinematic"), sw0 - .1, .06); g(M.lib("impact-bass-1"), AT["s5:buat"], .08)
# Firaun's anger: low rumble swell, cut on the reply
rd = tJaw - tAng + .6
rum = M.band(rng.standard_normal(int(rd * SR)), 25, 140); rum /= np.abs(rum).max()
g(rum * np.interp(n(rd), [0, 1.2, rd - .8, rd], [0, 1, 1, 0]), tAng - .1, .12)
g(M.lib("impact-bass-1"), AT["s7:mengancam"], .06)
# sign-off
g(M.lib("chime"), AT["s8:AUDIRA"], .03)
g(M.lib("whoosh"), OUT - .2, .03); g(M.lib("chime"), OUT + .3, .045)
M.finish(music)
print("duration", DUR)
