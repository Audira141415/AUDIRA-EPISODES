# Source Register — Cara Nulis Commit Message yang Bagus: Conventional Commits

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Struktur commit: `<type>[optional scope]: <description>`, body opsional, footer opsional | Conventional Commits 1.0.0, conventionalcommits.org | https://www.conventionalcommits.org/en/v1.0.0/ | 2026-11-25 | HIGH |
| 2 | `fix` = PATCH, `feat` = MINOR, footer `BREAKING CHANGE:` atau `!` setelah tipe/scope = MAJOR (SemVer) | Conventional Commits 1.0.0, conventionalcommits.org | https://www.conventionalcommits.org/en/v1.0.0/ | 2026-11-25 | HIGH |
| 3 | Tipe lain yang dianjurkan @commitlint/config-conventional (basis Angular): build, chore, ci, docs, style, refactor, perf, test; tipe tambahan tidak diwajibkan spec | Conventional Commits 1.0.0, conventionalcommits.org | https://www.conventionalcommits.org/en/v1.0.0/ | 2026-11-25 | HIGH |
| 4 | Pro Git: baris pertama sekitar 50 karakter, lalu baris kosong, lalu penjelasan; badan dibungkus sekitar 72; imperatif "Fix bug" bukan "Fixed bug" | Pro Git, Scott Chacon dan Ben Straub (bab Contributing to a Project) | https://raw.githubusercontent.com/progit/progit2/main/book/05-distributed-git/sections/contributing.asc | 2026-11-25 | HIGH |
| 5 | Panduan kernel Linux: tulis perubahan dalam mood imperatif; badan penjelasan dibungkus 75 kolom; teks harus cukup rinci agar dipahami berminggu-minggu, berbulan-bulan, bahkan bertahun-tahun kemudian (alasan "why") | Submitting patches, Linux kernel documentation (Documentation/process/submitting-patches.rst) | https://raw.githubusercontent.com/torvalds/linux/master/Documentation/process/submitting-patches.rst | 2026-11-25 | HIGH |
| 6 | Tujuh aturan: pisahkan subjek dan badan dengan baris kosong; subjek maks 50 karakter; kapital; tanpa titik; imperatif; badan 72 karakter; badan jelaskan apa dan kenapa, bukan bagaimana. Diff memberi tahu apa yang berubah, hanya pesan commit yang bisa memberi tahu kenapa | How to Write a Git Commit Message, cbeams (Chris Beams), 31 Agustus 2014 | https://cbea.ms/git-commit/ | 2026-11-25 | MEDIUM |
| 7 | Git sendiri memakai imperatif pada pesan otomatis (mis. `Merge branch 'myfeature'`, `Revert "..."`) | How to Write a Git Commit Message, cbeams, 2014 | https://cbea.ms/git-commit/ | 2026-11-25 | MEDIUM |
| 8 | SemVer: MAJOR untuk perubahan API tidak kompatibel | Semantic Versioning 2.0.0, semver.org | https://semver.org/ | 2026-11-25 | HIGH |
