# EP09 handover sesi 3 → sesi 4 (2026-11-24)

## Selesai di sesi 3
- Framing kamera diperbaiki (`studio/src/scenes/ep09/Film.tsx`: `trackCam`, `camFor`; FOV default 38, papan skor S6 FOV 44 utuh). Bank + papan KREISEL masuk frame saat crash S1/S4. S2 kamera follow gerobak (gerobak `height 0.62` di `Set.tsx`). S5 orbit ke depan gapura: FINISH + AUDIRA terbaca. Helm radius 0.09, y 0.62. Typecheck ep09 bersih.
- Still terverifikasi: `draft/stills2/_sheet_small.jpg` (19 frame), `draft/stills3`, `stills4`, `stills5` (S2/S5 cek).
- Cover topik: `style/cover-topic.png` (COVER_CAM di `Cover.tsx` diubah: pos [7.2,1.9,4.6], target [2.5,1.0,-0.45], fov 36).
- Docs rule 12 ditulis penuh: docs/SCRIPT.md, STORYBOARD.md (7 baris, kolom Audio, `Style: TOYDIORAMA`), ART_DIRECTION.md, ASSET_MANIFEST.md, SHOTLIST.md (lint 0 red, 6 yellow).
- SFX: `studio/public/audio/ep09/sfx.wav` (90,741 dtk, stem −20 LUFS → saat final pakai `volume=-10dB` sesuai G18).

## Sisa (sesi 4)
1. Contact sheet 8 frame 540×960 → `draft/contact-sheet.jpg`. Frame (30 fps preview): 156 (crash S1), 600 (gerobak S2), 1065 (KE-30 S3), 1698 (crash KREISEL S4), 1995 (FINISH S5), 2250 (papan skor 0,01 S6), 2490 (outro S7), + 360 (Kingston) — `node scripts/stills.mjs <out> 156,360,600,1065,1698,1995,2250,2490 Ep09Preview 0.5` lalu sheet 4×2.
2. `npm run audit:visual` (look.json ceilings), `npm run audit:camera` bila perlu klip ≤20 dtk 540×960.
3. `draft/THEME_CHECK.md` (G22: tiap frame subjek = kata VO, semua `ya`).
4. Juri self + juri buta subagent (qa/jury.md) → `audira_style_memory record_score` (style TOYDIORAMA, episode `fakta-olahraga-EP09`, stage draft). Maks 2 putaran; terbaik ≥ 3.5 → lanjut.
5. Gerbang tahap 9: tampilkan contact sheet, skor juri, durasi 90,741 dtk, cek audio G18c; minta acc pengguna sebelum render final 1080×1920 (`npm run render:final -- ... --sfx=public/audio/ep09/sfx.wav --vo=public/audio/ep09/vo.wav`, `--concurrency=2`, background, GPU_LOCK.md).
6. Setelah acc: final, QA, tahap 10 (caption 6 platform, NOTES.md, motion memory, 3 scheduled review).

## Catatan kecil yang belum diperbaiki (opsional)
- S1 detik ~5: timer ±130 menimpa papan KREISEL sedikit.
- S2 detik ~20: dua penonton Amerika di depan gerobak (gerobak tetap terlihat).
