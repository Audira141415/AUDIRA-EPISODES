# Asset Candidates — Cara Kerja Diskon Besar-besaran: Toko Tetap Untung

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya gudang, lapak pasar, etalase, uang, dan kasir ber-rig. Tidak ada troli supermarket, rak toko ritel, atau label harga: semua itu dibuat 2D/procedural. Semua elemen toko wajib generik, tanpa logo atau nama merek (rule 15).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Label harga raksasa "−70%", rak toko generik | `cafe-storefront-unit-443728` / building (latar etalase) | Label harga dan rak dibuat 2D; tanpa logo/maskot toko |
| c01_intro | Label harga terbelah modal/margin/harga jual, rumus kinetik | — | Infografis 2D murni; HUD rumus "Laba = Harga jual − Modal" |
| c02 | Kalkulator HUD, batang harga menembus garis modal | `banded-cash-bundle-7da278` / prop (aksen uang) | Grafik batang 2D lebih terbaca; stempel "ILUSTRASI" wajib |
| c03 | Lorong toko, barang umpan bersinar, troli terisi, neraca untung-rugi | `market-stall-94937d` / building, `mercado-stall-6e6ba3` / prop, `cage-cashier-f76725` / character (clip Point/Idle) | Troli belanja tidak ada di katalog (hasil "cart" hanya troli rumah sakit/tambang); buat 2D. Karakter kasir: pastikan wajah tidak realistis |
| c04 | Gudang berdebu, tumpukan kardus polos, koin mengalir | `brick-depot-warehouse-3dd642` / building, `dock-warehouse-bf0967` / building, `freight-crate-and-sack-f49cbb` / prop, `cash-counting-machine-1f6eca` / prop | Ikon biaya (sewa, jam, retak) pakai lucide `ICON_HUD`; tanpa angka 20–30% |
| c05 | Stiker harga ditimpa, coretan, kaca pembesar, kartu pasal UU | — | 2D; kartu dokumen hukum generik tanpa lambang lembaga negara |
| c06 | Kepala siluet tanpa wajah, kembang api kecil, tangan menambah ke keranjang | — | Siluet 2D; tanpa wajah orang nyata |
| c07_payoff | Label harga + dua kotak centang, diorama toko generik, outro AUDIRA | `cafe-storefront-unit-443728` / building, `market-stall-94937d` / building | Outro card `audira-outro-card.svg`; nama AUDIRA di papan toko diorama (anti-reupload) |

Saran engine: 2D — inti cerita adalah hitungan (label harga, batang margin, neraca, rumus) yang jauh lebih tajam sebagai infografis kinetik 2D, dan katalog GLB tidak punya troli, rak ritel, atau label harga; diorama 3D hanya menambah risiko tanpa menambah kejelasan (BONGKAR atau DATAPHYSICAL paling pas).
