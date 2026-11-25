# ART DIRECTION — EP05 PlayStation lahir dari pembatalan Nintendo

Style: ARCADECRT
Engine: HyperFrames 2D (canvas pixel art `project/world2d.js` + panel HTML + caption karaoke). Bukan Remotion, bukan three.js.

## Look
- Kisah konsol diceritakan seperti game 16-bit: dunia digambar di buffer 180×270 art px, tampil 8× (1 art px = 8 px layar), nearest-neighbour, tanpa anti-aliasing.
- Palet hangat terbatas (16 warna): ink #1A1020, ungu tua #2B1D3A, plum #4A2C4F, bata #8A3B3B, oranye #E07A3A, amber #F2B84B, krem #F6E7C1, teal #2F6F73, mint #6FC3A8, abu konsol #B8B0A8 / #D8D2C8 / #6B6470, merah #D94141, biru #4A6FB5, langit fajar #F08A5D, putih hangat #FFF6E8.
- Gradasi langit dan cahaya memakai Bayer 4×4 dither, bukan gradien halus.
- Lantai selalu bertekstur (papan, ubin, aspal) + dither (pelajaran memori EP01).
- Kamera: tiap scene punya pan/zoom sendiri (zoom 1,0–1,25), guncangan kecil di momen benturan. Transisi = disolusi Bayer 0,36 dtk di tiap potongan.
- Semua nilai fungsi murni dari t; tanpa Math.random.

## Tipografi
- Panel: kotak dialog RPG (biru malam, bingkai krem ganda, sudut berpiksel). Judul font Silkscreen, sub Pixelify Sans.
- Caption karaoke: Pixelify Sans 700, 60 px, outline ink, kata aktif amber, bounce ≤ 1,04, jarak kata ≥ 0,4 em.
- Teks di dunia: font piksel 3×5 buatan sendiri (papan nama, spanduk, neon).

## Layout 9:16
- Chip "ILUSTRASI, BUKAN CUPLIKAN ASLI" y 186.
- Panel y 236–±620. Subjek piksel di band 620–1250. Caption top 1300. 380 px bawah bebas teks.

## Aturan merek
Tanpa logo atau aset resmi Sony, Nintendo, Philips, PlayStation. Konsol, kotak, dan kontroler = desain generik buatan sendiri. Nama produk hanya teks polos. Tokoh nyata (Kutaragi, Yamauchi, Ohga) = siluet piksel generik + papan nama.

## Anti-reupload
`AudiraSignature` bergerak (shell `sig`), neon "AUDIRA TECH" di toko scene 7 dan papan di scene 8, VO menyebut "AUDIRA TECH" di outro, metadata kepemilikan di MP4.
