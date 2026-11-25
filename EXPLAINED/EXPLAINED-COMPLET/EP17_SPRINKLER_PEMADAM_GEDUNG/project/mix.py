"""EP17 Sprinkler Pemadam Gedung — DISASTERSIM audio mix.
Emergency tension: low drones, alarm tones, metallic hits, glass shatter, water rush."""
import json
import sys
sys.path.insert(0, "../../_tools")
from audio_lib import Mix, stereo, SR
import numpy as np

M = Mix(17)
B = json.load(open("beats.json"))
AT, K = B["AT"], B["K"]

# --- instruments ---
def alarm_tone(f, dur, pulse=4):
    t = np.arange(int(dur * SR)) / SR
    osc = np.sin(2 * np.pi * f * t)
    env = 0.5 + 0.5 * np.sin(2 * np.pi * pulse * t)
    fade = np.minimum(1, np.minimum(t / 0.01, (dur - t) / 0.02))
    return osc * env * fade * 0.35

def tension_drone(f, dur, lfo=0.3):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t)
    mod = 0.7 + 0.3 * np.sin(2 * np.pi * lfo * t)
    fade = np.minimum(1, np.minimum(t / 0.5, (dur - t) / 0.8))
    return x * mod * fade * 0.22

def glass_shatter(dur=0.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = M.rng.standard_normal(n)
    freqs = [2200, 3800, 5100, 6800]
    ring = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * (8 + i * 3)) for i, f in enumerate(freqs)) / len(freqs)
    env = np.exp(-t * 6)
    return (x * 0.4 + ring * 0.6) * env

def water_rush(dur):
    n = int(dur * SR)
    x = M.rng.standard_normal(n)
    x = np.convolve(x, np.ones(8) / 8, mode="same")
    t = np.arange(n) / SR
    fade = np.minimum(1, np.minimum(t / 0.3, (dur - t) / 1.0))
    return M.band(x, 200, 4000) * fade * 0.18

def metal_ping(f=1800, dur=0.4):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.7 * t)
    return x * np.exp(-t * 12) * 0.3

# --- music bed ---
music = M.mono()

# Tension drone through most of the video
drone_lo = tension_drone(55, K["end"] - 0.5, 0.25)
M.lay(music, drone_lo, 0.5, 0.7)

drone_mid = tension_drone(82.5, K["s6e"] - K["s3"], 0.4)
M.lay(music, drone_mid, K["s3"], 0.5)

# Alarm pulse during fire scenes (s4-s5)
pulse = alarm_tone(440, K["s5e"] - K["s4"], pulse=3)
M.lay(music, pulse, K["s4"], 0.4)

# Gentler tone for conclusion (s7-s8)
resolve = M.note(220, K["end"] - K["s7"], kind="tri", dec=0.8)
M.lay(music, resolve, K["s7"], 0.35)
resolve2 = M.note(330, K["end"] - K["s7"], kind="tri", dec=1.0)
M.lay(music, resolve2, K["s7"], 0.2)

# Rhythmic low pulses
for sc in ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"]:
    M.lay(music, M.thump(0.25), K[sc], 0.25)

# Short plucks at scene transitions
for sc in ["s2", "s3", "s4", "s5", "s6", "s7", "s8"]:
    M.lay(music, M.note(165, 0.5, kind="pluck", dec=4), K[sc] - 0.15, 0.2)

music = stereo(music, M.rng.standard_normal(len(music)) * 0.01)

# --- SFX ---
# Hook impact
M.put(M.lib("impact-bass-1"), 0, 0.5)

# Scene transition whooshes
for sc in ["s2", "s3", "s4", "s5", "s6", "s7", "s8"]:
    M.put(M.lib("whoosh-short"), K[sc] - 0.2, 0.25)

# s1: Fire crackle (synthesized)
crackle = M.burst(6, 3, smooth=2) * 0.08
M.put(stereo(crackle, M.rng.standard_normal(len(crackle)) * 0.02), K["s1"], 0.5)

# s2: Pipe metal pings
M.put(stereo(metal_ping(1800, 0.3), np.zeros(int(0.3 * SR))), M.word("s2", "katup"), 0.2)
M.put(stereo(metal_ping(2200, 0.25), np.zeros(int(0.25 * SR))), M.word("s2", "air"), 0.15)

# s3: Glass clink
M.put(stereo(metal_ping(3200, 0.2), np.zeros(int(0.2 * SR))), M.word("s3", "kaca"), 0.18)

# s4: Rising tension — riser SFX
M.put(M.lib("riser"), K["s4"], 0.3)
# Fire crackle continues
crackle4 = M.burst(8, 4, smooth=2) * 0.06
M.put(stereo(crackle4, M.rng.standard_normal(len(crackle4)) * 0.01), K["s4"], 0.4)

# s5: Glass shatter + water rush
shatter = glass_shatter(0.8)
M.put(stereo(shatter, M.rng.standard_normal(len(shatter)) * 0.05), M.word("s5", "pecah"), 0.6)
M.put(M.lib("impact-bass-1"), M.word("s5", "pecah"), 0.4)

rush = water_rush(K["s5e"] - M.word("s5", "pecah") - 0.5)
M.put(stereo(rush, M.rng.standard_normal(len(rush)) * 0.03), M.word("s5", "pecah") + 0.3, 0.7)

# s5: Deflector hit
M.put(stereo(metal_ping(1400, 0.35), np.zeros(int(0.35 * SR))), M.word("s5", "deflektor"), 0.3)

# s6: Pop for "sendiri"
M.put(M.lib("pop"), M.word("s6", "sendiri"), 0.2)

# s7: Stat reveal
M.put(M.lib("chime"), M.word("s7", "sembilan"), 0.25)
M.put(M.lib("sparkle"), M.word("s7", "sprinkler"), 0.2)

# s8: Conclusion — gentle chime
M.put(M.lib("chime"), M.word("s8", "termometer"), 0.2)

# Outro
M.put(M.lib("whoosh-cinematic"), K["outro"], 0.3)

M.finish(music)
print("mix OK — EP17")
