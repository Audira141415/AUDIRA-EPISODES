
## s4 (2026-11-23) — draf Remotion VINTAGEFORGE
- Draf: `draft/DRAFT_SHEET.jpg` (12 frame). Audit: depth ≤3, lainnya 4–5. Kamera 4/5.
- Self 3.83, juri buta 3.50 (L4 M4 D3 C3 Mo4 R3). Diterima 3.50 setelah 2 putaran (label memori `sejarah-negara-EP56` ikut menghitung versi world3d lama). Lesson failed: label 3D terpotong/tertutup kartu & subtitle; depth dinding datar.
- Perbaikan s4: subtitle ter-skala ganda (wrapper scale(1/scale) di Overlay), gap kata 0.4em, rim 2.4 + backlight, dinding #b8956a, poster/kabel DC digeser, tembok Auburn `climbable-stone-wall-0052e0`.
- G18c: VO −16.5 LUFS, SFX ter-duck −29.3 LUFS, gap 12.8 LU (min 12) — lolos.
- `project/scripts/draft.mjs`: path remotion-cli fallback ke `../node_modules` (junction project/node_modules tidak punya @remotion/cli).

## s5 (2026-11-24) — final, QA, delivery
- Final: `FINAL_EP56_KURSI_LISTRIK_1890.mp4` 1080×1920 @ 60, 5640 frame, 94.01 dtk. Render 182 dtk (`--jobs=4 --gl=vulkan --encoder=nvenc`, `--vo` + `--sfx`).
- Audio: −13.7 LUFS, TP −1.8 dBFS, LRA 2.7 LU (G18 lolos).
- Metadata kepemilikan ffmpeg + tanda tangan Ed25519 (`npm run sign`, VALID). `npm run deliver`: GREEN dengan 2 YELLOW beralasan — tanpa C2PA (opsional) dan `src/templates/MultiSceneDirector.tsx` (template tak dipakai film EP56; film memakai `<AudiraSignature>` tanpa handle → @AudiraFaktaDunia dari CHANNEL.json).
- Perbaikan: RED handle `@audira` di file sisa scaffold `project/src/scenes/news/PenggantiGibranWapres.tsx` — prop `handle` dihapus (file tidak dipakai film).
- `qa:video --hard-only`: PASS (12 cut, 65 perubahan partikel/percikan dibiarkan).
- Cek frame `FINAL_CHECK.jpg`: kursi selalu kosong, tanpa tubuh; outro AUDIRA + Created by Agus Dwi R. tampil.
- Juri buta final 3.50 (L4 M4 D3 C3 Mo4 R3), self 3.83. Diterima 3.50 setelah 2 putaran (aturan 2026-11-23), final tidak dirender ulang. Kelemahan: teks prop terpotong/tertutup (poster AC, nama Brown, judul UU), kotak subtitle menutupi subjek, props seperti mainan. Lesson failed + fix dicatat di motion memory VINTAGEFORGE.
- Delivery: `SOCIAL_CAPTIONS.md` (validator ok), `SUBTITLES.srt` (26 cue), master diarsipkan di `archive/2026-11-24/` (final, sig.json, vo.wav).
- Dihapus: `out/`, `draft/_stills`, `draft/CHECK_50-68s.mp4`.
- Jadwal upload: Sabtu 2 Januari 2027, 19.00 WIB (TikTok) dst. Scheduled review: `review-ep56-kursi-listrik-24h`, `-72h`, `-7d`.
