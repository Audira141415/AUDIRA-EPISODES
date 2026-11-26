# Asset Candidates — Cara Kerja Regulator Tabung Gas LPG

> Dicari via `audira_search_assets` (2026-11-26; query "gas cylinder", "stove kitchen", "valve pipe spring"). Katalog tidak punya tabung LPG rumah tangga, regulator, atau kompor gas dapur Indonesia; yang ada hanya tabung gas medis, kompor kemah, dan perabot dapur. Regulator, diafragma, pegas, dan katup harus dibuat procedural/2D. Rule 15: tabung dan regulator generik, tanpa logo atau tulisan merek.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Tabung LPG generik di lantai dapur, 2 manometer | `medical-gas-cylinder-a2d6a7` / prop (hanya proxy bentuk), `kitchen-resin-floor-tile-4c2150` / prop | Tabung medis terlalu ramping; lebih baik tabung procedural (silinder + kerah + kaki) warna netral tanpa logo. HUD "> 100×" |
| c01_intro | Regulator di katup tabung, selang ke kompor | `two-burner-camp-stove-3e83f5` / prop, `kitchen-island-47f4c8` / prop | Regulator dan selang procedural; kompor kemah bisa jadi proxy kompor dua tungku |
| c02 | Cutaway tabung: cairan + uap, diagram 30:70, termometer, manometer | `gauge-and-valve-panel-f2164c` / prop | Cutaway dan molekul 2D/procedural; HUD "±4 bar · estimasi 30 °C" |
| c03 | Burner api biru, manometer U kolom air, grafik batang | `two-burner-camp-stove-3e83f5` / prop | Manometer U dan grafik 2D; HUD "280 mmH₂O ≈ 0,03 bar" |
| c04 | Diagram potongan regulator: pegas, diafragma, katup | `spring-tendon-a68e34` / attachment (referensi pegas) | Paling penting dan tidak ada di katalog: bangun diagram potongan 2D atau mesh procedural. Ilustrasi saja, bukan panduan bongkar |
| c05 | Loop tarik-ulur diafragma vs pegas, split kompor menyala | — | Animasi 2D/procedural dengan warna tekanan (merah naik, biru turun) |
| c06 | Rig uji lab, checklist SNI | `gas-cylinder-cabinet-cea23b` / building, `gauge-and-valve-panel-f2164c` / prop | Tanda SNI resmi boleh sebagai simbol standar; tanpa logo perusahaan/lab nyata |
| c07_payoff | Dapur utuh, tangan cek karet seal, kartu keselamatan, outro | `kitchen-sink-7ea438` / prop, `open-kitchen-shelf-f751de` / prop, `kitchen-extraction-canopy-94df44` / prop | Tangan tanpa wajah; outro card `audira-outro-card.svg` |

Saran engine: 2D — inti video adalah diagram potongan regulator dan grafik tekanan yang tidak ada di katalog GLB dan lebih terbaca sebagai cutaway 2D (BONGKAR/PRECISION); 3D (INNERWORKS) hanya layak bila regulator dan tabung dimodelkan procedural, karena aset dapur katalog cuma pendukung.
