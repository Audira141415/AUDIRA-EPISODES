# Research Report — Under-Display Camera

## Sumber utama
Paper CVPR 2021 (Zhou dkk.) [#1], paper Feng dkk. 2021 [#2], laporan tantangan UDC 2020 [#3] dan MIPI 2022 [#4]. Pendukung: metasurface 2025 [#5], ICCV 2023 [#6], MUNet 2025 [#7]. WebSearch/WebFetch gagal; sumber diambil lewat arXiv API, Crossref, dan unduhan PDF (angka tabel diverifikasi dari teks PDF #1).

## Fakta terverifikasi
1. UDC = kamera di belakang layar; menaikkan rasio layar-ke-bodi dan eye contact video call, tapi menurunkan kualitas gambar [#1].
2. Pada layar T-OLED area terbuka ~21%, transmisi ~20%. Pada P-OLED area terbuka 23%, transmisi hanya 2,9% (pixel pitch lebih halus menghamburkan foton ke sudut tinggi; substrat poliamida flexible menyerap) [#1].
3. Degradasi utama: T-OLED blur dan noise; P-OLED low-light, color shift, noise [#1].
4. Mikrostruktur pixel melemahkan dan mendifraksikan cahaya: noise, flare, haze, blur; kerusakan dimodelkan lewat point spread function (PSF) [#2].
5. Di atas kamera, panel memiliki densitas pixel dikurangi agar lebih transparan (diamati pada ponsel UDC produksi awal) [#2].
6. Restorasi: deconvolusi (Wiener) dan jaringan saraf; dua tantangan komunitas: UDC 2020 (~150 tim) [#3], MIPI 2022 (167 peserta, 19 tim) [#4].
7. Solusi optik alternatif: metasurface untuk menekan difraksi, masih tahap riset (preprint 2025) [#5].

## Perselisihan / Kontroversi
- Judul/hook "kompromi kualitas" akurat. Tidak ada koreksi judul.
- Angka 20% / 2,9% berasal dari panel uji lab (T-OLED 4K dan P-OLED ponsel) di satu paper, bukan semua ponsel komersial. VO harus menyebut "panel yang diuji peneliti".
- Merek ponsel tidak disebut di VO (rule: tanpa logo; paper #2 menyebut model komersial, hanya sebagai konteks).
- Tidak ada sumber primer vendor/paten yang diverifikasi; klaim kualitas per produk tertentu tidak dibuat.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 21% | area terbuka T-OLED | 1 |
| 20% | transmisi cahaya T-OLED | 1 |
| 23% | area terbuka P-OLED | 1 |
| 2,9% | transmisi cahaya P-OLED | 1 |
| 167 peserta | tantangan MIPI 2022 | 4 |
| 19 tim | hasil akhir MIPI 2022 | 4 |
| PSF | point spread function | 1, 2 |

## Poin kunci
- Cahaya masuk lewat celah pixel: sebagian besar hilang, sisanya didifraksi.
- Dua kerugian: gelap/berisik dan blur/flare.
- Perbaikan lewat software (PSF + jaringan saraf), optik metasurface masih riset.
- Payoff: layar mulus ditukar dengan kompromi ketajaman.
