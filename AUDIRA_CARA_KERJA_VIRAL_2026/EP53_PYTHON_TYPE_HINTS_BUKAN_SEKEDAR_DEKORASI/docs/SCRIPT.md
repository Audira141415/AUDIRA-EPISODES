# Naskah — Python Type Hints: Bukan Sekedar Dekorasi

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **13** · estimasi **6 dtk**
- Visual: Layar editor gelap: baris `def bayar(jumlah: int)` dipanggil dengan `"lima ribu"`; teks bertabrakan, Python tetap hijau 'running'. HUD chip: TIPE ≠ ISI.

> Kode Python kamu bisa bohong. Tertulis angka, isinya teks, dan Python diam saja.

## c01_intro — Intro

- Kata: **25** · estimasi **11 dtk**
- Visual: Garis waktu horizontal: chip PEP 3107 (2006) redup, lalu chip besar PEP 484 · Python 3.5 · 2015 menghentak; potongan kode anotasi menyala. Callout HUD: 3.5 / 2015.

> Sejak Python 3.5 tahun 2015, lewat PEP 484, kamu bisa menulis tipe data langsung di kode. Namanya type hints. Banyak orang mengira ini cuma hiasan.

## c02 — Python tidak memeriksa

- Kata: **23** · estimasi **10 dtk**
- Visual: Diagram alur program: paket data berlabel `int` membawa isi teks lolos gerbang runtime tanpa dicek, berjalan lewat pipa, lalu meledak (ikon error) di modul lain jauh di hilir.

> Dan memang, Python sendiri tidak memeriksa tipe itu saat program jalan. Tulis int, kirim teks, program tetap jalan, lalu meledak di tempat lain.

## c03 — Masuk mypy

- Kata: **30** · estimasi **13 dtk**
- Visual: Name plate teks 'Jukka Lehtosalo · Cambridge · 2012' (tanpa wajah); kaca pembesar/pemindai menyapu kode yang DIAM (tidak dijalankan), mencentang tiap pasangan tipe. Callout HUD: 2012.

> Di sinilah mypy masuk. Alat ini mulai dibuat Jukka Lehtosalo tahun 2012, waktu ia kuliah doktoral di Cambridge. Mypy membaca kodemu tanpa menjalankannya, lalu mencocokkan setiap tipe yang kamu janjikan.

## c04 — Skala Dropbox

- Kata: **25** · estimasi **11 dtk**
- Visual: Tumpukan blok baris kode tumbuh jadi menara: penghitung 420.000 (2016) naik ke ~4.000.000 (per 2019). Label teks 'Dropbox' polos, tanpa logo.

> Dropbox membuktikannya di skala raksasa. Akhir 2016 baru sekitar 420 ribu baris. Dalam sekitar tiga tahun, hampir 4 juta baris Python mereka sudah diperiksa tipenya.

## c05 — Bug None

- Kata: **23** · estimasi **10 dtk**
- Visual: Close-up satu baris `user.name` dengan `user` = None; mypy menyorot merah sebelum tombol 'Rilis'. Split stopwatch: cek tipe < 1 dtk vs tes berjalan menit.

> Bug yang paling sering ketangkap? Lupa menangani nilai None. Mypy menemukannya sebelum kode dirilis, sering kurang dari sedetik, sementara tes bisa makan menit.

## c06 — Komentar vs type hints

- Kata: **28** · estimasi **12 dtk**
- Visual: Dua kartu berdampingan: komentar `# returns int` menguning dan retak (basi) saat kode berubah; type hint dipantau mypy langsung menyala merah 'protes' ketika tipe tak cocok.

> Bedanya dengan komentar biasa: komentar bisa basi tanpa ada yang sadar. Type hints yang diperiksa mypy tidak. Begitu kode berubah dan tipenya tak cocok lagi, mypy langsung protes.

## c07_payoff — Payoff + outro

- Kata: **31** · estimasi **13 dtk**
- Visual: Pipeline pull request: tiap PR lewat gerbang mypy hijau, tumpukan dokumentasi bercap 'TERVERIFIKASI'; hero shot, lalu outro card AUDIRA.

> Syaratnya satu: jalankan mypy rutin, misalnya di setiap pull request. Tanpa itu, type hints cuma tulisan. Dengan itu, kodemu punya dokumentasi yang tidak pernah bohong. Ikuti AUDIRA untuk bedah kode berikutnya.

## Opsi hook lain

1. Tulis `int`, kirim teks, dan Python tidak protes sama sekali.
2. Komentar di kodemu mungkin sudah bohong sejak tahun lalu.

## Total

- **198 kata** ≈ **85 dtk**
