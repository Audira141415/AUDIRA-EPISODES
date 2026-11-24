# HANDOFF — EP59 Finlandia 3 Juta Sauna (sesi s1 → s2, 2026-11-23)

## Tugas
Video short FAKTADUNIA (@AudiraFaktaDunia) seri `AUDIRA_SEJARAH_NEGARA_2026` sampai final, pipeline 11 tahap AUDIRA. Satu-satunya gerbang acc pengguna: tepat sebelum render final (tahap 9). Aturan batch: `../_research/BRIEF_COMMON_B12.md`. Tulis HANYA di folder episode ini (sesi paralel EP56/57/58/60 bekerja di folder lain; jangan sentuh `_research/*`, `_tools/*`).

## Sudah selesai (s1)
- Scaffold `scripts/scaffold-episode.mjs` lalu `project/` diganti salinan penuh `F:/AUDIRA-SKILL-MOTION/starter` (tanpa node_modules/out) + kit `kits/feltcraft/src/kits/feltcraft` → `project/src/kits/feltcraft`.
- `project/node_modules` = junction ke `F:\AUDIRA-SKILL-MOTION\node_modules` (bukan starter/node_modules: remotion tidak ada di sana). `npm run preflight -- --episode=..` → No blockers.
- `project/SERIES.json` = salinan SERIES seri (FAKTADUNIA). `project/src/brand/channel.json` MASIH stale (EXPLAINED) → jalankan `npm run channel` di project lalu cek handle @AudiraFaktaDunia.
- `research/SOURCE_REGISTER.md` disalin dari `_research/b12`. STATUS.json di-init (schema audira-episode-status/1; STATUS scaffold lama di `archive/`). Stage research = done. data: style FELTCRAFT, shortTitle "Finlandia Sauna", engine remotion, memoryEpisode sejarah-negara-EP59.
- Style dipilih: **FELTCRAFT, 3D Remotion+R3F** → `style/STYLE_DECISION.md` (+ cover kit `style/feltcraft.png`). Laporan ke pengguna sudah.
- Draf naskah v1 (±196 kata) → `docs/SCRIPT.md`.

## Pengetahuan teknis (jangan cari ulang)
- Starter npm scripts: `vo` (vo-analyze), `sfx`, `stills`, `draft -- <PreviewComp>`, `audit:visual`, `audit:camera`, `cover -- <Comp> --episode=..`, `qa -- --comp=`, `render:final -- --comp= --out= --vo= --sfx= --title= --slug= --ep=EP59 --jobs=4 --concurrency=2 --gl=vulkan --encoder=nvenc`, `channel`, `preflight`.
- Root.tsx: daftarkan `<Name>Preview` (PRESETS.preview 540×960@30) dan `<Name>Final` (1080×1920@60) dari `core/film/frame.ts`.
- Pola scene 3D: `core/scene/FilmScene.tsx` (frame, shot {pos,target,fov}, background, profile COLOR_PROFILES.DOCUMENTARY_WARM, exposure 0.82, envIntensity 0.25, ao, overlay={(scale)=>...}). Contoh lengkap: `src/kits/feltcraft/example/FeltcraftExample.tsx` (lampu: hemisphere #D7E8FF/#E8C99A 0.9, key [3.5,5.5,4.5] 2.1 #FFE4BC castShadow, rim [-3,3,-4] 1.2 #FFD2A0, point [0.6,1.6,2.2] 2.2 #FFC98A).
- Kit FELTCRAFT: `FeltLandscape3D {t}`, `Fuzzy {geometry,color,shells,spacing,position,rotation,scale}` + SPHERE/CONE/CYL, `feltMaterial(color,repeat)`, `yarnMaterial`, `beadMaterial`, `FELTCRAFT_PALETTE`, `stepT` (boneka 12 pose/dtk; kamera halus), `WoolFox3D`, `YarnTree3D`.
- HUD: `core/hud/SafeLabel.tsx` (x,y layout px, min 36 px, plate cream: plate="rgba(255,247,232,0.92)" color "#4A2E1E"), `core/hud/Subtitle.tsx` (words {text,start,end}, frame, fps, offset, position y≈1300), `core/hud/KineticCounter.tsx` (to, frame, startFrame, durationFrames, suffix). `core/film/Voiceover.tsx {src, offset}`.
- Brand: `brand/AudiraOutro.tsx` (seconds=3), `brand/AudiraSignature.tsx` (seed="finlandia-sauna-ep59", outroSeconds=3) — lapisan terakhir. Nama "AUDIRA" juga harus ada di dunia 3D (mis. papan kayu di sauna).
- Orang: `core/polish/Person.tsx` `<ToyPerson f seed pose outfit="trunks" torso={handuk} position heading scale/>` (pose "sit","stand","walk"); beri handuk felt (silinder Fuzzy melingkar torso) → sopan.
- GLB lokal (`<AssetModel id=... size ground />` dari `core/assets/AssetModel.tsx`, file di public/models/polyfork): `log-cabin-4fac3b`, `porch-log-cabin-d2f3ef`, `tall-pine-tree-ab4108`, `pine-tree-3ea075`, `apartment-block-6445af`, `slab-apartment-block-1b02a2`, `mine-cart-94bd76`, `mine-headframe-735cf4`, `wooden-teoke-bucket-e65f35`, `wooden-barrel-ab50ca`, `plank-bench-c46528`, `wooden-rowboat-916981`, `dock-platform-section-b36e7c`, `flagpole-7b7806`, `an-hourglass-with-sand-ec9f11`, `towel-rail-81254f`. Tidak ada GLB parlemen → bangun dari felt (tangga + 14 kolom + atap) atau tint gedung lain.

## Rencana adegan (multi-scene, ganti tiap babak)
1 Hook (L1): danau bersalju + hutan pinus, kabin sauna "pop" bermunculan di bukit felt; callout 3,2 JUTA SAUNA vs 5,7 JUTA PENDUDUK.
2 Context (L2): deret rumah felt, ikon 1 sauna : 2 orang; huruf jahitan "SAUNA" + chip "±7.000 TAHUN".
3 Di mana-mana (L3): lompatan lokasi danau → apartemen → gedung parlemen felt → turun poros tambang, gauge −1.400 M, kabin sauna bercahaya di terowongan (chip "PYHÄSALMI").
4 Interior (L4–L5): bangku kayu, 2–3 figur berhanduk duduk tenang, gayung siram batu di tungku (kiuas), kepulan uap wol; termometer 80–110 °C; kartu LÖYLY = "roh, napas".
5 Sauna asap (L6): kabin gelap tanpa cerobong, asap merembes dinding; jam pasir 6–8 JAM → panas 12 JAM.
6 Berlin 1936 (L7): desa atlet, kabin sauna + bendera Finlandia (salib biru), plate "BERLIN 1936", chip "die Sauna". JANGAN pakai cincin Olimpiade (merek dagang).
7 Payoff (L8): danau senja emas, kabin sauna hero, lencana teks "WARISAN BUDAYA TAKBENDA · UNESCO · 17 DES 2020" (tanpa logo UNESCO).
8 Outro (L9): AudiraOutro 3 dtk.

## Langkah berikutnya
1. Tahap 4: tulis `docs/ART_DIRECTION.md`, `docs/STORYBOARD.md` (tabel ≥6 baris Scene|Waktu|BG/MG/FG/HUD|Kamera|Audio), `docs/ASSET_MANIFEST.md`; tiap doc baris `Style: FELTCRAFT` (G21). Update STATUS stage style/script done + wordCount.
2. Tahap 6: VO `audira_generate_voiceover` (teks dari SCRIPT.md, "Audira"; cek lafal "Pyhäsalmi"/"löyly") → `project/public/audio/vo.wav` + words json; `npm run vo -- public/audio/vo.wav`; timeline dari detik VO.
3. Tahap 7: `project/src/episode/SaunaFilm.tsx` multi-scene + Root.tsx (SaunaPreview/SaunaFinal), cover `npm run cover`, `docs/SHOTLIST.md`, `npm run sfx`.
4. Tahap 8: `draft/THEME_CHECK.md` (G22), `npm run draft -- SaunaPreview`, juri buta subagen (qa/jury.md) → record_score jury.
5. Tahap 9: BERHENTI, minta acc pengguna (contact sheet, skor, durasi, G18c).

---
# HANDOFF s2 → s3 (2026-11-23)

## Selesai di s2
- Docs tahap 4: `docs/ART_DIRECTION.md`, `docs/STORYBOARD.md`, `docs/ASSET_MANIFEST.md`, `docs/SHOTLIST.md` (17 shot, lint `node scripts/shotlist-lint.mjs ../docs/SHOTLIST.md --timing=public/audio/vo.timing.json --script=../docs/SCRIPT.md` = 0 red 0 yellow). Semua punya `Style: FELTCRAFT`.
- VO Cartesia: `project/public/audio/vo.wav` (78,95 dtk, 190 kata) + `vo-words.json` + `vo.timing.json` (npm run vo). Teks TTS `docs/VO_TTS.txt` (fonetik "Pihasalmi", "loylu", "Audira"). Lafal belum didengar — catat di NOTES.
- Film = 82,0 dtk (outro 79–82). STATUS: voice done, data.filmSeconds 82.
- `npm run channel` sudah: `src/brand/channel.json` = @AudiraFaktaDunia.
- Kode ditulis: `project/src/episode/timeline.ts` (FILM_SECONDS, SHOTS dengan cam keys per shot + `cameraAt(t)` Catmull-Rom, `shotAt`, CARDS HUD per angka VO) dan `project/src/episode/parts.tsx` (C palet, felt()/yarn() cache, pop(), FeltGround, Lake, SnowMounds, Pine, PineRing, Smoke, SaunaCabin (GLB log-cabin + cerobong felt + pointLight), TowelPerson (ToyPerson trunks + handuk felt), textTexture (canvas felt + jahitan), SignBoard, FinnFlag (GLB flagpole + kain salib biru berkibar), Kiuas, FeltParliament). BELUM di-typecheck.

## Sisa (s3)
1. Tulis `project/src/episode/scenes.tsx`: SceneA..H (posisi sesuai cam keys di timeline.ts):
   - A danau salju z0: Lake r3 di [0,0.012,-1], FeltGround snow, PineRing, 6–8 SaunaCabin pop (pop(t, 0.3+i*0.35)) di bukit belakang/samping danau, TowelPerson walk; ember teoke FG.
   - B: deret 4 porch-log-cabin di x −4.5..4.5 z −1 + sauna kecil di sampingnya + 2 TowelPerson per rumah; shot 2 (10.4–16.1) huruf tile S-A-U-N-A (textTexture, box) berdiri pop di bukit z −3..−4, y 1–2.5.
   - C: deret x=0 sauna tepi danau+dermaga, x=6 apartment-block, x=12 slab-apartment (kantor), x=18 FeltParliament; sauna kecil glow menyala di waktu kata (18.95/19.94/21.07/22.34).
   - D: FeltGround hole=1.6, mine-headframe di atas lubang, poros silinder BackSide r1.6 y 0..−12, ruang terowongan y −14 (BackSide box ±5), SaunaCabin glow di [0,−14,−2.6], mine-cart.
   - E: interior kayu (dinding felt woodHoney + garis yarn), 2 plank-bench bertingkat, 3 TowelPerson sit di ~[0.2..1.2, 0.9, −0.9], Kiuas di [−1.5,0,−0.5], teoke bucket; uap Smoke besar dari batu saat t 36–40 (gayung siram 35.5).
   - F: hutan senja, SaunaCabin tint soot chimney=false, Smoke abu dari dinding; interior gelap di z −10.6: hourglass GLB + Kiuas ember.
   - G: rumput, 3 porch-log-cabin (desa atlet), SaunaCabin, FinnFlag, SignBoard "SAUNA · AUDIRA" di [1.0,0,1.6], TowelPerson antre.
   - H: Lake lakeDusk, SaunaCabin hero + SignBoard "AUDIRA" di dinding/depan, dock-platform + wooden-rowboat bergerak, pines.
   Brand AUDIRA di dunia 3D: SignBoard di G dan H.
2. `project/src/episode/SaunaFilm.tsx`: t=frame/fps; f=t*60; cam=cameraAt(t); scene=shotAt(t).scene; lampu per scene (A/B/C siang dingin-hangat, D/E/F hangat redup tapi latar menengah bukan navy, H senja); FilmScene profile DOCUMENTARY_WARM exposure 0.82 envIntensity 0.25 ao hdri warmStudio; overlay = kartu CARDS (krem stitched seperti kit Overlay, KineticCounter-like angka koma Indonesia) + Subtitle words vo-words.json position 1300; Voiceover src "audio/vo.wav" offset 0; AudiraSignature seed "finlandia-sauna-ep59" outroSeconds 3 (lapisan terakhir); AudiraOutro seconds 3.
3. Root.tsx: tambah SaunaPreview (PRESETS.preview) + SaunaFinal (PRESETS.final), durationInFrames FILM_SECONDS*fps.
4. `npm run typecheck`, `npm run stills -- out/s 2s,9s,13s,20s,26s,31s,37s,45s,50s,55s,62s,67s,73s SaunaPreview`, cek contact sheet kecil, poles.
5. cover: `npm run cover -- SaunaPreview --episode=..` → style/cover-topic.png. `npm run sfx` (SHOTLIST di ../docs).
6. Tahap 8: draft/THEME_CHECK.md (G22), `npm run draft -- SaunaPreview`, audit:visual, audit:camera, record_score self lalu juri buta subagen (qa/jury.md) judge jury.
7. Tahap 9: BERHENTI, minta acc pengguna (contact sheet, skor juri, durasi 82 dtk, G18c).

## Catatan dari sesi EP56 (2026-11-23)
- `npm run channel` sudah dijalankan di s2 (channel.json = @AudiraFaktaDunia). Cek lagi sebelum gerbang final.
- Overlay `FilmScene` sudah di-scale (container 1080×1920 × fmt.scale). `Subtitle`, `AudiraSignature`, dan `AudiraOutro` memakai useFormat dan men-scale sendiri. JANGAN taruh ketiganya di dalam `overlay={...}`. Taruh sebagai sibling di luar `FilmScene` (AbsoluteFill). Kalau terpaksa di dalam overlay, bungkus dengan `transform: scale(1/scale)`. Kartu HUD custom (CARDS) boleh di dalam overlay memakai px layout 1080×1920.

---
# HANDOFF s3 → s4 (2026-11-24)

## Selesai di s3
- `project/src/episode/scenes.tsx` (SceneA–H, Pawn, LetterTile, Ladle, sangkar tambang), `SaunaFilm.tsx` (LOOK per scene, HudCard felt stitched, SUB_WORDS ejaan layar Pyhäsalmi/löyly/AUDIRA, Subtitle pos 1290 size 52 maxWords 5, Voiceover, AudiraOutro, AudiraSignature lapisan terakhir), Root.tsx (`SaunaPreview`, `SaunaFinal`). Typecheck bersih (error lain di core/qa & PenggantiGibran = bawaan starter).
- Poles: `src/core/hud/Subtitle.tsx` gap kata 0.4em + opacity kata belum 0.62 (salinan proyek). `textTexture` auto-shrink font. Huruf SAUNA dipersempit; kamera G2 mundur; 3 kabin A sudah ada di frame 0.
- Stills audit terakhir: tidak ada aspek ≤3 (composition 5, readability 4).
- Cover: `style/cover-topic.png` 1080×1920 (SaunaFinal 0.3 dtk) + `cover_1080x1350.png`.
- SFX: `project/public/audio/sfx.wav` 82 dtk, −26 LUFS, 36 suara.
- `draft/THEME_CHECK.md` (G22) semua ya.
- Draf dijalankan: `npm run draft -- SaunaPreview --frames=2s,13s,20.5s,28s,37s,55s,62s,73s` (output ke draft/).

## Sisa
1. Cek hasil draft (draft/DRAFT_SHEET.jpg, look.json, camera.json). record_score self (FELTCRAFT, stage draft, ceilings+camera) lalu juri buta subagen (qa/jury.md di project) → record_score judge jury.
2. Tahap 9: BERHENTI, minta acc pengguna: contact sheet, skor juri, durasi 82 dtk, G18c (VO ≥12 LU di atas SFX).
3. Setelah acc: `npm run render:final -- --comp=SaunaFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --title=... --slug=finlandia-sauna --ep=EP59 --jobs=4 --concurrency=2 --gl=vulkan --encoder=nvenc` (background), QA, captions, NOTES, memori, 3 scheduled review.

## Update akhir s3
Draf SELESAI: `npm run draft` → ceilings lighting/material/depth/composition/readability = 5, diversity 67, camera motion 5/5, "OK: no aspect capped below 4". File: draft/DRAFT_SHEET.jpg, compare.jpg, DRAFT_REPORT.json, jury_input.json, CHECK_43-61s.mp4. JANGAN render draf ulang.
Langkah s4: record_score self → juri buta subagen → record_score jury → gerbang acc.

# HANDOFF s4 → s5 (2026-11-24) — GANTI STYLE ke WORLDFORGE

## Hasil s4
- Juri buta FELTCRAFT: r1 3.00, r2 3.33 (material 2) → batas 2 putaran, skor < 3.5 → ganti style (lesson failed sudah dicatat di motion memory FELTCRAFT).
- Poles s4 yang TETAP berguna (sudah di kode): counter HUD 0.35 dtk (`SaunaFilm.tsx`), subtitle size 56 maxWords 4 plate krem 0.97 teks #2B170C (`SaunaFilm.tsx`), opacity kata belum 0.8 (`core/hud/Subtitle.tsx`), terowongan tambang batu + lengkung kayu + rel (`scenes.tsx` MineBoulders, kamera D kunci akhir `[0.5,-12.75,3.6]` fov 48), interior F bench+bucket+2 lampu, LOOK E/F `ki`.
- `core/assets/AssetModel.tsx` punya prop baru `felt` (box-UV fibre). Untuk WORLDFORGE: HAPUS `felt` dari semua `<AssetModel felt ...>` di `episode/parts.tsx` + `scenes.tsx` (sed `s/<AssetModel felt /<AssetModel /`), pakai material asli / `polish` kayu.
- G18c lolos: VO loudnorm −16 vs SFX efektif −30 LUFS = 14 LU. `render-final.mjs` graph G18 benar. channel.json = @AudiraFaktaDunia.

## Sisa (s5)
1. `audira_motion_style_guide` WORLDFORGE + `audira_style_memory get WORLDFORGE` (best: DOCUMENTARY_WARM, exposure 1, envIntensity 0.55, ao, hdri sky; avoid: ToyPerson + rumput datar dinilai plastik, kartu gelap untuk kontras). Cover acuan `F:/AUDIRA-SKILL-MOTION/references/quality-bar/worldforge.jpg`.
2. Tahap 4 ulang (G21): ART_DIRECTION, STORYBOARD, ASSET_MANIFEST, SHOTLIST, SCRIPT → baris `Style: WORLDFORGE`. Naskah/VO tetap.
3. Kode: material realistis (hapus felt; salju putih kebiruan, es danau reflektif, kayu `polish`), hdri sky, exposure ~1, env 0.55; HUD card non-felt (kartu gelap rgba(20,14,12,0.82) atau krem tanpa jahitan); Fuzzy puff asap boleh. Ganti primitif felt huruf SAUNA → papan kayu realistis. Perbaiki F6 jam pasir kosong (tambah bangku/kiuas di frame) dan kabin terpotong F2/F4/F8.
4. Cover topik baru `style/cover-topic.png` (SaunaFinal 0.3 dtk), update `draft/THEME_CHECK.md`.
5. `npm run draft -- SaunaPreview --frames=2.4s,13s,20.5s,28s,37s,55s,62s,73s` → self → juri buta (F:/AUDIRA-SKILL-MOTION/qa/jury.md + draft/jury_input.json + cover worldforge.jpg) → record_score jury (style WORLDFORGE, episode sejarah-negara-EP59).
6. Gerbang tahap 9 (acc pengguna) → render final (perintah di task asli: `npm run render:final -- --comp=SaunaFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --title="Finlandia: 3 Juta Sauna" --slug=finlandia-sauna --ep=EP59 --jobs=4 --concurrency=2 --gl=vulkan --encoder=nvenc`) → QA, captions, NOTES, memori, 3 scheduled review.

# HANDOFF s5 → s6 (2026-11-24) — WORLDFORGE poles r2 (putaran juri TERAKHIR)

## Hasil s5
- Felt dihapus total. Material baru `project/src/episode/materials.ts` (`real()` pilih kayu/batu/salju/cat dari warna; `rockGeometry`), `parts.tsx` (`mat`, `Shape`, `SPHERE/CYL/CONE/ROCK`, `Ground`, `Parliament`), `core/assets/AssetModel.tsx` prop baru `grain="wood|stone|snow"` + `grainTiles` (box-UV + peta prosedural). SaunaFilm: hdri `sky`, exposure 0.95, env 0.55, kartu HUD gelap rgba(20,14,12,0.82) + aksen atas.
- F6 interior sauna asap: bangku + kiuas dirapatkan ke jam pasir, kamera F2 lebih lebar (timeline.ts 52.1–58.6).
- Docs tahap 4 (ART_DIRECTION, STORYBOARD, ASSET_MANIFEST, SHOTLIST, SCRIPT, THEME_CHECK) = `Style: WORLDFORGE`. Cover topik baru `style/cover-topic.png`. `npm run sfx` ulang (−26 LUFS, 36 suara). G18c tetap lolos (VO −16 vs SFX efektif −30 = 14 LU).
- Skor draf r1: self 4.0, **juri buta 3.67 PERLU POLES** (lighting 3, material 3, depth 3, composition 4, motion 5, readability 4). Lesson failed sudah dicatat.

## Kritik juri r1 → poles r2
1. Masih terbaca diorama low-poly mainan. Lighting: matahari rendah samping-belakang (key lebih rendah, hangat), kabut/haze lapis BG agar MG/FG terpisah, kontak shadow lebih tegas.
2. F3 (20.5 s) apartemen = kotak putih polos → beri fasad beton abu + jendela menyala hangat (emissive), atau ganti GLB apartemen lain (`audira_search_assets`).
3. F6 (55 s) interior sauna asap coklat gelap kosong → dinding kayu hitam jelaga bertekstur, berkas cahaya dari celah, figur berhanduk di bangku, asap tipis di langit-langit.
4. F4 (28 s) tambang terbaca "kabin" → tonjolkan terowongan: rel + lori di FG, lampu gantung, dinding batu gelap, kabin lebih kecil/jauh.
5. F5/F6 tambahkan figur di sauna. Uap: ganti bola transparan dengan sprite lembut (plane billboard + tekstur radial gradient, additive, depthWrite false).
6. F7 Berlin 1936: tambah petunjuk stadion/tiang bendera berderet (JANGAN cincin Olimpiade — merek dagang, lihat catatan THEME_CHECK).

## Langkah s6
1. Poles di atas → `cd project && npm run draft -- SaunaPreview --frames=2.4s,13s,20.5s,28s,37s,55s,62s,73s`.
2. Perbarui `draft/THEME_CHECK.md` bila subjek frame berubah.
3. record_score self, lalu juri buta r2 (subagen baru, F:/AUDIRA-SKILL-MOTION/qa/jury.md + draft/DRAFT_SHEET.jpg + quality-bar/worldforge.jpg; tanpa skor lama).
4. Juri r2 LOLOS, atau terbaik ≥ 3.5 setelah 2 putaran (r1 sudah 3.67 → final pasti boleh dengan draf terbaik) → **gerbang tahap 9**: tampilkan contact sheet, skor juri, durasi 82 dtk (VO 78.95), G18c; tunggu acc pengguna. Jangan render final tanpa acc. Catat "diterima <skor> setelah 2 putaran" di NOTES.md bila tidak LOLOS.
