# HANDOFF — EP03 Sealand (AUDIRA Fakta Dunia, 2D short)

Diperbarui 2026-11-23 oleh sesi ke-3 (context guard 194k). Baca juga `STATUS.json`, `style/STYLE_DECISION.md` (VISUALINVESTIGATION, acc), `research/SOURCE_REGISTER.md`.

## Selesai di sesi 3
- S2 blueprint diperbaiki: `node scripts/layout-audit.mjs out/look4` → 0 issue, komposisi/readability 5. Teks SVG perlu `style={{ color }}` agar auditor membaca warnanya; teks di atas kotak SVG → `foreignObject` berlatar (contoh tag SUVENIR).
- Cover topik `style/cover-topic.png` (1080×1920) dirender ulang dengan panel judul tinta penuh lebar, sudah ditampilkan ke pengguna.
- Durasi film kini **91 dtk** (`SEALAND_SECONDS = 91`, `OUTRO_SECONDS = 2.6`, outro card 88,4–91) karena VO berakhir 88,28 dtk ("dari Audira").
- Docs rule 12 lengkap: `docs/ART_DIRECTION.md`, `docs/SCRIPT.md`, `docs/STORYBOARD.md`, `docs/ASSET_MANIFEST.md`, `project/SHOTLIST.md` (16 shot, lint 0 red).
- `npm run sfx` → `project/public/audio/sfx.wav` (91 dtk, 47 bunyi).
- `scripts/draft.mjs` (salinan EP03) ditambal: `hfStills` jadi `async` (bug starter: `await` di fungsi non-async → SyntaxError). Bug sama ada di starter `F:/AUDIRA-SKILL-MOTION/starter/scripts/draft.mjs` — laporkan sebagai follow-up, jangan ubah di sini.
- Draf: `npm run draft -- SealandPreview --frames=2.5s,8s,17s,25s,33s,46s,58s,72s,80s,85s,89.5s` → ceilings lighting 5, material 5, depth 5, composition 5, readability 4, camera motion 5, OK. Sheet `draft/DRAFT_SHEET.jpg`, `draft/THEME_CHECK.md` semua ya.

## Langkah berikutnya (tanpa acc)
1. `record_score` stage draft judge self (episode `short-baru-11-23-EP03`, style VISUALINVESTIGATION, ceilings + camera dari `draft/DRAFT_REPORT.json`, evidence per aspek), lalu jury subagent buta (`project/qa/jury.md` + `draft/jury_input.json` + `draft/DRAFT_SHEET.jpg` + cover quality-bar) → `record_score` judge jury. LOLOS ≥ 3.8.
2. Final: di `project/`: `npm run render:final -- --comp=SealandFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2` (background), cek −14 LUFS & TP < −1 dBFS (limiter bila perlu), metadata ffmpeg (title "Sealand: Negara di Atas Benteng Laut", artist "AUDIRA (Agus Dwi R.)", copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved.", comment "AUDIRA-sealand-EP03 | audira.my.id", date 2026-11-23, `-movflags +faststart+use_metadata_tags`), rename EPERM → `mv` dari bash, `audira_qa_video` hardOnly, `record_score` final.
3. `SOCIAL_CAPTIONS.md` 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI` → `audira_validate_social_captions` (keywords Sealand, Roy Bates); `NOTES.md`; `append_lesson`; 3 scheduled task `review-sealand-ep03-24h/-72h/-7d`; hapus file perantara (out/look*, draft/_stills).

## Catatan teknis
- ffmpeg drawtext butuh `fontfile='C\:/Windows/Fonts/arialbd.ttf'`.
- Hanya ubah folder EP03; sesi lain paralel. Render pakai --jobs=4.

## Sesi 4 (2026-11-23) — juri gagal 2 putaran, menunggu pilihan style baru
- Polesan r2: chip tanggal disembunyikan saat tanda tangan di kanan atas (`signatureAnchorAt` diekspor dari `src/brand/AudiraSignature.tsx`), heli/pesawat digeser dari label, vignette tepi 0.64. Ceilings 5/5/5/5, readability 4.
- Juri r1 3.83, r2 3.67 → G16: WAJIB ganti style, tidak boleh final. Lesson `failed` tercatat.
- `SOCIAL_CAPTIONS.md` sudah lolos validator (perlu disesuaikan bila visual/thumbnail berubah).
- Berikutnya: pengguna memilih CHRONICLE / HISTORYMAP / FILM16 (`style/fallback/STYLE_OPTIONS.jpg`) → cover topik → ulang tahap 4 (G21) → animasi → draf → juri → final. VO `project/public/audio/vo.wav` + `sfx.wav` dipakai ulang (retime sfx bila shotlist berubah).

## Sesi 4 lanjutan — style baru CHRONICLE di-acc (2026-11-23)
- Pengguna memilih CHRONICLE. STATUS.json data.style = CHRONICLE, gate style approved. STYLE_DECISION.md diperbarui.
- Sesi 4 berhenti karena context guard (±193k). Belum ada pekerjaan CHRONICLE.
- Langkah berikut (tanpa acc sampai final):
  1. `audira_motion_style_guide` CHRONICLE + kit `F:/AUDIRA-SKILL-MOTION/kits/chronicle/KIT.md`; contoh kode CHRONICLE 2D di folder saudara yang sudah memakai style ini (EP10_JESSE_OWENS_BERLIN_1936, EP27, EP28, EP30 di `F:/AUDIRA-EPISODES/AUDIRA_SHORT_BARU_2026_11_23/`) — BACA SAJA, jangan ubah.
  2. Cover topik CHRONICLE 1080×1920 → `style/cover-topic.png` (cover lama VISUALINVESTIGATION boleh diganti nama `cover-topic-visualinvestigation.png`).
  3. G21: tulis ulang `docs/ART_DIRECTION.md`, `docs/STORYBOARD.md`, `docs/ASSET_MANIFEST.md`, baris `Style: CHRONICLE` di `docs/SCRIPT.md` (naskah & VO tetap), `project/SHOTLIST.md` (lint).
  4. Bangun ulang scene di `project/src/scenes/sealand/Sealand.tsx` (1165 baris, gaya papan investigasi) atau file baru; durasi tetap 91 dtk, outro 88,4–91, `AudiraSignature seed="sealand-ep03" code="FAKTADUNIA"`. Hindari kelemahan juri lama: label ditabrak ikon/panah/siluet, teks mepet tepi (≥40 px), cahaya datar (pakai key light direksional), band y 1000–1500 kosong. Komposisi: SealandPreview + SealandFinal.
  5. `npm run sfx` bila shotlist retime → draf `npm run draft -- SealandPreview --frames=...` → `draft/THEME_CHECK.md` (G22) → record_score self → juri buta (`F:/AUDIRA-SKILL-MOTION/qa/jury.md`; beri juri HANYA kolom Frame/Detik/Kata VO dari THEME_CHECK, cover `F:/AUDIRA-SKILL-MOTION/references/quality-bar/chronicle.jpg`) → LOLOS (verdict tool) maks 2 putaran.
  6. Final: `npm run render:final -- --comp=SealandFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2` (background), −14 LUFS, TP < −1, metadata (lihat atas), `audira_qa_video` hardOnly, record_score final.
  7. `SOCIAL_CAPTIONS.md` sudah lolos validator (format: `**Judul:**`, `**Tags:**`, `**Cuitan:**`, header `Jam (WIB)`); cek ulang setelah final. NOTES.md, append_lesson CHRONICLE + GLOBAL (teks SVG perlu style color; foreignObject untuk label di kotak SVG; durasi film ≥ akhir VO + outro; bug await di starter draft.mjs; chip HUD kanan-atas bertabrakan dengan anchor tanda tangan y≈221 px → pakai `signatureAnchorAt`), 3 scheduled task `review-sealand-ep03-24h/-72h/-7d` (upload Selasa 24 Nov 2026 19.00 WIB), hapus `project/out/look*`, `draft/_stills`, `draft/CHECK_*.mp4`, `style/fallback/` tetap.

## Sesi 5 (2026-11-23) — scene CHRONICLE ditulis, belum dirender
- File baru `project/src/scenes/sealand/Chronicle.tsx` (14 adegan: hook senja, 1943 lampu sorot + pesawat ranjau, ponton tenggelam, peta 3 mil, benteng ditinggalkan kabut, Roy 1967 + bendera, tembakan 1968, pengadilan Essex, kudeta 1978 heli, sandera → direbut kembali, diplomat, peta 1987 3→12 mil, sertifikat Lord Rp 560.000, CTA senja + toko suvenir). Cue dijangkar ke kata VO lewat `T("kata", n)`. Durasi 91 dtk, outro 88,4–91, `AudiraSignature seed="sealand-ep03"`.
- `project/src/Root.tsx`: SealandPreview / SealandFinal / SealandCover kini memakai `Chronicle` (Sealand.tsx lama tetap ada, tidak dipakai).
- Font Barlow + PlusJakarta disalin ke `project/public/fonts/`. `npx tsc --noEmit` bersih untuk Chronicle.tsx.
- BELUM: render apa pun. Belum ada cover topik CHRONICLE.

### Langkah berikut (urut, tanpa acc)
1. Stills cek cepat: di `project/`: `npm run stills -- out/chk 2s,9s,15s,21s,25.5s,28.5s,34s,41s,46s,53s,59s,62s,66s,72s,80s,85s SealandPreview` → buat satu contact sheet kecil, perbaiki tabrakan label/subjek, teks ≥60 px dari tepi, band y 1000–1500 terisi.
2. Cover: render `SealandCover` (still 1080×1920; t=9,2 dtk) → ganti nama cover lama jadi `style/cover-topic-visualinvestigation.png`, simpan baru `style/cover-topic.png`; `record_score` stage cover self opsional.
3. G21 docs: tulis ulang `docs/ART_DIRECTION.md`, `docs/STORYBOARD.md` (≥6 baris, kolom Audio), `docs/ASSET_MANIFEST.md`, tambah baris `Style: CHRONICLE` di `docs/SCRIPT.md`; `project/SHOTLIST.md` 14 shot sesuai SCENES di Chronicle.tsx (Style: CHRONICLE) → `npm run lint:shotlist` → `npm run sfx`.
4. Draf: `npm run draft -- SealandPreview --frames=2.5s,9s,15s,21s,25.5s,34s,41s,46s,53s,59s,62s,72s,80s,85s` → `draft/THEME_CHECK.md` → record_score self → juri buta (`F:/AUDIRA-SKILL-MOTION/qa/jury.md`, cover `F:/AUDIRA-SKILL-MOTION/references/quality-bar/chronicle.jpg`, juri hanya kolom Frame/Detik/Kata VO) → maks 2 putaran.
5–6. Final + delivery: lihat langkah 6–7 di "Sesi 4 lanjutan".

## Sesi 6 (2026-11-23) — CHRONICLE dirender, docs G21 selesai, draf hampir LOLOS
- Chronicle.tsx dipoles: DateStamp turun 80 px saat tanda tangan di pojok atas (`signatureAnchorAt`), Stamp punya `until` (MICHAEL DISANDERA hilang saat direbut kembali), plat "AUDIRA" di dek hook hilang saat judul SEALAND muncul, label peta jadi HTML ber-chip (auditor), kompas dipindah, label FortDot di atas titik, Roy 1967 framing low close (RX 740/RY 1420/RS 1.55), diplomat benteng jauh (x 610, s 0.68), potongan 1987→lord di `T("Meski") - 0.04`, label rotasi "12 MIL" di-clamp ≤ 900 px.
- Cover CHRONICLE `style/cover-topic.png` (+ `cover_1080x1350.png`, `cover.json`); cover lama → `style/cover-topic-visualinvestigation.png`.
- G21 docs ditulis ulang: ART_DIRECTION, STORYBOARD (15 baris), ASSET_MANIFEST, SCRIPT `Style: CHRONICLE`; `project/SHOTLIST.md` 15 shot, lint 0 red (`npm run lint:shotlist -- SHOTLIST.md --words=public/audio/vo-words.json`); `npm run sfx` → 32 bunyi, −26 LUFS.
- Draf terakhir (frames 2.5,9,15,21,25.5,34,41,46,53,59,62,74.5,80,85 s): ceilings 5 kecuali "12 MIL" terpotong → sudah diperbaiki, BELUM dirender ulang.

### Langkah berikut
1. `npm run draft -- SealandPreview --frames=2.5s,9s,15s,21s,25.5s,34s,41s,46s,53s,59s,62s,74.5s,80s,85s` → harus OK semua 5.
2. Tulis ulang `draft/THEME_CHECK.md` (Style: CHRONICLE; kata VO per frame: 2.5 "cuma empat ratus meter persegi" · 9 "Dan negara ini punya pangeran" · 15 "Inggris membangun benteng ini untuk menghalau" · 21 "sengaja ditenggelamkan di atas gosong pasir" · 25.5 "batas laut Inggris cuma tiga" · 34 "Bates, pemilik radio bajak laut" · 41 "melepas tembakan peringatan ke kapal Inggris" · 46 "benteng itu di luar wilayah Inggris" · 53 "Alexander Achenbach" · 59 "Michael, putra Roy" · 62 "merebutnya kembali, lalu menahan Achenbach" · 74.5 "kini berada di perairan Inggris, dan tak satu" · 80 "Gelar Lord dijual mulai lima" · 85 "Tulis pendapatmu di komentar").
3. record_score draft self (episode `short-baru-11-23-EP03`, style CHRONICLE) → juri buta (`F:/AUDIRA-SKILL-MOTION/qa/jury.md`, cover `F:/AUDIRA-SKILL-MOTION/references/quality-bar/chronicle.jpg`, hanya kolom Frame/Detik/Kata VO) → maks 2 putaran.
4. Final + delivery: lihat "Sesi 4 lanjutan" langkah 6–7 (scheduled task `review-sealand-ep03-24h/-72h/-7d`, upload Selasa 24 Nov 2026 19.00 WIB).

## Sesi 6 lanjutan — juri CHRONICLE putaran 1 GAGAL (3,33), sisa 1 putaran
- Draf terbaru: audit ceilings 5/5/5/5/5, camera 5. `draft/THEME_CHECK.md` (CHRONICLE) dan `draft/jury_vo.md` (kolom Frame/Detik/Kata VO saja, untuk juri) sudah ditulis.
- record_score self 4,17. Juri r1: lighting 4, material 3, depth 3, composition 3, motion 5, readability 2 → PERLU POLES (tercatat).
- Perbaikan wajib putaran 2 (di `project/src/scenes/sealand/Chronicle.tsx`):
  1. G22 F9 (53 dtk, VO "Alexander Achenbach"): layar menampilkan benteng kosong + tag "ROY KE AUSTRIA". Tampilkan figur Achenbach (siluet berjas di dek atau turun dari heli) dengan tag ALEXANDER ACHENBACH saat kata itu. Tag Roy ke Austria hanya saat VO menyebut Roy/Austria.
  2. F1 (2,5 dtk): counter masih "329 m²" saat VO menyebut "empat ratus". Mulai counter lebih awal atau tampilkan 400 langsung.
  3. F2 (9 dtk, "punya pangeran"): figur pangeran/mahkota harus jelas di layar (mahkota sekarang muncul sesudahnya; majukan cue atau tambah siluet pangeran di dek).
  4. Safe zone atas: headline harus ≥ 360 px dari atas di 1080×1920 (CTA "NEGARA SUNGGUHAN?" top 250, Counter hook top 250, DateStamp top 230 → naikkan ke ≥ 360).
  5. Sepertiga bawah (di bawah karaoke, y > 1500) kosong: tambah FG (ombak dekat/percikan, pagar paku keling ber-rim light), kabut MG, perahu/camar → 3 lapis.
  6. Material: tekstur beton/karat pada FortShape (garis panel, noda) + rim di tepi; laut dengan sorot spekular. Plate senja F1/F2/F14 berulang: ubah sudut/jam (misal CTA blue hour atau framing lain).
  7. Teks kecil: "Harwich", sub NameTag (42 px → ≥ 54), "ACHENBACH DITAHAN" abu di abu → teks terang di plat gelap.
  8. Referensi gold CHRONICLE: GOLD.json EP29 (`short-baru-11-23-EP29`, skor 4) — baca dan terapkan parameternya (grain global, motes di god rays, label sekunder ≥ 54 px).
- Lalu: draf ulang (frames sama) → THEME_CHECK → record_score self → juri buta r2 (prompt sama: jury.md, DRAFT_SHEET, quality-bar chronicle.jpg, jury_vo.md). Bila gagal lagi: G16 → kembali ke gerbang style (tawarkan style baru ke pengguna), jangan final.
- Bila LOLOS: final + delivery (langkah 6–7 "Sesi 4 lanjutan").

## Sesi 7 (2026-11-23) — 8 poin poles r2 sudah DITERAPKAN di Chronicle.tsx (tsc bersih), belum dirender
- F9: S_Coup → benteng digeser ke x 380 s 0.9; Achenbach = figur berjas menunjuk di atas perahu kanan (x 830, y 1356) muncul dari T("perdana"); tag ACHENBACH / "ALEXANDER · PM SEALAND" kanan y 880; tag Roy ke Austria hanya sampai T("perdana") (y 1290). Frame draf F9 sebaiknya 53.7s.
- F1: Counter mulai T("empat")−0.85 (400 penuh di 2,5 dtk), hilang di T("Namanya"). F2: mahkota besar di tengah (540,520) pop di T("punya")−0.15; tag PUNYA PANGERAN di T("punya"). Frame draf F2 sebaiknya 10.1s.
- Headline ≥ 360: DateStamp default top 360 (+ `until`), Counter default 380 (+ `until`), card/tag lain digeser (Roy tag y 900 maxW 440, Shots tag y 1250, CTA 380/510, bubble 1250).
- FG sepertiga bawah: komponen `FGSea` (ombak dekat + buih + tiang paku keling, blur) di semua set laut; `FGDesk` (jangka kuningan + pensil) di peta & sertifikat.
- Material: tekstur beton/karat/paku keling di FortShape (`tex`), kilau spekular di Sea. CTA kini mood `bluehour` + bintang (bukan senja ulang). Grain 0.13, motes di god rays.
- Teks: NameTag 60/54 px plat gelap .86, Harwich 50 px, teks sertifikat 46 px.
- Berikut: `npm run stills` cek → `npm run draft -- SealandPreview --frames=2.5s,10.1s,15s,21s,25.5s,34s,41s,46s,53.7s,59s,62s,74.5s,80s,85s` → THEME_CHECK + jury_vo (detik F2 10,1 / F9 53,7) → record_score self → juri buta r2 → final/delivery.

## Sesi 7 lanjutan — juri CHRONICLE r2 GAGAL (3,33) → G16: GANTI STYLE, menunggu pilihan pengguna
- Juri buta r2: lighting 4, material 3, depth 3, composition 3, motion 5, readability 2. Tercatat (record_score jury) + lesson failed CHRONICLE.
- Sebab: G22 F4 (21 dtk, VO "sengaja ditenggelamkan di atas gosong pasir") benteng sudah berdiri tegak, penenggelaman/gosong pasir tidak tampak; siluet benteng terpusat sama di 8/14 frame; figur cutout datar; mahkota memotong judul F2; segel menutup teks F13.
- Style ditolak: VISUALINVESTIGATION, CHRONICLE. DILARANG poles CHRONICLE lagi; DILARANG render final.
- Berikut: `audira_recommend_fallback_style` failedStyles ["VISUALINVESTIGATION","CHRONICLE"] → tawarkan 2–3 style + cover ke pengguna (satu-satunya acc) → cover topik → ulang tahap 4 (G21) → animasi dengan pelajaran: variasi framing (udara, close-up dek, interior, potongan melintang laut-gosong pasir), aksi fisik per kata kerja VO → draf → juri (maks 2) → final + delivery. VO, sfx, riset, naskah, SOCIAL_CAPTIONS tetap dipakai.

## Sesi 8 (2026-11-23) — style baru HISTORYMAP di-acc, pieces ditulis, film BELUM ditulis
- Gerbang style r3: fallback tool (FILM16, BACKROOMS) + memori → ditawarkan HISTORYMAP / CINESTORY / FILM16 (sheet `style/fallback/r3/STYLE_OPTIONS_R3.jpg`). Pengguna memilih **"HISTORYMAP (Recommended)"**. STATUS style approved=true, data.style=HISTORYMAP.
- Referensi gold: `F:/AUDIRA-SKILL-MOTION/kits/historymap/gold/short-baru-11-23-EP16/` (contact sheet + GOLD.json) dan kode `F:/AUDIRA-EPISODES/AUDIRA_SHORT_BARU_2026_11_23/EP16_TRISTAN_DA_CUNHA/project/src/ep16/{Film.tsx,timing.ts,pieces.tsx,scenes.tsx}` (hanya baca). Pola: SCENES + CALLOUTS (HTML plat gelap border-left merah, Anton), Kicker, Karaoke chunk ≤4 kata, overlay key-light pool + vignette + Paper multiply + Grain.
- SUDAH DITULIS (tsc belum dijalankan):
  - `project/src/scenes/sealand/hmGeo.ts` — garis pantai GB/benua/Irlandia dalam km dari Sealand (proj(lon,lat)), PLACES (harwich, naze, rotterdam, hamburg, wien, bonn…), NM.
  - `project/src/scenes/sealand/hmPieces.tsx` — C palette, helpers (ramp/ease/lerp/hash), Defs (cast, cyl, grit, cloth, keylit), Lit, Rimmed, MapView(cam, under, children), Territory(nm,u) = pita perairan teritorial (stroke LAND_GB 2×nm×1.852), Route(from,to,k,u) dengan kepala panah, Dot, FortPin, Sky, Sea, FGWaves, Fort (samping; props flag, rust, lights, under=bagian bawah air + ponton, lift=dek digantung crane, gun, helipad), SealandFlag, FortTop (udara; label di atap), Figure(o: coat/hat beret|cap|helmet|wig/prop rifle|briefcase|gavel, pose, arm, flip, s) ber-rim + tekstur kain, Tug, Launch, Patrol, Heli, Bomber, Mine.
- BELUM: `project/src/scenes/sealand/Historymap.tsx` (film + cover) lalu Root.tsx: ganti import Chronicle → `import { Historymap as Sealand, HistorymapCover as SealandCover, HM_SECONDS as SEALAND_SECONDS } from "./scenes/sealand/Historymap.tsx"`. Font: pakai loader font seperti Chronicle.tsx baris 18–33 (Anton, Jakarta 800 — Manrope 800 TIDAK ada). Brand: `<AudiraOutro seconds={2.6} code="FAKTADUNIA" />`, `<AudiraSignature seed="sealand-ep03" code="FAKTADUNIA" outroSeconds={2.6} />`. Film 91 dtk, outro 88,4–91. Kicker top ≥ 270 (signature di y≈221), headline/kartu top ≥ 380, karaoke y 1428–1540, FG mengisi 1540–1920.
- Rencana adegan (anchor kata dari words.ts T("kata", n)):
  - S1 0–4.85 udara: FortTop tengah, laut top-down + riak, garis ukur emas di tepi dek (2.1–3.2), Counter "400 m²". FG camar blur.
  - S1b 4.85–7.55 potongan melintang: langit, permukaan laut y900, Fort under=true s.95, dasar laut/gosong pasir mengisi bawah; kartu "2 TIANG BETON / DI TENGAH LAUT UTARA" x790 y450; tilt kamera, gelembung.
  - S2 7.55–11.25 peta: zoom-out s60→1.4 (expoOut) dari Sealand ke Laut Utara; tag HTML SEALAND/INGGRIS/LAUT UTARA via toScreen; judul "SEALAND" T("Sealand.") lalu kartu mahkota "PUNYA PANGERAN" T("punya").
  - S3a 11.25–15.6 dok malam 1943: crane menurunkan dek (lift 300→0 sampai T("benteng") 14.69, percik api), lampu sorot; kartu "1943", tag "HM FORT ROUGHS · DIBANGUN INGGRIS" T("membangun"). FG dermaga.
  - S3b 15.6–18.6 peta: Bomber dari Belanda ke muara Thames, ledakan flak T("menghalau"), ranjau jatuh + riak T("penebar"); chip "PESAWAT JERMAN", "RANJAU".
  - S4 18.6–24.2 potongan melintang: 2 Tug menarik Fort (x −300→560) T("ditarik"); T("ditenggelamkan") Fort turun origin 750→900 sampai ponton duduk di gosong pasir (puncak gosong y≈1096, dasar 1330), gelembung + kepulan pasir T("gosong"); T("tujuh") kamera mundur s1→.62, tebing pantai kiri + penggaris "7 MIL LAUT". Stamp "DITENGGELAMKAN", tag "GOSONG PASIR".
  - S5 24.2–27.1 peta pantai s26 cx−8: Territory nm 3 tumbuh, FortPin di luar; stamp "DI LUAR BATAS" T("tiga").
  - S6 27.1–29.55 close-up dek terbengkalai (kabut, karat, pintu berayun, camar): kartu "1945 · PERANG USAI", stamp "DITINGGALKAN" T("ditinggalkan.").
  - S7 29.55–35.45 fajar: Fort kanan besar terpotong (x860 s1.3), Launch masuk dengan Roy (beret), antena radio + gelombang T("radio"); T("mendudukinya") Roy memanjat tangga. Kartu "2 SEP 1967", tag "ROY BATES · PEMILIK RADIO BAJAK LAUT".
  - S7b 35.45–38.75 low angle: bendera Sealand besar naik T("memproklamasikan"), Roy FG besar kiri mengangkat lengan; kartu "KEPANGERANAN SEALAND".
  - S8 38.75–42.95 POV dek: Michael FG kanan membidik, Patrol jauh, kilatan + pelacak + percikan di depan kapal T("melepas")…; "1968", stamp "TEMBAKAN PERINGATAN".
  - S9 42.95–48.75 interior pengadilan Essex: hakim wig, palu diketuk T("memutuskan,") (gelombang kejut), cahaya jendela; kartu "DI LUAR WILAYAH INGGRIS" T("luar"), stamp "KASUS GUGUR" T("gugur.").
  - S10 48.75–56.4 peta Eropa s.75 (cx510 cy200): "1978"; rute biru Sealand→Wien T("Roy",1); kartu "ALEXANDER ACHENBACH · PERDANA MENTERI SEALAND" T("Alexander"); rute merah dari Jerman & Rotterdam ke Sealand T("Jerman",?)/T("Belanda."), kamera geser ke Laut Utara.
  - S11 56.4–60.35 serbuan heli: Heli turun ke dek (Fort kanan s1.5, laut y1500), tentara helm turun, Michael angkat tangan; chip "TENTARA BAYARAN", "MICHAEL DISANDERA".
  - S12 60.35–61.6 Michael menyerbu kembali (lari, senapan), heli kabur; chip "MICHAEL MEREBUT KEMBALI".
  - S13 61.6–64.6 interior sel: jeruji menutup T("menahan"), Achenbach di balik jeruji, sinar jendela; tag "ACHENBACH DITAHAN", stamp "TUDUHAN MAKAR".
  - S14 64.6–67.45 Launch berbendera Jerman tiba di kaki menara, diplomat berkoper turun; kartu "JERMAN KIRIM DIPLOMAT", tag "UNTUK BERNEGOSIASI".
  - S15 67.45–76.7 PAYOFF peta pantai s18: "1987"; Territory 3→12 nm T("memperluas")–T("mil.",?) garis merah melewati Sealand (flash, pin jadi biru); "12 MIL" T("dua",1); kartu "SEALAND KINI DI PERAIRAN INGGRIS"; stamp "0 NEGARA MENGAKUI" T("tak").
  - S16 76.7–82.25 meja + sertifikat: sertifikat masuk, "LORD" besar disorot T("Lord"), kartu "JADI BANGSAWAN" lalu "MULAI Rp560 RIBU" T("lima"). FG pena + koin.
  - S17 82.25–88.4 udara senja: FortTop lampu menyala, label atap "AUDIRA" (brand dalam adegan), kartu "NEGARA SUNGGUHAN?", "ATAU BENTENG + TOKO SUVENIR?", "TULIS DI KOMENTAR".
- Sesudah film: tsc → `npm run stills` cek → cover (`style/cover-topic.png`; lama → `cover-topic-chronicle.png`) → STYLE_DECISION (blok HISTORYMAP approved: yes) → docs G21 (ART_DIRECTION/STORYBOARD/ASSET_MANIFEST/`Style: HISTORYMAP` di SCRIPT) → SHOTLIST + `npm run lint:shotlist` + `npm run sfx` (cut baru) → draft frames (mis. 2.5s,6.2s,10.1s,13.5s,17.3s,21.5s,23.5s,26.6s,28.8s,34s,37.8s,40.6s,45s,47.9s,55.5s,58s,63.5s,66s,72.6s,75.6s,80.9s,84s) → THEME_CHECK, jury_vo, self score, juri buta (maks 2) → final + delivery (langkah 6–7 brief asli).

## Sesi 9 (2026-11-23) — Historymap.tsx DITULIS + Root disambung, tsc sedang jalan, belum dirender
- `project/src/scenes/sealand/Historymap.tsx` ditulis lengkap (±900 baris): 20 adegan S1, S1b, S2, S3a, S3b, S4, S5, S6, S7 (29.55–36.5, Roy memanjat tangga di "mendudukinya"), S7b (36.5–38.75), S8–S17 sesuai rencana Sesi 8; CALLOUTS (big y500 / card y480 / stamp y480 / chip y450, semua top ≥ 395), Kicker top 280, Karaoke 1428 (Jakarta), ChartFG (jangka kuningan + pensil blur) sebagai FG semua adegan peta; overlay key-light + vignette + Paper + Grain; export `Historymap`, `HistorymapCover` (t=3.6 + CoverText "400 m²" / "SEALAND"), `HM_SECONDS = 91`. Brand: AudiraOutro 2.6 + AudiraSignature seed sealand-ep03 code FAKTADUNIA; label atap "AUDIRA" di S17.
- `project/src/Root.tsx` baris 12 sudah diganti ke import Historymap (Chronicle.tsx tetap ada, tidak dipakai).
- `npx tsc --noEmit` dijalankan (lambat >2 mnt), hasil belum dibaca → jalankan ulang di background dan perbaiki error.
- Next: tsc bersih → `npm run stills -- out/hm1 2.5s,6.2s,10.1s,13.5s,17.3s,21.5s,23.5s,26.6s,28.8s,34s,37.8s,40.6s,45s,47.9s,55.5s,58s,61s,63.5s,66s,72.6s,75.6s,80.9s,84s SealandPreview` (cek format argumen di scripts/stills.mjs), buat contact sheet kecil, poles yang rusak (koordinat, overlap teks) → lanjut langkah 2–6 brief (cover, STYLE_DECISION, G21 docs, SHOTLIST+sfx, draf+juri, final, delivery).

## Sesi 10 (2026-11-23) — stills+cover+docs G21+SHOTLIST+sfx SELESAI, draf r0 PERLU POLES (belum juri)
- tsc: Historymap bersih (2 error lama di `src/core/qa/scene-qa.tsx`, bukan kode episode, abaikan).
- Stills `project/out/hm1` dicek: 23 frame cocok VO. Poles: S14 `Fort flag={0}` (bendera menutup kicker), S16 sertifikat `translate(540,…1060) scale(0.85)`.
- Cut digeser agar tidak memotong kata: S1b start 4.97, S3b start 15.77 (SCENES + SHOTLIST + STORYBOARD). `node scripts/shotlist-lint.mjs SHOTLIST.md --timing=public/audio/vo.timing.json --words=public/audio/vo-words.json` → 0 red. `npm run sfx` → 44 bunyi, −26 LUFS.
- Cover `style/cover-topic.png` (Still SealandCover) dirender; lama → `cover-topic-chronicle.png`; `style/cover-reference-historymap.png`; blok HISTORYMAP approved: yes di STYLE_DECISION. SOCIAL_CAPTIONS baris 3 → Style: HISTORYMAP.
- Docs G21 ditulis ulang: ART_DIRECTION, STORYBOARD, ASSET_MANIFEST, SCRIPT `Style: HISTORYMAP`. `draft/THEME_CHECK.md` (23 baris ya) + `draft/jury_vo.md` ditulis.
- Draf r0 (`npm run draft -- SealandPreview --frames=2.5s,6.2s,10.1s,13.5s,17.3s,21.5s,23.5s,26.6s,28.8s,34s,37.8s,40.6s,45s,47.9s,55.5s,58s,61s,63.5s,66s,72.6s,75.6s,80.9s,84s`): ceilings lighting 5, material 5, depth 5, composition 3, readability 2, camera 3 → PERLU POLES. BELUM record_score / juri (putaran juri masih 0 dari 2).
- POLES WAJIB sebelum juri (di `Historymap.tsx` / `hmPieces.tsx`):
  1. Semua `sub` callout 34 px → ≥ 38 px (LUAS SELURUH NEGARA, DI TENGAH LAUT UTARA, PERANG DUNIA II, ±13 KM…, PERANG USAI, PEMILIK RADIO…, PUTRA ROY BATES, GELAR LORD…, + TOKO SUVENIR?).
  2. Huruf "H" helipad di FortTop kontras 1.9:1 → warna lebih terang/kontras (≥ 3:1) atau bukan teks (path).
  3. Label peta "3 MIL" (S5, 3 px) dan "12 MIL" (S15, 7 px) di dalam MapView yang diskalakan → pindahkan ke tag HTML/overlay ukuran ≥ 28 px (pakai toScreen), atau hapus teks SVG kecil.
  4. S9: lingkaran "ESSEX" tertimpa stamp "KASUS GUGUR" → sembunyikan ESSEX saat stamp muncul atau geser stamp.
  5. Kamera (klip 49–67 dtk): diam 39 %, diam terlama 5 dtk di S10 peta Eropa 50–54,5 dtk dan 63,5–65 (S13/S14) → tambah pan/zoom kontinu di S10 (mis. cam drift lt*40) dan S13 (push-in).
- Lalu: draft ulang → record_score self (ceilings+camera dari `draft/DRAFT_REPORT.json`) → juri buta subagent (`F:/AUDIRA-SKILL-MOTION/qa/jury.md` + `draft/DRAFT_SHEET.jpg` + `F:/AUDIRA-SKILL-MOTION/references/quality-bar/historymap.png` + `draft/jury_vo.md`) → record_score jury → final + delivery (langkah 5–6 brief; 3 scheduled task `review-sealand-ep03-24h/-72h/-7d` belum dibuat; upload Selasa 24 Nov 2026 19.00 WIB).
- Poles 1–5 SUDAH diterapkan (sub 38 px, H helipad jadi path, teks SVG 3/12 MIL dihapus, ESSEX pudar 46.9–47.2, kamera S10 lt*0.035, S13 lt*0.06, S14 lt*0.05). Draf r1 sedang dirender.
- Draf r1: semua ceiling 5, kamera 5/5. record_score self 4.17 dan **juri buta r1 LOLOS 4.0** (lighting 4, material 4, depth 4, composition 4, motion 5, readability 3) tercatat. append_lesson HISTORYMAP (fix) tercatat.
- Render final DIMULAI 2026-11-23 ±09.42 UTC di sesi 10 (background): `cd project && npm run render:final -- --comp=SealandFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2`. Sesi berikut: cek `FINAL_VIDEO.mp4` (ffprobe durasi 91 dtk, 1080×1920@60). Bila tidak ada/rusak, jalankan ulang perintah itu di background (script melewati final yang masih terkini).
- Sisa: ukur −14 LUFS & TP < −1 dBFS → metadata ffmpeg (Sesi 3; rename EPERM pakai `mv` bash) → `audira_qa_video` hardOnly → record_score final (judge self, stage final) → `audira_validate_social_captions` (keywords Sealand, Roy Bates) → `NOTES.md` (pelajaran, offset VO 0, gagal VISUALINVESTIGATION/CHRONICLE, taskId) → 3 scheduled task `review-sealand-ep03-24h` (fireAt 2026-11-25T19:00:00+07:00), `-72h` (2026-11-27T19:00+07:00), `-7d` (2026-12-01T19:00+07:00), prompt mandiri meniru `C:/Users/ASUS/.claude/scheduled-tasks/review-tristan-da-cunha-ep16-24h/SKILL.md` (episode EP03 "Sealand: Negara di Atas Benteng Laut", slug sealand-ep03, label short-baru-11-23-EP03, style HISTORYMAP, folder ini) → hapus `project/out/hm1`, `draft/_stills`, `draft/CHECK_*.mp4` → tampilkan caption 6 platform lengkap di chat.
- **Render final GAGAL G18c** (tidak ada FINAL_VIDEO.mp4): "VO -16.5 LUFS, ducked SFX -27.9 LUFS, gap 11.4 LU (min 12)". Perbaikan: turunkan stem SFX (`TARGET_LUFS` di `project/sfx/cues/*.py`, mis. −20 → −22, atau cek apakah stem kini −26 sehingga trim `volume` di render-final perlu disesuaikan), `npm run sfx`, lalu jalankan ulang render final di background. Jangan pakai `--min-vo-gap` tanpa alasan.

## Sesi 11 (2026-11-23) — G18c + G13 diperbaiki, render final berjalan
- G18c: `TARGET_LUFS` SFX −26 → −28 (`project/sfx/cues/auto.py`), `npm run sfx` → −28.0 LUFS. Gap VO−SFX 13.4 LU (lolos).
- G13 gagal (draft/camera.json lama: deadPct 11, medianSpeed 0.019). Fix: sway global di `Historymap` (X ±30 px, Y 0..−16 px, scale 1.06, origin 540px 1500px agar caption tetap di atas zona 380 px). Draft ulang: semua ceiling 5, kamera deadPct 0, medianSpeed 0.05, longestHold 0.
- Render final dimulai ulang di background (log `F:/temp/render-ep03/render.log`). Sisa: QA LUFS/TP, metadata, qa_video, verify_signature, record_score final, NOTES.md, append_lesson, 3 scheduled task, caption di chat.
