# EP09 handover sesi 1 → sesi 2 (2026-11-23)

## Sudah selesai
- Style: TOYDIORAMA, Remotion + R3F 3D (`style/STYLE_DECISION.md`). Pola kode = EP04 (`studio/src/scenes/ep04/Film.tsx`, Cover.tsx): baca itu dulu dan tiru strukturnya (CUT/BEAT dari timeline, camAt keyframes, Hud Chip/Timer, Captions karaoke y≈1260, Finish DOCUMENTARY_WARM exposure 1 envIntensity 0.55, vignette, scrim atas, flash potong).
- Naskah: `docs/script-lines.json` (7 blok, ±210 kata display, markup `{display|spoken}`).
- VO TERKUNCI: `audio/work/vo-raw.wav` (Cartesia speed 0.88) → `_tools/vo_tighten.py` → `audio/vo.wav` (−16,8 LUFS) → `_tools/make-timeline.py` → `studio/src/scenes/ep09/timeline.json` (total 90,741 dtk, voEnd 86,74) + `studio/public/audio/ep09/vo.wav`. JANGAN generate VO ulang.
- GLB disalin ke `studio/public/glb/`: tall-pine-tree-ab4108, snow-fence-run-55a09a, wooden-hand-cart-3ae5b5, military-cargo-truck-652f66, snow-capped-log-pile-8719e7, piste-marker-pole-7480c3 (+ sudah ada: palm-tree-a307da, grandstand-seating-run-fc9023, scaffold-camera-platform-b6702c, checkered-flag-81784a).
- Kode: `studio/src/scenes/ep09/Model.tsx` (salinan ep04), `Set.tsx` (Bobsled, IceTrack dengan bank quarter-pipe + papan sign, SnowStage, Athlete/TEAM_LOOK, Beach dengan jalan miring + gerobak). Belum di-typecheck.

## Waktu kata kunci (detik, dari timeline.json)
hook 0.1: 130@1.0, Kereta@3.9, terguling@5.8, negara@8.7, tropis@9.1, salju@10.0, AUDIRA@11.1, Jamaika@14.0
konteks 14.93: Kingston@14.9, 1987@15.4, Dua(orang Amerika)@16.9, balap kereta dorong@18.2, sprinter@20.4, Iklan@22.2, gagal@23.0, tentara@25.1, pilot helikopter@26.4
pengembangan 28.24: Calgary@28.2, 1988@29.8, Debut@31.2, dua orang@34.1, ke-30@35.3, 41@36.0, pendorong cedera@37.9, Penggantinya@39.1, Chris Stokes@39.6, menonton@42.7, belum pernah@44.0
penjelasan 45.70: 28 Februari@45.7, hari terakhir@47.5, Run ketiga@49.0, Start@51.2, ketujuh@52.5, Kreisel@54.3, terguling@56.9, Helm@57.7, dinding es@58.9
kontras 60.0: cedera serius@60.3, Keempatnya keluar@61.5, berjalan di samping@63.0, garis finis@64.6, Jutaan penonton@65.5, tidak finis@68.0
payoff 69.39: Lillehammer@70.9, 1994@71.4, ke-14@73.7, 30@74.6, Amerika Serikat@76.8, 0,01@78.5
outro 80.08: medali@81.1, berhenti@82.3, 2022@84.7, 2026@85.8; outro card AUDIRA 86,9–90,7 dari Root.

## Rencana scene (7, HUD callout tiap angka)
- S1 hook 0–8,4: lintasan es + bank "KREISEL", kereta melaju (tracking samping), timer "±130 KM/JAM" @1.0, terguling @5.8 (naik dinding lalu rebah ke samping, helm menyentuh es, semburan es kecil). Cover text 0–1,4.
- S2 8,4–28,0: tropis → Kingston. Pantai (Beach) chip "JAMAIKA · TROPIS · 0 SALJU" @8.7; "KINGSTON · 1987" @14.9; gerobak meluncur jalan miring @18.2 chip "PUSHCART DERBY"; 2 figur penonton casual; "IKLAN SELEKSI: GAGAL" @22.2; truk tentara GLB masuk @24.3 + 3 figur hijau zaitun, chip "JAMAICA DEFENCE FORCE · PILOT HELIKOPTER" @25.6.
- S3 28,0–45,4: SnowStage Calgary. Chip "CALGARY 1988 · DEBUT OLIMPIADE MUSIM DINGIN" @28.4; kereta 2 helm chip "TWO-MAN: KE-30 DARI 41" @35.3; 4 atlet berjajar, satu duduk (pose sit) @37.9 chip "1 PENDORONG CEDERA"; figur jaket berbeda masuk @39.1 chip "PENGGANTI: CHRIS STOKES" lalu "BELUM PERNAH NAIK BOBSLED" @44.0.
- S4 45,4–59,7: "28 FEB 1988 · HARI TERAKHIR" @45.7, "RUN KE-3 · FOUR-MAN" @49.0; dorongan start 4 atlet (start boleh didorong), "START TERCEPAT KE-7" @51.2; tracking → bank "KREISEL" @54.3, terguling @56.9 "±130 KM/JAM", "HELM TERGESEK DINDING ES" @57.7.
- S5 59,7–69,1: kereta rebah di dekat spanduk FINISH (+ papan "AUDIRA" in-world), chip "TAK ADA CEDERA SERIUS" @60.3; 4 atlet BERJALAN di samping kereta (pose walk, tangan TIDAK di kereta, JANGAN memikul/mendorong) @61.5–65; tribun GLB + platform kamera TV, chip "DISIARKAN KE JUTAAN PENONTON" @65.5; "HASIL RESMI: TIDAK FINIS" @67.1.
- S6 69,1–79,8: Lillehammer 1994, papan skor in-world: "14 JAMAIKA 3:29,96" (sorot) / "15 USA 1 3:29,97"; chip "LILLEHAMMER 1994" @70.9, "KE-14 DARI 30" @73.7, Timer "0,01 DETIK" @78.5 (statis, bukan counter). JANGAN klaim di atas Swiss.
- S7 79,8–90,7: kereta di salju, chip "BELUM ADA MEDALI · TAK PERNAH BERHENTI" @80.1, "KEMBALI: 2022 · 2026" @84.7, teaser "BERIKUTNYA: WILT CHAMBERLAIN 100 POIN" sebelum outro card.

## Sisa langkah
1. `ep09/Film.tsx` (export `Film`, `TOTAL`), `ep09/Cover.tsx` (cover = pose terguling + CoverText "TIM BOBSLED JAMAIKA / ±130 KM/JAM / Calgary 1988. Negara tanpa salju."), `ep09/index.ts`.
2. Root.tsx: tambah import EP09, SLUG Ep09 "olahraga-EP09", komposisi Ep09Cover / Ep09Preview / Ep09Final (edit kecil, sesi EP06–08/10 juga mengedit file ini — Read sebelum Edit).
3. `npm run typecheck`, render cover → `style/cover-topic.png` (perintah lihat EP04 / `npm run cover`).
4. Docs rule 12: SCRIPT.md, STORYBOARD.md (≥6 baris, kolom Audio), ART_DIRECTION.md, ASSET_MANIFEST.md, SHOTLIST.md. Lalu `npm run sfx` (public/audio/ep09/sfx.wav).
5. Contact sheet 8 frame 540×960 (`npm run stills`), `npm run audit:visual`, `draft/THEME_CHECK.md`, juri self + juri buta subagent (qa/jury.md) → `record_score`. Maks 2 putaran.
6. Gerbang tahap 9: tampilkan sheet, skor, durasi, G18c → acc pengguna. Render final `--concurrency=2` + GPU_LOCK.md, di background.
