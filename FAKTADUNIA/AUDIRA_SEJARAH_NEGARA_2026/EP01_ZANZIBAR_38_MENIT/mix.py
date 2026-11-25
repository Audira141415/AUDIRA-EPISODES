"""EP01 sound: low string drone in C minor with a ticking clock that tightens toward 09:00, silence at the deadline,
then the bombardment (booms keyed to the same shot list the 3D world draws), fire crackle, and a sparse cello afterwards. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1896)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, OUT, SHOTS = B["AT"], B["outroAt"], B["K"]["shots"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
K = {x: s(x)["start"] for x in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")}
u0, u1 = AT["s4:Ultimatumnya"], AT["s4:sembilan"]
fire0, cease, burnt, gl, fall = AT["s5:meriam"], AT["s6:berhenti"], AT["s5:terbakar"], AT["s5:ditenggelamkan"], AT["s6:jatuh"]

# strings: detuned saw stacks, slow bow swell, band-limited so they sit under a voice
def bow(f, det=.0):
    return sum(np.sin(2 * np.pi * (f + det) * h * T + h * 1.3) / h for h in range(1, 8)) * (1 + .08 * np.sin(2 * np.pi * 5.2 * T))
low = M.band(bow(65.41) + bow(65.41, .25) + .7 * bow(77.78, .15) + .5 * bow(98.0, -.2), 40, 700); low /= np.abs(low).max()
high = M.band(bow(261.6, .4) + .8 * bow(311.1, -.3) + .6 * bow(392.0, .2), 200, 2200); high /= np.abs(high).max()
trem = (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 7.5 * T)))  # string tremolo for the ultimatum
air = M.band(rng.standard_normal(N), 700, 3000); air /= np.abs(air).max()
el = M.env([(0, .7), (K["s2"], .55), (K["s3"], .75), (u0, .9), (u1, 1.25), (u1 + .15, 0), (fire0 - .1, 0), (fire0, 1.0), (cease, 1.0), (cease + 2, .45), (K["s8"], .55), (END, .5), (DUR - .3, 0), (DUR, 0)])
eh = M.env([(0, 0), (K["s3"], .25), (u0, .5), (u1, 1), (u1 + .1, 0), (cease + 1, 0), (K["s8"], .35), (END, .3), (DUR, 0)])
music = stereo(.6 * low * el + .32 * high * eh * np.where((T > u0) & (T < u1 + .1), trem, 1) + .03 * air, .06 * high * eh)

# sparse cello after the shelling: four long notes
for t0, f in ((cease + 2.5, 65.41), (K["s7"] + .5, 58.27), (K["s8"] + .3, 51.91), (AT["s8:kolonial"], 49.0)):
    n = M.note(f, 4.5, "saw", .35, .4)
    M.lay(music[:, 0], n, t0, .12); M.lay(music[:, 1], n, t0 + .01, .12)

def tick(t, a, hi=True):
    g(M.band(M.burst(.03, 160, 1), 2500, 9000), t, a); g(M.tone((3100 if hi else 2300,), .03, 120), t, a * .6)
# hook: the clock races (ticks accelerate) up to the word 38
a38 = AT["s1:menit"]; t = .3; k = 0
while t < a38:
    tick(t, .05, k % 2 == 0); k += 1; t += max(.07, .5 - .45 * (t / a38))
g(M.lib("impact-bass-1"), a38, .15); g(M.thump(.5), a38, .25)
# ultimatum: tick-tock tightening to 09:00, then dead air
t, k = u0, 0
while t < u1 - .05:
    x = (t - u0) / (u1 - u0); tick(t, .05 + .07 * x, k % 2 == 0); k += 1; t += .5 - .22 * x
g(M.tone((880, 1320, 1760), 1.6, 2.2), u1, .07); g(M.thump(.5), u1, .2)

# chart and harbour cues
g(M.lib("whoosh-cinematic"), K["s2"] - .3, .06)
g(M.lib("ping"), AT["s2:Zanzibar"], .06)
g(M.lib("click"), AT["s2:1890"], .06); g(M.lib("click"), AT["s2:Artinya"], .05)
g(M.lib("riser"), K["s3"] - 1.6, .035); g(M.lib("whoosh"), K["s3"] - .2, .05)
g(M.thump(.6), AT["s3:Sultan"], .14)
g(M.lib("click-soft"), AT["s3:Khalid"], .06)
for i in range(4):  # flag halyard
    g(M.tone((520 + i * 40,), .06, 40), AT["s3:masuk"] + i * .22, .02)
g(M.lib("whoosh"), K["s4"] - .25, .05); g(M.lib("pop"), AT["s4:2.800"], .05)
for i in range(5):
    g(M.lib("click"), AT["s4:lima"] + i * .16, .04)
g(M.lib("click"), AT["s4:turunkan"], .06); g(M.lib("click"), AT["s4:tinggalkan"], .06)
# harbour ambience: water lap and gulls-free wind, under everything at harbour scale
lap = M.band(rng.standard_normal(N), 80, 600); lap /= np.abs(lap).max()
le = M.env([(0, 0), (K["s3"] + 4, 0), (K["s3"] + 6, 1), (K["s7"], 1), (K["s7"] + 2, 0), (K["s8"] + 2, 0), (K["s8"] + 4, .7), (DUR - .3, 0), (DUR, 0)])
M.fx += np.stack([lap, np.roll(lap, 300)], 1) * (le * .035 * (1 + .3 * np.sin(T * .9)))[:, None]

# the bombardment: boom at each launch, crack at each impact (0.5 s later), same list the world draws
for ts, si, tg, sd in SHOTS:
    d = .7 if si == 0 else .55
    g(M.thump(d), ts, .22 + .05 * (si == 0)); g(M.band(M.burst(.6, 7, 3), 40, 900), ts, .09)
    g(M.band(M.burst(.25, 25, 1), 1200, 7000), ts + .5, .06); g(M.thump(.35), ts + .5, .12)
g(M.lib("impact-bass-1"), fire0, .2)
cr = M.band(rng.standard_normal(N), 1500, 6000) * (rng.random(N) > .9985) * 30
cr = np.convolve(cr, np.ones(40) / 40, mode="same")
roar = M.band(rng.standard_normal(N), 50, 500); roar /= np.abs(roar).max()
fe = M.env([(0, 0), (AT["s5:Istana"], 0), (burnt, 1), (cease + 2, .7), (K["s7"], .25), (K["s7"] + 2, 0), (K["s8"] + 3, 0), (K["s8"] + 5, .2), (DUR - .3, 0), (DUR, 0)])
M.fx += np.stack([(cr * .5 + roar * .06) * fe, (np.roll(cr, 900) * .5 + np.roll(roar, 400) * .06) * fe], 1)
# Glasgow goes under: groan and a long bubble wash
g(M.tone((55, 82), 2.2, .9), gl - .3, .12); g(M.band(M.burst(2.5, 1.2, 2), 100, 1400), gl, .06)
# flag shot away, then the guns stop and the silence is the point
g(M.lib("impact-bass-1"), fall - .15, .14); g(M.lib("whoosh-short"), fall, .05)
g(M.tone((1046.5, 1568), 2.5, 1.4), cease + .3, .04)
g(M.lib("click"), AT["s6:38"], .07); g(M.thump(.5), AT["s6:38"], .16); g(M.lib("click"), AT["s6:45"], .07)
g(M.thump(.4), AT["s6:lima"], .14); g(M.lib("click-soft"), AT["s6:satu"], .07)
g(M.lib("whoosh-cinematic"), K["s7"] - .2, .05); g(M.lib("riser"), AT["s7:daratan"] - 1.2, .03)
g(M.thump(.5), AT["s7:berdaulat"], .16)
g(M.lib("whoosh-cinematic"), K["s8"] - .3, .05); g(M.lib("pop"), AT["s8:Menurut"], .05)
# closing card opens like a radar contact
g(M.lib("ping"), OUT, .06); g(M.lib("chime"), OUT + .3, .07)
M.finish(music)
print("duration", DUR, "shots", len(SHOTS))
