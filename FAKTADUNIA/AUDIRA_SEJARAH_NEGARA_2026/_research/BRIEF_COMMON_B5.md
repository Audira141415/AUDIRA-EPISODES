# Batch 5 addendum (EP21–EP25)

Read `_research/BRIEF_COMMON_B3.md` and `_research/BRIEF_COMMON_B4.md` first, and follow both. The B4 rules (brand inside the scene, the `sig` option in `writeWorld`, the finishing chain, self-score, no MP4) all apply. Finished batch 4 episodes (EP16–EP20) are the newest reference implementations. Read one of them (for example EP19_SWISS_BUNKER_NUKLIR or EP16_INDONESIA_KELUAR_PBB) before you start. `RoomEnvironment.js` is already in your episode folder; copy it into `assets/lib` the same way EP16 does.

## Finishing per style (from motion memory)
- TOYDIORAMA (EP21): DOCUMENTARY_WARM look, exposure 1.0, envIntensity 0.55, AO on. Toy characters use rounded boxes (RoundedBoxGeometry from three addons, or bevelled shapes), fabric-like rough material for clothes, toy-skin faces, glossy bead eyes, subtle surface grain. No plain sharp boxes for characters. People: head with simple face, shoulders wider than hips, bent elbows and knees, skin colour different from clothes. Never a capsule body with four sticks in one colour.
- COMICFORGE (EP22): flat comic look, exposure 0.9, envIntensity 0.2. Thick black ink outlines (inverted-hull or edge lines), halftone dots, flat bold colours, speech balloons in HTML panels.
- FILMNOIR (EP23): APPLE_STUDIO_CLEAN look, exposure 0.72, envIntensity 0.1, AO on. Keep the blacks deep. Hard key light, venetian-blind shadows, fog. Exposure 1.0 erases the noir blacks, so never use it.
- DRAFTFORGE (EP24): APPLE_STUDIO_CLEAN look, exposure 1.0, envIntensity 0, AO off. Neutral blueprint line style. The Nepal flag is red #DC143C with a blue #003893 border, a white crescent moon on top and a white 12-ray sun below. Build its outline from the double-pennon shape so it is taller than it is wide.
- MANUSCRIPT (EP25): no memory yet. Start with DOCUMENTARY_WARM, exposure 0.9, envIntensity 0.35, AO on. Parchment needs a real paper texture (fibres and grain from a canvas texture), not a flat cream colour. Warm candle-like key light. Do not render Thai script; use Latin transliteration only. Never show song lyrics.

## Known trap
A pure white or cream `scene.background` renders grey under tone mapping. Use a gradient CanvasTexture background instead (see EP18 `world3d.js`).
