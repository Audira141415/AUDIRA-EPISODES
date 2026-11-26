# Research Report — Cara Kerja Penyedot Debu

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: tanpa wajah orang nyata, tanpa logo/merek penyedot debu nyata, netral).

## Sumber utama

- **NIST (CODATA)**: nilai atmosfer standar 101.325 Pa (#1).
- **NOAA JetStream**: tekanan permukaan laut 1013,25 hPa dan tekanan udara bekerja ke segala arah (#2).
- **U.S. EPA**: definisi HEPA ≥99,97% @0,3 µm (definisi DOE) (#3).
- **Jurnal SV-JME 2018 (Pusan National University, Kyungsung University, LG Electronics R&D)**: tekanan vakum ±13–14 kPa pada kipas penyedot debu ringkas 90.000 rpm (#4).
- Pendukung MEDIUM: Wikipedia en "Suction" (#5), Wikipedia de "Staubsauger" (#6), Wikipedia en "Vacuum cleaner" (#7), Explain that Stuff (#8), Wikipedia en "HEPA" (#9).

## Fakta terverifikasi

1. Tekanan atmosfer standar = 101.325 Pa ≈ 101 kPa = 1013,25 hPa (#1, #2).
2. Tekanan udara bekerja ke segala arah, sehingga dalam keadaan seimbang tidak terasa (#2).
3. Penyedot debu memakai motor + kipas untuk membuang udara dan menurunkan tekanan di sisi isap; udara luar bertekanan normal lalu mengalir masuk (#6, #7, #8).
4. "Isapan" secara fisika = gerak mengikuti gradien tekanan; gaya berasal dari sisi bertekanan tinggi (didorong, bukan ditarik) (#5). Tidak ada vakum mutlak di dalam penyedot debu (#8).
5. Contoh kuantitatif: unit kipas ringkas 90.000 rpm, daya poros ≤350 W, tekanan rata-rata area vakum ≈13,2–14,3 kPa pada aliran ≈10–12 L/s (CFD) (#4). Beda tekanan maksimum perangkat yang baik ±25 kPa, hanya saat aliran tertutup (#6). Jadi beda tekanan tipikal ≈ 13–25% tekanan atmosfer.
6. Debu dipisah lewat kantong berpori (udara lolos, debu tertahan) atau siklon; kantong/filter tersumbat menurunkan aliran udara (#7, #8).
7. HEPA: ≥99,97% partikel 0,3 µm (definisi DOE, dirujuk EPA); 0,3 µm adalah ukuran paling sulit ditangkap; standar Eropa EN 1822 memakai ambang 99,95% (#3, #9). Di penyedot debu, filter hanya efektif bila tidak ada kebocoran udara di sekitarnya (#9).
8. Penyedot debu bertenaga berbasis isapan muncul 1901 (Booth, Inggris) (#7). Tidak dipakai di VO.
9. Cairan termasuk material yang bisa merusak penyedot debu rumahan; untuk itu ada tipe wet/dry khusus (#7).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Bukan menyedot — debu sebenarnya didorong masuk oleh udara di luar" **benar secara fisika tetapi dilebihkan**. (a) Alat itu tetap "menyedot" dalam arti teknis: kipas menurunkan tekanan di dalam; yang keliru adalah anggapan ada gaya *tarik*. (b) Debu tidak didorong langsung oleh tekanan statis atmosfer, melainkan diseret **arus udara** yang mengalir karena beda tekanan (sikat putar juga membantu melepas debu dari karpet). (c) Beda tekanannya kecil, ±13 kPa (#4) sampai ±25 kPa maksimum (#6), bukan "vakum". Hook dikoreksi menjadi: "Penyedot debu sebenarnya tidak menarik debu. Yang mendorong debu masuk justru udara di sekitarmu." (naskah c00), dan c03 menjelaskan bahwa arus udaralah yang menyeret debu.
- **Angka 13 kPa** berasal dari simulasi CFD satu unit kipas ringkas (#4), bukan rata-rata pasar; angka ±25 kPa hanya dari Wikipedia (MEDIUM). VO memakai frasa "satu studi kipas penyedot debu ringkas" agar tidak terdengar sebagai angka umum. Spesifikasi produk berbeda-beda; cari data uji standar (IEC 62885-2 / ASTM) sebelum produksi bila ingin menyebut rentang umum.
- **Rasio "seperdelapan"**: 13 ÷ 101 ≈ 12,9% ≈ 1/8 (hitungan sendiri dari #1 dan #4).
- **HEPA**: 99,97% adalah definisi AS (DOE); Eropa (EN 1822) memakai kelas dengan ambang berbeda. VO menyebut "versi standar Amerika". Banyak produk berlabel "HEPA-like" tidak memenuhi definisi ini (#9).
- **Pesan keselamatan** (cairan, abu panas): larangan cairan didukung #7 (MEDIUM). Larangan abu panas adalah anjuran keselamatan umum (risiko api di kantong/filter); belum ada sumber resmi yang berhasil dibuka (pencarian web error). Cek buku manual pabrikan atau anjuran damkar sebelum produksi; tidak ada angka on-screen terkait.
- **Rule 15**: jangan tampilkan merek/logo penyedot debu nyata (termasuk desain siklon yang mirip merek tertentu); pakai desain generik.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| ±101 kPa | Tekanan atmosfer standar di permukaan laut (101.325 Pa) | 1, 2 |
| ±90.000 rpm | Putaran kipas unit penyedot debu ringkas (contoh studi) | 4 |
| ±13 kPa | Tekanan area vakum kipas penyedot debu ringkas (CFD, 2018) | 4 |
| ≈ 1/8 | 13 ÷ 101 kPa (hitungan turunan) | 1, 4 |
| ≥ 99,97% · 0,3 µm | Definisi filter HEPA (DOE, via EPA) | 3 |

## Poin kunci

- Inti cerita: "isapan" = beda tekanan; udara luar yang bekerja, debu ikut arus.
- Visual payoff: zoom out dari selang ke atmosfer bumi yang "menekan" ke dalam selang.
- Angka kunci hanya tiga (101 kPa, 13 kPa, 99,97% @0,3 µm), semua terdaftar; tidak ada angka yang cepat basi.
- Keselamatan ditaruh singkat di c06, tanpa demonstrasi berbahaya.
