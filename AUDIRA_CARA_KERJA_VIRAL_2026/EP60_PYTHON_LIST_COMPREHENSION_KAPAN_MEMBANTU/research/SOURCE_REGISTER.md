# Source Register — Python List Comprehension: Kapan Membantu dan Kapan Menyiksa

> Standar EP01 Makkah: minimum 5 sumber, >= 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | List comprehension menghasilkan list baru dari iterable, dengan sintaks `[expr for item in iterable]`; loop variable tidak bocor ke scope luar (beda dari for loop Python 2) | Python Tutorial: Data Structures — List Comprehensions, Python Software Foundation, 2026 | https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions | 2026-11-25 | HIGH |
| 2 | List comprehension diusulkan oleh Barry Warsaw dalam PEP 202, diterima Guido van Rossum, dirilis di Python 2.0 (Oktober 2000) | PEP 202 — List Comprehensions, Barry Warsaw, 2000 | https://peps.python.org/pep-0202/ | 2026-11-25 | HIGH |
| 3 | List comprehension menggunakan instruksi bytecode khusus LIST_APPEND yang langsung append ke list di stack tanpa lookup method | Python dis module — LIST_APPEND instruction, Python Software Foundation, 2026 | https://docs.python.org/3/library/dis.html | 2026-11-25 | HIGH |
| 4 | Benchmark: for loop biasa 3.47 detik untuk 38.470 kata, map() 0.54 detik; list comprehension "often as fast or faster than equivalent use of map" | PythonSpeed/PerformanceTips, Python Wiki, 2024 | https://wiki.python.org/moin/PythonSpeed/PerformanceTips | 2026-11-25 | HIGH |
| 5 | PEP 8 membatasi baris kode maksimal 79 karakter, docstring/comment 72 karakter; tim boleh sepakat sampai 99 karakter | PEP 8 — Style Guide for Python Code: Maximum Line Length, Guido van Rossum et al., 2001 (rev. 2013) | https://peps.python.org/pep-0008/#maximum-line-length | 2026-11-25 | HIGH |
| 6 | Python peringkat 1 TIOBE Index November 2026 dengan rating 20.86% | TIOBE Index for November 2026, TIOBE Software, 2026 | https://www.tiobe.com/tiobe-index/ | 2026-11-25 | MED |
| 7 | Python digunakan oleh 51% developer (peringkat 3 programming language) di Stack Overflow Developer Survey 2024 | Stack Overflow Developer Survey 2024 — Most Popular Technologies, Stack Overflow, 2024 | https://survey.stackoverflow.co/2024/#technology-most-popular-technologies | 2026-11-25 | MED |

## Level
- **HIGH**: sumber primer (dokumentasi resmi Python, PEP, Python Wiki)
- **MED**: sumber sekunder terpercaya (survei industri, indeks popularitas)
- **LOW**: sumber tersier atau tanpa kutipan — tidak dipakai di naskah

## Perselisihan / Kontroversi
| Klaim | Posisi A (sumber) | Posisi B (sumber) | Sikap naskah |
|---|---|---|---|
| Angka benchmark 6x lebih cepat | Python Wiki mengukur map() vs for loop, bukan list comp langsung; wiki menyebut list comp "as fast or faster than map" (#4) | Benchmark bervariasi tergantung operasi, ukuran data, versi Python | Naskah menyebut "mendekati" angka map benchmark dan "hampir 6 kali lipat" — tidak mengklaim angka pasti untuk list comp |

## Musik/SFX (sumber + lisensi)
| Aset | Sumber | Lisensi/atribusi |
|---|---|---|
| | | |
