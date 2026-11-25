"""EP40 sound: a warm, hopeful dusk bed in D major (soft choir-like pad with no lyrics, slow pluck), prairie wind under
the road scenes, shuffling footsteps of the crowd, paper rustle and a tear for the 1939 protocol, bus engines, one
church-bell stroke at 19.00, a light-aircraft drone and helicopter flutter overhead, a stamp for "histeria" and for
11 March 1990. Run after node build-video.mjs."""
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
beat = 60 / 76

# D major: I - vi - IV - V, two bars each; "choir" = detuned sines with slow vibrato
prog = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 55, 59, 62], [45, 57, 61, 64]]
chord = lambda t: prog[int(t / (beat * 8)) % 4]
pad, pl = M.mono(), M.mono()
for t0 in np.arange(0.05, END + 1.5, beat * 8):
    n = int(beat * 8.6 * SR); tt = np.arange(n) / SR
    for m in chord(t0):
        f = hz(m + 12)
        v = sum(np.sin(2 * np.pi * f * d * tt + 0.3 * np.sin(2 * np.pi * 5.2 * tt)) for d in (0.997, 1.0, 1.004)) / 3
        env = np.minimum(1, tt / 1.2) * np.minimum(1, (tt[-1] - tt) / 1.0)
        M.lay(pad, v * env, t0, 0.35)
for k, t0 in enumerate(np.arange(beat * 8, END + 0.5, beat)):
    ch = chord(t0)
    M.lay(pl, M.note(hz(ch[(k * 2) % 4] + 12), 0.9, "pluck", 3.0), t0, 0.5 if k % 4 == 0 else 0.3)
pad = M.band(pad, 120, 3000)
for x in (pad, pl):
    x /= max(1e-6, np.abs(x).max())
e_all = M.env([(0, 0.0), (0.5, 0.75), (K["s3"], 0.7), (K["s3"] + 0.5, 0.55), (K["s4"], 0.8), (K["s5"], 0.9), (K["s7"], 0.85), (K["s8"], 1.0), (END, 1.0), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.6 * pad + 0.3 * pl) * e_all
music = stereo(mono, 0.08 * pl * e_all + 0.06 * pad * e_all)


def road_env():
    return M.env([(0, 0.0), (0.4, 1), (K["s2"] - 0.2, 1), (K["s2"], 0.15), (K["s5"] - 0.2, 0.15), (K["s5"], 1), (K["s6"] - 0.2, 1), (K["s6"], 0.15), (DUR, 0.1)])


# wind over open fields, louder on the road stage
w = M.band(rng.standard_normal(N), 90, 1400)
w /= np.abs(w).max()
w *= 0.6 + 0.4 * np.sin(2 * np.pi * T / 7.3 + 1) ** 2
re = road_env()
M.fx += np.stack([w * re, np.roll(w, 2100) * re], 1) * 0.03
# crowd murmur bed (band-limited noise with slow syllabic modulation), road stage only
cm = M.band(rng.standard_normal(N), 250, 2200)
cm /= np.abs(cm).max()
cm *= 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * T * 2.7)) * (0.5 + 0.5 * np.sin(2 * np.pi * T * 0.6))
M.fx += np.stack([cm * re, np.roll(cm, 900) * re], 1) * 0.012


def step(t, a=0.02):
    g(M.band(M.burst(0.06, 70, 2), 200, 3000), t, a)


def rustle(t, d=0.5, a=0.04):
    g(M.band(M.burst(d, 6, 1), 1800, 9000), t, a)


def bell(t, a=0.08):
    x = sum(M.tone((f,), 4.5, dec) * amp for f, dec, amp in ((392, 0.9, 1.0), (784, 1.4, 0.5), (931, 1.8, 0.35), (1175, 2.2, 0.25), (196, 0.7, 0.6)))
    g(x, t, a)


def drone(t0, t1, f0, a, flutter=0.0):
    n = int((t1 - t0) * SR); tt = np.arange(n) / SR
    env = np.sin(np.pi * np.clip(tt / (t1 - t0), 0, 1)) ** 1.5
    x = M.band(rng.standard_normal(n), f0 * 0.6, f0 * 6) * 0.5 + np.sign(np.sin(2 * np.pi * f0 * tt)) * 0.3
    if flutter:
        x *= 0.55 + 0.45 * (np.sin(2 * np.pi * flutter * tt) > 0)
    g(x / max(1e-6, np.abs(x).max()) * env, t0, a)


# s1 hook: footsteps settling, whoosh, chips
for i in range(10):
    step(0.2 + i * 0.27 + rng.random() * 0.1)
g(M.lib("whoosh-cinematic"), 0.05, 0.025)
g(M.lib("pop"), AT["s1:juta"], 0.035)
g(M.lib("impact-bass-1"), AT["s1:kilometer"], 0.045)
g(M.lib("chime"), AT["s1:damai"], 0.03)
# station changes
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.35, 0.03)
# s2: countries rise
for k in ("s2:Estonia", "s2:Latvia", "s2:Lituania"):
    g(M.thump(0.25), AT[k], 0.08); g(M.lib("click-soft"), AT[k] + 0.05, 0.03)
g(M.lib("glitch-1"), AT["s2:dikuasai"], 0.02); g(M.thump(0.4), AT["s2:dikuasai"], 0.1)
# s3: paper in, tear, stamp
rustle(AT["s3:Pakta"] - 0.4, 0.6, 0.05)
rustle(AT["s3:membagi"] - 0.05, 0.35, 0.09); g(M.band(M.burst(0.5, 9, 1), 900, 6000), AT["s3:membagi"], 0.06)
g(M.lib("pop"), AT["s3:Jerman"], 0.02); g(M.lib("pop"), AT["s3:Uni"], 0.02)
g(M.thump(0.3), AT["s3:menyangkal"], 0.13); g(M.lib("click"), AT["s3:menyangkal"], 0.04)
# s4: route drawn, town pings, buses
g(M.lib("riser"), AT["s4:Vilnius"] - 1.2, 0.02)
for k in ("s4:Vilnius", "s4:Riga", "s4:Tallinn"):
    g(M.lib("ping"), AT[k], 0.03)
for i in range(8):
    g(M.lib("click-soft"), AT["s4:jatah"] + i * 0.12, 0.025)
drone(AT["s4:bus"] - 0.6, K["s5"] - 0.1, 55, 0.05)
# s5: bell at 19.00, hands link (soft claps of cloth), plane and helicopter
bell(AT["s5:Pukul"] + 0.05, 0.09)
for i in range(14):
    g(M.band(M.burst(0.05, 60, 2), 600, 5000), AT["s5:bergandengan"] - 0.3 + i * 0.09, 0.012)
drone(AT["s5:Rekaman"] - 1.0, K["s6"] + 0.2, 95, 0.05)
drone(AT["s5:helikopter"] - 1.5, K["s6"] + 0.2, 70, 0.045, flutter=18)
# s6: counters
g(M.lib("riser"), AT["s6:satu"] - 0.9, 0.02); g(M.lib("pop"), AT["s6:dua"], 0.035)
for i in range(8):
    g(M.lib("click-soft"), AT["s6:delapan"] - 0.6 + i * 0.075, 0.025)
g(M.lib("sparkle"), AT["s6:dua#2"] + 0.2, 0.03); g(M.lib("chime"), AT["s6:ribu"], 0.03)
# s7: newspaper, protocol admitted, independence
rustle(K["s7"] + 0.1, 0.5, 0.06)
g(M.thump(0.3), AT["s7:histeria"], 0.12); g(M.lib("glitch-2"), AT["s7:histeria"], 0.02)
rustle(AT["s7:Desember"] - 0.4, 0.4, 0.05)
g(M.thump(0.3), AT["s7:mengakui"] + 0.25, 0.12); g(M.lib("click"), AT["s7:mengakui"] + 0.25, 0.04)
g(M.lib("riser"), AT["s7:sebelas"] - 1.0, 0.025); g(M.lib("impact-bass-1"), AT["s7:sebelas"] + 0.2, 0.05)
bell(AT["s7:merdeka"], 0.05)
# s8: wide pull-back, outro
g(M.lib("whoosh-cinematic"), AT["s8:Tangan"] - 0.4, 0.025)
g(M.lib("sparkle"), AT["s8:Eropa"], 0.025)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
