# Source Register — Monorepo vs Polyrepo: Mana yang Lebih Baik untuk Tim Kamu

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Statistik repositori Google per Januari 2015: ±86 TB data, ±2 miliar baris kode di ±9 juta file sumber unik, ±1 miliar file total, ±35 juta commit; dipakai 95% developer Google | Why Google Stores Billions of Lines of Code in a Single Repository, Rachel Potvin & Josh Levenberg, Communications of the ACM 59(7), 2016 (DOI 10.1145/2854146) | https://cacm.acm.org/magazines/2016/7/204032-why-google-stores-billions-of-lines-of-code-in-a-single-repository/fulltext (dibaca via arsip web.archive.org 2024-02-29) | 2026-11-25 | HIGH |
| 2 | Repo Google dipakai >25.000 developer; hari kerja biasa: 16.000 perubahan oleh manusia + 24.000 oleh sistem otomatis; version control buatan sendiri bernama Piper (dengan klien CitC) | Potvin & Levenberg, CACM, 2016 (sama dengan #1) | https://doi.org/10.1145/2854146 | 2026-11-25 | HIGH |
| 3 | Biaya monorepo menurut penulis Google: investasi tooling, kompleksitas codebase (dependensi tak perlu, sulit cari kode), usaha menjaga code health; model ini "not for everyone", paling cocok untuk organisasi berbudaya terbuka dan kolaboratif, tidak cocok bila banyak kode privat antar grup | Potvin & Levenberg, CACM, 2016 (sama dengan #1) | https://doi.org/10.1145/2854146 | 2026-11-25 | HIGH |
| 4 | Survei engineer Google + analisis log tool: keunggulan monorepo = visibilitas kode (cari API untuk dipakai ulang, contoh pemakaian, kode dependen ikut diperbarui saat API migrasi) dan dependensi terpusat; multi-repo = fleksibilitas memilih toolchain, kontrol akses, stabilitas | Advantages and Disadvantages of a Monolithic Repository: A Case Study at Google, Ciera Jaspan dkk., ICSE-SEIP 2018 (DOI 10.1145/3183519.3183550) | https://doi.org/10.1145/3183519.3183550 (abstrak via api.semanticscholar.org) | 2026-11-25 | HIGH |
| 5 | Mei 2017: Windows pindah ke Git/GVFS; kode Windows ±3,5 juta file, repo ±300 GB, tim ±4.000 engineer, 1.760 lab build per hari, 8.421 push per hari | The largest Git repo on the planet, Brian Harry, Microsoft DevBlogs, 2017 | https://devblogs.microsoft.com/bharry/the-largest-git-repo-on-the-planet/ | 2026-11-25 | HIGH |
| 6 | Definisi monorepo (banyak proyek dalam satu repositori); keuntungan: reuse kode, dependensi sederhana, atomic commit, refactor skala besar; kekurangan: hilang versi per proyek, tak ada kontrol akses per proyek, butuh storage lebih; Google, Meta, Microsoft, Uber, Airbnb, Twitter memakai monorepo besar | Monorepo, Wikipedia, diakses 2026 | https://en.wikipedia.org/wiki/Monorepo | 2026-11-25 | MEDIUM |
| 7 | Build tool berbasis grafik dependensi (Bazel, Buck, Pants, Please) membatasi build/test hanya di area yang berubah; Twitter mulai Pants 2011, open-source 2012 | Monorepo, Wikipedia, diakses 2026 (sama dengan #6) | https://en.wikipedia.org/wiki/Monorepo | 2026-11-25 | MEDIUM |
| 8 | Kritik (opini): pada skala besar monorepo tetap harus menyelesaikan semua masalah polyrepo, ditambah risiko tight coupling dan beban skalabilitas VCS | Monorepos: Please don't!, Matt Klein (engineer Lyft), Medium, 2 Jan 2019 | https://medium.com/@mattklein123/monorepos-please-dont-e9a279be011b | 2026-11-25 | MEDIUM |

## Catatan
- Angka #1, #2 adalah snapshot Januari 2015; angka #5 snapshot 2017. Di VO wajib disebut tahunnya.
- #8 adalah opini satu engineer, dinarasikan sebagai pendapat, bukan fakta.
- WebSearch/WebFetch error saat riset; semua sumber diambil dengan curl (Wikipedia API, Crossref, Semantic Scholar, arsip web).
