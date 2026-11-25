# Asset Candidates — Rekor Hujan Paling Deras di Bumi — Dalam Satu Menit

> Dicari via `audira_search_assets` (2026-11-25). Hujan, kolom air, peta, dan HUD dibuat prosedural/2D; GLB hanya untuk props dan bangunan.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Stopwatch/jam 60 dtk, tirai hujan | `wall-clock-0c555c` / prop; `stadium-clock-post-4d1ce8` / prop | Tidak ada GLB stopwatch; jam dinding + HUD angka. Hujan = shader/partikel pendukung, bukan subjek utama |
| c01_intro | Peta AS → Maryland, kota kecil, awan badai | `gabled-farmhouse-c7534f` / building; `townhouse-row-unit-b9544b` / building; `towering-cloud-2e00f1` / prop | Peta = 2D/HUD (history-map). Kalender "4 Juli 1956" HUD |
| c02 | Petak 1×1 m, air naik 31 mm, 3 ember 10 L | `maintenance-bucket-f1c8e8` / prop; `wooden-teoke-bucket-e65f35` / prop | Petak tanah + garis ukur prosedural |
| c03 | Meja arsip, rain gauge lama, jurnal 1959 | `office-desk-021eb3` / prop; `lefthand-item-30f012` / ultra (hardback book); `bookshelf-5e881a` / ultra | Rain gauge tidak ada di katalog: buat prosedural (silinder + corong). Teks "WMO" tanpa logo |
| c04 | Globe, Holt Missouri, pulau vulkanik Réunion + siklon | `classroom-globe-16a96e` / prop; `palm-tree-a307da` / prop | Siklon = HUD/2D spiral |
| c05 | Bukit berkabut Meghalaya, kolom air 26 m | `bare-mountain-rowan-10e72e` / prop; `mountain-refuge-hut-32ab1e` / building | Kolom air prosedural, skala vs bangunan |
| c06 | Pulau tropis Guadeloupe, papan skor vs | `palm-tree-a307da` / prop; `boathouse-cf20e6` / building | Papan skor = HUD 2D |
| c07_payoff | Tabung air tumbuh lewat garis 1.825 → 1.872 mm, kota diguyur hujan, outro | `gabled-farmhouse-c7534f` / building; `towering-cloud-2e00f1` / prop | Outro card AUDIRA |

Saran engine: hybrid — angka dan perbandingan (peta, papan skor, kolom air, HUD) paling jelas di 2D/infografis, sementara kota, ember, dan awan memakai GLB R3F untuk kedalaman; kandidat DISASTERSIM (3D) atau SATELLITEBRIEFING (2D) sama-sama cocok.
