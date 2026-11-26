# Naskah — Cara Nulis Commit Message yang Bagus: Conventional Commits

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **24** · estimasi **10 dtk**
- Visual: Layar terminal penuh baris git log berisi 'fix', 'update', 'asdf'; satu baris disorot merah.

> Enam bulan lagi kamu buka git log, isinya cuma fix, update, asdf. Bug muncul, kamu buta. Di AUDIRA, kita bahas commit message yang menyelamatkanmu.

## c01_intro — Intro

- Kata: **29** · estimasi **12 dtk**
- Visual: Dua kolom log: kiri berantakan, kanan rapi; panah dari kolom kanan ke ikon kaca pembesar.

> Diff cuma kasih tahu apa yang berubah. Alasannya? Cuma commit message yang bisa cerita. Pada 2014, developer bernama cbeams merangkum tujuh aturan commit message yang masih dipakai sampai sekarang.

## c02 — Bab 1: Subjek dan badan

- Kata: **31** · estimasi **13 dtk**
- Visual: Kartu commit dibelah: baris subjek di atas, baris kosong, badan di bawah; HUD angka 50 dan 72.

> Mulai dari bentuknya. Baris pertama itu subjek, sekitar 50 karakter. Lalu satu baris kosong. Baru badan pesan, dipotong sekitar 72 karakter per baris. Tanpa baris kosong, log dan rebase bisa bingung.

## c03 — Bab 2: Kalimat perintah

- Kata: **25** · estimasi **11 dtk**
- Visual: Dua kartu commit berdampingan: 'Fixed bug' dicoret, 'Fix bug' dicentang; ikon tombol Merge dan Revert.

> Tulis subjek dalam kalimat perintah. Fix bug, bukan fixed bug. Anggap kamu menyuruh kodenya berubah. Git sendiri begitu, lihat pesan bawaan Merge branch atau Revert.

## c04 — Bab 3: Format Conventional Commits

- Kata: **24** · estimasi **10 dtk**
- Visual: Papan rumus: tipe, tanda kurung scope, titik dua, deskripsi; label tipe feat dan fix muncul satu per satu.

> Lapisan berikutnya: Conventional Commits. Rumusnya: tipe, scope dalam kurung, titik dua, deskripsi. Fix menambal bug. Feat menambah fitur. Ada juga docs, refactor, dan test.

## c05 — Bab 4: Versi otomatis

- Kata: **28** · estimasi **12 dtk**
- Visual: Tiga roda gigi bertulis PATCH, MINOR, MAJOR; kartu BREAKING CHANGE jatuh ke roda MAJOR.

> Kerennya, tipe ini nyambung ke Semantic Versioning. Fix berarti PATCH. Feat berarti MINOR. Footer BREAKING CHANGE, atau tanda seru setelah tipe, berarti MAJOR. Versi rilis bisa ditentukan otomatis.

## c06 — Penjelasan: Tulis alasannya

- Kata: **21** · estimasi **9 dtk**
- Visual: Bagian dalam badan commit disorot: dua kalimat 'masalahnya' dan 'kenapa', baris 'bagaimana' memudar.

> Isi badan pesan itu apa dan kenapa, bukan bagaimana. Panduan kernel Linux minta pesannya tetap jelas dibaca berbulan-bulan, bahkan bertahun-tahun kemudian.

## c07_payoff — Payoff + outro

- Kata: **24** · estimasi **10 dtk**
- Visual: Git log rapi berjajar feat, fix, docs; kaca pembesar menunjuk satu baris; kartu outro AUDIRA.

> Rumusnya sederhana. Subjek pendek, perintah, satu baris kosong, alasan di badan. Enam bulan lagi, dirimu sendiri bakal berterima kasih. Ikuti AUDIRA untuk trik developer.

## Opsi hook lain

1. Git log kamu isinya 'fix' semua? Itu bom waktu.
2. Satu baris commit bisa menghemat satu jam debugging. Ini caranya.

## Total

- **206 kata** ≈ **87 dtk**
