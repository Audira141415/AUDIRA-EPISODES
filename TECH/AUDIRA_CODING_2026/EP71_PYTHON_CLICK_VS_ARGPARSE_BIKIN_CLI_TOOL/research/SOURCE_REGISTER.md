# Source Register — Python Click vs argparse: Bikin CLI Tool yang Layak Pakai

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | argparse ada di pustaka standar Python; docs menyebutnya "default recommended" untuk aplikasi baris perintah dasar; membuat help/usage otomatis | argparse — Parser for command-line options, Python Software Foundation (docs Python 3) | https://docs.python.org/3/library/argparse.html | 2026-11-25 | HIGH |
| 2 | argparse masuk pustaka standar di Python 2.7 dan 3.2 (menggantikan getopt/optparse sebagai usulan) | PEP 389 — argparse: New Command Line Parsing Module, Steven Bethard, Python.org | https://peps.python.org/pep-0389/ | 2026-11-25 | HIGH |
| 3 | Click tidak berbasis argparse karena argparse tidak mengizinkan penyarangan (nesting) perintah yang benar; Click fully nestable & composable, baca env variable dan file bawaan | Why Click?, Pallets, Click Documentation | https://click.palletsprojects.com/en/stable/why/ | 2026-11-25 | HIGH |
| 4 | Click: "Command Line Interface Creation Kit", dekorator, nesting perintah, halaman help otomatis | Click Documentation, Pallets | https://click.palletsprojects.com/en/stable/ | 2026-11-25 | HIGH |
| 5 | Rilis pertama Click 0.1 pada 2014-04-28 (PyPI) | click, rilis di PyPI, Pallets | https://pypi.org/project/click/ (JSON: https://pypi.org/pypi/click/json) | 2026-11-25 | HIGH |
| 6 | Repo pallets/click: 17.847 bintang, lisensi BSD-3-Clause (per 2026-11-25) | GitHub API repos/pallets/click | https://github.com/pallets/click | 2026-11-25 | MEDIUM |
| 7 | Typer: pustaka CLI "based on Python type hints" | Typer docs, Sebastián Ramírez | https://typer.tiangolo.com/ | 2026-11-25 | MEDIUM |
| 8 | Paket mendaftarkan `console_scripts` entry point; installer seperti pip memasang perintahnya | Entry points specification, Python Packaging Authority | https://packaging.python.org/en/latest/specifications/entry-points/ | 2026-11-25 | HIGH |
| 9 | Docs Python punya panduan "Choosing an argument parsing library" (argparse vs alternatif) | optparse — Parser for command line options, Python Software Foundation | https://docs.python.org/3/library/optparse.html | 2026-11-25 | HIGH |
