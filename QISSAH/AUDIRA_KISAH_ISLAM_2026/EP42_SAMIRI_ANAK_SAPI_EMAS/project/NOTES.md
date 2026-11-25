# AUDIRA CHRONICLE — engine notes (developer reference)

3D history documentary: warm low-poly 3D locations, people as flat black 3D silhouettes (some with a coloured
contour), a real-coastline 3D relief map with sound rings / routes / pins, big date stamps, rolling counters, source
citations and word-by-word captions. Original look inspired by the genre of silhouette history explainers (no copied
art, channel branding, fonts or layout). Script format for buyers: FORMAT-NASKAH.md.

Remotion 4.0.539 + React Three Fiber 9.8.2 + three 0.186.1; Node ≥ 22.18 (scripts import the TypeScript director).

## Commands
- `node scripts/make.mjs <id> --plan` → out/<id>/plan.json (scenes, sets, cast, maps, overlays, warnings)
- `node scripts/make.mjs <id> --stills 3s,14s,24s` → out/<id>/stills/_sheet.jpg
- `node scripts/make.mjs <id> --preview` (540×960 @ 30) / `--final` (1080×1920 @ 60 + `scripts/qa.mjs` → out/<id>/qa/)
- voice: stories/<id>/vo.mp3|wav|m4a, else `--tts` (macOS Damayanti) or `--silent`; `--no-music` skips the score
- `npm run smoke` (plan + 4 stills of stories/diponegoro → out/smoke/_sheet.jpg), `npm run look:cast` (Lookdev comp)

## Kit — src/kits/chronicle/
- `outline.ts` — SilhouetteOutlinePass: ID-mask render (figures = colour+id, everything else depth only via
  colorWrite off, transparent FX hidden) → contour drawn outside each figure, only where that figure is nearer than
  the pixel (works over background, over farther figures, hidden behind walls). Width ~3.4 px @1080, faint halo.
- `Stage.tsx` — Look = key (shadow box per shot) + hemi + optional fill + FogExp2 + sky dome (gradient, sun, stars)
  + bloom + grade (split tone, S-curve, vignette, grain). `mixLook` for flashes / light changes.
- `looks.ts` — GOLDEN, DUSK, INFERNO, MAPROOM + contour colours INK (hero amber, ally cyan, foe crimson, grief violet, neutral ivory).
- `Figure.tsx` — posable silhouette person (joint hierarchy of simple solids), hats/wear/items/loads, POSES
  (stand, akimbo, shoulderArms, point, telescope, raiseFist, carryHead, kneel, lookUp) + `gait(phase, run)`.
  Skirt = cloth tube that follows the legs (sarong, kain, robe, coat flare).
- `relief.ts` / `Relief.tsx` — buildRelief(region): rasterise Natural Earth land (src/data/map-nusantara.json, 50 m +
  10 m detail box) → blurred copies → height (plateau + masked ridged noise + volcano list) × vex → one grid mesh with
  vertex colours + painted sea texture. `Strato` = volcano whose summit collapses into a caldera (skirt tucked under
  terrain via heightAtWorld). `Ring` = expanding sound/shock ring (land hides it by depth).
- `fx.tsx` — AshColumn (instanced lit-from-below puffs), Embers, Bolt (volcanic lightning), Birds.
- `props.tsx` — Water (fresnel + glitter), Rampart, Cannon, Lantern, Flag, Ship, Stilthouse, Palm, Volcano (lava emissive), Ground.
- `Overlay.tsx` — Captions (`pace()` until real VO timings), DateStamp, NameTag, Counter, Cite, MapPin, RouteLine.
- `cam.ts` — camAt (C1 keys), handheld drift + impact shake, `project()` for overlay pins.

## Map data
src/data/map-nusantara.json = Natural Earth (public domain) ne_50m_land for lon 86–160 / lat −48–48 plus a ne_10m_land
detail box (lon 112.6–119, lat −13 – −3.5), baked to Mercator "map px" (3200 px wide). Only land outlines are kept.

## Auto-director (script → film)
- `src/director/` pure TS (node + browser): `parse.ts` naskah → scenes/tags/lines; `gazetteer.ts` ~200 places + map volcanoes;
  `plan.ts` timing (paced 2.55 w/s or VO word times), set/mood/fx rules, cast parsing (role → costume by era, verb → action,
  "= warna" → contour), beats per line, overlays, one relief region for all maps; `types.ts`.
- `src/film/`: `sets.tsx` 10 generic sets with anchors (lead/second/target/rows/guards/path/seat), `stage.ts` stager +
  camera grammar, `PlaceScene.tsx`, `MapScene.tsx` (close / fit / rings / route-follow camera), `ChronicleFilm.tsx`
  (+ end card, overlay layout), `fxextra.tsx` (Flames, Shafts, Candle).
- `scripts/make.mjs`: VO → word timings with whisper.cpp when installed (WHISPER_CLI / WHISPER_MODEL, PATH, Homebrew),
  then every line start that whisper put inside a pause is snapped to where the voice comes back (whisper starts run
  0.3–0.6 s early); without whisper the script lines are laid onto the VO's speech runs (ffmpeg silencedetect, DP over
  pauses with spoken-length estimates — numbers read as Indonesian words) and the words paced in speech time.
- Comps `ChroniclePreview` / `ChronicleFinal` take `{ plan }` props (calculateMetadata sets duration); Studio default =
  src/generated/plan.json (last planned story).
- Example stories: stories/diponegoro (9 scenes, Java War) and stories/tambora (5 scenes, 1815 eruption), each with
  naskah.txt and the ElevenLabs texts used for their voice-overs (VO-elevenlabs*.txt; recordings not included).

## Sound — scripts/sound.mjs (run by make.mjs; `--no-music` skips)
Original synth, no samples: additive string pads (chord per bar, per-scene cue from kind/set/mood), low drone, pelog-like
metallophone motif (D Eb F A Bb, inharmonic bars), frame drums for fire/route/forest cues, gongs on dates + end, impacts on
sound rings / counters, whooshes on cuts, ambiences (wind, sea, fire, forest birds, room tone, rumble). Music ducks ~9 dB
under the voice envelope. Output public/stories/<id>/mix.wav at −14 LUFS / −1.5 dBTP + stems out/<id>/{music,sfx}_stem.wav.

## Gotchas
- Vertical 9:16 frame is narrow: at fov 48 only ~2.5 m of width at 5 m depth → stage people in depth, not in a row.
- Black figures vanish against unlit walls → every set needs a lit background behind the people (sky, lit stone, fog glow) or contours.
- Map stays north-up (Indonesian viewers read Java horizontally); show wide spans by pulling far up (D≈1600, fog ≈ 0.0002).
- Lathe UVs: v = 0 at the first profile point → set `flipY = false` on painted canvases.
- Volcano glow caps read as "UFO" discs: keep crater interior below the rim, no emissive cap.

## 16:9 (`--wide`, only when the buyer asks)
- `node scripts/make.mjs <id> --wide [--stills …|--preview|--final]` → comps ChroniclePreviewWide (960×540 @ 30) /
  ChronicleFinalWide (1920×1080 @ 60), out/<id>/<id>_1920x1080_60fps.mp4, stills in out/<id>/stills-wide, QA in
  out/<id>/qa-wide (qa.mjs reads the size from the file name; sheets 4×6 at 480 px).
- Overlay.tsx: `Frame width height` picks a 1920×1080 layout canvas (CanvasCtx / useCanvas); every overlay default has a
  landscape position (captions H−150, 6 words per chunk; date / counter / name near the top; name lower third H−330).
- PlaceScene: landscape narrows the vertical fov by WIDE_FOV 0.84 (tan space) so shots show ~2× the portrait width, not 3×.
- ChronicleFilm: on 16:9 map scenes a [SUMBER] citation sits above the captions (H−290) — it can meet high pins.
