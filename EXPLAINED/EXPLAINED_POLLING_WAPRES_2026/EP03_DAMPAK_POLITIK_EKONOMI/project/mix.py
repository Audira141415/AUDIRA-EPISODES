"""EP03 DAMPAK POLITIK EKONOMI sound: a late-night trading floor in a museum hall. D minor at 76 BPM: a bowed low drone
(detuned saws, slow swell), a muted marimba-like pluck ostinato, a soft kick on 1 and 3, and a clock tick on every beat
(the market and the people are waiting). SFX are the brass scale itself: metal clinks and chain rattles when the beam jolts,
a screw press creak, a gold bar thud on the plinth, aluminium taps for the party blocks, brass pops for the voice plaques.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(303)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
A = lambda k: AT[k]

drone, pl, kick, tick = M.mono(), M.mono(), M.mono(), M.mono()
beat = 60 / 76
D2 = 73.42
# Dm - Bb - Gm - A (semitones from D)
chords = [[0, 3, 7], [-4, 0, 3], [-7, -4, 0], [-5, -1, 2]]
bar = 4 * beat
t0, b = 0.0, 0
while t0 < DUR:
    ch = chords[b % 4]
    for st in ch:
        f = D2 * 2 * 2 ** (st / 12)
        n = M.note(f, bar * 1.15, "saw", 0.25, 0.6) + M.note(f * 1.004, bar * 1.15, "saw", 0.25, 0.6)
        M.lay(drone, M.band(n, 60, 1400) * 0.22, t0, 1)
    M.lay(drone, M.note(D2 * 2 ** (ch[0] / 12), bar, "sine", 0.3, 0.3) * 0.8, t0, 1)
    for k in range(8):
        st = ch[[0, 1, 2, 1, 0, 2, 1, 2][k]] + 12
        M.lay(pl, M.note(D2 * 2 * 2 ** (st / 12), beat * 0.7, "pluck", 6.0, 0.003) * (0.7 if k % 2 == 0 else 0.45), t0 + k * beat / 2, 1)
    for k in range(4):
        if k % 2 == 0:
            M.lay(kick, M.note(55, 0.3, "sine", 12), t0 + k * beat, 0.9)
        M.lay(tick, M.band(M.burst(0.03, 120, 1), 2500, 8000), t0 + k * beat, 0.35 if k == 0 else 0.22)
    t0 += bar
    b += 1
# lift the bed on the payoff, thin it on the hook and close
e = M.env([(0, 0.55), (K["s1e"], 0.7), (K["s2"], 0.85), (K["s7"], 1.0), (END, 0.9), (DUR - 0.8, 0.55), (DUR, 0)])
plg = M.env([(0, 0.0), (K["s1e"] - 0.4, 0.0), (K["s2"], 1.0), (K["s8"], 1.0), (END, 0.4), (DUR, 0.0)])
mono = (0.7 * drone + 0.5 * pl * plg + 0.55 * kick + 0.4 * tick) * e
side = 0.18 * np.roll(drone + pl * plg, 700) * e
room = M.band(M.rng.standard_normal(N), 70, 400) * 0.006
music = stereo(mono + room, side)


# ---- SFX ----
def clink(t, a=0.08, f0=2100):
    x = sum(M.note(f0 * r, 0.6, "sine", 7 + 3 * i) * (0.6 ** i) for i, r in enumerate([1, 1.52, 2.31, 3.17]))
    g(x, t, a)


def rattle(t, dur=0.7, a=0.05):
    for k in range(int(dur / 0.045)):
        clink(t + k * 0.045 + 0.01 * np.sin(k * 3.1), a * (1 - k * 0.045 / dur) * 0.5, 2600 + 300 * ((k * 7) % 5))


def creak(t, dur=1.0, a=0.05):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 140 + 40 * np.sin(2 * np.pi * 1.3 * tt)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * tt))
    x = M.band(x, 200, 2400) * np.minimum(1, tt / 0.05) * np.minimum(1, (dur - tt) / 0.1)
    g(x / (np.abs(x).max() + 1e-9), t, a)


def tap(t, a=0.07, f=900):
    g(M.note(f, 0.18, "sine", 26) + 0.4 * M.note(f * 2.7, 0.18, "sine", 50), t, a)


g(M.lib("whoosh-short"), 0.0, 0.05)
g(M.lib("impact-bass-1"), A("s1:bereaksi") - 0.05, 0.12)
rattle(A("s1:bereaksi"), 0.8, 0.07)
clink(A("s1:kira") + 0.05, 0.08)
rattle(A("s1:kira") + 0.1, 0.5, 0.05)
for s in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[s] - 0.35, 0.05)
# s2 IHSG rises, bubble drops in
g(M.lib("riser"), A("s2:naik") - 0.4, 0.045)
for k in range(8):
    tap(A("s2:naik") + k * 0.12, 0.03, 700 + k * 90)
g(M.lib("ping"), A("s2:5.250"), 0.06)
g(M.lib("pop"), A("s2:443,5") + 0.4, 0.07)
clink(A("s2:443,5") + 0.55, 0.04, 1500)
g(M.thump(0.3), A("s2:bukan"), 0.06)
# s3 MSCI sleeve slides down
g(M.lib("whoosh"), A("s3:MSCI") - 0.3, 0.06)
g(M.lib("chime"), A("s3:MSCI") + 0.7, 0.04)
g(M.lib("click"), A("s3:jadwal"), 0.05)
g(M.lib("pop"), A("s3:jadwal") + 0.2, 0.04)
g(M.lib("glitch-1"), A("s3:sinyal"), 0.03)
# s4 press + gold bar thud
creak(A("s4:rupiah") - 0.2, 1.6, 0.04)
g(M.thump(0.4), A("s4:18.500"), 0.16)
g(M.lib("impact-bass-1"), A("s4:18.500"), 0.08)
clink(A("s4:turun") + 0.2, 0.05, 1800)
g(M.thump(0.3), A("s4:turun") + 1.15, 0.14)
clink(A("s4:turun") + 1.15, 0.09, 1250)
clink(A("s4:turun") + 1.32, 0.04, 1250)
# s5 party blocks: one aluminium tap each, then the slide
for k, w in enumerate(("s5:PAN", "s5:Demokrat", "s5:PKS", "s5:Golkar")):
    tap(A(w), 0.08, 620 + 80 * k)
    g(M.lib("click"), A(w), 0.04)
g(M.band(M.burst(0.6, 5, 4), 200, 1800), A("s5:Prabowo") - 0.1, 0.05)
g(M.thump(0.3), A("s5:ini") + 0.05, 0.1)
# s6 plaques
for w in ("s6:Papua", "s6:Kompas", "s6:ISEAI"):
    g(M.lib("pop"), A(w) - 0.1, 0.07)
    clink(A(w) + 0.05, 0.04, 1900)
# s7 payoff
g(M.lib("riser"), A("s7:18.500") - 1.3, 0.06)
g(M.lib("impact-bass-1"), A("s7:18.500"), 0.09)
g(M.lib("ping"), A("s7:MSCI"), 0.05)
g(M.lib("sparkle"), A("s7:rakyat"), 0.04)
# s8 resolve
g(M.lib("whoosh-cinematic"), K["s8"] - 0.3, 0.06)
g(M.lib("chime"), A("s8:Ikuti") - 0.1, 0.05)
g(M.thump(), OUT, 0.1)
M.finish(music)
