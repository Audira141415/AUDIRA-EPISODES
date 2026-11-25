# Asset Manifest — SEJARAH MAKKAH · EP01

All 3D is procedural code in `project/src/scenes/kabah/`: no downloaded models, images or AI-generated pictures.

| Asset | File / source | Licence / origin |
|---|---|---|
| Parametric Ka'bah model (kiswah drape, stone courses, glass study model), Hijr wall, plinths, plaques, planks, stones | `core.tsx` | Original code (AUDIRA) |
| World, main stage, era ring miniatures, crowd points, lights, backdrop | `world.tsx` | Original code |
| Chapter sets: Ibrahim valley, Quraisy shore, Zubair curtain model, study room with map, Kufah colonnade, flood tank, glass interior, lineup | `ch02.tsx` … `ch10.tsx` | Original code |
| Schematic map of Arabia (coastlines, graticule, labels) | `ch06.tsx` canvas texture | Original drawing from approximate coordinates (schematic, not survey-grade) |
| Kiswah damask lattice, embossed band ornament, mataf veining, sand, parchment | `core.tsx` seeded canvas textures | Original code (ornament only, no imitation calligraphy) |
| HDRI warmStudio | `project/public/hdri/brown_photostudio_02_1k.hdr` | CC0 (Poly Haven), shipped with the starter |
| Manrope font | `project/public/fonts/` | SIL OFL, shipped with the starter |
| AUDIRA logo | `project/public/brand/stacked-reversed.svg` | AUDIRA brand kit |
| Moving signature | `project/src/brand/AudiraSignature.tsx` | AUDIRA brand kit |
| Voice | `audio/vo.wav`, `audio/clips/*.wav` | Cartesia TTS, voice Galang (AI voice) |
| Music and ambience bed | `project/public/audio/bed.wav` from `mix.py` | Original numpy synthesis |
| SFX | `F:/AUDIRA-VIDEO-MOTION/shared/assets/sfx/` (impact-bass-1, whoosh-cinematic, chime, sparkle, riser) | AUDIRA shared library (see `catalog.json`) |
| Topic covers | `style/cover-topic-16x9.png`, `style/cover-topic-9x16.png` | Rendered from `KabahCover.tsx`, approved 2026-11-10 |
