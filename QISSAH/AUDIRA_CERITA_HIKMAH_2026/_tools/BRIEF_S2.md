# Brief: CERITA HIKMAH season 2 (EP07-EP11), LANDSCAPE 16:9 for regular YouTube video

Series root: `F:\AUDIRA-VIDEO-MOTION\QISSAH\AUDIRA_CERITA_HIKMAH_2026` (bash: `/f/AUDIRA-VIDEO-MOTION/QISSAH/AUDIRA_CERITA_HIKMAH_2026`).
Source: 2004 Indonesian radio series "Cerita Hikmah" (moral stories, MP3s owned by the user). We do NOT reuse the recording: we retell each story in our own words and voice it with Cartesia TTS later.

**What is new vs season 1 (EP02-06, read `_tools/BRIEF_COMMON.md` for everything not changed here):**
- **Format: 16:9 landscape, final 1920x1080 @ 60, preview 960x540 @ 30.** Not Shorts. Compose for a TV/desktop frame: wide establishing shots, characters can share the frame side by side, horizontal camera moves (truck, pan, crane), rule of thirds. No vertical safe zones; instead keep titles/captions inside a 5% action-safe margin and leave the bottom ~22% for the caption band.
- **Length: the full story, about 3:20 to 4:40 of voice** (450 to 620 spoken words; Cartesia runs ~2.3 words/s). Give the story room: establishing scenes, pauses, the emotional beats. No invented subplots.
- **Project: `studio_16x9/`** (fresh v4.2 starter, node_modules installed). `src/Root.tsx` already registers `EpXXPreview` (960x540@30) and `EpXXFinal` (1920x1080@60) from `src/scenes/epXX/index.ts` (keep exports `Film`, `TOTAL_SECONDS`). Never edit Root.tsx, `src/core`, `src/kits`, `scripts/`, or another episode. The old vertical `studio/` is for EP02-06; do not touch it.
- v4.2 core you should use (read the files): `core/render/Finish.tsx` (`<Finish>`: environment reflections, AO, bloom, PBR Neutral tone mapping, grade; skip only if the style is deliberately flat), `core/polish/Polish.tsx` (`RoundedBoxGeo`, `POLISH.*` materials, `useSurfaceGrain`, `lifeMotion` for blinks/breathing), `core/polish/Person.tsx` (`<ToyPerson>` with poses; never capsule + 4 sticks one-colour figures). Style kit + `KIT.md` + reference + quality bar: `F:\AUDIRA-SKILL-MOTION\kits\<style>\KIT.md`, `F:\AUDIRA-SKILL-MOTION\references\<style>.md`, `F:\AUDIRA-SKILL-MOTION\references\quality-bar\<style>.png`.
- **Brand (anti-reupload):**
  1. `src/brand/AudiraSignature.tsx` as the LAST layer of the film: `<AudiraSignature seed="cerita-hikmah-epXX" handle="@audira" />` (its anchors are fractions of the frame, so they work in 16:9; check it never sits on the caption band or the title).
  2. The name AUDIRA appears once inside the 3D world as part of the scene (a shop sign, a label, a book spine, a carved board...).
  3. The voice says "Audira" once, in the last line (e.g. "Cerita Hikmah, bersama Audira."). Write it exactly "Audira" (capitals get spelled letter by letter by Cartesia).
  4. Outro card in the last ~3 s: `staticFile("brand/stacked-reversed.svg")` on #0B3D2E + "Created by Agus Dwi R." (logo rules unchanged).

## This round = Stage A only (style + script gate). STOP after Stage A and report.
1. Read your transcript `_transcripts/epXX.txt` fully (Whisper errors, radio intro "Resonansi jiwa" and host chatter like "Classy people" are not part of the story).
2. Write `EPXX_<NAME>/voiceover.json` (same format as BRIEF_COMMON; `out_dir`/`meta` under `studio_16x9/public/audio/epXX/`; `lead`, `tail` 8.0, per-line `gap`). Shape: hook in the first 3-5 s, story with dialogue, the hikmah said plainly, closing line with "Audira". Voices: Risa `6a3fe952-63f8-4c99-865a-44887175ea26` (female, narrator), Galang `04b567df-2923-4b0c-896b-4b7df0a07e1a` (male, warm), Andi `a053f6bc-7df4-40de-96d4-de026bc47ce8` (male). Max 3 voices. Numbers as words, no acronyms, no stage directions in text.
3. `cd studio_16x9 && node scripts/estimate-timeline.mjs epXX` (it overestimates ~12%; real voice will be shorter).
4. `EPXX_<NAME>/SCRIPT.md`: every line with speaker + estimated timecode, word count, and a line "Estimasi durasi suara: X:XX (perkiraan Cartesia ~Y:YY)".
5. **Cover topic still** `EPXX_<NAME>/style/cover-topic.png` at 1920x1080: the key image of this story in the chosen style (look development from the kit, real 3D in the project: build it as the first keyframe of your film in `src/scenes/epXX/` and set TOTAL_SECONDS from timeline.json; render with `node scripts/stills.mjs out/epXX/cover <sec>s EpXXFinal` and copy the PNG; check `node scripts/stills.mjs` usage first). Title "Cerita Hikmah / <judul>" on it. Look at it and iterate until it reaches the quality bar class. This image doubles as the YouTube thumbnail.
6. `EPXX_<NAME>/style/STYLE_DECISION.md`: chosen style, reason (story fit), the two alternatives shown to the user and why they were not chosen (user picked the main option), date 2026-11-10, `approved: yes` for the style (the user approved the style, not yet the cover).
7. Do NOT build the full film, music, or any MP4 yet. No renders other than cover stills.

## Report back (short)
Word count, estimated + expected real length, the story beats in 5-8 bullets (so the lead can show the user), the cover path, and anything uncertain in the transcript (names, plot points you had to infer).

## Stage B (after the user approved scripts + covers on 2026-11-10)
The real Cartesia voice is generated and locked: `studio_16x9/src/scenes/epXX/timeline.json` is now the REAL timeline (word times from the voice) and `public/audio/epXX/vo.wav` exists (-16 LUFS). Never edit `voiceover.json`, `timeline.json`, `vo.wav` or the clips.
1. Build the whole film on the real timeline (all scenes, captions with speaker labels, title, hikmah moment, in-world AUDIRA brand visible at least once, AudiraSignature last layer, outro). Fix the weak spots noted at the cover review. Everything 16:9 per Stage A rules.
2. `src/scenes/epXX/mix.py` (run from `studio_16x9/`) writes `public/audio/epXX/mix.wav` = music + ambience + SFX only (no voice), length = film, dips under lines, own musical identity per episode (see BRIEF_COMMON Step 3). The lead mixes it with the voice afterwards (`scripts/combine-vo.sh`).
3. Draft = contact sheet, NOT a film: 8 key frames (hook, each main beat, payoff, outro) of `EpXXPreview` (960x540) via `node scripts/stills.mjs out/epXX/draft <secs> EpXXPreview`, tiled into `EPXX_<NAME>/DRAFT_SHEET.jpg` (about 1200 px wide). Look at it and iterate until it is good. No MP4 except, if motion must be checked, one 15-20 s 960x540 clip of the riskiest section.
4. Update `SCRIPT.md` with the real timecodes (remove "estimasi"), write CREATIVE_BRIEF, STORYBOARD (real times), ART_DIRECTION, DESIGN_SYSTEM, ASSET_MANIFEST, AUDIO_PLAN in the episode folder; in `style/STYLE_DECISION.md` note "cover approved by user 2026-11-10".
5. Typecheck your folder only (`npx tsc --noEmit 2>&1 | grep scenes/epXX` prints nothing). Report briefly: sheet path, what each scene shows, weak or unverified points.
