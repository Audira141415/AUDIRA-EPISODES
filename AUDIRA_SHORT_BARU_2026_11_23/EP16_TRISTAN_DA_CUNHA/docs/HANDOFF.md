# HANDOFF — EP16 Tristan da Cunha

## UPDATE sesi 2b (2026-11-23) — BACA INI DULU (terbaru)
- Cover topik SELESAI: `style/cover-topic.png` (sudah ditampilkan ke pengguna; audit cover tanpa aspek < 4).
- Sheet stills putaran poles: `project/out/ep16-stills/_sheet.jpg` (17 frame: 1.2s,6s,11s,18s,23.5s,28.5s,33.8s,37s,42.5s,45s,50s,55s,62.2s,67.5s,71.5s,75.5s,81s). look.json ceilings: lighting 5, material 5, depth 5, composition 5, readability 3, diversity 31.4.
- SISA PERBAIKAN readability: teks SVG "AUDIRA · FAKTA DUNIA" di kartouche S15 (scenes.tsx S15) terbaca 1.2:1 oleh audit:layout → ubah jadi HTML div (pola komponen `Plate` di scenes.tsx; teks SVG di plat gelap selalu salah ukur). Teks SVG lain sudah dipindah ke HTML (S5 tinggi, S6 nama keluarga). Juga cek teks SVG "CALSHOT/HARBOUR" (S14) & "TRISTAN" stamp (S8) bila diflag.
- Catatan stills.mjs: detik WAJIB pakai sufiks `s` (tanpa `s` = nomor frame).
- Visual sheet (dilihat): 15 adegan berbeda dan terbaca; hook peta pulau zoom-out + cincin ke St Helena; karavel 1506; rute Cape Town; gunung api + skala; kerumunan siluet + plat nama; desa; lobster/kentang/prangko; pesawat dicoret → kapal di rute; tanah bersama; letusan merah; rute evakuasi ke Inggris; rute pulang emas; papan CALSHOT HARBOUR; outro senja + kartouche.
- BERIKUT: (1) fix S15 kartouche → HTML, render ulang sheet; (2) `docs/SHOTLIST.md` (timing dari timing.ts, kolom Audio: whoosh tiap potongan scene, pop tiap callout, riser 59.5→impact 61.45 MELETUS) lalu `npm run sfx -- --duration=88.1`; (3) `draft/THEME_CHECK.md`; klip 540x960 15–20 dtk (mis. 56–74 dtk) untuk `npm run audit:visual -- --video` + `npm run audit:camera`; contact sheet 1200px ke `draft/contact-sheet.jpg`; juri self + jury buta (qa/jury.md, cover `F:/AUDIRA-SKILL-MOTION/references/quality-bar/historymap.png`) record_score style HISTORYMAP episode `short-baru-11-23-EP16`, maks 2 putaran; (4) final `npm run render:final -- --comp=Ep16Final --out=out/FINAL.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --title="Tristan da Cunha: Pulau Berpenghuni Paling Terpencil di Dunia" --slug=tristan-da-cunha-ep16 --ep=EP16`, cek −14 LUFS TP<−1, ffprobe metadata, audira_verify_signature, audira_qa_video hardOnly, salin `FINAL_VIDEO.mp4`, record_score final; (5) delivery (SOCIAL_CAPTIONS 6 platform + Jadwal + Label AI, validator expectedKeywords Tristan; SUBTITLES.srt via audira_generate_srt; NOTES.md; lessons HISTORYMAP; 3 scheduled task review-tristan-da-cunha-ep16-24h/-72h/-7d; caption tampil di chat).

# HANDOFF — EP16 Tristan da Cunha

## UPDATE sesi 2 (2026-11-23) — BACA INI DULU
- VO SELESAI: `project/public/audio/vo.wav` 85.03 dtk, 208 kata, `vo-words.json` + `vo.timing.json`; salinan `audio/vo.wav`. JANGAN generate ulang.
- `project/node_modules` junction sudah diganti ke `F:\AUDIRA-SKILL-MOTION
ode_modules` (starter/node_modules hampir kosong).
- KODE SELESAI (tsc bersih untuk ep16, BELUM dirender/dicek visual): `project/src/ep16/` timing.ts (15 scene S1–S15 dari anchor kata, CALLOUTS, FILM_SECONDS 88.1, outro 2.9), geo.ts (poligon tangan + proj K=16), pieces.tsx (MapView, Route, Tag, Volcano, Caravel, Person, House, Lobster, Potato, Stamp, Ship, Plane, Sky, Sea), scenes.tsx, Film.tsx (Ep16Film/Ep16Stage/Ep16Cover, kicker atas, callout plat gelap border-left merah, karaoke). Root.tsx: Ep16Preview / Ep16Final / Ep16Cover.
- Pelajaran juri EP04 (CHRONICLE/PAPERWORLD): jury buta menolak cahaya datar tanpa key light/cast shadow → sudah ada Lit/P cast shadow + pool cahaya soft-light; periksa di sheet.
- BERIKUT: cover (`node scripts/stills.mjs out/ep16-cover 0 Ep16Cover` → `style/cover-topic.png`, tampilkan), sheet stills (`node scripts/stills.mjs out/ep16-stills 1.2,6,11,18,23.5,28.5,33.8,37,42.5,45,50,55,62.2,67.5,71.5,75.5,81 Ep16Preview`), perbaiki, lalu langkah 4–6 di bawah.

# HANDOFF — EP16 Tristan da Cunha (2026-11-23)

Channel: AUDIRA Fakta Dunia (@AudiraFaktaDunia). Engine: Remotion **2D murni** (SVG/DOM, tanpa R3F). Skill: `audira-2d-motion` (`F:\AUDIRA-2D-SKILL-MOTION`).

## Selesai
- STATUS.json (memoryEpisode `short-baru-11-23-EP16`), riset `research/SOURCE_REGISTER.md` (20 fakta, populasi 220 per tristandc 18 Nov 2026).
- Gerbang style: pengguna memilih **HISTORYMAP** (acc tercatat). `style/STYLE_DECISION.md`, `style/cover-reference.png`, `style/style-options.jpg`. **`style/cover-topic.png` BELUM dirender.**
- Docs: `docs/SCRIPT.md`, `ART_DIRECTION.md`, `STORYBOARD.md` (9 scene), `ASSET_MANIFEST.md` — semua baris `Style: HISTORYMAP`.
- Teks VO: `audio/vo.txt` (208 kata, angka ditulis huruf, "Audira" bukan kapital).
- Proyek: `project/` = salinan starter `F:\AUDIRA-SKILL-MOTION\starter` (scripts, sfx, src, public/brand, public/fonts), `node_modules` = junction ke starter (paket terselesaikan juga dari `F:\AUDIRA-EPISODES\node_modules`). `SERIES.json` + `src/brand/channel.json` sudah FAKTADUNIA.

## Belum
1. **VO**: `audira_generate_voiceover` gagal dengan `scriptPath` (butuh baris bertimestamp). Panggil dengan `text` = isi `audio/vo.txt` (satu paragraf), outputPath `project/public/audio/vo.wav`, wordsPath `project/public/audio/vo-words.json`, lang id. Lalu `cd project && npm run vo -- public/audio/vo.wav`; salin vo.wav ke `audio/`. Target 80–90 dtk (bila jeda panjang: `scripts/tighten-pauses.py` maks 0,45 dtk).
2. **Kode** `project/src/ep16/` meniru pola EP04 (`F:\AUDIRA-EPISODES\AUDIRA_SHORT_BARU_2026_11_23\EP04_PULAU_SENTINEL_UTARA\project\src\ep04\` Film.tsx / pieces.tsx / scenes.tsx / timing.ts; daftar di Root.tsx `Ep16Preview` 540×960@30, `Ep16Final` 1080×1920@60, `Ep16Cover` still). Look HISTORYMAP 2D di ART_DIRECTION.md: laut navy + grid emas, daratan perkamen, rute merah menggambar diri, kartu plat gelap border-left merah. Peta Atlantik Selatan: tidak ada dataset garis pantai dunia lokal → buat poligon sederhana tangan di `geo.ts` (Afrika selatan, Amerika Selatan, Eropa barat untuk rute ke Inggris) dengan proyeksi equirectangular. Tristan 37.1°S 12.3°W, St Helena 15.9°S 5.7°W, Cape Town 33.9°S 18.4°E, Southampton/Calshot 50.8°N 1.3°W. Timing semua dari anchor kata `vo-words.json`. Karaoke lebar penuh, gap 0.4em, potong di tanda baca. `AudiraOutro seconds≈2.9` lalu `AudiraSignature seed="tristan-da-cunha-ep16"` terakhir. Brand di adegan: kartouche peta "AUDIRA · FAKTA DUNIA".
3. Cover topik → `style/cover-topic.png`, tampilkan ke pengguna.
4. `docs/SHOTLIST.md` + `npm run sfx`; stills contact sheet (`node scripts/stills.mjs out/ep16-stills <detik> Ep16Preview`), `npm run audit:visual`, `draft/THEME_CHECK.md`, juri self + jury (`qa/jury.md`) `record_score` style HISTORYMAP episode `short-baru-11-23-EP16`. Maks 2 putaran.
5. Final: `npm run render:final -- ... --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2`, loudnorm −14 LUFS TP < −1, metadata ffmpeg, signature (skrip yang await), `audira_qa_video hardOnly`, `FINAL_VIDEO.mp4` di folder episode, record_score final.
6. Delivery: SOCIAL_CAPTIONS.md 6 platform + Jadwal Upload (WIB) + Label Konten AI, validator, SUBTITLES.srt, NOTES.md, lessons, 3 scheduled task review, caption tampil di chat.

## Catatan
- Bash heredoc multi-file di sesi ini gagal parse (EOF quote); pakai Write tool.
- ffmpeg `drawtext` segfault (fontconfig); pakai PIL untuk teks gambar.
