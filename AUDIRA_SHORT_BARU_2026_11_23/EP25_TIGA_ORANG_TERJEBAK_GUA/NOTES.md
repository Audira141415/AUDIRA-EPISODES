# NOTES — EP25 Tiga Orang Terjebak di Gua

Channel AUDIRA Qissah (@AUDIRAQISSAH) · Style: INKSTORY · Engine: Remotion 2D (`F:/AUDIRA-2D-SKILL-MOTION/engines/remotion-starter/src/episodes/gua25/`, salinan `project/gua25/`) · memory label `short-baru-11-23-EP25` · selesai 2026-11-23 (sesi 11).

## Hasil
- `FINAL_VIDEO.mp4`: 1080×1920 @ 60, 84,0 dtk, −14,0 LUFS, peak −1,9 dBFS, metadata kepemilikan OK (ffprobe), tanda tangan Ed25519 + C2PA **VALID** (key 498c3302271aadce).
- QA video (`audira_qa_video` hardOnly, 10 cut terencana): **PASS**, tanpa KEDIP/LONCAT/BLACK/WHITE. Laporan: `draft/qa-final/`.
- Skor juri:
  - Draf r1 3,67, r2 3,33 → **diterima 3,67 setelah 2 putaran** (aturan juri terbaik ≥ 3,5 → final).
  - Final (juri blind, sheet `draft/contact-sheet-final.jpg`): L4 M3 D4 C3 Mo3 R4 = **3,50**. Kelemahan: material, komposisi. Motion tanpa audit kamera.

## Pelajaran
- **Berhasil**: lanskap kabut berlapis + cahaya hangat pelita/matahari merah (depth 4, lighting 4). Kartu data kuas (UNTA·SAPI·KAMBING·BUDAK, 120 DINAR, meter CELAH BATU 0/3→3/3) membuat readability 4. G22 cocok di 9/9 frame.
- **Kurang**: filter `inkEdgeStrong` + `DryBrush` (r2) membantu figur, tapi lanskap dan batu tetap terbaca vektor (gradient radial). Figur dan hewan terlihat seperti gumpalan gelap + coretan kapur, bukan sapuan sumi-e. Juri r2 turun ke 3,33.
- **Untuk episode INKSTORY berikutnya**: siluet tinta solid dengan tepi sapuan meruncing + 1–2 wash tonal; batu pakai ink-wash. Satu subjek per frame (F6 padat: figur + karung + koin + rumah + kartu). Jangan potong kawanan di tepi (F7). Teks kecil (sumber, subjudul ikon) naikkan ±1,4×.
- Juri mencatat caption F6 hanya menampilkan "dua puluh dinar." (ekor "seratus dua puluh") sementara kartu menulis 120; satu frame bisa terbaca 20. Pertimbangkan jendela caption yang memuat seluruh bilangan.
- **Mux audio**: `-shortest` memotong video ke panjang VO (outro hilang). Pakai `apad` + `-t 84` agar durasi mengikuti video. Mix: `F:/_tmp_remotion_ep25/mix84.wav`.
- **Tanda tangan**: kit 2D tidak punya script `sign`/`verify`. Final ditandatangani dengan `node F:/AUDIRA-SKILL-MOTION/starter/scripts/sign-video.mjs FINAL_VIDEO.mp4 --title=… --id=AUDIRA-tiga-orang-gua-EP25 --date=2026-11-23 --c2pa` (stream copy).
- Lesson tersimpan di motion memory: INKSTORY (worked, fix), GLOBAL (fix `-shortest`, fix tanda tangan kit 2D).

## Lokasi file
- Final: `FINAL_VIDEO.mp4` (+ `FINAL_VIDEO.mp4.sig.json` bila dibuat)
- Caption: `SOCIAL_CAPTIONS.md` (validator OK) · Subtitle: `SUBTITLES.srt`
- VO: `audio/vo.wav` · SFX: `audio/sfx.wav`
- Style: `style/STYLE_DECISION.md`, `style/cover-reference.png`, `style/cover-topic.png` (thumbnail)
- Draf: `draft/contact-sheet.jpg` (r2), `draft/sheet_r1ink.jpg` (r1), `draft/contact-sheet-final.jpg` (sheet juri final), `draft/THEME_CHECK.md`
- Kode: `project/gua25/Gua.tsx`
- `draft/raw_final.mp4` (video bisu) dihapus setelah QA OK.

## Jadwal upload & review
- Upload: Kamis 26 Nov 2026, TikTok 20.00 → IG 20.20 → YT 20.40 → FB 21.00 → X 21.20 → Threads 21.40 WIB.
- Scheduled task review (sekali jalan; jalan hanya saat aplikasi Claude terbuka, bila tertutup jalan saat dibuka lagi):
  - `review-tiga-orang-gua-24h` — Jumat 27 Nov 2026 20.00 WIB
  - `review-tiga-orang-gua-72h` — Minggu 29 Nov 2026 20.00 WIB
  - `review-tiga-orang-gua-7d` — Kamis 3 Des 2026 20.00 WIB

## Review pasca-tayang
(diisi oleh scheduled task di atas)
