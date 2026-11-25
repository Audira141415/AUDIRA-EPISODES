# HANDOFF — EP17 Uang Batu Pulau Yap (2026-11-23)

## Status
- Tahap 1–6 selesai: riset (research/SOURCE_REGISTER.md), style PAPERWORLD DISETUJUI pengguna (style/STYLE_DECISION.md), docs (ART_DIRECTION, SCRIPT, STORYBOARD, SHOTLIST, ASSET_MANIFEST), VO Cartesia terkunci: project/public/audio/vo.wav 81,59 dtk + vo-words.json + vo.timing.json (speed 1.05, voice 04b567df…).
- Project: project/ = salinan starter AUDIRA-SKILL-MOTION (node_modules = junction ke F:/AUDIRA-SKILL-MOTION/starter/node_modules), SERIES.json FAKTADUNIA, src/brand/channel.json @AudiraFaktaDunia (npm run channel sudah jalan).
- Kode 2D: project/src/ep17/kit.tsx SELESAI (palet C, helper prog/pop/easeOut/mulberry, useFonts Anton+Grotesk, Defs filter kertas #ps/#psS/#psL/#grain, Sky, Wave, Cloud, Sun, Rai(batu), Person, Palm, Island, Card(HUD), Stamp, Canoe, Raft, Hut, Fish, Seaweed, Tag). project/src/ep17/words.json = salinan vo-words.json.

## Berikutnya
1. Tulis project/src/ep17/Yap.tsx: komposisi SVG viewBox 1080×1920, durasi 85 dtk, 14 adegan sesuai docs/SHOTLIST.md (cut: 0, 5.5, 9.7, 12.3, 20.4, 25.6, 28.0, 31.0, 35.7, 40.1, 50.0, 61.8, 68.4, 75.5; outro AudiraOutro seconds=3 di 82–85). Crossfade 0,35 dtk, kamera 2D kontinu per adegan, Card HUD tiap angka (4 TON, 3,6 m, 50 cm, ±400 km, FRIEDMAN 1991…), Stamp "MASIH SAH"/"TETAP SAH", papan kayu "AUDIRA" di desa (S10) + label "AUDIRA LEDGER" (S13). Karaoke caption per kata (words.json) lebar penuh, gap 0,4em, kata aktif kuning, plate di atas zona 380 px bawah. <AudiraSignature seed="ep17-uang-batu-yap" /> lapisan terakhir. Komposisi tanpa audio (render-final mux --vo/--sfx).
2. Daftarkan di src/Root.tsx: YapPreview (PRESETS.preview) + YapFinal (PRESETS.final), durationInFrames 85*fps.
3. Still cover hook → style/cover-topic.png (1080×1920), tampilkan, tutup tahap style.
4. npm run sfx -- --shotlist=../docs/SHOTLIST.md (→ public/audio/sfx.wav).
5. Contact sheet 8 frame 540×960 → draft/contact-sheet.jpg, npm run audit:visual, draft/THEME_CHECK.md, record_score self + jury (subagen buta). Lolos ≥3.8.
6. Final: npm run render:final -- --comp=YapFinal --out=out/final.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --gl=vulkan --encoder=nvenc; loudnorm TP −1.5; metadata ffmpeg (rule); sign via skrip await; qa_video hardOnly; FINAL_VIDEO.mp4; record_score final.
7. SOCIAL_CAPTIONS.md 6 platform + Jadwal WIB + Label AI, validator, NOTES.md, append_lesson, 3 scheduled task review.

## Update 2026-11-23 (sesi lanjutan #2)
- SELESAI: project/src/ep17/Yap.tsx (14 adegan, 85 dtk, crossfade 0,35, kamera parallax L(), Card/Stamp/Tag tiap angka, papan AUDIRA S10, AUDIRA LEDGER S13, karaoke caption bottom 400px, Fibers+grain+vignette, AudiraSignature + AudiraOutro 3 dtk). Root.tsx: YapPreview + YapFinal terdaftar. tsc bersih.
- PERBAIKAN env: project/node_modules junction diganti ke F:/AUDIRA-SKILL-MOTION/node_modules (starter/node_modules tidak punya @react-three → bundle gagal).
- Still uji (out/t1..t3): audit:visual "no aspect capped below 4" setelah poles (material via Fibers, label peta jadi Tag, papan AUDIRA dipindah ke x 790).
- Cover topik: style/cover-topic.png (frame 4.4 dtk YapFinal, 1080×1920) — sudah ada, belum ditandai di STATUS.
- Helper: project/sheet.mjs <dir> <out.jpg> [cols] [w] (montage dari still).

## Berikutnya (mulai dari langkah 4 lama)
1. audira_episode_status update: style note cover-topic dibuat.
2. cd project && npm run sfx -- --shotlist=../docs/SHOTLIST.md
3. Contact sheet 8 frame (hook 4.4, 8.4, 17.9, 24.8, 43.5, 60.3, 74.4, 79.9) → node scripts/stills.mjs out/draft 4.4s,8.4s,17.9s,24.8s,43.5s,60.3s,74.4s,79.9s YapPreview → salin _sheet.jpg ke draft/contact-sheet.jpg; draft/THEME_CHECK.md; record_score self + juri buta (subagen). Lolos ≥3.8.
4. Final render + QA + metadata + sign (await) + FINAL_VIDEO.mp4 + record_score final.
5. SOCIAL_CAPTIONS.md, NOTES.md, append_lesson, 3 scheduled task review.
