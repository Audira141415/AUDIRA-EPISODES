# Common brief for batch 3 builders (EP11–EP15)

You build ONE episode of the AUDIRA series "Fakta Sejarah Negara" as a HyperFrames + Three.js film. No voiceover exists yet.

## Setup
- Root: `F:\AUDIRA-VIDEO-MOTION\FAKTADUNIA\AUDIRA_SEJARAH_NEGARA_2026`. Windows; the Bash tool is Git Bash (`/f/AUDIRA-VIDEO-MOTION/...`).
- Write only inside your episode folder. Do not edit `_tools`, `script-lines.json`, `timeline.json` or other episodes. Four other agents are working in parallel.
- Never run `_tools/estimate.py` or `_tools/write-scripts.py` without episode arguments.
- Already in place: `script-lines.json` (s1..s8, `{display|spoken}` markup), estimated `timeline.json`, `AUDIO/sfx`, brand assets, three.js libs, `style/STYLE_DECISION.md`, `style/cover-reference.*`.
- Facts: `_research/FACTS.md`, section for your episode. Every on-screen number must match it.

## Style kit
Read `F:\AUDIRA-SKILL-MOTION\kits\<style>\KIT.md` (lowercase folder name) for the look recipe: palette, materials, camera, lighting, do/don't. Translate it into this Three.js + HTML pipeline. The kit's Remotion starter code is reference only; do not switch engines.

## Pipeline (copy the pattern)
- Reference implementations, same pipeline and finished: EP02_PERANG_EMU_AUSTRALIA, EP06_SAMOA_HAPUS_SATU_HARI, EP08_PULAU_HANS_PERANG_WISKI, EP10_VATIKAN_GARDA_SWISS. Read their `build-video.mjs`, `world3d.js` and `mix.py`, plus `_tools/shell.mjs`, `hflib.mjs`, `lib3d.js` and `audio_lib.py`.
- `build-video.mjs` writes HTML panels (`data-in`, `data-out`, `data-at` word anchors such as `"s5:Breda"`; anchors have no trailing punctuation; a repeated word needs `#2`). It calls `writeWorld`, `writeCaptions` and `writeIndex`.
- `world3d.js` exports `create(canvas, K, AT)`, which returns `draw(t)`. It must be deterministic by `t`.
- `mix.py` builds music and SFX with `audio_lib`. The voice is mixed in later.
- The outro card (AUDIRA logo, Created by Agus Dwi R.) is added automatically. Keep it.
- Maps: `python _tools/geo.py <out.js> lon0 lat0 lon1 lat1 [--simplify x]` (Natural Earth 50m).
- Key everything to word anchors. The real voice replaces `timeline.json` later and everything re-times.

## Lessons from batches 1–2 (do not repeat)
- Cards size to their visible content. No reserved blank rows; a row takes no space until its word arrives.
- Never show empty space or void for more than 1 s between stations. Cut under the panel transition, or ease ≥2.3 s through a high midpoint. Use your own non-overshooting camera curve.
- Tame bloom and hot lights. Caption groups fade or rise in, never clip-wipe.
- Keep 3D labels off the panels.
- Text never in the top 180 px or bottom 380 px, except captions (~1290–1540 px). Panels sit within x 56..970.
- Write font-family literally, never through CSS variables.
- Framing: at FOV 38, visible width ≈ 0.39 × distance; first cameras are usually too close. Subjects should be big and readable.
- People are name tags plus simple silhouettes; no portraits or fake likeness. With sound off, a viewer must still get who, what and when.
- Indonesian on-screen text, Indonesian number format (1.540; 2,8).

## Deliverables (NO full MP4 render; global rule: no MP4 before the voice is locked)
1. `node build-video.mjs`, then `bash ../_tools/snap.sh <EP folder> "<8-10 times across the film>"`. LOOK at the contact sheet with Read and iterate until every frame reads well.
2. Cover topic: a full-resolution 1080×1920 still of your strongest frame (hook or payoff, with the hook title panel visible). Save it as `style/cover-topic.png`. Use `npx hyperframes snapshot` output frames, or extract one; check with Read that it is 1080×1920.
3. Copy your final contact sheet to `style/contact-sheet.jpg`.
4. Run `python mix.py` once.
5. Report briefly: files written, the concept in 3 lines, cover path, known weaknesses.
