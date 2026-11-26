# Research Report — Python Click vs argparse: Bikin CLI Tool yang Layak Pakai

Riset 2026-11-25 (WebFetch gagal, dipakai curl + docs resmi + API publik PyPI/GitHub).

## Sumber utama
- Docs Python argparse (#1) dan PEP 389 (#2): posisi argparse di stdlib.
- Docs Click "Why Click?" (#3) dan beranda (#4): alasan desain Click.
- PyPI + GitHub (#5, #6), Typer (#7), spesifikasi entry points PyPA (#8), docs optparse (#9).

## Fakta terverifikasi
1. argparse ada di pustaka standar; docs menyebutnya modul "default recommended" untuk aplikasi baris perintah dasar, dengan catatan penulis yang butuh kontrol lebih ketat bisa memakai alternatif (#1).
2. argparse masuk stdlib di Python 2.7 dan 3.2 lewat PEP 389 (#2). Naskah memakai "sejak 3.2" (Python 3).
3. argparse membuat pesan help dan usage otomatis (#1).
4. Click: "Command Line Interface Creation Kit", memakai dekorator, perintah bisa disarang sembarang tingkat, help otomatis (#4).
5. Menurut docs Click, Click tidak berbasis argparse karena argparse tidak mengizinkan nesting yang benar; Click memiliki parser sendiri (#3).
6. Click membaca nilai dari variabel lingkungan dan menangani file bawaan (#3).
7. Rilis pertama Click 0.1: 2014-04-28 (#5). Versi stabil di PyPI saat dibaca: 8.5.1 (2026-11-06) (#5).
8. Repo pallets/click 17.847 bintang per 2026-11-25 (#6).
9. Typer berbasis type hints Python (#7).
10. `console_scripts` entry point membuat perintah terpasang oleh pip (#8).

## Perselisihan / Kontroversi
- Judul "Click vs argparse" akurat. Hook tidak keliru, tetapi "orang lain mau pakai" bersifat opini; naskah memakai hook "tidak tahu cara menjalankannya".
- Klaim "argparse tidak bisa nesting" adalah posisi docs Click, bukan fakta mutlak: argparse punya `add_subparsers()`. Naskah menulis "Menurut dokumentasi Click" agar atribusi jelas.
- Click docs "stable" menampilkan seri 8.6.x sementara PyPI menunjukkan 8.5.1: versi tidak disebut di VO.
- Docs Click lama menyebut Click berbasis optparse, docs sekarang menyebut parser sendiri: VO hanya bilang "parser sendiri".

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| Python 3.2 | argparse masuk stdlib | 2 |
| April 2014 | rilis pertama Click | 5 |
| 17 ribu+ bintang (per 25 Nov 2026) | popularitas repo | 6 |
| argparse, Click, Typer, Pallets | nama pustaka/tim | 1, 3, 7 |
| console_scripts | cara jadi perintah terpasang | 8 |

## Poin kunci
- Script jadi tool = antarmuka: perintah, help otomatis, error jelas, instalasi.
- argparse: tanpa dependensi, bawaan. Click: dekorator, nesting, env var.
- Pilih berdasar kebutuhan, bukan klaim menang mutlak.
- Angka bintang bisa berubah; tulis tanggal.
