# Asset Candidates — Cara Kerja Tanggul Laut Raksasa

> Dicari via `audira_search_assets` (2026-11-27). Katalog punya `sea-wall-run`, `groyne-run`, batu pantai, ruko, dan karakter nelayan ber-rig. Tidak ada tetrapod, tiang pancang, pintu badai, atau mangrove: itu dibuat procedural/2D.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Penampang tanggul, muka laut naik vs tanah amblas, dua penggaris | `sea-wall-run-91e459` / building, `two-storey-shophouse-183790` / building | Penggaris + chip "hitungan sendiri" di HUD 2D |
| c01_intro | Peta Pantura generik, garis rencana tanggul | — | Peta 2D tanpa logo lembaga; HUD "±575 km (per Okt 2026)", "Perpres 77/2025" |
| c02 | Gelombang, pasang, tanah memadat, sumur pompa | `large-coastal-boulder-a2cab1` / prop, `fisherman-in-waders-6dc25e` / character (Idle/Walk), `wide-shophouse-089f20` / building | Karakter tanpa wajah nyata; HUD "> 5 cm/thn Jakarta Utara" |
| c03 | Cutaway tanggul urugan + tetrapod; dinding beton di atas tiang pancang | `large-coastal-boulder-a2cab1` / prop, `small-rock-457be8` / prop, `groyne-run-971623` / building | Tetrapod & tiang pancang procedural (bukan kubus polos); HUD "Ø1,2 m · 27 m" |
| c04 | Tumpukan balok "rumus tinggi tanggul" | `sea-wall-run-91e459` / building | Balok berlabel lebih jelas di 2D/HUD |
| c05 | Timelapse tanggul ikut turun, air melimpas, balok tambahan | `sea-wall-run-91e459` / building, `corner-shophouse-ad15c2` / building | HUD "laut global 3,6 mm/thn (2006–2015)" |
| c06 | Pintu badai melengkung menutup; peta Pantura dengan ikon mangrove & tiang | — | Pintu badai procedural generik (tanpa logo); ikon lucide |
| c07_payoff | Pesisir utuh: mangrove, tanggul, kota, pipa air bersih | `sea-wall-run-91e459` / building, `three-storey-shophouse-2f6378` / building | Mangrove procedural; outro card `audira-outro-card.svg` |

Saran engine: hybrid — penampang/cutaway tanggul, rumus tinggi, dan grafik laju paling terbaca di 2D (SATELLITEBRIEFING/infografis), sementara diorama pesisir 3D (BUILDFORGE/SCALEFORGE) bagus untuk timelapse tanggul ikut amblas; bila satu engine, 3D BUILDFORGE dengan HUD 2D tebal, karena GLB tanggul/kota tersedia tapi tetrapod dan pintu badai harus dibuat procedural.
