# Research Report — Cara Kerja Chip: Dari Pasir ke Prosesor 2nm

Tanggal riset: 2026-11-25. Register: `research/SOURCE_REGISTER.md`.

## Sumber utama
- TSMC, halaman resmi 2nm Technology (#1) — status N2 dan transistor nanosheet.
- ASML, tiga halaman resmi (#2, #3, #4) — EUV 13,5 nm, sumber cahaya timah, 100 lapisan, empat bulan.
- Apple Newsroom 30 Okt 2023 (#5) — 92 miliar transistor M3 Max.
- Wikipedia: 2 nm process (#6), Czochralski method (#7), Polycrystalline silicon (#8) — konteks teknis, level MEDIUM.

## Fakta terverifikasi
1. Silikon tingkat metalurgi berasal dari kuarsit, lalu dimurnikan lewat proses Siemens (distilasi senyawa silikon gas, diurai pada suhu tinggi) hingga polisilikon 99,9999% (#8).
2. Polisilikon dilelehkan dalam cawan kuarsa pada 1.425 °C; kristal benih dicelupkan, diputar, ditarik ke atas (Czochralski) (#7).
3. Ingot kristal tunggal bisa sepanjang hingga 2 m dan berat beberapa ratus kg; diiris jadi wafer 200/300 mm (#7).
4. Litografi EUV memakai cahaya 13,5 nm; hanya ASML yang membuat sistemnya (#2).
5. Cahaya EUV dibuat dari tetesan timah ±25 mikron yang ditembak dua pulsa laser hingga jadi plasma, 50.000 kali per detik (#3).
6. Sistem EUV memakai cermin multilapis, bukan lensa, dan memperkecil pola 4× (#2).
7. Chip modern bisa punya hingga 100 lapisan dengan keselarasan nanometer; ratusan langkah, hingga empat bulan dari desain ke produksi massal (#4).
8. "2 nm" bukan ukuran fisik apa pun di transistor; istilah generasi/pemasaran (#6).
9. TSMC N2 masuk produksi massal 4Q 2025 dengan transistor nanosheet generasi pertama (per 2026-11-25) (#1, #6).
10. Apple M3 Max (3 nm, 2023) memuat hingga 92 miliar transistor (#5).

## Perselisihan / Kontroversi
- **Judul "Prosesor 2nm" menyesatkan bila diartikan harfiah.** "2 nm" adalah nama generasi; tidak ada fitur transistor berukuran 2 nm (#6). Naskah menjelaskan ini di c06 sebagai twist, bukan menyembunyikannya.
- **Hook "miliaran transistor di ujung jari"** akurat secara umum, tetapi angka spesifik yang terverifikasi di sini adalah chip laptop M3 Max (3 nm, 92 miliar), bukan chip 2 nm dan bukan chip ponsel. Naskah menyebut M3 Max sebagai 3 nm secara eksplisit. Hook diganti ke "segenggam pasir → otak laptop" agar tidak mengklaim ukuran "ujung jari".
- "Dari pasir": bahan baku industri adalah kuarsit/pasir silika kemurnian tinggi, bukan sembarang pasir pantai. Visual dan VO memakai "pasir dan batu kuarsa".
- Status 2 nm Samsung (SF2, yield dilaporkan 50–60%) dan Intel 18A berasal dari Wikipedia dan cepat berubah; tidak dipakai di VO.
- "Empat bulan" adalah batas atas ("up to") versi ASML, bukan durasi pasti.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 99,9999% | kemurnian polisilikon (proses Siemens) | 8 |
| 1.425 °C | suhu leleh silikon di cawan Czochralski | 7 |
| ≤ 2 m · ratusan kg | panjang/berat ingot kristal tunggal | 7 |
| 300 mm | diameter wafer kelas atas | 7 |
| 13,5 nm | panjang gelombang cahaya EUV | 2 |
| 50.000×/detik | frekuensi tembakan laser ke tetesan timah | 3 |
| 25 mikron | diameter tetesan timah | 3 |
| ≤ 100 lapisan | jumlah lapisan chip modern | 4 |
| ≤ 4 bulan | desain → produksi massal | 4 |
| 4Q 2025 | TSMC N2 produksi massal (per 2026-11-25) | 1 |
| 92 miliar | transistor Apple M3 Max (3 nm, 2023) | 5 |

## Poin kunci
- Alur visual jelas dan sangat cocok untuk "cara kerja": pasir → gas → batang polisilikon → kristal tunggal → wafer → cahaya EUV → lapisan → transistor nanosheet → laptop.
- Twist kuat di c06: "2 nm itu bukan 2 nm".
- Payoff angka 92 miliar dengan catatan jujur bahwa itu chip 3 nm.
- Brand pihak ketiga (TSMC, ASML, Apple) disebut di VO, tetapi logonya tidak perlu ditampilkan di visual.
