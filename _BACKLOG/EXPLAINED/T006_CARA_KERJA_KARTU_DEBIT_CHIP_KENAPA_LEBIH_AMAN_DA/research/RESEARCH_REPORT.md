# Research Report — Cara Kerja Kartu Debit Chip: Kenapa Lebih Aman dari Strip Magnetik

## Sumber utama

- EMVCo (badan teknis spesifikasi chip pembayaran global): halaman EMV Contact Chip (#1) dan About Us (#2).
- Bank Indonesia: siaran pers penetapan NSICCS 2017 (#3) dan SE BI No. 17/52/DKSP 2015 (#4).
- Ensiklopedia: Wikipedia EMV (#5), ISO/IEC 7816 (#6), ISO/IEC 7810 (#7).
- Media: Kompas.com 2017, advertorial ASPI (#8), dipakai sebagai pendukung saja.

Catatan riset: halaman resmi iso.org tidak bisa diakses otomatis (proteksi bot), jadi fakta ISO dirujuk lewat ensiklopedia (MEDIUM).

## Fakta terverifikasi

1. Chip membuat kode keamanan sekali pakai (kriptogram) untuk setiap transaksi; kode unik dan tidak bisa dipakai ulang (#1).
2. Chip memvalidasi keaslian kartu dan membantu mencegah penipuan kartu palsu, hilang, dan dicuri (#1).
3. Teknologi chip membuat penyalinan strip magnetik usang; chip tidak praktis digandakan, yang bisa disalin hanya stripnya (#1, #5).
4. Kriptogram adalah tanda tangan digital atas detail transaksi (termasuk nominal) yang dicek bank penerbit secara real time (#5).
5. Lebih dari 15,6 miliar kartu kredit dan debit memakai chip berbasis spesifikasi ini, per 2026-11-26 (#1).
6. EMVCo dibentuk tahun 1999 (#2).
7. SE BI No. 17/52/DKSP tanggal 30 Desember 2015 mewajibkan standar chip nasional dan PIN online 6 digit (#3, #4).
8. NSICCS ditetapkan BI sebagai standar nasional chip kartu ATM/debit, disampaikan 21 Juni 2017 (#3).
9. Target bertahap: 30% (2018), 50% (2019), 80% (2020), 100% kartu beredar memakai chip + PIN 6 digit pada 31 Desember 2021 (#3).
10. Kontak chip diatur ISO/IEC 7816-2: antarmuka delapan (atau enam) pin (#6).
11. Kartu pembayaran berformat ID-1: 85,60 × 53,98 mm (#7).
12. Setelah chip, penipuan bergeser ke transaksi tanpa kartu fisik (online, telepon) (#5).

## Perselisihan / Kontroversi

- Hook "membuat kode baru setiap kali bertransaksi" akurat (#1). Koreksi kecil: kode tidak dibuat chip sendirian; chip mengolah data transaksi dari terminal dengan kunci kriptografinya, lalu bank penerbit memverifikasinya (#5). Naskah menjelaskan alur ini.
- Judul "lebih aman" perlu batasan: chip melindungi dari kartu palsu saat transaksi tatap muka, bukan dari penipuan online atau PIN yang dibocorkan pemilik (#5). Naskah menyebut batasan ini di payoff.
- Target 100% chip per 31 Desember 2021 adalah target regulasi (#3); data realisasi akhir tidak ditemukan di sumber resmi yang diakses. Jangan klaim "semua kartu sudah chip".
- Angka biaya kartu (#8) berasal dari advertorial dan estimasi 2017; tidak dipakai di VO.
- Nama standar global berasal dari nama perusahaan jaringan pembayaran; sesuai rule 15, jangan tampilkan merek/logo di visual dan jangan sebut nama merek di VO.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 1 kode / transaksi | Kriptogram sekali pakai, tidak bisa dipakai ulang | 1 |
| 8 titik kontak | Antarmuka chip ISO/IEC 7816-2 (delapan atau enam pin) | 6 |
| 30 Desember 2015 | SE BI No. 17/52/DKSP | 4 |
| NSICCS | Standar chip nasional kartu ATM/debit | 3 |
| 100% · 31 Desember 2021 | Target kartu beredar pakai chip + PIN 6 digit | 3 |
| PIN 6 digit | PIN online wajib | 3 |
| 15,6 miliar kartu (per 2026-11-26) | Kartu ber-chip berbasis spesifikasi global | 1 |

## Poin kunci

- Strip magnetik menyimpan data tetap; data tetap bisa disalin.
- Chip berisi komputer mini dengan kunci kriptografi yang sulit digandakan.
- Tiap transaksi, chip menghasilkan kriptogram unik; bank mengecek keasliannya secara real time; kode lama tak bisa dipakai lagi.
- Indonesia: SE BI 2015, NSICCS, target 100% chip + PIN 6 digit pada 31 Desember 2021.
- Batasan: chip tidak melindungi transaksi online atau PIN yang dibagikan. Jelaskan konsep saja, tanpa detail teknik penipuan.
