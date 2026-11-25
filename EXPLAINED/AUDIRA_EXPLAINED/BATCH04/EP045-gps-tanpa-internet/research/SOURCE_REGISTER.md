# SOURCE REGISTER — AE-045 "GPS Tetap Bisa Menunjukkan Lokasi Meski Tanpa Internet?"

Tanggal akses semua sumber: 2026-11-08 (diambil via curl, teks dibaca langsung dari halaman).

## Sumber

| Kode | Judul | Penerbit | URL |
|---|---|---|---|
| S1 | Global Positioning System (GPS) | GPS.gov (U.S. Government) | https://www.gps.gov/gps |
| S2 | Frequently Asked Questions | GPS.gov | https://www.gps.gov/faq |
| S3 | GPS Accuracy | GPS.gov | https://www.gps.gov/gps-accuracy |
| S4 | Other Global Navigation Satellite Systems (GNSS) | GPS.gov | https://www.gps.gov/other-global-navigation-satellite-systems-gnss |
| S5 | GPS Constellation (status table) | U.S. Coast Guard Navigation Center (NAVCEN) | https://www.navcen.uscg.gov/gps-constellation |
| S6 | GPS Space Segment | ESA Navipedia (gssc.esa.int) | https://gssc.esa.int/navipedia/index.php/GPS_Space_Segment |
| S7 | GPS General Introduction | ESA Navipedia | https://gssc.esa.int/navipedia/index.php/GPS_General_Introduction |
| S8 | What is Galileo? | European Space Agency (ESA) | https://www.esa.int/Applications/Satellite_navigation/Galileo/What_is_Galileo |
| S9 | Overview of QZSS | Cabinet Office Japan (qzss.go.jp) | https://qzss.go.jp/en/overview/services/sv01_what.html |
| S10 | Download areas & navigate offline in Google Maps (EN + ID) | Google Maps Help | https://support.google.com/maps/answer/6291838 |
| S11 | About privacy and Location Services (Location Services, "Improve GPS accuracy") | Apple Support | https://support.apple.com/en-us/102515 |
| S12 | Use Airplane Mode on your iPhone, iPad, Apple Watch… | Apple Support | https://support.apple.com/en-us/108785 |
| S13 | Manage your Android device's location settings (Location Accuracy) | Android Help (Google) | https://support.google.com/android/answer/3467281 |
| S14 | GnssStatus (API reference, CONSTELLATION_* constants) | Android Developers | https://developer.android.com/reference/android/location/GnssStatus |
| S15 | Global Positioning System | Wikipedia EN (konteks) | https://en.wikipedia.org/wiki/Global_Positioning_System |
| S16 | Assisted GNSS | Wikipedia EN (konteks) | https://en.wikipedia.org/wiki/Assisted_GNSS |
| S17 | Time to first fix | Wikipedia EN (konteks; mengutip Measurement Systems Ltd) | https://en.wikipedia.org/wiki/Time_to_first_fix |

## Tabel klaim

| # | Klaim | Sumber | Tanggal akses | Tingkat | Catatan |
|---|---|---|---|---|---|
| 1 | Satelit GPS memancarkan sinyal satu arah (one-way) berisi posisi satelit dan waktu; penerima hanya menerima, tidak mengirim ke satelit. | S1 ("transmit one-way signals that give the current GPS satellite position and time"); S2 ("simply beacons, like lighthouses, broadcasting one-way reference signals"; satelit "do not track anything on the ground") | 2026-11-08 | HIGH | Inti video. Analogi resmi GPS.gov: mercusuar. |
| 2 | Penerima GPS sendiri menghitung posisi 3D dan waktu dari sinyal yang diterima. | S1 (user segment "uses the transmitted information to calculate the user's three-dimensional position and time"); S15 | 2026-11-08 | HIGH | Perhitungan di dalam HP, bukan di server. |
| 3 | Operator GPS (pemerintah AS) tidak bisa melacak lokasi HP lewat GPS. | S2 | 2026-11-08 | MED | Satu sumber resmi, tapi sangat otoritatif. |
| 4 | Minimal 4 satelit dibutuhkan: 3 koordinat posisi + 1 selisih jam penerima. | S15 ("at a minimum, four satellites must be in view… three position coordinates and the deviation of its own clock"); S6 (24 slot menjamin "at least four satellites" terlihat) | 2026-11-08 | HIGH | Dengan ketinggian diketahui, 3 satelit bisa cukup (S15) — jangan bilang "tidak mungkin dengan 3". |
| 5 | Jarak = waktu tempuh sinyal × kecepatan cahaya; satelit membawa jam atom yang sangat stabil. | S15; S7/S6 (Block IIF: jam atom rubidium + cesium) | 2026-11-08 | HIGH | Navipedia menyebut prinsip "triangulation"; istilah tepat untuk jarak = trilaterasi (pseudorange). |
| 6 | Ketinggian orbit GPS ±20.200 km (MEO), periode ±11 jam 58 menit (2 putaran/hari sideris), 6 bidang orbit, inklinasi 55°. | S6 ("altitude of 20 200 km", "11 h 58m 2 s", "six equally-spaced orbital planes… 55 degrees"); S15 | 2026-11-08 | HIGH | Kecepatan satelit ±3,9 km/s (S6, MED). |
| 7 | Desain konstelasi nominal 24 satelit; jumlah riil lebih banyak. NAVCEN mendaftar 32 satelit (11 IIF, 10 GPS III, 4 IIR, 7 IIR-M) di tabel status saat diakses. | S1 ("nominal constellation of 24 operating satellites"); S5 (hitungan baris tabel 2026-11-08); S15 (31 satelit per Feb 2019) | 2026-11-08 | MED | KONFLIK: FAQ GPS.gov (S2) menulis "As of July 3, 2023… 25 operational satellites", bertentangan dengan S5 & S15. Angka pasti "aktif hari ini" tidak terverifikasi tegas. Aman: "minimal 24, kini sekitar 30-an". |
| 8 | Dari titik mana pun di Bumi dengan langit terbuka biasanya terlihat ±9 satelit GPS (desain menjamin ≥4, umumnya ≥6). | S15 ("nine satellites are usually visible"; "at least six"); S6 (≥4) | 2026-11-08 | MED | Angka 9 hanya dari Wikipedia; pakai "minimal 4, biasanya lebih". |
| 9 | Waktu tempuh sinyal dari satelit di atas kepala ±0,067 detik (20.200 km ÷ 299.792 km/s ≈ 67 ms). | Perhitungan dari S6 + konstanta kecepatan cahaya | 2026-11-08 | MED | Hitungan sendiri; dari satelit dekat cakrawala lebih lama (jarak lebih jauh). Sebut "sekitar 0,07 detik". |
| 10 | Akurasi HP ber-GPS umumnya dalam radius 4,9 m di langit terbuka; memburuk dekat gedung, jembatan, pohon. | S3 (mengutip studi ION) | 2026-11-08 | MED | Satu sumber resmi (mengutip riset). Aman: "sekitar 5 meter". |
| 11 | Penyebab akurasi buruk/gagal: sinyal terhalang gedung/jembatan/pohon, pemakaian di dalam ruangan atau bawah tanah, pantulan (multipath), jamming, badai matahari. | S3; S11 (dinding, atap kendaraan, gedung tinggi, gunung memblokir line of sight); S2 (jamming, solar flares) | 2026-11-08 | HIGH | Penjelasan terowongan/gedung. |
| 12 | Saat GPS terhalang, iPhone memakai Wi‑Fi atau jaringan seluler untuk memperkirakan posisi sampai satelit terlihat lagi. | S11 | 2026-11-08 | MED | Android serupa: Location Accuracy pakai Wi‑Fi, menara seluler, GPS, sensor (S13). Gabungan = HIGH untuk "HP memakai sumber lain selain GPS". |
| 13 | Lokasi HP adalah gabungan GPS + Wi‑Fi + seluler + Bluetooth + sensor (akselerometer, giroskop). | S11 (cellular, Wi‑Fi, GPS, Bluetooth); S13 (Wi‑Fi, menara seluler, GPS, akselerometer, giroskop) | 2026-11-08 | HIGH | Tanpa internet, bagian GPS tetap jalan; bantuan berbasis database Wi‑Fi/seluler bisa berkurang. |
| 14 | HP Android mendukung banyak konstelasi: GPS, GLONASS, Galileo, BeiDou, QZSS, IRNSS/NavIC, SBAS (konstanta API). | S14 | 2026-11-08 | MED | API mendefinisikan jenisnya; dukungan aktual tergantung chip tiap HP. |
| 15 | GNSS lain: GLONASS (Rusia, 24+ satelit), Galileo (UE, 28 satelit total, orbit 23.222 km, 3 bidang, 56°), BeiDou (Tiongkok, 35 satelit, resmi 2020), QZSS (Jepang, 7+ satelit, regional Asia Timur & Oseania), NavIC (India, 7 satelit, regional). | S4 (semua); S8 (Galileo detail); S9 (QZSS) | 2026-11-08 | HIGH | Galileo: 2 dari 28 di orbit salah (dipakai SAR). Jumlah bisa berubah; cantumkan tahun. |
| 16 | A‑GPS/A‑GNSS: data orbit (ephemeris/almanak) dan waktu dikirim lewat jaringan agar "fix" pertama lebih cepat (TTFF); receiver dengan GPS mandiri tetap bisa jalan tanpa jaringan, hanya lebih lambat. | S16 ("can work beyond network range"); S11 ("Locating all visible satellites can take several minutes, with accuracy gradually increasing") | 2026-11-08 | MED | S16 = Wikipedia; S11 mendukung "bisa makan beberapa menit". Internet = akselerator, bukan syarat. |
| 17 | Data navigasi satelit GPS dikirim lambat, 50 bit/detik; almanak lengkap butuh 12,5 menit. | S15; S16 | 2026-11-08 | MED | Dua-duanya Wikipedia. Alasan cold start lambat. |
| 18 | TTFF tipikal: cold start 2–4 menit, warm ±45 detik, hot ±22 detik atau beberapa detik. | S17 (mengutip Measurement Systems Ltd) | 2026-11-08 | LOW | Angka tergantung perangkat; jangan pakai angka di naskah, cukup "bisa beberapa menit" (S11). |
| 19 | Google Maps: area bisa diunduh untuk offline; navigasi offline bekerja bila seluruh rute ada dalam area unduhan. | S10 (EN + ID) | 2026-11-08 | MED | Sumber resmi tunggal (produsen). |
| 20 | Google Maps offline: rute transportasi umum, sepeda, dan jalan kaki TIDAK tersedia; saat menyetir offline tidak ada info lalu lintas dan rute alternatif. | S10 (teks ID: "rute transportasi umum, bersepeda, atau jalan kaki tidak tersedia… tidak bisa mendapatkan info lalu lintas atau rute alternatif") | 2026-11-08 | MED | Sumber resmi tunggal. |
| 21 | Peta offline Google Maps kedaluwarsa dan harus diperbarui; bila ≤15 hari lagi kedaluwarsa dan tersambung Wi‑Fi, Maps mencoba memperbarui otomatis. | S10 | 2026-11-08 | MED | Masa berlaku total tidak disebut di halaman → tidak terverifikasi. |
| 22 | Unduh peta offline tidak tersedia di sebagian negara/wilayah (kontrak, bahasa, format alamat). | S10 | 2026-11-08 | MED | Ketersediaan untuk Indonesia: tidak terverifikasi di sumber resmi. |
| 23 | Mode Pesawat iPhone: "turns off all radios except for Bluetooth"; fokus mematikan seluler dan Wi‑Fi. | S12 | 2026-11-08 | LOW (untuk klaim GPS) | Apple TIDAK menyebut status GPS di halaman ini. Klaim "GPS tetap aktif di mode pesawat" tidak terverifikasi resmi; perilaku beda per perangkat. |
| 24 | GPS sipil gratis, kontinu, seluruh dunia; operasional sejak 1995 dan tidak pernah dimatikan. | S1; S2; S7 (FOC Juni 1995) | 2026-11-08 | HIGH | Fakta pendukung opsional. |
| 25 | Jam satelit GPS berjalan ±38 mikrodetik/hari lebih cepat dibanding jam di Bumi (relativitas) dan dikoreksi. | S15 | 2026-11-08 | LOW | Wikipedia saja; jangan dipakai kecuali dicek lagi. |
