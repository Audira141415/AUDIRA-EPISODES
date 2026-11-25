# EP72 — Rencana kode adegan (ditulis s3, untuk s4)

Sudah ditulis (jangan tulis ulang, belum di-typecheck):
- `project/src/episode/timeline.ts` — FILM_SECONDS 89.5, OUTRO 3, SceneId S1–S11, SHOTS (kamera per adegan, koordinat di bawah), shake gempa/gelombang, CARDS (37 kartu, waktu kata VO).
- `project/src/episode/parts.tsx` — C (palet), materi (woodMat, fabricMat, stoneMat, plainMat), `Azulejo` (grid ubin instanced: cols, rows, pitch, paint(u,v,i,j), fx(tile,t)→{dx,dy,dz,rx,ry,rz,s,white,dark}, dynamicColor, floor, center, position, rotation; lokal XY, ubin menghadap +z, floor → rebah, lokal +y = dunia −z), lukisan `paintHouse/paintWave/paintFlame(cols,rows)`, `paintFloor`, peta `paintIberia` (IB 5×4.75, `ibXZ`), `paintPortugal` (PT 3.84×5.8, `ptXZ`, `PARISHES` 12 titik), `LISBON`, `EPICENTER`, `Plaque` (kartu kobalt non-emisif, teks canvas), `Figure` (ToyPerson kain kepala bulat tanpa wajah), `Flame` (satu-satunya emisif), `Smoke`, `Candle`, `Haze`, `Ground` (flagstone), `Beam(a,b,w,color,k)`.

Belum: `scenes.tsx` (SCENES: Record<SceneId, FC<{t,f}>>), `LisbonFilm.tsx`, Root.tsx.

## Tata letak per adegan (cocok dengan kamera di timeline.ts)

- **S1 0–7**: 3 panel dinding Azulejo 24×40 pitch 0.075 (1.8×3.0), bawah y 0.3, x −2.1 / 0 / 2.1, z 0: paintHouse, paintWave, paintFlame. Retak (fx): ubin dekat garis zigzag rontok + miring pada 4.3 / 5.4 / 6.3. Plakat "AUDIRA" (Plaque 0.5×0.16) di pojok kanan bawah panel 1. Lantai paintFloor.
- **S2 7–17.5**: gereja `brick-church-322885` size 4.5 di (0,0,−4); lantai Azulejo paintFloor; lentera `table-candle-lantern-a7b5af` x ±1.3, z 0/1.5/3; lilin besar FG di (−1,0,2.6) (kamera close 12.4); 6–8 Figure walk dari z 4 ke −1.5; getar setelah 16.5 (sudah di cameraAt).
- **S3 17.5–25.3**: lantai peta Iberia 50×48 pitch 0.1 (center). Cincin ubin terangkat dari `ibXZ(EPICENTER)` mulai 17.7 (dy gelombang radial). Penanda Lisbon: pin + Plaque "LISBON". Penanda episentrum terracotta.
- **S4 25.3–31.6 / S5 31.6–36.7** (satu komponen Harbor): dermaga batu z 0..3 atas y 0.4 (`dock-lantern-post-5e58a4` di tepi), 5–6 Figure di dermaga; laut = Azulejo lantai biru 40×40 pitch 0.3 di z<0, y 0.3; dasar lumpur y −0.4 dengan `ship-s-longboat-f159fd` (1.5,−0.4,−4.5) dan `ship-anchor-c2b4f1` (0.2,−0.4,−3). 28.2–31.6 air surut (ubin turun/hilang dari z 0 ke −8). S5: puncak gelombang ubin (dy gauss) dari z −14 ke dermaga ±35.0, gelombang 2 ±35.4–36.5; ubin puncak memutih (white, dynamicColor).
- **S6 36.7–45.1**: kota: `two-story-house-40f6dc`, `brick-tenement-7d2014`, `corner-tenement-92fb62` grid x {−2.4,0,2.4} × z {−2.4,0,2.4}; istana `classical-bank-04954e` tint krem di (0,0,−5) size 4; lentera di (0.7,0,3.6) roboh 38.2; Flame menyebar atap ke atap mulai 39.9 urut jarak; Smoke; halaman buku (plane krem) melayang dari istana 42.7. Cahaya senja jingga.
- **S7 45.1–50.6**: kota sama, tint arang #3A302A, 85% bangunan amblas/miring 45.2–46.9; deret lilin peringatan z 4.2 di depan. Tanpa impact.
- **S8 50.6–59.5**: lantai 40×40 pitch 0.12; garis grid Baixa (jalan lurus) jatuh ubin demi ubin 56.8–59.5; Pombal = Figure robe gelap memegang gulungan di (−0.8,0.3,1.2) di atas gundukan puing; `village-well-f8e361` (1.3,0,1.6).
- **S9 59.5–69.5**: rangka gaiola 1.6×2.4×1.6 di origin, Beam tiang/balok/silang X dirakit 59.7–63; dinding plester sebagian; `timber-barn-90b3ce` di belakang (0,0,−6); 63.7+ cincin 10 serdadu (Figure outfit uniform, walk) radius 2.4 berputar, debu, model tetap berdiri (goyang kecil).
- **S10 69.5–76.8**: lantai peta Portugal (center); meja kayu di (2.6,0,2.6); surat (plane krem + segel kobalt) terbang busur ke pin `PARISHES` 70.5–74.5; pin terracotta pop.
- **S11 76.8–89.5**: jalan lurus sepanjang z (+4..−8); fasad Pombalina = Azulejo dinding x ±1.5 menghadap ke dalam, 4 per sisi, krem + bingkai jendela kobalt; ubin jatuh (dropCurve) 77.0–80.5 ke rangka Beam; Plaque "AUDIRA" di fasad kiri dekat kamera (z ~3, y 2.4); cahaya golden hour.

## Film (LisbonFilm.tsx) — pola EP59 SaunaFilm
FilmScene `post={false}` + `<MosaicCameraRig shot={{...cam, exposure:0.84}}/>` + `<MosaicPost frame strength 0.22 radius 0.35 threshold 0.95 vignette 0.4 grain 0.01/>`, exposure 0.84, envIntensity 0.4, ao, profile DOCUMENTARY_WARM. HUD kartu rgba(19,48,111,0.88) teks putih, aksen tone (ochre #D69A3A, terra #E0703C, sky #8FB0F0), judul ≥ 56 px, sub ≥ 38 px, y 250. Subtitle position 1290 size 56 maxWords 4. DISPLAY: Baisya→Baixa, gayola→gaiola, Markis→Marquis, Audira→AUDIRA. AudiraOutro seconds 3 di t ≥ 86.5. AudiraSignature seed "gempa-lisbon-ep72" handle "@AudiraFaktaDunia" outroSeconds 3. LOOK per adegan (bg, hemi, key, fog).
Root: LisbonPreview/LisbonFinal (FILM_SECONDS × fps).
