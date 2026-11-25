# ART_DIRECTION — EP58 Mongolia, Kuda Lebih Banyak dari Manusia

Style: POLYVERSE (ganti dari WORLDFORGE 2026-11-24, G21: juri 3.33 dua ronde)
Engine: Remotion + React Three Fiber (3D), 1080×1920 @60 (draf 540×960 @30)
Nada: ringan dan kagum. Dunia low-poly faset (flat-shaded), langit pastel fajar/senja, matahari samping rendah, kawanan kuda bergerak.

## Dunia
Satu stepa Mongolia kontinu: bukit landai bergelombang (heightfield fbm), rumput hijau-keemasan, gunung jauh berkabut. Lokasi berbeda di dunia yang sama menjadi set tiap babak (bukan satu objek sepanjang film).

## Palet
- Rumput musim panas: #7f9a48 → #b8a85a (keemasan di puncak bukit)
- Salju musim dingin: #e8eef5, bayangan #8fa3bf
- Langit: zenith #4f86c6, horizon #d9e4ea; senja #f2b36b
- Ger (rumah bundar): kain putih krem #efe6d6, pintu merah-oranye #c2462e, tali #6b4a2f
- Aksen HUD: emas #f2c14e, merah Mongolia #c4272f, biru #1e5aa8; kartu rgba(20,14,12,0.82)

## Material (POLYVERSE)
Semua permukaan meshStandardMaterial flatShading: terrain faset, kuda faset, ger faset, debu dodecahedron faset. Tanpa grain/bevel. Roughness 0.8–0.9, metalness ≤ 0.05.

## Cahaya
Langit pastel dalam (zenith #3F4F98 → lila → peach di horizon), exposure 0.82, env 0.25. Matahari hangat #ffbf8a rendah (elevasi 18–28°) dari samping kamera untuk siluet + bayangan panjang kuda. Kabut eksponensial memisahkan BG gunung. Musim dingin: cahaya biru pucat, exposure turun, salju turun (billboard di FX_LAYER).

## Subjek
Kuda GLB ber-rig (horse-base, wild-horse, saddled-horse, corralero-horse, draft-horse) dengan animasi Walk/Idle/Run yang diputar deterministik per frame. Figur manusia = ToyPerson generik tanpa wajah orang nyata. Joki anak: helm + rompi warna cerah, tanpa adegan jatuh. Genghis Khan tidak digambarkan wajahnya: name card + siluet prajurit generik.

## HUD (Kinetic Callout)
Kartu data di tengah/atas (y 236–1100). Angka utama besar (≥ 120 px), label ≥ 36 px. Subtitle karaoke di y=1300, bawah 380 px bersih. Brand AUDIRA muncul di dunia: papan kayu "AUDIRA" di garis finish Naadam.

## Kamera
Flythrough kontinu: crane rendah melintasi rumput → drone tinggi → tracking samping kawanan → orbit pelan di ger → tracking balapan → push-in ke kepala kuda → crane naik ke senja.
