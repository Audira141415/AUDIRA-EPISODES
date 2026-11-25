# NOTES — EP12_GO_AROUND_ANGIN

Tanggal final: 8 November 2026. Style: WORLDFORGE. Pipeline: riset → gerbang style → build senyap + cover topik → gerbang naskah → VO Cartesia (`_tools/voice-draft.sh`) → gerbang draf → `_tools/final-60.sh` (60 fps) → `_tools/docs-11-15.py` → `_tools/captions-11-15.py`.

## Hasil
- 1080x1920 @ 60/1, 84.8 dtk, -14.0 LUFS, true peak -1.8 dBTP.
- Ujaran 81.847 dtk, 130 WPM; sinkron caption 98.9% (onset maks 0.078 dtk).
- Offset VO: tidak ada; timeline dikunci langsung dari meta Cartesia (`vo.py build --tempo 1.0`).

## Pelajaran
- Shader berkas lampu pendaratan dan aoMap tanah menghasilkan NaN; bloom menyebarkannya sehingga s1-s3 hitam. Diganti shader baru dan patch vertex-colour. Grouper caption bawaan menyisakan kata tunggal; episode ini memakai grouper sendiri (maks 4 kata/26 karakter).
- Run voice-draft pertama gagal karena folder `SUBTITLES/` belum ada di episode baru; sekarang skrip membuatnya dan melewati TTS bila klip sudah ada.

## Upload
- Jadwal: lihat `SOCIAL_CAPTIONS.md` (EP11 Minggu 15 Nov → EP15 Kamis 19 Nov 2026, 19.00-20.40 WIB).

## Review pasca-tayang
- 24 jam: -
- 72 jam: -
- 7 hari: -
