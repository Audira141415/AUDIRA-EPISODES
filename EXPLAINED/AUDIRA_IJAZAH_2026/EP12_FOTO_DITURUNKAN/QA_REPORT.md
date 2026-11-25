# QA REPORT: EP12_FOTO_DITURUNKAN

Tanggal: 8 November 2026. Semua cek di bawah dijalankan pada `FINAL_VIDEO.mp4`.

| Cek | Hasil | Status |
|---|---|---|
| Resolusi, fps, durasi | 1080,1920,60/1 | 89.200000 | LOLOS (1080x1920, 60 fps) |
| Loudness terintegrasi | -14.0 LUFS | LOLOS (target -14) |
| True peak | -1.9 dBFS | LOLOS (di bawah -1) |
| VO | Cartesia sonic-3, voice 04b567df, -16 LUFS sebelum mix; musik sekitar -31 LUFS | LOLOS |
| Kata terucap / bicara | 191 kata, 86.1 dtk | LOLOS (target ~90 dtk) |
| Sinkron caption | caption_words_with_voice >= 99.5% (qc.py) | LOLOS |
| Subtitle SRT | 62 cue, `SUBTITLES.srt` | LOLOS |
| Safe zone | caption di 1290-1540 px, kartu di 236 px ke bawah, tanda tangan di luar 380 px bawah | LOLOS |
| Outro | kartu AUDIRA + "Created by Agus Dwi R." di detik terakhir | LOLOS |
| Anti-reupload | AudiraSignature bergerak (32%, 18 dtk), brand AUDIRA di dalam adegan, "Audira" di narasi, metadata kepemilikan (dicek ffprobe) | LOLOS |
| Cek mute | tiap adegan punya papan nama atau kartu sumber (siapa, berkata apa, kapan) | LOLOS (contact sheet `PROJECT/qc/final-sheet.jpg`) |
| Pengucapan | dicek lewat durasi kata (tak ada kata dieja huruf); belum didengar manusia | PERLU DENGAR |

Catatan: fakta per 8 Nov 2026. Cek ulang perkembangan sebelum unggah.
