# Asset Candidates — Momen Paling Mengharukan dalam Sejarah Olimpiade yang Bikin Nangis

Dicari lewat `audira_search_assets` (2026-11-25). Katalog tidak punya karakter pelari atletik, tribun stadion besar, atau obor Olimpiade; bagian itu perlu ilustrasi 2D atau dibangun prosedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00 Hook | Lintasan lari merah, pelari jatuh, pria dari tribun | `a-running-track-tile-daf991` (prop), `outfield-player-2b742a` (character, klip Run/Walk) | Karakter pemain bola perlu diganti kostum pelari (singlet + nomor dada). Tanpa wajah nyata. |
| c01 Intro | Stadion malam, papan skor, lampu sorot | `advertising-hoarding-run-efe4bc` (prop), `bleacher-stand-run-1627c2` (prop), `players-tunnel-4a210b` (building) | Tanpa Olympic rings/logo resmi; papan skor teks generik. |
| c02 Riwayat cedera | Meja klinik, gelang pasien/plester x8, jam start Seoul | `casualty-stretcher-965771` (prop) | Gelang, plester, jam start: belum ada, buat 2D/prosedural. |
| c03 Performa terbaik | Pelari melesat, papan waktu digital 45,03 | `a-running-track-tile-daf991` (prop), `athletics-hurdle-164f6f` (prop, set dressing) | Papan waktu = HUD 2D. |
| c04 Hamstring robek | Diagram otot paha belakang, tandu | `touchline-stretcher-f08e97` (prop) | Diagram otot = ilustrasi 2D (anatomi generik). |
| c05 Ayah dari tribun | Tribun penonton, tangga, petugas berompi, rangkulan | `bleacher-stand-run-1627c2` (prop), `outfield-player-2b742a` (character, klip Walk) | Pose rangkul tidak ada di klip; perlu pose kustom atau 2D siluet. |
| c06 Finis + DNF | Garis finis, penonton berdiri (Cheer), papan hasil DNF | `a-running-track-tile-daf991` (prop), `outfield-player-2b742a` (character, klip Cheer, instanced untuk penonton) | Counter 65.000 + stempel DNF = HUD. |
| c07 Payoff | Obor di jalan London, kartu memoriam, hero shot golden hour | `pitch-torch-79d752` (prop) | Obor Olimpiade asli tidak ada; pitch torch hanya pengganti kasar, lebih baik ilustrasi 2D. |

Saran engine: 2D — kisah ini bertumpu pada emosi dua tokoh dan pose rangkul yang tidak ada di klip GLB; siluet sinematik 2D (CINESTORY/FILM16) lebih terbaca dan aman tanpa wajah nyata, dengan HUD angka untuk data.
