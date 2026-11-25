"""EP17 sound: an architectural, airy bed for a 1 km tower. A slow open-fifth pad in D that climbs a step each time the
tower grows, soft felt-piano-like plucks on a whole-tone-free D Mixolydian set, a sub bloom when the model stands up,
deep ground rumble under the foundation, metallic construction tings at the crown, a hissing tunnel wind in s6 and
a rising lift whoosh in s7. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo
from sound_extra import lowpass, norm, drone, swell, metal, rumble

M = Mix(1717)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K = B["AT"], B["K"]
g = M.put
END = M.TL["speech_end"]
S = {k: K[k] for k in ("s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8")}

# pad: D open fifths, lifted a whole step in s5 (the tower grows) and back home in s8
base = M.env([(0, 73.4), (S["s5"], 73.4), (S["s5"] + 2, 82.4), (S["s6"], 82.4), (S["s6"] + 2, 73.4), (DUR, 73.4)])
ph = 2 * np.pi * np.cumsum(base) / SR
pad = np.sin(ph) + .55 * np.sin(1.5 * ph + .4) + .3 * np.sin(2 * ph + 1.1) + .12 * np.sin(3.01 * ph)
pad = lowpass(pad, 900)
air = norm(lowpass(rng.standard_normal(N), 5000) - lowpass(rng.standard_normal(N), 1800))
e_p = M.env([(0, .5), (S["s2"], .7), (S["s3"], .55), (S["s6"], .8), (S["s8"], 1.0), (END, .7), (DUR - .2, 0), (DUR, 0)])
# tunnel wind (s6) and pengecoh-angin reprise (s8)
wind_e = M.env([(0, 0), (AT["s6:Angin"] - .8, 0), (AT["s6:Angin"], 1), (S["s7"] - .3, .7), (S["s7"] + .4, 0), (AT["s8:pengecoh"] - .3, 0), (AT["s8:pengecoh"] + .3, .5), (END, 0), (DUR, 0)])
wind = norm(lowpass(rng.standard_normal(N), 1100) - lowpass(rng.standard_normal(N), 140)) * (1 + .35 * np.sin(T * 2.3) * np.sin(T * .7))
mono = .05 * pad * e_p + .006 * air + .05 * wind * wind_e
side = .016 * pad * e_p * np.sin(T * .21) + .02 * (np.roll(wind, 9001) - wind) * wind_e
music = stereo(mono, side) * 2.0

# soft plucks, D mixolydian, sparse
notes = [293.7, 329.6, 370.0, 392.0, 440.0, 493.9, 523.3, 587.3]
tp = .6
while tp < END - .5:
    fq = notes[int(rng.integers(len(notes)))]
    g(M.tone([fq, fq * 2.0, fq * 2.99], 1.4, 3.8), tp, .02)
    tp += .9 + rng.uniform(0, 1.4)

# s1: the tower stands up
g(swell(rng, 1.8, 90, 700), AT["s1:Tapi"] - .2, .09)
g(M.lib("riser"), AT["s1:Tapi"] - .4, .05)
g(M.thump(.6), AT["s1:atas"] + .7, .16)
g(M.lib("whoosh-cinematic"), AT["s1:atas"], .06)
# s2: crown, cranes, ghost upper part
g(M.lib("whoosh-cinematic"), S["s2"] - .3, .05)
g(M.lib("click"), AT["s2:menembus"], .07)
g(M.lib("ping"), AT["s2:menembus"] + 1.6, .05)
for k in range(4):
    g(metal(rng, 1.2, 380 + 60 * k, 5), AT["s2:menembus"] + .9 + k * .55, .022)
for kk in ("s2:mangkrak", "s2:dilanjutkan", "s2:targetnya"):
    g(M.lib("click-soft"), AT[kk], .07)
g(M.lib("chime"), AT["s2:kilometer"], .05)
# s3: underground
g(M.lib("whoosh-cinematic"), S["s3"] - .3, .05)
g(rumble(rng, 7.0, 60, .4), AT["s3:Ada"] - .4, .12)
for k in range(6):
    g(M.thump(.35), AT["s3:tiang"] - .3 + k * .32, .05)
g(M.lib("ping"), AT["s3:105"] + .3, .05)
g(M.thump(.5), AT["s3:pelat"] + .3, .12)
g(M.lib("click"), AT["s3:pelat"] + .3, .06)
# s4: cut and plan
g(swell(rng, 1.4, 300, 2500), AT["s4:Dari"] - .2, .06)
g(M.lib("pop"), AT["s4:Inti"], .07)
g(M.lib("pop"), AT["s4:sayap"], .07)
g(M.lib("click"), AT["s4:dinding"], .06)
g(M.lib("chime"), AT["s4:Tiga"], .05)
# s5: pumps
g(M.lib("whoosh-cinematic"), S["s5"] - .3, .05)
pulse = np.zeros(N)
for a, b in ((AT["s5:pertama"] - .4, S["s6"]), (AT["s5:kedua"] - .2, S["s6"])):
    tp = a
    while tp < b:
        g(M.thump(.18), tp, .035)
        tp += .42
g(metal(rng, .9, 160, 4), AT["s5:kedua"], .05)
g(M.lib("ping"), AT["s5:kedua"] + .2, .05)
# s6: wind tunnel
g(M.lib("whoosh-cinematic"), S["s6"] - .3, .06)
g(swell(rng, 2.2, 120, 900), AT["s6:mengayunkan"] - .4, .07)
g(M.lib("click-soft"), AT["s6:sayapnya"], .07)
g(M.lib("chime"), AT["s6:terowongan"], .05)
# s7: lifts
g(M.lib("whoosh-cinematic"), S["s7"] - .3, .05)
g(M.lib("error"), AT["s7:berat"], .035)
g(M.lib("riser"), AT["s7:Lift"], .06)
lift = np.arange(int(SR * 5.4)) / SR
lsig = np.sin(2 * np.pi * np.cumsum(140 + 260 * (lift / 5.4)) / SR) * np.minimum(1, lift * 2) * np.minimum(1, (5.4 - lift) * 2)
g(lsig, AT["s7:Lift"] + .2, .02)
g(M.lib("ping"), AT["s7:630"] + .6, .05)
g(M.lib("whoosh-short"), AT["s7:sepuluh"], .06)
g(swell(rng, 2.6, 60, 400), AT["s7:ujung"] - .3, .06)
g(M.thump(.5), AT["s7:peredam"], .1)
# s8
for kk in ("s8:Akar", "s8:kaki", "s8:pengecoh"):
    g(M.lib("click-soft"), AT[kk], .07)
g(M.lib("chime"), B["outroAt"] + .05, .08)
M.finish(music)
print("duration", DUR)
