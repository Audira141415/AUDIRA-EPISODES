# Asset Candidates — Cara Kerja Rekomendasi Netflix: Kenapa Susah Berhenti Nonton

> Dicari via `audira_search_assets` (2026-11-25). Katalog tidak punya popcorn, poster, atau kantong uang khusus; elemen itu dibuat 2D/HUD.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | TV + deretan poster siluet | `flat-screen-television-97b1f3` / prop | Poster = kartu 2D generik, tanpa logo Netflix asli |
| c01_intro | Ruang mesin: rak server, monitor | `small-server-rack-8ae0a4` / prop; `computer-bench-run-lit-87d9cf` / prop | Sabuk kartu judul = HUD/2D |
| c02 | Trofi, uang hadiah, papan skor | `trophy-cabinet-e963ac` / prop; `coin-hoard-heap-07b6e4` / prop | Angka 2006, US$1 juta, 100 juta rating, 10,06% = callout HUD |
| c03 | Lemari arsip/laci, timbangan | belum ada hasil spesifik | Timbangan + roda gigi bisa 2D diagram |
| c04 | Penonton di sofa, remote, ponsel | `sofa-9c0e7e` / prop; `smartphone-5f05e5` / ultra; karakter `<AssetCharacter>` clip Idle | Ikon jejak (jam, perangkat) = HUD 2D; ikon umur/gender dicoret |
| c05 | Peta titik komunitas selera | — | Data viz 2D (cluster titik), callout "±2.000" |
| c06 | Poster berputar 2 sisi, bar progres autoplay | `flat-screen-television-97b1f3` / prop | Poster siluet tanpa wajah aktor nyata (Good Will Hunting hanya disebut, tidak digambar wajahnya) |
| c07_payoff | Ruang tamu, menu setelan, sakelar OFF, papan neon AUDIRA | `sofa-9c0e7e` / prop; `lounge-sofa-c34b3e` / prop | UI setelan = mock 2D netral, bukan screenshot Netflix |

Saran engine: hybrid — inti cerita adalah UI, data, dan angka (cocok 2D DATAPHYSICAL/DEVFORGE), dengan set 3D ringan (TV, sofa, rak server) untuk ruang tamu dan ruang mesin.
