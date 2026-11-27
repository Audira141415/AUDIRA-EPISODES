# Research Report — Cara Kerja Tahun Kabisat: Kenapa Februari Kadang 29 Hari

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo nyata).

## Sumber utama

- **timeanddate.com**: panjang tahun tropis (365,242189 hari), aturan kabisat Gregorian, perbandingan akurasi kalender (#1, #2). Sumber non-akademik tapi konsisten dengan Astronomical Almanac; dipakai sebagai HIGH karena situs referensi waktu terkemuka.
- **Smithsonian National Air and Space Museum**: orbit Bumi 365,242190 hari, akumulasi 4 tahun = 23,26 jam (bukan tepat 24), aturan ÷100/÷400, contoh 2000 vs 1700/1800/1900/2100 (#9). HIGH.
- **Wikipedia (en)**: tahun tropis (#3, mengutip Astronomical Almanac), Julian calendar (#4, mengutip Pliny), Gregorian calendar (#5), leap year (#6), Islamic calendar (#7), Ethiopian calendar (#8), Y2K (#10). Level MEDIUM.

## Fakta terverifikasi

1. Bumi mengelilingi Matahari dalam ≈ 365,2422 hari (tahun tropis), bukan tepat 365¼ (365,25) hari. Selisih ≈ 11 menit/tahun (#1, #3, #9).
2. Kalender Julian (46 SM, Julius Caesar, dibantu astronom Sosigenes): kabisat setiap 4 tahun tanpa pengecualian → rata-rata 365,25 hari → drift 1 hari per 128 tahun (#4, #2).
3. Setelah ±1.600 tahun memakai Julian, equinox musim semi bergeser dari 21 Maret ke sekitar 11 Maret. Paus Gregorius XIII menerbitkan bulla Inter gravissimas (24 Feb 1582) untuk merevisi kalender (#5).
4. Aturan Gregorian: (a) habis dibagi 4 = kabisat, (b) KECUALI habis dibagi 100, (c) KECUALI habis dibagi 400 tetap kabisat. Rata-rata 365,2425 hari (#5, #6).
5. Contoh: 2000 kabisat (÷400), 1900 bukan (÷100 tapi bukan ÷400), 2100 bukan (÷100 tapi bukan ÷400) (#6, #1).
6. Gregorian masih meleset 27 detik/tahun → 1 hari per 3.236 tahun; jauh lebih baik dari Julian (#2).
7. 10 hari dilewati saat transisi 1582: Kamis 4 Oktober langsung diikuti Jumat 15 Oktober (#5).
8. Kalender Hijriah: murni lunar, 354/355 hari, bergeser ±11 hari/tahun terhadap musim. Tabular: 11 kabisat per 30 tahun (#7).
9. Kalender Ethiopia: 13 bulan (12×30 + 5/6 hari), kabisat tiap 4 tahun tanpa pengecualian (#8).
10. Bug Y2K terkait kabisat: beberapa program memperlakukan 2000 sebagai bukan kabisat karena hanya mengecek ÷100 dan melewatkan ÷400 (#10).

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md**: Hook "365¼ hari" secara teknis adalah angka Julian (365,25), bukan tahun tropis sesungguhnya (365,2422). Kata "sekitar" di hook membuatnya bisa dipertahankan, tapi inti cerita adalah bahwa 365¼ TIDAK CUKUP TEPAT — selisih 11 menit itu terakumulasi dan justru menjadi alasan aturan ÷100/÷400 diciptakan. Naskah WAJIB menjelaskan perbedaan ini di badan cerita.
- **Sosigenes "dari Alexandria"**: Pliny the Elder hanya menyebutnya "Sosigenes" tanpa menyebut Alexandria. Atribusi "dari Alexandria" adalah tradisi, bukan bukti primer. Naskah memakai "Sosigenes" saja.
- **Y2K dan kabisat**: Y2K secara umum bukan soal kabisat, melainkan soal penyimpanan tahun 2 digit. Namun ada sub-bug nyata (beberapa program menganggap 2000 bukan kabisat) (#10). Naskah tidak menyinggung Y2K karena durasi terbatas dan bisa menyesatkan; bisa ditambah saat produksi jika durasi memungkinkan.
- **Kalender Hijriah "11 dari 30 tahun"**: ini berlaku untuk kalender tabular (perhitungan), bukan kalender observasi (ru'yat hilal) yang dipakai mayoritas Muslim. Naskah menyebut "sistem perhitungan" untuk membedakan.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 365,2422 hari | Tahun tropis (panjang tahun astronomi) | 1, 3 |
| 365,25 hari | Rata-rata tahun Julian (terlalu panjang 11 menit) | 2, 4 |
| 365,2425 hari | Rata-rata tahun Gregorian | 2, 5 |
| 46 SM | Julius Caesar mengusulkan kalender Julian | 4 |
| 1582 | Paus Gregorius XIII menerbitkan Inter gravissimas | 5 |
| 10 hari | Hari yang dilewati saat transisi ke Gregorian | 5 |
| 1 hari / 128 tahun | Drift kalender Julian | 2 |
| 1 hari / 3.236 tahun | Drift kalender Gregorian | 2 |
| 2000 | Kabisat (÷400) — pertama kali aturan ÷400 dipakai | 6 |
| 2100 | Bukan kabisat (÷100, bukan ÷400) | 6 |

## Poin kunci

- Alur cerita natural: hook (365¼ tidak cukup tepat) → Julius Caesar mencoba memperbaiki → setelah 1.600 tahun drift menumpuk → Gregorius XIII menambah aturan ÷100/÷400 → contoh 2000 vs 2100 → kalender lain punya solusi berbeda → Gregorian pun belum sempurna.
- Visual berganti: angka tahun tropis → Romawi kuno/scroll → katedral/bulla → kalender modern dengan tanggal dicoret → globe dengan kalender berbeda.
- Payoff: meski sudah dikoreksi dua kali (Julian → Gregorian), kalender kita masih meleset 1 hari per 3.236 tahun — alam lebih rumit dari hitungan manusia.
- Semua angka HUD terverifikasi di register. Tidak ada angka yang cepat basi (fakta astronomi dan sejarah bersifat tetap).
