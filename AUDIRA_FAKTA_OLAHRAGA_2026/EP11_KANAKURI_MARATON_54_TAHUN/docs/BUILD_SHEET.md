# EP11 build sheet (cheat sheet EP05, supaya Film/sets/Figure/Stage EP05 tidak perlu dibaca lagi)

Ditulis 2026-11-24 setelah membaca EP05 utuh. Belum ada kode, docs, atau preflight EP11 yang dikerjakan.

## Waktu kata (dtk film = dtk VO, total 91,424, voEnd 87,424, outro card 87,6)
- hook 0,10: Maraton 0,10 · selesai 0,80 · 54 1,60 · tahun 1,86 · Kamu 2,95 · dengar 3,68
- konteks 4,42: Stockholm 4,42 · 14 5,38 · Juli 5,74 · 1912 6,44 · Shizo 7,67 · Kanakuri 8,09 · 20(tahun) 8,85 · dua 11,18 · atlet 11,38 · Jepang 12,69 · Untuk 13,41 · 18 15,66 · naik 16,80 · kapal 17,07 · kereta 17,78 · Trans 18,18 · Ia 19,36 · lemas 20,47 · susah 21,15 · tidur 21,51 · malam 22,27 · terang 23,32
- pengembangan 24,12: hari 24,34 · gelombang 25,18 · panas 25,59 · 68 26,86 · pelari 27,14 · berangkat 27,98 · puluhan 29,71 · tumbang 30,13 · Satu 30,89 · Francisco 31,91 · Lazaro 32,36 · kolaps 33,33 · meninggal 34,14 · kilometer 35,41 · 30 35,92 · menyerah 37,17 · masuk 38,05 · rumah 38,44 · diberi 39,46 · minum 39,79 · tertidur 40,84 · pagi 42,03 · malu 42,99 · pulang 43,96 · panitia 45,34
- penjelasan 46,30: Swedia 46,66 · legenda 47,87 · hilang 49,37 · Padahal 50,00 · berlari 51,05 · tampil 52,09 · 1920 53,13 · 1924 54,18 · mendirikan 55,70 · Hakone 56,12 · Ekiden 56,38 · estafet 57,77
- payoff 58,61: 1967 59,38 · televisi 61,07 · kembali 62,56 · usia 63,52 · 75 63,79 · melintasi 65,44 · garis 66,19 · finis 66,46 · Waktunya 67,25 · 54 68,24 · 8 69,67 · 6 70,57 · 5 71,47 · 32 72,23 · 20,3 73,28 · detik 73,71
- outro 74,80: perjalanan 75,45 · menikah 78,02 · enam 78,82 · sepuluh 79,97 · Menurutmu 81,16 · cepat 82,83 · kembali 83,82 · Tulis 84,64 · Ikuti 85,83 · Audira 86,22

## Rencana set (potongan pada detik kata)
| Id | Waktu | Set | HUD |
|---|---|---|---|
| A | 0–4,3 | jalan tanah berdebu 1912, matahari rendah belakang, pelari amber berlari ke kamera | 54 TAHUN (hantam 1,60), kalender 1912 ke 1967 |
| B1 | 4,3–13,3 | dermaga/stadion Stockholm 1912 + pelari berdiri | DateStamp 14 JULI 1912, NameTag SHIZO KANAKURI 20 tahun, chip 1 DARI 2 OLIMPIAN PERTAMA JEPANG |
| B2 | 13,3–19,2 | peta kertas Jepang ke Stockholm (lon 10..145), kapal lalu kereta uap, RouteLine | 18 HARI (15,66) |
| B3 | 19,2–24,0 | kamar, ranjang, jendela terang malam putih, pelari terduduk susah tidur | MALAM TETAP TERANG |
| C1 | 24,0–34,9 | jalan maraton panas, pelari berlari, tumbang | 68 PELARI (26,86), FRANCISCO LAZARO MENINGGAL (violet grief) |
| C2 | 34,9–37,8 | close pelari limbung di tiang km 30 | KM 30 |
| C3 | 37,8–46,2 | beranda/ruang rumah warga, minum, lalu tertidur, cahaya pagi masuk | DIBERI MINUM, TERTIDUR SAMPAI PAGI + "versi Olympedia", PULANG TANPA MELAPOR |
| D1 | 46,2–49,9 | meja kliping koran "PELARI JEPANG HILANG" (koran rekaan) | LEGENDA |
| D2 | 49,9–55,4 | lintasan stadion, lampu, pelari | 1920, 1924 |
| D3 | 55,4–58,5 | jalan gunung Hakone, estafet tasuki | HAKONE EKIDEN |
| E1 | 58,5–67,1 | stadion 1967, kamera TV GLB, pelari tua, pita finis putus 66,46 | 1967, USIA 75 |
| E2 | 67,1–74,7 | penghitung waktu bertahap di atas finis | 54 TH 8 BLN 6 HR 5 J 32 MNT 20,3 DTK |
| OUT | 74,7–91,4 | senja, siluet keluarga besar (6 anak, 10 cucu) | 6 ANAK · 10 CUCU, CEPAT ATAU KEMBALI?, @AudiraSportFacts |

## API kit (salin folder `ep05/chronicle` dan `Model.tsx` ke `ep11/`; `timing.ts` tinggal ganti blok T dan CUT; hud.tsx: Chip, Stamp, BigValue, Flash, InkCut, RoundTag dipakai ulang)
- `ShotCanvas shot look frame`; `Shot{pos,target,fov,roll}`; `camAt(keys,t)` dengan `K(t,pos,target,fov,hold)`; `handheld(shot,t,{hits,hit,seed,drift})`; `project(shot,aspect,p)` -> {x,y 0..1,vis}.
- Look (tipe di Stage.tsx): key{pos,color,intensity,shadow{box,at,far,bias}}, hemi, fill, fog{color,density}, sky{zenith,horizon,ground,sunDir,sunColor,sunSize,glow,stars}, exposure, bloom, grade{shadow,high,amount,contrast,vignette,grain}, outline{width,halo,gain}. Preset `looks.ts`: GOLDEN, DUSK, MAPROOM, NIGHT, MORNING, DAY, ROOM_DAY, ROOM_NIGHT, INK{hero amber, ally cyan, foe, grief violet, neutral}. `mixLook(a,b,k)`.
- `Figure id outline pos rotY pose look t` (meter, kaki di pos, menghadap +z; look: hat peci/shako/bicorne/hair/bun/none, wear pants/robe/coat/kain, body m/f, scale, build, load, itemR). `POSES`: stand, akimbo, point, raiseFist, kneel, lookUp, sitCross, sitChair, talk(t). `gait(phase, run 0..1, base)` (fase +π per langkah; lari ±9 rad/dtk), `idle(p,t,seed,amt)`, `mixPose(a,b,k)` di ep05/sets.tsx.
- Pose tumbang = pose `BOX.fall()` di RingSet + group `rotation=[-1.42*k,0,0]`. Pose tertidur: group rotasi x -π/2 dengan POSES.stand.
- `Model id height position rotation tint` dari `studio/public/glb/<id>.glb`. `grainTex("dirt"|"canvas",size,rep)`, `DIRT()` di RingSet. `LightPool r strength`, `Shafts`, `Candle`, `Rain` (sets/fxextra), `Palm, Flag, Ship, Ground, Water, Lantern` (props), `Embers, Birds` (fx).
- Overlay: `Frame`, `Captions s words max y end` (film EP05: max 3, y 1330; memori CHRONICLE menulis 1300), `DateStamp s a b top big y`, `NameTag s a b name role y`, `Cite s a b text src y`, `MapPin s a x y name sub side`, `RouteLine pts progress dash width`, warna AMBER/CRIMSON/IVORY/DIM.
- Film.tsx: delayRender sampai `chronicleFontsReady()`, pilih scene per `sceneAt(t)`, HUD di `Frame width height`, `InkCut cuts`. Peta: teks HUD dan peta kanvas digambar sekali per module/useMemo.
- `index.ts` ekspor Cover (EP05: CoverA/CoverB), Film, TOTAL_SECONDS. Root.tsx: import EP11, SLUG `Ep11: "olahraga-EP11"`, 3 Composition (`Ep11Cover` 30f@30 1080x1920, `Ep11Preview`, `Ep11Final` lewat `signed`).
- Brand dalam adegan: AUDIRA di papan finis 1967 dan spanduk stadion.

## Catatan alat
- `preflight` tidak ada di package.json studio; skrip ada di `F:/AUDIRA-SKILL-MOTION/starter/scripts/preflight.mjs`.
- `npm run sfx -- --shotlist=<SHOTLIST> --timing=<timeline/vo timing> --out=public/audio/ep11/sfx.wav` (opsi lain: `--duration`, `--style`, `--timeline-only`).
- GLB belum dicari: lokomotif uap, kapal, kamera TV/film, rumah kayu, ranjang, pinus.
- Jangan kirim banyak panggilan Bash paralel dengan `cat`/`wc`/`grep`: hook mengubahnya menjadi rtk dan auto mode menolak. Pakai tool Read/Grep.
