# HANDOFF — EP27 Nadia Comăneci, nilai 10 tampil "1.00" (Montreal 1976) — 2026-11-23

Sesi 1 pindah karena context guard (±192k). Lanjutkan dari sini; jangan ulang tahap yang sudah selesai.

## Sudah selesai
- Tahap 1 konteks (GLOBAL memory: tulis "Audira" di VO; loudnorm 2-pass TP −1.5; sign lewat skrip yang await; qa_video hardOnly; render paralel → `--jobs=3..4`).
- Tahap 2 riset: `research/SOURCE_REGISTER.md` (21 fakta). Baca bagian "Mitos yang dihindari": papan = **Omega** (bukan Longines), papan TIDAK rusak (sengaja 3 digit), bukan "10 pertama sejarah senam" (pakai "senam Olimpiade modern"), total 7 (bukan 1+7), Nelli Kim juga dapat 10, jangan kutip reaksi Nadia.
- Tahap 3 style **CHRONICLE** (acc pengguna 2026-11-23) + `style/cover-topic.png` + `style/STYLE_DECISION.md` (aturan visual: tanpa cincin Olimpiade, tanpa logo Omega di layar).
- Tahap 5 scaffold `project/` (salinan EP10: scripts/, sfx/, src/brand, src/lib fig/set/hud). Modul dari `F:/AUDIRA-EPISODES/node_modules`, tanpa npm install. Still: `node ../../../node_modules/@remotion/cli/remotion-cli.js still src/index.ts <Comp> out/x.png --frame=N --log=error` (±75 dtk/still; untuk banyak frame pakai `node scripts/stills.mjs`).
- Tahap 6 VO: `project/public/audio/vo.wav` (78,95 dtk, 189 kata, voice 04b567df…), `vo-words.json` (word timestamps, field text/start/end), `vo.timing.json` (dari `node scripts/vo-analyze.mjs`). Teks VO: `docs/vo.txt`. Ejaan "Audira" dan "Comaneci" sudah ditulis ramah TTS (belum didengar ulang: cek cepat lafal "Audira" di 9,4 dtk dan 76,5 dtk).

## Library 2D (project/src/lib)
- `fig.tsx` `<Figure x y h pose phase contour facing glow opacity angles/>` (pose run/walk/stand/jump/crouch/set/armsUp/wave; `angles` override sendi: lean, thA/thB paha, flA/flB lutut, uaA/uaB lengan atas, faA/faB lengan bawah, head, bob).
- `set.tsx` W,H, rng, MOODS, Sky, Fog, Stadium, Track, Finish (grain+vignette), Skyline.
- `hud.tsx` useFonts() (wajib di root), C palet, useIn/useOut/usePop, DateStamp, Counter, Card, NameTag, Quote, Citation, Medal, BrandPlate.
- **`gym.tsx` (baru EP27)**: `Arena` (arena indoor gelap, truss, lampu, kerucut sorot, tribun, lantai; props floorY spot spotX tiers), `UnevenBars` (`BARS` posisi; props s ox oy), `Beam`, `BarGymnast` (rotasi di tangan: theta 0 menggantung, 180 handstand — giant swing = theta 0→360), `Gymnast` (rotasi di pinggul, untuk salto/dismount), `Digit` 7-segmen, `Scoreboard` (digits "100" → 1.00; `ghost` 0..1 = slot digit ke-4 merah putus-putus; `blink`), `JudgeCard`.
- `Cover.tsx` = `Ep27Cover` (contoh pemakaian). Brand: `src/brand/AudiraOutro.tsx` (`code="SPORTFACTS"`), `AudiraSignature.tsx` (`seed="comaneci-skor-sempurna-1976"`, handle dari channel.json = @AudiraSportFacts).

## Timing VO (awal kata kunci, detik) → rencana adegan (≥7, ganti tiap ≤13 dtk)
| Adegan | Waktu | Isi VO | Visual + callout |
|---|---|---|---|
| S1 Hook | 0–11.0 | "Nilai sempurna pertama…" (0.09), "satu koma nol nol" (5.84), "Kok bisa?" (7.42), "Audira Sport Facts" (9.40) | arena gelap, papan skor raksasa berkedip lalu menyala 1.00 tepat 5.84 (impact), "?" merah 7.4, BrandPlate in-world |
| S2 Konteks | 11.0–23.4 | Montreal 18 Juli 1976 (11.15), 14 tahun (15.60), palang bertingkat (16.49), 150 cm (18.31), 39 kg (20.53), Nadia Comaneci (22.31) | DateStamp "18 JULI 1976 · MONTRÉAL", siluet emas berjalan ke palang, Counter 14 TAHUN, chip 150 CM · 39 KG, NameTag NADIA COMĂNECI · ROMANIA |
| S3 Papan | 23.4–34.9 | papan skor (24.27), Omega (26.27), tiga digit (27.52), mustahil (30.40), angka sepuluh (32.65), tidak pernah dibuat (33.56) | close-up papan / blueprint: 3 slot digit menyala satu per satu (27.5), kartu "OMEGA · 3 DIGIT", cap "10 = MUSTAHIL" (30.4), slot ke-4 merah putus-putus muncul lalu dicoret "TIDAK DIBUAT" (33.6) |
| S4 Rutinitas | 34.9–41.9 | berayun (35.53), berputar (36.22), mendarat (37.76), juri nilai sepuluh (40.12) | palang bertingkat, BarGymnast giant swing, Gymnast dismount salto + landing 37.8 (impact), 4 JudgeCard "10" naik 40.1 |
| S5 Momen 1.00 | 41.9–52.3 | juri bertanya ke teknisi (42.11), "harus tampil apa?" (44.60), "satu koma nol nol" (47.90), "nilai sempurna pertama" (49.75) | bilik teknisi: siluet juri + teknisi di depan panel, tanda tanya; papan crash-zoom menyala 1.00 di 47.9 (riser→impact besar, kilat kamera tribun); Card "1.00 = 10 SEMPURNA" |
| S6 Payoff | 52.3–65.3 | tujuh nilai sepuluh (56.58), empat palang (57.96), tiga balok (59.46), tiga emas (62.03), perak (62.94), perunggu (64.26) | balok keseimbangan + siluet, 7 ubin "10" (4 emas-label PALANG, 3 BALOK), lalu Medal ×5 (3 emas, perak, perunggu; cuma warna disk berbeda) |
| S7 Warisan | 65.3–76.1 | 2006 (65.70), dibatasi sepuluh (67.56), 1997 (69.03), 16 tahun (71.97), tak akan terulang (75.26) | kartu timeline 1976→2006 "BATAS 10 DIHAPUS", 1997 "MIN. 16 TAHUN", siluet 14 tahun memudar ke papan 1.00 terakhir "TAK AKAN TERULANG" |
| S8 Outro | 76.1–82.0 | "Ikuti Audira Sport Facts…" | CTA singkat lalu `<AudiraOutro code="SPORTFACTS"/>` 2,5–3 dtk terakhir; durasi film ±82 dtk (4920 frame @60) |

## Sisa langkah
1. Tahap 4 docs: `docs/SCRIPT.md` (6 tahap dari tabel atas + vo.txt, estimasi 189 kata ≈ 76–84 dtk, aktual 78,95), `docs/STORYBOARD.md` (≥6 baris `Scene | Waktu | BG/MG/FG/HUD | Kamera | Audio`), `docs/ART_DIRECTION.md`, `docs/ASSET_MANIFEST.md`, `docs/SHOTLIST.md` (format seperti `F:/AUDIRA-EPISODES/AUDIRA_FAKTA_OLAHRAGA_2026/EP05_RUMBLE_IN_THE_JUNGLE_1974/docs/SHOTLIST.md`, header `Style:`/`Hook:`/`Offset: 0`, dipakai `node scripts/sfx.mjs`). Semua docs wajib baris `Style: CHRONICLE`.
2. Tahap 7: `src/Film.tsx` multi-scene (director `t<…&&<S1/>`), kamera kontinu (scale/translate pelan per adegan), callout kinetik tiap angka, karaoke per kata dari vo-words.json (lebar penuh, gap ≥0,4em, opacity kata ≥0,7, y≈1300, di atas zona 380 px bawah), `<Audio src=staticFile("audio/vo.wav")/>` hanya untuk preview (render-final memasang VO via `--vo`), `AudiraSignature` lapisan terakhir, `AudiraOutro`. Daftarkan `Ep27Final` (fps 60, 1080×1920) di `src/Root.tsx`. Lalu `node scripts/sfx.mjs` → `public/audio/sfx.wav`.
3. Tahap 8: contact sheet 8 frame (≈3, 6, 15, 28, 38, 48, 58, 70 dtk) 540×960 → `draft/contact-sheet.jpg`, `node scripts/visual-audit.mjs`, `draft/THEME_CHECK.md` (G22), skor self + juri subagen buta (`record_score` stage draft, style CHRONICLE, episode `short-baru-11-23-EP27`). Lolos = rata-rata ≥3.8, tak ada aspek <3.
4. Tahap 9: `node scripts/render-final.mjs --comp=Ep27Final --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --encoder=nvenc --title="Nilai 10 Sempurna yang Tampil 1.00" --slug=comaneci-skor-sempurna-1976 --ep=EP27` (cek opsi di header skrip). Loudnorm 2-pass −14 LUFS TP −1.5 bila perlu, metadata ffmpeg (artist "AUDIRA (Agus Dwi R.)", copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved.", comment "AUDIRA-comaneci-skor-sempurna-1976-EP27 | audira.my.id"), `audira_qa_video hardOnly` (+ `allow` untuk kilat kamera), `record_score` final.
5. Tahap 10: `SOCIAL_CAPTIONS.md` 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI`, `audira_validate_social_captions`, `NOTES.md`, `append_lesson` CHRONICLE, 3 scheduled task review (`review-comaneci-1976-24h/-72h/-7d`), caption tampil di chat, hapus file perantara (`project/out`).

---
## Sesi 2 (2026-11-23) — pindah lagi karena context guard (±190k)
### Selesai di sesi 2
- Tahap 4 docs: `docs/SCRIPT.md`, `STORYBOARD.md` (8 baris + kolom Audio), `ART_DIRECTION.md`, `ASSET_MANIFEST.md`, `SHOTLIST.md` (17 shot, `Offset: 0`). Semua `Style: CHRONICLE`.
- Tahap 7: `project/src/Film.tsx` (17 Shot di 8 babak, karaoke, callout Chip/Stamp/BigTitle/Tile/MedalC, Booth, Blueprint, Flash di 5.84 & 47.9 = `FLASHES`, AudiraOutro + AudiraSignature). `FILM_SEC = 82`, OFF 0. `Ep27Final` terdaftar di `src/Root.tsx`. Still 15 frame dicek mata, layout diperbaiki (tanda "?", timeline, medali).
- SFX: `node scripts/sfx.mjs` → `public/audio/sfx.wav` (82 dtk, 36 suara, −20 LUFS).
- Draf: `draft/contact-sheet.jpg` (8 frame 3, 7.6, 15, 28.5, 38.2, 50.5, 64.5, 70 dtk; `draft/sheet/look.json` ceilings semua 5), `draft/clip.mp4` (frame 2040–3120 = 34–52 dtk, 540×960), `draft/camera.json`.

### Temuan audit yang harus diperbaiki dulu (G13)
- `diversity 24` (< 30): frame terlalu mirip (arena gelap biru di banyak babak). Naikkan variasi: mis. S2 pakai lantai/tribun lebih hangat, S4 sorot lebih terang/warna lantai matras, S6 balok dengan latar hangat emas, S7 blueprint sudah beda. Saturasi 0.41 vs cover 0.69 → naikkan warna (lantai, tribun, glow).
- camera-audit klip 34–52: motion 4/5 tetapi parked 28%, longest hold 2 dtk (> 1.5), median speed 0.018 (< 0.04). Perkuat gerak kamera `cam` di S4 (34.9–41.9), S5a (41.9–47.9), S5b (47.9–52.3): skala lebih besar (mis. 1.0→1.18) + x/y drift; cek juga babak lain (gunakan klip lain bila perlu).
- Lalu render ulang contact sheet (`node scripts/stills.mjs ../draft/sheet 3s,7.6s,15s,28.5s,38.2s,50.5s,64.5s,70s Ep27Final 0.5`, salin `_sheet.jpg` → `draft/contact-sheet.jpg`), klip (`node ../../../node_modules/@remotion/cli/remotion-cli.js render src/index.ts Ep27Final ../draft/clip.mp4 --frames=2040-3120 --scale=0.5 --muted --log=error --concurrency=6`), `node scripts/camera-audit.mjs ../draft/clip.mp4 --json=../draft/camera.json`.

### Sisa langkah
1. Perbaikan di atas → `draft/THEME_CHECK.md` (G22, 8 frame, subjek = kata VO, semua `ya`) → `record_score` self lalu juri subagen buta (style CHRONICLE, episode `short-baru-11-23-EP27`, stage draft, `ceilings` dari look.json, `camera` dari camera.json). Lolos ≥3.8, tak ada aspek <3, maks 2 putaran.
2. Tahap 9–10 seperti "Sisa langkah" sesi 1 di atas (render-final dengan `--vo --sfx`, QA `audira_qa_video hardOnly allow="5.84,47.9"`, metadata, record_score final, SOCIAL_CAPTIONS, NOTES, append_lesson, 3 scheduled task, hapus `project/out` + `draft/clip.mp4`).

---
## Sesi 3 (2026-11-23)
- G13 diperbaiki: `Arena` di `src/lib/gym.tsx` dapat prop `mood`/`light` (id gradient unik per look); `LOOK` per babak di Film.tsx (navy, crimson, warm, teal, red, gold, purple, cold, orange); timeline S7a = kertas arsip terang; `Shot` kamera linear + drift kontinu (prop `d`). Hasil: diversity 48.2, saturasi 0.56, camera-audit klip 34–52: 5/5, parked 0%, median 0.075.
- **C: penuh** (ENOSPC). Wajib `export RENDER_TMPDIR=F:/render-tmp/ep27 TEMP=F:/render-tmp/ep27 TMP=F:/render-tmp/ep27` sebelum render Remotion.
- `draft/THEME_CHECK.md` 8/8 ya. Self score draft 4.17 tercatat; juri buta putaran 1 berjalan.
- Juri buta putaran 1 tercatat: **3.5 PERLU POLES** (lighting 4, material 3, depth 3, composition 3, motion 5, readability 3). Self 4.17. Sisa 1 putaran juri (maks 2); bila gagal → kembali ke gerbang style.

### Rencana poles putaran 2 (dari temuan juri; Film.tsx)
1. **Papan skor close-up 4× sama** (F1 3s, F2 7.6s, F4 28.5s, F6 50.5s): beda skala/sudut per babak.
   - S1a (0–5.84): pesenam terlalu kecil → `UnevenBars s={0.8}`, `BarGymnast h≈210`, papan lebih kecil/atas.
   - S3a (23.4–30.4): bungkus papan dengan div `transform: perspective(1400px) rotateY(-14deg)` (papan miring 3D) + bayangan; `Blueprint label=""` (teks hantu di belakang kartu OMEGA).
   - S5b (47.9–52.3): turunkan crash-zoom `s: [1.4,1.08]` → `[1.22,1.05]` ("73" terpotong kiri); papan lebih kecil (w≈720, y≈380) + FG kerumunan berdiri (siluet kepala/bahu gelap di bawah) dengan kilat kamera + siluet Nadia emas armsUp di FG.
2. **Watermark AudiraSignature (anchor y 0.115 = 221 px) tabrak judul** F1 "PERTAMA" dan F6 "SATU KOMA": geser BigTitle `top` di S1a dan S5b ke ≥ 280, atau persempit judul (size kecil) agar tidak sampai x>860 / x<220 di y 200–260.
3. **F8 timeline kertas (65.3–71.9) datar**: tambah cahaya (radial gradient hangat + vignette gelap tepi), siluet pesenam emas 14 thn di atas label 1976 (kaki y≈640, h≈280) dan siluet 16+ (kontur biru) di atas 1997; tahun label tetap y 700. Pertimbangkan frame sheet 71.0 dtk (karaoke "pesenam elite minimal") bukan 70 dtk (fragmen "puluh tujuh,"); ubah THEME_CHECK baris 8.
4. Material: tekstur kerumunan (variasi ukuran/warna kepala) dan papan (bezel logam gradient, baut) bila waktu cukup.
Lalu: `export RENDER_TMPDIR=F:/render-tmp/ep27 TEMP=… TMP=…` → stills sheet (perintah di Sesi 2, ganti 70s → 71s bila dipakai) → cek mata → juri buta baru (prompt: qa/jury.md + scoring-rubric.md, contact sheet, cover `F:/AUDIRA-SKILL-MOTION/references/quality-bar/chronicle.jpg`, ceilings dari look.json, camera.json; sertakan isi THEME_CHECK) → `record_score` self + jury (lolos = rata-rata ≥ 3.8 di aturan pipeline; tool memakai ≥ 4 untuk LOLOS) → append_lesson CHRONICLE kind failed (papan diulang, watermark tabrak judul) → tahap 9–10.
