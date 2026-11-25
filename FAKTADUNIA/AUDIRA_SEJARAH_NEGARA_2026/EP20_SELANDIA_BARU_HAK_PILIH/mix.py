"""EP20 sound: a gentle storybook waltz. Piano (bass on one, chord on two and three) with a light melody, a soft string pad
under it, turning to D minor for the failed bills and the Upper House vote, back to F major at the assent.
Foley: page turns, pen scratches, paper rustle, crowd murmur on the street and in the chamber, card flips, a gavel,
a soft bell at the Governor's assent, a ballot dropping into the box. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1893)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
A = lambda k: AT[k] if k in AT else K[k]
cuts = [A(k) for k in ("s2:Di", "s4:Mereka", "s5:Di", "s6:19", "s6:Dua", "s7:Tapi", "s8:Semua")]
minor0, minor1 = A("s3:Rancangan"), A("s6:19")
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 0.5
bar = beat * 3

maj = [[41, 57, 60, 65], [38, 57, 62, 65], [46, 58, 62, 65], [36, 55, 60, 64]]   # F Dm Bb C
mnr = [[38, 57, 62, 65], [46, 58, 62, 65], [43, 58, 62, 67], [45, 57, 61, 64]]   # Dm Bb Gm A
chords = lambda t: mnr if minor0 <= t < minor1 else maj

piano = M.mono()
for k, t0 in enumerate(np.arange(0.05, END + 1.5, beat)):
    ch = chords(t0)[int(t0 / bar) % 4]
    if k % 3 == 0:
        M.lay(piano, M.note(hz(ch[0]), 1.4, "pluck", 2.2, 0.004), t0, 0.7)
    else:
        for m in ch[1:]:
            M.lay(piano, M.note(hz(m), 0.6, "pluck", 4.5, 0.004), t0, 0.22)
# melody: a simple waltz line, two notes a bar, resting in the vote
tune = [72, 69, 74, 72, 70, 74, 72, 67, 69, 72, 77, 74, 72, 70, 69, 67]
for k, t0 in enumerate(np.arange(bar * 2, END, bar / 2)):
    if A("s5:Di") - 0.3 < t0 < A("s5:Lolos") or k % 8 == 7:
        continue
    m = tune[k % len(tune)] - (1 if minor0 <= t0 < minor1 and tune[k % len(tune)] % 12 == 9 else 0)
    M.lay(piano, M.note(hz(m), 1.1, "pluck", 2.0, 0.004), t0, 0.42)
piano = M.band(piano, 60, 6000)
piano /= np.abs(piano).max()

strings = M.mono()
for t0 in np.arange(0, END + 2, bar):
    ch = chords(t0)[int(t0 / bar) % 4]
    d = bar + 0.6
    tt = np.arange(int(d * SR)) / SR
    env = np.minimum(1, tt / 0.5) * np.minimum(1, (d - tt) / 0.5)
    x = np.zeros(len(tt))
    for v, m in enumerate(ch[1:]):
        f = hz(m - 12) * (1 + 0.003 * np.sin(2 * np.pi * 5 * tt + v))
        ph = 2 * np.pi * np.cumsum(f) / SR
        x += sum(np.sin(h * ph + v) / h ** 1.3 for h in range(1, 7))
    M.lay(strings, x * env, t0, 1.0)
strings = M.band(strings, 80, 2500)
strings /= np.abs(strings).max()

e_pi = M.env([(0, 0.85), (A("s5:Di"), 0.85), (A("s5:Di") + 0.4, 0.55), (A("s5:Lolos"), 0.55), (A("s5:Lolos") + 0.3, 0.95), (END, 0.9), (DUR - 0.4, 0), (DUR, 0)])
e_st = M.env([(0, 0.3), (A("s3:Rancangan"), 0.5), (A("s5:Di"), 0.75), (A("s5:Lolos"), 0.9), (A("s6:19"), 0.6), (END, 0.7), (DUR - 0.4, 0), (DUR, 0)])
music = stereo(0.5 * piano * e_pi + 0.38 * strings * e_st, 0.12 * piano * e_pi + 0.1 * strings * e_st)

# --- foley ---
def paper(t, a=0.07, d=0.32):
    x = M.band(M.burst(d, 9, 4), 600, 7000)
    x *= np.sin(np.linspace(0, np.pi, len(x))) ** 2
    g(x, t, a)

def scratch(t0, t1, a=0.03):
    for t in np.arange(t0, t1, 0.07):
        if rng.random() < 0.8:
            g(M.band(M.burst(0.05 + rng.random() * 0.05, 30, 1), 2500, 9000), t + rng.uniform(0, 0.03), a * (0.6 + rng.random() * 0.6))

def bell(t, f=523.25, a=0.06):
    g(M.tone((f, f * 2.0, f * 2.76, f * 5.4), 3.5, 1.2), t, a)

def murmur(t0, t1, a):
    base = M.band(rng.standard_normal(N), 180, 1400)
    base /= np.abs(base).max()
    mod = M.band(rng.standard_normal(N), 2, 8)
    mod = 0.5 + 0.5 * mod / np.abs(mod).max()
    e = M.env([(0, 0), (t0, 0), (t0 + 0.6, 1), (t1 - 0.5, 1), (t1, 0), (DUR, 0)])
    x = base * mod * e * a
    M.fx += np.stack([x, np.roll(x, 700)], 1)

for c in cuts:  # page turn: sheet sweeps in, settles, lifts away
    paper(c - 0.38, 0.1, 0.36); g(M.thump(0.22), c - 0.03, 0.06); paper(c + 0.05, 0.08, 0.45)
# hook: pins on the globe
g(M.lib("pop"), A("s1:Eropa") - 0.1, 0.04); g(M.lib("pop"), A("s1:Amerika") - 0.1, 0.04)
g(M.lib("whoosh-short"), A("s1:Pasifik") - 0.8, 0.04); g(M.lib("chime"), A("s1:Pasifik"), 0.05)
paper(A("s2:Ini") - 0.1, 0.07, 0.5)
# street
murmur(cuts[0], cuts[1], 0.012)
g(M.lib("click-soft"), A("s2:tidak") - 0.3, 0.04)
paper(A("s3:Kate") - 0.1, 0.05, 0.25)
for a in ("s3:1878", "s3:1879", "s3:1887"):
    paper(A(a) - 0.1, 0.07, 0.3)
    for k in range(6):
        paper(A(a) + 1.1 + k * 0.2, 0.025, 0.15)
    g(M.thump(0.2), A(a) + 2.35, 0.05)
g(M.thump(0.45), A("s3:kandas"), 0.16); g(M.lib("impact-bass-1"), A("s3:kandas"), 0.04)
# petition room: pens and rising rolls
scratch(cuts[1] + 0.2, cuts[2] - 0.4, 0.025)
for a in ("s4:sembilan", "s4:hampir", "s4:hampir#2"):
    for k in range(8):
        paper(A(a) + k * 0.17, 0.035, 0.2)
paper(A("s4:1893") + 0.2, 0.08, 1.4)
# Upper House
murmur(cuts[2], cuts[3], 0.009)
g(M.lib("click"), A("s5:berbalik") - 0.15, 0.05); paper(A("s5:berbalik") - 0.2, 0.05, 0.3)
g(M.lib("glitch-1"), A("s5:marah") - 0.1, 0.012)
for k in range(2):
    g(M.lib("click"), A("s5:mendukung") - 0.15 + k * 0.15, 0.05)
for k in range(2):
    g(M.thump(0.25), A("s5:Lolos") - 0.25 + k * 0.22, 0.14)
g(M.lib("chime"), A("s5:Lolos") + 0.2, 0.06)
# assent: signature, wax seal, a soft bell
sA = A("s6:mengesahkannya")
scratch(sA - 0.1, sA + 1.0, 0.04)
g(M.thump(0.3), sA + 1.2, 0.09)
bell(sA + 1.25, 523.25, 0.06); bell(sA + 1.9, 392.0, 0.045)
for k in range(10):
    g(M.band(M.burst(0.06, 70, 3), 150, 1600), A("s6:termasuk") - 0.3 + k * 0.11, 0.02)
# polling place
murmur(cuts[4], cuts[5], 0.008)
d = A("s6:memilih") + 0.35
g(M.thump(0.3), d, 0.08); g(M.tone((220, 330), 0.25, 18), d, 0.03); paper(A("s6:memilih") - 0.2, 0.04, 0.3)
# timeline
g(M.lib("whoosh-short"), A("s7:1919") - 0.6, 0.035); g(M.lib("pop"), A("s7:1919") - 0.1, 0.035)
g(M.lib("whoosh-short"), A("s7:Elizabeth") - 0.6, 0.035); bell(A("s7:1933"), 659.25, 0.04)
# outro
scratch(cuts[6] + 0.2, A("s8:Menurut"), 0.025)
g(M.lib("pop"), A("s8:Menurut"), 0.03)
bell(A("s8:AUDIRA"), 523.25, 0.04)
g(M.lib("chime"), OUT + 0.3, 0.06)
room = M.band(rng.standard_normal(N), 150, 1400)
room /= np.abs(room).max()
M.fx += np.stack([room, np.roll(room, 900)], 1) * 0.004
M.finish(music)
print("duration", DUR)
