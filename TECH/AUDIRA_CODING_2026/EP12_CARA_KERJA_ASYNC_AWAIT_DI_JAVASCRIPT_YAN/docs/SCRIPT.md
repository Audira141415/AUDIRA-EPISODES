# Naskah — Cara Kerja Async/Await di JavaScript yang Sebenarnya

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **13** · estimasi **5 dtk**
- Visual: Layar gelap, kata `await` berpendar. Kata itu retak, di dalamnya terlihat rantai Promise.

> Async await itu bukan sihir. Di balik layar, ia cuma Promise yang menyamar.

## c01_intro — Intro

- Kata: **25** · estimasi **10 dtk**
- Visual: Kode callback bersarang menjorok ke kanan membentuk piramida; label HUD `callback hell`.

> Dulu, urusan menunggu di JavaScript diselesaikan pakai callback. Fungsi di dalam fungsi di dalam fungsi, bentuknya menjorok ke kanan seperti piramida. Orang menyebutnya callback hell.

## c02 — Promise

- Kata: **28** · estimasi **12 dtk**
- Visual: Kotak hasil kerja bersegel (Promise) disambung rantai `.then()` satu per satu.

> Lalu datang Promise. Hasil kerja yang belum jadi dibungkus dulu, lalu disambung pakai then. Lebih rapi, dan tidak lagi menumpuk ke dalam. Tapi kamu masih harus menyambung terus.

## c03 — Standar ES2017

- Kata: **17** · estimasi **7 dtk**
- Visual: Garis waktu 2016 ke 2017; callout HUD `ES2017`, `Node.js 8`.

> Tahun 2017, async function resmi masuk standar ES2017, lewat usulan Brian Terlson. Node.js 8 sudah mendukungnya penuh.

## c04 — Await menjeda fungsi

- Kata: **27** · estimasi **11 dtk**
- Visual: Fungsi async berbentuk blok; panah kode jalan lurus lalu berhenti di `await` pertama.

> Intinya begini. Fungsi async selalu mengembalikan Promise. Kodenya jalan biasa sampai ketemu await pertama. Di titik itu fungsi berhenti sementara, dan mesin JavaScript kembali mengerjakan hal lain.

## c05 — Event loop

- Kata: **39** · estimasi **16 dtk**
- Visual: Satu jalur thread, tugas menunggu dilempar ke kotak sistem operasi, lalu kembali masuk antrean microtask.

> Jadi tidak ada thread baru. Node tetap pakai satu thread, dan pekerjaan menunggu diserahkan ke sistem operasi. Begitu Promise selesai, lanjutannya masuk antrean microtask, yang dikosongkan lebih dulu sebelum tugas biasa. Hasilnya, satu thread bisa mengurus banyak pekerjaan menunggu.

## c06 — Gula sintaks dan optimasi V8

- Kata: **22** · estimasi **9 dtk**
- Visual: Dua pipa microtick: tiga tahap menyusut jadi satu; callout `3 -> 1`.

> Await sering disebut gula sintaks, dan memang mirip gabungan generator dan Promise. Tapi V8 mengoptimalkannya: dari minimal tiga microtick, jadi cuma satu.

## c07_payoff — Payoff + outro

- Kata: **30** · estimasi **12 dtk**
- Visual: Tumpukan callback melebur jadi barisan `await` lurus; kartu outro AUDIRA.

> Jadi await itu menyambung Promise tanpa terlihat menyambung. Kodenya terbaca dari atas ke bawah, seperti kode biasa. Callback hell hilang dari mata, bukan dari mesin. Itu cara kerjanya, versi AUDIRA.

## Opsi hook lain

1. Callback hell sebenarnya tidak dihapus. Ia cuma disembunyikan.
2. Kata await terlihat menunggu. Padahal JavaScript tidak menunggu sama sekali.

## Total

- **201 kata** ≈ **84 dtk**
