# Asset Candidates — Pulau yang Dimiliki Satu Orang dan Diakui Dunia

Dicari 2026-11-25 lewat `audira_search_assets` dan katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/`. Tidak ada GLB benteng laut Maunsell: benteng hero harus dibuat sendiri (dua tabung beton + dek, `RoundedBoxGeo` + material `POLISH.*`, atau model Blender), bukan kubus polos.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Benteng dua tiang di laut, siluet pria, bendera | `antenna-mast-0954b0` / prop, `beach-flag-pole-2bf334` / prop, karakter generik dari `character-anim` (klip Idle/Wave) | Benteng hero custom; tiang bendera diberi kain bendera Sealand (merah-putih-hitam diagonal) |
| c01_intro | Peta Laut Utara, garis pantai Suffolk, jarak 11 km | belum dicari (2D) | Peta 2D vektor / layer peta HUD |
| c02 | Perahu kecil, antena dan radio, mahkota | `sailboat-3ee283` / ultra, `ship-s-longboat-f159fd` / vehicle, `field-radio-set-b6f3fd` / prop, `rooftop-antenna-mast-6e4944` / prop, `crown-a294ce` / prop | Longboat lebih cocok dari sailboat untuk perahu motor kecil |
| c03 | Kapal mendekat, ruang sidang, batas 3 mil | `scout-ship-289ccc` / vehicle, `dive-marker-buoy-21beb7` / prop, `lifebuoy-on-a-post-57421b` / prop; ruang sidang belum ada GLB | Ruang sidang lebih aman 2D (palu, berkas); peta 3 mil 2D |
| c04 | Helikopter mendarat, siluet perebutan, diplomat | `helicopter-9d1986` / vehicle, `air-ambulance-helicopter-ed9acc` / vehicle, `guard-bfa819` / character (versi ber-rig di character-anim) | Tanpa logo atau lambang resmi Jerman; amplop diplomatik generik |
| c05 | Peta batas laut 3 → 12 mil | belum dicari (2D) | Animasi lingkaran batas melebar |
| c06 | Globe abu-abu, cap "TIDAK DIAKUI" | belum dicari | Globe 3D sederhana atau 2D |
| c07_payoff | Benteng golden hour, pull-back ke laut luas, papan AUDIRA | benteng custom, `antenna-mast-0954b0` / prop, `gold-coin-29afc1` / prop (opsional: koin Sealand) | Papan AUDIRA di dek = brand di dalam adegan |

Saran engine: hybrid — benteng, helikopter, dan laut paling kuat sebagai diorama 3D R3F, sedangkan twist batas laut 3 → 12 mil dan pengadilan paling jelas sebagai peta/kartu 2D di atas adegan.
