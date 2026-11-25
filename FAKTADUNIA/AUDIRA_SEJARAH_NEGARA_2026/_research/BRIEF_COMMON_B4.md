# Batch 4 addendum (EP16–EP20)

Read `_research/BRIEF_COMMON_B3.md` first and follow all of it. These rules are added on top:

1. **Brand inside the scene.** The word "AUDIRA" appears at least once as part of the 3D world: a label, stamp, plaque or sign, never a flat watermark.
2. **Moving signature.** In `build-video.mjs`, call `writeWorld(TL, at, { sig: "<EP folder name>", ... })`. `shell.mjs` then adds the moving "AUDIRA · audira.my.id" signature. Do not build your own.
3. **Finishing (motion memory, translated to Three.js).** Every scene with metal, glass, plastic or paper gets an environment map: PMREMGenerator + RoomEnvironment as `scene.environment`, at the envIntensity listed for your style (scale material envMapIntensity). Use tone mapping `THREE.NeutralToneMapping` (or ACES if Neutral is unavailable) with the exposure listed for your style. Keep bloom subtle, add a light vignette and grain, and use soft contact shadows or AO-like darkening where objects touch. Bright or cream backgrounds need exposure ~0.82 so they do not blow out. Noir or dark styles start at exposure ~0.72.
   - VISUALINVESTIGATION: DOCUMENTARY_WARM look, exposure 1.0, envIntensity 0.55, AO on.
   - RETROWAVE: CYBER_NEON_VOID look, exposure 1.0, envIntensity 0.55, no AO on the grid lines.
   - MEMPHISDIORAMA: APPLE_STUDIO_CLEAN look, exposure 0.82, envIntensity 0.25, AO on.
   - ISOCRAFT: APPLE_STUDIO_CLEAN look, exposure 0.82, envIntensity 0.25, no AO (flat comic shading).
   - WATERCOLOR: DOCUMENTARY_WARM look, exposure 0.82, envIntensity 0.25, AO on.
4. **Scene design.** The finishing chain fixes light and material, not scene design or framing. Every beat needs a clear, rich subject, never a near-empty plane.
5. **Self-score.** When your contact sheet is final, score it against `style/cover-reference.*` on 6 aspects, 1–5 each: lighting, material, depth, composition, motion, readability. Polish until the average is ≥4 and no aspect is <3. Report the scores.
6. **No MP4 render** of any kind.
