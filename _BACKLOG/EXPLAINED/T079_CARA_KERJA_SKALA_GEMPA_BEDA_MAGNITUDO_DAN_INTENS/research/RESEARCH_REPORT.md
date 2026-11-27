# Research Report — Cara Kerja Skala Gempa: Beda Magnitudo dan Intensitas

> Riset backlog 2026-11-27. Channel @AudiraExplained (rule 15: netral, tanpa wajah/logo nyata).

## Sumber utama

- **Wikipedia (en)**: Moment magnitude scale (#1, #2, #3), 2004 Indian Ocean earthquake (#8), 2018 Sulawesi earthquake (#6), 2022 West Java earthquake (#7), Modified Mercalli intensity scale (#9), Seismic magnitude scales (#10). Mengutip Gutenberg & Richter 1956, Kanamori 1977, Hanks & Kanamori 1979, Bormann et al. 2013, USGS Earthquake Magnitude Working Group 2002. Semua MEDIUM karena sumber sekunder.
- **BMKG (situs resmi + API)**: Halaman intensitas (#4), data gempa real-time (#5, #11). HIGH karena sumber primer lembaga resmi Indonesia.

## Fakta terverifikasi

1. Per 1 unit magnitudo, energi gempa naik ≈31,6× (10^1,5 ≈ 31,6; sering dibulatkan "32 kali"). Per 2 unit: 1.000×. Formula: log₁₀(Es) ≈ 4,8 + 1,5M (#1).
2. Per 1 unit magnitudo, amplitudo gelombang seismik naik 10× (definisi skala Richter, logaritmik) (#3). Amplitudo ≠ energi.
3. Skala Richter (ML, local magnitude) dibuat 1935 oleh Charles Richter; saturasi di gempa besar (~M 6,5–7) (#2, #3).
4. Skala Mw (moment magnitude) didefinisikan 1979 oleh Hanks & Kanamori; USGS menjadikannya standar resmi sejak 18 Januari 2002 untuk gempa M > 4 (#2).
5. Mw tidak saturasi: Aceh 2004 awalnya tercatat Ms 8,2 (saturasi) tetapi Mw 9,1 (USGS) hingga 9,2–9,3 (studi terbaru) (#8).
6. BMKG saat ini menggunakan MMI (Modified Mercalli Intensity, skala I–XII) untuk intensitas, BUKAN skala terpisah bernama "SIG-BMKG". Halaman resmi berjudul "Skala MMI" (#4), data API memakai format MMI (#5).
7. BMKG melaporkan magnitudo sebagai angka tunggal tanpa menyebut tipe (Mw/MLv) di API publik (#5, #11). Di siaran pers gempa besar, BMKG menyebut tipe: ML untuk gempa kecil, Mw untuk gempa besar (#6).
8. Perbedaan magnitudo BMKG vs USGS: gempa Palu 2018 (BMKG M7,7 vs USGS Mw 7,5), foreshock Palu (BMKG 5,9 ML vs USGS 6,1 Mw) — selisih 0,1–0,2 unit, wajar karena metode dan data stasiun berbeda (#6, #7).
9. Intensitas (MMI) berbeda dengan magnitudo: magnitudo satu nilai per gempa (ukuran energi di sumber); intensitas berbeda tiap lokasi, tergantung jarak, kedalaman, kondisi tanah, geologi (#9, #10).

## Perselisihan / Kontroversi

- **Koreksi hook**: "energinya sekitar 32 kali" BENAR secara fisika (10^1,5 ≈ 31,6), tetapi bisa keliru dimengerti. Orang awam cenderung mengira "32 kali" berarti guncangan 32× lebih kencang. Sebenarnya amplitudo naik 10× per unit magnitudo (bukan 32×), dan guncangan yang dirasakan tergantung banyak faktor (jarak, kedalaman, tanah). **VO wajib menyebut kata "energi" secara eksplisit** dan membedakannya dari getaran yang dirasakan. Hook direvisi: "energinya sekitar 32 kali lipat" tetap, tapi ditambah konteks "bukan berarti guncangan di permukaan 32 kali lebih kuat."
- **SIG-BMKG**: Dugaan bahwa Indonesia memakai "Skala Intensitas Gempa BMKG (SIG-BMKG, 2012)" sebagai pengganti MMI **tidak terkonfirmasi**. Halaman resmi BMKG berjudul "Skala MMI"; data API menggunakan format MMI; file shakemap dinamai "mmi.jpg". SIG-BMKG mungkin pernah diusulkan atau dipakai sementara, tetapi BMKG saat ini (Nov 2026) secara konsisten menggunakan label MMI. **Naskah menyebut MMI, bukan SIG-BMKG, sampai ada bukti sebaliknya.** Jika saat produksi ditemukan dokumen resmi SIG-BMKG, perbarui.
- **Richter vs Mw di media Indonesia**: Banyak media Indonesia masih menyebut "skala Richter" padahal yang dipakai BMKG sudah Mw. Ini kesalahpahaman umum yang layak diangkat di VO.
- **Angka magnitudo BMKG vs USGS**: Selisih 0,1–0,2 bukan kesalahan; itu karena perbedaan metode, stasiun pengamat, dan model kecepatan gelombang. Naskah menjelaskan ini sebagai konsekuensi wajar, bukan kritik terhadap lembaga mana pun.
- **Data sumber kebanyakan MEDIUM**: Fakta fisika (formula energi, definisi Mw/ML) berasal dari Wikipedia yang mengutip paper standar seismologi. Angka-angka ini stabil (formula dari 1956, tidak berubah). Fakta BMKG (tipe skala, format data) berasal langsung dari API dan situs resmi BMKG (HIGH). Rekomendasi: sebelum produksi, coba buka halaman USGS tentang "Earthquake Magnitude, Energy Release, and Shaking Intensity" untuk sumber primer HIGH (saat riset ini halaman USGS mengembalikan 403/404).

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| 10× amplitudo | Kenaikan amplitudo per 1 unit magnitudo (definisi skala logaritmik) | 3 |
| ≈32× energi (10^1,5) | Kenaikan energi per 1 unit magnitudo (Gutenberg-Richter) | 1 |
| 1.000× energi | Kenaikan energi per 2 unit magnitudo (10^3) | 1 |
| 1935 | Tahun Charles Richter membuat skala ML | 3 |
| 1979 | Tahun Hanks & Kanamori mendefinisikan Mw | 2, 3 |
| 2002 | Tahun USGS resmi memakai Mw | 2 |
| Mw 9,1–9,3 | Gempa Aceh 2004 (USGS 9,1; studi terbaru 9,2–9,3) | 8 |
| M 7,5 vs 7,7 | Gempa Palu 2018: USGS Mw 7,5, BMKG awal M7,7 | 6 |
| Mw 5,6 | Gempa Cianjur 2022 (MMI maks VIII) | 7 |
| I–XII | Skala MMI (intensitas, bukan magnitudo) | 4, 9 |

## Poin kunci

- Dua konsep yang sering dicampuraduk: magnitudo (satu angka, ukuran energi di sumber) vs intensitas (berbeda tiap lokasi, efek yang dirasakan).
- Hook "32 kali" aman dipakai, tapi wajib disebut "energi" dan dibedakan dari guncangan.
- Skala Richter masih disebut media, padahal sudah diganti Mw untuk gempa besar — fakta menarik untuk VO.
- Indonesia (BMKG) memakai MMI untuk intensitas, bukan skala terpisah.
- Contoh gempa Indonesia (Aceh 2004, Palu 2018, Cianjur 2022) bagus untuk ilustrasi perbedaan magnitudo vs intensitas.
