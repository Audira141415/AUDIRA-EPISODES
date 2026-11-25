"""EP52 sound: a restrained documentary bed in E minor (soft string pad, sparse low piano, slow pulse), harbour
ambience (wind, distant gulls, foghorn) under the morning, a dull hull bump, benzol drums splitting, crackling fire
that grows with the 20-minute clock (soft ticking), morse telegraph clicks, the blast (deep low boom, long rumble,
no harsh stinger), a wash of water, then quiet wind and snow, a train bell for the relief train, and warm bells for
the Christmas tree. Calm under the casualty line. One soft seismograph blip per device pin. Run after build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1917)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 66

# E minor: i - VI - III - VII
prog = [[40, 52, 55, 59], [36, 48, 52, 55], [43, 50, 55, 59], [38, 50, 54, 57]]
chord = lambda t: prog[int(t / (beat * 4)) % 4]
pad, pno, sub = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 2, beat * 4):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 4.4, "saw", 0.22, 0.3), t0, 0.2)
for k, t0 in enumerate(np.arange(beat * 2, END + 0.5, beat)):
    if k % 4 in (1, 3):
        continue
    ch = chord(t0)
    M.lay(pno, M.note(hz(ch[1 + (k // 2) % 3] + 12), 1.8, "pluck", 2.0), t0, 0.45)
for t0 in np.arange(0.05, END + 1, beat * 2):
    M.lay(sub, M.note(hz(chord(t0)[0] - 12), beat * 1.6, "sine", 1.4, 0.05), t0, 0.55)
pad = M.band(pad, 60, 1300)
for x in (pad, pno, sub):
    x /= max(1e-6, np.abs(x).max())
tE1, tE2, hit = AT["s1:ledakan"], AT["s6:meledak"], AT["s4:bertabrakan"]
e_all = M.env([(0, 0.0), (0.4, 0.55), (tE1 - 0.3, 0.6), (tE1, 0.2), (K["s2"], 0.65), (hit, 0.75), (tE2 - 0.4, 0.85), (tE2, 0.15),
               (tE2 + 3, 0.55), (K["s7"], 0.45), (AT["s7:Vince"], 0.5), (K["s8"], 0.75), (END, 0.85), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.5 * pad + 0.3 * pno + 0.25 * sub) * e_all
music = stereo(mono, 0.05 * pno * e_all + 0.05 * pad * e_all)


def blip(t, a=0.02):
    g(M.tone((1320, 1980), 0.09, 30), t, a)


def morse(t0, a=0.02):
    pat = "-.-- .. -.-. ...."  # rhythm only
    t = t0
    for c in pat:
        if c == " ":
            t += 0.12; continue
        d = 0.06 if c == "." else 0.16
        n = int(d * SR); tt = np.arange(n) / SR
        s = np.sin(2 * np.pi * 820 * tt) * np.minimum(1, np.minimum(tt, d - tt) / 0.004)
        g(s, t, a); t += d + 0.06


def crackle(t0, dur, a):
    n = int(dur * SR)
    x = np.zeros(n)
    k = rng.integers(0, n, int(dur * 90))
    x[k] = rng.uniform(-1, 1, len(k))
    x = M.band(x, 900, 7000) + 0.25 * M.band(rng.standard_normal(n), 80, 500)
    x *= np.minimum(1, np.arange(n) / (1.5 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.3 * SR))
    g(x / max(1e-6, np.abs(x).max()), t0, a)


def boom(t, a):
    g(M.thump(0.9), t, a); g(M.lib("impact-bass-1"), t, a * 0.5)
    n = int(6 * SR); r = M.band(rng.standard_normal(n), 25, 300) * np.exp(-np.arange(n) / (2.2 * SR)) * np.minimum(1, np.arange(n) / (0.05 * SR))
    g(r / np.abs(r).max(), t + 0.05, a * 0.7)


def wash(t, dur, a):
    n = int(dur * SR); s = M.band(rng.standard_normal(n), 200, 3000) * np.sin(np.pi * np.arange(n) / n) ** 1.5
    g(s / np.abs(s).max(), t, a)


# harbour ambience: wind + gulls, quieter in the aftermath, colder in s7
wind = M.band(rng.standard_normal(N), 120, 1500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.06 * T))
for k in range(8):
    t0 = rng.uniform(9, 45)
    n = int(0.45 * SR); tt = np.arange(n) / SR
    gl = np.sin(2 * np.pi * np.cumsum(1500 + 600 * np.sin(np.pi * tt / 0.45)) / SR) * np.sin(np.pi * tt / 0.45) ** 2
    i0 = int(t0 * SR); wind[i0:i0 + n] += gl[: N - i0] * 0.2
wind *= M.env([(0, 0), (0.5, 0.5), (K["s2"], 0.7), (tE2, 0.6), (tE2 + 0.3, 0.1), (K["s7"], 0.5), (AT["s7:badai"], 0.95), (K["s8"], 0.5), (DUR - 0.5, 0.4), (DUR, 0)])
wind /= max(1e-6, np.abs(wind).max())
M.fx += np.stack([wind, np.roll(wind, 1700)], 1) * 0.016
horn = np.sin(2 * np.pi * 98 * np.arange(int(2.2 * SR)) / SR) + 0.4 * np.sin(2 * np.pi * 147 * np.arange(int(2.2 * SR)) / SR)
horn *= np.sin(np.pi * np.arange(len(horn)) / len(horn)) ** 0.6
g(M.band(horn, 60, 900), K["s2"] + 0.8, 0.03)
g(M.band(horn, 60, 900), AT["s3:Mont-Blanc"], 0.025)

# s1 hook: bump, fire, ticking, blast
g(M.thump(0.4), AT["s1:pelan"], 0.08)
g(M.band(M.burst(0.5, 8, 2), 200, 2000), AT["s1:pelan"] + 0.02, 0.04)
crackle(AT["s1:pelan"] + 0.5, tE1 - AT["s1:pelan"] - 0.5, 0.025)
for i in range(int((tE1 - AT["s1:Dua#2"]) / 0.25)):
    g(M.lib("click-soft"), AT["s1:Dua#2"] + i * 0.25, 0.012)
g(M.lib("riser"), tE1 - 1.4, 0.022)
boom(tE1, 0.2)
wash(tE1 + 1.2, 2.5, 0.03)
for k in ("s1:ledakan", "s1:saat"):
    g(M.lib("pop"), AT[k], 0.02)
for k in ("s2", "s3", "s4", "s5", "s6", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.3, 0.022)
# s3 manifest stamps
for k in ("s3:TNT", "s3:pikrat", "s3:bensol"):
    g(M.lib("click"), AT[k], 0.022)
# s4 collision, drums split, sparks, fire grows with the clock
g(M.thump(0.45), hit, 0.1); g(M.band(M.burst(0.7, 6, 2), 150, 1800), hit + 0.02, 0.05)
g(M.band(M.burst(0.25, 30, 1), 1200, 8000), AT["s4:pecah"], 0.04)
g(M.lib("sparkle"), AT["s4:percikan"], 0.02)
crackle(AT["s4:percikan"], tE2 - AT["s4:percikan"], 0.03)
for i in range(int((tE2 - hit) / 0.5)):
    g(M.lib("click-soft"), hit + i * 0.5, 0.008 + 0.01 * i / ((tE2 - hit) / 0.5))
# s5 oars, telegraph, train brake
for i in range(6):
    wash(AT["s5:Awak"] + 0.3 + i * 0.7, 0.35, 0.01)
morse(AT["s5:mengirim"], 0.018)
morse(AT["s5:menghentikan"], 0.016)
g(M.band(M.burst(1.2, 2, 2), 2500, 7000), AT["s5:datang"] - 0.3, 0.02)
# s6 blast: deep, long; water wash on the wave word
g(M.lib("riser"), tE2 - 1.4, 0.022)
boom(tE2, 0.24)
wash(AT["s6:Gelombang"] - 0.2, 3.5, 0.04)
g(M.band(M.burst(0.6, 6, 1), 2500, 9000), AT["s6:kaca"], 0.03)
# s7 calm: no stinger on the casualty line; relief train bell
for i in range(5):
    g(M.tone((1180, 1770), 0.5, 6), AT["s7:bantuan"] + i * 0.45, 0.012)
# s8 warm bells
for i, m in enumerate((76, 79, 83, 88)):
    g(M.tone((hz(m), hz(m) * 2.01), 1.2, 3), AT["s8:pohon"] + i * 0.18, 0.012)
g(M.lib("chime"), AT["s8:Menurut"], 0.025)
g(M.lib("chime"), OUT + 0.3, 0.05)
# seismograph pins
for k in ("s4:bertabrakan", "s4:api", "s5:telegraf", "s6:meledak", "s7:salju", "s8:pohon"):
    blip(AT[k] + 0.05, 0.018)
M.finish(music)
print("duration", DUR)
