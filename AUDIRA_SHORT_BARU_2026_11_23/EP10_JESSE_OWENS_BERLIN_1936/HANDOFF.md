# HANDOFF — EP10 Jesse Owens Berlin 1936 (2026-11-23, sesi 2)

Style CHRONICLE (acc). Remotion 2D di `project/`. Jangan ulang tahap selesai.

## Selesai (sesi 2)
- Tahap 4 docs: `docs/ART_DIRECTION.md`, `SCRIPT.md`, `STORYBOARD.md`, `ASSET_MANIFEST.md`, `SHOTLIST.md` (18 shot, Offset 0.3). Teks VO: `audio/vo.txt` (202 kata).
- Tahap 6 VO Cartesia: `project/public/audio/vo.wav` (77,83 dtk) + `vo-words.json` + `vo.timing.json`.
- Tahap 7: `project/src/Film.tsx` (komposisi `Ep10Final`, 81,5 dtk = 4890 frame @60; 17 shot + AudiraOutro code SPORTFACTS + AudiraSignature), SFX `project/public/audio/sfx.wav` (−20 LUFS).
- Tahap 8: `draft/contact-sheet.jpg` (10 frame), `draft/look.json` (ceiling 5), `draft/camera.json` (motion 5/5), `draft/THEME_CHECK.md` (semua ya). Skor self 4.17 tercatat. Juri buta: lihat motion memory (record_score jury, episode `short-baru-11-23-EP10`); bila belum ada, jalankan ulang juri (qa/jury.md) di contact sheet.

## Juri putaran 1 = 3.50 PERLU POLES (tercatat). Sisa 1 putaran juri.
Skor: lighting 3, material 3, depth 3, composition 3, readability 4, motion 5. Poles di lib/Film.tsx:
- Lighting: tambah komponen `LightRays` (sinar lembut berarah dari matahari/floodlight di balik rim tribun, mixBlendMode screen, opacity 0.25–0.4, animasi drift pelan) + haze band antara kerumunan dan lintasan di tiap shot stadion; vignette sudut bawah lebih gelap.
- Material: kerumunan `Stadium` terlalu "titik bising" di ukuran kecil → tambah lapisan massa lembut (blur 2–3px / gradient) di atas kepala, kurangi kontras titik; tambahkan tekstur kertas/grain lebih terasa di Finish (grain 0.09).
- Depth: occluder foreground blur (bendera/tiang/papan lintasan besar di sudut, filter blur 6px) di shot 100 m, lompat jauh (S4a/S4b/S4c), medali 1990, finale; stadion BG blur 1.5px pada shot dengan siluet besar.
- Komposisi: S4c pendaratan figur di x=900 mepet kanan → geser bak pasir & landing ke x≈700 (lompatan 220→700); finale/1990 figur kecil (h150) → perbesar; teks kecil: NameTag sub "AMERIKA SERIKAT" & Citation estafet → fontSize ≥40 + kontras; BrandPlate S1b (x620,y1100) tertutup lengan pelari → pindah ke x 70.
- Catatan: klaim juri soal safe zone keliru (judul y≈240 px dan karaoke 1438–1520 px masih di dalam 180/1540) — tetap boleh dinaikkan karaoke sedikit (top 1420).
Setelah poles: render ulang contact sheet (perintah sama: `node scripts/stills.mjs ../draft 1.6s,5.5s,17.6s,23.6s,34.6s,38.5s,50.4s,55.9s,61.5s,73.8s Ep10Final 0.5`, lalu rename `_sheet.jpg`→`contact-sheet.jpg`), self score, juri buta subagen baru (qa/jury.md; beri koreksi: safe zone di sheet 0.5× = top 90 px / bottom 190 px), record_score jury. Bila masih <3.8 → kembali ke gerbang style (G21), jangan render final.

## Sesi 3 (2026-11-23)
- Poles juri 1 SELESAI (set.tsx: LightRays/Haze/Occluder/crowd soft mass/grain 0.09/vignette bawah; hud.tsx teks >=40; Film.tsx: S4c x700, figur finale h580/600, 1990 h380 + card di atas, BrandPlate S1b x70 y830, citation estafet out). Contact sheet baru dirender. Self 4.0 tercatat. Juri putaran 2 SELESAI = 3.83 (lighting 4, material 3, depth 4, composition 3, motion 5, readability 4), tercatat judge jury.
- BLOKER: aturan pengguna G16 (rata-rata >=3.8, tak ada aspek <3) = LOLOS, tapi audira_style_memory memakai ambang 4 -> PERLU POLES + "batas 2 putaran, ganti style". render-final.mjs:127 menolak final tanpa jury pass=true. Jangan bypass gate. Tunggu keputusan: ikuti G16 (selaraskan ambang tool) atau kembali ke gerbang style G21.
- Kritik juri (bila poles lagi diizinkan): kerumunan stadion terbaca noise berulang di 7/10 frame, lintasan fill datar; karaoke menimpa pelompat S4c (34.6s); karaoke 2 baris masuk band bawah (38.5s) -> top 1400; figur kecil di S6c (61.5s).
- SOCIAL_CAPTIONS.md sudah didraf (jadwal Rabu 25 Nov 2026 19.00 WIB), belum divalidasi.

## KEPUTUSAN PENGGUNA 2026-11-23: "Ikuti G16, final"
Juri 3.83 dianggap LOLOS menurut G16. Render final memakai override resmi gate (alasan tercatat bersama final):
`cd project; node scripts/render-final.mjs --comp=Ep10Final --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --offset=0.3 --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --encoder=nvenc --title="Jesse Owens: 4 Emas Berlin 1936" --slug=jesse-owens-berlin-1936 --ep=EP10 --skip-memory-gate="G16 pengguna: juri buta 3.83 >= 3.8, tidak ada aspek <3; keputusan pengguna 2026-11-23"`
Jangan ubah ambang tool/gate bersama. Opsional sebelum render (kecil, aman): karaoke top 1420 -> 1400 di Film.tsx.

## Sisa
1. Bila juri LOLOS (≥3.8, tak ada <3): `audira_episode_status update draft done`.
2. Final: `cd project; node scripts/render-final.mjs --comp=Ep10Final --out=../FINAL_VIDEO.mp4 --vo=public/audio/vo.wav --offset=0.3 --sfx=public/audio/sfx.wav --jobs=4 --concurrency=2 --encoder=nvenc --title="Jesse Owens: 4 Emas Berlin 1936" --slug=jesse-owens-berlin-1936 --ep=EP10` (jalankan di background, ±beberapa menit).
3. Cek metadata ffprobe (artist "AUDIRA (Agus Dwi R.)", copyright © 2026), −14 LUFS, TP < −1. `audira_qa_video` hardOnly (cuts dari SHOTLIST). `record_score` final.
4. `SOCIAL_CAPTIONS.md` 6 platform + `## Jadwal Upload (WIB)` + `## Label Konten AI` → `audira_validate_social_captions` (keywords: Jesse Owens, Berlin, 1936, Luz Long). `NOTES.md`, append_lesson CHRONICLE, 3 scheduled task review (`review-jesse-owens-berlin-1936-24h/-72h/-7d`), hapus draft/clip-30-48.mp4.
