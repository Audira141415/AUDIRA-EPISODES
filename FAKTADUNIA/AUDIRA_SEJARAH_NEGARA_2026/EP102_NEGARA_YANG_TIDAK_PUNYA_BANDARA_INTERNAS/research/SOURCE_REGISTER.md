# Source Register — Negara yang Tidak Punya Bandara Internasional

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Liechtenstein: 160 km², 2 heliport, tidak ada entri bandara (data 2025); jalur kereta 9 km milik sistem Austria | The World Factbook: Liechtenstein, CIA, 2025 (salinan JSON factbook.json) | https://raw.githubusercontent.com/factbook/factbook.json/master/europe/ls.json | 2026-11-25 | HIGH |
| 2 | Monaco: sekitar 2 km², 3 heliport, tidak ada entri bandara (data 2025) | The World Factbook: Monaco, CIA, 2025 (salinan JSON factbook.json) | https://raw.githubusercontent.com/factbook/factbook.json/master/europe/mn.json | 2026-11-25 | HIGH |
| 3 | San Marino: 61 km², 1 bandara (lapangan terbang kecil) per 2025 | The World Factbook: San Marino, CIA, 2025 (salinan JSON factbook.json) | https://raw.githubusercontent.com/factbook/factbook.json/master/europe/sm.json | 2026-11-25 | HIGH |
| 4 | Andorra: 468 km², 2 heliport; Vatikan: 1 heliport (data 2025) | The World Factbook: Andorra dan Holy See, CIA, 2025 (salinan JSON factbook.json) | https://raw.githubusercontent.com/factbook/factbook.json/master/europe/an.json | 2026-11-25 | HIGH |
| 5 | Populasi 2023: Liechtenstein 39.846, Monaco 38.956, San Marino 33.860, Andorra 80.856 | World Development Indicators SP.POP.TOTL, World Bank, 2024 (API resmi) | https://api.worldbank.org/v2/country/LIE;MCO;SMR;AND/indicator/SP.POP.TOTL?format=json&date=2023 | 2026-11-25 | HIGH |
| 6 | Liechtenstein tidak punya bandara; terdekat Zurich 130 km via jalan, St. Gallen 50 km, Friedrichshafen 85 km, Balzers Heliport untuk carter | Transport in Liechtenstein, Wikipedia | https://en.wikipedia.org/wiki/Transport_in_Liechtenstein | 2026-11-25 | MEDIUM |
| 7 | Monaco: tidak ada bandara; terdekat Nice, bus Express 110; Monaco Heliport satu-satunya fasilitas penerbangan | Transport in Monaco, Wikipedia | https://en.wikipedia.org/wiki/Transport_in_Monaco | 2026-11-25 | MEDIUM |
| 8 | Heliport Monaco dibuka 1976 atas dukungan Pangeran Rainier III; satu-satunya tujuan terjadwal: Bandara Nice | Monaco Heliport, Wikipedia | https://en.wikipedia.org/wiki/Monaco_Heliport | 2026-11-25 | MEDIUM |
| 9 | Bandara Nice berjarak 20 km dari Monaco dan melayani Monaco dengan helikopter | Nice Côte d'Azur Airport, Wikipedia | https://en.wikipedia.org/wiki/Nice_C%C3%B4te_d%27Azur_Airport | 2026-11-25 | MEDIUM |
| 10 | San Marino tanpa bandara internasional; terdekat Rimini; 2002 beli 3% saham Aeradria; perjanjian konsesi 40 tahun diratifikasi 16 Sep 2013; 2018 terminal diberi nama Rimini e San Marino; per Agustus 2023 aparat San Marino belum hadir di bandara | Transport in San Marino, Wikipedia | https://en.wikipedia.org/wiki/Transport_in_San_Marino | 2026-11-25 | MEDIUM |
| 11 | Lapangan terbang Torraccia: landasan rumput, diperpanjang jadi 650 m (2012), dikelola Aeroclub San Marino (±100 anggota), sekolah terbang | Transport in San Marino, Wikipedia | https://en.wikipedia.org/wiki/Transport_in_San_Marino | 2026-11-25 | MEDIUM |
| 12 | Heliport Vatikan dibangun 1976 era Paus Paulus VI untuk perjalanan ke Castel Gandolfo; satu-satunya fasilitas penerbangan Vatikan | Vatican City Heliport, Wikipedia | https://en.wikipedia.org/wiki/Vatican_City_Heliport | 2026-11-25 | MEDIUM |
| 13 | Andorra tanpa bandara pesawat sayap tetap; Andorra–La Seu d'Urgell 12 km dari perbatasan; Toulouse 165 km, Barcelona 215 km | Transport in Andorra, Wikipedia | https://en.wikipedia.org/wiki/Transport_in_Andorra | 2026-11-25 | MEDIUM |

Catatan metode: WebSearch/WebFetch gagal (error model), jadi semua sumber diambil dengan curl dari API/halaman asli. Halaman cia.gov hanya mengembalikan kerangka JS, sehingga data CIA dibaca dari salinan factbook.json. Wikipedia dibaca lewat API MediaWiki (extracts).
