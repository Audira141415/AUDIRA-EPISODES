# Asset Candidates — Cara Kerja Sidang Pidana: Siapa Melakukan Apa

> Dicari via `audira_search_assets` (2026-11-27). Katalog tidak punya kit ruang sidang: tidak ada meja hakim, palu, toga, atau kursi terdakwa. Yang ada hanya furnitur kantor/kampus generik, tumpukan kertas, koper dokumen, dan karakter kantor ber-rig. Rule 15: tanpa wajah nyata, tanpa lambang pengadilan/kejaksaan/organisasi advokat, tanpa kasus nyata.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Papan nama meja "PENGACARA" dicoret jadi "ADVOKAT" | `office-desk-021eb3` / prop | Papan nama dan coretan dibuat 2D (tipografi kinetik); siluet tanpa wajah |
| c01_intro | Kalender "2 JAN 2026", buku "1981" keluar, buku "UU 20/2025" masuk | `exercise-book-stack-266d9d` / prop, `paper-stack-713359` / prop | Sampul buku teks polos, tanpa lambang negara |
| c02 | Denah ruang sidang top-down: majelis 3 kursi, panitera, jaksa, advokat, terdakwa | `boardroom-table-d5d666` / prop, `meeting-chair-731ce0` / prop, `bench-desk-module-23c16f` / prop, `seated-office-worker-854671` / character, `standing-worker-on-a-8a0f9a` / character | Denah 2D isometrik lebih terbaca dari 3D; toga dan meja hakim harus digambar sendiri, tanpa lambang |
| c03 | Pintu "terbuka untuk umum", gulungan surat dakwaan, tameng "PERLAWANAN", panah cabang | `paper-stack-713359` / prop, `demountable-partition-run-cc608c` / building | Diagram cabang 2D; label kecil "(eksepsi)" sebagai istilah praktik |
| c04 | Kartu alat bukti berjatuhan: saksi, ahli, surat, terdakwa, barang bukti, file elektronik | `righthand-item-410036` / ultra (Document Case), `briefcase-fbb052` / ultra | Kartu ikon 2D (lucide: user, graduation-cap, file-text, package, hard-drive); HUD "8 jenis alat bukti" menunggu status uji MK |
| c05 | Ping-pong balon dialog tuntutan ↔ pembelaan, "giliran terakhir" | `lecturer-s-podium-e77fe6` / prop | Balon dialog 2D; tidak perlu GLB |
| c06 | Ruang musyawarah tertutup, diagram suara, tangga PN → banding (7 hari) → kasasi (14 hari) | `meeting-chair-731ce0` / prop, `boardroom-table-d5d666` / prop | Tangga dan bangunan generik 2D, tanpa nama dan logo lembaga |
| c07_payoff | Denah utuh, lima posisi menyala dengan kata kerja; outro AUDIRA | — | Reuse denah c02; outro card `audira-outro-card.svg` |

Saran engine: 2D — topik prosedural/diagram (denah, alur, cabang, tangga upaya hukum), katalog tidak punya aset ruang sidang, dan rule 15 lebih aman dengan ilustrasi flat tanpa wajah. CERDIK atau CHAINREACTION (alur sebab-akibat) cocok; PAPERWORLD bila ingin papan permainan berlapis.
