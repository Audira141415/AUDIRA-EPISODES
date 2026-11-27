# Asset Candidates — Cara Kerja Angin Monsun: Kenapa Musim Hujan Bisa Datang Terlambat

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya awan low-poly, kincir/windsock, globe, petak sawah, petani ber-rig, dan pompa air. Tidak ada peta Indonesia, panah angin, peta tekanan, atau grafik curah hujan: itu dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Peta Indonesia gaya satelit, zona "MUNDUR" berkedip, panah angin | `towering-cloud-2e00f1` / prop | Peta 2D generik (tanpa logo BMKG); HUD "6 dari 10 · prediksi BMKG per Okt 2026" |
| c01_intro | Globe Asia–Indonesia–Australia, panah angin berbalik, awan terbentuk | `classroom-globe-16a96e` / prop, `towering-cloud-2e00f1` / prop, `windsock-d5df79` / prop | Panah angin dan uap air procedural; kalender "≈ Okt–Apr / Apr–Okt" |
| c02 | Darat panas vs laut, matahari bergeser, tekanan T/R, pita ITCZ | `weathervane-4b2013` / prop, `grass-terrain-blob-c4f709` / prop, `water-blob-f266b8` / prop | Diagram tekanan dan aliran udara lebih jelas di 2D |
| c03 | Tiga gelas ukur hujan 50 mm, centang | — | Tidak ada GLB rain gauge; ilustrasi 2D. HUD "≥ 50 mm × 3 dasarian" |
| c04 | Peta angin 850 mb, kolam hangat Pasifik, gauge El Niño | `towering-cloud-2e00f1` / prop | Peta & gauge 2D (SATELLITEBRIEFING); label "El Niño +2,20" |
| c05 | Mosaik 699 zona, 3 grafik pola hujan, grafik Ambon | — | Infografis 2D; counter "699 zona musim"; batang Juni ±638 / Juli ±602 mm |
| c06 | Sawah tadah hujan retak vs sawah irigasi, petani tanpa wajah, kalender tanam | `rice-paddy-tile-dc727e` / prop, `farmer-363820` / character (clip Idle/Walk), `hand-water-pump-448037` / prop, `water-pump-house-121270` / building, `windmill-pump-2993a4` / prop | Wajah petani tanpa detail (rule 15); kalender tanam generik tanpa logo Kementan |
| c07_payoff | Time-lapse setahun: panah angin bolak-balik, awan menyapu pulau, outro AUDIRA | `towering-cloud-2e00f1` / prop, `classroom-globe-16a96e` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita adalah peta, panah angin, tekanan udara, dan grafik curah hujan yang paling terbaca sebagai infografis 2D (SATELLITEBRIEFING/DATAPHYSICAL); katalog GLB hanya menutup adegan sawah, jadi 3D cukup sebagai sisipan bila dipilih hybrid.
