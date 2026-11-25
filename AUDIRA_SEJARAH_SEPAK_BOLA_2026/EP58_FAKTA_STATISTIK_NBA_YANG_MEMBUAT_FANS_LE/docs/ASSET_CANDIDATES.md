# Asset Candidates — Fakta Statistik NBA yang Membuat Fans LeBron James Terdiam

> Dicari via `audira_search_assets` (2026-11-25). Katalog tidak punya model khusus basket arena NBA, bola basket, atau trofi Larry O'Brien; sebagian harus dibuat prosedural (bola, menara data) atau 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Papan skor arena, kotak trofi kosong | `match-scoreboard-58f51e` / prop · `trophy-cabinet-e963ac` / prop | Scoreboard dari kit stadium (sepak bola), ganti tekstur layar ke angka basket |
| c01_intro | Siluet pemain no. 23 keluar terowongan, ring basket | `outfield-player-2b742a` / character (clip Walk) · `basketball-backboard-2624e9` / prop | Karakter tanpa wajah nyata, jersey generik tanpa logo tim/NBA |
| c02 | Menara poin 43.672 vs 38.387, papan skor malam 7 Feb 2023 | `match-scoreboard-58f51e` / prop | Menara bola = instanced sphere bertekstur basket (prosedural); bukan Points |
| c03 | Lemari trofi, satu plakat top skor 2007–08 | `trophy-cabinet-e963ac` / prop · `natural-20-trophy-plinth-c31c9c` / prop | Plinth bergaya fantasi, retekstur ke emas polos |
| c04 | Arena gelap, grafik jatuh, pemain berlutut | `basketball-backboard-2624e9` / prop · `outfield-player-2b742a` / character (Idle) | Pose berlutut tidak tersedia: pakai Idle + kamera rendah, atau `<ToyPerson>` |
| c05 | Konfeti, trofi turun, kartu statistik MVP | `trophy-cabinet-e963ac` / prop · `outfield-player-2b742a` / character (Cheer) | Trofi Final: model prosedural/2D (belum ada di katalog) |
| c06 | 10 bola (4 emas, 6 retak), layar terbelah dua kubu | `driveway-basketball-hoop-40deb7` / prop · `teen-player-37865e` / character (Cheer) | Kerumunan siluet: instance karakter, warna flat |
| c07_payoff | Timeline 24 musim jadi menara bata, golden hour, outro | `yard-basketball-post-b71ee3` / prop · `advertising-hoarding-run-efe4bc` / prop | Papan iklan untuk label "AUDIRA" di dalam adegan (anti-reupload lapis 2) |

Saran engine: 2D — topik murni data/statistik (angka, grafik, rekor seri), cocok DATAPHYSICAL/kinetic HUD; aset GLB basket di katalog minim (tidak ada bola, arena, trofi NBA), jadi 3D penuh akan terlihat generik. Opsi hybrid bila ingin papan skor + lemari trofi 3D sebagai panggung data.
