# Naskah — Redis Bukan Cuma Cache: Fitur yang Jarang Developer Tahu

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **15** · estimasi **6 dtk**
- Visual: Kotak "CACHE" di server rack retak dan terbuka, dari dalamnya keluar enam ikon fitur (antrean, toa, keran, gerbang, piala, pin lokasi). HUD: "Redis = cache?" dicoret.

> Kamu pakai Redis cuma buat cache? Sayang banget. Ini AUDIRA, dan isinya jauh lebih banyak.

## c01_intro — Intro

- Kata: **20** · estimasi **8 dtk**
- Visual: Chip RAM raksasa, data melesat masuk-keluar dalam kilatan cahaya. HUD: "2009" dan "key-value · in-memory".

> Redis lahir tahun 2009 sebagai database key-value yang tinggal di memori. Karena datanya di RAM, baca dan tulisnya super cepat.

## c02 — Antrean tugas

- Kata: **36** · estimasi **15 dtk**
- Visual: Ban berjalan berisi kardus tugas masuk ke list, robot worker mengambil satu per satu; satu worker jatuh, kardusnya aman di rak cadangan. HUD: "LMOVE · reliable queue".

> Pertama, antrean. Aplikasi mendorong tugas ke sebuah list, lalu worker mengambilnya satu per satu. Dokumentasi Redis punya pola reliable queue: tugas dipindah ke list cadangan pakai LMOVE, jadi tidak hilang kalau worker mati di tengah jalan.

## c03 — Pub/Sub

- Kata: **26** · estimasi **11 dtk**
- Visual: Menara antena memancarkan satu pesan ke banyak penerima; satu penerima lampunya mati dan pesannya jatuh lalu hilang. HUD: "PUBLISH · at-most-once".

> Kedua, pub/sub. Satu pesan dikirim ke channel, semua pendengar langsung menerimanya. Pas buat notifikasi dan chat. Tapi ingat, sifatnya at-most-once. Pendengar yang sedang offline, ketinggalan pesannya.

## c04 — Streams

- Kata: **23** · estimasi **10 dtk**
- Visual: Pita log panjang yang terus bertambah, dibagi ke tiga kelompok worker berwarna. HUD: "Streams · sejak v5.0 · consumer group".

> Butuh yang lebih tahan banting? Sejak versi 5.0 ada Streams. Pesannya tersimpan seperti buku log, dan consumer group membagi kerja ke banyak worker.

## c05 — Rate limiting

- Kata: **29** · estimasi **12 dtk**
- Visual: Palang gerbang tol dengan penghitung digital per IP; angka naik 1 sampai 10, request ke-11 ditolak palang turun. HUD: "INCR + EXPIRE · 10 req/dtk".

> Ketiga, rate limiting. Tiap request menaikkan counter per IP dengan INCR, lalu counter itu kedaluwarsa sendiri lewat EXPIRE. Contoh resminya: maksimal sepuluh request per detik. Lebih dari itu, tolak.

## c06 — Fitur tersembunyi lain

- Kata: **34** · estimasi **14 dtk**
- Visual: Tiga panel cepat: podium leaderboard skor naik-turun (HUD "ZADD"), peta kota dengan pin lokasi terdekat (HUD "GEOADD"), wadah kecil berlabel 12 KB menelan ribuan titik pengunjung (HUD "HyperLogLog · 12 KB · ±0,81%").

> Masih ada lagi. Sorted set untuk leaderboard game. GEOADD untuk mencari lokasi terdekat. Lalu HyperLogLog, yang menghitung pengunjung unik cukup dengan dua belas kilobyte memori, dan errornya cuma sekitar nol koma delapan satu persen.

## c07_payoff — Payoff + outro

- Kata: **25** · estimasi **11 dtk**
- Visual: Kamera mundur: semua adegan tadi ternyata berjalan dari satu server rack yang sama, menyala serempak. Lalu outro card AUDIRA.

> Jadi sebelum menambah message broker atau database baru, cek dulu. Bisa jadi Redis yang sudah kamu punya sanggup mengerjakannya. Simpan video ini buat proyek berikutnya.

## Opsi hook lain

1. Satu server Redis bisa jadi antrean, toa, satpam, dan papan skor sekaligus.
2. Developer pasang Redis buat cache, lalu berhenti di situ. Padahal itu baru pintu depannya.

## Total

- **208 kata** ≈ **83–92 dtk** (@150–135 WPM)
