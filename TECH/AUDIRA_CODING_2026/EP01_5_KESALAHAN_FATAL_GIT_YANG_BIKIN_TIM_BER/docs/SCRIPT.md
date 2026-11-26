# Naskah — 5 Kesalahan Fatal Git yang Bikin Tim Berantem

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **13** · estimasi **5 dtk**
- Visual: terminal besar mengetik `git push --force`, lalu deretan kartu commit milik rekan setim terhapus satu per satu dari grafik branch; avatar tanpa wajah menoleh kaget.

> Satu perintah Git bisa menghapus kerjaan teman setimmu. Dan pelakunya sering nggak sadar.

## c01_intro — Intro

- Kata: **11** · estimasi **5 dtk**
- Visual: papan kanban dengan lima kartu peringatan bernomor 1–5 tertutup, satu per satu menyala merah; HUD "5 KESALAHAN".

> Ini lima kesalahan Git yang paling sering bikin satu tim ribut.

## c02 — Commit file rahasia

- Kata: **32** · estimasi **13 dtk**
- Visual: file `.env` berbentuk amplop berisi kunci API ikut masuk ke kotak commit dan terbang ke server; HUD callout "23,8 JUTA secret bocor · 2024" dengan name plate teks "GitGuardian" (tanpa logo); ikon kunci diputar (rotate).

> Pertama, commit file rahasia. Kunci API di file env ikut ke-push. Sepanjang 2024, GitGuardian mencatat 23,8 juta rahasia bocor di repo publik GitHub. Hapus commit-nya saja nggak cukup. Kuncinya harus langsung diganti.

## c03 — Force push ke branch bersama

- Kata: **32** · estimasi **13 dtk**
- Visual: grafik branch bersama; panah `--force` menimpa rantai commit rekan (commit berubah jadi abu-abu lalu hilang). Lalu perisai `--force-with-lease` muncul dan menolak push; HUD "lose commits" kutipan dok resmi.

> Kedua, force push ke branch bersama. Dokumentasi Git sendiri mengingatkan, ini bisa bikin commit di remote hilang. Pakai force with lease, biar Git menolak kalau ada kerjaan orang yang belum kamu tarik.

## c04 — Rebase branch publik

- Kata: **32** · estimasi **13 dtk**
- Visual: buku terbuka bertuliskan "Pro Git" (name plate teks), halaman aturan rebase disorot; rantai commit dicabut dan dipasang ulang dengan ID baru, sementara tiga laptop rekan menampilkan tanda konflik merah.

> Ketiga, rebase branch yang sudah dipakai orang lain. Buku Pro Git punya aturan tegas: jangan rebase commit yang sudah ada di luar repo kamu. Riwayatnya berubah, dan seluruh tim harus beresin konflik.

## c05 — Push langsung ke main

- Kata: **30** · estimasi **12 dtk**
- Visual: jalan tol "main" menuju gedung server; mobil commit melaju tanpa gerbang, server rack berkedip merah. Lalu gerbang tol "branch protection + review PR" dipasang dan mobil berhenti diperiksa.

> Keempat, push langsung ke main tanpa pull request. Kode belum dicek siapa pun. Kalau main dipakai buat deploy otomatis, di sinilah production bisa tumbang. Pasang branch protection dan wajibkan review.

## c06 — Reset hard + penjelasan reflog

- Kata: **31** · estimasi **13 dtk**
- Visual: meja kerja; tombol merah `reset --hard` ditekan, file-file di layar tersapu bersih. Lalu kamera mundur ke "buku catatan" reflog berisi jejak posisi HEAD; HUD "30 HARI default" dan commit yang hilang ditarik kembali ke grafik.

> Kelima, panik lalu reset hard. Perintah ini menimpa semua perubahan yang belum di-commit. Tapi commit yang terlanjur lepas biasanya masih bisa diselamatkan lewat reflog. Secara default, jejaknya disimpan tiga puluh hari.

## c07_payoff — Payoff + outro

- Kata: **26** · estimasi **11 dtk**
- Visual: grafik branch tim yang rapi dan hijau, lima kartu peringatan berbalik jadi lima centang; papan bertuliskan AUDIRA di dinding kantor; outro card AUDIRA.

> Jadi, yang merusak tim jarang sekali Git-nya. Yang merusak itu kebiasaan kecil yang dibiarkan. Kirim video ini ke teman setimmu, dan ikuti AUDIRA buat trik berikutnya.

## Opsi hook lain

1. Kode kamu aman, sampai teman setimmu mengetik satu perintah ini.
2. Dua puluh tiga juta kunci rahasia bocor ke GitHub dalam setahun. Salah satunya bisa punya timmu.

## Total

- **207 kata** ≈ **83–92 dtk** (135–150 WPM)
