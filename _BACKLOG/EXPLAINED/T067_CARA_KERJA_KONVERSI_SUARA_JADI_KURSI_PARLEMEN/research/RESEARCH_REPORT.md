# Research Report — Cara Kerja Konversi Suara Jadi Kursi Parlemen

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral politik, tanpa wajah/logo/nama partai nyata di visual dan VO).
> Catatan alat: WebSearch/WebFetch error; riset lewat curl ke JDIH BPK, JDIH KPU, ANTARA (fakta saja, tanpa salin teks), dan Wikipedia API. Situs mkri.id menolak akses otomatis (HTTP 403), jadi teks putusan MK belum dibaca langsung.

## Sumber utama

- **UU 7/2017 tentang Pemilu** (teks resmi PDF via JDIH BPK): Pasal 186–187 (kursi & dapil DPR), Pasal 414 (ambang batas), Pasal 415 (Sainte-Laguë) (#1, #2, #3).
- **Perppu 1/2022** (ditetapkan jadi UU 7/2023): kursi DPR 580 (#4).
- **Halaman status JDIH BPK** UU 7/2017: masih berlaku, hanya diubah UU 7/2023 (#5).
- **Keputusan KPU 1050/2024 Lampiran II**: suara sah partai ditetapkan per dapil DPR (#6).
- Pendukung MEDIUM: ANTARA soal Putusan MK 116/PUU-XXI/2023, putusan prematur 2026, Panja RUU Pemilu, wacana 5% (#7–#10); Wikipedia hasil Pemilu 2024, Sainte-Laguë, riwayat ambang batas (#11–#13). Contoh hitungan partai fiktif = hitungan sendiri (#14).

## Fakta terverifikasi

1. Kursi DPR berjumlah 580 (Pasal 186 setelah Perppu 1/2022) (#4); dibagi per dapil, tiap dapil 3–10 kursi (#3). Pemilu 2024 memakai 84 dapil (#13, MEDIUM).
2. Ambang batas parlemen 4% suara sah nasional, hanya untuk kursi DPR; untuk DPRD semua partai ikut dihitung (#2).
3. Di tiap dapil, suara partai yang lolos dibagi 1, 3, 5, 7, dan seterusnya (Sainte-Laguë murni), berlaku untuk DPR dan DPRD (#1). Dipakai pertama kali di Pemilu 2019 (#12, MEDIUM).
4. Contoh ilustrasi dapil 6 kursi: A 48.000 / B 30.000 / C 22.000 → A 3, B 2, C 1 (#14, hitungan sendiri).
5. Contoh ilustrasi dua dapil: X total 74.000 suara → 2 kursi; Y total 67.000 → 3 kursi (#14, hitungan sendiri). Inversi ini terjadi karena distribusi suara antar dapil, bukan karena rumus pembaginya.
6. Pemilu DPR 2024: partai peringkat suara ke-4 (16.115.358) dapat 68 kursi, peringkat ke-5 (14.660.328) dapat 69 kursi; peringkat ke-7 (11.283.053) dapat 44 kursi, ke-8 (10.984.639) dapat 48 kursi; peringkat ke-9 (5.878.708) dapat 0 kursi karena di bawah 4% (#11, MEDIUM).
7. Putusan MK 116/PUU-XXI/2023 (29 Februari 2024): 4% konstitusional untuk Pemilu DPR 2024; untuk 2029 dan seterusnya konstitusional bersyarat sepanjang norma dan besarannya diubah pembentuk UU (#7, #8).
8. Per 2 Maret 2026, Pasal 414 ayat (1) belum diubah (MK menyatakan uji baru prematur) (#8). Per 11 November 2026, Panja RUU Pemilu Komisi II DPR baru mulai membahas; belum disahkan (#9). JDIH BPK per 27 November 2026 tidak mencatat perubahan selain UU 7/2023 (#5).

## Perselisihan / Kontroversi

- **Koreksi presisi hook TOPIC.md**: "Partai dengan suara lebih banyak belum tentu dapat kursi lebih banyak" **benar di tingkat nasional** (terjadi dua kali di Pemilu DPR 2024, #11), tetapi **tidak terjadi di dalam satu dapil**: dengan Sainte-Laguë, partai yang suaranya lebih banyak di dapil yang sama selalu mendapat kursi minimal sama banyak (rumusnya monoton). Penyebab inversi nasional = **sebaran suara antar dapil**; untuk partai di bawah 4%, penyebabnya ambang batas (suara jutaan tetap nol kursi). Naskah menegaskan "kursi dibagi per dapil" dan memakai contoh dua dapil fiktif. Hook naskah memakai data nyata 2024 tanpa nama partai.
- **Netral politik**: tidak ada nama partai/calon di VO maupun visual. Data 2024 disebut anonim; bila produser ingin nol risiko identifikasi, hook bisa diganti contoh fiktif saja. Naskah tidak menilai apakah 4% terlalu tinggi/rendah; wacana 5% (#10) dan angka usulan lain tidak disebut di VO.
- **Status regulasi**: Pasal 414–415 masih berlaku per 27 November 2026, tetapi revisi UU Pemilu sedang dibahas DPR (#9). Besaran ambang untuk Pemilu 2029 wajib dirumuskan ulang. Cek ulang sebelum produksi; bila RUU disahkan, c02 dan c06 ditulis ulang.
- **Putusan MK 116/PUU-XXI/2023** baru terverifikasi lewat ANTARA (MEDIUM); teks resmi di mkri.id tidak bisa diakses (403). Baca amar putusan resmi sebelum produksi untuk menaikkan ke HIGH.
- **Data 2024**: angka per partai dari Wikipedia (mengutip Keputusan KPU 1050/1060/2024). Lampiran KPU yang terbuka (#6) hanya terbaca sampai dapil Sulawesi; halaman total nasional berupa gambar. Cocokkan ke rekap resmi KPU sebelum dipakai di HUD.
- **Kursi DPRD**: Sainte-Laguë juga dipakai untuk DPRD, tetapi tanpa ambang batas (#1, #2). Naskah fokus DPR.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 580 kursi | Jumlah kursi DPR (Pasal 186 setelah Perppu 1/2022) | 4 |
| 3–10 kursi | Kursi per dapil DPR | 3 |
| 84 dapil | Dapil DPR Pemilu 2024 | 13 |
| 4% | Ambang batas parlemen, suara sah nasional, DPR saja | 2 |
| ÷1, 3, 5, 7 | Bilangan pembagi Sainte-Laguë (Pasal 415) | 1 |
| +1,45 juta suara → −1 kursi | Peringkat 4 (16.115.358 → 68) vs peringkat 5 (14.660.328 → 69), Pemilu DPR 2024; selisih hitungan sendiri | 11 |
| ±5,9 juta suara → 0 kursi | Partai peringkat 9, Pemilu DPR 2024, di bawah 4% (opsi hook) | 11 |
| A 3 · B 2 · C 1 | ILUSTRASI dapil 6 kursi (48.000/30.000/22.000), hitungan sendiri | 14 |
| X 74.000 → 2 · Y 67.000 → 3 | ILUSTRASI dua dapil, hitungan sendiri | 14 |
| 116/PUU-XXI/2023 | Putusan MK, 29 Feb 2024; ubah ambang batas sebelum 2029 | 7, 8 |
| per Nov 2026 | Revisi UU Pemilu masih di Panja Komisi II DPR | 9 |

## Poin kunci

- Cerita = perjalanan suara melewati dua gerbang: saringan nasional 4%, lalu pembagian per dapil.
- Payoff konsep: kursi bukan cuma soal jumlah suara, tapi di mana suara itu jatuh.
- Visual didominasi angka, tabel, dan peta: cocok 2D data (DATAPHYSICAL/CERDIK). Semua partai di layar fiktif berlabel ILUSTRASI.
- Topik sensitif politik: tetap mekanis dan netral, tanpa menilai partai, lembaga, atau besaran ambang batas.
