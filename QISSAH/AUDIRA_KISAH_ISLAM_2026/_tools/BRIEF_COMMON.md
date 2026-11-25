# Common build brief: KISAH DALAM AL-QUR'AN (5 silent drafts, one episode per agent)

> **Rule 14 (hard rule):** this is an Islamic-history series. New episodes use **Remotion 4 + R3F** (studio pattern `AUDIRA_SEJARAH_ISLAM_2026`), not world3d. This brief was written before rule 14 and kept only for the existing episodes that already shipped with world3d. Any new episode or new series with an Islamic topic must follow rule 14.


Series root: `F:\AUDIRA-VIDEO-MOTION\AUDIRA_KISAH_ISLAM_2026` (bash: `/f/AUDIRA-VIDEO-MOTION/AUDIRA_KISAH_ISLAM_2026`).
Each film: 1080x1920, 30 fps while building (final 60 fps via audira_render_batch), about 80-92 s, HyperFrames (HTML + GSAP) over a Three.js world. Silent draft (music + SFX only) for script review. Narration timing comes from your episode's `timeline.json` (estimated per word); the real Cartesia voice replaces it later and everything keyed to words follows.

## Reference implementation (read before writing anything)
The finished series `F:\AUDIRA-VIDEO-MOTION\FAKTADUNIA\AUDIRA_SEJARAH_NEGARA_2026` uses this exact pipeline. Read:
- `EP03_DAGEN_H_SWEDIA\build-video.mjs`, `world3d.js`, `mix.py` (panels + Three.js world + numpy sound). Skim one more (EP01 or EP04) for variety.
- Tools in THIS series (`AUDIRA_KISAH_ISLAM_2026\_tools`): `hflib.mjs` (word anchors, captions, index), `shell.mjs` (world composition, panel transitions, counters, outro card, corner chip), `lib3d.js` (track() camera spline, stage(), canvasTex, label, pts, mulberry), `audio_lib.py` (Mix class).
- Do NOT edit anything in `_tools/`, `script-lines.json`, `timeline.json` or another episode. Helpers go in your own folder.
- Your episode folder already has `PROJECT/HyperFrames_Remotion/` with `hyperframes.json`, `assets/lib` (three + postprocessing passes), `assets/brand/stacked-reversed.svg`, `assets/img/grain.png`, and `AUDIO/sfx/` (chime, click-soft, click, error, glitch-1..3, impact-bass-1, ping, pop, riser, sparkle, typing, whoosh-cinematic, whoosh-short, whoosh).

## Research and facts
- `_research/FACTS.md` lists every claim with its verse. `_research/quran/EPxx_*.txt` holds the Arabic (Uthmani) text and the Kemenag Indonesian translation of every verse used.
- On-screen text comes only from the script and those files. Show the verse reference (e.g. "QS Al-Kahf 18:25") on the panel that carries that verse's content.
- Arabic on screen: copy the Uthmani text EXACTLY from the quran file (copy-paste, never retype or shorten mid-verse; a whole short verse or a clearly bounded phrase only). Font `Amiri` (Google) with `direction:rtl`. Check in a snapshot that the Arabic renders joined, not as boxes. If it does not render cleanly, drop the Arabic and keep the reference + Indonesian.

## Depiction rules (hard, religious sensitivity)
- No prophet (Nuh, Yunus, Musa, Muhammad, or any other) appears in any form: no body, silhouette, face, hand, shadow or back view. Show their presence through objects and light: a staff, a lantern, a hammer and planks, footprints, a glow inside the fish, a voice line in the caption.
- No depiction of Allah or angels in any form; no "divine light beam from the sky with a figure". Natural phenomena (sea, rain, birds, sun) are fine.
- Other people (youths of the cave, Firaun's army, Abrahah's army, Abdul Muthalib, Nuh's people) only as faceless, distant, stylised silhouettes or tiny figures; no facial features; never comic or mocking.
- Animals are fine (dog, fish, elephants, birds, animal pairs).
- Ka'bah may appear as a simple dignified black cube with a gold band; never damaged.
- Tone: reverent, cinematic, calm, no horror jump-scares, no gore (drowning shown as water closing over distant shapes, not bodies).
- Corner chip text: "ILUSTRASI · TANPA MENGGAMBARKAN SOSOK NABI" (pass as `chip` to writeWorld).

## What you deliver in your episode folder
1. `world3d.js`: `export function create(canvas, K, AT)` returning `(t) => { ... comp.render(); }`. Every value a pure function of t (seek-safe, no accumulated state, no Math.random; use mulberry()). Imports from `./three.module.js` and `./lib3d.js` like the reference.
2. `build-video.mjs`: panels HTML + css, writeWorld(...) options (panelIn/panelOut transition unique to this episode, outroIn, chip), captions css + active word tween, writeIndex. Copies `../_tools/lib3d.js` and `world3d.js` into `PROJECT/HyperFrames_Remotion/assets/lib/` like the reference. Outro card comes from shell.mjs (logo + "Created by Agus Dwi R."); keep it.
3. `mix.py`: music bed with its own identity (numpy synthesis via audio_lib.Mix: instrument, mode, tempo fitting the story; reverent, Middle-Eastern modes like Hijaz/Bayati are welcome; no singing voices) plus ambience/foley and SFX on scene changes and key words, ending with `M.finish(music)`. Leave room for a voice later (music dips under narration). `mkdir -p AUDIO/work` first.

## Build and check loop
From the episode folder: `node build-video.mjs && python mix.py`. Snapshots: `bash ../_tools/snap.sh <EP_FOLDER> "1,6,15,..."` (comma list of seconds). It prints a contact-sheet path; open that image with the Read tool and look at it. Check at least one frame per scene plus the outro, fix framing, check again. Do NOT run `render.sh`; the lead renders all five afterwards. Keep TEMP on F: (snap.sh does). C: is nearly full: never write temp files there.

## Word anchors
`at("s3:Ka'bah")` = start of the first word "Ka'bah" in scene s3 (display text, trailing punctuation stripped). `#2` picks the 2nd hit, `+0.4`/`-0.3` offsets. Words written `{display|spoken}` appear in timeline.json as display text. Anchor on clean words; repeated words need `#2`. Every `data-at`/`data-in`/`data-out`/`data-a` value with ":" is collected automatically; anchors used only in world3d.js go in `extraAt`. K has `s1..s8` (start), `s1e..` (end), `end`, `dur`, `outro`.

## Hard rules (studio + earlier user feedback)
- Not a slideshow: continuous camera motion through one connected 3D world, multi-plane depth (world, panels, captions); every scene has a visual subject acting out the narration (visible on mute), not just text.
- Safe zones: panels between y 236 and about 1180 px; captions at top 1300 px (bottom 380 px stays clear). Keep 3D subjects roughly in y 300-1250.
- 9:16 framing: at FOV 38 the visible width is about 0.39 x camera distance. First-pass cameras are always too close; back off.
- font-family must be a literal font name (never a CSS variable). Google font names; HyperFrames loads them. Captions need visible spaces between words (if words are inline-block spans add `margin:0 .16em`).
- canvasTex(w,h,draw) without the repeat argument is clamp-to-edge; never set tex.repeat on it.
- InstancedMesh moved per frame needs `frustumCulled = false`.
- A scaleY/clip outro must start hidden too.
- `cat > file` without a heredoc hangs Bash. Use the Write tool for files.
- Numbers on screen match the script exactly.
- Indonesian on-screen text, short. Panels support; the 3D world carries the scene. Avoid cards with large empty areas and avoid whip pans or lens glare that wash out text (earlier fix rounds).

## Report back
Short: the look, how each scene is staged (and how the depiction rules were kept), the contact-sheet paths you checked, anything weak or unverified.

## Batch 3+ additions (EP11 and later; batch 4 = EP16-EP20 with FACTS4.md, batch 5 = EP21-EP25 with FACTS5.md, batch 6 = EP26-EP30 with FACTS6.md, batch 7 = EP31-EP35 with FACTS7.md). Keep the shell outro untouched (never restyle #outro). Card wipes in/out must finish within 0.3 s. On-screen numbers must come from the script or the FACTS file, never invented
- Facts: `_research/FACTS3.md`. Verses: `_research/quran/EP11..EP15_*.txt`.
- Anti-reupload (new studio rule):
  1. Pass `signature: "<episode folder name>"` to writeWorld. shell.mjs then adds the moving AUDIRA mark (32% opacity, jumps between 4 safe-zone anchors every 18 s, hidden at the outro). Keep your own panels/subjects clear of those anchors where you can: top-right (x 900-1015, y 221-270), left (x 65-200, y 1190-1240), right (x 900-1015, y 864-910), top-left (x 65-200, y 221-270). If a panel covers the top anchors that is fine (the mark sits above panels, z-index 19); just check it stays legible.
  2. Put the name AUDIRA once inside the 3D world as part of the scene (a carved inscription, a label on an object, a banner, a seal), visible for at least 2 s, so it cannot be cropped away. Keep it tasteful and small; never on anything sacred (no Ka'bah, no verse text).
- The script now ends with "Kisah dalam Al-Qur'an, bersama AUDIRA." Treat the last ~2 s of s8 as a soft sign-off moment.
- Snapshots for review: `bash ../_tools/draft-sheet.sh <EP> "t1,t2,..."` also writes `PROJECT/qc/draft-sheet.jpg` (1200 px). Check that cards hug their content (no empty reserved space), captions are legible on every background, and no frame is empty sky/wall. These were the three most common first-pass faults in batch 2.

## Batch 7 additions (lessons from batch 6 fix rounds)
- Card changes never overlap: the outgoing card finishes its exit before the incoming card starts its entry. Never show two half-open cards at once. A card shows its first content line on entry, not just a kicker or heading.
- 3D words and subjects stay fully inside x 40-1040 across the whole shot. Camera splines overshoot between keys, so add hold keys and check frames mid-move, not only on keys.
- Add a NaN clamp before bloom (set NaN to 0, cap bright values) so a single bad pixel cannot black out the frame.
- Timing moves when the real voice replaces the estimated timeline. Keep camera moves anchored to words and leave slack, so a 10% change in timing does not push subjects off frame.
