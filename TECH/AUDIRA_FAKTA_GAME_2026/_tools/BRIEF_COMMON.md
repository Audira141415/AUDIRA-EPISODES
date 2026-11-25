# Common build brief: FAKTA GAME DUNIA (5 silent drafts)

Series root: `F:\AUDIRA-VIDEO-MOTION\TECH\AUDIRA_FAKTA_GAME_2026`. Bash paths: `/f/AUDIRA-VIDEO-MOTION/TECH/AUDIRA_FAKTA_GAME_2026`.
Each film is 1080x1920, 30 fps, about 85-98 s, built with HyperFrames (HTML + GSAP) over a Three.js world. No voice yet: this is a silent draft (music + SFX only) for script review. Narration timing comes from `timeline.json` (estimated per word); later the real voice replaces it and everything keyed to words follows automatically.

## Reference implementation (read before writing anything)
A finished series uses the same pipeline. Read these to copy the patterns:
- `F:\AUDIRA-VIDEO-MOTION\TECH\AUDIRA_AI_GAME_2026\EP01_BUILD_HP\build-video.mjs`, `world3d.js`, `mix.py` (the closest example: HTML panels + Three.js world + numpy sound).
- Other episodes in `AUDIRA_AI_GAME_2026\EP02_MOBIL_4D` .. `EP05_TOP_20` and `AUDIRA_ROBLOX_FAKTA_2026\EP01_SUARA_OOF` .. `EP05_TIX` show other looks; skim one for variety but do NOT reuse their look.
- Shared tools in this series: `_tools/hflib.mjs` (word anchors, captions, index), `_tools/shell.mjs` (world composition, panel transitions, counters `.ct`, outro card), `_tools/lib3d.js` (track() camera spline, stage(), avatar() classic blocky R6 character with runPose/restPose, canvasTex, label, pts), `_tools/audio_lib.py` (Mix class).
- Do NOT edit anything in `_tools/` (other episodes are being built in parallel and share it). If you need a helper, put it in your own `world3d.js`.
- Do NOT edit `script-lines.json` or `timeline.json`.

## What you deliver in your episode folder
1. `world3d.js`: `export function create(canvas, K, AT)` returning `(t) => { ... comp.render(); }`. Every value is a pure function of t (seek-safe, no accumulated state, no Math.random; use mulberry()). Imports from `./three.module.js` and `./lib3d.js` exactly like the reference.
2. `build-video.mjs`: panels HTML + css, writeWorld(...) options (panelIn/panelOut transition unique to this episode, outroIn), captions css + active word tween, writeIndex. Copies `../_tools/lib3d.js` and `world3d.js` into `PROJECT/HyperFrames_Remotion/assets/lib/` like the reference.
3. `mix.py`: music bed with its own identity for this theme (numpy synthesis via audio_lib.Mix) plus SFX on scene changes and key words, ending with `M.finish(music)`. Library SFX available in `AUDIO/sfx/` (chime, click-soft, click, error, glitch-1..3, impact-bass-1, ping, pop, riser, sparkle, typing, whoosh-cinematic, whoosh-short, whoosh). Run `mkdir -p AUDIO/work` first.

## Build and check loop
From the episode folder: `node build-video.mjs && python mix.py`. Then snapshots: `bash ../_tools/snap.sh <EP_FOLDER> "1,6,15,..."` (comma list of seconds). It prints a contact-sheet path; open that PNG with the Read tool and look at it. Check at least one frame per scene plus the outro, fix framing, re-check. Do not run a full render (`render.sh`); the lead renders all five in sequence afterwards. Keep TEMP on F: (snap.sh already does).

## Word anchors
`at("s3:Messiah")` = start time of the first word "Messiah" in scene s3 (display text, trailing punctuation stripped). `#2` picks the 2nd hit, `+0.4`/`-0.3` offsets. Words written `{display|spoken}` in script-lines appear in timeline.json as display text. Anchor on clean words (a token like `Car-5` or `hacker-nya` breaks the regex; use a neighbour). Every `data-at`/`data-in`/`data-out`/`data-a` value containing ":" is collected automatically; anchors used only inside world3d.js must be listed in `extraAt`. K has scene keys `s1..sN` (start), `s1e..` (end), `end`, `dur`, `outro`.

## Hard rules (from the AUDIRA studio and earlier user feedback)
- Not a slideshow: continuous camera motion through one connected 3D world, multi-plane depth (world, panels, captions), every scene has a visual subject (object, diagram, character), not just text.
- A character must appear with an active role in most scenes (the episode brief says which: e.g. an original adventurer, pixel figure, or blocky avatar via lib3d avatar(), restyled to the theme). Game creatures are drawn as your own stylised illustration of the concept, never a ripped sprite, model, logo or screenshot.
- No game logos, screenshots, real UI, ripped assets or real people's likeness (people appear as text name plates or generic figures). Illustrations only; the corner chip says "ILUSTRASI, BUKAN CUPLIKAN GAME" (default) and stays.
- Safe zones: panels live between y 236 and about 1180 px; captions sit at top 1300 px (bottom 380 px stays clear). Keep important 3D subjects in the middle band, roughly 300-1250 px.
- 9:16 framing: at FOV 38 the visible width is about 0.39 x camera distance. First-pass cameras are always too close; back off. Put a standing subject's feet at 65-75% of frame height.
- font-family must be a literal font name in CSS (never a CSS variable). Use Google font names; HyperFrames loads them.
- canvasTex(w,h,draw) without the repeat argument is clamp-to-edge; never set tex.repeat on it.
- InstancedMesh moved per frame needs `frustumCulled = false`.
- A scaleY/clip outro must also start hidden (opacity 0 or clipped), or a line shows during the whole film.
- `cat > file` without a heredoc hangs Bash. Use the Write tool for files.
- Numbers on screen must match the script exactly. Facts on panels only from the script text.
- Indonesian on-screen text, short (panels are support, the 3D world carries the scene).

## Report back
Short summary: the look you built, how each scene is staged, the contact-sheet paths you checked, anything still weak or not verified.
- Frame 0 is the thumbnail: the first panel and the 3D subject must already be visible at t=0 (no empty typewriter panel, no black frame).
- Caption word spans are inline-block; with wide display fonts add `margin:0 .16em` to `.w` or the spaces vanish. Check a caption frame.
- Before writing, read this episode's script-lines.json fully; every on-screen number must appear in the script.
