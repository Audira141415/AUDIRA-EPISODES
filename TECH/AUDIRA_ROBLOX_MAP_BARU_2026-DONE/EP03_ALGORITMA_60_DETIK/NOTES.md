# NOTES — EP03_ALGORITMA_60_DETIK

- Style: ISOCRAFT · channel AUDIRA TECH (@AudiraTECH) · studio seri bersama `studio/` (komposisi Ep03Final).
- Final: `FINAL_EP03.mp4` 1080×1920 @ 60, 91.6 dtk, −13,7 LUFS, metadata + Ed25519 VALID + C2PA (2026-11-12). Arsip: `archive/2026-11-12/` (final, .sig.json, vo.wav, SUBTITLES.srt).
- VO: Cartesia Galang, VO berakhir 87.5 dtk, outro `<AudiraOutro>` di 3,4 dtk terakhir. Offset VO 0 (full.wav = bed + vo, sidechain).
- Juri buta draf: 4,0 LOLOS (3 putaran). Draf disetujui pengguna 2026-11-12 ("Setuju, render final").

## Pelajaran
- Kelemahan juri yang berulang: komposisi/keterbacaan (papan terpotong tepi, label kecil, terlalu banyak elemen per frame). Frame 1 = cover yang sudah disetujui ikut dinilai, jadi cover harus sederhana sejak awal.
- Render: batch tool gagal 4/5 film karena C: penuh (TEMP default di C:, ENOSPC), socket/timeout saat sesi lain merender bersamaan. Render ulang manual dengan RENDER_TMPDIR/TEMP/TMP=F:/render-tmp, --jobs=3–4 berhasil.
- Font Google (JetBrains Mono) dimuat dari jaringan saat render; gagal sekali (ERR_INSUFFICIENT_RESOURCES), berhasil saat diulang. Lebih aman font lokal.

## Review pasca-tayang
- Jadwal upload: lihat SOCIAL_CAPTIONS.md. Cek 24 jam / 72 jam / 7 hari (views, retensi, hook, komentar) dan catat di sini.
