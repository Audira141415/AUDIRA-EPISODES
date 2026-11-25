# QA REPORT — AE-068 (URBANFORGE)

Tanggal: 2026-11-24. File: `FINAL_VIDEO.mp4` (diarsipkan di `archive/2026-11-24/`).

| Cek | Hasil | Status |
|---|---|---|
| Resolusi / fps | 1080×1920 @ 60 fps (ffprobe) | LOLOS |
| Durasi | 65.00 dtk (Audio Master Clock, timeline.json) | LOLOS |
| Loudness | -13.7 LUFS integrated (ebur128 pada MP4 final) | LOLOS (target −14 ±1) |
| True peak | -1.8 dBFS | LOLOS (< −1 dBFS) |
| Sinkron caption | 72% kata dalam ±0,25 dtk dari audio (whisper large-v3), median +0.142 dtk | LOLOS |
| Frame dari MP4 | `qa/final_frames.jpg` (8 frame merata) tanpa frame hitam (blackdetect 0) | LOLOS |
| Safe zone | kicker y ≥ 262 px, caption di atas 380 px bawah | LOLOS |
| Branding | AudiraSignature (lapisan terakhir), AUDIRA di dunia 3D, VO "Ini AUDIRA Explained.", Outro Monolit + Created by Agus Dwi R. | LOLOS |
| Metadata | title "Pipa Hampir 2 Meter Lewat di Bawah Jalan Tanpa Bongkar Aspal, Begini Caranya", artist "AUDIRA (Agus Dwi R.)", comment "AUDIRA-pipa-bawah-jalan-AE-068 | audira.my.id" (ffprobe) | LOLOS |
| Klaim | sesuai RESEARCH_REPORT + JANGAN DIKLAIM | LOLOS |
| Rubrik style memory | juri buta draf r1 3,00 → r2 3,83 LOLOS (L4 M4 D4 C3 Mo5 R3) | LOLOS |

Catatan sisa: F6 "Ø 4,05 M" vs VO "empat meter"; caption F4 pudar di beton terang; 40% bawah F3/F4 kosong; rantai 189 segmen agak abstrak.
