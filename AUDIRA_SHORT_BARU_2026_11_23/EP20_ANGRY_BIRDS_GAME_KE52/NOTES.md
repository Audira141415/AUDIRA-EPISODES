# NOTES — EP20 Angry Birds: game ke-52 Rovio

Channel: AUDIRA TECH (@AudiraTECH) · Style: PIXELSTORY · Engine: HyperFrames 2D canvas (world2d.js, buffer 180×270, view 135×240 ×8 nearest) · Memory episode: `short-baru-11-23-EP20`
Tanggal produksi: 2026-11-23 · Film 87,7 dtk (VO 84,70 dtk + outro) · Final 1080×1920 @ 60

## Audio
- VO Cartesia (voice `04b567df-…`, speed 0,95) per baris lewat MCP `audira_generate_voiceover` (CARTESIA_API_KEY tidak ada di .env) → `lib/vo.py build`. **Offset VO: 0.**
- `project/mix.py`: chiptune numpy 112 BPM (E minor s1–s5 → G mayor s6+), SFX prosedural ter-duck di bawah VO.
- Stem (G18): VO −16,4 LUFS, SFX −32,9 LUFS (≤ −30), musik −32,4 LUFS. Master `lib/master.py` dua pass loudnorm: **−14,0 LUFS, true peak −1,8 dBTP**.
- Musik: tanpa musik berlisensi.

## Skor
- Draf putaran 1: self 4.0, juri 3.17.
- Draf putaran 2 (refleksi lantai, glow pool, LEVEL 52 dipindah, zoom s3, chip 32px): self 4.0, **juri 3.17** (lighting/material/depth/composition/readability 3, motion 4). Gagal batas 2 putaran; tool menyarankan ganti style (ARCADECRT/FILM16/VOXELVERSE).
- **Pengguna 2026-11-23 eksplisit: "jgn ganti langsung render"** → tetap PIXELSTORY, final dirender dari draf r2. Skor final dicatat 3.17 (tidak dinaikkan).

## Yang berhasil
- 13 set berbeda (51 layar GAME OVER → salju Helsinki → kantor badai 50→12 → papan gambar → koran FLU BABI → level ketapel → papan 8 bulan → etalase ponsel → tangga chart → hujan ponsel → bioskop neon AUDIRA TECH → peti SEGA → tangga 52). Motion dapat 4 dari juri dua kali.
- Caption sinkron: 99,4% kata caption bertepatan dengan suara, onset max gap 0,084 dtk.

## Yang gagal / pelajaran
- Juri PIXELSTORY (HyperFrames 2D) menuntut cahaya termotivasi (lampu hangat + falloff), tekstur di area besar (langit/rumput/bar chart bukan fill datar), haze/rim untuk depth, dan lebih sedikit tumpukan chip + panel + caption per frame. Refleksi lantai saja tidak menaikkan skor.
- `audira_qa_video` menandai kilat badai (flash 0,14 dtk di s3:bangkrut+3.1 dan s3:satu−0.6) dan cap KONON + shake (s4:konon 37,53) sebagai LONCAT. Diizinkan lewat `allow` karena efek sengaja; PASS.
- `lib/qc.py` butuh `../SUBTITLES.srt` (jalankan `python lib/build-srt.py` dulu) dan folder `out/qc`.
- Anchor `s1:ke-52` dibaca sebagai offset −52; pakai `s1:game#2+0.6`.
- Drive C: penuh (3,7 GB) → TEMP/TMP ke `F:\hf-render-tmp`. mix.py lambat (loop per-sampel di `audio_lib.finish`), ±3 menit di PC yang sibuk.

## Final
- `FINAL_VIDEO.mp4` 1080×1920 @ 60, 87,7 dtk, −14,0 LUFS, TP −1,8 dBTP, 0 decode error, 0 freeze, 0 black. Metadata title/artist/copyright/comment/date dicek ffprobe. Tanda tangan bergerak `AUDIRA · @AudiraTECH` aktif; outro card AUDIRA (Created by Agus Dwi R.) di 84,95 dtk; brand di dunia (neon AUDIRA TECH bioskop, papan s8) dan di VO ("ikuti AUDIRA TECH").
- `audira_qa_video` hardOnly PASS (5 efek sengaja di-allow: kilat s3 ×4, cap KONON).
- Signature Ed25519/C2PA: tidak dijalankan (proyek HyperFrames tanpa `npm run verify`).
- Contact sheet final: `draft/final-contact-sheet.jpg`; draf r2: `draft/contact-sheet.jpg`; draf r1: `work/contact-sheet-r1.jpg`.
- File perantara (raw/master MP4, snapshot draft1–3, snap1–2) dihapus 2026-11-23.

## Review pasca-tayang (scheduled task)
Upload: Sabtu 28 Nov 2026 19.00 WIB (TikTok → IG 19.20 → YT 19.40 → FB 20.00 → X 20.20 → Threads 20.40).
- `review-angry-birds-game-ke52-24h` — 29 Nov 2026 19.00 WIB
- `review-angry-birds-game-ke52-72h` — 1 Des 2026 19.00 WIB
- `review-angry-birds-game-ke52-7d` — 5 Des 2026 19.00 WIB
Task hanya jalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).
