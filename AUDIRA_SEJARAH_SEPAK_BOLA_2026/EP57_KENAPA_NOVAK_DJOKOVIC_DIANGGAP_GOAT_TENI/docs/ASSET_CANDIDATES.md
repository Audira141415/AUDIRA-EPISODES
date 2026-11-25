# Asset Candidates — Kenapa Novak Djokovic Dianggap GOAT Tenis Meski Dibenci Separuh Dunia

> Dicari 2026-11-25 lewat `audira_search_assets`. Katalog tidak punya aset tenis (query "tennis", "athlete", "medal", "bleachers" = 0 hasil). Tokoh nyata digambar sebagai siluet tanpa wajah.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Angka 24 + barisan trofi, tribun penonton | `trophy-cabinet-e963ac` / prop; `advertising-hoarding-run-efe4bc` / prop (kit stadium) | Tribun dan papan "ROGER" dibuat 2D; angka 24 = tipografi kinetik |
| c01_intro | Siluet pemain di lapangan rumput, timbangan trofi vs meteran simpati | `turf-pitch-tile-aca1ef` / prop (kit stadium) | Garis lapangan tenis perlu dibuat sendiri; timbangan = infografis 2D |
| c02 | Peta Serbia/Beograd, kolam renang kosong jadi lapangan | `above-ground-pool-95b23e` / prop; `pool-deck-paver-tile-074d8f` / prop; `ruined-gable-end-834895` / building | Kolam in-ground kosong lebih tepat; ilustrasi 2D dianjurkan. Ledakan cukup kilatan jauh, tidak grafis |
| c03 | Dua siluet di lampu sorot + tumpukan trofi 20 / 22 / 24 | `natural-20-trophy-plinth-c31c9c` / prop | Bar chart 2D lebih terbaca; label nama tanpa wajah |
| c04 | Centre Court, papan skor 13–12, sorakan "ROGER" | `turf-pitch-tile-aca1ef` / prop; `advertising-hoarding-run-efe4bc` / prop | Papan skor + teks getar = 2D HUD. Jangan pakai logo Wimbledon |
| c05 | Map arsip, bola ke hakim garis, paspor dicap, pesawat lepas landas | `business-jet-684611` / vehicle | Paspor, stempel, map = ilustrasi 2D. Jangan pakai logo US Open / bendera resmi pemerintah |
| c06 | Dinding 428 kotak minggu, 8 mahkota, papan head-to-head | belum ada aset cocok | Murni infografis data (DATAPHYSICAL) |
| c07_payoff | Lapangan tanah liat Paris, medali emas, lemari trofi penuh, papan "AUDIRA" | `trophy-cabinet-e963ac` / prop | Medali dibuat 2D/primitif ber-shader; tanpa logo cincin Olimpiade |

Saran engine: 2D — topik didominasi angka dan perbandingan (infografis DATAPHYSICAL), katalog GLB tidak punya aset tenis, dan tokoh nyata lebih aman sebagai siluet 2D; hybrid hanya bila ingin trofi/lemari GLB di c00 dan c07.
