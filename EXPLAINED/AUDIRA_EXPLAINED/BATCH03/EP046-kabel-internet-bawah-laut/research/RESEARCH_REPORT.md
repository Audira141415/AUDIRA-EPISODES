# RESEARCH REPORT — EP046 Kabel Internet Bawah Laut

Pertanyaan: "Kabel Internet Bawah Laut Bisa Menghubungkan Antarnegara?"
Jawaban singkat: **Ya.** Hampir semua lalu lintas data antarnegara lewat kabel serat optik di dasar laut, bukan satelit. Nomor klaim [#] merujuk ke `SOURCE_REGISTER.md`. Diakses 2026-11-07.

## Mekanisme inti (berurutan)

1. **Data jadi cahaya.** Di stasiun pendaratan (landing station) di pantai, perangkat terminal mengubah data menjadi pulsa laser. Pulsa ini dikirim lewat serat kaca setipis rambut [#8, #13].
2. **Kabel turun dari pantai.** Dekat pantai, kabel dibungkus armor kawat baja (diameter hingga ±40–50 mm). Kapal kabel menarik plough (bajak laut) di dasar laut untuk menanam kabel. Penanaman dilakukan dari pantai sampai kedalaman ±1.000–1.500 m [#7, #14, #15].
3. **Di laut dalam kabel menipis.** Kabel cukup diletakkan di dasar laut, tanpa armor. Diameternya ±17–21 mm, seukuran selang taman [#6, #15].
4. **Cahaya melemah, lalu dikuatkan.** Setiap puluhan kilometer (tipikal ±70 km, kabel modern bisa >100 km) ada repeater. Isinya penguat optik erbium (EDFA) yang menguatkan cahaya [#10].
5. **Listrik dari darat.** Repeater ditenagai arus searah (DC) bertegangan tinggi dari Power Feed Equipment (PFE) di stasiun darat. Arus mengalir lewat konduktor tembaga di dalam kabel, dan semua repeater tersambung seri [#11, #12].
6. **Mendarat di negara tujuan.** Kabel naik ke stasiun pendaratan negara lain, lalu tersambung ke jaringan darat. Contoh: SEA-ME-WE 5, ±20.000 km, dari Dumai (Riau) sampai Toulon (Prancis) [#22].
7. **Kalau putus, kapal perbaikan datang.** Grapnel menyeret dasar laut untuk mengait kabel. Kabel dipotong dan kedua ujungnya diangkat. Potongan baru disambung di atas kapal, lalu kabel diturunkan lagi [#21]. Sementara itu operator mengalihkan trafik ke kabel lain atau ke satelit sebagai cadangan [#29, S1].

## Fakta paling menarik (aman untuk naskah)

1. **Lebih dari 95% komunikasi internasional lewat kabel laut, bukan satelit** (UNEP/ICPC 2009). Di AS, satelit hanya 0,37% kapasitas internasional (FCC via TeleGeography) [#1].
2. **Kabelnya cuma seukuran selang taman** (±17–21 mm) di laut dalam. Kabel baru menebal hingga ±5 cm di dekat pantai karena dibungkus kawat baja [#6, #7].
3. **Musuh utamanya bukan hiu**, melainkan jangkar kapal dan pukat ikan. Keduanya penyebab ±2/3 gangguan, dan ada ±200 gangguan per tahun di dunia (ICPC). Gigitan ikan/hiu tercatat nol gangguan pada 2007–2014 [#16, #17, #20].
4. **Indonesia: SKKL membawa sekitar 99% lalu lintas data nasional.** Bentangannya ±131 ribu km (Komdigi, 2026). SEA-ME-WE 5 mendarat di Dumai sejak Des 2016 [#3, #22].
5. **Kasus Papua 2021:** kabel SMPCS Biak–Jayapura putus di kedalaman 4.050 m, ±280 km dari Biak. Internet Jayapura dan sekitarnya terganggu berminggu-minggu sampai kapal perbaikan datang [#26].

## JANGAN DIKLAIM

- "100% internet lewat kabel laut" atau "satelit tidak dipakai". Yang benar: satelit dipakai sebagai cadangan dan untuk daerah terpencil (contoh SATRIA-1 saat Palapa Ring Tengah terganggu, 2026) [#29, #31].
- "99% data internasional" sebagai fakta HIGH: hanya terverifikasi dari Wikipedia di sesi ini. Pakai "lebih dari 95%" atau "hampir semua".
- "Hiu sering menggigit kabel" atau hiu sebagai penyebab utama kerusakan: mitos [#20].
- "Kabel setebal pipa/selebar lengan": salah untuk laut dalam (±2 cm).
- Palapa Ring sebagai kabel antarnegara: salah, Palapa Ring adalah jaringan domestik. Panjangnya juga jangan ditulis 35.280 km (angka rencana lama). Bila perlu, sebut "sekitar 12 ribu km" [#25].
- Angka pasti tegangan PFE (mis. "15.000 volt") sebagai fakta tunggal: MED. Lebih aman ditulis "listrik tegangan tinggi dari darat".
- Klaim "Singapura bisa memutus internet Indonesia": polemik politik, bukan fakta teknis [#4].
- Jarak repeater sebagai angka tunggal mutlak. Tulis "setiap puluhan kilometer".
- Penyebab dan tanggal kerusakan SEA-ME-WE 5 April 2024 di Selat Malaka: sumber hanya Wikipedia [#30].
- Jumlah kapal kabel di Indonesia saat ini: data terakhir dari 2021 (4 kapal, 1 yang siap) [#27].

## Saran visual akurat (untuk 3D)

- **Penampang kabel laut dalam (±17–21 mm):**
  - Inti: beberapa serat kaca tipis (pasangan serat) dalam tabung logam berisi jeli.
  - Di sekelilingnya: kawat baja penguat terpilin, lalu lapisan/tabung tembaga sebagai jalur listrik.
  - Luar: selubung polietilena **hitam** (kabel deep-sea umumnya hitam/putih polos).
  - Tanpa armor luar.
- **Penampang kabel dekat pantai (hingga ±46–50 mm):** inti yang sama, ditambah satu atau dua lapis kawat baja galvanis (abu-abu logam) melingkar heliks, dan lapisan benang PP hitam/kompon di luar.
- **Transisi visual:** kabel menebal dari laut dalam ke pantai (laut dalam = tipis, pantai = tebal). Jangan dibalik.
- **Repeater:** silinder logam (tembaga/baja) yang lebih gemuk dari kabel, panjang ±1–3 m, dengan kerucut di kedua ujung. Letaknya di dasar laut, menempel di kabel. Jangan digambar sebagai pelampung atau tiang.
- **Stasiun pendaratan:** gedung di dekat pantai, berisi rak perangkat terminal dan PFE. Kabel masuk lewat manhole/beach manhole di pantai, terkubur di pasir. Kabel tidak terlihat menjuntai di pantai.
- **Kapal kabel:** kapal besar dengan tangki/tangki gulungan kabel (cable tank) di lambung dan roda/sheave besar di haluan atau buritan. Plough (kereta bajak di atas skid) ditarik di dasar laut. ROV kuning dipakai untuk inspeksi/penguburan.
- **Dasar laut:** dekat pantai = alur bekas plough dengan kabel tertanam. Laut dalam (ribuan meter) = kabel tergeletak di sedimen, gelap, tanpa cahaya matahari.
- **Cahaya data:** visual pulsa cahaya di serat boleh dipakai sebagai metafora. Di dunia nyata cahaya inframerah (±1550 nm) tidak terlihat mata, jadi gaya "glow" boleh asal tidak diklaim sebagai warna nyata.
- **Penyebab kerusakan:** jangkar kapal menyeret dasar laut, dan papan otter/pukat dasar yang mengeruk dasar laut. Hiu tidak perlu ditampilkan, kecuali untuk membantah mitos.
- **Peta:** gunakan rute nyata, misalnya SEA-ME-WE 5 Dumai → Selat Malaka → Samudra Hindia → Laut Merah → Mediterania → Toulon, atau BSCS Batam–Singapura. Jangan buat garis lurus menembus daratan.
