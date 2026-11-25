# STYLE_DECISION — Owi/Butet emas Rio tepat 17 Agustus 2016 (`EP08`)

Style: PIXELSTORY

- **Tanggal:** `2026-11-23`
- **Engine:** Remotion 2D pixel-art 2.5D (kit PIXELSTORY, relight CPU), studio seri `AUDIRA_FAKTA_OLAHRAGA_2026/studio`, scene di `studio/src/scenes/ep08/` (basis kode EP01: arena.ts, sprites.ts, sets.ts, hud.tsx, timing.ts)
- **Style terpilih:** `PIXELSTORY` (dipilih AI, tanpa acc, aturan batch 2026-11-23)
- **Alasan (awam):** Game retro bulu tangkis sudah terbukti di EP01 (juri buta 4.0, gold). Reli ganda campuran 2v2 + papan skor 7-2 → 11-4 → 21-14 → 21-12 terbaca seperti "naik level". Beda look dari EP01: malam HUT RI, merah-putih, jam 23.57 WIB.
- **Alternatif ditolak:** `PANELVERSE` — cocok untuk drama komik, tapi kit belum punya prop olahraga (raket/kok/lapangan) dan belum pernah dipakai (risiko tinggi); `BROADCASTFORGE` — sudah dipakai EP03 seri ini, kurang emosional untuk momen kemerdekaan.
- **Cover referensi:** `F:/AUDIRA-ALL-SKILL/assets/style-covers/pixelstory.jpg`
- **Cover topik:** `cover-topic.png` (komposisi `Ep08Cover`) — BELUM dirender
- **approved:** `no` (tidak perlu acc; satu-satunya gerbang = render final)

## Wajib dari motion memory PIXELSTORY
- Stamp ≤ 860 px tanpa rotasi di adegan aksi; sprite wide shot scale ≥ 1.4; label ≥ 34 px (Chip min 40).
- Maks judul + 1 chip per frame; tiap beat beda set/sudut kamera; lantai wajib serat papan + dither.
- Chip seri hook turun ≥ 250 px; frame contact sheet ≥ 0,3 dtk dari cut (jendela Wipe ±0,24).
- NearLayer: kunci baris atas FG ke y 1530 agar bawah frame tidak gelap kosong (fix EP22).
- Dither hanya untuk gradasi langit/cahaya; tiap set ≥ 3 lapisan + rim light; hook harus menampilkan aksi utama VO.
- Tokoh nyata: sprite generik tanpa wajah + NameCard, tanpa kemiripan.

## Rencana set (storyboard kasar)
A Hook: ruang keluarga malam HUT RI (bendera/umbul-umbul), TV menyiarkan final, jam digital 23:57 → potong ke arena Rio (cover: 2 pemain Indonesia tampak belakang, Butet di net, Owi smash).
B Konteks: rak/papan medali 1992–2008 (5 emas) + slot London 2012 kosong/abu "0".
C Pengembangan: bracket Rio "0 GIM HILANG", semifinal vs unggulan 1 (NameCard Zhang/Zhao, sprite merah); pagi upacara bendera Kemenpora (sunrise, tiang bendera).
D Penjelasan: lapangan samping 2v2, papan skor 7-2, 11-4, 21-14; gim 2 10-12.
E Payoff: timer 45:00 match point 21-12 → "45 = 1945"; podium + bendera naik; stamp EMAS GANDA CAMPURAN PERTAMA; 7 ikon medali.
F Outro: dua plakat emas 1992 SUSY · 2016 LILIYANA, teaser EP09 bobsled Jamaika.
