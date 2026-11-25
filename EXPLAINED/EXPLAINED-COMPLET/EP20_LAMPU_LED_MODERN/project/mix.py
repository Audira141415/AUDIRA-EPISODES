"""EP20 LAMPU LED MODERN — CIRCUITFORGE audio mix.
Electronic ambient: clean digital tones, subtle chip-tune elements, circuit hum."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "_tools"))
from audio_lib import Mix, stereo, SR
import numpy as np

M = Mix(seed=2020)
K = M.TL["scenes"]
sc = {s["id"]: s for s in K}

# ── Instruments ──
def digi_bell(f, dur=0.4):
    """Clean digital bell — sine + 3rd harmonic with fast decay."""
    base = M.note(f, dur, kind="sin", dec=6, att=0.002)
    harm = M.note(f * 3, dur, kind="sin", dec=12, att=0.002)
    return base * 0.6 + harm * 0.2

def chip_pluck(f, dur=0.3):
    """Short chip-tune pluck."""
    return M.note(f, dur, kind="pluck", dec=8, att=0.003)

def circuit_pad(f, dur=2.0):
    """Warm pad with slow attack for ambient bed."""
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * 0.4 + np.sin(2 * np.pi * f * 2.01 * t) * 0.2
    env = np.minimum(1, t / 0.3) * np.minimum(1, (dur - t) / 0.4) * np.exp(-t * 0.3)
    return x * env

def elec_hum(dur=3.0, f=60):
    """Low electric hum — 60Hz fundamental + harmonics."""
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) * 0.5 + np.sin(2 * np.pi * f * 2 * t) * 0.2 + np.sin(2 * np.pi * f * 3 * t) * 0.08
    env = np.minimum(1, t / 0.1) * np.minimum(1, (dur - t) / 0.2)
    return x * env

# ── Music bed ──
music = M.mono()

# Scale: D minor pentatonic (electronic feel)
# D3=146.83, F3=174.61, G3=196, A3=220, C4=261.63, D4=293.66, F4=349.23
notes = [146.83, 174.61, 196, 220, 261.63, 293.66, 349.23]

# s1: hook — bright digital bells
for i, f in enumerate([293.66, 349.23, 440, 349.23]):
    M.lay(music, digi_bell(f, 0.5), M.word("s1", "LED") + i * 0.35, 0.18)

# s2: incandescent — warm lower tones
M.lay(music, circuit_pad(146.83, 3.0), M.word("s2", "kawat"), 0.12)
M.lay(music, elec_hum(2.5, 50), M.word("s2", "membara"), 0.06)

# s3: LED definition — ascending chip plucks
for i, f in enumerate([196, 261.63, 293.66, 349.23, 440]):
    M.lay(music, chip_pluck(f, 0.25), M.word("s3", "LED") + 0.5 + i * 0.3, 0.14)
M.lay(music, circuit_pad(220, 2.5), M.word("s3", "chip"), 0.1)

# s4: chip layers — alternating tones (N-type / P-type)
M.lay(music, digi_bell(261.63, 0.6), M.word("s4", "Chip"), 0.14)
M.lay(music, digi_bell(196, 0.6), M.word("s4", "elektron"), 0.14)
M.lay(music, chip_pluck(174.61, 0.35), M.word("s4", "lubang"), 0.12)

# s5: recombination — building energy
M.lay(music, circuit_pad(196, 3.0), M.word("s5", "listrik"), 0.1)
for i, f in enumerate([261.63, 293.66, 349.23]):
    M.lay(music, digi_bell(f, 0.5), M.word("s5", "elektron") + i * 0.5, 0.16)
M.lay(music, chip_pluck(440, 0.4), M.word("s5", "cahaya"), 0.18)

# s6: lamp anatomy — full arrangement
M.lay(music, circuit_pad(174.61, 4.0), M.word("s6", "galium"), 0.1)
M.lay(music, digi_bell(293.66, 0.5), M.word("s6", "fosfor"), 0.14)
M.lay(music, elec_hum(3.0, 55), M.word("s6", "driver"), 0.05)
for i, f in enumerate([220, 261.63, 293.66, 349.23]):
    M.lay(music, chip_pluck(f, 0.3), M.word("s6", "driver") + 0.3 + i * 0.35, 0.12)

# s7: Nobel — majestic bells
M.lay(music, circuit_pad(146.83, 5.0), M.word("s7", "Akasaki"), 0.12)
for i, f in enumerate([293.66, 349.23, 440, 523.25, 440]):
    M.lay(music, digi_bell(f, 0.7), M.word("s7", "Nobel") + i * 0.4, 0.16)
M.lay(music, digi_bell(523.25, 0.8), M.word("s7", "lumen"), 0.15)

# s8: conclusion — resolving melody
M.lay(music, circuit_pad(196, 3.5), M.word("s8", "AUDIRA") - 1, 0.1)
for i, f in enumerate([349.23, 293.66, 261.63, 196]):
    M.lay(music, digi_bell(f, 0.6), M.word("s8", "AUDIRA") + i * 0.4, 0.14)

# ambient bed throughout
bed_dur = M.DUR
bed = circuit_pad(73.42, bed_dur) * 0.3  # D2 drone
M.lay(music, bed, 0, 0.08)

music = stereo(music, M.rng.standard_normal(M.N) * 0.003, off=0.02)

# ── SFX ──
# s1 hook impact
M.put(M.lib("impact-bass-1"), 0.05, 0.35)
# light switch click
M.put(M.lib("click"), M.word("s1", "LED") - 0.1, 0.25)

# s2 old bulb warmth
M.put(M.lib("riser")[:int(2.5 * SR)], M.word("s2", "Lampu"), 0.12)

# s3 chip reveal
M.put(M.lib("whoosh-short"), M.word("s3", "chip") - 0.2, 0.2)
M.put(M.lib("sparkle"), M.word("s3", "semikonduktor"), 0.15)

# s4 layer transitions
M.put(M.lib("click-soft"), M.word("s4", "elektron"), 0.15)
M.put(M.lib("click-soft"), M.word("s4", "lubang"), 0.15)

# s5 photon burst
M.put(M.lib("sparkle"), M.word("s5", "cahaya"), 0.25)
M.put(M.lib("chime"), M.word("s5", "cahaya") + 0.3, 0.15)

# s6 driver + heat
M.put(M.lib("whoosh-short"), M.word("s6", "galium"), 0.15)
M.put(M.lib("click"), M.word("s6", "driver"), 0.2)

# s7 Nobel fanfare
M.put(M.lib("impact-bass-1"), M.word("s7", "Nobel"), 0.3)
M.put(M.lib("chime"), M.word("s7", "Nobel") + 0.5, 0.2)

# s8 outro
M.put(M.lib("whoosh-cinematic"), M.word("s8", "AUDIRA") - 0.3, 0.2)
M.put(M.lib("ping"), M.word("s8", "Benda"), 0.15)

# scene transitions
for s in M.TL["scenes"][1:]:
    M.put(M.lib("whoosh-short"), s["start"] - 0.1, 0.1)

M.finish(music)
print("EP20 mix OK")
