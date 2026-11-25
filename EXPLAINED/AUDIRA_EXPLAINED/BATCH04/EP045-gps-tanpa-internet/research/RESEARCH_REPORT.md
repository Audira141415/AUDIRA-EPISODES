# RESEARCH REPORT — AE-045 "GPS Tetap Bisa Menunjukkan Lokasi Meski Tanpa Internet?"

Tanggal riset: 2026-11-08. Nomor [#] merujuk baris di `SOURCE_REGISTER.md`.

## Jawaban singkat

Ya. GPS di HP bekerja dengan **mendengarkan** sinyal satelit, bukan internet. Satelit hanya menyiarkan sinyal satu arah, seperti mercusuar [1]. HP menghitung sendiri posisinya [2]. Internet dipakai untuk hal lain: menampilkan peta, info lalu lintas, dan mempercepat kunci posisi pertama (A‑GPS) [16][20]. Kalau peta sudah diunduh lebih dulu, navigasi tetap jalan [19].

## Mekanisme inti (urut)

1. **Satelit menyiarkan, terus-menerus.** Puluhan satelit GPS di orbit ±20.200 km (6 bidang orbit, mengitari Bumi 2 kali sehari) menyiarkan sinyal satu arah berisi "posisi saya" dan "jam saya" [1][6][7].
2. **Jam atom.** Tiap satelit membawa jam atom yang sangat stabil, disinkronkan oleh stasiun kontrol di darat [5][15].
3. **HP hanya menerima.** Chip GNSS di HP menangkap sinyal itu. Tidak ada data yang dikirim balik ke satelit, jadi satelit tidak tahu HP-mu ada di mana [1][3].
4. **Ukur waktu tempuh, jadi jarak.** HP membandingkan waktu kirim dengan waktu terima. Selisihnya (±0,07 detik dari satelit di atas kepala) dikali kecepatan cahaya menjadi jarak ke satelit itu [5][9].
5. **Trilaterasi + 1 satelit untuk jam.** Tiga jarak menentukan titik di ruang 3D. Jam HP tidak seakurat jam atom, jadi butuh satelit ke‑4 untuk mengoreksi selisih jam. Minimal 4 satelit [4].
6. **Bukan hanya GPS.** HP modern juga mendengar GLONASS, Galileo, BeiDou, QZSS, dan lain-lain. Lebih banyak satelit, posisi lebih cepat dan stabil [14][15].
7. **Internet sebagai "jalan pintas".** Data orbit dari satelit dikirim sangat lambat (50 bit/detik). A‑GPS mengunduhnya lewat internet agar kunci posisi pertama lebih cepat. Tanpa internet, GPS tetap bekerja, hanya bisa butuh waktu lebih lama (bisa beberapa menit) [11][16][17].
8. **Peta adalah lapisan terpisah.** Titik biru = hasil GPS. Gambar jalan di bawahnya = data peta yang perlu diunduh. Peta offline Google Maps menyimpan data itu di HP, jadi navigasi mobil tetap jalan selama seluruh rute ada di area unduhan [19].

## Fakta paling menarik (aman untuk naskah)

1. **Satelit GPS itu seperti mercusuar.** Hanya menyiarkan, tidak melacak siapa pun. Operator GPS pun tidak bisa menemukan HP-mu lewat GPS [1][3].
2. **Sinyal menempuh ±20.200 km dalam sekitar 0,07 detik**, dan HP-mu mengukur selisih waktu sekecil itu untuk tahu posisinya [6][9].
3. **Butuh minimal 4 satelit**, bukan 3: satelit keempat dipakai untuk membetulkan jam HP [4].
4. **Akurasi HP biasa sekitar 5 meter** di langit terbuka (GPS.gov: 4,9 m), dan memburuk dekat gedung, jembatan, dan pohon [10].
5. **Peta offline Google Maps** tetap bisa memandu mobil, tapi tanpa info lalu lintas, tanpa rute alternatif, dan tanpa rute jalan kaki/sepeda/transportasi umum. Peta itu juga kedaluwarsa dan perlu diperbarui [20][21].

Tambahan opsional:
- Kenapa gagal di terowongan, basement, atau dalam gedung: sinyal satelit lemah dan terhalang beton/tanah; juga bisa memantul dari dinding gedung (multipath) [11]. Saat itu HP mencoba menebak lewat Wi‑Fi/seluler [12].
- **Fakta Indonesia (relevan):** QZSS Jepang dirancang melengkapi GPS di Asia Timur dan Oseania; Android punya konstanta untuk QZSS [14][15]. Klaim "QZSS meliputi seluruh Indonesia" tidak terverifikasi dari sumber yang dibaca, jangan dipakai spesifik.
- GPS sipil gratis untuk seluruh dunia dan beroperasi penuh sejak 1995 [24].

## JANGAN DIKLAIM

- **"HP mengirim lokasi ke satelit"** atau **"satelit melacak HP"**. Salah: satu arah [1][3].
- **"Triangulasi sudut"**. Yang dipakai jarak (trilaterasi / pseudorange), bukan sudut.
- **"Cukup 3 satelit"**. Normalnya 4 (3 hanya bila ketinggian sudah diketahui) [4].
- **Angka pasti "31 satelit aktif"**. Sumber resmi tidak konsisten: FAQ GPS.gov menulis 25 operasional (per 3 Juli 2023), tabel NAVCEN mendaftar 32 (diakses 2026-11-08), Wikipedia 31 (2019). Pakai "minimal 24, kini sekitar 30‑an" atau "puluhan satelit" [7].
- **"GPS butuh internet"** atau sebaliknya **"lokasi HP sama akuratnya tanpa internet"**. Posisi GPS tetap jalan, tapi fix pertama bisa lebih lambat dan bantuan Wi‑Fi/seluler berkurang [12][13][16].
- **"Mode pesawat pasti tetap menyalakan GPS"**. Apple hanya menulis mode pesawat mematikan semua radio kecuali Bluetooth dan tidak menyebut GPS; perilaku beda per perangkat [23]. Kalau mau dipakai, cukup: "di banyak HP, lokasi masih bisa muncul saat data seluler mati" — atau lebih aman tidak disebut.
- **Angka TTFF pasti** (mis. "cold start 30 detik"): bergantung perangkat [18]. Pakai "bisa beberapa menit" [11].
- **Masa berlaku peta offline dalam hari tertentu** (mis. "30 hari"): halaman Google hanya menyebut pembaruan otomatis saat ≤15 hari lagi kedaluwarsa [21].
- **"Akurasi GPS HP 1 meter / sentimeter"**. Sentimeter hanya untuk receiver dual-frekuensi + augmentasi kelas profesional [10].
- **"38 mikrodetik relativitas"**: hanya dari Wikipedia, jangan dipakai tanpa cek ulang [25].
- **"Google Maps offline tersedia di semua negara"**: Google menyebut ada wilayah yang tidak bisa [22].

## Saran visual akurat (untuk animasi 3D)

- **Satelit GPS:** badan kotak dengan **dua panel surya** memanjang di kiri-kanan, antena berbentuk susunan (array) menghadap Bumi. Bukan piringan parabola besar ala satelit TV. Warna: badan berlapis foil emas/perak, panel surya biru gelap.
- **Orbit:** jauh di atas Bumi (±20.200 km, lebih dari 50× ketinggian ISS ±400 km). Tunjukkan beberapa lintasan miring (55°), bukan semua di garis khatulistiwa. Satelit bergerak (bukan diam/geostasioner).
- **Sinyal:** gelombang/denyut **dari satelit ke bawah saja**, menyebar seperti cahaya mercusuar. **Jangan** gambar panah balik dari HP ke satelit.
- **Jam:** tiap satelit dengan ikon jam/timestamp; HP membandingkan dengan jam sendiri.
- **Trilaterasi:** bola (atau lingkaran 2D di peta) berpusat di tiap satelit, berpotongan di satu titik; satelit ke‑4 merapikan titik. Hindari garis sudut ala triangulasi.
- **HP:** chip kecil "GNSS" di dalam HP; ikon data seluler/Wi‑Fi dicoret, titik biru tetap muncul.
- **Dua lapisan:** titik biru (GPS) di atas kertas kosong/grid → lalu lapisan peta "diunduh" muncul di bawahnya. Ini memvisualkan "posisi ≠ peta".
- **Gagal di terowongan/gedung:** sinyal memudar menembus beton; pantulan zig-zag di antara gedung tinggi (multipath).
- **GNSS lain:** beberapa kelompok satelit dengan warna label berbeda (GPS, Galileo, GLONASS, BeiDou, QZSS); Galileo sedikit lebih tinggi (23.222 km). Jangan beri bendera/logo resmi kalau tidak perlu.
- **Peta offline:** kotak area yang diunduh; rute mobil tetap jalan, ikon lalu lintas merah/kuning hilang, ikon jalan kaki/bus abu-abu.
