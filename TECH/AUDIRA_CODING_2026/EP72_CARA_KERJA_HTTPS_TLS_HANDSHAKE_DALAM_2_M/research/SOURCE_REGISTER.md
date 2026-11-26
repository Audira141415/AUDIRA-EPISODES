# Source Register — Cara Kerja HTTPS: TLS Handshake dalam 2 Menit

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | TLS 1.3 diterbitkan Agustus 2018 sebagai RFC 8446; ClientHello/ServerHello dengan ekstensi key_share (ECDHE); pesan handshake setelah ServerHello dienkripsi; Finished = MAC atas seluruh handshake; cipher suite RSA statis dan DH statis dihapus sehingga semua pertukaran kunci memberi forward secrecy; mode 0-RTT ditambahkan dengan jaminan keamanan lebih lemah | RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3, E. Rescorla (Mozilla), IETF, 2018 | https://www.rfc-editor.org/rfc/rfc8446 | 2026-11-25 | HIGH |
| 2 | TLS 1.0 dan TLS 1.1 dinyatakan usang dan tidak boleh dipakai (Maret 2021) | RFC 8996: Deprecating TLS 1.0 and TLS 1.1, IETF, 2021 | https://datatracker.ietf.org/doc/html/rfc8996 | 2026-11-25 | HIGH |
| 3 | Sertifikat default Let's Encrypt berlaku 90 hari; sertifikat dipercaya browser karena rantai ke root CA tepercaya | Let's Encrypt FAQ, Internet Security Research Group, 2026 (halaman hidup) | https://letsencrypt.org/docs/faq/ | 2026-11-25 | HIGH |
| 4 | TLS mengamankan koneksi lewat kerahasiaan, integritas, autentikasi; handshake menyepakati versi, cipher suite, autentikasi server, dan kunci rahasia; TLS 1.3 versi terkini | Transport Layer Security (TLS), MDN Web Docs, Mozilla, 2026 (halaman hidup) | https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security | 2026-11-25 | MEDIUM |
| 5 | Handshake TLS 1.2 butuh dua round-trip, TLS 1.3 satu round-trip (1-RTT); 0-RTT rentan replay; TLS 1.3 tanpa RSA, memakai DH | A Detailed Look at RFC 8446 (a.k.a. TLS 1.3), Nick Sullivan, Cloudflare Blog, 10 Agustus 2018 | https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/ | 2026-11-25 | MEDIUM |
| 6 | Rincian byte-per-byte handshake TLS 1.3 dengan X25519 (curve25519) sebagai pertukaran kunci contoh | The Illustrated TLS 1.3 Connection, Michael Driscoll (xargs.org), 2018 | https://tls13.xargs.org/ | 2026-11-25 | MEDIUM |
