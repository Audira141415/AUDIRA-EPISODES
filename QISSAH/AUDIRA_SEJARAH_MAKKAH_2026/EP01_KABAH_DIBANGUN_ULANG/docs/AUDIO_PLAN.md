# Audio Plan — SEJARAH MAKKAH · EP01

## Voice (locked)
- **Long-form:** `audio/vo.wav` (Cartesia Galang, -16 LUFS) is the master clock: VO 1.0–675.4 s, total 695.4 s. It is copied to `project/public/audio/vo.wav`.
- **Shorts:** `project/src/scenes/kabah/build_shorts.py` assembles each short's narration in this order:
  1. the `sNN_hook` clip;
  2. a 0.4 s gap;
  3. the reused span cut from vo.wav at the word-time bounds;
  4. a 0.4 s gap;
  5. the `sNN_outro` clip;
  6. a 3 s tail for the outro card.

  Each track is loudnorm'd and then trimmed with a linear gain to exactly -16.0 LUFS (true peak -2.1 / -1.5 dBFS). The outputs are `public/audio/short01_vo.wav` (80.8 s) and `short02_vo.wav` (87.8 s).

## Bed (`project/src/scenes/kabah/mix.py`, numpy synthesis + library SFX, no voice)

| Layer | What it is | Where |
|---|---|---|
| Drone | D2 + A2 + D3 + A3 sines with slow breathing LFOs and gentle phase drift; darkens 35% during the flood | Whole film |
| Ney line | Breathy sine + noise with delayed vibrato, maqam Hijaz on D (D Eb F# G A Bb C D) | 6–7 note phrase at each chapter start; long lines under the payoff and end screen |
| Qanun plucks | Karplus–Strong arpeggio D3 A3 D4 F#4 A4, panned | On each chapter card |
| Daf | Very light pitched thump + soft slap at 72 bpm | Hook and payoff only |
| Wind | Low-passed noise, slow swell | Whole film |
| Sea | Low-passed noise with a 6.5 s wave swell | c03 shore, 143.9–161.6 s |
| Rain + water | High-passed noise + low-passed flow | c08, 509–524 s |
| SFX (`<WS>/shared/assets/sfx/`) | impact-bass-1 (0.9 s, "1631", outro), whoosh-cinematic (1.6 s before each chapter), chime (chapter cards), sparkle (Hijr glow, two silver bindings), riser (before the payoff) | — |

There is no singing and no instrument that would offend; percussion is kept very light.

**Levels:**
- The bed is normalised to -26 LUFS (`public/audio/bed.wav`, 695.4 s).
- The combine step applies -5 dB, which puts the bed about 15 dB under the voice.
- Sidechain ducking under the narration: `sidechaincompress=threshold=0.02:ratio=4:attack=20:release=450`.

**Results:**
- `public/audio/full.wav`: -16.6 LUFS, peak -4.2 dBFS. The final render gets this file via `--vo`.
- Shorts: the bed is cut continuously from the long bed, starting at (reused span start − body offset), with a fade-in and fade-out, an opening impact, an end-card chime and an outro impact. Combined, they give `short01_full.wav` (-16.2 LUFS) and `short02_full.wav` (-16.1 LUFS).

## Final mastering (Stage C)
- Measure again after the render.
- Target -14 LUFS integrated with a true peak below -1 dBFS (rule 07). The current mixes sit at about -16.
