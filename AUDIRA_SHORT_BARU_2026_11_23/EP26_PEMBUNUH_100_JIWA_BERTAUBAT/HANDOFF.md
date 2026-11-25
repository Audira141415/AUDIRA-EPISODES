# HANDOFF — EP26 Lelaki Pembunuh 100 Jiwa yang Bertaubat (AUDIRA QISSAH, @AUDIRAQISSAH)

Ditulis 2026-11-23 oleh sesi pertama (context guard ±191k). Lanjutkan dari sini. Hanya ubah folder EP26 ini.

## Sudah selesai
- Tahap 0 pre-flight: `npm run preflight -- --episode=..` di `project/` → No blockers.
- Tahap 1 konteks: CLAUDE.md, `F:/AUDIRA-EPISODES/QISSAH/AUDIRA_KISAH_ISLAM_2026/_tools/BRIEF_COMMON.md` (adab), memori GLOBAL (fix: tulis "Audira" kecil di VO; sign-video tidak await; rename EPERM → mv; true peak loudnorm TP=-1.5; --jobs=4), pola EP08 (`../EP08_NABI_ILYAS_BERHALA_BAAL/HANDOFF.md`).
- Tahap 2 riset: `research/SOURCE_REGISTER.md` — **HR Bukhari no. 3470** (Kitab Ahadits al-Anbiya), **HR Muslim no. 2766** (Kitab at-Taubah, 2766a–c), QS Az-Zumar 39:53. Teks mentah `research/raw/` (Arab/Inggris/Indonesia, `qs39_53.json`).
- Tahap 3 gerbang style: **pengguna memilih PAPERLANTERN** (Paper-cut Lightbox, `F:/AUDIRA-2D-SKILL-MOTION/library/adrisepta-styles/paper-lantern/STYLE.md` — BACA). Tercatat approved di STATUS.json. `style/STYLE_DECISION.md`, `style/_style_options.jpg`, `style/ref-paper-lantern.jpg`. **Cover topik `style/cover-topic.png` BELUM** — render dari frame hook komposisi, tampilkan ke pengguna (SendUserFile), lanjut tanpa acc.
- Tahap 4 (sebagian): `docs/vo-script.txt` final (191 kata ≈ 76–85 dtk).
- Tahap 5: `project/` = salinan `F:/AUDIRA-SKILL-MOTION/starter` (tanpa hdri/models/out), `node_modules` junction ke `F:/AUDIRA-SKILL-MOTION/node_modules`. `SERIES.json` + `src/brand/channel.json` = QISSAH @AUDIRAQISSAH. VO starter lama dihapus.

## Update sesi 1 (akhir, ±221k)
- DONE: `docs/ART_DIRECTION.md`, `docs/SCRIPT.md`, `docs/STORYBOARD.md` (lint audira-2d PASS WITH WARNINGS), `docs/ASSET_MANIFEST.md`, `project/SHOTLIST.md`.
- DONE: VO Cartesia `project/public/audio/vo.wav` (83,22 dtk, 191 kata) + `vo-words.json` + `vo.timing.json` (`npm run vo`). Film = 86,5 dtk (outro 83,3–86,5). Potongan scene (detik VO): S1 0–5,0 · S2 5,0–18,6 · S3 18,6–29,5 · S4 29,5–47,3 · S5 47,3–53,9 · S6 53,9–66,4 · S7 66,4–76,7 · S8 76,7–83,3. Kata kunci: "tidak" 24,64 · "Genap seratus" 28,27 · "Ya." 36,44 · "sejengkal" ±73,0 · "diampuni" 75,0.
- TODO dulu: perbaiki 4 RED `npm run lint:shotlist -- SHOTLIST.md`: tambah baris header `Style: PAPERLANTERN` dan `Hook: <aksi fisik 0–3 dtk>`; pecah shot #8 (12,5 dtk) jadi 2; tambahkan AUDIRA dalam adegan sebelum outro (mis. papan kertas "AUDIRA" di tiang jalan shot #7/#9, tulis di kolom Objek/Teks). Lalu YELLOW: hook harus berubah di 0–3 dtk, teks #2 ≤ 6 kata.
- Mulai berikutnya dari langkah 3 (kode) di bawah; langkah 1–2 sudah selesai kecuali perbaikan lint di atas.

## Sisa langkah (asli)
1. `docs/ART_DIRECTION.md` (baris `Style: PAPERLANTERN`), `docs/SCRIPT.md` (6 babak + timing), `docs/STORYBOARD.md` (≥ 6 baris `Scene | Waktu | BG/MG/FG/HUD | Kamera | Audio`), `docs/ASSET_MANIFEST.md`, `SHOTLIST.md` (untuk `npm run sfx`). Lint: `python F:/AUDIRA-2D-SKILL-MOTION/tools/storyboard_lint.py docs/STORYBOARD.md` (PYTHONIOENCODING=utf-8). Rencana adegan:
   - S1 Hook (0–6): kotak lampu kertas gelap; 100 manik cahaya kecil di langit kertas meredup jadi bara; kartu "100 JIWA" + "Masihkah ada pintu taubat?"
   - S2 Konteks (6–20): gulungan/strip kertas "HR Bukhari no. 3470 · HR Muslim no. 2766 · Abu Sa'id Al-Khudri"; negeri asal (tangga warna merah bata), siluet lelaki kecil tanpa wajah, counter "99".
   - S3 Rahib (20–30): pondok rahib, satu lentera; strip "Adakah taubat?" → "TIDAK" (cap); lentera rahib padam perlahan (tanpa kekerasan), counter 99→100.
   - S4 Orang alim (30–45): ruang ilmu dengan rak kitab siluet, lentera hangat; kalimat kinetik "Siapa yang bisa menghalangi antara dirimu dan taubat?"; peta kertas dua negeri: asal (merah) vs negeri orang saleh (jendela emas), panah jalan; chip "jangan kembali ke negeri yang buruk".
   - S5 Perjalanan & wafat (45–55): travelling alongside di jalan malam berlapis (bukit, pohon FG lewat); lentera lelaki jatuh/padam di tengah jalan; siluet kecil condong ke arah tujuan (callout "dadanya condong ke tujuan").
   - S6 Perselisihan (55–66): dua cahaya: emas (rahmat) kiri vs biru (azab) kanan, kutipan masing-masing sebagai strip kertas; titik putih penengah turun: "Ukurlah jarak kedua negeri." Chip "MALAIKAT DIGAMBARKAN SEBAGAI CAHAYA".
   - S7 Payoff (66–80): negeri tujuan bergeser mendekat, negeri asal menjauh (layer slide); penggaris cahaya mengukur; callout besar "LEBIH DEKAT SEJENGKAL" (بِشِبْرٍ); jendela negeri saleh menyala semua, fajar emas; "DIAMPUNI". Papan kertas kecil bertulis AUDIRA di tiang jalan (brand dalam adegan).
   - S8 Penutup (80–akhir−3): Arab QS 39:53 `لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ` (font Amiri, rtl) + terjemah "Janganlah kamu berputus asa dari rahmat Allah" + "QS Az-Zumar 39:53"; lalu outro card 3 dtk.
2. VO: `audira_generate_voiceover` scriptPath `docs/vo-script.txt` → `project/public/audio/vo.wav` + `project/public/audio/vo-words.json`; `npm run vo -- public/audio/vo.wav`. Cek ejaan "Audira", "Al-Khudri", "rahib". Target 80–90 dtk (bila < 80, tambah satu kalimat dari SOURCE_REGISTER).
3. Kode: `project/src/episode/Taubat.tsx` (multi-scene director by `t`, lapisan kertas SVG dengan feTurbulence serat seeded, rim cahaya, bayangan offset, glow jendela, flicker deterministik), caption karaoke lokal (lebar penuh, gap 0.4em, kata mendatang opacity 1, bounce ≤ 1.04, di atas zona 380 px bawah), callout HUD tiap angka/nomor hadits, `<AudiraOutro />` lalu `<AudiraSignature seed="ep26-pembunuh-100-jiwa" />` (handle dari channel.json). Daftarkan `TaubatPreview` (540×960@30) + `TaubatFinal` (1080×1920@60) di `project/src/Root.tsx`. Font: serif (Instrument Serif/Cormorant via @remotion/google-fonts bila ada), Amiri untuk Arab.
4. `npm run sfx`, draf contact sheet (`npm run draft -- TaubatPreview`), `npm run audit:visual`, `draft/THEME_CHECK.md`, skor self + juri subagent (`record_score` stage draft, style PAPERLANTERN, episode `short-baru-11-23-EP26`). Lolos ≥ 3.8, tak ada aspek < 3, maks 2 putaran.
5. Final: `npm run render:final -- --comp=TaubatFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --encoder=nvenc --title="Lelaki Pembunuh 100 Jiwa yang Bertaubat" --slug=ep26-pembunuh-100-jiwa --ep=EP26`. Terapkan fix memori GLOBAL. `audira_qa_video` hardOnly. Metadata ffprobe. `record_score` final.
6. Delivery: `SOCIAL_CAPTIONS.md` 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI`, `audira_validate_social_captions`, `SUBTITLES.srt`, `NOTES.md`, lesson ke memori (PAPERLANTERN + GLOBAL), tampilkan caption di chat. Jadwal review tahap 11 (3 scheduled task) sesuai CLAUDE.md.

## Aturan keras
- Tanpa kekerasan/darah/senjata/jenazah. Malaikat = cahaya saja. Siluet tanpa wajah.
- Output render ke F:, jangan ke C:. Jangan sentuh folder EP lain atau starter bersama.

## Update sesi 2 (context guard ±192k)
- DONE: `project/SHOTLIST.md` ditulis ulang 16 shot + baris `Style:`/`Hook:` → lint 0 RED, 1 YELLOW.
- DONE: `project/src/episode/Taubat.tsx` (10 adegan S1–S10 + teks HTML per adegan, caption karaoke, chip "ILUSTRASI · MALAIKAT SEBAGAI CAHAYA", papan AUDIRA di rak S5, strip "bersama AUDIRA" S10, `AudiraOutro`, `AudiraSignature seed="ep26-pembunuh-100-jiwa"`). Terdaftar `TaubatPreview`/`TaubatFinal` di `src/Root.tsx`. tsc bersih.
- DONE: patch `project/scripts/draft.mjs` (await hfStills; bug starter salinan).
- Draf putaran 0 (`npm run draft -- TaubatPreview --frames=1.2s,3.8s,9.8s,13.8s,24.9s,28.6s,37.6s,45.2s,52.6s,60.5s,65.5s,73.6s,76.0s,79.8s --clip=off`): ceilings lighting 4 · material 4 · depth 4 · composition 4 · readability 2 · diversity 54. Readability gagal di teks gulungan S2 + chip 24 px. SUDAH diperbaiki di kode (plat krem S2, chip 36 px, penggaris S9 naik ke y 1275 di atas caption, panah S7 naik) tapi BELUM dirender ulang.
- NEXT: render ulang draf (perintah sama, lalu tanpa `--clip=off` untuk skor kamera), cover topik (`npm run cover` atau still 1080×1920 frame ±3.8 dtk dari TaubatFinal → `style/cover-topic.png`, SendUserFile), `npm run sfx`, `draft/THEME_CHECK.md`, skor self + juri, final render, delivery (lihat "Sisa langkah (asli)" 4–6).

## Update sesi 2b (±205k, sesi berhenti; app menolak start sesi baru otomatis → kartu task_59416d04 diusulkan)
- Draf putaran 1 (dengan klip kamera): lighting 4 · material 4 · depth 4 · composition 4 · readability 3 · camera motion 5/5 · diversity 54,2. Sisa catatan readability: teks SVG papan "AUDIRA" (S5 rak) dan "NEGERI SALEH →" (S7 tiang) dinilai 1,3:1 / 1,1:1 "vs box" walau warna sudah dibalik (pelat gelap + huruf #ffe3a8, plus style color). Kemungkinan audit:layout membaca warna teks SVG secara keliru. Opsi: cek `scripts/layout-audit.mjs` cara mengambil warna `<text>` SVG, atau ganti dua label itu jadi path/HTML. Kick sudah min 36 px.
- Run terakhir draf (setelah `style={{color}}`) mungkin tidak selesai: jalankan ulang perintah draf dan periksa `draft/DRAFT_REPORT.json`.
- Lalu lanjut: cover topik, sfx, THEME_CHECK, juri, final, delivery.
