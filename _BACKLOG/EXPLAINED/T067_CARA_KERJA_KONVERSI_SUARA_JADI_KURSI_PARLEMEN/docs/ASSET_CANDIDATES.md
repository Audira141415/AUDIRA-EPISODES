# Asset Candidates — Cara Kerja Konversi Suara Jadi Kursi Parlemen

> Dicari via `audira_search_assets` (2026-11-27). Katalog tidak punya kotak suara, gedung parlemen, atau ruang sidang setengah lingkaran; yang ada kursi rapat, podium, dan gedung klasik generik. Topik ini dominan angka, tabel, dan peta, jadi sebagian besar visual dibuat 2D. Rule 15: tanpa gedung DPR/MK asli, logo lembaga, atau nama/lambang partai.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Dua tumpukan koin suara netral + barisan kursi 68 vs 69 | `meeting-chair-731ce0` / prop | Koin/kursi bisa ikon 2D; tanpa warna atau nama partai nyata. HUD "+1,45 juta suara → −1 kursi" |
| c01_intro | Peta Indonesia generik pecah jadi petak dapil, deret kursi 3–10 | `meeting-chair-731ce0` / prop | Peta 2D (batas generik); HUD "580 kursi DPR", "3–10 kursi per dapil" |
| c02 | Saringan/corong 4%, bola suara memantul | — | Tidak ada GLB corong; 2D. Chip "DPRD: tanpa ambang batas" |
| c03 | Papan hitung ÷1 ÷3 ÷5 ÷7 | `lecturer-s-podium-e77fe6` / prop | Papan tulis/kalkulator 2D lebih terbaca; teks kinetik angka |
| c04 | Tabel hasil bagi Partai A/B/C → kursi | `meeting-chair-731ce0` / prop | Label "ILUSTRASI" wajib; enam sel menyala berurutan |
| c05 | Dua dapil berdampingan, suara X tumpah, papan total | — | Infografis 2D; "X 74.000 → 2 kursi" vs "Y 67.000 → 3 kursi" |
| c06 | Palu sidang generik, berkas putusan, timeline 2024 → 2029 | `classical-bank-04954e` / building (gedung klasik generik, opsional) | Jangan memakai gedung MK/DPR asli atau logo; stempel "per Nov 2026" |
| c07_payoff | Koin suara jatuh ke petak dapil → kursi mengisi setengah lingkaran parlemen generik | `meeting-chair-731ce0` / prop | Setengah lingkaran 2D/instanced; outro card `audira-outro-card.svg` |

Saran engine: 2D — isi utamanya rumus, tabel, peta dapil, dan angka (cocok DATAPHYSICAL/CERDIK); katalog GLB tidak punya kotak suara atau ruang parlemen, dan 3D tidak menambah kejelasan untuk topik hitungan.
