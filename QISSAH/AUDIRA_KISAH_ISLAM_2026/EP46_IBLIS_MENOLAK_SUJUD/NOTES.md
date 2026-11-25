# NOTES — Iblis Menolak Sujud (`EP46`)

> Tahap 10–11. Pelajaran agar episode berikut mulai dari kualitas lebih tinggi. Disimpan juga ke motion memory (`append_lesson` PAPERWORLD).

Style PAPERWORLD · Remotion 2D SVG murni · VO 80,76 dtk · film 83,8 dtk · draf juri buta 3.83 LOLOS · G18c gap 13,1 LU.
Adab: tanpa wajah Adam/malaikat; Iblis = api kertas.

## Yang berhasil (worked)
- Iblis divisualkan sebagai nyala api kertas tegak di antara pilar cahaya yang sujud: hook terbaca tanpa menampilkan sosok.
- Struktur dua jalan (Iblis jatuh vs Adam bertobat) memberi payoff yang jelas di 62–76 dtk.

## Yang gagal (failed) + perbaikan (fix)
Draf lolos juri (3.83), tapi 4 gate teknis menolak render final. Ditambal di sesi s4 sebelum render:
1. **G13 camera** — gagal karena gerak kamera hanya ada di lapisan MG, frame global nyaris parkir. Fix: orbit elips global per scene di `project/src/ep46/camera2d.ts`, dipakai `Film.tsx` (s 1.045+0.006·lt, x ±22·sin1.3lt, y 34·cos1.3lt). Klip 44–62 dtk: median 0.056, parked 0%.
2. **G14 rig** — film 2D tidak punya rig model untuk audit. Fix: `rigPose` di `camera2d.ts` + `node scripts/rig-audit.mjs src/ep46/camera2d.ts rigPose --frames=864 --fps=60` → `draft/rig-audit.json` 5/5.
3. **look.json clipHi** — highlight terpotong di S4 dan S8. Fix: S4 LightPool putih → #FFF4DE op 0.62; S8 beam 0.6→0.45, LightPool 0.35+0.35·impact+0.2·rise, impact circle 0.55→0.42 → clipHi 0 semua, ceilings 5.
4. **Channel gate** — `handle="@audira"` tertinggal di file starter `src/scenes/news/PenggantiGibranWapres.tsx`. Fix: handle dihapus.
5. **Render final batch 20261124-161608 gagal preflight** di frame 5027: `public/brand/stacked-reversed.svg` 404 (dipakai `AudiraOutro`, tidak tersalin saat scaffold). Fix: salin dari `F:/AUDIRA-SKILL-MOTION/starter/public/brand/`, render ulang batch 20261124-161730.
- `npm run draft` stills gagal `CancelledError`; still dirender manual via `remotion still`.

## Teknis
- Offset VO: 0
- Parameter render: `audira_render_batch` Ep46Final, `--jobs=7 --concurrency=2 --gl=vulkan --encoder=nvenc`, `--vo=public/audio/vo.wav --sfx=public/audio/sfx.wav`, 1080×1920 @ 60.

## Review pasca-tayang (scheduled task)
- review-iblis-menolak-sujud-24h
- review-iblis-menolak-sujud-72h
- review-iblis-menolak-sujud-7d

## Pasca-tayang (24j / 72j / 7h)
| Waktu | Views | Avg durasi/retensi | Hook bertahan? | Komentar |
|-------|-------|--------------------|----------------|----------|
| 24j | | | | |
| 72j | | | | |
| 7h | | | | |

## Penutupan 2026-11-25
- Batch 20261124-163119 exit 1 di langkah rename akhir, tetapi project/out/Ep46Final.mp4 utuh (83.8 s, -13.7 LUFS, TP -1.8, metadata OK). Disalin ke FINAL_EP46_IBLIS_MENOLAK_SUJUD.mp4, tidak dirender ulang.
- QA final: audira_qa_video hardOnly PASS (draft/qa-final). Skor final self 3.83 (L4 M3 D4 C3 Mo5 R4).
- Review task: review-iblis-menolak-sujud-24h (30 Nov 19.00), -72h (2 Des 19.00), -7d (6 Des 19.00).
