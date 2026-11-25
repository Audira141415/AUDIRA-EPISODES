"""EP26 sound: a warm terrarium score. A soft plucked harp/guitar arpeggio in G major at 76 bpm over a low pad,
a gentle river bed under everything with faint birdsong, and glass. Every time the calendar dial turns there is a
ratchet of brass clicks, and every flag flip lands on a glass clink (the jar). Foley: water for the river, ruler
slides, paper flicks for the 24 meetings, a quill and wax seal for the treaty, small bells for the royal pair, a coin
ring for the viceroy badge, a small stamp for the no-entry sign, broom swishes, an outboard motor hum for the patrol
boat, a soft wing flutter and a buzzer-free "no" thud for the pheasant, crickets at dusk. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1659)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 76

# --- score: G - Em - C - D arpeggios ---
CH = [[55, 59, 62, 67, 71], [52, 55, 59, 64, 67], [48, 52, 55, 60, 64], [50, 54, 57, 62, 66]]
arp, pad, bass = M.mono(), M.mono(), M.mono()
q = np.random.default_rng(26)
for bar, t0 in enumerate(np.arange(0.2, DUR - 1.0, beat * 4)):
    ch = CH[bar % 4]
    M.lay(bass, M.note(hz(ch[0] - 12), beat * 4, "sine", 0.6, 0.02), t0, 0.8)
    for k, m in enumerate([0, 1, 2, 3, 4, 3, 2, 1]):
        t = t0 + k * beat / 2
        M.lay(arp, M.note(hz(ch[m]), 1.6, "pluck", 2.4, 0.003), t, 0.55 if k % 2 == 0 else 0.4)
    for m in ch[:3]:
        M.lay(pad, M.note(hz(m), beat * 4 + 0.6, "tri", 0.15, 0.6), t0, 0.22)
pad = M.band(pad, 80, 2200)
for x in (arp, pad, bass):
    x /= max(1e-6, np.abs(x).max())
s5, s7, s8 = K["s5"], K["s7"], K["s8"]
e_arp = M.env([(0, 0.0), (0.5, 0.7), (s7 - 0.3, 0.7), (s7 + 0.4, 0.4), (AT["s7:Lucunya"], 0.4), (AT["s7:Lucunya"] + 0.8, 0.7), (END, 0.75), (DUR - 0.4, 0), (DUR, 0)])
e_pad = M.env([(0, 0.6), (END, 0.8), (DUR - 0.4, 0), (DUR, 0)])
mono = 0.45 * arp * e_arp + 0.35 * pad * e_pad + 0.3 * bass * e_pad
music = stereo(mono, 0.08 * arp * e_arp)

# --- foley helpers ---
def clink(t, a=0.05, f=2350):
    g(M.tone((f, f * 2.71, f * 4.9, f * 1.5), 1.6, 4.5), t, a)

def click(t, a=0.03):
    g(M.band(M.burst(0.03, 200, 1), 2000, 8000), t, a); g(M.tone((1800,), 0.03, 80), t, a * 0.5)

def rustle(t, d=0.3, a=0.04):
    x = M.band(rng.standard_normal(int(d * SR)), 1200, 8000)
    tt = np.arange(len(x)) / SR
    x *= np.minimum(1, tt / 0.03) * np.minimum(1, (d - tt) / 0.15)
    g(x / np.abs(x).max(), t, a)

def bell(t, f=1568, a=0.035):
    g(M.tone((f, f * 2.76, f * 5.4), 1.4, 3.5), t, a)

def thunk(t, a=0.1):
    g(M.band(M.burst(0.12, 40, 3), 90, 900), t, a); g(M.tone((140, 210), 0.15, 25), t, a * 0.6)

# calendar turns and flag flips (same schedule as world3d.js EV)
flips = [AT["s1:berganti"], AT["s1:Prancis"], AT["s4:bersama"], AT["s5:Februari"] + 0.25, AT["s5:Agustus"] + 0.25,
         AT["s6:Irun"], AT["s6:Hendaye"], AT["s8:Satu"], AT["s8:dua"], AT["s8:berbagi"]]
prev = 0.0
for te in flips:
    d = min(1.1, max(0.5, (te - prev) * 0.6))
    n = int(d * 14)
    for i in range(n):
        click(te - d + i * d / n, 0.022)
    clink(te, 0.05, 2350 + 180 * (len(str(te)) % 3))
    g(M.lib("whoosh-short"), te - 0.25, 0.012)
    prev = te
clink(0.15, 0.06)
# s2: river, rulers
w = M.band(rng.standard_normal(int(3.0 * SR)), 300, 2600)
tt = np.arange(len(w)) / SR
w *= np.minimum(1, tt / 0.5) * np.minimum(1, (3 - tt) / 0.8) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.3 * tt))
g(w / np.abs(w).max(), AT["s2:Bidasoa"] - 0.5, 0.03)
for k in ("s2:dua", "s2:empat"):
    g(M.band(rng.standard_normal(int(0.6 * SR)), 2500, 9000) * np.linspace(0.2, 1, int(0.6 * SR)) * np.linspace(1, 0, int(0.6 * SR)), AT[k] - 0.25, 0.02)
    g(M.tone((1320, 1980), 0.5, 7), AT[k] + 0.35, 0.025)
# s3: figures pop, 24 sheets, treaty + seal + monolith bell
for k in ("s3:Luis", "s3:Mazarin"):
    g(M.lib("pop"), AT[k] - 0.3, 0.03)
t24 = AT["s3:dua"] - 0.1
for i in range(24):
    rustle(t24 + i * (AT["s3:kali"] + 0.4 - t24) / 24, 0.08, 0.018)
rustle(AT["s3:Perjanjian"] - 0.1, 0.5, 0.04)
thunk(AT["s3:Perjanjian"] + 0.4, 0.12)
bell(AT["s3:Pyrenees"] if "s3:Pyrenees" in AT else AT["s3:Perjanjian"] + 0.6, 1175, 0.04)
# s4: royal pair
bell(AT["s4:Louis"] - 0.2, 1568, 0.035); bell(AT["s4:putri"] - 0.2, 1976, 0.035)
# s5: big ring turns get a soft gong-like low tone
for k in ("s5:Februari", "s5:Agustus"):
    g(M.tone((98, 147, 196), 2.5, 1.6), AT[k] + 0.25, 0.05)
# s6: viceroy badge coin ring, Loti pop, towns
g(M.tone((2637, 3951, 5274, 6200), 2.2, 2.8), AT["s6:raja"], 0.04)
g(M.lib("whoosh"), AT["s6:raja"] - 0.4, 0.025)
g(M.lib("pop"), AT["s6:Pierre"] - 0.3, 0.03)
for k in ("s6:Irun", "s6:Hendaye"):
    g(M.lib("chime"), AT[k], 0.025)
# s7: sign stamp, broom, motor, pheasant
thunk(AT["s7:Tidak"] - 0.1, 0.14)
for i in range(6):
    rustle(AT["s7:petugas"] + i * 0.4, 0.25, 0.022)
tb = AT["s7:patroli"] - 0.6
dm = DUR - tb
tt = np.arange(int(dm * SR)) / SR
mot = np.sin(2 * np.pi * 62 * tt + 3 * np.sin(2 * np.pi * 7 * tt)) + 0.5 * np.sin(2 * np.pi * 124 * tt)
mot = M.band(mot + 0.3 * rng.standard_normal(len(tt)), 50, 900)
mot *= np.minimum(1, tt / 0.8) * np.interp(tt + tb, [tb, AT["s7:Lucunya"], AT["s7:Lucunya"] + 1.0, END, DUR], [1, 1, 0.35, 0.25, 0])
g(mot / np.abs(mot).max(), tb, 0.025)
fl = M.band(rng.standard_normal(int(0.5 * SR)), 300, 3000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 18 * np.arange(int(0.5 * SR)) / SR)))
g(fl / np.abs(fl).max() * np.linspace(1, 0, len(fl)), AT["s7:burung"] - 0.3, 0.03)
thunk(AT["s7:tidak"], 0.13); g(M.thump(0.25), AT["s7:tidak"], 0.06)
# s8: payoff
g(M.lib("whoosh-cinematic"), K["s8"] - 0.3, 0.03)
g(M.lib("sparkle"), AT["s8:tiga"], 0.02)
g(M.lib("chime"), OUT + 0.3, 0.06)

# --- ambience: river bed + birds; crickets at dusk ---
riv = M.band(rng.standard_normal(N), 200, 3200)
riv /= np.abs(riv).max()
riv *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.21 * T)
e_riv = np.interp(T, [0, 1, END, DUR - 0.3, DUR], [0, 1, 0.8, 0, 0])
M.fx += np.stack([riv, np.roll(riv, 700)], 1) * (0.006 * e_riv)[:, None]
for t0 in np.arange(1.5, s7, 3.7):
    f0 = 3200 + rng.random() * 1400
    d = 0.09
    tt = np.arange(int(d * SR)) / SR
    chirp = np.sin(2 * np.pi * (f0 * tt + 6000 * tt * tt)) * np.sin(np.pi * tt / d)
    for r in range(int(2 + rng.random() * 3)):
        g(chirp, t0 + r * 0.13, 0.006)
tt = np.arange(N) / SR
cr = np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 28 * tt) > 0.6) * (np.sin(2 * np.pi * 0.8 * tt) > 0)
e_cr = np.interp(T, [0, s8 - 1, s8 + 1.5, END, DUR - 0.3, DUR], [0, 0, 1, 1, 0, 0])
M.fx += np.stack([cr, np.roll(cr, 400)], 1) * (0.004 * e_cr)[:, None]
M.finish(music)
print("duration", DUR)
