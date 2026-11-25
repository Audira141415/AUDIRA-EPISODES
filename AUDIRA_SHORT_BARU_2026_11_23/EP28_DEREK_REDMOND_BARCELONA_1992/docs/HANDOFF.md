# HANDOFF — EP28 Derek Redmond, Barcelona 1992 (2026-11-23, akhir sesi 2)

## Selesai (sesi 1–2)
- Tahap 1–3: riset `research/SOURCE_REGISTER.md`, style **CHRONICLE** (acc), cover `style/cover-topic.png`.
- Tahap 4: `docs/SCRIPT.md`, `docs/script-lines.json`, `docs/ART_DIRECTION.md`, `docs/STORYBOARD.md` (8 adegan), `docs/ASSET_MANIFEST.md`.
- Tahap 6: VO Cartesia 193 kata. Mentah: `audio/work/vo-raw.wav` + `vo-raw-words.json` (79 dtk). Dipadatkan (lead 0,1 dtk, jeda ≤ 0,30 / 0,45 dtk akhir kalimat, onset kata dijaga RMS) dengan skrip `audio/work/tighten.py` → `project/public/audio/vo.wav` 72,8 dtk + `vo-words.json` + `vo.timing.json` (`npm run vo`). Teks VO: "Audira" bukan "AUDIRA".
- `project/src/lib/set.tsx` + `hud.tsx` disalin dari EP10 (versi poles: LightRays, Haze, Occluder).
- `project/src/Film.tsx` (Ep28Final, OFF 0,3, FILM_SEC 76, 16 shot / 8 adegan: hook ayah-anak + 65.000; plat AUDIRA; Barcelona 3 Agu 1992 + NameTag; kilas Seoul 1988 Achilles; babak 1 45,03; start lane 5 + flash pistol; 150 M + Snap merah paha kanan + "SAYA KIRA DITEMBAK"; hamstring putus berlutut; tandu "DITOLAK"; lompat satu kaki 250 M; Jim menerobos petugas + NameTag; Quote parafrase + BERSAMA; 65.000 berdiri; Jim melepas di garis FINISH; papan hasil DNF; outro AYAH & ANAK). `src/Root.tsx` punya Ep28Cover + Ep28Final. `npx tsc --noEmit` lolos.

## Sisa langkah
1. Still per beat (cek visual): `npx remotion still src/index.ts Ep28Final out/s.png --frame=N` (env TEMP/TMP/RENDER_TMPDIR=F:/temp/render). Perbaiki tabrakan teks/figur.
2. `docs/SHOTLIST.md` (format EP10, kolom `# | Waktu | Objek | Aksi | Kamera | Teks layar | Beat`, Offset 0.3, waktu = film detik) → `npm run sfx`.
3. Contact sheet 6–8 frame 540×960 → `draft/contact-sheet.jpg`; `draft/THEME_CHECK.md` (G22); `npm run audit:visual`; skor self + juri buta (subagen, qa/jury.md) → record_score draft. Maks 2 putaran; terbaik ≥ 3.5 → final.
4. Final: `npm run render:final -- ... --vo=public/audio/vo.wav --sfx=public/audio/sfx.wav --jobs=4` (lihat EP10 NOTES: `--skip-channel`, mungkin `--skip-memory-gate` bila juri 3.8 tapi tool minta 4; rename EPERM → mv). QA −14 LUFS TP < −1, metadata ffmpeg, `audira_qa_video`, record_score final.
5. Tahap 10: SOCIAL_CAPTIONS.md (pola EP10), validator, NOTES.md, lessons, 3 scheduled task review.
