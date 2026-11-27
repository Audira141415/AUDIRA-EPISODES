# Asset Candidates — Kenapa Kemarau Panjang Bikin Air Tanah Turun

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya sumur desa, pompa tangan, terrain, batu, dan vegetasi. Tidak ada cross-section tanah/akuifer, tetesan air animasi, atau diagram lapisan geologi: itu dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Sumur batu desa, ember, air di dasar | `village-well-f8e361` / prop, `water-blob-e2cdf2` / prop | Air di dalam sumur turun perlahan (animasi procedural); ember tanpa wajah |
| c01_intro | Cross-section tanah, zona vadose, zona jenuh, panah imbuhan/pompa | — | Cross-section 2D jauh lebih terbaca; overlay panah animasi. HUD "30% air tawar" |
| c02 | Tetesan hujan meresap melewati lapisan tanah-kerikil-batuan, split screen dangkal vs dalam | `small-rock-d43710` / prop, `grass-terrain-blob-389daa` / prop | Animasi resapan air 2D/shader; counter waktu (100 tahun vs 10.000 tahun) |
| c03 | Kalender tanpa hujan, tanah retak, panah imbuhan putus, grafik muka air turun | — | Kalender dan grafik murni 2D; tanah retak shader procedural |
| c04 | Sumur bor industri, kerucut depresi, deplesi global, globus Bumi miring | `hand-water-pump-448037` / prop, `windmill-pump-2993a4` / prop | Pompa industri besar tidak ada di katalog; gunakan hand pump sebagai simbolis + teks "×1000". Globus Bumi: procedural sphere |
| c05 | Cross-section: lempung memadat, bangunan miring, subsidensi | `two-storey-shophouse-183790` / building, `wide-shophouse-089f20` / building | Bangunan miring di atas tanah ambles; lempung memadat = shader. Tanpa nama kota/logo (rule 15) |
| c06 | Sumur resapan, biopori, taman kota, papan regulasi generik | `village-well-f8e361` / prop, `oak-tree-50ee7c` / prop, `greenhouse-53ab6d` / building | Sumur resapan = lubang silinder 2D + panah air masuk; papan teks generik |
| c07_payoff | Cross-section → lanskap hujan turun, sumur terisi, outro AUDIRA | `village-well-f8e361` / prop, `water-blob-e2cdf2` / prop, `grass-terrain-blob-389daa` / prop | Loop ke hook: sumur berair lagi; outro card `audira-outro-card.svg` |

Saran engine: **2D** — topik ini sangat bergantung pada diagram cross-section tanah, lapisan akuifer, dan animasi resapan air yang jauh lebih terbaca di 2D (TERRARIUM, DATAPHYSICAL, atau FLUIDFORGE-2D). Aset GLB di katalog (sumur, pompa) bisa dipakai sebagai accent 3D di dalam komposisi 2D jika diperlukan, tapi visual utama (cross-section, grafik, counter, panah aliran) murni 2D.
