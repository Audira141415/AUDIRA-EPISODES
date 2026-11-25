# NOTES — AE-063 (BUILDFORGE)

## Produksi (2026-11-24)
- Gerbang tunggal (render final): pengguna "Gas, render final" (2026-11-24). Style dan engine dipilih AI.
- VO Cartesia (sonic-3), mix `studio/public/audio/<ep>/mix.wav` −14 LUFS / TP −1,5, G18c VO 21,7–23,4 LU di atas SFX, offset 0; ejaan fonetik di `_tools/phon.py` (Audira, Syututgart, Jis).
- Render final 1080×1920@60 dengan `render-final.mjs` (cache bundle dimatikan) `--gl=vulkan --encoder=nvenc`, percobaan `--jobs=6` gagal (`RuntimeError: unreachable` / Chrome kehabisan memori saat render sesi lain berjalan bersamaan), diulang dengan jobs lebih kecil; cache segmen dipakai ulang.
- Render final memakai `--skip-channel` karena file starter `studio/src/scenes/news/` (tidak dipakai Root) memicu gate handle; signature EP mengambil handle dari CHANNEL.json.

## Pelajaran / yang gagal
- Frame F7 sheet r1 jatuh di transisi; digeser 53,8 → 54,3 dtk. JIS digambarkan sebagai rangka baja ruang (bukan roda sepeda) sesuai riset.

## Kelemahan tersisa
- Skor juri 3,67 (diterima setelah 2 putaran, di bawah 3,8).

## Review terjadwal
- Scheduled task sekali jalan (dibuat 2026-11-24, jam upload default di SOCIAL_CAPTIONS.md, 19.00 WIB): `review-atap-stadion-tanpa-tiang-24h`, `review-atap-stadion-tanpa-tiang-72h`, `review-atap-stadion-tanpa-tiang-7d`.
- Task hanya berjalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).

## Review pasca-tayang
- 24 jam: (isi setelah upload)
- 72 jam: (isi)
- 7 hari: (isi)
