# NOTES — AE-066 (GLASSCRAFT)

## Produksi (2026-11-10)
- Gerbang: style "Ya, semua no. 1" → cover "Setuju semua" → naskah "Setuju, lanjut" → draf "Setuju, render final".
- VO Cartesia Galang (sonic-3), offset 0; ejaan fonetik di `_tools/phon.py` (Audira, Lain ap en weit, klird for teikof, Aprouc, Deliveri, Graund, Tauer, teksiwei, Ernef).
- Render final 1080×1920@60 dengan `render-final.mjs` (cache bundle dimatikan) concurrency 8, sekali.
- Skor kini wajib evidence per aspek dan dibatasi ceiling `audit:visual` (starter: `node scripts/visual-audit.mjs <sheet> --grid=4x2 --style=<STYLE> --json=... --stage=draft`).

## Pelajaran / yang gagal
- Kalimat "Langit ramai" sempat terulang dan "AUDIRA" terbaca "Odira": l17 dan l18 disuarakan ulang, teks TTS "Ini, Audira Explained.". Render final pertama gagal (FFmpeg 0xC0000142, kehabisan resource setelah 4 render berurutan); ulang sendiri berhasil.

## Kelemahan tersisa
- Pusaran udara (wake vortex) terbaca garis bergelombang dan labelnya bertumpuk.

## Review pasca-tayang
- 24 jam: (isi setelah upload)
- 72 jam: (isi)
- 7 hari: (isi)
