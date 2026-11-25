"""EP36 sound: a thin, warm piano in A minor over a soft desk-clock tick, paper rustle when cards land, 1965 radio
hiss in the hook and at the 10.00 broadcast, a crack that creaks open in s3, a single gavel knock on 126-0, near
silence for the TV press conference (s6), a rubber-stamp thud on DIRUNDINGKAN. Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(1965)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 72

# A minor: i - VI - III - VII, sparse piano (sine-ish with fast decay) + low pad
prog = [[45, 57, 60, 64], [41, 57, 60, 65], [48, 55, 60, 64], [43, 55, 59, 62]]
chord = lambda t: prog[int(t / (beat * 8)) % 4]
pad, pno, tick = M.mono(), M.mono(), M.mono()
for t0 in np.arange(0.05, END + 1.5, beat * 8):
    for m in chord(t0):
        M.lay(pad, M.note(hz(m), beat * 8.4, "tri", 0.3, 1.2), t0, 0.35)
for k, t0 in enumerate(np.arange(beat * 2, END + 0.5, beat)):
    ch = chord(t0)
    f = hz(ch[1 + (k * 2) % 3] + 12)
    M.lay(pno, M.tone((f, f * 2.0, f * 3.0), 1.4, 3.5), t0, 0.5 if k % 4 == 0 else 0.3)
for t0 in np.arange(beat * 4, END, beat):
    M.lay(tick, M.band(M.burst(0.015, 260, 1), 3000, 9000), t0, 0.35)
pad = M.band(pad, 60, 1400)
for x in (pad, pno, tick):
    x /= max(1e-6, np.abs(x).max())
s6, s6e, s7 = K["s6"], K["s6e"], K["s7"]
# music almost drops out for the press conference, then returns warmer
e_all = M.env([(0, 0.0), (0.5, 0.75), (s6 - 0.6, 0.8), (s6 + 0.6, 0.12), (s6e - 0.4, 0.12), (s7 + 0.4, 0.8), (END, 0.9), (DUR - 0.4, 0), (DUR, 0)])
mono = (0.45 * pad + 0.38 * pno + 0.08 * tick) * e_all
music = stereo(mono, 0.06 * pno * e_all + 0.04 * pad * e_all)


def rustle(t, a=0.03):
    g(M.band(M.burst(0.18, 18, 3), 1800, 9000), t, a)


def hiss(t0, dur, a=0.012):
    n = int(dur * SR)
    h = M.band(rng.standard_normal(n), 900, 6000)
    h /= np.abs(h).max()
    h *= np.minimum(1, np.minimum(np.arange(n) / (0.3 * SR), (n - np.arange(n)) / (0.4 * SR)))
    g(h, t0, a)


def knock(t, a=0.22):
    g(M.thump(0.3), t, a); g(M.band(M.burst(0.06, 60, 1), 400, 4000), t, a * 0.5); g(M.tone((210, 420), 0.25, 18), t, a * 0.2)


# s1 hook: radio hiss, the island lifts
hiss(0.0, 2.6, 0.014)
g(M.lib("whoosh-cinematic"), AT["s1:merdeka"] - 0.3, 0.025)
rustle(AT["s1:Ini"])
# station changes
for k in ("s2", "s3", "s4", "s5", "s7", "s8"):
    g(M.lib("whoosh-short"), K[k] - 0.35, 0.025)
# s2: pins drop
p0, p1 = AT["s2:bergabung"] - 0.3, AT["s2:bagian"]
for i in range(14):
    g(M.lib("click-soft"), p0 + (p1 - p0) * i / 13 + 0.35, 0.025)
rustle(AT["s2:terkecil"] + 0.2); rustle(AT["s2:penduduknya"])
# s3: boards rise, the crack creaks, riot pulse
rustle(AT["s3:Partai"]); rustle(AT["s3:federal"])
cr = M.band(M.burst(1.6, 2.2, 6), 120, 2400)
g(cr, AT["s3:memburuk"] - 0.2, 0.05)
g(M.lib("impact-bass-1"), AT["s3:kerusuhan"], 0.04)
# s4: folder, cards, route, secret stamp
rustle(AT["s4:Lima"]); rustle(AT["s4:Goh"]); rustle(AT["s4:Tun"])
g(M.lib("sparkle"), AT["s4:menemui"], 0.015)
g(M.thump(0.2), AT["s4:dirahasiakan"], 0.12)
# s5: vote, gavel, lift, radio at 10.00
g(M.lib("riser"), AT["s5:seratus"] - 0.6, 0.015)
knock(AT["s5:nol"])
g(M.lib("whoosh"), AT["s5:nol"] + 0.4, 0.025)
g(M.lib("chime"), AT["s5:kemerdekaan"], 0.025)
hiss(AT["s5:radio"] - 0.4, 2.0, 0.016)
g(M.tone((880, 1760), 0.25, 10), AT["s5:sepuluh"], 0.02)
# s6: quiet, a soft camera hum only
hum = M.band(rng.standard_normal(int((s6e - s6) * SR)), 80, 400)
hum /= np.abs(hum).max()
g(hum * np.hanning(len(hum)), s6, 0.006)
# s7: note struck, folder opens, stamp
g(M.lib("click"), AT["s7:Tapi"], 0.025)
rustle(AT["s7:arsip"], 0.04)
g(M.thump(0.25), AT["s7:dirundingkan"], 0.16); rustle(AT["s7:dirundingkan"] + 0.02, 0.03)
g(M.lib("chime"), AT["s7:pertama"], 0.025)
# s8
g(M.lib("whoosh-cinematic"), AT["s8:minggu"] - 1.2, 0.02)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
