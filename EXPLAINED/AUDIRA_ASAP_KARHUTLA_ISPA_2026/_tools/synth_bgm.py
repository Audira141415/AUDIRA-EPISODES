"""Procedural, license-free music bed per episode (numpy). Each theme has its own key, tempo and timbre.
Usage: python _tools/synth_bgm.py ep036 <seconds> -> studio/public/audio/music/ep036-bed.wav (48 kHz stereo, -20 LUFS-ish)"""
import sys, numpy as np, soundfile as sf
SR = 48000
ep, dur = sys.argv[1], float(sys.argv[2])
rng = np.random.default_rng(int(ep[2:]))
N = int(dur * SR); t = np.arange(N) / SR
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def env_adsr(n, a, d, s, r):
    e = np.ones(n) * s; ai = int(a * SR); di = int(d * SR); ri = int(r * SR)
    e[:ai] = np.linspace(0, 1, ai); e[ai:ai + di] = np.linspace(1, s, len(e[ai:ai + di])); e[-ri:] *= np.linspace(1, 0, ri); return e
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); z = 0.0
    for i in range(len(x)): z = (1 - a) * x[i] + a * z; y[i] = z
    return y
def lp_fast(x, fc, passes=2):
    k = max(1, int(SR / fc / 2)); ker = np.ones(k) / k
    for _ in range(passes): x = np.convolve(x, ker, mode="same")
    return x
THEMES = {
 # AUDIRA ASAP KARHUTLA ISPA 2026: serious news, slow minor beds, each its own timbre
 "ep01": dict(bpm=74, key=45, prog=[[0,3,7,14],[-4,0,3,10],[-2,2,5,12],[-5,-2,2,9]], pad="saw", pad_fc=700, arp="ping", arp_oct=36, perc="soft", noise=0.03),
 "ep02": dict(bpm=68, key=43, prog=[[0,3,7,10],[-4,0,3,7],[-2,1,5,8],[-5,-2,2,5]], pad="square", pad_fc=650, arp="tick", arp_oct=24, perc="none", noise=0.06),
 "ep03": dict(bpm=88, key=48, prog=[[0,3,7,10],[-2,2,5,9],[-4,0,3,7],[-5,-1,2,7]], pad="sine", pad_fc=1400, arp="musicbox", arp_oct=36, perc="tick", noise=0.0),
 "ep04": dict(bpm=70, key=50, prog=[[0,3,7,14],[-3,0,4,9],[-4,0,3,10],[-5,-1,2,9]], pad="sine", pad_fc=1600, arp="ping", arp_oct=36, perc="none", noise=0.0),
 "ep05": dict(bpm=80, key=46, prog=[[0,3,7,10],[-4,0,3,7],[-7,-3,0,7],[-2,2,5,9]], pad="saw", pad_fc=800, arp="marimba", arp_oct=24, perc="soft", noise=0.04),
 "ep036": dict(bpm=96, key=50, prog=[[0,3,7,10],[ -2,2,5,9],[-4,0,3,7],[-5,-1,2,5]], pad="saw", pad_fc=900, arp="tick", arp_oct=24, perc="tick", noise=0.05),
 "ep037": dict(bpm=112, key=53, prog=[[0,4,7,11],[5,9,12,16],[2,5,9,12],[7,11,14,17]], pad="sine", pad_fc=2000, arp="marimba", arp_oct=24, perc="shaker", noise=0.0),
 "ep038": dict(bpm=78, key=45, prog=[[0,3,7,14],[-4,0,3,10],[-7,-3,0,7],[-2,2,5,12]], pad="saw", pad_fc=700, arp="ping", arp_oct=36, perc="none", noise=0.0),
 "ep040": dict(bpm=100, key=52, prog=[[0,3,7,10],[0,3,7,10],[-4,0,3,7],[-2,1,5,8]], pad="square", pad_fc=1200, arp="synth", arp_oct=24, perc="pulse", noise=0.0),
 "ep043": dict(bpm=86, key=48, prog=[[0,4,7,14],[-3,0,4,9],[5,9,12,16],[7,11,14,17]], pad="sine", pad_fc=1600, arp="musicbox", arp_oct=36, perc="soft", noise=0.0),

 "ep042": dict(bpm=84, key=47, prog=[[0,3,7,10],[-2,2,5,9],[-5,-2,2,5],[-4,0,3,7]], pad="saw", pad_fc=800, arp="ping", arp_oct=36, perc="soft", noise=0.04),
 "ep047": dict(bpm=104, key=49, prog=[[0,3,7,14],[-4,0,3,10],[-2,1,5,12],[-5,-2,2,9]], pad="square", pad_fc=1400, arp="synth", arp_oct=24, perc="tick", noise=0.0),
 "ep049": dict(bpm=108, key=55, prog=[[0,4,7,12],[5,9,12,16],[-3,0,4,9],[7,11,14,19]], pad="sine", pad_fc=2200, arp="marimba", arp_oct=24, perc="shaker", noise=0.0),
 "ep052": dict(bpm=92, key=51, prog=[[0,4,7,11],[-3,0,4,7],[5,9,12,16],[2,5,9,12]], pad="saw", pad_fc=1000, arp="musicbox", arp_oct=36, perc="soft", noise=0.0),
 "ep053": dict(bpm=116, key=57, prog=[[0,4,7,9],[5,9,12,14],[7,11,14,16],[-3,0,4,7]], pad="sine", pad_fc=1800, arp="tick", arp_oct=24, perc="pulse", noise=0.0),

 "ep041": dict(bpm=98, key=48, prog=[[0,4,7,11],[2,5,9,12],[-3,0,4,7],[5,9,12,16]], pad="sine", pad_fc=1600, arp="marimba", arp_oct=24, perc="tick", noise=0.0),
 "ep046": dict(bpm=72, key=44, prog=[[0,3,7,14],[-4,0,3,10],[-2,2,5,12],[-7,-3,0,7]], pad="saw", pad_fc=600, arp="ping", arp_oct=36, perc="none", noise=0.03),
 "ep048": dict(bpm=118, key=52, prog=[[0,3,7,10],[-2,2,5,9],[-4,0,3,7],[-5,-1,2,7]], pad="square", pad_fc=1300, arp="synth", arp_oct=24, perc="pulse", noise=0.0),
 "ep050": dict(bpm=104, key=56, prog=[[0,4,7,11],[5,9,12,16],[7,11,14,17],[-3,0,4,9]], pad="sine", pad_fc=2400, arp="musicbox", arp_oct=36, perc="shaker", noise=0.0),
 "ep051": dict(bpm=90, key=50, prog=[[0,4,7,14],[-3,0,4,9],[5,9,12,16],[2,5,9,14]], pad="sine", pad_fc=2000, arp="ping", arp_oct=36, perc="soft", noise=0.02),
 # Batch 4
 "ep039": dict(bpm=76, key=45, prog=[[0,3,7,14],[-4,0,3,10],[-5,-2,2,9],[-2,2,5,12]], pad="saw", pad_fc=650, arp="ping", arp_oct=36, perc="none", noise=0.03),
 "ep044": dict(bpm=100, key=54, prog=[[0,4,7,11],[2,5,9,14],[-3,0,4,9],[5,9,12,16]], pad="sine", pad_fc=2200, arp="synth", arp_oct=24, perc="tick", noise=0.0),
 "ep045": dict(bpm=96, key=55, prog=[[0,4,7,12],[-3,0,4,9],[5,9,12,16],[7,11,14,19]], pad="sine", pad_fc=2000, arp="marimba", arp_oct=24, perc="shaker", noise=0.0),
 "ep054": dict(bpm=88, key=50, prog=[[0,3,7,10],[-2,2,5,9],[-4,0,3,7],[-5,-1,2,5]], pad="square", pad_fc=1100, arp="musicbox", arp_oct=36, perc="soft", noise=0.0),
 "ep055": dict(bpm=70, key=46, prog=[[0,3,7,10],[-4,0,3,7],[-2,1,5,8],[-5,-2,2,5]], pad="saw", pad_fc=600, arp="ping", arp_oct=36, perc="none", noise=0.04),
 "ep056": dict(bpm=84, key=48, prog=[[0,4,7,12],[-3,0,4,9],[5,9,12,16],[7,11,14,19]], pad="square", pad_fc=900, arp="musicbox", arp_oct=36, perc="tick", noise=0.02),
 "ep057": dict(bpm=92, key=53, prog=[[0,4,7,11],[-3,0,4,9],[2,5,9,12],[5,9,12,16]], pad="sine", pad_fc=1800, arp="marimba", arp_oct=24, perc="shaker", noise=0.0),
 "ep058": dict(bpm=108, key=52, prog=[[0,3,7,10],[-4,0,3,7],[-2,2,5,9],[-5,-1,2,5]], pad="square", pad_fc=1400, arp="synth", arp_oct=24, perc="tick", noise=0.0),
 "ep059": dict(bpm=68, key=43, prog=[[0,3,7,14],[-4,0,3,10],[-2,1,5,12],[-5,-2,2,9]], pad="saw", pad_fc=550, arp="ping", arp_oct=36, perc="none", noise=0.06),
 "ep062": dict(bpm=96, key=50, prog=[[0,4,7,12],[2,5,9,14],[-3,0,4,9],[-5,-1,2,7]], pad="sine", pad_fc=2000, arp="ping", arp_oct=24, perc="soft", noise=0.0),
}
P = THEMES[ep]; beat = 60 / P["bpm"]; bar = 4 * beat
L = np.zeros(N); R = np.zeros(N)
def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR); e = min(N, i + len(sig))
    if i >= N: return
    L[i:e] += sig[: e - i] * gain * np.cos((pan + 1) * np.pi / 4); R[i:e] += sig[: e - i] * gain * np.sin((pan + 1) * np.pi / 4)
def osc(kind, f, n, det=0.0):
    tt = np.arange(n) / SR; ph = 2 * np.pi * f * (1 + det) * tt
    if kind == "saw": return 2 * ((f * (1 + det) * tt) % 1) - 1
    if kind == "square": return np.sign(np.sin(ph)) * 0.6
    return np.sin(ph)
# pads: one chord per bar, detuned pair, low-passed, slow attack
nb = int(np.ceil(dur / bar))
for b in range(nb):
    chord = P["prog"][b % len(P["prog"])]; n = int(bar * SR * 1.15)
    sig = np.zeros(n)
    for iv in chord:
        f = mtof(P["key"] + 12 + iv)
        sig += osc(P["pad"], f, n, 0.003) + osc(P["pad"], f, n, -0.004)
    sig = lp_fast(sig, P["pad_fc"]) * env_adsr(n, 0.9, 0.5, 0.8, 0.9) * 0.05
    add(sig, b * bar, pan=-0.2 if b % 2 else 0.2)
    # bass root
    nbs = int(bar * SR); fb = mtof(P["key"] - 12 + chord[0])
    bs = np.sin(2 * np.pi * fb * np.arange(nbs) / SR) * env_adsr(nbs, 0.02, 0.3, 0.6, 0.3) * 0.12
    add(bs, b * bar)
# arpeggio / motif (sixteenths or eighths depending on theme)
step = beat / (4 if P["arp"] in ("tick", "synth") else 2)
ns = int(dur / step)
for k in range(ns):
    b = int(k * step // bar); chord = P["prog"][b % len(P["prog"])]
    if P["arp"] == "ping" and k % 8: continue
    if P["arp"] in ("marimba", "musicbox") and rng.random() < 0.25: continue
    iv = chord[(k * 3 + (k // 4)) % len(chord)]; f = mtof(P["key"] + P["arp_oct"] + iv)
    n = int(0.6 * SR) if P["arp"] != "ping" else int(2.5 * SR); tt = np.arange(n) / SR
    if P["arp"] == "marimba": s = (np.sin(2*np.pi*f*tt) + 0.3*np.sin(2*np.pi*4*f*tt)*np.exp(-tt*40)) * np.exp(-tt * 9) * 0.06
    elif P["arp"] == "musicbox": s = (np.sin(2*np.pi*f*tt) + 0.2*np.sin(2*np.pi*3*f*tt)) * np.exp(-tt * 5) * 0.05
    elif P["arp"] == "ping": s = np.sin(2*np.pi*f*tt) * np.exp(-tt * 1.6) * 0.05
    elif P["arp"] == "synth": s = lp_fast(osc("saw", f, n), 2500, 1) * np.exp(-tt * 10) * 0.035
    else: s = np.sin(2*np.pi*f*tt) * np.exp(-tt * 18) * 0.035
    add(s, k * step, pan=np.sin(k * 0.7) * 0.5)
# percussion
if P["perc"] != "none":
    nbeats = int(dur / beat)
    for k in range(nbeats * 2):
        tt0 = k * beat / 2; n = int(0.25 * SR); tt = np.arange(n) / SR
        if P["perc"] in ("pulse", "soft") and k % 4 == 0:
            kick = np.sin(2 * np.pi * (50 + 80 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 12) * (0.16 if P["perc"] == "pulse" else 0.08); add(kick, tt0)
        nz = rng.standard_normal(n) * np.exp(-tt * (60 if P["perc"] != "shaker" else 35))
        nz = nz - lp_fast(nz, 3000, 1)
        g = {"tick": 0.02, "shaker": 0.03, "pulse": 0.018, "soft": 0.012}[P["perc"]]
        add(nz * g * (1.0 if k % 2 else 0.6), tt0, pan=0.3 if k % 2 else -0.3)
if P["noise"]:
    nz = lp_fast(rng.standard_normal(N), 4000, 1); nz -= lp_fast(nz, 400, 1); L += nz * P["noise"]; R += np.roll(nz, 997) * P["noise"]
mix = np.stack([L, R], 1)
fade = np.ones(N); fi = int(1.5 * SR); fo = int(3 * SR); fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
mix *= fade[:, None]; mix /= max(1e-6, np.abs(mix).max()) / 0.8
sf.write(f"studio/public/audio/music/{ep}-bed.wav", mix.astype("float32"), SR)
print(ep, "bed", dur, "s")
