# EP 09: ONODA: TETAP PERANG 29 TAHUN SETELAH PERANG USAI

Seri AUDIRA, FAKTA SEJARAH NEGARA DUNIA. Created by Agus Dwi R. Riset 6 November 2026.

## Musik dan desain suara

Sunyi dan muram: tiupan mirip shakuhachi, denyut taiko lembut, serangga dan hujan; kertas, pesawat, tembakan teredam, rana kamera, pedang diletakkan, radio statis.

## Aturan mix

- VO Cartesia dinormalisasi ke -16 LUFS, musik dan SFX sekitar 15 dB di bawah suara, ducking otomatis saat VO berbunyi (`audio_lib.Mix.finish`).
- Master akhir -14 LUFS, true peak di bawah -1 dBTP (`master.py`).
- Semua cue SFX menempel ke kata di naskah (`PROJECT/beats.json`), jadi ikut bergeser saat VO asli masuk.

## Status

VO terkunci ke timeline asli.
