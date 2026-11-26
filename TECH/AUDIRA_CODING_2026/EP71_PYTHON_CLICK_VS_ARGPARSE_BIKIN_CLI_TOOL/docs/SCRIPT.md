# Naskah — Python Click vs argparse: Bikin CLI Tool yang Layak Pakai

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **14** · estimasi **6 dtk**
- Visual: Layar terminal gelap: kursor berkedip, file `script.py` jalan. Muncul ikon orang (siluet tanpa wajah) bingung di depan terminal, tanda tanya di atas kepala.

> Script Python kamu jalan di laptopmu. Tapi orang lain bahkan tidak tahu cara menjalankannya.

## c01_intro — Intro

- Kata: **25** · estimasi **11 dtk**
- Visual: Split layar: kiri script mentah, kanan tool rapi dengan nama perintah, blok bantuan, dan pesan error. Label HUD `AUDIRA CLI LAB` di panel (brand dalam adegan). Dua kartu `argparse` vs `Click` masuk.

> Beda script dan tool cuma satu: antarmukanya. Ada nama perintah, bantuan otomatis, dan pesan error jelas. Di AUDIRA, kita adu dua jalannya: argparse dan Click.

## c02 — argparse: bawaan Python

- Kata: **31** · estimasi **13 dtk**
- Visual: Kotak berlabel `Python stdlib` berisi modul `argparse`. HUD callout `Python 3.2`. Baris kode `ArgumentParser` diketik per kata; blok output `--help` muncul otomatis.

> Pertama, argparse. Dia ada di pustaka standar Python sejak versi 3.2, jadi tidak perlu install apa-apa. Dokumentasi Python menyebutnya pilihan yang direkomendasikan untuk aplikasi baris perintah dasar. Bantuan help dibuat otomatis.

## c03 — Click: dekorator di atas fungsi

- Kata: **35** · estimasi **15 dtk**
- Visual: Fungsi Python biasa dibungkus lapisan dekorator `@click.command()` yang menempel dengan animasi. Callout HUD `April 2014` dan `17 ribu+ bintang (per 25 Nov 2026)` dengan ikon bintang generik.

> Kedua, Click, buatan Pallets. Rilis pertamanya April 2014. Kamu cukup memasang dekorator di atas fungsi biasa, dan satu fungsi jadi satu perintah. Per 25 November 2026, repositorinya punya lebih dari 17 ribu bintang di GitHub.

## c04 — Perintah bertingkat

- Kata: **32** · estimasi **14 dtk**
- Visual: Diagram pohon: `git` jadi akar, cabang `commit` dan `push` (teks saja, tanpa logo). Cabang Click bertumbuh sampai 3 tingkat; cabang argparse tersendat dengan penanda tanda seru.

> Bedanya terasa di perintah bertingkat, seperti git commit dan git push. Menurut dokumentasi Click, argparse tidak mengizinkan penyarangan yang benar, makanya Click punya parser sendiri. Grup perintah bisa disarang sedalam apa pun.

## c05 — Bonus Click dan Typer

- Kata: **18** · estimasi **8 dtk**
- Visual: Tiga ikon: variabel lingkungan (`ENV=...` mengalir ke opsi), berkas, dan kartu `Typer` dengan anotasi tipe `int`, `str` melayang di atas fungsi.

> Click juga membaca variabel lingkungan dan menangani file tanpa kode tambahan. Ada pula Typer, berbasis petunjuk tipe Python.

## c06 — Pilih yang mana

- Kata: **32** · estimasi **14 dtk**
- Visual: Bagan keputusan dua jalur: tool kecil ke argparse, perintah bertingkat ke Click. Lalu `pyproject.toml` dengan `console_scripts` memunculkan perintah di terminal baru lewat `pip install`.

> Jadi pilih yang mana? Tool kecil tanpa dependensi, pakai argparse. Perintah bertingkat, pakai Click. Apa pun pilihanmu, daftarkan fungsinya sebagai console scripts di paket, dan pip memasang perintahnya di komputer siapa pun.

## c07_payoff — Payoff + outro

- Kata: **22** · estimasi **10 dtk**
- Visual: Script awal berubah jadi tool: terminal menampilkan `mytool --help` rapi, lalu ikon laptop-laptop lain menjalankannya. Outro card AUDIRA, Created by Agus Dwi R.

> Script tadi sekarang punya nama perintah, bantuan otomatis, dan bisa diinstal. Itu beda hobi dan tool. Ikuti AUDIRA untuk bedah kode berikutnya.

## Opsi hook lain

1. Beda script dan tool cuma satu: antarmukanya.
2. argparse sudah ada di laptopmu sejak Python 3.2. Kamu tinggal memakainya.

## Total

- **209 kata** ≈ **91 dtk** (±86 dtk @145 WPM)
