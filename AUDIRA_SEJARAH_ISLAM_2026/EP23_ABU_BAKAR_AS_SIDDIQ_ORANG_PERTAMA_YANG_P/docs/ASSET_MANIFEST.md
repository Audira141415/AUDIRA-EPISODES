# Asset Manifest — EP23 Abu Bakar (HD2D)

Style: HD2D

| Chapter | Aset | Sumber | Status |
|---|---|---|---|
| semua | sprite piksel berjubah tanpa wajah (berjalan, berdiri, meringkuk, bahu bergetar, kerumunan berpaling, shaf) — Abu Bakar gading, Bilal coklat, Quraisy abu-merah | prosedural `pixel.tsx` (basis EP17 `scenes/umar`) | Sesi B |
| semua | berkas cahaya (Nabi tidak digambarkan): cone additive + debu emas | prosedural | Sesi B |
| c00 | alun-alun Makkah: rumah batu/plester, siluet Kakbah kubus hitam jauh, lentera | prosedural kotak bevel + canvas map; opsi GLB `adobe-tapia-wall-run-074dd5` | Sesi B |
| c01 | peta relief Hijaz, pin, kafilah unta | prosedural peta relief (pola MapTable EP04/EP17); unta sprite piksel; cek GLB `campaign-map-scroll-d4a382` | Sesi B |
| c02 | meja juru tulis, gulungan manuskrip, wadah gulungan kayu cap AUDIRA, lampu minyak | prosedural; opsi GLB `spell-scroll-29d32d`, `scroll-rack-f465dd` | cek di Sesi B |
| c03 | jalan batu siang, rantai besi (cincin torus) | prosedural | Sesi B |
| c04 | lereng Tsur, obor, mulut gua granit tak beraturan, interior gua | prosedural displacement noise; cari GLB `rock`/`cave` via `audira_search_assets` | cek di Sesi B |
| c05 | masjid sederhana (tiang batang kurma, atap pelepah, mimbar 3 anak tangga), tikar | prosedural (basis masjid EP17) | Sesi B |
| c06 | timbangan kuningan, koin emas, cap stempel | prosedural (timbangan EP17 c06) | Sesi B |
| c07 | Madinah fajar, menara sederhana | prosedural (basis masjid fajar EP17) | Sesi B |
| outro | `<AudiraOutro code="QISSAH" />` | brand | ada |
| audio | VO Cartesia (voice 04b567df…), SFX `npm run sfx` (stem `TARGET_LUFS = -28`), bed musik ney + drone tanpa nyanyian | | Sesi B |
