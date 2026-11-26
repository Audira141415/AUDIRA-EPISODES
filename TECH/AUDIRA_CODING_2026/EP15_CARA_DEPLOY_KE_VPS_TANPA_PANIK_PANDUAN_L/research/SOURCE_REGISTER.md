# Source Register — Cara Deploy ke VPS Tanpa Panik: Panduan Lengkap Nginx + SSL

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | Sertifikat default Let's Encrypt berlaku 90 hari | FAQ, Let's Encrypt (ISRG), 2026 | https://letsencrypt.org/docs/faq/ | 2026-11-25 | HIGH |
| 2 | Masa berlaku sertifikat Let's Encrypt dipangkas dari 90 jadi 45 hari paling lambat 2028; profil opt-in `tlsserver` 45 hari mulai 13 Mei 2026 | Decreasing Certificate Lifetimes to 45 Days, Let's Encrypt, 2025 | https://letsencrypt.org/2025/12/02/from-90-to-45 | 2026-11-25 | HIGH |
| 3 | Sejak Certbot 4.0.0, `certbot renew` memperbarui sertifikat bila sisa umurnya < 1/3; sebelumnya ambang tetap 30 hari | User Guide — Renewing certificates, EFF Certbot, 2026 | https://eff-certbot.readthedocs.io/en/stable/using.html | 2026-11-25 | HIGH |
| 4 | Certbot punya plugin Nginx yang mengotomatiskan penerbitan dan pemasangan sertifikat di Nginx | User Guide — Getting certificates, EFF Certbot, 2026 | https://eff-certbot.readthedocs.io/en/stable/using.html | 2026-11-25 | HIGH |
| 5 | Tantangan HTTP-01 hanya bisa dilakukan di port 80 | Challenge Types, Let's Encrypt, 2026 | https://letsencrypt.org/docs/challenge-types/ | 2026-11-25 | HIGH |
| 6 | Server HTTPS Nginx dikonfigurasi dengan `listen 443 ssl` | Configuring HTTPS servers, nginx.org | https://nginx.org/en/docs/http/configuring_https_servers.html | 2026-11-25 | HIGH |
| 7 | `nginx -t` menguji sintaks file konfigurasi; `nginx -s reload` memuat ulang konfigurasi | Command-line parameters, nginx.org | https://nginx.org/en/docs/switches.html | 2026-11-25 | HIGH |
| 8 | Saat dipasang, UFW nonaktif dengan kebijakan default masuk = deny; contoh membuka SSH: `ufw allow 22` | ufw(8) manual page, Ubuntu Noble | https://manpages.ubuntu.com/manpages/noble/man8/ufw.8.html | 2026-11-25 | HIGH |
| 9 | `PasswordAuthentication` di sshd_config default-nya `yes` (login password aktif bawaan) | sshd_config(5) manual page, Ubuntu Noble (OpenSSH) | https://manpages.ubuntu.com/manpages/noble/man5/sshd_config.5.html | 2026-11-25 | HIGH |
| 10 | Let's Encrypt adalah CA gratis, otomatis, dan terbuka dari nonprofit ISRG | About, Let's Encrypt | https://letsencrypt.org/about/ | 2026-11-25 | HIGH |
| 11 | ACME (protokol yang dipakai Certbot/Let's Encrypt) distandarkan di RFC 8555, Maret 2019 | RFC 8555 ACME, Barnes dkk., IETF, 2019 | https://www.rfc-editor.org/rfc/rfc8555.html | 2026-11-25 | HIGH |
| 12 | Nginx dipakai 29,7% situs yang web server-nya diketahui (per 25 November 2026) | Usage statistics of Nginx, W3Techs, 2026 | https://w3techs.com/technologies/details/ws-nginx | 2026-11-25 | MEDIUM |
| 13 | Di Ubuntu, profil UFW `Nginx Full` membuka port 80 dan 443 (`sudo ufw allow 'Nginx Full'`) | How To Secure Nginx with Let's Encrypt on Ubuntu 22.04, DigitalOcean | https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04 | 2026-11-25 | MEDIUM |

## Level
- **HIGH**: dokumentasi resmi proyek/penerbit (Let's Encrypt, nginx.org, EFF Certbot, manual Ubuntu), standar IETF.
- **MEDIUM**: sekunder terpercaya (W3Techs, tutorial DigitalOcean).
- **LOW**: tidak dipakai.
