# ASSET MANIFEST — EP02 (semua prosedural, tanpa bitmap atau aset AI)

| Aset | Sumber |
|---|---|
| Tempayan (lathe, wajah, tali, pita, retakan TubeGeometry, jahitan emas) | `studio/src/scenes/ep02/Characters.tsx` |
| Tukang air (lathe kurta/dhoti/sorban, lengan dan kaki IK, pikulan) | `Characters.tsx` |
| Bukit (heightfield + vertex color), retak tanah, kerikil, rumput, 520 bunga instanced, mata air, rumah, gentong, meja + vas kintsugi + buket, pohon keramik, bukit jauh, langit shader, tetes, garis emas, benih emas, bunga macro | `World.tsx` |
| Logika cerita (posisi di jalan, isi air, emosi, mekar, emas, matahari) | `story.ts`, `layout.ts`, `timeline.json` |
| Kamera, cahaya, overlay, audio | `Film.tsx` |
| Kit | `src/kits/kintsugi/lib/palette.ts` (palet); core: `geometry/lathe`, `render/Post` (CameraRig, GTAO/DOF/bloom/grade), `render/FinishingPresets` DOCUMENTARY_WARM, `motion/easing`, `film/Stage3D`, `type/fonts` |
| Font | Manrope (bundel, OFL), Cormorant Garamond (`@remotion/google-fonts`, OFL) |
| Logo | `studio/public/brand/stacked-reversed.svg` |
| SFX | `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/`: chime, whoosh-short, whoosh-cinematic, riser, sparkle, ping, pop |
| Musik/ambience | disintesis numpy, `studio/src/scenes/ep02/mix.py` → `studio/public/audio/ep02/mix.wav` |
| Draf | `DRAFT_SHEET.jpg` (8 frame kunci 540×960), `CLIP_BLOOM_NO_VO.mp4` (15,5 dtk, s5a–s5c) |
