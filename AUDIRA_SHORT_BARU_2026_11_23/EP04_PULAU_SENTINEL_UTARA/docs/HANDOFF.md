# HANDOFF — EP04 Pulau Sentinel Utara

## UPDATE sesi 11 (2026-11-23 17.00) — BACA INI DULU (terbaru)
- SELESAI: draf PAINTERLY self 4.17 / **jury 4.0 LOLOS** (material 3). Final: `FINAL_VIDEO.mp4` (+ `.sig.json`, VALID key 498c3302271aadce), 1080×1920@60, 89.51 dtk, −13.7 LUFS, TP −1.9 dBFS, metadata ffprobe OK, `audira_qa_video` hardOnly PASS. Sheet final `draft/final-contact-sheet(-1200).jpg`, `draft/final-look.json`. Self final 4.0 tercatat. SOCIAL_CAPTIONS validator OK. Lessons PAINTERLY + GLOBAL tercatat.
- Perubahan sesi 11: `sfx/cues/auto.py` TARGET_LUFS −28 (G18c gap 13.5); kamera S8 `-20 + lt*9, lt*-5`, S9 `20 - lt*6, rot lt*1.6` (G13 median 0.04, parkir 0); `PaintStrokes` delayRender sampai PNG decode (fix KEDIP 7.45 dtk awal chunk); render:final pakai `--skip-channel` (scene starter PenggantiGibran). EPERM rename terjadi lagi → mv manual + sign.
- SISA: (1) jury buta FINAL → record_score final judge jury. (2) NOTES.md (format EP16). (3) 3 scheduled task `review-sentinel-utara-ep04-24h/-72h/-7d` fireAt 2026-11-26T19:00+07:00, 2026-11-28T19:00+07:00, 2026-12-02T19:00+07:00; catat di NOTES. (4) hapus perantara (project/out/draft-clip.mp4, final-frames), STATUS final+delivery done, caption 6 platform di chat.

## UPDATE sesi 10c (2026-11-23 16.30) — BACA INI DULU (terbaru)
- Hasil render setelah fix pita (10b): ceilings SEMUA 5, layout 0 issue, TAPI audit:camera 3/5 (parkir 39%): skor 5 sebelumnya ternyata berasal dari tepi pita feOffset yang bergerak. Tekstur sapuan statis di filter #paint menguasai vektor vidstab.
- SUDAH di kode (BELUM dirender): Film.tsx #paint kini hanya wobble tepi (feTurbulence 0.016/0.03 + feDisplacementMap scale 14); 2 lapisan tekstur sapuan dihapus. `public/paint-strokes.png` dibuat ulang lebih kuat (op 0.2 terang / 0.26 gelap) dan dipakai `PaintStrokes` di ruang kamera (lapisan terakhir dalam 9 grup cam() + S2 + S3 parallax).
- BERIKUT: render klip + 16 stills + audit + salin ke draft/ (perintah di bawah, background, ±10 mnt). Target camera ≥4, ceilings ≥4 (material terutama). LIHAT sheet 1200 px: tak ada pita vertikal, tekstur cat terasa. Bila material turun → naikkan op PNG (skrip python numpy: noise bicubic 3 oktaf, alpha=clip(4n−1.7)·op, terang fx0.007 fy0.03 seed53 rgb(255,237,209), gelap fx0.03 fy0.007 seed67 rgb(41,23,61), ukuran 1880×2720, ditaruh x−400 y−400). Bila camera masih parkir → kurangi Canvas grain (Film.tsx opacity 0.14).
  `cd project && export TEMP=F:/tmp-remotion TMP=F:/tmp-remotion && npx remotion render src/index.ts Ep04Preview out/draft-clip.mp4 --frames=1680-2220 --log=error --concurrency=4 && npm run audit:camera -- out/draft-clip.mp4 --json=out/camera.json && node scripts/stills.mjs out/ep04-stills 2s,9.8s,13.5s,15.8s,21.5s,24.5s,31s,35.5s,42s,44.5s,53s,61s,66s,72.5s,78.6s,84s Ep04Preview && npm run audit:visual -- out/ep04-stills --video=out/draft-clip.mp4 --at=1,5,9,13,17 --json=out/look-draft.json` lalu salin `_sheet.jpg`→`draft/contact-sheet.jpg` (+ `-1200.jpg` via ffmpeg scale=1200:-2), look-draft.json & camera.json → draft/.
- Lalu: juri self + jury buta putaran 1 (maks 2), final, QA, delivery — lihat sesi 10 BERIKUT (2)–(3) dan brief.

## UPDATE sesi 10b (2026-11-23 16.15) — BACA INI DULU (menggantikan bagian "SELESAI" sesi 10)
- Sheet sesi 10 punya CACAT: panel vertikal bertepi keras (pita kiri lebih gelap) di banyak frame. Penyebab: `feOffset dx=t*9` di filter `#paint` (Film.tsx) menggeser tekstur dan meninggalkan pita kosong selebar t×9 px. SUDAH dihapus (tekstur #paint statis lagi).
- PaintStrokes (scenes.tsx) kini `<image href=staticFile("paint-strokes.png")>` (PNG noise seeded, `project/public/paint-strokes.png`, dibuat python numpy), bukan feTurbulence.
- Render ulang klip + 16 stills + audit + salin ke draft/ dijalankan (sesi 10, background). CEK hasil: `draft/camera.json` (target ≥4), `draft/look-draft.json` ceilings, dan LIHAT `draft/contact-sheet-1200.jpg`: pastikan tidak ada pita/panel vertikal. Bila camera turun (tekstur #paint statis), ulangi pola: tekstur bergerak harus di ruang kamera, jangan feOffset.
- Lalu lanjut juri self + jury buta putaran 1 (lihat sesi 10 BERIKUT (2)–(3)).
- Lesson tambahan: feOffset pada feTurbulence di filter region 0–100% meninggalkan tepi kosong → pita vertikal; selalu lihat sheet setelah mengubah filter.

## UPDATE sesi 10 (2026-11-23 16.05) — BACA INI DULU
- SELESAI: audit:camera klip 1680–2220 = **5/5** (parkir 0%), audit:visual ceilings **SEMUA 5**, layout 0 issue. Sudah disalin: `draft/contact-sheet.jpg`, `draft/contact-sheet-1200.jpg`, `draft/look-draft.json`, `draft/camera.json`.
- Perubahan kode sesi 10: Film.tsx — Canvas tanpa pola weave (opacity 0.14), komponen `Strokes` screen-space DIHAPUS. scenes.tsx — `PaintStrokes` (sapuan strkL/strkD, freq 0.007/0.03, opacity 0.14/0.18) disisipkan sebagai lapisan terakhir di dalam tiap grup `cam()` (9 adegan) + S2 (screen) + S3 (ikut parallax mgX); S9 SeaTop diberi pan sendiri (translate lt*-14, lt*-22, scale 1.2). pieces.tsx — Buoy: papan #2A1F2E + teks foam (kontras vs langit senja).
- PELAJARAN (untuk lessons PAINTERLY + GLOBAL): overlay tekstur statis screen-space (anyaman kanvas pola 6 px, sapuan normal-blend) menguasai vektor vidstab → audit:camera parkir 100% (1/5) walau kamera adegan bergerak. Drift t*9 px/dtk terlalu kecil (terkuantisasi). Fix: tekstur di ruang kamera (lapisan terakhir dalam grup cam), hapus pola halus statis. Menurunkan opacity saja → material jatuh ke 3 (flat planes 24%).
- BERIKUT: (1) lihat draft/contact-sheet-1200.jpg; THEME_CHECK subjek masih cocok (tak ada perubahan isi adegan). (2) record_score self (PAINTERLY, episode short-baru-11-23-EP04, stage draft, ceilings dari draft/look-draft.json, camera draft/camera.json, still draft/contact-sheet-1200.jpg) lalu jury buta subagent (qa/jury.md; cover F:/AUDIRA-SKILL-MOTION/references/quality-bar/painterly.jpg; kolom Frame|Detik|VO dari draft/THEME_CHECK.md). Putaran 1 dari maks 2. (3) Lolos → render:final (perintah UPDATE sesi 3 b, export TEMP=F:/tmp-remotion TMP=F:/tmp-remotion), lalu QA + delivery sesuai brief (NOTES.md belum ada).

## UPDATE sesi 9 (2026-11-23) — BACA INI DULU
- SELESAI: scenes.tsx semua fix juri (S2 akhir scale +0.35 tanpa geser, pin x1.7 + label 64 + TELUK BENGGALA; S6 amber kaya; S7 bg lebih hangat; S8 ombak tsunami naik-surut lt 0.3–3.6 + 2 palem tumbang + pemanah x340; S9 perahu luar gelap OB=[960,1250] + 5 kuman hijau r40 berkenop menuju cincin; header PAINTERLY). Film.tsx: + `Strokes` (sapuan terang/gelap blend normal, opacity 0.1/0.14). tsc bersih (ep04).
- Cover topik PAINTERLY: `style/cover-topic.png` (ceilings semua 5); cover CHRONICLE + sheet/look/camera lama di `draft/_chronicle/`, out lama di `project/out/_chronicle/`. STYLE_DECISION.md PAINTERLY, docs G21 `Style: PAINTERLY` (ART_DIRECTION ditulis ulang, SCRIPT/STORYBOARD/ASSET_MANIFEST/SHOTLIST/THEME_CHECK/SOCIAL_CAPTIONS).
- Sheet putaran 1 dirender: `project/out/ep04-stills/_sheet.jpg`, look ceilings SEMUA 5, layout 0 issue. TAPI audit:camera klip 1680–2220 = 1/5 (parked 100%): tekstur cat statis (filter #paint + Strokes) mendominasi estimasi gerak. SUDAH diperbaiki di Film.tsx (belum dirender): tekstur drift `feOffset dx=t*9 dy=t*3` di #paint + Strokes translate(t*9,t*3).
- BERIKUT: (1) render ulang klip + audit (TEMP/TMP=F:/tmp-remotion): `npx remotion render src/index.ts Ep04Preview out/draft-clip.mp4 --frames=1680-2220 --log=error --concurrency=4` → `npm run audit:camera -- out/draft-clip.mp4 --json=out/camera.json` (target ≥4; bila masih parkir, kurangi amplitudo tekstur frekuensi rendah). Render ulang stills juga (tekstur berubah): `node scripts/stills.mjs out/ep04-stills 2s,9.8s,13.5s,15.8s,21.5s,24.5s,31s,35.5s,42s,44.5s,53s,61s,66s,72.5s,78.6s,84s Ep04Preview` → `npm run audit:visual -- out/ep04-stills --video=out/draft-clip.mp4 --at=1,5,9,13,17 --json=out/look-draft.json`. (2) Lihat sheet (versi 1200 px), cek S8 ombak/S9 kuman/S2 pin; perbarui kolom Subjek di draft/THEME_CHECK.md bila perlu. Salin `_sheet.jpg`→`draft/contact-sheet.jpg` + `-1200.jpg`, look-draft.json, camera.json ke draft/. (3) record_score self lalu jury buta subagent (F:/AUDIRA-SKILL-MOTION/qa/jury.md; sheet 1200, cover painterly.jpg, ceilings+reasons, camera, kolom Frame|Detik|VO dari THEME_CHECK). PAINTERLY, episode short-baru-11-23-EP04, stage draft, maks 2 putaran, pass ≥3.8 tanpa aspek <3. (4) Final + QA + delivery sesuai brief (perintah render:final di UPDATE sesi 3 b, TEMP di F:).

## UPDATE sesi 8 (2026-11-23) — BACA INI DULU
- Pengguna memilih **PAINTERLY** (acc tercatat STATUS.json, data.style=PAINTERLY, failedStyles PAPERWORLD+CHRONICLE). Engine tetap Remotion 2D murni. Resep: lukisan minyak/gouache, golden hour hangat, bayangan violet dingin, painted rims, sapuan kuas, parallax pelan. Cover acuan `F:/AUDIRA-SKILL-MOTION/references/quality-bar/painterly.jpg`.
- Backup kode CHRONICLE: `project/_bak_chronicle/`.
- SUDAH di kode (belum dirender/tsc): Film.tsx — `PaintDefs` filter `#paint` (displacement tepi + 2 lapis tekstur sapuan, arithmetic) dipasang sebagai CSS `filter: url(#paint) saturate(1.32) contrast(1.06)` di div pembungkus semua scene (teks/karaoke tidak kena); Grain diganti `Canvas` (anyaman kanvas overlay 0.22); grade soft-light hangat + violet; karaoke top 1396. pieces.tsx — SHADOW violet rgba(62,36,96,.46), skin #2B1C2E, rimGold #FFB45E, plight hangat→violet. timing.ts — TOMBAK x540 / BUSUR x230 (label tertukar diperbaiki).
- BELUM (scenes.tsx), dari keluhan juri CHRONICLE:
  1. S8 tsunami: tambah visual ombak raksasa (puncak gelombang naik di cakrawala lt 0.3–3, lalu surut) + puing (batang palem tumbang, papan) di pantai.
  2. S9 penyakit: kuman lebih besar (r≈40, duri berkenop, hijau sakit #9BC53D inti gelap) datang dari siluet perahu luar di tepi layar, tertahan di cincin.
  3. S2 akhir (lt 7.6–10.4): hapus geser kiri 230 & scale +1.0 → scale +0.35, y≈980, agar pulau tak terpotong dan judul ±60 KM² (y320) tak menabrak cincin.
  4. S2 peta (lt ~3.4): pin Sentinel lebih besar (group scale 1.7), label 64 px, tambah teks "TELUK BENGGALA".
  5. S8 pemanah: x 270 → 340 (tak terpotong tepi kiri).
  6. S6/S7 kurangi krem keruh: S6 bg ["#E2B877","#A87A4A"], warna SEPIA lebih kaya.
  7. Ganti komentar header scenes.tsx ke PAINTERLY.
- Lalu: `npx tsc --noEmit` (abaikan src/templates/example-usage.tsx) → cover topik `node scripts/stills.mjs out/ep04-cover 0 Ep04Cover` → `style/cover-topic.png` (arsipkan cover CHRONICLE ke `draft/_chronicle/`), tampilkan ke pengguna tanpa acc → STYLE_DECISION.md (PAINTERLY, approved yes, ditolak STORYBOOK/SATELLITEBRIEFING, gagal PAPERWORLD 3.83 & CHRONICLE 3.67) → docs G21 baris `Style: PAINTERLY` (ART_DIRECTION/SCRIPT/STORYBOARD/ASSET_MANIFEST/SHOTLIST/draft/THEME_CHECK, + ART_DIRECTION isi look baru) → pindahkan sheet/look/camera CHRONICLE ke `draft/_chronicle/` → stills 16 frame (perintah sesi 6) + klip 1680–2220 + audit:camera + audit:visual (SET `TEMP=F:/tmp-remotion TMP=F:/tmp-remotion`, C: penuh) → juri self + jury buta (qa/jury.md, cover painterly.jpg, maks 2 putaran) → final + QA + delivery (langkah di brief sesi 6/3; lessons untuk PAINTERLY + GLOBAL).
- Catatan performa: filter #paint ber-turbulence di 1080×1920 bisa memperlambat render; bila terlalu lambat, turunkan numOctaves.

## UPDATE sesi 7 (2026-11-23) — BACA INI DULU
- Klip draf 56–74 dirender ulang (TEMP=F:/tmp-remotion), camera 5/5, ceilings 5. Self putaran 2 = 4.17; **jury buta putaran 2 = 3.67 GAGAL** (lighting 4, material 3, depth 4, composition 3, motion 5, readability 3). Tercatat + lesson failed CHRONICLE. **CHRONICLE gugur (G16/G21).**
- Keluhan juri (berlaku untuk style apa pun): label TOMBAK/BUSUR tertukar (SUDAH diperbaiki di timing.ts: TOMBAK x540, BUSUR x230); beat tsunami (S8) dan penyakit (S9) hanya kartu teks — perlu visual ombak/kerusakan & kuman/wabah; F4 judul ±60 KM² menabrak cincin karang + pulau terpotong kanan/bawah; F13 pemanah terpotong tepi kiri; F2 peta kosong, pin kecil; material vektor datar; palet pucat (sat 0.44 vs cover 0.69).
- MENUNGGU PILIHAN STYLE PENGGUNA (gerbang 3): 1 PAINTERLY (utama), 2 STORYBOOK (unggulan), 3 SATELLITEBRIEFING. Kandidat tool fallback (KINTSUGI/SULAMFORGE/FELTCRAFT/BATIKFORGE) ditolak: tidak cocok topik. Sheet cover kandidat: `style/gate3-candidates.jpg`.
- Setelah dipilih: STYLE_DECISION.md, cover topik, ulang tahap 4 (G21, baris Style:), re-skin `project/src/ep04/`, sheet + juri (maks 2 putaran), final, delivery. VO/riset/SUBTITLES/SOCIAL_CAPTIONS dipakai ulang (ganti baris Style di caption bila ada).

## UPDATE sesi 6b (2026-11-23 ±08.00) — BACA INI DULU
- Jury buta CHRONICLE putaran 1 = **3.83 PERLU POLES** (lighting 4, material 3, depth 4, composition 3, motion 5, readability 4); self 4.17. Lesson `failed` CHRONICLE sudah dicatat.
- Poles putaran 2 SUDAH di kode: batu dasar laut S4 jadi batu gelap; pohon IslandTop gelap + highlight + rim emas; Heli = siluet gelap + filter rim-cyan; S8 push kamera 0.1, heli hx→640 hy 700 scale -0.95, pemanah x 270 y 1370 scale 5.6 (F13 tak ada lagi tabrakan heli/judul/subtitle).
- Sheet putaran 2 SUDAH: `draft/contact-sheet.jpg` + `-1200.jpg`, look ceilings semua 5, layout 0 issue.
- BELUM: klip draf 56–74 dtk gagal ENOSPC (C: penuh). Render ulang dengan TEMP di F:: `cd project && mkdir -p F:/tmp-remotion && TEMP=F:/tmp-remotion TMP=F:/tmp-remotion npx remotion render src/index.ts Ep04Preview out/draft-clip.mp4 --frames=1680-2220 --log=error --concurrency=4` → `npm run audit:camera -- out/draft-clip.mp4 --json=out/camera.json` → `npm run audit:visual -- out/ep04-stills --video=out/draft-clip.mp4 --at=1,5,9,13,17 --json=out/look-draft.json` → salin camera/look ke draft/.
- Lalu juri putaran 2 (TERAKHIR untuk CHRONICLE): record_score self, lalu jury buta subagent (qa/jury.md; sheet draft/contact-sheet-1200.jpg, cover quality-bar/chronicle.jpg, ceilings, camera, kolom VO THEME_CHECK). Juri fokus material & composition. Gagal → gerbang style lagi (G16/G21), jangan tawarkan "render saja".
- Bila LOLOS: final (perintah "UPDATE sesi 3" b; set TEMP ke F: juga), QA, delivery. SOCIAL_CAPTIONS.md SUDAH lolos validator (format YouTube/X/Jadwal diperbaiki, Style: CHRONICLE). Lessons untuk CHRONICLE + GLOBAL (tambah: C: bisa penuh → set TEMP/TMP ke F: untuk remotion CLI).

## UPDATE sesi 6 (2026-11-23) — BACA INI DULU
- SELESAI: cover topik CHRONICLE (`style/cover-topic.png`, judul dinaikkan ke top 1110 agar tak masuk 380 px bawah), STYLE_DECISION.md CHRONICLE, docs G21 (`Style: CHRONICLE` di ART_DIRECTION/SCRIPT/STORYBOARD/ASSET_MANIFEST/SHOTLIST/THEME_CHECK), arsip PAPERWORLD di `draft/_paperworld/`.
- Poles: LABEL SVG diberi `color` (probe layout membaca color CSS, bukan fill), PRIMROSE pakai LABEL, callout S9 bergiliran (UU 1956 67.7–70.0, RADIUS 70.0–71.8, PENYAKIT 71.8–74.2).
- Sheet CHRONICLE putaran 1: `draft/contact-sheet.jpg` (+ `-1200.jpg`), ceilings semua 5 (`draft/look-draft.json`), camera 5/5 (`draft/camera.json`, klip 56–74).
- Juri self CHRONICLE putaran 1 = 4.17 tercatat. Jury buta putaran 1 sedang/sudah dijalankan — cek `audira_style_memory get` style CHRONICLE.
- Jury buta CHRONICLE putaran 1 = 3.83 PERLU POLES (lighting 4, material 3, depth 4, composition 3, motion 5, readability 4) — tercatat + lesson failed. Poles putaran 2 SUDAH di kode: batu dasar laut S4 gelap (bukan permen), pohon IslandTop gelap + highlight + kontur emas, Heli jadi siluet gelap rim-cyan, S8 push 0.1, heli akhir hx 560 hy 700 (tak terpotong), pemanah S8 di y 1370 skala 5.6 (keluar zona subtitle). Cek still 61/64/66 OK.
- SOCIAL_CAPTIONS.md sudah LOLOS validator (format **Judul:**/**Tags:**/**Cuitan:**, Jam (WIB)).
- BERIKUT SEKARANG: render ulang sheet 16 frame + klip 56–74 + audit:visual/camera → salin ke draft/ → juri self + jury buta putaran 2 (TERAKHIR untuk CHRONICLE). Lalu bila jury LOLOS → render final (perintah di "UPDATE sesi 3" langkah b) + QA + delivery; lessons untuk CHRONICLE (bukan PAPERWORLD) + GLOBAL.

## UPDATE sesi 5 (2026-11-23) — BACA INI DULU
- Pengguna memilih **CHRONICLE** (acc tercatat STATUS.json, data.style=CHRONICLE). Engine tetap Remotion 2D murni.
- Kode `project/src/ep04/` SUDAH di-re-skin ke look CHRONICLE 2D (tsc bersih): siluet hitam dengan kontur emas (suku, filter `rim-gold`) / cyan (orang luar, `rim-cyan`), cast shadow panjang (P/Layered), god rays (`Rays` di scenes.tsx: S1, S3, S7, S8, S11), peta teal gelap (S2/S9/S10), grade soft-light + vignette + grain (Film.tsx), callout teks putih Anton + bar emas tanpa kartu kertas, karaoke tanpa kotak. Backup kode PAPERWORLD di `project/_bak_paperworld/`.
- Referensi look: `F:/AUDIRA-SKILL-MOTION/references/quality-bar/chronicle.jpg` (siluet hitam kontur kuning, cahaya volumetrik, peta relief teal gelap, judul putih besar + subjudul emas).
- **LANGKAH BERIKUT**: (1) render cover topik `cd project && node scripts/stills.mjs out/ep04-cover 0 Ep04Cover` → salin f0000.png ke `style/cover-topic.png`, lihat & perbaiki bila perlu, tampilkan ke pengguna (tanpa acc). (2) Update `style/STYLE_DECISION.md` (CHRONICLE, approved yes, ditolak STORYBOOK/SATELLITEBRIEFING, PAPERWORLD gagal juri 3.83) + ganti baris `Style:` di docs/ART_DIRECTION, SCRIPT, STORYBOARD, ASSET_MANIFEST, SHOTLIST, draft/THEME_CHECK ke CHRONICLE dan sesuaikan ART_DIRECTION ke look baru (G21). (3) Pindahkan sheet/look/camera lama ke `draft/_paperworld/`, render sheet 16 frame (detik sama: 2,9.8,13.5,15.8,21.5,24.5,31,35.5,42,44.5,53,61,66,72.5,78.6,84) + `npm run audit:visual` + klip 56–74 dtk + audit:camera, poles, lalu juri self + jury buta (qa/jury.md, style CHRONICLE, episode short-baru-11-23-EP04, stage draft; maks 2 putaran untuk CHRONICLE; pass = rata-rata ≥4, tak ada aspek <3). (4) Bila LOLOS: render final + QA + delivery (lihat "UPDATE sesi 3" langkah b–c; scheduled task review-sentinel-utara-ep04-24h/-72h/-7d, upload Rabu 25 Nov 2026 19.00 WIB).
- Catatan juri PAPERWORLD yang tetap relevan: frame 3/4 hanya beda zoom, F14 (S9) terlalu banyak callout (UU 1956, AUDIRA, RADIUS 5 KM, PENYAKIT) — kurangi; label kecil (SENTINEL UTARA sudah 58px).

## UPDATE sesi 4 (2026-11-23) — BACA INI DULU
- Juri putaran 2 SELESAI: self 4.0 (LOLOS sendiri), **jury buta 3.83 PERLU POLES** (lighting 3, material 4, depth 4, composition 4, motion 4, readability 4). Keluhan: cahaya datar, tanpa key light terarah/cast shadow; F14 peta penuh 4 callout. Pass rule tool = rata-rata ≥ 4.
- Batas 2 putaran draf HABIS → G16/G21: PAPERWORLD gugur untuk episode ini. Lesson `failed` PAPERWORLD sudah dicatat.
- Usulan style baru ke pengguna (MENUNGGU PILIHAN): 1 CHRONICLE (utama, unggulan), 2 STORYBOOK (unggulan), 3 SATELLITEBRIEFING. Fallback tool (kategori craft: KINTSUGI/FELTCRAFT/BRICKCRAFT) ditolak karena tidak cocok topik.
- Setelah pengguna memilih: update STYLE_DECISION.md (approved yes, alternatif ditolak), render cover topik, ulang tahap 4 (docs baris `Style: <ID>`, G21), VO 86.52 dtk & riset & SUBTITLES dipakai ulang, kode visual `project/src/ep04/` diubah ke look style baru, sheet + juri baru (maks 2 putaran), lalu final + delivery.
- SOCIAL_CAPTIONS.md sudah ada; validasi ulang setelah final.

# HANDOFF — EP04 Pulau Sentinel Utara

## UPDATE sesi 3 (2026-11-23) — BACA INI DULU
- SELESAI: `docs/SHOTLIST.md` (lint tanpa RED; payoff 65.0 = KAMI SELAMAT), `project/public/audio/sfx.wav` (npm run sfx -- --duration=89.5), `SUBTITLES.srt` (29 cue), `SOCIAL_CAPTIONS.md` (draf lengkap 6 platform + Jadwal Rabu 25 Nov 2026 19.00–20.40 WIB + Label AI; BELUM divalidasi), `draft/THEME_CHECK.md` (16 frame, semua ya).
- Poles di `src/ep04/`: vignette di Frame, kabut cahaya S3, glow + kamera S8 (cam 1.12 pivot 400,1300), kamera S7/S9/S10/S6 lebih hidup, awan kertas S2, zoom ke tepi karang S2 akhir, bevel tepi + bayangan 14,20 di `P` (pieces.tsx), Fiber 0.42 + mottle + soft-light key light kiri-atas (Film.tsx), label PORT BLAIR x 870.
- Juri: self putaran 1 = 4.17 LOLOS; **jury buta putaran 1 = 3.5 PERLU POLES** (lighting 3, material 3, composition 3, depth 4, motion 4, readability 4; keluhan: material datar, frame f3/f4 & f9/f10 mirip, f2 peta kosong, kamera parkir). Semua sudah dipoles (lihat atas).
- Sheet putaran 2 SUDAH dirender: `draft/contact-sheet.jpg`; audit `draft/look-draft.json` ceilings semua ≥4 (stills+klip 56–74 dtk `project/out/draft-clip.mp4`); camera `draft/camera.json` motion 4/5 (parkir 22%).
- **LANGKAH BERIKUT**: (a) record_score self putaran 2, lalu jury buta putaran 2 (subagent, qa/jury.md; beri sheet 1200px, cover `F:/AUDIRA-SKILL-MOTION/references/quality-bar/paperworld.jpg`, ceilings dari look-draft.json, camera json). Ini putaran TERAKHIR (maks 2): bila gagal → kembali ke gerbang style (G16/G21), jangan tawarkan "render saja". (b) Bila LOLOS: `npm run render:final -- --comp=Ep04Final --out=out/FINAL.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --title="Pulau Sentinel Utara: Suku yang Menolak Dunia Luar" --slug=sentinel-utara-ep04 --ep=EP04` (render-final menulis metadata + tanda tangan), cek −14 LUFS TP<−1 & ffprobe metadata, `audira_qa_video` hardOnly, salin ke `FINAL_VIDEO.mp4`, record_score final. (c) Delivery: validasi SOCIAL_CAPTIONS (expectedKeywords Sentinel, Andaman), NOTES.md, lessons PAPERWORLD (+GLOBAL: junction node_modules ke F:/AUDIRA-SKILL-MOTION/node_modules; audit:visual --video menurunkan depth bila subjek di luar jendela tengah 22–78%×25–68%), 3 scheduled task review-sentinel-utara-ep04-24h/-72h/-7d (upload Rabu 25 Nov 2026 19.00 WIB), tampilkan caption di chat.

## UPDATE sesi 2 (2026-11-23) — BACA INI DULU
- **Langkah 1 & 2 SELESAI.** Kode film 2D ada di `project/src/ep04/`: `timing.ts` (SCENES, CALLOUTS, FILM_SECONDS 89.5), `pieces.tsx` (P/Layered paper, Sea, IslandSide, IslandTop, Figure, Boat, Canoe, Fish, Leaf, Tree, Heli, Buoy, Arrow, Coconut), `scenes.tsx` (S1–S11), `Film.tsx` (Ep04Film, Ep04Stage, Karaoke, Callout, Ep04Cover, Fiber overlay, AudiraOutro 2.9 dtk + AudiraSignature seed "sentinel-utara-ep04"). `src/Root.tsx` mendaftarkan `Ep04Preview` (540×960@30), `Ep04Final` (1080×1920@60), `Ep04Cover` (Still). tsc bersih untuk ep04 (error sisa di src/templates/example-usage.tsx = bawaan starter, abaikan).
- **Junction diperbaiki**: `project/node_modules` sekarang → `F:\AUDIRA-SKILL-MOTION
ode_modules` (starter/node_modules hampir kosong, bundle gagal). Jangan dikembalikan.
- **Cover topik**: `style/cover-topic.png` sudah dirender & sudah ditampilkan ke pengguna (tidak perlu acc). Perintah: `node scripts/stills.mjs out/ep04-cover 0 Ep04Cover` lalu salin f0000.png.
- **Contact sheet putaran 0** (bukan juri): `project/out/ep04-stills/_sheet.jpg` (16 frame: 2,9.8,13.5,15.8,21.5,24.5,31,35.5,42,44.5,53,61,66,72.5,78.6,84 dtk). Hasil baik: paper look jalan, karaoke & callout terbaca, 11 adegan berbeda. Setelah sheet itu sudah diperbaiki: perahu S1 dinaikkan (y 1182), pantai S7 tak lagi terpotong vertikal, pelampung AUDIRA S9 dipindah ke kiri atas (190,660) supaya tidak bertumpuk stempel PENYAKIT DARI LUAR. **Render ulang sheet untuk memastikan.**
- Catatan visual untuk juri: S5 kapal Primrose agak kecil/tertutup ombak (boleh dinaikkan); helikopter S8 kecil (boleh scale 1.2); S2 frame 9.8 dtk peta sebagian besar laut (wajar, sedang zoom ke Andaman).
- **Sisa = langkah 3–6 di bawah** (SHOTLIST + sfx → sheet juri + audit:visual + THEME_CHECK + juri self & jury → final → delivery).

## Catatan sesi 1 (2026-11-23)

## Selesai
- Pre-flight OK. Riset: `research/SOURCE_REGISTER.md` (19 fakta).
- Style gate: pengguna memilih **PAPERWORLD** (acc tercatat di STATUS.json). `style/STYLE_DECISION.md` terisi, `style/cover-reference.jpg` ada. **`style/cover-topic.png` BELUM dirender.**
- Docs: `docs/SCRIPT.md` (211 kata), `docs/ART_DIRECTION.md`, `docs/STORYBOARD.md`, `docs/ASSET_MANIFEST.md` (semua ber-baris `Style: PAPERWORLD`).
- Proyek: `project/` = salinan starter AUDIRA-SKILL-MOTION (tanpa public/models, hdri), `node_modules` = junction ke `F:\AUDIRA-SKILL-MOTION\starter\node_modules`. `SERIES.json` + `src/brand/channel.json` sudah FAKTADUNIA / @AudiraFaktaDunia.
- VO terkunci: `project/public/audio/vo.wav` (86.52 dtk, salinan di `audio/vo.wav`), `vo-words.json` (211 kata, {id,text,start,end}), `vo.timing.json` (npm run vo).

## Keputusan desain (wajib diikuti)
- Engine: Remotion **2D murni** (SVG/DOM, tanpa R3F). Kit PAPERWORLD = resep material/mood saja.
- Film = 89.5 dtk (VO 86.52 + outro card 3 dtk mulai 86.6). Komposisi `Ep04Preview` 540×960@30 dan `Ep04Final` 1080×1920@60. Desain di koordinat 1080×1920, wrapper `transform: scale(width/1080)`.
- Look kertas: tiap bentuk = layer bayangan (offset 10,14, blur 8, rgba(40,25,15,.28)) + layer tepi pucat (offset 3,4) + muka + overlay gradien cahaya kiri-atas; satu overlay serat feTurbulence seeded statis untuk seluruh frame. Tanpa Math.random (pakai hash seeded). Palet hangat pastel di ART_DIRECTION.md. Figur = siluet kertas tanpa wajah dengan garis crease.
- Pelajaran memori PAPERWORLD: palet tetap hangat pastel (jangan dinding gelap), satu subjek jelas per frame, figur 20–35% tinggi frame, label ≥40 px di x 60–1020, jangan di 380 px bawah/180 px atas, objek pembawa lintas adegan (laut + pulau yang sama).
- Pelajaran GLOBAL: Karaoke lokal lebar penuh, gap kata 0.4em, kata mendatang opacity 1, bounce kata aktif ≤1.04; subtitle di atas zona 380 px bawah (baseline plate ±y 1520).

## Potongan adegan (detik film = detik VO, offset 0)
| Scene | Mulai–akhir | Isi | Callout (detik muncul) |
|---|---|---|---|
| S1 Hook | 0–6.4 | pulau kertas naik dari laut berkabut, perahu berhenti, cap coral | "DILARANG MENDEKAT" 1.9 |
| S2 Peta | 6.4–17.1 | peta India→Andaman (proyeksi lon68–97→x0–600, lat36–6→y0–700; Andaman x≈505–520 y≈520–600, Sentinel Utara x501 y570), zoom ke pulau dikelilingi karang | "KEP. ANDAMAN · INDIA" 9.4, "±60 KM²" 13.0 |
| S3 Hutan & suku | 17.1–26.2 | hutan berlapis, siluet tanpa wajah | "50–200 ORANG" 20.7, "BAHASA: ???" 23.4 |
| S4 Berburu & melaut | 26.2–32.3 | kano di karang, tombak/busur, ikan | "TOMBAK" 29.6, "BUSUR" 30.5, "KANO" 31.7 |
| S5 Primrose | 32.3–38.2 | kapal kargo miring di karang → besi jadi ujung panah | "1981 · MV PRIMROSE" 34.7 |
| S6 Arsip 1880 | 38.2–44.9 | kapal layar sepia, 6 siluet ke Port Blair | "1880" 38.4, "6 WARGA → PORT BLAIR" 41.1 |
| S7 Kelapa 1991 | 44.9–56.6 | perahu antropolog, kelapa berpindah tangan | "ANTROPOLOG INDIA" 45.5, "4 JAN 1991" 48.6, "KUNJUNGAN DIHENTIKAN" 55.0 |
| S8 Tsunami 2004 (payoff) | 56.6–67.1 | ombak surut, helikopter, siluet pria membidik busur ke langit | "TSUNAMI 2004" 57.4, "KAMI SELAMAT" 65.0 (riser→impact) |
| S9 Cincin 5 km | 67.1–74.3 | top-down pulau, cincin putus-putus mengembang, pelampung papan "AUDIRA" | "UU 1956" 67.7, "RADIUS 5 KM" 70.0, "PENYAKIT DARI LUAR" 71.8 |
| S10 2018 | 74.3–80.5 | perahu kecil menuju cincin lalu memudar jadi riak (tanpa kekerasan) | "2018" 74.6, "MASUK ILEGAL" 77.3 |
| S11 Outro | 80.5–86.6 | senja emas, pulau siluet, pelampung papan "AUDIRA · FAKTA DUNIA" | "BIARKAN MEREKA SENDIRI" 82.6 |
| Outro card | 86.6–89.5 | `<AudiraOutro seconds={2.9}>` lalu `<AudiraSignature seed="sentinel-utara-ep04">` terakhir | — |

## Sisa langkah
1. Tulis kode `project/src/ep04/` (paper.tsx, pieces.tsx, scenes, Karaoke.tsx, Film.tsx, timing.ts); daftarkan di `src/Root.tsx` (`Ep04Preview`, `Ep04Final`, plus `Ep04Cover` still). `npm run typecheck`.
2. Cover topik 1080×1920 → `style/cover-topic.png`; tampilkan ke pengguna; STATUS stage style done.
3. `docs/SHOTLIST.md` (format: lihat `F:\AUDIRA-EPISODES\FAKTADUNIA\AUDIRA_SEJARAH_NEGARA_2026\EP68_SEJARAH_PERADABAN_MANUSIA\docs\SHOTLIST.md`), lalu `npm run sfx`.
4. Stills contact sheet 540×960 (`node scripts/stills.mjs out/ep04-stills <detik> Ep04Preview`), `npm run audit:visual`, isi `draft/THEME_CHECK.md` (G22), juri self + jury (qa/jury.md) via `audira_style_memory record_score` style PAPERWORLD episode `short-baru-11-23-EP04`. Maks 2 putaran.
5. Final: `npm run render:final -- ... --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2` (sesi lain juga render), loudnorm −14 LUFS TP < −1 bila perlu, metadata ffmpeg, signature (skrip await), `audira_qa_video hardOnly`, `FINAL_VIDEO.mp4` tagged di folder episode, record_score final.
6. Delivery: SOCIAL_CAPTIONS.md 6 platform + Jadwal Upload (WIB) + Label Konten AI, validator, SUBTITLES.srt, NOTES.md, lessons, 3 scheduled review task, tampilkan caption di chat.
