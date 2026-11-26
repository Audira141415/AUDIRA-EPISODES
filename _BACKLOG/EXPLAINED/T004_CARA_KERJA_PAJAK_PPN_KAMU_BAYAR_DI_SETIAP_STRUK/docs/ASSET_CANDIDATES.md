# Asset Candidates — Cara Kerja Pajak PPN: Kamu Bayar di Setiap Struk Belanja

> Dicari via `audira_search_assets` (2026-11-26). Rule 15: tanpa wajah orang nyata, tanpa logo organisasi/minimarket nyata.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Struk minimarket close-up, baris "PPN" menyala | — (2D: ilustrasi/teks struk) | Struk dibuat 2D/tipografi; nama toko fiktif, tanpa logo |
| c01_intro | Kasir + pembeli, aliran uang ke kas negara | `service-counter-module-3072ff` (prop), `one-storey-shop-row-83c958` (building) | Karakter siluet/tanpa wajah; ikon gedung negara generik |
| c02 | Rantai pasok: ladang, gudang/pabrik, truk, toko | `wheat-crop-7e08e6` (prop), `cargo-sack-3cd3ab` (prop), `brick-depot-warehouse-3dd642` (building), `delivery-truck-a9537e` (vehicle), `cardboard-delivery-box-59cc68` (prop), `one-storey-shop-row-83c958` (building) | Label harga naik tiap tahap (HUD) |
| c03 | Timbangan pajak keluaran vs masukan, koin | `gold-coin-stack-a9ef52` (prop), `silver-coin-64ab27` (prop) | Timbangan dibuat 2D/diagram |
| c04 | Kalkulator 12% → 11/12 → 11%, barang mewah | `banded-cash-bundle-7da278` (prop); jet pribadi/kapal pesiar belum dicari | Inti data: lebih jelas sebagai infografis 2D |
| c05 | Rak kebutuhan pokok bebas PPN, kontainer ekspor 0% | `cargo-crate-9afc44` (prop), `wheat-crop-7e08e6` (prop) | Rak sembako & kontainer pelabuhan belum dicari spesifik |
| c06 | Struk dibedah Rp100.000 → Rp11.000; koin jadi jalan/sekolah | `asphalt-road-tile-f6593c` (prop), `road-overbridge-414614` (building), `gold-coin-29afc1` (prop) | Sekolah/puskesmas generik belum dicari |
| c07_payoff | Globe dengan titik negara, Prancis 1954, outro | — (2D peta dunia) | Outro card AUDIRA |

Saran engine: 2D — topik ini inti datanya rumus dan angka (12%, 11/12, Rp11.000), paling terbaca sebagai infografis/diagram 2D (DATAPHYSICAL/BONGKAR); GLB di atas cukup sebagai ilustrasi rantai pasok bila dipilih hybrid.
