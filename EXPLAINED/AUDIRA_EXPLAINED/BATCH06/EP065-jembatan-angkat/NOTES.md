# NOTES — AE-065 (VINTAGEFORGE)

## Produksi (2026-11-10)
- Gerbang: style "Ya, semua no. 1" → cover "Setuju semua" → naskah "Setuju, lanjut" → draf "Setuju, render final".
- VO Cartesia Galang (sonic-3), offset 0; ejaan fonetik di `_tools/phon.py` (Audira, baskiul, Tauer Brij).
- Render final 1080×1920@60 dengan `render-final.mjs` (cache bundle dimatikan) concurrency 8, sekali.
- Skor kini wajib evidence per aspek dan dibatasi ceiling `audit:visual` (starter: `node scripts/visual-audit.mjs <sheet> --grid=4x2 --style=<STYLE> --json=... --stage=draft`).

## Pelajaran / yang gagal
- Komposisi draf 3 (plat terpotong di tepi frame, diagram jungkat-jungkit kecil) dibereskan dengan prop `isolate` per shot dan menyembunyikan `chamberPlate`; font sistem Windows (Ink Free, Palatino) jadi final wajib dirender di PC ini.

## Kelemahan tersisa
- Kilatan perkamen di 56,7 dtk; kapal di hook hanya terlihat ujung tiang.

## Review pasca-tayang
- 24 jam: (isi setelah upload)
- 72 jam: (isi)
- 7 hari: (isi)
