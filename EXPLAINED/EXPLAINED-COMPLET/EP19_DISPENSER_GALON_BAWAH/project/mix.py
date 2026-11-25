"""EP19 — Dispenser Galon Bawah · NANOFORGE · audio mix"""
import json, numpy as np, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "_tools"))
from audio_lib import Mix, stereo, SR

M = Mix(1919)
B = json.load(open("beats.json", encoding="utf8"))
K, AT = B["K"], B["AT"]

# ── instruments ──────────────────────────────────────────────
def pad(f, dur, dec=1.0):
    """Warm digital pad — filtered saw."""
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * h * t) / (h * 1.5) for h in range(1, 6))
    return x * np.minimum(1, t / 0.08) * np.exp(-t * dec) * 0.3

def pulse(f, dur=0.15):
    """Short digital pulse tone."""
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 18)
    return x * 0.4

def waterDrop(dur=0.25):
    """Synthetic water drop."""
    t = np.arange(int(dur * SR)) / SR
    freq = 800 * np.exp(-t * 12) + 200
    x = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 10)
    return x * 0.3

def motorHum(dur=2.0, f=120):
    """Low electric motor hum."""
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t)
    x *= np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.1)
    return x * 0.12

# ── music beds ───────────────────────────────────────────────
music = M.mono()

# intro pad sweep
for n in [130.81, 196.00, 261.63]:  # C3, G3, C4
    M.lay(music, pad(n, 6, 0.6), K["s1"])

# s2-s3: comparison section — gentle arpeggiated notes
arp_notes = [261.63, 329.63, 392.00, 523.25]  # C4 E4 G4 C5
for i, n in enumerate(arp_notes):
    M.lay(music, M.note(n, 0.6, "pluck", 3.5), K["s2"] + i * 0.7, 0.25)
    M.lay(music, M.note(n, 0.6, "pluck", 3.5), K["s3"] + i * 0.7, 0.25)

# s4: pump scene — rhythmic pulse
for i in range(8):
    M.lay(music, pulse(220 + i * 20, 0.12), K["s4"] + i * 0.85, 0.2)

# s5: float valve — calm pad
for n in [146.83, 220.00, 293.66]:  # D3 A3 D4
    M.lay(music, pad(n, 10, 0.3), K["s5"])

# s6: hot/cold tanks — two contrasting tones
for n in [174.61, 261.63, 349.23]:  # F3 C4 F4
    M.lay(music, pad(n, 14, 0.25), K["s6"])
# digital accents for peltier
for i in range(6):
    M.lay(music, pulse(440 + i * 55, 0.1), K["s6"] + 5 + i * 1.3, 0.15)

# s7: summary — resolving pad
for n in [130.81, 196.00, 261.63, 392.00]:
    M.lay(music, pad(n, 9, 0.35), K["s7"])

# s8: outro — fade out chord
for n in [130.81, 164.81, 196.00, 261.63]:  # C3 E3 G3 C4
    M.lay(music, pad(n, 10, 0.5), K["s8"])

music = stereo(music, M.rng.standard_normal(len(music)) * 0.004)

# ── SFX ──────────────────────────────────────────────────────
# hook impact
M.put(M.lib("impact-bass-1"), 0, 0.45)

# scene transitions
for s in ["s2", "s3", "s4", "s5", "s6", "s7", "s8"]:
    M.put(M.lib("whoosh-cinematic"), K[s] - 0.15, 0.18)

# water drops at key moments
for t in [AT.get("s1:air", K["s1"] + 1.8),
          AT.get("s3:pipa", K["s3"] + 6),
          AT.get("s4:menyedot", K["s4"] + 3),
          AT.get("s5:menyala", K["s5"] + 10)]:
    wd = waterDrop()
    M.put(stereo(wd, np.zeros(len(wd))), t, 0.3)

# pump motor hum in s4
hum = motorHum(5, 120)
M.put(stereo(hum, np.zeros(len(hum))), K["s4"], 0.2)

# pump start click
M.put(M.lib("click"), AT.get("s4:pompa", K["s4"]), 0.3)

# float valve clicks in s5
M.put(M.lib("click"), AT.get("s5:mematikan", K["s5"] + 4), 0.25)
M.put(M.lib("click"), AT.get("s5:menyala", K["s5"] + 10), 0.25)

# heating element soft hum in s6
hum6 = motorHum(6, 80)
M.put(stereo(hum6, np.zeros(len(hum6))), K["s6"] + 8, 0.12)

# peltier digital chirp
M.put(M.lib("glitch-1"), AT.get("s6:Peltier", K["s6"] + 5), 0.2)

# pop accents for stats
M.put(M.lib("pop"), AT.get("s7:sembilan", K["s7"] + 5), 0.35)

# riser to outro
M.put(M.lib("riser"), K["outro"] - 2.5, 0.25)

# outro thump
thmp = M.thump()
M.put(stereo(thmp, np.zeros(len(thmp))), K["outro"], 0.4)

# brand mention
M.put(M.lib("pop"), AT.get("s8:AUDIRA", K["s8"] + 4), 0.3)

# ── finish ───────────────────────────────────────────────────
M.finish(music)
print("EP19 mix OK")
