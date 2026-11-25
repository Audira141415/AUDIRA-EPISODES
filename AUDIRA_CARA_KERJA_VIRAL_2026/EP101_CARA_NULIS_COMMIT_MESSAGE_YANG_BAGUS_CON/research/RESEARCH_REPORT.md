# Research Report — Cara Nulis Commit Message yang Bagus: Conventional Commits

Tanggal riset: 2026-11-25. Halaman diambil lewat curl (WebFetch gagal: model tidak tersedia).

## Sumber utama
- Conventional Commits 1.0.0 (#1-3), Pro Git (#4), dokumentasi kernel Linux (#5), semver.org (#8), artikel cbeams 2014 (#6-7).

## Fakta terverifikasi
1. Format: `<type>[optional scope]: <description>` + body + footer (#1).
2. `fix` = PATCH, `feat` = MINOR, `BREAKING CHANGE` / `!` = MAJOR (#2, #8).
3. Tipe lain (build, chore, ci, docs, style, refactor, perf, test) hanya anjuran, tidak diwajibkan spec (#3).
4. Subjek sekitar 50 karakter, baris kosong, badan sekitar 72 karakter, imperatif (#4, #6).
5. Kernel Linux: imperatif, badan 75 kolom, jelaskan "why" agar terbaca bertahun-tahun kemudian (#5).
6. Diff = apa; pesan commit = kenapa (#6). Git memakai imperatif di pesan otomatisnya (#7).

## Perselisihan / Kontroversi
- Judul/hook: akurat secara umum. Klaim "debugging lebih cepat 6 bulan kemudian" adalah argumen praktik, bukan hasil studi terukur; di naskah dipakai sebagai framing, bukan angka fakta. "6 bulan" tidak disebut sebagai statistik.
- Angka 50/72 adalah panduan ("sekitar"), bukan batas keras Git; Linux memakai 75 kolom. Naskah memakai kata "sekitar".
- Conventional Commits tidak universal; sebagian tim menolaknya karena dianggap kaku. Tipe selain fix/feat tidak punya efek SemVer.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 50 | batas subjek (sekitar) | 4, 6 |
| 72 | pembungkus badan (sekitar) | 4, 6 |
| 2014 | cbeams merangkum tujuh aturan | 6 |
| PATCH / MINOR / MAJOR | fix / feat / BREAKING CHANGE | 2, 8 |
| `feat(parser): ...` | contoh scope | 1 |

## Poin kunci
- Diff cerita "apa", commit message cerita "kenapa".
- Subjek pendek, imperatif, baris kosong, badan menjelaskan alasan.
- Conventional Commits menambah label mesin-baca yang menyambung ke SemVer.
