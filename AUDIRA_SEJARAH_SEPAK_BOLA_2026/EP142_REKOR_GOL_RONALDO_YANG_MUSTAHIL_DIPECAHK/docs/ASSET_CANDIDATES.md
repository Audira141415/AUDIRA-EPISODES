# Asset Candidates — Rekor Gol Ronaldo yang Mustahil Dipecahkan dalam 50 Tahun

> Dicari 2026-11-25 lewat `audira_search_assets` (katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/`). Kit utama: `stadium-5db167`.
> Tanpa wajah/foto pemain asli dan tanpa logo klub: pakai karakter generik bernomor punggung 7 / 10.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Papan skor stadion malam, bola ke jaring | `match-scoreboard-58f51e` (prop), `match-goal-a98b60` (prop), `match-ball-0e675d` (prop), `floodlight-mast-4482be` (prop), `grandstand-seating-run-fc9023` (building) | Digit 987 = teks/HUD di layar papan skor, bukan tekstur GLB |
| c01_intro | Titik penalti, penendang nomor 7 | `outfield-player-2b742a` (character, clip Run/Cheer), `goalkeeper-10017a` (character), `turf-pitch-tile-aca1ef` (prop), `football-goal-78fee1` (prop) | Ganti warna jersey via material; tanpa wajah asli |
| c02 | Rute klub di peta Eropa → Riyadh, bar liga/kontinental | belum ada GLB peta; HUD/2D map overlay | Nama klub teks saja, tanpa logo; pertimbangkan `remotion-maps` |
| c03 | Menara 146 bola, kursi stadion, 6 trofi, ban kapten | `match-ball-0e675d` (prop, di-instance 146×), `grandstand-seating-run-fc9023` (building), `trophy-cabinet-e963ac` (prop) | Trofi Piala Dunia tidak ada di katalog: siluet 2D/HUD |
| c04 | Dua menara bola 987 vs 937, gauge efisiensi | `match-ball-0e675d` (prop), `ball-cart-8274fd` (prop), `outfield-player-2b742a` (character, dua warna) | Bar data 3D (DATAPHYSICAL) |
| c05 | Museum, dua patung legenda tanpa wajah | `founder-s-statue-71c269` (prop), `cathedral-statue-base` (character) | Plakat nama teks; stempel "termasuk laga persahabatan" HUD |
| c06 | Tangga 25 musim, striker muda naik, gunung tiket laga | `outfield-player-2b742a` (character, clip Walk/Run), `a-running-track-tile-daf991` (prop) | Anak tangga = geometri bergaya (bukan visual utama), kalkulator HUD |
| c07_payoff | Kembali ke papan skor, hitung mundur 13, lampu sorot, papan AUDIRA | `match-scoreboard-58f51e` (prop), `floodlight-mast-4482be` (prop), `advertising-hoarding-run-efe4bc` (prop, tulisan AUDIRA), `players-tunnel-4a210b` (building) | Brand di dalam adegan via papan iklan |

Saran engine: hybrid — rule 13 (sepak bola) mewajibkan Remotion + R3F, jadi stadion, bola, dan karakter dibuat 3D dari kit `stadium-5db167`, sementara angka (987, 937, 50, 13) dibawa lapisan HUD/data 2D; kandidat style 2D di TOPIC.md perlu ditinjau ulang terhadap rule 13 (DATAPHYSICAL tetap cocok sebagai resep data 3D).
