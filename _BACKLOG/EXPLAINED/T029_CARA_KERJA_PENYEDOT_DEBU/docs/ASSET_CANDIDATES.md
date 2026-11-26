# Asset Candidates — Cara Kerja Penyedot Debu

> Dicari via `audira_search_assets` (2026-11-26). Katalog TIDAK punya GLB penyedot debu, kipas sentrifugal, motor listrik, sedotan, maupun perapian. Ada perabot ruang tamu (sofa, karpet) dan cangkir. Objek utama (penyedot debu, cutaway motor-kipas) harus dimodel procedural/2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Mulut selang di atas karpet, debu melesat masuk, panah udara mendorong | `area-rug-5c56e2` / prop | Selang + nozzle generik procedural (tanpa merek, rule 15); partikel debu hanya aksen, bukan subjek utama |
| c01_intro | Ruang tamu → bumi + lapisan atmosfer, panah tekanan segala arah | `sofa-9c0e7e` / prop, `area-rug-5c56e2` / prop | Bumi/atmosfer 2D atau shader; HUD "±101 kPa" |
| c02 | Cutaway penyedot debu: motor, kipas sentrifugal, lubang buang | — (belum ada) | Cutaway paling tajam di 2D (blueprint) atau model procedural; HUD "±90.000 rpm (contoh studi)" |
| c03 | Diagram zona tekanan tinggi vs rendah; debu, remah, rambut terseret; analogi sedotan | `coffee-cup-90be67` / ultra, `takeaway-coffee-cup-1fd6dd` / prop | Sedotan procedural; zona warna 2D |
| c04 | Dua batang tekanan 101 vs 13 kPa, pie 1/8 | — | Infografis 2D murni |
| c05 | Kantong berpori, pusaran siklon, lipatan filter HEPA | — (belum ada) | Siklon cocok shader (FLUIDFORGE); HUD "HEPA ≥ 99,97% · 0,3 µm"; desain siklon generik, jangan mirip merek tertentu |
| c06 | Kantong penuh, filter mampet, ikon peringatan cairan & abu panas | — | Ikon lucide (Droplets, Flame) dengan coretan; tanpa demo berbahaya |
| c07_payoff | Karpet bersih → rumah → atmosfer bumi, panah mengalir ke selang; outro AUDIRA | `sofa-9c0e7e` / prop, `area-rug-5c56e2` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — objek utama (penyedot debu, kipas, siklon, filter) tidak ada di katalog GLB dan inti cerita adalah diagram tekanan/aliran udara; 2D cutaway + infografis (BONGKAR/blueprint) paling terbaca. Hybrid 3D hanya bila penyedot debu dimodel procedural untuk INNERWORKS.
