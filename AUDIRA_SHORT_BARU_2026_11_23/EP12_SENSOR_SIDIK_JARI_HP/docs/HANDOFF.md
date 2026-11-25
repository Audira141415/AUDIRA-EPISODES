# UPDATE 4 2026-11-23 — PRODUKSI SELESAI
- FINAL_VIDEO.mp4 (1080x1920@60, 88,62 dtk, -13,7 LUFS, TP -1,8, metadata ok, signature VALID + C2PA, qa_video PASS). Skor final self 4.0 + juri 4.0 LOLOS (gold diarsipkan).
- Delivery done: validator ok, SUBTITLES.srt, NOTES.md, lessons, 3 scheduled review task. Sisa hanya tahap 11 lewat scheduled task.

# UPDATE 3 2026-11-23 (sesi lanjutan, context guard 192k)
- Stills dirender ulang; S5 label kini pudar cepat (ramp 5.4–5.75). Kamera kontinu per scene ditambah di Film.tsx (push-in 0.975→1.03 + drift Y + roll, S10 tanpa kamera) → audit:camera 5/5.
- Outro handle 34→38 px (src/brand/AudiraOutro.tsx) → audit:layout 0 issue.
- docs/SHOTLIST.md ditulis; `npm run sfx` OK → public/audio/sfx.wav (22 sounds, −26 LUFS).
- Draf: draft/contact-sheet.jpg, draft/look.json (ceilings L4 M4 D4 C4 R5), draft/camera.json (5), draft/THEME_CHECK.md (semua ya). Skor self 4.17 + **juri LOLOS 4.00** (lighting 3) sudah dicatat record_score. STATUS draft done.
- Setelah juri: poles S8 (BO s 1.0 cy 1090, kartu skala 0.84 y 720, hex 52px, "terenkripsi" 46px, label 40px; TEE label dipindah ke x800 y820 anchor isoP(BO,60,-60,46)). **Belum diverifikasi** — render 
ode scripts/stills.mjs out/ep12-s8b "64.5s,68s" Ep12Preview lalu lihat out/ep12-s8b/_sheet.jpg (pakai folder baru; folder lama memuat frame lama). Pastikan label TEE tidak tabrak karaoke (y≈1476) / awan SERVER (830,560).
- SOCIAL_CAPTIONS.md sudah ditulis (6 platform + Jadwal Kamis 26 Nov 19.00–20.40 + Label AI); belum divalidasi.
- Bash fork error di sesi ini → pakai PowerShell.
- **Berikutnya**: verifikasi S8 → final render (langkah 6 di bawah, --title="Cara Kerja Sensor Sidik Jari di HP" --slug=sensor-sidik-jari-hp --ep=EP12) → FINAL_VIDEO.mp4 → audira_qa_video hardOnly → record_score final (jury) → delivery (validator, SRT, NOTES, lessons BONGKAR: lighting datar dinilai 3 oleh juri + kamera drift wajib; GLOBAL: Film-level camera wrapper memperbaiki parked 40%; 3 scheduled task review-sensor-sidik-jari-hp-24h/-72h/-7d dari Kamis 26 Nov 2026 19.00 WIB).
# UPDATE 2 2026-11-23 (sesi lanjutan, context guard 215k)
- Still 16 beat dicek + dipoles (label di-clamp ke tepi, S5 tidak tabrak header, kontras SVG: `<text>` diberi style color = fill dan kontainer gelap diberi `style.backgroundColor` nyata supaya audit:layout membaca chip). Audit stills terakhir: ceilings lighting/material/depth/composition 4, readability 3 (satu teks terenkripsi — sudah diperbaiki, belum diukur ulang), diversity 23.6.
- Polesan terakhir (S5 label hilang saat peta muncul, S8 tong sampah besar di tengah) SUDAH ditulis, typecheck bersih, belum dilihat di still.
- **Cover topik dirender**: `style/cover-topic.png` (Ep12Cover, t=37 optik). Belum di-set STATUS style done → lakukan.
- Sheet terakhir: `project/out/ep12-stills/_sheet.jpg`.
- **Berikutnya**: (a) render ulang stills (perintah di bawah) & cek cepat; (b) `docs/SHOTLIST.md` (scene S1–S10 di `project/src/ep12/timing.ts`) → `npm run sfx`; (c) contact sheet draf `draft/contact-sheet.jpg` + `npm run audit:visual` + klip 15 dtk untuk audit:camera + THEME_CHECK + skor self/juri; (d) final; (e) delivery.
- Perintah stills: `node scripts/stills.mjs out/ep12-stills "2.0s,5.8s,8.9s,15.5s,23s,31.8s,38.5s,42.5s,51s,57s,60s,64.5s,68s,73.8s,76.5s,79s" Ep12Preview` (dari project/; JANGAN dibungkus `timeout`).
- Baca look.json dengan `PYTHONIOENCODING=utf-8` + `encoding='utf-8'`.

# UPDATE 2026-11-23 (sesi lanjutan)
- **VO DIKUNCI 85,58 dtk**: take1 (99,38) disimpan `project/public/audio/vo-take1.wav` + `vo-words-take1.json`; versi terkunci dibuat `python project/scripts/tighten_vo.py` (jeda maks 0,40 dtk + atempo 1,03, timestamp diremap). `npm run vo` sudah jalan (`vo.timing.json`). Salinan di `audio/vo.wav`. STATUS voice = done.
- **Kode ditulis**: `project/src/ep12/` (timing.ts 10 scene S1–S10, FILM_SECONDS 88.6, OUTRO 2.9; pieces.tsx; scenes.tsx; Film.tsx dengan font Plus Jakarta Sans dari `public/fonts/PlusJakartaSans_*.ttf`). Komposisi `Ep12Preview`/`Ep12Final`/`Ep12Cover` terdaftar di `src/Root.tsx`. `tsc --noEmit` bersih untuk ep12.
- **Berikutnya**: cek still (stills.mjs) & perbaiki layout → cover topik `npm run cover`/render still Ep12Cover → `style/cover-topic.png` → SHOTLIST + `npm run sfx` → draf juri → final → delivery (langkah 3–7 di bawah).

# HANDOFF — EP12 Sensor Sidik Jari HP (2026-11-23)

## Selesai
- Pre-flight OK. `project/` = salinan `F:/AUDIRA-SKILL-MOTION/starter` (tanpa models/hdri/out); `project/node_modules` = junction ke `F:\AUDIRA-SKILL-MOTION\node_modules` (BUKAN starter/node_modules — itu hanya 3 paket). `project/SERIES.json` sudah EXPLAINED / @AudiraExplained.
- Riset: `research/SOURCE_REGISTER.md` (23 baris; #7, #18, #22 LEMAH = jangan dipakai).
- Gerbang style: pengguna memilih **BONGKAR** (acc tercatat di STATUS.json). `style/STYLE_DECISION.md`, `style/cover-reference.jpg`, `style/_style_options.jpg`. **`style/cover-topic.png` BELUM** (render dari frame hook film).
- Docs rule 12: `docs/ART_DIRECTION.md` (palet + material 2D), `docs/SCRIPT.md`, `docs/STORYBOARD.md` (8 scene S1–S8), `docs/ASSET_MANIFEST.md`. Semua berbaris `Style: BONGKAR`.
- VO teks ucapan: `audio/vo.txt` (210 kata; `audio/vo-one.txt` versi satu baris — tool VO butuh `text`, bukan scriptPath tanpa timestamp).
- VO take 1: `project/public/audio/vo.wav` **99,38 dtk = terlalu panjang** (target 80–90) + `vo-words.json` (210 kata).

## Keputusan desain (wajib)
- Engine: Remotion **2D murni** (SVG/DOM, tanpa R3F), skill `audira-2d-motion`. Kit BONGKAR = resep look saja (lihat ART_DIRECTION): studio abu `#eceef0→#dddbd6`, chip label `#1b1b1c` teks putih + titik merah `#c0141c`, oranye `#ef9420` sinyal, logam `#bfc2c6/#80858b`, font Plus Jakarta Sans (TTF di `F:/AUDIRA-SKILL-MOTION/kits/bongkar/project/public/fonts/`, salin ke `project/public/fonts/`).
- Konsep: satu HP dibongkar jadi lapisan isometrik berlabel; tiap babak lapisan berbeda (tombol Home kapasitif → tumpukan kaca/OLED/sensor optik → sensor ultrasonik + relief 3D → chip Secure Enclave/TEE → grid 1:50.000 → HP menyatu). Penghitung "1/3, 2/3, 3/3".
- Template kode: `F:/AUDIRA-EPISODES/AUDIRA_SHORT_BARU_2026_11_23/EP04_PULAU_SENTINEL_UTARA/project/src/ep04/` (Film.tsx: Karaoke lokal lebar penuh, CalloutView spring, crossfade SCENES, fiber overlay; timing.ts: SCENES/CALLOUTS/XFADE/OUTRO_SECONDS/FILM_SECONDS). Tulis `project/src/ep12/` serupa, warna BONGKAR. Komposisi `Ep12Preview` 540×960@30, `Ep12Final` 1080×1920@60, `Ep12Cover` still. Wrapper scale(width/1080).
- GLOBAL memory: "Audira" di teks VO; karaoke gap 0.4em, kata mendatang opacity 1, bounce ≤1.04, plate di atas 380 px bawah; signature lewat skrip yang await; loudnorm TP −1.5; render `--jobs=4` (sesi lain render juga); rename EPERM → mv dari bash.
- Bash heredoc panjang dengan banyak tanda kutip bisa gagal di sesi ini → pakai Write tool untuk file.

## Sisa langkah
1. Pendekkan VO ke ≤ 90 dtk: `python project/scripts/tighten-pauses.py` (maks jeda 0,45 dtk; cek argumen di skrip) atau generate ulang `speed: 1.1`. Salin hasil ke `audio/vo.wav`. Lalu `npm run vo -- public/audio/vo.wav` (dari `project/`). Kunci VO → STATUS voice done.
2. Tulis `project/src/ep12/` + daftarkan di `src/Root.tsx`; `npm run typecheck`. Potongan scene = detik kata dari `vo-words.json` (cari kata awal tiap paragraf: "Sidik", "Cara pertama", "Cara kedua", "Cara ketiga", "Setelah", "Seberapa", "Jadi").
3. Cover topik → `style/cover-topic.png`, tampilkan ke pengguna; STATUS style done.
4. `docs/SHOTLIST.md` (format contoh: `F:\AUDIRA-EPISODES\FAKTADUNIA\AUDIRA_SEJARAH_NEGARA_2026\EP68_SEJARAH_PERADABAN_MANUSIA\docs\SHOTLIST.md`) → `npm run sfx`.
5. Contact sheet 540×960 (`node scripts/stills.mjs out/ep12-stills <detik,...> Ep12Preview`) → `draft/contact-sheet.jpg`, `npm run audit:visual`, `draft/THEME_CHECK.md` (G22), skor self + juri buta (qa/jury.md) via `audira_style_memory record_score` style BONGKAR episode `short-baru-11-23-EP12`, maks 2 putaran.
6. Final sekali: `npm run render:final -- --comp=Ep12Final ... --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2`, −14 LUFS TP < −1, metadata ffmpeg (title/artist "AUDIRA (Agus Dwi R.)"/copyright/comment `AUDIRA-sensor-sidik-jari-hp-EP12 | audira.my.id`), signature, `audira_qa_video hardOnly`, → `FINAL_VIDEO.mp4` di folder episode, record_score final.
7. Delivery: `SOCIAL_CAPTIONS.md` 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI`, validator, `SUBTITLES.srt`, `NOTES.md`, lessons BONGKAR + GLOBAL, 3 scheduled review task, tampilkan caption di chat.

