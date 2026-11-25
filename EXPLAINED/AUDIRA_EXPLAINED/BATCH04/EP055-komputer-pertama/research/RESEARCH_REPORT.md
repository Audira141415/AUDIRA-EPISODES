# RESEARCH_REPORT — AE-055 "Bagaimana Komputer Pertama Bisa Melakukan Perhitungan?"

Tanggal riset: 2026-11-08. Nomor klaim [#] merujuk ke `SOURCE_REGISTER.md`.

## Koreksi penting terhadap ide bank

1. **ENIAC menghitung dalam desimal, bukan biner** [12, 13]. Setiap angka disimpan sebagai 10 digit desimal. Jangan menulis "angka biner 0 dan 1" untuk ENIAC. Tabung memang bekerja on/off, tetapi on/off itu dirangkai menjadi penghitung 10 posisi (0–9).
2. **"Komputer pertama" diperdebatkan.** Z3 (1941) elektromekanis [30], ABC tidak pernah andal [31], Colossus (1944) elektronik tapi khusus memecah sandi dan rahasia sampai 1970-an [27–29]. Sebut ENIAC sebagai "salah satu komputer elektronik pertama" atau "komputer elektronik serbaguna pertama yang dikenal publik".
3. **Pemrograman makan waktu berminggu-minggu, bukan hanya berhari-hari** [17]. Pakai "berhari-hari, bahkan berminggu-minggu".

## Mekanisme inti (berurutan)

1. **Saklar elektronik.** Tabung vakum mengatur aliran elektron, jadi bisa berfungsi sebagai saklar on/off tanpa bagian bergerak. Ia jauh lebih cepat dari relay mekanis [11, 15].
2. **Saklar dirangkai jadi penghitung desimal.** Setiap digit memakai ring counter 10 posisi. Hanya satu posisi yang "menyala" pada satu waktu, mirip roda angka 0–9 [13].
3. **Akumulator menyimpan dan menjumlah.** Ada 20 akumulator. Masing-masing menyimpan bilangan 10 digit dan bisa menambah atau mengurangi [12, 18].
4. **Menjumlah = menghitung pulsa.** Angka dikirim sebagai deret pulsa listrik. Ring counter maju satu posisi per pulsa. Saat lewat dari 9 ke 0, ia mengirim "simpan 1" (carry) ke digit berikutnya, seperti odometer [13].
5. **Unit khusus** untuk perkalian, pembagian, dan akar kuadrat. Unit siklus (clock 100 kHz) menyelaraskan semuanya. Kecepatan dasar 5.000 penjumlahan per detik [14, MED].
6. **Program = kabel dan saklar.** Urutan langkah ditentukan dengan memasang kabel patch antarpanel dan memutar ribuan saklar. Konstanta diatur di function table berisi saklar putar [16, 18].
7. **Data masuk dan keluar lewat kartu berlubang IBM** [19].
8. **Ganti soal = rakit ulang kabel.** Tidak ada program tersimpan. Untuk soal baru, programmer mencabut dan memasang ulang kabel, lalu menyetel saklar. Persiapan bisa makan berminggu-minggu [16, 17].

## Fakta paling menarik (aman untuk naskah)

1. **Sekitar 18.000 tabung vakum, berat sekitar 27 ton metrik (30 ton ukuran AS), daya 150 kW**, memenuhi satu ruangan besar dengan 40 panel berbentuk U [6–9].
2. **Memprogram berarti mencabut dan memasang kabel secara fisik** dan memutar saklar. Satu soal bisa butuh persiapan berminggu-minggu [16, 17].
3. **Programmer pertamanya enam perempuan**: Kathleen McNulty, Jean Jennings, Betty Snyder, Marlyn Wescoff, Frances Bilas, dan Ruth Lichterman. Nama mereka tidak disebut dalam publikasi 1946 [20, 21].
4. **Tabung putus kira-kira tiap satu atau dua hari.** Insinyur menjalankan tabung jauh di bawah batasnya agar awet, dan teknisi bisa menemukan tabung yang rusak dalam sekitar 15 menit [23–25].
5. **Dibuat untuk tabel tembakan artileri**, tetapi tugas besar pertamanya (Desember 1945) adalah perhitungan untuk proyek bom hidrogen [4, 5]. Diumumkan ke publik Februari 1946 [3].

Konteks pembanding (satu kalimat): Colossus di Inggris (1944) juga memakai ribuan tabung, tetapi dibuat khusus untuk memecah sandi Lorenz Jerman dan dirahasiakan puluhan tahun [27–29].

## JANGAN DIKLAIM

- "ENIAC komputer pertama di dunia" sebagai fakta mutlak.
- "ENIAC menghitung dengan angka biner 0 dan 1". Ini salah, karena ENIAC desimal.
- "Tepat 17.468 tabung" sebagai fakta pasti. Angka ini hanya dari Wikipedia, dan jumlahnya berubah selama masa pakai. Pakai "sekitar 18.000".
- Luas ruangan dalam meter persegi yang persis. Sumber saling beda (30×50 kaki, 20×40 kaki, 300 sq ft, >1.000 sq ft).
- "Lampu kota Philadelphia meredup saat ENIAC dinyalakan". Ini mitos populer yang tidak ditemukan di sumber tepercaya.
- "Colossus dibuat Alan Turing" atau "Colossus memecahkan Enigma". Keduanya salah: Colossus dirancang Tommy Flowers untuk sandi Lorenz.
- "ENIAC menghitung lebih banyak dari seluruh umat manusia" (anekdot, LOW).
- Biaya pembuatan (hanya Wikipedia).
- Kata "bug" berasal dari ENIAC. Bukan, tidak terkait.
- ENIAC "mengetik" atau "menampilkan layar". ENIAC tidak punya layar atau keyboard. Output berupa kartu berlubang dan lampu neon indikator.

## Saran visual akurat untuk animasi 3D

- **Bentuk ruang:** 40 panel logam hitam tinggi (~2,5 m) berderet bentuk huruf U, bukan satu lemari besar [1, 9, 10].
- **Panel akumulator:** bagian depan berisi deretan lampu neon kecil berwarna oranye kemerahan (tampilan digit 0–9 per kolom), banyak kenop atau saklar putar, dan soket colokan. Tabung vakum ada di rak dalam panel, berupa tabung kaca dengan filamen jingga redup.
- **Kabel patch:** kabel hitam tebal dengan colokan multipin yang menjuntai di antara panel. Ada juga "digit trays", yaitu baki logam bus angka di bagian bawah panel [1, 10]. Reveal: tangan mencabut dan memasang kabel ini.
- **Function table:** rak beroda terpisah penuh saklar putar 10 posisi, yang bisa didorong ke dekat panel [18].
- **Pembaca dan pelubang kartu IBM** di ujung deretan, dengan kartu kertas krem berlubang persegi panjang [19].
- **Visual mekanisme:** tunjukkan ring counter sebagai cincin 10 lampu dengan satu lampu menyala yang melompat per pulsa. Saat melewati 9, munculkan pulsa carry ke kolom berikutnya. Gunakan angka 0–9, jangan 0/1.
- **Orang:** perempuan dengan pakaian kerja kantor era 1940-an (blus, rok) memasang kabel dan memutar saklar. Teknisi pria mengganti tabung. Foto arsip menampilkan keduanya [1, 2].
- **Era:** lampu ruangan neon atau pijar 1940-an, lantai dan dinding polos. Hindari HUD futuristik pada mesinnya.
- **Colossus (bila muncul):** rak logam di Bletchley Park dengan pembaca pita kertas "bedstead" (rangka mirip tempat tidur dengan roda puli untuk loop pita) [11].

## Klaim gagal diverifikasi atau hanya satu sumber

- 17.468 tabung (hanya Wikipedia).
- 5.000 penjumlahan per detik (hanya Wikipedia; Britannica diblokir 403).
- Persiapan "berminggu-minggu" (hanya Wikipedia; Penn dan Stanford hanya menyebut "plugging cables and setting switches").
- Luas ruangan yang persis (sumber tidak konsisten).
