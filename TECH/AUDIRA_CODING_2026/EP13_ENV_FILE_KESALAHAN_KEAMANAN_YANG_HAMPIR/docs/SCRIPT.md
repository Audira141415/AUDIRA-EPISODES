# Naskah — .env File: Kesalahan Keamanan yang Hampir Semua Junior Developer Lakukan

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **17** · estimasi **7 dtk**
- Visual: Layar editor gelap, baris `API_KEY=` mengetik sendiri, tombol commit ditekan; kunci bercahaya meluncur keluar layar menuju globe jaringan.

> Satu baris di file .env, satu commit ceroboh, dan kunci rahasiamu bisa dibaca siapa saja di internet.

## c01_intro — Intro

- Kata: **29** · estimasi **12 dtk**
- Visual: Folder proyek: file kode di kiri, file .env bergembok di kanan dengan label "RAHASIA"; panah repo publik menyala merah.

> File .env itu tempat menyimpan password database dan API key, dipisah dari kode. Idenya bagus. Masalahnya, file ini sering ikut ter-commit ke repositori publik. AUDIRA bedah kesalahan klasik ini.

## c02 — Skala masalah

- Kata: **35** · estimasi **15 dtk**
- Visual: Peta dunia gelap, ribuan titik kunci menyala; penghitung HUD naik ke 23,8 JUTA; lalu kartu HUD 70% di atas kalender 2022.

> Seberapa sering? Menurut GitGuardian, sepanjang 2024 ada 23,8 juta rahasia baru bocor di GitHub publik. Lebih parah lagi, 70 persen rahasia yang bocor tahun 2022 masih aktif saat laporannya terbit. Bocor, tapi tidak pernah diganti.

## c03 — Kasus Toyota

- Kata: **32** · estimasi **14 dtk**
- Visual: Mobil generik tanpa logo terhubung ke server; potongan kode melayang di repo publik; garis waktu Des 2017 → 15 Sep 2022; HUD 296.019.

> Contoh nyata: Toyota. Sebagian kode situs T-Connect terunggah ke GitHub, lengkap dengan kunci akses ke server data pelanggan. Kunci itu terbuka dari Desember 2017 sampai 15 September 2022. Data 296.019 pelanggan berisiko.

## c04 — Kasus Uber

- Kata: **28** · estimasi **12 dtk**
- Visual: Gudang awan penyimpanan; kunci jatuh dari halaman berbagi kode; berkas data mengalir keluar; HUD 2016 dan 25 JUTA.

> Uber juga pernah kena. Tahun 2016, menurut FTC, seorang insinyurnya memposting kunci akses di situs berbagi kode. Penyusup memakainya untuk mengunduh lebih dari 25 juta nama dan email.

## c05 — Jebakan hapus

- Kata: **24** · estimasi **10 dtk**
- Visual: Riwayat commit sebagai rantai blok; blok .env dihapus di ujung rantai, tapi blok lama tetap menyala; stiker .gitignore memantul dari file yang sudah dilacak.

> Lalu jebakannya. Menghapus file di commit berikutnya tidak cukup, karena riwayat Git masih menyimpannya. Dan .gitignore tidak berlaku untuk file yang sudah dilacak Git.

## c06 — Penjelasan: cara aman

- Kata: **23** · estimasi **10 dtk**
- Visual: Checklist tiga langkah: kunci lama dicoret dan dibuang, kunci baru keluar, baris `.env` masuk daftar .gitignore.

> Jadi, menurut dokumentasi GitHub, langkah pertama adalah cabut dan ganti kuncinya, baru bersihkan riwayat. Setelah itu, masukkan .env ke .gitignore sebelum commit pertama.

## c07_payoff — Payoff + outro

- Kata: **21** · estimasi **9 dtk**
- Visual: Gerbang push tertutup perisai hijau, kunci memantul dan tertahan di luar; kartu outro AUDIRA.

> GitHub juga punya push protection yang memblokir kunci sebelum terkirim. Ingat aturannya: kunci bocor berarti kunci hangus. Ganti dulu, baru rapikan.

## Opsi hook lain

1. Kamu sudah hapus file .env dari GitHub? Sayangnya kuncinya masih bisa dibaca.
2. Kunci akses Toyota terbuka di GitHub hampir lima tahun, dan nggak ada yang sadar.

## Total

- **209 kata** ≈ **90 dtk**
