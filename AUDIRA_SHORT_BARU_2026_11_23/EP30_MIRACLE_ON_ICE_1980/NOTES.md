# NOTES — EP30 Miracle on Ice 1980 (AUDIRA Sport Facts)

Style: CHRONICLE · engine remotion (2D) · memory episode `short-baru-11-23-EP30`

## Hasil
- Final: `FINAL_VIDEO.mp4` 1080×1920 @ 60, 82.0 dtk, h264 nvenc + AAC (2026-11-23).
- Audio (G18): VO −16.6 LUFS, SFX ter-duck −35.1 LUFS (gap 18.5 LU). Master −13.6 LUFS, true peak −1.9 dBFS (ffmpeg ebur128, diukur ulang).
- Metadata ffprobe: title, artist "AUDIRA (Agus Dwi R.)", copyright, comment `AUDIRA-miracle-on-ice-1980-EP30 | audira.my.id`, date 2026-11-23.
- Tanda tangan: Ed25519 VALID (key 498c3302271aadce) + C2PA tertanam. AudiraSignature `@AudiraSportFacts` + AudiraOutro SPORTFACTS + boards "AUDIRA · SPORT FACTS" di adegan + VO menyebut "Audira Sport Facts".
- qa_video hardOnly: PASS. 3 LONCAT di-allow, semuanya disengaja: 31.52 (kilat papan skor 10 menyala), 61.42 (potong ke pose selebrasi di kata "arena meledak"), 77.85 (fade outro card selesai).

## Juri
- Draf r1: self 4.17, juri 3.67 (material 3, composition 3, readability 3).
- Draf r2: self 4.17, juri 3.67 (lighting 4, material 4, depth 3, composition 3, motion 5, readability 3). Kelemahan: hampir tiap frame terbelah panel grafik atas + rink es bawah; label MARK JOHNSON pudar di sheet.
- Keputusan pengguna 2026-11-23: "jgn ganti style langsung render" → final CHRONICLE dirender dengan `--skip-memory-gate` walau di bawah 3.8 (G16 di-override pengguna). Skor final dicatat 3.67 (disamakan dengan juri).

## Pelajaran
- Gagal: layout dua panel bertumpuk (HUD atas / es putih bawah) membuat depth & composition mentok 3. Untuk olahraga arena, satukan HUD ke dalam adegan, gelapkan es, kabut/lampu di antara lapisan.
- Fix: detik contact sheet harus setelah counter/label final terkunci (31.7→32.1 agar skor 10–3 tidak terbaca 10–2).
- Fix: batch tanpa SERIES.json → `--skip-channel="<alasan>"` setelah cek handle/outro di kode.
- Offset VO: 0 (vo.wav sudah sejajar film, +3 dtk pad di akhir).
- Payoff SFX impact digeser ke 53.3 (gol 4–3) lewat edit `out/sfx-timeline.json`; jangan jalankan `npm run sfx` ulang tanpa edit itu.

## Upload & review
- Jadwal: Rabu 2 Des 2026, TikTok 19.00 → IG 19.20 → YT 19.40 → FB 20.00 → X 20.20 → Threads 20.40 WIB.
- Scheduled task tahap 11: `review-miracle-on-ice-24h` (3 Des 19.00), `review-miracle-on-ice-72h` (5 Des 19.00), `review-miracle-on-ice-7d` (9 Des 19.00). Hanya jalan saat aplikasi Claude terbuka.
- Upload `SUBTITLES.srt` bila dibuat; label AI di semua platform (lihat SOCIAL_CAPTIONS.md).
