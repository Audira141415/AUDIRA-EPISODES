# Brief Stage B: Sejarah Makkah films on the locked voice (stop at the draft gate)

The user approved the scripts and both topic covers on 2026-11-10. The Cartesia voice is now generated and locked. Read the whole of `_tools/BRIEF_STAGE_A.md` again: its format, depiction rules and safe areas all still apply. Rule 09: `F:/AUDIRA-ALL-SKILL/.agents/rules/09_long_form_video.md`.

## Locked inputs: never edit them, never regenerate the voice
- **`audio/vo.wav`:** the long-form narration track at -16 LUFS. It is the master clock.
- **`audio/timeline.json`:** all times in seconds of `vo.wav`.
  - It holds `lead`, `voEnd`, `total` (= voEnd + 20 s end screen), `chapters[{id,title,start,end}]` and `clips[{id,chapter,display,start,end,file,words[{w,s,e}]}]`.
  - It also holds `shorts{short01:{hook,outro}}`. Their times are relative to each clip, and the clips are not in vo.wav.
- **`audio/clips/*.wav`:** the per-clip Cartesia files, including `sNN_hook.wav` and `sNN_outro.wav`.
- **`audio/vo-chapters.json`:** the script text and the short definitions (`reuse`, `lines` / `reuseFrom`/`reuseTo` / `reuseLines` / `reuseNote`).

## What you build (all in your episode's `project/`)

### 1. Long-form film (16:9 master)
- **Compositions:** `<Name>WidePreview` (960x540 @ 30, `PRESETS.widePreview`) and `<Name>WideFinal` (1920x1080 @ 30, `PRESETS.wideFinal`).
  - Duration is `ceil(total * fps)`.
  - Copy `audio/timeline.json` into `project/src/scenes/<slug>/timeline.json` and import it from there.
- **One continuous 3D world in your kit's style,** built out from your cover scene.
  - Each chapter gets its own set piece or era, and the camera travels between them.
  - Cut chapters into separate files (`src/scenes/<slug>/ch02.tsx` …) so the film stays manageable.
  - Every camera key and timed event is anchored to a word or chapter time from timeline.json, never to absolute seconds.
  - Leave slack in each move.
- **Anti-PPT law:** continuous motion, multi-plane depth, and a visual subject acting out every sentence. The film must work on mute.
- **Long video, so vary the rhythm:**
  - re-hook moments at the start of each chapter;
  - a chapter title card (number, title, year) at each chapter start, about 3 s, inside the 16:9 safe area;
  - occasional data callouts or labels taken only from the script and the SOURCE_REGISTER;
  - maps or plans where the research supports them.
- **Captions (16:9):** a bottom-centre band above the bottom 120 px, with 1-2 lines from `words`. Highlight the active word, but stay calm; this is not short-style bounce.
- **End screen:** the last 20 s (`voEnd` → `total`). Keep a quiet world shot with two empty frames (left and right, about 30% width each) where YouTube's end-screen elements go. In the final ~3 s show the outro: `staticFile("brand/stacked-reversed.svg")` on #0B3D2E plus "Created by Agus Dwi R.". Check the logo file in `project/public/brand/`, and copy it from `<WS>/shared/assets/brand/` if it is missing.
- **Brand:**
  - `src/brand/AudiraSignature.tsx` (copy from `F:/AUDIRA-ALL-SKILL/assets/brand/AudiraSignature.tsx` if not in the starter) as the LAST layer: `seed="sejarah-makkah-ep0N"`, `handle="@audira"`. It hides itself at the outro.
  - The name AUDIRA once inside the 3D world: a label, a plaque, a museum tag, never on the Ka'bah or on Quranic text.
- **Audio:** `project/src/scenes/<slug>/mix.py` (run from `project/`; you may import `../../_tools/audio_lib.py` helpers or write your own numpy synthesis) writes `public/audio/bed.wav`.
  - **Contents:** music, ambience and SFX only, no voice, with length = total. Use the SFX library at `<WS>/shared/assets/sfx/`.
  - **Musical identity:** its own per episode; reverent, with no singing and no instruments that would offend: soft drones, oud/ney/qanun-like synthesis and percussion kept very light.
  - **Ducking:** dip under narration.
  - **Combine:** copy `audio/vo.wav` to `public/audio/vo.wav`, then combine with `ffmpeg sidechaincompress`, as in the snippet below. The voice stays on top; the bed sits about 15 dB under.
  - **Wire-up:** `public/audio/full.wav` is what the final render gets via `--vo`. Previews may use `<Audio src={staticFile("audio/full.wav")}/>` or nothing.

  ```
  ffmpeg -y -v error -i public/audio/bed.wav -i public/audio/vo.wav -filter_complex "[1:a]aformat=channel_layouts=stereo,asplit=2[v1][v2];[0:a]volume=-5dB[b];[b][v1]sidechaincompress=threshold=0.02:ratio=4:attack=20:release=450[bd];[bd][v2]amix=inputs=2:normalize=0:duration=first[m]" -map "[m]" -ar 48000 -ac 2 public/audio/full.wav
  ```

### 2. Two shorts (9:16, re-rendered, not cropped)
For each short in `vo-chapters.json`:
- **Narration:** assemble its track `public/audio/short0N_vo.wav` in this order:
  1. the `sNN_hook` clip;
  2. the reused span cut from `vo.wav`, using word times for the first and last reused word;
  3. the `sNN_outro` clip, with about 0.3-0.5 s gaps between parts.

  Loudness-normalise it to -16 LUFS. Write `src/scenes/<slug>/short0N.json`: segments with source times and short times, plus words re-timed onto the short clock. It must be 45-90 s.
- **Compositions:** `<Name>Short01Preview` / `<Name>Short01Final` and `<Name>Short02Preview` / `<Name>Short02Final` (`PRESETS.preview` 540x960@30 and `PRESETS.final` 1080x1920@60).
  - Reuse the same world and set pieces with 9:16 framing: subject inside the top 180 px and bottom 380 px safe zones, `useFormat`.
  - The hook has its own strong opening frame within 0-3 s.
- **Short captions:** karaoke per word (the active word highlighted, bounce ≤ 1.04, gap ≥ 0.4 em), above the bottom 380 px.
- **Short ending:** a short end card "Tonton video panjangnya di YouTube Audira", then the outro, with the signature on.
- **Short audio:** a bed for each short, cut from or matched to the long bed, combined the same way into `public/audio/short0N_full.wav`.

### 3. Draft = contact sheets, NOT films (stage 8)
- **Long-form:** for each chapter render 6-8 frames of `<Name>WidePreview` with `node scripts/stills.mjs out/draft/<chapter> <secs with s suffix> <Name>WidePreview`. Include mid-move frames and the chapter title card. Tile all chapters into `draft/DRAFT_LONG.jpg`, about 1200 px wide; split it into two sheets if it gets very tall.
- **Shorts:** 6-8 frames each of `<Name>Short0NPreview` into `draft/DRAFT_SHORTS.jpg`.
- **Check:** run `npm run audit:visual -- <sheet> --wide --grid=CxR` on the long sheet (and without `--wide` on the shorts sheet). Then call `audira_style_memory` `record_score` with stage "draft", episode `sejarah-makkah-EP0N`, the audit ceilings and evidence per aspect. If the verdict is PERLU POLES, polish the weak aspect and re-score.
- **Look at every sheet yourself with the Read tool.** Check for:
  - empty set edges in 16:9;
  - subjects cut at the frame edge;
  - text clipped or overlapping;
  - cards caught half-open;
  - black or NaN frames;
  - captions that are unreadable;
  - depiction-rule violations.
- **No MP4:** do not render MP4s. The only exception is one 15-20 s 960x540 clip of the riskiest move if motion must be checked.
- **Typecheck:** `npx tsc --noEmit 2>&1 | grep scenes/<slug>` must print nothing.

### 4. Docs
In `docs/`, fill `STORYBOARD.md` (real chapter times), `ART_DIRECTION.md`, `AUDIO_PLAN.md` and `ASSET_MANIFEST.md`. Update `docs/SCRIPT.md` with the real chapter start times from timeline.json. Note "cover approved by user 2026-11-10" in `style/STYLE_DECISION.md`.

## Do NOT
- No final render, no voice regeneration, and no edits outside your episode folder (reading is fine).
- Keep temp files in `project/out/` or `draft/`. C: is nearly full.
- Never delete `node_modules` (it is a junction to the shared cache).

## Report back (short)
- The sheet paths.
- What each chapter shows: one line each.
- The short lengths.
- The draft score.
- Anything weak or unverified.
