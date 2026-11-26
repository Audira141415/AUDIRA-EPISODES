# Asset Candidates — Perjalanan Sebutir Beras dari Sawah sampai Piringmu

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya petak sawah, karung, truk, gudang, lapak pasar, dan karakter petani ber-rig. Tidak ada mesin penggilingan padi modern, piring nasi, atau butir beras close-up: itu dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Piring nasi, butir nasi close-up, 5 siluet tangan | — | Tidak ada GLB piring/nasi; ilustrasi 2D. Siluet tanpa wajah (rule 15) |
| c01_intro | Peta Indonesia generik, petak sawah menyala, tumpukan karung | `rice-paddy-tile-dc727e` / prop, `grain-sack-401d96` / prop | Peta 2D (batas generik, tanpa logo); HUD "±10 juta ha" + "53 juta ton gabah" |
| c02 | Sawah, petani memanen, gabah berkulit, truk kecil pengepul | `rice-paddy-tile-dc727e` / prop, `hasa-rice-drying-rack-d545bc` / prop, `farmer-363820` / character (clip Idle/Walk), `three-wheeled-delivery-mini-744094` / vehicle, `feed-sack-c84641` / prop | Petani bercaping, wajah tanpa detail; HUD "HPP Rp6.500/kg" |
| c03 | Penggilingan: pengering, pengupas, penyosoh; butir gabah dibelah | `saddle-quern-food-mill-8e3657` / prop (simbolis saja), `grain-silo-58ca67` / building | Mesin giling modern tidak ada di katalog; cutaway 2D lebih jelas. Diagram 100 kg → 20/10/70 |
| c04 | Karung naik truk → gudang distributor → grosir → kios pasar/warung | `delivery-truck-a9537e` / vehicle, `brick-depot-warehouse-3dd642` / building, `freight-crate-and-sack-f49cbb` / prop, `market-stall-94937d` / building, `mercado-stall-6e6ba3` / prop | Merek karung generik, tanpa logo nyata; cap angka 2–5 di karung |
| c05 | Label harga menebal, grafik tangga +20,83% | `price-sign-pylon-0305a8` / prop | Grafik tangga 2D lebih terbaca; ikon lucide truk/gudang/koin |
| c06 | Papan harga HET vs rata-rata, gudang cadangan | `brick-depot-warehouse-3dd642` / building, `grain-sack-401d96` / prop | Tanpa logo Bulog/Bapanas; label teks "cadangan pemerintah" saja |
| c07_payoff | Peta rute sawah → meja makan, outro AUDIRA | `rice-paddy-tile-dc727e` / prop, `delivery-truck-a9537e` / vehicle, `market-stall-94937d` / building | Rute emas menyala; outro card `audira-outro-card.svg` |

Saran engine: hybrid — diorama 3D (sawah, truk, gudang, pasar) cocok untuk "perjalanan" dan tersedia di katalog, tetapi penggilingan, butir beras, diagram rendemen, dan grafik margin lebih tajam di 2D; bila harus satu engine, 2D (PAPERWORLD/CHAINREACTION) lebih aman karena piring nasi dan mesin giling tidak ada sebagai GLB.
