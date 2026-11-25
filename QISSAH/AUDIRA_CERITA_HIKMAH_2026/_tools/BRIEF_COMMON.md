# Common brief: CERITA HIKMAH (5 silent drafts, one episode per agent)

Series root: `F:\AUDIRA-VIDEO-MOTION\QISSAH\AUDIRA_CERITA_HIKMAH_2026` (bash: `/f/AUDIRA-VIDEO-MOTION/QISSAH/AUDIRA_CERITA_HIKMAH_2026`).
Source: a 2004 Indonesian radio series "Cerita Hikmah" (short moral stories). The user owns the MP3s. We do NOT reuse that recording: we retell each story in our own words and voice it later with Cartesia TTS. Episode 01 of the series ("Tuhan dan Tukang Cukur", VOXELVERSE, 3:01) is finished at `F:\AUDIRA-VIDEO-MOTION\tuhan-tukang-cukur` and is the quality reference: read `src/scenes/barber/Film.tsx`, `Set.tsx`, `Person.tsx`, `layout.ts` and `voiceover.json` there before writing code (multi-voice cast, word-timed captions with speaker colours, mouth driven by word times, title card, ending lines, AUDIRA outro).

Each episode: 9:16, a full retelling of 2 to 3 minutes, its own 3D style, built in Remotion + React Three Fiber in ONE shared project: `AUDIRA_CERITA_HIKMAH_2026/studio` (node_modules already installed; `src/core` = shared library, `src/kits/<style>` = all 43 style kits with `KIT.md` in `C:\Users\ASUS\.claude\skills\audira-motion\kits\<style>\KIT.md`, style reference in `C:\Users\ASUS\.claude\skills\audira-motion\references\<style>.md`, quality bar image `references/quality-bar/<style>.jpg`).

This stage is a SILENT DRAFT for script review: script + film timed to an estimated timeline + music/SFX only. The voice comes after the user approves the script.

## What you own (touch nothing else)
- `studio/src/scenes/epXX/` (your film code; `index.ts` must keep exporting `Film` and `TOTAL_SECONDS`)
- `studio/public/audio/epXX/` (your music/SFX mix)
- `studio/out/epXX/` (your stills and preview)
- `EPXX_<NAME>/` (docs + voiceover.json + PREVIEW_NO_VO.mp4)
Never edit `studio/src/Root.tsx` (it already registers `EpXXPreview` 540x960@30 and `EpXXFinal` 1080x1920@60 from your index.ts), `src/core`, `src/kits`, `scripts/`, or another episode. If you need to change a kit component, copy it into your own folder first. Four other agents work in parallel in the same project.

## Step 1: script (`EPXX_<NAME>/voiceover.json`)
Read your transcript `_transcripts/epXX.txt` (Whisper of the radio broadcast; it may have recognition errors, the radio intro/outro and host chatter; keep only the story). Retell the story faithfully (same plot, characters, moral), in fresh natural spoken Indonesian, not a word-for-word copy of the broadcast. Shape:
- Hook in the first 3 s (a question or striking line tied to the story), then the story with dialogue lines for the characters, then the hikmah (lesson) said plainly, then one short memorable closing line.
- 330 to 420 spoken words total (Cartesia runs ~2.4 words/s, so 2:20 to 3:00 with pauses). Short lines, one breath each; split long narration into several lines.
- Format (same as EP01):
```json
{ "model": "sonic-3", "language": "id", "voice": "6a3fe952-63f8-4c99-865a-44887175ea26",
  "out_dir": "F:/AUDIRA-VIDEO-MOTION/QISSAH/AUDIRA_CERITA_HIKMAH_2026/studio/public/audio/epXX/clips",
  "meta": "F:/AUDIRA-VIDEO-MOTION/QISSAH/AUDIRA_CERITA_HIKMAH_2026/studio/public/audio/epXX/vo-meta.json",
  "_cast": { "narator": "Risa 6a3fe952", "...": "..." },
  "lead": 0.8, "tail": 8.0,
  "lines": [ { "id": "s1a", "who": "narator", "speed": 0.95, "gap": 0.8, "text": "..." },
             { "id": "s2a", "who": "petani", "voice": "04b567df-2923-4b0c-896b-4b7df0a07e1a", "speed": 1.0, "gap": 0.5, "text": "..." } ] }
```
  `gap` = seconds of silence after the line (longer at scene changes and dramatic beats). Ids `s<scene><letter>`.
- Voices (Cartesia, Indonesian): Risa `6a3fe952-63f8-4c99-865a-44887175ea26` (female, default narrator), Galang `04b567df-2923-4b0c-896b-4b7df0a07e1a` (male, warm), Andi `a053f6bc-7df4-40de-96d4-de026bc47ce8` (male). No child or extra voices exist: give a child or animal lines to Risa with speed 1.05-1.1, or retell them through the narrator. Keep at most 3 voices.
- TTS traps: write numbers as words ("dua tahun", not "2"), no acronyms, never the word AUDIRA in narration, no stage directions inside text, "..." allowed for a pause.
- Then: `cd studio && node scripts/estimate-timeline.mjs epXX` writes `src/scenes/epXX/timeline.json` (same shape the real voice will produce later: clips with start/end and word s/e). Build everything from that file so the film re-times itself when the voice arrives. Key cuts to clip ids (`T.s3b`, `E.s3b`), never to hard-coded seconds.

## Step 2: film (`studio/src/scenes/epXX/`)
- Read your style's KIT.md + reference + quality bar first; build on the kit engine and `src/core` (camera tracks, post, materials). Never copy a kit demo's story or geometry as-is.
- One continuous, connected 3D world per episode with camera motion that follows the story (no slideshow, no static frames, no floating text without depth). Every scene has a visual subject: the characters and objects of the story, acting out what the narration says at that moment (cause and effect visible on mute).
- Characters are stylised to the episode's style (no generic plastic CGI people, no robots). Mouths/heads/gestures driven by the word times of their own lines (see EP01 `mouthOf`).
- Overlays (HTML over the canvas): title card in the hook (story title + "Cerita Hikmah" kicker), word-by-word karaoke captions (active word highlighted, speaker name label with a per-speaker colour) for every line, the hikmah line given a stronger typographic moment, and the outro card in the last ~3 s: `staticFile("brand/stacked-reversed.svg")` logo (never retype "AUDIRA" in a font, never recolour/rotate/stretch the logo) on forest green #0B3D2E, plus the line "Created by Agus Dwi R.". Fonts: pick a typeface pair that suits your style via `@remotion/google-fonts` (already installed) or the bundled Manrope; write font-family names literally.
- Safe zones at 1080x1920: nothing important above y 180 or below y 1540 (bottom 380 px is platform UI). Captions block around y 1250-1500. Keep subjects in roughly y 300-1250. At 540x960 preview everything is half.
- 9:16 framing: first-pass cameras are always too close and crop the sides. Back off; check stills.
- Determinism: everything from `useCurrentFrame()`/`useVideoConfig()` and the timeline; `ThreeCanvas` from `@remotion/three`; no `useFrame` animation, no Math.random (seeded only), no wall clock, no CSS animations.
- The film must work at both 30 fps (preview) and 60 fps (final): compute time `t = frame / fps`.

## Step 3: music + SFX (silent draft = no voice)
Write `studio/src/scenes/epXX/mix.py` (run from `studio/`) that writes `public/audio/epXX/mix.wav` (48 kHz stereo, length = TOTAL_SECONDS): a music bed with its own identity for this story (synthesise with numpy: instrument, scale, tempo that fit the mood; EP01 used a felt piano; do not reuse it), ambience/foley that fits the world (rain, water, wind, birds, footsteps, etc. made with numpy/ffmpeg noise), and SFX on scene changes and key moments from `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/` (chime, click-soft, click, pop, riser, sparkle, whoosh, whoosh-short, whoosh-cinematic, impact-bass-1, ping). Leave headroom for the voice: music around -24 LUFS-ish, and shape it with the clip times (dips under lines) so it still works when the voice is added later. Read the timeline.json for times. Film plays it with `<Html5Audio src={staticFile("audio/epXX/mix.wav")} />` (or `Audio`).

## Step 4: check loop
- Stills: from `studio/`: `node scripts/stills.mjs out/epXX/qa 2s,8s,20s,... EpXXPreview` (seconds list; one frame per scene, mid-transition frames, the hikmah moment and the outro). Open the `_sheet.jpg` it writes with the Read tool and actually look: framing, legibility, safe zones, style quality vs the quality bar image. Fix and repeat until it is good. Typecheck only your folder: `npx tsc --noEmit 2>&1 | grep scenes/epXX` must print nothing (kit folders have pre-existing errors; ignore them).
- Preview render when the stills are good: `npx remotion render EpXXPreview out/epXX/preview.mp4 --concurrency=3` (set `TEMP=F:\hf-render-tmp TMP=F:\hf-render-tmp`; C: is nearly full). Then copy it to `EPXX_<NAME>/PREVIEW_NO_VO.mp4`. Extract 6-8 frames from the MP4 with ffmpeg and look at them (fonts and textures sometimes differ from stills).

## Step 5: docs in `EPXX_<NAME>/` (short, real content, Indonesian)
CREATIVE_BRIEF.md (pesan, audiens, gaya, ide visual, hook), SCRIPT.md (every line with speaker and estimated timecode from timeline.json, marked "estimasi, sebelum suara"), STORYBOARD.md (scene by scene: time, what we see, camera, sound), ART_DIRECTION.md, DESIGN_SYSTEM.md (colours, fonts, caption layout, safe zones), ASSET_MANIFEST.md (everything procedural/which kit/fonts/SFX), AUDIO_PLAN.md (music, ambience, SFX cues, voice cast).

## Report back (short)
Style + look in one line, word count and estimated length, how each scene is staged, contact-sheet paths you checked, preview path, and anything weak or unverified. Be honest; do not claim a render you did not check.
