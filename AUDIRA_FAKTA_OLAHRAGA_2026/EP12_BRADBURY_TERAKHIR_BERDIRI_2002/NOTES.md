# NOTES: Bradbury Terakhir Berdiri 2002 (`EP12`)

> Tahap 10–11. Style PIXELSTORY · Remotion 2D · 9:16 · film 82,37 dtk (VO selesai 78,37 dtk).

## Skor
- Juri buta draf: **4,00 LOLOS** (composition 3, terlemah frame 6).
- Juri buta final: **4,00 LOLOS**: lighting 4, material 4, depth 4, composition 3, motion 5, readability 4.
- Audit kamera final: 5/5, parked 0%, median speed 0,125, jerks 1,4/10 dtk.

## Yang berhasil (worked)
- Satu dunia warna per babak (arena biru, rumah sakit hijau, rontgen biru-merah, amber payoff, podium merah) dan cut per detik VO.
- Getaran benturan yang meluruh hanya pada set; HUD dan caption tetap diam.

## Yang gagal (failed) + perbaikan (fix)
- clipHi 0,1–2,9 pada frame es → fix: `filter: brightness(0.96)` di wrapper `Picture` (`studio/src/scenes/ep12/Film.tsx`); clipHi 0 di 8 frame, diversity 57.
- Juri final: tabrakan klimaks (frame 7) kusut, anggota badan terpotong, Bradbury hanya sepotong di tepi kiri. Belum diperbaiki; pelajaran untuk episode PIXELSTORY berikut.

## Teknis
- Offset VO: 0. Timing dari `studio/src/scenes/ep12/timeline.json`.
- Acc render pengguna 2026-11-25: "Acc, render". Pilihan pengguna 2026-11-25: "Render langsung" (`npm run render:final`, tanpa `audira_render_batch`), karena batch menolak `render-final.mjs` studio yang tidak memuat penanda teks "G18b" walau graph G18-nya benar.
- Render: `--jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc`, 4.943 frame dalam 106,6 dtk.
- Audio: G18c 19,2 LU; final −13,6 LUFS (toleransi 0,5), true peak −1,8 dBFS.
- `audira_qa_video` hardOnly: putaran pertama FAIL 23 LONCAT. Strip diperiksa: semuanya getaran benturan sengaja (`shake` di `stage.tsx`) pada 3,1–3,3 / 15,3–15,6 / 23,4–23,5 / 50,3–50,7 / 59,4–60,1 dtk. Dengan `allow` untuk waktu itu: PASS.
- Metadata kepemilikan tertulis; tanda tangan Ed25519 VALID; C2PA tertanam.
- File: `FINAL_EP12.mp4` (268 MB, ±26 Mbps), `SUBTITLES.srt` (39 cue), `draft/contact-sheet.jpg`, `draft/final-sheet.jpg`.

## Fakta yang sengaja tidak tampil
- Tahun luka paha, siapa yang jatuh di semifinal, waktu finis (konflik/tidak terverifikasi, lihat `research/SOURCE_REGISTER.md`).

## Jadwal review (scheduled task)
Upload: Jumat 4 Des 2026, 19.00 WIB (pilihan pengguna 2026-11-25). Task hanya berjalan saat aplikasi Claude terbuka.
- `review-bradbury-24h`: 5 Des 2026 19.00 WIB
- `review-bradbury-72h`: 7 Des 2026 19.00 WIB
- `review-bradbury-7d`: 11 Des 2026 19.00 WIB

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi tonton | Retensi hook | Komentar | Catatan |
|---|---|---|---|---|---|
| 24 jam | | | | | |
| 72 jam | | | | | |
| 7 hari | | | | | |
