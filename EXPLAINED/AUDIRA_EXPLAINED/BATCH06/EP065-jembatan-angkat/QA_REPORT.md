# QA REPORT — AE-065 (VINTAGEFORGE)

Tanggal: 2026-11-10. File: `FINAL_VIDEO.mp4` (diarsipkan di `archive/2026-11-10/`).

| Cek | Hasil | Status |
|---|---|---|
| Resolusi / fps | 1080×1920 @ 60 fps (ffprobe) | LOLOS |
| Durasi | 65.00 dtk (Audio Master Clock, timeline.json) | LOLOS |
| Loudness | -13.7 LUFS integrated (ebur128 pada MP4 final) | LOLOS (target −14 ±1) |
| True peak | -1.8 dBFS | LOLOS (< −1 dBFS) |
| Sinkron caption | 97% kata dalam ±0,25 dtk dari audio (whisper), median -0.034 dtk | LOLOS |
| Frame dari MP4 | `qa/final_frames.jpg` (8 frame merata) tanpa frame hitam (blackdetect 0) | LOLOS |
| Audit visual final | `qa/look_final.json` (`audit:visual --stage=final`), tidak ada aspek dibatasi di bawah 4 | LOLOS |
| Safe zone | kicker y ≥ 262 px, caption di atas 380 px bawah | LOLOS |
| Branding | AudiraSignature (lapisan terakhir), AUDIRA di dunia 3D, VO "Ini AUDIRA Explained.", Outro Monolit + Created by Agus Dwi R. | LOLOS |
| Metadata | title "Jembatan Seberat 1.000 Ton Bisa Diangkat Motor Kecil, Ini Rahasianya", artist "AUDIRA (Agus Dwi R.)", comment "AUDIRA-jembatan-angkat-AE-065 | audira.my.id" (ffprobe) | LOLOS |
| Klaim | sesuai RESEARCH_REPORT + JANGAN DIKLAIM | LOLOS |
| Rubrik style memory | cover 4,0 · draf 4,0 (setelah 2 putaran poles dari 3,83) · final 4,0 | LOLOS |

Catatan sisa: Kilatan perkamen di 56,7 dtk; kapal di hook hanya terlihat ujung tiang.
