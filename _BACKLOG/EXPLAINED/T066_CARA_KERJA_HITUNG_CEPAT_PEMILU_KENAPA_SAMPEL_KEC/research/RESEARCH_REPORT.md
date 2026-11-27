# Research Report — Cara Kerja Hitung Cepat Pemilu: Kenapa Sampel Kecil Bisa Akurat

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral politik, tanpa wajah/logo nyata). Tanpa nama calon, partai, atau lembaga survei; tanpa angka hasil pemilu nyata.

## Sumber utama

- **Regulasi (JDIH BPK, dibuka dan dibaca)**: UU 7/2017 Pasal 448, 449, 540 (#1, #2); status UU 7/2017 dan perubahannya (#3, #4); PKPU 9/2022 tentang Partisipasi Masyarakat (#5).
- **Statistik**: OpenStax Introductory Statistics 2e, bab 8.3 (#6); buku panduan hitung cepat NDI 2002, bab 5 (#7).
- **Berita (MEDIUM)**: ANTARA soal putusan MK 2019 dan 2014, jumlah TPS 2024, lembaga terdaftar 2024 (#8–#11). Dipakai sebatas fakta, teks tidak disalin.
- **Pendukung MEDIUM**: Wikipedia (Pemilu 2024, Margin of error, Design effect, Hitung cepat) (#12–#14, #16); The Conversation 2014 (#15).
- **Hitungan sendiri** (#17): galat untuk n = 1.000 / 2.000 / 4.000, rasio sampel TPS, dan contoh "52% ± 1" (ILUSTRASI).

## Fakta terverifikasi

1. Hitung cepat adalah bentuk partisipasi masyarakat yang diakui UU Pemilu, dengan syarat tidak berpihak (#1).
2. Unit sampelnya TPS, bukan orang. Tim mencatat hasil hitung resmi di TPS yang terpilih secara acak (#7, #15, #16).
3. Galat 95% untuk proporsi ≈ 1,96 × √(p(1−p)/n) (#6, #7). Hitungan sendiri: n = 1.000 → ±3,1%; n = 4.000 → ±1,5% (#17).
4. Besar sampel ditentukan oleh keragaman pilihan dan target galat, bukan oleh jumlah penduduk, selama fraksi sampelnya kecil (#7, #13).
5. Sampel klaster (TPS) punya efek desain: galat lebih besar daripada sampel acak sederhana dengan jumlah suara yang sama (#14). Praktiknya memakai sampel acak berstrata per wilayah (#7).
6. Pelaksana wajib terdaftar di KPU paling lambat 30 hari sebelum pemungutan, wajib membuka sumber dana dan metodologi, wajib menyatakan hasilnya bukan hasil resmi, dan baru boleh mengumumkan paling cepat 2 jam setelah pemungutan suara di wilayah Indonesia bagian barat selesai (#1, #5). Pelanggaran diancam pidana paling lama 1 tahun 6 bulan dan denda paling banyak Rp18 juta (#2).
7. MK menolak uji materi atas aturan 2 jam pada 16 April 2019, sehingga publikasi baru mulai pukul 15.00 WIB (#8). Sebelumnya, MK 2014 membatalkan larangan serupa di UU 8/2012 (#9).
8. Pemilu 2024: 820.161 TPS dalam negeri (#10); DPT final 204.807.222 pemilih di 823.220 TPS termasuk luar negeri (#12). Sebanyak 81 lembaga terdaftar per 6 Februari 2024 (#11).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Ribuan TPS sampel bisa memperkirakan hasil jutaan suara" benar secara statistik, tetapi hanya bila (a) TPS dipilih acak, umumnya berstrata, (b) data tiap TPS dicatat jujur, dan (c) hasilnya dibaca sebagai rentang (± margin of error, kepercayaan 95%), bukan angka pasti. Hitung cepat bukan hasil resmi; hasil resmi adalah rekapitulasi KPU (#1, #5). Naskah memakai kata "mendekati" dan menutup dengan "perkiraan, bukan kepastian".
- **Judul "Kenapa Sampel Kecil Bisa Akurat"** agak melebih-lebihkan. Usulan: "Cara Kerja Hitung Cepat Pemilu: Kenapa Sampel Kecil Bisa Mendekati Hasil Resmi".
- **Tidak semua hitung cepat sama kredibelnya**: hasil yang andal butuh sampel acak, metodologi terbuka, dan pendaftaran di KPU. Rule 15: video tidak menyebut atau menilai lembaga, calon, maupun hasil pemilu tertentu. Contoh angka di layar hanya "Pilihan A 52% ± 1" berlabel ILUSTRASI.
- **Angka galat lembaga nyata** (sering diklaim sekitar ±1% untuk 2.000–4.000 TPS) bergantung pada desain dan korelasi intra-TPS. Tidak ada sumber resmi yang dibuka, jadi tidak dipakai di VO. Batas atas konservatif hitungan sendiri: 2.000 TPS → paling lebar ±2,2% (#17). Contoh pakar 2014: 2.400 TPS ≈ ±2% (#15, MEDIUM).
- **Jumlah TPS**: 820.161 (dalam negeri, ANTARA) vs 823.220 (total termasuk luar negeri, Wikipedia). VO cukup menyebut "delapan ratus ribu lebih". HUD memakai 820.161 dengan catatan "dalam negeri, Pemilu 2024".
- **Nomor putusan MK 2019**: artikel ANTARA (#8) tidak menyebut nomor perkara, dan situs MK diblokir pemeriksaan Cloudflare (tidak dilewati). Nomor perkara belum dicantumkan; cek di mkri.id sebelum produksi bila akan ditampilkan.
- **Status regulasi**: UU 7/2017 masih "Berlaku" per 2026-11-27. Perubahan lewat Perppu 1/2022/UU 7/2023 tidak menyentuh Pasal 449 dan 540 (#3, #4). PKPU 9/2022 "Berlaku" (#5). Teks UU 7/2023 sendiri tidak dibuka (yang dibuka teks Perppu 1/2022 yang ditetapkannya). Perlu dicek ulang sebelum produksi bila ada revisi UU Pemilu atau PKPU baru menjelang pemilu berikutnya.
- **Jam pemungutan suara**: "pukul 15.00 WIB" berasal dari ANTARA 2019 (#8), bukan teks peraturan. VO tidak menyebut jam; jam hanya muncul di visual c06.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 820.161 TPS | TPS dalam negeri Pemilu 2024 | 10 |
| 0,24% | Contoh 2.000 TPS dari 820.161 (hitungan sendiri) | 17 |
| 1,96 × √(p(1−p)/n) | Rumus galat 95% | 6, 7 |
| ±3,1% · ±1,5% | Galat n = 1.000 vs 4.000 (hitungan sendiri) | 17 |
| Unit sampel = TPS | Dasar hitung cepat | 7, 15 |
| Deff = 1 + (m−1)ρ | Efek desain klaster | 14 |
| 2 jam / 15.00 WIB | Batas paling cepat pengumuman | 1, 5, 8 |
| Pasal 449 UU 7/2017 | Dasar hukum hitung cepat | 1 |
| "BUKAN HASIL RESMI" | Kewajiban pernyataan | 1, 5 |
| 52% ± 1 → 51–53 | ILUSTRASI cara membaca hasil | 17 |

## Poin kunci

- Cerita = undian acak + rumus + jebakan klaster + aturan main. Analogi sup sebagai jangkar visual.
- Payoff: cara membaca "± galat" sebagai rentang, bukan angka pasti.
- Netral: tanpa nama, warna, atau simbol partai/calon/lembaga; semua angka hasil berlabel ILUSTRASI; rumus dan contoh hitung diberi label "hitungan sendiri".
- Angka awet kecuali jumlah TPS (berubah tiap pemilu) dan regulasi (cek revisi UU Pemilu/PKPU).
