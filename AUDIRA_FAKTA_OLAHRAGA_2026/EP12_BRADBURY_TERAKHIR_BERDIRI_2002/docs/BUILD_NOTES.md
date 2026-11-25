# STATUS s5 (2026-11-24, menang atas STATUS s4)
5 perbaikan s4 + F, G, J, E, D2 selesai; cover-topic ada; SFX `public/audio/ep12/sfx.wav` (perintah: npm run sfx -- --shotlist=../EP12_BRADBURY_TERAKHIR_BERDIRI_2002/docs/SHOTLIST.md --timing=public/audio/ep12/vo.timing.json --out=public/audio/ep12/sfx.wav --duration=82.37); contact sheet, look.json (diversity 59.4), camera.json (5/5), THEME_CHECK semua ya; G18c 19,2 LU; skor self 4.17; juri putaran 1 sedang berjalan.

# STATUS s4 (2026-11-24, baca bagian ini dulu; sisanya hanya bila perlu)
Semua 16 scene sudah DITULIS dan lolos tsc: `studio/src/scenes/ep12/shotsA.tsx` (A..F), `shotsB.tsx` (G..L), `themes.ts`, `Film.tsx`, `Cover.tsx`, `index.ts`; baris EP12 di Root.tsx sudah ada. Indeks kata timing.ts lolos runtime. Pola tiap scene: `export const X: Shot = { scene({t}), hud({t}) }`; edit satu scene tanpa membaca file utuh.
Semua FgRail dipasang di layar (di luar Rink) y 1640.
Still sudah dilihat: A, B, C1, C2 (rig, es, set bagus; kualitas tinggi). BELUM dilihat: D1 D2 E F G H I1 I2 I3 J K L, Cover.
## Perbaikan yang harus dikerjakan (dari still A..C2)
1. A: hero terpotong di kiri; naikkan hx (lerp(26,34) jadi lerp(40,46)) atau kecilkan u 1.22 ke 1.1; foes geser kanan/ke atas sedikit supaya tidak tertutup. Pose akhir raise: tangan tertutup Stamp JUARA; turunkan Stamp? tidak: kecilkan hu akhir 0.74 ke 0.68 dan hy akhir +4.
2. B: kepala hero + lawan tertutup NameCard; u stand 0.95 ke 0.82 (hero) dan lawan 0.8/0.74 ke 0.64/0.6, atau cam y -30 pada key T.bradbury. Crouch 12,2 dtk bagus.
3. C1: flash T.menembus terlalu pekat (Film.tsx FLASH 0.75 ke 0.35; T.hantam 0.7 ke 0.35; T.pembatas 0.6 ke 0.35; T.garis 0.6 ke 0.35). Hero tertutup violet dan chip: geser violet x +14, chip hapus sub, zoom hit 300 ke 180.
4. C2: kepala dokter tertutup chip 111 JAHITAN; dokter u 0.86 ke 0.7 atau y +8; pasien hanya paha terlihat (kepala keluar frame) di 18,6: kurangi cam x/z key kedua-ketiga (x 10, z 120); lantai kosong di bawah boleh.
5. HUD sub Chip selalu font pixel kapital; hapus sub yang tidak perlu (maks judul + 1 chip).

# BUILD NOTES EP12 (baca INI + timing.ts bagian T/CUT saja; JANGAN baca ulang kit, ep01, rule hub, hud.tsx utuh, sprites.ts/sets.ts/stage.tsx utuh)

Sesi s3 habis konteks karena membaca kit utuh. Semua yang perlu diketahui ada di bawah.

## Sudah jadi (s3, 2026-11-24)
`studio/src/scenes/ep12/`: `timing.ts`, `hud.tsx`, `timeline.json`, `sprites.ts` (BARU), `sets.ts` (BARU), `stage.tsx` (BARU; belum pernah di-tsc). Docs lengkap, cover-reference ada, VO terkunci offset 0.

## Belum
1. `npx tsc --noEmit` untuk ep12 (perbaiki), lalu `Film.tsx`, `Cover.tsx`, `index.ts`, baris EP12 di Root.tsx (pola EP10: import baris 16, SLUG baris 30, komposisi baris 94-97; EP11/EP13 mungkin sudah menambah baris sendiri, baca ulang dulu).
2. Sisanya sama seperti brief: cover-topic, SFX, preflight, contact sheet, audit, THEME_CHECK, juri, G18c, gerbang acc.
`index.ts` = `import tl from "./timeline.json"; export { Cover } from "./Cover.tsx"; export { Film } from "./Film.tsx"; export const TOTAL_SECONDS: number = tl.total;`

## Pendekatan visual (penting)
Skater = rig kapsul beranimasi yang diraster NATIF di grid art (PX 8, layar 135 x 240 art px), bukan sprite diskala. `u` = art px per unit; tinggi berdiri = 108 unit, jongkok glide ±65 unit. Subjek >= 84 art px: glide u 1,35; berdiri u 0,85-1,0. Origin (x,y) = titik tanah di bawah pinggul; kaki maks y 158.

### sprites.ts
- `HERO`, `RIVAL.red|blue|white|violet|orange` (Kit). `POSE.glide|push|tuck|lean|cross|start|stand|raise|knees|fall|slide|prone|trip`. `mixPose(a,b,k)`, `stride(phase, corner?)` siklus 0..1, `skaterCaps(pose,kit)`, `figure(FigOpts{suit,trim,hat,back,arms:"down|up|hips|point|medal",coat,skates,medal,breathe,k})` berdiri depan/belakang, `patient()` pasien di ranjang (unit, paha terangkat dari (4,-14) ke (28,-25)), `raster`, `Key` (dir, amb, key, rimDir, rim, rimAmt, tint RGB), `KEY0`.
### sets.ts
- `ramp(...hex)` 8 langkah; `relit`; `iceFloor(FloorOpts, scroll)`; FloorOpts: `lines:[{v 0..1 jauh ke dekat, w, c RGB, bend}]`, `pools:[{x,y,r,i}]`, `base`, `traces` (0..1 jejak pisau).
- `standsTile`, `boardsTile` (dipakai Rink). Set lain: `hospital()` → {back, bed} (kasur y 130, lantai 152); `xray()` → {wall, film} + `VERT[7]` {x,y,w,h,r}; `mountains()` → {sky, ridge, arena, ground}; `locker()` → {back}; `hall()` → {back, pod} (podium tengah atas y 160 x 36..100); `corridor()` → Albedo, dua pintu di x 32 dan 102, y 48..150 lebar 42.
- Nama ramp yang dipakai set: sky (latar), stone (kursi/lantai), book1/plaster/teal (baju penonton atau aksen), leaf (kulit), metal, frame/paper (pad 1/2), ivoryLit (putih/lampu), amberLamp, dusk, mesa, wood, woodDark. Ganti warna lewat `over` (Ramps).
### stage.tsx
- `camAt(t,[{t,x,y,z,roll}],seed)`, `shake(t,at,amp,dur)`, `Sk{p,kit,u,x,y,k,flip,refl,sh}`, `Fig{o,u,x,y,k,refl}`, `Caps{caps,u,x,y,k}`, `falling(fromPose,t,t0,endPose)` → {p, lift} (y = y - lift*u, sh=y), `Bits b={[...spray(t,x,y,dir,n,pow,seed), ...burst(t,t0,x,y,n,pow,cols), ...confetti(t,t0,hexes), ...snow(t), ...streaks(t,y0,y1,dir)]}`, `Rel{a,id,amb,over,lights}` (layer statis), `Tiled`, `theme(id,{sky,seat,c1,c2,c3,pad1,pad2,ice,lamp?,board,key?,stands?,boards?,fog,shadow,vign?})` (semua array hex gelap ke terang), `Rink{th,cam,scroll,t,stands{seed,crowd,top,bot,cheer,windows},boards:[98,118],hor,seg,floor,far(layer z1500),fg(layer z620),flash,text,children(z1000)}`, `FgRail`, `FgHeads{t,cheer}` (terkunci di y ±1530 ke bawah), `Pool{x,y,rx,ry,c}` (multiply, layar), `Beam{x,w,c,o,rot}` (berkas cahaya, layar).
### hud.tsx (px 1080x1920)
`Pop{t,a,b,top}`, `Chip{text,sub,color,border,size}`, `NameCard{name,role,accent}`, `Stamp{t,a,text,sub,top,color}`, `LifeBar{t,v,top,label}`, `Wipe{t}`, `Captions{t}`, `RED`, `GREEN`. Overlay kit: `Grade shadows`, `Vignette strength color cy`, `Grain frame`, `Exposure color amount blend` dari `../../kits/pixelstory/lighting/overlays.tsx`; `useFonts`, `FONT` dari `typography/fonts.ts`; `SCREEN` dari `camera/CinematicCamera.tsx`.
Struktur Film: AbsoluteFill bg gelap, div 1080x1920 `scale(width/1080)`; `sc = sceneAt(t)`; satu komponen per scene; lalu Grade, Vignette, Grain, Exposure flash, HUD, Wipe, Captions (Captions mati sendiri setelah OUTRO_AT). `pose`/kamera memakai `t = frame/fps`.

## Rencana tiap scene (detik VO; tema warna harus beda)
- A 0-5,83 hook, navy + es cyan, pad biru: hero u 1,35 di kiri depan (30,156), empat lawan di depan lebih jauh (x 62-122, y 140-131, u 0,95-0,8), scroll cepat ke kanan, pose lean/cross. Lawan jatuh beruntun mulai T.lalu (1,74) s.d. T.jatuh (2,67) `falling`, tertinggal ke kiri / menghantam pad + burst + shake; hero melewati, kamera push. Stamp TERAKHIR BERDIRI (3,0 dtk harus terlihat lawan sedang jatuh), T.juara: Stamp JUARA OLIMPIADE.
- B 5,83-12,55 arena hitam + emas: hero u 1,35 pose stand ke start, Beam emas, garis start merah; NameCard STEVEN BRADBURY / SKATING LINTASAN PENDEK · AUSTRALIA; T.mahal chip DIBAYAR MAHAL.
- C1 12,55-16,52 arena merah tua: dua skater u 1,5, lawan violet jatuh dari kanan, pisau ke paha hero; kilat T.menembus; chip MONTREAL. Tanpa darah, tanpa tahun.
- C2 16,52-20,16 rumah sakit hijau mint: pasien u ±1,2 di kasur, tiang infus, monitor ECG; LifeBar DARAH turun; chip "-4 LITER" T.liter lalu "111 JAHITAN" T.jahitan (19,6), jahitan muncul di paha.
- D1 20,16-24,08 rink latihan ungu gelap tanpa penonton, jendela sodium: hero menghantam pad di T.hantam (23,12); chip TAHUN 2000.
- D2 24,08-28,23 rontgen biru: dua ruas VERT merah berdenyut, siluet dokter (figure coat back) di FG; chip 2 TULANG LEHER PATAH.
- E 28,23-32,06 gunung senja jingga: Fig belakang u 1,0 + salju; chip SALT LAKE CITY / FEBRUARI 2002; crane naik.
- F 32,06-39,65 biru royal + jumbotron (art y 36-88): tiga skater, hero ketiga; KE-3 (34,6), TERSINGKIR?, baris lawan dicoret T.dq, LOLOS hijau T.lolos.
- G 39,65-47,99 loker kayu hangat: papan oval, titik bergerak, pelatih + hero (figure back); chip 1 TETAP DI BELAKANG (T.tetap), 2 HINDARI TABRAKAN, 3 TUNGGU (47,6).
- H 47,99-51,85 magenta/ungu, skating ke KIRI (flip): lawan di depan jatuh T.jatuhSemi, hero mengelak; LOLOS LAGI. Jangan sebut siapa.
- I1 51,85-55,61 putih toska, sudut lebih tinggi (hor kecil): empat lawan kanan atas, hero kiri bawah, pita ukur; chip ± 15 METER T.meter15; pull-back.
- I2 55,61-60,53 pad jingga/kuning dekat: Ohno (biru) dan Li (merah) bersenggolan T.senggol 57,43, empat jatuh T.seret-T.pembatas, menumpuk di pad (59,9); chip OHNO × LI; crash zoom, shake, burst.
- I3 60,53-62,67 emas: hero sendirian, garis finis, raise di T.garis, confetti, flash; FINIS.
- J 62,67-67,02 aula merah tua + podium: Fig depan medal u 0,85 di podium (67,158), FgHeads fotografer; Stamp EMAS PERTAMA sub AUSTRALIA (T.pertama), T.selatan: BELAHAN BUMI SELATAN.
- K 67,02-73,02 fajar persik, rink kosong, `traces` naik: hero berlatih; chip 1,5 MENIT dicoret lalu 10 TAHUN T.sepuluh.
- L 73,02-78,57 lorong: Fig belakang di antara dua pintu cahaya, BERUNTUNG? (kiri, T.beruntung) / PANTAS? (kanan, T.pantas).
Sesudah 78,57 AudiraOutro menutup.

## Perintah
- Still: `npm run stills -- out/ep12 <detik>s,<detik>s Ep12Preview 1` (540x960), satu per satu. `npm run sfx`, `audit:visual`, `audit:camera`. `render-final.mjs` memakai graph G18 stem -20 + `volume=-10dB` (sudah dicek).
- Frame contact sheet: 3,0; 8,5; 19,6; 25,2; 34,6; 47,6; 59,9; 65,0.
- Bash: jangan heredoc panjang (gagal parse), jangan ls/cat/grep/find/mkdir (hook rtk); pakai python, Read, Write.
