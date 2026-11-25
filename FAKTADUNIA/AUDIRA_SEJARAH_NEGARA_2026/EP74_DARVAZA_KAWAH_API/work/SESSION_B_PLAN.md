# EP74 Darvaza — rencana kode Sesi B (ditulis s2, 2026-11-25)

Status: project/ sudah di-scaffold (salinan EP59 tanpa node_modules/out/public/models/public/audio/src/episode).
Junction: project/node_modules -> F:/AUDIRA-SKILL-MOTION/node_modules ; project/public/models/polyfork -> E:/ASET/ASSET-AUDIRA/downloads/glb
(AssetModel mencari models/polyfork/<assetType>/<id>.glb). check-env OK. src/episode/materials.ts disalin dari EP59.
Sisa EP59 yang harus dibersihkan: Root.tsx masih mendaftar SaunaFilm + PenggantiGibran (hapus; daftar DarvazaPreview/DarvazaFinal).
Referensi kode: ../../EP59_FINLANDIA_3_JUTA_SAUNA/project/src/episode/{SaunaFilm.tsx,timeline.ts,parts.tsx,scenes.tsx}
(ambil: HudCard, cameraAt Catmull-Rom, Smoke, softTexture, textTexture, SignBoard, pop, mat/Shape).

VO: project/public/audio/vo.wav 77,74 dtk (Cartesia, speed 1), vo-words.json 200 kata, vo.timing.json. FILM_SECONDS = 81, outro 78–81.
Subtitle display map: Asgabat->Ashgabat, Kurunis->Kourounis, Audira->AUDIRA. Signature seed "darvaza-kawah-api" (handle dari channel.json).

## Waktu adegan (dari kata VO)
A hook malam udara 0–6.6 | B peta 6.6–13.3 | C kamp bor siang 13.3–28.0 (runtuh 23.7) | D api senja 28.0–39.2 (lempar obor 32.4, nyala 33.4)
E penampang 39.2–44.4 (70 m @40.3, 30 m @41.6) | F arsip malam 44.4–54.1 (dibuka 46.0, 1960-an 50.5, 1980-an 52.8)
G penjelajah turun 54.1–62.4 (2013 @54.5, bakteri 59.9) | H sumur pra-fajar 62.4–73.6 (2022 @62.8, sumur 67.2, 2025 @70.4, sepertiga 72.6, api 1 -> 0.33 di 67–72.6)
I fajar 73.6–81 (api 0.3).

## Dunia (1 unit = 1 m)
Kawah pusat (0,0): R=35, DEPTH=30, FLOOR_R=20. height(): fbm gurun + ridged dune, rata di r<1.3R..3.2R, mangkuk lerp(-DEPTH, h, t^2.2), t=(r-FLOOR_R)/(1.03R-FLOOR_R).
Grid kit: near expAxis(-420,420,0.7,0.01), far expAxis(-9000,9000,12,0.012); bakeSun SUN=norm([0.62,0.34,-0.7]); shade.x dipaksa 1 untuk r<1.05R (supaya pointLight api tidak dimatikan bake).
Albedo: pasir CDAE7E/B9935F, dinding strata 8C7A66/4A3B31, dasar arang 2B211C.
Api: InstancedBufferGeometry billboard silindris + ShaderMaterial additive (uTime, uFire rank<fire), ±450 lidah api (dasar, dinding bawah, bibir dalam); FloorGlow cakram emisif; 4 pointLight di kawah (~700 each, decay 2) + 1 di atas pusat (~2500) dikali fire.
Langit: kit SkyDome per adegan (key={id}), far=9000.

## Props
Rig hero core-drill-rig-3b355e (size ~18) di atas "tutup" cakram (r=R+1.5, y 0.3) dengan tekstur retak (opacity 20.5–23.7); runtuh 23.75: tutup turun 31 m + miring, debu Smoke fade.
Truk military-cargo-truck-652f66 (-16,0,16) di C, (-30,0,30) di D (siluet FG). Tenda canvas-wall-tent-de8a04 (14,0,20),(20,0,10) di C; (-18,0,46) di A/F/I.
Drum oil-drum-386c30 (-8,0,20) x4; spoil-heap-9aaa11 (-6,0,34); boulder regolith-boulder-1f1f14 tersebar r 38–55; rope-coil-and-harness-5b51d5 di tripod G.
Papan "AUDIRA" (SignBoard skala 3) (-6,0,40); turis 2 ToyPerson di A/I. Pekerja ToyPerson outfit "uniform" skala 1.7. Penjelajah: look perak + helm bola perak, jalur (0,y,-35)->(0,heightAt,-19) 54.1–58.5, tabung sampel menyala 59.4.
B peta: grid terpisah (unit = 2,6 km), Ashgabat (0,0,38) + blok kota, Darvaza (-4,0,-55) cincin menyala, rute TubeGeometry drawRange progresif, Kopet Dag ridged di z 50–70.
E penampang: ExtrudeGeometry profil mangkuk x -70..70, y -45..0, depth 50 (z -50..0), tekstur strata di muka potong, garis dimensi kotak tipis cyan emisif + label.
F arsip: map kardus + kertas tekstur "ARSIP · DARVAZA · 1971" + cap merah "TERTUTUP" (pop 46.0) di (6,0,42), kawah menyala di belakang.
H: 3 rig tint #7C8C9C di r=70 (sudut 0.6, 2.7, 4.6) + pipa silinder ke bibir.

## Kamera (k(pos,target,fov))
A [70,150,190]->[30,60,110]->[10,16,62], target [0,-14,0]
B [0,70,52]/[0,0,36] -> [-2,52,10]/[-2,0,-20] -> [-4,26,-20]/[-4,0,-55]
C1 13.3–19.8 orbit [30,7,44]->[6,6,50]->[-24,7,42] t[0,6,0]; C2 19.8–23.6 [-14,4,24]->[-8,3,18] t[0,2,0]; C3 23.6–28 [-10,6,30]->[-4,22,52]->[4,40,70] t[0,-10,0] + shake 23.7–25.6
D1 28–32.6 [-46,5,40]->[-34,6,46] t[0,-5,0]; D2 32.6–39.2 [-22,8,50]->[-6,14,58]->[10,20,64] t[0,-14,0]
E [-30,8,190]->[25,4,178] t[0,-14,-20]; F [16,12,62]->[10,3.2,47.5]->[4.5,2.4,46.5] t[6,0.2,42]
G1 [12,4,-14]->[10,-12,-6]->[8,-24,-2] t mengikuti penjelajah; G2 lantai [4,-28.6,-11]->[-3,-28.4,-12]
H orbit r150 sudut 0.5->-0.4, tinggi 70->95, t[0,-10,0]; I [16,4,72]->[24,12,96]->[30,26,124]

## Kartu HUD (y 262, kartu gelap EP59; tambah tipe count plain+from, bar, micro)
A 1.1–4.3 TURKMENISTAN/gurun Karakum; 4.6–6.55 SEJAK 1971
B 7.0–8.8 KAWAH GAS DARVAZA; 8.9–11.6 260 KM dari Ashgabat ke utara; 11.8–13.25 GERBANG NERAKA
C 15.7–19.7 1971 insinyur Soviet cari minyak; 20.5–23.6 RONGGA GAS; 23.7–27.9 TANAH RUNTUH
D 28.2–32.7 METANA (CH₄); 32.8–36.0 DIBAKAR; 36.0–37.55 “BEBERAPA HARI”; 37.6–39.15 1971→2025 MASIH MENYALA
E 40.2–44.35 ±70 M × 30 M; F 45.7–49.9 ARSIP TIDAK DIBUKA; 50.3–52.6 RUNTUH 1960-AN?; 52.6–54.0 DIBAKAR 1980-AN?
G 54.4–59.3 2013 George Kourounis; 59.6–62.3 micro BAKTERI DITEMUKAN
H 62.7–67.0 2022 perintah padam; 67.2–70.2 SUMUR PENYEDOT GAS; 70.4–73.5 bar API TINGGAL ⅓ (2025)
I 73.9–77.9 MULAI MEREDUP

## Status s3 (2026-11-25) — DITULIS, belum dites
- `project/src/episode/timeline.ts` SELESAI: SHOTS A–I (kamera), `cameraAt` (+shake 23.7–25.8, `follow` di G → target = explorerAt+1.3), `explorerAt(t)` (kaki penjelajah; di scene clamp y ke `height()`), `CARDS` (teks sudah dicocokkan VO; tipe count{from,plain,prefix}, bar{from,to,label}, micro, tone fire/blue/green/cream), `CARD_Y=262`, `fireAt(t)` (0 sebelum 33.4, ramp →1 di 35.2, 1→0.33 di 67–72.6, I=0.3). Film: fire = A→1, C→0, F/G→1, lainnya fireAt.
- `project/src/episode/parts.tsx` SELESAI: mat/Shape/SPHERE/CYL/ROCK, st, pop, groundY, DesertTerrain, MapTerrain, Fire (instanced billboard shader additive, aOffset via modelMatrix → bisa digrup/digerakkan, FX_LAYER), craterFlames(avoid), CraterFire (flames + floor glow + 6 pointLight), Smoke (from/to fade 0.5 dtk), textTexture, SignBoard(s, lit), Label (billboard teks), Boulders, Tent, Truck, Drums, Worker (uniform + hardhat), Tourist, Explorer (baju perak, helm bola, tabung sampel menyala `sample`).

## Rancangan scenes.tsx + DarvazaFilm.tsx (tinggal ditulis)
- Film memasang DesertTerrain + CraterFire (flames = craterFlames(avoid: garis x=0 z<-17 lebar 3.5, titik (0,-19) r5, (2,-12.5) r5)) untuk adegan A,C,D,F,G,H,I; B dan E dunia sendiri.
- A malam: tenda (-18,·,46),(-28,·,40) glow; 2 turis (4,·,38),(6,·,38.5) menghadap kawah; papan AUDIRA SignBoard s=3 di (-6,·,40) rot 0.15 lit 0.25; Boulders.
- B peta: MapTerrain; kota putih marmer (±40 kotak kecil putih di sekitar ASHGABAT); rute TubeGeometry r0.35 lewat (0,36),(-3,10),(1,-20),(-4,-53) y=mapHeight+0.25, drawRange progresif 8.9→11.6, emisif emas; penanda Darvaza: torus r2.4 emisif + Fire 40 lidah kecil + pointLight; Label "ASHGABAT" (pop 7.0) dan "DARVAZA" (pop 10.8).
- C kamp 1971: tutup kawah = 8 irisan pie (CylinderGeometry thetaStart, r=R+1.5, tebal 3, atas y 0.15, mat C.clay kind stone) jatuh 23.75+0.1i ke −31 sambil miring; cakram tengah r12 membawa rig `core-drill-rig-3b355e` size 18 + drum + spoil heap; tekstur retak (canvas garis gelap) opacity 20.5→23.7; 3 Worker dekat rig lari keluar ke r 42 di 21.0–23.5 (pose run); truk di luar tutup (-30,·,32), tenda (30,·,26),(36,·,12); debu Smoke besar 23.7–28 (size 4, rise 25, warna pasir).
- D senja: 3 Worker di bibir (-27,·,26),(-29,·,23),(-24.5,·,29), pelempar heading=atan2(27,-26), pose throw 32.0–32.6; obor = grup Fire 3 lidah + pointLight, lintasan parabola dari (-26.4,2,25.4) ke (-8,-29,8) 32.4→33.4; kilat pointLight saat 33.4; truk FG (-38,·,30); shimmer metana Smoke hijau pucat 28–33.4.
- E penampang: ExtrudeGeometry profil (x −46..46, y −45..0, mangkuk R35/FLOOR_R20/DEPTH30) depth 50, posisi z −50; tekstur strata canvas di caps (repeat 1/92,1/45 offset 0.5,1); sisi mat #6B5644; garis dimensi cyan (horisontal y+4 x±35 pop 40.3; vertikal x=0 y0..−30 pop 41.6) + Label "±70 M"/"±30 M"; truk GLB di atas blok x=40 untuk skala; 120 lidah api di dasar mangkuk; kamera DIUBAH ke [-40,10,250]→[30,4,236] target [0,-16,-20] fov 36 (lebar 9:16 hanya ±73 m di jarak 200).
- F arsip: peti kayu (6,h,42) 1.2×0.5×0.8 + map kertas 0.9×0.65 tekstur "ARSIP · DARVAZA · 1971" + cap merah "TERTUTUP" pop 46.0 + 2 catatan "1960-AN?" pop 50.5, "1980-AN?" pop 52.8; lampu minyak pointLight hangat.
- G: tripod 3 kaki di (0,h,-37) apex y+4, tali silinder apex→dada penjelajah, rope-coil GLB; Explorer pose stand saat turun, kneel 59.0–61 dengan sample (59.4).
- H pra-fajar: 3 rig tint #7C8C9C size 16 di r70 sudut 0.6/2.7/4.6 pop 67.2 + pipa silinder r0.4 ke r38 + lampu kerja putih; api via fireAt.
- I fajar: tenda, turis, papan AUDIRA, boulders; api 0.3.
- LOOK per adegan (SkyDome key={id}, fogExp2, envIntensity malam 0.12/siang 0.55, key = directionalLight di target+SUN*150, shadow box ±70 map 4096):
  A/F/G malam zenith #070B18 hor #1E1A2A glow #3A2A30 halo #6070A0 ground #120E0C, hemi #4A5A80/#2A1E16 0.25, key #A9BCE6 0.45, fog #1A1622 0.0018 · B siang zenith #5F8FC6 hor #D9D4C4 glow #FFF0D2, key #FFF1D8 3.2, fog 0.004 · C siang key 3.6 #FFF0D6 fog #DCD6C2 0.0016 sunDisk 12 · D senja zenith #2A2E5A hor #E08A5A glow #FF9A50 key #FF9A5A 1.6 fog #C8805A 0.0022 · E bg #0F141E key putih 2.0 · H zenith #0E1838 hor #C07A5A key #FFB08A 0.7 fog #4A3E52 0.0016 · I zenith #3A6AAA hor #F2C49A glow #FFB070 key #FFC28A 3.0 fog #E8C49A 0.0018.
- HUD: kartu gelap EP59 (rgba(20,14,12,0.82), border atas warna tone), count plain tanpa pemisah ribuan, bar menyusut 100%→33%, micro = lingkaran 220 px berisi batang bakteri (div diputar) di samping teks.
- Subtitle seperti EP59 (position 1290, size 56, maxWords 4); DISPLAY {Asgabat: Ashgabat, Kurunis: Kourounis, Audira: AUDIRA}; AudiraSignature seed "darvaza-kawah-api" tanpa handle; AudiraOutro 3 dtk.
- Root.tsx: hapus SaunaFilm + PenggantiGibran, daftarkan DarvazaPreview (540×960@30) + DarvazaFinal (1080×1920@60), durasi FILM_SECONDS.
