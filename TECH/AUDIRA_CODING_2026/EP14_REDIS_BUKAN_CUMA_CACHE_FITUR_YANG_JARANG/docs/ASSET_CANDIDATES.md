# Kandidat Aset — Redis Bukan Cuma Cache: Fitur yang Jarang Developer Tahu

> Dicari via `audira_search_assets` (2026-11-25). Rule 15: tanpa logo Redis/organisasi nyata; nama perintah (LMOVE, INCR, dll.) sebagai teks HUD saja.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Server rack berisi kotak "CACHE" yang terbuka | `small-server-rack-8ae0a4` / prop | Ikon 6 fitur dibuat sebagai HUD/2D |
| c01_intro | Chip RAM, aliran data cepat | — | Tidak ada GLB RAM; buat procedural/2D board + HUD "2009" |
| c02 | Kardus tugas di antrean, worker | `cardboard-delivery-box-59cc68` / prop; `computer-bench-run-lit-87d9cf` / prop | Ban berjalan: rakit dari primitif + kardus GLB |
| c03 | Menara pemancar pesan ke banyak penerima | `rooftop-antenna-mast-6e4944` / prop; `antenna-mast-0954b0` / prop; `field-radio-set-b6f3fd` / prop | Penerima offline = radio lampu mati |
| c04 | Pita log Streams + kelompok worker | `computer-bench-run-lit-87d9cf` / prop | Pita log = HUD/2D bergerak, bukan GLB |
| c05 | Palang gerbang rate limit + counter | `checkpoint-barrier-pole-59c197` / prop; `traffic-cone-33e81e` / prop | Counter 1–10 sebagai HUD kinetik |
| c06 | Leaderboard, peta pin lokasi, wadah 12 KB | `trophy-cabinet-e963ac` / prop; `conductor-s-podium-e53ba7` / prop | Peta & pin: belum ketemu GLB yang cocok, pakai peta 2D |
| c07_payoff | Kamera mundur: semua dari satu server rack | `small-server-rack-8ae0a4` / prop | Outro card AUDIRA |

Saran engine: hybrid — server rack, kardus, antena, palang pakai GLB (R3F), tapi konsep abstrak (log Streams, counter, HyperLogLog, peta) lebih terbaca sebagai diagram/HUD 2D; DEVFORGE 2D juga layak bila ingin render cepat.
