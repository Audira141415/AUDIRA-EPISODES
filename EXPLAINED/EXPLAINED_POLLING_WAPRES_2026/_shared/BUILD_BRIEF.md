# BUILD BRIEF — Polling Wapres 2026 (3 short, DATAPHYSICAL, world3d)

Seri: `F:\AUDIRA-VIDEO-MOTION\EXPLAINED_POLLING_WAPRES_2026` (channel AUDIRA Explained, @AudiraExplained). Gaya DATAPHYSICAL, engine world3d (Three.js world inside HyperFrames). Style, script, ART_DIRECTION and STORYBOARD are already approved by the user. Your job: build ONE episode's **silent draft** (no voice yet).

## Read first (in this order)
1. `_tools/BRIEF_WORLD3D.md` — the pipeline contract. Obey every hard rule in it.
2. Your episode: `docs/ART_DIRECTION.md`, `docs/STORYBOARD.md`, `docs/ASSET_MANIFEST.md`, `docs/SCRIPT.md`, `project/script-lines.json`. The world, palette, fonts, camera and per-scene beats are already decided there. Follow them. Do not change the script text.
3. `F:\AUDIRA-SKILL-MOTION\kits\dataphysical\KIT.md` (look recipe only).
4. One reference implementation, read-only: `F:\AUDIRA-VIDEO-MOTION\AUDIRA_CARA_PEMBUATAN_2026\EP01_PENSIL\project\` (`build-video.mjs`, `world3d.js`, `mix.py`). Copy patterns, not its look.
5. `_research/SOURCE_REGISTER.md` — on-screen numbers must match the script exactly.

## DATAPHYSICAL memory (mandatory, from audira_style_memory)
- Post in world3d.js: ONE clean grade pass (S-curve 0.15, vignette 0.06, grain 0.004, no chromatic aberration), sharp specular, minimal bloom, NaN-guard ShaderPass BEFORE UnrealBloom. `stage({exp: 1})`, `scene.environmentIntensity = 0.55`. No AO in world3d: separate objects with shadowMap, contact shadows, fog.
- Aluminium reads best at metalness ~0.18 + slight emissive on the hero column (0.88 metalness went murky). Brass metalness 0.85 roughness 0.24.
- Depth was capped at 3 in past films because the studio was one level with a dark void. Build the environment from the start: lit reflective floor, a BG row of blurred columns or a wall with light, FG props. No black lower third.
- The data object is the subject of every frame. Repeat each beat's key number as a large HUD chip (~128 px at 1080) in the panel; in-scene brass plaques are too small on a phone.
- Caption band (y 1290–1540) must sit over empty base/floor, never over data. Every column and its label stays inside a 60 px side margin. Max 2 floating 3D labels per frame.
- No real faces/figures for real people: name plates only. No party/institution logos.

## Known traps (workspace memory)
- font-family must be a literal font name in CSS, never a CSS variable. Flex can eat spaces in tickers.
- One NaN pixel + UnrealBloom = black blocks. Guard shaders.
- Three r186: set `scene.environmentIntensity`, material envMapIntensity is ignored.
- Every value in world3d.js is a pure function of t (seeded mulberry, no Math.random, no accumulated state).
- Anchors used only inside world3d.js go in `extraAt`, or frames silently repeat.
- Temp must stay on F: (C: is full): `export TEMP=/f/hf-render-tmp TMP=/f/hf-render-tmp` before snap/sheet/look.

## Steps (from `<EP>/project/`, Git Bash)
1. `python ../../_tools/estimate.py <EP_FOLDER>` → estimated `timeline.json` (never hand-edit it).
2. Write `world3d.js`, `build-video.mjs`, `mix.py`. Pass `sig: "<EP folder name>"`, `ep: "01"|"02"|"03"`, and a topic chip to writeWorld. Put the word AUDIRA inside the 3D world once.
3. `node build-video.mjs && python mix.py`.
4. `bash ../../_tools/snap.sh <EP_FOLDER> "1,6,...,outro"` — at least one frame per scene + outro. Open the sheet with Read. Fix framing, readability, empty frames. Repeat until every frame is clean.
5. `style/cover-topic.png`: 1080x1920 hook frame, snapshot at two times, keep the later one.
6. `bash ../../_tools/sheet.sh <EP_FOLDER>` → `draft/contact-sheet.jpg`.
7. `python ../../_tools/look.py` → `draft/look.json`. Thresholds: meanMotion ≥ 8, stillPct ≤ 5%, diversity ≥ 30, clipHi 0, crushLo ≤ 2%. Fix and rerun until PASS.
8. Self-score with `audira_style_memory` action `record_score` (style DATAPHYSICAL, stage draft, judge self, episode `polling-wapres-EP0N`, episodeDir, evidence per aspect ≥ 4). Be honest; past self-scores ran ~0.4 above the blind jury.

## Do NOT
- Do not run render.sh, final.sh, any MP4 render, VO, or Cartesia.
- Do not edit `_tools/`, other episodes, or files outside your episode folder (except reading).
- Do not change the script, docs, or research.
- Do not commit.

## Report (under 200 words)
Paths of cover-topic.png, contact-sheet.jpg, look.json; look metrics (PASS/FAIL each); self-score per aspect; known weaknesses left.
