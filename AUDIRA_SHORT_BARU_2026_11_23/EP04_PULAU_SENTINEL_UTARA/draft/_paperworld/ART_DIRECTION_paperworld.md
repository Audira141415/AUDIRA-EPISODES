# ART DIRECTION — EP04 Pulau Sentinel Utara

Style: PAPERWORLD
Engine: Remotion 2D murni (SVG + DOM berlapis, tanpa R3F). Kit PAPERWORLD dipakai sebagai resep material & mood
(Hukum Mutlak 5), bukan set desa kertas bawaannya.

## Bahasa visual
- Diorama potongan kertas berlapis (pop-up book): tiap bentuk = kartu kertas dengan tepi potongan lebih pucat
  (paper edge 3–5 px), bayangan jatuh lembut (drop shadow 6–14 px, arah kiri-atas → kanan-bawah), tekstur serat
  (noise SVG seeded, statis — tidak berubah per frame).
- Lapisan: BG (langit kertas bergradasi + matahari kertas), MG (laut berlapis 3–4 strip gelombang, pulau, karang),
  FG (dedaunan/semak kertas di tepi bawah, kano, figur), HUD (kartu data kertas + selotip), subtitle karaoke.
- Figur manusia: siluet kertas gelap TANPA wajah, dengan lipatan (crease) dan tepi potong. Tidak ada foto/wajah nyata.
- Kekerasan tidak ditampilkan. Kasus 2018 = perahu kecil kertas yang memudar di luar cincin 5 km.

## Palet (hangat pastel, dari tokens PAPERWORLD)
- Langit: ivory #F6EBD9 → peach #F4C9A8; senja payoff: coral #E9806A → gold #F2B75B
- Laut: cobalt #2F6FA3, teal #3FA7A0, mint #8FD3C1 (busa ivory #FFF6E6)
- Pulau/hutan: hutan tua #2E6B4F, daun #4E9A62, mint terang #9ED39A, pasir #EBCB93
- Aksen: coral #E2574C (larangan/cap), gold #E8A93A (angka), brown #7A5236 (kayu/kano), besi #6E6A66
- Teks: tinta #2A211B di kartu ivory; teks putih hanya di plate gelap.

## Tipografi
- Judul/angka: Anton (public/fonts/Anton-Regular.ttf); label: Space Grotesk; subtitle karaoke: Manrope 800.
- Label ≥ 40 px (final 1080), semua di x 60–1020, tidak di 380 px bawah dan 180 px atas.

## Kamera
- Kamera 2D kontinu: tiap adegan punya satu gerak termotivasi (push-in, pan lateral, crane turun, parallax).
  Lapisan bergerak dengan kecepatan berbeda (BG 0.2, MG 0.5, FG 1.0) supaya kedalaman terbaca.
- Objek pembawa lintas adegan: garis gelombang laut + pulau yang sama (bentuk konsisten) agar transisi menyambung.

## Mood per babak
Hook misterius pagi berkabut → konteks cerah peta → kehidupan hutan hijau → bangkai kapal karat → arsip sepia
1880/1991 → tsunami biru gelap + helikopter → senja coral cincin larangan → outro emas hening.
