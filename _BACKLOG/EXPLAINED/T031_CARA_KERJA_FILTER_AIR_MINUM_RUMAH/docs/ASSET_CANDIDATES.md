# Asset Candidates — Cara Kerja Filter Air Minum Rumah

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya wastafel dapur, carafe air, filter gravitasi, tangki kaca, menara air, dan rumah pompa. Tidak ada cartridge filter modern, membran RO, lampu UV, bakteri, atau panci rebus: itu dibuat procedural/2D (cutaway).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Keran dapur, gelas bening, cutaway tabung filter 3 lapis | `kitchen-sink-7ea438` / prop, `water-carafe-6f1774` / prop | Tabung filter tiga lapis & gelas: procedural transparan, tanpa merek |
| c01_intro | Peta Indonesia generik, 10 ikon rumah, 7 berubah merah | `water-pump-house-121270` / building, `rooftop-water-tower-b38362` / prop | Peta dan ikon rumah 2D; HUD "7 dari 10 rumah tangga" + "SKAMRT 2020" |
| c02 | Dalam cartridge sedimen: serat, pasir, karat, lumpur tertahan | `gravity-water-filter-stack-4a54f5` / prop (rujukan bentuk saja) | Serat & partikel procedural; bakteri ilustrasi lolos |
| c03 | Butir karbon aktif berpori, molekul menempel | — | Close-up mikro procedural (spons pori hitam); HUD "1 gram = ratusan m²" |
| c04 | Penggaris mikron, parasit/bakteri/virus berbaris, membran makin rapat | — | Infografis skala 2D/2.5D; HUD 0,2–4 µm, ±0,01 µm, ±0,0001 µm |
| c05 | Membran RO dengan aliran buang, tabung UV ungu, kemasan berlabel klaim | `glass-sump-tank-ebccc0` / prop (rumah tabung) | Kemasan generik tanpa logo NSF/merek nyata |
| c06 | Cartridge menguning, biofilm, kalender, grafik naik 3 minggu | `kitchen-sink-7ea438` / prop | Biofilm shader procedural; grafik garis 2D |
| c07_payoff | Tabung uji "E. coli: 0", panci mendidih timer 1 menit, dapur utuh, outro | `kitchen-island-47f4c8` / prop, `open-kitchen-shelf-f751de` / prop, `water-carafe-6f1774` / prop | Panci/kompor tidak ada di katalog: procedural; outro card `audira-outro-card.svg` |

Saran engine: hybrid — dapur (wastafel, meja, carafe) tersedia sebagai GLB untuk pembuka dan payoff, tetapi inti cerita adalah dunia mikro (serat, pori karbon, membran, kuman) yang tidak ada di katalog dan lebih tajam sebagai cutaway procedural/2D; bila harus satu engine, 3D cutaway (INNERWORKS/NANOFORGE) layak dengan infografis skala mikron sebagai lapisan HUD 2D.
