# RESEARCH_REPORT — AE-044 "Bagaimana eSIM Menggantikan Kartu SIM Fisik?"

Riset: 2026-11-08. Nomor [#] merujuk baris di `SOURCE_REGISTER.md`.

## Mekanisme inti (berurutan)

1. **Chipnya sudah ada sejak pabrik.** Di dalam ponsel ada chip eUICC (bukan slot kartu). Chip ini disolder ke papan sirkuit dan punya nomor identitas permanen bernama EID. [2][4]
2. **Chip ini kosong dari operator.** Chip belum berisi nomor. Isinya baru ditulis nanti berupa "profil", yaitu data SIM milik operator. [1][10]
3. **Operator menyiapkan profil di server.** Saat kamu membeli eSIM, operator memesan profil ke server SM-DP+. Server menyiapkan paket profil untuk nomor kamu. [6]
4. **QR code berisi alamat server dan kode pesanan.** Isinya teks seperti `LPA:1$alamat-server$kode-pesanan`. QR code tidak berisi nomor HP atau "SIM-nya" sendiri. Kodenya juga bisa dikirim lewat tautan, aplikasi operator, atau diketik manual. [7][8]
5. **Ponsel dan server saling memeriksa identitas.** Aplikasi pengelola eSIM di ponsel (LPA) menghubungi server. Chip dan server saling menunjukkan sertifikat digital yang berakar pada GSMA. [9]
6. **Profil dikirim dalam keadaan terenkripsi.** Paket profil hanya dibuka di dalam chip, jadi kunci rahasia jaringan tidak terbuka di jalan. [9]
7. **Profil diaktifkan.** Setelah terpasang, profil bekerja seperti SIM biasa: punya ICCID dan kunci autentikasi ke jaringan operator. [10]
8. **Satu chip, banyak profil.** Profil lain bisa ditambah, dimatikan, atau dihapus dari Pengaturan. Hanya 1–2 yang aktif bersamaan, tergantung ponsel. [11][12]

## Fakta paling menarik (aman dipakai di naskah)

- **QR code eSIM hanya berisi alamat server.** Isinya "alamat + kode pesanan". Ponsel lalu menjemput profilnya sendiri dari server operator lewat jalur terenkripsi. [7][9]
- **Satu chip bisa menyimpan banyak nomor.** Apple menyebut iPhone bisa menyimpan delapan eSIM atau lebih. Tapi hanya dua jalur yang aktif bersamaan. [11][12]
- **Di AS, iPhone sudah tanpa slot SIM.** Sejak iPhone 14 (2022), model AS tidak punya baki SIM. iPhone Air (2025) bahkan eSIM-only. Ruang slot dipakai untuk baterai dan bodi tipis. [14][15]
- **Indonesia punya aturan eSIM.** Permen Komdigi No. 7 Tahun 2025 terbit 11 April 2025. Pemerintah mengimbau migrasi ke eSIM, tapi tidak mewajibkan. [16][17]
- **Daftar eSIM baru kini pakai wajah.** Sejak 1 Juli 2026, pelanggan baru, termasuk pengguna eSIM, registrasi dengan biometrik wajah yang dicocokkan ke Dukcapil. Pelanggan lama tidak perlu registrasi ulang. [18]
- **QR Telkomsel hanya sekali pindai.** QR yang sudah terpasang di satu ponsel tidak bisa dipindai di ponsel lain. [20]

## JANGAN DIKLAIM

- "Semua ponsel bisa eSIM." Tidak benar: Menkomdigi sendiri bilang belum semua ponsel di Indonesia mendukung. Daftar perangkat berbeda per operator. XL juga mensyaratkan perangkat resmi, bukan black market. [17][20]
- "Semua operator mendukung semua ponsel." Dukungan berbeda per operator dan per model.
- "Pindah ke eSIM wajib." Migrasi hanya imbauan. Yang wajib sejak 1 Juli 2026 adalah registrasi biometrik untuk pelanggan baru. [17][18]
- "Pelanggan lama wajib registrasi ulang biometrik." Salah: aturan ini hanya untuk pelanggan baru. [18]
- "eSIM tidak bisa dibobol / 100% aman." Standar memakai autentikasi dua arah dan enkripsi. Penipuan seperti tukar SIM lewat rekayasa sosial tetap mungkin terjadi.
- "Semua profil aktif sekaligus." Hanya 1–2 profil aktif bersamaan. Dual SIM pada umumnya dual standby. [12]
- "QR code berisi nomor / data pribadi." QR berisi alamat server SM-DP+ dan kode pesanan. [7]
- "iPhone di Indonesia sudah eSIM-only." Tidak terverifikasi. Yang terverifikasi hanya model AS (iPhone 14 dan seterusnya) dan iPhone Air. [14][15]
- Angka "1,9 juta pengguna eSIM di Indonesia" dan "3,4 miliar perangkat eSIM global": belum terverifikasi. [22][23]
- Angka "maksimal 20 profil" sebagai angka pasti: bergantung model, hanya 1 sumber. [11]
- "Smartfren operator eSIM pertama di Indonesia" boleh disebut hanya dengan kata "salah satu pelopor". Isi artikel 2018–2019 tidak terbaca langsung. [21]
- Ukuran chip "6×5 mm" berlaku untuk bentuk MFF2 saja, dan hanya 1 sumber. Sebut "sebesar butir beras/kuku kelingking" tanpa angka, atau beri label "sekitar". [3]

## Saran visual akurat (untuk animasi 3D)

- **Chip eUICC:** kotak hitam kecil persegi panjang dengan kaki solder, menempel di papan sirkuit (PCB) di dekat modem. Visualnya bukan kartu emas berkontak 6–8 seperti SIM fisik. Tidak ada baki. Boleh tampilkan baki SIM lama "menghilang" sebagai kontras.
- **SIM fisik pembanding:** kartu nano-SIM (4FF) dengan pelat kontak emas, masuk ke baki logam berlubang ejector.
- **QR code:** QR biasa di layar atau kertas. Label animasi yang benar: `LPA:1$smdp.operator…$KODE`, ditampilkan sebagai "alamat server + kode pesanan". QR jangan digambarkan berisi nomor HP.
- **Server SM-DP+:** rak server operator atau pusat data. Dari server keluar "paket profil" yang terkunci (gembok) menuju ponsel.
- **Jabat tangan aman:** dua sertifikat (perisai berlogo generik) bertukar antara chip dan server sebelum paket dikirim. Gembok baru terbuka di dalam chip.
- **Banyak profil:** beberapa kartu digital ditumpuk di dalam chip. Hanya 1–2 yang menyala (aktif), sisanya redup. Jangan semua menyala.
- **Registrasi Indonesia:** ikon pemindaian wajah dicocokkan ke basis data kependudukan. Logo resmi Dukcapil atau Komdigi tidak perlu ditampilkan, karena berisiko dianggap meniru branding.
- **Logo operator:** hindari logo asli. Pakai "Operator A/B" atau warna netral.
- **Hindari:** antena atau gelombang yang "mengirim chip"; chip yang berubah bentuk jadi kartu; ponsel tanpa koneksi internet saat mengunduh profil. Unduhan profil butuh koneksi (Wi-Fi atau data), kecuali beberapa model iPhone eSIM-only di negara tertentu [8].
