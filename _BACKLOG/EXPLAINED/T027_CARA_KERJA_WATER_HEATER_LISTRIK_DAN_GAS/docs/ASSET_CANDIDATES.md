# Asset Candidates — Cara Kerja Water Heater Listrik dan Gas

> Dicari via `audira_search_assets` (2026-11-26). Katalog tidak punya water heater, tangki pemanas, burner, atau ELCB. Ada shower, keran, tabung gas generik, dan meter box. Cutaway mesin (inti topik) harus dibuat 2D/procedural. Semua unit tanpa merek (rule 15).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Shower air dingin/hangat, kotak water heater generik, panci di kompor | `shower-enclosure-a50c16` / prop, `boiling-water-tap-e594db` / prop | Kotak water heater dibuat 2D; HUD "2 cara memanaskan" |
| c01_intro | Dua kartu ikon: tangki vs instan | — | Ikon 2D/lucide; tidak perlu GLB |
| c02 | Cutaway tangki listrik: elemen, termostat, air dingin bawah, air panas atas | `horizontal-tank-6e9b8b` / prop (simbolis saja) | Cutaway 2D lebih jelas; HUD "±55 °C" |
| c03 | Tangki gas: api biru di dasar, cerobong | `fuel-tank-3a0111` / prop (simbolis) | Api dan cerobong 2D/shader |
| c04 | Kotak instan: sensor aliran, pipa spiral penukar panas | `boiling-water-tap-e594db` / prop | Spiral penukar panas 2D; HUD "≈ 9,5 L/menit" |
| c05 | Kamar mandi tertutup + CO, denah rumah, unit gas di luar, tabung elpiji | `shower-enclosure-a50c16` / prop, `medical-gas-cylinder-a2d6a7` / prop (ganti bentuk tabung elpiji generik), `gas-cylinder-cabinet-cea23b` / building | Tanpa wajah korban; HUD "CO: tak berwarna, tak berbau" |
| c06 | Katup T&P, panel listrik + grounding + ELCB trip | `meter-box-1e6e42` / prop | Katup dan ELCB 2D; HUD "ELCB ≤ 30 mA" |
| c07_payoff | Cutaway rumah utuh, jalur aman hijau, outro AUDIRA | `shower-enclosure-a50c16` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti topik adalah cutaway internal (elemen, burner, penukar panas, katup, ELCB) yang tidak ada di katalog GLB; BONGKAR (2D cutaway) paling terbaca. Hybrid hanya bila model water heater dibuat khusus.
