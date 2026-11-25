# Art Direction — EP08 Owi/Butet, Kado Emas 17 Agustus 2016 (HD2D)

Style: HD2D

## Idea
Final ganda campuran Rio 2016 diceritakan seperti game bulu tangkis HD-2D: pemain adalah sprite piksel tanpa wajah yang berdiri sebagai slab di dalam diorama 3D miniatur yang di-light nyata (lampu arena, lampu meja, matahari pagi, kembang api). Delapan diorama, satu per babak, dan babak terakhir dimenangkan tiga menit sebelum 17 Agustus berganti. Kode: `studio/src/scenes/ep08hd/` (Remotion + R3F).

## Look
- **Stage:** arena final malam (A, D, E1): lapangan hijau bertekstur, net, tribun penonton piksel, papan iklan AUDIRA, lampu atap.
- **Diorama per babak:** kamar atlet malam (B, GLB ranjang, meja, lampu meja, lemari trofi), lapangan sisi vs China (C), halaman upacara Kemenpora pagi (C2, gedung, palem, tiang bendera), net tinggi vs Malaysia (D), sudut depan-kiri arena (E1), podium 2-1-3 dengan tiga tiang bendera (E2), panggung Jakarta malam depan Monas + gedung + kembang api (OUT).
- **Lighting:** sinar nyata dengan bayangan (`ThreeCanvas shadows`), `Finish` (HDRI studio, AO, bloom, DOF ringan, profil DOCUMENTARY_WARM, vignette 0,55). Kunci emosi = lampu hangat 2400K (lampu meja B, lampu tiang OUT, obor Susy).
- **Light by chapter:** A lampu atap hangat · B lampu meja hangat + cahaya bulan biru · C lampu atap dingin · C2 matahari pagi · D sorot net · E1 lampu atap + kilat impact · E2 sorot podium + kilat fotografer · OUT malam biru + kembang api merah-putih-emas.

## Materials
- **Sprite slab:** tekstur piksel NearestFilter, emissive 0,35, rim pucat, contact shadow tiap sprite, menghadap kamera.
- **Owi:** kaos putih + pita merah, celana pendek. **Butet:** sanggul, rok. **Lawan:** China merah tua, Malaysia biru tua-kuning. **Susy 1992:** kostum `KIT_1992` membawa obor.
- **Set:** GLB lokal (`public/glb`) + material `POLISH.*` (batu, plastik mainan) + tekstur kanvas (lapangan, tribun, papan, langit, jendela gedung).

## Palette
| Token | Hex | Kegunaan |
|---|---|---|
| primary | #F3E6CC | kostum Indonesia, teks HUD terang |
| secondary | #D02A30 | Merah Putih (satu-satunya aksen merah) |
| accent | #E9B347 | medali, chip EMAS, kata aktif karaoke |
| bg | #0A0D14 | malam arena, latar HUD |
| court | #2BA05A | lantai lapangan |
| lamp | #FFB46B | lampu hangat 2400K |

## Typography
Anton (judul) + Silkscreen (HUD, skor), tidak ada teks < 40 px @1080. Overlay HUD dari `scenes/ep08/Film.tsx`, caption karaoke `scenes/ep08/hud.tsx`.

## Aturan penggambaran
- Semua tokoh nyata = sprite generik tanpa wajah + kartu nama. Tidak ada foto, wajah asli, logo IOC/BWF/PBSI, maskot Rio 2016.
- Bendera lawan (Malaysia, China) hanya di tiang podium E2; Merah Putih di C2, E2, panggung OUT.
- Angka di layar hanya dari `research/SOURCE_REGISTER.md`; skor final 21–14, 21–12; jam hanya WIB.
- Safe zone: subjek di y 700–1300, HUD 236–700, caption bawah; 380 px bawah bersih.
- Brand: papan iklan AUDIRA di arena (A, C, D, E1), poster AUDIRA di kamar (B), billboard AUDIRA di skyline (OUT); VO menyebut AUDIRA; `AudiraSignature` lewat `signed("Ep08")`; kartu outro 3,8 dtk terakhir.

## Gerak
- Kamera 60 fps, jalur keyframe per adegan + drift genggam, tidak pernah parkir; y ≥ 3,8, jarak ≥ 9, fov 34, tidak pernah sejajar mata.
- Sprite melangkah 8 fps (rasa game). Reli kok = carrier antar pemain; kilat layar di smash (A) dan match point (E1).
- Wipe piksel antar adegan (`Wipe`).

## Multi-scene (8 diorama)
A arena hook → B kamar + lemari trofi 1992–2012 → C lapangan sisi vs China → C2 upacara Kemenpora, orang berdoa, bendera naik → D net tinggi vs Malaysia → E1 match point sudut lain → E2 podium + tiga bendera → OUT panggung Jakarta malam, Susy + Butet, Monas, kembang api.
