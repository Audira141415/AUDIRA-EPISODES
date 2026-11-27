# Asset Candidates — El Niño dan La Niña: Lautan Jauh yang Mengatur Hujan di Indonesia

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya petak sawah, rak jemur padi, karakter petani ber-rig, globe kelas, dan pelampung. Tidak ada GLB laut/penampang samudra, awan, hujan, atau peta anomali suhu: itu dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Bola dunia dengan Pasifik merah, zoom ke sawah kering | `classroom-globe-16a96e` / prop (opsional), `rice-paddy-tile-dc727e` / prop | Peta anomali suhu 2D lebih terbaca; tekstur sawah retak procedural. HUD "+2,5 °C per Nov 2026" |
| c01_intro | Penampang Pasifik ekuator, angin pasat, air hangat menumpuk, awan + hujan | — | Diagram penampang 2D (gaya SATELLITEBRIEFING); panah angin animasi |
| c02 | Air hangat bergeser ke timur, laut Indonesia mendingin, awan menipis | `dive-marker-buoy-21beb7` / prop (simbol pelampung pantau) | Penampang sama, transisi warna; pelampung generik tanpa logo |
| c03 | La Niña: air hangat menumpuk, sawah tergenang | `rice-paddy-tile-dc727e` / prop, `hasa-rice-drying-rack-d545bc` / prop | Split-screen 2D; genangan procedural |
| c04 | Termometer laut di kotak Niño 3.4, grafik RONI 2026 | — | Infografis 2D; garis ambang +0,5 °C; label sumber + tanggal |
| c05 | Karung beras menyusut, kalender musim, peta Indonesia arsir | `farmer-363820` / character (clip Idle), `grain-sack-401d96` / prop | Petani tanpa detail wajah (rule 15); diagram batang 31,54 → 31,10 juta ton |
| c06 | Samudra Hindia + jungkat-jungkit IOD, awan cumulonimbus di kota | — | 2D; dua kotak pantau barat/timur |
| c07_payoff | Mundur dari sawah ke bola dunia, garis cahaya laut → sawah, outro AUDIRA | `classroom-globe-16a96e` / prop, `rice-paddy-tile-dc727e` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita adalah penampang samudra, peta anomali suhu, dan grafik indeks yang tidak ada di katalog GLB; SATELLITEBRIEFING/CHAINREACTION 2D lebih tajam dan murah. 3D hanya untuk sisipan sawah/petani bila perlu.
