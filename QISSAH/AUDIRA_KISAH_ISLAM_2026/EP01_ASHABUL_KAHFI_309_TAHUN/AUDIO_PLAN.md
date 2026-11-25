# EP 01: ASHABUL KAHFI: TIDUR 309 TAHUN

Seri AUDIRA, KISAH DALAM AL-QUR'AN. Created by Agus Dwi R. Riset 6 November 2026.

## Musik dan desain suara

Petikan mirip oud di maqam Bayati dengan drone rendah, tetes air gua dan angin, dentang koin perak, bunyi kertas saat panel terlipat.

## Aturan mix

- VO Cartesia dinormalisasi ke -16 LUFS, musik dan SFX sekitar 15 dB di bawah suara, ducking otomatis saat VO berbunyi (`audio_lib.Mix.finish`).
- Master akhir -14 LUFS, true peak di bawah -1 dBTP (`master.py`).
- Semua cue SFX menempel ke kata di naskah (`PROJECT/beats.json`), jadi ikut bergeser saat VO asli masuk.

## Status

VO terkunci ke timeline asli.
