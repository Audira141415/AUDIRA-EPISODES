# EP08 — Robot "memanjat" Gunung Tai (riset, 2026-11-06)

Seri: cara kerja benda yang lagi viral dan bikin kagum. Hanya riset, belum naskah.
Metode: Google News RSS + dekode URL, teks halaman diambil lewat curl/urllib. WebSearch dan WebFetch error (model), jadi tidak dipakai.

---

## 1. Ringkasan hook viral

| Judul | Outlet | Tanggal | URL | Catatan |
|---|---|---|---|---|
| Robot "Memanjat" Gunung Tai Sepanjang 3,9 Kilometer dan Lebih dari 3.100 Anak Tangga | CGTN Indonesia (domain indonesian.cri.cn) | Halaman: 2026-11-03 12:12:28 (waktu Beijing; timestamp = 2026-11-03 04:12 UTC). RSS Google News: 2026-11-02 12:12 GMT | https://indonesian.cri.cn/2026/11/03/ARTI1793679145509457 | Halaman video, tidak ada teks artikel. Angka 3,9 km dan 3.100 anak tangga cocok dengan Xinhua/People's Daily. |
| First world robot Mount Tai climbing competition held in east China's Shandong | Xinhua | 2026-11-03 07:28 | https://english.news.cn/20261103/2e202caec0b342c6ae4c9f0ada68e399/c.html | Galeri foto; caption: lomba 2 Nov 2026, hampir 90 tim. |
| On Mount Tai, a tough test for China's robots | People's Daily Online (teks Xinhua) | 2026-11-04 | https://en.people.cn/n3/2026/1104/c90000-20515845.html | Artikel terlengkap soal beban, kendala, operator manusia. |
| Robots strut their stuff, race up sacred China mountain, some carrying eggs and watermelons | CBS News (AFP) | 2026-11-02 | https://www.cbsnews.com/news/robots-race-china-mountain-eggs-watermelons/ | Waktu juara + robot jatuh. |
| Robots climb Mount Tai in China's first major mountain challenge | TechNode | 2026-11-03 | https://technode.com/2026/11/03/robots-climb-mount-tai-in-chinas-first-major-mountain-challenge/ | Hasil semua kategori + masalah teknis. |
| 3.9 km, 3,100+ steps in 43'41": Unitree robot wins quadruped speed gold... | Global Times | 2026-11-02 21:07 | https://www.globaltimes.cn/page/202611/1373484.shtml | Hanya teaser yang terbaca. |
| China's Unitree robot dog completes Mount Tai stair course in 43:41... | BigGo Finance | 2026-11-03 | https://finance.biggo.com/news/a97a6894-ff89-46b8-804e-9531643f05cd | Model robot (A2, B2), penalti 2 menit, payload 66 kg. |
| Inaugural CMG World Robot Mount Tai Competition enters qualifying phase | Global Times | 2026-10-26 | https://www.globaltimes.cn/page/202610/1372980.shtml | Pra-lomba; penjelasan cara kerja (LiDAR, kamera, titik pijak). |
| Unitree G1 Overheated During the Ascent of Mount Tai: Robot Carried Out on a Stretcher | Root-Nation | 2026-11-02 | https://root-nation.com/en/news-en/it-news-en/en-unitree-g1-overheats-during-climb-up-mount-taishan/ | Humanoid gagal karena panas berlebih. |
| Taklukkan 3.000 Anak Tangga, Puluhan Robot di Tiongkok Ikut Lomba Naik Gunung... | Kabar6.com | 2026-11-05 | https://kabar6.com/taklukkan-3-000-anak-tangga-gunung-tai-puluhan-robot-di-tiongkok-ikut-lomba-naik-gunung-bawa-telur-hingga-semangka/ | Tidak dibaca; hanya judul. |

**Benar-benar baru?** Ya. Lomba berlangsung Senin, 2 November 2026 (4 hari sebelum riset). Ini **bukan satu robot**, tapi kompetisi: "1st CMG World Robot Mount Tai Climbing Competition" yang digelar China Media Group (CMG), dengan hampir 90 tim. Babak kualifikasi mulai 26 Oktober 2026.

---

## 2. Fakta terverifikasi

### Acara
1. **Tanggal lomba: 2 November 2026 (Senin)**, Tai'an, Provinsi Shandong. — Xinhua, People's Daily, CBS, TechNode. HIGH
2. **Penyelenggara: China Media Group (CMG)**, nama resmi "CMG World Robot Mount Tai Climbing Competition", edisi pertama. — CBS, TechNode, Global Times. HIGH
3. **Hampir 90 tim** ikut. — Xinhua (caption foto), People's Daily, CBS ("around 90"). HIGH. TechNode menyebut robot dari "lebih dari 50" perusahaan, universitas, dan tim riset (hitungan organisasi, bukan tim). MED
4. **Rute: 3,9 km, lebih dari 3.100 anak tangga batu**, dari Hongmen (Gerbang Merah) ke Zhongtianmen (Gerbang Tengah Langit). — TechNode, People's Daily, BigGo, Root-Nation. HIGH. Catatan: artikel pra-lomba Global Times (26 Okt) menulis **3,8 km**.
5. **Kenaikan elevasi kumulatif sekitar 600 m.** TechNode: "nearly 600 meters". BigGo: "about 600 meters". CBS: "more than 1,970 feet" (sekitar 600 m), jarak "2.4-mile". HIGH
6. Rute melewati Wanxian Tower, Doumu Palace, dan Stone Sutra Valley. — TechNode. HIGH
7. Sebagian anak tangga **"barely wide enough for half an adult foot"** (hampir tak cukup untuk setengah telapak kaki orang dewasa). — People's Daily/Xinhua. HIGH
8. **Empat kategori resmi**: lomba cepat humanoid, lomba cepat robot berkaki (legged), angkut beban robot berkaki, dan bantuan exoskeleton bertenaga. Plus satu tantangan terpisah: mobilitas segala medan dan pencarian jalur. — TechNode, Root-Nation. HIGH
9. Robot anjing berangkat dengan **jeda 2 menit**. — People's Daily. HIGH. Root-Nation menulis jeda "approximately one minute" untuk peserta secara umum. Angka berbeda, jadi pakai "berangkat bergantian".
10. Waktu manusia: CBS (mengutip CCTV) bilang kebanyakan turis butuh **minimal 2 jam**. BigGo: pendaki cukup bugar butuh **1,5–2 jam**. Global Times (26 Okt): rute pendakian Gunung Tai "biasanya 2–3 jam" sampai puncak (ini untuk rute ke puncak, bukan rute lomba). MED. Inshorts menulis "3x faster than humans", tidak dicek, jangan pakai.

### Juara dan robot
11. **Juara lomba cepat robot berkaki: tim Beijing Lingyi Technology** (anak usaha penuh Unitree Robotics), **43 menit 41 detik**. — CBS, TechNode, Global Times. HIGH
12. Robotnya **Unitree A2** (quadruped/robot anjing industri). Waktu aktual **41:41**, ditambah **penalti 2 menit** jadi 43:41. — BigGo Finance. MED (satu sumber; BigGo menyebut hasil dari pengumuman panitia). Jenis penalti tidak dijelaskan.
13. A2 disebut berjalan **"fully autonomous mode"** sepanjang rute. — BigGo (klaim yang bersumber dari Unitree). MED
14. Juara 2 lomba cepat: Shanghai Gaoyi Technology (pakai **Unitree A2**). Juara 3: tim Lingju dari Linxai Intelligent. — TechNode, BigGo. HIGH
15. **Angkut beban: juara tim Lingshi (Linxai Intelligence), 1 jam 51 menit 29 detik.** Juara 2 Shanghai Gaoyi, juara 3 Shenzhen Technology University. — TechNode. HIGH
16. Juara 2 angkut beban memakai **Unitree B2**, payload efektif **66 kg** (74 kg dengan rangka), di segmen Wanxian Tower–Doumu Palace. — BigGo. MED
17. Unitree secara resmi hanya mengirim **dua quadruped (A2 dan B2)**; banyak tim independen memakai produk Unitree yang dimodifikasi. — BigGo. MED
18. **Juara humanoid: tim Zhishen Lingyue (Beijing), 27 menit 26 detik**, di rute yang **dipendekkan** (Hongmen Square sampai Doumu Palace) karena medannya terlalu berat. — TechNode, CBS. HIGH. Model robot humanoid pemenang **tidak ditemukan**.
19. Barang bawaan: **telur, mi instan, air botol** di punggung robot anjing; juga **semangka** dan benda bentuk aneh seperti **termos**. Barang rapuh yang rusak mengurangi poin. — People's Daily, CBS. HIGH
20. Peserta lain: humanoid **Yobotics E1 "Walker Taishan"** (Shandong Yobotics), tinggi **1,4 m**, berat **39 kg**. — Global Times 26 Okt. MED (klaim perusahaan).

### Bantuan manusia dan kegagalan
21. **Ada bantuan manusia.** "Others still depended heavily on human operators." Beberapa robot anjing tersandung atau menabrak dinding. Beberapa humanoid kehilangan keseimbangan, sebagian jatuh tak lama setelah start. — People's Daily/Xinhua. HIGH
22. Satu humanoid berbandana ambruk, insinyur bergegas memperbaikinya. Humanoid lain terguling menuruni tangga sampai berhenti di dekat tempat sampah. — CBS/AFP. HIGH
23. **Unitree G1** (versi eksperimental, dibawa tim Yongda Zhicheng) **kepanasan** di tengah jalan, mundur, lalu **ditandu turun**. — Root-Nation; dikonfirmasi judul Seoul Economic Daily (05-11-2026). MED-HIGH
24. Masalah yang tercatat: **motor kepanasan, penurunan daya otomatis, postur miring ke samping**, dan gait tidak stabil setelah beban diganti di titik suplai. — TechNode. HIGH
25. **Kuli angkut (porter)**: di Gunung Tai, porter manusia sudah lama memikul barang naik tangga. Robot anjing sudah mulai mengambil sebagian pekerjaan itu: angkut suplai naik dan sampah turun. — People's Daily. HIGH. Catatan: ini konteks umum di Gunung Tai, **bukan** bagian dari lomba.

### Spesifikasi Unitree A2 (halaman resmi https://www.unitree.com/A2) — HIGH semua (klaim pabrikan)
26. Berat sekitar **42 kg** dengan baterai (sekitar 35 kg tanpa baterai). Ukuran berdiri 820 × 440 × 570 mm.
27. **12 motor sendi** (12 derajat kebebasan, 3 per kaki). Motor PMSM inner-rotor, encoder ganda. Torsi sendi maksimum **sekitar 180 N·m**.
28. Sensor: versi standar **1 LiDAR + 1 kamera HD**; A2-PRO **2 LiDAR industri (depan dan belakang) + kamera HD + lampu depan**. Tidak jelas varian mana yang dipakai di lomba.
29. Baterai: 1 baterai 9.000 mAh (**453,6 Wh**), dua baterai 18.000 mAh (**907,2 Wh**), bisa diganti panas (hot-swap). Tegangan 50,4 V.
30. Daya tahan: tanpa beban **>5 jam / sekitar 20 km**; beban 25 kg **>3 jam / sekitar 12,5 km**.
31. Tinggi anak tangga maksimum **30 cm**; lereng sekitar **45°**; kecepatan **0–3,7 m/s** (hingga sekitar 5 m/s); beban jalan kontinu sekitar 25 kg; beban berdiri sekitar 100 kg.
32. Pendinginan: **udara lokal**. Suhu operasi -20 sampai 55 °C. IP56 (PRO: IP56–IP67).
33. Komputer: CPU 8-core (platform) + Intel Core i7 (pengembangan pengguna).

### Cara kerja (sumber umum)
34. Pengamat industri Zhong Xiangyun ke Global Times: robot memakai **LiDAR dan kamera** untuk mendeteksi anak tangga di depan dan **menghitung titik pijak secara real-time**; pengendali sendi seluruh tubuh terus menggeser **pusat massa** agar seimbang di lereng yang berubah; baterai, motor, dan transmisi harus tahan panas dan kebutuhan daya. — Global Times 26 Okt. MED (opini pengamat)
35. Sebelum lomba ada **lapangan latihan replika** di kaki Gunung Tai (dibangun Shandong CCRC Technology Group): meniru rute 3,8 km dan 3.100+ anak tangga, dengan **11 lintasan uji**. — Global Times. HIGH
36. Riset ETH Zurich (Miki dkk., *Science Robotics* 19 Jan 2022, DOI 10.1126/scirobotics.abk2822): pengendali yang menggabungkan **propriosepsi** (rasa sendi/badan) dan **eksterosepsi** (peta medan dari sensor) lewat encoder rekuren berbasis attention, dilatih end-to-end. Robot ANYmal menyelesaikan **pendakian satu jam di Pegunungan Alpen dalam waktu standar pendaki manusia**. — https://arxiv.org/abs/2201.08117. HIGH
37. Rudin dkk. (CoRL 2021): latihan **ribuan robot simulasi paralel di satu GPU**; kebijakan jalan medan datar terlatih **<4 menit**, medan tidak rata **20 menit**, lalu dipindah ke robot asli. — https://arxiv.org/abs/2109.11978. HIGH

### Gunung Tai
38. Puncak Jade Emperor: **1.532,7 m** (Wikipedia, angka infobox) dan **"commonly reported" 1.545 m**. Pakai "sekitar 1.500 meter" atau sebut keduanya. — https://en.wikipedia.org/wiki/Mount_Tai. HIGH bahwa ada dua angka.
39. Anak tangga total: Wikipedia memuat beberapa angka: **sekitar 6.660** (Gerbang Merah ke Gerbang Langit Selatan), **6.293** anak tangga jalur resmi, **7.200** termasuk tangga kuil, dan "6,000 granite steps". **Angka 6.600 tidak konsisten antarsumber.** Aman: "sekitar 6.000-an anak tangga sampai puncak". MED
40. Situs Warisan Dunia UNESCO sejak **1987**; tempat ibadah setidaknya **3.000 tahun**. — Wikipedia. HIGH
41. Shibapan (18 tikungan): **1.827 anak tangga**. — Wikipedia. MED. Lomba **tidak** sampai puncak: berhenti di Zhongtianmen (tengah gunung), sebelum Shibapan.

---

## 3. Mekanisme (6–8 langkah untuk animasi)

1. **Mata laser dan kamera.** LiDAR menembakkan ribuan titik laser dan kamera merekam tangga di depan. Hasilnya awan titik 3D. (A2: 1–2 LiDAR + kamera HD.)
2. **Peta ketinggian.** Komputer di badan robot mengubah awan titik jadi peta tinggi-rendah tanah (grid kotak), sehingga tiap anak tangga terlihat tinggi dan lebarnya.
3. **Pilih titik pijak.** Untuk tiap kaki, robot menghitung tempat mendarat yang datar dan cukup lebar. Ini penting karena ada anak tangga yang lebarnya hanya setengah telapak kaki orang dewasa. (Global Times: titik pijak dihitung real-time.)
4. **Rasa badan.** IMU (sensor gerak/kemiringan) dan encoder di tiap sendi memberi tahu posisi kaki dan kemiringan badan ratusan kali per detik. Kalau kaki menyentuh tangga lebih cepat dari perkiraan, robot langsung "merasakannya".
5. **Otak yang dilatih di dunia virtual.** Banyak robot berkaki modern dilatih dengan reinforcement learning: ribuan robot virtual jatuh-bangun di simulasi sampai menemukan cara jalan yang stabil, lalu "otak" itu dipindah ke robot asli. (Riset ETH; metode Unitree sendiri tidak diumumkan.)
6. **Otot listrik.** 12 motor sendi (3 per kaki) mendorong hingga sekitar 180 N·m per sendi untuk mengangkat badan 42 kg naik anak tangga setinggi maksimal 30 cm.
7. **Jaga pusat massa.** Pengendali seluruh tubuh terus menggeser pusat massa di atas kaki yang menapak, apalagi saat memikul telur atau semangka.
8. **Musuh terakhir: panas dan baterai.** Mendaki terus-menerus membuat motor panas. Ada robot yang daya-nya turun otomatis atau kepanasan (G1 ditandu). Baterai A2 sekitar 453,6 Wh per paket, bisa diganti tanpa mematikan robot.

---

## 4. Catatan / poin sengketa

- **Bukan satu robot.** Judul CGTN terdengar seperti satu robot memanjat. Faktanya ini lomba sekitar 90 tim, dan **tidak sampai puncak**: hanya 3,9 km sampai Zhongtianmen (tengah gunung), naik sekitar 600 m. Jangan bilang robot "menaklukkan Gunung Tai sampai puncak 1.545 m".
- **Humanoid tidak menempuh rute penuh**: rute humanoid dipendekkan ke Hongmen–Doumu Palace. Jangan membandingkan 27:26 dengan 43:41.
- **43:41 termasuk penalti 2 menit** (waktu aktual 41:41, menurut BigGo). Penyebab penalti tidak diketahui.
- **"Fully autonomous"** hanya klaim BigGo/Unitree. Xinhua menulis sebagian robot masih bergantung berat pada operator manusia. Untuk robot lain, jangan klaim otonom.
- **Metode kontrol Unitree (RL vs MPC) tidak dipublikasikan** di halaman A2. Penjelasan RL-di-simulasi adalah cara kerja umum robot berkaki (riset ETH), bukan klaim tentang A2. Beri label "umumnya".
- **Varian A2 tidak jelas** (standar 1 LiDAR vs PRO 2 LiDAR). Bilang "LiDAR dan kamera".
- **Porter**: robot anjing memang sudah membantu angkut suplai/sampah di Gunung Tai (Xinhua), tapi lomba tidak melibatkan pendampingan porter.
- Jarak 3,8 km (Global Times pra-lomba) vs 3,9 km (semua laporan pasca-lomba). Pakai 3,9 km.
- Jumlah anak tangga Gunung Tai total: 6.293 / 6.660 / 7.200, tergantung cara hitung. Angka "6.600" dari brief tidak terverifikasi tepat.
- Tinggi puncak: 1.545 m ("commonly reported") vs 1.532,7 m (infobox Wikipedia).

---

## 5. Sumber yang terblokir / tidak terbaca

- WebSearch dan WebFetch: error model, tidak dipakai.
- indonesian.cri.cn (hook CGTN): halaman video, tanpa teks artikel.
- news.cgtn.com "Robot dogs train to conquer Mount Tai in under an hour" (28-10-2026): video, hanya ringkasan satu kalimat (3,9 km, 3.100 anak tangga, target < 1 jam).
- english.news.cn (Xinhua): Python urllib gagal SSL (self-signed chain, tidak di-bypass); curl berhasil tapi isinya hanya galeri/caption video.
- english.cctv.com: galeri foto tanpa teks.
- globaltimes.cn/page/202611/1373484.shtml: hanya paragraf teaser.
- unitree.com/B2: halaman kosong lewat curl (render JS). Spesifikasi B2 tidak diverifikasi.
- Tidak dibaca (hanya judul): Kabar6, Tribun Video, Forbes, Euronews, WION, Exoskeleton Report, ZME Science, Seoul Economic Daily, Inshorts, Malay Mail.
