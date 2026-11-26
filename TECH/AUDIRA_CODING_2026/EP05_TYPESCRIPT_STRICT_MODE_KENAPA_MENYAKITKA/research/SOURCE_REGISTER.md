# Source Register — TypeScript Strict Mode: Kenapa Menyakitkan tapi Wajib

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | strictNullChecks diperkenalkan di TS 2.0: null dan undefined punya tipe sendiri; dokumen menyebut 'the billion dollar mistake' | TypeScript 2.0 release notes, Microsoft/TypeScript team | https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html | 2026-11-25 | HIGH |
| 2 | Opsi master --strict muncul di TS 2.3 = strictNullChecks, noImplicitAny, noImplicitThis, alwaysStrict (dan bisa bertambah) | TypeScript 2.3 release notes, Microsoft | https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html | 2026-11-25 | HIGH |
| 3 | TS 2.3 diumumkan 27 April 2017 | Announcing TypeScript 2.3, Microsoft DevBlogs, 2017 | https://devblogs.microsoft.com/typescript/announcing-typescript-2-3/ | 2026-11-25 | HIGH |
| 4 | strict mengaktifkan keluarga pengecekan ketat; versi baru dapat menambah error baru | TSConfig Reference: strict, typescriptlang.org | https://www.typescriptlang.org/tsconfig/strict.html | 2026-11-25 | HIGH |
| 5 | Tanpa noImplicitAny, tipe yang tak bisa disimpulkan jatuh ke any; error 7006 'implicitly has an any type' | TSConfig Reference: noImplicitAny, typescriptlang.org | https://www.typescriptlang.org/tsconfig/noImplicitAny.html | 2026-11-25 | HIGH |
| 6 | TypeScript 6.0 (23 Maret 2026): strict kini true secara default | Announcing TypeScript 6.0, Microsoft DevBlogs, 2026 | https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/ | 2026-11-25 | HIGH |
| 7 | Dari 400 bug publik JavaScript, TypeScript 2.0 mendeteksi 58 (sekitar 15%); bug sudah lolos tes dan review | To Type or Not to Type: Quantifying Detectable Bugs in JavaScript, Gao, Bird, Barr, ICSE 2017 | https://earlbarr.com/publications/typestudy.pdf | 2026-11-25 | HIGH |
| 8 | Tony Hoare memperkenalkan null reference di ALGOL W tahun 1965 karena mudah dibuat; menyebutnya 'billion-dollar mistake' | Null References: The Billion Dollar Mistake, Tony Hoare, QCon via InfoQ | https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/ | 2026-11-25 | MEDIUM |
| 9 | strictNullChecks false = null/undefined diabaikan, bisa error saat runtime | TSConfig Reference: strictNullChecks, typescriptlang.org | https://www.typescriptlang.org/tsconfig/strictNullChecks.html | 2026-11-25 | MEDIUM |
