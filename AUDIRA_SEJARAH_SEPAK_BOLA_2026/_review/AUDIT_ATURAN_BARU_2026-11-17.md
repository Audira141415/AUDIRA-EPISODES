# Audit seri Sejarah Sepak Bola terhadap aturan baru (2026-11-17)

Aturan acuan: directive master (world3d default, rule 07 9f) dan rule 12 Standar Makkah
(ART_DIRECTION.md, STORYBOARD.md s1-s8, ASSET_MANIFEST.md, konsep spasial, look.json ambang batas).

## Ringkasan

| Kelompok | Episode | Jumlah |
|---|---|---|
| Final (FINAL_VIDEO.mp4 di folder episode) | EP01-EP11 | 11 |
| MP4 render ada di project/out, belum dipromosikan, belum memenuhi rule 12 | EP19, EP20 | 2 |
| Belum ada video final | EP12-EP18, EP21-EP44 | 31 |

Total episode yang perlu diperbarui ke aturan baru: 33 (31 + EP19, EP20).

## Kekurangan umum pada 33 episode

- Tidak ada `docs/ART_DIRECTION.md` (wajib, rule 12 §1).
- Tidak ada `docs/ASSET_MANIFEST.md` (wajib, rule 12 §3).
- `docs/STORYBOARD.md` format lama, belum per adegan s1-s8 dengan anchor kamera `at("sN:kata")` (rule 12 §2).
- Engine lama campuran Remotion / HyperFrames 2D; aturan baru: world3d (Three.js di HyperFrames).
- `draft/look.json` EP19/EP20 tidak berisi metrik `motion` (meanMotion, stillPct) -> belum bisa dinilai.
- Gate di STATUS.json kosong (style/script/draft belum disetujui tercatat).

## Status per episode (stage di STATUS.json, VO)

| EP | Stage | VO | Engine lama |
|---|---|---|---|
| EP12-EP14 | draft | vo.wav | (project kosong) |
| EP15-EP17 | draft | vo.wav | HyperFrames 2D |
| EP18 | final (tanpa MP4) | - | Remotion |
| EP19 | voice | - | Remotion, MP4 di project/out |
| EP20 | final | - | HyperFrames, MP4 di project/out |
| EP21-EP23 | draft | vo.wav | HF + Remotion |
| EP24 | draft | VO_MASTER.wav | Remotion |
| EP25, EP41, EP43 | setup | VO_MASTER.wav | - |
| EP26, EP28, EP34, EP40 | animation | VO_MASTER.wav | - |
| EP27, EP30 | voice | - | Remotion |
| EP29, EP31, EP36-EP39 | voice | - | - |
| EP32, EP35 | draft | VO_MASTER.wav | Remotion |
| EP33 | animation | VO_MASTER.wav | Remotion |
| EP42, EP44 | setup | - | - |

## Sudah dikerjakan 2026-11-17

- `audira_project_layout world3d` dipasang ke seri: `_tools/` (lib3d.js, shell.mjs, look.py, render.sh, final.sh, dst.) + `BRIEF_WORLD3D.md`, dan `project/hf` di setiap EP (tanpa menimpa file lama).

## Masalah layout yang masih terbuka

- Junction `project/node_modules` rusak (target `_cache/node_modules` hilang): EP19-EP24, EP30. Tidak dipakai world3d.
- 51 file memakai path absolut ke seri sendiri (peringatan rule 08 §5.1).

## Langkah per episode (batch maks 3, sesuai directive)

1. Tulis `docs/ART_DIRECTION.md` (konsep spasial satu dunia).
2. Tulis ulang `project/script-lines.json` + `docs/SCRIPT.md` + `docs/STORYBOARD.md` (s1-s8).
3. Gerbang pengguna: setujui ART_DIRECTION + SCRIPT + STORYBOARD.
4. `docs/ASSET_MANIFEST.md`, lalu `project/world3d.js` + build.
5. VO dikunci (VO lama dipakai bila naskah tidak berubah), draf, `look.py` lolos, juri, final.
