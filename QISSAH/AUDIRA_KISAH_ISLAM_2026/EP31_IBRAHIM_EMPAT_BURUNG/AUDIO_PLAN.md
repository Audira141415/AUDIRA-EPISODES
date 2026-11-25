# EP 31: NABI IBRAHIM DAN EMPAT BURUNG: AGAR HATIKU TENANG

Seri AUDIRA, KISAH DALAM AL-QUR'AN. Created by Agus Dwi R. Riset 9 November 2026.

## Musik dan desain suara

Seruling ney dan drone tenang di maqam Bayati, angin bukit, kepakan sayap.

## Aturan mix

- VO Cartesia dinormalisasi ke -16 LUFS, musik dan SFX sekitar 15 dB di bawah suara, ducking otomatis saat VO berbunyi (`audio_lib.Mix.finish`).
- Master akhir -14 LUFS, true peak di bawah -1 dBTP (`master.py`).
- Semua cue SFX menempel ke kata di naskah (`PROJECT/beats.json`), jadi ikut bergeser saat VO asli masuk.

## Status

VO terkunci ke timeline asli.
