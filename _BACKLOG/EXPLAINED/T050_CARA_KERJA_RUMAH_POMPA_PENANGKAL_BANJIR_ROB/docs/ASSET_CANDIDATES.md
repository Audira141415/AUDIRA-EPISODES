# Asset Candidates — Cara Kerja Rumah Pompa Penangkal Banjir Rob

> Dicari via `audira_search_assets` + daftar katalog lokal (2026-11-27). Katalog punya rumah pompa kecil, tanggul laut, gedung apartemen, gudang dermaga, genset, dan pintu air. Tidak ada pompa aksial besar, impeler, waduk, atau papan duga: itu dibuat procedural/2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Cross-section kota pesisir, garis laut di atas atap, tanggul, rumah pompa | `sea-wall-run-91e459` / building, `water-pump-house-121270` / building, `brownstone-row-house-1b84fd` / building | Air laut = bidang air procedural; HUD "sebagian kota < laut" |
| c01_intro | Peta Jakarta generik, zona di bawah laut menyala | — | Peta 2D (batas generik, tanpa logo Pemprov); HUD "±18–20% · 2021" |
| c02 | Satelit radar, sumur air tanah, lapisan tanah memadat, patok ukur | `slab-apartment-block-1b02a2` / building, `apartment-block-6445af` / building | Cutaway tanah dan satelit generik dibuat procedural; HUD "±5,7 cm/tahun" |
| c03 | Ombak rob vs tanggul, hujan, genangan di balik tanggul | `sea-wall-run-91e459` / building, `harbour-jetty-run-bc1c7c` / building, `dock-warehouse-bf0967` / building | Panah gravitasi dicoret = HUD 2D |
| c04 | Saluran → waduk → pintu air → rumah pompa → pipa lewat tanggul → laut | `counterweighted-bay-gate-dcca8f` / building (pintu air), `water-pump-house-121270` / building, `small-pipe-joint-e037a0` / attachment, `eave-rainwater-channel-0213e7` / building | Waduk dan saluran = mesh air procedural; label komponen per kata VO |
| c05 | Waduk luas, 3 gedung pompa, saringan sampah, cutaway impeler | `water-pump-house-121270` / building (×3), `standby-generator-enclosure-9d48f6` / building | Impeler/pompa besar tidak ada di katalog: modelkan procedural atau ilustrasi 2D; jangan sebut merek pompa |
| c06 | Papan duga −190 cm, hujan, sensor, panel kontrol, tangan operator | `control-tower-c95a65` / building (opsional, ruang kontrol) | Panel dan papan duga 2D/HUD; hanya tangan, tanpa wajah |
| c07_payoff | Peta kota malam, ratusan titik pompa menyala, outro | `water-pump-house-121270` / building, `apartment-block-6445af` / building | Titik-titik = marker HUD; counter "602 · 205 lokasi · Juni 2025"; outro card `audira-outro-card.svg` |

Saran engine: hybrid — diorama 3D potong melintang (tanggul, rumah pompa, kota, waduk) paling kuat untuk "cara kerja", tetapi peta, penurunan tanah, papan duga, dan diagram polder lebih terbaca di 2D; bila harus satu engine, 3D (URBANFORGE/FLUIDFORGE) dengan HUD 2D tebal, karena bangunan utama tersedia di katalog dan air procedural jadi daya tarik visual.
