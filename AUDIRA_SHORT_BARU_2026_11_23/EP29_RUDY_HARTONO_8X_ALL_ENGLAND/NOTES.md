# NOTES — EP29 Rudy Hartono, 8x Juara All England

Channel: AUDIRA Sport Facts (@AudiraSportFacts) · Style: CHRONICLE · Engine: Remotion 2D · memoryEpisode `short-baru-11-23-EP29`

## Produksi
- VO Cartesia `04b567df-…`, 177 kata, offset VO 0.3 dtk (`--offset=0.3`).
- SFX prosedural `project/public/audio/sfx.wav` (−20 LUFS) dari `docs/SHOTLIST.md` (13 baris) + `vo-words.json`.
- Kamera: `audit:camera` klip 43–62 dtk = 5/5 (deadPct 0, medianSpeed 0.047).
- Juri buta: putaran 1 = 3.67 PERLU POLES (material/komposisi/keterbacaan 3). Putaran 2 = 4.0 LOLOS (lighting 4, material 3, depth 4, composition 4, motion 5, readability 4).
- Render final: `scripts/render-final.mjs --jobs=3 --concurrency=2 --encoder=nvenc --vo --sfx --offset=0.3`. Drive C: penuh: TEMP/TMP diarahkan ke `draft\.tmp` di F:.
- `SERIES.json` per episode wajib (gerbang channel render-final); tanpa itu render berhenti "no SERIES.json or channel folder".

## Pelajaran
- Gagal: arena stadion yang sama di 10/12 frame + isi warna datar → juri memberi material/komposisi 3.
- Perbaikan yang menaikkan skor: grain global, dust motes di god-rays, blur DOF tribun, lemari piala kayu+kaca untuk beat 1968–1974, kamera sway kontinu, label sekunder diperbesar.
- Sisa kelemahan menurut juri: siluet Rudy pose Y kaku dipakai ulang di 4 frame; teks sekunder kecil (sub-judul, tahun piala); material masih 3.
- Untuk CHRONICLE olahraga berikutnya: variasikan lokasi tiap beat (kota, ruang ganti, podium, arsip koran), bukan stadion terus; siapkan 3–4 pose siluet berbeda.

## Jadwal & review
- Upload: Selasa, 1 Des 2026, 19.00 WIB (TikTok) lalu tiap 20 menit (lihat `SOCIAL_CAPTIONS.md`).
- Scheduled task review (sekali jalan, hanya saat aplikasi Claude terbuka): `review-rudy-hartono-8x-all-england-24h` (2 Des 2026 19.00 WIB), `review-rudy-hartono-8x-all-england-72h` (4 Des 2026 19.00 WIB), `review-rudy-hartono-8x-all-england-7d` (8 Des 2026 19.00 WIB).

## Final
- `FINAL_VIDEO.mp4` 1080×1920 @ 60, 83,3 dtk, 4998 frame. Audio −14.2 LUFS, true peak −1.4 dBFS.
- render-final awalnya memberi TP −0.9 dBFS; diperbaiki dengan `volume=-0.4dB` (video stream copy), metadata ditulis ulang, lalu `sign-video.mjs --c2pa` (Ed25519 VALID + C2PA).
- Revisi audio (keluhan pengguna: VO terlalu kecil, noise/SFX terlalu keras): `render-final.mjs` episode ini memakai mix lama (VO tanpa loudnorm, SFX tanpa −10 dB, duck ratio 2.5 thr 0.1), sehingga SFX RMS −22 dB lebih keras 6 dB dari VO RMS −28 dB. Di-remix dengan `draft/remix.ps1` sesuai G18 (VO loudnorm I=−16, SFX volume −10 dB, sidechain ratio 8 thr 0.015 atk 5 rel 350, master loudnorm I=−14 TP=−1.5), video stream copy. Hasil: −14.0 LUFS, TP −1.8, ditandatangani ulang.
- `audira_qa_video` hardOnly PASS (0 glitch). Skor final 4.0 LOLOS, diarsipkan gold di `kits/chronicle/gold/short-baru-11-23-EP29`.
