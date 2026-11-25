# QA REPORT — EP040-etle-malam-hari

Tanggal: 2026-11-07. File: `FINAL_VIDEO.mp4`.

| Cek | Hasil | Status |
|---|---|---|
| Resolusi / fps / durasi (ffprobe) | stream|width=1080|height=1920|r_frame_rate=60/1| / stream|r_frame_rate=0/0 / format|duration=65.002000 | OK |
| Loudness terintegrasi | -13.6 LUFS (target −14 ±0,5) | OK |
| True peak | -1.8 dBTP (< −1) | OK |
| Caption sync (whisper vs timeline) | 98% kata ≤0,25 dtk, median offset ≈ −0,03 dtk | OK |
| Outro AUDIRA (Monolit + Created by Agus Dwi R.) | mulai 61.20 dtk s/d 65.00 dtk | OK |
| Frame dari MP4 | `qa/final_frames.jpg` (1,5 / 12 / 25 / 40 / 55 / 63,5 dtk) dicek visual | OK |
| Safe zone | caption & label di atas 380 px bawah, judul ≥180 px atas (cek contact sheet draf) | OK |
| Klaim | sesuai `research/SOURCE_REGISTER.md` + daftar JANGAN DIKLAIM | OK |
| Caption sosial | `SOCIAL_CAPTIONS.md` lolos `audira_validate_social_captions` (ok: true) | OK |

Catatan: `npm run audit:visual` dijalankan dan lulus, tetapi skrip itu daftar periksa statis (tidak membaca video), jadi QA nyata = poin di atas.
Belum diverifikasi: pengucapan singkatan (ETLE/PDAM pakai ejaan fonetik) dan kualitas musik prosedural — perlu didengar manusia.
