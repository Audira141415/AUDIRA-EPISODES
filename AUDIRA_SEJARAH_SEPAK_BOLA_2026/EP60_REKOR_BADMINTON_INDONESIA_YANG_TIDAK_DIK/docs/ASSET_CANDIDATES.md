# Asset Candidates — Rekor Badminton Indonesia yang Tidak Diketahui Banyak Orang

Dicari via `audira_search_assets` (2026-11-25). Katalog tidak punya raket, shuttlecock, net bulu tangkis, trofi piala, atau medali; aset itu perlu dibuat 2D (SVG/ilustrasi) atau dimodel sendiri.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Shuttlecock jatuh, papan skor, siluet pemain | — | Tidak ada di katalog; buat ilustrasi 2D + counter HUD "7×" |
| c01_intro | Lapangan bulu tangkis + net, trofi Piala Thomas generik | `stand-roof-run-cfd457` (building), `grandstand-seating-run-fc9023` (building) | Tribun dari kit stadium bisa jadi BG arena; lapangan + net + trofi dibuat sendiri, tanpa logo resmi |
| c02 | Rak 14 piala, timeline 1970–1979, scoreboard 51/54 | `trophy-cabinet-e963ac` (prop) | Lemari trofi cocok; isi piala tetap perlu aset sendiri |
| c03 | Grafik tangga 1994–2002 + piala di puncak | `natural-20-trophy-plinth-c31c9c` (prop) | Plinth bisa jadi alas piala; grafik batang 2D |
| c04 | Name plate Rudy Hartono, siluet smash, kalender 1968–1974, buku rekor | — | Siluet tanpa wajah (2D); `<AssetCharacter>` tidak punya pose smash |
| c05 | Peta Eropa → Barcelona, podium 2 emas, name plate Susi & Alan | `lecturer-s-podium-e77fe6` (prop) | Kurang cocok untuk podium juara; lebih baik podium 2D; peta 2D |
| c06 | Timeline 2002→2021, peta Aarhus, scoreboard 3–0 | `press-box-55553b` (building), `terrace-step-run-b631a9` (building) | Arena malam final; scoreboard HUD 2D |
| c07_payoff | Ruang trofi golden hour (14 · 8 · 2), papan AUDIRA, outro card | `trophy-cabinet-e963ac` (prop), `perimeter-wall-run-adc811` (building) | Papan nama AUDIRA di dinding ruang trofi |

Saran engine: 2D — topiknya angka, timeline, peta, dan name plate tokoh nyata tanpa wajah; katalog GLB tidak punya aset bulu tangkis/trofi, jadi DATAPHYSICAL/BROADCASTFORGE 2D lebih cepat dan lebih terbaca (hybrid R3F hanya bila ruang trofi c07 ingin 3D).
