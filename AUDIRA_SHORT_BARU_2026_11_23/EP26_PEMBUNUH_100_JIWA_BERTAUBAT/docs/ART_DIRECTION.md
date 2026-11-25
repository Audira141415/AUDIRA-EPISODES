# ART DIRECTION — EP26 Lelaki Pembunuh 100 Jiwa yang Bertaubat

Style: PAPERLANTERN (Paper-cut Lightbox, `adrisepta:paper-lantern`)
Engine: Remotion 2D (SVG/CSS), 1080×1920 @ 60 (preview 540×960 @ 30)

## Look
Lampu kertas berlapis (6–9 lembar) yang menyala dari belakang, full-bleed. Tiap lembar satu warna datar + serat kertas (feTurbulence seeded), rim cahaya hangat di tepi atas, pita gelap di tepi bawah, bayangan lembut ke lapisan di belakangnya. Lapisan belakang terang dan tembus cahaya, depan hampir hitam.

## Tangga warna per tempat
| Tempat | Langit | Jauh | Tengah | Depan | Cahaya |
|---|---|---|---|---|---|
| Hook / 100 manik | `#0a0d24` | `#3b3f6e` | `#1a1c3c` | `#05060f` | bara `#ffb862` meredup |
| Negeri asal (buruk) | `#2a0f12` | `#7a3a2e` | `#4a1c18` | `#120607` | lentera `#ff9a4a` |
| Pondok rahib | `#1b1426` | `#5d4a6e` | `#2f2440` | `#0b0812` | satu lentera `#ffc070` |
| Ruang orang alim | `#2a1c0e` | `#a8743a` | `#5e3c1c` | `#170d05` | lampu hangat `#ffd38a` |
| Jalan malam | `#060b22` | `#6a86c2` | `#3f5a92` | `#0e1532` | lentera lelaki `#ffb862` |
| Negeri orang saleh | `#04131c` | `#5f8c94` | `#2c5260` | `#071a20` | jendela emas `#ffd27a` |
| Fajar payoff | `#2b1d4e` → `#f2b86a` | `#c58a6a` | `#5a3a5e` | `#140c1e` | emas `#ffe2a0` |

Aksen tunggal: emas rahmat `#ffd27a`. Aksen kedua (dua sisi): biru azab `#7fb4ff`.

## Adab
Tanpa kekerasan, darah, senjata, atau jenazah. Malaikat hanya cahaya (bola/aura emas dan biru, titik putih penengah), tanpa sayap atau wujud. Lelaki, rahib, dan orang alim = siluet kertas kecil tanpa wajah. Chip pojok: "ILUSTRASI · MALAIKAT DIGAMBARKAN SEBAGAI CAHAYA".

## Tipografi
- Judul/strip kertas: Cormorant Garamond 600–700, warna krem `#f6ead2` di strip kertas gelap, atau tinta `#1c1208` di strip krem.
- Caption karaoke: Manrope 700, plat gelap lebar penuh, kata aktif emas, gap 0.4em, di y ±1180–1500 (di atas zona 380 px bawah).
- Arab: Amiri, rtl, hanya frasa QS 39:53 dan بِشِبْرٍ.

## Safe zone
Atas 180 px, bawah 380 px. Strip teks x 60–1020.

## Gerak
Kertas di tongkat: geser, putar di pivot, skala satu sumbu, menyala. Easing out-expo `cubic-bezier(0.16,1,0.3,1)`, keluar in-expo. Motion vocabulary: #001 pop-in (strip), #045 wipe (cap TIDAK), parallax lapisan (travelling alongside), light-on stagger 0,4 dtk. Kamera = pan/push pelan kontinu pada tumpukan lapisan (parallax per kedalaman).
