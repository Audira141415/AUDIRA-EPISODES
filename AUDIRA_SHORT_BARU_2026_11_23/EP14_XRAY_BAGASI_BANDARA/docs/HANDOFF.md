# HANDOFF — EP14 Cara Kerja Mesin X-ray Bagasi Bandara (AUDIRA Explained, @AudiraExplained)
Terakhir: 2026-11-23. Style: **INNERWORKS** (acc pengguna "1 INNERWORKS"). Engine: **Remotion 2D** (skill `audira-2d-motion`, SVG/React — bukan R3F).
Folder episode: `F:/AUDIRA-EPISODES/AUDIRA_SHORT_BARU_2026_11_23/EP14_XRAY_BAGASI_BANDARA/`. Hanya ubah folder ini + subfolder kode sendiri `F:/AUDIRA-2D-SKILL-MOTION/engines/remotion-starter/src/episodes/xray14/` (pola sama dengan sibling `hidangan07/`, `vaksin/`). Banyak sesi lain paralel.

## Selesai
- Riset: `research/SOURCE_REGISTER.md` (20 fakta, kolom "dipakai?").
- Gerbang style: `style/STYLE_DECISION.md` (approved yes), `style/cover-reference.png`, `style/_style_options.jpg`. STATUS style done+approved, data.style=INNERWORKS.
- Docs: `docs/ART_DIRECTION.md` (palet, look, safe zone), `docs/SCRIPT.md`, `docs/STORYBOARD.md` (7 scene S1–S7), `docs/ASSET_MANIFEST.md`.
- Teks VO final: `audio/vo.txt` (209 kata ≈ 84–93 dtk; "Audira" huruf kecil agar tidak dieja).


## Update 2026-11-23 (sesi 2) — VO + kode selesai, belum dirender
- VO selesai: `audio/vo.wav` 89,91 dtk, `audio/vo-words.json` (209 kata). Catatan: `audira_generate_voiceover` dengan scriptPath vo.txt GAGAL ("no timed lines"); pakai param `text` (isi vo.txt). Sudah disalin ke `episodes/xray14/words.json`.
- Kode selesai, tsc bersih: `F:/AUDIRA-2D-SKILL-MOTION/engines/remotion-starter/src/episodes/xray14/{index.tsx, Xray.tsx, parts.tsx, words.json}`. Pola self-contained seperti `hidangan07/` (bukan kit tubuh). Comp `XrayEP14` (60 fps) + `XrayEP14-Draft` (30 fps), END=90.35, total 93.35 dtk (outro 3 dtk).
- Jendela adegan (dtk): S1 hook 0–8.3 · S2 mesin 8.1–19.8 · S3 detektor 19.6–34.7 · S4 skala nomor atom 34.5–52.6 · S5 peledak vs roti 52.4–67.0 · S6 CT 66.8–83.6 · S7 outro 83.4–90.75. Potongan (untuk SFX/QA cuts): 8.2, 19.7, 34.6, 52.5, 66.9, 83.5. Impact CT 71.8.
- BELUM DILIHAT sama sekali: render stills dulu dan periksa layout (posisi pill/kartu, overlap, Item glyph) sebelum lanjut. Langkah berikut = Next 5 di atas.

## Next (urut)
1. ~~STATUS script done~~ (selesai).
2. ~~VO~~ (selesai, lihat update). `audira_generate_voiceover` scriptPath=`<ep>/audio/vo.txt`, outputPath `<ep>/audio/vo.wav`, wordsPath `<ep>/audio/vo-words.json`. Cek durasi (ffprobe). Bila > 90 dtk, rapatkan jeda (maks 0,45 dtk) atau speed 1.05. Salin words ke `episodes/xray14/words.json`.
3. ~~Kode~~ (selesai, lihat update): `episodes/xray14/{index.tsx, Xray.tsx, parts.tsx, words.json}` meniru struktur `episodes/vaksin/` (index registerRoot: comp `XrayEP14` 60 fps + `XrayEP14-Draft` 30 fps, 1080×1920; `buildPages` dari `components/WordCaptions`; `<AudiraOutro code="EXPLAINED" seconds={3}/>` + `<AudiraSignature seed="xray-bagasi-ep14" code="EXPLAINED"/>` lapisan terakhir). Gaya visual INNERWORKS 2D: latar cream→mint, mesin cutaway dengan gradien + rim highlight + bayangan kontak, layar operator gelap dengan warna semu oranye #F28C28 / hijau #3FBF6E / biru #2E6FD8. Multi-scene per waktu VO (S1 monitor hook, S2 mesin dibelah + kartu ≈160.000 VOLT, S3 detektor dua lapis, S4 skala nomor atom ≈10/≈18, S5 peledak C H N O vs roti + kotak ALGORITMA, S6 CT gantry + kartu SEJAK 2018 / 1.162 UNIT·296 BANDARA AS / SOEKARNO-HATTA T3·FEB 2025, S7 outro). Brand dalam adegan: pelat "AUDIRA SCAN-160", header monitor "AUDIRA X-RAY · LANE 3". Kamera drift kontinu tiap adegan (pelajaran TUBUH EP33: kamera diam 33% gagal juri). Caption karaoke y≈1380, kartu HUD di 200–700 px, maks 2 kartu bersamaan. Font Space Grotesk/Manrope/Inter dari `public/fonts`.
4. Cek tipe: `cd F:/AUDIRA-2D-SKILL-MOTION && node_modules/.bin/tsc -p engines/remotion-starter/tsconfig.json --noEmit` (perbaiki error xray14 saja).
5. Stills: `node tools/ep/stills.mjs engines/remotion-starter/src/episodes/xray14/index.tsx XrayEP14-Draft <ep>/draft/stills <t1,t2,...>` (8 frame: hook, tiap scene, payoff, outro) → `python tools/ep/sheet.py <ep>/draft/stills <ep>/draft/contact-sheet.jpg 4 300`. Cover topik = still 1080×1920 frame hook → `style/cover-topic.png`.
6. Klip gerak 540×960 15–20 dtk dari bagian paling berisiko + `node F:/AUDIRA-SKILL-MOTION/starter/scripts/camera-audit.mjs <clip> --json=<ep>/draft/camera.json` (motion wajib untuk record_score).
7. `draft/THEME_CHECK.md` (G22) → skor self lalu juri buta subagen (contact sheet + `style/cover-reference.png` + rubrik) → `audira_style_memory record_score` style INNERWORKS, episode `short-baru-11-23-EP14`, stage draft, judge jury. Lolos = rata-rata ≥ 3.8 dan tidak ada aspek < 3; maks 2 putaran.
8. SFX prosedural → `audio/sfx.wav` −20 LUFS (whoosh tiap potongan scene, pop tiap kartu/label, satu riser + impact di S6 saat tas 3D terbentuk). Contoh skrip: `F:/AUDIRA-2D-SKILL-MOTION/tools/ep/sfx_ep33.py`.
9. Final 60 fps tanpa audio: `npx remotion render engines/remotion-starter/src/episodes/xray14/index.tsx XrayEP14 <ep>/draft/video_noaudio.mp4 --public-dir=engines/remotion-starter/public --concurrency=6 --log=error`. Mix ffmpeg: VO loudnorm I=-16; SFX volume=-10dB + sidechaincompress ratio=8 attack=5 release=350 threshold=0.015; master loudnorm I=-14 TP=-1.5 (dua-pass bila perlu). Metadata (CLAUDE.md §2 poin 2.4) → `FINAL_VIDEO.mp4`; cek ffprobe. QA: `audira_qa_video` hardOnly + cuts. `record_score` stage final.
10. `audira_generate_srt` → SUBTITLES.srt; `SOCIAL_CAPTIONS.md` 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI` → `audira_validate_social_captions` (keywords: X-ray, bandara, oranye); `NOTES.md`; `append_lesson` INNERWORKS; tampilkan caption di chat. Hapus file perantara (video_noaudio, stills) setelah final.

## Update 2026-11-23 (sesi 3) — draf juri putaran 1 GAGAL, poles 1 sudah ditulis (belum dirender)
- **PENTING: drive C: penuh (0 byte)**. Bash/Remotion gagal ENOSPC. Untuk setiap render set `export TEMP=<ep>/draft/_tmp TMP=<ep>/draft/_tmp TMPDIR=<ep>/draft/_tmp`. Output perintah Bash bisa tidak tampil: tulis ke `<ep>/draft/_tmp/o.txt` lalu baca dengan Read. Heredoc python panjang di Bash gagal parse: tulis skrip .py dengan Write lalu jalankan.
- Perbaikan layout sudah: S3 pil LAPIS 2 y=1285; S4 meter+komputer fade 40.0–40.9; S2 pil SABUK x=340; header monitor DUAL-ENERGY hanya bila w≥800.
- Stills 8 frame `draft/stills` (3,17,27,44,60,71.8→t00071,80,87) + `draft/contact-sheet.jpg` + `style/cover-topic.png` (frame 3, versi sebelum poles — render ulang setelah poles).
- Klip `draft/clip_s3.mp4` (19–37 dtk, 540×960) → `draft/camera.json` motion 5/5. `draft/look.json` (audit:visual, ceilings semua 5). `draft/THEME_CHECK.md` semua ya.
- record_score self draft 4.17; **juri putaran 1 = 3.5 PERLU POLES** (lighting 3, material 3, depth 3, composition 3, motion 5, readability 4). Kelemahan: sepertiga bawah lantai mint kosong, benda vektor datar, tanpa haze/DoF, cahaya tanpa arah.
- Poles 1 SUDAH DITULIS (skrip `draft/_tmp/polish1.py`, tsc bersih, belum dirender): Studio baru (pilar/jendela terminal blur, shaft cahaya kiri-atas, lantai perspektif bertegel + pantulan + haze horizon), `Fore` (nampan keamanan + tali antre biru blur DoF, parallax, y 1560–1920), overlay `keyLight`, Monitor bezel gradien + rim + glow biru + sheen kaca bergerak + filter `xglow` pada isi layar.
- SFX: skrip siap `audio/sfx_ep14.py` (argumen: `<out.wav> <path Xray.tsx>`), belum dijalankan; lalu normalisasi −20 LUFS (ffmpeg loudnorm I=-20) → `audio/sfx.wav`.

## Next (sesi 4)
1. Render ulang stills 8 frame (hapus `draft/stills` dulu) → contact sheet → cek visual; cover-topic.png dari frame 3 baru.
2. Klip 540×960 ulang (frames 570-1110 XrayEP14-Draft --scale=0.5) + camera-audit (Fore parallax tak boleh bikin jerk), `visual-audit.mjs <stills> --style=INNERWORKS --json=<ep>/draft/look.json --episode-dir=<ep> --label=short-baru-11-23-EP14` (jalankan dari F:/AUDIRA-SKILL-MOTION/starter).
3. Skor self + juri buta putaran 2 (prompt dari F:/AUDIRA-SKILL-MOTION/qa/jury.md; beri kolom Frame|Detik|Kata VO dari THEME_CHECK saja). Ini putaran TERAKHIR (maks 2): bila gagal → kembali ke gerbang style (G21), jangan "terima saja".
4. Bila lolos: append_lesson failed INNERWORKS (lantai kosong/vektor datar → juri −1), lalu SFX, final, mix, metadata, QA, record_score final, SRT, captions, NOTES, cleanup (lihat Next 8–10 sesi 1 di atas).
