# Brief Stage A: Sejarah Islam short (script + topic cover). STOP after Stage A.

**Paths.** Series root: `F:\AUDIRA-VIDEO-MOTION\AUDIRA_SEJARAH_ISLAM_2026` (bash: `/f/AUDIRA-VIDEO-MOTION/AUDIRA_SEJARAH_ISLAM_2026`). Your episode folder and style are named in your task. Work only inside your episode folder.

**Format.** One 9:16 short: final 1080x1920 @ 60, preview 540x960 @ 30, about 80-92 s. Indonesian narration by one narrator (Cartesia voice Galang; the lead generates it after approval, so never call any TTS). The user picked your style on 2026-11-11.

## Inputs (read fully)
- `research/RESEARCH_REPORT.md` and `research/SOURCE_REGISTER.md`. Follow the "Disputes" section: keep the hedges it asks for ("menurut catatan ...", "menurut Guinness", "konon", "sekitar"). Never use the claims it says to drop.
- Your kit: `F:\AUDIRA-SKILL-MOTION\kits\<style>\KIT.md`, `F:\AUDIRA-SKILL-MOTION\references\<style>.md` (if present), and the quality bar `F:\AUDIRA-SKILL-MOTION\references\quality-bar\<style>.*` (or `F:\AUDIRA-ALL-SKILL\assets\style-covers\<style>.*`).
- Style memory: MCP `audira_style_memory` action get, style `<STYLE>` (else read `F:\AUDIRA-ALL-SKILL\motion-memory\styles\<STYLE>.md`). Apply its "must apply"/best items, avoid its "avoid" items.
- Engine: `project/` is a fresh copy of the AUDIRA-SKILL-MOTION starter. `node_modules` is a junction to the shared cache: never install, update or delete it. Read `project/README.md`, `src/Root.tsx`, `src/core/film/format.ts`, `src/core/render/Finish.tsx`, `src/core/polish/Polish.tsx`, `src/core/camera/` (if present), and your kit folder `src/kits/<style>/`.

## Deliverables

### 1. Script `docs/SCRIPT.md` (Indonesian)
- 190-210 spoken words (about 80-90 s at 140 WPM; the real voice runs ~137 WPM). Six parts with headings: `## Hook (0-3 s)`, `## Context`, `## Main Development`, `## Explanation`, `## Visual Payoff`, `## Outro`.
- Hook: one sharp line from the research hook candidates (or better), said in the first 3 s.
- Outro: one short CTA (a comment question), then the closing line exactly: "Sejarah Islam, bersama Audira." Write the channel name exactly "Audira" (all caps gets spelled out by the TTS). It must appear once only.
- Style: flowing, conversational Indonesian, short sentences, no article prose, no stage directions inside the narration. Numbers written the way they should be spoken where ambiguous ("tahun delapan ratus lima puluh sembilan" or "tahun 859" consistently).
- Every fact must come from SOURCE_REGISTER. On-screen numbers/labels must also come only from the script or the register.
- Under each part: the narration text, then one line `> Visual:` (what the 3D scene shows; not spoken). At the end: total words and estimated duration at 135-150 WPM.
- Then run `cd project && npm run script:check -- ../docs/SCRIPT.md --short` and fix what it flags (if the checker does not understand the short format, say so and skip).

### 2. Narration source `audio/vo-lines.json`
`{"lines":[{"id":"l01","part":"hook","text":"..."}, ...]}` with one entry per 1-3 sentences, in order. The text is exactly the narration from SCRIPT.md.

### 3. Topic cover (real 3D, the first frame of the film)
- Build the hook scene as a component in `project/src/scenes/<slug>/` (`<slug>` = short lowercase name, e.g. `qarawiyyin`, `khawarizmi`, `haytham`, `mansamusa`, `galata`). It is the opening key image of the film, built to grow into the full film later.
- Register in `project/src/Root.tsx`: `<Name>Cover` (1080x1920, `PRESETS.final`, a few seconds), plus placeholder `<Name>Preview` (540x960@30) and `<Name>Final` (1080x1920@60) using the same scene for now.
- Title text on the cover: 3-5 words (thumbnail style), plus a small "SEJARAH ISLAM · EP0N" label. Safe zones: subject and text inside top 236 px (panel y 236) / bottom 380 px; nothing important in the bottom 380 px.
- Use `<Finish>` with the style memory's best parameters (unless the style is deliberately flat), polish materials (Polish.tsx), real depth (foreground, midground, background).
- Render with `cd project && npm run cover -- <Name>Cover --episode=.. --at=0.3s` (read `scripts/cover-still.mjs` usage first; it writes `style/cover-topic.png` and `style/cover.json`). If that script fails, render with `node scripts/stills.mjs` and copy the PNG to `style/cover-topic.png`, and say so.
- Copy the kit quality-bar image to `style/cover-reference.<ext>`.
- Look at the PNG with the Read tool and iterate until it reaches the class of the quality bar: lighting, material, depth, composition, readability. Then record `audira_style_memory` `record_score` (stage "cover", episode `sejarah-islam-EP0N`, with the audit ceilings from `npm run audit:visual` and evidence per aspect).

### 4. `style/STYLE_DECISION.md`
Chosen style and why it fits; the alternatives shown (from `_review/STYLE_OPTIONS.jpg`) and that the user picked the main option on 2026-11-11; `approved: yes` (style); cover not yet approved.

## Depiction and tone (hard rules)
- No prophet, angel or Allah depicted in any form (no figure, silhouette, hand, shadow or light-being).
- Historical people (Fatimah al-Fihri, Al-Khawarizmi, Ibnu al-Haytham, Mansa Musa, Sultan Mehmed II, crews, students, pilgrims) appear only as small faceless figures, silhouettes from behind, hands without faces, or through objects. There are no authentic portraits; never invent faces.
- Mosques, Qur'an manuscripts and Arabic text: dignified, never playful props; do not invent Qur'anic text (use abstract calligraphy-like strokes or geometric pattern instead of real verses).
- EP05 conquest: neutral and non-graphic; no violence, no blood, no fire on people; the focus is the ships, the chain, the hill and the map.
- The name AUDIRA will appear once inside the 3D world in Stage B (a plaque, label, book spine); the cover needs only the small label.

## Do NOT
- No full film, no music, no MP4, no TTS.
- No edits outside your episode folder (reading is fine). Temp files only in `project/out/` or `draft/` (C: is nearly full).

## Report back (short, English is fine)
Word count and estimated duration; the hook line; the six parts in one line each; the cover path and what it shows; the cover score; anything weak or uncertain.

## Batch 2 additions (EP06-EP10, 2026-11-12) — lessons from EP01-EP05 blind juries
- Channel: AUDIRA QISSAH. `<AudiraSignature seed="sejarah-islam-ep0N" />` takes the handle automatically from `src/brand/channel.json` (run `npm run channel` once if it is missing); never type a handle.
- Outro (Stage B): use `<AudiraOutro />` from `src/brand/AudiraOutro.tsx` for the last 3 s (official logo + channel name/handle + "Created by Agus Dwi R."). Never use `brand/audira-outro-card.svg` (old neon card) or hand-made outro cards; render:final stops without `<AudiraOutro>`.
- Every on-screen line ≥ 38 px at 1080 width, including kickers and sub-lines; no tiny source lines. Labels/chips on opaque dark plates, fully inside x 60–1020.
- Keep the signature, the series kicker and the title apart (the title card sits ≥ 240 px from the top).
- Signs are never emissive under bloom (they wash out).
- The cover hero subject must be large and clear on the phone; one subject per frame.
- Time: the voice runs at ~145 WPM after speed tuning; keep the script 190–210 words.
- Cartesia reads digits/acronyms badly: write years as digits in the script (the lead converts them), but avoid acronyms in narration.
