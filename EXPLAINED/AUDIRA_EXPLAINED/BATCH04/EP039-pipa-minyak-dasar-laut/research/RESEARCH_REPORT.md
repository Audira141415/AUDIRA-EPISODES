# RESEARCH_REPORT — AE-039 "Bagaimana Minyak Bisa Mengalir Melalui Pipa di Dasar Laut?"

Tanggal riset: 2026-11-08. Nomor [#] merujuk ke baris di `SOURCE_REGISTER.md`.

## Koreksi terhadap ide awal bank

- "Pompa bertekanan": benar untuk pipa minyak dari platform ke darat [4]. Gas didorong kompresor [4]. Di level sumur, aliran juga bergantung pada tekanan reservoir (tidak diverifikasi rinci, jangan dijabarkan).
- "Insulasi/pemanas agar tidak membentuk lilin": benar, tapi masalahnya dua: **lilin (wax)** dan **hidrat** (kristal es berisi gas) [7][8]. Pemanas listrik DEH dan insulasi dipakai untuk keduanya [11][13].
- "Minyak tidak membeku": kurang tepat. Minyak tidak membeku seperti air; yang terjadi lilin mengendap di dinding dan, di bawah titik tuang, minyak bisa mengental seperti gel. Pakai "mengental" atau "berlilin", bukan "membeku".
- "Pig ikut terbawa aliran": benar [15].
- **Penting**: banyak pipa bawah laut membawa gas atau campuran minyak-gas-air, bukan minyak murni [3][25]. Contoh Indonesia (PHE ONWJ) membawa minyak dan gas sekaligus.

## Mekanisme inti (urutan)

1. **Dari sumur, cairan keluar panas.** Campuran minyak, gas, dan air dari reservoir mengalir lewat flowline ke platform [2][3].
2. **Pompa di platform mendorong minyak ke darat.** Pada pipa ekspor platform ke darat, seluruh kenaikan tekanan dibuat pompa pengiriman minyak; gas didorong kompresor [4]. Tekanan internal pipa bisa sekitar 100 bar [5].
3. **Laut dalam itu dingin.** Air laut dalam sekitar 0–3 °C (praktik industri menyebut ~4 °C) [1]. Dinding pipa terus menyerap panas ke laut.
4. **Dua musuh muncul saat dingin.** Di bawah Wax Appearance Temperature, lilin parafin mengkristal dan menempel di dinding, mempersempit pipa [7]. Bila ada air dan gas pada tekanan tinggi, hidrat terbentuk dan bisa menyumbat total [8].
5. **Jaga suhu: insulasi.** Wet insulation (lapisan polypropylene/syntactic foam di luar pipa) atau pipe-in-pipe (pipa dalam pipa dengan isolasi di celahnya) memperlambat hilangnya panas [11].
6. **Bila perlu, panaskan atau beri kimia.** DEH mengalirkan listrik lewat dinding baja pipa agar pipa memanaskan dirinya sendiri [13]. Inhibitor kimia (metanol, MEG) disuntik untuk menggeser batas pembentukan hidrat; ada juga kimia anti-lilin [14].
7. **Bersihkan dan periksa dengan pig.** Pig dimasukkan di launcher, didorong aliran sampai receiver, tanpa menghentikan produksi [15]. Cleaning pig mengikis lilin; smart pig membawa sensor (mis. MFL) untuk mendeteksi korosi dan penyok [16][17][18].
8. **Kulit pipa melindungi dari laut.** Lapisan anti-korosi + anoda korban (aluminium/seng) + selimut beton pemberat agar pipa tidak mengapung dan tahan benturan [21][22].

## Fakta menarik yang aman dipakai di naskah

1. Air di dasar laut dalam hanya sekitar 0–3 °C, hampir sedingin kulkas, dan suhunya seragam [1].
2. Saat crude mendingin, lilin di dalamnya mengkristal dan menempel di dinding pipa, mirip lilin yang mengeras [7].
3. Ada pipa yang bisa memanaskan dirinya sendiri: listrik dialirkan langsung lewat dinding bajanya (DEH) [13].
4. "Pig" adalah alat yang ditembakkan ke dalam pipa dan didorong aliran minyak itu sendiri. Ada yang mengikis lilin, ada yang membawa sensor seperti "dokter" pipa [15][16][18].
5. Indonesia: PHE ONWJ di Laut Jawa merampungkan 3 jalur pipa bawah laut sepanjang 21,24 km pada semester I 2026, menyalurkan 3.895 barel minyak per hari dan 6,9 MMSCFD gas [25].

## JANGAN DIKLAIM

- "Minyak membeku di dasar laut." Pakai "mengental / membentuk lilin".
- "Semua pipa bawah laut membawa minyak." Banyak yang membawa gas atau campuran [3].
- Suhu dasar laut Indonesia atau Laut Jawa "0–4 °C". Laut Jawa dangkal (rata-rata 46 m) [27], jadi jauh lebih hangat. Angka 0–3 °C hanya untuk laut dalam. Suhu laut dalam Indonesia: tidak terverifikasi [28].
- Angka WAT atau suhu hidrat tunggal yang berlaku umum. Tergantung jenis crude, tekanan, dan kadar air [7][10].
- "Pig = Pipeline Inspection Gauge" atau cerita babi berdecit sebagai fakta pasti. Etimologi diperdebatkan [19].
- Angka pemasaran vendor (konduktivitas 0,007 W/m·K, "best in the market") [12].
- Angka DEH "4 proyek, >100 km" (cuplikan makalah lama ~2006) [13].
- "Pompa di dasar laut mendorong minyak" sebagai hal umum. Sumber yang diverifikasi menyebut pompa di platform [4]. Pompa subsea memang ada di industri, tapi tidak diverifikasi di sesi ini.
- "Dinding dalam pipa selalu tanpa lapisan." Ada pipa lined/clad [23].
- Tekanan, diameter, panjang pipa ONWJ per jalur: tidak terverifikasi (berita hanya memberi total 21,24 km).

## Saran visual akurat (untuk animasi 3D)

- **Penampang pipa (dari dalam ke luar)**: baja abu-gelap (dinding tebal, puluhan mm) → lapisan anti-korosi tipis (epoxy, umumnya hitam/merah-coklat/hijau tergantung produk; aman pakai hitam atau abu) → selimut beton abu-kasar tebal (pipa pemberat) [1][21][22]. Untuk pipa terinsulasi laut dalam, beton bisa diganti lapisan insulasi tebal (polypropylene/syntactic foam, sering kuning/oranye/krem pada pipa nyata; warna tidak diverifikasi sumber, jadi bisa netral).
- **Pipe-in-pipe**: dua pipa baja konsentris, celah (annulus) berisi panel insulasi [11].
- **Anoda korban**: gelang (bracelet) logam abu-perak keperakan yang dipasang melingkar pipa berselang jarak, berbahan aluminium/seng [9][21]. Bentuk gelang bracelet adalah praktik umum; tidak ada kutipan bentuk dari sumber resmi, jadi gambarkan sederhana.
- **Lilin**: lapisan putih-krem lilin yang menebal di dinding dalam, mempersempit lubang [7]. Hidrat: kristal mirip es/salju putih yang menggumpal [8].
- **DEH**: kabel listrik menempel di sepanjang pipa, arus mengalir di dinding baja (visual: pendar hangat di dinding, bukan api) [13].
- **Pig**: silinder busa (foam) atau badan logam dengan cakram/cup poliuretan dan sikat; smart pig = beberapa modul berderet dengan cincin sensor. Pig pas memenuhi diameter dalam pipa dan bergerak didorong fluida di belakangnya [15][16][18].
- **Launcher/receiver**: tabung baja berdiameter lebih besar dari pipa, dengan pintu tutup bulat di ujung, menyempit ke diameter pipa; berada di platform atau fasilitas darat, bukan melayang di dasar laut [2].
- **Platform**: pompa di dek platform mendorong minyak ke pipa ekspor menuju darat [4].
- **Lingkungan**: laut dalam gelap-biru, pipa tergeletak di dasar atau di parit; di laut dangkal Indonesia, cahaya lebih terang. Jangan gambar es atau salju di luar pipa: air laut dalam dingin tapi tidak membeku [5].
- **Fluida**: campuran minyak coklat-hitam dengan gelembung gas; hindari menggambar "minyak murni bening".
