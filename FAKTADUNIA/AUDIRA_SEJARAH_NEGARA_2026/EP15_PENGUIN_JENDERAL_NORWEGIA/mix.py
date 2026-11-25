"""EP15 sound: a toy-box military band. Brass-like square/saw melody, oom-pah tuba, snare rolls and a glockenspiel in
B-flat major at a march tempo; a pipe drone with the band under the 1961 Tattoo. Foley: plastic brick snaps for every
promotion, rattling bricks under each wipe, crowd cheer, sword ting, lift whooshes. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(2008)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
c1, c2, c3, c4 = AT["s3:Ceritanya"], AT["s4:Tahun"], AT["s6:Tahun"], AT["s8:Tradisi"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 112
bar = beat * 2  # 2/4 march

# B-flat major: I - IV - V - I, two bars each
prog = [[46, 58, 62, 65], [46, 58, 62, 65], [51, 58, 63, 67], [51, 58, 63, 67], [53, 57, 60, 65], [53, 57, 60, 65], [46, 58, 62, 65], [46, 58, 62, 65]]
chord = lambda t: prog[int(t / bar) % 8]

def brass(f, d, a=1.0):
    tt = np.arange(int(d * SR)) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * tt) * np.minimum(1, tt / 0.2)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = sum(np.sin(h * ph) / h ** 0.9 for h in range(1, 10))
    return a * x * np.minimum(1, tt / 0.025) * np.minimum(1, (d - tt) / 0.04)

def snare(a):
    x = M.band(M.burst(0.14, 30, 1), 1600, 9000)
    x[: int(0.06 * SR)] += 0.3 * M.tone((190, 340), 0.06, 40)
    return x * a

tuba, band_, glock, drum = M.mono(), M.mono(), M.mono(), M.mono()
for k, t0 in enumerate(np.arange(0.05, END + 1.0, beat / 2)):
    ch = chord(t0)
    if k % 2 == 0:  # oom on the beat, pah chord off it
        root = ch[0] - 12 if (k // 2) % 2 == 0 else ch[0] - 5
        M.lay(tuba, M.note(hz(root), beat * 0.8, "tri", 3, 0.01), t0, 0.9)
    else:
        for m in ch[1:]:
            M.lay(band_, brass(hz(m), beat * 0.35, 0.25), t0)
    a = 0.8 if k % 4 == 0 else 0.35 if k % 2 == 0 else 0.25
    M.lay(drum, snare(a), t0)
    if k % 8 == 7:
        for r in range(4):
            M.lay(drum, snare(0.18 + r * 0.05), t0 + r * beat / 8)
# melody, a jaunty march tune
tune = [70, 74, 77, 74, 75, 74, 72, 70, 72, 75, 79, 75, 77, 75, 74, 72, 69, 72, 77, 72, 74, 72, 70, 69, 70, 74, 77, 82, 81, 77, 74, 70]
mel = M.mono()
for k, t0 in enumerate(np.arange(bar * 2, END, beat / 2)):
    if k % 16 == 15:
        continue
    M.lay(mel, brass(hz(tune[k % len(tune)]), beat * 0.42, 1.0), t0)
for k, t0 in enumerate(np.arange(bar * 2, END, beat)):
    M.lay(glock, M.tone((hz(tune[(2 * k) % len(tune)] + 12), hz(tune[(2 * k) % len(tune)] + 12) * 2.76), 0.6, 7), t0, 0.5)
mel = M.band(mel, 150, 4500)
band_ = M.band(band_, 120, 4000)
for x in (tuba, band_, glock, drum, mel):
    x /= max(1e-6, np.abs(x).max())
# pipe drone for the Edinburgh Tattoo (1961)
dr = sum(np.sin(2 * np.pi * hz(m) * T * h) / h for m in (46, 53) for h in range(1, 7))
dr = dr / np.abs(dr).max()

e_mel = M.env([(0, 0.0), (1.0, 0.75), (c1 - 0.3, 0.75), (c1 + 0.3, 0.45), (c2 - 0.3, 0.45), (c2 + 0.3, 0.75), (END, 0.85), (DUR - 0.4, 0), (DUR, 0)])
e_dr = M.env([(0, 0), (c1 - 0.2, 0), (c1 + 0.8, 1), (c2 - 0.4, 1), (c2 + 0.2, 0), (DUR, 0)])
e_band = M.env([(0, 0.8), (END, 0.9), (DUR - 0.4, 0), (DUR, 0)])
mono = 0.5 * tuba * e_band + 0.32 * band_ * e_band + 0.3 * mel * e_mel + 0.18 * glock * e_mel + 0.4 * drum * e_band + 0.22 * dr * e_dr
music = stereo(mono, 0.08 * mel * e_mel + 0.06 * glock * e_mel)

# --- foley ---
def snap(t, a=0.12):
    """plastic brick click: a short bright transient plus a tiny hollow knock"""
    g(M.band(M.burst(0.03, 160, 1), 2500, 11000), t, a)
    g(M.tone((1800, 2650), 0.05, 60), t, a * 0.4)
    g(M.tone((420,), 0.08, 45), t + 0.006, a * 0.5)

def rattle(t, n=26, span=0.75, a=0.05):
    for i in range(n):
        snap(t + span * i / n + rng.uniform(0, 0.02), a * rng.uniform(0.5, 1))

def step(t, a=0.025):
    g(M.band(M.burst(0.05, 80, 3), 300, 3000), t, a)

# brick wipes: bricks tile in, then fall away
for c in (c1, AT["s3:pada"], c2, c3, c4):
    rattle(c - 0.5, 30, 0.45, 0.05); g(M.thump(0.25), c - 0.04, 0.1); rattle(c + 0.06, 20, 0.45, 0.035)
# panel arrivals
for k in ("s2", "s5"):
    snap(K[k] - 0.05, 0.06)
for a in ("s3:dan", "s4:Namanya", "s5:Saat", "s6:Tahun#2", "s7:Guinness", "s7:Pangkatnya"):
    snap(AT[a] - 0.05, 0.06)
# hook
g(M.lib("impact-bass-1"), 0.05, 0.05); snap(AT["s1:Skotlandia"], 0.06)
g(M.lib("pop"), AT["s1:ksatria"], 0.05)
# promotions: each insignia snaps on with a double click and a small chime
for a in ("s4:kopral", "s5:Kopral", "s5:sersan", "s5:sersan#2", "s6:kolonel", "s6:ksatria", "s7:brigadir", "s7:jenderal"):
    snap(AT[a], 0.16); snap(AT[a] + 0.07, 0.1)
    g(M.lib("chime"), AT[a] + 0.05, 0.035)
g(M.lib("sparkle"), AT["s7:jenderal"] + 0.2, 0.05)
# name tiles
snap(AT["s4:Nils#2"], 0.12); snap(AT["s4:Olav#2"], 0.12)
# Tattoo: crowd cheer + marching feet
crowd = M.band(rng.standard_normal(N), 300, 3500)
crowd /= np.abs(crowd).max()
ce = M.env([(0, 0), (c1, 0), (c1 + 0.6, 0.3), (AT["s3:Garda"], 0.4), (AT["s3:Garda"] + 0.8, 1), (c2 - 0.6, 0.7), (c2, 0), (DUR, 0)])
M.fx += np.stack([crowd * ce, np.roll(crowd, 700) * ce], 1) * 0.03
for t0 in np.arange(AT["s3:Garda"] - 0.5, AT["s3:Egelien"] + 1.0, beat / 2):
    step(t0, 0.03)
# generation swaps: whoosh up, snap down
for tc in (AT["s5:penggantinya"], AT["s7:ketiga"] + 0.1):
    g(M.lib("whoosh-short"), tc - 0.5, 0.06); snap(tc + 0.4, 0.18); g(M.thump(0.3), tc + 0.4, 0.12)
# 2008: platoon marches in, the sword taps
for t0 in np.arange(AT["s6:2008"], AT["s6:2008"] + 6.5, beat / 2):
    step(t0, 0.03)
d0 = AT["s6:dianugerahi"]
for tt in (d0 + 0.35, d0 + 0.95):
    g(M.tone((2400, 3610, 5200), 0.9, 6), tt, 0.035)
g(M.lib("riser"), AT["s6:130"] - 1.2, 0.03); g(M.lib("impact-bass-1"), AT["s6:130"], 0.05)
# Guinness plaque rises, record ding
rattle(AT["s7:Guinness"] - 0.2, 12, 0.4, 0.05); g(M.lib("ping"), AT["s7:Guinness"] + 0.3, 0.04)
# outro
g(M.lib("pop"), AT["s8:Menurut"], 0.04)
g(M.lib("chime"), OUT + 0.3, 0.06)
# living-room tone
room = M.band(rng.standard_normal(N), 200, 1500)
room /= np.abs(room).max()
M.fx += np.stack([room, np.roll(room, 900)], 1) * 0.004
M.finish(music)
print("duration", DUR)
