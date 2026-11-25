# EP 05: BAHTERA NABI NUH: 950 TAHUN MENYERU

Seri AUDIRA, KISAH DALAM AL-QUR'AN. Created by Agus Dwi R. Riset 6 November 2026.

## Musik dan desain suara

Perkusi kayu seperti palu mengikuti ketukan, drone mirip cello, hujan dan guruh membangun, ombak besar, lalu resolusi mayor yang tenang.

## Aturan mix

- VO Cartesia dinormalisasi ke -16 LUFS, musik dan SFX sekitar 15 dB di bawah suara, ducking otomatis saat VO berbunyi (`audio_lib.Mix.finish`).
- Master akhir -14 LUFS, true peak di bawah -1 dBTP (`master.py`).
- Semua cue SFX menempel ke kata di naskah (`PROJECT/beats.json`), jadi ikut bergeser saat VO asli masuk.

## Status

VO terkunci ke timeline asli.
