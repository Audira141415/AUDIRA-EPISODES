# ASSET MANIFEST — EP06 Jessica

Semua visual prosedural (React Three Fiber di Remotion); tidak ada gambar AI atau foto.

| Aset | Sumber |
|---|---|
| Rumah diorama, perabot, pagar, jalan, bukit, pohon, lampu | `studio/src/scenes/ep06/Set.tsx` (primitif three.js + garis EdgesGeometry) |
| Budi, Jessica | `studio/src/scenes/ep06/Person.tsx` (boneka primitif; wajah digerakkan pose + waktu kata) |
| Buku "Peri Kecil" (sampul baru/usang, halaman, coretan krayon) dan peri | `studio/src/scenes/ep06/Book.tsx` (tekstur canvas 2D, seeded) |
| Tekstur wash, material, palet | `studio/src/scenes/ep06/paint.ts` (palet dari kit `src/kits/watercolor/lib/palette.ts`) |
| Post-process cat air + grade | `studio/src/scenes/ep06/Post.tsx` |
| Timing, staging, kamera, overlay | `studio/src/scenes/ep06/Film.tsx`, `layout.ts`, `timeline.json` |
| Kanvas 3D + overlay | `src/core/film/Stage3D` (core, tidak diubah) |
| Font | Fraunces, Nunito (`@remotion/google-fonts`) |
| Logo outro | `studio/public/brand/stacked-reversed.svg` (tidak diubah) |
| Musik + ambience | sintesis numpy di `studio/src/scenes/ep06/mix.py` |
| SFX | `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/`: whoosh-cinematic, sparkle, chime, click-soft, whoosh-short, impact-bass-1 (low-pass), ping, riser |
| Output | `studio/public/audio/ep06/mix.wav`, `studio/out/ep06/preview.mp4`, `EP06_JESSICA/PREVIEW_NO_VO.mp4` |
