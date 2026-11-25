# Asset Candidates — Fakta Brutal di Balik Karier Mike Tyson yang Jarang Diceritakan

Backlog 2026-11-25. Pencarian katalog GLB (audira_search_assets): "boxing ring" tidak menemukan ring tinju (hasil tidak relevan), "courthouse" kosong, "money" hanya `big-six-money-wheel-0f7174` (prop, kit casino). Visual utama perlu dibuat sendiri (ring dari primitif/Blender) atau 2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Siluet petinju generik, sabuk juara retak, HUD umur | belum ada GLB cocok; `AssetCharacter` generik (belum dicari) | Tanpa wajah/logo; sabuk dibuat prosedural |
| c01_intro | Peta Brooklyn 1966, gang, figur remaja + pelatih | belum dicari (karakter generik ber-rig) | Figur dari belakang/siluet |
| c02 | Papan skor KO, karung pasir, sabuk naik | belum ditemukan (heavy bag) | Papan skor = HUD kinetik |
| c03 | Arena malam, ring dari atas, hitungan wasit 1-10 | belum ditemukan (boxing ring) | Ring dibuat prosedural; tanpa logo arena |
| c04 | Palu hakim, gedung pengadilan, kalender 1992 ke 1995 | `courthouse` kosong | Pakai ikon/2D, netral, tanpa wajah |
| c05 | Ring Las Vegas, dua siluet, pelindung gigi jatuh, layar DQ | belum ditemukan | Tanpa logo komisi/sabuk nyata |
| c06 | Uang menyusut jadi grafik, stempel kebangkrutan | `big-six-money-wheel-0f7174` (prop, kurang pas) | Grafik batang + dokumen 2D lebih jelas |
| c07_payoff | Siluet keluar ring, lampu padam, kartu rekor, outro AUDIRA | `audira-outro-card.svg` | Kartu rekor via HUD |

Saran engine: 2D — katalog GLB tidak punya ring/petinju/gedung pengadilan, dan topik bergantung pada siluet, HUD angka, dan grafis data (style kandidat CINESTORY/CHARACTERFLOW/FILM16 sesuai).
