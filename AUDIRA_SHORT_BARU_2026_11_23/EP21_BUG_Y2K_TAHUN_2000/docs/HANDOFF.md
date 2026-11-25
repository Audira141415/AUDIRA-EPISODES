# HANDOFF — EP21 Bug Y2K — SELESAI 2026-11-23 (sesi ke-6)

Final v2 dirender ulang dengan judul S4 36 px: `FINAL_VIDEO.mp4`, 87,6 dtk, -13,7 LUFS, TP -1,8 dBFS, metadata OK, Ed25519 + C2PA VALID. Final lama dan file perantara sudah dihapus. Tahap 10 lengkap: caption tervalidasi, NOTES.md, lesson, dan 3 scheduled task review. Status = review.
Skor final: self 3,83, juri buta 3,50 (komposisi dan depth lemah, lihat NOTES.md). Tidak ada langkah tersisa sampai review pasca-tayang.

---
# HANDOFF — EP21 Bug Y2K — UPDATE 2026-11-23 (sesi lanjutan ke-5)

## Selesai di sesi ini
- Render final pertama ditolak gate G13 (draft/camera.json lama: deadPct 11%, medianSpeed 0.017). Rig `Cam` di `project/src/y2k/Y2K.tsx` diubah: zoom lerp 0.98↔1.05 + sin(t*2.4)*0.03, px lerp ±20 + sin(t*2.4+i)*40, py lerp 24→-24 + cos(t*2.0+i)*26. Klip `draft/CHECK_47-65s.mp4` + `draft/camera.json` diukur ulang: parked 0%, median 0.046 → LOLOS.
- Bom S7: scale akhir 0.36, x 800, y 150 (dulu 0.42/870/245 → "2038" terpotong & overlap label). Stills 15 frame audit layout 0 issue (`F:\AUDIRA-EPISODES\_tmp\ep21\camfix\`).
- `src/scenes/news/PenggantiGibranWapres.tsx` (sisa starter) handle "@audira" dihapus → channel gate lolos.
- Final dirender (−13,7 LUFS, TP −1,8 dBFS OK). Rename tagged gagal EPERM → dipindah manual; metadata ffprobe OK; tanda tangan via `project/scripts/_finish-ep21.mjs` (await signFile) = VALID + C2PA. `FINAL_VIDEO.look.json`: ceilings lighting 3 (2 frame sampel jatuh di transisi 16,43/60,23 dtk), composition 3 (diversity 9.8), material/depth 4, motion 5.
- `SUBTITLES.srt` dibuat (32 cue, dari audio/vo-words-tight.json).
- `audira_validate_social_captions` (Y2K, 1900, 2038) = OK tanpa error.
- `audira_qa_video` hardOnly: 12 FAIL "BLACK" whole-frame — DIVERIFIKASI false positive (gaya TERMINAL gelap, lumMean ~18; frame tengah tiap run berisi konten: `F:\AUDIRA-EPISODES\_tmp\ep21\qa\mid.jpg`). Cuts/allow yang dipakai ada di CUTS/IMPACTS Y2K.tsx.
- TEMUAN: frame 24,2 dtk judul S4 "KOMPUTER MENEMPELKAN “19” DI DEPAN" terpotong kiri karena sway baru → SUDAH diubah size 44→36 (baris 269), TAPI FINAL_VIDEO.mp4 yang ada BELUM memuat fix ini.

## Langkah berikut
1. Cek still 23.6s,24.2s,25s (`node scripts/stills.mjs <dir> 23.6s,24.2s,25s Y2KPreview` + `node scripts/layout-audit.mjs <dir>`) dan sapu frame lain yang judul lebarnya bisa terpotong sway (S5 "AUDIT_KODE_LAMA", S6 "YANG RUSAK: HAL KECIL", S7 "time_t"). Lalu render final ulang (hapus/ganti FINAL_VIDEO.mp4 dulu; perintah sama seperti sebelumnya). Bila rename EPERM lagi: `Move-Item -Force FINAL_VIDEO.tagged.tmp.mp4 FINAL_VIDEO.mp4`, lalu `node scripts/_finish-ep21.mjs ../FINAL_VIDEO.mp4`.
2. Ukur ebur128 (−14 ±0,5, TP < −1), ffprobe tag, `audira_verify_signature`.
3. `audira_qa_video` hardOnly → catat BLACK sebagai false positive bila frame berisi konten.
4. Contact sheet final 8 frame (1,10,28.8,34.9,48.5,59,75,82.5 dtk → `draft/FINAL_SHEET.jpg`), record_score final self + juri buta (qa/jury.md; ceilings dari FINAL_VIDEO.look.json).
5. NOTES.md + append_lesson (daftar lama di bawah + baru: "G13 camera gate dicek render:final dari draft/camera.json — ukur ulang klip setelah poles", "sway ±40 px memotong judul lebar penuh → judul ≤ 900 px", "qa-video BLACK false positive di gaya gelap", "rename tagged EPERM → finisher script").
6. 3 scheduled task review-ep21-bug-y2k-24h/-72h/-7d (fireAt 2026-11-28T19:00+07:00, 2026-11-30T19:00+07:00, 2026-12-04T19:00+07:00).
7. Hapus perantara (draft/CHECK_*.mp4, draft/_stills, F:\AUDIRA-EPISODES\_tmp\ep21), tampilkan caption lengkap.

---
# HANDOFF — EP21 Bug Y2K — UPDATE 2026-11-23 (sesi lanjutan ke-4)

## Selesai di sesi ini
- Juri buta putaran 1 = 3,50 PERLU POLES (latar hitam datar, hex samar, konten numpuk di atas). Tercatat.
- Poles r1 di `project/src/y2k/Y2K.tsx` (backup `Y2K.tsx.r1.bak`): HexRain 2 lapis (jauh blur scale 1.45 opacity .38 + dekat .5, keduanya dibungkus `data-layout-ignore` supaya audit:layout tidak menghitung digit hex sebagai teks), glow fosfor radial (merah saat bug: 3.2–6.5, 28–36.7, 73.4–76.7), scanline 3/8 px, bar refresh bergulir, bezel kaca CRT + pantulan, drop-shadow di Cam, `SCENE_DY=[60,100,0,0,0,0,70,0]`, S3 digit y640 label y440, alert S4 y300/620/940, S8 teks y400 + Win y860 + label "[✓] time_t 64 bit · [✓] update OS" y1170, teks EXPECTED opacity 0.8.
- Draf ulang: `draft/DRAFT_SHEET.jpg` (ceilings 4/4/4/4/—/5, kamera 5).
- record_score self 3,83; **juri putaran 2 = 3,83 LOLOS** (4,4,3,3,5,4). Kelemahan juri: subjek numpuk 45% atas, pita kosong di atas caption (F1, F4).
- `SOCIAL_CAPTIONS.md` 6 platform + Jadwal Upload (Jumat 27 Nov 2026 19.00–20.40 WIB) + Label Konten AI sudah ditulis (BELUM divalidasi).

## Langkah berikut
1. Final (PowerShell, set temp dulu: `$env:RENDER_TMPDIR="F:\AUDIRA-EPISODES\_tmp\ep21"; $env:TEMP=$env:RENDER_TMPDIR; $env:TMP=$env:RENDER_TMPDIR`), dari `project/`:
   `npm run render:final -- --comp=Y2KFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --gl=vulkan --encoder=nvenc --title="Bug Y2K: Tahun 2000 Dibaca 1900" --slug=bug-y2k --ep=EP21`
   (render-final.mjs sudah menulis metadata + tanda tangan Ed25519 dengan await bila --title/--slug diberikan.) Jalankan di background (lama).
2. Ukur loudness: −14 LUFS, TP < −1 dBFS. Bila TP lebih: loudnorm I=-14:TP=-1.5 dua-pass (audio saja, video copy), lalu tulis ulang metadata (CLAUDE.md poin 2.4) dan tanda tangani ulang (`npm run sign -- ../FINAL_VIDEO.mp4 --title=… --id=AUDIRA-bug-y2k-EP21 --date=2026-11-23`; signFile async — skrip sign-video.mjs tidak await → buat skrip kecil yang `await signFile` lalu embedSignature). Cek ffprobe tag.
3. `audira_qa_video` hardOnly pada FINAL_VIDEO.mp4 (cuts dari CUTS di Y2K.tsx).
4. record_score final: self + juri buta (contact sheet 8 frame dari MP4 final; prompt juri di F:/AUDIRA-SKILL-MOTION/qa/jury.md).
5. `audira_validate_social_captions` (expectedKeywords: Y2K, 1900, 2038). Validator mungkin menuntut FINAL_LONG/YOUTUBE_LONG (rule 09) — batch short ini tanpa long; catat bila hanya itu yang gagal.
6. NOTES.md; append_lesson TERMINAL: failed "latar hitam datar + hex .16 tak terlihat di sheet 540 px → juri 3,5"; fix "hex 2 lapis data-layout-ignore + glow fosfor + bezel → juri 3,83"; failed "chrome Win 22px gagal audit → 36px"; fix "rail ≥ y180"; GLOBAL "junction node_modules ke F:\AUDIRA-SKILL-MOTION\node_modules". Lesson failed: self komposisi/depth terlalu tinggi vs juri putaran 1.
7. 3 scheduled task sekali jalan: review-ep21-bug-y2k-24h/-72h/-7d (fireAt +07:00 dari 2026-11-27T19:00+07:00), prompt mandiri.
8. Hapus perantara (draft MP4 klip, _stills) setelah final OK; tampilkan caption lengkap di chat.

---
# HANDOFF — EP21 Bug Y2K — UPDATE 2026-11-23 (sesi lanjutan ke-3)

## Selesai di sesi ini
- `project/node_modules` junction dipindah ke `F:\AUDIRA-SKILL-MOTION\node_modules` (yang lama ke starter/node_modules tanpa @react-three → bundle gagal).
- Layout diperbaiki (audit layout 0 fail): kit `src/m2d/styles/terminal/kit.tsx` Win chrome 36 px + garis div (bukan teks ─), Rail top 182 font 36, semua teks ≥36, Typed dibungkus fontSize, Cam zoom 1.05 origin 30%, Drum digit absolut, bom S7 pindah ke x870 y245, cover mode diberi judul "BUG Y2K / TAHUN 2000 DIBACA 1900".
- Stills 24 titik: `project/out/y2k/_sheet.jpg` (OK).
- Cover topik: `style/cover-topic.png` (sudah ditampilkan ke pengguna). Skrip renderStill: `project/scripts/_cover.mjs <out.png>`.
- `npm run sfx -- --style=TERMINAL --duration=87.6` → `project/public/audio/sfx.wav` (−26 LUFS, TP −6.4).
- `scripts/draft.mjs` diperbaiki (hfStills async). `npm run draft -- Y2KPreview --out=../draft --frames=1s,4.6s,10s,18s,28.8s,34.9s,42.8s,48.5s,59s,71.5s,75s,82.5s --flat-style` → `draft/DRAFT_SHEET.jpg`, `draft/jury_input.json` (ceilings semua 4, kamera 5), klip `draft/CHECK_47-65s.mp4`.
- `draft/THEME_CHECK.md` (12 frame, semua ya).
- record_score self draft TERMINAL short-baru-11-23-EP21 = 4.17 LOLOS (menunggu juri).

## PENTING: drive C: penuh (0 MB)
Set sebelum render/npm: PowerShell `$env:RENDER_TMPDIR="F:\AUDIRA-EPISODES\_tmp\ep21"; $env:TEMP=$env:RENDER_TMPDIR; $env:TMP=$env:RENDER_TMPDIR`. Output Bash bisa terpotong; PowerShell lebih aman.

## Langkah berikut
1. Juri buta (F:/AUDIRA-SKILL-MOTION/qa/jury.md): subagent hanya diberi `draft/DRAFT_SHEET.jpg`, `style/cover-reference.png`, ceilings/reasons/camera dari `draft/jury_input.json`, kolom Frame|Detik|Kata VO dari THEME_CHECK. record_score judge jury stage draft. Lolos ≥3.8 → lanjut; gagal → poles, maks 2 putaran.
2. Final: `npm run render:final -- --comp=Y2KFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --gl=vulkan --encoder=nvenc` (dengan RENDER_TMPDIR). Cek true peak < −1 dBFS (bila lebih: loudnorm TP=-1.5 dua-pass), metadata ffmpeg (slug bug-y2k, EP21, title "Bug Y2K: Tahun 2000 Dibaca 1900"), signature (sign-video tidak await → pakai skrip yang await), `audira_qa_video` hardOnly, record_score final (self + jury).
3. Delivery: SOCIAL_CAPTIONS.md 6 platform + Jadwal Upload (WIB) + Label Konten AI + validator, NOTES.md, append_lesson TERMINAL (pelajaran: chrome kit Win 22px gagal audit → 36px; rail harus ≥ y180; junction node_modules ke F:\AUDIRA-SKILL-MOTION\node_modules), 3 scheduled task review-ep21-bug-y2k-24h/-72h/-7d.

---

# HANDOFF — EP21 Bug Y2K — UPDATE 2026-11-23 (sesi lanjutan ke-2)

## Selesai di sesi ini
- `style/STYLE_DECISION.md` (Style: TERMINAL, approved: yes) + `style/cover-reference.png`.
- Docs rule 12: `docs/ART_DIRECTION.md`, `SCRIPT.md`, `STORYBOARD.md` (9 baris + kolom Audio), `ASSET_MANIFEST.md`, `SHOTLIST.md` (23 shot, Offset 0; `npm run lint:shotlist -- ../docs/SHOTLIST.md` → 0 red, 3 yellow).
- Film ditulis: `project/src/y2k/Y2K.tsx` (8 adegan + Rail + Captions karaoke y1300 + Glitch tiap cut + CRT + AudiraOutro 3 dtk + AudiraSignature seed y2k-ep21; font via FontFace+delayRender). Root.tsx: `Y2KPreview` (30 fps), `Y2KFinal` (60 fps), Still `Y2KCover` (coverAt 4.6). `tsc` bersih untuk src/y2k.

## Langkah berikut (belum dijalankan apa pun)
1. Stills cek visual: `cd project && npm run stills -- out/y2k 1s,4.6s,10s,15s,18s,22.8s,28.8s,31.5s,34.5s,38.5s,42.8s,45.5s,48.5s,52s,55.5s,59s,61.5s,63.5s,67s,71.5s,75s,79s,82.5s,86s Y2KPreview` → buat satu contact sheet kecil, perbaiki tata letak (belum pernah dirender: cek overlap, font termuat, ukuran teks).
2. Cover: `npx remotion still src/index.ts Y2KCover ../style/cover-topic.png` (CLI bisa gagal → pakai renderStill API), tampilkan ke pengguna.
3. `npm run sfx` (SHOTLIST di ../docs), lalu `npm run draft -- Y2KPreview`, THEME_CHECK, juri buta, record_score (style TERMINAL, episode short-baru-11-23-EP21).
4. Lanjut sesuai bagian "Setelah film" di bawah.

---

# HANDOFF — EP21 Bug Y2K (AUDIRA TECH @AudiraTECH) — 2026-11-23

## Selesai
- Tahap 0–2: STATUS.json init, riset `research/SOURCE_REGISTER.md` (17 fakta; koreksi: satelit mati karena patch → tidak dipakai; "Y2K" dicetus David Eddy, bukan Bemer).
- Tahap 3: pengguna memilih **TERMINAL** (mograph 2D dari skill audira-2d-motion; sumber kit `F:/AUDIRA-2D-SKILL-MOTION/engines/remotion-starter/src/styles/terminal/kit.tsx`). Sheet opsi: `style/_style_options.jpg`, ref: `style/ref-TERMINAL.png` (salin jadi `style/cover-reference.png`). Belum ada `style/STYLE_DECISION.md` dan `style/cover-topic.png` → buat (G20: isi penuh, `Style: TERMINAL`, alternatif ditolak KLIPING & PIKSEL, approved: yes, 2026-11-23).
- VO: `audio/vo-timed.txt` (233 kata) → Cartesia 90,65 dtk → `audio/tighten.py` (jeda maks 0,42) → `audio/vo-tight.wav` 84,44 dtk + `audio/vo-words-tight.json`. Disalin ke `project/public/audio/vo.wav` dan `project/src/vo-words.json`; `npm run vo` → `public/audio/vo.timing.json`. VO TERKUNCI.
- Proyek: `project/` = starter AUDIRA-SKILL-MOTION (tar copy, tanpa models/hdri), `node_modules` = junction ke `F:/AUDIRA-SKILL-MOTION/starter/node_modules` (remotion terresolve dari `F:/AUDIRA-EPISODES/node_modules`). `SERIES.json` sudah TECH, `npm run channel` → channel.json @AudiraTECH.
- Kit TERMINAL + dependensi disalin ke `project/src/m2d/` (styles/shared.tsx, styles/terminal/kit.tsx, components/WordCaptions.tsx, lib/halus.tsx, lib/words.ts, format.ts, project.json, words.json, theme.ts, brand.json). Font VT323-Regular.ttf + JetBrainsMono-Var.ttf ada di `project/public/fonts`. Jangan pakai `StyleFonts` (butuh banyak font) — tulis @font-face sendiri untuk 'Term Head' (VT323) & 'Term Mono' (JetBrainsMono).

## Belum
Docs rule 12 (`docs/ART_DIRECTION.md`, `SCRIPT.md`, `STORYBOARD.md` ≥6 baris dengan kolom Audio, `ASSET_MANIFEST.md`, `SHOTLIST.md` untuk npm run sfx), film, cover topik, sfx, draft+juri, final, captions, NOTES, lessons, 3 scheduled task.

## Rencana film (`project/src/y2k/Y2K.tsx`, 1080×1920, durasi 87.6 dtk = VO 84.44 + outro 3)
Komposisi: `Y2KPreview` 1080×1920@30 (render draf dengan `--scale=0.5`, supaya useFrame kit tetap 1080) dan `Y2KFinal` 1080×1920@60. Tanpa <Audio> di komposisi (render:final memasukkan `--vo`). Lapisan terakhir `<AudiraSignature seed="y2k-ep21" />`, `<AudiraOutro />` 3 dtk akhir. Prompt rail atas selalu `audira@tech:~$ ./y2k.sh` (brand dalam adegan). Caption karaoke SENDIRI (bukan kit Caption yang di y=1500): top ±1290, bawah < 1540, gap 0.4em, kata belum diucap tetap kontras (bukan T.faint), aktif = blok hijau. Konten adegan di y 200–1260. HexRain + CRT + Glitch 0.15 dtk tiap potongan; kamera drift kontinu (scale 1→1.06 + pan) per adegan.

Potongan (detik, dari vo-words-tight): S1 0–8.0 | S2 8.0–16.4 | S3 16.4–23.3 | S4 23.3–36.7 | S5 36.7–46.6 | S6 46.6–62.9 | S7 62.9–76.7 | S8 76.7–84.6 | outro 84.6–87.6.
- S1 hook: jam sistem 31.12.1999 23:59:57→58→59 (0–2.4) → 00:00:00, tanggal jadi **01.01.1900** merah + glitch (3.2); "00" raksasa "DUA ANGKA NOL" (3.5–6.2); 6.6 boot `> boot AUDIRA TECH ... OK`.
- S2: grid memori inti (cincin + kabel silang 16×10) + callout "1 BIT ≈ US$1" (9.5–13.4); 13.8 programmer mengetik COBOL `05 TAHUN PIC 99.` "HEMAT 2 DIGIT".
- S3: kotak tanggal [1][9][9][9] → "19" jatuh (17.5) → "99"; odometer 99→00 (20–22.5) callout "99 → 00".
- S4: "19"(awalan otomatis) + "00" = **1900** merah vs 2000 dicoret (23.5–29); bank "LAMA SIMPAN −100 TAHUN" (29.5–32); 3 jendela ALERT bertingkat: TAGIHAN BANK ✗, JADWAL PESAWAT ✗, JARINGAN LISTRIK ✗ + ikon piksel (32.4–36.7), shake.
- S5: `memo_1958.txt` "PERINGATAN PERTAMA: 1958 — Bob Bemer" (36.8–40.2); kode discan + stempel ✓ PATCHED, penghitung baris (40.3–43.9); meter biaya **US$300 MILIAR+** (44.2–46.6).
- S6: jam 23:59:59→00:00:00 dentang + skyline piksel lampu tetap menyala "01.01.2000" (46.8–49.6); "YANG RUSAK: HAL KECIL" (50–51.3); kartu PLTN SHIKA JEPANG monitor radiasi (51.7–54); 150 MESIN SLOT DELAWARE (54.5–56.5); browser usno.navy.mil "1 Jan 19100" (57–59.9); stempel "KIAMAT DIBATALKAN — karena diperbaiki" (60.3–62.9).
- S7: bom waktu "2038" (63–64.6); register 32 bit menghitung "detik sejak 01.01.1970" (64.7–68.5); **2.147.483.647** + "19 JAN 2038 03:14:07 UTC" (68.9–72.9); overflow bit → 1000…, −2.147.483.648, tanggal **13 DES 1901** merah glitch (73.4–76.6).
- S8: register melebar 32→64 bit, "± 292 MILIAR TAHUN" (76.8–80.2); "PERANGKATMU SUDAH SIAP?" + `> ikuti AUDIRA TECH` (80.6–84.6).

## Setelah film
`npm run sfx` (SHOTLIST.md + vo.timing.json), cover topik = still frame S1 ±3.5 dtk → `style/cover-topic.png` (tampilkan ke pengguna), `npm run draft -- Y2KPreview` → draft/, `draft/THEME_CHECK.md`, juri buta (qa/jury.md) `record_score` stage draft (self lalu jury), lolos ≥3.8 → `npm run render:final -- --comp=Y2KFinal --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --gl=vulkan --encoder=nvenc` (jobs 4: sesi lain render paralel). Pelajaran GLOBAL: true peak bisa > −1 dBTP → limiter/loudnorm TP=-1.5 dua-pass; sign-video.mjs tidak await (tandatangani dengan skrip yang await); rename EPERM → mv dari bash. Metadata ffmpeg (CLAUDE.md poin 2.4, slug `bug-y2k`, EP21), `audira_qa_video` hardOnly, `record_score` final, SOCIAL_CAPTIONS.md 6 platform + validator, NOTES.md, append_lesson TERMINAL, 3 scheduled task review.
