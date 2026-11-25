# QA Report — EP06_JIKA_WAPRES_MUNDUR

Dicek 2026-11-11 pada `FINAL_VIDEO.mp4` (ffprobe, ebur128, 6 frame dari MP4 di `../_qa/ep06-final.jpg`).

- [x] 1080×1920, 60 fps, 91,88 dtk, yuv420p (range TV, diperbaiki dari full range NVENC), outro AUDIRA + "Created by Agus Dwi R."
- [x] VO Cartesia Galang terkunci (87,9 dtk bicara), mix -13,7 LUFS terintegrasi, true peak -1,8 dBFS
- [x] Caption karaoke dari timeline VO, kotak di y 1340–1500 (di atas batas 1540); `SUBTITLES.srt` 39 cue
- [x] Anti-reupload: AudiraSignature bergerak (seed berita-viral-06-wapres-mundur), tag AUDIRA di dudukan kursi, "Audira" di VO hook dan outro, metadata kepemilikan (artist, copyright, comment AUDIRA-jika-wapres-mundur-EP06) dicek ffprobe
- [x] Fakta per 11 Nov 2026: Gibran baru menyatakan niat, belum surat resmi (ditulis di layar dan narasi)
- [ ] Juri buta draf TIDAK lolos (rata-rata 2,8–3,2; syarat 4,0) setelah 3 putaran polishing. Final dirender atas persetujuan pengguna (`--skip-memory-gate`). Kelemahan tersisa: cahaya studio agak datar, angka tahun kit TIMEFORGE di area 180 px atas.
- [ ] Pengucapan baru dicek lewat durasi kata (tak ada kata dieja huruf), belum didengar manusia.
