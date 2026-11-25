# NOTES — EP15 Derinkuyu: Kota Bawah Tanah untuk 20.000 Orang

- Channel: FAKTADUNIA (@AudiraFaktaDunia) · Engine: Remotion 2D · Style: INNERWORKS (acc pengguna)
- Memory episode: `short-baru-11-23-EP15` · Slug: `derinkuyu`
- Upload: Kamis 26 Nov 2026, 19.00 WIB (urutan di `SOCIAL_CAPTIONS.md`)

## Final
- `FINAL_VIDEO.mp4` (folder episode) — 1080×1920 @ 60, 5280 frame (88 dtk), −13.7 LUFS, TP −1.8 dBFS.
- Metadata kepemilikan: title / artist / copyright / comment `AUDIRA-derinkuyu-EP15 | audira.my.id` / date — dicek ffprobe.
- Tanda tangan Ed25519: tertanam + `FINAL_VIDEO.mp4.sig.json`, verify VALID (embedded & sidecar), key `498c3302271aadce`.
- `audira_qa_video` hardOnly: PASS (0 temuan, 1 potongan terdeteksi 69.7 dtk = transisi terencana).
- VO offset: 0 (SHOTLIST.md).

## Skor
- Draf self 4.17 · juri #1 3.67 (PERLU POLES: material, motion) · juri #2 4.0 LOLOS.
- Final (jury, dari draf #2 tanpa perubahan visual): lighting 4, material 3, depth 4, composition 4, motion 5, readability 4 → 4.0 LOLOS. Diarsipkan sebagai gold di kit innerworks.

## Pelajaran
- **Fix**: juri #1 menilai material/motion lemah. Tekstur batu tuf berlapis (Inclusions + strata) + keyframe kamera Hermite monoton (`keys()`) → juri #2 4.0, motion 5 (parked 0%, hold 0).
- **Gagal / sisa kelemahan**: material tetap 3 — vektor datar tanpa cast shadow/AO, sepertiga bawah kosong, blok kota potongan berulang di beberapa beat.
- `--skip-channel` dipakai karena scene starter bawaan bertema news.
- **Bug kit**: `render-final.mjs` crash EPERM saat rename `FINAL_VIDEO.tagged.tmp.mp4` → `FINAL_VIDEO.mp4` (file dipindah manual). `scripts/sign-video.mjs` memanggil `signFile`/`verifyFile` (async) tanpa `await` → tag kosong & verify `undefined`, plus rename EPERM lagi. Ditandatangani lewat skrip sementara: `await signFile`, ffmpeg `-c copy` langsung ke folder episode, tulis `.sig.json`, `await verifyFile`. Dicatat sebagai lesson GLOBAL.

## Review pasca-tayang (scheduled task)
- `review-derinkuyu-24h` — 2026-11-27 19:00 +07:00
- `review-derinkuyu-72h` — 2026-11-29 19:00 +07:00
- `review-derinkuyu-7d` — 2026-12-03 19:00 +07:00
Task hanya jalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).
