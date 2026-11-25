# NOTES — EP06 Easter Egg Pertama yang Terkenal di Game (AUDIRA TECH, @AudiraTECH)

Style: ARCADECRT (restyle; PIXELSTORY gagal juri 3 putaran: 3.33 / 3.00 / 3.33, arsip di `style/_pixelstory/`, `draft/_pixelstory/`)
Engine: Remotion + R3F · Kode: `project/src/scenes/ep06/FilmCrt.tsx` + `crt/`

## Hasil
- Final: `FINAL_VIDEO.mp4` (1080×1920 @ 60, 4877 frame, 81,3 dtk), salinan render `project/out/ep06/FINAL_EP06.mp4`.
- Audio: −13,6 LUFS integrated, true peak −2,0 dBFS (ffmpeg ebur128). G18: VO loudnorm −16, SFX stem −20 LUFS + trim −10 dB, duck ratio 8 / attack 5 / release 350 / threshold 0,015. `--vo` dan `--sfx` dipass.
- Metadata ffprobe: title, artist "AUDIRA (Agus Dwi R.)", copyright, comment "AUDIRA-easter-egg-pertama-game-EP06 | audira.my.id", date 2026-11-23. Tanda tangan Ed25519 VALID + C2PA.
- qa_video (hardOnly): PASS. Allow disengaja: 45,48 dtk (flash dinding pecah, BREAK = T.ditembus − 0,15) dan 62,18 dtk (flash stamp EASTER EGG). Potongan sub-shot 12,62 dtk (T.alasannya) masuk `--cuts`.
- Juri buta draf putaran 1: lighting 4, material 4, depth 4, composition 3, motion 5, readability 3 = 3,83 LOLOS. Kamera (klip 36–52 dtk): 5/5.
- Cover topik: `style/cover-topic.png`. Contact sheet: `draft/contact-sheet.jpg`. THEME_CHECK semua `ya`.

## Offset VO
VO `project/public/audio/ep06/vo.wav` mulai di 0 (offset 0). Bicara 77,28 dtk, 190 kata, 148 WPM; AudiraOutro 77,48–81,28.

## Yang gagal / pelajaran
- PIXELSTORY: bawah frame gelap kosong, interior datar tanpa FG, font piksel menukar huruf nama (B/D), hook dan outro framing sama. Ganti ke ARCADECRT langsung lolos putaran 1.
- Final pertama gagal qa_video: dinding pelangi D2 berganti warna dengan langkah keras 6×/dtk (LONCAT tiap 0,17 dtk, risiko fotosensitif). Fix: `rainbow()` di `crt/rasters.ts` jadi blend halus 1,2 langkah/dtk, render ulang.
- Kelemahan juri yang belum dipoles (lolos tanpa poles): f3 teks hantu "RAHASIA" ganda di raster, chip atas menabrak neon marquee (f5, f7), makro titik = kubus putih polos.

## Upload & review
- Jadwal: Senin 30 Nov 2026, TikTok 19.00 WIB → Threads 20.40 (lihat `SOCIAL_CAPTIONS.md`).
- Scheduled task review: `review-easter-egg-pertama-game-24h`, `review-easter-egg-pertama-game-72h`, `review-easter-egg-pertama-game-7d`.
