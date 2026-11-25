# FILM_PLAN — EP77 Katakombe Paris (kode, sesi s4)

Ditulis s3 setelah scaffold + VO. Baca bersama `draft/TIMING_LOCK.md`. Jangan baca ulang kit penuh: API sudah diringkas di sini.

## Yang sudah ada di `project/`
- Salinan EP72 (scripts render-final G18, sfx, stills, audit), `node_modules` = junction ke `F:\AUDIRA-SKILL-MOTION\node_modules`.
- `src/kits/chronicle/` (ShotCanvas, Stage, looks, Figure, props, fx, cam, Overlay, fonts), `src/film/fxextra.tsx` (Flames, Shafts, Candle), `src/film/glb.tsx` (dari EP42: `<Glb name pos h rotY tint material shadow />`, file `public/glb/<name>.glb`).
- GLB di `public/glb/`: townhouse-row-unit, brownstone-row-house, corner-tenement, colonial-lamp-post, collapse-rubble-mound, grave-cross, carved-grave-stele, grave-mound, arched-cemetery-gate, cemetery-fieldstone-wall-run, parish-church, four-wheel-wagon, draft-horse, crypt-well-head, mine-cart, hand-lantern, spiral-stair-shaft.
- Font chronicle di `public/fonts` (pakai `chronicleFontsReady()` dari `kits/chronicle/fonts.ts`; F_STAMP Anton, F_LABEL Barlow Condensed, F_CAPTION, F_CITE).
- `public/audio/vo.wav` + `vo-words.json` (format `{id,text,start,end}`), `vo.timing.json`.
- `src/episode/` masih file Lisbon (LisbonFilm.tsx, timeline.ts, scenes.tsx, parts.tsx): HAPUS lalu tulis baru. `src/Root.tsx`: hapus import/komposisi Lisbon + PenggantiGibran, daftarkan `KatakombePreview` (540×960@30) dan `KatakombeFinal` (1080×1920@60), durasi `Math.round(92.2*fps)`.

## API kit (ringkas)
- `ShotCanvas({shot:{pos,target,fov,roll?}, look: Look, frame, children})` → ThreeCanvas + Stage (key light berarah + shadow, hemi, fill, FogExp2, sky dome, composer: outline siluet → bloom → tone map → grade).
- `Look` = `{key:{pos,color,intensity,shadow?:{box,at,far,bias}}, hemi:{sky,ground,intensity}, fill?, fog:{color,density}, sky:{zenith,horizon,ground,sunDir,sunColor,sunSize,glow,stars?}, exposure, bloom:{strength,radius,threshold}, grade:{shadow,high,amount,contrast,vignette,grain}, outline?:{width,halo,gain}, near?, far?}`; preset di looks.ts: NIGHT, ROOM_NIGHT, DUSK, GOLDEN, MORNING, DAY, ROOM_DAY, INFERNO; `mixLook(a,b,t)`.
- Kontur: mesh dengan `userData.sil = {id, color}` dapat garis warna. `INK.hero` amber (pekerja, inspektur, Héricart), `INK.grief` violet (makam/tulang), `INK.foe` crimson (runtuh/bahaya), `INK.neutral` ivory (pendeta, pengunjung). Mesh FX terang beri `userData.noMask = true`.
- `Figure({id, outline, pos, rotY, pose, look:{hat,wear:'pants'|'robe'|'coat',itemR:'torch'|..., scale}, t})`; `POSES.stand/point/kneel/pray/lookUp/talk(t)/raiseFist`; `idle(pose,t,seed)`; `gait(phase, run, base)` (phase naik π per langkah).
- props: `Lantern({pos,t,light})` (tiang 2.2 m + lampu + pointLight), `Ground`, `stone()` material dinding batu. fxextra: `Candle({pos,t,power})`, `Flames({t, at:[{p,h}]})`, `Shafts`. fx: `Embers({t,box:[x0,y0,z0,x1,y1,z1],color})` untuk debu/bara.
- cam.ts: `clamp01, lin, sm, mix, mix3, noise1, handheld(shot,s,{drift,hits})`. Untuk kamera pakai Catmull-Rom per shot seperti EP72 `timeline.ts` (SHOTS keys + `cameraAt`, shake envelope).

## Arsitektur (pola EP72)
- `src/episode/timeline.ts`: FILM_SECONDS 92.2, OUTRO 3, SHOTS (scene+keys), CARDS (from/to/title/sub/count/tone), `cameraAt`.
- `src/episode/scenes.tsx`: SCENES record S1..S8 (komponen `{t}`) + LOOKS per scene (Look CHRONICLE).
- `src/episode/parts.tsx`: Tunnel (lorong batu kapur: lantai, dinding `stone()`, langit-langit lengkung, pilar), BoneWall (instanced: tulang paha kapsul horizontal bertumpuk + baris tengkorak bola+rahang, warna #cbbd9e, `progress` untuk S6 tumbuh), Plaque (canvas texture teks: "AUDIRA" S1/S8, "ARRÊTE ! C'EST ICI L'EMPIRE DE LA MORT" S7).
- `src/episode/KatakombeFilm.tsx`: ShotCanvas(look per scene) + HUD div (kartu gelap rgba(11,12,16,.78), border-top warna INK, Anton angka besar, label Barlow ≥ 40 px, top ≥ 250, kartu bawah ≤ 1110) + `Subtitle` (position 1290, size 56, maxWords 4, putus grup > 24 karakter) + `Voiceover src="audio/vo.wav"` + `AudiraOutro seconds={3}` dari 89.2 + `AudiraSignature seed="katakombe-paris-ep77" outroSeconds={3}`.
- DISPLAY subtitle: gabung kata "San"+"Inosan" → "Saints-Innocents"; Ru→Rue, Danfer→d'Enfer, Lui→Louis, Erikar→Héricart, Turi→Thury, Audira→AUDIRA.

## Adegan (detik = TIMING_LOCK)
- S1 0–5.7 lorong tulang: dinding tulang kiri-kanan, lentera tergantung, plakat batu "AUDIRA", dolly maju. Look gelap hangat (fog coklat gelap ~0.05, lentera pointLight kuat, exposure ~1.1). HUD "DI BAWAH PARIS" 0.3–2.4, counter "6.000.000+ JIWA" 2.5–5.6.
- S2 5.7–17.2 potongan melintang: atas rumah GLB siluet senja (DUSK), bawah lapisan batu kapur + ruang tambang, pekerja Figure amber mengayun (armR), mine-cart GLB. Crane turun y +8 → −5. HUD "BATU KAPUR" 6.9, "MEMBANGUN KOTA" 9.9, counter "±800 HEKTARE" 15.8.
- S3A 17.2–24.4 jalan malam (NIGHT): rowhouse kiri-kanan, colonial-lamp-post, ruas jalan amblas ke lubang kontur crimson, rubble GLB, Embers abu-abu, shake 21.0–23.5. HUD "1774" 17.5, "RUE D'ENFER" 20.4, "±300 METER" 22.2. S3B 24.4–28.8 lorong + pilar batu baru, inspektur Figure amber jalan (gait) bawa lentera. HUD "LOUIS XVI" 24.7, "1777 · INSPEKSI TAMBANG" 26.2.
- S4A 28.8–36.6 makam berkabut malam: grave-cross, carved-grave-stele, grave-mound (kontur violet), arched-cemetery-gate, parish-church di belakang, cemetery wall. HUD "SAINTS-INNOCENTS" 31.9, "±10 ABAD" 33.2, counter "±2 JUTA JENAZAH" 34.8. S4B 36.6–43.6 corner-tenement di sebelah tembok makam, potongan ruang bawah tanah: dinding retak lalu jebol (balok terdorong, tanah tumpah, kontur crimson). HUD "1780" 36.9, "DINDING JEBOL" 39.6, "DITUTUP" 42.7.
- S5A 43.6–52.0 crypt-well-head sebagai mulut tambang, lilin (Candle), pendeta Figure robe ivory raiseFist/point, jemaah kneel. HUD "SOLUSINYA?" 43.7, "7 APRIL 1786" 47.2, "DIBERKATI → OSUARIUM" 51.0. S5B 52.0–58.4 jalan malam: 3 four-wheel-wagon ditutup kain hitam (box gelap) + draft-horse, pembawa obor (itemR torch, Flames), tracking samping. HUD "TIAP MALAM" 52.4, "KAIN HITAM" 54.0, "DIAM-DIAM" 55.8.
- S6 58.4–70.4 galeri osuarium: BoneWall tumbuh baris demi baris, Héricart Figure amber + lentera, orbit pelan. HUD "1787–1814" 58.6, "HÉRICART DE THURY" 62.3, "TULANG PAHA" 65.2, "TENGKORAK" 67.5.
- S7A 70.4–75.2 portal batu + plakat tulisan Prancis (Plaque), push in. HUD kutipan "“BERHENTI! DI SINILAH KERAJAAN KEMATIAN”" 72.2 (panel gelap + border kiri). S7B 75.2–84.0 spiral-stair-shaft GLB, pengunjung Figure ivory turun, kamera spiral. HUD counter "550.000 / TAHUN" 76.2, "131 ANAK TANGGA" 77.7, "1,5 KM" 80.2, "±14 °C" 82.1.
- S8 84.0–92.2 potongan melintang: kota (rowhouse GLB, jendela emisif, lamp post) di atas, lorong lentera di bawah, batu kunci "AUDIRA". Crane naik. HUD "KOTA CAHAYA · KERAJAAN SUNYI" 84.1, "IKUTI AUDIRA" 86.8 (sub @AudiraFaktaDunia), outro 89.2.

## Setelah kode
`npx tsc --noEmit` → stills (`npm run stills -- out/draft <detik,...> KatakombePreview`) → cover-topic.png (still S6/S1 1080×1920 ke `style/cover-topic.png`) → `PYTHONUTF8=1 npm run sfx` (SHOTLIST.md dari STORYBOARD kolom Audio; TARGET_LUFS −27 bila G18c tipis) → contact sheet 8 frame (detik setelah angka terkunci) + `npm run audit:visual` → THEME_CHECK.md → juri buta subagent (maks 2 putaran) → render final (lock `F:\AUDIRA-EPISODES\_render.lock`, `--concurrency=1 --jobs=6 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav`).
