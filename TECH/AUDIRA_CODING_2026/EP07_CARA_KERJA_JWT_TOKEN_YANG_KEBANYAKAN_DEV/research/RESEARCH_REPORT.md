# Research Report — Cara Kerja JWT Token yang Kebanyakan Developer Salah Pahami

## Sumber utama
RFC 7519 (JWT, Mei 2015), RFC 7515 (JWS), RFC 7518 (JWA), RFC 8725 (BCP JWT, Februari 2020) sebagai HIGH. Artikel Tim McLean di blog Auth0 (2015) dan MDN sebagai MEDIUM. Detail di SOURCE_REGISTER.md.

## Fakta terverifikasi
1. JWT berisi klaim yang dibawa sebagai payload JWS atau plaintext JWE (#1). RFC 7519 terbit Mei 2015.
2. JWS Compact: header dan payload di-encode Base64url, dipisah titik (#4). Base64url bukan enkripsi; kerahasiaan hanya lewat JWE (#1).
3. Header "alg" menentukan algoritma; nilai "none" ada di spesifikasi untuk Unsecured JWT (#2, #5).
4. Beberapa library dulu menerima token alg=none sebagai valid (#6).
5. Serangan RSA/HMAC confusion: dipublikasikan Tim McLean, 2015 (#3, #6).
6. RFC 8725 (Februari 2020): aplikasi menentukan algoritma yang diizinkan, tiap kunci satu algoritma, seluruh JWT ditolak bila satu validasi gagal, validasi issuer, subject, audience (#3).
7. Klaim "exp": JWT tidak boleh diterima setelah waktu itu (#1).

## Perselisihan / Kontroversi
- Judul "kebanyakan developer salah paham" bersifat klaim umum, bukan statistik; naskah tidak memakai angka persentase.
- "JWT tidak aman" kurang tepat: JWT aman bila dipakai sesuai RFC 8725. Hook dikoreksi di naskah menjadi "bukan brankas" (tanpa mengubah judul).
- RFC 8725 sendiri mengakui "none" bisa dipakai bila JWT sudah dilindungi cara lain (mis. TLS). Naskah tidak menyebut "none" selalu salah.
- Tidak ada angka kerentanan/jumlah library yang dicatat (tidak terverifikasi).
- Revokasi token dan penyimpanan token (cookie vs localStorage) tidak dibahas karena tidak ada sumber yang dibaca.

## Angka kunci untuk HUD
| Angka/tahun/nama | Konteks | # sumber |
|---|---|---|
| RFC 7519 · Mei 2015 | standar JWT | 1 |
| 3 bagian | header, payload, signature | 4 |
| alg = none | token tanpa tanda tangan | 2, 6 |
| RS256 menjadi HS256 | serangan RSA/HMAC confusion | 3, 6 |
| Tim McLean · 2015 | penulis serangan | 3, 6 |
| RFC 8725 · Februari 2020 | praktik terbaik | 3 |

## Poin kunci
- Payload terbaca siapa pun; jangan taruh rahasia (pakai JWE bila perlu).
- Jangan percaya header alg; server tentukan algoritma.
- Validasi exp, issuer, audience; tolak total bila satu gagal.
