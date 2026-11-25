# Asset Candidates — Rekor Steph Curry yang Membuktikan Tinggi Badan Bukan Segalanya

Dicari lewat `audira_search_assets` (2026-11-25). Katalog tidak punya model bola basket, lapangan basket, atau cincin juara; sebagian harus dibuat prosedural/2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Siluet pemain #30, penggaris tinggi, ring basket | `outfield-player-2b742a` / character; `basketball-backboard-2624e9` / prop | Karakter generik tanpa wajah asli Curry; ganti kostum ke jersey generik nomor 30 tanpa logo. Penggaris 188 cm dibuat 2D/HUD. |
| c01_intro | Lapangan SMA 2006, timbangan, surat beasiswa ditolak | `teen-player-37865e` / character; `driveway-basketball-hoop-40deb7` / prop; `school-wall-module-a09ccd` / building | Timbangan dan surat dibuat 2D. Tanpa logo Virginia Tech. |
| c02 | Aula kampus kecil, papan skor "162", panggung draf "#7 · 2009" | `school-floor-tile-2da3a7` / prop; `match-scoreboard-58f51e` / prop | Panggung draf cukup kartu HUD; tanpa logo NBA. |
| c03 | Grafik batang tripoin naik ke 402, klasemen 73 menang, badge MVP bulat | — (2D data viz) | Infografis kinetik, paling cocok DATAPHYSICAL. |
| c04 | Lemari trofi, 4 cincin berlabel tahun | `trophy-cabinet-e963ac` / prop | Cincin juara tidak ada di katalog: buat prosedural (torus + permata) atau ilustrasi 2D. |
| c05 | Arena malam, penghitung 2.974, lalu 4.000 | `match-scoreboard-58f51e` / prop; `advertising-hoarding-run-efe4bc` / prop | Hoarding dikosongkan dari brand nyata; bisa diisi tulisan AUDIRA (brand di dalam adegan). |
| c06 | Diagram lapangan dari atas, busur tiga angka, peta panas | — (2D diagram) | Lapangan basket tidak ada di katalog; gambar sebagai diagram vektor. |
| c07_payoff | Siluet 188 cm di depan dinding angka, bola masuk, outro card | `outfield-player-2b742a` / character (clip Cheer); `basketball-backboard-2624e9` / prop | Outro card `audira-outro-card.svg`. |

Saran engine: 2D — topik penuh angka dan rekor (402, 2.974, 4.000) paling kuat sebagai infografis kinetik DATAPHYSICAL/CHARACTERFLOW, dan katalog GLB minim aset basket (tanpa bola, lapangan, cincin).
