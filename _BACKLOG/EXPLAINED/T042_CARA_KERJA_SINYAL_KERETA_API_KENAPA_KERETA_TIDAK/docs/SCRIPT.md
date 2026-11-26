# Naskah — Cara Kerja Sinyal Kereta Api: Kenapa Kereta Tidak Bertabrakan

> DRAF pra-produksi (backlog, 2026-11-27). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **21** · estimasi **9 dtk**
- Visual: Top-down jalur rel panjang terpotong jadi petak-petak berwarna; satu kereta generik (tanpa logo operator) masuk satu petak, petak itu menyala merah, kereta kedua di belakang tertahan di garis petak. HUD chip: "1 blok = 1 kereta" (#2, #9).

> Rel kereta dibagi jadi petak-petak blok. Dalam kondisi normal, satu blok cuma boleh diisi satu kereta. Ini Audira, kita bongkar caranya.

## c01_intro — Intro

- Kata: **20** · estimasi **8 dtk**
- Visual: Kereta melaju di lintasan lurus; garis jarak pengereman memanjang di depan lokomotif, melewati tikungan yang menutupi pandangan masinis (siluet, tanpa wajah). HUD: "jarak pengereman bisa beberapa km" (#9).

> Kereta itu berat, jarak pengeremannya bisa beberapa kilometer. Masinis tidak bisa mengandalkan mata saja, jadi jalur dipotong-potong dan dijaga sinyal.

## c02 — Petak blok

- Kata: **30** · estimasi **12 dtk**
- Visual: Diagram jalur antar dua stasiun: sinyal masuk, sinyal blok, sinyal keluar; batas petak ditandai garis putih. Kereta belakang menunggu sampai petak depan kosong, lalu sinyalnya berganti. HUD kartu dokumen generik "PM 44/2018" (tanpa logo kementerian) (#1, #2).

> Di Indonesia, aturannya ada di Peraturan Menteri Perhubungan nomor 44 tahun 2018. Satu petak blok dibatasi dua sinyal berurutan. Kereta belakang baru boleh masuk kalau petak di depannya sudah kosong.

## c03 — Pendeteksi kereta

- Kata: **39** · estimasi **16 dtk**
- Visual: Cutaway rel: arus listrik (garis menyala) mengalir di dua rel ke kotak relai; roda dan gandar baja masuk, arus "dipotong pendek", relai jatuh, lampu petak berubah merah. Lalu split: sensor di ujung petak menghitung gandar masuk "1, 2, 3, 4" dan keluar "4" → hijau. HUD: "track circuit" dan "axle counter" (#5, #10, #11).

> Lalu bagaimana sistem tahu petak itu kosong? Pertama, track circuit: listrik dialirkan lewat rel, dan roda baja kereta membuat arusnya terhubung pendek, jadi relai tahu ada kereta. Kedua, axle counter menghitung gandar masuk dan keluar. Jumlahnya sama, berarti kosong.

## c04 — Warna sinyal

- Kata: **16** · estimasi **7 dtk**
- Visual: Close-up tiang sinyal elektrik tiga lampu; tiap lampu menyala bergantian dengan label kinetik. HUD tiga kartu: "HIJAU = berjalan", "KUNING = hati-hati", "MERAH = berhenti" (#4).

> Hasil deteksinya tampil di sinyal. Di Indonesia, hijau artinya berjalan, kuning berjalan hati-hati, dan merah berhenti.

## c05 — Interlocking

- Kata: **32** · estimasi **13 dtk**
- Visual: Emplasemen stasiun dari atas: dua rute yang bersilangan; wesel bergeser, satu rute menyala, rute lain terkunci dengan ikon gembok. Lalu kabel putus: sistem langsung menampilkan petak "terisi", sinyal merah. HUD: "interlocking", "gagal-aman" (#3, #10, #12).

> Di stasiun ada interlocking. Sistem ini mengunci wesel dan sinyal, jadi dua rute yang bertentangan tidak bisa dibuka bersamaan. Kalau kabel putus, rancangannya gagal-aman: sistem menganggap ada kereta, dan sinyal tetap merah.

## c06 — Moving block

- Kata: **29** · estimasi **12 dtk**
- Visual: Jalur layang modern generik; garis-garis blok tetap memudar, diganti "gelembung" zona aman yang ikut bergerak di belakang tiap kereta; gelombang radio dari kereta ke menara. HUD: "CBTC", "moving block", "LRT Jabodebek: GoA 3" (#6, #13, #14).

> Tapi tidak semua jalur memakai blok tetap. LRT Jabodebek memakai CBTC. Posisi kereta dikirim lewat radio terus-menerus, jadi bloknya ikut bergerak bersama kereta, dan jarak antarkereta bisa lebih rapat.

## c07_payoff — Payoff + outro

- Kata: **22** · estimasi **9 dtk**
- Visual: Kamera naik tinggi: seluruh jaringan rel menyala, petak blok, pendeteksi, interlocking, dan sinyal terhubung seperti satu sirkuit emas; kereta-kereta bergerak berjarak aman. Outro card AUDIRA.

> Jadi kereta tidak berjalan mengandalkan keberuntungan. Ada petak blok, pendeteksi, interlocking, dan sinyal yang saling mengunci. Ikuti Audira untuk cara kerja berikutnya.

## Opsi hook lain

1. Masinis sering tidak bisa melihat kereta di depannya. Yang menjaganya adalah listrik kecil yang mengalir di rel.
2. Kereta butuh jarak pengereman berkilometer, jadi rel dipotong-potong. Begini cara kereta antre tanpa saling tabrak.

## Total

- **209 kata** ≈ **86 dtk** (@145 WPM; 84–93 dtk di 135–150 WPM)
