# Research Report — Cara Kerja Sistem Jaminan Kesehatan: Gotong Royong dalam Angka

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo/kartu asli). WebSearch/WebFetch error; riset lewat curl ke JDIH BPK (teks PDF regulasi), Google News RSS, ANTARA (fakta saja, teks tidak disalin), dan Wikipedia API.

## Sumber utama

- **Regulasi (HIGH, dibuka dan dibaca teks PDF-nya di JDIH BPK)**: UU 40/2004 SJSN (#1), Perpres 64/2020 (#2), Perpres 59/2024 (#3), status Perpres 82/2018 (#4), Permenkes 3/2023 standar tarif (#5).
- **Angka terkini (MEDIUM, berita ANTARA yang mengutip BPJS Kesehatan/Kemenkeu)**: jumlah peserta per 1 Nov 2026 (#6), PBI 96,8 juta dan arus kas 2026 (#7, #8), kinerja 2025 dan aset bersih DJS (#9), uji coba KRIS/iDRG (#10), PMK 73/2026 (#11).
- Pendukung MEDIUM: Wikipedia BPJS (#12), hitungan sendiri (#13).

## Fakta terverifikasi

1. Prinsip gotong royong tertulis di UU 40/2004: yang sehat membantu yang sakit, yang mampu membantu yang kurang mampu, risiko rendah membantu risiko tinggi; diwujudkan lewat iuran sesuai penghasilan (#1).
2. Per 1 November 2026, peserta JKN ±285,8 juta jiwa (98,5% penduduk) (#6).
3. ±96,8 juta peserta PBI dibayar APBN (±Rp47 triliun; total anggaran PBI 2026 menjadi Rp67 triliun setelah tambahan Rp20 triliun) (#7, #8). Porsi ≈ 34% (hitungan sendiri, #13).
4. Iuran (Perpres 64/2020, tidak diubah Perpres 59/2024): PBI Rp42.000 dibayar Pemerintah Pusat; PPU 5% gaji (4% pemberi kerja, 1% pekerja, batas atas gaji Rp12 juta); PBPU/BP kelas I Rp150.000, kelas II Rp100.000, kelas III Rp35.000 + Rp7.000 bantuan pemerintah (#2, #3).
5. Semua iuran masuk Dana Jaminan Sosial (DJS) Kesehatan yang dikelola BPJS Kesehatan; aset bersih DJS akhir 2025 Rp30,04 triliun ≈ 1,88 bulan estimasi klaim (#9).
6. FKTP (puskesmas, klinik, dokter praktik) dibayar kapitasi: per peserta terdaftar per bulan, di muka, tanpa melihat jumlah layanan. FKRTL (RS) dibayar INA-CBG: paket per kelompok diagnosis dan prosedur (#5).
7. Tahun 2025: 725,3 juta pemanfaatan layanan (>1,9 juta/hari); 23.770 FKTP dan 3.194 FKRTL mitra (#9).
8. Posisi akhir September 2026: iuran terkumpul Rp118 triliun, manfaat yang harus dibayar Rp132 triliun; pemerintah menambah Rp20 triliun (cair Okt–Nov 2026) lewat mekanisme PMK 73/2026 (#7, #8, #11).
9. KRIS, RBKP, dan iDRG (calon pengganti pengelompokan INA-CBG) masih tahap uji coba per Oktober 2026 (#10).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Iuran *jutaan* peserta yang sehat membiayai pengobatan peserta yang sakit" kurang tepat di dua sisi. (a) Skalanya **ratusan juta**, bukan jutaan (±285,8 juta per 1 Nov 2026, #6). (b) Dananya bukan hanya iuran peserta sehat: ±96,8 juta peserta (≈ sepertiga) iurannya dibayar APBN (#7), sebagian peserta kelas III dibayari Pemda (#2), pekerja formal 4% dari 5% dibayar pemberi kerja (#2), dan pada 2026 iuran terkumpul lebih kecil dari manfaat sehingga ditambal APBN Rp20 triliun (#7, #8). Prinsip "sehat membantu yang sakit" sendiri benar dan tertulis di UU 40/2004 (#1). Hook dikoreksi menjadi "kalau bulan ini kamu sehat, iuranmu sedang ikut membayar pengobatan orang lain", lalu sumber dana lain dijelaskan di c02–c03.
- **Status regulasi iuran**: Perpres 59/2024 mewajibkan iuran, tarif, dan manfaat baru ditetapkan paling lambat 1 Juli 2025 (#3), tetapi per 2026-11-27 JDIH BPK belum mencatat perubahan keempat Perpres 82/2018 (#4) dan KRIS masih diuji coba (#10). Jadi iuran per kelas di naskah = Perpres 64/2020 yang masih berlaku. Beberapa media kecil menulis "kelas 1-2-3 dihapus mulai Agustus 2026"; tidak terverifikasi di sumber resmi, tidak dipakai. Cek ulang JDIH sebelum produksi.
- **Nominal kapitasi**: Permenkes 3/2023 (#5) tercatat berlaku tanpa perubahan di JDIH BPK, tetapi ada judul berita Januari 2026 tentang "Permenkes baru menaikkan kapitasi puskesmas" yang tidak berhasil diverifikasi. Naskah tidak menyebut nominal kapitasi; HUD cukup "per peserta per bulan".
- **Angka arus kas Rp118 T vs Rp132 T** (#7): disampaikan lisan oleh Dirut BPJS Kesehatan dan dikutip ANTARA; diasumsikan posisi kumulatif 2026 sampai akhir September. Ada berita lain (detikHealth, Kontan, Bisnis) soal "defisit DJS 2025 Rp17,13 T" dan "52 juta peserta tidak aktif" yang tidak dibuka, jadi tidak dipakai.
- **Netralitas**: tidak menilai kebijakan iuran, KRIS, maupun suntikan APBN. Visual tabung iuran vs manfaat netral, tanpa ekspresi menyalahkan. BPJS Kesehatan ditulis sebagai teks pada papan, tanpa logo, warna korporat, atau kartu asli.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| UU 40/2004 | Prinsip gotong royong: sehat → sakit, mampu → kurang mampu | 1 |
| ±285,8 juta jiwa | Peserta JKN per 1 Nov 2026 (98,5% penduduk) | 6 |
| 5% = 4% + 1% | Iuran PPU: pemberi kerja + pekerja | 2 |
| 96,8 juta | Peserta PBI dibayar APBN (per Sep 2026) | 7 |
| ≈ 1 dari 3 | Porsi PBI dari total peserta (hitungan sendiri) | 13 |
| Rp42.000 | Iuran PBI per orang per bulan | 2 |
| Rp150.000 / Rp100.000 / Rp35.000 + Rp7.000 | Iuran mandiri kelas I / II / III (per Nov 2026) | 2, 4 |
| Rp30,04 T ≈ 1,88 bulan klaim | Aset bersih DJS Kesehatan akhir 2025 | 9 |
| Kapitasi · INA-CBG | Cara bayar FKTP · FKRTL | 5 |
| 725,3 juta · ±1,9 juta/hari | Pemanfaatan layanan JKN 2025 | 9 |
| Rp118 T vs Rp132 T | Iuran terkumpul vs manfaat (per akhir Sep 2026) | 7 |
| +Rp20 T | Tambahan APBN 2026 untuk BPJS Kesehatan | 7, 8 |

## Poin kunci

- Cerita = satu kolam dana: tiga pipa masuk (pekerja + pemberi kerja, APBN/APBD, peserta mandiri), dua keran keluar (kapitasi ke FKTP, INA-CBG ke RS).
- Payoff visual: kolam yang harus terus diisi; koin dari hook kembali ke penonton.
- Angka peserta, PBI, arus kas, dan iuran cepat basi (iuran bisa berubah begitu Perpres pelaksana KRIS terbit): perbarui saat produksi dan tulis "per <bulan tahun>".
- Rule 15: tanpa wajah orang nyata, tanpa logo BPJS/Kemenkes, tanpa kartu JKN asli; siluet dan ikon generik.
