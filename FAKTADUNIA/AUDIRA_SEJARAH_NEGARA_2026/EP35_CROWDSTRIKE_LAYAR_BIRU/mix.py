"""EP35 sound: a clean, cold electronic bed in E minor (soft saw pad, muted pulse arp, server-room hum) that drops out
on every glitch burst. SFX: data blips as the packet travels, a cascade of error tones as the monitor wall flips,
a hard crash (bass + glitch) at the kernel, a reboot chirp and second crash for the bootloop, departure-board flaps,
a reverse whoosh when the update is pulled, keyboard typing for the manual fix and the 48-digit key, a soft chime when
screens come back. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(3535)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 104

# E minor: i - VI - III - VII
prog = [[40, 52, 55, 59], [36, 48, 52, 55], [43, 50, 55, 59], [38, 50, 54, 57]]
chord = lambda t: prog[int(t / (beat * 8)) % 4]
pad, arp, hum = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 1.5, beat * 8):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 8.4, "saw", 0.4, 0.8), t0, 0.3)
for k, t0 in enumerate(np.arange(beat * 2, END + 0.5, beat / 2)):
    ch = chord(t0)
    f = hz(ch[1 + (k * 3) % 3] + 12)
    M.lay(arp, M.tone((f, f * 2.01), 0.18, 22), t0, 0.5 if k % 4 == 0 else 0.25)
hum_sig = M.band(rng.standard_normal(N), 90, 400) + 0.4 * np.sin(2 * np.pi * 120 * T)
hum = hum_sig / np.abs(hum_sig).max()
pad = M.band(pad, 80, 2200)
for x in (pad, arp):
    x /= max(1e-6, np.abs(x).max())

# glitch dropouts: music ducks hard during bursts
bursts = [AT["s1:software"], AT["s3:crash"], AT["s4:crash"]] + [K[k] - 0.14 for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8")]
duck = np.ones(N)
for b in bursts:
    i0, i1 = int(max(0, b) * SR), int(min(DUR, b + 0.3) * SR)
    duck[i0:i1] = 0.15
duck = np.convolve(duck, np.ones(400) / 400, mode="same")
s3, s6, s7, s8 = K["s3"], K["s6"], K["s7"], K["s8"]
e_all = M.env([(0, 0.0), (0.3, 0.75), (s3, 0.8), (AT["s3:crash"], 0.9), (s6, 0.7), (s7, 0.8), (s8, 0.85), (END, 0.9), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.45 * pad + 0.32 * arp) * e_all * duck
music = stereo(mono, 0.06 * arp * e_all * duck)
he = M.env([(0, 0.0), (0.4, 1.0), (DUR - 0.5, 0.8), (DUR, 0)])
M.fx += np.stack([hum * he, np.roll(hum, 900) * he], 1) * 0.012


def blip(t, f=1800, a=0.025):
    g(M.tone((f, f * 1.5), 0.07, 40), t, a)


def err(t, a=0.02):
    g(M.tone((620, 465), 0.16, 14), t, a)


def keys(t0, t1, a=0.03):
    q = np.random.default_rng(int(t0 * 100))
    t = t0
    while t < t1:
        g(M.band(M.burst(0.025, 300, 1), 1800, 7000), t, a * (0.6 + 0.4 * q.random()))
        t += 0.07 + q.random() * 0.09


# s1 hook: packet falls, impact, wall cascade of error tones
g(M.lib("riser"), 0.0, 0.02)
g(M.lib("whoosh-short"), max(0.0, AT["s1:software"] - 0.5), 0.03)
g(M.lib("impact-bass-1"), AT["s1:software"], 0.07); g(M.lib("glitch-1"), AT["s1:software"], 0.05)
for i in range(14):
    err(AT["s1:software"] + 0.12 + i * 0.13, 0.014 + 0.002 * (i % 3))
g(M.lib("glitch-2"), AT["s1:Delapan"], 0.03)
# station cuts
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("glitch-3"), K[k] - 0.14, 0.03); g(M.lib("whoosh-short"), K[k] - 0.3, 0.02)
# s2: clock tick, packet out
g(M.lib("click"), AT["s2:sebelas"], 0.04)
g(M.lib("whoosh-cinematic"), AT["s2:mengirim"] - 0.3, 0.025)
for i in range(10):
    blip(AT["s2:mengirim"] + i * 0.3, 1500 + 120 * (i % 4), 0.018)
# s3: kernel glow, file drop, corruption, pointer, crash
g(M.lib("chime"), AT["s3:kernel"], 0.025)
g(M.lib("pop"), AT["s3:Channel"], 0.04)
g(M.lib("glitch-2"), AT["s3:rusak"], 0.04); g(M.lib("error"), AT["s3:rusak"] + 0.1, 0.03)
for i in range(8):
    blip(AT["s3:membaca"] + i * 0.16, 900 + 90 * i, 0.02)
g(M.lib("riser"), AT["s3:luar"] - 0.6, 0.025)
g(M.lib("impact-bass-1"), AT["s3:crash"], 0.09); g(M.lib("glitch-1"), AT["s3:crash"], 0.06); g(M.thump(0.4), AT["s3:crash"], 0.12)
# s4: reboot chirp, crash again, departure flaps, error tones per monitor
g(M.tone((440, 880), 0.35, 6), K["s4"] + 0.5, 0.025)
g(M.lib("glitch-3"), AT["s4:crash"], 0.05); g(M.lib("error"), AT["s4:crash"], 0.035)
for i in range(6):
    g(M.band(M.burst(0.05, 120, 1), 800, 4000), AT["s4:Delta"] + i * 0.35, 0.05)
for k in ("s4:Penerbangan", "s4:Bank", "s4:rumah", "s4:layanan", "s4:AirAsia"):
    err(AT[k] + 0.3, 0.025)
# s5: counter ticks, reverse whoosh, failed reboots
for i in range(8):
    g(M.lib("click-soft"), AT["s5:Tujuh"] + i * 0.17, 0.02)
g(M.lib("whoosh-cinematic"), AT["s5:ditarik"] - 0.2, 0.03); g(M.lib("ping"), AT["s5:ditarik"], 0.03)
for i in range(4):
    g(M.tone((330, 660), 0.25, 8), 54.0 + i * 0.8, 0.015)
# s6: footsteps, typing, safe mode, cleared screens, the 48-digit key
for i in range(6):
    g(M.band(M.burst(0.04, 90, 2), 120, 900), K["s6"] + 0.2 + i * 0.38, 0.04)
keys(AT["s6:mode"] - 0.3, AT["s6:menghapus"] + 0.6, 0.025)
g(M.lib("chime"), AT["s6:menghapus"] + 0.9, 0.03)
g(M.lib("typing"), AT["s6:kunci"], 0.03)
keys(AT["s6:kunci"], AT["s6:digit"] + 0.4, 0.03)
g(M.lib("sparkle"), AT["s6:mesin"], 0.02)
# s7: stamp, blue cube rises, gold column
g(M.lib("impact-bass-1"), AT["s7:bukan"], 0.045); g(M.lib("pop"), AT["s7:bukan"], 0.03)
g(M.lib("pop"), AT["s7:kurang"], 0.035); blip(AT["s7:satu"], 2200, 0.03)
g(M.lib("click"), AT["s7:bandara"], 0.03); g(M.lib("click"), AT["s7:bank"], 0.03)
g(M.lib("riser"), AT["s7:sekitar"] - 0.4, 0.025); g(M.lib("impact-bass-1"), AT["s7:lima#2"], 0.04)
# s8: wall restores, last ripple, outro
for i in range(10):
    g(M.tone((1320 + 40 * i,), 0.12, 25), K["s8"] + 0.4 + i * 0.12, 0.012)
g(M.lib("glitch-2"), AT["s8:merambat"] - 0.3, 0.035)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
