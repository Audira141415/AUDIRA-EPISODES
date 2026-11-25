# RESEARCH_REPORT — EP038 Jakarta Terus Turun Tanah, Bagaimana Satelit Mengetahuinya?

Riset per 2026-11-07. Nomor [#] merujuk ke baris klaim di `SOURCE_REGISTER.md`.

## Mekanisme inti (berurutan)

1. **Kenapa tanahnya turun.** Jakarta berdiri di atas endapan aluvium muda dan lunak. Cekungannya berisi endapan kuarter setebal 200–300 m [6, 9]. Ada tiga pendorong utama. Air tanah dipompa dari akuifer, tekanan air di pori turun, lalu lapisan lempung memadat. Beban gedung menekan tanah lunak. Endapan muda juga memadat sendiri secara alami. Tektonik pengaruhnya paling kecil [6, 7].
2. **Satelit memancarkan radar sendiri.** Satelit SAR (misalnya Sentinel-1 milik ESA) memancarkan gelombang mikro ke bumi dan merekam pantulannya. Karena sensornya aktif, satelit bisa memotret menembus awan, siang dan malam [11].
3. **Yang dicatat bukan hanya terang-gelap, tapi juga fase.** Fase adalah posisi "puncak-lembah" gelombang saat kembali. Fase ini bergantung pada jarak satelit ke tanah [10, 12].
4. **Lewat lagi di orbit yang sama, lalu dibandingkan.** Dua citra dari posisi orbit yang hampir sama, beda waktu, dikurangkan fasenya. Hasilnya peta beda fase bernama **interferogram** [10]. Pengaruh topografi (DEM), orbit, dan atmosfer dibuang dulu [9].
5. **Pita warna = sentimeter.** Interferogram tampil sebagai pita warna pelangi berulang (*fringe*). Satu siklus warna penuh berarti tanah bergeser setengah panjang gelombang menjauh atau mendekat ke satelit. Untuk Sentinel-1 (C-band, λ ≈ 5,5 cm), satu pita ≈ 2,8 cm [12, 13]. Makin rapat pitanya, makin curam penurunannya.
6. **PS-InSAR: pilih titik yang "setia".** Puluhan citra ditumpuk, lalu komputer memilih titik yang pantulannya stabil terus, seperti atap, tiang, dan struktur beton. Tiap titik menjadi "patok virtual" dengan grafik naik-turun sendiri [19]. Contohnya studi BRIN: 24 citra Sentinel-1A (2021–2022) menghasilkan 309.071 titik pantau [20].
7. **Dikunci ke tanah dengan GNSS/GPS dan leveling.** InSAR hanya mengukur gerak relatif sepanjang garis pandang miring satelit. Agar menjadi angka vertikal absolut, hasilnya diikat ke stasiun GNSS tetap (CORS) dan dicek dengan survei GPS atau leveling di lapangan [26, 24, 27].
8. **Hasilnya: peta laju penurunan.** Biasanya ditampilkan dalam cm/tahun, merah untuk yang cepat dan hijau/biru untuk yang stabil. Peta Jakarta selalu menunjukkan pola yang sama: utara dan barat laut paling merah, selatan paling stabil [5, 20, 21, 25].

## Fakta paling menarik yang aman dipakai

1. **Tipikal 3–10 cm per tahun, tapi tidak merata.** Ini angka rangkuman tim Geodesi ITB dari pengukuran leveling, GPS, dan InSAR sejak 1974/1982 [2]. Titik tertentu pernah tercatat jauh lebih cepat: GPS 1997–2011 maksimum 28 cm/th [3]. Dalam ±37 tahun (1974–2010), beberapa lokasi turun total hingga sekitar 4 meter [4].
2. **Satu pita warna ≈ 2,8 cm.** Sentinel-1 memakai radar dengan gelombang ±5,5 cm, jadi satu siklus warna di interferogram setara pergeseran ±2,8 cm ke arah satelit [12, 13]. Dari orbit, radar bisa membaca perubahan sekecil itu.
3. **Ratusan ribu "patok virtual".** Satu studi BRIN memakai 24 citra Sentinel-1A dan mendapat 309.071 titik pantau di Jakarta. Rata-rata penurunannya −5,71 cm/tahun, dominan di Jakarta Utara dan Barat (2021–2022) [20].
4. **Data terbaru: hampir 8 cm/tahun di Muara Angke.** Gabungan Sentinel-1 2014–2025 dengan GNSS menemukan enam "mangkuk" penurunan. Terparah di Muara Angke, total sekitar 84 cm selama Okt 2014–Jun 2025 [25]. *(Masih preprint. Sebut "studi terbaru" atau "kajian 2025", bukan "terbukti".)*
5. **Penyebab dominan: air tanah.** Peneliti ITB Heri Andreas menyebut 80–90% penurunan disebabkan pengambilan air tanah dalam (±80–300 m) yang berlebihan [8]. Studi jurnal juga menempatkan air tanah sebagai faktor dominan [6]. Ia juga menegaskan "Jakarta tenggelam" itu clickbait. Yang tepat: wilayah pesisir makin rentan tergenang [30].

Pilihan angka per wilayah yang bisa ditampilkan (sebut sumber dan tahun):
- Sentinel-1A 2019–2020 [21]: Jakarta Utara −4,9; Barat −4,8; Pusat −3,1; Selatan −2,8; Timur −2,5 cm/th.
- ALOS-2 2017–2022 + 255 titik GPS RTK [24]: utara dan barat laut rata-rata 5–6 cm/th.

## JANGAN DIKLAIM

- "Jakarta tenggelam tahun 2050" sebagai kepastian. Itu proyeksi bersyarat ("jika tidak dilakukan apa-apa"), dan peneliti ITB sendiri menyebut istilah tenggelam sebagai clickbait [14, 30].
- "Jakarta turun 25 cm per tahun" sebagai angka seluruh kota. 20–25 cm/th adalah angka puncak lokasi tertentu dari wawancara media 2018 [29]. Rata-rata studi satelit terbaru sekitar 5–6 cm/th.
- Angka laju dari Chaussard dkk. 2013 atau Ng dkk. 2012. Isi makalahnya tidak terbaca.
- "Satelit mengukur dengan presisi milimeter" sebagai klaim absolut. Presisi mm hanya berlaku untuk laju rata-rata dari tumpukan banyak citra (PS-InSAR) yang diikat GNSS. Satu interferogram terganggu atmosfer.
- "Satelit memotret tanah turun" seolah foto biasa. Yang dibaca adalah beda fase gelombang radar, bukan foto optik.
- "Interferogram menunjukkan kedalaman/ketinggian absolut." Interferogram menunjukkan perubahan jarak relatif sepanjang garis pandang miring.
- "Satu warna = satu angka cm tetap." Warna berulang tiap siklus. Butuh *phase unwrapping* untuk menghitung total.
- "Gempa/tektonik penyebab utama." Tektonik paling kecil pengaruhnya [6].
- "Penurunan sudah berhenti" atau "makin parah di semua tempat." Data campuran: ITB 2021 menyebut laju berkurang di beberapa tempat [30], tetapi penurunan masih aktif [20, 25].
- "Sentinel-1 lewat tiap 12 hari" atau "6 hari" tanpa konteks. Jumlah satelit aktif berubah (1B mati 2021, 1C/1D menyusul). Tidak diverifikasi ke ESA.
- Persentase "15% Jakarta di bawah laut" dan "95% Jakarta Utara di bawah laut 2050". Keduanya sumber sekunder atau proyeksi.

## Saran visual akurat (untuk animasi 3D)

- **Sentinel-1**: badan satelit berbentuk kotak, dengan **satu antena radar panjang pipih** (panel SAR ±12 m, permukaan tersusun ubin/modul) dan **dua sayap panel surya**. Radar menembak **miring ke samping** (side-looking), bukan tegak lurus ke bawah. *(Panjang antena 12 m tidak diverifikasi di riset ini. Gambarkan "panjang" tanpa menyebut angka.)*
- **Sinar radar**: gelombang mikro tak kasatmata. Visualisasikan sebagai gelombang sinus/pulsa semi-transparan dengan sudut miring ke tanah. Tampilkan lintasan pulang-pergi. Tembus awan: awan boleh ada, sinar lewat.
- **Fase**: gelombang sinus yang "puncaknya" mendarat di titik berbeda saat lintasan kedua, karena tanah turun sedikit.
- **Interferogram**: pita warna siklik (pelangi berulang, biru-kuning-merah-biru) membentuk cincin konsentris mengelilingi mangkuk penurunan, misalnya di Muara Angke/pesisir utara. Jangan buat gradasi tunggal: fringe selalu berulang.
- **Peta hasil PS-InSAR**: ribuan titik kecil di atas peta kota. Merah/oranye di pesisir utara (Penjaringan, Muara Angke, Pluit) dan barat laut. Hijau/biru ke arah selatan. Satuan cm/tahun.
- **Validasi darat**: tiang antena GNSS (piringan/kubah kecil di atas tiang/atap gedung = CORS) dan alat sipat datar (waterpass di tripod + rambu ukur). Tampilkan sebagai "patok" yang mengunci peta satelit.
- **Penampang tanah**: lapisan aluvium lempung lunak di atas, akuifer pasir di bawah, sumur bor dalam (±80–300 m) menyedot air. Butir lempung merapat lalu permukaan, rumah, dan jalan turun membentuk cekungan mangkuk. Gedung tinggi menambah beban.
- **Dampak yang nyata**: tanggul laut yang terus ditinggikan, rob di pesisir utara, retak bangunan, rumah yang lantainya di bawah jalan [1, 2].
- **Satelit lain**: ALOS/ALOS-2 (Jepang, JAXA) dengan radar L-band. Cukup sebagai "satelit radar Jepang" bila perlu. Bentuk detail tidak diverifikasi.

## Klaim yang gagal diverifikasi

- Isi makalah Abidin dkk. 2011 (Nat Hazards), Abidin dkk. 2008 (GPS Solutions), Chaussard dkk. 2013, dan Ng dkk. 2012 (berbayar/diblokir). Hanya judul yang terkonfirmasi.
- Halaman resmi ESA tentang Sentinel-1 (404). Siklus ulang dan dimensi antena hanya dari Wikipedia.
- Data resmi BIG/Pemprov DKI terbaru (laju per kecamatan). Tidak ditemukan dokumen primer.
- Teks Pergub DKI 93/2021 tidak dibaca langsung.
