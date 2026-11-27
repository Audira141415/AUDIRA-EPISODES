# Asset Candidates — Kenapa Satu Kapal Tersangkut Bisa Bikin Harga Barang Naik

> Dicari via `audira_search_assets` (2026-11-27). Katalog tidak memiliki kapal kontainer modern, peta dunia/globe, atau terusan buatan. Topik ini sangat cocok untuk 2D motion graphic.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Kapal kontainer raksasa di terusan sempit, peta dunia | — | Tidak ada GLB kapal kontainer modern; ilustrasi 2D. Peta dunia 2D flat |
| c01_intro | Ever Given 400 m, terusan Suez, antrean kapal, counter hari | `cargo-container-fd73bc` / prop (kontainer simbolis) | Kapal Ever Given sebagai ilustrasi 2D; kontainer GLB bisa dipakai sebagai elemen tambahan |
| c02 | Peta dunia dengan 3 chokepoint menyala, garis rute perdagangan | — | Semua elemen peta 2D. Tidak ada globe di katalog |
| c03 | Antrean kapal (tampak atas), efek domino: pabrik → toko → harga | `cargo-crate-9afc44` / prop, `cardboard-delivery-box-59cc68` / prop, `one-storey-shop-row-83c958` / building | Domino chain sebagai animasi 2D lebih terbaca |
| c04 | Peta Laut Merah, titik ledakan, rute alternatif via Afrika | — | Peta animasi 2D. Tanpa ikon militer/senjata (rule 15, netral) |
| c05 | Rantai berantai: kapal → pelabuhan → truk → toko → keranjang | `delivery-truck-a9537e` / vehicle, `three-storey-shophouse-2f6378` / building, `shop-awning-f47171` / prop | Rantai infografis 2D lebih jelas; truk GLB bisa sebagai aksen |
| c06 | Conveyor belt, stok tipis, gelombang merah di peta | `freight-crate-and-sack-f49cbb` / prop | Sebagian besar elemen 2D (conveyor, peta) |
| c07_payoff | Chokepoint + kapal raksasa, kota dunia menyala, outro AUDIRA | — | Outro card `audira-outro-card.svg` |

Saran engine: **2D** — SATELLITEBRIEFING atau CHAINREACTION. Alasan: (1) visual utama adalah peta dunia, jalur perdagangan, dan infografis rantai domino yang jauh lebih terbaca di 2D; (2) tidak ada GLB kapal kontainer, terusan, atau globe di katalog; (3) topik ini tentang data dan mekanisme, bukan objek fisik yang perlu kedalaman 3D. CHAINREACTION sangat cocok karena narasi adalah "satu peristiwa → efek berantai."
