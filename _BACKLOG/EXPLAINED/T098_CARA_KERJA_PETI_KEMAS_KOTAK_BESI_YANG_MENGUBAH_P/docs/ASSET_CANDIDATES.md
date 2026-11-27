# Asset Candidates — Cara Kerja Peti Kemas: Kotak Besi yang Mengubah Perdagangan Dunia

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya kontainer kargo, crane dermaga, gudang, truk delivery, dan cargo freighter (pesawat kargo). Tidak ada kapal kontainer modern, gantry crane pelabuhan, atau kereta barang: itu dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Dermaga lama, kuli panggul, karung/peti, transisi ke crane modern | `freight-crate-and-sack-f49cbb` / prop, `dock-platform-section-b36e7c` / prop, `dock-cargo-crane-ccd97f` / building | Kuli tanpa wajah (rule 15); dermaga lama bisa pakai dock platform + filter hitam-putih |
| c01_intro | Crane mengangkat kontainer dari truk ke kapal, kontainer tidak dibuka | `cargo-container-fd73bc` / prop, `modular-freight-container-412fd5` / prop, `dock-cargo-crane-ccd97f` / building, `delivery-truck-a9537e` / vehicle | HUD "tanpa bongkar-muat ulang" |
| c02 | Dermaga 1950-an, kargo berantakan, pekerja manual | `freight-crate-and-sack-f49cbb` / prop, `cargo-crate-9afc44` / prop, `cargo-sack-3cd3ab` / prop, `dock-warehouse-bf0967` / building | Jam berputar cepat; pekerja = siluet tanpa wajah |
| c03 | Kapal tanker dikonversi (Ideal X), siluet McLean, peta Newark → Houston | `cargo-freighter-b4377e` / vehicle (simbolis, pesawat kargo tapi bisa dimodifikasi/diganti 2D), `cargo-container-fd73bc` / prop | Kapal kontainer tidak ada di katalog; gunakan ilustrasi 2D kapal tanker T-2 + kontainer di deck |
| c04 | Kontainer dengan dimensi menyala (20 ft × 8 ft × 8,5 ft), dua ukuran | `cargo-container-fd73bc` / prop, `modular-freight-container-412fd5` / prop | HUD dimensi overlay; kontainer masuk truk dan kereta = 2D diagram |
| c05 | Globe, jalur pelayaran, pelabuhan Shanghai, ribuan kontainer | `cargo-container-fd73bc` / prop (tumpukan banyak) | Globe dan jalur pelayaran = 2D; Shanghai = tumpukan kontainer 3D + counter HUD |
| c06 | Peta Indonesia, Tanjung Priok, Patimban, crane berjajar | `dock-cargo-crane-ccd97f` / building (duplikat berjajar), `cargo-container-fd73bc` / prop, `dock-warehouse-bf0967` / building | Peta Indonesia 2D, zoom ke pelabuhan 3D; HUD throughput TEU |
| c07_payoff | Zoom out dari satu kontainer ke tampilan udara, globe emas | `cargo-container-fd73bc` / prop, `dock-cargo-crane-ccd97f` / building | Outro card `audira-outro-card.svg` |

Saran engine: 2D — katalog GLB tidak punya kapal kontainer, gantry crane pelabuhan modern, atau kereta barang; visual utama (dermaga lama, kapal Ideal X, peta jalur pelayaran, globe, diagram dimensi) lebih terbaca dan tajam di 2D motion graphic (SCALEFORGE 2D/CHRONICLE). Kontainer dan crane dari katalog bisa jadi elemen pendukung di diorama hybrid, tapi engine utama tetap 2D.
