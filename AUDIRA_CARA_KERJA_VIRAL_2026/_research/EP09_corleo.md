# EP09 — Kawasaki CORLEO, "kuda robot" hidrogen (riset, 2026-11-06)

Seri: cara kerja benda yang lagi viral dan bikin kagum. Hanya riset, belum naskah.
Metode: Google News RSS + dekode URL, teks halaman diambil lewat curl. WebSearch dan WebFetch error (model), jadi tidak dipakai. Sumber utama: rilis resmi Kawasaki Heavy Industries (KHI) dan halaman konsep resmi Expo 2025.

---

## 1. Ringkasan hook viral

| Judul | Outlet | Tanggal | URL | Catatan |
|---|---|---|---|---|
| Kawasaki CORLEO Siap Tampil di EICMA 2026, Motor Robot 4 Kaki Ini Dibidik Meluncur 2035 | Pontianak Post (Jawa Pos), penulis Khoiril Arif Ya'qob | Senin, 2 Nov 2026, 08:08 WIB | https://pontianakpost.jawapos.com/otomotif/2611020008/kawasaki-corleo-siap-tampil-di-eicma-2026-motor-robot-4-kaki-ini-dibidik-meluncur-2035 | Mengutip GreatBiker. Menyebut full-scale mock-up, EICMA 5–8 Nov, mesin hidrogen 150cc. |
| Kawasaki to exhibit Corleo robotic multi-legged vehicle at EICMA | EICMA (penyelenggara resmi) | 1 Nov 2026 | https://www.eicma.it/en/kawasaki-to-exhibit-corleo-robotic-multi-legged-vehicle-at-eicma/ | Hall 11, Stand N46; komersialisasi penuh 2035. |
| Kawasaki Pamer Robot Kuda di EICMA 2026, Namanya Corleo | Kompas.com | 4 Nov 2026, 15:41 WIB | https://otomotif.kompas.com/read/2026/11/04/154100715/kawasaki-pamer-robot-kuda-di-eicma-2026-namanya-corleo?page=all | Mengutip MD Kawasaki Motors Europe, Shigemi Tanaka. |
| Kawasaki Is Bringing a Motorcycle With Legs to EICMA, Plans to Really Make It From 2035 | autoevolution | 29 Okt 2026 | https://www.autoevolution.com/news/kawasaki-is-bringing-a-motorcycle-with-legs-to-eicma-plans-to-really-make-it-from-2035-277732.html | Tegas: yang dibawa mock-up, **bukan prototipe yang bisa jalan**. |
| Bukan Motor, Kawasaki Bakal Bawa Robot Mirip Kuda ke EICMA 2026 | CNN Indonesia | 2 Nov 2026 | https://www.cnnindonesia.com/otomotif/20261102112738-603-1422230/bukan-motor-kawasaki-bakal-bawa-robot-mirip-kuda-ke-eicma-2026 | Tidak dibaca, hanya judul. |
| Kawasaki CORLEO, Inovasi Kendaraan Robotik Bertenaga Hidrogen | RRI | 6 Nov 2026 | https://rri.co.id/surabaya/otosport/2872481/kawasaki-corleo-inovasi-kendaraan-robotik-bertenaga-hidrogen | Tidak dibaca, hanya judul. |

**Benar-benar baru?** Ya untuk pameran: EICMA 2026 di Milan (press day 3–4 Nov, publik 5–8 Nov 2026), dan itu debut CORLEO di pameran motor. Tapi **konsepnya sudah ada sejak April 2025** (Expo Osaka), rencana 2035 diumumkan **Desember 2025**, dan mock-up penuh sudah tampil di Tokyo (28 Juli 2026) dan gamescom Jerman (26–30 Agustus 2026). Yang baru: tampil di pameran motor terbesar dunia.

---

## 2. Fakta terverifikasi

### Kronologi resmi
1. **3 April 2025**: KHI mengumumkan CORLEO akan dipamerkan di Expo 2025 Osaka, Kansai, di proyek "Future Life Expo: Future City". Expo dibuka **13 April 2025**. CORLEO disebut **"a 2050 concept model"**. — https://global.kawasaki.com/en/corp/newsroom/news/detail/?f=20250403_9193. HIGH
2. Tema pameran Kawasaki: **"Impulse to Move"**. — rilis yang sama. HIGH
3. **3 Desember 2025**: KHI mulai pengembangan menuju **komersialisasi tahun 2035**, membentuk **SAFE ADVENTURE Business Development Team** yang melapor langsung ke presiden direktur, dengan target dipakai sebagai kendaraan di lokasi **Expo 2030 Riyadh, Arab Saudi**. — https://global.kawasaki.com/en/corp/newsroom/news/detail/?f=20251211_7502. HIGH
4. Konsep di Expo 2025 meraih sekitar **1,2 miliar impresi media sosial** kumulatif. — rilis Des 2025. HIGH (klaim perusahaan)
5. Kawasaki juga membuat **simulator tunggang**, target selesai **2027**, untuk industri game dan e-sports (termasuk data gerak dan model 3D). — rilis Des 2025 dan Agu 2026. HIGH
6. Sistem navigasi direncanakan: mendeteksi **cuaca, suhu, kondisi permukaan jalan, dan kemunculan satwa liar**, lalu memandu ke rute aman lewat perangkat seperti smartphone. — rilis Des 2025; diulang EICMA. HIGH (rencana)
7. **28 Juli 2026**: mock-up skala penuh diperlihatkan di Ota, Tokyo. Rencana: wahana tunggang publik di **Qiddiya** (kota hiburan di Arab Saudi) sekitar 2035; Kawasaki mempertimbangkan pendapatan dari atraksi, **bukan menjual CORLEO**; ingin memamerkan model yang **berjalan** di Expo 2030 dan akan mengembangkan **prototipe operasional sampai saat itu**. — Asahi Shimbun, 18 Agu 2026, https://www.asahi.com/ajw/articles/16815464. HIGH
8. **gamescom 2026** (Köln, 26–30 Agu 2026): mock-up skala penuh, pengunjung bisa duduk di atasnya. Disebut "Robotic Multi-legged Vehicle (RMV)". — https://global.kawasaki.com/en/corp/newsroom/news/detail/?f=20260819_0930. HIGH
9. **EICMA 2026**: CORLEO di **Hall 11, Stand N46**, dibawa Kawasaki Motors Europe; komersialisasi penuh **2035**. — EICMA, 1 Nov 2026. HIGH
10. Yang dibawa ke EICMA adalah **full-scale mock-up, bukan prototipe yang bisa jalan**. — autoevolution 29 Okt 2026; Pontianak Post juga menyebut "full-scale mock-up". HIGH

### Spesifikasi konsep (halaman resmi https://www.khi.co.jp/expo2025/concept01/index_en.html) — HIGH sebagai klaim konsep
11. **Power unit: mesin hidrogen 150cc untuk membangkitkan listrik.** Hidrogen dari **kanister di bagian belakang**. Listrik menggerakkan **unit penggerak di masing-masing dari empat kaki**.
12. Rilis April 2025 lebih rinci: kanister dimasukkan di **bagian kaki belakang**; mesin hidrogen dipasang di **bagian kaki depan**.
13. **Swing arm**: unit kaki belakang bisa **berayun naik-turun terpisah dari unit kaki depan**. Ini meredam guncangan saat berjalan/berlari, dan saat naik anak tangga pengendara tidak perlu mendongak sehingga lebih mudah melihat jalan. Mekanisme ini diturunkan dari desain sepeda motor.
14. **Kendali: pergeseran berat badan** pengendara, dideteksi oleh **pijakan kaki (steps) dan setang**. Panjang **sanggurdi (stirrup)** bisa diubah agar postur optimal. "Much like horseback riding."
15. Mesin juga **terus memantau gerakan pengendara**; dengan bantuan mesin, pemula bisa melintasi pegunungan dan perairan dengan aman (rilis April 2025).
16. **Kuku (hooves)**: di keempat kaki, **struktur terbelah kiri-kanan dari karet**, meredam permukaan tidak rata dan anti-selip. Untuk padang rumput, area berbatu, dan puing.
17. **Panel instrumen**: menampilkan **level hidrogen, rute ke puncak, posisi pusat gravitasi**, dan lainnya. **Malam hari**: memproyeksikan **penanda ke permukaan jalan** untuk menunjukkan jalur di depan.

### Paten (2026)
18. Permohonan paten diajukan **awal 2026**, terbit **Agustus 2026**. Isi menurut motorcycles.news (15 Agu 2026, https://www.motorcycles.news/en/kawasaki-corleo-patent-controls/): MED (sumber sekunder, nomor paten tidak disebut)
   - pakaian/perlengkapan pengendara dengan **sensor bawaan, termasuk IMU**, membaca posisi dan pergeseran pusat gravitasi pengendara; condong kiri = belok kiri;
   - kapasitas **dua orang**, pijakan kaki bisa diatur, kompartemen penyimpanan;
   - mode **otomatis, "wasteland mode" (off-road), lambat, dan cepat**;
   - suspensi kaki depan dan belakang bisa **terhubung atau independen** (dua varian dijelaskan, belum diputuskan);
   - layar sentuh + kontrol di setang; **berhenti otomatis** bila tangan lepas dari setang; menarik setang seperti tali kekang = sinyal berhenti;
   - tenaga dari **generator yang diputar mesin pembakaran**; teks paten tidak mengunci jenis bahan bakar ke hidrogen.

### Lain-lain
19. Pernyataan Shigemi Tanaka (MD Kawasaki Motors Europe) di EICMA: CORLEO menunjukkan luasnya pengalaman teknis, industri, dan lingkungan Kawasaki; ia juga mengaitkannya dengan komitmen menuju masa depan netral karbon lewat konsep Safe Adventure. — Kompas (terjemahan dari rilis Kawasaki), 4 Nov 2026. MED (parafrase; kutipan asli Inggris tidak dibaca)
20. New Atlas (6 Jan 2026) menyebut video 2025 sebagai CGI ("bad CGI video"); autoevolution menyebut "computer-generated video". — https://newatlas.com/motorcycles/kawasaki-robot-horse-corleo/. HIGH bahwa video promosi 2025 adalah render komputer.

---

## 3. Mekanisme (6–8 langkah untuk animasi) — semua sebagai KONSEP

1. **Tangki hidrogen di belakang.** Hidrogen disimpan di kanister di bagian belakang (kaki belakang).
2. **Mesin kecil jadi pembangkit listrik.** Mesin hidrogen 150cc di bagian depan tidak memutar roda. Ia memutar generator untuk menghasilkan listrik, seperti genset mini. Hasil pembakaran hidrogen terutama uap air.*
3. **Listrik ke empat "otot".** Listrik dialirkan ke unit penggerak di masing-masing kaki, sehingga tiap kaki bisa digerakkan sendiri.
4. **Pengendara jadi joystick.** Pengendara condong ke depan, kiri, atau kanan. Sensor di pijakan kaki dan setang (dan, menurut paten, IMU di perlengkapan pengendara) membaca pergeseran pusat gravitasi lalu menerjemahkannya jadi arah jalan, seperti menunggang kuda.
5. **Kaki belakang berayun sendiri.** Swing arm ala motor membuat unit kaki belakang naik-turun terpisah dari depan, meredam guncangan, dan menjaga badan pengendara tetap tegak saat naik tangga batu.
6. **Kuku karet terbelah.** Telapak karet kiri-kanan menyesuaikan diri di batu, rumput, dan puing, sekaligus anti-selip.
7. **Panel dan lampu malam.** Panel menampilkan sisa hidrogen, rute ke puncak, dan titik berat pengendara. Malam hari, penanda jalur diproyeksikan ke tanah.
8. **Pengaman.** Menurut paten: kalau tangan lepas dari setang atau setang ditarik seperti tali kekang, CORLEO melambat atau berhenti.

*Catatan langkah 2: pernyataan "terutama uap air" adalah sifat umum pembakaran hidrogen, bukan klaim Kawasaki tentang CORLEO. Pembakaran hidrogen di udara juga bisa menghasilkan NOx. Kalau dipakai, beri label umum atau hapus.

---

## 4. Catatan / konsep vs nyata

- **Belum ada CORLEO yang bisa berjalan dan ditunggangi yang dipertunjukkan ke publik.** Yang nyata: mock-up skala penuh statis (Tokyo Juli 2026, gamescom Agu 2026, EICMA Nov 2026) dan video CGI 2025. Asahi: prototipe operasional baru "akan dikembangkan" menjelang Expo 2030.
- **Tidak ada angka performa resmi**: kecepatan, berat, jangkauan, kapasitas tangki, torsi motor kaki, jumlah sendi per kaki. autoevolution: Kawasaki "have not provided any details of the actual capabilities". Jangan mengarang angka.
- Hanya **150cc** dan "mesin hidrogen untuk membangkitkan listrik" yang resmi. Daya listrik (kW) tidak diumumkan.
- **"Dibidik meluncur 2035"**: resmi "commercialization in 2035". Asahi: rencana awal berupa **wahana tunggang di Qiddiya**, Kawasaki mempertimbangkan **tidak menjual unitnya**. Jangan bilang "bisa dibeli konsumen tahun 2035" secara pasti (New Atlas menulis "on sale for consumers by 2035", tidak sejalan dengan Asahi).
- **Bukan "motor"**. Rilis menyebutnya off-road personal mobility vehicle / RMV. Judul Pontianak "motor robot" adalah gaya bahasa media.
- **Keliru di media Indonesia**: Pontianak Post dan Kompas menulis "CORLEO merupakan singkatan dari Robotic Multi-legged Vehicle (RMV)". Rilis resmi menyebut RMV sebagai **jenis kendaraan**, bukan kepanjangan nama CORLEO. Jangan ulangi.
- Konsep awal **"2050 concept model"** (April 2025), lalu dimajukan ke target 2035 (Desember 2025).
- Kendali lewat sensor di **pijakan dan setang** (halaman konsep) vs **perlengkapan pengendara dengan IMU** (paten, sumber sekunder). Bisa disebut keduanya, dengan label "menurut paten".
- Paten menyebut "combustion engine" generik; hidrogen hanya pasti di konsep publik.

---

## 5. Sumber yang terblokir / tidak terbaca

- WebSearch dan WebFetch: error model, tidak dipakai.
- global.kawasaki.com/en/corleo/ dan /en/stories/...: 404. Rilis resmi dibaca lewat URL newsroom `?f=`.
- Kawasaki Motors Europe (rilis EICMA berbahasa Inggris): tidak ditemukan/dibaca; kutipan Tanaka hanya via Kompas.
- Instagram resmi @kawasaki_corleo_official: tidak dibuka.
- Tidak dibaca (hanya judul): CNN Indonesia, RRI, OtoRider, Gridoto, Motorplus, Orasi.id, BeritaSatu, Demokratis, RideApart, Visordown, Auto India Daily, Pasquale Pillitteri, Gear Patrol, Hypebeast, My Modern Met, AMCN, Parametric Architecture.
- GreatBiker (sumber Pontianak Post): tidak dibaca.
