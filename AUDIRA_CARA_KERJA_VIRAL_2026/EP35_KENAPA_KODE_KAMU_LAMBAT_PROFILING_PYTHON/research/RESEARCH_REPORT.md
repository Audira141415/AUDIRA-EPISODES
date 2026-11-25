# Research Report — Kenapa Kode Kamu Lambat: Profiling Python dari Nol

Dibaca 2026-11-25. Angka dan nama modul per dokumentasi Python 3.15 (cek versi sebelum produksi).

## Sumber utama

- Dokumentasi resmi Python 3.15: halaman `profiling`, `profiling.sampling`, `profile`, `timeit`, `tracemalloc` (#1–#5, HIGH).
- README py-spy dan Scalene (#6–#7, MEDIUM) dan kutipan Knuth 1974 (#8, MEDIUM, dibaca lewat Wikipedia).

## Fakta terverifikasi

1. Python 3.15 menambah paket `profiling` dengan submodul `profiling.sampling` dan `profiling.tracing` (#1).
2. Dokumentasi merekomendasikan sampling untuk kebanyakan analisis kinerja; tracing untuk cakupan lengkap dengan overhead lebih tinggi (#1).
3. `profiling.sampling` bernama Tachyon, menyampel tumpukan dari luar proses, bisa menempel ke proses berjalan, overhead hampir nol (#2).
4. Pada 10 kHz selama 10 detik, fungsi berbagian 5% punya margin galat sekitar ±0,5% (#2).
5. Profiling deterministik memantau setiap panggilan, kembali, dan exception (#3).
6. Modul `profile` dideprekasi sejak 3.15 dan akan dihapus di 3.17; `cProfile` tetap sebagai alias `profiling.tracing` (#3).
7. `timeit` default 5 pengulangan (berubah dari 3 di Python 3.7) dan mematikan GC sementara (#4).
8. py-spy: sampling, Rust, tanpa restart, flame graph (#6). Scalene: tingkat baris, memori (#7).
9. Knuth 1974: 97% / 3% (#8).

## Perselisihan / Kontroversi

- Judul "Kenapa Kode Kamu Lambat" akurat sebagai pembuka; tidak ada koreksi judul. Hook "nebak itu mahal" bersifat opini, bukan klaim terukur: jangan dinarasikan sebagai statistik.
- Kutipan Knuth sering dipotong menjadi "premature optimization is the root of all evil" tanpa bagian 3% yang kritis; naskah memakai versi utuh. Dibaca lewat Wikipedia, makalah asli belum dibuka: verifikasi ke sumber asli di tahap 4 bila ditampilkan sebagai teks di layar.
- Paket `profiling` baru ada di Python 3.15; banyak pengguna masih di 3.12–3.14 sehingga `cProfile` langsung dan py-spy tetap relevan. Naskah menyebut "Python 3.15" tiap kali membahas Tachyon.
- "Overhead hampir nol" adalah klaim dokumentasi resmi, bukan benchmark independen; jangan ditampilkan sebagai angka pasti.
- Klaim kecepatan Scalene vs profiler lain di README tidak dipakai (tanpa angka terverifikasi).

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 1974 | Tahun makalah Knuth | 8 |
| 97% / 3% | Efisiensi kecil vs bagian kritis | 8 |
| 5x | Pengulangan default `timeit` | 4 |
| Python 3.15 | Versi yang menambah paket `profiling` | 1, 2 |
| Tachyon | Nama profiler sampling `profiling.sampling` | 2 |
| 10 kHz, 10 detik, 5% ± 0,5% | Contoh margin galat sampling | 2 |
| cProfile = alias profiling.tracing | Kompatibilitas | 3 |
| Rust | Bahasa py-spy | 6 |

## Poin kunci

- Ukur dulu (`timeit`), temukan biang (profiler), baru perbaiki.
- Dua pendekatan: deterministik (lengkap, overhead lebih tinggi) vs sampling (hampir tanpa overhead, bisa menempel ke proses berjalan).
- Visual mudah: flame graph, pohon panggilan, grafik batang. Cocok 2D (DATAPHYSICAL/PRECISION). Tanpa wajah dan logo organisasi (jangan pakai logo Python/PSF; pakai teks dan kode generik).
