# NOTES — EP21 Bug Y2K: Tahun 2000 Dibaca 1900

Channel: AUDIRA TECH (@AudiraTECH) · Style: TERMINAL (Remotion 2D mograph) · memoryEpisode: short-baru-11-23-EP21

## Final
- `FINAL_VIDEO.mp4`: 1080×1920 @ 60, 87,6 dtk, 5256 frame. Render v2 2026-11-23, judul S4 dikecilkan ke 36 px karena terpotong sway kamera.
- Audio (G18): `--vo` + `--sfx`, VO loudnorm −16, SFX stem −26 LUFS. Hasil −13,7 LUFS integrated, true peak −1,8 dBFS, LRA 2,3 LU.
- Metadata ffprobe: title, artist `AUDIRA (Agus Dwi R.)`, copyright, comment `AUDIRA-bug-y2k-EP21 | audira.my.id`, date 2026-11-23.
- Tanda tangan Ed25519 VALID + C2PA tertanam (lewat `project/scripts/_finish-ep21.mjs`). `npm run verify` (sign-video.mjs) mencetak `undefined` karena tidak await. Hasil verifyFile yang di-await = VALID.
- AudiraSignature seed `y2k-ep21` aktif. Outro card AUDIRA TECH 3 dtk terakhir. Brand di adegan: rail `audira@tech:~$ ./y2k.sh`, VO "ikuti AUDIRA TECH".
- Contact sheet final: `draft/FINAL_SHEET.jpg` (10 frame).

## Skor
- Draf: self 3,83 → juri putaran 1 3,50 → poles → juri putaran 2 3,83 LOLOS.
- Final: self 3,83, juri buta 3,50 (lighting 3, material 4, depth 3, composition 3, motion 4, readability 4). Ceilings look.json: lighting 3 dan composition 3.
- Kritik juri final: pita bawah kosong (sebagian besar zona aman UI 380 px), frame transisi 24,2 dtk tipis, depth datar, teks sekunder kecil, header S6 menempel rail.

## VO
- Cartesia 90,65 dtk → `audio/tighten.py` (jeda maks 0,42) → 84,44 dtk. Offset shotlist 0. Outro 3 dtk → total 87,6 dtk.

## Pelajaran
- Berhasil: hex rain 2 lapis (`data-layout-ignore`) + glow fosfor + bezel CRT menaikkan juri draf 3,50 → 3,83.
- Gagal: latar hitam datar + hex opacity .16 tidak terlihat di sheet 540 px.
- Gagal: chrome Win 22 px gagal audit layout. Diganti 36 px.
- Fix: rail atas harus ≥ y180.
- Fix: G13 dicek render:final dari `draft/camera.json`. Setelah rig kamera dipoles, ukur ulang klip draf.
- Fix: sway ±40 px memotong judul lebar penuh. Judul harus ≤ ~900 px.
- Catatan: qa-video "BLACK" = false positive di gaya gelap (lumMean ~18).
- Catatan: rename tagged EPERM. Solusinya `Move-Item -Force` lalu finisher yang await signFile.
- Fix: `project/node_modules` harus junction ke `F:\AUDIRA-SKILL-MOTION\node_modules`.
- Berikutnya: isi pita bawah / turunkan blok konten. Teks sekunder ≥ 40 px.

## Jadwal & review
- Upload: Jumat 27 Nov 2026, TikTok 19.00 → Threads 20.40 WIB (lihat SOCIAL_CAPTIONS.md).
- Scheduled task: `review-ep21-bug-y2k-24h` (2026-11-28 19.00), `review-ep21-bug-y2k-72h` (2026-11-30 19.00), `review-ep21-bug-y2k-7d` (2026-12-04 19.00). Task hanya berjalan saat aplikasi Claude terbuka.
