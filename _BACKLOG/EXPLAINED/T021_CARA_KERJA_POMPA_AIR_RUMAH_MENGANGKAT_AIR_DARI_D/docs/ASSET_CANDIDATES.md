# Asset Candidates — Cara Kerja Pompa Air Rumah: Mengangkat Air dari Dalam Tanah

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya rumah, sumur batu, pompa tangan, menara air, dan potongan pipa. Tidak ada pompa air listrik rumah tangga, impeler, maupun pompa celup sumur dalam: bagian inti (cutaway pompa) harus dibuat 2D atau procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Rumah generik, pompa di belakang rumah, pipa masuk tanah, panah udara | `two-storey-family-house-c63c4a` / building, `pipe-run-280a0d` / prop | Pompa listrik tidak ada di katalog; ilustrasi/procedural tanpa merek |
| c01_intro | Penampang tanah, pipa ke muka air, penggaris kedalaman | `surface-pipe-run-62c4b3` / prop | Penampang tanah lebih tajam di 2D; HUD "≈ 10,3 m" |
| c02 | Cutaway rumah pompa: motor, poros, impeler berputar | — | Tidak ada GLB impeler/pompa sentrifugal; diagram 2D atau mesh procedural (bukan kubus polos) |
| c03 | Ember, tangan menuang air pancingan, impeler kosong | — | Tangan tanpa wajah; ember dan impeler ilustrasi 2D |
| c04 | Penampang pipa hisap, kolom udara menekan permukaan sumur, analogi sedotan | `stone-well-2b4717` / prop, `village-well-f8e361` / prop | Sumur batu bisa jadi bibir sumur; panah tekanan + HUD "101.325 Pa" di 2D |
| c05 | Tabung kolom air 10,3 m, halaman manuskrip 1638 | `hand-water-pump-448037` / prop | Pompa tangan klasik cocok untuk era Galileo; name plate teks, tanpa potret |
| c06 | Split screen: pompa jet dangkal vs pompa celup di sumur bor dalam, gelembung kavitasi | `hand-water-pump-448037` / prop, `pipe-junction-5b146a` / prop | Pompa celup tidak ada; silinder procedural; HUD "≈ 7,6 m" |
| c07_payoff | Kamera turun menembus tanah ke pompa celup, air naik ke keran, outro AUDIRA | `two-storey-family-house-c63c4a` / building, `rooftop-water-tower-b38362` / prop | Tandon di atap opsional; outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita adalah penampang (cutaway impeler, panah tekanan, kolom air 10,3 m, split screen sumur dangkal vs dalam) yang lebih jelas sebagai diagram 2D (BONGKAR), dan katalog GLB tidak punya pompa listrik, impeler, atau pompa celup; hybrid hanya bila ingin diorama rumah + sumur 3D di hook dan payoff.
