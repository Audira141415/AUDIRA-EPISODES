# Asset Candidates — Kerajaan Samudera Pasai

> Dicari lewat `audira_search_assets` (2026-11-25). Katalog tidak punya kapal layar/jung, nisan Aceh, atau masjid; bagian itu perlu dibuat (siluet 2D, primitive dipoles, atau ilustrasi).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Nisan batu berkaligrafi Arab, pesisir senja | foam-yard-gravestone-d64ffc / prop | Bentuk Halloween, kurang cocok; lebih baik nisan Aceh custom (ukiran + teks Arab tekstur) |
| c01_intro | Peta Sumatera, pin Aceh Utara, siluet sultan tanpa wajah | palm-tree-a307da / prop | Peta = layer 2D/HUD; siluet sultan tanpa wajah (QISSAH) |
| c02 | Kapal dagang berlabuh, peti rempah, gulungan hikayat | ship-s-longboat-f159fd / vehicle; cargo-crate-9afc44 / prop; freight-crate-and-sack-f49cbb / prop; spell-scroll-29d32d / prop | Kapal layar besar tidak ada; longboat + layar custom. Cap "TRADISI" di HUD |
| c03 | Rute Selat Malaka, emas, kayu, lada | campaign-map-scroll-d4a382 / prop; gold-ore-chunk-6f1d9e / prop; wooden-crate-e46521 / prop | Rute kapal sebagai garis animasi peta 2D |
| c04 | Koin dirham emas makro | gold-coin-29afc1 / prop; gold-coin-stack-a9ef52 / prop; coin-pouch-be4dd8 / ultra | Ganti tekstur muka koin dengan inskripsi Arab; HUD "0,6 gram" |
| c05 | Musafir turun kapal, kota berpagar kayu, jung | wooden-fence-section-d72055 / prop; wooden-fence-gate-a8735f / prop; dock-platform-section-b36e7c / prop; dock-lantern-post-5e58a4 / prop | Ibnu Battuta = siluet tanpa wajah; jung belum ada di katalog |
| c06 | Titah Ming "14 negeri", peta Asia Tenggara bercahaya | campaign-map-scroll-d4a382 / prop | Peta Asia Tenggara 2D (HISTORYMAP) |
| c07_payoff | Kapal Portugis 1521, bendera Aceh 1524, hero nisan + koin, outro AUDIRA | ship-anchor-c2b4f1 / prop; gold-coin-29afc1 / prop | Hero shot sunrise; outro card AUDIRA |

Saran engine: hybrid — peta rute dagang dan HUD tahun paling kuat di 2D (HISTORYMAP/ISLAMICDOCUMENTARY), sementara nisan dan dirham emas layak jadi objek 3D makro; katalog GLB tidak punya kapal layar, jung, atau masjid sehingga 3D penuh berisiko tampak generik.
