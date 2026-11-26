# Asset Candidates — Kenapa Harga Emas Naik Saat Dunia Sedang Panik

> Dicari via `audira_search_assets` (2026-11-26). Rule 15: tanpa merek emas, logo bank/bank sentral/stasiun TV, atau wajah orang nyata.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Layar berita "KRISIS" generik, grafik saham anjlok, batang emas jatuh | `gold-ingot-85e62e` / prop | Layar berita dan grafik dibuat 2D; ingot polos, jangan tambah cap merek |
| c01_intro | Grafik harga ala terminal naik ke US$5.405, chip troy ounce | `gold-coin-29afc1` / prop | Grafik 2D (TRADINGTERMINAL); koin tanpa gambar wajah/lambang negara |
| c02 | Batang emas vs surat utang robek, air/karat tidak menempel | `gold-ingot-85e62e` / prop | Surat utang & efek karat 2D/shader |
| c03 | Dana mengalir dari papan saham merah ke brankas | `iron-vault-safe-8b8f29` / prop, `coin-pouch-be4dd8` / ultra, `gold-coin-stack-a9ef52` / prop | Ikon perang/wabah/krisis dari lucide (tanpa bendera, tanpa pihak) |
| c04 | Kubus emas dunia ±22,6 m dengan skala, timbangan permintaan vs stok | `gold-ore-chunk-6f1d9e` / prop, `mine-cart-94bd76` / prop, `mine-rail-track-9532dd` / prop | Kubus dibuat dari material emas PBR (bukan box polos sebagai visual utama: tambah tekstur batangan bertumpuk) |
| c05 | Gudang brankas bank sentral generik, tumpukan batangan per tahun | `iron-vault-safe-8b8f29` / prop, `gold-ingot-85e62e` / prop, `treasure-chest-58da92` / ultra | Diagram batang tonase 2D; tanpa nama/logo bank sentral |
| c06 | Jungkat-jungkit dolar & obligasi vs emas, grafik turun | `gold-coin-stack-a9ef52` / prop, `silver-coin-64ab27` / prop | Ikon dolar & obligasi 2D; label "per 15–30 Nov 2026" wajib |
| c07_payoff | Grafik harga berdenyut seperti detak jantung, outro AUDIRA | `gold-ingot-85e62e` / prop | Outro card `audira-outro-card.svg`; chip "bukan saran investasi" |

Saran engine: 2D — topik didominasi grafik harga, diagram tonase, dan alur dana sehingga TRADINGTERMINAL/DATAPHYSICAL lebih tajam; GLB emas/brankas di katalog terbatas (ingot, koin, brankas) dan cukup sebagai sisipan hybrid bila dipilih 3D.
