# NOTES — AE-067 (WORLDFORGE)

## Produksi (2026-11-24)
- Gerbang tunggal (render final): pengguna "Gas, render final" (2026-11-24). Style dan engine dipilih AI.
- VO Cartesia (sonic-3), mix `studio/public/audio/<ep>/mix.wav` −14 LUFS / TP −1,5, G18c VO 21,7–23,4 LU di atas SFX, offset 0; ejaan fonetik di `_tools/phon.py` (Audira, Nyu York, Delawer Akuadak, Hadsen).
- Render final 1080×1920@60 dengan `render-final.mjs` (cache bundle dimatikan) `--gl=vulkan --encoder=nvenc`, `--jobs=6 --concurrency=2`, sekali.
- Render final memakai `--skip-channel` karena file starter `studio/src/scenes/news/` (tidak dipakai Root) memicu gate handle; signature EP mengambil handle dari CHANNEL.json.

## Pelajaran / yang gagal
- Draf r1 3,17 → r2 3,67. Cover perlu dirender ulang (Ep067Cover) setelah perubahan adegan.

## Kelemahan tersisa
- Skor juri 3,67 (diterima setelah 2 putaran, di bawah 3,8).

## Review terjadwal
- Scheduled task sekali jalan (dibuat 2026-11-24, jam upload default di SOCIAL_CAPTIONS.md, 19.00 WIB): `review-terowongan-air-24h`, `review-terowongan-air-72h`, `review-terowongan-air-7d`.
- Task hanya berjalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).

## Review pasca-tayang
- 24 jam: (isi setelah upload)
- 72 jam: (isi)
- 7 hari: (isi)
