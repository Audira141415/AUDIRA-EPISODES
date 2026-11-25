# Source Register — Cara Kerja DNS: Dari Domain ke IP dalam 60 Detik

> Standar EP01 Makkah: minimum 5 sumber, ≥ 3 HIGH. Pipeline guard blokir jika < 5 sumber.

| # | Fakta | Sumber (judul, penulis, tahun) | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | DNS terdiri dari resolver dan name server; resolver menyimpan jawaban di cache selama TTL agar tidak bertanya ulang | RFC 1034 Domain Names – Concepts and Facilities, P. Mockapetris (IETF), 1987 | https://www.rfc-editor.org/rfc/rfc1034.txt | 2026-11-25 | HIGH |
| 2 | DNS memakai port 53 (UDP dan TCP); pesan UDP dibatasi 512 oktet; TTL adalah bilangan 32-bit | RFC 1035 Domain Names – Implementation and Specification, P. Mockapetris (IETF), 1987 | https://www.rfc-editor.org/rfc/rfc1035.txt | 2026-11-25 | HIGH |
| 3 | DNS diusulkan November 1983 untuk menggantikan tabel HOSTS.TXT yang diambil dari SRI-NIC | RFC 882 Domain Names – Concepts and Facilities, P. Mockapetris (IETF), 1983 | https://www.rfc-editor.org/rfc/rfc882.txt | 2026-11-25 | HIGH |
| 4 | Ada 13 root name server (a sampai m.root-servers.net) yang dioperasikan 12 organisasi independen | Root Servers, IANA, 2026 | https://www.iana.org/domains/root/servers | 2026-11-25 | HIGH |
| 5 | Daftar TLD resmi berisi 1.435 TLD (versi 2026112302, diperbarui 24 Nov 2026) | List of Top-Level Domains, IANA, 2026 | https://data.iana.org/TLD/tlds-alpha-by-domain.txt | 2026-11-25 | HIGH |
| 6 | Root server tersebar via anycast; hitungan situs berstatus operational di peta = 2.029 instance per 2026-11-25 | root-servers.org, Root Server Technical Operations Association, 2026 | https://root-servers.org/ | 2026-11-25 | HIGH |
| 7 | Jumlah 13 alamat root dipilih karena batas ukuran paket UDP; 1.954 instance per 5 Des 2025 | Root name server, Wikipedia, 2026 | https://en.wikipedia.org/wiki/Root_name_server | 2026-11-25 | MEDIUM |
| 8 | Paul Mockapetris mengusulkan arsitektur DNS tahun 1983 di USC Information Sciences Institute dan menulis implementasi pertama (Jeeves) | Paul Mockapetris, Wikipedia, 2026 | https://en.wikipedia.org/wiki/Paul_Mockapetris | 2026-11-25 | MEDIUM |
| 9 | Resolver publik 1.1.1.1 (diluncurkan 1 April 2018) rata-rata sekitar 14 ms secara global (klaim vendor) | Announcing 1.1.1.1: the fastest, privacy-first consumer DNS service, Cloudflare Blog, 2018 | https://blog.cloudflare.com/announcing-1111/ | 2026-11-25 | MEDIUM |
