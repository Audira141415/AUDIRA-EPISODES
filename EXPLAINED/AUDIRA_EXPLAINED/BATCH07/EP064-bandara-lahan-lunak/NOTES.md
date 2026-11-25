# NOTES — AE-064 (LIDARFORGE)

## Produksi (2026-11-24)
- Gerbang tunggal (render final): pengguna "Gas, render final" (2026-11-24). Style dan engine dipilih AI.
- VO Cartesia (sonic-3), mix `studio/public/audio/<ep>/mix.wav` −14 LUFS / TP −1,5, G18c VO 21,7–23,4 LU di atas SFX, offset 0; ejaan fonetik di `_tools/phon.py` (Audira, dren).
- Render final 1080×1920@60 dengan `render-final.mjs` (cache bundle dimatikan) `--gl=vulkan --encoder=nvenc`, `--jobs=6 --concurrency=2`, sekali.
- Render final memakai `--skip-channel` karena file starter `studio/src/scenes/news/` (tidak dipakai Root) memicu gate handle; signature EP mengambil handle dari CHANNEL.json.

## Pelajaran / yang gagal
- Juri r1 2,83: G22 gagal di F6 dan counter 10,61 mid-ramp. Poles r1 menyelaraskan subjek dengan VO; angka 13,72 / 1 juta / 900 dicek ke register #16/#13/#20.

## Kelemahan tersisa
- Skor juri 3,67 (diterima setelah 2 putaran); judul F8 menyentuh tepi kanan.

## Review terjadwal
- Scheduled task sekali jalan (dibuat 2026-11-24, jam upload default di SOCIAL_CAPTIONS.md, 19.00 WIB): `review-bandara-lahan-lunak-24h`, `review-bandara-lahan-lunak-72h`, `review-bandara-lahan-lunak-7d`.
- Task hanya berjalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).

## Review pasca-tayang
- 24 jam: (isi setelah upload)
- 72 jam: (isi)
- 7 hari: (isi)
