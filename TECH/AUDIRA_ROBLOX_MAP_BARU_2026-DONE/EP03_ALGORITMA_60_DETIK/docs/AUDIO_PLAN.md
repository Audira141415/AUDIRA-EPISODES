# Audio Plan — EP03

- **VO:** `audio/vo.wav` terkunci (Cartesia, -16.6 LUFS) sebagai master clock. Suara selesai di 87.5 dtk; total film 91.5 dtk.
- **Bed:** `studio/src/scenes/ep03/mix.py` → `studio/public/audio/ep03/bed.wav`, -25.3 LUFS sebelum mix. Isinya:
  - perkusi komik memantul 112 BPM (kick, clap, woodblock);
  - bass pluck dan melodi petik Karplus-Strong (C–F–G–Am);
  - dengung mesin 55 Hz dan tick jam tiap 1 dtk.

  Musik di-fade sebelum kartu outro.
- **SFX (40 cue, ditambatkan ke kata):**
  - impact-bass-1: "60".
  - whoosh / whoosh-short / whoosh-cinematic: cut dan gerakan.
  - pop: setiap papan muncul.
  - error: "tanda", "Ini", "menu".
  - ping: lampu D1 / D2–7 / D8–28.
  - chime: "belanja", "jangkauannya", kartu outro.
  - sparkle: "Rekomendasi", "28", "penasaran".
  - click: "update" dan 3 anak tangga.
  - riser: "bermain".

  Semua dari `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/`.
- **Mix:** ffmpeg sesuai brief (bed -5 dB, sidechaincompress dari VO, amix). Bedanya, VO diberi `apad=whole_dur=91.543`; tanpa itu `full.wav` terpotong di 90.88 dtk.
  - Hasil `public/audio/ep03/full.wav`: 91.54 dtk, -16.6 LUFS, peak -4.4 dBFS.
  - Bed sekitar 14 dB di bawah suara.
  - Loudnorm ke -14 LUFS dilakukan di render final.
