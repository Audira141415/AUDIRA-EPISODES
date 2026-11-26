# Research Report — Cara Kerja Async/Await di JavaScript yang Sebenarnya

## Sumber utama
MDN (async function, event loop), blog V8 "Faster async functions and promises", TC39 finished-proposals, spesifikasi ECMA-262, dokumentasi Node.js, callbackhell.com. Detail di `SOURCE_REGISTER.md` (5 HIGH, 2 MEDIUM).

## Fakta terverifikasi
1. Fungsi async selalu mengembalikan Promise; await menjeda fungsi sampai Promise selesai (#1).
2. Kode sampai await pertama berjalan sinkron (#1).
3. Perilaku async/await mirip gabungan generator dan Promise (#1).
4. Async function didukung penuh sejak Node.js 8 (V8 v6.2) (#2).
5. V8 memangkas overhead await dari minimal 3 microtick jadi 1 bila nilainya sudah Promise (#2).
6. Proposal Async functions (Brian Terlson) selesai dan masuk standar 2017, yaitu ES2017 (#3).
7. Spesifikasi mendefinisikan Await lewat PerformPromiseThen (#4).
8. Antrean microtask dikosongkan lebih dulu dari antrean task (#5).
9. Node.js tetap satu thread JavaScript dan menyerahkan I/O ke kernel sistem (#6).
10. Callback bersarang membentuk piramida, dikenal sebagai callback hell (#7).

## Perselisihan / Kontroversi
- Judul: "yang Sebenarnya" boleh dipakai, tapi hook "kenapa callback hell ada solusinya" kurang tepat. Callback hell tidak dihapus oleh async/await; hanya disembunyikan oleh sintaks. Naskah memakai sudut "callback hell hilang dari mata, bukan dari mesin".
- "Gula sintaks": MDN menyebut tujuannya menyederhanakan sintaks, tapi implementasi mesin punya optimasi sendiri. Naskah menyebut keduanya.
- callbackhell.com menyebut async functions sebagai "proposed ES7": usang. Standar akhirnya ES2017 (#3). Jangan pakai istilah ES7.
- Tahun 2017 diambil dari kolom finished-proposals TC39 (#3).

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2017 / ES2017 | Async function masuk standar | 3 |
| Brian Terlson | Pengusul async functions | 3 |
| Node.js 8 | Dukungan penuh async function | 2 |
| 3 ke 1 microtick | Optimasi await di V8 | 2 |

## Poin kunci
- Async function = Promise + penjedaan di await, bukan thread baru.
- Lanjutan setelah await masuk antrean microtask.
- Visual dengan kode, bukan wajah orang atau logo organisasi (rule 15).
