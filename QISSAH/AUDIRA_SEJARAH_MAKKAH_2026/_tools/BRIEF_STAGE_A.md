# Brief Stage A: Sejarah Makkah (script + topic covers). STOP after Stage A.

**Paths.** Series root: `F:\AUDIRA-VIDEO-MOTION\QISSAH\AUDIRA_SEJARAH_MAKKAH_2026` (bash: `/f/AUDIRA-VIDEO-MOTION/QISSAH/AUDIRA_SEJARAH_MAKKAH_2026`). Your episode folder is named in your task.

**Format (rule `F:/AUDIRA-ALL-SKILL/.agents/rules/09_long_form_video.md`; read it).** Each episode is:
- one 16:9 long-form master: 1920x1080 @ 30, 8-12 min, 5-8 chapters;
- two 9:16 shorts re-rendered from the same scenes: 1080x1920 @ 60, 45-90 s each.

All narration is Indonesian, by one narrator (Cartesia voice Galang). The user approved the style for your episode on 2026-11-10.

## Inputs (read fully)
- `research/RESEARCH_REPORT.md` and `research/SOURCE_REGISTER.md` in your episode folder. Its "Disputes" table says how to phrase uncertain numbers. Follow it.
- Your kit:
  - `F:\AUDIRA-SKILL-MOTION\kits\<style>\KIT.md`
  - `F:\AUDIRA-SKILL-MOTION\references\<style>.md` (if present)
  - the quality bar `F:\AUDIRA-SKILL-MOTION\references\quality-bar\<style>.*` or `F:\AUDIRA-ALL-SKILL\assets\style-covers\<style>.jpg`
- Style memory: call the MCP tool `audira_style_memory` (action get, style `<STYLE>`) if you have it. Otherwise read `F:\AUDIRA-ALL-SKILL\motion-memory\styles\<STYLE>.md`. Apply its "must apply"/"best" items and avoid its "avoid" items.
- Engine: your episode's `project/` is a fresh copy of the AUDIRA-SKILL-MOTION v4.3 starter. `node_modules` is a junction to `<WS>/_cache/remotion-r3f`: never install or delete it.
  - Read `project/README.md`, `src/Root.tsx`, `src/core/film/format.ts` (`useFormat`, `FormatFov`, wide presets), `src/core/render/Finish.tsx`, `src/core/polish/Polish.tsx` and `Person.tsx`, and the kit folder `src/kits/<style>/`.
  - Example of an existing Wide composition: `InnerworksWidePreview` in Root.tsx.

## Deliverables

### 1. Script `docs/SCRIPT.md` (Indonesian)
The script carries the long-form narration. It is written per chapter, about 1,250-1,550 spoken words in total, which is about 9-11 minutes at 140 WPM.

**Structure:**
- **Hook (0-30 s):** the promise plus a glimpse of the payoff.
- **Intro (30-45 s):** says the channel name once, written exactly "Audira" (all caps gets spelled out by the TTS), e.g. "...di Audira kita bongkar satu per satu."
- **5-8 chapters of 60-120 s each,** each opening with a short re-hook line.
- **Payoff, then CTA:** comment question, subscribe.
- **Closing line:** "Sejarah Makkah, bersama Audira."

**Writing rules:**
- **Style:** flowing, conversational Indonesian, not article prose. Short sentences.
- **Facts:** every fact must come from the source register. Keep the hedges ("sekitar", "menurut catatan ...") where the research says the sources disagree. Never invent numbers.
- **Spoken form:** write numbers the way they should be spoken, e.g. "tahun seribu enam ratus tiga puluh", "dua puluh dua tahun". Years may also stay as digits; the TTS reads them, so be consistent.
- **Text:** no stage directions in the narration text.
- **Per chapter, give:** the title, the narration text, the word count, an estimated duration (words / 140 * 60), and a one-line visual note (what the 3D scene shows).
- **At the end:** total words and estimated total duration.
- **Two short segments:** mark them inside the chapters, taken from the research's short candidates or better ones. For each, give:
  - which narration lines it reuses;
  - a NEW 0-3 s hook line for the short;
  - a closing line pointing to the long video, e.g. "Cerita lengkapnya ada di video panjang Audira.";
  - the estimated length (45-90 s).

### 2. Narration source `audio/vo-chapters.json`
An array of chapters: `[{"id":"c00_hook","title":"...","text":"..."}, ...]`, plus `"shorts":[{"id":"short01","hook":"...","reuse":["c03_..."],"outro":"..."}, ...]`. The text is exactly the narration from SCRIPT.md. The lead generates the voice from this file after approval, so do not call any TTS.

### 3. Topic cover in both formats, with real 3D in your project
- **Build** the cover as the first key image of your film: a scene component in `project/src/scenes/<slug>/` (`<slug>` = lowercase episode short name, e.g. `kabah`).
- **Register** two compositions in `project/src/Root.tsx`:
  - `<Name>CoverWide`: 1920x1080, using `PRESETS.wideFinal`.
  - `<Name>Cover`: 1080x1920, using `PRESETS.final`.
  - Both can be a few seconds long.
- **Framing:**
  - Author the scene for 9:16 and let `FormatFov` and `useFormat` adapt it to 16:9.
  - Check that the wide frame has no empty or unfinished set edges; the wide background shows much more, so extend the set.
  - Respect the safe areas: in 16:9, sides 96 px, top 60 px, bottom 120 px; in 9:16, top 180 px, bottom 380 px.
- **Title text on the cover:** 3-5 words (thumbnail style), plus a small "SEJARAH MAKKAH · EP0N" label.
- **Render** both with `node scripts/stills.mjs` (read its usage first). Then copy them to:
  - `style/cover-topic-16x9.png` (this also becomes the YouTube thumbnail base, 1280x720 later);
  - `style/cover-topic-9x16.png`.
- **Copy** the kit's quality-bar image to `style/cover-reference.<ext>`.
- **Check quality.** Look at both PNGs with the Read tool and iterate until they reach the class of the quality-bar reference: lighting, material, depth, composition, readability. If you have `audira_style_memory`, record the cover score (`record_score`, stage "cover", episode `sejarah-makkah-EP0N`), with evidence per aspect.

### 4. `style/STYLE_DECISION.md`
Include:
- the chosen style and why it fits this topic;
- the two alternatives shown to the user, and that the user picked the main option;
- the date 2026-11-10;
- `approved: yes` (style); the cover is not yet approved.

## Depiction and tone (hard rules)
- **Prophets, angels and Allah:**
  - No prophet (Ibrahim, Ismail, Muhammad ﷺ) appears in any form: no figure, silhouette, hand or shadow.
  - Show their presence only through places, objects and light.
  - No depiction of angels or Allah.
- **The Ka'bah:**
  - It may be shown with dignity: a black cube, the gold band of the kiswah, the door and the Hajar Aswad corner.
  - Never damaged on screen. Historical collapse is shown abstractly, e.g. as stones laid out on a plan, or a flood line on a diorama wall.
  - Never used as a playful prop.
- **People:** pilgrims, workers and craftsmen appear only as small, faceless, respectful figures, crowds as points or flow, or hands at work without faces. Never comic.
- **Controversies:** keep modern ones (demolished heritage, Qarmatian raid, Ibn Zubayr vs Hajjaj) neutral and non-graphic.
- **Brand:**
  - The name AUDIRA appears once inside the 3D world in the film (Stage B).
  - The cover only needs the small label.

## Do NOT (Stage A)
- No full film, no music, no MP4, no TTS.
- Do not edit another episode's folder, `_cache`, or anything outside your episode, except reading.
- Keep temp files inside your episode (`project/out/`, `draft/`). C: is nearly full.

## Report back (short, English is fine)
- The chapter list with word counts and estimated durations, plus the total.
- The two shorts: hook lines and lengths.
- The two cover paths, and what each shows.
- Anything weak or uncertain.
