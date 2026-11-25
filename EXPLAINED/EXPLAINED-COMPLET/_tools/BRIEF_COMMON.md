# Common build brief: CARA KERJA BENDA (topic cover + built film, no MP4)

Series root: `F:\AUDIRA-VIDEO-MOTION\EXPLAINED_CARA_KERJA_BENDA_2026`. Bash paths: `/f/AUDIRA-VIDEO-MOTION/EXPLAINED_CARA_KERJA_BENDA_2026`.
Each film is 1080x1920, 30 fps for building (final is rendered later at 60 fps), about 80-92 s, built with HyperFrames (HTML + GSAP) over a Three.js world. No voice yet: this is a silent draft (music + SFX only) for the cover + script gate. Narration timing comes from `project/timeline.json` (estimated per word); later the real voice replaces it and everything keyed to words follows automatically.

## Folder layout (rule 08; this differs from older series)
Your working folder is `<EP>/project/`. Everything you write lives there, except the two style deliverables.
- `project/script-lines.json`, `project/timeline.json`: given. Do NOT edit.
- `project/build-video.mjs`, `project/world3d.js`, `project/mix.py` (+ optional helper modules like `gsched.js`): you write these.
- `project/hf/`: the HyperFrames project (already has `hyperframes.json`, `assets/lib/three*.js` + postprocessing passes, `assets/img/grain.png`, `assets/brand/stacked-reversed.svg`). build-video.mjs writes `hf/index.html` and `hf/compositions/*.html` and copies `../../_tools/lib3d.js` and your `world3d.js` into `hf/assets/lib/`.
- `project/beats.json` is written by shell.mjs writeWorld; mix.py reads it.
- `<EP>/audio/sfx/`: SFX library (chime, click-soft, click, error, glitch-1..3, impact-bass-1, ping, pop, riser, sparkle, typing, whoosh-cinematic, whoosh-short, whoosh). `<EP>/audio/work/` exists for stems. audio_lib paths are already `../audio/...` relative to `project/`; mix.wav goes to `hf/assets/audio/mix.wav`.
- Imports from `project/`: `../../_tools/hflib.mjs`, `../../_tools/shell.mjs`; in mix.py `sys.path.insert(0, "../../_tools")`. Call `writeCaptions(".", ...)` and `writeIndex(".", ...)` (they write into `./hf/`).
- No absolute paths in your files (rule 08). Do not reference any other series folder from your files.

## Reference implementation (read before writing anything; same layout)
`F:\AUDIRA-VIDEO-MOTION\TECH\AUDIRA_SEJARAH_GAME_2026\EP0*\project\` uses exactly these tools and this layout (`build-video.mjs`, `world3d.js`, `mix.py`). Read one or two to copy the patterns (imports, writeWorld options, captions, mix), and do NOT reuse their look. Read-only: never write into that folder.
- Shared tools in this series: `_tools/hflib.mjs` (word anchors, captions, index), `_tools/shell.mjs` (world composition, panel transitions, counters `.ct`, outro card, moving signature with the channel handle @AudiraExplained), `_tools/lib3d.js` (track() camera spline, stage(), avatar(), canvasTex, label, pts; box()/cyl() only add to the scene when a parent is passed), `_tools/audio_lib.py` (Mix class).
- Do NOT edit anything in `_tools/` (other episodes are being built in parallel and share it). Put helpers in your own `project/` files.

## Build and check loop
From `<EP>/project`: `node build-video.mjs && python mix.py`. Snapshots: `bash ../../_tools/snap.sh <EP_FOLDER> "1,6,15,..."` (comma list of seconds). It prints a contact-sheet path; open that image with the Read tool and look at it. Check at least one frame per scene plus the outro, fix framing, re-check. Never run render.sh or any MP4 render. snap.sh keeps TEMP on F:.

## Word anchors
`at("s3:pinball")` = start time of the first word "pinball" in scene s3 (display text, trailing punctuation stripped). `#2` picks the 2nd hit, `+0.4`/`-0.3` offsets. Words written `{display|spoken}` appear in timeline.json as display text. Anchor on clean words (tokens like `timing-nya` or `Boy-nya` break the regex; use a neighbour). Every `data-at`/`data-in`/`data-out`/`data-a` value containing ":" is collected automatically; anchors used only inside world3d.js must be listed in `extraAt`, or that frame silently repeats the previous image. K has scene keys `s1..s8` (start), `s1e..` (end), `end`, `dur`, `outro`.
- Every camera key and time constant must come from K / AT (scene or word anchors), never absolute seconds: the real voice will change all timings.

## Hard rules (AUDIRA studio + earlier user feedback)
- Not a slideshow: continuous camera motion through one connected 3D world, multi-plane depth (world, panels, captions), every scene has a visual subject (object, diagram, figure), not just text.
- Explainer videos need real visuals (3D objects, illustrated machines, figures), not text cards.
- Explain the mechanism visually: every scene shows the object working (cutaway, moving parts, flow of heat/waves, pins). Not text cards.
- Real people (Percy Spencer, William Cullen, Linus Yale, Elisha Otis, Yoshitada Minami, Fumiko) appear only as generic stylised figures or silhouettes with a text name plate. No likeness, no photos.
- Generic products only: no brand logos or recognisable product designs (no Raytheon/Toshiba/Mitsubishi/Otis/Yale logos on objects; write company names only as plain text on panels). Human figures must read as people (head, neck, shoulders wider than waist, bent elbows and knees), never a capsule with four sticks. The corner chip says "ILUSTRASI, BUKAN CUPLIKAN ASLI" (default) and stays.
- Safe zones: panels live between y 236 and about 1180 px; captions sit at top 1300 px (bottom 380 px stays clear). Keep important 3D subjects in the middle band, roughly 300-1250 px.
- 9:16 framing: at FOV 38 the visible width is about 0.39 x camera distance. First-pass cameras are always too close; back off. Subject at 55-70% of frame width; a standing figure's feet at 65-75% of frame height. Light the subject up front (key + rim); dark styles tend to go murky.
- font-family must be a literal font name in CSS (never a CSS variable). Use Google font names; HyperFrames loads them.
- canvasTex(w,h,draw) without the repeat argument is clamp-to-edge; never set tex.repeat on it.
- InstancedMesh moved per frame needs `frustumCulled = false`.
- Three.js r186: with scene.environment set, material.envMapIntensity is ignored; set `scene.environmentIntensity` to the style's value. One NaN pixel blows up through UnrealBloomPass into black blocks: guard shaders, add a NaN-zeroing ShaderPass before bloom.
- A scaleY/clip outro must also start hidden (opacity 0 or clipped), or a line shows during the whole film.
- Caption karaoke: word gap at least 0.4em, active-word bounce at most 1.04. With wide display fonts add `margin:0 .16em` to `.w`. Check a caption crop.
- `cat > file` without a heredoc hangs Bash. Use the Write tool for files.
- Numbers and facts on screen must match the script exactly (counters show the final scripted value dimmed, then light on the word; never count through in-between numbers); panels only use facts from the script text. Indonesian on-screen text, short (panels support, the 3D world carries the scene).
- Frame 0 is the thumbnail: the first panel and the 3D subject must already be visible at t=0 (no empty typewriter panel, no black frame). Panels show all rows dimmed at entry and light each row on its word, so no panel sits empty.
- Every value in world3d.js is a pure function of t (seek-safe, no accumulated state, no Math.random; use a seeded mulberry()).

## Style
The style is fixed per episode (see the episode brief). Read `F:\AUDIRA-SKILL-MOTION\kits\<style>\KIT.md` and skim its `src/` for the look recipe (palette, materials, camera, typography), plus the quality-bar cover in `<EP>\style\cover-reference.*`. Apply the motion-memory notes in the episode brief. Translate that look into this HyperFrames + Three.js pipeline; do not switch to Remotion.

- After the voice is locked later, every scene mid-frame must still have a lit subject; avoid long empty camera transits (keep moves between stations short).

## Deliverables
1. `project/world3d.js`, `project/build-video.mjs`, `project/mix.py` (music bed with its own identity for this theme via numpy synthesis in audio_lib.Mix, SFX on scene changes and key words, ending with `M.finish(music)`).
2. `style/cover-topic.png`: a 1080x1920 still of the strongest hook frame (near the s1 key moment) that shows this topic in this style with the title panel readable. Copy the frame image out of `project/hf/.hyperframes/artifacts/snapshots/...`. Snapshot at two times (e.g. "0.6,3.8") and keep the later frame, since web fonts may not be loaded in the first. It doubles as the thumbnail. Read the PNG before reporting.
3. `draft/contact-sheet.jpg`: 8 key frames (hook, s2-s7, s8) in one sheet about 1200 px wide.
- Anti-reupload: pass `sig: "<EP folder name>"` to writeWorld (moving AUDIRA signature), and put the word AUDIRA inside the 3D world at least once (a label, sign, screen text, stamp).
- The last scene ends with "Ikuti AUDIRA untuk cara kerja benda berikutnya." The outro card is handled by shell.mjs (pass `ep: "01"` etc.).
- Do NOT render any MP4. Snapshots only.

## Report back
Short summary: the look you built, how each scene is staged, the contact-sheet paths you checked, anything still weak or not verified.
