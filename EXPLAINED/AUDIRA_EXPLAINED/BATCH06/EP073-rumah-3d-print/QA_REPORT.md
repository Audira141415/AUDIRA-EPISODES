# QA REPORT — AE-073 (SATISFYFORGE)

Tanggal: 2026-11-10. File: `FINAL_VIDEO.mp4` (diarsipkan di `archive/2026-11-10/`).

| Cek | Hasil | Status |
|---|---|---|
| Resolusi / fps | 1080×1920 @ 60 fps (ffprobe) | LOLOS |
| Durasi | 65.00 dtk (Audio Master Clock, timeline.json) | LOLOS |
| Loudness | -13.6 LUFS integrated (ebur128 pada MP4 final) | LOLOS (target −14 ±1) |
| True peak | -1.7 dBFS | LOLOS (< −1 dBFS) |
| Sinkron caption | 96% kata dalam ±0,25 dtk dari audio (whisper), median -0.039 dtk | LOLOS |
| Frame dari MP4 | `qa/final_frames.jpg` (8 frame merata) tanpa frame hitam (blackdetect 0) | LOLOS |
| Audit visual final | `qa/look_final.json` (`audit:visual --stage=final`), tidak ada aspek dibatasi di bawah 4 | LOLOS |
| Safe zone | kicker y ≥ 262 px, caption di atas 380 px bawah | LOLOS |
| Branding | AudiraSignature (lapisan terakhir), AUDIRA di dunia 3D, VO "Ini AUDIRA Explained.", Outro Monolit + Created by Agus Dwi R. | LOLOS |
| Metadata | title "Printer Sebesar Truk Mencetak Rumah, Tapi Bukan Seluruh Rumah", artist "AUDIRA (Agus Dwi R.)", comment "AUDIRA-rumah-3d-print-AE-073 | audira.my.id" (ffprobe) | LOLOS |
| Klaim | sesuai RESEARCH_REPORT + JANGAN DIKLAIM | LOLOS |
| Rubrik style memory | cover 4,0 · draf 4,0 · final 4,0 | LOLOS |

Catatan sisa: Close-up nozzle didominasi corong (hopper).
