# RESEARCH REPORT — EP048 Bagaimana Pabrik Mobil Bisa Memproduksi Ribuan Mobil?

Dibuat 2026-11-07. Nomor [#] merujuk ke baris klaim di `SOURCE_REGISTER.md`.

## Inti jawaban (satu kalimat)
Satu mobil butuh berjam-jam hingga sehari lebih untuk dibuat, tetapi pabrik mengerjakan ratusan mobil sekaligus di sepanjang lini yang bergerak dengan ritme tetap (takt time), sehingga setiap ±1,5–2 menit satu mobil jadi keluar dari ujung lini [30][31][35].

## Mekanisme inti berurutan (7 langkah)
1. **Press shop (stamping)**: gulungan/lembaran baja dipotong (blanking), lalu dicetak oleh dies di mesin press bertekanan sangat tinggi menjadi panel: pintu, kap, atap, sisi bodi, lantai [2][3]. Panel diurutkan sesuai urutan pakai karena satu lini membuat beberapa model bergantian [6].
2. **Body shop (welding)**: lantai, sisi, dan atap dijepit di jig lalu disatukan dengan ribuan titik las, sebagian besar spot welding oleh lengan robot, sebagian oleh pekerja di area sulit [7][8][10]. Hasilnya cangkang baja telanjang: **body-in-white**. Pintu, kap, dan bagasi dipasang di sini [3].
3. **Paint shop**: bodi dicuci bersih → dicelup penuh ke bak cat elektrodeposisi (ED/e-coat; bodi bermuatan negatif, cat positif menempel ke semua sudut, untuk anti-karat) → dipanggang → sambungan diberi sealer → middle coat/primer → warna → clear coat → oven → diperiksa [12][13][15][16][18][20].
4. **Engine shop paralel**: mesin dibuat di pabrik/lini terpisah (TMMIN: Sunter Plant 1 & Karawang Plant 3) lalu dikirim ke assembly [1][36].
5. **Assembly line**: pintu dilepas agar ruang kerja lega → kabel, plafon, dasbor (trim) → **marriage**: bodi yang tergantung di hanger diturunkan dan disatukan dengan mesin/transmisi/suspensi dari bawah → bumper, roda, kaca, jok → pintu dipasang lagi → isi BBM/oli/cairan [22][24][25].
6. **Inspeksi & uji**: cek visual dan alat (alignment roda, lampu, rem), uji roller/drum (mobil "berlari" di atas rol), **shower test** (disiram air deras untuk cari bocor), uji kelistrikan, lalu test course [26][27][29].
7. **Sistem yang membuat semuanya lancar (TPS)**: takt time menyamakan ritme semua pos dengan permintaan pasar [30]; just-in-time + kanban memastikan part datang tepat saat dibutuhkan [39][40]; jidoka + andon menghentikan masalah di tempat agar cacat tidak diteruskan [41][42].

## Fakta paling menarik yang aman dipakai di naskah
1. **Takt vs waktu buat**: Di TMMIN (data 2016) satu mobil butuh 22–27 jam dari pelat baja sampai jadi, padahal setiap 1,6–2,8 menit satu mobil keluar [34][35]. Rahasianya: banyak mobil dikerjakan bersamaan.
2. **Angka Indonesia terbaru (Jan 2026, media Oto & Carvaganza)**: Toyota Karawang Plant 1 (Innova, Fortuner, Innova Zenix) punya Actual Takt Time **102 detik** dan kapasitas **144.000 unit/tahun**; Plant 2 (Avanza, Veloz, Yaris Cross) **108 detik**, ±138.000 unit/tahun [31][32]. Kalimat aman: "Di Karawang, satu mobil Toyota keluar kira-kira setiap 1,7 menit (data 2026)."
3. **Takt mengikuti pasar, bukan kecepatan maksimal**: Plant 1 dulu 1,6 menit (2015–2016), kini 102 detik; Plant 2 dari 2,8 menit (2016) ke ±94–99 detik (2023) lalu 108 detik (2026). Direktur TMMIN: takt "tergantung dari permintaan marketing" (GridOto 2016) [13][30][33][34].
4. **Ribuan titik las**: lebih dari 3.000 titik las per mobil di TMMIN (2016) [8]; Hyundai Cikarang memakai ±410 robot, 304 di antaranya untuk las (2025) [11].
5. **Cat pakai listrik**: lapisan anti-karat pertama ditempel dengan arus listrik saat bodi dicelup — cat bermuatan positif "tertarik" ke bodi bermuatan negatif, masuk ke rongga yang tak terjangkau semprotan [13].
6. Bonus: pintu dilepas di awal assembly lalu dipasang lagi di akhir [22]; satu pekerja bisa menarik tali andon untuk memanggil bantuan saat melihat masalah [42].

## JANGAN DIKLAIM
- "Mobil dibuat dalam 1,7 menit" / "dirakit dalam 2 menit" — salah. Itu **takt** (jarak antar-mobil keluar), bukan waktu membuat satu mobil. Judul media seperti "Cuma butuh 1 menit lebih untuk melahirkan..." menyesatkan.
- "Pabrik sepenuhnya dikerjakan robot" — salah. Robot dominan di press/welding/paint; assembly dan inspeksi masih banyak manusia (TMMIN, Hyundai, Suzuki) [10][32][44].
- "Setiap tarikan andon langsung menghentikan seluruh pabrik" — tidak terverifikasi seragam. Aman: "pekerja bisa menarik tali andon; lampu menyala, pemimpin datang, dan lini bisa dihentikan sampai masalah beres."
- "Satu mobil = 30.000 part" sebagai fakta universal — angka Toyota global, tergantung cara hitung. Kalau dipakai: "Toyota menyebut lebih dari 30.000 part."
- Angka ED/cat seperti tebal 0,1 mm, fosfat, 99,9% efisiensi — hanya Wikipedia (LOW).
- Suhu oven: jangan campur data TMMIN 2016 (180/120/80/180°C) dengan Toyota Jepang (150°C 20 menit).
- Takt 102 detik "untuk semua pabrik Indonesia" — itu hanya Karawang Plant 1 Toyota, data Jan 2026.
- Hyundai "250.000 unit" — itu kapasitas maksimum, kapasitas normal 150.000 [46]. Produksi aktual 2024 ±80.000 (Carvaganza).
- Istilah "decking": tidak ditemukan di sumber yang terbaca; pakai "marriage" atau "penyatuan bodi dan mesin".
- Daihatsu Sunter/Karawang: tidak menemukan angka takt resmi terbaru yang terverifikasi (artikel 2020 "3 menit" masa pandemi, tidak terbaca utuh). **Tidak terverifikasi.**
- Jumlah robot TMMIN: tidak terverifikasi.

## Saran visual akurat (untuk animasi 3D)
- **Press**: mesin press besar berbentuk portal (gantry) berjejer dalam satu lini (tandem line), dies baja abu-abu di dalam; lembaran baja datar abu-abu perak masuk, keluar panel berbentuk (sisi bodi dengan lubang pintu). Potongan sisa jatuh ke bawah.
- **Body shop**: lengan robot industri 6-sumbu (biasanya kuning/oranye/merah/putih tergantung merek) dengan **gun las spot berbentuk huruf C/X** di ujungnya; percikan api kecil oranye singkat per titik, bukan semburan api terus-menerus. Bodi berwarna **abu-abu baja polos** (body-in-white), tanpa cat, tanpa kaca, tanpa roda.
- **Paint shop**: bodi dicelup penuh ke bak panjang berisi cairan (warna ED biasanya abu-abu gelap/hitam), keluar berwarna abu-abu/hitam doff seragam. Booth cat bersih terang, robot cat putih dengan kepala bell rotary yang menyemprot kabut halus; operator berpakaian khusus anti-debu. Oven berupa terowongan panjang.
- **Assembly**: konveyor bergerak terus perlahan; bodi kadang tergantung di hanger di atas kepala; **pintu sudah dilepas**. Momen marriage: bodi turun dari atas, mesin+suspensi naik dari bawah di atas kereta (AGV) lalu dibaut. Pekerja manusia banyak di sini.
- **Andon**: tali tarik di sepanjang lini + papan lampu di atas yang menyorot nomor pos berwarna kuning/merah.
- **Kanban**: kartu kecil di kotak part plastik; kotak kosong kembali ke pemasok/gudang.
- **Inspeksi**: terowongan lampu putih terang untuk cek cat; ruang shower dengan semburan air dari segala arah ke mobil utuh; roda mobil berputar di atas rol baja di lantai (roller/drum tester).
- **Takt**: visualkan banyak mobil di berbagai tahap di satu lini panjang dengan penghitung waktu 102 detik; tiap kali penghitung nol, semua bergeser satu pos dan satu mobil jadi keluar.
- Jangan tampilkan: robot humanoid, mobil diwarnai saat masih tanpa e-coat, pengelasan pada mobil yang sudah dicat, logo merek nyata tanpa perlu.
