# HANDOFF — EP13 Cara Kerja PLTA (AUDIRA Explained, @AudiraExplained)

Diperbarui 2026-11-23 sesi 2 (context guard). Style **BLUEPRINT** (acc pengguna, satu-satunya gerbang — sisanya otomatis sampai final tanpa tanya).

## Selesai
- Riset, style, docs rule 12: docs/ART_DIRECTION.md, SCRIPT.md, STORYBOARD.md (10 adegan), ASSET_MANIFEST.md.
- VO Cartesia: audio/vo.wav (85,59 dtk) + audio/vo-words.json; salinan project/public/audio/vo.wav; words → project/src/episodes/plta/words.json. Offset 0. Film END 85,9 + outro 3 = 88,9 dtk.
- Kode episode (BELUM dikompilasi/dicek): project/src/episodes/plta/ — Plta.tsx (10 sheet S1–S10, CUTS 7.1/14.2/26.0/36.9/46.1/56.8/66.1/75.1/80.7, payoff 69.95, caption top 1340, AudiraOutro + AudiraSignature seed cara-kerja-plta-ep13), parts.tsx (Bulb, Runner, Tower, Monas, Card, Tag, Stamp, Flow, SheetWipe, TitleBlock "AUDIRA ENGINEERING · DWG EP13-NN"), index.tsx (komposisi PltaEP13 60fps, PltaEP13-Draft 30fps, PltaEP13-Cover prop cover=6.4 tanpa caption).
- project/src/project.json disalin dari starter (dibutuhkan format.ts/halus). tsconfig include ditambah src/brand + src/episodes.

## Langkah berikut
1. `cd project && npx tsc --noEmit -p .` → perbaiki error.
2. Stills: pola EP07 `F:/AUDIRA-EPISODES/AUDIRA_SHORT_BARU_2026_11_23/EP07_HIDANGAN_DARI_LANGIT/project/stills.mjs` (bundle entry project/src/episodes/plta/index.tsx, publicDir project/public, comp PltaEP13-Draft) → frame 2.5, 6.4, 12.5, 19, 24.5, 34.5, 45, 55.2, 61.5, 70.2, 73.8, 79.8, 84.8, 87.5 → contact sheet 540×960 tiles → draft/contact-sheet.jpg. Periksa overlap/teks terpotong.
3. Cover: renderStill PltaEP13-Cover → style/cover-topic.png.
4. SFX: salin pola EP07 project/sfx/make_sfx.py (perlu numpy) dengan cue dari docs/STORYBOARD.md kolom Audio → audio/sfx_raw.wav → loudnorm I=-20 → audio/sfx.wav (88,9 dtk).
5. draft/THEME_CHECK.md + juri: self lalu subagen general-purpose buta (tanpa override model), record_score style BLUEPRINT episode short-baru-11-23-EP13 stage draft. Lolos ≥3.8 tanpa aspek <3, maks 2 putaran.
6. Final: `npx remotion render src/episodes/plta/index.tsx PltaEP13 ../draft/video_noaudio.mp4 --public-dir=public --concurrency=4 --log=error` (dari project/; bila CLI gagal pakai renderMedia API). Mix: VO loudnorm I=-16, SFX volume=-10dB + sidechaincompress threshold=0.015:ratio=8:attack=5:release=350 (sidechain VO), amix, master loudnorm I=-14:TP=-1.5 + alimiter; pad 88,9 dtk. Metadata ffmpeg (title "Cara Kerja PLTA — Air Jatuh Jadi Listrik", artist "AUDIRA (Agus Dwi R.)", copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved.", comment "AUDIRA-cara-kerja-plta-EP13 | audira.my.id", date 2026-11-23) → FINAL_VIDEO.mp4. QA audira_qa_video hardOnly (cuts = CUTS, allow 69.95 flash), ebur128, record_score final.
7. Delivery: audira_generate_srt, SOCIAL_CAPTIONS.md 6 platform + Jadwal Upload (WIB) + Label Konten AI, validate (keywords PLTA, Citarum, Cirata), NOTES.md, append_lesson, 3 scheduled task review-ep13-cara-kerja-plta-24h/-72h/-7d, tampilkan caption di chat.
