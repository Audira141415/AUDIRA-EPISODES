# RESEARCH_REPORT — EP047 "Mengapa Sinyal HP Bisa Hilang di Dalam Gedung?"

Tanggal: 2026-11-07. Nomor [#] merujuk ke tabel klaim di `SOURCE_REGISTER.md`.

## 1. Mekanisme inti (berurutan)

1. **Sinyal HP adalah gelombang radio** dari antena BTS di luar gedung. Di Indonesia frekuensinya umumnya ratusan MHz sampai beberapa GHz.
2. **Dinding luar memotong sebagian energi.** Tambahan redaman karena HP berada di dalam gedung disebut *building entry loss* [#1]. Untuk gedung biasa, median model ITU sekitar 14–16 dB di pita 0,9–3,5 GHz. Artinya sinyal tinggal sekitar 1/25 sampai 1/40 dayanya [#3].
3. **Materialnya menentukan.** Kaca biasa hanya sekitar 2 dB. Beton bisa 12 dB atau lebih di 1,8 GHz. Kaca hemat energi berlapis logam tipis (low-e/IRR) sekitar 23 dB, sepuluh kali lipat kaca biasa dalam skala desibel [#4, #5].
4. **Gedung hemat energi justru paling "kedap sinyal".** Kaca berlapis logam, panel berlapis foil, dan beton bertulang tebal membuat median redaman sekitar 30 dB. Sinyal tersisa sekitar seperseribu [#2, #3].
5. **Frekuensi tinggi lebih cepat teredam.** Di model 3GPP, redaman beton naik sekitar 4 dB untuk tiap tambahan 1 GHz. Itu sebabnya sinyal 5G frekuensi tinggi paling rentan di dalam ruang [#6].
6. **Makin ke tengah gedung, makin lemah.** Model 3GPP menambah sekitar 0,5 dB tiap meter ke dalam. Contoh nyata: orang pindah ke dekat jendela untuk menelepon [#7].
7. **Lift dan basement adalah titik terparah.** Kotak logam lift memantulkan gelombang seperti sangkar Faraday [#8]. Di basement, sinyal harus menembus tanah dan beberapa lantai beton. NIST mencatat sinyal 1,8 GHz jatuh ke tingkat derau di basement [#9]. Terowongan MRT Jakarta butuh jaringan khusus [#14].
8. **Solusinya: bawa "BTS" ke dalam gedung.** Pilihannya IBS/DAS dengan antena kecil di plafon tiap lantai yang dipakai bersama operator (neutral host) [#11, #15], small cell/femtocell [#12], Wi-Fi Calling [#13], atau repeater resmi dari operator. Repeater pasang sendiri tanpa sertifikat ilegal [#16].

## 2. Fakta paling menarik yang aman dipakai di naskah

1. **Gedung hemat energi menahan sinyal sekitar dua kali lipat desibel gedung biasa.** Median ITU: sekitar 15 dB vs sekitar 30 dB. Dalam daya, sinyal tersisa kira-kira 1/30 vs 1/1000 [#3, #5]. Sebut "menurut model ITU".
2. **Kaca jendela modern bisa jadi "cermin" sinyal.** Kaca low-e berlapis logam meredam sekitar 23 dB. Kaca biasa hanya sekitar 2 dB [#4]. Sebut "lapisan logam super tipis di kaca".
3. **Lift berperilaku seperti sangkar Faraday.** Dinding dan kerangka logam memantulkan gelombang radio, sehingga muncul dead zone [#8]. Hindari angka.
4. **Terowongan MRT Jakarta, lebih dari 20 meter di bawah tanah, perlu jaringan sendiri.** Pada Maret 2019 baru Telkomsel yang tersedia di terowongan dengan 48 BTS di 13 stasiun. Pengguna operator lain kehilangan sinyal sepanjang jalur bawah tanah [#14]. Wajib sebut "saat MRT baru beroperasi, 2019".
5. **Repeater beli online belum tentu legal.** Repeater tanpa sertifikat bisa mengganggu sinyal orang lain dan pernah ditertibkan Kominfo [#16]. Jangan sebut angka denda.

## 3. JANGAN DIKLAIM

- Jangan bilang "beton memblokir sinyal 100%" atau "sinyal tidak bisa menembus beton". Yang benar: sinyal melemah, besarnya bervariasi.
- Jangan sebut satu angka dB sebagai nilai pasti "gedung X" atau "dinding beton". Semua angka di atas adalah median model statistik ITU/3GPP. NIST menunjukkan variasinya bisa puluhan dB [#10].
- Jangan klaim "gedung baru pasti susah sinyal". ITU menegaskan klasifikasinya berdasarkan efisiensi termal, bukan usia gedung [#2].
- Jangan beri angka redaman lift. Tidak ditemukan pengukuran kredibel.
- Jangan sederhanakan jadi "frekuensi tinggi selalu kalah". Untuk lubang/jaring logam, gelombang pendek justru lebih mudah lolos [#8]. Klaim yang aman: material bangunan seperti beton meredam frekuensi tinggi lebih kuat.
- Jangan sebut ada aturan Kominfo/Komdigi yang mewajibkan IBS di mal/gedung. Tidak terverifikasi [#18].
- Jangan sebut denda repeater "Rp600 juta" sebagai aturan berlaku. Angka itu dari UU 36/1999 versi berita 2014–2015, dan pasalnya telah diubah UU Cipta Kerja [#16].
- Jangan klaim kondisi sinyal operator di MRT "sampai sekarang". Data terakhir yang terbaca dari 2019 [#14].
- Jangan klaim semua operator Indonesia mendukung Wi-Fi Calling. Tidak terverifikasi [#13].
- Jangan pakai mitos "aluminium foil/stiker penguat sinyal" atau "sinyal ditarik lewat jendela".
- Angka "80% data dipakai di dalam ruangan" hanya boleh dengan atribusi "menurut Ericsson" [#17].
- Jangan sebut "Kominfo" untuk kejadian 2025–2026. Nama kementerian sekarang Komdigi; sebut Kominfo hanya untuk kejadian 2013–2019.

## 4. Saran visual akurat (untuk animasi 3D)

- **BTS luar**: menara atau tiang di atap dengan antena sektoral, yaitu panel persegi panjang vertikal abu-abu/putih, biasanya tiga arah. Sinyal digambar sebagai muka gelombang melengkung, bukan garis laser.
- **Gedung potongan (cutaway)**: fasad kaca kebiruan-hijau. Lapisan low-e cukup digambar sebagai film metalik super tipis di satu sisi kaca, tidak terlihat seperti cermin tebal. Dinding beton abu-abu dengan jaring besi tulangan (rebar) di dalam, berupa batang baja berulir cokelat-abu berpola kotak.
- **Redaman**: gelombang yang menembus tampak memudar atau menipis amplitudonya. Sebagian dipantulkan, terutama oleh kaca berlapis logam. Gelombang menembus lebih mudah lewat kaca biasa atau jendela terbuka daripada beton. Tampilkan bar sinyal HP turun bertahap dari luar, ke tepi jendela, ke tengah lantai, lalu ke lift/basement.
- **Lift**: kabin kotak baja di dalam ruang luncur (shaft) beton. Pintu baja. Gelombang memantul di permukaan luar kabin. Jangan gambar perisai energi bercahaya.
- **Basement**: lantai di bawah garis tanah, dengan lapisan tanah cokelat dan beberapa pelat lantai beton di atasnya. Gelombang meredup hingga hilang.
- **IBS/DAS**: antena plafon berupa piringan/kubah putih kecil (sekitar 15–25 cm) di plafon koridor tiap lantai. Antena itu terhubung kabel koaksial atau fiber lewat shaft ke ruang perangkat (headend/BTS hotel) dengan rak perangkat. Satu sistem bisa membawa beberapa operator (neutral host). Gambarkan jalur kabel vertikal di shaft.
- **Repeater**: antena donor di atap atau luar jendela, kotak penguat, dan antena dalam ruang. Beri label "resmi/operator".
- **Femtocell/small cell**: kotak kecil putih setara router, tersambung kabel internet.
- **Wi-Fi Calling**: ikon status bar HP berubah ke label "Wi-Fi"/VoWiFi. Router Wi-Fi meneruskan panggilan lewat internet ke jaringan operator.
- **Hindari**: satelit sebagai sumber sinyal HP, sinyal digambar sebagai sinar lurus yang "terpental" seperti bola, dan logo operator tanpa izin.
