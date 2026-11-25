"""EP02 sound: trading floor murmur, notification pings, tape ticks, crash impact, sober string pad. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(4904)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT = B["AT"]
w = M.word
s = M.scene

# trading floor: speech-band murmur with slow syllabic motion, thinning out after the close
mur = M.band(rng.standard_normal(N), 280, 2200)
mur /= np.abs(mur).max()
am = np.convolve(rng.standard_normal(N // 1200 + 2), np.ones(3) / 3, mode="same")
am = np.interp(T, np.arange(len(am)) * 1200 / SR, am)
am = .6 + .4 * am / max(1e-6, np.abs(am).max())
close = s("s2")["end"]
e_floor = M.env([(0, .9), (close, 1), (close + 4, .28), (s("s4")["start"], .12), (s("s5")["start"], .22), (s("s8")["start"], .2), (DUR - 1.5, 0), (DUR, 0)])

# sober pad in D minor, voiced low, no rhythm section, then a slow tick that behaves like a clock
def saw(f):
    return sum(np.sin(2 * np.pi * f * h * T) / h for h in range(1, 7))
chords = [(0, (73.42, 110, 174.61)), (s("s3")["start"], (65.41, 98, 155.56)), (s("s5")["start"], (73.42, 116.54, 174.61)), (s("s7")["start"], (58.27, 87.31, 138.59)), (s("s8")["start"], (73.42, 110, 174.61))]
pad = np.zeros(N)
for i, (t0, fs) in enumerate(chords):
    t1 = chords[i + 1][0] if i < len(chords) - 1 else DUR
    env = np.clip((T - t0 + .8) / 1.6, 0, 1) * np.clip((t1 - T + .8) / 1.6, 0, 1)
    pad += sum(saw(f) for f in fs) * env
pad = M.band(pad, 40, 900)
pad /= np.abs(pad).max()
e_pad = M.env([(0, .7), (close, 1), (s("s4")["start"], .45), (s("s5")["start"], .8), (s("s8")["start"], .9), (DUR - 1.2, .4), (DUR, 0)])
sub = np.sin(2 * np.pi * 36.71 * T) * M.env([(0, .6), (w("s2", "jebol"), 1), (close, 1), (s("s4")["start"], .3), (DUR, 0)])
mono = .1 * pad * e_pad + .05 * sub + .03 * mur * am * e_floor
side = .018 * M.band(rng.standard_normal(N), 500, 3000) / 3 * e_floor * am
music = stereo(mono, side) * 1.7

# ---- SFX ----
g = M.put
g(M.thump(.5), .02, .22)
g(M.lib("impact-bass-1"), .1, .08)
g(M.lib("impact-bass-1"), w("s1", "anjlok"), .11)
g(M.thump(.5), w("s1", "anjlok"), .24)
g(M.lib("whoosh-cinematic"), s("s2")["start"] - .4, .08)

# phone notifications from traders, sparse at the open and thick into the close
times = np.sort(np.concatenate([rng.uniform(.6, s("s2")["start"], 2), rng.uniform(w("s2", "Sebelum"), close, 8), rng.uniform(close, s("s3")["end"], 5)]))
for x in times:
    f = rng.choice([1319, 1568, 1760])
    g(M.tone((f, f * 1.5), .09, 22), x, .022)
    g(M.tone((f * 1.5,), .12, 22), x + .09, .018)
# tape ticks follow the index as it draws
for x in np.arange(w("s2", "dibuka"), w("s2", "4.904,29") + .2, .085):
    g(M.tone((3400,), .012, 200), x + rng.uniform(-.012, .012), .01)
# the 5.000 line breaks: glass plus crash
g(M.lib("riser"), w("s2", "jebol") - 2.2, .04)
g(M.burst(.9, 7, 1), w("s2", "jebol"), .05)
for i in range(16):
    g(M.tone((2600 + i * 230 % 3100, 4100 + i * 170 % 2100), .1, 34), w("s2", "jebol") + rng.uniform(.02, .85), .018)
g(M.lib("impact-bass-1"), w("s2", "jebol"), .13)
g(M.thump(.6), w("s2", "jebol"), .28)
g(M.thump(.3), w("s2", "4.904,29"), .16)
g(M.lib("click"), w("s2", "Jeda"), .07)
g(M.lib("pop"), AT["s2:Hilang"], .05)
g(M.lib("whoosh-short"), s("s3")["start"] - .36, .1)
# breadth wall: the red fill is a rush of small ticks, one thin green and one grey answer
for i in range(40):
    g(M.tone((520 - i * 5,), .025, 90), w("s3", "624") + i * .026, .022)
for i in range(10):
    g(M.tone((988,), .03, 70), w("s3", "57") + i * .04, .018)
for i in range(6):
    g(M.tone((440,), .03, 70), w("s3", "37") + i * .06, .012)
g(M.lib("whoosh-short"), w("s3", "Seluruh") - .36, .09)
for i in range(11):
    g(M.lib("click-soft"), w("s3", "sektor") + i * .05, .05)
g(M.lib("ping"), w("s3", "Asing"), .06)
g(M.lib("whoosh-cinematic"), s("s4")["start"] - .4, .06)
g(M.thump(.2), w("s4", "Soal"), .1)
g(M.lib("whoosh-short"), s("s5")["start"] - .36, .09)
g(M.lib("click"), w("s5", "emerging"), .07)
g(M.thump(.3), w("s5", "standalone"), .14)
g(M.lib("click"), w("s5", "Keputusannya"), .06)
g(M.lib("click"), w("s5", "Hasil"), .06)
g(M.lib("whoosh-short"), s("s6")["start"] - .36, .09)
g(M.lib("click"), w("s6", "81"), .07)
g(M.lib("click"), w("s6", "Pilarmas"), .07)
for i in range(5):
    g(M.lib("click-soft"), w("s6", "Bursa") + i * .12, .06)
g(M.lib("whoosh-short"), s("s7")["start"] - .36, .09)
g(M.lib("click"), w("s7", "OJK"), .06)
g(M.lib("click"), w("s7", "Analis"), .06)
g(M.lib("ping"), w("s7", "Rupiah"), .05)
g(M.lib("whoosh-cinematic"), s("s8")["start"] - .4, .07)
g(M.thump(.5), w("s8", "turun"), .18)
for key in ("hasil", "arus", "rupiah"):
    g(M.lib("click"), w("s8", key), .07)
g(M.thump(.2), w("s8", "bukan"), .12)
g(M.lib("chime"), B["outroAt"] + .05, .08)

M.finish(music)
print("duration", DUR)
