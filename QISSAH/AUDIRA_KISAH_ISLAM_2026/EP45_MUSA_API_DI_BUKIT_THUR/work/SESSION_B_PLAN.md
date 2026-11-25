# EP45 Sesi B — status & rencana kode (ditulis s2, 2026-11-24)

## Sudah selesai
- **Scaffold** `project/`: starter AUDIRA-SKILL-MOTION disalin dengan robocopy (`new-project.mjs` gagal EPERM di junction `public/models/polyfork/*`; kit paperworld berproject sendiri = proyek "book" tanpa vo/sfx/draft, jadi TIDAK dipakai). Junction: `project/node_modules` -> `F:/AUDIRA-SKILL-MOTION/node_modules`, `public/models/polyfork/{animal,prop,attachment,...}` -> `E:/ASET/ASSET-AUDIRA/downloads/glb/*`. Kit R3F ada di `src/kits/paperworld/` (Stage, Cut, Print, Hinge, PopUp, ShearPop, PaperHill, PaperTree, PaperBush, PaperCloud, PaperLamp, PaperBuilding, Thread, paperFace, S.* shapes incl. `S.star`, `S.crescent`). `check-env` ok, `smoke` ok (out/smoke/_sheet.jpg).
- **Channel**: `src/brand/channel.json` diset manual ke @AUDIRAQISSAH + `channels.QISSAH`. SERIES.json seri ini menulis handle @AudiraExplained (stale, file bersama, jangan diubah dari sini) dan `npm run channel`/render:final bisa menimpa channel.json → pakai `<AudiraSignature seed="kisah-islam-EP45" code="QISSAH" />` dan `<AudiraOutro code="QISSAH" />`; cek ulang channel.json sebelum render final.
- **VO dikunci**: `project/public/audio/vo.wav` 91,30 dtk, `vo-words.json` 199 kata (field `text,start,end`), `vo.timing.json` (npm run vo). Teks spoken di `work/vo-spoken.txt` (Tuwa, Al Quran, Audira). Caption tampil harus mengganti "Tuwa."→"Thuwa.", "Al Quran"→"Al-Quran". Lafal "Audira" (w198, 91,01–91,27) belum dicek telinga → cek di G18c Sesi C.
- **Timing**: `project/src/ep45/timing.ts` (T = cut scene, A = anchor beat, CUTS, FILM_SECONDS 94,6 = VO + 0,3 + outro 3).

## Belum (tahap 7–8)
Bangun di `project/src/ep45/` lalu daftarkan `Ep45Preview` (540×960@30) dan `Ep45Final` (1080×1920@60) di `src/Root.tsx`, durasi `FILM_SECONDS`.

### API penting
- Pola film: `FilmScene` (`src/core/scene/FilmScene.tsx`, props frame, shot{pos,target,fov}, background, post={false}, profile=COLOR_PROFILES.DOCUMENTARY_WARM, exposure 0.9–1.0, envIntensity 0.25, overlay={(scale)=>...}) membungkus `<Stage shot light frame center>` dari kit (lihat `src/kits/paperworld/example/PaperworldExample.tsx`). Shot Stage butuh focus/aperture/maxBlur.
- Light malam: dir ke arah api, key "#ffb46a", keyI ~2.2, fill "#5b6fa8" ~0.5, hemiI ~0.5, bg "#141b30", fog biru gelap.
- `AssetModel` (`src/core/assets/AssetModel.tsx`) TIDAK memberi paperFace → tulis `PaperGlb` sendiri (GLTFLoader + delayRender/continueRender seperti AssetModel, ganti tiap mesh material dengan `paperFace(origColorHex)` + flatShading; size/ground normalisasi via Box3). Path: `staticFile("models/polyfork/animal/sheep-base.glb")` dst. GLB terkonfirmasi ada: animal/sheep-base, animal/goat-base, animal/camel-base, prop/campfire-4390aa, prop/canvas-ridge-tent-f0df0d, attachment/hand-lantern-cdbe1a, prop/creosote-bush-5b17d5, prop/bare-thorn-bush-91a238, prop/basalt-boulder-a1929c.
- Caption: `Subtitle` (`src/core/hud/Subtitle.tsx`) words, frame, fps, position={1300}, activeColor "#FFC861", size ~52.
- Brand: `src/brand/AudiraSignature.tsx`, `src/brand/AudiraOutro.tsx` (seconds 3). `<Audio src={staticFile("audio/vo.wav")} />`.
- Font HUD: `@remotion/google-fonts/Anton` + `/Lora` (italic) loadFont.

### Figur (adab)
`PaperCharacter` kit punya wajah → JANGAN dipakai untuk Musa/Harun. Buat `Robed` dari Cut: jubah trapesium (atas 1.4, bawah 2.4, tinggi 4.6) + lapis dalam lebih terang + Print garis lipatan; tudung `S.arch(1.5,2.0)` dengan Print oval gelap di depan (wajah tertutup bayangan); tongkat rect; lengan Hinge untuk menunjuk. Selalu dari belakang/siluet. Keluarga & Harun = Robed warna lain/skala kecil. Allah tidak divisualkan: hanya cahaya pohon + pita ayat. Firaun tidak digambar (istana saja).

### 8 set (waktu dari timing.ts)
| Set | Waktu | Isi | Kamera | HUD |
|---|---|---|---|---|
| S1 | 0–8.2 | langit navy + bintang `S.star` Print + bulan `S.crescent` di Thread, 4–5 PaperHill biru-ungu berlapis, Bukit Thur tinggi tengah, api (kartu lidah api emissive + pointLight oranye) di lereng menyala di A.apiNyala, FG creosote blur di sudut bawah | dolly maju rendah + tilt naik ke api | judul "API DI BUKIT THUR" di 3.0 |
| S2 | 8.2–23.1 | dataran bukit pasir, Musa dari belakang memimpin 2 figur keluarga + 4 domba + 2 kambing + 1 unta (paperGlb), kotak bekal di unta dengan print "AUDIRA" (brand in-world, CanvasTexture), tenda ShearPop di A.dingin tanpa api, pasir kertas melayang | tracking samping lalu push-in ke tenda | "PULANG DARI MADYAN · QS AL-QASAS : 29" @A.madyan; "TANPA API · TANPA JALAN" @A.tanpaApi |
| S3 | 23.1–37.1 | jalan setapak zig-zag lereng + batu basal, Musa menunjuk ke atas (lengan Hinge) api di frame atas, lentera GLB menyala @A.sesuluh, mendaki @A.mendaki, perkemahan kecil di bawah | crane naik over-shoulder | pita "“Tunggulah di sini, aku melihat api” · QS TAHA : 10" @A.tunggulah; "BUKIT THUR" @A.thur |
| S4a | 37.1–41.7 | pohon kertas berlapis (PaperTree cloud x3) emissive putih-emas + kartu berkas cahaya transparan, reveal dari balik batu | rise dari bawah batu ke pohon | pita "Dipanggil dari arah pohon · QS AL-QASAS : 30" |
| S4b | 41.7–46.0 | makro top-down sepasang terompah kertas (Cut+Print tali) diletakkan di pasir, cahaya emas dari atas | top-down push-in | pita "“Lepaskan kedua terompahmu” · QS TAHA : 12"; "LEMBAH SUCI THUWA" @A.thuwa |
| S5 | 46.0–57.9 | lingkaran pasir, pohon glow blur di BG, tongkat jatuh @A.lempar, berubah jadi ular rantai segmen Cut (sinus) @A.ular, Musa mundur siluet FG @A.mundur, ular kembali lurus @A.kembali | low-angle dekat tanah, pan ikut ular | "TANDA 1 · TONGKAT JADI ULAR" @A.ular; pita "“Jangan takut”" @A.janganTakut |
| S6 | 57.9–67.6 | makro lengan jubah + tangan kertas keluar dari lipatan, emissive putih + bloom @A.bercahaya, bokeh pohon BG | push-in makro | "TANDA 2 · TANGAN BERCAHAYA" @A.bercahaya; stempel besar "9 MUKJIZAT · QS AN-NAML : 12" @A.sembilan (impact) |
| S7 | 67.6–82.8 | tepi lereng, langit fajar ungu-emas, istana + piramida kertas (PaperBuilding facadeOnly + S.poly) ShearPop @A.istana, Musa dari belakang menghadap cakrawala, siluet Harun pop di samping @A.harun | orbit lalu aerial naik | pita "“Pergilah kepada Firaun” · QS TAHA : 24" @A.diutus; "“Lapangkan dadaku, mudahkan urusanku” · QS TAHA : 25–26" @A.berdoa; "HARUN · PENDAMPING" @A.harun |
| S8 | 82.8–91.6 | wide seluruh diorama: gunung + cahaya kecil di puncak, perkemahan di bawah, papan kertas "AUDIRA QISSAH" (CanvasTexture) di FG | pull-back aerial | "NAIK: MENCARI API" @A.naik; "TURUN: MEMBAWA RISALAH" @A.turun |
| Outro | 91.6–94.6 | AudiraOutro | | |

Tiap set: FG DOF (semak/batu blur di sudut bawah), haze hanya BG–MG, bayangan panjang searah api, label ≥ 40 px di y 236–520 (x 60–1020), kaki subjek ≤ y 1290. Transisi: kertas sobek wipe 0,35 dtk di tiap CUTS (overlay) supaya tidak hard cut kosong.

### Lalu
1. `node scripts/stills.mjs style 0.4s Ep45Preview` → salin frame hook ke `style/cover-topic.png` (1080×1920: render dari Ep45Final satu frame), tampilkan.
2. `SHOTLIST.md` (format lihat `npm run lint:shotlist`) + `npm run sfx` (G18, stem −26 LUFS).
3. `node scripts/qa-scene.mjs --comp=Ep45Preview --cuts=<CUTS>`.
4. `draft/THEME_CHECK.md` (G22) + `npm run draft -- Ep45Preview` (contact sheet + audit:visual + camera) → `record_score` self, lalu juri buta subagen (qa/jury.md). Maks 2 putaran.

## Progres s3 (2026-11-24, kena context guard)
Ditulis, BELUM typecheck/belum dilihat still:
- `project/src/ep45/parts.tsx`: PaperGlb (GLTFLoader + SkeletonUtils.clone + paperFace flatShading, vertexColors bila tanpa tint; GLB tak punya baseColor, pakai `tint`), Robed (MUSA/HARUN/FAMILY_A/FAMILY_B; props raise, pray, walk, staff, children; hadap -z, punggung ke kamera +z, oval gelap di depan tudung), Flame (lit, scale, light, range; pointLight), Glow (sprite additive), TextBoard (CanvasTexture "AUDIRA"), SkyCard + NIGHT_SKY, NightMobile (bintang/bulan bertali), Sandal, StaffSnake (m 0 tongkat → 1 ular, 20 bola segmen), GlowTree, Beam, Flecks.
- `project/src/ep45/sets.tsx`: s1..s8 (S4a/S4b dipisah di A.terompah), tiap set → {id, shot, light, center, node}; `pickSet(s)` director. Solid tag "musa", "tongkat", "tangan".
Nilai cahaya pointLight (Flame light 900/800/500, GlowTree 90) dan posisi kamera BELUM dikalibrasi: cek still, sesuaikan.

## Sisa (mulai di sini)
1. Tulis `project/src/ep45/Hud.tsx`: item {at, until, kind ribbon|tag|title|stamp, text, sub} — daftar: title "API DI BUKIT THUR"/"Kisah Nabi Musa" 3.0–8.0; tag "PULANG DARI MADYAN"/"QS AL-QASAS : 29" 10.6–15.5; tag "TANPA API · TANPA JALAN" 20.34–23.0; ribbon "“Tunggulah di sini, aku melihat api”"/"QS TAHA : 10" 24.6–30.0; tag "BUKIT THUR" 35.4–37.0; ribbon "Dipanggil dari arah pohon"/"QS AL-QASAS : 30" 38.4–41.6; ribbon "“Lepaskan kedua terompahmu”"/"QS TAHA : 12" 41.8–45.9 + tag "LEMBAH SUCI THUWA" 43.59–45.9 (slot 2); tag "TANDA 1"/"TONGKAT JADI ULAR" 49.44–54.2; ribbon "“Jangan takut”"/"QS TAHA : 21" 54.27–57.8; tag "TANDA 2"/"TANGAN BERCAHAYA" 60.6–65.4; stamp "9 MUKJIZAT"/"QS AN-NAML : 12" 65.57–67.5; ribbon "“Pergilah kepada Firaun”"/"QS TAHA : 24" 68.44–73.5; ribbon "“Lapangkan dadaku, mudahkan urusanku”"/"QS TAHA : 25–26" 73.64–79.5; tag "HARUN"/"PENDAMPING" 79.69–82.7; tag "NAIK"/"MENCARI API" 83.08–91.5; tag "TURUN"/"MEMBAWA RISALAH" 86.18–91.5 (slot 2). Ribbon slot y≈250, tag slot y≈470, slot 2 y≈640; x 60–1020; teks ≥40 px; font Anton + Lora italic (`@remotion/google-fonts/Anton`, `/Lora` loadFont). Pakai `OverlayLayer` dari kit (layout 1080×1920). Plus `Tears`: wipe kertas sobek 0,36 dtk di tiap `CUTS` (panel ivory 2400 px, tepi bergerigi clip-path, translateY 1920→-2400 berpusat di cut).
2. Tulis `project/src/ep45/Ep45.tsx`: s=frame/fps; `const f = pickSet(s)`; `<FilmScene frame shot={{pos,target,fov}} background={f.light.bg} post={false} profile={COLOR_PROFILES.DOCUMENTARY_WARM} exposure={0.95} envIntensity={0.25} near={0.08} far={900}><Stage shot light frame center>{f.node}<QaProbe/></Stage></FilmScene>`; overlay HUD + Tears + `Subtitle` (words dari `public/audio/vo-words.json` via import JSON, ganti "Tuwa."→"Thuwa.", gabung "Al"+"Quran"→"Al-Quran", "Audira"→"AUDIRA"; position 1300, size 52, activeColor "#FFC861") dibungkus `qaNoOverlay()`; `<Sequence from={T.outro*fps}><AudiraOutro code="QISSAH" seconds={3}/></Sequence>`; `<AudiraSignature seed="kisah-islam-EP45" code="QISSAH" />`; `<Audio src={staticFile("audio/vo.wav")} />`.
3. Root.tsx: `Ep45Preview` (preview preset, durationInFrames Math.round(FILM_SECONDS*fps)) + `Ep45Final`.
4. `npm run typecheck`, lalu `node scripts/stills.mjs draft/stills 2s,5.6s,12s,18s,26s,34s,39s,43s,50s,53s,61s,66s,72s,80s,85s,89s Ep45Preview` → periksa satu sheet kecil, kalibrasi cahaya/kamera.
5. Cover: render frame 5.6s dari Ep45Final → `style/cover-topic.png`.
6. SHOTLIST.md (`npm run lint:shotlist`) + `npm run sfx`; qa-scene `--cuts=8.2,23.1,37.1,41.7,46,57.9,67.6,82.8,91.6`; THEME_CHECK; `npm run draft -- Ep45Preview`; record_score self + juri buta. Maks 2 putaran.

## Progres s4 (2026-11-24)
- Ditulis `src/ep45/Hud.tsx` (Hud 17 item, Tears wipe di CUTS, `Caption` karaoke sendiri di layout px — `core/hud/Subtitle` dobel-skala di overlay FilmScene, jangan dipakai), `src/ep45/Ep45.tsx`, `Ep45Preview`/`Ep45Final` di `src/Root.tsx`. Typecheck bersih (error tersisa hanya starter: scene-qa.tsx `indirect`, PenggantiGibran `spring`).
- Fix: `Glow` sprite disembunyikan dari pass override GTAO/Bokeh (`hideFromOverrides`) — sebelumnya kotak gelap di sekitar api/bulan. Kontras sub ribbon `#7a4a14`, stamp `#b4421a`. S1 cahaya bulan sebelum api (key biru, dir kiri atas), target kamera ke api (api di bawah judul). S6 tangan path 5 jari, glow diredam. S4b sandal key 1.25 ground `#8f7354`.
- `node scripts/stills.mjs ../draft/stills ... Ep45Preview` → look.json ceilings semua 5 (lighting 5, readability 5).
- `style/cover-topic.png` 1080×1920 dirender (Ep45Final frame 336 = 5.6 s).
- Sisa: SHOTLIST.md + `npm run sfx`, qa-scene `--cuts=8.2,23.1,37.1,41.7,46,57.9,67.6,82.8,91.6`, `draft/THEME_CHECK.md`, `npm run draft -- Ep45Preview`, record_score self + juri buta.
- s4 lanjut: `project/SHOTLIST.md` (+ salinan `docs/SHOTLIST.md`) lint OK (0 red); `npm run sfx` → `public/audio/sfx.wav` 94,6 s, 35 bunyi, −26,0 LUFS, TP −4,9 dBFS.
- Sisa untuk s5: (1) qa-scene `audira_qa_scene` project=<EP45>/project comp=Ep45Preview cuts=8.2,23.1,37.1,41.7,46,57.9,67.6,82.8,91.6; (2) `draft/THEME_CHECK.md` G22 (frame kunci = subjek sesuai kata VO; frame stills: 2s Musa+bukit malam, 5.6s api di lereng, 12s rombongan+unta, 18s tenda, 26s Musa menunjuk api, 34s mendaki, 39s pohon bercahaya, 43s terompah, 50s ular, 53s Musa mundur, 61s tangan bercahaya, 66s 9 MUKJIZAT, 72s istana fajar, 80s Harun, 85s gunung naik, 89s diorama+papan AUDIRA); (3) `npm run draft -- Ep45Preview` (contact sheet + audit:visual + camera); (4) record_score self lalu juri buta subagen (qa/jury.md), maks 2 putaran; (5) handover newSession → Sesi C.
- Catatan visual untuk juri/poles: S6 tangan agak bloom & lubang lengan gelap (bisa dibaca aneh); S2 unta dominan frame; ular S5 = rantai bola (baca seperti manik).

## Progres s5 (2026-11-24)
- qa-scene + qa-video PASS (`draft/qa-scene.json`). Jalankan qa-scene dengan `--concurrency=1`: part dicocokkan lewat `mesh.id` three.js (counter per tab), dengan 2 tab muncul flick palsu tepat setelah cut. Fix nyata: S4a kamera mulai [1.6,3.6,15] + batu 4.5 di [-2.4,0,8] (dulu 1,3 dtk layar hitam batu); S5 lengan `lift` naik-tahan-turun (dulu raise lompat); S7 tongkat tetap saat berdoa. `draft/qa-video.review.json` berisi verdict ok untuk CHECK yang memang desain.
- Draft r1: `npm run draft -- Ep45Preview --frames=2s,12s,26s,39s,50s,61s,72s,89s` → `draft/DRAFT_SHEET.jpg`, ceilings semua 5, camera 5. `draft/THEME_CHECK.md` 8 baris (F1–F8) diisi.
- Skor r1: self 4.0; **juri 3.17 PERLU POLES** (lighting 3, material 3, depth 4, composition 2, motion 5, readability 2). Lesson failed sudah ditulis.
- Kritik juri r1 → rencana poles r2 (putaran terakhir):
  1. **F5 ular (50 s, S5)**: `StaffSnake` = deret bola → G22 gagal. Ganti jadi ular kertas yang jelas: badan tube/pita kertas tebal meliuk (mis. CatmullRom + TubeGeometry atau rangkaian Cut pipih bersambung), kepala segitiga terangkat dengan lidah, sisik print; ukuran besar di tengah frame; kamera S5 lebih dekat ke ular, Musa jangan siluet besar terpotong kiri.
  2. **F7 (72 s, S7, "melampaui batas")**: istana Mesir harus jadi subjek: bangunan istana/piramida besar di tengah (PaperBuilding/GLB), Musa kecil di FG kanan/bawah, tidak terpotong. Firaun tetap tidak digambar.
  3. **Siluet FG besar terpotong kiri** di F3 (26 s, S3) dan F7: geser Musa ke dalam frame / perkecil / kamera mundur.
  4. **Bloom**: pohon F4/F5 (`GlowTree` glow) dan tangan F6 jadi blob putih: turunkan opacity Glow/Beam ±40 %, jaga bentuk lobus pohon terbaca.
  5. **Material**: Musa slab gelap → naikkan warna jubah sedikit + rim light/tepi kertas terang; domba (F1/F2) jangan putih plastik (tint krem + flat paper).
  6. F1: Musa terlalu kecil di tepi kiri → dekatkan. F8: papan AUDIRA terpotong kanan → geser ke dalam frame.
- Setelah poles: typecheck, qa-scene `--concurrency=1` ulang, draft r2 (frame sama), isi ulang THEME_CHECK, self + juri buta r2 (prompt juri = qa/jury.md, hanya DRAFT_SHEET + `F:/AUDIRA-SKILL-MOTION/references/quality-bar/paperworld.jpg` + ceilings + camera + kolom Kata VO). r2 ≥3.8 tanpa <3 → LOLOS; else terbaik ≥3.5 diterima (NOTES.md + append_lesson failed); <3.5 → style baru (G21).
