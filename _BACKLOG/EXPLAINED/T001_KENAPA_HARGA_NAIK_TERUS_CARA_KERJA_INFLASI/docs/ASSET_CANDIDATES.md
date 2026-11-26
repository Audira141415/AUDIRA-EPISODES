# Asset Candidates — Kenapa Harga Naik Terus: Cara Kerja Inflasi

> Dicari via `audira_search_assets` (2026-11-26). Katalog tidak punya dompet, troli belanja, pabrik, atau uang kertas; itu dibuat 2D (ilustrasi vektor).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Dompet + uang kertas generik "100.000" | — | Tidak ada GLB dompet/uang kertas; ilustrasi 2D. Jangan replika rupiah asli |
| c01_intro | Keranjang belanja, meja kasir, timeline 2015→2025 | `grain-sack-401d96` / prop, `freight-crate-and-sack-f49cbb` / prop | Keranjang/kasir lebih cocok 2D; karung sebagai isi belanja |
| c02 | 11 ikon kelompok IHK, cabai melonjak | — | Ikon lucide (`src/core/icons`) + kartu definisi kinetik |
| c03 | Pasar: antrean pembeli, rak barang sedikit | `market-stall-94937d` / building, `mercado-stall-6e6ba3` / prop | Pembeli siluet tanpa wajah (rule 15) |
| c04 | Truk angkut, drum/tangki BBM, ikon kurs | `delivery-truck-a9537e` / vehicle, `fuel-drum-d65fa4` / prop, `fuel-jerrycan-6f1d85` / prop, `depot-fuel-tank-55a00e` / prop | Grafik batang inflasi tahunan 2001–2025 (2D) dengan sorotan 2005 |
| c05 | Loop ekspektasi: pedagang ganti label, pekerja minta gaji | — | Diagram siklus 2D + siluet; tidak butuh GLB |
| c06 | Termometer/pita target 1,5–3,5%, jarum 3,28% | — | Gauge 2D; name plate "Bank Indonesia" / "Bank sentral AS" tanpa logo |
| c07_payoff | Tumpukan koin/uang menyusut, outro AUDIRA | `coin-hoard-heap-07b6e4` / prop, `copper-coin-b4ebbb` / prop | Koin katalog bergaya fantasi; pakai bila 3D, retexture netral |

Saran engine: 2D — topik konsep + data (definisi, grafik batang, gauge target, siklus sebab-akibat); objek kunci (dompet, uang kertas, keranjang) tidak ada di katalog GLB, jadi DATAPHYSICAL/CERDIK 2D lebih tajam dan cepat; 3D hanya opsional untuk diorama pasar c03–c04.
