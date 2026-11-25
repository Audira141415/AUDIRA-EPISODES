# QA REPORT — EP01_MIMIKA_81_RIBU_ISPA

Tanggal: 2026-11-10. Style: SATELLITEBRIEFING.

| Cek | Hasil |
|---|---|
| Resolusi / fps | 1080×1920 @ 60 (NVENC) |
| Durasi | 80.79 dtk (VO 76.8 dtk + outro AUDIRA) |
| Loudness | -13.6 LUFS integrated, puncak -1.8 dBFS (target −14 LUFS, < −1 dBTP) |
| Frame hitam | 0 (ffmpeg blackdetect) |
| Frame dari MP4 final | 8 frame dicek di `../_qa/finals-qc.jpg` |
| Metadata kepemilikan | title/artist/copyright/comment/date terpasang (ffprobe) |
| Tanda tangan AUDIRA | AudiraSignature bergerak (Root.tsx), nama AUDIRA di dalam adegan, VO "Ini Audira" |
| Outro | kartu AUDIRA + Created by Agus Dwi R. di 77.0 dtk |
| Subtitle | `SUBTITLES.srt` dari timestamp kata VO; caption karaoke dalam safe zone (bawah 380 px kosong) |
| Skor rubrik | draf 4,0 LOLOS, final 4,0 LOLOS (audira_style_memory) |
| Caption sosial | `SOCIAL_CAPTIONS.md` lolos `audira_validate_social_captions` (ok: true) |
