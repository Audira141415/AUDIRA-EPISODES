# Asset Candidates — Kenapa Harga Cabai Bisa Naik Lima Kali Lipat dalam Sebulan

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya cabai, peti, truk, dan lapak pasar; tidak punya cobek/sambal, timbangan, awan hujan, atau peta. Semua tokoh manusia siluet tanpa wajah (rule 15); lembaga hanya name plate teks tanpa logo.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Awan hujan di atas kebun, garis kiriman ke warung kota, cobek sambal + label harga | `chili-pepper-3d7469` / ultra, `market-stall-94937d` / building | Awan, cobek, peta mini dibuat 2D |
| c01_intro | Kantong rawit di timbangan pengepul, kalender 3 pekan, callout Rp17.000 → Rp49.000 | `chili-pepper-3d7469` / ultra, `wooden-crate-e46521` / prop | Timbangan 2D; petani siluet |
| c02 | Bedengan cabai tergenang, hujan, buah busuk (antraknosa) | `vegetable-bed-tile-d66915` / prop, `dirt-terrain-blob-7227e6` / prop, `chili-pepper-3d7469` / ultra | Efek busuk = ganti material/warna buah; hujan 2D/partikel sekunder (bukan visual utama) |
| c03 | Peta Jawa: sentra Jatim/Jateng → Jakarta, lapak kota kosong | `market-stall-94937d` / building, `freight-crate-and-sack-f49cbb` / prop | Peta flat 2D (history-map / DATAPHYSICAL) |
| c04 | Truk cabai di jalan berlumpur, peta Indonesia 214 titik, chip Situbondo +121% | `delivery-truck-a9537e` / vehicle, `three-wheeled-delivery-mini-744094` / vehicle | Peta + counter 2D |
| c05 | Grafik harga jatuh-naik, kebun ditinggal | `vegetable-bed-tile-d66915` / prop, `garden-hoe-3974ad` / prop | Grafik garis 2D |
| c06 | Rantai domino sebab-akibat, panah Jatim → Halmahera | `wooden-crate-e46521` / prop, `delivery-truck-a9537e` / vehicle | Diagram rantai cocok CHAINREACTION; name plate teks |
| c07_payoff | Batang harga acuan vs harga per awal Nov 2026, cobek sambal, outro | `chili-pepper-3d7469` / ultra | Bar chart 2D + outro card AUDIRA |

Saran engine: 2D — inti cerita adalah peta arus pasokan, grafik harga, dan rantai sebab-akibat (CHAINREACTION/DATAPHYSICAL), sedangkan objek kunci (cobek, timbangan, awan, peta) tidak ada di katalog GLB; GLB cabai/truk/lapak bisa dipakai sebagai sisipan hybrid bila perlu.
