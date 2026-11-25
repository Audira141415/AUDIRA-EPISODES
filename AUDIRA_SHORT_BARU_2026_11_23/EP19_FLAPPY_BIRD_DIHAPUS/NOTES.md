# NOTES — EP19 Flappy Bird Dihapus Pembuatnya (AUDIRA TECH, @AudiraTECH)
Style: PIXELSTORY · Engine: Remotion 2D · Tanggal final: 2026-11-23

## Hasil
- `FINAL_VIDEO.mp4` (= `project/out/ep19/FINAL_EP19.mp4`): 1080×1920 @ 60, 89,48 dtk, 152 MB.
- Audio: −13,6 LUFS, true peak −1,8 dBFS. VO −16,7 LUFS, SFX ter-duck −33,4 LUFS (selisih 16,7 LU).
- Metadata ffmpeg ok; signature Ed25519 + C2PA VALID; `audira_qa_video` hardOnly PASS.
- VO: `audio/vo.wav` 85,47 dtk, offset 0. SFX: `project/public/audio/ep19/sfx.wav` (−20 LUFS, 38 bunyi).
- Cover/thumbnail: `style/cover-topic.png` (frame 0,5 dtk Ep19Cover).

## Juri draf
- Putaran 1: 3,17 (lighting 4, material 3, depth 3, composition 3, motion 3, readability 3).
- Putaran 2: 3,50 (motion 5 terukur audit:camera). **Diterima 3.50 setelah 2 putaran** → langsung final (aturan 2026-11-23).

## Pelajaran
- Gagal: 30% bawah frame (di bawah caption) gelap kosong dan set terasa satu bidang; floor glow tipis tidak menolong. Isi bawah dengan FG terang/bertekstur sejak awal.
- Fix: rim light cyan kedua pada sprite siluet programmer tampak seperti garis glitch → dihapus (rim 0,5 dari lampu adegan).
- Fix: scroll layar game penuh terbaca sebagai gerak kamera; kecepatan 2,2 → 1,35 menaikkan audit kamera 3 → 5.
- Fix: header kartu postingan bertumpuk ("DONG NGUYEN8 FEB 2014") → dua baris.
- Branding: `src/brand/channel.json` di proyek ini menunjuk @AudiraSportFacts; Root.tsx memakai `code="TECH"` pada AudiraSignature dan AudiraOutro.
- render-final butuh `--skip-memory-gate` (gate belum mengenal auto-accept ≥3,5 setelah 2 putaran) dan `--skip-channel` (batch tanpa SERIES.json).
- qa_video `--allow` 34.62,39.12,39.22,40.30,41.28,42.37,61.03: hentakan ketuk di adegan game dan stamp HILANG, keduanya disengaja.
- Contact sheet putaran 1 mengambil counter yang masih berjalan (1,6 dtk) → juri menilai angka salah; ambil frame setelah counter selesai.

## Review pasca-tayang (scheduled task)
- `review-flappy-bird-dihapus-24h` → 4 Des 2026 19.00 WIB
- `review-flappy-bird-dihapus-72h` → 6 Des 2026 19.00 WIB
- `review-flappy-bird-dihapus-7d` → 10 Des 2026 19.00 WIB
Task hanya jalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).
