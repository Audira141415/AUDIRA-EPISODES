# EP09 handover sesi 2 → sesi 3 (2026-11-24)

## Selesai di sesi 2
- `studio/src/scenes/ep09/Film.tsx` (7 scene, CUT/BEAT dari timeline, HUD chip/timer, captions karaoke y=1260, kamera per scene `camFor`), `Cover.tsx` (export `Cover`, `CoverText`, `COVER_CAM`, `NIGHT`), `index.ts` (Cover, Film, TOTAL_SECONDS).
- `Set.tsx`: bank quarter-pipe diperbaiki (thetaStart π, dinding −z dipotong di sekitar bank), sign dinaikkan; tambahan `sledRun`, `Spray`, `CrashTrack`, `SLED_V`, `BANK`.
- `studio/src/Root.tsx`: import EP09, SLUG Ep09 "olahraga-EP09", komposisi Ep09Cover / Ep09Preview / Ep09Final.

## Belum diverifikasi
- `npm run typecheck` belum dijalankan untuk ep09. Belum ada still yang dilihat: arah truk GLB, skala figur vs kereta, tanda roll kereta saat naik bank (roll positif = atas menghadap +z) perlu dicek di still.

## Sisa langkah
1. `cd studio && npm run typecheck` → perbaiki error ep09.
2. Cover: `npm run cover` (lihat scripts/cover-still.mjs untuk argumen; komposisi `Ep09Cover`) → `EP09_BOBSLED_JAMAIKA_1988/style/cover-topic.png`.
3. Still per scene: `npm run stills -- <outdir> 3s,12s,20s,26s,36s,41s,53s,57.5s,64s,75s,79s,84s Ep09Preview` → periksa satu contact sheet kecil, perbaiki.
4. Docs rule 12 (template masih placeholder): docs/SCRIPT.md, STORYBOARD.md (≥6 baris + kolom Audio, baris `Style: TOYDIORAMA`), ART_DIRECTION.md, ASSET_MANIFEST.md, SHOTLIST.md. `npm run sfx` (public/audio/ep09/sfx.wav).
5. Contact sheet 8 frame 540×960 → draft/contact-sheet.jpg, `npm run audit:visual`, draft/THEME_CHECK.md, juri self + juri buta → record_score. Lalu gerbang tahap 9 (acc pengguna).

## Update akhir sesi 2
- Typecheck ep09: BERSIH. Root.tsx: Ep09Cover/Ep09Preview/Ep09Final terdaftar.
- Still pertama: `draft/stills1/_sheet_small.jpg` (19 frame, 0.5x). Semua 7 scene ter-render, GLB termuat, HUD/caption OK.
- Perbaikan yang perlu (dari sheet):
  1. Kamera terlalu dekat hampir di semua scene: kereta memenuhi lebar 9:16 dan figur terpotong. Mundurkan `trackCam` (behind/front ±1.6× jarak, mis. pos x−5.5/z 5.8) dan keyframe S3/S5/S7; S6 akhir (0,01) terlalu dekat ke papan skor — target papan harus utuh (pos z ≥ 4.5).
  2. Helm di `Bobsled` kebesaran (radius 0.13 → ±0.09, y 0.62).
  3. S2: gerobak derby hampir tak terlihat di frame 20 dtk — kamera harus framing jalan miring + gerobak; truk GLB arah OK.
  4. S1 crash (6,6 dtk) dan S4 (57,6 dtk): kereta rebah terbaca tapi bank/tanda KREISEL tak masuk frame; tarik kamera untuk memperlihatkan dinding bank.
  5. S5: figur jalan terpotong; framing lebih lebar agar 4 atlet + kereta + gapura FINISH + papan AUDIRA terlihat.
- Belum: cover-topic.png, docs rule 12, sfx, contact sheet draf + juri.
