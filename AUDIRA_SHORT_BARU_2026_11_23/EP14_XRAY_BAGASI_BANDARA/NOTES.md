# NOTES — EP14 Cara Kerja Mesin X-ray Bagasi Bandara (AUDIRA Explained)

Style: INNERWORKS · Engine: Remotion 2D (`F:/AUDIRA-2D-SKILL-MOTION/engines/remotion-starter/src/episodes/xray14/`, comp `XrayEP14` 60 fps / `XrayEP14-Draft` 30 fps) · Tanggal: 2026-11-23 · Sesi: 4

## Hasil
- `FINAL_VIDEO.mp4`: 1080×1920 @ 60, 93,3 dtk (5598 frame), AAC stereo 256k. Loudness −14,0 LUFS, true peak −1,4 dBFS (diukur `-vn`). Metadata kepemilikan OK (ffprobe: title, artist, copyright, comment `AUDIRA-xray-bagasi-bandara-EP14`, date).
- `audira_qa_video` hardOnly: PASS. Satu LONCAT di 71,82 dtk = flash putih impact CT yang disengaja (`Xray.tsx:426`), di-allow.
- `AudiraSignature` seed `xray-bagasi-ep14` aktif, outro AUDIRA EXPLAINED 90,35–93,35 dtk. Brand dalam adegan: "AUDIRA X-RAY · LANE 3", "AUDIRA SCAN-160", "AUDIRA CT-360". VO menyebut "Audira Explained" di outro.
- `audira_verify_signature`: tidak bisa dijalankan, repo 2D tidak punya script `verify` (bukan starter R3F).
- Mix: `project/mix.sh` (G18: VO loudnorm −16, SFX stem −20 LUFS `volume=-10dB`, duck ratio 8 / attack 5 / release 350 / threshold 0.015, master −14 dua pass, stereo). SFX: `audio/sfx_ep14.py` (49 pop, whoosh tiap potongan, riser + impact CT 71,8) → `audio/sfx.wav` −20,0 LUFS.
- `SUBTITLES.srt` 31 cue dari `audio/vo-words.json`.

## Skor
- Draf putaran 1: self 4,17, juri 3,5 (PERLU POLES: lantai kosong, vektor datar, tanpa haze/DoF, cahaya tanpa arah).
- Poles 1: lantai perspektif bertegel + pantulan + haze, pilar/jendela terminal blur, FG nampan + tali antre DoF parallax, key light, bezel monitor + sheen.
- Draf putaran 2: self 4,17, **juri 4,0 LOLOS** (lighting 3, material 4, depth 4, composition 4, motion 5, readability 4). Terlemah menurut juri: frame dual-energy (27 dtk) berupa medan titik/panah abstrak dengan tas kecil di tepi kiri; latar terang rata tanpa arah cahaya kunci.
- Kamera (`draft/camera.json`, klip 19–37 dtk): motion 5/5, parked 6%, jerks 0, median speed 0,048.
- Final: self 4,0 (mengikuti juri).

## Pelajaran
- failed: latar 2D terang rata → juri lighting −1 dari self. Butuh vignette/arah cahaya kunci kuat.
- failed: diagram abstrak titik/panah untuk menjelaskan detektor dinilai generik; tampilkan objek (tas) besar di tengah saat menjelaskan mekanisme.
- fix: poles lantai perspektif + BG blur + FG DoF menaikkan depth/material/composition 3→4 (juri 3,5 → 4,0).
- C: penuh: semua render pakai `TEMP=<ep>/draft/_tmp`. `audira_generate_voiceover` dengan scriptPath gagal ("no timed lines"); pakai param `text`.
- loudnorm satu pass untuk stem SFX menghasilkan −18,7; koreksi `volume=-1.3dB` → −20,0.

## Upload & review
- Jadwal: Senin 30 Nov 2026, TikTok 19.00 WIB, lalu berjarak 20 menit (lihat `SOCIAL_CAPTIONS.md`).
- Scheduled task review: `review-xray-bagasi-ep14-24h` (1 Des 2026 19.00 WIB), `review-xray-bagasi-ep14-72h` (3 Des 2026 19.00 WIB), `review-xray-bagasi-ep14-7d` (7 Des 2026 19.00 WIB). Hanya berjalan saat aplikasi Claude terbuka.
