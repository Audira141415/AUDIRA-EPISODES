# COVER BRIEF — AUDIRA_BERITA_VIRAL_10_NOV_2026 (topic covers, style gate part 2)

Series: `F:/AUDIRA-VIDEO-MOTION/AUDIRA_BERITA_VIRAL_10_NOV_2026`. Studio (Remotion + R3F, starter v4.3): `studio/` (node_modules is a junction to `_cache`, already installed; typecheck passes).

## Your job (one episode)
Build ONE topic cover still, 1080×1920, in the chosen style kit, showing this episode's news topic. It is the look-development frame and the thumbnail. No film, no MP4, no VO.

## Read first
1. `F:/AUDIRA-SKILL-MOTION/SKILL.md` (skim) and `F:/AUDIRA-SKILL-MOTION/kits/<style>/KIT.md`.
2. Kit source in `studio/src/kits/<style>/` and its example (`example/*Example.tsx`). Reuse kit modules (camera, materials, scene parts) wherever possible.
3. Style memory: `F:/AUDIRA-ALL-SKILL/motion-memory/styles/<STYLE>.md` and `GLOBAL.md`. Apply every "wajib/fix/parameter terbaik", avoid every "failed/hindari".
4. Structural reference for a cover: `F:/AUDIRA-VIDEO-MOTION/EXPLAINED/AUDIRA_ASAP_KARHUTLA_ISPA_2026/studio/src/scenes/ep03/Cover.tsx` (+ its `coverTextures.ts`). Same pattern: ThreeCanvas + CameraRig + `<Finish>` + canvas textures + HTML text overlay.
5. Episode research: `<EP>/research/RESEARCH_REPORT.md`. Screen text and numbers ONLY from HIGH rows there. Respect "JANGAN DIKLAIM".

## Files you may touch
- Only `studio/src/scenes/<epNN>/` (Cover.tsx + any helper files there). `index.ts` must keep `export { Cover } from "./Cover.tsx";`.
- Do NOT edit Root.tsx, kits, core, or other episodes (other agents work in parallel).

## Technical rules
- `<Finish>` from `core/render/Finish.tsx` with the style's best params from memory, unless the kit is listed "without Finish".
- `core/polish/Polish.tsx`: RoundedBoxGeo instead of boxGeometry for hero objects, POLISH.* materials, `useSurfaceGrain` (seeded). Never Math.random (use seeded noise).
- Text overlay: HTML layer, safe zone top 180 px, bottom 380 px (nothing important below y=1540). Headline 3–5 words, big, readable on a phone (min 26 px for any label @1080). Fonts that load in render (Remotion google-fonts or kit fonts).
- AUDIRA brand inside the scene once (a label/plaque/HUD tag), small and natural; plus a small "AUDIRA" credit is fine. No big watermark.
- Depth: BG / MG / FG layers, AO, contact shadows. Camera framing must keep the hero whole in 9:16.
- Real people: never photoreal or generated faces of real people. Use the kit's sketch/illustration language with name tags (name + role). No capsule-and-stick figures (use ToyPerson only if a generic figure is needed).

## Render + check
```
cd studio
RENDER_TMPDIR=F:/render-tmp npx tsc --noEmit
RENDER_TMPDIR=F:/render-tmp node scripts/stills.mjs out/<epNN>-cover 0 <EpNN>Cover
```
(Use frame 0, or 2 frames like `0,20` and keep the later one if fonts/textures were not ready.) Look at the PNG yourself (Read the image). Score it honestly against the rubric (lighting, material, depth, composition, readability; motion is n/a). Iterate until each is ≥4 by your own eye, max ~4 rounds. Then copy the final PNG to `<EP>/style/cover-topic.png`.

## Report back (short)
Path of cover-topic.png, one paragraph of what is in the frame, your self-scores per aspect, and any known weakness. Do not record scores in style memory (the lead does that).
