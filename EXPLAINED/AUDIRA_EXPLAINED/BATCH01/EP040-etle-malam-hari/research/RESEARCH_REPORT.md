# RESEARCH_REPORT — EP040 "Kamera ETLE Bisa Membaca Plat Nomor di Malam Hari?"

Riset 2026-11-07. Nomor [#] merujuk ke tabel klaim di `SOURCE_REGISTER.md`.

## Jawaban singkat

Ya, bisa, tapi caranya tidak sama di setiap titik. Kamera ANPR umumnya menembakkan cahaya sendiri (inframerah tak kasatmata atau lampu kilat biasa) tepat dari samping lensa. Pelat nomor dibuat dari bahan retroreflektif, jadi cahaya itu dipantulkan lurus kembali ke kamera. Latar pelat tampak terang, huruf tetap gelap, lalu perangkat lunak membaca hurufnya. Hasilnya tetap diperiksa petugas back office sebelum surat konfirmasi dikirim.

## Mekanisme inti (berurutan)

1. **Kendaraan masuk zona tangkap.** Kamera dipasang di tiang/gantry dengan sudut tertentu ke lajur. Sudut yang terlalu miring membuat pelat sulit terbaca [#10]. Di Polda Metro (2019) ada kamera ANPR, kamera check point, dan speed radar yang terhubung ke check point [#20].
2. **Kamera menyalakan cahayanya sendiri.** Sistem ANPR umumnya memakai iluminator inframerah agar bisa memotret siang dan malam [#3]. Di Bontang, polisi menyebut kamera ETLE memakai inframerah pada malam hari [#23]. Di titik lain (Cengkareng, Margonda) kamera memakai flash cahaya tampak [#24].
3. **Pelat memantulkan cahaya balik ke kamera.** Lapisan retroreflektif (manik kaca atau mikro-prisma) memantulkan cahaya kembali ke arah sumbernya, bukan ke segala arah. Karena lampu terpasang di sebelah lensa, pantulan itu masuk ke kamera. Latar pelat menyala, huruf yang tidak reflektif tetap gelap, dan kontrasnya tinggi [#4, #5, #6]. Ini juga alasan TNKB diubah ke latar putih sejak 2022: lebih kontras di kamera [#7].
4. **Shutter sangat cepat membekukan gerak.** Kamera ANPR khusus idealnya memakai shutter sekitar 1/1000 detik agar tidak blur. Global shutter lebih disukai daripada rolling shutter karena seluruh gambar diambil serentak, jadi pelat tidak miring atau melengkung [#8, #9]. Cahaya dari iluminator membuat shutter secepat itu tetap mendapat cukup cahaya.
5. **Software mencari dan merapikan pelat.** Langkahnya: cari lokasi pelat di gambar → luruskan dan ukur ulang → normalisasi terang dan kontras [#2].
6. **Segmentasi lalu OCR.** Pelat dipecah per karakter, setiap karakter dikenali (OCR, kini sering memakai neural network/CNN), lalu hasilnya dicek terhadap format pelat yang sah, misalnya pola "huruf-angka-huruf". Hasil dari beberapa frame dirata-rata agar lebih yakin [#2].
7. **Back office memverifikasi.** Foto atau video dikirim ke Back Office ETLE di RTMC Polda. Petugas memeriksa pelanggaran dan mencocokkan pelat dengan data kendaraan ERI. Pembacaan yang gagal atau meragukan bisa dicek manusia [#13, #14].
8. **Surat konfirmasi, lalu tilang.** Surat konfirmasi dikirim ke alamat pemilik. Ini belum surat tilang [#15]. Pemilik mengonfirmasi dalam 8 hari lewat situs, kode QR, atau posko. Setelah itu tilang terbit dan dibayar lewat BRIVA. Kalau tidak dikonfirmasi, STNK diblokir sementara [#14, #16].

## Fakta paling menarik yang aman dipakai

1. **Pelat nomor itu "cermin balik".** Bahan retroreflektif memantulkan cahaya lurus kembali ke sumbernya. Di foto ber-flash, latar pelat bisa berubah jadi putih terang. Ini dikatakan Ditlantas PMJ pada 2019 [#4, #6].
2. **TNKB jadi putih demi kamera.** Mulai 2022 pelat pribadi diganti dari hitam ke putih karena lebih kontras dan lebih mudah ditangkap kamera ETLE [#7].
3. **"Sinar merah itu infrared, bukan tidak aktif."** Ini ucapan Kasatlantas Polres Bontang (Feb 2025) soal warga yang mengira kamera mati di malam hari [#23]. Sebaliknya, di Margonda Depok, flash yang menyilaukan dikeluhkan warga dan dimatikan pada malam hari (Feb 2026) [#24, #25]. Teknologinya beda per lokasi.
4. **Seperseribu detik.** Kamera ANPR khusus idealnya memotret dengan shutter sekitar 1/1000 detik agar mobil yang melaju tidak blur [#8].
5. **Kamera bukan hakim terakhir.** Hasil kamera tetap diverifikasi petugas. Surat pertama yang datang adalah surat konfirmasi, bukan surat tilang [#14, #15].
6. Angka pendukung (sumber resmi tunggal): ada 1.614 perangkat ETLE per Mei 2026. Sepanjang 2025 tercatat 9.130.743 pelanggaran tervalidasi [#22]. Semester I 2026 mencatat 16.812 pelanggaran pelat (palsu atau tanpa pelat), 77,24% oleh motor [#27].

## Plat tidak standar / ditutup

- Pelat yang ditutup kertas, lakban, atau kartu plastik membuat kamera gagal membaca. Korlantas menemukan praktik ini di Jakarta (Jul 2026) [#26].
- Pelat custom dengan font tidak standar sulit dibaca ETLE (polisi Jakbar, 2024) [#31]. Secara umum, ANPR bergantung pada font dan format standar [#11].
- Pelat yang seluruh permukaannya reflektif, termasuk hurufnya, menghilangkan kontras huruf-latar. Mekanisme ini dikenal di literatur ANPR. Efektivitasnya terhadap ETLE tidak terverifikasi [#30].
- Respons Korlantas: face recognition yang terhubung dengan data Dukcapil. Hasil capture yang tidak cocok dengan data registrasi diindikasi pelat palsu dan diteruskan ke petugas lapangan [#28].
- Sanksi: Pasal 280 UU 22/2009, kurungan maks 2 bulan atau denda maks Rp500.000. Pelat palsu dapat dikenai Pasal 391 KUHP [#29].

## JANGAN DIKLAIM

- "Semua kamera ETLE memakai inframerah." Salah. Ada titik yang memakai flash cahaya tampak (Cengkareng, Margonda, Samarinda) [#24].
- "Kamera ETLE pakai global shutter / 850 nm / X megapiksel / merek Y." Tidak ada sumbernya [#32].
- "ETLE akurat 100%" atau "tidak pernah salah baca." Pakai angka riset (93%/78%) hanya sebagai contoh riset umum, jangan sebagai akurasi ETLE [#12].
- "Kamera langsung mengirim surat tilang." Salah. Ada verifikasi petugas dan surat konfirmasi lebih dulu [#14, #15].
- "Semua titik ETLE pasti aktif 24 jam." Yang terverifikasi hanya pernyataan per wilayah atau umum. Gunakan "dirancang beroperasi siang dan malam" [#19].
- "Kamera Margonda masih menilang di malam hari setelah flash dimatikan." Tidak terverifikasi [#25].
- "Inframerah bisa tembus kaca film gelap." Hanya kutipan satu polisi, tidak diverifikasi [#23].
- "Semprotan anti-kamera ampuh mengelabui ETLE." Tidak terverifikasi, dan efektivitasnya dipersoalkan [#30]. Jangan beri kesan tips menghindari tilang.
- "TNKB Indonesia memakai standar reflektif X." Spesifikasi bahan resmi (Perpol) tidak dibaca. Cukup sebut "pelat dirancang memantulkan cahaya" dengan sumber PMJ dan Korlantas [#6, #7].
- Tanggal Bontang: artikel menulis "4/2/2024" padahal terbit Feb 2025. Jangan sebut tanggal hari spesifik.

## Saran visual akurat (untuk 3D)

- **Tiang/gantry ETLE.** Tiang logam abu-abu dengan lengan menjulur di atas lajur. Margonda punya 3 kamera berjejer di satu tiang [#25]. Kamera berbentuk housing kotak memanjang (bullet/box) dengan kaca depan, menghadap kendaraan yang datang dari arah miring-atas, bukan tegak lurus dari atas.
- **Iluminator.** Panel LED terpisah atau terintegrasi di sebelah lensa. LED inframerah terlihat sebagai titik merah redup ("sinar merah" di Bontang). Sorot IR-nya jangan digambar sebagai sinar merah terang yang solid. Beri label "inframerah: tak terlihat mata" dan visualkan sebagai gelombang semi-transparan. Varian flash cahaya tampak berupa kilatan putih singkat.
- **Pantulan retroreflektif.** Gambar sinar yang memantul lurus kembali ke kamera (sudut datang = sudut balik), bukan memantul seperti cermin ke arah lain. Close-up bisa menampilkan manik kaca kecil atau mikro-prisma di bawah permukaan pelat.
- **Tampilan "mata kamera".** Frame monokrom (IR): latar pelat putih menyala, huruf hitam pekat, sekeliling gelap. Kendaraan tampak abu-abu tanpa warna. Ini sesuai sifat kamera IR monokrom.
- **Pelat TNKB.** Latar putih, huruf hitam, font FE-Schrift untuk roda empat (sejak Nov 2022). Ukuran sekitar 460×135 mm (mobil) dan 275×115 mm (motor), aluminium [W1]. Format contoh "B 1234 XYZ". Gunakan nomor fiktif, jangan nomor asli.
- **Pipeline software.** Kotak deteksi di pelat → crop dan luruskan → histogram atau kontras dinaikkan → kotak per karakter (segmentasi) → karakter terbaca dengan skor keyakinan → cek pola → masuk ke back office.
- **Back office RTMC.** Ruang kontrol dengan petugas yang memverifikasi foto di layar, lalu surat konfirmasi dengan kode QR. Pembayaran lewat virtual account.
- **Hindari:** kamera yang "melihat" dengan laser, pemindai sinar hijau ala sci-fi, membaca chip/RFID pada pelat (chip TNKB baru sebatas rencana 2023, tidak diverifikasi berjalan), drone sebagai kamera utama malam hari, dan logo merek kamera.
