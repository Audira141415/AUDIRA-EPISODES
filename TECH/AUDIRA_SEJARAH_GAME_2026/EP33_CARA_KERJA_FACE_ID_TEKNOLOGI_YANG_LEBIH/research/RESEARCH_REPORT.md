# Research Report — Cara Kerja Face ID: Teknologi yang Lebih Aman dari Password

## Sumber utama
- Apple Newsroom, "The future is here: iPhone X" (2017): spesifikasi TrueDepth dan neural engine (#1, #2).
- Apple Support 102381 "About Face ID advanced technology": cara kerja, gelap total, Secure Enclave, batas percobaan, kembar/anak (#3, #6, #7).
- Apple Platform Security Guide: peluang salah cocok, perhatian, anti-spoofing (#4, #8).
- Apple Support 105095 "About Touch ID advanced security technology": peluang tebak kode 4 digit (#5).
- Wikipedia "Face ID" dan WIRED (2017): sejarah dan klaim pembobolan topeng (#9, #10).

## Fakta terverifikasi
1. Dot projector menembakkan lebih dari 30.000 titik inframerah; TrueDepth = dot projector + kamera inframerah + flood illuminator (#1).
2. Diumumkan bersama iPhone X, 12 September 2017 (#9).
3. Neural engine A11 Bionic: dual-core, hingga 600 miliar operasi/detik (#2).
4. Kamera menangkap peta kedalaman dan gambar inframerah; diubah jadi representasi matematis, dienkripsi, kunci hanya di Secure Enclave (#3).
5. Dirancang bekerja di dalam, di luar ruangan, dan dalam gelap total (#3).
6. Cek perhatian: mata terbuka dan menatap layar; jaringan saraf anti-spoofing (#8).
7. Lima kali gagal, kode sandi wajib; juga setelah > 48 jam tidak dibuka (#6).
8. Peluang orang acak lolos: < 1:1.000.000 (Face ID), < 1:50.000 (Touch ID), 1:10.000 (tebak kode 4 digit) (#4, #5).
9. Kembar, saudara mirip, dan anak < 13 tahun: peluang salah cocok lebih tinggi (#7).

## Perselisihan / Kontroversi
- **Judul "lebih aman dari password" terlalu mutlak.** Apple hanya membandingkan dengan kode 4 digit (1:10.000). Kode sandi alfanumerik panjang bisa jauh lebih sulit ditebak, dan Face ID sendiri tetap bergantung pada kode sandi sebagai cadangan (#5, #6). Naskah memakai perbandingan dengan kode 4 digit dan menyebut kode sandi sebagai "pintu cadangan". Saran judul: "Cara Kerja Face ID: Kenapa Lebih Sulit Dibobol dari PIN 4 Digit".
- **Angka 30.000 titik** berasal dari rilis 2017 (iPhone X). Halaman support Apple terkini hanya menulis "ribuan titik". Naskah mengaitkan angka itu dengan iPhone X / Face ID generasi awal; on-screen tulis "30.000+ (iPhone X, 2017)".
- **Klaim pembobolan topeng Bkav (2017)** belum direplikasi luas; WIRED menyebutnya bukan ancaman bagi pengguna biasa (#10). Tidak dinarasikan.
- **Kembar identik**: Apple sendiri mengakui peluang lebih tinggi (#7); hasil uji media tidak konsisten (#9). Naskah cukup menyebut pengakuan Apple.
- **Isu hukum** (aparat membuka ponsel dengan wajah tersangka, kasus FBI 2018, #9): sensitif dan berbeda per negara, tidak dinarasikan.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 30.000+ | titik inframerah dari dot projector (iPhone X, 2017) | 1 |
| 12 Sep 2017 | Face ID diumumkan bersama iPhone X | 9 |
| 600 miliar op/dtk | neural engine A11 Bionic | 2 |
| 1 : 1.000.000 | peluang orang acak lolos Face ID | 4 |
| 1 : 50.000 | peluang orang acak lolos Touch ID | 4 |
| 1 : 10.000 | peluang menebak kode 4 digit | 5 |
| 5× gagal | kode sandi wajib | 6 |
| < 13 tahun | anak, peluang salah cocok lebih tinggi | 7 |

## Poin kunci
- Face ID membaca bentuk 3D wajah, bukan foto 2D; itu sebabnya jalan di gelap dan sulit ditipu foto.
- Data wajah tidak disimpan sebagai gambar, tapi angka terenkripsi di Secure Enclave.
- Lebih sulit dibobol orang asing dibanding Touch ID dan PIN 4 digit, tapi tetap bersandar pada kode sandi.
- Angka tech bisa berubah: tulis "per iPhone X (2017)" untuk 30.000 titik dan 600 miliar op/dtk, "per Apple Platform Security (diakses 25 Nov 2026)" untuk peluang.
