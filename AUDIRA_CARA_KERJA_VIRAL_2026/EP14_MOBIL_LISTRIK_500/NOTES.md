# NOTES — EP14_MOBIL_LISTRIK_500

Tanggal final: 8 November 2026. Style: PRECISION. Pipeline: riset → gerbang style → build senyap + cover topik → gerbang naskah → VO Cartesia (`_tools/voice-draft.sh`) → gerbang draf → `_tools/final-60.sh` (60 fps) → `_tools/docs-11-15.py` → `_tools/captions-11-15.py`.

## Hasil
- 1080x1920 @ 60/1, 78.2 dtk, -14.1 LUFS, true peak -1.7 dBTP.
- Ujaran 75.228 dtk, 144 WPM; sinkron caption 99.4% (onset maks 0.061 dtk).
- Offset VO: tidak ada; timeline dikunci langsung dari meta Cartesia (`vo.py build --tempo 1.0`).

## Pelajaran
- Bodi mobil prosedural lebih sederhana dari CGI produk asli; tidak ada pass AO, diganti bayangan kontak. Silau lampu depan di s5/s7.
- Run voice-draft pertama gagal karena folder `SUBTITLES/` belum ada di episode baru; sekarang skrip membuatnya dan melewati TTS bila klip sudah ada.

## Upload
- Jadwal: lihat `SOCIAL_CAPTIONS.md` (EP11 Minggu 15 Nov → EP15 Kamis 19 Nov 2026, 19.00-20.40 WIB).

## Review pasca-tayang
- 24 jam: -
- 72 jam: -
- 7 hari: -
