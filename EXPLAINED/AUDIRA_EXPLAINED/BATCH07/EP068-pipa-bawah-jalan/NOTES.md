# NOTES — AE-068 (URBANFORGE)

## Produksi (2026-11-24)
- Gerbang tunggal (render final): pengguna "Gas, render final" (2026-11-24). Style dan engine dipilih AI.
- VO Cartesia (sonic-3), mix `studio/public/audio/<ep>/mix.wav` −14 LUFS / TP −1,5, G18c VO 21,7–23,4 LU di atas SFX, offset 0; ejaan fonetik di `_tools/phon.py` (Audira, De-i Panjaitan, paip jeking).
- Render final 1080×1920@60 dengan `render-final.mjs` (cache bundle dimatikan) `--gl=vulkan --encoder=nvenc`, percobaan `--jobs=6` gagal (`RuntimeError: unreachable` / Chrome kehabisan memori saat render sesi lain berjalan bersamaan), diulang dengan jobs lebih kecil; cache segmen dipakai ulang.
- Render final memakai `--skip-channel` karena file starter `studio/src/scenes/news/` (tidak dipakai Root) memicu gate handle; signature EP mengambil handle dari CHANNEL.json.

## Pelajaran / yang gagal
- Juri r1 3,00: counter 57 vs VO 189, subjek tenggelam di tanah cokelat. Poles: counter final saat diucapkan, rim light dingin + latar gelap, pipa beton bertekstur. r2 lolos 3,83.

## Kelemahan tersisa
- F6 "Ø 4,05 M" vs VO "empat meter"; caption F4 pudar di beton terang; 40% bawah F3/F4 kosong; rantai 189 segmen agak abstrak.

## Review terjadwal
- Scheduled task sekali jalan (dibuat 2026-11-24, jam upload default di SOCIAL_CAPTIONS.md, 19.00 WIB): `review-pipa-bawah-jalan-24h`, `review-pipa-bawah-jalan-72h`, `review-pipa-bawah-jalan-7d`.
- Task hanya berjalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).

## Review pasca-tayang
- 24 jam: (isi setelah upload)
- 72 jam: (isi)
- 7 hari: (isi)
