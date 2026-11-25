# Asset Manifest — EP01 Baitul Hikmah

## Engine & Style
- **Engine**: Remotion 4 + React Three Fiber
- **Style Kit**: MANUSCRIPT
- **Resolution**: 1080x1920 (9:16 short)
- **FPS**: 30 preview / 60 final

## 3D Assets (All Procedural — No External Files)

| Asset | Type | Method | File |
|---|---|---|---|
| Walnut table | Mesh + procedural texture | `makeWoodTexture()` canvas | World.tsx |
| Table legs (8x) | BoxGeometry | Primitives | World.tsx |
| Bookshelf (4 columns) | BoxGeometry composite | Primitives + generated books | World.tsx |
| Ink bowl + tendrils | Cylinder + circles | Animated spread via `inkSpread` | World.tsx → InkBowl |
| Baghdad miniature | Sphere + cylinder + box | Round City dome, minarets, walls | World.tsx → BaghdadMiniature |
| Scroll + quill + ink pot | Cylinder + plane + cone | Unroll animated via `scrollUnroll` | World.tsx → ScrollQuill |
| Open book + floating equations | Box + emissive boxes | Rise via `algebraFloat` | World.tsx → AlgebraEquations |
| Mechanical device + bird | Torus + sphere + box | Gear spin via `gearSpin`, wing flap | World.tsx → MechanicalDevice |
| Astrolabe | Torus + ring + cross bars | Slow rotation | World.tsx → Astrolabe |
| Candles (5x) | Cylinder + sphere + sprite | `candleFlicker()` noise, pointLight | World.tsx → Candles |
| Dust motes (50x) | Sprites | Additive blending, float | World.tsx → DustMotes |
| Flood water | Box + PhysicalMaterial | Rises via `floodLevel`, transmission | World.tsx → FloodWater |
| Rising gold letters (20x) | Box meshes | Emissive gold, rise via `lettersRise` | World.tsx → RisingLetters |
| Floor plane | PlaneGeometry | Dark stone color | World.tsx |

## Textures (Procedural Canvas)

| Texture | Source | Resolution |
|---|---|---|
| Wood grain | `makeWoodTexture(7)` | 512x512 canvas |
| Glow sprite | `makeGlowTexture()` | 64x64 canvas |

## HUD / Overlay

| Element | Timing | File |
|---|---|---|
| Series badge "MANUSCRIPT // EP01" | 0.3s–end | Overlay.tsx |
| Beat labels (8 labels) | Per beat timing | Overlay.tsx → LABELS |
| Year chips (6 years) | Per beat timing | Overlay.tsx → YEARS |
| Radial vignette | Constant | Overlay.tsx |
| Destruction red tint | 43–48s | Overlay.tsx |
| Creator watermark "AUDIRA" | 1s–end | Overlay.tsx |

## Lighting

| Light | Config | File |
|---|---|---|
| PMREMGenerator + RoomEnvironment | envIntensity 0.35 | Film.tsx → StudioEnv |
| Ambient | 0.18, #6A4A30 | Film.tsx |
| Hemisphere | sky #7A5A3A, ground #120A06, 0.3 | Film.tsx |
| Directional (window fill) | [-3,4,2], 0.4, #C9B8A0, shadow 1024 | Film.tsx |
| Candle point lights (5x) | amber, 2.0 intensity, decay 1.6 | World.tsx → Candles |
| Fog | room color, near 4, far 12 | Film.tsx |

## External Dependencies: NONE
All assets are procedural Three.js geometry and canvas-based textures. No GLTF, images, or fonts required.

## Camera
7 positions with smooth easeInOut blends, orbit for Baghdad beat, arc for Banu Musa beat, handheld drift noise. See `motion.ts → getCamera()`.
