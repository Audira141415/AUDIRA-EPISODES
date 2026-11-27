# Research Report — Cara Cek Foto Lama yang Diklaim Kejadian Baru

## Sumber utama

- Google Search Help (#1) — panduan resmi fitur "Search with an image" / Google Lens. HIGH.
- Wikipedia: TinEye (#2), Exif (#3), Fact-checking (#4), Error Level Analysis (#5), Content Authenticity Initiative (#6), 2026 French disinformation (#7), Reverse image search (#8), Misinformation (#9), Google Lens (#11). Semua MEDIUM.
- Dokumentasi platform tentang EXIF stripping (#10) — fakta umum yang dikonfirmasi komunitas teknis. MEDIUM.

## Fakta terverifikasi

1. **Reverse image search** adalah teknik pencarian berbasis gambar (bukan keyword) yang mencocokkan gambar input dengan database, termasuk versi yang diedit, dipotong, atau diubah ukuran (#8).
2. **Google Lens** (diluncurkan 2017) menyediakan reverse image search gratis melalui browser (Chrome, Firefox, Safari, Edge). Cara: upload gambar, drag & drop, tempel URL, atau klik kanan → "Search with Google Lens" (#1, #11).
3. **TinEye** (diluncurkan 2008, Toronto, Kanada) adalah mesin reverse image search pertama yang menggunakan sidik jari digital gambar. Per September 2025 mengindeks >77,6 miliar gambar. Fitur kunci: sort by "oldest" untuk menemukan kemunculan paling awal (#2).
4. **Yandex Images** masih beroperasi (Yandex dijual ke konsorsium Rusia Juli 2024, US$5,3 miliar; layanan pencarian tetap aktif di Rusia dan beberapa negara). Yandex dikenal kuat mengenali wajah dan lokasi, tetapi akses bisa lambat/dibatasi dari Indonesia (#Wikipedia Yandex).
5. **Metadata Exif** mencatat model kamera, tanggal/waktu, pengaturan, dan GPS. Versi terbaru 3.0 (Mei 2023) (#3).
6. **Platform medsos menghapus Exif**: WhatsApp, X/Twitter, Facebook, dan Instagram menghapus sebagian besar metadata Exif (termasuk GPS, tanggal) saat gambar diunggah — untuk privasi dan kompresi. Ini berarti Exif hanya berguna pada foto asli dari kamera/HP, bukan foto yang sudah beredar di medsos (#10, #3).
7. **Error Level Analysis (ELA)** mendeteksi area gambar yang pernah diedit dengan menganalisis artefak kompresi JPEG. Keterbatasan: tidak bekerja pada PNG, dan resave berulang mengaburkan hasil (#5).
8. **Alat profesional** yang dipakai fact-checker: reverse image search, InVID (plugin browser untuk verifikasi video/gambar), FotoForensics (ELA online), Internet Archive/Wayback Machine (#4).
9. **C2PA & Content Credentials** (didirikan 2021 oleh Adobe, Arm, BBC, Intel, Microsoft, Truepic): standar metadata kriptografis yang mencatat asal-usul dan riwayat edit file digital. Masa depan verifikasi keaslian (#6).
10. **Contoh nyata**: dalam protes mahasiswa Prancis 2026, AFP menggunakan reverse image/video search untuk mengungkap bahwa banyak konten viral sebenarnya berasal dari 2023 — gambar/video asli tapi konteksnya salah (#7).
11. **World Economic Forum** (Januari 2024): misinformasi dan disinformasi adalah risiko global paling parah jangka pendek (#9).

## Perselisihan / Kontroversi

- **Hook "foto banjir tahun lalu"**: contoh generik, bukan klaim spesifik. Ini OK sebagai ilustrasi — tidak ada angka yang perlu dikoreksi. Namun hook perlu dipertegas karena terlalu lembut untuk short (tidak ada "fakta mengejutkan").
- **Yandex**: masih berfungsi per 2026 tetapi akses dari luar Rusia bisa tidak stabil. Sebaiknya disebut sebagai opsi tambahan, bukan alat utama. Naskah menyebutkan keterbatasannya.
- **EXIF stripping**: sering disalahpahami. Banyak orang mengira bisa cek tanggal foto yang beredar di WhatsApp — padahal WhatsApp menghapus Exif. Naskah wajib menjelaskan batasan ini.
- **AI-generated images**: teknik reverse image search dan ELA TIDAK dirancang untuk mendeteksi foto yang sepenuhnya dibuat AI (deepfake foto/AI art). Naskah menyebutkan batasan ini di penutup.
- **Judul/hook tidak berlebihan**: tidak ada klaim angka yang salah. Judul akurat sebagai konten literasi digital.

## Angka kunci untuk HUD

| Angka / Data | Konteks | # sumber |
|---|---|---|
| 77,6 miliar gambar | Jumlah gambar terindeks TinEye (per Sep 2025) | #2 |
| 2017 | Tahun peluncuran Google Lens | #11 |
| 2008 | Tahun peluncuran TinEye | #2 |
| Januari 2024 | WEF identifikasi misinformasi sebagai risiko global #1 jangka pendek | #9 |
| 2021 | Tahun pendirian C2PA | #6 |

## Poin kunci

1. Reverse image search (Google Lens, TinEye) adalah langkah pertama dan paling mudah: seret foto ke Google Images atau TinEye, lihat kemunculan paling awal.
2. TinEye punya fitur "sort by oldest" yang sangat berguna untuk melacak asal-usul foto.
3. Metadata Exif bisa mengungkap tanggal dan lokasi asli — tapi hanya pada foto langsung dari kamera, karena platform medsos menghapus Exif.
4. ELA (FotoForensics) bisa mendeteksi area gambar yang diedit — tapi punya banyak keterbatasan.
5. Teknik ini tidak berlaku untuk foto yang sepenuhnya dibuat AI — perlu alat berbeda (C2PA/Content Credentials di masa depan).
6. Konten viral yang menyesatkan sering bukan foto palsu, melainkan foto asli dengan konteks yang salah (out-of-context).
