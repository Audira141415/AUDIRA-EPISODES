# Asset Candidates — Kenapa Otak Manusia Bisa Menipu Dirinya Sendiri

> Dicari 2026-11-25 lewat `audira_search_assets`. Katalog tidak punya model anatomi otak/mata atau gorila; bagian itu perlu dibuat (prosedural, Blender, atau ilustrasi 2D).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Bola mata close-up yang melompat | — | Tidak ada GLB mata anatomi. Buat bola mata prosedural (sphere + iris shader) atau ilustrasi 2D |
| c01_intro | Gunung es, permukaan air, siluet otak "mengedit" | `projection-screen-8355f3` (prop) | Gunung es & otak dibuat sendiri; layar proyeksi untuk timeline "editan" |
| c02 | Cutaway mata: retina, saraf optik, bintik buta | — | Diagram anatomi 2D berlapis lebih jelas daripada 3D low-poly |
| c03 | Kelopak sebagai rana, jalanan kota siang/gelap | `fisheye-camcorder-6a3d64` (prop) | Rana/kelopak dibuat sendiri; kota bisa dari kit building umum (belum dicari detail) |
| c04 | Lapangan basket, pemain mengoper, sosok gorila | `basketball-backboard-2624e9` (prop), `driveway-basketball-hoop-40deb7` (prop), `outfield-player-2b742a` (character, klip Idle/Walk/Run/Wave/Point/Cheer), `teen-player-37865e` (character) | Tidak ada GLB gorila: pakai karakter berkostum gelap (recolor) atau ilustrasi 2D. Klip `Cheer` bisa jadi gerak "menepuk dada" |
| c05 | Meja eksperimen, dua kartu foto wajah, tangan menukar | `framed-wall-art-d2c8a2` (prop), `desk-monitor-32cfce` (prop) | Wajah di kartu harus ilustrasi, bukan foto orang nyata |
| c06 | Otak transparan sebagai mesin prediksi, panah data | `flat-screen-television-97b1f3` (prop) | Otak dibuat sendiri (jangan pakai `brain-coral-head-7db21a`, itu karang laut) |
| c07_payoff | Mundur dari mata, dunia dari puzzle, logo AUDIRA | — | Puzzle prosedural + outro card `audira-outro-card.svg` |

Saran engine: hybrid — inti topik adalah anatomi mata/otak dan diagram persepsi yang tidak ada di katalog GLB dan lebih terbaca sebagai ilustrasi 2D (BEDAH), sementara adegan gorila-basket dan meja eksperimen bisa memakai GLB karakter/prop 3D.
