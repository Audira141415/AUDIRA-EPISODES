# Asset Candidates — Perjalanan Sebuah Undang-Undang dari Usulan sampai Berlaku

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya meja kantor, lemari arsip, podium, buku, dan map dokumen. Tidak ada gedung parlemen, ruang sidang setengah lingkaran, jam pasir, atau stempel: itu dibuat 2D. Rule 15: tanpa wajah nyata, tanpa lambang negara/logo lembaga; gedung hanya siluet generik.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Map "RUU" meluncur di atas 5 meja, stempel "DISETUJUI", lampu merah di ujung lorong | `office-desk-021eb3` / prop, `righthand-item-410036` / ultra (Document Case) | Stempel dan lampu 2D; HUD "Disetujui ≠ berlaku" |
| c01_intro | 5 meja menyala berlabel tahap | `office-desk-021eb3` / prop, `faculty-office-desk-a6575a` / prop | Label teks 2D; HUD "5 tahap" |
| c02 | Papan antrean kartu RUU, kalender 5 tahun | `filing-cabinet-f8a251` / prop, `wall-cabinet-run-cc0425` / prop | Kartu dan kalender 2D; judul RUU generik, bukan nyata |
| c03 | Tiga pintu DPR/Presiden/DPD, map bertema daerah, bundel naskah akademik | `lefthand-item-30f012` / ultra (Hardback Book), `exercise-book-stack-266d9d` / prop | Pintu berlabel teks saja, tanpa logo; peta pulau 2D |
| c04 | Ruang rapat kursi kosong, lembar pasal terbang; ruang paripurna generik, lampu hijau | `bench-desk-module-23c16f` / prop, `lecturer-s-podium-e77fe6` / prop | Siluet tanpa wajah; ruang setengah lingkaran 2D, bukan replika gedung nyata |
| c05 | Kurir map, kalender 7 hari, jam pasir 30 hari, cap "SAH" | `righthand-item-410036` / ultra (Document Case), `office-desk-021eb3` / prop | Jam pasir dan cap 2D; kartu teks "UU No. 2 Tahun 2018" tanpa wajah/nama pejabat |
| c06 | Buku besar "Lembaran Negara", gelombang cahaya ke peta kota, tangga gedung bertiang + timbangan | `core-rulebook-4aedc7` / prop, `alcove-bookcase-83894d` / prop | Gedung MK = siluet bertiang generik berlabel teks; tanpa logo MK/Garuda |
| c07_payoff | Lorong 5 meja, lampu hijau, buku UU terbuka, outro AUDIRA | `office-desk-021eb3` / prop, `lefthand-item-30f012` / ultra | Outro card `audira-outro-card.svg` |

Saran engine: 2D — topik prosedural tanpa objek fisik khas (gedung nyata tidak boleh tampil detail; katalog tidak punya ruang sidang, jam pasir, atau stempel); metafora "lorong lima meja" dan kartu HUD lebih terbaca sebagai papercraft/diagram 2D (PAPERWORLD atau CHAINREACTION).
