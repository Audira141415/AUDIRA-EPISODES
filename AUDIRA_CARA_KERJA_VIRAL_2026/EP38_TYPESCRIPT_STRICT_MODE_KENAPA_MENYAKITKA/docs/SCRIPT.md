# Naskah — TypeScript Strict Mode: Kenapa Menyakitkan tapi Wajib

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **22** · estimasi **9 dtk**
- Visual: Editor kode gelap, satu baris merah menyala di bawah kata user.name. Teks HUD: ERROR di layar kompilasi, bukan di layar pelanggan.

> Garis merah di editor itu menyebalkan. Tapi garis merah itu murah. Yang mahal adalah bug yang baru ketahuan saat pelanggan sudah login.

## c01_intro — Intro

- Kata: **18** · estimasi **8 dtk**
- Visual: Folder tsconfig.json terbuka, baris "strict": true menyala. Label AUDIRA kecil di sudut editor.

> Ini AUDIRA. Satu baris di tsconfig, strict true, bikin TypeScript mendadak cerewet. Wajar kalau kamu ingin mematikannya lagi.

## c02 — Apa isi strict

- Kata: **23** · estimasi **10 dtk**
- Visual: Satu kartu strict pecah jadi empat kartu flag: strictNullChecks, noImplicitAny, noImplicitThis, alwaysStrict. Callout HUD: 2017.

> Strict itu saklar induk, muncul di TypeScript 2.3, April 2017. Awalnya isinya empat: strictNullChecks, noImplicitAny, noImplicitThis, dan alwaysStrict. Versi baru bisa menambah anggota.

## c03 — Bab 1: Null

- Kata: **35** · estimasi **15 dtk**
- Visual: Animasi kotak berlabel string diisi petak kosong bertanda null; kode users.find mengembalikan undefined lalu aplikasi runtuh. Callout HUD: 1965, ALGOL W.

> Yang paling menyakitkan strictNullChecks. Tanpa dia, null dan undefined diabaikan, jadi kamu menulis kode seolah data pasti ada. Tony Hoare memasukkan null ke ALGOL W tahun 1965 karena gampang dibuat, lalu menyebutnya kesalahan miliaran dolar.

## c04 — Bab 2: Any

- Kata: **26** · estimasi **11 dtk**
- Visual: Parameter fungsi s berlabel any, kode memanggil s.subtr dengan angka 42, kartu error 7006 muncul. Kapsul any berubah jadi gembok.

> Berikutnya noImplicitAny. Kalau TypeScript tak bisa menebak tipe, dia diam-diam memakai any, artinya tidak diperiksa. Typo subtr, bukan substr, lolos tanpa suara. Dengan strict, langsung ketahuan.

## c05 — Bab 3: Bukti angka

- Kata: **29** · estimasi **12 dtk**
- Visual: Diagram 400 kotak bug JavaScript, 58 kotak menyala biru. Callout HUD: 400 bug, 58 terdeteksi.

> Apakah garis merah itu berguna? Satu studi memeriksa 400 bug publik JavaScript. TypeScript 2.0 mendeteksi 58 di antaranya, sekitar 15 persen, padahal bug itu sudah lolos tes dan review.

## c06 — Penjelasan

- Kata: **29** · estimasi **12 dtk**
- Visual: Garis waktu: error kecil di editor di kiri, ledakan di production di kanan. Sisi kiri murah, sisi kanan mahal.

> Error saat kompilasi kamu perbaiki dalam semenit, di mesinmu sendiri. Bug yang sama di production harus dicari lewat log dan hotfix. Strict memindahkan rasa sakit ke tempat paling murah.

## c07_payoff — Payoff + outro

- Kata: **26** · estimasi **11 dtk**
- Visual: Layar tsconfig baru tanpa baris strict; kartu: TypeScript 6.0, Maret 2026, strict default true. Lalu kartu outro AUDIRA.

> Dan sekarang kamu tak perlu menyalakannya lagi. Sejak TypeScript 6.0, Maret 2026, strict sudah menyala secara default. Proyek baru terjaga. Ikuti AUDIRA untuk penjelasan teknologi berikutnya.

## Opsi hook lain

1. Ada satu baris di tsconfig yang membuat proyekmu merah semua, dan justru itu bagus.
2. Kamu pernah mematikan strict mode karena kesal? Dengar ini dulu.

## Total

- **208 kata** ≈ **87 dtk**
