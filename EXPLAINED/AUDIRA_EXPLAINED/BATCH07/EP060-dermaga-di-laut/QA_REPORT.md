# QA REPORT — AE-060 (BEDAH)

Tanggal: 2026-11-24. File: `FINAL_VIDEO.mp4` (diarsipkan di `archive/2026-11-24/`).

| Cek | Hasil | Status |
|---|---|---|
| Resolusi / fps | 1080×1920 @ 60 fps (ffprobe) | LOLOS |
| Durasi | 63.32 dtk (Audio Master Clock, timeline.json) | LOLOS |
| Loudness | -13.7 LUFS integrated (ebur128 pada MP4 final) | LOLOS (target −14 ±1) |
| True peak | -1.8 dBFS | LOLOS (< −1 dBFS) |
| Sinkron caption | 82% kata dalam ±0,25 dtk dari audio (whisper large-v3), median +0.117 dtk | LOLOS |
| Frame dari MP4 | `qa/final_frames.jpg` (8 frame merata) tanpa frame hitam (blackdetect 0) | LOLOS |
| Safe zone | kicker y ≥ 262 px, caption di atas 380 px bawah | LOLOS |
| Branding | AudiraSignature (lapisan terakhir), AUDIRA di dunia 3D, VO "Ini AUDIRA Explained.", Outro Monolit + Created by Agus Dwi R. | LOLOS |
| Metadata | title "Dermaga 3 Km di Tengah Laut Ini Tidak Mengapung, Ini Rahasianya", artist "AUDIRA (Agus Dwi R.)", comment "AUDIRA-dermaga-di-laut-AE-060 | audira.my.id" (ffprobe) | LOLOS |
| Klaim | sesuai RESEARCH_REPORT + JANGAN DIKLAIM | LOLOS |
| Rubrik style memory | juri buta draf r1 3,50 → r2 3,67, diterima 3,67 setelah 2 putaran | DITERIMA |

Catatan sisa: Skor juri 3,67 (diterima setelah 2 putaran, di bawah 3,8).
