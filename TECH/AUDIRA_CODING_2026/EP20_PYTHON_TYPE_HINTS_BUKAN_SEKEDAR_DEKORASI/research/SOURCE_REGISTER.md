# Source Register — Python Type Hints: Bukan Sekedar Dekorasi

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | PEP 484 "Type Hints" ditulis Guido van Rossum, Jukka Lehtosalo, Łukasz Langa; dibuat 29-Sep-2014; untuk Python 3.5; status Final. Anotasi tersedia lewat `__annotations__`, tapi "no type checking happens at runtime"; Python tetap bahasa dinamis dan type hints tidak akan diwajibkan | PEP 484 – Type Hints, van Rossum/Lehtosalo/Langa, 2014 | https://peps.python.org/pep-0484/ | 2026-11-25 | HIGH |
| 2 | Modul `typing` "Added in version 3.5"; "The Python runtime does not enforce function and variable type annotations" (dipakai oleh type checker, IDE, linter) | typing — Support for type hints, Python Software Foundation, dokumentasi Python 3 | https://docs.python.org/3/library/typing.html | 2026-11-25 | HIGH |
| 3 | Anotasi fungsi pertama kali lewat PEP 3107 (Collin Winter, Tony Lownds), dibuat 02-Dec-2006, Python 3.0; tanpa semantik tipe baku | PEP 3107 – Function Annotations, Winter & Lownds, 2006 | https://peps.python.org/pep-3107/ | 2026-11-25 | HIGH |
| 4 | Anotasi variabel (`x: int = 0`) lewat PEP 526, dibuat 09-Aug-2016, Python 3.6 | PEP 526 – Syntax for Variable Annotations, Gonzalez/House/Levkivskyi/Roach/van Rossum, 2016 | https://peps.python.org/pep-0526/ | 2026-11-25 | HIGH |
| 5 | Sintaks union `int \| str` lewat PEP 604, dibuat 28-Aug-2019, Python 3.10 | PEP 604 – Allow writing union types as X \| Y, PSF, 2019 | https://peps.python.org/pep-0604/ | 2026-11-25 | HIGH |
| 6 | Dropbox: eksperimen mypy di Hack Week 2014; PEP 484 rilis bersama Python 3.5 tahun 2015; tim mypy 3 orang akhir 2015; ±420.000 baris beranotasi akhir 2016; hampir 4 juta baris bertipe statis dalam sekitar 3 tahun; mypy = "verified documentation"; contoh bug khas: lupa menangani None; cek tipe penuh sering "a fraction of a second" vs tes puluhan detik–menit; mypyc ±4x lebih cepat | Our journey to type checking 4 million lines of Python, Jukka Lehtosalo (Dropbox Tech Blog), 5 Sep 2019 | https://dropbox.tech/application/our-journey-to-type-checking-4-million-lines-of-python | 2026-11-25 | HIGH |
| 7 | Jukka Lehtosalo mulai mengerjakan mypy tahun 2012; mypy dibuat saat ia mahasiswa PhD di University of Cambridge Computer Laboratory; berakar dari bahasa Alore | About mypy, mypy project, (halaman proyek, tanpa tahun) | https://mypy-lang.org/about.html | 2026-11-25 | MEDIUM |
