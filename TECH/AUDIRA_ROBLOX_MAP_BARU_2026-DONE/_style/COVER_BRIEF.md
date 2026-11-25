# COVER BRIEF — AUDIRA_ROBLOX_MAP_BARU_2026 (topic covers, style gate part 2)

Series: `F:/AUDIRA-VIDEO-MOTION/AUDIRA_ROBLOX_MAP_BARU_2026` — 5 vertical shorts about the flood of new Roblox maps/games (AI "Build", 70.000 games) and tips to make a map that does not sink.
Studio (Remotion + R3F, current AUDIRA-SKILL-MOTION starter): `studio/` (node_modules is a junction to `_cache`, installed; `npx tsc --noEmit` passes).

## Your job (one episode)
Build ONE topic cover still, 1080×1920, in the chosen style kit, showing this episode's topic. It is the look-development frame, the thumbnail, AND the opening frame of the film later (the film's hook starts from this exact framing). No film, no MP4, no VO.

Build it so it can be reused: put the 3D world in `studio/src/scenes/<epNN>/Hook.tsx` as a component driven by `frame` (60 fps time base: use `t = frame / fps`), and make `Cover.tsx` render that hook world + the HTML headline overlay. Export the camera start pose as a constant (`export const COVER_CAMERA = { position: [...], target: [...], fov }`) in `Hook.tsx`.

## Read first
1. `F:/AUDIRA-SKILL-MOTION/SKILL.md` (skim) and `F:/AUDIRA-SKILL-MOTION/kits/<style>/KIT.md`.
2. Kit source in `studio/src/kits/<style>/` and its example (`example/*Example.tsx`). Reuse kit modules (camera, materials, scene parts) wherever possible.
3. Style memory: `F:/AUDIRA-ALL-SKILL/motion-memory/styles/<STYLE>.md` and `GLOBAL.md`. Apply every "wajib/fix/parameter terbaik", avoid every "failed/hindari".
4. Structural reference for a cover: `F:/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_ASAP_KARHUTLA_ISPA_2026/studio/src/scenes/ep03/Cover.tsx` (+ its `coverTextures.ts`). Pattern: ThreeCanvas + camera rig + `<Finish>` + canvas textures + HTML text overlay. Another ref for lights/Finish usage: `studio/src/scenes/craft/CraftDemo.tsx`.
5. Episode research: `<EP>/research/FACTS.md` (and series `RESEARCH_REPORT.md`). Screen text and numbers ONLY from those facts. Do not invent numbers.

## The character (mandatory)
Every episode shows the blocky R6-style game avatar from `studio/src/scenes/_shared/BlockAvatar.tsx` (do NOT edit it; other agents use it). It must have an active role in the frame (building, running, pointing, typing, cheering, falling, waving), clearly visible and readable at phone size, not tiny set dressing.
- `<BlockAvatar f={frame} pose="run|wave|jump|cheer|point|think|type|sit|stand" position rotation scale colors={{torso, legs, skin}} />`. Units: 1 = 1 stud, avatar ≈ 5.3 tall, origin between the feet, face toward +z. Arms pivot inside the shoulder (tested).
- Classic colours (yellow skin, blue torso, green legs) are the default; you may restyle colours to fit the kit's palette (e.g. neon emissive torso for ARCADECRT via `torsoEmissive`) as long as it still reads as the blocky avatar.
- No Roblox logo, no real game logos/screenshots, no real Roblox UI copied. Generic blocky world + our own UI is fine. The words "Roblox" and game names as plain text are fine.

## Files you may touch
- Only `studio/src/scenes/<epNN>/` (Cover.tsx, Hook.tsx, helper files there). `index.ts` must keep `export { Cover } from "./Cover.tsx";` (you may add more exports).
- Do NOT edit Root.tsx, kits, core, `_shared`, or other episodes (other agents work in parallel). If a kit module needs a change, copy it into your episode folder and change the copy.

## Technical rules
- `<Finish>` from `core/render/Finish.tsx` with the style's best params from memory, unless the kit/memory says the style is flat/without Finish.
- `core/polish/Polish.tsx`: RoundedBoxGeo instead of boxGeometry for hero objects, POLISH.* materials, `useSurfaceGrain` (seeded). Never Math.random (use seeded noise / `prng`).
- Text overlay: HTML layer, safe zone top 180 px, bottom 380 px (nothing important below y=1540). Headline 3–5 words in Indonesian, big, readable on a phone (min 26 px for any label @1080). Fonts that load in render (Remotion google-fonts or kit fonts).
- AUDIRA brand inside the 3D scene once (a sign, label, plaque, HUD tag, brick print), small and natural. No big watermark.
- Depth: BG / MG / FG layers, AO, contact shadows. Camera framing keeps the hero whole in 9:16.

## Render + check
```
cd studio
export RENDER_TMPDIR=F:/render-tmp
npx tsc --noEmit
node scripts/stills.mjs out/<epNN>-cover 9 Ep<NN>Cover        # iterate with this (frame 9 = 0.3 s)
```
Look at the PNG yourself (downscale to 540×960 with PIL first, then Read it). Score it honestly 1–5 on: lighting, material, depth, composition, readability, character (is the avatar active and readable?). Iterate until each is ≥4 by your own eye, max ~4 rounds.
When happy, write the official cover (writes `<EP>/style/cover-topic.png` + `cover.json`):
```
npm run cover -- Ep<NN>Cover --episode=../<EP folder> --at=0.3s --force
```
Never use Math.random/Date. Shader warnings X4122/X3577 in the log are harmless.

## Report back (short)
Path of cover-topic.png, the headline text, one paragraph of what is in the frame, the COVER_CAMERA values, your self-scores per aspect, and any known weakness. Do not record scores in style memory (the lead does that).
