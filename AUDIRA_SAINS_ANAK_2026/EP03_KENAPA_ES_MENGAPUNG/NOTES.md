# NOTES — `Sains "kenapa" untuk umum & pelajar: fisika, biologi, kimia, bumi, astronomi` (`EP03`)

> Tahap 10–11. Pelajaran agar episode berikut mulai dari kualitas lebih tinggi. Simpan juga ke motion memory (`append_lesson` worked/failed/fix, `set_best`).

## Yang berhasil (worked)
- Kisi segi enam molekul H₂O (frame ±45 dtk) jadi visual paling terbaca: subjek di layar persis kata VO.
- Penampang danau berlapis + gunung es setengah tenggelam memberi payoff yang jelas tanpa angka persen.
- Beat galium/bismut (logam padat mengapung di logam cair) memperkuat "air bukan satu-satunya".

## Yang gagal (failed) + perbaikan (fix)
- Juri buta 2 putaran 3.5/3.5: lighting & depth flat, readability label kecil. Diterima 3.50 setelah 2 putaran.
- Teks `<text>` SVG keluar hitam karena `txt()` hanya set CSS `color` → fix: atribut `fill`.
- Render final s3 GAGAL (exit 1): `render:final` (F:/AUDIRA-2D-SKILL-MOTION/scripts/render-final.mjs) menjalankan Remotion dari root skill tanpa `--public-dir`, jadi `staticFile()` 404 (`fonts/Sora-Var.ttf`, `brand/stacked-reversed.svg` di outro). Fix s4: salinan script dengan flag `--public-dir=<EP03>/project/public` (scratchpad sesi s4). Perbaikan permanen di script asli belum dikerjakan; episode 2D lain akan kena bug yang sama.

## Teknis
- Offset VO: 0 (VO mulai di frame 0; film 84,2 dtk + outro 3 dtk = 87,2 dtk, 5232 frame @ 60).
- Parameter render: crf 17, concurrency 2, gl angle, render 206,9 dtk. Mix G18: VO loudnorm −16, stem SFX −25,9 LUFS → volume −4,1 dB, duck ratio 8.
- QA final (2026-11-24): 1080×1920 @ 60, 87,217 dtk, −13,6 LUFS, TP −1,9 dBFS, metadata AUDIRA-kenapa-es-mengapung-EP03, Ed25519 VALID + C2PA, `npm run verify` VALID, 0 error 404 di log render.
- Juri buta final: lighting 3, material 3, depth 3, composition 3, motion 4, readability 3 → rata-rata 3.17 (di bawah draf 3.5; juri final melihat cacat yang tidak terlihat di draf: header crossfade BATU/BESI bertumpuk di detik 1,5, pill @AudiraSains menutup dasar gelas di beat penutup, botol "memuai" kecil). Final tidak dirender ulang (render final cukup sekali; acc pengguna sudah diberikan).
- Contact sheet final: `draft/final-contact-sheet.jpg`. File perantara `draft/stills/` dihapus.

## Pasca-tayang (24j / 72j / 7h)
Upload: Rabu 25 Nov 2026, TikTok 19.00 WIB (platform lain berjarak 20 menit). Scheduled task: `review-kenapa-es-mengapung-24h` (26 Nov 19.00), `review-kenapa-es-mengapung-72h` (28 Nov 19.00), `review-kenapa-es-mengapung-7d` (2 Des 19.00), semua +07:00.

| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |

## Draf juri (2026-11-24, sesi s3)
- Juri self 3.83. Juri buta putaran 1: 3.5 (PERLU POLES; depth flat, sepertiga bawah kosong, label kecil, botol/pipa datar, teks mitos bertumpuk).
- Poles putaran 2: lapisan FG bokeh + vignette, bayangan blur di bawah objek, label SVG ≥ 38–46 px, headline top 268, botol S4 jadi hero besar + material kaca, pipa bergradien logam/plastik, mitos 2 baris, beat galium/bismut: logam padat mengapung di logam cair.
- Juri buta putaran 2: 3.5. **Diterima 3.50 setelah 2 putaran** (aturan 2026-11-23). Lemah: lighting & depth flat, readability.
- Bug ditemukan juri r2: semua `<text>` SVG keluar hitam karena `txt()` hanya set CSS `color`; diperbaiki dengan atribut `fill` (sesudah juri, stills 15.6/25.6/77.6 + contact sheet dirender ulang).
- G18c: VO −16.4 LUFS, SFX ter-duck −32.1 LUFS, gap 15.7 LU (min 12). Stem SFX −25.9 LUFS → trim −4.1 dB.
