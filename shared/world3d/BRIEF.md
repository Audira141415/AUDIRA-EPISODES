# World3D build brief (default 3D engine: Three.js world inside HyperFrames)

This is the pipeline behind AUDIRA's best-scoring films (CARA PEMBUATAN EP01 Pensil, EP03 Kaleng; EXPLAINED-COMPLET EP34-44). It is full 3D: a raw Three.js world (`world3d.js`) with its own shaders and post passes, drawn on a canvas inside a HyperFrames composition that carries the panels, karaoke captions, outro and signature. Do not switch a world3d episode to Remotion on your own.

**Not for these topics (hub rules 13 and 14, hard rules):** football / soccer series (rule 13: Remotion 4 + R3F, studio pattern `AUDIRA_SEJARAH_SEPAK_BOLA_2026`) and Islamic history / civilisation / QISSAH series (rule 14: Remotion 4 + R3F, pattern `AUDIRA_SEJARAH_ISLAM_2026`) never use world3d. Stop and use the Remotion pipeline instead, unless the user explicitly overrides (rule 13: an explicit request; rule 14: the user types "override rule 14"). News / EXPLAINED topics stay on world3d but follow rule 15 (see Hard rules).

Each film is 1080x1920, 30 fps while building (final renders at 60 fps), about 80-92 s. Narration timing comes from `project/timeline.json`; when the real voice replaces the estimate, everything keyed to words follows automatically.

## Folder layout (rule 08)
Working folder: `<EP>/project/`. Everything you write lives there, except the style deliverables.
- `project/script-lines.json`: write it first (see "Script"). Timing is automatic: when the locked VO exists (`audio/vo-words.json` from `audira_generate_voiceover`), `audira_episode_status get` builds `project/timeline.json` and `audio/VO_MASTER.wav` from it and reports `world3d.timeline.mismatches` (fix the spoken half of `{display|spoken}` until 0). Before any VO, run `python ../../_tools/estimate.py <EP_FOLDER>` from `project/` for an estimated timeline. Never hand-edit timeline.json.
- `project/build-video.mjs`, `project/world3d.js`, `project/mix.py` (+ optional helper modules): you write these.
- `project/hf/`: the HyperFrames project, scaffolded from `shared/world3d/hf` (`hyperframes.json`, `assets/lib/three*.js` + post passes, `assets/img/grain.png`, `assets/brand/stacked-reversed.svg`). build-video.mjs writes `hf/index.html` and `hf/compositions/*.html` and copies `../../_tools/lib3d.js` and your `world3d.js` into `hf/assets/lib/`.
- `project/beats.json` is written by shell.mjs writeWorld; mix.py reads it.
- `<EP>/audio/sfx/`: SFX library. `<EP>/audio/work/` for stems. audio_lib paths are `../audio/...` relative to `project/`; mix.wav goes to `hf/assets/audio/mix.wav`.
- Imports from `project/`: `../../_tools/hflib.mjs`, `../../_tools/shell.mjs`; in mix.py `sys.path.insert(0, "../../_tools")`. Call `writeCaptions(".", ...)` and `writeIndex(".", ...)` (they write into `./hf/`).
- Channel name, handle and series label on the outro and signature come from `<SERIES>/_tools/series.json` (`channel`, `handle`, `series`, `slug`). Override per call with `channel:`/`handle:`/`series:` in writeWorld if needed.
- No absolute paths in your files (rule 08). Do not reference another series folder from your files.

## Reference implementations (read before writing anything; read-only)
- `F:\AUDIRA-VIDEO-MOTION\AUDIRA_CARA_PEMBUATAN_2026\EP01_PENSIL\project` (SKETCHFORGE, blind jury 4.0): custom Sobel-outline + hatching post pass, clip-plane reveals, stations along +x.
- `F:\AUDIRA-VIDEO-MOTION\AUDIRA_CARA_PEMBUATAN_2026\EP03_KALENG_MINUMAN\project` (SATISFYFORGE).
- `F:\AUDIRA-VIDEO-MOTION\EXPLAINED-COMPLET\EP4*\project` (several styles, same tools).
Read one or two `build-video.mjs`, `world3d.js`, `mix.py` to copy the patterns. Do NOT reuse their look, story or geometry.
- Shared tools: `_tools/hflib.mjs` (word anchors, captions, index), `_tools/shell.mjs` (world composition, panel transitions, counters `.ct`, outro card, moving signature), `_tools/lib3d.js` (track() camera spline, stage(), avatar(), figure(), canvasTex, label, pts, envStrips), `_tools/audio_lib.py` (Mix class).
- Do NOT edit `_tools/` inside a series (other episodes share it). Put helpers in your own `project/` files. Improvements to the tools go to `F:\AUDIRA-VIDEO-MOTION\shared\world3d\_tools`.

## Build and check loop
Order (hub rules 07 and 12; MCP gates and hooks check it):
1. Before any scene code: `style/STYLE_DECISION.md` (approved style), `docs/SCRIPT.md`, and the rule 12 docs `docs/ART_DIRECTION.md` (one spatial concept: one world, not slides), `docs/STORYBOARD.md` (8 rows s1-s8, BG/MG/FG/HUD, camera, audio) and `docs/ASSET_MANIFEST.md`, approved by the user. The pipeline-guard hook blocks scene files until they exist.
2. Build and snapshot (below), then the draft contact sheet with `sheet.sh`.
3. `python ../../_tools/look.py` from `project/` writes `draft/look.json`; it must PASS (meanMotion >= 8, stillPct <= 5%, diversity >= 30, clipHi 0, crushLo <= 2%).
4. Self score, then a blind jury subagent (`F:\AUDIRA-SKILL-MOTION\qa\jury.md`) on the same sheet; record both with `audira_style_memory record_score` (jury: `judge: "jury"`). Pass = average >= 4.0 and no aspect below 3. A failed jury is fixed in the draft, never in the final.
5. Draft approval by the user, then the final once through `audira_render_batch`.

From `<EP>/project`: `node build-video.mjs && python mix.py`. Snapshots: `bash ../../_tools/snap.sh <EP_FOLDER> "1,6,15,..."` (comma list of seconds). It prints a contact-sheet path; open it with the Read tool. Check at least one frame per scene plus the outro, fix framing, re-check. Contact sheet for the draft gate: `bash ../../_tools/sheet.sh <EP_FOLDER>`. Never run render.sh or any MP4 render before the draft gate passes. The final goes only through `audira_render_batch` (project `<EP>/project/hf`, 60 fps, master + metadata); `render.sh` writes `draft/PREVIEW.mp4` only and `final.sh` only prepares (build, mix, SRT) and runs QC, it never renders. Temp stays on F: (`/f/hf-render-tmp`).

## Word anchors
`at("s3:pinball")` = start time of the first word "pinball" in scene s3 (display text, trailing punctuation stripped). `#2` picks the 2nd hit, `+0.4`/`-0.3` offsets. Words written `{display|spoken}` appear in timeline.json as display text. Anchor on clean words (tokens like `timing-nya` break the regex; use a neighbour). Every `data-at`/`data-in`/`data-out`/`data-a` value containing ":" is collected automatically; anchors used only inside world3d.js must be listed in `extraAt`, or that frame silently repeats the previous image. K has scene keys `s1..s8` (start), `s1e..` (end), `end`, `dur`, `outro`.
- Every camera key and time constant comes from K / AT (scene or word anchors), never absolute seconds: the real voice changes all timings.

## Hard rules (AUDIRA studio + earlier user feedback)
- Not a slideshow: continuous camera motion through one connected 3D world, multi-plane depth (world, panels, captions); every scene has a visual subject (object, diagram, figure, terrain, building), not just text.
- Build real models, not primitives: shape objects from several parts (lathe/extrude/tube with bevels, canvasTex surfaces, instanced detail), give every material a texture or shader treatment from the style, and write one style-specific post pass (outline, hatching, halftone, grade). A scene of plain boxes, cones and flat 7-point polygons fails the jury.
- Maps and geography: build terrain from height data drawn on a canvasTex (relief, coastlines, rivers as lines), not hand-typed polygons; pins and labels are 3D objects or shell panels, never DOM inside the canvas.
- Real people appear only as generic stylised figures or silhouettes with a text name plate. No likeness, no photos. Figures: head, shoulders wider than hips, bent elbows/knees, skin a different colour from clothes (never capsule + 4 sticks).
- No brand logos, real packaging or footage. The corner chip says "ILUSTRASI, BUKAN CUPLIKAN ASLI" (pass `chip:` to writeWorld for a topic-specific variant) and stays.
- News / EXPLAINED (rule 15): no real faces, no real organisation logos (name plates and text only), every number on screen matches `research/SOURCE_REGISTER.md`, default style DATAPHYSICAL, neutral visuals. HUD number chips (the big figure readouts) are at least 128 px tall; that is a different element from the small corner disclaimer `#chip` from shell.mjs, which stays as is.
- Safe zones: panels between y 236 and about 1180 px; captions at top 1300 px (bottom 380 px clear). Keep the 3D subject in the middle band, roughly 300-1250 px. Panels and counters must never overlap each other.
- 9:16 framing: at FOV 38 the visible width is about 0.39 x camera distance. First-pass cameras are always too close; back off. Subject at 55-70% of frame width. Light the subject up front (key + rim); dark styles tend to go murky.
- font-family must be a literal font name in CSS (never a CSS variable). Use Google font names; HyperFrames loads them.
- canvasTex(w,h,draw) without the repeat argument is clamp-to-edge; never set tex.repeat on it.
- InstancedMesh moved per frame needs `frustumCulled = false`.
- Three.js r186: with scene.environment set, material.envMapIntensity is ignored; set `scene.environmentIntensity`. One NaN pixel blows up through UnrealBloomPass into black blocks: guard shaders, add a NaN-zeroing ShaderPass before bloom.
- A scaleY/clip outro must also start hidden (opacity 0 or clipped), or a line shows during the whole film.
- Caption karaoke: word gap at least 0.4em, active-word bounce at most 1.04. With wide display fonts add `margin:0 .16em` to `.w`. Check a caption crop.
- Numbers and facts on screen match the script exactly; panels only use facts from the script. Indonesian on-screen text, short (panels support, the 3D world carries the scene).
- Frame 0 is the thumbnail: the first panel and the 3D subject are visible at t=0 (no empty panel, no black frame). Panels show all rows dimmed at entry and light each row on its word; a dimmed row keeps opacity at least 0.6 (rows at 30-60% scored readability 2 in the jury).
- Every value in world3d.js is a pure function of t (seek-safe, no accumulated state, no Math.random; use a seeded mulberry()).

## Script (write it first)
- Source of truth: the episode's `research/RESEARCH_REPORT.md` + `research/SOURCE_REGISTER.md`. Use only HIGH/MED facts; obey every item under "Mitos & jebakan". Never invent numbers.
- `project/script-lines.json` = JSON array of 8 objects `{"id":"s1".."s8","text":"..."}`: s1 hook (0-3 s), s2 context, s3-s5 main development, s6 the "why", s7 visual payoff (one striking number), s8 short close + "Ikuti {AUDIRA|Audira} ...".
- 190-210 spoken words (Cartesia runs ~140-150 WPM, target 80-90 s). Bahasa Indonesia bertutur, short sentences.
- Markup `{display|spoken}` for anything TTS may misread: numbers, units, symbols, foreign words, and AUDIRA always as `{AUDIRA|Audira}`. Punctuation inside both halves, never after the closing brace.
- Also write `docs/SCRIPT.md`: the 8 lines in display text with the 6-stage headings, spoken word count and the estimate at 135-150 WPM.

## Style
Read `audira_style_memory get <style>` first and apply every "wajib"/"parameter terbaik", avoid every "hindari". Then read `F:\AUDIRA-SKILL-MOTION\kits\<style>\KIT.md`, skim its `src/` for the look recipe (palette, materials, camera, typography, post), plus `kits/<style>/gold/INDEX.md` when present and the quality-bar cover. Translate that look into this Three.js + HyperFrames pipeline.

## Deliverables
1. `project/world3d.js`, `project/build-video.mjs`, `project/mix.py` (music bed with its own identity via numpy synthesis in audio_lib.Mix, SFX on scene changes and key words, ending with `M.finish(music)`).
2. `style/cover-topic.png`: 1080x1920 still of the strongest hook frame with the title panel readable (snapshot at two times, keep the later frame since web fonts may load late). Doubles as the thumbnail.
3. `draft/contact-sheet.jpg` from `sheet.sh`: 9 key frames (hook, mid s2-s8, outro), about 1200 px wide.
4. `draft/look.json` from `look.py` (PASS), plus the self and blind jury scores recorded in motion memory.
- Anti-reupload: pass `sig: "<EP folder name>"` to writeWorld, and put the word AUDIRA inside the 3D world at least once (label, sign, screen text, stamp).
- Outro card is handled by shell.mjs (pass `ep: "01"` etc.).
