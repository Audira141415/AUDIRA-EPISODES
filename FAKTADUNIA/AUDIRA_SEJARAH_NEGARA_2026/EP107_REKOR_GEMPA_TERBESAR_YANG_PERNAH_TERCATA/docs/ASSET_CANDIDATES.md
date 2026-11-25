# Asset Candidates — Rekor Gempa Terbesar yang Pernah Tercatat Manusia

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Peta Chili, ikon gempa, HUD 9,5 dan 10 menit | tidak ada GLB | vektor peta 2D |
| c01_intro | Kota pesisir siang hari retak | brick-tenement-7d2014 / building; brownstone-row-house-1b84fd / building | kit NYC, gaya tak cocok Chili, perlu retekstur |
| c02 | Penampang lempeng Nazca menyusup | tidak ada GLB | geometri prosedural atau diagram 2D |
| c03 | Rumah kayu dan dermaga diterjang gelombang 25 m | tidak ditemukan (query "wave" hanya microwave/wavemaker) | air via shader, rumah kayu belum ditemukan |
| c04 | Globe Pasifik, gelombang ke Hilo | tidak ada GLB globe | globe prosedural |
| c05 | Peta Honshu, rumah tersapu | tidak ada GLB | peta 2D + rumah generik |
| c06 | Warga lari ke bukit, tanpa wajah nyata | commuter-381e7f / character (klip Run) | ber-rig, aman rule 15 |
| c07_payoff | Bar peringkat gempa, outro AUDIRA | tidak ada GLB | HUD 2D |

Pencarian GLB via audira_search_assets: topik gempa/tsunami hanya memetakan ke kit kota NYC. Kebutuhan lain belum dicari lebih jauh.

Saran engine: hybrid — peta, penampang, dan data gelombang tidak punya GLB yang pas; 2D (HISTORYMAP) untuk peta, tsunami dan globe prosedural 3D.
