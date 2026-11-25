"""EP04 sound: chamber strings and a music box. Before the sale the harmony is modal (D aeolian with a folk lilt);
from the signing it turns into a plain hymn cadence in D major. Foley: ink drawing, coins, quill, gavel, page turns,
flag rope, calendar flips, the statehood stamp. Run from this folder after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1867)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
sign = AT["s4:perjanjian"]

hz = lambda m: 440 * 2 ** ((m - 69) / 12)
# chords as MIDI notes; modal before the treaty, hymn after
modal = [[50, 57, 62, 65], [48, 55, 60, 64], [50, 57, 62, 65], [45, 52, 57, 60], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61], [50, 57, 62, 65]]
hymn = [[50, 57, 62, 66], [43, 55, 59, 62], [45, 57, 61, 64], [50, 57, 62, 66], [47, 54, 59, 62], [43, 55, 59, 64], [45, 52, 61, 64], [50, 57, 62, 66]]
bar = 2.6


def strings(seg_start, seg_end, chords):
    out = np.zeros(N)
    t0 = seg_start
    i = 0
    while t0 < seg_end:
        d = min(bar, seg_end - t0) + 0.6
        a, b = int(t0 * SR), min(N, int((t0 + d) * SR))
        tt = np.arange(b - a) / SR
        env = np.minimum(1, tt / 0.7) * np.minimum(1, (d - tt) / 0.6)
        x = np.zeros(b - a)
        for v, m in enumerate(chords[i % len(chords)]):
            f = hz(m) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * tt + v))
            ph = 2 * np.pi * np.cumsum(f) / SR
            x += sum(np.sin(h * ph + v) / h ** 1.3 for h in range(1, 7)) * (1.0 if v else 1.25)
        out[a:b] += x * env
        t0 += bar
        i += 1
    return out


pad = strings(0, sign, modal) + strings(sign, END + 1.5, hymn)
pad = M.band(pad, 90, 3200)
pad /= np.abs(pad).max()

# music box: a modal tune, then the same tune in major; bell partials, fast decay
tune_m = [74, 72, 74, 77, 76, 74, 72, 69, 70, 72, 74, 69]
tune_h = [74, 76, 78, 81, 79, 78, 76, 74, 71, 73, 74, 78]
box = M.mono()
step = bar / 4
for k, t0 in enumerate(np.arange(0.2, END, step)):
    if K["s5"] - 0.4 < t0 < K["s5e"] and k % 2:
        continue
    tune = tune_m if t0 < sign else tune_h
    m = tune[k % len(tune)] + 12
    d = 1.2
    tt = np.arange(int(d * SR)) / SR
    x = (np.sin(2 * np.pi * hz(m) * tt) + 0.35 * np.sin(2 * np.pi * hz(m) * 2.76 * tt) * np.exp(-tt * 9)) * np.exp(-tt * 4.5) * np.minimum(1, tt / 0.002)
    M.lay(box, x, t0, 0.55 if k % 4 == 0 else 0.38)
cello = M.mono()
for t0 in np.arange(0, END, bar):
    root = (modal if t0 < sign else hymn)[int(t0 / bar) % 8][0] - 12
    M.lay(cello, M.note(hz(root), bar + 0.2, "saw", 0.6, 0.12), t0, 0.5)
cello = M.band(cello, 40, 900)
cello /= np.abs(cello).max()
e = M.env([(0, 0.7), (K["s2"], 0.8), (sign, 0.9), (sign + 0.6, 1.05), (K["s6"], 0.85), (AT["s6:menurunkannya"], 1.1), (K["s8"], 0.75), (END, 0.8), (DUR - 0.4, 0), (DUR, 0)])
be = M.env([(0, 1), (K["s3"], 0.6), (sign, 1), (K["s7"], 0.8), (END, 1), (DUR, 0)])
music = stereo(0.5 * pad * e + 0.3 * cello * e + 0.22 * box * be, 0.12 * pad * e + 0.08 * box * be)

# --- foley helpers ---
def scratch(t, d, a=0.05):
    x = M.band(M.burst(d, 1.2, 2), 2500, 9000)
    x *= 0.6 + 0.4 * np.abs(np.sin(np.arange(len(x)) / SR * 2 * np.pi * 7))
    g(x, t, a)

def clink(t, a=0.1, f=2600):
    g(M.tone((f, f * 1.53, f * 2.4), 0.25, 22), t, a * 0.6); g(M.band(M.burst(0.04, 90, 2), 2000, 9000), t, a)

def page(t, a=0.07):
    x = M.band(M.burst(0.32, 9, 4), 700, 6000)
    x *= np.sin(np.linspace(0, np.pi, len(x))) ** 2
    g(x, t, a)

# map inks itself
scratch(0.05, 3.2, 0.035)
# coin drop with bounces
cd = AT["s1:Sekitar"] - 0.35 + 0.42
for i, d in enumerate((0, 0.26, 0.42, 0.53)):
    clink(cd + d, 0.11 * 0.6 ** i, 3100)
# panels turn like pages
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    page(K[k] - 0.25)
for a in ("s4:Harganya", "s5:Ada", "s7:Tahun"):
    page(AT[a] - 0.25)
# otters: soft water plops as they vanish
for x in np.linspace(AT["s2:berang-berang"] + 0.4, AT["s2:habis"] + 0.5, 12):
    g(M.band(M.burst(0.12, 30, 3), 200, 1400), x, 0.05)
g(M.thump(0.5), AT["s2:Krimea"], 0.22); g(M.lib("impact-bass-1"), AT["s2:Krimea"], 0.07)
# threat arrow, then the decision
scratch(AT["s3:Inggris"] - 0.2, 1.4, 0.04); g(M.lib("whoosh"), AT["s3:Inggris"], 0.04)
scratch(AT["s3:dijual"] - 0.1, 1.1, 0.04)
# watch ticks through the night, quill signatures, the seal
for x in np.arange(K["s4"], AT["s4:Jam"] + 0.4, 0.5):
    g(M.tone((3800,), 0.015, 300), x, 0.03)
g(M.tone((1568, 2093), 1.6, 2.5), AT["s4:Jam"], 0.05)
scratch(AT["s4:William"] - 0.1, AT["s4:Eduard"] - AT["s4:William"] - 0.15, 0.06)
scratch(AT["s4:Eduard"], AT["s4:perjanjian"] - AT["s4:Eduard"] - 0.1, 0.06)
g(M.thump(0.4), AT["s4:perjanjian"] + 0.3, 0.25)
# 72 coins into the pan
p0, p1 = AT["s4:Harganya"] + 0.2, AT["s4:dolar"] + 0.4
for i in range(72):
    clink(p0 + (i / 72) * (p1 - p0) + 0.28, 0.035 + 0.02 * rng.random(), 2300 + rng.uniform(0, 1400))
# Senate: tokens, gavel
v0, v37 = AT["s5:Senat"] + 0.3, AT["s5:37"] + 0.6
for i in range(37):
    g(M.band(M.burst(0.05, 70, 2), 900, 5000), v0 + (i / 37) * (v37 - v0) + 0.22, 0.04)
for i in range(2):
    g(M.band(M.burst(0.06, 60, 2), 700, 4000), AT["s5:dua"] + i * 0.18 + 0.22, 0.07)
gv = AT["s5:menyetujui"] + 0.18
g(M.thump(0.5), gv, 0.4); g(M.band(M.burst(0.08, 40, 2), 600, 4000), gv, 0.12); g(M.thump(0.3), gv + 0.16, 0.12)
# the mocking front page flips
page(AT["s5:penelusuran"], 0.1)
g(M.thump(0.35), AT["s5:mendukung"], 0.18)
# flag rope rattles while the soldiers pull
for a, b in ((AT["s6:tersangkut"] - 0.2, AT["s6:dan"]), (AT["s6:dan"], AT["s6:ketiga"]), (AT["s6:ketiga"], AT["s6:menurunkannya"] + 0.4)):
    for x in np.arange(a + 0.25, b, 0.11):
        g(M.tone((900 + rng.uniform(0, 600), 2400), 0.04, 70), x, 0.025)
        if rng.random() < 0.4:
            g(M.band(M.burst(0.03, 80, 2), 1500, 7000), x, 0.03)
g(M.lib("whoosh-short"), AT["s6:menurunkannya"] + 0.2, 0.05)
g(M.tone((587.3, 740, 880), 2.2, 1.2), AT["s6:menurunkannya"] + 0.9, 0.05)
# twelve calendar pages
for i in range(12):
    page(AT["s7:dua"] + i * 0.1 + 0.05, 0.05)
# statehood star stamp
y = AT["s7:1959"] + 0.45
g(M.lib("impact-bass-1"), y, 0.15); g(M.thump(0.8), y, 0.38); g(M.lib("chime"), y + 0.1, 0.05)
# coin returns, the question
clink(AT["s8:Dua"], 0.08, 3300)
g(M.lib("pop"), AT["s8:rugi"], 0.04); g(M.lib("pop"), AT["s8:masuk"], 0.04)
g(M.lib("chime"), OUT + 0.3, 0.06)
# candle room tone
room = M.band(rng.standard_normal(N), 150, 1200)
room /= np.abs(room).max()
M.fx += np.stack([room, np.roll(room, 900)], 1) * 0.006
M.finish(music)
print("duration", DUR)
