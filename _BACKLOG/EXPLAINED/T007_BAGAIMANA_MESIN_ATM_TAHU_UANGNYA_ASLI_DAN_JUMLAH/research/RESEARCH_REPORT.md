# Research Report — Bagaimana Mesin ATM Tahu Uangnya Asli dan Jumlahnya Pas

> Riset backlog 2026-11-26 · channel EXPLAINED · 11 sumber (4 HIGH, 7 MEDIUM). Nomor [#] merujuk `SOURCE_REGISTER.md`.

## Sumber utama

- Bank Indonesia: infografis ciri keaslian rupiah [#1], halaman pencegahan uang palsu [#2], pengelolaan uang Rupiah [#3].
- European Central Bank: aturan cek keaslian dan kelayakan sebelum uang diedarkan ulang lewat ATM [#4] (pembanding internasional; aturan setara untuk Indonesia belum ditemukan di halaman publik BI).
- Paten mesin ATM (Diebold [#8], Shandong New Beiyang [#9]) untuk mekanisme deteksi uang rangkap.
- Wikipedia (Banknote processing, Currency detector, ATM, Currency-counting machine) [#5, #6, #7, #11] untuk mekanisme sensor umum.
- Halaman layanan bank nasional [#10] untuk contoh batas setor tunai.

## Fakta terverifikasi

1. Rupiah asli dikenali dengan 3D: dilihat, diraba, diterawang; sebagian cetakannya memendar di bawah sinar ultraviolet [#1].
2. Hanya Bank Indonesia yang berhak menentukan keaslian Rupiah; uang yang dinyatakan palsu tidak diganti [#2].
3. Pemberantasan uang palsu dikoordinasikan Botasupal (BIN, Polri, Kejaksaan Agung, Kemenkeu, BI) sesuai UU 7/2011 [#2].
4. BI memusnahkan uang tidak layak edar dengan Mesin Sortasi Uang Kertas (MSUK) / Mesin Racik Uang Kertas [#3].
5. Di zona euro, uang yang dikeluarkan lewat ATM wajib sudah lolos cek mesin yang diuji bank sentral (sejak 1 Januari 2011) [#4].
6. Mesin sortir menarik uang satu per satu, mengecek nominal, keaslian, dan kelayakan; kecepatan hingga 40 lembar/detik (generasi 1985), kini hingga 44 lembar/detik [#5].
7. Uang yang tidak terverifikasi asli, atau yang tertarik lebih dari satu lembar sekaligus, dibuang ke kantong tolak untuk dicek manual [#5].
8. Sensor validator: kamera/optik (pola cetak), UV (pendaran), magnetik (partikel tinta feromagnetik), dan ketebalan/ukuran lewat rol [#6, #11].
9. Mesin hitung menghitung uang dari berapa kali berkas cahaya terputus [#11].
10. Di dalam ATM ada detektor uang rangkap setelah roda penarik; lembar rangkap dialihkan, tidak diserahkan ke nasabah [#8]; deteksi rangkap umumnya berdasar ketebalan (elemen Hall/ultrasonik) [#9].
11. Uang di ATM disimpan dalam kaset di brankas; kaset dapat mewarnai uang bila dibuka paksa [#7].
12. Uang palsu pernah keluar dari ATM (dikonfirmasi kepolisian federal Jerman) [#7].
13. Contoh satu bank: ATM setor tunai menerima pecahan 50 ribu dan 100 ribu, maksimal 100 lembar per transaksi, per 2026-11-26 [#10].

## Perselisihan / Kontroversi

- **Koreksi hook TOPIC.md.** Hook "sensor yang menghitung lembar uang lebih teliti dari kasir" tidak bisa diverifikasi sebagai perbandingan dan menyesatkan soal keaslian. Fakta: ATM tarik tunai terutama memastikan *jumlah* (deteksi uang rangkap lewat ketebalan [#8, #9]); pengecekan *keaslian* terutama terjadi sebelum uang diisi (mesin sortir di bank/pusat kas [#5, #4]) dan di ATM setor tunai (validator [#6]). Hook baru di SCRIPT: "Uang yang keluar dari ATM sudah diperiksa mesin, bahkan sebelum masuk ke ATM."
- **Judul "tahu uangnya asli"** perlu dinarasikan hati-hati: mesin tidak memberi putusan hukum; BI satu-satunya yang berhak menentukan keaslian [#2]; uang palsu pernah lolos ATM di luar negeri [#7]. Naskah memasukkan nuansa ini.
- **Aturan Indonesia setara ECB** (wajib cek mesin sebelum isi ATM) belum ditemukan di halaman publik BI yang dibuka. Naskah tidak mengklaim aturan itu untuk Indonesia; hanya menyebut "diperiksa mesin" secara umum. Cek PBI/PADG pengelolaan uang Rupiah sebelum produksi bila ingin menyebut kewajiban.
- **Tinta magnetik**: sumber [#6] bersifat umum ("many countries"); BI tidak menyebut tinta magnetik di infografis publik [#1] dan komposisi fitur mesin dirahasiakan [#5]. Naskah memakai "di banyak negara", bukan klaim untuk rupiah.
- **40 lembar/detik** adalah kecepatan mesin sortir pusat kas [#5], bukan kecepatan ATM.
- **Batas 100 lembar** berlaku untuk satu bank [#10]; bank lain bisa berbeda dan bisa berubah. Rule 15: jangan tampilkan nama/logo bank.

## Angka kunci untuk HUD

| Angka / tahun / nama | Konteks | # sumber |
|---|---|---|
| 40 lembar/detik | kecepatan mesin sortir (sejak 1985) | #5 |
| 11 m/s (±40 km/jam) | kecepatan lembar di mesin sortir berkecepatan tinggi (opsional) | #5 |
| 3D: Dilihat, Diraba, Diterawang | cara cek keaslian rupiah | #1 |
| UV | cetakan rupiah memendar di bawah ultraviolet | #1 |
| 100 lembar | maks setor tunai sekali transaksi, satu bank, per 2026-11-26 | #10 |
| ±0,11 mm | tebal uang dolar AS (opsional; tebal rupiah tidak terverifikasi) | #6 |
| UU No. 7/2011 | dasar hukum definisi uang palsu (opsional) | #2 |
| Bank Indonesia | satu-satunya penentu keaslian rupiah | #2 |

## Poin kunci

- Dua tahap: cek keaslian dan kelayakan sebelum uang diisi, lalu sensor jumlah di dalam ATM.
- "Jumlahnya pas" = detektor uang rangkap (ketebalan) + kotak tolak.
- "Asli" = sensor cahaya/UV/pola/magnet di mesin sortir dan ATM setor tunai.
- Mesin bukan hakim terakhir: BI yang menentukan; tetap biasakan 3D.
- Visual: mekanisme generik, uang kertas generik (bukan replika rupiah), tanpa logo bank/BI, tanpa wajah orang nyata (rule 15).
