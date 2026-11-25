# Naskah — Cara Kerja Teknologi Under-Display Camera: Kamera Tersembunyi di Layar

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **17** · estimasi **7 dtk**
- Visual: Close-up layar ponsel menyala; zoom ke satu titik, pixel menipis dan lensa kamera muncul di baliknya (HUD: UDC).

> Ada kamera selfie di ponselmu, dan kamu tidak bisa melihatnya. Dia bersembunyi tepat di balik pixel layar.

## c01_intro — Intro

- Kata: **23** · estimasi **10 dtk**
- Visual: Potongan ponsel berlubang (punch-hole) lalu notch, bergantian, lalu layar penuh mulus.

> Dulu kamera depan memakan ruang: muncul poni, lalu lubang kecil. Demi layar penuh, kamera dipindahkan ke bawah panel. Namanya under-display camera, atau UDC.

## c02 — Panel tembus cahaya

- Kata: **29** · estimasi **12 dtk**
- Visual: Model panel OLED berlapis diledakkan: lapisan pixel, area terbuka, kamera di bawahnya. Callout: area terbuka 21%.

> Triknya ada di panel OLED. Di area atas kamera, susunan pixel dibuat lebih jarang supaya cahaya bisa lewat. Pada layar transparan yang diuji peneliti, area terbukanya sekitar 21 persen.

## c03 — Cahaya yang hilang

- Kata: **26** · estimasi **11 dtk**
- Visual: Berkas cahaya masuk panel; sebagian besar redup, bar transmisi turun. Callout: 20% lawan 2,9%.

> Tapi terbuka bukan berarti terang. Pada layar transparan, cahaya yang lolos sekitar 20 persen. Pada panel ponsel Pentile, hanya 2,9 persen. Foto jadi gelap dan berisik.

## c04 — Difraksi

- Kata: **25** · estimasi **10 dtk**
- Visual: Gelombang cahaya melewati kisi pixel, pecah jadi pola bintang dan kilau; foto kabur di sebelahnya.

> Masalah kedua lebih rumit. Pixel membentuk kisi kecil, dan cahaya yang melewatinya membelok. Ini disebut difraksi. Hasilnya blur, kabut, dan kilau di sekitar lampu terang.

## c05 — Dibereskan software

- Kata: **29** · estimasi **12 dtk**
- Visual: Foto rusak masuk blok jaringan saraf, keluar bersih. Callout: PSF, 167 peserta.

> Karena optik tidak bisa sempurna, software menolong. Peneliti mengukur pola sebaran cahaya, namanya point spread function, lalu melatih jaringan saraf memulihkan gambarnya. Tantangan MIPI 2022 saja diikuti 167 peserta.

## c06 — Penjelasan

- Kata: **22** · estimasi **9 dtk**
- Visual: Dua foto berdampingan: sebelum dan sesudah restorasi; lalu metasurface berpola nano di atas lensa.

> Ada jalur lain: metasurface, lapisan nano yang meluruskan gelombang cahaya. Itu masih riset. Intinya, selfie UDC adalah kompromi antara optik dan komputasi.

## c07_payoff — Payoff + outro

- Kata: **25** · estimasi **10 dtk**
- Visual: Layar penuh mulus; kamera tersembunyi berkedip lalu hilang. Kartu outro AUDIRA.

> Jadi, layar mulus itu ada harganya. Kamu menukar sedikit ketajaman dengan tampilan bersih. Itu kompromi yang tersembunyi. Ikuti AUDIRA untuk teknologi lain yang bekerja diam-diam.

## Opsi hook lain

1. Layar ponselmu menyembunyikan sesuatu: sebuah kamera, dan harganya adalah kualitas fotomu.
2. Hanya 2,9 persen cahaya yang sampai ke kamera ini. Begini cara ponsel menyelamatkannya.

## Total

- **196 kata** ≈ **82 dtk**
