# Naskah — Cara Deploy ke VPS Tanpa Panik: Panduan Lengkap Nginx + SSL

> DRAF pra-produksi (backlog, 2026-11-25). Difinalkan di tahap 4 setelah style dipilih.
> Short: 190–210 kata @135–150 WPM.

## c00_hook — Hook

- Kata: **10** · estimasi **4 dtk**
- Visual: terminal hitam berkedip, satu perintah salah, lalu pintu baja server terbanting menutup dengan kursor terjebak di luar. HUD: "TERKUNCI".

> Satu perintah salah, dan kamu terkunci di luar servermu sendiri.

## c01_intro — Intro

- Kata: **28** · estimasi **12 dtk**
- Visual: rak server sewaan menyala sendirian di ruang gelap, kosong tanpa label; ikon gembok abu-abu belum terpasang.

> VPS itu komputer sewaan yang selalu nyala di internet. Masalahnya, waktu baru dibuat, dia masih polos. Belum ada web server, belum ada gembok HTTPS. Ini peta lima langkahnya.

## c02 — Kunci SSH

- Kata: **22** · estimasi **9 dtk**
- Visual: kunci fisik masuk ke lubang pintu server; papan password di sampingnya dicoret silang. HUD chip: "PasswordAuthentication = yes (bawaan)".

> Langkah satu, pintu masuk. Login lewat SSH pakai kunci, bukan password. Bawaannya, OpenSSH masih menerima password, jadi matikan setelah kuncimu terbukti jalan.

## c03 — Firewall UFW

- Kata: **26** · estimasi **11 dtk**
- Visual: pagar tumbuh mengelilingi server; satu gerbang bertanda 22 terbuka lebih dulu sebelum pagar dikunci. HUD callout besar: "PORT 22".

> Langkah dua, pagar. Begitu UFW dinyalakan, semua koneksi masuk ditolak. Jadi izinkan port 22 dulu, baru aktifkan. Kalau urutannya kebalik, itulah momen kamu terkunci di luar.

## c04 — Nginx

- Kata: **28** · estimasi **12 dtk**
- Visual: loket penjaga di depan gedung kota mini menerima paket dari dua jalur bertanda 80 dan 443, meneruskannya ke gedung aplikasi. Terminal kecil menampilkan `nginx -t` lalu centang hijau. Name plate teks "Nginx", tanpa logo.

> Langkah tiga, penjaga pintu. Nginx menerima tamu di port 80 dan 443, lalu meneruskannya ke aplikasimu. Sebelum reload, jalankan nginx minus t. Perintah ini mengecek konfigurasimu sebelum dipakai.

## c05 — Sertifikat Let's Encrypt

- Kata: **28** · estimasi **12 dtk**
- Visual: gembok emas terbang dari menara teks "Let's Encrypt" (name plate, tanpa logo) ke gerbang 80, lalu terpasang di jalur 443. HUD: "GRATIS · HTTP-01 · PORT 80".

> Langkah empat, gembok. Certbot meminta sertifikat gratis dari Let's Encrypt dan memasangnya langsung ke Nginx. Syaratnya, port 80 harus terbuka, karena verifikasi HTTP-01 cuma jalan di port itu.

## c06 — Perpanjangan otomatis

- Kata: **36** · estimasi **15 dtk**
- Visual: jam dinding raksasa dengan cincin hitung mundur 90 hari; di sepertiga terakhir cincin berubah hijau dan robot kecil mengganti gembok. Cincin lalu menyusut jadi 45. HUD: "90 HARI → 45 HARI · 2028".

> Langkah lima, yang paling sering dilupakan: perpanjangan. Sertifikat Let's Encrypt cuma berlaku 90 hari. Certbot memperbaruinya otomatis saat umurnya tinggal sepertiga. Dan paling lambat 2028, umurnya dipangkas jadi 45 hari. Perpanjangan manual makin tidak masuk akal.

## c07_payoff — Payoff + outro

- Kata: **28** · estimasi **12 dtk**
- Visual: kamera mundur, lima lapis menyatu: kunci, pagar, penjaga, gembok, jam; kota mini menyala aman di malam hari. Outro card AUDIRA.

> Kunci, pagar, penjaga, gembok, dan jam otomatis. Lima lapis ini yang bikin servermu aman ditinggal tidur. Simpan videonya buat deploy pertamamu, dan ikuti AUDIRA untuk cara kerja lainnya.

## Opsi hook lain

1. Sertifikat HTTPS gratismu cuma hidup 90 hari, dan sebentar lagi tinggal 45.
2. Deploy pertama jarang gagal karena kode. Biasanya karena lima langkah ini dilewati.

## Total

- **206 kata** ≈ **85 dtk** (82–92 dtk @135–150 WPM)
