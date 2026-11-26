# Source Register — Cara Kerja JWT Token yang Kebanyakan Developer Salah Pahami

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | JWT = format klaim ringkas; payload JWS atau plaintext JWE; klaim bisa ditandatangani/MAC dan/atau dienkripsi; terbit Mei 2015; klaim "exp" MUST NOT diterima setelah kedaluwarsa | RFC 7519 JSON Web Token (JWT), M. Jones dkk., IETF, 2015 | https://www.rfc-editor.org/rfc/rfc7519.txt | 2026-11-25 | HIGH |
| 2 | Unsecured JWT memakai header {"alg":"none"} (bagian 6) | RFC 7519 bagian 6, IETF, 2015 | https://www.rfc-editor.org/rfc/rfc7519.txt | 2026-11-25 | HIGH |
| 3 | Praktik terbaik JWT, terbit Februari 2020: library harus verifikasi algoritma, tiap kunci satu algoritma, tolak JWT jika satu operasi kripto gagal, validasi issuer, subject, audience; serangan RSA/HMAC confusion diterbitkan Tim McLean | RFC 8725 JSON Web Token Best Current Practices, Sheffer dkk., IETF, 2020 | https://www.rfc-editor.org/rfc/rfc8725.txt | 2026-11-25 | HIGH |
| 4 | JWS: header dan payload di-encode Base64url, tiga bagian dipisah titik | RFC 7515 JSON Web Signature (JWS), IETF, 2015 | https://www.rfc-editor.org/rfc/rfc7515.txt | 2026-11-25 | HIGH |
| 5 | HS256 berstatus Required; ada bagian "Using the Algorithm none" | RFC 7518 JSON Web Algorithms (JWA), IETF, 2015 | https://www.rfc-editor.org/rfc/rfc7518.txt | 2026-11-25 | HIGH |
| 6 | Library JWT dulu menerima alg none sebagai token valid; serangan RSA/HMAC: penyerang pilih algoritma lewat header; ditulis Tim McLean, 2015 | Critical vulnerabilities in JSON Web Token libraries, Tim McLean (Auth0 blog), 2015 | https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/ | 2026-11-25 | MEDIUM |
| 7 | Skema autentikasi HTTP "Bearer" untuk header Authorization | HTTP authentication, MDN Web Docs, Mozilla | https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication | 2026-11-25 | MEDIUM |
