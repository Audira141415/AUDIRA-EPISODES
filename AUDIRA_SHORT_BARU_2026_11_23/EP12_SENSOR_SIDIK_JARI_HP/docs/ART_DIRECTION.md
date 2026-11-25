# ART DIRECTION — EP12 Cara Kerja Sensor Sidik Jari di HP

Style: BONGKAR
Engine: Remotion 2D murni (SVG/DOM berlapis, tanpa R3F). Desain di koordinat 1080×1920, wrapper `scale(width/1080)`.

## Konsep
Satu HP di studio terang dibongkar jadi lapisan berlabel (exploded view isometrik 2D). Tiap babak membuka lapisan berbeda: tombol Home (kapasitif), tumpukan kaca–OLED–sensor optik, tumpukan kaca–OLED–sensor ultrasonik, lalu chip Secure Enclave di papan. Objek pembawa lintas adegan: HP yang sama + sidik jari yang sama (pola whorl prosedural seeded).

## Palet (dari kit BONGKAR)
| Peran | HEX |
|---|---|
| Latar studio atas → bawah | `#eceef0` → `#dddbd6` |
| Tinta / teks utama | `#1e1f22` |
| Chip label | `#1b1b1c` teks `#ffffff` |
| Aksen merah (titik label, wordmark) | `#c0141c` |
| Energi / sinyal / cahaya | `#ef9420` |
| Logam terang / gelap | `#bfc2c6` / `#80858b` |
| Kaca | `#cfe3ee` @ 55% + highlight putih |
| OLED | `#15171c` + piksel `#3ad0ff` |
| Kulit jari | `#e9b796` / ridge `#b9785a` |

## Material 2D
- Tiap lapisan = paralelogram isometrik (muka atas + sisi tebal lebih gelap) + bayangan kontak blur `rgba(30,25,20,.22)`.
- Logam: gradien linear 4 stop (terang–gelap–terang) = kesan pantulan. Kaca: gradien biru pucat transparan + garis kilau diagonal.
- Seluruh frame: vignette lembut + grain halus feTurbulence seeded statis (tanpa Math.random).

## Tipografi
Plus Jakarta Sans 800 (judul, angka penghitung), 700 (chip label), 800 (karaoke). Label ≥ 40 px, area x 60–1020, tidak di 180 px atas / 380 px bawah.

## Kamera & gerak
Dolly/zoom kontinu per adegan (scale 1.0→1.08, drift 20–40 px), bagian terangkat satu per satu dengan ease-out expo `cubic-bezier(0.16,1,0.3,1)`, chip label pop spring (damping 13, stiffness 190). Transisi silang 0,35 dtk antar adegan + whoosh.

## Safe zone
Top 180 px (wordmark kecil di y 190–250), bottom 380 px kosong; karaoke plate y 1410–1530.
