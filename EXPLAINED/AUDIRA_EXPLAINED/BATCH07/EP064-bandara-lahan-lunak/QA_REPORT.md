# QA REPORT — AE-064 (LIDARFORGE)

Tanggal: 2026-11-24. File: `FINAL_VIDEO.mp4` (diarsipkan di `archive/2026-11-24/`).

| Cek | Hasil | Status |
|---|---|---|
| Resolusi / fps | 1080×1920 @ 60 fps (ffprobe) | LOLOS |
| Durasi | 65.00 dtk (Audio Master Clock, timeline.json) | LOLOS |
| Loudness | -13.6 LUFS integrated (ebur128 pada MP4 final) | LOLOS (target −14 ±1) |
| True peak | -1.9 dBFS | LOLOS (< −1 dBFS) |
| Sinkron caption | 78% kata dalam ±0,25 dtk dari audio (whisper large-v3), median +0.139 dtk | LOLOS |
| Frame dari MP4 | `qa/final_frames.jpg` (8 frame merata) tanpa frame hitam (blackdetect 0) | LOLOS |
| Safe zone | kicker y ≥ 262 px, caption di atas 380 px bawah | LOLOS |
| Branding | AudiraSignature (lapisan terakhir), AUDIRA di dunia 3D, VO "Ini AUDIRA Explained.", Outro Monolit + Created by Agus Dwi R. | LOLOS |
| Metadata | title "Bandara Ini Sudah Turun Hampir 14 Meter, Begini Cara Insinyur Mengendalikannya", artist "AUDIRA (Agus Dwi R.)", comment "AUDIRA-bandara-lahan-lunak-AE-064 | audira.my.id" (ffprobe) | LOLOS |
| Klaim | sesuai RESEARCH_REPORT + JANGAN DIKLAIM | LOLOS |
| Rubrik style memory | juri buta draf r1 2,83 → r2 3,67, diterima 3,67 setelah 2 putaran | DITERIMA |

Catatan sisa: Skor juri 3,67 (diterima setelah 2 putaran); judul F8 menyentuh tepi kanan.
