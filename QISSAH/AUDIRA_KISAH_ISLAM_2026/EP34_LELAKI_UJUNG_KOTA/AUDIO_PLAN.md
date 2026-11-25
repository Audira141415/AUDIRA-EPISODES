# EP 34: LELAKI DARI UJUNG KOTA: SURAH YASIN 13-29

Seri AUDIRA, KISAH DALAM AL-QUR'AN. Created by Agus Dwi R. Riset 9 November 2026.

## Musik dan desain suara

Drone sintetis lembut dan oud di maqam Saba, sapuan pemindai, langkah cepat.

## Aturan mix

- VO Cartesia dinormalisasi ke -16 LUFS, musik dan SFX sekitar 15 dB di bawah suara, ducking otomatis saat VO berbunyi (`audio_lib.Mix.finish`).
- Master akhir -14 LUFS, true peak di bawah -1 dBTP (`master.py`).
- Semua cue SFX menempel ke kata di naskah (`PROJECT/beats.json`), jadi ikut bergeser saat VO asli masuk.

## Status

VO terkunci ke timeline asli.
