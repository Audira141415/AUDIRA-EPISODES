# Naskah — VS Code Extension yang Mengubah Cara Aku Coding

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **22** · estimasi **9 dtk**
- Visual: Dua kartu extension generik (tanpa ikon asli) naik seperti bar: "Prettier 73 juta+" menjulang, "Error Lens 10 juta+" pendek. Kamera zoom ke kartu pendek. HUD: "per Nov 2026".

> Extension yang paling mengubah cara aku coding cuma diinstal sepuluh juta kali. Kalah jauh dari Prettier, yang tembus tujuh puluh tiga juta.

## c01_intro — Intro

- Kata: **22** · estimasi **9 dtk**
- Visual: Lautan layar editor generik (tema gelap, tanpa logo) memenuhi frame; diagram lingkaran terisi sampai 75,9%. HUD callout "75,9% developer · SO Survey 2025".

> Survei Stack Overflow 2025 bilang, tujuh puluh lima koma sembilan persen developer pakai VS Code. Wajar kalau daftar extension kita mirip semua.

## c02 — Error Lens

- Kata: **35** · estimasi **14 dtk**
- Visual: Close-up satu baris kode dengan garis merah bergelombang; kursor mouse hover, tooltip kecil muncul. Lalu split: baris yang sama berubah merah penuh dan pesan error tertulis di ujung baris. HUD: "Error Lens · 2019".

> Namanya Error Lens, terbit tahun 2019. Biasanya error cuma jadi garis merah bergelombang, dan kamu harus arahkan kursor dulu buat baca pesannya. Error Lens mewarnai seluruh baris dan menulis pesannya langsung di ujung baris itu.

## c03 — GitLens

- Kata: **27** · estimasi **11 dtk**
- Visual: Kode bergulir; di samping tiap baris muncul label abu-abu "nama penulis · 3 hari lalu · commit a1b2c3" (nama fiktif, tanpa avatar wajah). Garis waktu commit memanjang ke belakang. HUD: "Git blame".

> Yang kedua, GitLens. Di samping tiap baris, dia menampilkan siapa yang terakhir mengubah kode itu, kapan, dan di commit mana. Jadi aku tahu harus bertanya ke siapa.

## c04 — Extension Host

- Kata: **24** · estimasi **10 dtk**
- Visual: Diagram dua ruang: jendela editor (UI) di depan, ruang mesin "Extension Host" di belakang berisi kotak-kotak extension yang berputar. Dinding kaca memisahkan keduanya. HUD: "Proses terpisah".

> Lalu kenapa puluhan extension nggak bikin editor lemot? Extension nggak jalan di jendela yang kamu lihat. Mereka jalan di proses terpisah bernama Extension Host.

## c05 — Activation events

- Kata: **19** · estimasi **8 dtk**
- Visual: Rak extension dalam keadaan tidur (lampu mati). File ".py" dibuka, satu kotak menyala dan meluncur ke editor. HUD kode: `onLanguage:python`.

> Dan mereka baru bangun saat dibutuhkan. Extension untuk Python, misalnya, bisa diatur baru aktif ketika kamu membuka file Python.

## c06 — Language server

- Kata: **27** · estimasi **11 dtk**
- Visual: Editor di kiri, menara "language server" di kanan; amplop pesan JSON-RPC melesat bolak-balik tiap tombol diketik. Satu amplop kembali membawa tanda error, lalu Error Lens memperbesarnya di baris. HUD: "JSON-RPC".

> Tanda error sendiri datang dari language server, proses terpisah lain. Tiap kamu mengetik, editor dan server bertukar pesan JSON-RPC. Error Lens cuma menampilkan hasilnya dengan lebih jelas.

## c07_payoff — Payoff + outro

- Kata: **27** · estimasi **11 dtk**
- Visual: Kembali ke grafik bar hook; kartu Error Lens diberi mahkota "paling berdampak" meski bar-nya pendek. Teks kinetik "langkah kecil × setiap hari". Outro card AUDIRA.

> Jadi extension terbaik bukan yang paling banyak diunduh, tapi yang memangkas langkah kecil yang kamu ulang setiap hari. Extension andalanmu apa? Tulis di komentar, dan ikuti AUDIRA.

## Opsi hook lain

1. Error di kodemu selama ini disembunyikan di balik garis merah. Satu extension membongkarnya.
2. Tujuh puluh tiga juta orang instal extension yang sama. Yang benar-benar mengubah kerjaku justru yang ini.

## Total

- **203 kata** ≈ **81–90 dtk** (@150–135 WPM)
