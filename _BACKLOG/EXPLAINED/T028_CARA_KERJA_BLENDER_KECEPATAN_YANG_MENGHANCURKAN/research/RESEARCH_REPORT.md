# Research Report — Cara Kerja Blender: Kecepatan yang Menghancurkan Es

> Riset backlog 2026-11-26. Channel @AudiraExplained (rule 15: tanpa wajah orang nyata, tanpa logo/merek nyata, netral).

## Sumber utama

- **Paten**: US 7,281,842 B2 (wadah blender komersial, rpm pisau, definisi kavitasi, pusaran) (#1); US 1,480,914 Poplawski 1922/1924 (cikal bakal blender) (#5).
- **Putusan pengadilan** K-TEC v. Vita-Mix (CAFC 2012): ringkasan resmi mekanisme pusaran dan kavitasi (#2).
- **Jurnal**: Scientific Reports 2021 (spesifikasi blender rumah tangga 1.200 W, 25.000 rpm maks) (#3); Nanoscale 2014 (aliran turbulen di blender dapur) (#4).
- **CPSC** (regulator keselamatan produk AS): dua penarikan blender karena bahaya pisau (#6, #7).
- Pendukung MEDIUM: Wikipedia "Blender (appliance)" dan "Universal motor" (#8, #9).
- Catatan: WebSearch/WebFetch error di sesi ini; sumber dibuka lewat curl (PDF paten, arsip Wayback, Europe PMC, API saferproducts.gov, API Wikipedia). Halaman cpsc.gov memblokir curl (403), isinya dibaca dari API resmi CPSC.

## Fakta terverifikasi

1. Blender meja: motor listrik di alas memutar pisau di dasar gelas (#8).
2. Paten blender komersial: pisau berputar ±8.000–14.000 rpm (kecepatan rendah) dan ±16.000–32.000 rpm (kecepatan tinggi), **tanpa beban** (#1).
3. Blender rumah tangga berdaya tinggi 1.200 W yang dipakai peneliti punya kecepatan maksimum 25.000 rpm (#3). Saat dibebani cairan di rangkaian reaktor modifikasi, impelernya ±17.900 rpm (#3), jadi kecepatan nyata saat bekerja lebih rendah dari angka maksimum.
4. Motor universal umum di blender karena ringan dan cepat; umumnya 4.000–16.000 rpm, bisa > 20.000 rpm (#9).
5. Pisau membentuk pusaran yang menggerakkan isi dari atas ke bawah sehingga semua bahan kena pisau (#8); cairan naik di dinding/sudut gelas (#2).
6. Kavitasi di blender = kantong udara menyelubungi area di sekitar pisau; umum terjadi bila pusaran tepat sejajar sumbu pisau. Gelas bersudut/berdinding terpotong menggeser pusaran sehingga kavitasi berkurang (#1, #2). (Istilah ini dipakai paten untuk "kantong udara", bukan kavitasi uap dalam arti fisika fluida murni.)
7. Aliran di gelas blender dapur sangat turbulen; laju gesernya cukup untuk mengelupas grafit (#4); bilangan Reynolds ±19.400 di rangkaian reaktor blender = turbulen penuh (#3).
8. Blender daya rendah butuh cairan agar isi bersirkulasi; blender daya tinggi sanggup menghancurkan es tanpa bantuan cairan (#8). Es dan buah beku disebut tantangan khusus dalam paten (#1).
9. Keselamatan: pisau bisa tetap berputar saat wadah tidak terpasang (#6); pisau bisa patah lepas (#7); sup yang terlalu panas tidak aman dituang ke gelas blender (#8).
10. Sejarah: paten "Beverage Mixer" Poplawski diajukan 18 Feb 1922, diberikan 15 Jan 1924 (#5).

## Perselisihan / Kontroversi

- **Verifikasi hook TOPIC.md** ("berputar ratusan kali dalam satu detik dan menciptakan pusaran"): **didukung, dengan catatan**. Hitungan sendiri dari #1 dan #3: 16.000 rpm ÷ 60 ≈ 267 putaran/dtk; 25.000 rpm ÷ 60 ≈ 417/dtk; 32.000 rpm ÷ 60 ≈ 533/dtk; 17.900 rpm (berbeban) ≈ 298/dtk. Jadi "ratusan kali per detik" benar untuk blender berdaya tinggi. Koreksi: angka rpm adalah **maksimum/tanpa beban** dan dari **blender daya tinggi**, bukan semua blender; blender murah berdaya rendah tidak dijamin. Naskah memakai "bisa lebih dari empat ratus kali" dan menyebut blender 1.200 W (#3) sebagai contoh.
- **Judul "Kecepatan yang Menghancurkan Es"**: setengah benar. Kecepatan saja tidak cukup; pusaran harus terus mengirim es ke pisau, dan pusaran yang terlalu "rapi" justru menimbulkan kavitasi (#1, #2). Naskah menekankan kecepatan + pusaran.
- **"Pisau blender tajam"**: tidak diverifikasi; naskah memakai "bukan cuma pisau tajam" tanpa klaim pisau tumpul.
- **Kecepatan ujung pisau (km/jam)**: tidak dipakai di VO. Hitungan sendiri hanya ilustrasi: bila jari-jari pisau ±5 cm (asumsi) pada 25.000 rpm, kecepatan ujung ≈ 2π × 0,05 m × 417/dtk ≈ 131 m/dtk. Jari-jari asli berbeda per model; perlu sumber bila mau dipakai.
- **Pemanasan es/cairan, kebisingan, mikroplastik dari gelas plastik**: ada studi mikroplastik dari gelas blender (J Hazard Mater 2023), di luar cakupan dan tidak dinarasikan.
- **Merek**: paten, putusan, dan recall menyebut merek nyata; di visual semua blender generik tanpa logo (rule 15).

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| >400 putaran/dtk | 25.000 rpm ÷ 60 (hitungan sendiri, maksimum blender 1.200 W) | 3 |
| 25.000 rpm | Kecepatan maksimum blender rumah tangga 1.200 W | 3 |
| 1.200 W | Daya blender contoh | 3 |
| 16.000–32.000 rpm | Kecepatan tinggi pisau blender komersial (tanpa beban) | 1 |
| ÷ 60 | Konversi rpm ke putaran per detik (ilustrasi hitungan) | 3 |
| "Kavitasi" | Kantong udara menyelubungi pisau | 1, 2 |
| ⚠ cabut steker | Pesan keselamatan: pisau tetap bahaya bila motor tersambung | 6 |
| ⚠ cairan panas | Jangan isi penuh cairan panas | 8 |

## Poin kunci

- Cerita = rantai sebab-akibat: motor cepat → pisau ratusan putaran/dtk → pusaran → (masalah kavitasi → gelas bersudut) → hantaman berulang + turbulensi → es jadi serpihan.
- Payoff visual: potongan melintang gelas, panah aliran pusaran naik di dinding dan jatuh ke pisau, es retak bertahap.
- Angka rpm awet (spesifikasi teknik), tapi tulis sebagai "maksimum/tanpa beban".
- Pesan keselamatan singkat di outro, tanpa demonstrasi berbahaya (tidak menampilkan tangan dekat pisau berputar).
