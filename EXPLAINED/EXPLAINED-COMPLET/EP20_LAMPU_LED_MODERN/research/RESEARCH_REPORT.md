# Research Report — EP20 Lampu LED Modern

Riset 2026-11-13. Nomor `#n` merujuk ke tabel fakta di `SOURCE_REGISTER.md`.

## Ringkasan inti

Lampu pijar membuat cahaya dengan memanaskan filamen sampai membara, sehingga sebagian besar listriknya menjadi panas (#1). LED bekerja dengan cara lain sama sekali. LED adalah dioda semikonduktor berlapis: lapisan tipe-n kelebihan elektron, lapisan tipe-p kekurangan elektron ("lubang") (#2, #3). Tegangan mendorong keduanya bertemu di lapisan aktif. Setiap rekombinasi melepas foton (#4). Warna cahaya ditentukan bahan semikonduktornya (#5).

LED pada dasarnya satu warna (#6). Lampu LED putih di rumah hampir selalu berupa chip **biru** galium nitrida yang dilapisi fosfor kekuningan. Sebagian cahaya biru diubah menjadi kuning, dan campurannya terlihat putih (#7, #8). Karena itu, LED biru adalah kunci lampu LED putih. Akasaki, Amano, dan Nakamura berhasil membuat LED biru terang pada awal 1990-an dan meraih Nobel Fisika 2014 (#11).

Di dalam fiting, driver mengubah listrik AC menjadi DC (#9). Chip tetap panas, jadi lampu memakai heat sink logam; panas berlebih mempercepat penurunan cahaya (#10). LED jarang "putus", cahayanya meredup perlahan (#22). Menurut Komite Nobel, rekor efikasi LED sudah lewat 300 lm/W, sedangkan lampu pijar sekitar 16 lm/W (#12).

## Cara kerja langkah demi langkah

| Tahap | Mekanisme | Fakta |
|---|---|---|
| 1 | Listrik AC masuk fiting, driver mengubahnya jadi DC teratur | #9 |
| 2 | Arus DC melewati chip berlapis n dan p | #3 |
| 3 | Elektron dan lubang bertemu di lapisan aktif, melepas foton biru | #4, #5, #8 |
| 4 | Fosfor kekuningan menyerap sebagian biru, memancarkan kuning | #7 |
| 5 | Biru + kuning = putih di mata | #7 |
| 6 | Panas chip dibuang lewat heat sink | #10 |

## Sejarah singkat

| Tahun | Peristiwa | Ref |
|---|---|---|
| 1907 | Round melaporkan elektroluminesensi silikon karbida | #17 |
| 1962 | LED praktis pertama (inframerah) | #17, #18 |
| 1986 | Akasaki & Amano menumbuhkan kristal GaN bermutu | S4 |
| 1992 | Nakamura membuat lapisan tipe-p GaN dengan pemanasan | #20 |
| 1996 | LED putih pertama dijual (Nichia) | #16 |
| 2014 | Nobel Fisika untuk LED biru | #11 |

## Miskonsepsi yang dibantah

- "LED memancarkan cahaya putih." Lampu LED putih umumnya biru + fosfor (#6, #7). Sumber hook.
- "LED tidak panas sama sekali." Cahayanya hampir tidak membawa panas inframerah, tetapi chipnya panas dan perlu heat sink (#10).
- "LED akan putus seperti bohlam." LED meredup perlahan (#22).

## Angka untuk visual payoff

- **300+ lm/W vs 16 lm/W** (#12): dua batang cahaya, satu menjulang, satu pendek.
- Opsi: umur LED vs pijar (#13 bertentangan, hanya sebagai rentang).

## Catatan naskah

- Dilarang/berisiko: umur pasti 100.000 jam (#13), porsi listrik dunia (#15), "90% lebih efisien" (#14), ukuran butir pasir (#19).
- Ejaan fonetik: LED → "el-e-de"; light emitting diode → "lait emiting daiod"; Akasaki, Amano, Nakamura dibaca seperti tertulis.
- Hindari tumpang tindih: EP44 (lensa Fresnel) dan EP31 (reflektor) tidak membahas LED.
- Ide visual 3D kasar: bohlam LED dibelah (kubah difuser, papan chip, fosfor kuning, heat sink aluminium, driver di fiting); zoom ke chip: lapisan n biru dan p merah, partikel elektron dan lubang bertemu lalu menembakkan foton biru; foton menembus lapisan fosfor, sebagian berubah kuning, berpadu jadi putih; inset tiga ilmuwan sebagai siluet + medali Nobel; batang efikasi 16 vs 300.
