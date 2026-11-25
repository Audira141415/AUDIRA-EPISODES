# QA REPORT — EP05_ASAP_LINTAS_NEGARA

Tanggal: 2026-11-10. Style: HISTORYMAP.

| Cek | Hasil |
|---|---|
| Resolusi / fps | 1080×1920 @ 60 (NVENC) |
| Durasi | 85.53 dtk (VO 81.5 dtk + outro AUDIRA) |
| Loudness | -13.6 LUFS integrated, puncak -1.6 dBFS (target −14 LUFS, < −1 dBTP) |
| Frame hitam | 0 (ffmpeg blackdetect) |
| Frame dari MP4 final | 8 frame dicek di `../_qa/finals-qc.jpg` |
| Metadata kepemilikan | title/artist/copyright/comment/date terpasang (ffprobe) |
| Tanda tangan AUDIRA | AudiraSignature bergerak (Root.tsx), nama AUDIRA di dalam adegan, VO "Ini Audira" |
| Outro | kartu AUDIRA + Created by Agus Dwi R. di 81.7 dtk |
| Subtitle | `SUBTITLES.srt` dari timestamp kata VO; caption karaoke dalam safe zone (bawah 380 px kosong) |
| Skor rubrik | draf 4,0 LOLOS, final 4,0 LOLOS (audira_style_memory) |
| Caption sosial | `SOCIAL_CAPTIONS.md` lolos `audira_validate_social_captions` (ok: true) |
