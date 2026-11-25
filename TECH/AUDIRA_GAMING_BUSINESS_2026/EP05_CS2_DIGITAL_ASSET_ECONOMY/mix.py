"""EP05 sound: low analog drone and a slow tactical pulse, metallic foley for every inspection, market ticks, one glass-and-steel crash. Run from this folder."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(442)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT = B["AT"]
s, g = M.scene, M.put
END = M.TL["speech_end"]
def saw(f, detune=0):
    return sum(np.sin(2 * np.pi * (f + detune) * h * T + h) / h for h in range(1, 7))
drone = M.band(saw(41.2) + saw(41.2, .25) + .5 * saw(61.74) + .35 * saw(82.41, .4), 30, 520)
drone /= np.abs(drone).max()
air = M.band(rng.standard_normal(N), 1400, 5200); air /= np.abs(air).max()
crash = s("s6")["start"]; hit = AT["s6:dua"]
e = M.env([(0, .7), (crash - .5, 1), (hit, 1.2), (hit + 1, .55), (s("s8")["start"], .75), (END, .7), (DUR - .4, 0), (DUR, 0)])
beat = 60 / 84
pulse = np.zeros(N); tick = np.zeros(N)
for b in range(int(END / (beat / 2))):
    t0 = b * beat / 2; i = int(t0 * SR)
    if b % 4 == 0:
        n = min(int(.4 * SR), N - i); x = np.arange(n) / SR
        pulse[i:i + n] += np.sin(2 * np.pi * (44 * x + 16 * (1 - np.exp(-x * 34)) / 34)) * np.exp(-x * 8)
    if b % 4 == 2:
        n = min(int(.09 * SR), N - i); x = np.arange(n) / SR
        pulse[i:i + n] += rng.standard_normal(n) * .22 * np.exp(-x * 46)
    n = min(int(.012 * SR), N - i); x = np.arange(n) / SR
    tick[i:i + n] += np.sin(2 * np.pi * 2900 * x) * np.exp(-x * 240)
gate = M.env([(0, 1), (crash, 1), (crash + .4, 1.2), (hit, 1.4), (hit + .1, 0), (s("s7")["start"], .3), (s("s8")["start"], .6), (END, .4), (DUR, 0)])
mono = .17 * drone * e + .15 * pulse * gate + .03 * tick * gate + .006 * air
music = stereo(mono, .022 * drone * e + .006 * air) * 1.25
def clack(t, a=.08):
    g(M.band(M.burst(.05, 90, 2), 900, 8000), t, a); g(M.tone((1250, 2140, 3380), .11, 38), t + .004, a * .35); g(M.thump(.12), t, a * .6)
# ---- cues: shutter closes on every act change ----
for name in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    t = s(name)["start"]
    clack(t - .14, .1); g(M.lib("whoosh-short"), t - .3, .05)
g(M.thump(.5), .03, .22); g(M.lib("impact-bass-1"), .04, .1); clack(.05, .1)
for x in np.arange(.8, s("s1")["end"], 2.2):
    g(M.band(M.burst(.28, 11, 1), 2400, 9000), x, .012)
g(M.lib("click"), AT["s1:Tanpa"], .08)
k = AT["s2:karya"]
for i in range(44):
    g(M.tone((1200 + (i * 91) % 1400,), .02, 80), k - .3 + i * .032, .02)
g(M.thump(.45), AT["s2:442"], .22); g(M.lib("glitch-1"), AT["s2:442"], .04)
for i in range(25):
    clack(AT["s3:25"] + i * .016 + .2, .018)
g(M.lib("ping"), AT["s3:57"], .06)
for k_ in ("s4:15", "s4:Wallet"):
    g(M.lib("click"), AT[k_], .08)
g(M.thump(.35), AT["s4:transaksi"], .16)
for k_ in ("s5:Langka", "s5:polanya", "s5:percaya"):
    clack(AT[k_], .08)
for i in range(5):
    clack(AT["s6:lima"] + i * .09, .08)
g(M.lib("riser"), AT["s6:pisau"] - 2.1, .03); g(M.lib("sparkle"), AT["s6:pisau"], .06); clack(AT["s6:pisau"], .1)
for x in rng.uniform(AT["s6:Barang"], hit, 40):
    g(M.tone((3100 + rng.uniform(0, 2400),), .06, 44), x, .012)
g(M.lib("impact-bass-1"), hit, .15); g(M.thump(.8), hit, .32); g(M.burst(1.1, 6, 1), hit, .05); g(M.lib("glitch-2"), hit, .05)
g(M.lib("ping"), AT["s7:10,4"], .06); g(M.thump(.3), AT["s7:6,5"], .16)
g(M.thump(.5), AT["s7:Februari"] + .28, .24); g(M.band(M.burst(.25, 18, 2), 200, 2200), AT["s7:Februari"] + .28, .08)
for k_ in ("s8:koleksi", "s8:investasi", "s8:judi"):
    clack(AT[k_], .08)
g(M.lib("chime"), B["outroAt"] + .05, .07)
M.finish(music)
print("duration", DUR)
