# Art Direction — EP02 MASJIDIL HARAM MELUAS (URBANFORGE)

**Konsep:** "Halaman yang terus tumbuh." Sebuah maket arsitektur putih Masjidil Haram berdiri di plinth hitam di ruang pamer gelap. Setiap era adalah massa plester tersendiri; warna tidak pernah dicat, hanya diproyeksikan sebagai cahaya (aturan kit: *model is matter, data is light*). Waktu dibaca sebagai warna cahaya: amber hangat (era tertua) → cyan dingin (era terbaru).

**Palet**
- Plester `#E8E5DE` / plester hangat `#EEE9DF` (serambi, bukit), rumah tanah liat `#D9CDB8`, pasir halaman `#D8D0C0`, marmer mataf `#F4F2EC`, inti lantai gelap `#2B2B2F`, plinth `#121317`, ruang `#0A0A0C`.
- Ramp era (cahaya): `#FFB347` Umar · `#FFD166` Abbasiyah · `#F6E7A6` Utsmani · `#9FF3E6` Saudi I · `#5FE3F0` Fahd · `#36C8FF` Perluasan III.
- Aksen data: cyan banjir/wadi/pendingin `#43C6FF` / `#7FE9FF`; kebakaran `#FF6A3D` (hanya cahaya, tanpa api); kartu sunyi netral `#C9C4B8`.
- Ka'bah: kiswah hitam dengan anyaman geometris samar, pita emas berpola belah ketupat (tanpa tulisan), pintu emas di sisi timur laut, bingkai Hajar Aswad di sudut timur, Hijr Ismail di sisi barat laut, Maqam Ibrahim di depan pintu. Tidak pernah rusak dan tidak pernah menjadi properti main-main.

**Cahaya:** matahari hangat rendah `#FFD6A0` (elevasi ±23°, intensitas 3,6) yang menyapu pelan sepanjang film (azimut ±20°), hemisfer 0,26, fill dingin 0,32, `environmentIntensity` 0,3, exposure 0,84, profil `APPLE_STUDIO_CLEAN`, AO aktif (parameter fix di motion memory URBANFORGE). Fog `#0A0A0C` 38–85 untuk kedalaman.

**Detail dekat (perbaikan dari cover):** serambi dengan fasad lengkung runcing (ExtrudeGeometry berlubang), tiang marmer di garis tengah, pilar penopang Utsmani, kubah di atas drum dengan finial emas, lampu di tepi halaman; menara Saudi dengan dasar bujur sangkar, batang oktagonal, dua balkon berpagar, lentera, kerucut, dan finial; menara Abbasiyah yang lebih ramping. Ka'bah difilmkan besar dalam shot dekat (±22–30% tinggi frame).

**Manusia:** hanya titik cahaya kecil tanpa wajah (tawaf berlawanan arah jarum jam, sa'i dua arah, barisan di atap, eskalator, jembatan). Tidak ada nabi, malaikat, atau figur dalam bentuk apa pun.

**Tipografi:** Anton (judul kartu bab, kartu akhir short) dan Space Grotesk (data, caption, label museum 3D). Font OFL dibundel di `project/public/fonts`.

**Kamera:** satu lintasan kontinu (spline Hermite) yang menempel pada kata: dekat dan rendah untuk detail, crane ke denah untuk skala, dari puncak Abu Qubais untuk sudut pandang al-Mahdi. Format 16:9 memakai FormatFov plus tarik mundur hingga 1,55× untuk shot dekat agar subjek tidak terpotong.

**Nada untuk kontroversi:** Bab 6 (crane 2015) dan Bab 7 (pembongkaran riwaq) memakai kartu abu-abu netral, tanpa warna tragedi, tanpa visual runtuh atau korban, dan kedua sisi disebut.
