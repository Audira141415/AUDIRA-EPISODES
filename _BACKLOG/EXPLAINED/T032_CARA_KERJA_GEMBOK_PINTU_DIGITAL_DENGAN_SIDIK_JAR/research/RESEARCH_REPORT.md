# Research Report — Cara Kerja Gembok Pintu Digital dengan Sidik Jari

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: tanpa wajah orang nyata, tanpa logo/merek nyata, netral).

## Sumber utama

- **NIST**: perangkat lunak NBIS (MINDTCT, BOZORTH3) (#1), uji MINEX III template INCITS 378 (#4), pedoman autentikasi SP 800-63B-4 Juli 2025 (#5) dan edisi rev. 3 (#6).
- **ISO/IEC**: 19794-2 minutiae (#2), 19794-4 citra jari (#3), 19795-1 pengujian kinerja (#8).
- **Jurnal**: Hassan & Kim 2018, *Sensors*, sensor kapasitif CMOS (#7).
- Pendukung MEDIUM: Wikipedia (jenis pemindai, kunci elektronik) (#9, #10), siaran pers produk kunci pintar via ANTARA/Business Wire 2022 (#11, #12). Nama merek di #11–#12 hanya untuk register, tidak tampil di visual atau VO.
- Halaman FBI biometrik (le.fbi.gov, fbi.gov/cjis) diblokir 403 saat diakses; diganti NBIS yang dikembangkan NIST untuk FBI (#1). WebSearch/WebFetch error; semua sumber dibuka lewat curl, Europe PMC, dan API Crossref.

## Fakta terverifikasi

1. Sensor kapasitif CMOS membaca pola dari perbedaan kapasitansi antara garis timbul (ridge) dan lembah (valley); jenis lain: optik, termal, ultrasonik (#7, #9).
2. Kondisi jari basah atau kering menurunkan kualitas citra sensor (#7).
3. Algoritma umum mencari minutiae: ujung garis (ridge ending) dan percabangan (bifurcation) (#1).
4. Minutiae disimpan sebagai template dalam format standar (ISO/IEC 19794-2, INCITS 378), termasuk format compact untuk kartu pintar; pencocokan berbasis minutiae dipakai luas dan diuji NIST (MINEX III) (#1, #2, #4).
5. Standar juga punya format untuk menyimpan citra jari utuh (ISO/IEC 19794-4) (#3).
6. Pencocokan biometrik bersifat probabilistik, dengan ambang (threshold) (#5, #6).
7. NIST SP 800-63B-4 (Juli 2025): FMR ≤ 1:10.000, FNMR sebaiknya < 5%, diuji sesuai ISO/IEC 19795-1 (#5, #8). Edisi lama: FMR ≤ 1:1.000 (#6).
8. Setelah 5 gagal berturut-turut (10 bila ada PAD), sistem harus menjeda atau beralih ke faktor lain seperti PIN (#6).
9. Kunci elektrik menggerakkan grendel dengan magnet, solenoid, atau motor (#10).
10. Kunci pintar konsumen umumnya menyediakan akses cadangan (PIN, kunci mekanis), peringatan baterai lemah, dan daya darurat lewat port USB (#11, #12).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "diubah jadi peta titik, bukan disimpan sebagai foto" terlalu mutlak. Banyak sistem memang menyimpan template minutiae (#1, #2, #4), tetapi ISO/IEC 19794-4 juga menstandarkan penyimpanan citra jari (#3), dan ada algoritma berbasis pola/citra. Hook dikoreksi menjadi "**umumnya** tidak menyimpan foto jarimu", dan c05 menyebut eksplisit bahwa ada format citra. Isi penyimpanan di kunci pintu tertentu tergantung produsen dan tidak bisa diverifikasi umum.
- **Angka FAR/FRR**: 1:10.000 dan < 5% adalah **syarat pedoman NIST untuk sistem autentikasi digital**, bukan spesifikasi terukur kunci pintu konsumen. VO menyebutnya sebagai "pedoman NIST meminta", bukan klaim performa kunci. Kunci murah bisa lebih buruk; spesifikasi produsen tidak diverifikasi.
- **"Luka"** (jari luka bisa gagal dibaca) tidak ada di sumber HIGH yang dibuka; sumber hanya menyebut jari basah dan kering (#7). Dipertahankan atas permintaan brief sebagai pesan keselamatan yang wajar; cari sumber sebelum produksi atau ganti "luka" dengan "kotor".
- **Template = tidak bisa dibalik?** Tidak diklaim. NIST mencatat perlindungan template biometrik masih terbatas (#5) dan sidik jari bukan rahasia (#6). Naskah tidak menjanjikan bahwa peta titik "aman total".
- **Keamanan**: tidak ada instruksi membobol atau memalsukan sidik jari. Fakta "semua pemindai rentan dipalsukan" (#9) hanya konteks, tidak dinarasikan.
- **Arah minutiae**: VO menyebut "posisi dan arahnya". Sumber yang dibuka menyebut elemen data minutiae (#2) dan ujung/percabangan (#1) tanpa rincian sudut di abstrak; cek isi INCITS 378/ISO 19794-2 (x, y, sudut) sebelum produksi.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| Ridge · Valley | Garis timbul dan lembah sidik jari | 7 |
| Ridge ending · Bifurcation | Dua jenis minutiae | 1 |
| ISO/IEC 19794-2 | Format template minutiae | 2 |
| ISO/IEC 19794-4 | Format citra jari | 3 |
| ≤ 1 : 10.000 | Salah terima (FMR) maksimal, pedoman NIST | 5 |
| < 5% | Salah tolak (FNMR), pedoman NIST | 5 |
| Juli 2025 | Terbit NIST SP 800-63B-4 | 5 |
| 5 kali gagal | Batas gagal berturut-turut sebelum jeda/PIN (rev. 3) | 6 |
| < 20% | Contoh ambang peringatan baterai lemah (satu produk) | 11 |

## Poin kunci

- Cerita = transformasi: jari → kapasitansi → citra garis → titik minutiae → skor → grendel. Tiap langkah satu adegan.
- Payoff visual: garis sidik jari "runtuh" jadi peta titik, lalu dua peta ditumpuk dan menyala hijau.
- Jujur soal batas: umumnya template, kadang citra; hasil cocok berupa peluang.
- Pesan keselamatan: PIN dan kunci mekanis cadangan, ganti baterai saat peringatan, jari basah/kering bisa gagal.
- Rule 15: tangan/jari ilustrasi generik, gagang pintu tanpa merek, tanpa logo NIST/ISO (cukup teks).
