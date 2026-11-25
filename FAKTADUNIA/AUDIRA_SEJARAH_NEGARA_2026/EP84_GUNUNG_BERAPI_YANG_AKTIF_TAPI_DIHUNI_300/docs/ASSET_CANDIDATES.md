# Asset Candidates — Gunung Berapi yang Aktif tapi Dihuni 300.000 Orang

Dicari 2026-11-25 lewat `audira_search_assets`. Katalog tidak punya model gunung api, kerucut vulkanik, reruntuhan Romawi, atau observatorium.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Lereng gunung + deretan rumah malam hari | `two-story-house-40f6dc` (building), `cube-house-module-a9b8e8` (building) | Kerucut Vesuvius dibuat prosedural (terrain heightmap/displacement) |
| c01_intro | Peta Teluk Napoli + kerucut gunung + zona merah | — | Peta 3D/heightmap DEM; overlay poligon zona merah |
| c02 | Kota Romawi tertimbun abu | `broken-stone-column-c91287` (prop), `lava-rock-pile-d56d19` (prop) | Tidak ada kit Romawi; kolom patah + rumah plester sederhana |
| c03 | Lereng hijau lalu awan panas menuruni desa | `grassland-tile-875d75` (prop), `village-gatehouse-181a9e` (building), `two-story-house-40f6dc` (building) | Awan panas: asap volumetrik/sprite, bukan partikel titik |
| c04 | Lava menelan desa, era Perang Dunia II | `lava-field-tile-3ae53c` (prop), `lava-rock-pile-d56d19` (prop) | Pesawat PD II belum dicari; bisa siluet 2D |
| c05 | Kebun anggur, buah anggur, penampang saluran magma | `grapes-e7ddb2` (ultra) | Barisan tanaman anggur perlu instancing manual; botol tanpa logo merek nyata |
| c06 | Observatorium + peta evakuasi bus/kereta/kapal | `city-bus-49fd97` (vehicle), `articulated-transit-bus-6be725` (vehicle), `ship-s-longboat-f159fd` (vehicle) | Observatorium tidak ada di katalog; kapal feri dan kereta belum ketemu (cari ulang "train", "ferry") |
| c07_payoff | Hero shot gunung saat fajar + kota pesisir menyala | `boathouse-cf20e6` (building), `cube-house-module-a9b8e8` (building) | Kit `mediterranean-island-village` cocok untuk pesisir Napoli |

Saran engine: hybrid — 3D R3F untuk kerucut gunung, desa, dan lava (butuh kedalaman ruang), dipadu peta/HUD 2D untuk zona merah, timeline letusan, dan rute evakuasi; gunung dibuat prosedural karena katalog GLB tidak punya model gunung api.
