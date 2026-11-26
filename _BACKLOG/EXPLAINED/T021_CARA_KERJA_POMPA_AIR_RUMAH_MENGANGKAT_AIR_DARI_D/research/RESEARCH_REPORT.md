# Research Report — Cara Kerja Pompa Air Rumah: Mengangkat Air dari Dalam Tanah

> Riset pra-produksi backlog, 2026-11-26. Channel EXPLAINED (rule 15: pompa generik tanpa merek, tanpa wajah orang nyata).

## Sumber utama

- USGS Water Science School, "Groundwater Wells" (#1) dan "Water Density" (#4): jenis pompa sumur dangkal vs dalam, massa jenis air.
- NIST CODATA 2022 (#2, #3): tekanan atmosfer standar dan gravitasi standar, dasar hitungan batas hisap 10,33 m.
- U.S. Department of Energy & Hydraulic Institute, "Improving Pumping System Performance" 2nd ed., 2006 (#5): cara kerja pompa sentrifugal dan kavitasi.
- Galileo Galilei, "Dialogues Concerning Two New Sciences" (1638), terjemahan Crew & de Salvio (#6): catatan sejarah batas "delapan belas hasta".
- Wikipedia (MEDIUM, pelengkap): Injector (#7), Centrifugal pump (#8), Submersible pump (#9), Evangelista Torricelli (#10), Suction (#11).

## Fakta terverifikasi

1. Pompa air rumah yang umum (pompa jet/sentrifugal di permukaan) bekerja dengan hisapan dan paling umum dipakai untuk sumur dangkal, 25 kaki atau kurang (≈ 7,6 m). (#1)
2. Untuk sumur dalam, yang paling umum adalah pompa celup yang ditaruh di dalam sumur dan mendorong air ke permukaan; sumur bor bisa lebih dari 1.000 kaki. (#1, #9)
3. Pompa sentrifugal memberi energi kinetik pada air lewat impeler yang berputar, lalu energi itu diubah menjadi tekanan saat air melambat di rumah pompa/diffuser. (#5)
4. Pompa sentrifugal harus berisi cairan (dipancing/priming); bila berisi udara, impeler tidak bisa memompa. (#8)
5. "Hisapan" sebenarnya dorongan: tekanan atmosfer pada permukaan air mendorong air naik ke ruang bertekanan rendah, seperti pada sedotan. (#10, #11)
6. Tekanan atmosfer standar 101 325 Pa hanya bisa menahan kolom air ≈ 10,33 m (h = p/ρg, dengan ρ ≈ 1000 kg/m³ dan g = 9,806 65 m/s²). Ini batas teoretis di permukaan laut dengan vakum sempurna. (#2, #3, #4, #10)
7. Dalam praktik batasnya lebih rendah karena kavitasi: bila tekanan turun di bawah tekanan uap, air menguap jadi gelembung yang lalu pecah keras dan merusak pompa. Pompa jet dangkal dibatasi ±5–8 m. (#5, #7)
8. Pompa jet sumur dalam menaruh jet di dasar sumur dan menggerakkannya dengan sebagian air yang dikembalikan dari pompa utama di permukaan. (#7)
9. Batas ini sudah dikenal tukang pompa abad ke-17: Galileo (1638) mencatat tukang pompa yang berkata air tak bisa diangkat melewati delapan belas hasta. (#6)

## Perselisihan / Kontroversi

- **Hook TOPIC.md tidak akurat.** "Mesin kecil di belakang rumah menarik air dari kedalaman puluhan meter" salah untuk pompa hisap biasa. Tidak ada pompa hisap yang bisa mengangkat air lebih dari ±10,3 m (batas fisika tekanan atmosfer), dan pompa jet dangkal praktis hanya ±7,6 m (#1) atau ±5–8 m (#7). Air dari puluhan meter hanya bisa naik bila pompanya (atau jetnya) diletakkan di dalam sumur: pompa celup atau pompa jet sumur dalam (#1, #7, #9). Koreksi ini dijadikan inti cerita: hook baru "pompa tidak menyedot, udara yang mendorong", payoff "ada pompa yang tenggelam di bawah sana".
- **"Menyedot" vs "mendorong".** Bahasa sehari-hari bilang pompa "menyedot"; secara fisika air didorong tekanan atmosfer (#11). Naskah memakai framing ini, tetapi kata "hisap" tetap dipakai untuk nama pipa (pipa hisap).
- **Konversi "delapan belas hasta".** Terjemahan Inggris memakai "cubits"; aslinya satuan Italia (braccia) yang panjangnya beragam antarkota. Konversi ke meter tidak ada di register, jadi naskah tidak menyebut "18 hasta = 10 m". Bila ingin ditampilkan, cari sumber konversi braccio Florentina dulu.
- **Ketinggian lokasi.** 10,33 m berlaku di permukaan laut. Di dataran tinggi tekanan udara lebih rendah sehingga batasnya ikut turun. Angka per ketinggian belum dicari; jangan tampilkan angka dataran tinggi.
- **Spesifikasi pompa rumah Indonesia** (mis. "daya hisap 9 m, daya dorong 24 m") umum di brosur pabrikan, tetapi tidak dicatat karena rule 15 (tanpa merek) dan belum diverifikasi dari sumber teknis. Angka daya hisap 9 m tetap di bawah batas 10,3 m, jadi konsisten dengan fisika.
- **Sumber Indonesia (SNI/BSN, ESDM).** Belum ditemukan halaman SNI pompa air rumah yang bisa dibuka tanpa login; semua sumber HIGH saat ini dari AS (USGS, NIST, DOE) dan teks Galileo. Fisikanya universal, tetapi konteks lokal (jumlah rumah tangga pemakai sumur pompa) belum ada.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| ≈ 10,3 m | Batas teoretis tinggi hisap air di permukaan laut | #2, #3, #4, #10 |
| 101.325 Pa | Tekanan atmosfer standar yang mendorong air naik | #2 |
| ≈ 7,6 m (25 kaki) | Kedalaman sumur dangkal tipikal untuk pompa jet | #1 |
| ±5–8 m | Batas praktis pompa jet dangkal agar tidak kavitasi | #7 |
| 1638 · Galileo Galilei | Catatan tukang pompa tentang batas angkat air | #6 |
| 18 hasta | Batas yang disebut tukang pompa dalam dialog Galileo | #6 |
| > 1.000 kaki | Kedalaman sumur bor yang mungkin; pompa ditaruh di dalam sumur | #1 |

## Poin kunci

- Pompa di permukaan tidak "menarik" air; ia menurunkan tekanan di pipa, lalu udara yang mendorong air naik.
- Batas fisika ±10,3 m membuat hook asli salah, dan koreksinya justru jadi twist: air dari puluhan meter butuh pompa yang tenggelam di dalam sumur.
- Visual kunci: cutaway impeler, air pancingan, panah tekanan udara, tabung kolom air 10,3 m, halaman manuskrip 1638, split screen pompa jet vs pompa celup.
- Rule 15: pompa, rumah, dan sumur generik; Galileo hanya sebagai name plate teks, tanpa potret.
