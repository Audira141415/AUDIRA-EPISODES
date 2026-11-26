# Research Report — Python List Comprehension: Kapan Membantu dan Kapan Menyiksa

## Sumber utama

1. **Dokumentasi resmi Python** (docs.python.org) — tutorial list comprehension, modul `dis` (bytecode LIST_APPEND). Sumber primer paling otoritatif.
2. **PEP 202** (peps.python.org) — proposal asli list comprehension oleh Barry Warsaw, diterima untuk Python 2.0 (Oktober 2000).
3. **PEP 8** (peps.python.org) — panduan gaya resmi Python, batas 79 karakter per baris.
4. **Python Wiki PerformanceTips** (wiki.python.org) — benchmark perbandingan for loop vs map/list comprehension.
5. **TIOBE Index & Stack Overflow Survey** — data popularitas Python terkini.

## Fakta terverifikasi

1. List comprehension menghasilkan list baru dari iterable dalam satu ekspresi; loop variable tidak bocor ke enclosing scope (#1).
2. Diusulkan Barry Warsaw via PEP 202, diterima Guido van Rossum, dirilis Python 2.0 Oktober 2000 (#2).
3. List comprehension dikompilasi ke bytecode LIST_APPEND yang langsung append ke list di stack — tanpa lookup method `.append()` lewat dictionary (#3).
4. Benchmark Python Wiki: for loop biasa 3.47 detik untuk memproses 38.470 kata uppercase, map() 0.54 detik. List comprehension "often as fast or faster than equivalent use of map" (#4).
5. PEP 8 membatasi baris kode 79 karakter, docstring 72 karakter. Tim boleh sepakat sampai 99 (#5).
6. Python peringkat 1 TIOBE November 2026, rating 20.86% (#6).
7. Python digunakan 51% developer di Stack Overflow Survey 2024 (#7).

## Perselisihan / Kontroversi

- **Angka "6x lebih cepat"**: benchmark Python Wiki mengukur map() vs for loop, bukan list comprehension langsung. Wiki menyatakan list comp "as fast or faster than map", jadi 6x adalah perkiraan atas. Angka aktual tergantung operasi, ukuran data, dan versi Python. Naskah menggunakan kata "mendekati" dan "hampir" untuk menjaga akurasi.
- **Judul/hook "Kapan Menyiksa"**: tidak ada kontroversi faktual — ini framing editorial. List comprehension yang bersarang memang diakui sulit dibaca di komunitas Python (dokumentasi resmi sendiri menyarankan zip() untuk kasus kompleks, #1).

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| Python 2.0, Oktober 2000 | Versi pertama yang menyertakan list comprehension | #2 |
| 4 baris → 1 baris | Perbandingan tipikal for loop vs list comprehension | #1 |
| LIST_APPEND | Instruksi bytecode khusus untuk list comprehension | #3 |
| 3.47 detik vs 0.54 detik | Benchmark for loop vs map/list comp (38.470 kata) | #4 |
| 6x lebih cepat | Rasio performa (perkiraan) | #4 |
| 79 karakter | Batas baris kode PEP 8 | #5 |
| 20.86% | Rating Python di TIOBE Nov 2026, peringkat 1 | #6 |

## Poin kunci

1. List comprehension bukan fitur baru — sudah ada sejak 26 tahun (2000–2026) dan merupakan idiom inti Python.
2. Keunggulan performa berasal dari optimasi bytecode (LIST_APPEND), bukan dari sintaks yang lebih pendek saja.
3. Batas kegunaan ditentukan oleh readability: satu for + satu if = ideal; nested atau lebih dari 79 karakter = pertimbangkan for loop biasa.
4. Topik ini evergreen — sintaks Python tidak berubah, prinsip readability vs performance selalu relevan bagi programmer baru maupun berpengalaman.
