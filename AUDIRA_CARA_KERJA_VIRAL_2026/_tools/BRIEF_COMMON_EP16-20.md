# Common build brief: CARA KERJA VIRAL EP16–EP20 (script + built film + topic cover, no MP4)

Series root: `F:\AUDIRA-VIDEO-MOTION\AUDIRA_CARA_KERJA_VIRAL_2026`. Bash paths: `/f/AUDIRA-VIDEO-MOTION/AUDIRA_CARA_KERJA_VIRAL_2026`.
Each film is 1080x1920, about 80–92 s, built with HyperFrames (HTML + GSAP) over a Three.js world. No voice yet: this is a silent build on an ESTIMATED timeline for the cover + script approval gate. Later the real Cartesia voice replaces the timeline and everything keyed to words follows automatically.

Your episode folder is already scaffolded: `PROJECT/hyperframes/` (hyperframes.json, assets/lib three + postprocessing, assets/brand, assets/img/grain.png), `AUDIO/SFX/`, `AUDIO/work/`, `style/cover-reference.*`, `style/STYLE_DECISION.md`, `STATUS.json`. Do not touch STATUS.json.

## Step 1: write the script (`script-lines.json`)
Source of truth: your episode's research file in `_research/` (read it fully, especially "Verified facts", the myths/traps section and open questions). Use only HIGH/MED facts; never a LOW or unverified one; never a number that is not in the research file.
- Format: a JSON array of 8 objects `{"id":"s1".."s8","text":"..."}`, same as `EP05_PAYUNG_RAKSASA_NABAWI/script-lines.json` and `EP10_COMBINE_HARVESTER/script-lines.json` (read both).
- Six-stage structure over 8 scenes: s1 hook (0–3 s, one or two short punchy sentences that create a question), s2 context (the news this week, with date), s3–s5 main development (the mechanism step by step), s6 explanation (the surprising "why"), s7 visual payoff, s8 outro (one-line resolution, then exactly: "Ikuti {AUDIRA|Audira} untuk cara kerja berikutnya.").
- Length: 190–210 spoken words total (Galang reads ~137–147 WPM, so ≈ 80–92 s). Count spoken words (the right half of `{display|spoken}` markup).
- Bahasa Indonesia yang mengalir dan bertutur, kalimat pendek, PUEBI. No filler, no "tahukah kamu".
- Every number is written out in words in the text (the TTS reads digits badly): "lima ratus tiga koma satu tujuh", "tiga puluh tujuh koma lima kilohertz". If the caption should show digits, use markup `{503,17|lima ratus tiga koma satu tujuh}`; punctuation goes inside BOTH halves: `{2026,|dua ribu dua puluh enam,}`.
- English names/acronyms the TTS would misread get phonetic spoken halves: `{FDR|ef de er}`, `{LiDAR|lai dar}`, `{Yangwang|yang wang}`. Never put AUDIRA in capitals in the spoken half (it gets spelled out): `{AUDIRA|Audira}`.
- Respect every trap listed in `_research/RISET_LANJUTAN_EP16-20.md` for your episode.
- Then run from your episode folder: `python ../_tools/est-timeline.py` (writes `timeline.json`). It prints estimated speech seconds and word count; adjust the script until speech is 80–90 s.

## Step 2: build the film (reference implementation: read before writing)
- Closest examples in this series (newest, best): `EP14_MOBIL_LISTRIK_500/`, `EP12_GO_AROUND_ANGIN/` and `EP15_DBS_PACU_OTAK/` (`build-video.mjs`, `world3d.js`, `mix.py`), which already use `sig`, `chip`, `panelTop: 262`, RoomEnvironment reflections, bloom and their own caption grouper (no lone words). Do NOT reuse their look.
- `RoomEnvironment.js` is already in `PROJECT/hyperframes/assets/lib/`; `SUBTITLES/` already exists.
- Shared tools: `_tools/hflib.mjs` (loadTimeline, anchors, writeCaptions, writeIndex), `_tools/shell.mjs` (writeWorld: panels, transitions, counters `.ct`, outro card), `_tools/lib3d.js` (track() camera spline, stage(), canvasTex, label, pts), `_tools/audio_lib.py` + `_tools/sound_extra.py` (Mix class, drone, swell…).
- Do NOT edit anything in `_tools/` (other episodes build in parallel). Put helpers in your own `world3d.js`.
- Deliver in the episode folder:
  1. `world3d.js`: `export function create(canvas, K, AT)` returning `(t) => { ... }`. Every value is a pure function of t (seek-safe, no accumulated state, no Math.random; use a seeded mulberry()). Import from `./three.module.js` and `./lib3d.js` like EP05.
  2. `build-video.mjs`: panels HTML + css, `writeWorld(TL, at, {...})` with: `ep: "11"` (etc.), `sig: "<EPISODE_FOLDER_NAME>"` (moving AUDIRA signature), `chip: "ILUSTRASI"` (or "ILUSTRASI, BUKAN REKAMAN ASLI" when the scene recreates a real event), `panelTop: 262`, your own `panelIn`/`panelOut` transitions unique to this episode, captions css + active-word tween, `writeIndex`. Copies `../_tools/lib3d.js` and `world3d.js` into `PROJECT/hyperframes/assets/lib/` like EP05.
  3. `mix.py`: music bed with its own identity (numpy synthesis via audio_lib.Mix) + SFX on scene changes and key words, ending like EP05's mix.py. Library SFX in `AUDIO/SFX/`.
- Build loop from the episode folder: `node build-video.mjs && python mix.py`. Snapshots: `bash ../_tools/snap.sh <EP_FOLDER> "1,6,15,..."` (comma list of seconds); it prints a contact-sheet path; open that PNG with the Read tool and look at it. Check at least one frame per scene plus the outro, fix, re-check. NEVER run render.sh, draft.sh, final.sh or any MP4 render. TEMP stays on F: (snap.sh does it).

## Style (fixed per episode, approved by the user)
Read `F:\AUDIRA-SKILL-MOTION\kits\<style-lowercase>\KIT.md` and skim its `src/` for the look recipe (palette, materials, lighting, camera, typography), plus `style/cover-reference.*`. Translate that look into this HyperFrames + Three.js pipeline; do not switch to Remotion. Apply the style memory notes given in your episode brief. Post-processing: use EffectComposer + UnrealBloomPass from assets/lib like EP01 when glow is needed; a ShaderPass must be given a `THREE.ShaderMaterial` (passing `{uniforms}` clones them and per-frame values never arrive). Hard-surface objects need bevels/rounded edges (no raw boxes); metals need an environment map (PMREM from a RoomEnvironment) so they reflect.

## Lessons from EP11–EP15 (must apply)
- A single NaN pixel (light-beam shader, aoMap, zero-length normal, division by zero in a shader) is spread by UnrealBloomPass into black blocks or full black frames. Avoid the cause, and add a ShaderPass (with a `THREE.ShaderMaterial`) that zeroes NaN/Inf before bloom. Check a still in every scene.
- The timeline is estimated now and will change after the voice: express every camera key and time constant through scene/word anchors (K.sN, AT[...]), never raw seconds.
- The shared caption grouper can leave single-word lines: write your own grouper in build-video.mjs (≤4 words, ~26 characters per line, balanced, no lone word), like EP12.
- Counters snapshot mid-count look like wrong numbers on the contact sheet: take sheet frames after counters finish.

## Word anchors
`at("s3:pinger")` = start time of the first word "pinger" in scene s3 (display text, trailing punctuation stripped). `#2` picks the 2nd hit, `+0.4`/`-0.3` offsets. Anchor on clean words (a token like `Mi-17V5` or `angin-nya` breaks the regex; use a neighbour). Every `data-at`/`data-in`/`data-out`/`data-a` value containing ":" is collected automatically; anchors used only inside world3d.js must be listed in `extraAt`. K has scene keys `s1..s8` (start), `s1e..` (end), `end`, `dur`, `outro`.

## Hard rules (AUDIRA studio + earlier user feedback)
- Not a slideshow: continuous, motivated camera motion through one connected 3D world; multi-plane depth (world, panels, captions); every scene has a visual subject (object, mechanism, diagram), not just text. Explainers need real 3D objects and illustrations, not text cards.
- People, when needed, are proper generic figures (head with face, shoulders wider than hips, bent elbows/knees, skin a different colour from clothes), never a capsule + 4 sticks. No real person's likeness, no brand logos (draw a generic car/aircraft, no Yangwang/BYD/Singapore Airlines/Medtronic logos or liveries).
- Accident content (EP18): mourning tone, no crash imagery, no victim names, no blame; generic trains without operator liveries.
- Safe zones: panels live between y 262 and about 1180 px; captions sit at top ~1290 px; the bottom 380 px stays clear. Keep important 3D subjects in the band ~300–1250 px.
- 9:16 framing: at FOV 38 the visible width is about 0.39 × camera distance. First-pass cameras are always too close; back off.
- font-family must be a literal font name in CSS (never a CSS variable). Google font names only.
- canvasTex(w,h,draw) without the repeat argument is clamp-to-edge; never set tex.repeat on it.
- InstancedMesh: set colours (setColorAt) when building, before the first draw; `frustumCulled = false` when moved per frame.
- Caption word spans are inline-block; with wide display fonts add `margin:0 .16em` to `.w` or spaces vanish. Caption lines ≤ 4 words on one line, longer phrases split into two balanced lines; never a lone word.
- Frame 0 is the thumbnail: the first panel and the 3D subject must already be visible at t=0.
- Numbers on screen must match the script exactly. Facts on panels only from the script text. Indonesian on-screen text, short.
- Anti-reupload: `sig` option (above) AND the word AUDIRA visible inside the 3D world at least once (label, plate, screen text, stamp).
- When editing HTML strings that contain `&`, use the Write/Edit tools or Python, not sed.
- `cat > file` without a heredoc hangs Bash. Use the Write tool for files.

## Deliverables for the gate
1. `script-lines.json` + `timeline.json` (estimated).
2. The built film (world3d.js, build-video.mjs, mix.py; `PROJECT/hyperframes/compositions/*`, `AUDIO/work/` mix).
3. `style/cover-topic.png`: a 1080×1920 still of the strongest hook frame (near the s1 key moment) showing this topic in this style with the title panel readable. Copy the frame image out of `PROJECT/hyperframes/.hyperframes/artifacts/snapshots/...` (find the newest folder). It doubles as the thumbnail.
4. `style/draft-contact-sheet.jpg`: 8 key frames (hook, s2–s7 key moments, s8/outro) in one sheet about 1200 px wide (use Python PIL or ffmpeg tile on the snapshot PNGs).
5. Self-score honestly against the 6-aspect rubric (lighting, material, depth, composition, motion, readability; 1–5, compared to the style cover). If the average is < 4 or any aspect < 3, polish and re-check before reporting.

## Report back (short)
The script text (all 8 lines as plain text), spoken word count and estimated seconds, the look you built and how each scene is staged, the 6 self-scores, the contact-sheet path, and anything still weak or unverified.
