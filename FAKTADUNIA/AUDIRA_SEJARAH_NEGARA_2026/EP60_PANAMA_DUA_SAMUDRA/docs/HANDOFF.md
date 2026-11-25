# HANDOFF — EP60 Panama, Dua Samudra (s1 → s2)

## Keputusan
- Style: **PAPERWORLD**, engine **Remotion 2D (SVG/DOM, tanpa R3F)** — pola gold EP18 Svalbard (juri final 4.17).
  Alasan: diorama kertas berlapis cocok untuk peta dua samudra + pintu air yang mengangkat kapal kertas. Alternatif: HISTORYMAP (peta, tapi juri lemah di kedalaman), TIMEFORGE.
- Basis kode: salinan proyek `AUDIRA_SHORT_BARU_2026_11_23/EP18_SVALBARD_DILARANG_MATI/project` (tanpa src/ep18, node_modules = junction ke F:/AUDIRA-SKILL-MOTION/node_modules).
  Rujukan kode EP18: `.../EP18_SVALBARD_DILARANG_MATI/project/src/ep18/{Film,pieces,scenes,timing}.tsx` — tulis `project/src/ep60/` dengan pola sama, lalu ganti import ep18 di `project/src/Root.tsx`.
- Riset: `research/SOURCE_REGISTER.md` (salinan b12). Angka layar: 82 KM, ±26 M, 1881, ±22.000 PEKERJA (tenang, tanpa tubuh), 1889, 1904, >100 SEKOP UAP, 15 AGU 1914, 31 DES 1999, 36 SEN, 1928.

## Status
- STATUS.json di-init (scaffold STATUS lama dipindah ke docs/scaffold-status.json).
- VO teks: `audio/vo.txt` (223 kata). VO Cartesia mentah: `audio/vo-raw.wav` 85.4 dtk + `audio/vo-raw-words.json`.

## Selesai di s1
- VO dipakai apa adanya (jeda maks 1,07 dtk, 85,4 dtk) → project/public/audio/vo.wav + vo-words.json.
- Docs rule 12 ditulis: ART_DIRECTION, SCRIPT, STORYBOARD (11 adegan + kolom Audio), ASSET_MANIFEST, style/STYLE_DECISION.md.
- project/src/ep60/timing.ts terkunci (FILM 88.6, 11 adegan, 22 callout).

## Next
0. Tulis docs/SHOTLIST.md (untuk npm run sfx; format lihat EP18 docs/SHOTLIST.md).
3. Kode ep60 (9–10 adegan: hook kapal di pintu air, peta rute Cape Horn vs Panama, Prancis/hutan/nyamuk, Gorgas kelambu, Culebra sekop uap, penampang pintu air → Gatun, 1914 SS Ancon, 1999 bendera, Halliburton berenang 36 sen, outro).
4. Cover topik, npm run sfx, contact sheet draf + juri buta, THEME_CHECK, gerbang acc final.
