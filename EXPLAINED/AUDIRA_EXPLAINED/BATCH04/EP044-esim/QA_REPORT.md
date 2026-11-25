# QA REPORT — AE-044 eSIM

Tanggal: 2026-11-08. Style: PRECISION. File: `FINAL_VIDEO.mp4`.

| Cek | Hasil |
|---|---|
| Resolusi / fps | 1080×1920 @ 60 (ffprobe) |
| Durasi | 65,00 dtk (= timeline.total, Audio Master Clock) |
| Loudness | -13,6 LUFS terintegrasi, true peak -1,8 dBFS (target −14 LUFS, < −1 dBFS) |
| VO | Cartesia sonic-3, Galang `04b567df…`, tempo ×1,103, −16 LUFS sebelum mix |
| Sinkron caption | Whisper medium: 95% (110/123 kata) |
| Musik / SFX | Bed prosedural (bebas lisensi), ducking −9 dB saat VO, SFX pustaka AUDIRA (`sfx-cues.json`) |
| Branding | AudiraSignature bergerak (lapisan terakhir, hilang saat outro), AUDIRA di dalam adegan 3D, VO "Ini AUDIRA Explained.", kartu Outro Monolit + "Created by Agus Dwi R." |
| Metadata | title/artist/copyright/comment/date tertulis (ffprobe) |
| Frame dari MP4 | 6 frame diambil langsung dari MP4 final (`qa/final_frames.jpg`): warna, teks, outro benar |
| Safe zone | Teks atas ≥180 px, caption di atas 380 px bawah |
| Skor rubrik | Cover 4,0 · Draf 4,0 · Final 4,0 (motion memory) |
| Arsip | `archive/2026-11-08/` (FINAL_VIDEO.mp4, vo.wav, mix.wav, project tar) |
| Subtitle | `SUBTITLES.srt` dari timeline |

Status: LOLOS.
