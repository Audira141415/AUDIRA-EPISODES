# RESEARCH REPORT — EP050 "Bagaimana Bandara Menjaga Koper Tidak Tertukar?"

Akses: 2026-11-07. Nomor [#] merujuk ke `SOURCE_REGISTER.md`.

## Inti jawaban
Koper tidak "dikenali" dari bentuknya. Ia dikenali dari nomor 10 digit di bag tag, yang di sistem maskapai sudah ditautkan ke nama, penerbangan, dan tujuan penumpang. Mesin bandara membaca nomor itu berulang kali, dan koper dicatat di titik-titik serah terima. Hasilnya bukan sempurna: tahun 2025 masih ada sekitar 24 juta koper bermasalah dari 5 miliar penumpang [17].

## Mekanisme berurutan (7 langkah)
1. **Check-in dan cetak tag.** Petugas atau mesin bag drop mencetak bag tag termal berperekat. Isinya: license plate 10 digit (barcode Interleaved 2 of 5 + angka), kode bandara tujuan 3 huruf, maskapai + nomor penerbangan, nama penumpang [1–4]. Penumpang menerima potongan stub dengan nomor yang sama.
2. **Pesan data dikirim.** Sistem check-in maskapai mengirim pesan bagasi (Baggage Source Message, BSM) ke BHS bandara. Pesan ini menautkan license plate dengan penerbangan dan penumpang [5]. Tanpa pesan ini, barcode hanya deretan angka.
3. **Konveyor + pembaca tag (ATR).** Koper masuk konveyor. Array kamera/laser 360° membaca barcode dari berbagai sisi. Tag yang gagal dibaca dialihkan ke stasiun manual [9].
4. **Screening keamanan di dalam BHS.** Koper lewat mesin X-ray/EDS (sering CT). Koper yang bersih lanjut; yang mencurigakan dialihkan untuk dicek operator/manual [12]. Contoh Indonesia: T3 Soekarno-Hatta 2016, barang < 5 kg masuk kategori "suspect" sehingga dipakai baki khusus [20].
5. **Sortir.** Sorter (tilt-tray: baki memiringkan diri; cross-belt: sabuk kecil melintang berputar ke samping) menjatuhkan koper ke chute sesuai penerbangannya [11].
6. **Make-up area dan pemuatan.** Petugas memuat koper ke ULD/kontainer (pesawat berbadan lebar) atau gerobak untuk dimuat curah. Pemindaian saat muat = titik "load" [13][14].
7. **Rekonsiliasi dan pelacakan.** Hanya koper milik penumpang yang benar-benar naik boleh terbang; koper tanpa penumpang ditahan atau diperiksa [6][7]. IATA Resolution 753 mewajibkan maskapai melacak koper di 4 titik: acceptance, load, transfer, arrival [14]. Di tujuan, stub/tag dipakai mencocokkan dan menelusuri koper [1].

## Fakta paling menarik yang aman dipakai
1. **Nomor 10 digit adalah "plat nomor" koper.** IATA memang menyebutnya *license plate*. Digit pertama punya arti: 0 = tag biasa, 1 = tag cadangan (fallback) saat sistem maskapai putus, 2 = "rush" untuk koper yang tertinggal dan dikirim menyusul [1][2]. (MED)
2. **Empat titik wajib R753:** saat diserahkan, saat dimuat, saat transfer, saat dikembalikan [14]. (HIGH)
3. **2025:** sekitar 24 juta koper bermasalah dari 5 miliar penumpang; tingkatnya turun sekitar 20%+ dibanding 2024 (rilis pers SITA menulis 23%) dan sudah turun hampir tiga perempat sejak 2007 [17]. (HIGH, sebut "menurut SITA")
4. **Titik paling rawan adalah transfer:** 39% kasus 2025 [18]. (HIGH)
5. **Rata-rata biaya satu koper bermasalah USD 260**; total USD 6,3 miliar setahun [17]. (HIGH, sumber SITA)

## JANGAN DIKLAIM
- "Koper tidak pernah tertukar/hilang" atau "100% akurat". Data 2025 menunjukkan jutaan koper bermasalah [17].
- "Tertukar" sebagai kategori statistik: SITA/IATA mengelompokkan *delayed, lost, damaged/pilfered*, bukan "tertukar". Koper diambil orang lain di carousel adalah kasus terpisah, tidak ada angkanya di sumber ini.
- Angka per 1.000 penumpang untuk 2025 (≈4,8) sebagai angka resmi: itu hitungan sendiri, tidak tertulis di sumber.
- Read rate 85% / 99,5% (satu sumber, tanpa tahun) [10].
- "Semua bandara memakai RFID" atau "bandara Indonesia memakai RFID": tidak terverifikasi [23].
- Jenis sorter, jumlah koper per jam, panjang konveyor, atau vendor BHS T3 Soekarno-Hatta saat ini: tidak terverifikasi.
- Kepatuhan R753 "sudah 100%": baru lewat 50%, target 2027 [15].
- Level screening (Level 1–5) dan standar ECAC/TSA spesifik: tidak terverifikasi dari sumber primer.
- Kasus suap BHS AP II 2019 [22]: di luar topik edukasi, jangan disinggung.
- Biaya IATA (USD 5 miliar, 2024) dan SITA (USD 6,3 miliar, 2025) jangan dicampur; pilih satu dengan tahunnya.

## Saran visual akurat (untuk 3D)
- **Bag tag:** pita kertas putih panjang (±50 cm), dilingkarkan ke pegangan koper dan direkatkan ujungnya. Barcode garis vertikal tebal-tipis (Interleaved 2 of 5) muncul beberapa kali dalam orientasi berbeda; kode tujuan 3 huruf dicetak sangat besar (mis. "DPS", "SUB", "CGK"); angka 10 digit di bawah barcode. Stub kecil dengan barcode yang sama untuk penumpang. Pakai kode bandara asli, contoh license plate fiktif (jangan nomor maskapai nyata + nama asli).
- **Konveyor:** sabuk karet hitam/abu dengan rangka baja galvanis, sering di ketinggian (langit-langit), berbelok dan naik turun; koper bergerak satu per satu dengan jarak.
- **ATR:** gerbang/portal persegi melingkupi konveyor dengan kamera/laser di atas, samping, dan bawah (celah antara dua sabuk). Visual sinar pemindai merah/hijau boleh sebagai stilisasi.
- **Screening:** mesin besar tertutup berbentuk kotak/terowongan dengan tirai timbal di pintu masuk-keluar; jalur cabang untuk koper yang perlu dicek ulang.
- **Sorter:** loop panjang berisi baki/sabuk kecil; baki miring ±30° menjatuhkan koper ke chute logam miring berlabel nomor make-up.
- **Make-up area:** carousel/chute berujung di area petugas berompi reflektif; koper dimasukkan ke kontainer ULD (kotak aluminium dengan sisi miring khas LD3, pintu tirai/panel) atau gerobak bagasi terbuka yang ditarik tractor.
- **Pelacakan:** 4 pin titik (check-in, pesawat, transfer, carousel) pada garis perjalanan; jangan tampilkan "satelit melacak koper" (pelacakan R753 berbasis pemindaian di titik serah terima, bukan GPS).
- **Brand AUDIRA in-scene:** label di sisi ULD atau di papan chute make-up.
