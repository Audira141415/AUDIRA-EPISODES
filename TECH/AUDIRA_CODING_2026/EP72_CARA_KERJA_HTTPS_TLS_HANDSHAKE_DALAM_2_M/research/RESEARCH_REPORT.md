# Research Report — Cara Kerja HTTPS: TLS Handshake dalam 2 Menit

Riset 2026-11-25. Rujukan nomor = # di `SOURCE_REGISTER.md`.

## Sumber utama

- RFC 8446 (#1) sebagai spesifikasi primer; RFC 8996 (#2) untuk status versi lama; Let's Encrypt FAQ (#3) untuk umur sertifikat; MDN (#4), Cloudflare (#5), xargs.org (#6) sebagai penjelasan pendukung.

## Fakta terverifikasi

1. TLS 1.3 diterbitkan sebagai RFC 8446 pada Agustus 2018 (#1, #5).
2. Handshake dimulai ClientHello (versi, cipher suite, key_share ECDHE) lalu ServerHello (cipher terpilih + key_share server). Kedua pihak menurunkan rahasia bersama tanpa pernah mengirimnya (#1).
3. Semua pesan handshake setelah ServerHello terenkripsi, termasuk sertifikat (#1).
4. Server mengautentikasi diri lewat sertifikat; browser memercayainya lewat rantai ke root CA tepercaya (#3, #4).
5. Finished adalah MAC atas seluruh handshake; modifikasi di tengah jalan membuat verifikasi gagal dan koneksi putus (#1).
6. TLS 1.2 butuh dua round-trip, TLS 1.3 satu (#5).
7. RSA statis dan DH statis dihapus di TLS 1.3, semua pertukaran kunci memberi forward secrecy (#1, #5).
8. TLS 1.0 dan 1.1 dinyatakan usang pada 2021 (#2).
9. Sertifikat default Let's Encrypt berlaku 90 hari (#3).

## Perselisihan / Kontroversi

- Judul "dalam 2 Menit" kurang tepat: handshake sendiri selesai dalam satu round-trip (milidetik). Angka "2 menit" hanya durasi video; video short ini 80–90 dtk. Saran: abaikan kata "2 Menit" di materi sosial atau tulis "dalam 90 detik". Judul di TOPIC.md tidak diubah.
- Hook awal "Setiap HTTPS request kamu trigger ini" tidak akurat: handshake terjadi per koneksi baru, bukan per request; koneksi dipakai ulang atau dilanjutkan (resumption/PSK, #1). Naskah memakai "sebelum halaman ini terbuka".
- 0-RTT punya risiko replay (#1, #5); tidak dinarasikan di short ini.
- Penyederhanaan: ClientHello "separuh kunci" = key share Diffie-Hellman; analogi, bukan istilah teknis tepat.

## Angka kunci untuk HUD

| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| Agustus 2018 | Terbit TLS 1.3 (RFC 8446) | 1, 5 |
| 2 -> 1 round-trip | TLS 1.2 vs 1.3 | 5 |
| 90 hari | Umur default sertifikat Let's Encrypt (per 2026-11-25) | 3 |
| Maret 2021 | TLS 1.0/1.1 usang (RFC 8996) | 2 |
| ClientHello, ServerHello, Finished | Nama pesan handshake | 1 |

## Poin kunci

- Rahasia bersama dihitung, tidak dikirim.
- Sertifikat membuktikan identitas server; Finished membuktikan tidak ada yang mengubah percakapan.
- TLS 1.3: lebih cepat (1-RTT) dan forward secrecy wajib.
- Risiko konten rendah; tanpa logo organisasi (CA digambar generik) dan tanpa wajah orang.
