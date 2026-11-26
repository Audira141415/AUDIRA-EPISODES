# Naskah — Cara Kerja JWT Token yang Kebanyakan Developer Salah Pahami

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **14** · estimasi **6 dtk**
- Visual: Layar gelap, selembar token panjang tiga warna melayang; huruf kunci bergetar. HUD: "JWT".

> Token JWT di aplikasimu bukan brankas. Isinya terbuka, dan bisa dipalsukan kalau setelanmu salah.

## c01_intro — Intro

- Kata: **23** · estimasi **10 dtk**
- Visual: Panel kode: sebuah request login, token berpindah dari server ke browser dalam kapsul. HUD: "RFC 7519 · Mei 2015".

> Di AUDIRA kali ini kita bongkar JWT. Standarnya terbit Mei 2015, RFC 7519, dan dipakai luas buat login. Tapi cara kerjanya sering disalahpahami.

## c02 — Anatomi token

- Kata: **30** · estimasi **12 dtk**
- Visual: Token dibelah jadi tiga blok berlabel Header, Payload, Signature, dipisah tiga titik bercahaya. HUD: "3 bagian".

> Sebuah JWT terdiri dari tiga bagian yang dipisah titik. Header, payload, dan signature. Header dan payload cuma di-encode pakai base64url. Itu bukan enkripsi, siapa pun yang pegang token bisa membacanya.

## c03 — Kesalahan pertama

- Kata: **22** · estimasi **9 dtk**
- Visual: Amplop transparan berisi kartu data; ikon gembok palsu retak di atasnya.

> Kesalahan pertama: menaruh data sensitif di payload karena dikira terkunci. Signature menjaga keutuhan isi, bukan kerahasiaannya. Mau rahasia, pakai JWE, versi terenkripsi.

## c04 — Algoritma none

- Kata: **33** · estimasi **14 dtk**
- Visual: Header token diedit: tulisan alg berganti jadi "none", kolom signature mengosong. HUD: alg = none.

> Kesalahan kedua lebih berbahaya. Header memuat field alg, algoritma tanda tangan. Spesifikasi mengenal nilai none, artinya tanpa tanda tangan. Beberapa library dulu menerimanya sebagai token sah. Penyerang tinggal ubah payload dan kosongkan signature.

## c05 — Tertukar kunci

- Kata: **30** · estimasi **12 dtk**
- Visual: Dua kunci bersebelahan: kunci publik berlabel RSA diubah jadi gembok HMAC. HUD: RS256 menjadi HS256.

> Ada juga serangan tertukar RSA dan HMAC, dipublikasikan Tim McLean pada 2015. Penyerang ubah alg jadi HS256, lalu pakai kunci publik sebagai rahasia HMAC. Server yang percaya header menganggapnya valid.

## c06 — Penjelasan: cara aman

- Kata: **30** · estimasi **12 dtk**
- Visual: Daftar centang menyala satu per satu: algoritma, exp, issuer, audience. HUD: RFC 8725 · Februari 2020.

> Obatnya ada di RFC 8725, terbit Februari 2020. Server menentukan sendiri algoritma yang diizinkan, jangan percaya header. Periksa juga kedaluwarsa exp, issuer, dan audience. Gagal satu saja, tolak seluruh token.

## c07_payoff — Payoff + outro

- Kata: **25** · estimasi **10 dtk**
- Visual: Token sehat berstempel hijau melewati gerbang; kartu outro AUDIRA muncul.

> JWT aman kalau dipakai benar, bukan aman dari sananya. Jangan taruh rahasia di dalamnya, kunci algoritmanya, validasi semua klaim. Ikuti AUDIRA untuk bedah teknologi lainnya.

## Opsi hook lain

1. Satu karakter di header, dan server percaya token palsu. Ini bug JWT paling terkenal.
2. Payload JWT-mu bisa dibaca siapa saja. Kamu sudah tahu?

## Total

- **207 kata** ≈ **86 dtk**
