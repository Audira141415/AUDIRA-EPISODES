# Asset Candidates — Cara Kerja Subsidi: Siapa yang Sebenarnya Membayar Selisih Harga

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya pompa bensin, petugas SPBU ber-rig, tong minyak, brankas, dan tiang kabel. Tidak ada tabung LPG 3 kg, meteran listrik rumah, kilang, atau truk tangki BBM: itu dibuat 2D. Rule 15: semua aset tanpa logo Pertamina/PLN/Kemenkeu.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Nozel/pompa BBM, dua batang harga | `gas-pump-5014a8` / prop | Batang harga dan angka = 2D HUD; pompa tanpa logo |
| c01_intro | Minyak mentah → kilang → truk → pompa | `oil-drum-386c30` / prop, `gas-pump-5014a8` / prop | Kilang dan truk tangki tidak ada di katalog; ilustrasi 2D |
| c02 | Kas APBN mengalirkan koin ke badan usaha, pompa Solar | `iron-vault-safe-8b8f29` / prop, `gas-station-attendant-38bd86` / character | Karakter ber-rig tanpa wajah nyata; pie 43% 2D |
| c03 | Buku besar, talangan bulanan, kaca pembesar auditor | — | Murni 2D infografis (timeline bulanan, stempel audit) |
| c04 | Tabung gas hijau, meteran listrik, tiang listrik | `telegraph-pole-line-95e382` / prop | Tabung LPG 3 kg dan meteran: ilustrasi 2D generik tanpa merek |
| c05 | Dua menara uang di atas peta Indonesia | — | Peta 2D generik; grafik batang Rp222,5 T vs Rp154,5 T |
| c06 | Diagram alir kas negara (pajak, cukai, PNBP, pembiayaan) | — | Diagram Sankey/sungai 2D |
| c07_payoff | Celah harga terisi koin dari siluet tangan, outro | `iron-vault-safe-8b8f29` / prop | Siluet tanpa wajah; outro card `audira-outro-card.svg` |

Saran engine: 2D — topik ini alur uang dan angka (grafik batang, diagram alir, timeline kompensasi); aset 3D yang relevan hanya pompa dan brankas, sedangkan tabung LPG, meteran, dan kilang tidak ada di katalog. DATAPHYSICAL/CHAINREACTION 2D paling aman untuk rule 15.
