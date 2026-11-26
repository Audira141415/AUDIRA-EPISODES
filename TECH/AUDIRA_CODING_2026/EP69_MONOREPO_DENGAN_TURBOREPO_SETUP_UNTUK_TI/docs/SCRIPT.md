# Naskah — Monorepo dengan Turborepo: Setup untuk Tim JavaScript

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **14** · estimasi **6 dtk**
- Visual: Layar terbelah: tiga kotak aplikasi dan satu kotak kode bersama menyatu jadi satu repo; jam build berputar cepat lalu berhenti.

> Satu repo, banyak aplikasi, dan build yang tidak makan waktu setengah hari. Begini caranya.

## c01_intro — Intro

- Kata: **24** · estimasi **10 dtk**
- Visual: Peta paket saling terhubung; tiga ikon tugas (tes, lint, build) menumpuk di tiap paket. Judul Turborepo muncul sebagai papan HUD.

> Namanya monorepo: semua aplikasi dan kode bersama di satu repositori. Tapi tiap paket punya tes, lint, dan build sendiri. Di AUDIRA, kita bedah Turborepo.

## c02 — Struktur folder

- Kata: **28** · estimasi **12 dtk**
- Visual: Pohon folder tumbuh: apps/ dan packages/, file pnpm-workspace.yaml dan turbo.json menyala. Callout HUD: turbo.json.

> Pondasinya workspace dari package manager, misalnya pnpm. Foldernya apps untuk aplikasi, packages untuk kode bersama. Turborepo duduk di atasnya, cukup baca scripts di package.json dan satu file, turbo.json.

## c03 — Daftar tugas dan paralel

- Kata: **21** · estimasi **9 dtk**
- Visual: Diagram alur tugas build lalu test; beberapa jalur CPU core menyala bersamaan, paket diproses paralel.

> Di turbo.json kamu daftarkan tugas, misalnya build lalu test. Turborepo menjadwalkannya dan menjalankan yang bisa bersamaan secara paralel di semua core.

## c04 — Cache berbasis hash

- Kata: **29** · estimasi **12 dtk**
- Visual: File input masuk mesin hash jadi sidik jari; laci cache menyimpan output dan log; run kedua stempel cache hit. Callout: hash, cache miss, cache hit.

> Trik utamanya cache. Turborepo menghitung hash dari input tugas. Run pertama itu cache miss: tugas jalan, output dan lognya disimpan. Run berikutnya dengan input sama cuma memulihkan hasil lama.

## c05 — Remote Cache

- Kata: **27** · estimasi **11 dtk**
- Visual: Laptop-laptop dan server CI terhubung ke awan cache bersama; label gratis dan self-host. Callout: Remote Cache gratis.

> Bawaannya cache itu lokal di satu mesin. Nyalakan Remote Cache, dan hasil dibagi ke seluruh tim dan CI. Versi Vercel gratis di semua paket, atau host sendiri.

## c06 — Jebakan umum

- Kata: **28** · estimasi **12 dtk**
- Visual: Laci cache kosong dengan tanda seru pada kunci outputs; log terminal masuk kotak artefak bergembok.

> Catatan: tugas yang tidak mendeklarasikan outputs tidak menyimpan file hasilnya, jadi cache hit pun tidak mengembalikan file apa-apa. Dan log ikut disimpan sebagai artefak, jadi jangan cetak rahasia.

## c07_payoff — Payoff + outro

- Kata: **26** · estimasi **11 dtk**
- Visual: Hero shot: monorepo rapi bersinar, build tertulis selesai; kartu tahun 2021 muncul; outro card AUDIRA.

> Vercel mengakuisisi Turborepo pada Desember 2021. Satu repo, satu cache, satu tim yang kompak. Kode bersama, tanpa kekacauan bersama. Follow AUDIRA untuk bedah alat developer lainnya.

## Opsi hook lain

1. Satu repo bisa membuat build kamu lambat, atau secepat kilat. Bedanya satu file.
2. Kode yang sama, build yang sama, kenapa harus dijalankan dua kali?

## Total

- **197 kata** ≈ **82 dtk**
