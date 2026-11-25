# NOTES — EP12 Cara Kerja Sensor Sidik Jari di HP

Channel: AUDIRA Explained (@AudiraExplained) · Style: BONGKAR · Engine: Remotion 2D (SVG/DOM) · Memory episode: `short-baru-11-23-EP12`
Tanggal produksi: 2026-11-23 · Durasi film 88,6 dtk (VO 85,58 dtk + outro 2,9 dtk) · Final 1080×1920 @ 60

## Audio
- VO Cartesia (voice `04b567df-…`), take 1 99,38 dtk terlalu panjang → `scripts/tighten_vo.py` (jeda maks 0,40 dtk + atempo 1,03) → 85,58 dtk. Take 1 disimpan `project/public/audio/vo-take1.wav`.
- **Offset VO: 0** (VO mulai di frame 0).
- SFX prosedural `npm run sfx` dari `docs/SHOTLIST.md` (22 bunyi). Render final: VO −16,6 LUFS, SFX ter-duck −34,9 LUFS (gap 18,3 LU), master −14 LUFS.
- Musik: tidak ada.

## Skor
- Draf: self 4.17, juri buta 4.00 LOLOS (lighting 3, terendah).
- Final: lihat motion memory (`record_score` stage final).

## Yang berhasil
- Konsep "bongkar HP jadi lapisan isometrik berlabel" + penghitung 1/3, 2/3, 3/3 membuat tiga jenis sensor mudah dibedakan.
- Wrapper kamera per scene di `src/ep12/Film.tsx` (push-in + drift Y + roll + sway X sinus) menaikkan audit:camera 3→5 dan medianSpeed 0,015→0,055.

## Yang gagal / pelajaran
- Lighting datar: juri memberi 3. Untuk BONGKAR berikutnya tambah arah cahaya kunci dan highlight tepi lapisan.
- audit:camera skor 5 tetapi medianSpeed 0,015 → render:final diblok gate G13 (≥ 0,04). Cek `draft/camera.json` medianSpeed sebelum final.
- render:final diblok channel gate karena file starter tak terpakai (`src/scenes/news/PenggantiGibranWapres.tsx`) memakai `handle="@audira"`; prop dihapus.
- Bash tool sempat error fork → PowerShell.
- Windows EPERM saat `renameSync` menimpa MP4 yang baru ditulis (render-final metadata + sign) → signature tidak ikut tertulis. `scripts/sign-video.mjs` juga lupa `await signFile/verifyFile` (tag tertanam `e30` = `{}`, verify mencetak `undefined`). Diperbaiki di salinan proyek ini (await + fallback unlink→rename di `scripts/lib/sign.mjs`), lalu `node scripts/sign-video.mjs ..\FINAL_VIDEO.mp4 --c2pa` → VALID + C2PA. Perlu dipromosikan ke starter AUDIRA-SKILL-MOTION.

## Final
- `FINAL_VIDEO.mp4` 1080×1920 @ 60, 88,62 dtk, −13,7 LUFS, true peak −1,8 dBFS. Metadata title/artist/copyright/comment/date dicek ffprobe. Signature Ed25519 VALID + C2PA. `audira_qa_video` hardOnly PASS (0 glitch).
- Contact sheet final: `draft/final-contact-sheet.jpg`.
- File perantara (klip draf, stills, seg, duplikat out/FINAL.mp4) dihapus 2026-11-23.

## Review pasca-tayang (scheduled task)
Upload: Kamis 26 Nov 2026 19.00 WIB (TikTok → IG 19.20 → YT 19.40 → FB 20.00 → X 20.20 → Threads 20.40).
- `review-sensor-sidik-jari-hp-24h` — 27 Nov 2026 19.00 WIB
- `review-sensor-sidik-jari-hp-72h` — 29 Nov 2026 19.00 WIB
- `review-sensor-sidik-jari-hp-7d` — 3 Des 2026 19.00 WIB
Task hanya jalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).
