# Asset Candidates — Cara Kerja Gembok Pintu Digital dengan Sidik Jari

> Dicari via `audira_search_assets` (2026-11-26). Katalog punya daun pintu dan set pintu, tetapi tidak ada gagang kunci digital, sensor, jari/tangan close-up, chip, atau grendel: bagian itu dibuat 2D/procedural.

| Chapter | Kebutuhan visual | Kandidat aset (id/type) | Catatan |
|---|---|---|---|
| c00_hook | Ujung jari menempel ke sensor gagang pintu, garis runtuh jadi titik | `interior-door-leaf-a02f28` / prop | Jari dan sensor ilustrasi 2D; tanpa merek; label "FOTO" dicoret → "PETA TITIK" |
| c01_intro | Makro ridge/valley, penampang kulit, tarik mundur ke gagang pintu | `door-set-single-04e5f0` / building | Kontur jari 2D/procedural; HUD "Ridge · Valley" |
| c02 | Cutaway sensor kapasitif: kisi sel menyala/redup | — | Tidak ada GLB sensor/chip; grid sel 2D. HUD "Kapasitansi beda = pola" |
| c03 | Penanda minutiae (ujung, cabang) + panah arah di grid koordinat | — | Diagram 2D; HUD "Ridge ending", "Bifurcation", "ISO/IEC 19794-2" (teks saja, tanpa logo) |
| c04 | Dua peta titik ditumpuk, skor naik lewat ambang, solenoid menarik grendel | `door-set-single-swing-d50024` / prop | Mekanisme grendel cutaway 2D; pintu membuka pakai GLB |
| c05 | Laci arsip minutiae vs citra; grid 10.000 ikon; bar salah tolak | — | Infografis 2D; HUD "≤ 1 : 10.000", "< 5%", "NIST, Juli 2025" |
| c06 | Jari basah/berplester gagal; ikon PIN, kunci mekanis, port daya; baterai merah | `battery-bank-b4d362` / prop (opsional), `door-set-single-04e5f0` / building | Ikon lucide (KeyRound, Battery, Fingerprint); tanpa adegan membobol |
| c07_payoff | Titik melebur jadi garis lalu jari, pintu terbuka ke ruang hangat, outro | `interior-door-leaf-a02f28` / prop | Outro card `audira-outro-card.svg` |

Saran engine: 2D — inti cerita (kapasitansi, minutiae, pencocokan, peluang) berupa diagram dan transformasi titik yang lebih tajam di 2D (CIRCUITFORGE/BONGKAR); katalog GLB hanya punya pintu generik, tanpa gagang kunci, sensor, atau tangan close-up.
