# Research Report — Cara Kerja Gerbang Tol Tanpa Henti

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo/merek nyata).

## Sumber utama

- **Regulasi (HIGH)**: Permen PUPR 18/2020 tentang Transaksi Tol Nontunai Nirsentuh (#1) dan Permen PUPR 16/PRT/M/2017 tentang Transaksi Tol Nontunai (#2), teks lengkap dari JDIH BPK.
- **Otoritas Singapura (HIGH)**: LTA OneMotoring, halaman ERP (#3) dan ERP 2.0 (#4), contoh sistem tol radio (DSRC) berbasis kartu di dasbor yang sedang diganti GNSS.
- **Teknis (MEDIUM)**: Wikipedia ERP, ETC, DSRC/open road tolling, ANPR (#5–#8), termasuk standar CEN EN 12253 (5,8 GHz).
- **Status MLFF Indonesia (MEDIUM, ANTARA)**: penjelasan BPJT 2024 (#9), uji coba Bali Mandara 2023 (#10), evaluasi BPJT 2025 (#11), perkembangan Juni–September 2026 (#12–#15).
- Catatan: situs BPJT (bpjt.pu.go.id) bisa diakses tapi tidak memuat halaman MLFF yang bisa dibaca tanpa JS; penjelasan BPJT diambil lewat kutipan ANTARA (#9). Standar EN 12253 tidak dibuka langsung (berbayar), hanya lewat Wikipedia.

## Fakta terverifikasi

1. Sejak 31 Oktober 2017 transaksi di seluruh jalan tol Indonesia wajib nontunai, berbasis kartu uang elektronik (#2). Gerbang masih memakai palang selama transisi (#13).
2. Permen PUPR 18/2020 menjadi dasar transaksi tol nirsentuh: tanpa sentuhan fisik dengan alat transaksi, bertahap mulai 31 Januari 2022 (target di atas kertas), dan ruas yang sudah nirsentuh tidak lagi menerima kartu (#1).
3. Tiga cara utama tol tanpa henti di dunia: transponder/tag radio DSRC dibaca antena di gantri, kamera ANPR membaca pelat, dan GNSS yang menghitung jarak tanpa gerbang (#5, #6, #7, #8).
4. Singapura memakai ERP sejak 1 April 1998: IU di kaca depan berisi kartu saldo, sensor gantri bicara dengan IU lewat DSRC, kamera memotret pelat; kendaraan tidak berhenti (#3, #5). IU dihapus bertahap sampai akhir 2026, diganti OBU berbasis GNSS (ERP 2.0) (#4).
5. Bila kendaraan tidak membayar, sistem tol terbuka menagih pemilik terdaftar lewat data pelat (#3, #6).
6. MLFF Indonesia direncanakan berbasis GNSS lewat aplikasi ponsel (juga e-OBU atau route ticket), dicocokkan dengan data registrasi kendaraan, tarif sesuai jarak, tanpa gerbang (#9, #10, #12).
7. Uji coba pertama di Tol Bali Mandara, Desember 2023 (#10); Menteri PU menyebut hasilnya tidak konklusif (#14, #15).
8. Per 27 September 2026 (berita terbaru yang ditemukan), Kementerian PU mempercepat uji coba kedua; bila berhasil baru masuk tahap semikomersial (#15). Belum ada penerapan komersial.
9. Kendala yang disebut BPJT: integrasi dengan sistem operator tol, mekanisme pembayaran, dan penegakan; tidak membayar tol bukan pelanggaran lalu lintas sehingga perlu payung hukum (#11).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: "Kartu di dasbor dibaca gelombang radio saat mobilmu masih melaju" **tidak akurat untuk Indonesia per 2026-11-26**. Di Indonesia gerbang tol masih tap kartu dan berhenti (#2, #13). MLFF yang direncanakan berbasis GNSS/aplikasi + data registrasi/kamera, bukan kartu di dasbor (#9, #12). Kartu di dasbor yang dibaca radio adalah sistem lama Singapura (IU + DSRC, #3, #5), yang justru dihapus akhir 2026 (#4). Konsep e-OBU Indonesia memang bisa diisi kartu dan dibaca reader 5,8 GHz (#9), tetapi belum pernah diterapkan. Hook dikoreksi menjadi "**Bayar tol tanpa menginjak rem sedikit pun. Di beberapa negara, itu sudah biasa.**", dan kartu-di-dasbor dipindah ke c02 sebagai contoh Singapura.
- **Status MLFF**: proyek pernah tertunda dan dievaluasi ulang (#11); naskah hanya menyebut fakta "uji coba pertama belum konklusif, uji kedua disiapkan" (#14, #15), tanpa menilai pemerintah atau badan usaha. Nama badan usaha pelaksana dan aplikasinya (swasta) **tidak disebut** di VO maupun visual.
- **Klaim pelaksana**: angka "1.900 pengujian berhasil" dan kerugian antrean "USD 300 juta/tahun" berasal dari pihak badan usaha (dikutip ANTARA #9, #11), bukan data independen, jadi tidak dipakai.
- **Tanggal Permen 18/2020**: target "mulai 31 Januari 2022" tidak terlaksana; naskah tidak menyebutnya agar tidak terdengar seperti kritik.
- **Frekuensi**: DSRC tol Eropa 5,8 GHz (#7); Singapura juga DSRC tetapi frekuensinya tidak terverifikasi di sumber yang dibuka, jadi VO hanya bilang "gelombang radio".
- **Perubahan cepat**: status MLFF bisa berubah setelah November 2026. Cek ulang berita terbaru sebelum produksi dan tulis "per <bulan tahun>" di layar.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 31 Okt 2017 | Seluruh jalan tol wajib nontunai | 2 |
| 1998 | ERP Singapura mulai (open road tolling, IU + DSRC) | 5 |
| 5,8 GHz | Gelombang DSRC tol (standar Eropa EN 12253; reader e-OBU rencana BPJT) | 7, 9 |
| GNSS | Satelit penentu posisi untuk tarif berbasis jarak | 4, 6, 9 |
| Permen PUPR 18/2020 | Dasar transaksi tol nontunai nirsentuh | 1 |
| Des 2023 | Uji coba MLFF Tol Bali Mandara | 10 |
| per 27 Sep 2026 | Uji coba kedua dipercepat, belum komersial | 15 |
| ±4 juta transaksi/hari | Transaksi harian gerbang tol (opsional, belum dipakai di VO) | 12 |

## Poin kunci

- Struktur "tiga cara mengenali mobil": radio, kamera, satelit. Tiap cara jadi satu adegan.
- Kontras: dunia sudah melaju, Indonesia masih tap kartu, rencananya satelit, statusnya masih uji coba.
- Netral: jelaskan status apa adanya dengan tanggal, tanpa menyalahkan siapa pun.
- Rule 15: gantri, mobil, kartu, ponsel generik; tanpa merek kartu, aplikasi, operator; teks "Kementerian PU" dan "BPJT" boleh sebagai teks biasa, bukan logo.
