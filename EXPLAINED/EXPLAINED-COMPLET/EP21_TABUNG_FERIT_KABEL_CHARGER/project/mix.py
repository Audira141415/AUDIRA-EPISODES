"""EP21 sound: a clean lab-electronics groove. 110 BPM in D dorian: a round sine bass, a filtered square arpeggio that
gets faster when the charger switches, clock ticks on the hats, and a cool pad. Interference is sound design: radio
static in s3, a high switching whine in s4, crackle riding the cable until the bead, a low field hum in s6 that cancels
on "meniadakan", a sizzle for the heat, and a short pentatonic pluck phrase for Tokyo 1930.
Run from project/: python mix.py"""
import json
import sys

sys.path.insert(0, "../../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2121)
T, N, DUR = M.T, M.N, M.DUR
B = json.load(open("beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
beat = 60 / 110
D3 = 146.83
hz = lambda st, base=D3: base * 2 ** (st / 12)
DOR = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15, 17, 19]

bass, arp, pad, hat = M.mono(), M.mono(), M.mono(), M.mono()
prog = [0, 5, 3, 7]  # Dm, G, F, A (dorian colour)
i, t0 = 0, 0.05
while t0 < END + 1.5:
    root = prog[(i // 8) % 4]
    if i % 2 == 0:
        M.lay(bass, M.note(hz(root - 12), beat * 0.9, "sine", 3.0), t0, 0.9)
    M.lay(hat, M.band(M.burst(0.03, 160, 1), 6000, 14000), t0 + beat / 2, 0.35 if i % 4 else 0.5)
    t0 += beat / 2
    i += 1
# arpeggio rate: 16ths normally, 32nds while the charger switches (s4)
fast = lambda t: AT["s4:menyala"] - 0.2 < t < K["s5"]
t0, j = K["s2"], 0
while t0 < END:
    root = prog[int(t0 / (beat * 4)) % 4]
    st = root + [0, 7, 12, 15, 19, 15, 12, 7][j % 8]
    sq = M.band(M.note(hz(st), 0.16, "square", 14), 200, 3200)
    M.lay(arp, sq, t0, 0.45 if j % 4 == 0 else 0.3)
    t0 += beat / (8 if fast(t0) else 4)
    j += 1
pad += 0.35 * np.sin(2 * np.pi * hz(0) * T) + 0.25 * np.sin(2 * np.pi * hz(7) * T + 0.6 * np.sin(T * 0.3)) + 0.18 * np.sin(2 * np.pi * hz(15) * T + np.sin(T * 0.45))
calm = M.env([(0, 0.6), (K["s3"], 0.5), (K["s5"], 0.8), (K["s8"], 1), (DUR, 1)])
pad *= calm
# Tokyo 1930: pentatonic pluck phrase, arp dips
for k, st in enumerate([12, 15, 17, 19, 22, 24, 22, 19]):
    M.lay(arp, M.note(hz(st), 0.9, "pluck", 4.5), K["s7"] + 0.15 + k * beat * 0.5, 0.7)
for w in ("s1:charger", "s2:ferit", "s5:sinilah", "s7:TDK", "s8:AUDIRA"):
    M.lay(arp, M.note(hz(24), 1.2, "pluck", 3.5), AT[w], 0.6)
arp_env = M.env([(0, 1), (K["s7"] - 0.2, 1), (K["s7"] + 0.3, 0.3), (K["s8"] - 0.2, 0.3), (K["s8"] + 0.3, 1), (DUR, 1)])
e = M.env([(0, 0.8), (K["s2"], 1), (END + 0.3, 1), (DUR - 0.5, 0.5), (DUR, 0)])
mono = (0.55 * bass + 0.35 * arp * arp_env + 0.35 * pad + 0.25 * hat) * e
side = 0.22 * np.roll(arp * arp_env + pad * 0.6, 700) * e
music = stereo(mono, side)


# ---- SFX ----
def noise_bed(a, b, amp, lo, hi):
    n = int((b - a) * SR)
    if n <= 0:
        return
    x = M.band(M.rng.standard_normal(n), lo, hi)
    env = np.minimum(1, np.arange(n) / (0.3 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.3 * SR))
    g(x / np.abs(x).max() * env, a, amp)


def whine(a, b, amp, f=7800):
    n = int((b - a) * SR)
    if n <= 0:
        return
    tt = np.arange(n) / SR
    x = np.sign(np.sin(2 * np.pi * f * tt)) * 0.5 + 0.5 * np.sin(2 * np.pi * f * 0.5 * tt)
    env = np.minimum(1, tt / 0.4) * np.minimum(1, (tt[-1] - tt) / 0.4)
    g(M.band(x, 2000, 12000) * env, a, amp)


def crackle(a, b, amp, rate=22):
    tb, k = a, 0
    while tb < b:
        g(M.band(M.burst(0.02, 220, 1), 1500, 9000), tb, amp * (0.6 + 0.4 * ((k * 7) % 5) / 4))
        tb += 1 / rate * (0.6 + 0.8 * ((k * 13) % 7) / 6)
        k += 1


g(M.lib("glitch-1"), 0.05, 0.03)
for s in ("s3", "s5", "s7", "s8"):
    g(M.lib("whoosh-cinematic"), K[s] - 0.25, 0.07)
for s in ("s2", "s4", "s6"):
    g(M.lib("whoosh-short"), K[s] - 0.2, 0.05)
g(M.lib("error"), AT["s1:charger"] + 0.9, 0.035)
g(M.lib("click"), AT["s2:cangkang"], 0.07)
g(M.lib("click-soft"), AT["s2:membungkus"], 0.06)
g(M.lib("ping"), AT["s3:antena"], 0.05)
noise_bed(AT["s3:memancarkan"] - 0.2, K["s3e"], 0.022, 2500, 9000)
g(M.lib("glitch-2"), AT["s3:alat"], 0.035)
g(M.lib("glitch-3"), AT["s3:menangkap"], 0.035)
g(M.lib("click"), AT["s4:Rangkaian"], 0.06)
whine(AT["s4:menyala"] - 0.1, K["s5"] - 0.3, 0.012)
g(M.lib("typing"), AT["s4:ratusan"], 0.04)
crackle(AT["s4:derau"], K["s5"] - 0.2, 0.03)
for w in ("s5:oksida", "s5:nikel", "s5:seng", "s5:mangan"):
    g(M.lib("pop"), AT[w], 0.06)
g(M.lib("sparkle"), AT["s5:magnetis"], 0.05)
g(M.lib("error"), AT["s5:menghantarkan"], 0.03)
# field hum: two detuned hums that cancel on "meniadakan", then a rising common-mode hum that stacks
hum_a = M.env([(0, 0), (AT["s6:Arus"], 0), (AT["s6:Arus"] + 0.5, 1), (AT["s6:meniadakan"], 1), (AT["s6:meniadakan"] + 0.8, 0), (DUR, 0)])
hum_b = M.env([(0, 0), (AT["s6:searah"] - 0.3, 0), (AT["s6:menumpuk"] + 0.8, 1), (AT["s6:panas"] + 0.6, 1), (K["s6e"], 0), (DUR, 0)])
hum = (np.sin(2 * np.pi * 98 * T) * hum_a + (np.sin(2 * np.pi * 73.4 * T) + 0.5 * np.sin(2 * np.pi * 146.8 * T)) * hum_b) * 0.06
g(np.stack([hum, hum], 1), 0, 1)
g(M.lib("riser"), AT["s6:menumpuk"] - 1.2, 0.04)
noise_bed(AT["s6:panas"] - 0.1, K["s6e"], 0.02, 3000, 12000)
g(M.lib("chime"), AT["s7:Yogoro"], 0.04)
g(M.lib("impact-bass-1"), AT["s7:berdirilah"], 0.06)
g(M.thump(0.25), AT["s7:berdirilah"], 0.1)
g(M.lib("ping"), AT["s8:pemancar"], 0.04)
g(M.lib("sparkle"), OUT - 0.3, 0.06)
g(M.thump(), OUT, 0.12)
M.finish(music)
