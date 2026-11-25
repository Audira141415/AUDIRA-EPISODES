# Batch 10 addendum (EP46–EP50)

Read these first, in order, and follow all of them: `_research/BRIEF_COMMON_B3.md`, `B4`, `B5`, `B6`, then `_research/BRIEF_COMMON_B8.md` (r186 environment trap, label and safe-zone rules). The newest finished reference implementations are EP36–EP40 (for example EP38_ENKLAVE_INDIA_BANGLADESH and EP40_BALTIC_WAY_1989). Read one `build-video.mjs` + `world3d.js` + `mix.py` and copy the structure, not the look.

- Facts: `_research/FACTS_B10.md`, your episode's section. Every on-screen number must match it and match what the narrator says.
- Script: `<EP>/script-lines.json` (do not edit). Timeline: estimated `timeline.json` (do not edit). The real voice replaces it later, so key every camera move, counter and reveal to word anchors (`"sN:word"`), never absolute seconds. Every anchor `world3d.js` uses must be listed in `extraAt` in `build-video.mjs`, otherwise that frame fails silently.
- Storyboard, palette, fonts, concept: `_tools/epdata10.py`.
- Other sessions may work on other episodes in this root. Write only inside your own episode folder.
- three.js r186: `scene.environment` ignores `material.envMapIntensity`. Set `scene.environmentIntensity` to the value below; give metal/gold/glaze materials their own `envMap` when they need more.
- Cover snapshot trap (batch 9): panels captured before fonts load look wrong. Snapshot the cover time twice and keep the later frame, then check it with Read.
- No portraits of real people anywhere. People are name cards plus generic figures (head with simple face, shoulders wider than hips, bent elbows and knees, skin colour different from clothes; never capsule bodies with four sticks).

## Kit per episode (read `F:\AUDIRA-SKILL-MOTION\kits\<style lowercase>\KIT.md`)
- **EP46 MOSAICFORGE (Portugal, Rio 1808–1821):** no memory yet; start DOCUMENTARY_WARM, exposure 0.9, environmentIntensity 0.4, AO on.
  - The world is a curved wall (or corridor) of real azulejo tiles: square glazed tiles with grout lines in between, slight per-tile tilt and colour variation (seeded), a glossy glaze that catches a raking light. Cobalt blue on white, with small ochre accents.
  - Scenes are painted in the tiles (ships, harbour, city), and 3D elements (a ship, a crown, a map) can stand off the wall. Tile panels assemble or flip on narrated words.
  - Brazil's flag (green, yellow rhombus, blue globe) only as a simple shape on the 1822 beat; no royal portraits.
- **EP47 POLYVERSE (Lesotho):** DOCUMENTARY_WARM, exposure 0.82, environmentIntensity 0.25, AO on (memory: exposure 1.0 looks washed out; a CSS contrast 1.07 + saturation 1.12 over the canvas removes haze).
  - Low-poly mountains rising above a sea of soft clouds; a height ruler (1.000 m, 1.400 m, 1.800 m) beside the peaks; a simplified southern Africa map where South Africa fully surrounds Lesotho.
  - Small low-poly villages, round huts, a dam with blue water, a Basotho blanket pattern as a flag-like banner. Lesotho flag: blue, white, green horizontal bands with a black mokorotlo hat in the middle.
- **EP48 CLAYWORLD (Andorra):** DOCUMENTARY_WARM, exposure 1.0, environmentIntensity 0.55, AO on (memory: clay sheen 0.22, sheenColor #ffe4d2, bump grain ~3 seeded; sheen 0.5 looks pale pink).
  - A plasticine Pyrenees valley with a tiny stone town; two thrones with two crowns. A bishop figure (purple mitre) and a president figure (sash in French colours), generic faces with simple dot eyes, never a likeness of Macron, Mitterrand, Sarkozy or any bishop.
  - "Boris I" is a comic clay figure with an oversized crown, then a tiny Spanish police figure leading him off. Keep the tone light and kind.
  - Andorra flag: blue, yellow, red vertical bands (coat of arms can be a simple yellow shield).
- **EP49 URBANFORGE (Myanmar, Naypyidaw):** APPLE_STUDIO_CLEAN, exposure 1.0, environmentIntensity 0.55, AO on (memory).
  - A white architectural maquette: a 20-lane boulevard with lane markings, almost no cars (one tiny car), huge government blocks, a golden pagoda as the only strong colour accent, roundabouts with flower beds. A moving sun casts long sharp shadows.
  - Myanmar map card: Yangon → Naypyidaw (320 km). Counters: US$4 miliar, 7.054 km², 924.608, 20 lajur, 80%.
  - Earthquake beat: cracks on the maquette, a few blocks tilt; no victims. Military parade as rows of tiny generic figures, no insignia of real units.
- **EP50 KINTSUGI (Sri Lanka, Sirimavo Bandaranaike):** APPLE_STUDIO_CLEAN, exposure 0.82, environmentIntensity 0.25, AO on (memory: exposure 1.0 makes porcelain flat white; the kit sample "plain cylinder with one gold line" is a known failure).
  - Hero: a real porcelain vessel (lathe profile, glaze sheen, slight translucency) on a dark warm wooden table. Visible cracks with real gold seams (raised, metallic, own envMap), more seams appear on each life beat.
  - The 1959 assassination is only a crack appearing with the date, never violence. The word "STATESWOMAN" can be engraved or written in gold. Sri Lanka flag only simple (maroon field with a gold lion silhouette is complex; use a maroon-and-gold banner shape or skip).
  - Two porcelain cups side by side for mother and daughter (1994).

## Hook and cover
- s1 must land the strongest image within 3 s.
- Cover topic: 1080×1920 still of the strongest frame with the hook title panel visible → `style/cover-topic.png`. AUDIRA inside the 3D world at least once (tile, sign, plaque, label) plus the moving signature (`sig`).

## Deliverables (NO MP4 render of any kind)
1. `node build-video.mjs`, then `bash ../_tools/snap.sh <EP folder> "<8-10 times>"`; Read the contact sheet and iterate until every frame reads well.
2. `style/cover-topic.png` (verify 1080×1920) and `style/contact-sheet.jpg`.
3. `python mix.py` once.
4. Self-score 6 aspects 1–5 vs `style/cover-reference.*`; polish until avg ≥4 and none <3.
5. Report briefly: files written, concept in 3 lines, cover path, scores, known weaknesses.
