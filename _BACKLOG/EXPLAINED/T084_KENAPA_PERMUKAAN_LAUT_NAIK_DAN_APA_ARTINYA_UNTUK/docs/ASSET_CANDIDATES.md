# Asset Candidates — Kenapa Permukaan Laut Naik dan Apa Artinya untuk Pesisir

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya pantai/boardwalk, rumah pesisir, kapal nelayan, terumbu karang, dan karakter. Tidak ada globe bumi, es kutub/gletser, atau grafik data sebagai GLB: itu dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Garis pantai dari atas, air naik | `dry-soft-sand-tile-4a1df7` / prop, `beach-hut-fc7649` / building, `boardwalk-deck-run-c1f678` / building | Pantai generik tanpa logo; animasi air naik procedural |
| c01_intro | Potongan bumi: laut memuai, es retak | — | Tidak ada GLB globe/es kutub; 2D/procedural. Diagram split 50%/42% |
| c02 | Grafik tangga akselerasi 1,3 → 4,62 | — | Murni 2D infografis / teks kinetik |
| c03 | Dua jalur proyeksi (hijau/merah) di pesisir | `beach-hut-fc7649` / building, `small-fishing-boat-4ac0e3` / vehicle | Pesisir generik; jalur proyeksi 2D overlay |
| c04 | Peta Indonesia, desa pesisir tergenang | `cube-house-module-a9b8e8` / building, `caique-fishing-boat-262c24` / vehicle, `market-stall-94937d` / building, `seagrass-tuft-862cc5` / prop | Rumah/pasar generik tanpa wajah; peta 2D |
| c05 | Potongan tanah subsidensi Jakarta, panah atas-bawah | — | Diagram potongan 2D lebih jelas; HUD "25 cm/thn" |
| c06 | Tanggul, mangrove, panel surya, turbin | `dune-fence-run-120153` / prop (tanggul simbolis), `maple-tree-65fa12` / prop (pengganti mangrove) | Tanpa logo lembaga; panel surya/turbin tidak ada di katalog → 2D |
| c07_payoff | Bola bumi, grafik akselerasi, outro | — | Globe procedural; outro card `audira-outro-card.svg` |

Saran engine: **2D** — topik ini sangat data-driven (grafik akselerasi, proyeksi, diagram subsidensi, peta). Aset 3D yang tersedia (pantai, rumah, kapal) hanya cocok sebagai latar, bukan penggerak cerita. Visual utama (grafik, potongan bumi, peta Indonesia, diagram tanah) lebih tajam dan informatif di 2D. Kandidat style: SATELLITEBRIEFING (2D) atau DATAPHYSICAL (2D).
