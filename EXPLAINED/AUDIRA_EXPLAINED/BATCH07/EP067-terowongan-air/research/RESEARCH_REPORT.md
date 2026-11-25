# RESEARCH_REPORT — AE-067 Bagaimana Terowongan Air Membawa Air Antarwilayah?

Tanggal: 2026-11-23. Nomor [#] merujuk `SOURCE_REGISTER.md`.

## Koreksi ide bank

Ide "terowongan air bekerja tanpa pompa, hanya gravitasi" **benar sebagian, perlu dipersempit**:
- Benar untuk banyak sistem: sistem air New York mengalirkan 97% airnya ke rumah hanya dengan gravitasi, cuma 3% dipompa [#1].
- Tapi "gravitasi" tidak berarti air selalu mengalir di saluran setengah penuh. Ada dua jenis:
  1. **Saluran gravitasi bebas (open-channel / free-flow)**: terowongan tidak penuh, ada permukaan air dan udara di atasnya, air turun mengikuti kemiringan dasar. Contoh pengendali banjir: Terowongan Nanjung dan Sodetan Ciliwung memindahkan air dari sungai yang meluap ke alur lain [#8, #10].
  2. **Terowongan bertekanan (pressure tunnel / headrace)**: penuh air, tanpa permukaan udara. Tekanannya berasal dari selisih tinggi muka air waduk di hulu (tetap gravitasi, bukan pompa). Pada PLTA, urutannya: waduk/intake → headrace tunnel → surge tank → penstock → turbin → tailrace [#14, #15].
- Ada sistem yang **memakai pompa**: Snowy Mountains Scheme punya 2 stasiun pompa [#7]; sisa 3% air NYC dipompa [#1]. Jadi jangan klaim "semua terowongan air tanpa pompa".
- "Lapisan beton menahan bocor": lapisan (lining) beton memang umum, tapi **tetap bisa bocor**. Delaware Aqueduct bocor sampai 36 juta galon/hari sejak 1988 dan perlu terowongan bypass baru [#6].

## Mekanisme inti (urutan)

1. Air ditampung di tempat tinggi (waduk atau sungai di hulu).
2. Mulut terowongan (intake/inlet) dengan saringan sampah dan pintu air mengatur air masuk.
3. Terowongan dibor menembus bukit atau di bawah kota, dilapisi beton supaya dinding batu tidak runtuh dan rembesan berkurang.
4. Air bergerak karena hulu lebih tinggi dari hilir: di saluran bebas lewat kemiringan dasar, di terowongan bertekanan lewat beda tinggi muka air (tekanan hidrostatis).
5. (PLTA) Sebelum turbin ada surge tank: sumur tegak tempat air "naik-turun" saat katup ditutup atau dibuka mendadak, supaya lonjakan tekanan (water hammer) tidak merusak pipa [#15].
6. (PLTA) Penstock, pipa baja/beton curam, membawa air bertekanan tinggi ke turbin [#14].
7. Air keluar (outlet/tailrace) ke sungai, kanal, atau waduk berikutnya, lalu dibagikan lewat jaringan.

## Fakta paling menarik (aman dipakai)

1. 97% air New York sampai ke keran warga hanya dengan gravitasi, 3% saja dipompa [#1] (sumber resmi NYC DEP).
2. Delaware Aqueduct: terowongan 137 km, dibangun 1939–1945, membawa sekitar separuh air minum New York [#3, #4] (Wikipedia; sebut "sekitar").
3. Terowongan beton pun bisa bocor: Delaware Aqueduct kehilangan hingga 36 juta galon air per hari, sampai dibuatkan terowongan pintas 4 km di bawah Sungai Hudson [#6].
4. Sodetan Ciliwung: terowongan 1.268 m dengan dua pipa berdiameter 3,5 m, bisa mengalihkan sekitar 60 m³ air banjir per detik ke Kanal Banjir Timur [#10, #11] (HIGH untuk debit).
5. Terowongan Nanjung: dua terowongan 230 m berdiameter 8 m memotong batuan Curug Jompong di Citarum; genangan banjir turun dari 490 ha ke 80 ha menurut pemerintah [#8, #9].

## JANGAN DIKLAIM

- "Semua / setiap terowongan air bekerja tanpa pompa." Pakai "banyak". Snowy Mountains dan sebagian air NYC memakai pompa.
- "Lapisan beton membuat terowongan tidak bisa bocor." Delaware Aqueduct bukti sebaliknya.
- "Delaware Aqueduct terowongan terpanjang di dunia" sebagai fakta mutlak: hanya Wikipedia, tanpa konfirmasi kedua. Bila dipakai, tulis "salah satu terowongan terpanjang".
- Angka Snowy Mountains (7 vs 9 pembangkit, 145 km vs 225 km): tidak konsisten di sumber. Bila disebut, pakai "sekitar 145 km terowongan" dan "air jatuh 800 meter".
- Panjang headrace PLTA Indonesia (Asahan 3, Jatigede, dll.): tidak terverifikasi.
- Klaim "Sodetan Ciliwung / Nanjung menyalurkan air minum": keduanya pengendali banjir, bukan suplai air baku.
- Menyebut Sodetan/Nanjung sebagai terowongan bertekanan: tidak ada sumber; anggap saluran pengalih banjir gravitasi.
- Debit Delaware dalam m³/detik: tidak ada sumber langsung; bila perlu, sebut "sekitar separuh air New York per hari".

## Saran visual akurat (3D)

- **Penampang terowongan**: lingkaran (atau tapal kuda) dengan cincin lining beton abu-abu tebal, batuan cokelat/abu kasar di luarnya. Bukan kubus atau kotak.
- **Saluran bebas vs bertekanan**: dua irisan berdampingan. Kiri: air biru setengah penuh, permukaan beriak, ruang udara di atas. Kanan: penuh air sampai atap, panah tekanan ke dinding.
- **Profil memanjang (side section) PLTA**: waduk tinggi di kiri → intake dengan trash rack → terowongan landai panjang menembus bukit → surge tank (silinder tegak menjulang ke permukaan bukit, muka air di dalam naik-turun) → penstock (pipa baja gelap besar menurun curam di lereng, ada blok angkur beton) → rumah pembangkit dengan turbin → tailrace ke sungai.
- **Sodetan Ciliwung**: dua pipa sejajar diameter 3,5 m di bawah jalan kota, inlet di Sungai Ciliwung (Bidara Cina), outlet di Kanal Banjir Timur/Kali Cipinang. Mesin bor terowongan (TBM) berbentuk silinder dengan kepala potong berputar.
- **Nanjung**: dua mulut terowongan besar (8 m) berdampingan di tebing batu tepi Sungai Citarum, air cokelat sungai mengalir masuk.
- **Delaware Aqueduct**: garis terowongan dalam di bawah lembah dan Sungai Hudson; bypass 4 km melengkung di bawah sungai, dua shaft tegak (210 m dan 270 m) di kedua sisi.
- Air sungai/banjir Indonesia berwarna cokelat keruh, air waduk hijau-biru; jangan gambarkan air banjir biru jernih.
- Label brand AUDIRA bisa diletakkan di papan nama portal terowongan atau panel kontrol pintu air.
