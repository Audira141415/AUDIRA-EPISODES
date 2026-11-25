# EP05 film plan (handover s2 → s3, 2026-11-24)

Done in s2:
- docs/SCRIPT.md, ART_DIRECTION.md, STORYBOARD.md, ASSET_MANIFEST.md (Style: SCALEFORGE).
- check-env + smoke OK. src/brand/channel.json fixed to SAINS / @AudiraSains (was Explained).
- VO: project/public/audio/vo.wav 84.10 s + vo-words.json (231 words, {id,text,start,end}) + vo.timing.json. TTS text: audio/vo-tts.txt.
- 8 GLBs copied into project/public/models/polyfork/ (flat): comm-satellite-fdc2cd, large-asteroid-391721, crater-terrain-blob-bd6af6, regolith-boulder-1f1f14, phase-mirror-1a43e9, laser-pointer-ray-a70928 (all prop), exploration-rover-7afd91 (vehicle), astronaut-explorer-323482 (character). Use <AssetModel id=... size= ground />.
- Code written: src/episodes/moon/timeline.ts (SCENES, ramp/lerp helpers, MOON_SECONDS 87.5, OUTRO_SECONDS 3.2), src/episodes/moon/bodies.tsx (Moon w/ procedural texture, near side faces +Z at rotY 0, marker arrow, stretch along X; Earth/Sun from kit; StarSphere; LabelPlate canvas plate; Arrow).

To do (s3):
1. src/episodes/moon/scenes.tsx: one component per scene + camera pose per scene (continuous motion, never parked):
   - hook 0–4.6: Moon r2 close-up, rim light from left, push-in + 15° orbit; 3D "?" plate behind edge appears ~1.8 s.
   - nights 4.6–12.5: 5 moons r0.8 in a row x -4..4, LabelPlate "Malam 1..5" under each, truck camera along x.
   - orbit 12.5–26.1: top view, Earth r1.2 centre, thin blue torus r5, Moon r0.55 with marker, angle 0→2π over 12.5–24, rotY = angle so marker faces Earth; comm-satellite orbiting r2.4 FG; LabelPlate "AUDIRA LAB" brand on the plane; crane from top to ~50°.
   - bulge 26.1–39.3: Earth r1.6 at x=-5, Moon r1.4 at x=2.5 stretch 1→1.35, Arrows toward Earth, bulge angle oscillates and decays (brake), asteroid FG.
   - wobble 39.3–46.1: Moon r2 close-up, rotY/rotX ±0.105 rad wobble.
   - farside 46.1–51.7: Sun far left, Moon lit on far side, camera orbits from near side to -Z.
   - missions 51.7–64.2: crater-terrain GLB ground, boulders, rover moving; NO Earth in sky (far side); small capsule lift-off ~61 s.
   - laser 64.2–75.35: near-side surface, astronaut + phase-mirror (+ LabelPlate "AUDIRA LAB" on mirror), laser ray GLB + emissive beam from Earth in sky; tilt up to Earth spinning (slowing) 69.7+.
   - outro 75.35–87.5: Earth + Moon side by side, golden key light, large asteroid drift, pull-back.
2. src/episodes/moon/Hud.tsx: callout cards (SafeLabel ≥36 px, big numbers 96–120 px) at VO word times: 1959 @0.74, "Bulan diam?" @10.3 struck @11.8, 27,3 hari @14.58 (+ day counter during orbit), "skala tidak sebanding" note in orbit/outro, Penguncian pasang surut @23.9, Gravitasi @27.3, rem @31, terkunci @37, 59% @44.16, "Sisi jauh ≠ gelap" @46.2, LUNA 3 · 1959 @51.9 (viewfinder), CHANG'E 4 · 2019 @56.6, CHANG'E 6 · 1.935 gram @59.5, 3,8 cm/tahun @67.4, 620 juta tahun lalu @71.6, ≈ 21,5 jam @74.1, "Hampir semua bulan besar terkunci" @75.5, "berputar seirama" @78.4.
3. src/episodes/moon/MoonFilm.tsx: FilmScene background #070B18, profile COLOR_PROFILES.APPLE_STUDIO_CLEAN, exposure 1, envIntensity 0.55, ao false, near 0.05 far 2000; StarSphere; scene switch by sceneAt(t); overlay = Hud + <Subtitle words position={1300}> + <AudiraSignature seed="sains-EP05-sisi-bulan" outroSeconds={3.2}/> + <AudiraOutro seconds={3.2}/>; <Audio src={staticFile("audio/vo.wav")}/> (render-final renders muted, VO goes via --vo).
4. Root.tsx: MoonPreview (PRESETS.preview) + MoonFinal (PRESETS.final), durationInFrames = MOON_SECONDS*fps.
5. docs/SHOTLIST.md (format scripts/lib/shotlist.mjs: Style/Hook/Offset lines + table # | Waktu | Objek | Aksi | Kamera | Teks layar | Beat) → npm run lint:shotlist → npm run sfx.
6. npm run cover -- MoonPreview --episode=.. --at=1.5s ; npm run draft -- MoonPreview (explicit --frames=2.3s,8.5s,19s,33s,43s,49s,58s,70s,80s) ; draft/THEME_CHECK.md ; self + blind jury record_score (max 2 rounds) ; stop at gate 9.

## Catatan sesi dobel (2026-11-24)
Sesi dobel (local_b4cec045, local_7031f776, sudah dihentikan) menulis VO 79,04 dtk dan MoonFilm.tsx/moonAssets.ts. Semua dipindah ke `work/_dup/` (tidak dipakai). VO resmi = `project/public/audio/vo.wav` 84,10 dtk (231 kata, cocok `audio/vo-tts.txt`). Boleh lirik `work/_dup/moon/MoonFilm.tsx` sebagai referensi, tapi kode resmi = `timeline.ts` + `bodies.tsx`.
