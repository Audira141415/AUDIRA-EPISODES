# NOTES — EP60 Kanal Panama: Dua Samudra

Style: PAPERWORLD · Remotion 2D SVG (`project/src/ep60/{pieces,scenes,Film}.tsx`, komposisi `Ep60Final`)

## Ringkasan
- VO Cartesia 85,4 dtk (223 kata, ±157 WPM), film 88,6 dtk, offset VO 0.
- Final: `FINAL_VIDEO.mp4` 1080×1920 @ 60, 5316 frame, 18 segmen (`--jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc`, `--vo` + `--sfx`).
- Audio: −13,6 LUFS, true peak −1,9 dBFS, LRA 2,8 LU. G18c: VO −16,0 LUFS vs SFX ter-duck −28,8 LUFS = 12,8 LU (min 12).
- Metadata ffprobe: title, artist "AUDIRA (Agus Dwi R.)", copyright "© 2026 AUDIRA - Agus Dwi R. All rights reserved.", comment `AUDIRA-panama-dua-samudra-EP60 | audira.my.id`.
- Tanda tangan Ed25519 VALID (key 498c3302271aadce), sidecar `FINAL_VIDEO.mp4.sig.json`. C2PA tidak dipasang.
- `<AudiraSignature seed="panama-ep60" />` tanpa prop handle → @AudiraFaktaDunia dari CHANNEL.json. Outro card AUDIRA + Created by Agus Dwi R. tampil (cek `draft/contact-sheet-final.jpg`).
- Pekerja (±22.000 meninggal) digambar sebagai figur kertas tanpa wajah; angka disebut tenang.

## Skor
- Draf juri buta r1 3,5 → r2 4,0 LOLOS (L4 M4 D4 C3 Mo5 R4), audit:camera 5/5.
- Final juri buta 4,17 LOLOS (L4 M4 D4 C4 Mo5 R4), ceilings audit visual final semua 5.

## Pelajaran
- Berhasil (r1 → r2): tepi kertas tebal + serat (`feTurbulence` pattern, multiply 0,55), pita haze antara BG/MG, dedaunan FG blur (`pdof` stdDeviation 9) di sudut bawah yang bergerak lebih cepat dari kamera.
- Lemah: composition 3 di draf karena template frame seragam (kartu label atas + subjek tengah di hampir semua adegan). Haze abu-abu terlalu rata meredam kontras dibanding cover. Adegan kolam pintu air (±55 dtk) padat dan terpotong. Perenang Halliburton terlalu kecil di ±76 dtk.
- Berikutnya: haze lokal (opacity ≤ 0,45), variasi framing per adegan, subjek payoff ≥ 30% tinggi frame.

## Masalah teknis s5
- Channel gate render:final menolak karena file sisa scaffold `project/src/scenes/news/PenggantiGibranWapres.tsx` (handle `@audira`, tidak dipakai film). Dilewati dengan `--skip-channel` beralasan; file tidak diubah.
- `fs.renameSync` tmp → final kena EPERM di Windows (metadata dan tanda tangan). Diselesaikan dengan `mv` dari shell.
- `npm run sign` / `npm run verify` rusak: `signFile`/`verifyFile` async tidak di-await (tag kosong `e30`, verify "undefined"). Ditandatangani ulang lewat skrip kecil yang await, verify VALID. Dicatat sebagai lesson GLOBAL untuk diperbaiki di kit.

## Delivery
- `SOCIAL_CAPTIONS.md` 6 platform + Jadwal Upload (WIB) + Label Konten AI, validator ok. `SUBTITLES.srt` 31 cue.
- Arsip master: `archive/2026-11-24/` (FINAL_VIDEO.mp4, sig.json, vo.wav, project-src.tgz).
- Dihapus: `project/out/{d,d_r1,s,s7,s10,seg,view}`, `draft/clip-47-65.mp4`.
- Jam upload (dikonfirmasi pengguna 2026-11-24): Rabu 6 Januari 2027, 19.00 WIB (TikTok) dst.
- Scheduled review: `review-panama-dua-samudra-24h` (7 Jan 2027 19.00), `review-panama-dua-samudra-72h` (9 Jan 2027 19.00), `review-panama-dua-samudra-7d` (13 Jan 2027 19.00). Berjalan hanya saat aplikasi Claude terbuka.
- Promosi kit: pengguna memilih promosikan `dofBlur` saja; `haze` ditahan (juri final: haze rata meredam kontras).
