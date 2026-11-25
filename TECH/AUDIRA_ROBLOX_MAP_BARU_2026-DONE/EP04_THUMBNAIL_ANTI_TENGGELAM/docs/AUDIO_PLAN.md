# Audio Plan — EP04

## VO (terkunci)
- File: `audio/vo.wav` (Cartesia, -16 LUFS), disalin ke `studio/public/audio/ep04/vo.wav`.
- Suara berakhir di 86,9 dtk.

## Bed
Dibuat oleh `studio/src/scenes/ep04/mix.py` menjadi `studio/public/audio/ep04/bed.wav`: 90,9 dtk, tanpa suara manusia, disintesis dengan numpy, seeded.

**Musik:** chiptune 112 BPM, A minor (Am–F–C–G).
- Bass segitiga 8-an dan arpeggio pulse 12,5% 16-an.
- Lead pulse 50%: penuh di hook dan payoff, lebih tipis saat penjelasan.
- Kick sinus, serta snare dan hat dari noise.
- Musik fade di kartu outro.

**Ambience:** dengung CRT 60/120/180 Hz, whine flyback 15,7 kHz yang sangat pelan, dan tetesan air.

**SFX:** dari `shared/assets/sfx/`, diikat ke kata.

| SFX | Posisi |
|---|---|
| Glitch | Power-on di awal; di "sesuai" |
| Bass impact | "Tanpa", "8,5%", "50%", kartu outro |
| Whoosh | Setiap pindah kamera |
| Ping | "wajib", "penuh" |
| Error | Cap "tidak memenuhi syarat" dan "tidak diprioritaskan" |
| Pop | Setiap label dan versi |
| Riser | Sebelum "personalisasi" dan "data" |
| Sparkle | "memilih", "sentuhanmu" |
| Click | "video?", "diklik" |
| Chime | "pemenangnya" |
| Blip chip | Saat avatar mendarat |

## Mix
- Bed diturunkan 5 dB dan diberi sidechain dari VO (threshold 0,02, ratio 4), lalu digabung menjadi `studio/public/audio/ep04/full.wav`.
- Hasil ukur: bed setelah -5 dB = -31,8 LUFS dan VO -16,6 LUFS, jadi bed sekitar 15 dB di bawah suara. File full = -16,6 LUFS.
- Normalisasi akhir ke -14 LUFS dilakukan di render final.
