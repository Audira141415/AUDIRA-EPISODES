# EP 02: Kenapa Motor Listrik Bisa Terbakar? Di Dalam Thermal Runaway

AUDIRA, seri CARA KERJA VIRAL. Created by Agus Dwi R. Status: final dengan voice-over, 6 November 2026.

Riset dari sumber yang dibaca langsung 6 November 2026. Setiap angka memakai label HIGH (dua sumber atau sumber primer) atau MED (satu sumber atau sumber tersier).

# EP02 — Kenapa Baterai Motor Listrik Bisa Terbakar

Riset per 2026-11-06. Angka dikutip dari sumber yang dibaca langsung. Tidak ada spekulasi soal penyebab insiden.

> **PENTING untuk naskah:** pada kasus viral Grand Wisata, menurut bengkel yang menangani dan pemilik bengkel yang diwawancara Kompas, komponen yang terbakar adalah **controller** (pengendali motor), bukan sel baterai. Produsen (Alva) menyatakan penyebab **belum dapat dipastikan**. Jangan menyebut "baterai meledak" untuk kasus ini. Gunakan kasus ini sebagai pintu masuk ("motor listrik terbakar, banyak orang langsung curiga baterai...") lalu jelaskan mekanisme baterai secara umum.

---

## 1. Viral hook — headline, outlet, tanggal, URL

| Tanggal | Outlet | Headline | URL |
|---|---|---|---|
| 6 Nov 2026, 13.12 WIB | Kompas.com Otomotif | Kronologi Video Viral Motor Listrik Terbakar di Grand Wisata Bekasi | https://otomotif.kompas.com/read/2026/11/06/131200715/kronologi-video-viral-motor-listrik-terbakar-di-grand-wisata-bekasi |
| 6 Nov 2026, 14.12 WIB | Kompas.com Otomotif | Alva Buka Suara soal Insiden Cervo yang Terbakar | https://otomotif.kompas.com/read/2026/11/06/141200615/alva-buka-suara-soal-insiden-cervo-yang-terbakar |
| 6 Nov 2026 | Limapagi | Motor Listrik Terbakar di Grand Wisata Usai Controller Meletup | https://www.limapagi.id/motor-listrik-terbakar-grand-wisata |
| 6 Nov 2026 | bsinews.id | Alva Selidiki Kebakaran Motor Listrik Cervo di Bekasi | https://bsinews.id/alva-selidiki-kebakaran-motor-cervo |
| 6 Nov 2026 | Pewarta Nusantara | Motor Listrik Terbakar di Area Parkir Grand Wisata, Pemilik Sempat Coba Matikan Api Lewat Aplikasi | https://www.pewartanusantara.com/berita/motor-listrik-terbakar-di-area-parkir-grand-wisata-pemilik-sempat-coba-matikan-api-lewat-aplikasi/ |
| 18 Okt 2026 | Kompas.com Otomotif | Motor Listrik Alva N3 Terbakar di Semanggi, Alva Buka Suara | https://otomotif.kompas.com/read/2026/10/18/142123415/motor-listrik-alva-n3-terbakar-di-semanggi-alva-buka-suara |
| 19 Okt 2026 | Kompas.com Otomotif | Mengenal Thermal Runaway, Pemicu Motor Listrik Terbakar | https://otomotif.kompas.com/read/2026/10/19/140100715/mengenal-thermal-runaway-pemicu-motor-listrik-terbakar |

Judul lain di Google News (isinya tidak dibaca): Demokratis.co.id "Motor Listrik Terbakar di Grand Wisata Usai Alami Gangguan"; Kompas.com "Baterai Rakitan Motor Listrik Lebih Berisiko Terbakar?"; Limapagi "Modifikasi Baterai Picu Risiko Kebakaran Motor Listrik"; Pemkot Pekalongan "Antisipasi Kebakaran, Pengguna Kendaraan Listrik Diimbau Perhatikan Keamanan Pengisian Daya".

**Hook angle:** dua motor listrik terbakar di Jabodetabek dalam tiga minggu (Semanggi, Okt; Grand Wisata, Nov). Apa yang sebenarnya terjadi di dalam baterai lithium-ion saat "thermal runaway"?

---

## 2. Fakta terverifikasi

### A. Insiden Grand Wisata (fakta yang dilaporkan saja)

1. Motor listrik **Alva Cervo** terbakar saat **terparkir** di kawasan **pertokoan Grand Wisata, Tambun Selatan / Mustika Jaya, Bekasi**. Video diunggah akun Instagram **@wargamustikajaya** pada **Kamis, 5 November 2026**. Sumber: Kompas 6 Nov (kedua artikel); bsinews. **HIGH**
2. Api terlihat keluar dari **bagian bagasi**. Warga membantu memadamkan dengan **APAR**. Pemilik mencoba **mematikan sistem lewat aplikasi di ponsel**. Sumber: Kompas 6 Nov. **HIGH**
3. Kronologi versi bengkel (akun **@pelantapikencang**, unggahan Rabu 4 Nov): motor sudah bermasalah beberapa bulan, muncul kode error **DTC 013**, sering mati mendadak. Pemilik sempat melakukan **remap/reflash** dan **mengganti BMS dengan produk aftermarket** di bengkel lain. Sel baterai **masih bawaan pabrik**; controller standar tapi sudah di-remap. Sumber: Kompas 6 Nov. **MED** (klaim satu bengkel, dikutip media)
4. Bengkel menemukan error perangkat lunak **"MOE Current Protect"**, menurunkan beberapa setelan, lalu menguji motor **lebih dari 4 km** dengan kecepatan puncak **di atas 100 km/jam** tanpa masalah. Setelah didiamkan **sekitar 2 jam**, saat kontak dinyalakan, **controller meletup dan mengeluarkan api**. Sumber: Kompas 6 Nov. **MED**
5. Api sempat padam lalu menyala lagi karena listrik dari baterai masih tersambung. Api berhenti setelah baterai dinonaktifkan lewat perangkat lunak. Hernest (bengkel spesialis motor listrik BEMo) kepada Kompas: pemilik memakai aplikasi IoT untuk memutus arus dari baterai ke controller, "karena komponen yang terbakar adalah controller". Sumber: Limapagi (mengutip Kompas, 5 Nov). **MED**
6. Pernyataan Alva (Putu Swaditya Yudha, CMO, 6 Nov): konsumen **aman dan selamat**. Penelusuran awal: motor pernah mengalami **penggantian komponen dengan suku cadang nonstandar pabrikan di luar bengkel resmi**. Tapi "penyebab insiden belum dapat dipastikan" dan Alva "belum dapat memberikan kesimpulan" soal kaitannya. Sumber: Kompas 6 Nov; bsinews 6 Nov. **HIGH**
7. Alva menyebut punya **lebih dari 140 titik mitra layanan purnajual di 40 kota**. Sumber: bsinews 6 Nov. **MED**
8. Insiden sebelumnya: **Alva N3** terbakar di **kolong Semanggi, Jakarta Selatan**, sekitar pukul 22.00. Api diduga dari bagian belakang dekat baterai. Penyebab belum diketahui; pengendara selamat. Sumber: Kompas 18 Okt. **MED** (tanggal tidak konsisten, lihat bagian 4)

### B. Anatomi sel lithium-ion

9. Elektroda negatif biasanya **grafit** (kadang dicampur silikon). Elektrolit biasanya **LiPF₆** (lithium heksafluorofosfat) dalam campuran **karbonat organik**. Elektroda positif antara lain **LiCoO₂**, **LiFePO₄ (LFP)**, dan **NMC** (lithium nikel mangan kobalt oksida). Sumber: Wikipedia "Lithium-ion battery" (Electrochemistry). **HIGH**
10. Saat **mengisi daya**, charger memberi tegangan lebih tinggi dari tegangan sel. Elektron dipaksa mengalir dari elektroda positif ke negatif lewat sirkuit luar. Ion Li⁺ bermigrasi lewat elektrolit dan **separator** dari positif ke negatif lalu "menyelip" ke dalam grafit (**interkalasi**). Saat dipakai, arahnya terbalik. Sumber: Wikipedia "Lithium-ion battery" (Charging and discharging). **HIGH**
11. Separator sel modern sangat tipis: **24 µm atau kurang** pada sel berdensitas tinggi, sehingga lebih rentan terhadap kontaminan. Sumber: Battery University BU-304a. **HIGH**
12. Elektrolit karbonat (EC + DMC 1:1) punya **titik nyala sekitar 25 ± 1 °C**, alias mudah terbakar. Sumber: Liu et al. 2018, Science Advances (PMC6014713). **HIGH**
13. Rentang tegangan aman per sel umumnya **3–4,2 V**. Banyak sel dan pack memakai sirkuit pengaman yang memutus baterai di luar rentang ini. Rentang persis tergantung kimia sel (2,5 sampai 3,65/4,1/4,2/4,35 V). Sumber: Wikipedia "Lithium-ion battery" (Safety). **HIGH**
14. Fitur pengaman di sel: **CID** (current interrupt device, memutus arus saat tekanan naik), **PTC** (polimer yang makin resistif saat panas), **shut-down separator**, **vent**. Sumber: Wikipedia "Lithium-ion battery". **HIGH**
15. **BMS** (Battery Management System) memutus arus saat suhu berlebih. Pernyataan Abdullah (bengkel Dolland Motor Electric) kepada Kompas: "ketika ada panas berlebih, BMS akan mematikan fungsi dari baterai tersebut." Sumber: Kompas 19 Okt. **MED**. Wikipedia: pack tanpa sirkuit manajemen yang efektif rentan; BMS yang dirancang buruk juga bisa menimbulkan masalah. **HIGH**
16. Pengisian ideal pada **5–45 °C**. Di bawah 0 °C, lithium logam bisa melapisi anoda (lithium plating), lalu membentuk dendrit yang bisa menembus separator. Sumber: Wikipedia "Lithium-ion battery". **HIGH**

### C. Pemicu thermal runaway

17. Empat kelompok pemicu: **(1) termal** (pendinginan buruk, api dari luar); **(2) elektrik** (overcharge, korsleting luar); **(3) mekanis** (tertusuk, tertekan, tabrakan); **(4) korsleting internal** (cacat produksi atau penuaan). Sumber: Wikipedia "Lithium-ion battery" (Fire hazard). **HIGH**
18. NFPA: kebakaran baterai lithium-ion bisa berawal dari kerusakan fisik ("tertusuk, tertekan, atau **terkena air**"), kerusakan elektrik ("**overcharge** atau memakai **alat pengisi yang tidak dirancang untuk baterai itu**"), suhu ekstrem, dan cacat produk. Sumber: NFPA, Lithium-Ion Battery Safety, https://www.nfpa.org/education-and-research/home-fire-safety/lithium-ion-batteries **HIGH**
19. Charger yang rusak/tidak sesuai bisa **merusak sirkuit pengaman** baterai. Sumber: Wikipedia "Lithium-ion battery". **HIGH**
20. Korsleting internal adalah **penyebab utama** thermal runaway. Bisa dari benda logam yang menembus, tabrakan, dendrit lithium (arus besar, overcharge, suhu rendah), atau separator cacat. Sumber: Liu et al. 2018. **HIGH**. NTSB juga menyebut penyebab awal "umumnya korsleting di dalam sel". Sumber: NTSB/SR-20/01. **HIGH**
21. Praktisi lokal: "yang paling sering kejadian karena **modifikasi**. Kalau selain itu, hanya cacat produk, tapi itu persentasenya sangat kecil." Abdullah juga memperkirakan peluang thermal runaway "**1:1.000.000** atau lebih" bila baterai tidak diutak-atik. Sumber: Kompas 19 Okt. **MED** (opini praktisi)
22. Battery University: tingkat kegagalan Li-ion **kurang dari 1 per sejuta**; sel berkualitas **lebih baik dari 1 per 10 juta**. Sumber: BU-304a. **MED** (satu sumber sekunder)

### D. Tahap suhu thermal runaway

23. Di atas **~80 °C**, laju reaksi kimia eksotermik di dalam sel naik dan memanaskan sel lebih lanjut. Terjadi lingkaran umpan balik positif. Sumber: Liu et al. 2018. **HIGH**
24. Lapisan **SEI** (solid electrolyte interphase, lapisan tipis di permukaan anoda) mulai **terurai secara eksotermik pada sekitar >90 °C**, melepas gas mudah terbakar dan oksigen. Sumber: Liu et al. 2018. **HIGH**
25. Setelah SEI rusak, lithium di anoda bereaksi dengan pelarut elektrolit dan melepas gas hidrokarbon mudah terbakar (etana, metana, dll.). Sumber: Liu et al. 2018. **HIGH**
26. Pada **T > ~130 °C**, separator **PE/PP mulai meleleh**, sehingga katoda dan anoda bisa korsleting langsung. Sumber: Liu et al. 2018. **HIGH**
27. Katoda oksida logam terurai dan **melepas oksigen**. Contoh LiCoO₂: mulai terurai **sekitar 180 °C** (bagian mekanisme) / **250 °C** (bagian material). Kedua angka ada di artikel yang sama. Sumber: Liu et al. 2018. **HIGH** (sumbernya), angka berbeda: lihat bagian 4.
28. **LFP (LiFePO₄) stabil hingga ~400 °C** karena oksigennya terikat kuat dalam gugus fosfat (PO₄³⁻). Ini alasan LFP dianggap lebih aman. Sumber: Liu et al. 2018. **HIGH**. Wikipedia: LFP meningkatkan keamanan tapi menurunkan kapasitas. **HIGH**
29. Definisi praktis thermal runaway dalam uji ARC: laju pemanasan diri **> 10 °C per menit**. Sumber: Liu et al. 2018. **HIGH**
30. Suhu bisa cepat mencapai **500 °C**, lalu sel terbakar atau meledak ("venting with flame"). Sumber: Battery University BU-304a; Wikipedia: suhu sel bisa bertahan **di atas 500 °C**. **HIGH**
31. Oksigen dan panas dari tahap 2 memberi syarat bagi elektrolit organik untuk terbakar (tahap 3: pembakaran/ledakan). Sumber: Liu et al. 2018. **HIGH**

### E. Merambat, sulit dipadamkan, gas beracun

32. Thermal runaway bisa **menjalar dari satu sel ke banyak sel, seperti efek domino**. Sumber: NTSB/SR-20/01 (2020). **HIGH**. Battery University: tiap sel bisa rusak "on its own timetable", sehingga pack bisa hancur dalam beberapa detik atau beberapa jam. **HIGH**
33. Baterai bisa **menyala ulang** karena sel di dalamnya sendiri menyimpan tiga unsur api: **panas, bahan bakar, oksigen**. Energi yang tersisa di modul yang belum rusak ("**stranded energy**") bisa menyulut ulang beberapa kali setelah api dipadamkan. Sumber: NTSB/SR-20/01. **HIGH**
34. Memadamkan baterai mobil listrik bisa butuh **ribuan galon air**. Sumber: NTSB/SR-20/01. **HIGH** (skala mobil, bukan motor)
35. **Air BUKAN masalah kimia.** NFPA: petugas pemadam sebaiknya memakai air; air efektif karena isi baterai adalah **garam lithium**, bukan lithium logam yang bereaksi dengan air. Sumber: NFPA. **HIGH**. Battery University: air juga mendinginkan area sekitar dan mencegah penjalaran. **HIGH**. Jadi "air sulit memadamkan" berarti air sulit menjangkau sel di dalam casing tertutup dan reaksi terus menghasilkan panas/oksigen sendiri, bukan karena air memperparah.
36. Gas dari sel yang venting: sebagian besar **CO₂**, plus uap elektrolit termasuk **hidrogen fluorida (HF) 20–200 mg/Wh** dan **POF₃ 15–22 mg/Wh**. Sumber: Battery University BU-304a. **MED**
37. Gas mudah terbakar paling berbahaya: **hidrogen, etilena, etana, propana**. Bahaya utama: uap beracun dan mudah terbakar, pembakaran uap elektrolit, tekanan berlebih lokal, dan pecahnya casing yang melontarkan serpihan. Sumber: NTSB/SR-20/01 (mengutip Stephens et al. 2017). **HIGH**
38. Asap thermal runaway **mudah terbakar sekaligus beracun**. Sumber: Wikipedia "Lithium-ion battery"; NFPA ("heat, smoke, the release of toxic gases, and the potential for explosions"). **HIGH**

### F. Tips keselamatan resmi

39. NFPA:
   - beli baterai yang **tersertifikasi lab uji** dan berlabel;
   - **berhenti mengecas setelah penuh**;
   - pakai **charger yang kompatibel**, idealnya **charger bawaan**;
   - **berhenti memakai** bila ada tanda kerusakan: bau tidak biasa, panas berlebih, bunyi letupan, menggembung, atau berubah warna;
   - perbaikan hanya oleh **teknisi profesional**.
   Sumber: NFPA. **HIGH**
40. NFPA untuk e-bike, e-scooter, dan EV:
   - tempat cas paling aman adalah **di luar ruangan, jauh dari bangunan, tidak di bawah sinar matahari langsung**;
   - jangan mengecas jika charger atau baterai rusak;
   - jangan simpan di tempat sangat panas/dingin atau **menghalangi satu-satunya jalan keluar**;
   - **jangan memodifikasi baterai atau charger**.
   Sumber: NFPA. **HIGH**
41. NFPA: baterai yang **pernah terendam air** jangan dicas, jangan dibuka atau diperbaiki; simpan di wadah tidak mudah terbakar di luar bangunan, lalu hubungi pemadam kebakaran/produsen. Sumber: NFPA. **HIGH** (relevan untuk musim banjir Indonesia)
42. Alva mengimbau pemeriksaan, perawatan, dan penggantian komponen **hanya di jaringan layanan resmi**, terutama untuk sistem kelistrikan. Sumber: Kompas 6 Nov; bsinews. **HIGH**
43. Bengkel lokal: jangan mengubah komponen baterai maupun jalur pengisian di luar standar pabrikan, agar proteksi bawaan bekerja. Sumber: Kompas 19 Okt. **MED**
44. Standar AS untuk baterai kendaraan listrik ringan: **UL 2271** "Batteries for Use In Light Electric Vehicle (LEV) Applications", edisi 3, terbit **14 September 2023**. Sumber: https://www.shopulstandards.com/ProductDetail.aspx?productId=UL2271 **HIGH**. Wikipedia juga menyebut uji api **UL 9540A** untuk sistem penyimpanan energi.
45. Saat terjadi: menjauh dari kendaraan dan hubungi pemadam kebakaran (Pewarta Nusantara, artikel umum: **MED**). NFPA dan Battery University: kebakaran Li-ion kecil boleh dipadamkan seperti api biasa; BU menyarankan foam, CO₂, ABC dry chemical, atau air. **HIGH**

---

## 3. Mekanisme langkah demi langkah (untuk animasi)

1. **Isi baterai = ribuan sel kecil.** Tiap sel berisi lapisan grafit (kutub negatif), lapisan logam oksida atau besi fosfat (kutub positif), selembar plastik super tipis (separator, ±24 mikron) di tengahnya, dan cairan elektrolit yang mudah terbakar.
2. **Saat dicas, ion lithium "pindah rumah".** Ion Li⁺ berenang lewat elektrolit, menembus pori separator, lalu menyelip di antara lapisan grafit. Elektron lewat kabel luar. BMS menjaga tegangan tiap sel tetap di sekitar 3–4,2 V dan suhunya tetap aman.
3. **Pemicu datang.** Bisa karena dicas berlebihan, charger tidak cocok, sel tertusuk atau terbentur, kemasukan air, kepanasan, cacat pabrik, atau modifikasi seperti BMS dan controller nonstandar. Hasilnya korsleting kecil di dalam sel.
4. **~80–90 °C: kulit pelindung anoda pecah.** Lapisan SEI terurai, menghasilkan panas dan gas. Panas mempercepat reaksi, reaksi menambah panas.
5. **~130 °C: separator meleleh.** Kutub positif dan negatif bersentuhan langsung, terjadi korsleting besar, dan suhu melonjak lebih dari 10 °C per menit.
6. **~180–250 °C (NMC/LCO): katoda melepas oksigen.** Sel kini punya bahan bakar (elektrolit), panas, dan oksigennya sendiri. Elektrolit menyala, sel venting dengan api, dan suhu bisa lewat 500 °C. LFP baru melepas oksigen jauh lebih tinggi (stabil hingga ~400 °C), sehingga lebih aman.
7. **Efek domino.** Panas satu sel memanaskan sel tetangga, memicu runaway berikutnya. Pack bisa habis dalam hitungan detik sampai jam. Gas beracun seperti HF dan gas mudah terbakar seperti hidrogen ikut keluar.
8. **Kenapa susah padam.** Api ada di dalam casing tertutup dan reaksinya membuat oksigen sendiri, jadi menutup api tidak cukup. Air tetap boleh dan efektif untuk mendinginkan, tapi butuh banyak, dan sel yang tersisa bisa menyala lagi berjam-jam kemudian. Solusi terbaik adalah pencegahan.

---

## 4. Caveat dan poin yang diperdebatkan

- **Kasus Grand Wisata belum tentu kebakaran baterai.** Bengkel dan Hernest (BEMo) menyebut yang terbakar adalah **controller**; Alva menyebut penyebab belum pasti. Kita tidak tahu kimia sel Alva Cervo (NMC atau LFP), jadi jangan diklaim.
- **Tanggal kronologi Grand Wisata:** video @wargamustikajaya disebut Kamis 5 Nov, sedangkan unggahan kronologi bengkel disebut Rabu 4 Nov. Tanggal kejadian persisnya tidak dinyatakan tegas. Aman: "awal November 2026" atau "viral 5 November".
- **Tanggal Semanggi tidak konsisten di Kompas:** artikel 18 Okt menulis "Jumat (16/10/2026) malam", artikel 19 Okt menulis "Sabtu (17/10/2026) malam".
- **Suhu dekomposisi katoda** bervariasi menurut kimia dan tingkat pengisian. Liu et al. memberi ~180 °C (LiCoO₂, uraian mekanisme) dan 250 °C (perbandingan material). Angka NMC spesifik tidak ditemukan di sumber yang dibaca. Di naskah pakai "sekitar 200 °C ke atas untuk katoda oksida logam seperti NMC" hanya sebagai pendekatan, atau sebut "ratusan derajat".
- **Rentang SEI "80–120 °C"** dari brief tidak ditemukan persis. Sumber terbaca: reaksi eksotermik mulai di atas ~80 °C, dan SEI metastabil terurai di atas ~90 °C. Pakai "sekitar 80–90 °C".
- **"Air memperparah api baterai"** adalah mitos untuk Li-ion (NFPA). Yang benar: air efektif, tapi butuh banyak dan ada risiko menyala ulang.
- **Angka 1 banding 1 juta** berasal dari praktisi bengkel (Kompas) dan Battery University. Itu bukan statistik resmi motor listrik Indonesia.
- **Air sebagai pemicu**: NFPA menyebut paparan air sebagai bentuk kerusakan fisik. Mekanisme rinci untuk motor (misalnya korosi konektor, korsleting di BMS) tidak diuraikan di sumber terbaca.
- **SNI / regulasi Indonesia** untuk baterai motor listrik **tidak berhasil diverifikasi** (pencarian diblokir). Jangan sebut nomor SNI di naskah.

---

## 5. Sumber yang memblokir / tidak terbaca

- Google News decoder kena **HTTP 429**: artikel Kompas "Baterai Rakitan Motor Listrik Lebih Berisiko Terbakar?", Limapagi "Modifikasi Baterai...", dan Pemkot Pekalongan tidak terbaca.
- NFPA tip-sheet PDF (`/-/media/Files/Public-Education/Resources/Safety-tip-sheets/LithiumIonBatterySafety.pdf`) → **500**. Halaman NFPA utama terbaca lewat JSON tertanam.
- UL Solutions (`ul.com/news/...`), ULSE (`ulse.org/...micromobility...`), UL FSRI (`fsri.org/research/...`) → **404**.
- CPSC Micromobility Information Center → **403**.
- FDNY/NYC lithium-ion pages → **404**.
- DuckDuckGo/Bing tidak memberi hasil untuk pencarian SNI dan imbauan Kemenhub.
- Wikipedia API sempat **429**; dibaca lewat `action=raw`.

## Daftar sumber teknis (dibaca)

- Liu, K. et al. (2018). "Materials for lithium-ion battery safety." *Science Advances* 4(6): eaas9820. doi:10.1126/sciadv.aas9820 — PMC6014713 (Europe PMC full text).
- NTSB (2020). *Safety Risks to Emergency Responders from Lithium-Ion Battery Fires in Electric Vehicles*, NTSB/SR-20/01, adopted 13 Nov 2020. https://www.ntsb.gov/safety/safety-studies/Documents/SR2001.pdf
- Battery University, BU-304a "Safety Concerns with Li-ion" (last updated 22-Feb-2022). https://batteryuniversity.com/article/bu-304a-safety-concerns-with-li-ion
- NFPA, Lithium-Ion Battery Safety. https://www.nfpa.org/education-and-research/home-fire-safety/lithium-ion-batteries
- Wikipedia, "Lithium-ion battery" (Electrochemistry, Charging, Safety). https://en.wikipedia.org/wiki/Lithium-ion_battery
- Wikipedia, "Thermal runaway" (Batteries). https://en.wikipedia.org/wiki/Thermal_runaway
- UL 2271 product page. https://www.shopulstandards.com/ProductDetail.aspx?productId=UL2271
