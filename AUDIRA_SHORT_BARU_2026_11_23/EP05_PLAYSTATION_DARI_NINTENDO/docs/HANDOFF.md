# HANDOFF — EP05 PlayStation lahir dari pembatalan Nintendo (2026-11-23)

Channel AUDIRA TECH (@AudiraTECH). Folder episode: `F:\AUDIRA-EPISODES\AUDIRA_SHORT_BARU_2026_11_23\EP05_PLAYSTATION_DARI_NINTENDO\`. Hanya ubah folder ini (9 sesi lain jalan di folder saudara).

## Status sesi 2 (2026-11-23)
- Langkah 1 SELESAI: docs/ART_DIRECTION.md, SCRIPT.md, STORYBOARD.md, ASSET_MANIFEST.md.
- Langkah 2 sebagian: project/world2d.js (8 scene, ImageData buffer 180x270, export ANCHORS dibaca build-video via regex) + project/build-video.mjs (panel kotak dialog RPG, Silkscreen/Pixelify Sans) ditulis; `node build-video.mjs` OK. Belum: mix.py, snapshot belum dicek.

## Selesai
- Riset: `research/SOURCE_REGISTER.md` (Wikipedia A/B/C; fakta + yang tidak dipakai).
- Gerbang style: pengguna memilih **PIXELSTORY** (acc tercatat di STATUS.json). `style/STYLE_DECISION.md`, `style/style-options.jpg`. Engine: HyperFrames 2D (pure 2D canvas pixel art + HTML panels), BUKAN Remotion, BUKAN three.js.
- Naskah: `project/script-lines.json` (8 baris s1..s8, markup `{display|spoken}`).
- VO DIKUNCI: clip per baris dibuat via MCP `audira_generate_voiceover` speed 0.88 → `audio/work/clips-raw/sN.wav/.json` → `audio/work/meta-raw.json` → `python lib/vo.py x tts --skip-tts` (tighten) → `python lib/vo.py x build --tempo 1.06`. Hasil: `audio/VO_MASTER.wav` (-16 LUFS), `project/timeline.json` (speech 85.75 s, film 88.75 s, 175 display words). JANGAN generate VO ulang.

## Pipeline (disalin dari seri lama, sudah diadaptasi; jalankan dari `project/`)
- `project/lib/`: `hflib.mjs` (anchors `at("s3:Kutaragi")`, writeCaptions, writeIndex), `shell.mjs` (writeWorld: panels `.p` data-in/out, reveals data-at/data-fx, counters `.ct`, outro card, moving signature `sig`; mengimpor `hf/assets/lib/world2d.js` yang export `create(canvas,K,AT)` → `draw(t)`), `audio_lib.py` (Mix; `M.finish(music)` menulis `hf/assets/audio/mix.wav`), `master.py` (-14 LUFS), `qc.py`, `build-srt.py`, `vo.py`, `series.json` (AUDIRA TECH).
- Import paths dari `project/`: `./lib/hflib.mjs`, `./lib/shell.mjs`; mix.py: `sys.path.insert(0,"lib")`. SFX: `../audio/sfx/*.mp3` (chime, click-soft, click, error, glitch-1..3, impact-bass-1, ping, pop, riser, sparkle, typing, whoosh-cinematic, whoosh-short, whoosh).
- `hf/` sudah ada: hyperframes.json, assets/img/grain.png, assets/brand/stacked-reversed.svg. build-video.mjs wajib copy `world2d.js` ke `hf/assets/lib/`.
- Referensi pola (read-only): `F:\AUDIRA-EPISODES\TECH\AUDIRA_SEJARAH_GAME_2026\EP05_DOOM_WINDOWS_95\project\build-video.mjs` + `mix.py`, `..\_tools\snap.sh`, `render.sh`, `final.sh`, `BRIEF_COMMON.md` (aturan safe zone, anchors, frame 0 = thumbnail, pure function of t, no Math.random).
- Snapshot: `cd project && node build-video.mjs && cd hf && TEMP='F:\hf-render-tmp' TMP='F:\hf-render-tmp' npx hyperframes snapshot --no-end --at "1,6,..."` (cetak path contact sheet). Render final: `npx hyperframes render -o ../out/raw.mp4 -f 60 -q standard -w 6`, lalu `python lib/master.py out/raw.mp4 ../FINAL_VIDEO.mp4`, qc.py, metadata ffmpeg (lihat final.sh; comment `AUDIRA-playstation-dari-nintendo-EP05 | audira.my.id`).

## Rencana visual (PIXELSTORY 2D: canvas 135×240 art px, PX=8, nearest-neighbour, palet hangat terbatas + Bayer dither, kamera pan/zoom tiap scene, semua fungsi murni dari t)
Layout: panel HTML (font Silkscreen/Anton) di y 236–~620, subjek pixel di tengah 620–1250, caption karaoke top 1300 (bawah 380 px kosong). Chip "ILUSTRASI, BUKAN CUPLIKAN ASLI". Tanpa logo; nama produk teks polos; tokoh = siluet piksel generik + papan nama.
- s1 hook: konsol abu generik di podium + spotlight, counter "100 JUTA+", judul "LAHIR DARI RASA MALU".
- s2 1988: dua gedung bertuliskan teks NINTENDO / SONY, jabat tangan, konsol 16-bit generik + add-on CD; panel "1988 · PROYEK PLAY STATION" (kaset + CD).
- s3 Kutaragi: meja lab, figur insinyur, chip bersinar + not musik; plate "KEN KUTARAGI · insinyur Sony", "Bapak PlayStation".
- s4 kontrak: gulungan kontrak, klausul disorot "HAK GAME CD → SONY", siluet Yamauchi cemberut.
- s5 CES Juni 1991: panggung expo, banner "CES 1991", flash kamera; pada kata "Keesokan" ganti pagi: panggung lain "NINTENDO + PHILIPS", kerumunan berpaling.
- s6: ruang rapat Sony, badai di jendela, tumpukan ±200 prototipe, siluet Ohga gebrak meja → blueprint konsol baru.
- s7: toko di Tokyo malam, antrean, papan "3.12.1994", neon "AUDIRA TECH" (brand di dunia), counter 102,49 JUTA, tumpukan kotak.
- s8: add-on CD berdebu "TIDAK PERNAH RILIS" vs konsol raksasa bersinar sunrise; outro card dari shell.mjs (ep "05").

## Sisa langkah
1. Tulis docs: `docs/ART_DIRECTION.md`, `docs/SCRIPT.md`, `docs/STORYBOARD.md` (tabel ≥6 baris Scene|Waktu|BG/MG/FG/HUD|Kamera|Audio, baris `Style: PIXELSTORY`), `docs/ASSET_MANIFEST.md`.
2. Tulis `project/world2d.js`, `project/build-video.mjs`, `project/mix.py` (musik chiptune numpy + SFX; SFX ikut di-duck di bawah VO).
3. Cover topik `style/cover-topic.png` (snapshot hook ~3 dtk) + tampilkan.
4. `draft/contact-sheet.jpg` 8 frame (≥0,3 dtk dari cut) + `draft/THEME_CHECK.md` → record_score self + juri blind (subagent) stage draft, lolos ≥3.8.
5. Final 60 fps + master + qc + metadata + `audira_qa_video` hardOnly; record_score final.
6. SOCIAL_CAPTIONS.md 6 platform + Jadwal Upload (WIB) + Label Konten AI → validator; NOTES.md; append_lesson; tampilkan caption di chat; tanya jam upload → 3 scheduled task review.
