# Art Direction: EP12 Bradbury Terakhir Berdiri 2002

Style: PIXELSTORY
engine: remotion (2D, pixel-art 2.5D)

## Gagasan visual
Lomba eliminasi sebagai gim 16-bit: lima pemain, yang tetap berdiri menang. Nyawa Bradbury hampir habis dua kali (paha, leher) sebelum level final.

## Look
Kit `studio/src/kits/pixelstory`, 8 px layar per 1 px art. Dunia es dingin, berbeda dari lapangan hangat EP01. Dither hanya di langit dan gradasi cahaya; bentuk lain bersih dengan pool cahaya tegas.

## Material
1. Es: biru pucat, guratan pisau, pantulan lampu, bayangan skater.
2. Pembatas berbantalan: biru tua, kap putih, panel AUDIRA.
3. Baju skating licin: highlight garis, bayangan tegas.
4. Pisau skate: logam putih dengan kilat 1 px.
5. Film rontgen: kaca gelap, tulang putih kebiruan, lampu belakang.
6. Papan strategi: putih kusam, garis spidol.

## Palet
Es `#DCEBF5`, es bayang `#7FA3C4`, malam `#0B1626`, hijau Bradbury `#1FB56B`, emas Bradbury `#F2C230`, lawan merah `#D02A30`, biru `#2A6BD0`, ungu `#7A4FC0`, jingga `#E2762A`, medali `#E9B347`. Bradbury selalu hijau-emas. Tidak ada lambang negara.

## Tipografi
Judul Anton, label Silkscreen minimal 36 px, karaoke sans 56 px satu baris maksimal 24 karakter. HUD mulai y 280. Maksimal judul + 1 chip per frame.

## Cahaya per babak
Hook/final: lampu putih dingin + rim emas. Montreal: spot merah. Rumah sakit: hijau pucat. Latihan: satu lampu redup. Rontgen: lightbox. Salt Lake: senja ungu-jingga. Strategi: lampu hangat. Podium: spot emas. Semua sprite rim 1 px.

## Penggambaran
Sprite generik tanpa wajah, kartu nama untuk tokoh nyata. Luka tanpa darah muncrat (bar nyawa, papan jahitan). Tanpa logo Olimpiade, tanpa tahun luka paha, tanpa waktu finis, tanpa nama yang jatuh di semifinal. Subjek aksi minimal 35% tinggi; kaki maksimal y 1290; FG dikunci di y 1530.

## Brand
AUDIRA di panel pembatas, signature seed `olahraga-EP12`, VO outro, kartu outro SPORTFACTS.
