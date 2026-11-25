# ART DIRECTION — EP13 Cara Kerja PLTA (AUDIRA Explained)

Style: BLUEPRINT
Engine: Remotion 2D (SVG, kit `project/src/styles/blueprint/kit.tsx`), 1080×1920 @ 60 fps.

## Look
- Lembar gambar teknik biru (#0E3A6B, deep #07223F), grid 36/180 px, garis putih #EAF3FF menggambar diri (draw-on).
- Aksen: air = cyan #7FD8FF (partikel mengalir), listrik/energi = kuning #FFD447, angka besar/peringatan = merah #FF6A55.
- Font: BP Head (Space Grotesk) untuk judul, BP Mono (IBM Plex Mono) untuk label, dimensi, caption.
- Setiap adegan = satu "sheet" gambar teknik dengan kotak judul (title block) "AUDIRA ENGINEERING · DWG EP13-0N" (brand di dalam adegan).
- Kedalaman: BG grid + vignette biru tua → MG gambar teknik (penampang/isometri, arsir) → FG partikel air/elektron + callout → HUD kartu data → caption mono.

## Gerak
- Drift HALUS per adegan (push-in/pull-back), garis draw-on, label Typed, garis dimensi, partikel air dan elektron bergerak terus (tidak ada frame mati).
- Transisi: wipe "sheet baru" (lembar biru bergeser naik dengan garis potong cyan) di tiap pergantian babak.
- Callout kinetik untuk tiap angka: 3 BENDUNGAN, 362,4 m, ×2,7 MONAS, >95%, 500 kV, 8 TURBIN, 1.000 MW, 17–22 WIB.

## Safe zone
- Judul/HUD di y 180–700; gambar utama y 600–1300; caption mono top 1340 (berakhir < 1540, di atas zona 380 px bawah).

## Audio
- VO Cartesia (Audira, 85,59 dtk) = master clock. SFX prosedural: whoosh tiap potongan sheet, tik/pop saat label muncul, dengung turbin, zap listrik, riser + impact di payoff Cirata 1.000 MW. −20 LUFS, duck di bawah VO.
