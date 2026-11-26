# Research Report — TypeScript Strict Mode: Kenapa Menyakitkan tapi Wajib

## Sumber utama
Dokumentasi resmi TypeScript (release notes 2.0, 2.3; TSConfig reference; pengumuman 6.0), makalah ICSE 2017 (Gao, Bird, Barr), dan talk Tony Hoare di QCon/InfoQ. Detail di `SOURCE_REGISTER.md`.

## Fakta terverifikasi
1. strictNullChecks hadir di TypeScript 2.0 (Sept 2016); null dan undefined jadi tipe tersendiri (#1).
2. Opsi `--strict` hadir di TS 2.3, 27 April 2017, awalnya 4 flag: strictNullChecks, noImplicitAny, noImplicitThis, alwaysStrict (#2, #3).
3. strict bisa menambah pengecekan di versi baru, sehingga upgrade bisa memunculkan error baru (#4).
4. Tanpa noImplicitAny, tipe yang tak bisa disimpulkan menjadi any dan typo seperti `s.subtr` lolos; error 7006 (#5).
5. TypeScript 6.0 (23 Maret 2026) membuat `strict` default true (#6).
6. Studi ICSE 2017: dari 400 bug publik JavaScript, TypeScript 2.0 mendeteksi 58 (~15%) (#7).
7. Hoare memasukkan null ke ALGOL W 1965 "karena mudah dibuat" dan menyebutnya kesalahan miliaran dolar (#8).

## Perselisihan / Kontroversi
- Judul "wajib" adalah opini, bukan fakta teknis. Naskah memakai framing "murah vs mahal" dan bukti studi, bukan klaim mutlak.
- Hook TOPIC.md ("rasa sakit di development jauh lebih murah dari bug di production") adalah klaim biaya umum; tidak ada angka biaya terverifikasi, jadi naskah tidak memberi angka biaya.
- Koreksi: sejak TS 6.0 strict sudah default, jadi "menyala strict" bagi proyek baru bukan lagi langkah manual. Proyek lama dengan strict: false tetap harus mengaktifkan sendiri.
- Studi 15% memakai TS 2.0 pada bug publik JavaScript yang sudah lolos tes; bukan ukuran bug yang dicegah strict secara khusus, dan bukan klaim "15% semua bug".
- `noUncheckedIndexedAccess` bukan bagian strict; jangan dikatakan strict mencakup semuanya.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 2017 (27 April) | TS 2.3 memperkenalkan --strict | 2, 3 |
| 4 flag | Isi awal strict | 2 |
| 1965, ALGOL W | Null reference diciptakan Hoare | 8 |
| 400 bug / 58 | Sampel bug publik JavaScript / terdeteksi TS 2.0 (~15%) | 7 |
| TypeScript 6.0, Maret 2026 | strict default true | 6 |
| Error 7006 | Parameter implicitly has an any type | 5 |

## Poin kunci
- Strict = saklar induk, bukan satu aturan.
- Dua flag paling menyakitkan: strictNullChecks dan noImplicitAny.
- Bukti: ~15% bug publik terdeteksi tipe statis.
- Kabar baik: TS 6.0 menjadikannya default.
