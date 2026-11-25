# Asset Candidates — Fakta Tersembunyi di Balik Juara UFC Conor McGregor

Dicari 2026-11-25 lewat `audira_search_assets`. Katalog tidak punya oktagon, ring tinju, sarung tangan MMA, atau sabuk juara: bangun prosedural/2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Tumpukan uang $60.000 → $3 juta | `banded-cash-bundle-7da278` / prop | Instancing jadi menara uang |
| c01_intro | Petarung tanpa wajah asli, sabuk juara | karakter generik dari `character-anim` (belum dipilih) | Sabuk dibuat prosedural; tanpa wajah/likeness McGregor |
| c02 | Pipa bocor, kunci pipa, gym | `wrench-390c5f` / ultra, `pipe-junction-5b146a` / prop, `surface-pipe-run-62c4b3` / prop | Gym (matras, samsak) belum ada aset: 2D/prosedural |
| c03 | Oktagon, stopwatch 1:07, kartu bonus | belum ada | Oktagon prosedural (8 sisi + jaring), HUD stopwatch 2D |
| c04 | Arena gelap, hitung mundur 13 detik | belum ada | Tipografi kinetik raksasa jadi pusat adegan |
| c05 | Skyline New York, arena, dua sabuk | belum dicari (skyline) | Teks HUD "Madison Square Garden", tanpa logo |
| c06 | Ring tinju, menara uang, botol wiski tanpa merek | `banded-cash-bundle-7da278` / prop, `whiskey-bottle-and-glass-fa24b4` / prop, `cashier-cage-module-c211d3` / building | Tanpa logo Forbes/Proper No. Twelve |
| c07_payoff | Ruang sidang, palu hakim, kembali ke dapur | `trophy-cabinet-e963ac` / prop (sabuk retak dipajang) | Ruang sidang belum dicari; bookend pakai `wrench-390c5f` |

Saran engine: 2D — tokoh nyata harus tampil sebagai siluet tanpa wajah, dan aset kunci (oktagon, sabuk, sarung tangan) tidak ada di katalog GLB, jadi 2D (CINESTORY/NEKAT) dengan tipografi kinetik angka lebih kuat dan lebih cepat dibuat.
