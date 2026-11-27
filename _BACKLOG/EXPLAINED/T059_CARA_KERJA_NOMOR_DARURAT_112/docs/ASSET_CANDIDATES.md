# Asset Candidates — Cara Kerja Nomor Darurat 112

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya ambulans, mobil pemadam, mobil polisi, ponsel, headset, monitor, dan antena. Tidak ada menara BTS seluler, ruang call center utuh, atau peta Indonesia: dibuat 2D/procedural. Semua kendaraan dipakai generik, tanpa logo/tulisan instansi nyata (rule 15).

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Ponsel generik, jari menekan 112, tiga jalur cahaya ke kendaraan darurat | `smartphone-5f05e5` / ultra, `fire-engine-7d476b` / vehicle, `ambulance-van-29919a` / vehicle, `police-cruiser-a2d25e` / vehicle | Hapus/ganti livery bertulisan; HUD "112" |
| c01_intro | Dokumen peraturan, kartu nomor lama melebur jadi 112 | — | 2D (kartu & dokumen generik tanpa lambang); HUD "Permenkominfo 10/2016" |
| c02 | Denyut panggilan: ponsel → antena → kotak wilayah kab/kota → gedung pusat panggilan | `rooftop-antenna-mast-6e4944` / prop, `smartphone-5f05e5` / ultra | Menara BTS tidak ada sebagai GLB, antena atap cukup; peta wilayah 2D; HUD "Gratis" |
| c03 | Ruang kendali: monitor, headset, siluet petugas tanpa wajah, tiket terbelah ke 4 instansi | `computer-bench-run-lit-87d9cf` / prop, `desk-monitor-32cfce` / prop, `call-headset-a95887` / prop, `righthand-item-cf3cdf` / ultra | Siluet tanpa wajah; ikon lucide api/ambulans/perisai/gelombang; HUD "24 jam" |
| c04 | Stopwatch dicoret, mobil pemadam melaju di jalan kota | `fire-engine-7d476b` / vehicle, `fire-hydrant-b68b17` / prop, kit `nyc-city-kit-fbca88` (jalan/gedung) | Hindari papan nama kota nyata; HUD "≤ 7 menit (Surabaya)" |
| c05 | Peta Indonesia: kotak kab/kota menyala vs gelap; kartu 110/113/119; Bali berdenyut | — | Peta 2D generik (batas sederhana, tanpa logo); counter 141 / 514; label "hitungan sendiri" untuk ≈27% |
| c06 | Papan penghitung 2.360, deret ikon telepon abu-abu, 22 menyala | `payphone-stand-f97728` / prop (opsional) | Lebih tajam 2D (waffle/grid 100 ikon); label "hitungan sendiri" untuk ≈1% |
| c07_payoff | Kota malam, panggilan asli tersambung, ambulans berangkat, checklist 3 baris, outro | `ambulance-van-29919a` / vehicle, kit `nyc-city-kit-fbca88` | Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita adalah alur (panggilan → pusat → instansi), peta cakupan, dan angka (141/514, 2.360 → 22) yang paling terbaca sebagai diagram CHAINREACTION/DATAPHYSICAL; kendaraan GLB tersedia untuk sisipan hybrid bila ingin diorama kota URBANFORGE, tetapi ruang call center, menara seluler, dan peta tidak ada di katalog.
