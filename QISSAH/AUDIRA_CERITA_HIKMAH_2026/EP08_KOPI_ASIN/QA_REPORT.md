# QA Report: EP08_KOPI_ASIN

| Cek | Hasil |
|---|---|
| Format | 16:9, 1920x1080, 60 fps, h264 (NVENC) + AAC, video panjang YouTube |
| Durasi | 284.0 s (4:44), naskah 543 kata |
| Loudness | -13.9 LUFS integrated, true peak -1.8 dBFS |
| Frame hitam | 0 segmen (blackdetect 0,5 s) |
| Gaya | FELTCRAFT (dipilih pengguna di gerbang style 2026-11-10) |
| Suara | Cartesia sonic-3 (Risa, Galang, Andi), dikunci sebelum film dibangun; musik/SFX di-duck di bawah suara |
| Subtitle | `SUBTITLES.srt`, 111 cue dari timestamp Cartesia; caption karaoke di film, pita bawah 22% |
| Brand | AudiraSignature (lapisan terakhir), nama AUDIRA di dalam dunia 3D, "Audira" di kalimat penutup, outro Monolit AMD + "Created by Agus Dwi R." |
| Metadata | title, artist "AUDIRA (Agus Dwi R.)", copyright 2026, comment AUDIRA-cerita-hikmah-EP08 (dicek dengan ffprobe) |
| Visual | 8 frame dari MP4 final diperiksa (`QA_SHEET.jpg`); draf contact sheet disetujui pengguna 2026-11-10 |

## Belum terverifikasi
- Film belum ditonton utuh oleh manusia: gerak, transisi, dan sinkron mulut hanya dicek lewat still.
- Musik dan keseimbangan suara hanya diukur (LUFS), belum didengar.

## Penyimpangan dari aturan
- Panjang ~4 menit sesuai pilihan pengguna (cerita utuh), bukan 8-12 menit rule 09; tanpa short turunan karena tidak diminta.
- Tidak ada RESEARCH_REPORT/SOURCE_REGISTER: isi dari rekaman cerita milik pengguna yang dituturkan ulang.
- Proyek bersama `studio_16x9/` (satu Remotion untuk EP07-11), bukan `project/` per episode (rule 08).
