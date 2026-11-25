# STYLE DECISION — EP26 Lelaki Pembunuh 100 Jiwa yang Bertaubat

Style: PAPERLANTERN
Resep: `adrisepta:paper-lantern` (Paper-cut Lightbox) — `F:/AUDIRA-2D-SKILL-MOTION/library/adrisepta-styles/paper-lantern/STYLE.md`
Engine: Remotion 2D (React + SVG/CSS, tanpa R3F), skill `audira-2d-motion`
Tanggal: 2026-11-23
approved: yes (dipilih pengguna lewat gerbang style, 2026-11-23)

## Alasan
Kisah perjalanan malam dari negeri buruk ke negeri orang saleh paling kuat sebagai lampu kertas berlapis yang menyala dari belakang: tiap lapisan kertas = kedalaman, jendela negeri tujuan menyala satu per satu = harapan. Adab channel terjaga secara alami: malaikat cukup dua cahaya (emas = rahmat, biru dingin = azab) dan satu titik putih penengah; lelaki = siluet kertas tanpa wajah; angka 99/100 = manik/lubang cahaya yang meredup, tanpa kekerasan. Payoff "sejengkal" dibuat dengan dua negeri bergeser (mendekat/menjauh) dan penggaris cahaya.

## Alternatif yang ditolak
- HIKAYAT (wayang kelir) — siluet cocok, tapi bahasa visual wayang terasa Jawa untuk kisah Bani Israil. Tidak dipilih pengguna.
- Ink Wash — kontemplatif, tapi kontras rendah untuk teks dan callout angka di HP. Tidak dipilih pengguna.

## Aturan look (dari STYLE.md)
- Satu objek fisik: kotak berisi 6–9 lembar kertas potong, lampu hangat dari belakang; nilai terang di belakang, hampir hitam di depan (tangga nilai = kedalaman). Bayangan lembut antar lapisan selalu ada.
- Tiap lembar: satu warna datar, serat kertas, rim cahaya hangat di tepi atas, pita gelap di tepi bawah.
- Satu suhu per adegan; ganti tangga warna = ganti tempat (negeri asal: merah bata redup; jalan: biru malam; negeri saleh: hijau-teal dengan jendela emas; fajar payoff: violet → emas).
- Gerak seperti kertas di tongkat: geser, putar pada pivot, skala satu sumbu, menyala. Tanpa squash/morph.
- Cahaya = gerak besar: sumber menyala, lapisan menyusul (stagger 0,4 dtk), lalu jendela, lalu flicker `1 + .06·sin(7.3t)·sin(3.1t)`.
- Teks di gambar = strip kertas; kata yang tampil sebagai kertas tidak ikut caption ganda.

## Adab visual (wajib)
- Tanpa visual pembunuhan, senjata, darah, jenazah. Wafat = lentera siluet padam/terjatuh perlahan, siluet berbaring condong ke arah tujuan sangat kecil dan jauh.
- Malaikat hanya cahaya, tanpa sayap/wujud/wajah. Allah tidak digambarkan.
- Rahib dan orang alim = siluet kecil tanpa wajah (bukan nabi), tidak lucu/mengejek.
- Chip pojok: "ILUSTRASI · MALAIKAT DIGAMBARKAN SEBAGAI CAHAYA".

Cover referensi: `ref-paper-lantern.jpg`. Lembar opsi: `_style_options.jpg`. Cover topik: `cover-topic.png` (TaubatFinal frame 228, 2026-11-23).
