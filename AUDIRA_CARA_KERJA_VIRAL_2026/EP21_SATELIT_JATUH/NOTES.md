# NOTES — EP21_SATELIT_JATUH

Tanggal: 9 November 2026. Style: DISASTERSIM. Seri CARA KERJA VIRAL, batch EP21–EP25.

## Alur
Riset (subagen, `_research/`), gerbang style (papan `STYLE_OPTIONS_EP21-25.jpg`, pengguna memilih opsi utama), build bisu di timeline perkiraan + cover topik (`COVERS_TOPIK_EP21-25.jpg`, naskah `REVIEW_SCRIPTS_EP21-25.md`, disetujui), VO Cartesia Galang lewat `_tools/voice-draft.sh`, contact sheet bersuara (`DRAFT_SHEETS_EP21-25.jpg`, disetujui), lalu final 60 fps lewat `_tools/final-60.sh` (DATE=2026-11-09).

## Angka
Ujaran 80.0 dtk, film 83.0 dtk, 126 WPM. Master -14.0 LUFS, true peak -1.9 dBTP. Sinkron subtitle 99.4%. 0 galat dekode, 0 segmen hitam.

## Pelajaran
- Kamera dan konstanta waktu diikat ke anchor kata/scene, sehingga timeline perkiraan pindah ke timing suara asli tanpa perbaikan manual.
- Subagen kena batas 5 jam di tengah build; dilanjutkan dengan SendMessage dari titik terakhir tanpa kehilangan kerja.
- Yang masih lemah: Gelombang kejut di depan satelit masih terbaca seperti mangkuk kaca bercahaya; tabung teleskop putih terlalu terang di bloom. Robot penyelamat kecil dan sulit dibaca.

## Offset VO
Tidak ada offset manual; timing kata dari Cartesia dikunci `vo.py build --tempo 1.0`.

## Review pasca-tayang
Jadwal upload di SOCIAL_CAPTIONS.md. Cek 24 jam, 72 jam, 7 hari setelah tayang dan catat di sini.
