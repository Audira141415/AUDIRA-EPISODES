# QA Report — EP02_JARI_KERIPUT_DI_AIR

Final: `FINAL_EP02_JARI_KERIPUT.mp4` (2026-11-24, 76 MB, 88,02 dtk)

- [x] 1080×1920, 60 fps, yuv420p tv, 5280 frame, outro AUDIRA Sains di 85–88 dtk
- [x] VO jelas, −13,7 LUFS terintegrasi, true peak −1,8 dBFS (G18c: VO −16 LUFS, SFX ter-duck −29 LUFS, gap 13,0 LU)
- [x] Subtitle karaoke y=1300, di dalam safe zone
- [x] AudiraSignature aktif (`AUDIRA @AudiraSains`, kanan atas), hilang saat outro
- [x] Metadata ffprobe: title, artist "AUDIRA (Agus Dwi R.)", copyright © 2026, comment `AUDIRA-jari-keriput-di-air-EP02 | audira.my.id`, date 2026-11-24
- [x] Tanda tangan Ed25519 (key 498c3302271aadce) VALID + C2PA embedded
- [x] SOCIAL_CAPTIONS.md lolos `audira_validate_social_captions`
- [x] G19 qa-scene: scene PASS (13 cut terencana, 0 tembus). `FilmScene.tsx` kini memasang `<QaProbe />`.

## Catatan qa-video
- qa-clean.mp4 (render QA) menunjukkan putih 39,8–40,2 dtk dan hitam 54,9–66,6 dtk. Still 40 dtk dan 58 dtk serta MP4 final normal, jadi ini glitch WebGL render QA (GPU dipakai render lain).
- MP4 final (hardOnly): 4× BLACK 63,3–69,5 dtk, kekuatan 0,8–1,2. **False positive**: adegan uji kelereng 2013/2014 di latar `microscopyVoid` gelap. Mangkuk, kelereng, HUD, dan subtitle terlihat (cek frame 65,5 dtk). Tidak dirender ulang. Alasan tercatat di `draft/qa-final/qa-video.review.json`.

## Render
`npm run render:final -- --comp=JariFinal --out=../FINAL_EP02_JARI_KERIPUT.mp4 --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=2 --concurrency=2 --gl=vulkan --encoder=x264 ... --skip-channel=...` (358 dtk). `--jobs=6 --encoder=nvenc` gagal (`write EOF`) karena EP59 & EP060 render bersamaan di RTX 3060 (NVENC 7 sesi).
