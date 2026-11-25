# ART DIRECTION — EP03 Dampak Politik Ekonomi (DATAPHYSICAL, world3d)

## Gagasan
Satu timbangan kuningan raksasa di atas plinth walnut. Piring kiri = PASAR (patung data IHSG, rupiah, emas), piring kanan = RAKYAT (plakat-plakat suara publik). Di bawah lengan timbangan, empat blok partai diam berjejer. Sepanjang film timbangan bergoyang mengikuti data; kamera mengitari timbangan dari satu piring ke piring lain.

## Palet
| Token | Hex | Kegunaan |
|---|---|---|
| studioNight | #141416 | latar paling gelap (beda dari EP01/EP02) |
| amberHaze | #3A2A18 | cahaya latar hangat di dinding belakang |
| walnutBase | #2A1B14 | plinth timbangan |
| brassGold | #D2B07A | timbangan, lengan, rantai, plakat |
| machinedAluminum | #C8CCD1 | kolom IHSG, blok partai |
| acrylicTeal | #9FD3D6 | bidang MSCI (dana asing), gelembung transparan |
| focalOrange | #D4521C | rupiah tertekan / angka yang dibahas |
| goldBar | #E6C35C | batangan emas |
| hudText | #ECEFF4 | teks panel |
| amberKicker | #FFBE55 | kicker |

## Material dan cahaya
- Timbangan: lathe (tiang, mangkuk piring), tube (rantai), kuningan metalness 0.85 roughness 0.24, clearcoat.
- Kolom IHSG aluminium bevel; kolom rupiah dicat oranye (metalness 0.25) dan ditekan pelat; batangan emas trapezoid extrude bertumpuk, satu batang terlepas di beat "turun".
- Blok partai: aluminium bevel dengan teks ukir (canvasTex) PAN, DEMOKRAT, PKS, GOLKAR — tanpa logo.
- Plakat suara publik: kuningan + canvasTex teks pendek.
- stage({exp: 1}), environmentIntensity 0.55; key hangat dari atas (spotlight teater) + rim dingin; dinding belakang dengan cahaya amber lembut agar tidak gelap total (pelajaran depth memori).
- Post: APPLE_STUDIO_CLEAN satu pass, vignette sedikit lebih kuat (0.1) untuk mood malam; NaN guard sebelum bloom.
- Lantai reflektif + kabut tipis; FG: tali rantai kuningan blur.

## Penggambaran
- Tanpa tokoh/wajah; "Tokoh Papua", "Kompas", "ISEAI" hanya sebagai plakat teks.
- Tanpa logo partai, bursa, bank, atau Antam. Chip: "ILUSTRASI DATA, BUKAN CUPLIKAN ASLI".
- Rupiah 18.500 selalu disertai kata "berpotensi" di panel. IHSG disertai "bertepatan MSCI".
- Kata AUDIRA terukir di dasar timbangan.

## Tipografi
- Judul panel: Space Grotesk 700 96-130 px.
- Angka: JetBrains Mono 700, chip 128 px, panah naik teal / turun oranye.
- Body Inter 600 42 px; caption Inter 800 58 px.

## Kamera
- track() spline, fov 30. Orbit mengelilingi timbangan (setengah lingkaran per babak) + push-in ke tiap piring.
- s1 low-angle ke timbangan yang bergoyang; s2-s4 orbit ke piring PASAR; s5 turun ke deret blok partai di bawah lengan; s6 orbit ke piring RAKYAT; s7 crane naik melihat timbangan utuh; s8 pull-back.
