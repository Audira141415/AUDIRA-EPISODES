# RESEARCH REPORT — AE-068 "Bagaimana Pipa Raksasa Dipasang di Bawah Jalan?"

Akses 2026-11-23. Nomor [#] merujuk ke baris di `SOURCE_REGISTER.md`.

## Koreksi terhadap ide bank

- Ide bank benar untuk **pipe jacking/microtunneling**: pipa didorong dari lubang dorong ke lubang terima [1][2][4].
- Untuk **HDD** ide bank perlu dikoreksi. HDD **tidak memakai shaft/lubang vertikal**. Rig berdiri di permukaan dan mengebor miring dari **titik masuk** ke **titik keluar** di permukaan. Pipa **ditarik** (pullback) dari sisi keluar ke arah rig, tidak didorong [11][13].
- Kata "slurry" berlaku untuk mesin tipe slurry (contoh AVN). Proyek besar Indonesia bisa memakai mesin **EPB**. Contoh: Sodetan Ciliwung [21]. Jangan menulis bahwa semua mesin pipe jacking memakai slurry.

## Mekanisme inti A: pipe jacking / microtunneling (berurutan)

1. Gali dua lubang vertikal: **lubang dorong** (launch/jacking shaft) dan **lubang terima** (reception shaft), biasanya di posisi manhole nanti [1][2].
2. Di lubang dorong dipasang **dinding reaksi** (thrust wall), **rel pemandu**, dan **jacking frame** berisi beberapa silinder hidrolik yang dihubungkan supaya dorongannya sama. Dorongan disalurkan lewat **thrust ring** [1][3].
3. **Mesin bor (MTBM/shield)** diletakkan di rel lalu didorong menembus dinding shaft. Cutterhead di depan berputar memotong tanah [2][5].
4. Tanah galian dibuang. Pada mesin slurry, tanah bercampur air/bentonit dan dipompa lewat pipa tertutup ke **instalasi pemisah** di permukaan [8]. Pada mesin EPB, tanah dikeluarkan lewat ulir/screw (umum di EPB, tidak diteliti rinci di sini).
5. Dongkrak ditarik mundur, **pipa beton berikutnya** diturunkan dan dipasang di belakang, lalu didorong lagi. Seluruh rangkaian pipa ikut maju. Siklus ini diulang [4].
6. Celah tipis (overcut) di sekeliling pipa diisi **pelumas bentonit** untuk mengurangi gesekan. Jalur panjang bisa memakai **stasiun dongkrak antara** [6][7].
7. Arah dijaga **sinar laser** dari lubang dorong ke **target** di belakang mesin (jalur lurus pendek). Jalur panjang/melengkung memakai **gyro/total station**. Operator mengemudi dari **kontainer kendali** di permukaan, tidak berada di dalam terowongan [9].
8. Mesin muncul di **lubang terima** dan diangkat keluar. Pipa yang tertinggal langsung menjadi saluran jadi [1][2].

## Mekanisme inti B: HDD (berurutan)

1. Rig HDD di permukaan mengebor **pilot hole** kecil secara miring ke bawah, mendatar di bawah rintangan, lalu naik ke titik keluar [11].
2. Arah dibelokkan oleh **bent sub** (±2°) di belakang mata bor. Posisi dibaca sensor/sonde [12].
3. **Lumpur bentonit** dipompa ke mata bor. Lumpur membawa serpihan kembali ke titik masuk dan disaring ulang [13].
4. Di titik keluar, mata bor diganti **reamer**. Reamer ditarik balik ke arah rig sambil memperbesar lubang, biasanya beberapa kali sampai diameter akhir [11].
5. Pipa yang sudah dilas utuh di sisi keluar disambung ke reamer + **swivel**, lalu **ditarik** masuk sampai ke titik masuk (pullback) [11][14].

## Fakta paling menarik (aman untuk naskah)

1. **"Lubang yang terlihat diam itu justru pintu pipa."** PAM Jaya: galian terbuka tanpa aktivitas adalah titik masuk/keluar pipa microtunneling [17]. Cocok untuk reveal.
2. **Sodetan Ciliwung**: pipa beton berdiameter luar **4,05 m** didorong **590 m** dengan pipe jacking. Rekor MURI diameter terbesar & jarak antar-shaft terpanjang di Indonesia (2023) [21]. Total terowongan ±1,2 km, alirkan 60 m³/detik [22]. Tingkat MED untuk 4,05 m/590 m.
3. **Jl. DI Panjaitan, Jakarta Timur**: pipa **1,8 m**, tiap potong **2,43 m**, **189 potong**, **8 pit**, didorong 3 alat hidrolik [20]. Angka paling konkret untuk "potong demi potong".
4. **JSDP Zona 1 Paket 5 (Cikini dsk.)**: ±15 km pipa jacking lurus (400–1.000 mm) + ±3,6 km jalur lengkung (800–1.200 mm), 141 shaft [18]. Tunjukkan bahwa jalur bisa melengkung.
5. **HDD Balikpapan**: segmen HDD **189 m** pipa gas PGN masuk ke Kilang Pertamina. Rencana awal galian terbuka di bahu jalan diganti HDD supaya jalan tetap rapi [23].

## JANGAN DIKLAIM

- "HDD mendorong pipa dari shaft ke shaft". Salah: HDD menarik pipa dan mulai dari permukaan.
- "Semua mesin memakai slurry". Sodetan Ciliwung memakai EPB.
- "Tanpa galian sama sekali". Tetap ada dua lubang (shaft/pit atau titik masuk-keluar).
- "Tidak ada penurunan tanah sama sekali". Overcut bisa menimbulkan penurunan; untuk jalan dibatasi [7].
- Akurasi angka spesifik (mis. "presisi 1 cm", "50 mm" dari Wikipedia ID) karena hanya satu sumber, tanpa rujukan.
- Kedalaman JSDP "20–30 m" sebagai kedalaman semua pipa. Itu ucapan gubernur secara umum [19].
- Panjang total DI Panjaitan "459 m". Itu hitungan sendiri, bukan angka resmi.
- Diameter pipa PAM Jaya Jaksel dan diameter pipa HDD Senipah–Balikpapan: **tidak terverifikasi**.
- Sodetan Ciliwung lewat di bawah jalan tertentu (mis. Otista): **tidak terverifikasi**.
- Status selesai DI Panjaitan (target Apr 2026) dan JSDP Paket 5: **tidak terverifikasi** per 2026-11-23.
- "Ditemukan Romawi" / "Jepang tahun 1970-an": hanya Wikipedia ID, tanpa sumber kedua.

## Saran visual akurat (untuk animasi 3D)

- **Lubang dorong**: shaft beton/dinding baja persegi atau bulat di tepi jalan, dipagari seng/barrier proyek, dengan crane atau gantry di atasnya untuk menurunkan pipa. Di dasar: dinding reaksi beton tebal di belakang, rel baja, rangka dorong kuning/oranye dengan 2–4 silinder hidrolik krom horizontal, dan thrust ring baja berbentuk cincin yang menempel ke ujung pipa.
- **Pipa jacking**: pipa beton bertulang abu-abu, potongan pendek (±2–3 m) dengan sambungan berkerah baja di ujung. Jangan digambar sebagai satu pipa panjang yang utuh.
- **MTBM/shield**: silinder baja sedikit lebih besar dari pipa. Di depan ada cutterhead berputar dengan pisau/disc cutter. Di belakangnya ada target laser kecil, lalu selang slurry/kabel yang menjulur ke belakang lewat dalam pipa.
- **Laser**: satu sinar merah lurus dari teodolit/laser di lubang dorong ke target di belakang mesin, hanya bagian dalam pipa.
- **Permukaan**: kontainer kendali dengan layar, tangki/instalasi pemisah slurry (silo + saringan getar), tumpukan pipa beton. Lalu lintas tetap jalan di antara dua lubang.
- **Lubang terima**: shaft serupa yang lebih kecil. Mesin menembus dindingnya lalu diangkat crane.
- **HDD**: rig berbentuk trailer dengan rel miring (carriage) di permukaan tanpa shaft. Lintasan busur dangkal di bawah jalan/sungai. Mata bor kecil dengan bent sub, lalu reamer bergerigi yang lebih besar. Pipa baja/HDPE panjang yang sudah dilas tergeletak lurus di sisi keluar di atas roller, lalu tertarik masuk. Lumpur bentonit cokelat keabu-abuan keluar di titik masuk ke kolam lumpur.
- Skala: pipa 1,8 m kira-kira setinggi orang dewasa. Pipa 4,05 m kira-kira setinggi rumah satu lantai lebih sedikit.
