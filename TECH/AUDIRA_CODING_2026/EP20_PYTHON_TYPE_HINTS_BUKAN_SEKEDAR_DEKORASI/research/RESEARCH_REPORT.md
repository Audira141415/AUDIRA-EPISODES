# Research Report — Python Type Hints: Bukan Sekedar Dekorasi

## Sumber utama
- PEP 484 (#1), dokumentasi resmi `typing` (#2), PEP 3107 (#3), PEP 526 (#4), PEP 604 (#5): spesifikasi resmi Python (HIGH).
- Tulisan Jukka Lehtosalo di Dropbox Tech Blog 2019 (#6): sumber primer, ditulis pembuat mypy sendiri (HIGH, tetap sudut pandang perusahaan).
- Halaman About mypy (#7): halaman proyek (MEDIUM).

## Fakta terverifikasi
1. Python menerima sintaks anotasi fungsi sejak Python 3.0 (PEP 3107, 2006), tapi tanpa makna tipe baku (#3, #6).
2. PEP 484 (dibuat 29 Sep 2014; penulis Guido van Rossum, Jukka Lehtosalo, Łukasz Langa) membakukan type hints untuk Python 3.5, rilis 2015 (#1, #6).
3. Runtime Python tidak memeriksa type hints: anotasi hanya disimpan di `__annotations__` (#1, #2).
4. Penulis PEP 484 menegaskan Python tetap dinamis dan type hints tidak akan diwajibkan (#1).
5. Anotasi variabel masuk Python 3.6 (#4); sintaks `X | Y` masuk Python 3.10 (#5).
6. Mypy mulai dibuat 2012 oleh Jukka Lehtosalo saat PhD di Cambridge (#7, #6).
7. Mypy memeriksa kode secara statis (tanpa menjalankannya) dan mencocokkan anotasi dengan implementasi; Lehtosalo menyebutnya "verified documentation" (#6).
8. Dropbox: ±420 ribu baris beranotasi akhir 2016, hampir 4 juta baris bertipe dalam sekitar 3 tahun (#6).
9. Bug khas yang ditangkap: lupa menangani `None` (#6).
10. Cek tipe penuh sering selesai dalam sepersekian detik, sedangkan tes bisa puluhan detik sampai menit (#6).

## Perselisihan / Kontroversi
- **Hook "dokumentasi yang nggak pernah basi" hanya benar bersyarat.** Type hints sendiri BISA basi: runtime tidak menegakkannya (#1, #2), jadi anotasi yang salah tetap jalan tanpa peringatan. Klaim itu baru benar bila type checker (mypy) dijalankan rutin, misalnya di CI/pull request. Naskah menarasikan syarat ini secara eksplisit di payoff. Judul tidak diubah.
- **Ejaan judul:** "Sekedar" tidak baku; KBBI: "sekadar". Judul tidak diubah, disarankan dikoreksi saat finalisasi caption/cover.
- **"Bukan sekadar dekorasi" juga bersyarat:** tanpa checker/IDE, anotasi memang tidak berpengaruh ke perilaku program (#2). Nilainya datang dari alat yang membacanya.
- Angka Dropbox adalah klaim internal perusahaan (per 2019), tidak diaudit independen. Ditulis "hampir 4 juta baris, per 2019".
- Rule 15: jangan tampilkan wajah Guido/Jukka atau logo Dropbox/Python/mypy. Pakai name plate teks dan ikon generik.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 3.5 / 2015 | Type hints resmi (PEP 484) | #1, #6 |
| PEP 484 | Nama spesifikasi type hints | #1 |
| 2012 | Mypy mulai dibuat | #7 |
| Jukka Lehtosalo · Cambridge | Pembuat mypy (name plate, tanpa wajah) | #7, #6 |
| ±420.000 baris (akhir 2016) | Adopsi awal di Dropbox | #6 |
| ~4 juta baris / ±3 tahun (per 2019) | Kode Python bertipe di Dropbox | #6 |
| < 1 dtk vs menit | Cek tipe vs tes | #6 |

## Poin kunci
- Type hints = janji tipe; Python tidak menagih janji itu saat jalan.
- Mypy = penagih janji: analisis statis sebelum kode dijalankan.
- Tanpa checker, hints bisa basi seperti komentar. Dengan checker di CI, hints jadi dokumentasi terverifikasi.
- Bukti skala: Dropbox, hampir 4 juta baris (per 2019).
