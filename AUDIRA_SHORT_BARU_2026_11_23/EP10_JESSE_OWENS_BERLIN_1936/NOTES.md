# NOTES — EP10 Jesse Owens: 4 Emas Berlin 1936

Channel: AUDIRA Sport Facts (@AudiraSportFacts) · Style: CHRONICLE · Engine: Remotion 2D (SVG/DOM, skill audira-2d-motion) · Memory episode: `short-baru-11-23-EP10`
Tanggal produksi: 2026-11-23 · Durasi film 81,5 dtk (4890 frame) · Final 1080×1920 @ 60

## Audio
- VO Cartesia (voice `04b567df-…`), 202 kata, 77,83 dtk: `project/public/audio/vo.wav` + `vo-words.json` + `vo.timing.json`.
- **Offset VO: 0,3 dtk** (`--offset=0.3`).
- SFX prosedural `npm run sfx` dari `docs/SHOTLIST.md` (18 shot), stem −20 LUFS. Graph G18 (VO loudnorm −16, SFX −10 dB, duck ratio 8).
- Musik: tidak ada.

## Skor
- Draf: self 4.17. Juri buta putaran 1 = 3.50 (PERLU POLES); putaran 2 = 3.83 (lighting 4, material 3, depth 4, composition 3, motion 5, readability 4) → LOLOS menurut G16 (≥ 3.8, tidak ada aspek < 3).
- Tool `render-final.mjs` memakai ambang juri 4 → final dirender dengan `--skip-memory-gate` (alasan G16 tercatat bersama final). Keputusan "Ikuti G16, final" tercatat di HANDOFF.md.
- Final: self 3.83 (record_score stage final).

## Yang berhasil
- Siluet emas (Owens) vs siluet biru (Luz Long) dengan rim glow: dua tokoh langsung terbaca tanpa wajah.
- Callout angka besar (4 EMAS, 100.000, 8,06 M, 10,3 DTK) + karaoke per kata di band top 1400.
- Poles juri 1: LightRays + Haze band + occluder FG blur + vignette bawah menaikkan lighting dan depth 3 → 4.

## Yang gagal / pelajaran
- Kerumunan stadion dari titik kepala berulang terbaca noise di ukuran kecil (material 3). Lain kali mulai dari massa lembut + wash hangat.
- Komposisi beberapa shot simetris dan datar (composition 3); lintasan fill datar.
- Karaoke sempat menimpa pelompat (S4c 34,6 dtk) dan masuk band bawah (38,5 dtk) → top 1420 → 1400.
- `set.tsx`/`Film.tsx` diedit 07:28 setelah final 07:22 → final lama basi, dirender ulang 16:18 dari kode terakhir.
- `render-final.mjs` versi baru punya channel gate; folder batch tidak punya SERIES.json/CHANNEL.json → `--skip-channel` (handle `@AudiraSportFacts` + outro SPORTFACTS ditulis langsung di Film.tsx).
- Sesi sebelumnya mati (drive C: penuh) saat membuat scheduled task 72h → folder task kosong memblok ID; dihapus lalu dibuat ulang.
- Kandidat promosi motion memory (GLOBAL): jobs, concurrency, camera, duckRatio, duckThreshold, voLoudnorm. Belum dipromosikan ke kit (batch tanpa tanya pengguna); tawarkan di sesi berikutnya.

## Final
- `FINAL_VIDEO.mp4` 1080×1920 @ 60, 81,52 dtk, **−13,7 LUFS, true peak −2,6 dBFS**. Metadata title/artist/copyright/comment/date dicek ffprobe. Signature Ed25519 VALID + C2PA. `audira_qa_video` hardOnly PASS (0 glitch, 17 cut terencana). AudiraSignature + outro AUDIRA Sport Facts terlihat di frame.
- Contact sheet final: `draft/final-contact-sheet.jpg`.
- File perantara dihapus 2026-11-23: `draft/clip-30-48.mp4`, `draft/isotest`, `project/out/seg`, `project/out/test1`.

## Review pasca-tayang (scheduled task)
Upload: Rabu 25 Nov 2026 19.00 WIB (TikTok → IG 19.20 → YT 19.40 → FB 20.00 → X 20.20 → Threads 20.40).
- `review-jesse-owens-berlin-1936-24h` — 26 Nov 2026 19.00 WIB
- `review-jesse-owens-berlin-1936-72h` — 28 Nov 2026 19.00 WIB
- `review-jesse-owens-berlin-1936-7d` — 2 Des 2026 19.00 WIB
Task hanya jalan saat aplikasi Claude terbuka (bila tertutup, jalan saat dibuka lagi).
