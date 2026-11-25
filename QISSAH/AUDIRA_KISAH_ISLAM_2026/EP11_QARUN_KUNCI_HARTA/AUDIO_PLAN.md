# EP 11: QARUN: KUNCI HARTA YANG TERLALU BERAT

Seri AUDIRA, KISAH DALAM AL-QUR'AN. Created by Agus Dwi R. Riset 7 November 2026.

## Musik dan desain suara

Pad mirip senar rendah dan denting logam di maqam Hijaz, gemerincing koin, rantai kunci berat, gemuruh tanah di s7.

## Aturan mix

- VO Cartesia dinormalisasi ke -16 LUFS, musik dan SFX sekitar 15 dB di bawah suara, ducking otomatis saat VO berbunyi (`audio_lib.Mix.finish`).
- Master akhir -14 LUFS, true peak di bawah -1 dBTP (`master.py`).
- Semua cue SFX menempel ke kata di naskah (`PROJECT/beats.json`), jadi ikut bergeser saat VO asli masuk.

## Status

VO terkunci ke timeline asli.
