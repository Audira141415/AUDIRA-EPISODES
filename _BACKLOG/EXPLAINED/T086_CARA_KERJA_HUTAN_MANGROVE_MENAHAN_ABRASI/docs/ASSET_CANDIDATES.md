# Asset Candidates — Cara Kerja Hutan Mangrove Menahan Abrasi

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya pantai, perahu nelayan, karang, rumput laut, dan karakter nelayan ber-rig. Tidak ada model GLB mangrove spesifik (akar pneumatofor/prop root): pohon mangrove, akar berlumpur, dan diagram mekanisme gelombang dibuat 2D/prosedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Gelombang menerjang pantai berlumpur, deretan akar mangrove | `dry-soft-sand-tile-4a1df7` / prop, `driftwood-log-89a68f` / prop, `groyne-run-971623` / building (simbolis) | Akar mangrove dan gelombang tidak ada GLB; prosedural 2D. HUD ">50% energi terserap" |
| c01_intro | Potongan bawah air: 3 jenis akar, ombak berkurang | `seagrass-tuft-862cc5` / prop, `sea-whip-e56668` / prop, `coral-rubble-seabed-tile-772a1f` / prop | Akar pneumatofor/prop root/lutut = 2D cutaway ilustrasi. Seagrass sebagai dasar laut berlumpur |
| c02 | Sedimen tersangkut di akar, garis pantai memanjang | `dry-soft-sand-tile-4a1df7` / prop, `marram-dune-tile-56cdf8` / prop | Diagram aliran sedimen 2D lebih terbaca. Timelapse daratan bertambah = animasi 2D |
| c03 | Peta Indonesia, mangrove hijau per pulau | — | Peta 2D generik (tanpa logo/lambang). Counter "3,45 juta ha". Tidak ada GLB peta Indonesia |
| c04 | Split screen: dinding beton retak vs sabuk mangrove lentur | `concrete-block-wall-02c715` / prop, `concrete-seat-wall-run-891d1c` / prop, `palm-tree-a307da` / prop | Grafik biaya 2D. Beton = GLB dinding + efek retak. Mangrove = 2D ilustrasi lentur |
| c05 | Akar bawah air berisi ikan/udang/kepiting, nelayan di perahu | `fisherman-in-waders-6dc25e` / character (clip Idle/Walk), `small-fishing-boat-4ac0e3` / vehicle, `caique-fishing-boat-262c24` / vehicle, `starfish-772749` / animal, `seagrass-tuft-862cc5` / prop, `moon-jellyfish-0fa43c` / animal | Ikan kecil/udang/kepiting = prosedural atau sprite 2D. Nelayan tanpa detail wajah (rule 15) |
| c06 | Dokumen PP 27/2025, peta 23 provinsi pemulihan | — | Semua 2D: dokumen teks generik, peta titik-titik hijau. Tanpa logo lembaga |
| c07_payoff | Panorama pantai utuh, sabuk mangrove hijau, outro AUDIRA | `dry-soft-sand-tile-4a1df7` / prop, `palm-tree-a307da` / prop, `small-fishing-boat-4ac0e3` / vehicle, `boardwalk-deck-run-c1f678` / building | Outro card `audira-outro-card.svg` |

Saran engine: **2D** (TERRARIUM atau SATELLITEBRIEFING) — visual inti topik ini (akar mangrove berlumpur, mekanisme gelombang, diagram sedimen, peta Indonesia, grafik biaya) semua lebih jelas dan tajam di 2D. Katalog GLB tidak punya model mangrove spesifik. Elemen 3D pesisir (perahu, nelayan) bisa jadi aksen tapi bukan kebutuhan utama. Bila harus satu engine, 2D paling aman.
