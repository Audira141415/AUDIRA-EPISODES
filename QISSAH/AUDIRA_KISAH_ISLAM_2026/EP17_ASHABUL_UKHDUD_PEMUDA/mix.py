"""EP17 sound: maqam Saba on D (D, E half-flat, F, G-flat, A, B-flat, C), 70 bpm. A plucked oud (risha tremolo on long
notes) over a soft daf (frame drum: deep dum, dry tak with jingle shimmer) and a low drone. Saba is the maqam of grief and
longing, fitting a story of a youth who gives his life. Scriptorium foley: quill scratches on every inked reveal, page rustle
on every page turn, candle room tone. Story beats: s4 a soft low rumble for the beast (no growl), a stone tick; s5 a rock
tremor and sea swell; s6 a single low bell when the youth dies, then a rising pad (no voices) while the crowd believes;
s7 soft fire crackle under a sparse oud; s8 warm resolve. Music dips for a voice later via M.finish. Run from this folder."""
import json, sys, os
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(1717)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
SABA = [0, 1.5, 3, 4, 7, 8, 10]          # D, E half-flat, F, G-flat, A, B-flat, C (quarter tone on the 2nd)
ROOT = 50                                 # D3
BEAT = 60 / 70
deg = lambda d, o=0: ROOT + o + SABA[d % 7] + 12 * (d // 7)

TW = AT["s6:wafat"]
TB = AT["s6:Orang-orang"]


def oud(f, dur=1.6, dec=3.2):
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for h in range(1, 10):
        x += np.sin(2 * np.pi * f * h * 1.0007 ** h * t) * np.exp(-t * dec * (0.6 + 0.55 * h)) / h ** 1.1
    body = np.sin(2 * np.pi * 110 * t) * np.exp(-t * 18) * .25
    pick = M.band(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 160) * .25
    return (x + body + pick) * np.minimum(1, t / .002)


def risha(f, dur, rate=11, amp=1.0):
    """Oud tremolo: fast repeated plucks for a sustained note."""
    out = np.zeros(int((dur + 1.2) * SR))
    k = 0
    while k / rate < dur:
        s = oud(f, .5, 6) * (0.8 + 0.2 * (k % 2))
        i = int(k / rate * SR); e = min(len(out), i + len(s)); out[i:e] += s[: e - i]; k += 1
    return out * amp * .55


def drone(fs, dur, att=2.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * t + .4 * np.sin(2 * np.pi * .13 * t)) + .4 * np.sin(2 * np.pi * f * 2.003 * t) + .15 * np.sin(2 * np.pi * f * 3 * t) for f in fs) / len(fs)
    return x * np.minimum(1, t / att) * np.minimum(1, (dur - t) / 1.6)


def pad(fs, dur, att=2.5):
    t = np.arange(int(dur * SR)) / SR
    x = sum(sum(np.sin(2 * np.pi * f * dt * t + ph) for dt, ph in ((1, 0), (1.004, 1.1), (.996, 2.3))) for f in fs) / (3 * len(fs))
    lfo = .75 + .25 * np.sin(2 * np.pi * .18 * t)
    return x * lfo * np.minimum(1, t / att) * np.minimum(1, (dur - t) / 2.0)


# ---------- drone: D + A, colour notes per scene
dr = M.mono()
plan = [(0, [deg(0, -12), deg(4, -12)]), (K["s3"], [deg(0, -12), deg(4, -12)]), (K["s5"], [deg(0, -12), deg(5, -12)]), (K["s6"], [deg(0, -12), deg(4, -12)]),
        (K["s7"], [deg(0, -12), deg(3, -12)]), (K["s8"], [deg(0, -12), deg(4, -12)])]
for i, (t0, ns) in enumerate(plan):
    t1 = plan[i + 1][0] if i + 1 < len(plan) else DUR
    M.lay(dr, drone([mid(n) for n in ns], t1 - t0 + 2.0), max(0, t0 - .6), 1.0)
dr *= M.env([(0, .5), (K["s6"], .5), (TW - .3, .2), (TW + 1, .5), (K["s7"], .55), (K["s8"], .5), (END, .5), (DUR - .3, 0), (DUR, 0)])

# ---------- oud phrases
od = M.mono()


def phrase(t0, t1, degs, step=1.0, o=0, amp=.32, held=()):
    t, i = t0, 0
    while t < t1:
        d = degs[i % len(degs)]
        if d is not None:
            if i % len(degs) in held:
                M.lay(od, risha(mid(deg(d, o)), step * BEAT * .9), t, amp * .8)
            else:
                M.lay(od, oud(mid(deg(d, o))), t, amp * (1 if i % 4 == 0 else .75))
        t += step * BEAT; i += 1


# s1 hook: a slow lament, held tremolo on the 3rd
phrase(0.3, K["s2"] - .3, [0, 1, 2, None, 2, 1, 0, None], .5, 0, .34, held=(2,))
# s2 the verse: sparse, reverent
phrase(K["s2"] + .3, K["s3"] - .4, [4, None, 3, None, 2, None, 1, 0], .5, 0, .26, held=(0,))
# s3 the palace and the monk: walking line
phrase(K["s3"] + .2, K["s4"] - .4, [0, 2, 1, 2, 3, 2, 1, 0], .5, 0, .28)
# s4 beast and healing: lower, then a rising answer at the healing
phrase(K["s4"] + .2, AT["s4:terbuka"], [0, None, 1, 0, -1, None, 0, None], .5, -12, .32)
phrase(AT["s4:terbuka"] + .2, K["s5"] - .4, [2, 3, 4, None, 4, 5, 4, 2], .5, 0, .27, held=(3,))
# s5 tension: the G-flat colour, repeated
phrase(K["s5"] + .2, K["s6"] - .4, [0, 3, 2, 3, 1, 3, 2, None], .5, -12, .3)
# s6 the field: a slow line that stops at the death
phrase(K["s6"] + .2, TW - .4, [4, None, 3, 2, None, 1, 0, None], .5, 0, .26, held=(0,))
# after the crowd believes: a rising line in the upper register
for k, d in enumerate([0, 1, 2, 3, 4, 5, 6, 7]):
    M.lay(od, risha(mid(deg(d)), .9), TB + .6 + k * .52, .2)
# s7 trenches: sparse low oud
phrase(K["s7"] + .3, K["s8"] - .3, [0, None, None, 1, None, None, 0, None], .5, -12, .3)
# s8 resolve
phrase(K["s8"] + .3, END - 2.2, [4, 3, 2, 1, 2, 3, 2, 0], .5, 0, .24, held=(7,))
for k, d in enumerate([2, 1, 0]):
    M.lay(od, oud(mid(deg(d)), 2.6, 1.8), END - 1.9 + k * .6, .3)

# ---------- daf: dum on beat 1, tak on 3 and the "and" of 4; silent at the death, sparse in s7
daf = M.mono()


def dum(a=1.0):
    n = int(.6 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * (62 * t + 30 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 7) + .15 * M.band(rng.standard_normal(n), 80, 400) * np.exp(-t * 25)) * a


def tak(a=1.0):
    n = int(.4 * SR); t = np.arange(n) / SR
    slap = M.band(rng.standard_normal(n), 900, 4000) * np.exp(-t * 60)
    jing = M.band(rng.standard_normal(n), 5500, 11000) * np.exp(-t * 9) * .5
    return (slap + jing) * a


bar = BEAT * 4
for t0 in np.arange(K["s1"] + 1.0, END + 1.0, bar):
    if TW - 1.0 < t0 < TB + 1.0:
        continue
    sparse = K["s7"] <= t0 < K["s8"] or K["s2"] <= t0 < K["s3"]
    M.lay(daf, dum(.9), t0, 1.0)
    if not sparse:
        M.lay(daf, tak(.5), t0 + 2 * BEAT, 1.0)
        M.lay(daf, tak(.35), t0 + 3.5 * BEAT, 1.0)
        M.lay(daf, dum(.5), t0 + 3 * BEAT, 1.0)
daf *= M.env([(0, 0), (K["s1"] + .8, .9), (K["s6"], .9), (TW - .5, .4), (TW, 0), (TB + .8, 0), (TB + 2, .7), (K["s7"], .6), (K["s8"], .7), (END - 1, .6), (END + .5, 0), (DUR, 0)])

# ---------- rising pad while the crowd believes (no voices)
pd = M.mono()
M.lay(pd, pad([mid(n) for n in (deg(0), deg(4), deg(7), deg(9))], 18), TB - .4, 1.0)
M.lay(pd, pad([mid(n) for n in (deg(0), deg(2), deg(4), deg(7))], 16), K["s8"] - .5, .8)
pd *= M.env([(0, 0), (TB - .4, 0), (TB + 4, .9), (K["s7"] - .5, .7), (K["s7"] + 1, .2), (K["s8"] - .5, .3), (K["s8"] + 3, .7), (END, .7), (DUR - .3, 0), (DUR, 0)])

fin = M.env([(0, 1), (END + .4, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (dr * .4 + od + daf * .32 + pd * .5) * fin
music = stereo(music_m, (.22 * od - .08 * dr + .12 * pd) * fin)

# ---------- ambience: candle room tone; s5 sea swell; s7 crackle
room = M.band(rng.standard_normal(N), 40, 300); room /= np.abs(room).max()
M.fx += np.stack([room * .012, np.roll(room, 1300) * .012], 1)
sea = M.band(rng.standard_normal(N), 200, 1800); sea /= np.abs(sea).max()
sw = (0.6 + 0.4 * np.sin(2 * np.pi * .23 * T)) * M.env([(0, 0), (AT["s5:gunung"] + .6, 0), (AT["s5:laut"] - .3, .9), (AT["s5:Lalu"] + 1, .6), (K["s6"], 0), (DUR, 0)])
M.fx += np.stack([sea * sw * .03, np.roll(sea, 900) * sw * .03], 1)


def crackle(t0, t1, a):
    for x in np.arange(t0, t1, .045):
        if rng.random() < .55:
            g(M.band(M.burst(.025, 140, 1), 1200, 7000), x + rng.uniform(0, .04), a * rng.uniform(.2, 1))


fire = M.band(rng.standard_normal(N), 80, 900); fire /= np.abs(fire).max()
fe = M.env([(0, 0), (AT["s7:menggali"], 0), (AT["s7:parit-parit"] + .8, .7), (AT["s7:Al-Qur'an"], .5), (K["s8"] + 1, .1), (K["s8"] + 3, 0), (DUR, 0)])
M.fx += np.stack([fire * fe * .03, np.roll(fire, 700) * fe * .03], 1)
crackle(AT["s7:parit-parit"] + .3, K["s8"] + 1.5, .02)

# ---------- scriptorium foley


def quill(t, d=.45, a=.03):
    n = int(d * SR); tt = np.arange(n) / SR
    x = M.band(rng.standard_normal(n), 2500, 9000)
    strokes = np.clip(np.sin(2 * np.pi * (6 + 3 * rng.random()) * tt), 0, 1) ** 2
    g(x * strokes * np.sin(np.pi * tt / d) / max(1e-6, np.abs(x).max()), t, a)


def rustle(t, d=.9, a=.06):
    n = int(d * SR); tt = np.arange(n) / SR
    x = M.band(rng.standard_normal(n), 1200, 7000)
    env = np.sin(np.pi * tt / d) ** 1.5 * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 9 * tt)))
    g(x * env / max(1e-6, np.abs(x).max()), t, a)
    for _ in range(5):
        g(M.band(M.burst(.03, 90, 1), 2000, 8000), t + rng.uniform(.1, d * .9), a * .5)


# page turns (3D leaf at scene changes) and panel leaves
for s in ["s2", "s3", "s4", "s5", "s6", "s7"]:
    rustle(K[s] - .75, 1.1, .07)
for p in ["s2:Kisah", "s3:Di", "s4:Ia", "s5:Lalu", "s6:Raja", "s7:Al-Qur'an", "s8"]:
    tp = AT.get(p, K.get(p))
    rustle(tp - .4, .6, .04)
# quill on every inked reveal
for p in ["s1:beriman", "s2:menyebut", "s2:parit", "s2:berapi", "s2:hanya", "s2:Muslim", "s3:penyihir", "s3:pemuda", "s3:iman", "s4:melempar", "s4:terbuka", "s4:bukan",
          "s5:gunung", "s5:laut", "s5:gagal", "s5:kamu", "s6:lapangan", "s6:dengan", "s6:Orang-orang", "s7:memaksa", "s7:teguh", "s7:Allah", "s8:keyakinan", "s8:Menurut"]:
    if p in AT:
        quill(AT[p], .5, .028)
# hook
g(M.lib("chime"), AT["s1:pemuda"] + .1, .035)
g(M.lib("sparkle"), AT["s1:beriman"] + .1, .04)
# s2 fire band
g(M.thump(.5), AT["s2:parit"], .05)
# s4 beast: low soft rumble, stone tick, the beast falls back; healing sparkle
rum = M.band(rng.standard_normal(int(2.2 * SR)), 40, 180); rum = rum / np.abs(rum).max() * np.sin(np.pi * np.arange(len(rum)) / len(rum))
g(rum, AT["s4:binatang"] - .2, .09)
g(M.tone((2400, 3100), .06, 60), AT["s4:berdoa"] + .1, .05)
g(M.thump(.45), AT["s4:terbuka"] - .5, .08)
g(M.lib("chime"), AT["s4:terbuka"], .03)
g(M.lib("sparkle"), AT["s4:menyembuhkan"] + .3, .035)
# s5 anger, tremor, the boat tips
g(M.thump(.5), AT["s5:murka"], .07)
trem = M.band(rng.standard_normal(int(1.4 * SR)), 30, 140); trem = trem / np.abs(trem).max() * np.sin(np.pi * np.arange(len(trem)) / len(trem))
g(trem, AT["s5:gunung"] - .1, .14)
for k in range(10):
    g(M.band(M.burst(.05, 60, 1), 300, 2000), AT["s5:gunung"] + .2 + k * .09 + rng.uniform(0, .05), .015)
splash = M.band(rng.standard_normal(int(1.2 * SR)), 400, 5000); splash = splash / np.abs(splash).max() * np.exp(-np.arange(len(splash)) / SR * 3)
g(splash, AT["s5:laut"] + .6, .05)
g(M.lib("impact-bass-1"), AT["s5:gagal"], .07)
# s6 the gold line, a single low bell at the death, then the crowd
g(M.lib("whoosh-short"), AT["s6:Raja"] + .4, .03)
bt = np.arange(int(7 * SR)) / SR
bell = sum(a * np.sin(2 * np.pi * 73.4 * r * bt) * np.exp(-bt * d) for r, a, d in ((1, 1, .45), (2.0, .5, .7), (2.42, .4, .9), (3.0, .25, 1.1), (4.2, .18, 1.6), (5.4, .1, 2.2)))
bell = bell * np.minimum(1, bt / .004)
g(bell / np.abs(bell).max(), TW, .2)
g(M.lib("riser"), TB - .3, .025)
g(M.lib("sparkle"), TB + .4, .04)
# s7 trenches
g(M.thump(.45), AT["s7:menggali"], .07)
g(M.lib("whoosh"), AT["s7:parit-parit"] + .3, .03)
g(M.lib("chime"), AT["s7:teguh"], .035)
# s8 spread and sign-off
g(M.lib("sparkle"), AT["s8:keyakinan"], .04)
g(M.lib("chime"), AT["s8:AUDIRA"], .04)
rustle(OUT - .3, .9, .05)
g(M.lib("chime"), OUT + .3, .045)
M.finish(music)
print("duration", DUR)
