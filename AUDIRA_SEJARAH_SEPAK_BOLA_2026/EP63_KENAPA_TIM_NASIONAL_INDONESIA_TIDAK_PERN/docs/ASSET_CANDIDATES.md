# Asset Candidates — Kenapa Tim Nasional Indonesia Tidak Pernah Lolos Piala Dunia

Dicari 2026-11-25 lewat `audira_search_assets` (katalog lokal `E:/ASET/ASSET-AUDIRA/downloads/glb/`).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Bola klasik di rumput, gawang | `turf-pitch-tile-aca1ef` (prop), `football-goal-78fee1` (prop) | Bola kulit 1938 belum ada di katalog: buat procedural (sphere + material kulit) |
| c01_intro | Stadion klasik Reims, papan skor, kiper/pemain siluet | `stand-roof-run-cfd457` (building), `goalkeeper-10017a` (character, klip Idle/Run/Cheer), `advertising-hoarding-run-efe4bc` (prop) | Peta Eropa 1938 = layer 2D/HUD; karakter tanpa wajah nyata, tint jersey oranye |
| c02 | Papan taktik bracket kualifikasi 1958 | `training-goal-50f1ca` (prop) | Bracket + cap merah = HUD 2D; tidak pakai bendera/logo resmi |
| c03 | Lapangan retak dua, gembok + rantai di gawang, kalender | `match-goal-a98b60` (prop), `turf-pitch-tile-aca1ef` (prop), `wall-clock-05f8ff` (prop), `office-desk-021eb3` (prop, meja rapat pengurus) | Gembok/rantai belum ada di katalog (belum ditemukan): procedural atau ikon 2D |
| c04 | Stadion malam menyala, tangga putaran 1–4 | `stand-roof-run-cfd457` (building), `bleacher-stand-run-1627c2` (prop), `advertising-hoarding-run-efe4bc` (prop) | Tangga putaran = blok rounded `POLISH`; skor = callout HUD |
| c05 | Stadion tandang redup, papan skor jatuh, bola berhenti di pintu | `goal-net-trolley-f5bd28` (prop), `match-goal-a98b60` (prop), `goalkeeper-10017a` (character, klip Idle) | Lampu sorot redup, grading dingin |
| c06 | Timeline 1957–2025, kursi pelatih kosong | `office-desk-021eb3` (prop), `sit-stand-desk-3ff7b8` (prop) | Kursi/pintu putar: belum dicari spesifik; timeline = HUD 2D |
| c07_payoff | Lorong stadion, gawang megah, pintu raksasa, papan AUDIRA | `stand-roof-run-cfd457` (building), `football-goal-78fee1` (prop), `advertising-hoarding-run-efe4bc` (prop, tulisan AUDIRA) | Name plate "JOHN HERDMAN" teks saja, tanpa wajah; outro card AUDIRA |

Saran engine: hybrid — dunia stadion/gawang 3D R3F (rule 13 sepak bola: Remotion + R3F), dengan layer HUD 2D tebal untuk bracket, timeline, skor, dan peta 1938 (cocok TACTICBOARD/DATAPHYSICAL).
