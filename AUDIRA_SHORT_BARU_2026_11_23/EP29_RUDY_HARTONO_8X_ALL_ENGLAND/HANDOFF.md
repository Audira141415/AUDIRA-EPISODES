# HANDOFF — EP29 Rudy Hartono 8x All England

## SESI 5 (2026-11-23): SELESAI sampai tahap 10
Juri putaran 2 LOLOS 4.0; `FINAL_VIDEO.mp4` (−14.2 LUFS, TP −1.4, Ed25519+C2PA VALID, qa_video PASS); SOCIAL_CAPTIONS.md lolos validator; NOTES.md; 3 scheduled task review (2/4/8 Des 2026). Sisa hanya tahap 11 (dipicu scheduled task). Catatan di bawah ini arsip sesi 4.

# (arsip) sesi 4

Sesi 4 berhenti karena context guard. Jangan ulang tahap selesai.

## PERINGATAN DISK
Drive C: penuh (0 MB). Sebelum render apa pun, set TEMP ke F: (PowerShell):
`$env:TEMP='F:\AUDIRA-EPISODES\AUDIRA_SHORT_BARU_2026_11_23\EP29_RUDY_HARTONO_8X_ALL_ENGLAND\draft\.tmp'; $env:TMP=$env:TEMP`
Bash heredoc gagal (temp di C:): tulis skrip pakai Write tool ke F: lalu jalankan. Jangan hapus file di C: tanpa izin pengguna (ada 3 folder remotion-webpack-bundle-* ~1 GB di %TEMP% milik sesi lain).

## Sudah selesai
- Tahap 0–6 (lihat sesi 3). STATUS: voice done, animation done, memoryEpisode `short-baru-11-23-EP29`.
- `docs/SHOTLIST.md` (13 baris, Offset 0.3) + `project/public/audio/sfx.wav` (−20 LUFS) via `node scripts/sfx.mjs --timing=public/audio/vo-words.json`.
- Poles Film.tsx: skyline Surabaya rendah, kamera kontinu (sway + ramp; audit:camera klip 43–62 dtk = 5/5, `draft/camera.json`), grain global, dust motes di god-rays, blur DOF tribun (Hall), S5 diganti lemari piala kayu+kaca, F8/F9/F12 dirapikan, label sekunder diperbesar (hud.tsx, Trophy label 54), BrandPlate x60 y860 nowrap.
- `draft/THEME_CHECK.md` (12 frame, semua ya). Detik sheet: `2.0s,6.5s,12.5s,18.5s,27.2s,32.4s,39.5s,48.8s,54.8s,59.0s,67.0s,77.5s`.
- Skor self draft 4.17; juri putaran 1 = 3.67 PERLU POLES (material 3, composition 3, readability 3; lighting 4, depth 4, motion 5).
- `draft/contact-sheet.jpg` + `draft/sheet-view.jpg` (900×1200) SUDAH dirender ulang setelah poles putaran 2 tapi BELUM dilihat.

## Sisa langkah
1. Lihat `draft/sheet-view.jpg` sekali; perbaiki tabrakan kecil bila ada (cek F2/F5 brand plate vs pemain, F8 DENMARK vs piala dicoret, F9 piala vs raket, F12 kartu 1 baris). Render ulang sheet bila diubah: `cd project; node scripts/stills.mjs ../draft <detik> Ep29Final 0.5` → rename `_sheet.jpg` → `contact-sheet.jpg`, buat sheet-view 900×1200 (PIL).
2. Juri buta putaran 2 (TERAKHIR) — subagen general-purpose, prompt: baca `F:/AUDIRA-SKILL-MOTION/qa/jury.md`, lihat sheet-view + cover `F:/AUDIRA-SKILL-MOTION/references/quality-bar/chronicle.jpg`, ceilings 5/5/5/5, motion 5 dari audit kamera; skor 6 aspek + bukti; jangan beri tahu skor sebelumnya. `record_score` judge jury (camera = isi `draft/camera.json`). LOLOS = rata ≥3.8 & tak ada <3. Bila gagal lagi: G16 → kembali ke gerbang style (tanya pengguna style baru).
3. Tahap 9 (background, TEMP di F:): `cd project; node scripts/render-final.mjs --comp=Ep29Final --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --offset=0.3 --sfx=public/audio/sfx.wav --jobs=3 --concurrency=2 --encoder=nvenc --title="Rudy Hartono: 8x Juara All England" --slug=rudy-hartono-8x-all-england --ep=EP29`. QA −14 LUFS TP<−1, metadata ffmpeg (artist "AUDIRA (Agus Dwi R.)", comment "AUDIRA-rudy-hartono-8x-all-england-EP29 | audira.my.id"), `audira_qa_video` hardOnly, `audira_verify_signature`, record_score final.
4. Tahap 10: SOCIAL_CAPTIONS.md 6 platform (contoh format: `../EP10_JESSE_OWENS_BERLIN_1936/SOCIAL_CAPTIONS.md`) → validator; NOTES.md; append_lesson CHRONICLE (failed: arena sama 10/12 frame + flat fill → juri 3; fix: grain, dust motes, DOF, lemari piala, kamera sway); 3 scheduled task review; hapus perantara (draft/f*.png, clip.mp4, .tmp, _polish*.py, _edit.log); tampilkan caption di chat.
