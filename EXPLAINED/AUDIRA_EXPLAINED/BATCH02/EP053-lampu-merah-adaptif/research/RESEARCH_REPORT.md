# RESEARCH_REPORT — EP053 Lampu Merah Adaptif

Topik: "Lampu Merah Bisa Mengatur Ribuan Kendaraan Secara Otomatis?"
Tanggal riset: 2026-11-07. Nomor [#] merujuk ke `SOURCE_REGISTER.md`.

Jawaban singkat: bisa, tetapi hanya di sebagian simpang. Lampu adaptif tidak "berpikir" sendirian. Sensor menghitung kendaraan, lalu kontroler di pinggir jalan dan komputer pusat menggeser lama lampu hijau setiap siklus. Di Jakarta per Februari 2026, sistem ini baru ada di 115 dari 321 simpang bersinyal [18].

## 1. Mekanisme inti (berurutan)

1. **Tiga tingkat lampu.** Ada tiga jenis lampu lalu lintas.
   - **Waktu tetap (fixed-time):** jadwal merah-hijau disusun dari data hitungan lama dan berjalan menurut jam. Lampu ini tidak tahu kondisi jalan saat itu [2].
   - **Actuated:** lama hijau bisa memanjang atau memendek sesuai deteksi kendaraan, dalam batas minimum dan maksimum [3].
   - **Adaptif:** waktu banyak simpang dihitung ulang terus-menerus dari data sensor dan dikoordinasikan sebagai satu jaringan [2][9][11].
2. **Sensor menghitung kendaraan.** Sensor paling klasik adalah loop induktif: gulungan kawat di alur tipis yang digergaji di aspal, dialiri arus bolak-balik 10–200 kHz. Badan logam kendaraan menurunkan induktansi loop, frekuensinya berubah, lalu detektor mengirim pulsa "ada kendaraan" ke kontroler [6]. Sensor lain: kamera dengan pengolah video, radar microwave, inframerah, dan magnetometer [8]. ITCS Jakarta memakai kamera yang mengenali jenis kendaraan dan membaca pelat nomor (ANPR) [16][18].
3. **Kontroler di lemari pinggir jalan** menerima data detektor. Kontroler memperpanjang hijau, memotongnya lebih cepat, atau melewati fase yang tidak ada peminatnya. Ini level "taktis" SCATS [9].
4. **Komputer regional atau pusat** mengumpulkan data dari banyak simpang dan menyetel tiga angka kunci [4][9][11]:
   - **Siklus:** total satu putaran semua fase.
   - **Split:** pembagian jatah hijau antararah.
   - **Offset:** selisih waktu mulai hijau antara simpang yang bertetangga.
5. **Optimasi berulang.** SCOOT memakai detektor di tengah ruas untuk membuat "profil arus" per siklus, memprediksi antrean di garis henti, lalu mengubah split, siklus, dan offset sedikit demi sedikit [11]. SCATS memakai detektor di garis henti dan mengukur seberapa jenuh simpang. Bila jenuh, siklus diperpanjang [9]. Penyesuaian dibuat kecil dan hampir per siklus supaya sistem tidak goyah [9][11].
6. **Koordinasi atau green wave.** Offset diatur supaya rombongan kendaraan yang melaju pada kecepatan wajar tiba di simpang berikutnya saat lampu sudah hijau. Ini koordinasi, bukan semua lampu menyala bersamaan [5].
7. **Pusat kendali dan manusia.** Operator memantau lewat CCTV dan bisa mengambil alih, misalnya untuk ambulans atau damkar (VIP route) atau saat antrean melewati batas [16][23]. Jakarta memantau dari Network Operation Center, Surabaya dari SITS Bratang [18][23].
8. **Kalau koneksi putus, sistem turun kelas.** Kebakaran Gedung Bapenda pada 7–8 Agustus 2026 membuat ITCS Jakarta tidak bisa mengendalikan lampu dari pusat, sehingga petugas mengatur manual [21]. Pencurian penguat jaringan di Surabaya pada November 2026 membuat satu simpang lepas dari pusat dan macet [25].

## 2. Fakta paling menarik yang aman dipakai di naskah

1. **Jakarta, 26 Februari 2026:** 115 dari 321 simpang bersinyal (35,8%) sudah memakai ITCS berbasis AI. Sistem ini bisa memprediksi volume lalu lintas hingga 60 menit ke depan dari data histori [18]. Sumber: Wakil Kepala Dishub DKI via Kompas.com. Sebelumnya: 40 simpang pada Juli 2024 [15] dan sekitar 65 simpang pada Agustus 2025 [16][17].
2. **Simpang lainnya masih kurang dinamis.** Kepala Dishub DKI (Agustus 2025) menyebut simpang di luar ITCS masih memakai ATCS yang pengaturannya "masih bersifat statis" [16]. Ini bukti bahwa tidak semua simpang adaptif. Targetnya semua simpang Jakarta memakai ITCS paling lambat 2030 [19].
3. **Klaim resmi dampak:** Wagub DKI (27 Agustus 2025) menyebut ITCS menurunkan waktu tunggu kendaraan 15–20% [17]. Wajib diberi label "menurut Pemprov DKI".
4. **Mobil di atas kawat:** loop induktif di aspal "merasakan" logam kendaraan lewat perubahan medan magnet. Teknologi ini dipakai sejak awal 1960-an dan masih menjadi sensor lalu lintas paling umum [6].
5. **Sistem adaptif sudah ada sejak 1970–80-an:** SCATS dari Sydney dan SCOOT dari Inggris. Menurut pengembangnya, SCATS terpasang di lebih dari 60.000 simpang di 30 negara dan SCOOT di lebih dari 350 kota [10][12]. Kedua angka ini klaim vendor.

## 3. JANGAN DIKLAIM

- "Semua lampu merah di Jakarta atau Indonesia sudah pakai AI." Salah: 115 dari 321 simpang Jakarta (Februari 2026) [18]. Surabaya: sensor antrean baru di 8 titik dari 136 simpang (Juli 2024) [24].
- "AI mengatur lampu tanpa manusia." Salah: operator tetap mengintervensi [23], dan saat command center terbakar, pengaturan jadi manual [21].
- "ATCS = otomatis atau adaptif." ATCS di Indonesia sering berarti pusat kendali, CCTV, dan pengaturan jarak jauh. Dishub DKI sendiri menyebut ATCS lama "statis" [16].
- "Lampu adaptif menghilangkan macet." Klaim yang ada hanya penurunan waktu tunggu 15–20% versi Pemprov [17]. Tidak ditemukan audit independen.
- Angka 28% waktu tempuh, 25% berhenti, 12% BBM (situs SCATS) adalah klaim pemasaran tanpa tanggal [28].
- "Jakarta pakai SCATS atau SCOOT." Vendor dan algoritma ITCS Jakarta tidak terverifikasi.
- "Lampu menyala hijau serentak (sinkron) di sepanjang jalan." Green wave adalah hijau berurutan sesuai offset, bukan serentak [5].
- Perbaikan peringkat TomTom (dari 30 ke 90) sebagai bukti hasil ITCS. Itu korelasi yang dikutip pejabat, bukan kausalitas.
- Jumlah simpang ATCS nasional, status ITCS Jakarta setelah kebakaran Agustus 2026, dan implementasi AI di Bandung (masih rencana per Mei 2026 [26]): tidak terverifikasi.
- Nama Wakil Kepala Dishub DKI: ejaannya tidak konsisten di sumber, jadi jangan disebut.
- "Kamera dipasang 20–50 m sebelum simpang." Hanya satu sumber lemah [22].

## 4. Saran visual akurat (untuk animasi 3D)

- **Kepala lampu APILL Indonesia:** tiga lampu vertikal (merah atas, kuning tengah, hijau bawah), rumah lampu hitam atau gelap, dipasang di tiang lengan (overhang) atau tiang tegak. Banyak simpang punya timer hitung mundur digital. Jangan tampilkan lampu horizontal ala Jepang sebagai standar Indonesia.
- **Loop detector:** garis potongan gergaji tipis berbentuk persegi atau persegi panjang di permukaan aspal, per lajur, dekat garis henti. SCOOT memakai loop di tengah ruas sebelum simpang [11]. Di bawahnya ada beberapa lilitan kawat. Kabel lead-in menuju lemari kontroler. Animasikan medan magnet sebagai elips di atas loop yang "terganggu" saat mobil masuk.
- **Lemari kontroler:** kotak logam abu-abu di trotoar dekat simpang. Data ke pusat lewat kabel atau jaringan. Surabaya memakai perangkat jaringan Telkom berbentuk kotak [25].
- **Kamera:** kamera di tiang atau lengan tiang yang menghadap kaki simpang. Overlay video analytics (kotak deteksi per kendaraan, label motor, mobil, bus, truk, dan panjang antrean per lajur) masuk akal dan sesuai klaim Dishub [15][18]. Wajib menampilkan banyak motor (lalu lintas campuran Indonesia).
- **Radar:** kotak kecil datar di tiang, opsional.
- **Pusat kendali:** ruangan dengan video wall CCTV, peta jaringan simpang, dan operator. Jakarta: NOC/command center. Surabaya: SITS Bratang. Jangan gambarkan robot atau AI humanoid.
- **Diagram yang benar:**
  - Siklus sebagai lingkaran atau bar yang terbagi ke fase (split).
  - Offset sebagai pergeseran bar antara simpang A, B, dan C.
  - Green wave sebagai diagram jarak-waktu dengan "pita hijau" miring.
  - Split adaptif: lengan simpang dengan antrean panjang mendapat bar hijau yang lebih lebar.
- **Skala:** satu simpang punya 3–4 kaki. "Ribuan kendaraan" sebaiknya divisualkan sebagai jaringan banyak simpang yang terhubung ke pusat, bukan satu lampu yang mengatur ribuan mobil sekaligus.
- **Momen gagal sebagai payoff jujur:** layar pusat mati, lalu petugas Dishub berompi mengatur manual di simpang [21][25].
