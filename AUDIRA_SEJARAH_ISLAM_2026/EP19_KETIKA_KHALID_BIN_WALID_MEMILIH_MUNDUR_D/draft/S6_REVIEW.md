# EP19 s6 — status + temuan still pertama (baca ini dulu di s7)

## Sudah selesai di s6
- Komponen ditulis di `project/src/scenes/khalid/`: `Swords.tsx` (baki pasir, 9 pedang patah dari GLB arming-sword + pedang Yaman), `Book.tsx` (kitab, lentera GLB, nyala, tetes lilin, 3 panji mini; ekspor `CANDLE_LIGHT`, `candleIntensity`), `Places.tsx` (`Madinah`, `Syria`, `GATE`), `Mutah.tsx` (`MutahBanners`, `Enemy`+debu, `Caravan`, `Column` + `columnU`, `TurnArrow`, `Finale` titik denyut + busur), `Hud.tsx` (kartu jadwal S5_COMPONENT_PLAN, label peta via `project`, counter pedang, karaoke dari vo-words.json dengan 629/3.000/638), `KhalidFilm.tsx` (prop `cover`).
- `src/Root.tsx`: `KhalidPreview` 540×960@30, `KhalidFinal` 1080×1920@60, `KhalidCover` (1080×1920@60, cover=true: tanpa outro/signature/VO, judul "KETIKA KHALID MEMILIH MUNDUR"). 91 dtk.
- `World.tsx` fog diberi `args` (fix tsc). `npx tsc --noEmit` lolos (sisa 2 error lama di `core/qa/scene-qa.tsx`, bukan episode).
- Still per beat: `project/out/beats1/_sheet.jpg` (15 frame), audit look: "no aspect capped below 4". Semua GLB termuat, tanpa error render.
- Rig TIDAK diubah (tetap 5/5).

## Temuan dari `out/beats1/_sheet.jpg` (perbaiki di s7)
1. **Relief terlalu tinggi**: di hook 1s/4s satu gundukan raksasa mendominasi di belakang panji; di 9s/13s/45s/52s/82s/86s peta tampak seperti pasir bergelombang dengan bayangan berat, rute emas sulit terbaca. Usul: kalikan hasil `heightAt` di `geo.ts` ±0.5 (semua prop pakai `hAt`, jadi ikut). Cek ulang Mu'tah flat h0.11 tetap.
2. **Label peta** MADINAH/MU'TAH/S. YORDAN tidak muncul di 9s dan 13s (top-down): kemungkinan proyeksi di luar 520–1180 atau x di luar 80–1000; cek `project()` atau longgarkan batas/lift.
3. **Karavan (13s) dan kolom (52s) terlalu kecil** di shot jauh: naikkan size kuda/unta (0.36→0.6) dan panji kolom (h0.7→1.0), atau tambah panah emas/penanda di kepala kolom.
4. 82s/86s s8: busur emas Mu'tah→Syria tidak terbaca; tebalkan tube (0.035→0.07), emissive lebih tinggi, titik denyut lebih besar (0.13→0.25).
5. 45s kartu sedang fade-in (wajar). 58s Madinah, 66s Syria, 20s kitab, 28s lentera, 34s/37s pedang + counter: bagus.

## Sisa langkah s7 (tahap 7–8)
- Perbaiki 1–4 → `npm run stills -- out/beats2 1s,4s,9s,13s,20s,28s,34s,37s,45s,52s,58s,66s,75s,82s,86s KhalidPreview`.
- Cover: `npm run stills -- out/cover 4s KhalidCover` → salin ke `style/cover-topic.png`.
- `SHOTLIST.md` (beat, detik dari `cues.ts`/`timing.ts` CUTS, momen SFX), `TARGET_LUFS = -28` di `sfx/cues/auto.py`, `$env:PYTHONUTF8=1; npm run sfx`.
- Tahap 8: contact sheet 540×960 di `draft/`, `npm run audit:visual`, klip 15–20 dtk 540×960 → `npm run audit:camera`, `draft/THEME_CHECK.md` (G22), G24, G18c (VO ≥ 12 LU di atas SFX), `record_score` HISTORYMAP `sejarah-islam-EP19` draft self lalu juri buta (`F:/AUDIRA-SKILL-MOTION/qa/jury.md`), maks 2 putaran.
- Tandai animation + draft done, handover newSession ke Sesi C.
