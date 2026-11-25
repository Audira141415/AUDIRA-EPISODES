# QA REPORT — AE-056 (TIMEFORGE)

Tanggal: 2026-11-09. File: `FINAL_VIDEO.mp4` (diarsipkan di `archive/2026-11-09/`).

| Cek | Hasil | Status |
|---|---|---|
| Resolusi / fps | 1080×1920 @ 60 fps (ffprobe) | LOLOS |
| Durasi | 62.83 dtk (Audio Master Clock, timeline.json) | LOLOS |
| Loudness | -13.7 LUFS integrated (ebur128 pada MP4 final) | LOLOS (target −14 ±1) |
| True peak | -1.7 dBFS | LOLOS (< −1 dBFS) |
| Sinkron caption | 95% kata dalam ±0,25 dtk dari audio (whisper), median ±0,03 dtk | LOLOS |
| Frame dari MP4 | `qa/final_frames.jpg` (8 frame: hook, tiap section, outro) tanpa frame abu-abu/hitam | LOLOS |
| Safe zone | kicker y ≥ 262 px, caption di atas 380 px bawah | LOLOS |
| Branding | AudiraSignature (lapisan terakhir), AUDIRA di dunia 3D, VO "Ini AUDIRA Explained.", Outro Monolit + Created by Agus Dwi R. | LOLOS |
| Metadata | title/artist/copyright/comment/date ditulis, dicek ffprobe | LOLOS |
| Klaim | sesuai RESEARCH_REPORT + JANGAN DIKLAIM | LOLOS |
| Rubrik style memory | cover 4,0 · draf 4,0 · final 4,0 | LOLOS |

Catatan sisa: Kuda masih sederhana dari dekat; label Liverpool kecil; establishing hook ramai.
