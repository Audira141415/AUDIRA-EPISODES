"""EP37 sound: late-1990s Y2K internet over a Pacific atoll. Light synth score (glassy electric-piano chords
Fmaj7 / Am7 / Dm9 / Bbmaj7 with a soft bell arpeggio and a gentle sub), a short dial-up modem handshake on the hook,
ocean waves under the atoll scenes, chrome "ting" pops for each plaque, a splash when the .tv letters land, digital
coin chimes every time a payment rises (US$50 juta, US$1 miliar, US$5 juta, US$10 juta), a riser into the 8,4% column,
a low swell when the sea rises and a short glitch on "dihapus". Run after node build-video.mjs."""
import json, sys
sys.path.insert(0, "../_tools")
import numpy as np
from audio_lib import Mix, SR, stereo

M = Mix(37)
T, N, DUR, rng = M.T, M.N, M.DUR, M.rng
B = json.load(open("PROJECT/beats.json", encoding="utf8"))
AT, K, OUT = B["AT"], B["K"], B["outroAt"]
g = M.put
END = M.TL["speech_end"]
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

# --- score ---
def epiano(f, d=2.4, a=1.0):
    tt = np.arange(int(d * SR)) / SR
    x = np.sin(2 * np.pi * f * tt + 0.9 * np.exp(-tt * 3) * np.sin(2 * np.pi * f * 2 * tt))
    x += 0.25 * np.sin(2 * np.pi * f * 3.01 * tt) * np.exp(-tt * 4)
    return a * x * np.exp(-tt * 1.1) * np.minimum(1, tt / 0.005)

def bell(f, d=1.2, a=1.0):
    tt = np.arange(int(d * SR)) / SR
    return a * (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 6)) * np.exp(-tt * 3.2) * np.minimum(1, tt / 0.003)

pad, keys, arp, sub = M.mono(), M.mono(), M.mono(), M.mono()
CH = [(53, 57, 60, 64), (57, 60, 64, 67), (50, 57, 60, 64), (46, 53, 57, 62)]  # Fmaj7 Am7 Dm9 Bbmaj7
bar = 2.4  # 100 bpm, one chord per bar
for k, t0 in enumerate(np.arange(0.0, DUR - 1, bar)):
    c = CH[k % 4]
    for j, n in enumerate(c):
        M.lay(keys, epiano(hz(n), 2.6, 0.35), t0 + 0.012 * j)
        M.lay(pad, M.note(hz(n + 12), bar + 0.4, "tri", 0.15, 0.25), t0, 0.22)
    M.lay(sub, M.note(hz(c[0] - 12), bar, "sine", 0.6, 0.01), t0, 0.9)
    for s in range(8):
        n = c[(s * 3) % 4] + 24
        M.lay(arp, bell(hz(n), 0.6, 0.18 if s % 2 else 0.26), t0 + s * bar / 8)
pad = M.band(pad, 120, 6000)
for x in (pad, keys, arp, sub):
    x /= max(1e-6, np.abs(x).max())
e = M.env([(0, 0.55), (2.6, 0.8), (END, 0.9), (DUR - 0.6, 0), (DUR, 0)])
e_arp = M.env([(0, 0.2), (K["s3"], 0.6), (K["s7"], 0.6), (K["s7"] + 1.5, 0.25), (K["s8"], 0.5), (DUR, 0.4)])
mono = (0.38 * keys + 0.3 * pad + 0.32 * sub + 0.28 * arp * e_arp) * e
music = stereo(mono, 0.12 * arp * e_arp * e + 0.06 * pad * e)

# --- sfx helpers ---
def ting(t, a=0.03, f=2600):
    g(M.tone((f, f * 1.5, f * 2.01), 0.6, 8), t, a)

def coin(t, a=0.03, f=1900):
    g(M.tone((f, f * 1.26), 0.09, 20), t, a); g(M.tone((f * 1.5, f * 2.0), 0.5, 7), t + 0.08, a)

def coins(t0, n, span, a=0.02):
    for k in range(n):
        coin(t0 + k * span / max(1, n), a, 1700 + 160 * (k % 4))

def splash(t, a=0.05):
    x = M.band(M.burst(0.9, 4.5, 3), 300, 7000)
    g(x / np.abs(x).max(), t, a); g(M.thump(0.3), t, a * 0.6)

def waves(t0, t1, a=0.012):
    n = int((t1 - t0) * SR)
    if n <= 0: return
    x = M.band(rng.standard_normal(n), 150, 2500); tt = np.arange(n) / SR
    x *= 0.55 + 0.45 * np.sin(2 * np.pi * tt / 5.5) ** 2
    x *= np.minimum(1, np.minimum(tt / 1.0, (t1 - t0 - tt) / 1.0))
    g(np.stack([x, np.roll(x, 900)], 1) / np.abs(x).max(), t0, a)

def dialup(t, d=1.5, a=0.016):
    tt = np.arange(int(d * SR)) / SR
    seg = np.floor(tt / 0.18).astype(int)
    f = np.where(seg % 3 == 0, 1650, np.where(seg % 3 == 1, 2100, 1200)) * (1 + 0.02 * np.sin(2 * np.pi * 37 * tt))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * M.band(rng.standard_normal(len(tt)), 1000, 4000)
    x *= np.minimum(1, np.minimum(tt / 0.03, (d - tt) / 0.2))
    g(x / np.abs(x).max(), t, a)

# hook: modem handshake, cursor click, letters hop and fall, splash on landing
dialup(0.05, 1.5, 0.014)
g(M.lib("click-soft"), AT["s1:.tv"], 0.05)
g(M.lib("pop"), AT["s1:.tv"] + 0.15, 0.04)
g(M.lib("whoosh-cinematic"), AT["s1:.tv"] + 0.5, 0.035)
for i in range(3):
    splash(AT["s1:negara"] - 0.2 + i * 0.13, 0.04)
ting(AT["s1:negara"] + 0.5, 0.02, 3200)
# atoll: waves under s1 end, s2, s7, s8
waves(AT["s1:negara"] - 0.3, K["s3"] + 0.8, 0.014)
waves(K["s7"] + 0.4, DUR, 0.014)
g(M.lib("whoosh"), AT["s2:Sembilan"] - 0.6, 0.03)
for k in range(9):
    ting(AT["s2:Sembilan"] + k * 0.09, 0.008, 2200 + 120 * k)
g(M.lib("whoosh"), AT["s2:dua"] - 0.4, 0.025)
ting(AT["s2:dua"] - 0.3, 0.02); ting(AT["s2:sepuluh"] - 0.3, 0.02, 2900)
g(M.lib("click"), AT["s2:Titik"] - 0.2, 0.03)
ting(AT["s2:empat"] - 0.3, 0.025, 3300)
# country codes: chrome pops, TV blip
g(M.lib("whoosh-short"), K["s3"] + 0.1, 0.03)
for k, f in (("s3:.id", 2400), ("s3:.jp", 2700), ("s3:.tv", 3200)):
    g(M.lib("pop"), AT[k] - 0.25, 0.035); ting(AT[k] - 0.2, 0.018, f)
g(M.tone((880, 1320), 0.25, 10), AT["s3:televisi"] - 0.3, 0.03)
# 1998 coin
g(M.lib("whoosh-short"), K["s4"] + 0.1, 0.03)
g(M.thump(0.3), AT["s4:1998"], 0.05); ting(AT["s4:1998"] + 0.05, 0.02, 2000)
coins(AT["s4:lima"] - 0.1, 5, 0.6, 0.022)
g(M.lib("click-soft"), AT["s4:Kontraknya"], 0.04)
g(M.lib("whoosh-short"), AT["s4:berpindah"], 0.025)
g(M.lib("pop"), AT["s4:Verisign"] - 0.25, 0.035)
# Twitch: price tag, payment bar rises with coins along the cable
g(M.lib("whoosh-short"), K["s5"] + 0.1, 0.03)
g(M.lib("pop"), AT["s5:Amazon"] - 0.25, 0.03)
g(M.thump(0.35), AT["s5:satu"] - 0.3, 0.06); coins(AT["s5:satu"] - 0.2, 6, 0.5, 0.022)
g(M.lib("riser"), AT["s5:naik"] - 0.6, 0.02)
coins(AT["s5:naik"], 8, max(0.8, AT["s5:lima"] - AT["s5:naik"]), 0.018)
# 8,4% column and GoDaddy bar
g(M.lib("whoosh-short"), K["s6"] + 0.1, 0.03)
g(M.lib("riser"), AT["s6:delapan"] - 1.4, 0.025)
g(M.tone((523, 784, 1046), 1.4, 2.2), AT["s6:delapan"] + 0.3, 0.03)
g(M.lib("pop"), AT["s6:GoDaddy"] - 0.2, 0.03)
coins(AT["s6:GoDaddy"], 10, max(1.0, AT["s6:sepuluh"] - AT["s6:GoDaddy"] + 0.2), 0.02)
g(M.lib("chime"), AT["s6:sepuluh"] + 0.1, 0.03)
# sea rising, replica, Falepili, glitch
g(M.lib("whoosh-cinematic"), K["s7"] + 0.2, 0.03)
sw = M.band(rng.standard_normal(int(3.2 * SR)), 40, 400); tt = np.arange(len(sw)) / SR
sw *= np.minimum(1, tt / 1.2) * np.minimum(1, (3.2 - tt) / 0.8)
g(sw / np.abs(sw).max(), AT["s7:laut"] - 0.3, 0.05)
g(M.lib("sparkle"), AT["s7:salinan"] - 0.3, 0.035)
g(M.lib("whoosh"), AT["s7:perjanjian"], 0.025); ting(AT["s7:Australia"] - 0.3, 0.02, 2600)
for k, nm in enumerate(("glitch-1", "glitch-2", "glitch-3")):
    g(M.lib(nm), AT["s7:hilang"] + 0.3 + k * 0.55, 0.03)
g(M.lib("error"), AT["s7:dihapus"] - 0.1, 0.02)
# outro
g(M.lib("whoosh-cinematic"), K["s8"] + 0.1, 0.025)
g(M.lib("pop"), AT["s8:Negara"] - 0.2, 0.03)
ting(AT["s8:AUDIRA"], 0.02, 3000)
g(M.lib("chime"), OUT + 0.3, 0.05)
M.finish(music)
print("duration", DUR)
