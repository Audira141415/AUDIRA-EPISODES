# CHRONICLE project

Made from the AUDIRA Motion skill, style CHRONICLE: a 3D silhouette history documentary (portrait 9:16; landscape 16:9 with `--wide` when asked). Per video
you write `stories/<id>/naskah.txt` (format: FORMAT-NASKAH.md) and put the voice-over at `stories/<id>/vo.mp3`;
`node scripts/make.mjs <id> --final` does the rest (plan → original score + SFX → render → QA).

- `src/director` — naskah → film plan (parser, gazetteer of places, planner: sets, moods, cast, camera beats, overlays)
- `src/film` — the generic renderer: 10 sets, the stager + camera grammar, the relief-map scenes, overlays
- `src/kits/chronicle` — silhouette figures + contour pass, stage/looks, relief map, FX, props, overlay components
- `src/data/map-nusantara.json` — Natural Earth land outlines (public domain) · `scripts/` — make, sound, QA, stills

Docs: the skill folder's `references/chronicle.md`, `references/chronicle/` and `kits/chronicle/KIT.md`.
