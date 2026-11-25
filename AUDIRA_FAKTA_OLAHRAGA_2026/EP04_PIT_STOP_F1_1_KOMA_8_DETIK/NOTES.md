# NOTES — Pit Stop F1 1,80 Detik (`EP04`)

> Tahap 10–11. Pelajaran agar episode berikut mulai dari kualitas lebih tinggi. Juga disimpan di motion memory TOYDIORAMA.

## Yang berhasil (worked)
- 7 set di satu panggung walnut (pit box, lintasan malam, meja ukur, pit 1957 sepia, rak piala) memberi multi-scene tanpa ganti dunia.
- Lampu sorot hangat sempit di subjek (angle 0.36, penumbra 0.55) + ambient ±0,2 di set sisipan: depth ceiling naik ke 5 tanpa vignette berat.
- Juri buta draf: LOLOS rata-rata 4,0 (lighting 4, material 4, depth 4, composition 3, motion 5, readability 4), self = juri (selisih 0).

## Yang gagal (failed) + perbaikan (fix)
- Vignette dibuat jauh lebih ringan → depth ceiling turun 5 → 2 (sepLum 15 vs cover 44). Fix: subject light pool, vignette tetap sedang.
- S2 tracking mobil F1 dari samping pada jarak 8,2 → hidung/ekor terpotong di 9:16. Fix: jarak ±12,4 di fov 32.
- Orbit S3 terlalu cepat (17% detik "too fast"). Fix: kurangi sudut sapuan antar beat → 6%, motion 5/5.
- Kelemahan tersisa (juri): frame 2, 4, 5 menaruh subjek di setengah atas dan menyisakan lantai kosong; mobil frame 4 terpotong di tepi. Episode berikut: kamera lebih rendah/dekat untuk set sisipan.
- Render final percobaan 1 gagal (`part 0 failed: write EOF`, 0,5 fps): GPU dipakai dua render final AUDIRA_SAINS_ANAK_2026 tanpa `GPU_LOCK.md`. Retry otomatis menunggu GPU bebas.

- Juri buta FINAL: LOLOS rata-rata 3,83 (lighting 4, material 4, depth 4, composition 3, motion 5, readability 3); self 4,0 (readability +1 di atas juri). Kelemahan: ban 13" vs 18" tampak hampir sama besar; timer Fangio count-up (berhenti di ≈30) tertangkap di sheet saat ≈13; tepi frame 1/4 memotong subjek.

## Teknis
- Offset VO: 0 (VO di-mix di komposisi, `public/audio/ep04/vo.wav`), film 83,34 dtk.
- Render final: `npm run render:final -- --comp=Ep04Final --out=out/ep04/FINAL_EP04.mp4 --vo=public/audio/ep04/vo.wav --sfx=public/audio/ep04/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error --title="Pit Stop F1 1,80 Detik" --slug=pit-stop-f1-1-koma-8-detik --ep=EP04` + `GPU_LOCK.md`.
- Render final 2026-11-23 (percobaan 2, dengan `GPU_LOCK.md`): 5001 frame dalam 124,6 dtk (~38 fps), 18 part. Master `FINAL_VIDEO.mp4` 1080×1920 @ 60, 83,37 dtk, 176 MB.
- QA final: −13,6 LUFS (ebur128, dalam toleransi ±0,5 dari −14), true peak −2,1 dBFS, LRA 3,4 LU; metadata title/artist/copyright/comment/date terbaca ffprobe; tanda tangan Ed25519 VALID + C2PA; frame 3,9–81,5 dtk dicek (8 beat + outro AUDIRA). Contact sheet final `draft/contact-sheet-final.jpg`.
- File perantara dihapus: `draft/clip-12-30.mp4`, `draft/stills*`.
- Subtitle: `SUBTITLES.srt` (49 cue) dibuat dari `studio/src/scenes/ep04/timeline.json`.

## Review terjadwal
- Jam upload: Kamis 26 Nov 2026 19.00 WIB (pilihan pengguna).
- `review-pit-stop-f1-1-koma-8-detik-24h` → 2026-11-27 19.00 WIB
- `review-pit-stop-f1-1-koma-8-detik-72h` → 2026-11-29 19.00 WIB
- `review-pit-stop-f1-1-koma-8-detik-7d` → 2026-12-03 19.00 WIB
- Task hanya berjalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |
