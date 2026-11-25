# Asset Candidates — Statistik Erling Haaland yang Membuat Semua Striker Merasa Tidak Berguna

Dicari lewat `audira_search_assets` (2026-11-25). Tidak ada GLB trofi atau pemain outfield; trofi dan striker dibuat prosedural/siluet tanpa wajah dan tanpa logo.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Gawang + bola + counter 36 | `match-goal-a98b60` / prop, `match-ball-0e675d` / prop | Kit stadium-5db167; counter = HUD teks kinetik |
| c01_intro | Siluet striker nomor 9 di lapangan | `turf-pitch-tile-aca1ef` / prop, `goalkeeper-10017a` / character (rig, bisa recolor jadi striker generik) | Wajah tidak ditampilkan; jersey biru polos tanpa logo |
| c02 | Kalender Agustus 2022, tumpukan 9 bola, 3 papan skor | `match-ball-0e675d` / prop, `ball-cart-8274fd` / prop | Papan skor = HUD 2D |
| c03 | Grafik batang fisik 34 vs 36 | `turf-pitch-tile-aca1ef` / prop (alas) | Batang = mesh prosedural bergaya DATAPHYSICAL |
| c04 | Counter 52 + tiga trofi di podium | `trophy-cabinet-e963ac` / prop | Trofi GLB tidak ada; trofi generik prosedural, tanpa logo kompetisi |
| c05 | Lintasan lari 111 vs 124, jalur 50/49 | `a-running-track-tile-daf991` / prop | Label "per Des 2025" / "per Sep 2025" |
| c06 | Peta panas lapangan, 8 sentuhan, garis ke gawang | `turf-pitch-tile-aca1ef` / prop, `football-goal-78fee1` / prop | Heatmap = shader/overlay 2D |
| c07_payoff | Stadion malam, dinding statistik, outro | `advertising-hoarding-run-efe4bc` / prop, `match-goal-a98b60` / prop | Papan iklan diisi tulisan AUDIRA (brand di dalam adegan) |

Saran engine: hybrid — Remotion + R3F (rule 13 sepak bola) dengan kit stadion GLB, tetapi inti cerita adalah angka sehingga grafik batang/counter DATAPHYSICAL dan HUD 2D memikul sebagian besar visual.
