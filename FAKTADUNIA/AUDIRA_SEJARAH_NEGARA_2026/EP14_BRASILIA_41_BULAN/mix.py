"""EP14 sound: bossa-nova nylon-guitar comping (ii-V-I-VI in C, syncopated) with a soft shaker and rim clave,
over a building-site rhythm in the construction scenes: hammer on 2 and 4, concrete-mixer rumble, crane motor and chain.
Foley: tape-wipe rips, bulldozers, stake knocks, floor slabs, dome lowered, flags, confetti, water filling.
Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1960)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
c1, c2 = AT["s2:Sebelumnya-0.25"], AT["s4:Lalu-0.12"]
sJan, sMul, sArs, s21 = AT["s4:Janjinya"], AT["s4:memulai"], AT["s5:Arsitek"], AT["s6:21"]
sDan, sTen = AT["s6:Danau"], AT["s6:tenggelam"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 128
bar = beat * 4

# Dm9 - G13 - Cmaj9 - A7(b13), one chord a bar
CH = [[38, 53, 57, 60, 64], [43, 53, 59, 64, 65], [36, 52, 55, 59, 62], [33, 55, 61, 65, 67]]
guitar = M.mono(); bass = M.mono()
hits = [0, 3, 6, 10, 12]  # eighths in a 2-bar bossa pattern
for b0 in np.arange(0.05, END + bar, 2 * bar):
    for half in (0, 1):
        ch = CH[int((b0 + half * bar) / bar) % 4]
        for e in (0, 4):  # thumb: root then fifth
            t0 = b0 + half * bar + e * beat / 2
            M.lay(bass, M.note(hz(ch[0] if e == 0 else ch[0] + 7), 0.9, "pluck", 4.0, 0.004), t0, 0.7)
    for h in hits:
        t0 = b0 + h * beat / 2
        ch = CH[int(t0 / bar) % 4]
        for v, m in enumerate(ch[1:]):
            M.lay(guitar, M.note(hz(m), 0.55, "pluck", 6.5, 0.002), t0 + v * 0.008, 0.28)
guitar = M.band(guitar, 150, 4200); guitar /= np.abs(guitar).max()
bass = M.band(bass, 40, 900); bass /= np.abs(bass).max()

perc = M.mono()
for k, t0 in enumerate(np.arange(0.05, END + 1, beat / 4)):
    M.lay(perc, M.band(M.burst(0.05, 70, 1), 5000, 12000), t0, 0.22 if k % 4 == 2 else 0.1)
for t0 in np.arange(0.05, END + 1, 2 * bar):
    for e in (0, 3, 6, 10, 13):
        M.lay(perc, M.tone((1700, 2500), 0.05, 60), t0 + e * beat / 2, 0.25)
perc /= np.abs(perc).max()

# building-site rhythm: hammer on 2 and 4, mixer rumble, crane motor
site = M.mono()
def hammer(t, a):
    x = M.tone((820, 2150, 3400), 0.18, 34)
    n = M.band(M.burst(0.03, 120, 1), 1500, 8000)
    x[: len(n)] += 0.6 * n
    M.lay(site, x, t, a)
for w0, w1 in ((sJan - 0.2, sMul + 2.0), (sArs - 0.3, s21 + 0.3)):
    for k, t0 in enumerate(np.arange(w0, w1, beat)):
        if k % 2:
            hammer(t0 + rng.uniform(0, 0.01), 0.7)
        if k % 8 == 7:
            hammer(t0 + beat / 2, 0.4)
site /= max(1e-6, np.abs(site).max())
rum = M.band(rng.standard_normal(N), 40, 260); rum /= np.abs(rum).max()
rum *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.9 * T)
motor = sum(np.sin(2 * np.pi * f * T + i) / (i + 1) for i, f in enumerate((92, 184, 276, 368))) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.25 * T))
e_rum = M.env([(0, 0), (sJan - 0.3, 0), (sJan + 0.6, 1), (sMul + 1.6, 0.8), (sMul + 2.6, 0.2), (sArs - 0.2, 0.3), (sArs + 0.6, 0.9), (s21, 0.8), (s21 + 1.2, 0), (DUR, 0)])
e_mot = M.env([(0, 0), (sArs - 0.4, 0), (sArs + 0.5, 1), (s21 + 0.6, 1), (s21 + 1.8, 0), (DUR, 0)])
# the hook is a time-lapse of the same site
e_hook = M.env([(0, 0.8), (c1 - 0.3, 0.8), (c1 + 0.1, 0), (DUR, 0)])

e_g = M.env([(0, 0.8), (c1, 0.9), (c2, 0.9), (sArs, 0.7), (s21, 1.0), (END, 0.95), (DUR - 0.4, 0), (DUR, 0)])
e_site = M.env([(0, 0.9), (c1 - 0.3, 0.9), (c1 + 0.1, 0), (sJan - 0.3, 0), (sJan, 1), (sMul + 2.0, 1), (sMul + 2.4, 0), (sArs - 0.4, 0), (sArs, 1), (s21 + 0.3, 1), (s21 + 0.6, 0), (DUR, 0)])
music = stereo(0.45 * guitar * e_g + 0.4 * bass * e_g + 0.18 * perc * e_g + 0.3 * site * e_site,
               0.12 * guitar * e_g + 0.05 * perc * e_g)
M.fx += np.stack([rum, np.roll(rum, 700)], 1) * ((e_rum + e_hook * 0.6) * 0.03)[:, None]
M.fx += np.stack([motor, np.roll(motor, 300)], 1) * ((e_mot + e_hook * 0.5) * 0.008)[:, None]

# --- foley ---
def rip(t, a=0.08):
    x = M.band(M.burst(0.5, 5, 2), 900, 9000) * np.sin(np.linspace(0, np.pi, int(0.5 * SR))) ** 2
    g(x, t, a)
def knock(t, a=0.05):
    g(M.band(M.burst(0.05, 80, 3), 200, 2500), t, a); g(M.tone((240, 520), 0.12, 30), t, a * 0.6)
def chain(t, d=1.2, a=0.025):
    for t0 in np.arange(t, t + d, 0.06):
        g(M.tone((2600 + rng.uniform(-300, 300), 4100), 0.04, 80), t0, a * rng.uniform(0.5, 1))
def clunk(t, a=0.15):
    g(M.thump(0.45), t, a); g(M.tone((180, 410, 760), 0.6, 9), t, a * 0.3)

for c in (c1, c2):
    rip(c - 0.5, 0.1); g(M.lib("whoosh-cinematic"), c - 0.35, 0.06); rip(c + 0.05, 0.08)
# hook time-lapse: slabs clatter, flags, splash
for k in range(14):
    knock(0.4 + k * 0.2, 0.03)
clunk(2.2, 0.1); g(M.lib("chime"), 3.3, 0.04)
g(M.lib("pop"), AT["s1:bulan"], 0.04)
# map: pins, coins, target, arrow, plateau
g(M.lib("pop"), AT["s2:Rio"], 0.045)
for k in range(9):
    g(M.lib("click-soft"), AT["s2:penduduk"] - 0.5 + k * 0.12, 0.025)
for k in range(20):
    g(M.tone((2900, 4400, 6100), 0.25, 18), AT["s2:kekayaan"] - 0.3 + k * 0.05, 0.02)
g(M.lib("ping"), AT["s3:pedalaman"], 0.04)
g(M.lib("whoosh"), AT["s3:muncul"], 0.05); g(M.lib("pop"), AT["s3:muncul"] + 1.4, 0.04)
clunk(AT["s3:mewajibkan"], 0.12); g(M.lib("riser"), AT["s3:mewajibkan"] - 0.2, 0.025)
g(M.thump(0.4), AT["s3:Tapi"], 0.08)
# site: bulldozer engines, stakes
doz = M.mono()
dz = sum(np.sin(2 * np.pi * f * T) for f in (48, 96, 144)) * (0.7 + 0.3 * np.sign(np.sin(2 * np.pi * 11 * T)))
e_dz = M.env([(0, 0), (sJan - 0.4, 0), (sJan + 0.4, 1), (sMul + 1.0, 1), (sMul + 2.0, 0), (DUR, 0)])
M.fx += np.stack([dz, np.roll(dz, 500)], 1) * (e_dz * 0.012)[:, None]
for k in range(20):
    knock(sMul + k * 0.06, 0.035)
g(M.lib("pop"), AT["s5:sayembara"], 0.03)
for a in ("s5:Costa", "s5:pesawat", "s5:sumbu"):
    g(M.lib("whoosh-short"), AT[a] - 0.1, 0.04)
# build: cranes rise, floors, saucer and dome lowered, bridge, ribs
bs, be = sArs - 0.2, s21
bw = lambda u: bs + (be - bs) * u
chain(sArs - 0.2, 1.0, 0.02)
for k in range(22):
    knock(bw(0.12 + 0.62 * k / 22), 0.03)
for a, u in ((0.56, "saucer"), (0.68, "dome"), (0.92, "bridge")):
    chain(bw(a) - 0.8, 0.8); clunk(bw(a), 0.14)
for i in range(16):
    knock(bw(0.26 + 0.5 * i / 16), 0.03)
# inauguration: fanfare-ish chord, flags, confetti
g(M.lib("impact-bass-1"), s21, 0.07)
for f in (523, 659, 784, 1047):
    g(M.tone((f, f * 2), 1.6, 1.4), s21 + 0.05, 0.02)
for k in range(40):
    g(M.band(M.burst(0.02, 200, 1), 3000, 11000), s21 + 0.4 + k * 0.07 + rng.uniform(0, 0.05), 0.012)
# lake fills: water swell
wat = M.band(rng.standard_normal(N), 200, 2400); wat /= np.abs(wat).max()
e_w = M.env([(0, 0), (sDan - 0.3, 0), (sDan + 1.0, 0.8), (sTen + 0.8, 1), (K["s7"], 0), (DUR, 0)])
M.fx += np.stack([wat, np.roll(wat, 600)], 1) * (e_w * 0.025 * (0.8 + 0.2 * np.sin(2 * np.pi * 0.4 * T)))[:, None]
g(M.thump(0.6), sTen, 0.16); g(M.lib("impact-bass-1"), sTen, 0.05)
# UNESCO stamp, population counter
g(M.thump(0.35), AT["s7:UNESCO"], 0.2); g(M.lib("chime"), AT["s7:1987"], 0.04)
for k in range(10):
    g(M.lib("click-soft"), AT["s7:2,8"] + k * 0.1, 0.02)
g(M.lib("pop"), AT["s8:Menurut"], 0.035)
g(M.lib("chime"), OUT + 0.3, 0.06)
# open-plateau wind
wind = M.band(rng.standard_normal(N), 120, 900); wind /= np.abs(wind).max()
M.fx += np.stack([wind, np.roll(wind, 900)], 1) * 0.006
M.finish(music)
print("duration", DUR)
