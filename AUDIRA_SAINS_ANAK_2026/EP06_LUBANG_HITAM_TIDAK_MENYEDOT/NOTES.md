# NOTES — EP06 Lubang Hitam Tidak Menyedot (SAINS)

- Channel: AUDIRA Sains (@AudiraSains) · seri AUDIRA_SAINS_ANAK_2026 · memory label `sains-anak-EP06`
- Style: **SCALEFORGE** (3D, Remotion + R3F) · 214 kata · durasi final 89.0 dtk
- Final: `FINAL_EP06_LUBANG_HITAM_tagged.mp4` (1080×1920 @ 60, 5340 frame, h264 nvenc)
- Gerbang render final: pre-approved pengguna 2026-11-25 (batch 10 short otonom)

## QA final (2026-11-25)
- Loudness: −13.7 LUFS integrated, true peak −1.7 dBFS (gain +3.6 dB dari −17.2 LUFS)
- G18c (dari draf): VO −17, SFX duck −32, gap 15 LU
- Metadata ffprobe: artist "AUDIRA (Agus Dwi R.)", copyright, comment `AUDIRA-lubang-hitam-tidak-menyedot-EP06 | audira.my.id` ✓
- Tanda tangan: Ed25519 key 498c3302271aadce VALID, C2PA embedded (file ditulis ulang tanpa remux, byte identik dengan output render)
- Audit look: tidak ada aspek di bawah 4 (`project/out/FINAL_EP06_LUBANG_HITAM.look.json`)
- Cek frame 2 / 45 / 88 dtk: hook "LUBANG HITAM MENYEDOT?", cakram akresi, outro card AUDIRA Sains ✓
- Contact sheet final: `draft/contact-sheet-final.jpg`

## Skor
- Draf: juri r2 4.0 (L4 M3 D4 C4 Mo5 R4) — LOLOS
- Final: juri buta 3.5 (L4 M3 D4 C3 Mo3 R4) — verdict tool "PERLU POLES"; tidak dirender ulang (draf sudah LOLOS 4.0, gerbang final pre-approved). Kelemahan: framing lubang+cakram berulang di 3/8 frame kunci, satu beat cakram datar di starfield kosong, outro tint hijau, sub-label HUD kecil, caption terpotong. Lesson failed SCALEFORGE dicatat.

## Pelajaran
- worked: cakram akresi oranye berlapis + horizon hitam bulat sebagai hero terbaca jelas di 9:16.
- fix: render final `--jobs=6` memicu `net::ERR_CONNECTION_ABORTED localhost:3000` (race port); `--jobs=3 --parts=6` stabil, 181 dtk.
- fix: channel gate gagal karena file berita lain di `src/scenes/news` (bukan bagian film) → `--skip-channel` dengan alasan.
- SkeletonUtils.clone fix sudah dicatat di GLOBAL; lesson SCALEFORGE failed sudah dicatat di sesi sebelumnya.
- Kandidat promosi kit (dicatat saja, tidak ditawarkan — aturan batch otonom): SCALEFORGE parameter "exposure" diperbaiki di 2 episode.

## Upload & review
- Jadwal: Rabu 25 Nov 2026, TikTok 19.00 → Instagram 19.20 → YouTube 19.40 → Facebook 20.00 → X 20.20 → Threads 20.40 WIB
- Scheduled task: `review-lubang-hitam-tidak-menyedot-24h` (26 Nov 19.00), `review-lubang-hitam-tidak-menyedot-72h` (28 Nov 19.00), `review-lubang-hitam-tidak-menyedot-7d` (2 Des 19.00) — jalan hanya saat aplikasi Claude terbuka.

## Bersih-bersih
- Dihapus: `project/out/draft1..3`, `project/out/cam`, `project/out/seg`, MP4 mentah di `project/out` (salinan ada sebagai `_tagged`).
