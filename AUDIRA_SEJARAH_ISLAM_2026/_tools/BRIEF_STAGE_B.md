# Brief Stage B: Sejarah Islam short on the locked voice (stop at the draft gate)

The user approved the script and the topic cover on 2026-11-11 ("Ya, buat suara"). The Cartesia voice is generated and locked. Read `_tools/BRIEF_STAGE_A.md` again: its format, depiction rules and safe zones still apply. Work only inside your episode folder.

## Locked inputs (never edit, never regenerate the voice)
- `audio/vo.wav` (-16 LUFS, also copied to `project/public/audio/vo.wav`): the master clock.
- `audio/timeline.json` (seconds of vo.wav): `lead`, `voEnd`, `total` (= voEnd + 4 s outro room), `parts[{id,start,end}]` (hook, context, main, explanation, payoff, outro), `lines[{id,part,display,start,end,words[{w,s,e}]}]`. Display words are the caption words; numbers stay as digits there.
- `style/cover-topic.png` + `style/cover.json`: the approved cover. The film's opening (0-1.5 s) must match it: same framing, same look. Start the camera at the cover framing and move from there.

## Build (in `project/`)
1. Copy `audio/timeline.json` to `project/src/scenes/<slug>/timeline.json` and import it. `<Name>Preview` (540x960@30, `PRESETS.preview`) and `<Name>Final` (1080x1920@60, `PRESETS.final`) with duration `ceil(total * fps)`. Keep `<Name>Cover` working.
2. One continuous 3D world in your style, grown from the cover scene. Each part gets a beat that acts out the sentence being spoken (the film must work on mute). Every camera key and timed event is anchored to a word time from timeline.json (look words up by text, nth occurrence when repeated), never to absolute seconds. Leave slack; no camera key closer than ~1.5 s to the next; no overshoot (hold keys before cuts or big moves).
3. Anti-PPT: continuous camera motion, multi-plane depth (BG, mid, FG, HUD, captions), no static slides, no floating text without depth. Labels/numbers on screen only from the script or SOURCE_REGISTER.
4. Captions: karaoke per word from `words` (active word highlighted, bounce <= 1.04, word gap >= 0.4 em), 1-2 lines, above the bottom 380 px and below the top 236 px (panel y 236), readable on every background (solid or blurred plate behind the line). Keep digits as written.
5. Brand:
   - `src/brand/AudiraSignature.tsx` as the LAST layer: `<AudiraSignature seed="sejarah-islam-ep0N" handle="@audira" />` (it hides itself at the outro).
   - The name AUDIRA once inside the 3D world (a plaque, label, book spine, crate stamp), never on a mosque, Qur'an or Arabic text.
   - Outro card in the last ~3 s (from `voEnd` + 0.6 s to `total`): `staticFile("brand/audira-outro-card.svg")` full frame (or the logo centred on #0B3D2E with "Created by Agus Dwi R.").
6. Apply the style memory (`audira_style_memory` get, your style): "must apply", best parameters, avoid list. `<Finish>` unless the style is deliberately flat. Polish materials (`core/polish/Polish.tsx`).
7. Audio bed: `project/src/scenes/<slug>/mix.py` (run from `project/`) writes `public/audio/bed.wav`: music + ambience + SFX only, no voice, length = total, its own musical identity (reverent; soft drones, oud/ney/qanun-like numpy synthesis, very light percussion; no singing). SFX from `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/` (see its catalog.json) on key beats. Then:
   ```
   ffmpeg -y -v error -i public/audio/bed.wav -i public/audio/vo.wav -filter_complex "[1:a]aformat=channel_layouts=stereo,asplit=2[v1][v2];[0:a]volume=-5dB[b];[b][v1]sidechaincompress=threshold=0.02:ratio=4:attack=20:release=450[bd];[bd][v2]amix=inputs=2:normalize=0:duration=first[m]" -map "[m]" -ar 48000 -ac 2 public/audio/full.wav
   ```
   The voice stays on top; the bed sits ~15 dB under it. `public/audio/full.wav` is what the final render gets via `--vo`.

## Draft = contact sheet, NOT a film (stage 8)
- Render 8 frames of `<Name>Preview`: 0.3 s (must match the cover), one in each part (mid-sentence, including a mid-move frame), the payoff, and the outro: `node scripts/stills.mjs out/draft <t1s,t2s,...> <Name>Preview`. Tile them into `draft/DRAFT_SHEET.jpg` (8x1 or 4x2, about 1200 px wide).
- `npm run audit:visual -- ../draft/DRAFT_SHEET.jpg --grid=CxR`, then `audira_style_memory` `record_score` (stage "draft", episode `sejarah-islam-EP0N`, judge self, ceilings + evidence per aspect). If PERLU POLES, polish the weak aspect and re-score.
- Look at the sheet yourself (Read tool). Check: subjects cut at the edge, text clipped or overlapping, cards caught half-open, black or NaN frames, unreadable captions, captions in the bottom 380 px, empty frames, depiction-rule violations (no faces, no prophets).
- No MP4, except at most one 15-20 s 540x960 clip of the riskiest move if motion must be checked (`draft/CHECK_*.mp4`).
- Typecheck: `npx tsc --noEmit 2>&1 | grep scenes/<slug>` prints nothing.

## Docs (episode folder)
`docs/STORYBOARD.md` (real times per part), `docs/ART_DIRECTION.md`, `docs/AUDIO_PLAN.md`, `docs/ASSET_MANIFEST.md`; update `docs/SCRIPT.md` with the real part start times; in `style/STYLE_DECISION.md` note "cover approved by user 2026-11-11".

## Do NOT
- No final render, no voice regeneration, no edits outside your episode folder. Temp files only in `project/out/` or `draft/`. Never delete `node_modules` (junction to the shared cache).

## Report back (short)
Sheet path, what each part shows (one line each), draft score, anything weak or unverified.

## Batch 2 additions (EP06-EP10, 2026-11-12) — these override the brand lines above
- Signature: `<AudiraSignature seed="sejarah-islam-ep0N" />` as the LAST layer; the handle comes automatically from `src/brand/channel.json` (run `npm run channel` if needed). Never type a handle.
- Outro: `<AudiraOutro />` from `src/brand/AudiraOutro.tsx` in the last 3 s (from voEnd + ~0.6 s to total). Never use `brand/audira-outro-card.svg` or a hand-made outro card; render:final stops without `<AudiraOutro>`.
- Lessons from the EP01-EP05 blind juries (they failed drafts/finals on these):
  - every on-screen line ≥ 38 px at 1080 width; chips/pins on opaque dark plates, clamped inside x 60–1020; short labels (wrap or shorten rather than crop);
  - captions: opaque dark plate, never fading under 100% while words are spoken; chunk at punctuation; no 1-word orphans;
  - no near-black transit frames: keep a lit, centred subject across every move (average brightness ≥ ~10%);
  - one clear hero per beat (≥ 40–50% frame width); no crowded label clusters; no subject in the bottom 380 px;
  - signs never emissive under bloom; signature never on top of the kicker/title.
- Draft sheet: 8 frames, but sample at least two TRANSITION moments (mid-move between beats), not only beat centres — the final jury samples fixed fractions of the MP4 (1/12/25/40/55/70/85/98.5%), so also render a second sheet `draft/DRAFT_SHEET_FRACTIONS.jpg` at those fractions of `total` and check it yourself.
- Camera: run `audit:camera` on one 15–18 s clip of the riskiest stretch; target score ≥ 4, jerks < 2/10 s, fast seconds < 10%.
