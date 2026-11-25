# Brief Stage B: Roblox Map Baru short on the locked voice (stop at the draft gate)

Series `F:/AUDIRA-VIDEO-MOTION/AUDIRA_ROBLOX_MAP_BARU_2026` (channel AUDIRA TECH, handle `@AudiraTECH`). The user approved style, topic cover and script on 2026-11-11 ("Setuju, buat VO"). The Cartesia voice is generated and LOCKED. You already know (or must read) `_style/COVER_BRIEF.md`: its character rule, safe zones, file-ownership rules and technical rules still apply. Shared studio: `studio/` (one Remotion project for all 5 episodes; other agents work in parallel in their own `src/scenes/epNN/`).

## Locked inputs (never edit, never regenerate the voice)
- `<EP>/audio/vo.wav` (-16 LUFS), copied to `studio/public/audio/epNN/vo.wav`: the master clock.
- `studio/src/scenes/epNN/timeline.json` (copy of `<EP>/audio/timeline.json`, seconds of vo.wav): `lead`, `voEnd`, `total` (= voEnd + 4 s outro room), `parts[{id,start,end}]` (hook, context, main, explain, payoff, outro), `lines[{id,part,display,start,end,words[{w,s,e}]}]`. Display words are the caption words; numbers stay as digits there.
- `<EP>/style/cover-topic.png` + `cover.json` + your `Hook.tsx` / `COVER_CAMERA`: the approved cover. The film opens on it: frame at 0.3 s must match the cover (same framing, look, headline). Start the camera at `COVER_CAMERA` and move from there. Do not change `Cover.tsx`/`Ep NN Cover` output (it is approved).

## Build (only in `studio/src/scenes/epNN/`)
1. Replace the placeholder `Film.tsx` (keep `export const TOTAL_SECONDS = timeline.total` and `export const Film`). Compositions `EpNNPreview` (540×960@30) and `EpNNFinal` (1080×1920@60) are already registered in Root.tsx; do not edit Root.tsx. Use `useVideoConfig().fps` for time (t = frame / fps) so preview and final match.
2. One continuous 3D world in your style, grown from the cover scene. Each part gets a beat that ACTS OUT the sentence being spoken (the film must work on mute). The blocky avatar (`scenes/_shared/BlockAvatar.tsx`, do not edit it) has an active role in every part (building, running, pointing, falling, cheering, typing), not set dressing. Make sure its two legs read as two legs (avoid poses/angles where they merge into one block).
3. TIMING RULE (lesson from the last Roblox series): every camera key and timed event is anchored to a word time from timeline.json (helper: look a word up by text + nth occurrence, or a line by id), NEVER to absolute seconds. Leave slack; no camera key closer than ~1.5 s to the next; no overshoot (hold keys before cuts or big moves).
4. Anti-PPT: continuous camera motion, multi-plane depth (BG, mid, FG, HUD, captions), no static slides, no floating text without depth. On-screen labels/numbers only from the script (`<EP>/docs/SCRIPT.md`) or `<EP>/research/FACTS.md`, written exactly.
5. Captions: karaoke per word from `words` (active word highlighted, bounce ≤ 1.04, word gap ≥ 0.4 em), 1–2 lines, above the bottom 380 px and below the top 180 px, readable on every background (solid or blurred plate behind the line). Keep digits as written. The cover headline may stay during the hook, then gets out of the captions' way.
6. Brand:
   - `src/brand/AudiraSignature.tsx` as the LAST layer of your Film: `<AudiraSignature seed="roblox-map-baru-epNN" handle="@AudiraTECH" />` (it hides itself at the outro).
   - The name AUDIRA once inside the 3D world (you already have it from the cover; keep it visible in at least one more beat).
   - Outro card in the last ~3 s (from `voEnd` + 0.6 s to `total`): `staticFile("brand/audira-outro-card.svg")` full frame.
   - The VO already says "Audira" in the outro.
7. Style memory: `audira_style_memory` get for your style (and GLOBAL): apply "must apply"/best parameters, avoid the avoid list. `<Finish>` unless the style is deliberately flat. Polish materials (`core/polish/Polish.tsx`), seeded noise only (no Math.random / Date).
8. Audio bed: `studio/src/scenes/epNN/mix.py` (run from `studio/`) writes `public/audio/epNN/bed.wav`: music + ambience + SFX only, no voice, length = total, its own musical identity fitting the style (e.g. BRICKCRAFT playful marimba/plucks + brick clicks; DATAPHYSICAL minimal pulse + metal ticks; ISOCRAFT bouncy comic percussion; ARCADECRT chiptune square/triangle + CRT hum; DEVFORGE synth arps + key clicks). Numpy synthesis, no vocals. SFX from `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/` (see `catalog.json`) on key beats (anchored to word times). Then:
   ```
   ffmpeg -y -v error -i public/audio/epNN/bed.wav -i public/audio/epNN/vo.wav -filter_complex "[1:a]aformat=channel_layouts=stereo,asplit=2[v1][v2];[0:a]volume=-5dB[b];[b][v1]sidechaincompress=threshold=0.02:ratio=4:attack=20:release=450[bd];[bd][v2]amix=inputs=2:normalize=0:duration=first[m]" -map "[m]" -ar 48000 -ac 2 public/audio/epNN/full.wav
   ```
   The voice stays on top; the bed sits ~15 dB under it. `public/audio/epNN/full.wav` is what the final render gets via `--vo`. Do not put `<Audio>` in the Film (the final render muxes full.wav).

## Draft = contact sheet, NOT a film (stage 8)
- Render 8 frames of `EpNNPreview`: 0.3 s (must match the cover), one in each part (mid-sentence, including one mid-move frame), the payoff, and the outro: `node scripts/stills.mjs out/epNN-draft <t1s,t2s,...> EpNNPreview` (with `RENDER_TMPDIR=F:/render-tmp`). Tile them 4×2 into `<EP>/draft/DRAFT_SHEET.jpg` (about 1200 px wide; PIL is fine).
- `npm run audit:visual -- ../<EP>/draft/DRAFT_SHEET.jpg --grid=4x2`, then `audira_style_memory` `record_score` (stage "draft", episode `roblox-map-baru-EPNN`, style yours, judge self, ceilings + evidence per aspect). If PERLU POLES, polish the weak aspect and re-score (max ~3 rounds).
- Look at the sheet yourself (Read tool, downscaled). Check: subjects cut at the edge, text clipped or overlapping, cards caught half-open, black or NaN frames, unreadable captions, captions in the bottom 380 px, empty frames, avatar missing or tiny.
- No MP4, except at most one 15–20 s 540×960 clip of the riskiest move if motion must be checked (`<EP>/draft/CHECK_*.mp4`).
- Typecheck: `npx tsc --noEmit 2>&1 | grep scenes/epNN` prints nothing.

## Docs (episode folder)
`docs/STORYBOARD.md` (real times per part), `docs/ART_DIRECTION.md`, `docs/AUDIO_PLAN.md`, `docs/ASSET_MANIFEST.md`; update `docs/SCRIPT.md` with the real part start times (from timeline.json).

## Do NOT
- No final render, no voice regeneration, no edits outside `studio/src/scenes/epNN/`, `studio/public/audio/epNN/`, `studio/out/epNN-*` and your `<EP>/` folder. Never delete `node_modules` (junction to the shared cache). Do not touch Root.tsx, kits, core, `_shared`.

## Report back (short)
Sheet path, what each part shows (one line each), draft score (verdict + per aspect), anything weak or unverified.
