# QA REPORT — AE-069 (PAPERWORLD)

Tanggal: 2026-11-10. File: `FINAL_VIDEO.mp4` (diarsipkan di `archive/2026-11-10/`).

| Cek | Hasil | Status |
|---|---|---|
| Resolusi / fps | 1080×1920 @ 60 fps (ffprobe) | LOLOS |
| Durasi | 57.45 dtk (Audio Master Clock, timeline.json) | LOLOS |
| Loudness | -13.6 LUFS integrated (ebur128 pada MP4 final) | LOLOS (target −14 ±1) |
| True peak | -1.9 dBFS | LOLOS (< −1 dBFS) |
| Sinkron caption | 98% kata dalam ±0,25 dtk dari audio (whisper), median -0.032 dtk | LOLOS |
| Frame dari MP4 | `qa/final_frames.jpg` (8 frame merata) tanpa frame hitam (blackdetect 0) | LOLOS |
| Audit visual final | `qa/look_final.json` (`audit:visual --stage=final`), tidak ada aspek dibatasi di bawah 4 | LOLOS |
| Safe zone | kicker y ≥ 262 px, caption di atas 380 px bawah | LOLOS |
| Branding | AudiraSignature (lapisan terakhir), AUDIRA di dunia 3D, VO "Ini AUDIRA Explained.", Outro Monolit + Created by Agus Dwi R. | LOLOS |
| Metadata | title "Air Bekas Mandimu Bisa Kembali ke Sungai Lebih Bersih, Begini Caranya", artist "AUDIRA (Agus Dwi R.)", comment "AUDIRA-pengolahan-limbah-AE-069 | audira.my.id" (ffprobe) | LOLOS |
| Klaim | sesuai RESEARCH_REPORT + JANGAN DIKLAIM | LOLOS |
| Rubrik style memory | cover 4,0 · draf 4,0 · final 4,0 | LOLOS |

Catatan sisa: Close-up dominan coklat.
