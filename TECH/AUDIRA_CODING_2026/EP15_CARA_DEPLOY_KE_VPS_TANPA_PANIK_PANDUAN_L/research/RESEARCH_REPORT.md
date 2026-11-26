# Research Report — Cara Deploy ke VPS Tanpa Panik: Panduan Lengkap Nginx + SSL

Tanggal riset: 2026-11-25. Semua sumber dibaca langsung (curl) dari dokumentasi resmi.

## Sumber utama
- Let's Encrypt: FAQ, Challenge Types, About, pengumuman 45 hari (register #1, #2, #5, #10)
- EFF Certbot User Guide (#3, #4)
- nginx.org: Configuring HTTPS servers, Command-line parameters (#6, #7)
- Manual Ubuntu Noble: ufw(8), sshd_config(5) (#8, #9)
- IETF RFC 8555 (#11)
- W3Techs, DigitalOcean (#12, #13, MEDIUM)

## Fakta terverifikasi
1. Sertifikat Let's Encrypt default berlaku 90 hari (#1).
2. Let's Encrypt memangkas masa berlaku jadi 45 hari paling lambat 2028; profil opt-in 45 hari sudah ada sejak 13 Mei 2026 (#2).
3. Certbot ≥ 4.0.0 memperbarui otomatis saat sisa umur < 1/3 (untuk 90 hari ≈ 30 hari tersisa); sebelum 4.0.0 ambangnya tetap 30 hari (#3).
4. Certbot punya plugin Nginx yang memasang sertifikat langsung ke konfigurasi Nginx (#4).
5. Verifikasi HTTP-01 hanya lewat port 80, jadi port 80 wajib terbuka saat menerbitkan/memperbarui sertifikat dengan metode ini (#5).
6. HTTPS di Nginx = blok server dengan `listen 443 ssl` (#6).
7. `nginx -t` mengecek sintaks konfigurasi; `nginx -s reload` memuat ulang konfigurasi (#7).
8. UFW, begitu diaktifkan, menolak semua koneksi masuk secara default; port SSH (22) harus diizinkan dulu (#8). Konsekuensi logis: aktifkan tanpa `ufw allow 22` = sesi SSH berikutnya terkunci.
9. OpenSSH mengizinkan login password secara bawaan (`PasswordAuthentication yes`); disarankan dimatikan setelah login kunci SSH berhasil (#9).
10. Let's Encrypt gratis, otomatis, dikelola nonprofit ISRG (#10); protokolnya ACME, RFC 8555 tahun 2019 (#11).
11. Nginx dipakai 29,7% situs yang web server-nya diketahui, per 25 November 2026 (#12, angka berubah harian).

## Perselisihan / Kontroversi
- **Koreksi judul**: "Panduan Lengkap" dan hook "Dari zero sampai production dalam satu video" tidak akurat untuk short 85 dtk. Video hanya bisa memberi peta 5 langkah (SSH kunci, firewall, Nginx, sertifikat, perpanjangan otomatis), bukan tutorial lengkap baris per baris. Judul tidak diubah; naskah memposisikan diri sebagai "peta lima langkah", caption sebaiknya menyebut itu.
- **"SSL"**: istilah populer; protokol yang dipakai sekarang adalah TLS. Naskah memakai "gembok HTTPS"/"sertifikat", tidak mengklaim versi SSL.
- **Reload vs restart**: `nginx -s reload` dengan konfigurasi rusak biasanya menolak konfigurasi baru dan worker lama tetap jalan; jadi naskah tidak mengklaim "situs langsung mati", hanya menyarankan `nginx -t` sebelum reload.
- **45 hari**: masih opt-in per 2026-11-25; wajib menyeluruh paling lambat 2028. Naskah menyebut "paling lambat 2028".
- **Rule 15**: logo Nginx, Let's Encrypt, Ubuntu, DigitalOcean adalah logo organisasi nyata — tampilkan nama sebagai name plate teks saja. Tanpa wajah orang.

## Angka kunci untuk HUD
| angka/tahun/nama | konteks | # sumber |
|---|---|---|
| 22 | port SSH yang dibuka sebelum UFW aktif | #8 |
| 80 | port HTTP + satu-satunya port tantangan HTTP-01 | #5 |
| 443 | `listen 443 ssl` HTTPS Nginx | #6 |
| `nginx -t` | uji sintaks sebelum reload | #7 |
| 90 hari | masa berlaku sertifikat default | #1 |
| 1/3 | ambang perpanjangan otomatis Certbot ≥ 4.0 | #3 |
| 45 hari / 2028 | masa berlaku baru, paling lambat 2028 | #2 |
| 29,7% | pangsa Nginx per 25 Nov 2026 (opsional, tidak di VO) | #12 |

## Poin kunci
- Hook paling kuat: "terkunci di luar server sendiri" (UFW tanpa port 22) — rasa takut yang nyata bagi pemula.
- Twist berita: umur sertifikat jadi 45 hari, perpanjangan manual makin tidak realistis.
- Visual 5 lapis (kunci, pagar, penjaga pintu, gembok, jam) mudah dibaca tanpa suara.
- Topik semi-awet: langkahnya awet, angka 45 hari/2028 dan versi Certbot perlu dicek ulang sebelum produksi.
