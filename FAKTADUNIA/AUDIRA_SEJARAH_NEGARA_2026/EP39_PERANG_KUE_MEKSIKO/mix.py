"""EP39 sound: a Paris cafe waltz on a patisserie table that turns into a war. Musette accordion (two detuned reeds) in
3/4 over a plucked bass, A minor. Foley: porcelain plate clinks, icing sugar sifted, paper and receipt rustles, 60 coin
clinks as the stack grows, a heavy rubber stamp, ships sliding over glaze, muffled cannon thumps (low-passed, no
crack) for the bombardment, a small snare march for the declaration of war. The boot scene (s6) drops to near silence:
a low held tone and one soft muted-trumpet line. The waltz returns quietly for the treaty and the end.
Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1839)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)


def reed(f, d, a=1.0):
    """Musette accordion: two reeds detuned a few cents, soft attack and release, slow bellows swell."""
    tt = np.arange(int(d * SR)) / SR
    x = np.zeros_like(tt)
    for det in (0.0, 0.0045, -0.003):
        ff = f * (1 + det)
        x += sum(np.sin(2 * np.pi * ff * h * tt) * (0.62 ** h) for h in range(1, 7))
    env = np.minimum(1, tt / 0.03) * np.minimum(1, (d - tt) / 0.06) * (0.85 + 0.15 * np.sin(2 * np.pi * 1.1 * tt))
    return a * x * env / 3


def pluck(f, d=0.9, a=1.0):
    return a * M.note(f, d, "pluck", dec=3.2)


def trumpet(f, d, a=1.0):
    """Muted trumpet: odd-heavy harmonics, slow vibrato, soft swell."""
    tt = np.arange(int(d * SR)) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * tt) * np.minimum(1, tt / 0.6)
    x = sum(np.sin(2 * np.pi * f * h * np.cumsum(vib) / SR) * (1 / h ** 1.1) * (1.0 if h % 2 else 0.5) for h in range(1, 9))
    return a * x * np.minimum(1, tt / 0.25) * np.minimum(1, (d - tt) / 0.5)


# --- waltz: Am Dm E7 Am / F Dm E7 Am, beat 0.5 s, bar 1.5 s ---
waltz, bass = M.mono(), M.mono()
CH = [(45, 57, 60, 64), (50, 57, 62, 65), (40, 56, 59, 62), (45, 57, 60, 64), (41, 57, 60, 65), (50, 57, 62, 65), (40, 56, 59, 64), (45, 57, 60, 64)]
MEL = [76, 74, 72, 71, 72, 74, 76, 77, 76, 74, 72, 69, 71, 72, 74, 71, 72, 69, 72, 76, 77, 76, 74, 72]
beat = 0.5
bar = 3 * beat
k = 0
for t0 in np.arange(0.1, DUR - 1, bar):
    c = CH[k % 8]
    M.lay(bass, pluck(hz(c[0]), 1.0, 0.9), t0)
    for b in (1, 2):
        for n in c[1:]:
            M.lay(waltz, reed(hz(n), 0.32, 0.22), t0 + b * beat)
    m = MEL[(k * 3) % len(MEL):(k * 3) % len(MEL) + 3]
    for j, n in enumerate(m):
        M.lay(waltz, reed(hz(n), beat * (1.6 if j == 0 else 0.9), 0.35), t0 + j * beat)
    k += 1
for x in (waltz, bass):
    x /= max(1e-6, np.abs(x).max())
s5, s6, s7 = K["s5"], K["s6"], K["s7"]
# waltz plays s1-s4, thins under the war (s5), stops for the boot (s6), returns softly (s7-s8)
ew = M.env([(0, 0), (0.6, 0.85), (s5 - 0.4, 0.85), (s5 + 0.6, 0.35), (s6 - 0.6, 0.3), (s6 + 0.4, 0), (s7 - 0.2, 0), (s7 + 1.6, 0.55), (END, 0.7), (DUR - 0.5, 0), (DUR, 0)])

# war bed (s5): low drum pulse and a small snare march
war = M.mono()
for t0 in np.arange(s5, s6 - 0.3, 1.0):
    M.lay(war, M.thump(0.5), t0, 0.8)
for t0 in np.arange(AT["s5:menyatakan"] - 0.2, s6 - 0.2, 0.25):
    sn = M.band(M.burst(0.12, 40, 1), 1500, 7000)
    M.lay(war, sn, t0, 0.35 if int((t0 - s5) / 0.25) % 4 else 0.6)
war /= max(1e-6, np.abs(war).max())

# boot (s6): low held tone and one muted trumpet line
sol = M.mono()
dur6 = s7 - s6
tt = np.arange(int(dur6 * SR)) / SR
M.lay(sol, (np.sin(2 * np.pi * hz(33) * tt) + 0.4 * np.sin(2 * np.pi * hz(40) * tt)) * np.minimum(1, tt / 1.5) * np.minimum(1, (dur6 - tt) / 1.5), s6)
for j, (n, d) in enumerate([(57, 1.6), (60, 1.2), (59, 1.6), (57, 2.6)]):
    M.lay(sol, trumpet(hz(n), d, 0.5), AT["s6:dimakamkan"] - 0.4 + sum(x[1] for x in [(57, 1.6), (60, 1.2), (59, 1.6)][:j]))
sol /= max(1e-6, np.abs(sol).max())

mono = 0.55 * waltz * ew + 0.5 * bass * ew + 0.45 * war + 0.45 * sol
music = stereo(mono, 0.12 * waltz * ew)


# --- foley ---
def clink(t, a=0.03, f=2100):
    g(M.tone((f, f * 1.61, f * 2.48, f * 3.9), 0.9, 6), t, a); g(M.band(M.burst(0.01, 400, 1), 3000, 12000), t, a * 0.5)


def coin(t, a=0.02, f=3300):
    g(M.tone((f, f * 1.51, f * 2.37), 0.35, 12), t, a); g(M.band(M.burst(0.015, 300, 1), 4000, 12000), t, a * 0.6)


def rustle(t, d=0.5, a=0.02):
    x = M.band(rng.standard_normal(int(d * SR)), 1800, 9000)
    tt = np.arange(len(x)) / SR
    x *= (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 7 * tt))) * np.minimum(1, tt / 0.03) * np.minimum(1, (d - tt) / 0.1)
    g(x / np.abs(x).max(), t, a)


def sift(t, d=1.6, a=0.012):
    x = rng.standard_normal(int(d * SR)) * (rng.random(int(d * SR)) < 0.02)
    x = M.band(x, 3000, 14000)
    tt = np.arange(len(x)) / SR
    x *= np.minimum(1, tt / 0.2) * np.minimum(1, (d - tt) / 0.4)
    g(x / max(1e-6, np.abs(x).max()), t, a)


def cannon(t, a=0.08):
    g(M.thump(0.9), t, a); g(M.band(M.burst(0.8, 5, 4), 40, 400), t + 0.02, a * 0.6)


def glide(t, d=1.4, a=0.012):
    x = M.band(rng.standard_normal(int(d * SR)), 200, 1600)
    tt = np.arange(len(x)) / SR
    g(x / np.abs(x).max() * np.sin(np.pi * tt / d), t, a)


# s1: plate clink, sugar sifted on "kue", tag
clink(0.2, 0.03)
sift(AT["s1:kue"] - 0.4, 1.8)
g(M.lib("whoosh-short"), K["s1e"] - 0.8, 0.02)
# s2: map, tags pop, distant riot murmur, cubes topple
g(M.lib("pop"), AT["s2:1832"] - 0.2, 0.03)
mur = M.band(rng.standard_normal(int(2.5 * SR)), 250, 1200); tm = np.arange(len(mur)) / SR
mur *= (0.5 + 0.5 * np.sin(2 * np.pi * 1.7 * tm) ** 2) * np.sin(np.pi * tm / 2.5)
g(mur / np.abs(mur).max(), AT["s2:kerusuhan"] - 0.3, 0.012)
for i in range(5):
    g(M.tone((1800 + 220 * i,), 0.12, 30), AT["s2:dijarah"] + i * 0.1, 0.012)
g(M.lib("whoosh-short"), K["s2e"] - 0.6, 0.02)
# s3: shop bell, glass crack, receipt, 60 coins, single coin
g(M.tone((2637, 3520), 1.2, 4), AT["s3:Monsieur"] - 0.3, 0.02)
g(M.band(M.burst(0.3, 18, 1), 2500, 12000), AT["s3:merusak"], 0.04)
g(M.lib("pop"), AT["s3:Tacubaya"] - 0.3, 0.02)
rustle(AT["s3:Remontel#2"] - 0.2, 0.5)
ca, cb = AT["s3:menuntut"] - 0.1, AT["s3:enam"] + 0.05
for i in range(60):
    coin(ca + (i / 60) * (cb - ca) + 0.2, 0.006 + 0.008 * (i % 3 == 0), 3000 + 40 * (i % 7))
coin(AT["s3:kurang"], 0.03, 2600)
g(M.lib("whoosh-short"), K["s3e"] - 0.5, 0.02)
# s4: paper, line items, total, stamp
rustle(K["s4"] + 0.2, 0.8, 0.025)
for i in range(3):
    g(M.lib("typing"), AT["s4:keluhan"] - 0.2 + i * 0.45, 0.01)
g(M.lib("riser"), AT["s4:menagih"] - 1.2, 0.012)
g(M.thump(0.35), AT["s4:ribu"] - 0.05, 0.1); g(M.band(M.burst(0.08, 60, 2), 300, 3000), AT["s4:ribu"] - 0.05, 0.05)
g(M.lib("whoosh-cinematic"), K["s4e"] - 0.4, 0.02)
# s5: ships glide in, piped line, muffled cannons, flags, snare
for i in range(4):
    glide(AT["s5:Armada"] - 0.3 + i * 0.3, 1.6, 0.008)
sift(AT["s5:diblokade"] - 0.2, 1.0, 0.008)
for i in range(6):
    cannon(AT["s5:dibombardir"] - 0.75 + i * 0.25, 0.05)
for i in range(3):
    g(M.lib("pop"), AT["s5:direbut"] - 0.1 + i * 0.18, 0.015)
g(M.lib("whoosh-short"), K["s5e"] - 0.4, 0.015)
# s6: one distant cannon on "terkena", then silence; candle crackle very soft
cannon(AT["s6:terkena"] + 0.3, 0.035)
crk = M.band(rng.standard_normal(int(dur6 * SR)) * (rng.random(int(dur6 * SR)) < 0.002), 1500, 6000)
g(crk / max(1e-6, np.abs(crk).max()), s6, 0.006)
# s7: paper, ribbon, stamp, piped arrow, card
rustle(s7 + 0.4, 0.9, 0.02)
g(M.lib("pop"), AT["s7:mediasi"] - 0.2, 0.015)
rustle(AT["s7:berjanji"] - 0.3, 0.5, 0.02)
g(M.thump(0.3), AT["s7:tak"], 0.08)
sq = M.band(rng.standard_normal(int(3.0 * SR)), 120, 900); tq = np.arange(len(sq)) / SR
g(sq / np.abs(sq).max() * np.sin(np.pi * tq / 3.0) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * tq)), AT["s7:Dua"], 0.008)
g(M.lib("chime"), AT["s7:menyerbu"] - 0.2, 0.02)
g(M.lib("whoosh-short"), K["s7e"] - 0.3, 0.02)
# s8: box, clink, outro
rustle(K["s8"] + 0.3, 0.6, 0.02)
clink(AT["s8:Menurut"] - 0.3, 0.02, 2400)
g(M.lib("chime"), OUT + 0.3, 0.05)
# room tone: cafe air
air = M.band(rng.standard_normal(N), 80, 1500)
air /= np.abs(air).max()
M.fx += np.stack([air, np.roll(air, 1400)], 1) * 0.004
M.finish(music)
print("duration", DUR)
