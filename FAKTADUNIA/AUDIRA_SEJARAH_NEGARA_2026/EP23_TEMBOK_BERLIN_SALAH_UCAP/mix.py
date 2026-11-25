"""EP23 sound: a noir night in D minor at 72 bpm. A plucked double bass walks under a muted brush-snare pulse and a dark
string pad; a wall clock ticks through the press room and speeds up toward "segera", where the band stops for one
beat and a low hit lands. From the TV the pad brightens; with the crowd the bass walks faster, and when the gate opens
the harmony lifts to D major. Foley: wind and a searchlight hum outside, distant crowd murmur that grows, paper slides,
a rubber stamp, camera flashes (pop + whine), TV static, the steel gate creaking open, footsteps. No voice here; the
voice is mixed in later. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1989)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 72
c3, c6, c6b = AT["s3:November"], AT["s6:Berita"], AT["s6:Warga"]
seg, opn = AT["s5:segera"], AT["s7:membuka"]
major = opn + 0.4

# --- score ---
minor = [[38, 53, 57, 62], [34, 53, 58, 62], [31, 55, 58, 62], [33, 52, 57, 61]]   # Dm Bb Gm A
majc = [[38, 54, 57, 62], [43, 55, 59, 62], [35, 54, 59, 62], [45, 52, 57, 61]]    # D G Bm A
bar = beat * 4
chord = lambda t: (majc if t >= major else minor)[int(t / bar) % 4]

def string(f, d, bright=1.0):
    tt = np.arange(int(d * SR)) / SR
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.003 * np.sin(2 * np.pi * 4.7 * tt))) / SR
    x = sum(np.sin(h * ph) / h ** (1.5 - 0.4 * bright) for h in range(1, 7))
    return x * np.minimum(1, tt / 0.8) * np.minimum(1, (d - tt) / 0.8)

def dbass(f, d):
    tt = np.arange(int(d * SR)) / SR
    x = np.sin(2 * np.pi * f * tt) + 0.45 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 6) + 0.2 * np.sin(6 * np.pi * f * tt) * np.exp(-tt * 9)
    return x * np.exp(-tt * 2.6) * np.minimum(1, tt / 0.006) * np.minimum(1, (d - tt) / 0.02)

pad, bass, kit = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.0, DUR, bar):
    ch = chord(t0 + 0.01)
    for m in ch[1:]:
        M.lay(pad, string(hz(m), bar + 0.9, 1.4 if t0 >= c6 else 0.7), t0, 0.3)
# walking bass: quarter notes, eighths once the crowd moves; rests for one beat at "segera"
walk_steps = [0, 7, 5, 3]
t = 0.0
while t < END + 1.5:
    if seg - 0.3 < t < seg + beat - 0.1:
        t += beat / 2; continue
    fast = c6b <= t < END
    ch = chord(t + 0.01)
    k = int(t / beat) % 4
    m = ch[0] + walk_steps[k] + (12 if fast and int(t / (beat / 2)) % 2 else 0)
    M.lay(bass, dbass(hz(m), beat * 0.9), t, 0.9)
    t += beat / 2 if fast else beat
# brushes: a soft swish on 2 and 4 (noir pulse), off during the hook's first bar and the "segera" rest
for k, t0 in enumerate(np.arange(bar, END + 1, beat)):
    if seg - 0.3 < t0 < seg + beat: continue
    sw = M.band(M.burst(0.22, 14, 2), 2500, 9000)
    M.lay(kit, sw, t0, 0.5 if k % 2 else 0.25)
# low hit on "segera", softer one on the gate
def hit(t0, a):
    tt = np.arange(int(1.8 * SR)) / SR
    x = np.sin(2 * np.pi * (hz(26) * tt + 20 * (1 - np.exp(-tt * 18)) / 18)) * np.exp(-tt * 2.2)
    M.lay(bass, x * a, t0, 1.0)
hit(seg - 0.02, 1.4); hit(opn, 0.9); hit(0.05, 0.9)
pad, bass, kit = M.band(pad, 70, 3000), M.band(bass, 35, 1800), kit
for x in (pad, bass, kit):
    x /= max(1e-6, np.abs(x).max())
e_pad = M.env([(0, 0.5), (c6, 0.55), (c6 + 2, 0.8), (major, 0.85), (major + 2, 1.0), (END, 1.0), (DUR - 0.4, 0), (DUR, 0)])
e_bass = M.env([(0, 0.85), (END, 0.85), (END + 1.5, 0.3), (DUR - 0.4, 0), (DUR, 0)])
e_kit = M.env([(0, 0.0), (bar, 0.6), (END, 0.6), (END + 1, 0), (DUR, 0)])
mono = 0.42 * pad * e_pad + 0.62 * bass * e_bass + 0.16 * kit * e_kit
music = stereo(mono, 0.06 * pad * e_pad + 0.05 * kit * e_kit)

# --- foley ---
def tick(t0, a=0.03, hi=True):
    g(M.band(M.burst(0.02, 220, 1), 2500 if hi else 1500, 9000), t0, a); g(M.tone((2100 if hi else 1500,), 0.03, 90), t0, a * 0.4)

def flashpop(t0, a=0.05):
    g(M.band(M.burst(0.05, 80, 1), 1200, 9000), t0, a)
    tt = np.arange(int(0.6 * SR)) / SR
    g(np.sin(2 * np.pi * (3200 * tt + 1500 * tt * tt)) * np.exp(-tt * 6) * 0.15, t0 + 0.02, a)

def paper(t0, d=0.5, a=0.04):
    x = M.band(rng.standard_normal(int(d * SR)), 1500, 7000)
    tt = np.arange(len(x)) / SR
    g(x * np.sin(np.pi * tt / d) / np.abs(x).max(), t0, a)

def creak(t0, d=2.4, a=0.07):
    tt = np.arange(int(d * SR)) / SR
    f = 140 + 60 * np.sin(2 * np.pi * 0.7 * tt) + 30 * tt
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * tt))
    x = M.band(x, 200, 3000) * np.minimum(1, tt / 0.2) * np.minimum(1, (d - tt) / 0.4)
    g(x / np.abs(x).max(), t0, a)

def clank(t0, a=0.12):
    g(M.thump(0.4), t0, a); g(M.tone((180, 271, 433), 0.8, 7), t0, a * 0.4); g(M.tone((1310, 1890), 0.4, 12), t0, a * 0.1)

# outdoor bed: wind + searchlight hum (EXT segments), rain-free night
ext = M.env([(0, 1), (c3 - 0.3, 1), (c3, 0), (c6b, 0), (c6b + 0.3, 1), (END, 1), (DUR - 0.4, 0), (DUR, 0)])
wind = M.band(rng.standard_normal(N), 90, 900)
wind = wind / np.abs(wind).max() * (0.7 + 0.3 * np.sin(2 * np.pi * 0.09 * T))
hum = np.sin(2 * np.pi * 100 * T) * 0.5 + np.sin(2 * np.pi * 200 * T) * 0.2
M.fx += np.stack([wind * ext, np.roll(wind, 700) * ext], 1) * 0.02
M.fx += np.stack([hum * ext, hum * ext], 1) * 0.0035
# towers switch on
for i in range(8):
    g(M.lib("click"), AT["s2:dijaga"] + i * 0.18, 0.03)
g(M.lib("whoosh-cinematic"), AT["s2:Panjangnya"] - 0.4, 0.035)
# set changes: blinds rattle shut and open
for c in (c3, c6, c6b):
    for k in range(12):
        tick(c - 0.48 + k * 0.03, 0.02, False)
    g(M.lib("whoosh-short"), c - 0.1, 0.04)
# office: paper, stamp
paper(c3 + 0.2, 0.8, 0.04)
st = AT["s3:keesokan"]
g(M.thump(0.25), st, 0.12); g(M.band(M.burst(0.1, 40, 3), 300, 3000), st, 0.06)
# press room: room tone, clock ticks (speeding up to "segera"), flashes, murmur
room = M.env([(0, 0), (c3, 0), (c3 + 0.4, 1), (c6 - 0.2, 1), (c6, 0), (DUR, 0)])
rt = M.band(rng.standard_normal(N), 120, 1600); rt /= np.abs(rt).max()
M.fx += np.stack([rt * room, np.roll(rt, 300) * room], 1) * 0.006
t0, step = AT["s4:Sembilan"], 1.0
while t0 < seg - 0.1:
    left = seg - t0
    step = 1.0 if t0 < AT["s5:Ditanya"] else max(0.32, min(1.0, left / 4))
    tick(t0, 0.028); t0 += step
for k in range(4):
    tick(seg + 1.5 + k, 0.02)
for k in range(3):
    flashpop(AT["s4:konferensi"] - 0.1 + k * 0.6, 0.04)
for k in range(6):
    flashpop(seg + 0.05 + k * 0.23, 0.045)
g(M.lib("whoosh"), AT["s5:Jam"] - 0.25, 0.03)
paper(AT["s4:secarik"] - 0.2, 0.7, 0.05)
paper(AT["s5:membacakan"], 0.5, 0.03)
mur = M.band(rng.standard_normal(N), 250, 2200); mur /= np.abs(mur).max()
mur *= 0.6 + 0.4 * np.sin(2 * np.pi * 1.7 * T) * np.sin(2 * np.pi * 0.43 * T)
press = M.env([(0, 0), (AT["s4:Sembilan"], 0), (AT["s4:Sembilan"] + 1, 0.4), (seg - 1, 0.25), (seg, 0.0), (seg + 0.4, 1.0), (c6 - 0.2, 1.0), (c6, 0), (DUR, 0)])
M.fx += np.stack([mur * press, np.roll(mur, 900) * press], 1) * 0.012
# flat: TV static and a news jingle-like tone (no real jingle)
tv = M.env([(0, 0), (c6, 0), (c6 + 0.2, 1), (c6b - 0.2, 1), (c6b, 0), (DUR, 0)])
st_ = M.band(rng.standard_normal(N), 3000, 9000); st_ /= np.abs(st_).max()
M.fx += np.stack([st_ * tv, st_ * tv], 1) * 0.004
for k, m in enumerate([74, 77, 81]):
    g(M.tone((hz(m), hz(m) * 2), 0.5, 4), AT["s6:Jam"] + k * 0.18, 0.03)
# crowd: grows from c6b, cheer at the gate
crowd = M.env([(0, 0), (c6b, 0), (c6b + 1.5, 0.5), (AT["s7:Sekitar"], 0.9), (opn, 1.0), (opn + 1.5, 1.6), (END, 1.2), (DUR - 0.4, 0), (DUR, 0)])
cr = M.band(rng.standard_normal(N), 180, 2600); cr /= np.abs(cr).max()
cr *= 0.65 + 0.35 * np.sin(2 * np.pi * 2.3 * T) * np.sin(2 * np.pi * 0.31 * T)
M.fx += np.stack([cr * crowd, np.roll(cr, 1300) * crowd], 1) * 0.014
for i in range(80):
    tf = c6b + i * (END - c6b) / 80
    g(M.band(M.burst(0.05, 70, 2), 300, 2500), tf + rng.random() * 0.2, 0.012)
# gate: boom lifts, gate creaks open, clank on full open
g(M.lib("click"), opn - 0.9, 0.05); creak(opn - 0.2, 2.6, 0.06); clank(opn + 2.4, 0.1)
g(M.lib("riser"), opn - 1.6, 0.03)
# payoff and outro
g(M.lib("impact-bass-1"), AT["s8:segera"], 0.04)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
