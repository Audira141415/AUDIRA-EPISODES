# NOTES — EP07 Hidangan dari Langit (AUDIRA QISSAH)

Style: MANUSCRIPT · Engine: Remotion 2D · Durasi 85,0 dtk (VO 81,64 + outro 3 dtk) · 1080×1920 @ 60 · memoryEpisode `short-baru-11-23-EP07`

## Riwayat style
1. ISLAMICDOCUMENTARY: gagal juri 2 putaran (3.33 / 3.33). Kelemahan: readability 2, beat doa terlalu abstrak, motif tudung saji berulang.
2. PAPERWORLD: gagal juri 2 putaran (3.33 / 3.17). Template kartu-atas/objek-tengah berulang, material dan depth datar.
3. MANUSCRIPT: juri r1 3.17 → r2 3.83 LOLOS. Final dirender.

## Pelajaran
- MANUSCRIPT cocok untuk kisah Qur'ani: kodeks, medalion, huruf emas bertepi tinta, meja walnut + segel lilin sebagai tempat brand AUDIRA. Yang mengangkat r1 → r2: grade global hangat (soft-light + overlay kertas), stroke tinta pada rubrik, caption 62 px, satu hero per shot, kamera low-angle di beat jawaban.
- QA final (qa_video hardOnly) menangkap 2 LONCAT yang tidak terlihat di contact sheet:
  - 44.13 dtk: medalion non-aktif diredupkan ke 0.3 secara instan (`i === active ? 1 : 0.3`). Fix: bobot emphasis halus `eio` antar medalion + glow ikut bobot.
  - 64.2 dtk: warna awan/bukit berpindah di `storm > 0.5`. Fix: `interpolateColors(storm, [0.3, 0.7], ...)`.
  - Pelajaran umum: jangan pakai ternary boolean untuk opacity/warna yang dianimasikan; selalu interpolasi. Segmen diperbaiki dengan render `--frames` lalu disambung (hemat ±35 menit dibanding render penuh).
- Audio: SFX stem −18,9 LUFS → `volume=-11dB` (≈ −30 LUFS, sesuai G18e). Mix mentah mono; master −14 LUFS baru tercapai setelah dibuat stereo (pan dual-mono) lalu loudnorm 2 pass (mode dinamis karena TP membatasi linear). Ukur loudness dengan `-vn` (tanpa itu ebur128 bisa terpotong).
- Offset VO: 0. Python default tidak punya numpy (skrip SFX: `py -3 -m pip install numpy`). Override model subagen juri ("sonnet") gagal 404: pakai default.
- Render paralel ±6 sesi: `--concurrency=2`, TEMP di `F:/tmp-remotion-ep07` (drive C: pernah penuh).

## Final & QA (2026-11-23)
- `FINAL_VIDEO.mp4`: 1080×1920 @ 60, 85,0 dtk, 5100 frame, AAC stereo. Loudness −14,0 LUFS, true peak −1,3 dBFS (diukur `-vn`). Metadata kepemilikan OK (ffprobe). `AudiraSignature` seed `hidangan-dari-langit-ep07` aktif, outro AUDIRA di 82–85 dtk.
- `audira_qa_video` hardOnly: PASS (cuts terencana 14, flash 62.05 sengaja: kilat jawaban Allah).
- Skor: juri draf r2 3.83 LOLOS; skor final self 3.67 (depth 3, motion 3 tanpa audit:camera). Kandidat promosi GLOBAL "camera" (2 episode) belum dipromosikan: tawarkan ke pengguna di sesi berikutnya.

## Review terjadwal (tahap 11)
Upload: Kamis 26 Nov 2026 19.30 WIB (slot pertama Jadwal Upload). Task sekali jalan:
- `review-hidangan-dari-langit-24h` — 27 Nov 2026 19.30 WIB
- `review-hidangan-dari-langit-72h` — 29 Nov 2026 19.30 WIB
- `review-hidangan-dari-langit-7d` — 3 Des 2026 19.30 WIB
Task hanya berjalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).
