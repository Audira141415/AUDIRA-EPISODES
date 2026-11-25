# HANDOFF — EP06 Easter Egg Pertama yang Terkenal di Game (AUDIRA TECH, @AudiraTECH)

Ditulis 2026-11-23 oleh sesi pertama (konteks penuh). Baca file ini dulu, lalu `STATUS.json` (audira_episode_status get).

## Tugas
Short 2D 9:16, 80–90 dtk, 1080×1920@60, channel AUDIRA TECH. Pipeline 11 tahap global (`C:\Users\ASUS\.claude\CLAUDE.md`).
Hanya ubah folder ini. Folder saudara (EP01–EP10 di `AUDIRA_SHORT_BARU_2026_11_23`) dikerjakan sesi lain secara paralel: jangan disentuh.
Ilustrasi buatan sendiri: tanpa logo Atari, tanpa tangkapan layar/sprite asli Adventure. Tokoh nyata (Warren Robinett, Adam Clayton, Steve Wright) = sprite generik/siluet + name card, tanpa kemiripan wajah. Chip pojok "ILUSTRASI, BUKAN CUPLIKAN ASLI".

## Sudah selesai
- Tahap 2 riset: `research/SOURCE_REGISTER.md` (F1–F13). Framing wajib: Adventure BUKAN easter egg pertama mutlak (Moonlander 1973 lebih tua); Adventure = easter egg pertama yang dikenal luas dan asal istilah "easter egg".
- Tahap 3 gerbang style: pengguna memilih **PIXELSTORY** (STATUS style approved). Belum: render cover topik `style/cover-topic.png`, `style/STYLE_DECISION.md` (alasan, alternatif ditolak: ARCADECRT = lebih gelap/CRT, PANELVERSE = komik kurang terasa game; approved: yes; baris `Style: PIXELSTORY`), salin `F:/AUDIRA-ALL-SKILL/assets/style-covers/pixelstory.jpg` → `style/cover-reference.jpg`.
- Studio Remotion disiapkan di `project/` (salinan studio seri `F:/AUDIRA-EPISODES/AUDIRA_FAKTA_OLAHRAGA_2026/studio` tanpa scene episode lain; `node_modules` = junction ke `F:/AUDIRA-EPISODES/AUDIRA_SEJARAH_SEPAK_BOLA_2026/studio/node_modules`). `project/src/Root.tsx` MASIH berisi import EP01–EP05 lama: tulis ulang hanya untuk Ep06 (Cover, Preview, Final) dengan `signed()` + AudiraSignature seed `easter-egg-EP06` + AudiraOutro.
- `_tools/` berisi vo.py, vo_tighten.py, make-timeline.py dari seri fakta-olahraga (VO Cartesia dari `docs/script-lines.json`; jalankan dari folder yang punya `scripts/tts-cartesia.mjs` — cek path `ep = parent.parent / argv[1]` dan sesuaikan).

## Referensi kode (episode gold PIXELSTORY, juri final 4.0)
`F:/AUDIRA-EPISODES/AUDIRA_FAKTA_OLAHRAGA_2026/studio/src/scenes/ep01/` — timing.ts (W(id,i,expect) dari timeline.json, CUT, sceneAt, WIPES), ArenaShot.tsx (set albedo + lights + SpriteView), sets.ts (createAlbedo/painter), sprites.ts (drawer ASCII sprite + finish), hud.tsx (Pop, Chip, NameCard, Stamp, LevelBanner, Wipe, Captions karaoke), Film.tsx (scene per CUT). NOTES.md episode itu: perintah render:final lengkap, masalah EPERM/sign, qa_video --allow untuk flash sengaja.
Kit: `F:/AUDIRA-SKILL-MOTION/kits/pixelstory/KIT.md` (sudah ada di `project/src/kits/pixelstory`).
Pelajaran memori PIXELSTORY (wajib): beda set/sudut tiap beat; lantai bertekstur + dither; maks judul + 1 chip per frame; Stamp ≤ 860 px tanpa rotasi di adegan aksi; chip seri ≥ 250 px dari atas; frame contact sheet ≥ 0,3 dtk dari cut; isi bagian bawah set close-up.
Pelajaran GLOBAL: tulis "Audira" (bukan AUDIRA) di teks VO; true peak final ≤ −1,5 dBTP (alimiter); rename EPERM → pakai mv di bash.

## Rencana adegan (6 tahap, ±200 kata, VO Cartesia voice 04b567df-2923-4b0c-896b-4b7df0a07e1a)
1. HOOK (0–4 dtk): ruang rahasia pixel, tulisan berganti warna "CREATED BY WARREN ROBINETT" (teks buatan sendiri di dinding), kalimat: satu titik abu-abu seukuran satu piksel menyembunyikan nama yang dilarang muncul. "Ini Audira."
2. KONTEKS: Atari akhir 1970-an, ruang programmer; nama pembuat dihapus dari kotak game agar tidak dibajak pesaing; gaji ±US$22.000/thn tanpa royalti (chip angka).
3. PENGEMBANGAN: Robinett (sprite generik di meja + monitor) mengerjakan Adventure ±1 tahun (1978–1979); diam-diam menyembunyikan ruang + namanya; rilis Maret 1980; >1 juta kopi (counter).
4. PENJELASAN: cara masuk — ambil titik abu-abu 1 piksel di katakombe kastil hitam, bawa ke dinding lorong di bawah kastil emas, tembus dinding (peta pixel buatan sendiri, panah rute).
5. PAYOFF: remaja 15 thn Salt Lake City (Adam Clayton) menemukan → surat ke Atari; ganti chip ROM ±US$10.000 → Steve Wright: biarkan, sebut "Easter egg" seperti berburu telur Paskah; jadi kebijakan. Twist jujur: bukan yang pertama (Moonlander 1973), tapi asal istilahnya.
6. OUTRO: "Kamu pernah menemukan easter egg? Tulis di komentar. Ikuti Audira TECH ..." → AudiraOutro.

## Langkah berikutnya
1. STYLE_DECISION.md + cover-reference + cover topik (komposisi Ep06Cover, still 1080×1920, `npm run stills`).
2. docs: ART_DIRECTION → SCRIPT + STORYBOARD (≥6 baris, kolom Audio) → ASSET_MANIFEST; `docs/script-lines.json` (id per tahap, markup `{display|spoken}` untuk nama Inggris: Robinett, Atari, Adventure, Salt Lake City, Steve Wright, Easter egg).
3. VO (`audira_generate_voiceover` atau `_tools/vo.py tts` lalu `build`), timeline → `project/src/scenes/ep06/timeline.json`.
4. Scene code ep06 (PIXELSTORY), SFX (`npm run sfx` atau mix), contact sheet + THEME_CHECK + juri buta (subagent) → record_score draft.
5. render:final 60 fps dengan --vo --sfx, QA, metadata ffmpeg, FINAL_VIDEO.mp4, record_score final.
6. SOCIAL_CAPTIONS.md 6 platform + validator, NOTES.md, lesson memori, 3 scheduled task review.


---
## UPDATE sesi ke-2 (2026-11-23) — VO SUDAH DIKUNCI
Selesai di sesi ke-2:
- `style/cover-reference.jpg` disalin. BELUM: `style/STYLE_DECISION.md`, `style/cover-topic.png`.
- `docs/script-lines.json` final (190 kata, 6 id: hook, konteks, pengembangan, penjelasan, payoff, outro; markup {display|spoken} untuk Robinett, Adventure, Salt Lake City, Steve Wright, easter egg, TECH).
- VO Cartesia (MCP audira_generate_voiceover, speed 0.95, voice 04b567df...) → `audio/work/vo-raw.wav` + `vo-raw-words.json` (190 kata cocok).
- `_tools/vo_tighten.py .` (dijalankan dari folder EP06; GAP_IN 0.6, GAP_SEC 1.0) → `audio/vo.wav` + `audio/timeline.json`: bicara 77,28 dtk, 148 WPM.
- `_tools/make_timeline_ep06.py` → `project/src/scenes/ep06/timeline.json` (total 81,278 = voEnd + 4) + `project/public/audio/ep06/vo.wav`. JANGAN regenerasi VO.
- Awal section (dtk): hook 0.1 · konteks 6.827 · pengembangan 19.422 · penjelasan 35.739 · payoff 51.32 · outro 71.188. Indeks kata: jalankan `python _tools/make_timeline_ep06.py` (mencetak `i:kata@detik` per clip) untuk W(id,i,expect).
- Catatan: python lewat Bash tool gagal (uv_spawn) di folder ini → pakai PowerShell tool.

## Rencana adegan terkunci (cut = kata VO)
- A HOOK 0–6.83: ruang rahasia pixel gelap, titik abu-abu 1 px bersinar di tengah, dinding bertulisan "CREATED BY WARREN ROBINETT" berganti warna (teks buatan sendiri), kamera dorong ke titik; chip "1 PIKSEL"; label AUDIRA di dinding ruang. Cover = frame ini + judul "NAMA YANG DISEMBUNYIKAN" / "EASTER EGG PERTAMA YANG TERKENAL" + chip seri "AUDIRA TECH".
- B KONTEKS 6.83–19.42: gudang/kantor game akhir 1970-an, rak kotak cartridge generik tanpa logo; stamp merah menghapus "NAMA PEMBUAT" di kotak (10.11 "kotaknya"); chip "AKHIR 1970-AN", "NAMA PEMBUAT: DIHAPUS", "±US$22.000/TAHUN · 0 ROYALTI" (15.91 "Gajinya").
- C PENGEMBANGAN 19.42–35.74: kamar programmer malam: meja, monitor CRT dengan peta pixel, sprite generik dari belakang mengetik; NameCard WARREN ROBINETT / PROGRAMMER (20.13); "±1 TAHUN · 1978–1979" (21.36); "RUANG RAHASIA" (26.8); "RILIS MARET 1980" (30.98); penghitung 0→1.000.000 KOPI (33.25).
- D PENJELASAN 35.74–46.6: peta pixel top-down labirin kastil (desain sendiri): kastil hitam + katakombe, kastil emas + lorong; kotak pemain bawa titik abu-abu, panah rute; dinding tembus di 44.96 "Dindingnya". D2 46.6–51.32: kembali ke ruang rahasia, teks berganti warna, chip "DIBUAT OLEH WARREN ROBINETT".
- E1 PAYOFF 51.32–58.88: kamar remaja + TV + konsol generik, remaja menulis surat, amplop terbang; chip "15 TAHUN · SALT LAKE CITY" (51.78), "±US$10.000 · CHIP ROM BARU" (55.57).
- E2 58.88–66.80: kantor Atari (tanpa logo): NameCard STEVE WRIGHT / DIREKTUR PENGEMBANGAN SOFTWARE (59.75); telur-telur pixel bermunculan, Stamp "EASTER EGG" (62.16), chip "KEBIJAKAN: GAME BERIKUTNYA PUNYA RAHASIA" (64.72).
- F 66.80–71.19: timeline "1973 MOONLANDER → 1980 ADVENTURE", chip "BUKAN YANG PERTAMA · TAPI ASAL ISTILAHNYA".
- OUT 71.19–81.28: ruang rahasia lagi, chip komentar "PERNAH MENEMUKAN EASTER EGG?", panel "IKUTI AUDIRA TECH"; AudiraOutro 3,8 dtk terakhir (Root).

## Langkah berikutnya (sesi ke-3)
1. Tulis `style/STYLE_DECISION.md` + docs ART_DIRECTION, SCRIPT (salin teks dari script-lines.json + estimasi 190 kata/77 dtk), STORYBOARD (tabel di atas, kolom Audio), ASSET_MANIFEST.
2. Kode `project/src/scenes/ep06/` meniru gold `F:/AUDIRA-EPISODES/AUDIRA_FAKTA_OLAHRAGA_2026/studio/src/scenes/ep01/` (timing.ts, sets.ts, sprites.ts, hud.tsx, Film.tsx, Cover.tsx, index.ts). Material ramp tersedia: wood, woodDark, plaster, paper, metal, book1-3, leaf, sky, amberLamp, ivoryLit, teal, screen, dusk, mesa, stone, frame. Props kit: floor, nightWindow, shelf, books, desk, monitor, deskLamp, mug, keyboard, rug.
3. Tulis ulang `project/src/Root.tsx` hanya Ep06 (Ep06Cover, Ep06Preview, Ep06Final; SLUG Ep06 = "easter-egg-EP06").
4. Cover still → `style/cover-topic.png`; SFX; contact sheet + THEME_CHECK + juri; final; QA; captions (lihat langkah di atas).

---
## UPDATE sesi ke-3 (2026-11-23) — docs + sebagian kode scene

### Selesai di sesi ke-3
- `style/STYLE_DECISION.md` (Style: PIXELSTORY, approved: yes, alternatif ARCADECRT/PANELVERSE ditolak).
- Docs: `docs/ART_DIRECTION.md`, `docs/SCRIPT.md`, `docs/STORYBOARD.md` (9 baris, kolom Audio), `docs/SHOTLIST.md` (17 baris, format gold, Offset: 0, dipakai `npm run sfx`), `docs/ASSET_MANIFEST.md`.
- Kode di `project/src/scenes/ep06/`:
  - `timing.ts` — SELESAI. `W()` + T beats (semua indeks kata sudah dicek), `CUT` {B 6.83, C 19.42, D 35.74, D2 46.61, E1 51.32, E2 58.88, F 66.80, OUT 71.19}, `sceneAt`, `WIPES` (tanpa wipe di D→D2: hard cut + flash), `BREAK = T.ditembus-0.15`, `EGG_STAMP = T.easter`.
  - `sets.ts` — SELESAI (belum di-typecheck). secretRoom/ROOM, warehouse/WH, devDesk/DEV (+`lamp.bulb {x,y}`), mazeMap/MAP (satu albedo), teenRoom/TEEN, office/OFF, museum/MUS.
  - `sprites.ts` — SELESAI. devBack/DEV_ANCHOR, teenBack/TEEN_ANCHOR, director(holding)/DIR_ANCHOR/DIR_HAND, egg/EGG_ANCHOR, SPEC, DEV_PAL/TEEN_PAL/DIR_PAL/EGG_PAL.
  - `hud.tsx` — SELESAI (dari gold: Pop, Chip, NameCard, Stamp, Wipe, Captions; ACCENT teal #3FB7A8, VIOLET #9B7BFF; + `Disclaimer` "ILUSTRASI, BUKAN CUPLIKAN ASLI" top 196).
- BELUM: `Film.tsx`, `Cover.tsx`, `index.ts`, tulis ulang `project/src/Root.tsx` (masih impor ep01–05 yang TIDAK ada → bundle gagal sampai diganti).

### Rencana Film.tsx (ikuti gold `F:/AUDIRA-EPISODES/AUDIRA_FAKTA_OLAHRAGA_2026/studio/src/scenes/ep01/Film.tsx`: once caches, camAt, shake, Lit, Film shell dengan Grade/Vignette/Grain/Exposure lalu HUD, Wipe, Captions, + `<Disclaimer/>`)
- Chip utama top 268 (≥250). Maks judul + 1 chip per frame.
- `RoomShot` (export, dipakai A/D2/OUT/Cover): secretRoom, tulisan dinding HTML "CREATED BY" / "WARREN ROBINETT" di ROOM.TEXT warna berganti tiap 0,25 dtk (RAINBOW #F25A54,#F4B860,#7FE07A,#3FB7A8,#5A9AD8,#9B7BFF), "AUDIRA" di plakat ROOM.PLAQUE, titik abu-abu 1 art px (#9AA0A8 + Glow) di ROOM.DOT, opsional kotak pemain emas.
- A Hook: CoverText (kicker "AUDIRA TECH #06" top 252, judul "NAMA YANG"/"DISEMBUNYIKAN" top ~300, chip "EASTER EGG PERTAMA YANG TERKENAL" top ~1020) pudar 2,0–2,6; kamera dolly z0→160 ke titik (y +200); chip "1 PIKSEL" + cincin penunjuk di T.piksel; plakat AUDIRA menyala di T.audira.
- B Gudang: truck x −120→+60, lampu kerucut WH.LAMPS; Chip "AKHIR 1970-AN" → label kotak HTML "PEMBUAT: ▮▮▮" terhapus T.menghapus→T.kotaknya → Stamp "DIHAPUS" sub "NAMA PEMBUAT GAME" + stempel turun + shake di T.kotaknya → Chip "AGAR TIDAK DIBAJAK PESAING" T.alasannya → Chip "±US$22.000 / TAHUN" sub "0 ROYALTI" muncul di T.tanpa.
- C Meja: devBack di DEV.SEAT scale PX*1.5, glow CRT teal + lampu meja; layar HTML di DEV.SCREEN (garis labirin+kursor → ruang mini pelangi "W.R." di T.ruang → "1980" di T.game); kamera push ke layar T.ruang, mundur T.game. HUD: NameCard WARREN ROBINETT/PROGRAMMER ATARI (T.warren–21.3) → Chip "±1 TAHUN · SENDIRIAN" sub "ADVENTURE · 1978–1979" (T.hampir–24.85) → Chip "RUANG RAHASIA" sub "TANPA MEMBERI TAHU SIAPA PUN" (T.ruang–30.55) → Chip "RILIS MARET 1980" (T.maret–T.terjual) → penghitung display 0→1.000.000+ KOPI (T.terjual–CUT.D).
- D Peta: satu Layer z1000; pemain kotak emas 4×4 art px; titik di MAP.DOT, dibawa setelah ±38,3; jalur (40,100)→(16,118) [ambil ~38,3]→(40,118)→(40,134)→(146,134) di T.dinding→tembus ke (165,137) setelah BREAK; dinding HTML di MAP.WALL_X pecah jadi pecahan di BREAK (flash+shake); label dunia "KASTIL HITAM"/"KASTIL EMAS"/"KATAKOMBE"; kamera ikut pemain, z −40→120→380 (T.ukurannya, close titik)→140→220. Chip: "1 · AMBIL TITIK ABU-ABU" (T.ambil) → "UKURAN: 1 PIKSEL" (T.ukurannya) → "2 · BAWA KE UJUNG LORONG" (T.bawa) → "3 · DINDING BISA DITEMBUS" (T.dinding).
- D2: RoomShot z220 ke tulisan, pemain + titik di lantai; Chip "BERGANTI WARNA" (T.tulisan) → "DIBUAT OLEH WARREN ROBINETT" (T.dibuat).
- E1 Kamar: teenBack di TEEN.SIT scale PX*1.9, glow TV; layar TV HTML ruang pelangi; surat HTML naik dari meja lalu terbang kanan di T.menyurati. Chip "15 TAHUN · SALT LAKE CITY" (T.remaja) → "MENYURATI ATARI" (T.menyurati) → "BIAYA HAPUS: ±US$10.000" sub "CHIP ROM BARU" (T.menghapusnya–CUT.E2).
- E2 Kantor: director di OFF.STAND scale PX*1.6 menghadap kiri, telur di tangan (DIR_HAND), 3 telur memantul ke meja di T.easter/T.telur; papan tulis HTML (sketsa telur + "?" di T.steve; "GAME BERIKUTNYA = RAHASIA ✓" di T.atariKebijakan). NameCard STEVE WRIGHT/DIREKTUR PENGEMBANGAN SOFTWARE (T.steve–T.easter) → Stamp "EASTER EGG" sub "SEPERTI BERBURU TELUR PASKAH" (EGG_STAMP, flash+shake) → Chip "KEBIJAKAN ATARI" sub "GAME BERIKUTNYA DISARANKAN PUNYA EASTER EGG" (T.atariKebijakan).
- F Museum: panel MUS.P1 "1973 / MOONLANDER" (glyph pendarat generik) menyala T.bukan, MUS.P2 "1980 / ADVENTURE" (kotak+titik) menyala T.tapi; truck x −280→+296. Chip "BUKAN YANG PERTAMA" sub "MOONLANDER, 1973, LEBIH TUA" → "ASAL ISTILAH EASTER EGG" (T.tapi).
- OUT: RoomShot crane z120→−60; Chip "PERNAH MENEMUKAN EASTER EGG?" sub "TULIS DI KOMENTAR" (sub di T.tulis) → kotak CTA emas "IKUTI AUDIRA TECH" + "@AudiraTECH" (T.ikuti–OUTRO_AT).
- Flash Exposure: 0,05 pembuka, BREAK, CUT.D2, EGG_STAMP.

### Langkah berikut (urut)
1. Tulis `Film.tsx`, `Cover.tsx` (pola gold Cover: RoomShot + CoverText, scale width/SCREEN.w), `index.ts` (Cover, Film, TOTAL_SECONDS).
2. Ganti `project/src/Root.tsx`: hanya Showcase + Ep06Cover (30 frame) + Ep06Preview + Ep06Final memakai pola `signed()`; SLUG `Ep06: "easter-egg-EP06"`; AudiraSignature pakai `code="TECH"` ATAU jalankan `npm run channel` (channel.json sekarang handle @AudiraSportFacts — WAJIB jadi @AudiraTECH).
3. `npx tsc --noEmit`, lalu `npm run stills -- out/ep06/look 1s,4s,12s,28s,40s,48s,54s,62s,68s,74s Ep06Preview 0.5` → periksa, poles.
4. Cover: still Ep06Cover → `style/cover-topic.png`.
5. SFX: `npm run sfx -- --shotlist=../docs/SHOTLIST.md --out=public/audio/ep06/sfx.wav` (cek opsi timing VO), salin ke `audio/sfx/`.
6. Contact sheet draf 8 frame (≥0,3 dtk dari cut) → `draft/contact-sheet.jpg`, `draft/THEME_CHECK.md`, `npm run audit:visual`, juri buta, `audira_style_memory record_score stage draft` (memoryEpisode "short-baru-11-23-EP06").
7. Final: `npm run render:final -- --comp=Ep06Final --out=out/ep06/FINAL_EP06.mp4 --vo=public/audio/ep06/vo.wav --sfx=public/audio/ep06/sfx.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc --log=error --title="Easter Egg Pertama yang Terkenal di Game" --slug=easter-egg-pertama-game --ep=EP06` (cek GPU_LOCK di side-session-notes), qa_video, LUFS −14/TP ≤ −1,5, metadata ffmpeg, salin ke `FINAL_VIDEO.mp4`, record_score final.
8. SOCIAL_CAPTIONS.md 6 platform (+Jadwal Upload WIB, Label Konten AI) → validator, SUBTITLES.srt dari timeline words, NOTES.md, memory lessons, 3 scheduled task review, tampilkan caption di chat.

---

## UPDATE sesi ke-4 (2026-11-23) — Film.tsx ditulis, tsc bersih

### Selesai di sesi ke-4
- `project/src/scenes/ep06/Film.tsx` — SELESAI, 9 scene sesuai rencana sesi ke-3 (A Hook RoomShot + CoverText, B gudang + stempel DIHAPUS, C meja + CRT kode→"W.R."→1980 + penghitung kopi, D peta top-down + pemain emas + pecahan dinding, D2 RoomShot zoom tulisan, E1 kamar remaja + surat terbang, E2 kantor + 3 telur jatuh + papan tulis, F museum 2 panel, OUT RoomShot + CTA). Export `RoomShot`, `CoverText`, `RAINBOW`, `REST`.
  - Catatan: back + mid RoomShot sama-sama Layer z1000 (agar overlay HTML tulisan/plakat sejajar). Kamera: cam.x = px−540, cam.y = py−960 memusatkan titik design px pada z berapa pun.
- `Cover.tsx` (RoomShot t=0.6 ring=1 + CoverText), `index.ts`.
- `project/src/Root.tsx` — hanya Ep06Cover / Ep06Preview / Ep06Final, SLUG `easter-egg-EP06`.
- Channel: dibuat `EP06_.../SERIES.json` (account TECH @AudiraTECH); `node scripts/channel.mjs` OK → `src/brand/channel.json` = @AudiraTECH; CTA OUT membaca handle dari channel.json.
- `npx tsc --noEmit` — BERSIH (0 error).

### Langkah berikut (urut) — belum ada render apa pun
1. `cd project; npm run stills -- out/ep06/look 1s,4s,9s,12s,17s,22s,28s,34s,38s,41s,45.8s,48s,54s,57s,62s,65s,68s,70s,73s,76s Ep06Preview 0.5` → baca contact sheet kecil, poles (cek: arah/zoom kamera tiap scene, teks dinding muat di D2, Stamp "EASTER EGG" tidak meluber, NameCard Steve 2 baris, kotak pemain/titik kelihatan di D).
2. Cover: still Ep06Cover → `style/cover-topic.png`.
3. Langkah 5–8 dari "UPDATE sesi ke-3" (SFX, draf + juri + record_score, final render + QA + metadata, delivery).

---
## UPDATE sesi ke-5 (2026-11-23) — draf GAGAL 2 putaran juri, menunggu keputusan pengguna

### Selesai di sesi ke-5
- Still look (`project/out/ep06/look`, `look2`), poles Film.tsx: hook cam (CoverText pudar 1,0–1,45; cam y 190), ruang rahasia (ambient 0.07 + cone hangat di titik + Glow lantai), peta D (ambient 0.55/exp 1.3, z 180→470, halo pemain, vinyet radial), chip peta size 42, museum cam y −170, OUT cam y 150→40. hud.tsx: sub Chip pakai FONT.display emas ≥48 px, Disclaimer 30 px plat gelap.
- `style/cover-topic.png` + `style/cover.json` (Ep06Cover frame 0).
- SFX: `project/public/audio/ep06/sfx.wav` (−20 LUFS, 50 suara; timing dari `public/audio/ep06/vo.words.json`), salinan `audio/sfx/sfx.wav`.
- `SUBTITLES.srt` (36 cue, waktu film).
- Draf: `draft/contact-sheet.jpg` (8 frame 1.5,12.5,28,41,54,62.6,67.5,74 s Ep06Preview 0,5×), `draft/look.json` (tak ada ceiling < 4), `draft/compare.jpg`, `draft/THEME_CHECK.md` (semua ya), `draft/camera.json` (klip 36–52 s: motion 5/5).
- Juri buta r1 = 3.33, r2 = 3.00 (tercatat di memori PIXELSTORY). Kelemahan r2: f1/f8 framing sama, titik 1 px tak terlihat di HP, peta D & museum datar (tanpa FG/rim), "DIHAPUS" 3× di gudang, glyph B/D Silkscreen mirip (ROBINETT terbaca RODINETT), sprite lain tanpa rim light, chip 3 baris.

### Aturan G16: maks 2 putaran juri per style → kembali ke gerbang style. BUTUH KEPUTUSAN PENGGUNA:
- (a) Style baru (alternatif tercatat: ARCADECRT, PANELVERSE) → ulang tahap 4 (G21) untuk style itu; VO/timeline tetap dipakai.
- (b) Pengguna mengizinkan putaran poles ke-3 PIXELSTORY: terapkan daftar perbaikan r2 di atas (hook push-in titik + ring sejak 1,2 s, OUT end-card berbeda, FG gelap blur di D/OUT, spot per panel museum, satu DIHAPUS saja, font nama pakai FONT.display, rim light semua sprite, chip ≤ 2 baris), lalu contact sheet + juri lagi.
- Setelah lolos: langkah 7–8 "UPDATE sesi ke-3" (render:final dengan --sfx/--vo, QA, metadata, FINAL_VIDEO.mp4, delivery). Contoh format SOCIAL_CAPTIONS: `../EP04_PULAU_SENTINEL_UTARA/SOCIAL_CAPTIONS.md`.

## UPDATE sesi ke-6 (2026-11-23) — poles putaran ke-3 PIXELSTORY (izin pengguna) GAGAL, juri 3.33

### Dikerjakan
- Film.tsx: hook push-in ke titik (z 200→520) + ring emas sejak 1,1 s; nama WARREN ROBINETT pakai FONT.display (dinding & TV); gudang: hanya satu DIHAPUS (stempel HUD), label kotak dicoret garis merah; rim light ganda di semua sprite `Lit`; museum cone lebih terang; MapFG (kolom batu blur + obor) di peta D; OUT sebelum "Ikuti" = peta top-down di ruang rahasia (beda dari hook), sesudahnya ruang + plakat AUDIRA.
- hud.tsx: Chip teks utama pakai FONT.display (Silkscreen membuat B/D, N/M tertukar). Chip ≤ 2 baris.
- Contact sheet baru: `draft/contact-sheet.jpg` (dari `project/out/ep06/draft7`, frame 2.0,12.5,28,41,54,62.6,67.5,74 s). THEME_CHECK diperbarui.
- Juri r3: lighting 3, material 4, depth 3, composition 3, motion 3, readability 4 = 3.33. Tercatat di memori + lesson failed.

### Kelemahan r3 (struktural kit)
- 35–40% bawah tiap frame gelap kosong di bawah caption (set 135×240).
- f1 judul terpotong di tepi atas; interior datar tanpa FG/partikel; label disclaimer kecil; tag AUDIRA ganda (f6/f7).

### Memori: BATAS tercapai → WAJIB ganti style. Rekomendasi fallback (retro):
1. ARCADECRT (skor juri 4.00, cocok game/arcade) — cover `F:/AUDIRA-ALL-SKILL/assets/style-covers/arcadecrt.png`
2. VOXELVERSE (unggulan, self 4.67) — `.../voxelverse.jpg`
3. FILM16 — `.../film16.jpg`
Cadangan: HD2D (juri 3.96).
Setelah pengguna pilih: STYLE_DECISION.md + cover topik, ulang tahap 4 (G21, docs baris `Style: <ID>`), VO 81.278 s & timeline tetap.

### Keputusan pengguna 2026-11-23: STYLE BARU = ARCADECRT
- Belum ada pekerjaan restyle. Sesi baru mulai dari: STYLE_DECISION.md → cover topik → ulang tahap 4 (G21) → scene ARCADECRT → draf/juri → final → delivery.
- Pakai ulang: VO `project/public/audio/ep06/vo.wav` (81.278 s), timing `src/scenes/ep06/timing.ts` + `public/audio/ep06/vo.words.json`, SFX `public/audio/ep06/sfx.wav` (jalankan ulang `npm run sfx` bila SHOTLIST berubah), `SUBTITLES.srt`.
- Batasan konten tetap: orang nyata = sprite generik + kartu nama; tanpa logo Atari / sprite asli; label "ILUSTRASI, BUKAN CUPLIKAN ASLI" (≥30 px, plat gelap); Adventure = easter egg pertama yang terkenal/asal istilah, bukan yang pertama (Moonlander 1973).
- Pelajaran PIXELSTORY yang harus dihindari: bawah frame kosong gelap, interior datar tanpa FG, font piksel untuk nama (pakai display), hook & outro framing sama, tag AUDIRA ganda.

## UPDATE sesi ke-7 (2026-11-23) — restyle ARCADECRT dimulai

### Selesai
- `style/STYLE_DECISION.md` ditulis ulang (Style: ARCADECRT, approved yes). `style/cover-reference.png` = cover kit. Cover PIXELSTORY lama diarsip ke `style/_pixelstory/` (cover-topic.png BELUM dirender untuk ARCADECRT).
- Kode baru (belum di-typecheck, belum dipakai di index.ts) di `project/src/scenes/ep06/crt/`:
  - `Room.tsx` — salinan ArcadeRoom3D kit, prop `sign` (default "AUDIRA ARCADE" = brand di dalam dunia).
  - `Cab.tsx` — kabinet kit dengan prop `draw` (raster 96×128 per adegan), `title`/`sub` marquee, `position`, `rotY`; `screenAt(pos, rotY)` untuk target kamera.
  - `rasters.ts` — drawHook(nameAt), drawBox(erase, struck, hue), drawDev(roomAt, relAt), drawSecret, drawEgg(seed), drawLander, draw1980, drawAttract; RAINBOW/rainbow.
  - `voxels.tsx` — Person (who: dev | teen | dir, figur voxel tanpa wajah ±1,7 unit), Hero (sprite kit 1/8 unit), Dot (kubus abu bercahaya), Egg (jatuh+mantul dari `at`), Letter (amplop terbang a→b), Coins, BoxStack, Chip3D (ROM), Corridor (lorong katakombe→emas, dinding x=22 pecah di breakAt), SecretRoom (dinding pelangi + teks CREATED BY WARREN ROBINETT, font PS Anton).

### Sisa (rencana adegan; waktu dari timing.ts, CUT B 6.83, C 19.42, D 35.74, D2 46.61, E1 51.32, E2 58.88, F 66.8, OUT 71.19, TOTAL 81.278)
1. `FilmCrt.tsx`: satu `ThreeCanvas` (shadows) + CameraRig (pola ArcadecrtExample: position/target/fov/roll, near 0.02) + `<Finish frame background="#07060F" profile={COLOR_PROFILES.CYBER_NEON_VOID} exposure={1} envIntensity={0.55} ao />`; luar: ambient #8A7CFF 0.18 + spot [0,5.5,3] 14 + Room; dalam game (D, D2): background #06041A, ambient #B9A8FF 0.55 + directional [8,14,10] 1.6, fog.
   - A hook: Cab drawHook(T.nama) di origin, kamera kiri rendah [-1.7,1.75,4.9] push konstan ke layar (dist ~0.9 di 6.8 s).
   - B: 3 Cab drawBox (x -1.4/0/1.4, hue beda) erase T.menghapus→T.kotaknya, coret di T.kotaknya; kamera truck kiri→kanan. Sub-shot di T.alasannya: Person dev di lorong + Coins (T.gajinya→T.tanpa, hilang setelah T.tanpa+0.5), kamera tinggi.
   - C: Person dev depan Cab drawDev(T.ruang, T.game), over-shoulder 3/4; push ke layar di T.diamDiam; tarik mundur di T.game + BoxStack (T.terjual→T.sejuta+0.3).
   - D: flash penuh (≥0.9) di CUT.D masuk game. Corridor breakAt=BREAK; Hero jalan x 0→3 (ambil Dot di x=3, T.ambil) → 21 (T.ditembus); makro ke Dot di T.ukurannya; kamera samping 3/4 mengikuti.
   - D2: SecretRoom + Hero + Dot, push pelan.
   - E1 (flash 0.6 keluar game): Person teen depan Cab drawSecret, Letter dari teen ke dinding belakang (T.menyurati→+2 s), Chip3D di T.menghapusnya.
   - E2: Person dir, 3 Egg jatuh di T.easter (+0.15/+0.3), kabinet latar drawEgg; kamera rendah orbit pelan.
   - F: 2 Cab berdampingan (kiri drawLander title "1973", kanan draw1980 title "1980"), pan kiri→kanan di T.tapi.
   - OUT: kamera tinggi dari kanan, tarik mundur memperlihatkan ruangan + Cab drawAttract (beda framing dari hook).
   - HUD: export HookHud…OutHud dari Film.tsx (tambah `export`), render di div skala SCREEN 1080×1920 (pola Film.tsx lama) + Disclaimer + Captions; tanpa Wipe. Ganti ACCENT → #2EF2FF, VIOLET → #FF2E88 di hud.tsx.
2. index.ts: `export { Film } from "./FilmCrt.tsx"`; Cover.tsx: render FilmCrt pada t≈0.6 + CoverText (power CRT penuh).
3. `npx tsc --noEmit`, `npm run cover -- Ep06Cover --episode=.. --force`, docs tahap 4 baris `Style: ARCADECRT`, stills draf, THEME_CHECK, audit, juri, final, delivery (lihat tugas di brief sesi).

### Status akhir sesi ke-7 (handover karena batas konteks)
- `project/src/scenes/ep06/FilmCrt.tsx` DITULIS: 9 adegan 3D (SceneA…SceneOut) sesuai rencana di atas, `FilmAt({t, hud})` + `Film`, flash phosphor (0.95 di CUT.D), scanline hanya di dalam game, HUD lama (Hud dari Film.tsx sudah di-`export`), Disclaimer + Captions.
- `index.ts` kini `export { Film } from "./FilmCrt.tsx"`; `Cover.tsx` = `<FilmAt t={0.6} />`. hud.tsx: ACCENT #2EF2FF, VIOLET #FF2E88.
- `npx tsc --noEmit`: tidak ada error di ep06. BELUM ada render apa pun dengan ARCADECRT.
- Berikutnya: (1) still uji cepat beberapa frame (`npm run stills -- out/ep06/crt1 2s,12s,22s,28s,33s,40s,48s,55s,62s,68s,74s Ep06Preview`), periksa framing/terang lalu poles; (2) `npm run cover -- Ep06Cover --episode=.. --at=0.6s --force` → style/cover-topic.png, tampilkan; (3) docs tahap 4 baris `Style: ARCADECRT` (ART_DIRECTION, SCRIPT, STORYBOARD, ASSET_MANIFEST, SHOTLIST) — naskah/VO tetap; (4) `npm run sfx` bila SHOTLIST berubah; (5) contact sheet draf + THEME_CHECK + audit:visual/camera + juri buta (subagent general-purpose, tanpa model override), maks 2 putaran; (6) final + QA + metadata + FINAL_VIDEO.mp4; (7) delivery.
