# Naskah — Python Virtual Environment: Kenapa Kamu Harus Berhenti Pakai System Python

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **20** · estimasi **8 dtk**
- Visual: terminal gelap, kursor mengetik `pip install`, Enter; layar retak merah, ikon folder project lain dan ikon alat sistem ikut padam. HUD: `pip install`.

> Satu perintah pip install bisa bikin project lain kamu rusak, bahkan alat bawaan sistem operasi. Ini AUDIRA, kita bongkar kenapa.

## c01_intro — Intro

- Kata: **20** · estimasi **8 dtk**
- Visual: diagram laptop terbuka; di dalamnya satu blok "Python bawaan" yang disambung kabel ke ikon alat sistem (updater, installer). Label HUD "system Python".

> Di Linux, Python biasanya sudah terpasang dari awal. Itu system Python. Masalahnya, sistem operasi juga memakainya untuk menjalankan alat-alatnya sendiri.

## c02 — Satu lemari paket

- Kata: **28** · estimasi **12 dtk**
- Visual: satu lemari rak berisi kotak paket; dua folder project (A, B) menarik kotak yang sama. Kotak "v1" diganti "v2", folder A retak. Callout HUD "v1 vs v2".

> Misalnya project A butuh library versi satu, project B butuh versi dua. Di system Python cuma ada satu lemari paket. Begitu versi dua masuk, project A langsung patah.

## c03 — Kasus Fedora

- Kata: **27** · estimasi **11 dtk**
- Visual: kartu dokumen PEP bergaya kertas teknis (tanpa logo) bertuliskan "PEP 668"; zoom ke terminal `dnf` yang menampilkan error. HUD: `PEP 668`, `dnf`.

> Ini bukan teori. Dokumen resmi Python, PEP 668, mencatat contohnya: pip install bisa merusak perintah dnf di Fedora, alat untuk memperbarui sistem itu sendiri. Memulihkannya juga susah.

## c04 — Distro mulai menolak

- Kata: **27** · estimasi **11 dtk**
- Visual: gerbang/palang pintu menutup di depan kotak paket; terminal menampilkan teks error externally-managed (teks generik, tanpa logo distro). HUD: "Debian 12", chip `--break-system-packages` berkedip kuning.

> Makanya sejak Debian 12, Python bawaan ditandai externally managed. Pip langsung menolak memasang paket ke situ. Jalan pintasnya ada, flag break system packages. Namanya saja sudah peringatan.

## c05 — Sejarah solusi

- Kata: **21** · estimasi **9 dtk**
- Visual: garis waktu horizontal: titik 2007 (kotak "virtualenv 0.8", name plate teks "Ian Bicking", tanpa foto) bergeser ke titik "Python 3.3" (kotak berubah jadi modul "venv"). HUD: "2007", "Python 3.3".

> Solusinya sudah lama ada. Tahun 2007, Ian Bicking merilis virtualenv. Lalu lewat PEP 405, Python 3.3 menjadikannya modul bawaan bernama venv.

## c06 — Cara kerja venv

- Kata: **29** · estimasi **12 dtk**
- Visual: terminal mengetik `python -m venv .venv`; dari satu lemari besar muncul beberapa lemari kecil terpisah, satu per folder project. Satu lemari dibuang ke tempat sampah lalu muncul lagi utuh. Ikon Git dengan tanda silang di atas folder `.venv`. HUD: `python -m venv`.

> Caranya cuma satu baris: python minus m venv, lalu aktifkan. Setiap project dapat lemari sendiri, paketnya tidak saling ganggu. Rusak? Hapus foldernya, bikin lagi. Dan jangan dimasukkan ke Git.

## c07_payoff — Payoff + outro

- Kata: **27** · estimasi **11 dtk**
- Visual: kamera mundur memperlihatkan deretan lemari kecil rapi, system Python di tengah utuh dan bersinar hijau; teks kinetik "1 project = 1 venv"; outro card AUDIRA.

> Jadi aturannya gampang: satu project, satu venv. System Python biar dipakai sistem operasi. Simpan video ini sebelum pip install berikutnya, dan ikuti AUDIRA buat cara kerja lainnya.

## Opsi hook lain

1. Error externally managed environment itu bukan bug. Itu Python yang lagi nyelametin laptop kamu.
2. Ada flag pip yang namanya break system packages. Dan orang tetap memakainya.

## Total

- **199 kata** ≈ **80–88 dtk** (@135–150 WPM)
