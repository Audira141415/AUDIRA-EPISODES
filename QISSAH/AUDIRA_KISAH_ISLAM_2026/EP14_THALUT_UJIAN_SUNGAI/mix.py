"""EP14 sound: D Rast (D E F#- G A B C# D, the third and seventh a quarter-tone low). A plucked lute (oud-like, short
decays, light tremolo on long notes) carries the melody; a chiptune pulse-square doubles it an octave up, very quiet,
for the pixel world; a soft frame drum (doum on 1, tek on the off-beats) marks a march at 84 bpm. River ambience under
the whole film, march steps in s1 and s4, splashes and sparkles on the drinking, a low rumble for Jalut's army.
Music dips for a voice later via M.finish. Run from this folder."""
import json, os, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

os.makedirs("AUDIO/work", exist_ok=True)
os.makedirs("PROJECT/HyperFrames_Remotion/assets/audio", exist_ok=True)
M = Mix(1414)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, K = B["AT"], B["outroAt"], B["K"]
g = M.put
END = M.TL["speech_end"]
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
RAST = [0, 2, 3.5, 5, 7, 9, 10.5, 12]   # quarter-tone third and seventh
D = 50
BPM = 84
BEAT = 60 / BPM


def oud(f, dur, amp=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t + h) * np.exp(-t * (3.2 + 1.6 * h)) / h ** 1.1 for h in range(1, 8))
    x += .25 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 6)
    trem = 1 + (.3 * np.sin(2 * np.pi * 11 * t) * (t > .35)) if dur > .9 else 1
    return amp * x * trem * np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .03)


def chip(f, dur):
    t = np.arange(int(dur * SR)) / SR
    x = np.where((t * f) % 1 < .25, 1.0, -1.0) * .5
    return x * np.exp(-t * 3) * np.minimum(1, (dur - t) / .01)


def deg(d, octv=0):
    return mid(D + 12 * octv + RAST[d % 7] + 12 * (d // 7))


lute = M.mono()
chipb = M.mono()


def phrase(t0, notes, beat=BEAT, octv=1, amp=.5, ch=True):
    t = t0
    for d, b in notes:
        if d is not None:
            M.lay(lute, oud(deg(d, octv), b * beat + .25, amp), t)
            if ch:
                M.lay(chipb, chip(deg(d, octv + 1), min(.3, b * beat)), t, .12)
        t += b * beat
    return t


# melodies per scene (Rast: tonic D, rising to A, resting on G and D)
phrase(0.2, [(0, 1), (1, .5), (2, .5), (3, 1), (4, 2), (3, .5), (2, .5), (1, 1), (0, 2)])
phrase(4.6, [(4, 1), (5, .5), (4, .5), (3, 1), (2, 1), (1, 2)])
phrase(K["s2"] + .4, [(0, 2), (2, 1), (3, 1), (4, 3), (3, 1), (2, 2)], amp=.4)
phrase(K["s2"] + 7.5, [(4, 1), (6, 1), (7, 2), (6, 1), (4, 1), (3, 3)], amp=.4)
phrase(K["s3"] + .5, [(7, 2), (6, 1), (5, 1), (4, 2), (5, 1), (4, 1), (3, 3)], amp=.42)
phrase(AT["s3:ketenangan"] - .2, [(0, 2), (4, 2), (7, 4)], amp=.38, ch=False)
phrase(K["s4"] + .3, [(0, 1), (0, .5), (1, .5), (2, 1), (3, 1), (4, 1), (4, .5), (5, .5), (4, 1), (3, 1)], amp=.45)
phrase(K["s4"] + 6, [(4, 1), (3, 1), (2, 1), (1, 1), (2, 2), (0, 2)], amp=.42)
phrase(K["s5"] + .3, [(4, 1), (2, 1), (1, 1), (0, 3)], amp=.38)
phrase(AT["s5:menyeberang"], [(0, 1), (2, 1), (4, 2)], amp=.42)
phrase(AT["s5:Melihat"], [(1, 2), (0, 2), (-1, 4)], octv=0, amp=.4, ch=False)
phrase(K["s6"] + .5, [(0, 2), (2, 1), (3, 1), (4, 2), (5, 1), (6, 1), (7, 4)], amp=.42)
phrase(K["s7"] + .3, [(4, 2), (3, 1), (2, 1), (3, 2), (0, 4)], amp=.36, ch=False)
phrase(AT["s7:menang"] - .1, [(0, .5), (2, .5), (4, .5), (7, 1.5), (6, .5), (7, 2)], amp=.5)
phrase(AT["s7:Kelak"], [(4, 1), (5, 1), (7, 3)], amp=.42)
phrase(K["s8"] + .4, [(4, 2), (3, 1), (2, 1), (1, 2), (0, 4)], amp=.36, ch=False)
phrase(AT["s8:Kalau"] + .2, [(0, 1), (2, 1), (4, 2), (3, 1), (2, 1), (0, 4)], amp=.34, ch=False)

# drone: D + A, soft sine stack
drone = M.mono()
for f, a in ((mid(D - 12), .5), (mid(D - 5), .25), (mid(D), .15)):
    drone += a * np.sin(2 * np.pi * f * T) * (1 + .1 * np.sin(2 * np.pi * .2 * T))
drone *= M.env([(0, .5), (K["s5"], .6), (AT["s5:Melihat"], 1.0), (K["s6"] + 2, .8), (K["s8"], .6), (DUR - .4, 0), (DUR, 0)])

# frame drum: doum (low) on beat 1 and 3, tek on the off-beats; marching sections stronger
def doum():
    t = np.arange(int(.35 * SR)) / SR
    return np.sin(2 * np.pi * (75 * t + 50 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 11)


def tek():
    return M.band(M.burst(.08, 70, 1), 1500, 6000)


DM, TK = doum(), tek()
drum = M.mono()
for t in np.arange(0.1, END, BEAT):
    i = round((t - .1) / BEAT) % 4
    if i in (0, 2):
        M.lay(drum, DM, t, .8 if i == 0 else .55)
    M.lay(drum, TK, t + BEAT / 2, .35)
de = M.env([(0, .9), (K["s2"] - .1, .9), (K["s2"], .25), (K["s4"] - .1, .25), (K["s4"], 1.0), (K["s5"], .7), (AT["s5:Melihat"], .4), (K["s6"], .35), (K["s7"], .5), (AT["s7:menang"], 1.0), (K["s8"], .2), (END, .1), (END + .5, 0), (DUR, 0)])
drum *= de

fin = M.env([(0, 1), (END + .3, 1), (DUR - .3, 0), (DUR, 0)])
music_m = (lute + chipb + drone * .25 + drum * .6) * fin
music = stereo(music_m, (.25 * lute - .2 * chipb) * fin)

# ---------- ambience: river runs through the film
river = M.band(rng.standard_normal(N), 300, 5000) * (1 + .4 * np.sin(2 * np.pi * .23 * T) * np.sin(2 * np.pi * .07 * T + 2)); river /= np.abs(river).max()
re = M.env([(0, .9), (K["s2"] - .05, .9), (K["s2"], .25), (K["s4"], .3), (AT["s4:sungai"], .9), (K["s5"], 1.0), (AT["s5:Melihat"], .5), (K["s6"], .45), (K["s8"], 1.0), (AT["s8:Kisah"], .5), (DUR - .4, 0), (DUR, 0)])
M.fx += np.stack([river * re * .035, np.roll(river, 1500) * re * .035], 1)
# camp fire crackle in s2
crk = M.band(M.burst(.02, 200, 1), 1500, 8000)
for x in rng.uniform(K["s2"], K["s3"] + 3, 260):
    g(crk, x, .02 * rng.uniform(.3, 1))
# march steps (s1 hook and s4)
stp = M.band(M.burst(.06, 50, 1), 200, 2500)
for a, b in ((0.1, 6.0), (K["s4"] + 1.2, AT["s4:sungai"] + 2.5)):
    for x in np.arange(a, b, BEAT / 2):
        for k in range(3):
            g(stp, x + rng.uniform(0, .07), .018)
# ox cart wheels creak in s3
for x in np.arange(K["s3"] - .3, AT["s3:Tabut"] + .4, .62):
    g(M.band(M.burst(.18, 14, 3), 400, 1800), x, .02)
# drinking: splashes and sparkles
spl = lambda: M.band(M.burst(.25, 18, 2), 600, 6000)
for x in np.arange(AT["s1:minum"] - .2, AT["s1:minum"] + 2.4, .12):
    g(spl(), x + rng.uniform(0, .08), .025)
for x in np.arange(AT["s5:Hampir"], AT["s5:Hampir"] + 2.6, .07):
    g(spl(), x + rng.uniform(0, .06), .03)
g(M.lib("sparkle"), AT["s1:minum"], .03); g(M.lib("sparkle"), AT["s5:minum"], .035)
g(spl(), AT["s4:menciduk"], .05); g(M.lib("ping"), AT["s4:seciduk"], .03)
# wading across
for x in np.arange(AT["s5:menahan"] + .4, AT["s5:menahan"] + 3.6, .3):
    g(M.band(M.burst(.3, 10, 3), 300, 3000), x, .03)
# Jalut's army: low rumble from the reveal to the fall
rum = M.band(rng.standard_normal(N), 30, 220); rum /= np.abs(rum).max()
rue = M.env([(0, 0), (AT["s5:Melihat"] - .3, 0), (AT["s5:Jalut"], .9), (K["s6"], .6), (K["s7"], .5), (AT["s7:mengalahkan"], .7), (AT["s7:mengalahkan"] + 2.5, 0), (DUR, 0)])
M.fx += np.stack([rum * rue * .12, np.roll(rum, 600) * rue * .12], 1)

# ---------- events
for p in ["s2", "s2:Allah", "s3", "s4", "s5", "s5:Melihat", "s6", "s7", "s7:Lalu", "s8", "s8:Kisah"]:
    tp = AT.get(p, K.get(p))
    g(M.lib("whoosh-short"), tp - .25, .03)
    for k in range(4):                         # pixel dissolve blips
        g(M.tone((1200 + 300 * k,), .03, 40), tp - .14 + k * .045, .012)
for p in ["s2:pemuka", "s3:Tanda", "s4:berkata", "s5:kami", "s6:betapa", "s7:limpahkan", "s8:Kalau"]:
    g(M.lib("click-soft"), AT[p], .04)
g(M.lib("impact-bass-1"), 0.1, .1)
g(M.lib("chime"), AT["s1:sedikit"], .04)
g(M.lib("chime"), AT["s2:Thalut"], .045)
g(M.lib("pop"), AT["s2:protes"], .04)
g(M.lib("pop"), AT["s2:ilmu"], .03); g(M.lib("pop"), AT["s2:fisik"], .03)
g(M.lib("riser"), AT["s3:Tabut"] - 1.6, .025); g(M.lib("sparkle"), AT["s3:ketenangan"], .04)
g(M.lib("pop"), AT["s5:kami"], .03)
g(M.lib("riser"), AT["s7:Dawud"] - 1.2, .03)
g(M.band(M.burst(.6, 6, 1), 2000, 9000), AT["s7:Dawud"], .05)          # stone whistles
g(M.lib("impact-bass-1"), AT["s7:mengalahkan"] + .25, .16)
g(M.thump(.5), AT["s7:mengalahkan"] + 1.35, .2)                        # the fall lands
g(M.lib("chime"), AT["s7:kerajaan"], .05); g(M.lib("sparkle"), AT["s7:hikmah"], .04)
g(M.lib("ping"), AT["s8:seteguk"] + .45, .04); g(spl(), AT["s8:seteguk"] + .45, .03)
g(M.lib("whoosh"), OUT - .2, .04); g(M.lib("chime"), OUT + .3, .06)
M.finish(music)
print("duration", DUR)
