# HANDOFF — EP58 Mongolia, Kuda Lebih Banyak dari Manusia (sesi 1 → sesi 2)

Tanggal: 2026-11-23. Tahap 1–6 selesai. Tahap 7 (animasi) BELUM dimulai — STATUS.json menandai "7" selesai secara otomatis karena shotlist ada; abaikan, kode scene belum ditulis.

## Keputusan
- Style WORLDFORGE, Remotion + R3F 3D (style/STYLE_DECISION.md). Tanpa acc; acc pengguna hanya di gerbang render final.
- VO Cartesia: project/public/audio/vo.wav (83.17 s, 201 kata), vo-words.json (format [{id,text,start,end}]), vo.timing.json. Teks: docs/vo.txt.
- EPISODE_SECONDS = 86 (outro card 83.4–86).
- Docs: docs/ART_DIRECTION.md, SCRIPT.md, STORYBOARD.md, ASSET_MANIFEST.md, SHOTLIST.md (lint 0 red: `node scripts/shotlist-lint.mjs ../docs/SHOTLIST.md --timing=public/audio/vo.timing.json --words=public/audio/vo-words.json`).

## Setup proyek (sudah)
- project/ = salinan F:/AUDIRA-SKILL-MOTION/starter (tanpa node_modules/out). project/node_modules = JUNCTION ke F:/AUDIRA-SKILL-MOTION/node_modules (paket di-hoist ke sana). check-env + preflight lolos.
- project/SERIES.json + src/brand/channel.json sudah diganti ke @AudiraFaktaDunia.
- public/models/polyfork/{animal,prop,building,character,...} = junction ke E:/ASET/ASSET-AUDIRA/downloads/glb.
- Kit: src/kits/worldforge (Stage.tsx, Sky.tsx, heightfield.ts, terrainMesh.ts, surface.ts, plants.ts, example/Starter.tsx = contoh pemakaian terrain+sky+Stage).
- Folder scaffold project/src/scenes/Scene1..6 + EpisodeComposition.tsx dari scaffold-episode.mjs = template kosong, boleh diabaikan/dihapus.

## Temuan penting
- Kuda GLB ber-rig dengan animasi Walk/Idle/Run: animal/horse-base, wild-horse-047e93, saddled-horse-da86d3, corralero-horse-313f1a, draft-horse-519160. `core/assets/AssetModel.tsx` TIDAK memutar animasi → tulis komponen sendiri: GLTFLoader (pakai gltf.animations), SkeletonUtils.clone per instance, AnimationMixer, `mixer.setTime(t + phase)` tiap frame (deterministik), delayRender sampai load.
- Tidak ada GLB ger/yurt/joki → ger dibangun procedural (lathe/cyl + kerucut atap + pintu merah), figur = ToyPerson (core/polish/Person.tsx). Prop: wooden-teoke-bucket-e65f35, checkered-flag-81784a, flag-pole-015e53, sheep-base, goat-base, camel-base.
- Pola episode R3F yang sudah final untuk dicontoh: F:/AUDIRA-EPISODES/AUDIRA_CARA_KERJA_VIRAL_2026/EP31_CARA_KERJA_INTERNET/project/src/episodes/internet/ (EpisodeInternet.tsx: FilmScene + KeyLight + Subtitle + Voiceover + AudiraSignature; rig.ts: shotPlan/cameraAt dari core/camera/moves.ts; overlay HUD; registrasi Composition Preview/Final di src/Root.tsx baris ~94 & ~1003). Subtitle: size 52, plate rgba(0,0,0,0.94), position 1300 (CLAUDE.md episodes: subtitle y=1300).
- Motion memory WORLDFORGE: kartu HUD gelap rgba(20,14,12,0.82), label ≥34–38 px; subjek hero ≥35–50 % lebar; satu subjek per frame; jangan ulang set yang sama di >2 frame contact sheet.

## Peta waktu (detik VO = detik film, offset 0)
S1 Hook 0–6.7 (kawanan lari menembus rumput; 3.2–6.7 kawanan + 2 figur di ger) · S2 Sensus 6.7–27.3 (callout: "lima koma satu juta" 10.28 → 5,1 JUTA KUDA; "tiga setengah juta" 14.15 → 3,5 JUTA ORANG; "hampir satu setengah" 17.03 → ≈1,5×; "tanpa laut" ~22.5; "Luasnya" 24.06 → 1.564.116 km²) · S3 Musim 27.3–41.5 (+30 °C 31.86; "minus" 33.96 → −40 °C, rumput→salju; "Rasnya" 38.55 → ras sejak Genghis Khan) · S4 Pasukan 41.5–50.9 ("tiga sampai lima" 45.2 → 3–5 KUDA CADANGAN) · S5 Airag 50.9–60.3 (AIRAG ~54.5; "enam" 58.67 → 6× SEHARI) · S6 Naadam 60.3–69.6 ("enam tahun" 64.29 → UMUR 6; "tiga puluh km" 67.71 → 30 KM; papan AUDIRA di finish) · S7 500 kata 69.6–78.9 ("lima ratus" 71.11 → 500+ KATA; warna/tanda/cap 76.1–78.7) · S8 79.12 "Negeri" → KUDA = MAYORITAS; outro card 83.4–86.

## Sisa langkah
1. Tulis src/episodes/mongolia/ (EpisodeMongolia.tsx, World/Herd/Ger/Overlay, rig.ts), daftar MongoliaPreview (540×960@30) + MongoliaFinal (1080×1920@60) di src/Root.tsx. AudiraSignature seed="mongolia-kuda-EP58" handle="@AudiraFaktaDunia". Outro card shared/assets/brand/audira-outro-card.svg 83.4–86.
2. Cover topik style/cover-topic.png (1080×1920 still dari frame hook).
3. npm run sfx (SHOTLIST di ../docs) → public/audio/sfx.wav.
4. qa-scene, contact sheet 6–8 frame 540×960, npm run audit:visual + audit:camera, draft/THEME_CHECK.md (G22), skor self + juri buta (record_score stage draft).
5. Gerbang: tampilkan contact sheet, skor juri, durasi, G18c → tunggu acc pengguna → render:final --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav → FINAL_VIDEO.mp4, QA, delivery (SOCIAL_CAPTIONS, NOTES, memory, 3 scheduled review).

---

# HANDOFF sesi 2 → sesi 3 (2026-11-23)

## Selesai di sesi 2
- `npm run sfx -- --timing=public/audio/vo.timing.json --duration=86` → `project/public/audio/sfx.wav` (86 s, 34 sounds, −26 LUFS, TP −6.6). Selesai, tidak perlu diulang kecuali shotlist diubah.
- Kode mulai ditulis di `project/src/episodes/mongolia/` (BELUM di-typecheck, BELUM dirender):
  - `terrain.ts` — `getSteppe()`, `gy(x,z)`, `height`, `BAKE_SUN`, `LOC` (lokasi set): hook (0,0) · valley (−200,150) · camp (150,−60) · lone (300,250) · graze (−80,−220) · war (−300,−40) · race z=330, finishX=170 · portrait (330,−250) · ridge z=−430 (punggung bukit 24 m).
  - `Horse.tsx` — `useModels()` (GLTFLoader + delayRender, staticFile `models/polyfork/<id>.glb`), `RiggedHorse` (SkeletonUtils.clone, AnimationMixer, `mixer.setTime(t*rate+phase)` tiap render, `tint` dikali vertex color, `frost` 0..1, `rider` ditempel di posisi bone `Spine` relatif root + `riderOffset` [0,0.32,0.05] — perlu dicek visual), `Prop` (GLB statis), `COATS` (bay/chestnut/dun/grey/black/white/dusk). Kuda menghadap +z, tinggi 1.9 m, tanpa tekstur (vertex color).
  - `Props.tsx` — `Ger` (yurt procedural r=3 m, pintu merah +z), `ridePose(f,seed,crouch)`, `Jockey` (anak, helm, outfit sport bernomor, scale 1.3 height 0.72), `Warrior` (generik, helm kerucut), `Herder`, `Grass` (InstancedMesh bilah, sway shader, uSnow), `Snowfall` (instanced), `DustTrail`, `FinishBanner` (canvas "AUDIRA · FINISH" = brand di dunia), `AiragBowl(fill)`, `TetherLine`.

## Rencana sisa (desain sudah diputuskan)
1. `Sets.tsx` — satu komponen per babak, dipilih menurut t (multi-scene director `{t<6.7 && <Hook/>}` dst.):
   - Hook 0–6.7: patch rumput tinggi (cx0,cz0, 60×110 m, ~26k bilah, h 0.9) + 14 kuda Run lari +z (z = −45 + 10·t), Ger di (−14, 5) + 2 Herder. Shot1 kamera rendah z+40 y0.6→6 crane naik; shot2 3.2–6.7 side tracking x=+22 mengikuti z kawanan.
   - Sensus 6.7–19.5: shot3 aerial lembah 50 kuda Run (+x 7 m/s) di valley; shot4 kamp 3 Ger + 3 Herder + 12 kuda Idle/Walk, orbit lambat r35 y12.
   - Lone 19.5–27.3: satu kuda Walk di lone, top-down tinggi (offset z 8 hindari gimbal) lalu tilt ke horizon.
   - Musim 27.3–41.5: graze, 6 kuda Idle; terrain material patch `uSnow` (bungkus onBeforeCompile makeTerrainMaterial, ganti string `diffuseColor.rgb *= 1.0 - wfB.g * 0.06 * wfNear;` + mix ke putih pakai wfC.b threshold) naik 33.5→40; Snowfall mulai 33.96; haze Stage putih 35–36.3 sebagai transisi; shot7 36–41.5 macro push-in kuda frost=0.5, langit kelabu.
   - Pasukan 41.5–50.9: senja, 6 Warrior di kuda saddled Run (+x), tiap prajurit 3–4 kuda cadangan (tint beragam); shot8 low front tracking, shot9 crane naik; 47–48 satu prajurit pindah ke kuda cadangan (lerp + busur).
   - Airag 50.9–60.3: kamp pagi, TetherLine + 5 kuda betina Idle + 2 anak kuda (scale 0.6), bucket GLB, Herder crouch; shot11 57.2 macro ke AiragBowl fill naik.
   - Naadam 60.3–69.6: 7 kuda saddled Run (rate 1.3) + Jockey berhelm, x = finishX − 14·(67.8 − t), DustTrail; shot12 side tracking cepat low; shot13 66.6 low angle di garis finish (FinishBanner + bendera checkered GLB).
   - 500 kata 69.6–78.9: portrait, close-up kepala kuda lalu side slide ke 3 kuda warna beda (bay/grey/black), cap = torus kecil di pinggul. Label Indonesia saja (WARNA / TANDA / CAP) — jangan pakai istilah Mongolia yang belum ada di SOURCE_REGISTER.
   - Ridge 78.9–83.4: kawanan siluet Walk di punggung bukit, matahari rendah ke −z, crane naik mundur.
   - Langit per babak: SkyDome/env sendiri per scene (Sky.tsx memo sekali per film → buat material/env per key babak). Stage per babak: sun + shadowBox kecil (±60 m) per set.
2. `Overlay.tsx` — kartu HUD gelap rgba(20,14,12,0.82), font FONT (core/type/fonts.ts), label ≥ 36 px, area y 250–700 (subtitle di 1300). Callout & waktu: lihat peta waktu sesi 1 di atas; hook "KUDA > MANUSIA" 0.6–3.2, batang KUDA vs MANUSIA 3.2–6.7, 5,1 JUTA 10.28, 3,5 JUTA 14.15, ≈1,5 kuda/orang 17.03, TANPA LAUT ~22.4, 1.564.116 km² 24.06, +30 °C 31.86, −40 °C 33.96, RAS SEJAK ERA GENGHIS KHAN 38.55, GENGHIS KHAN · abad ke-13 41.5, 3–5 KUDA CADANGAN 45.2, AIRAG 54.5, 6× SEHARI + 6 centang 58.67, NAADAM 60.3, JOKI MULAI UMUR 6 64.29, 30 KM 67.71, 500+ KATA 71.11, WARNA/TANDA/CAP 76.1, KUDA = MAYORITAS 79.12.
3. `EpisodeMongolia.tsx` — pola starter WORLDFORGE: `FilmScene post={false} envIntensity={0}` + `Stage` (kits/worldforge/Stage.tsx) + kamera per shot (`timeline.ts`: tiap shot from/to pose + easing, gerak kontinu) + Subtitle (size 52, plate rgba(0,0,0,0.94), position 1300, words dari public/audio/vo-words.json) + `Voiceover src="audio/vo.wav"` + `<AudiraOutro seconds={2.6} />` + `<AudiraSignature seed="mongolia-kuda-EP58" />` (handle dari channel.json). EPISODE_SECONDS = 86.
4. Daftar `MongoliaPreview`/`MongoliaFinal` di `src/Root.tsx` (PRESETS preview/final), `npm run typecheck`, still uji per babak (`node scripts/stills.mjs out/t1 3s,10s,... MongoliaPreview 0.5`).
5. Lalu tahap 7 sisa (cover-topic.png) → tahap 8 → gerbang tahap 9 (acc pengguna) sesuai brief awal.

---

# HANDOFF sesi 3 → sesi 4 (2026-11-23)

## Selesai di sesi 3
- Ditulis (typecheck `npx tsc --noEmit` tanpa error di file mongolia; BELUM ada still/render):
  - `project/src/episodes/mongolia/timeline.ts` — `SETS`/`setAt(t)` (10 set: hook, valley, camp, lone, graze, war, airag, race, portrait, ridge), kinematika kawanan (HOOK_HERD, VALLEY_HERD, WAR riders+spares, SWAP 47–48.1, RACERS, RIDGE_HERD), `snowAt`, `winterAt` (36–41.5), `hazeAt` (white-out di 36.0), `cameraAt(t)` 15 shot, `AIRAG`, `PORTRAIT`.
  - `Sets.tsx` — `Terrain` (makeTerrainMaterial + uniform uSnow), satu komponen per set, `Sets` = multi-scene director (satu set ter-mount).
  - `Overlay.tsx` — `MongoliaOverlay`: kartu HUD per angka (CALLOUTS), Bars (3.2–6.7), SixTicks (58.67), Chips WARNA/TANDA/CAP (76.1).
  - `EpisodeMongolia.tsx` — MOODS per set (sky dome + PMREM env cache), SHADOW box per set, Stage WORLDFORGE, Subtitle 52 @1300, Voiceover, AudiraOutro 2.6, AudiraSignature seed mongolia-kuda-EP58.
  - `Horse.tsx` + `fitScale()` (semua kuda dinormalisasi ke tinggi 1.75 m).
  - `kits/worldforge/Sky.tsx`: `makeSkyMaterial` diekspor.
  - `src/Root.tsx`: `MongoliaPreview` (540×960@30) + `MongoliaFinal` (1080×1920@60), 86 s.

## Next (sesi 4)
1. Still uji per babak: `cd project && node scripts/stills.mjs out/t1 1s,5s,9s,15s,22s,30s,38s,45s,48s,55s,59s,63s,68s,72s,77s,81s MongoliaPreview 0.5` → buat contact sheet kecil, cek: arah hadap kuda (+z = heading 0), skala kuda, posisi rider (Warrior/Jockey via bone Spine + riderOffset; SEAT_Y=1.32 untuk rider 0 di War), cap di pinggul (Portrait, x −0.44), salju, ger, framing tiap shot. Perbaiki.
2. Cover `style/cover-topic.png` (still 1080×1920 dari MongoliaFinal ~1.5 s).
3. Tahap 8: qa-scene, contact sheet 6–8 frame 540×960, audit:visual + audit:camera, `draft/THEME_CHECK.md`, skor self + juri buta (record_score draft).
4. Tahap 9 gerbang acc → render:final `--vo=public/audio/vo.wav --sfx=public/audio/sfx.wav`. Tahap 10 delivery.

## Update akhir sesi 3 (2026-11-24) — BLOCKER untuk sesi 4
- Still uji `out/t2/grid.jpg` (16 frame, 8×2): langit, terrain, mood per set, kartu HUD, subtitle SEMUA tampil benar. TAPI isi set (kuda, ger, rumput, herder, banner) TIDAK tampil sama sekali di semua frame.
- Sudah dicek: file GLB ada di `public/models/polyfork/...`; tidak ada error/404 di log still; `gy()` dan `cameraAt()` wajar (mis. t=1 kamera y 1.4 di atas gy −0.4, target z −19.5). Jadi kemungkinan besar `useModels()` (Horse.tsx) tetap null saat frame di-capture → `{models ? <Sets/> : null}` di EpisodeMongolia.tsx tidak pernah render. Sudah dicoba: continueRender dipindah ke useEffect setelah models terisi + 2 rAF — belum membantu.
- Langkah debug berikut: (a) render `Sets` bagian non-model (Grass, Ger, Herder) tanpa gate models untuk memastikan set bisa tampil; (b) cek apakah `staticFile()` bisa mengikuti junction `public/models/polyfork` saat bundling (Remotion menyalin public/ — junction mungkin tidak ikut) → bandingkan dengan cara EP31/episode R3F lain memuat GLB (`core/assets/AssetModel.tsx`, mungkin pakai server aset lain / path absolut); (c) tambahkan console.log di useModels (loaded/failed) dan baca log still.
- Perbaikan sesi 3 lain: spasi kata subtitle (`core/hud/Subtitle.tsx` gap = font×0.4), ukuran teks kartu HUD dikecilkan (tidak terpotong lagi).

## Sesi 4 (2026-11-24)
- BLOCKER beres: model sebenarnya termuat; penyebabnya canvas `frameloop="never"` tidak menggambar ulang setelah model masuk. Fix di `Horse.tsx` `useModels`: `useThree(s => s.advance)` → `advance()` lalu `continueRender`. Kuda/ger/rumput tampil (out/dbg/f5.png).
- Skrip debug still dengan log browser: `project/.probe-still.mjs <detik...>` → out/dbg/.
- Perbaikan sesi 4: band ger (torus) diberi rotasi PI/2 (dulu berdiri → lengkung gelap); lone top-down 17→11 m; winter framing; Naadam finish head-on dari luar garis (banner 10 m, kamera mundur fx+20→34); portrait jarak kuda 2.6 m, slide cz+13. Still out/t3 + out/dbg OK.
- Sedang: `npm run cover -- MongoliaFinal --episode=.. --at=4.6s --force` lalu `npm run draft -- MongoliaPreview --frames=1.5s,9s,15s,38s,45s,59s,69s,81s --clip=auto` (log out/stage8.log). Next: qa-scene, THEME_CHECK, juri, gerbang tahap 9.

## Akhir sesi 4 → sesi 5 (2026-11-24) — POLES ronde 2 (batas konteks)
- Tahap 8 ronde 1: audit:visual ceilings 5/5/5/5/5, kamera 5/5, THEME_CHECK ditulis (draft/THEME_CHECK.md, frame 1.5,9,15,38,45,59,69,81 s), cover style/cover-topic.png (MongoliaFinal 4.6 s) + cover_1080x1350.png.
- Skor: self 4.17; JURI BUTA 3.33 = PERLU POLES (L3 M3 D3 C3 Motion5 R3). Ronde 2 adalah terakhir (aturan: setelah 2 ronde, juri terbaik ≥3.5 → langsung gerbang final; <3.5 → ganti style, ulang tahap 4).
- qa-scene sedang jalan saat sesi 4 berhenti: `node scripts/qa-scene.mjs --comp=MongoliaPreview --cuts=3.2,6.7,12.4,19.5,27.3,36.0,41.5,44.0,50.9,57.2,60.3,66.6,69.6,74.0,78.9 --concurrency=2 --out=../draft/qa` (log draft/qa-scene.log; cek EXIT, rerun bila tidak ada).
- Rencana poles (kritik juri):
  1. F8 payoff (ridge 78.9–83.4): siluet kuda terlalu kecil. Kamera lebih dekat/rendah ke punggung bukit (cz ridge+18..30 bukan +48..78, fov 26), kawanan lebih banyak & besar di siluet, matahari di belakang kawanan (rim).
  2. F2 valley aerial (6.7–12.4): drone lebih rendah/dekat (kawanan isi ≥50 % frame), tambah DustTrail di belakang kawanan, sudut 35–45° bukan top-down.
  3. Lighting siang datar (hook/camp/race/lone): matahari lebih rendah (sun.y 0.3–0.4, sore keemasan) dan dari samping-belakang kamera untuk rim; sunI naik, env 0.55 (saran memory: exposure 1, envIntensity 0.55); fog sedikit naik untuk aerial perspective.
  4. Material: terrain albedo variasi lebih kasar (noise skala 6–12 m, bercak tanah/kerikil), rumput nada beragam; ger felt beri tekstur canvas (CanvasTexture noise + jahitan) + roughness 0.95; kuda roughness variasi.
  5. Readability: kartu HUD dan caption bersaing → kartu lebih kecil/ringkas dan hilang lebih cepat (≤2.5 dtk) bila subjek hero; F6 airag tampilkan kuda betina lebih banyak di frame (kamera macro mundur sedikit).
- Setelah poles: `cd project && npm run draft -- MongoliaPreview --frames=1.5s,9s,15s,38s,45s,59s,69s,81s --clip=auto` → record_score self → juri buta baru (subagent: qa/jury.md, DRAFT_SHEET + references/quality-bar/worldforge.jpg + jury_input.json) → record_score jury → append_lesson failed untuk aspek lemah.
- Lalu gerbang tahap 9 (BERHENTI, minta acc pengguna): sheet, skor juri, durasi 86 s, G18c. Setelah acc: `npm run render:final -- ... --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav` (--concurrency=2, background) → QA → tahap 10.
- qa-scene ronde 1 GAGAL JALAN (EXIT 2): "the probe sent nothing — is <QaProbe /> inside the ThreeCanvas (Stage3D mounts it)?". EpisodeMongolia pakai FilmScene + Stage WORLDFORGE, tanpa QaProbe. Sesi 5: pasang `<QaProbe />` (src/core/qa/scene-qa.tsx) di dalam World/Stage, tag `<Solid>` bila perlu, lalu jalankan ulang qa-scene sebelum gerbang final (G19).

## Sesi 5 → sesi 6 (2026-11-24) — GANTI STYLE ke POLYVERSE (G21)
Selesai di s5:
- `<QaProbe />` dipasang di `EpisodeMongolia.tsx` (anak terakhir FilmScene); overlay HUD + Subtitle disembunyikan saat `qaNoOverlay()`. qa-scene jalan: PASS tabrakan, satu CHECK KEDIP@40.53 (salju dekat lensa) diberi `ok` di `draft/qa/qa-video.review.json`. Run qa-scene terakhir mungkin masih jalan/sudah selesai (draft/qa-scene.log) — tetap WAJIB diulang setelah look POLYVERSE.
- Poles ronde 2 WORLDFORGE: kamera valley aerial rendah 35° + DustTrail tiap 3 kuda; airag kamera mundur (kuda betina terlihat); ridge payoff dekat (cz +20..32, fov 34, 13 kuda siluet); matahari siang rendah (y≈0.36, #ffe2b4), env 0.55, fog 0.00045; kartu HUD ≤ 2.8 s + 18% lebih kecil.
- Juri buta ronde 2 = 3.33 (L3 M2 D4 C3 Mo5 R3) → batas 2 ronde, < 3.5 → GANTI STYLE. Lesson failed WORLDFORGE dicatat.
- Style baru: POLYVERSE (aset low-poly faset = bahasa visual disengaja). STYLE_DECISION.md + ART_DIRECTION/STORYBOARD/ASSET_MANIFEST/SCRIPT/SHOTLIST sudah baris `Style: POLYVERSE`. Arsip WORLDFORGE di style/_worldforge/. cover-reference.png = quality-bar polyverse.
- G18c: VO −16.7 vs SFX ducked −27.3 = gap 10.6 LU GAGAL → `sfx/cues/auto.py` TARGET_LUFS −28, `npm run sfx` ulang → SFX ducked −29.3, gap ≈ 12.6 LU (lolos, min 12). Durasi film 86 s (VO 83.17 s).

Next (s6), berurutan:
1. Look POLYVERSE di kode (kit ref `F:/AUDIRA-SKILL-MOTION/kits/polyverse/KIT.md`, memory `audira_style_memory get POLYVERSE` mustApply):
   - `EpisodeMongolia.tsx` MOODS: exposure 0.82, env 0.25, langit dalam pastel (zenith #3F4F98 → lila, horizon peach #f6c9a8), sun hangat #ffbf8a sunI ~3.4 rendah samping; winter/dusk/sunset disesuaikan pastel. Bila Stage WORLDFORGE punya grade/LUT, pakai kontras 1.07 + saturasi 1.12.
   - flatShading: material terrain (`terrain.ts`/`Sets.tsx` Terrain makeTerrainMaterial → `flatShading = true`, needsUpdate), tint kuda di `Horse.tsx` (material clone → flatShading true), ger/props di `Props.tsx`.
   - Debu `Props.tsx` DustTrail: `SphereGeometry` → `DodecahedronGeometry(1, 0)`.
   - Komposisi (kritik juri): F4 winter macro (~38 s) kuda terpotong kanan → kamera mundur/geser; F6 airag (~59 s) punggung kuda menutup mangkuk/ambing → kamera sisi samping kuda betina.
   - Opsional: puncak gunung faset jauh berlapis + batu faset di stepa untuk depth.
2. `cd project && npx tsc --noEmit` → still uji `node .probe-still.mjs 1.5 9 15 38 59 81` (out/dbg) → cek.
3. Cover: `npm run cover -- MongoliaFinal --episode=.. --at=4.6s --force` → style/cover-topic.png; `record_score` stage cover style POLYVERSE.
4. Draf: `npm run draft -- MongoliaPreview --frames=1.5s,9s,15s,38s,45s,59s,69s,81s --clip=auto`; isi ulang `draft/THEME_CHECK.md` (frame sama); `record_score` self (POLYVERSE) lalu juri buta subagent (qa/jury.md, DRAFT_SHEET.jpg, references/quality-bar/polyverse.png, draft/jury_input.json). Maks 2 ronde POLYVERSE.
5. qa-scene ulang: `node scripts/qa-scene.mjs --comp=MongoliaPreview --cuts=3.2,6.7,12.4,19.5,27.3,36.0,41.5,44.0,50.9,57.2,60.3,66.6,69.6,74.0,78.9 --concurrency=2 --out=../draft/qa` (background, ~10 menit). JANGAN jalankan qa-video.mjs terpisah (tanpa --skip whip hasilnya palsu).
6. Gerbang tahap 9: BERHENTI, tampilkan DRAFT_SHEET, skor juri, durasi 86 s, G18c (gap ≈12.6 LU) → minta acc. Setelah acc: `npm run render:final -- MongoliaFinal ... --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav` (background) → QA → tahap 10.

## Sesi 6 (2026-11-24) — POLYVERSE lolos juri, render final berjalan
- Look POLYVERSE di kode: MOODS pastel (zenith #3f4f98 → horizon peach), siang exposure 0.96 / env 0.32 / sun #ffbf8a 3.9; komponen `Facets` (flatShading semua MeshStandardMaterial); filter CSS contrast 1.07 + saturate 1.12 di sekitar FilmScene; debu DodecahedronGeometry; kamera winter (kuda utuh di tengah) + airag (sisi kiri bangku, fov 40).
- Cover baru style/cover-topic.png. THEME_CHECK diperbarui (Style: POLYVERSE).
- Draf POLYVERSE r1: juri buta LOLOS 3.83 (L4 M4 D3 C3 Mo5 R4), self 4.0. Camera clip pertama kosong karena RAM penuh → render ulang concurrency 1 → motion 5.
- qa-scene PASS; qa-video 2 KEDIP salju dekat lensa ditandai ok di draft/qa/qa-video.review.json.
- Acc pengguna "Gas render final" (2026-11-24). Render final berjalan: `cd project && node scripts/render-final.mjs --comp=MongoliaFinal --out=../FINAL_EP58_MONGOLIA_KUDA.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=3 --concurrency=2 --gl=vulkan --encoder=nvenc --title="Mongolia: Kuda Lebih Banyak dari Manusia" --slug=mongolia-kuda --ep=EP58` (log draft/render-final.log; restartable).
- Next: QA final (−14 LUFS, TP < −1, ffprobe metadata, cek frame) → record_score final → tahap 10 (caption 6 platform, NOTES.md, lesson, 3 scheduled review).
