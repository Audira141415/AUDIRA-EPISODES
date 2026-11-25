# Source Register — Cara Kerja Chip: Dari Pasir ke Prosesor 2nm

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | TSMC 2nm (N2) mulai produksi massal (volume production) 4Q25 sesuai rencana; N2 memakai transistor nanosheet generasi pertama | 2nm Technology, TSMC (halaman teknologi resmi), diakses 2026 | https://www.tsmc.com/english/dedicatedFoundry/technology/logic/l_2nm | 2026-11-25 | HIGH |
| 2 | Litografi EUV memakai cahaya dengan panjang gelombang 13,5 nm (hampir rentang sinar-X); teknologi ini hanya dibuat ASML; sistem EUV memakai beberapa cermin multilapis, bukan lensa, dan memperkecil pola reticle 4× | EUV lithography systems, ASML, diakses 2026 | https://www.asml.com/en/products/euv-lithography-systems | 2026-11-25 | HIGH |
| 3 | Sumber cahaya EUV: tetesan timah cair ±25 mikron ditembak laser (pulsa pertama memipihkan, pulsa kedua menguapkan jadi plasma yang memancarkan EUV), diulang 50.000 kali per detik | Light & lasers, ASML, diakses 2026 | https://www.asml.com/en/technology/lithography-principles/light-and-lasers | 2026-11-25 | HIGH |
| 4 | Chip modern bisa punya hingga 100 lapisan yang harus sejajar dengan presisi nanometer; proses melibatkan ratusan langkah dan bisa memakan hingga empat bulan dari desain ke produksi massal | How microchips are made, ASML, diakses 2026 | https://www.asml.com/en/technology/all-about-microchips/how-microchips-are-made | 2026-11-25 | HIGH |
| 5 | M3 Max memuat hingga 92 miliar transistor; M3/M3 Pro/M3 Max adalah chip PC pertama berproses 3 nm (rilis 30 Okt 2023) | Apple unveils M3, M3 Pro, and M3 Max, Apple Newsroom, 2023 | https://www.apple.com/newsroom/2023/10/apple-unveils-m3-m3-pro-and-m3-max-the-most-advanced-chips-for-a-personal-computer/ | 2026-11-25 | HIGH |
| 6 | Istilah "2 nanometer" tidak terkait ukuran fisik transistor (gate length, metal pitch, gate pitch); dipakai terutama sebagai istilah pemasaran untuk generasi baru; TSMC risk production Juli 2024, volume production 4Q 2025; transistor gate-all-around (GAAFET/nanosheet) menggantikan FinFET | 2 nm process, Wikipedia, revisi 2026 | https://en.wikipedia.org/wiki/2_nm_process | 2026-11-25 | MEDIUM |
| 7 | Metode Czochralski: silikon semikonduktor dilelehkan dalam cawan kuarsa pada 1.425 °C; kristal benih dicelupkan, diputar, dan ditarik ke atas; ingot bisa sepanjang hingga 2 m dan berat beberapa ratus kg; wafer 200 dan 300 mm | Czochralski method, Wikipedia, revisi 2026 | https://en.wikipedia.org/wiki/Czochralski_method | 2026-11-25 | MEDIUM |
| 8 | Polisilikon dibuat dari silikon tingkat metalurgi (dari kuarsit) lewat proses Siemens: distilasi senyawa silikon yang mudah menguap lalu diurai pada suhu tinggi; kemurnian bisa mencapai 99,9999% | Polycrystalline silicon, Wikipedia, revisi 2026 | https://en.wikipedia.org/wiki/Polycrystalline_silicon | 2026-11-25 | MEDIUM |

## Catatan
- Angka yang bisa berubah ditulis "per 2026-11-25": status produksi 2 nm (#1, #6), rekor jumlah transistor (#5 adalah M3 Max 2023, bukan rekor terkini).
- Sumber #6–#8 MEDIUM (Wikipedia); angka teknis Czochralski/Siemens konsisten dengan literatur umum, sebaiknya dicek ulang ke buku teks/produsen wafer saat tahap 2 bila waktu ada.
