# Asset Candidates — AR Glasses 2025: Masa Depan yang Sudah Dekat

Dicari via `audira_search_assets` (2026-11-25). Katalog tidak punya GLB kacamata atau HMD: query "glasses" = 0 hasil. Kacamata, headset 1968, dan gelang perlu dibuat procedural (Polish `<RoundedBoxGeo>` + material `POLISH.*`) atau dimodel di Blender.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Trotoar kota, pejalan kaki, ponsel gelap | `brownstone-row-house-1b84fd`/building, `corner-shop-5aec8c`/building, `bus-shelter-f786b4`/prop, `commuter-381e7f`/character (Walk), `smartphone-5f05e5`/ultra | Kacamata POV + gelembung pesan = HUD overlay; kacamata GLB tidak ada |
| c01_intro | Lab komputer 1960-an, HMD besar, kubus wireframe | `computer-bench-run-lit-87d9cf`/prop, `lab-floor-tile-ad0da8`/building, `lab-wall-solid-8bd631`/building | HMD 1968 dibuat procedural; figur tanpa wajah (siluet). Kubus wireframe hanya elemen HUD, bukan visual utama |
| c02 | Kacamata prisma di meja kaca, label harga, ikon privasi | `service-counter-module-3072ff`/prop | Kacamata Glass-like procedural generik, tanpa logo |
| c03 | Ruang tamu gelap, hologram jendela & bola dunia, kotak kaca "PROTOTIPE" | belum ditemukan (perlu cari "sofa", "living room", "globe") | Busur 70° sebagai HUD geometri |
| c04 | Etalase toko kacamata, spotlight | `one-storey-shop-row-83c958`/building, `shop-awning-f47171`/prop, `service-counter-module-3072ff`/prop | Kacamata hitam generik tanpa logo Ray-Ban/Meta |
| c05 | Close-up pergelangan + gelang, sinyal otot | `commuter-381e7f`/character (Point) | Gelang procedural; garis sinyal = HUD, bukan visual utama |
| c06 | Exploded view kacamata, kartu spesifikasi, busur 70° vs 20°, blueprint headset | `headphones-d3e940`/ultra (referensi bentuk headband, opsional) | Exploded view procedural; cocok gaya INNERWORKS/DRAFTFORGE |
| c07_payoff | Kota golden hour, garis waktu di langit, outro | `art-deco-setback-tower-b3a788`/building, `cast-iron-loft-b04b5a`/building, `city-bus-49fd97`/vehicle | Pantulan "AUDIRA" di lensa = brand dalam adegan |

Saran engine: hybrid — dunia kota/lab/toko pakai GLB nyata di R3F, tapi subjek utama (kacamata, HMD, gelang) tidak ada di katalog dan harus procedural/Blender; HUD 2D kinetik memikul angka, layar lensa, dan perbandingan bidang pandang.
