# SOURCE_REGISTER — Cara Kerja Internet (EP31)

Tanggal baca semua sumber: 2026-11-19.

Singkatan sumber:
- **TL** = TeleGeography, Submarine Cable Map (2025) — https://www.submarinecablemap.com
- **IETF** = RFC 791 (IP), RFC 793 (TCP), IETF — https://www.rfc-editor.org
- **CL** = Cloudflare Learning Center — https://www.cloudflare.com/learning/
- **IANA** = IANA Root Servers — https://root-servers.org
- **GI** = Google Infrastructure (Peering & Cables) — https://cloud.google.com/about/locations

| # | Fakta (angka/tanggal/nama/klaim) | Sumber | URL | Tanggal baca | Level |
|---|---|---|---|---|---|
| 1 | 99% data antar-benua melewati kabel serat optik bawah laut, bukan satelit | TeleGeography 2025 | https://www.submarinecablemap.com | 2026-11-19 | HIGH |
| 2 | Total ~550 kabel bawah laut aktif dan terencana, panjang gabungan >1,4 juta km | TeleGeography 2025 | https://www.submarinecablemap.com | 2026-11-19 | HIGH |
| 3 | Cahaya di fiber optik merambat ~200.000 km/dtk (2/3 kecepatan cahaya di vakum) karena indeks bias kaca | Fisika optik standar, Hecht "Optics" | — | 2026-11-19 | HIGH |
| 4 | Paket IP dipecah maks 1500 byte (MTU Ethernet standar), dikirim terpisah, dirakit ulang di tujuan (RFC 791) | IETF RFC 791 | https://www.rfc-editor.org/rfc/rfc791 | 2026-11-19 | HIGH |
| 5 | DNS menerjemahkan nama domain ke alamat IP; 13 root server cluster (A–M) tersebar di 1700+ lokasi lewat anycast | IANA root-servers.org | https://root-servers.org | 2026-11-19 | HIGH |
| 6 | Rata-rata web request melewati 10–20 router (hop) sebelum sampai server tujuan | Traceroute empiris, Cloudflare | https://www.cloudflare.com/learning/network-layer/what-is-a-router/ | 2026-11-19 | MED |
| 7 | TCP three-way handshake (SYN → SYN-ACK → ACK) memastikan koneksi terjamin sebelum data dikirim (RFC 793) | IETF RFC 793 | https://www.rfc-editor.org/rfc/rfc793 | 2026-11-19 | HIGH |
| 8 | Latensi khas Jakarta–server AS: 150–250 ms round-trip, termasuk propagasi cahaya + processing router | Pengukuran empiris (ping, traceroute) | — | 2026-11-19 | MED |

## Perselisihan / Kontroversi
Tidak ada — mekanisme internet adalah fakta teknis terstandarisasi (IETF RFC).

## Musik/SFX (sumber + lisensi)
| Aset | Sumber | Lisensi/atribusi |
|---|---|---|
| SFX prosedural (whoosh, pop, riser) | npm run sfx (AUDIRA pipeline) | Dibuat sendiri |
