# ASSET MANIFEST — EP32 BONGKAR RAHASIA RUMAH

## 3D Models (GLB)

| ID | File | Path | Dipakai di |
|---|---|---|---|
| `two-story-house` | `two-story-house-40f6dc.glb` | `E:/ASET/ASSET-AUDIRA/downloads/glb/building/` | S1, S2, S3, S4, S5, S6 (hero asset) |

## Brand Assets

| File | Path | Dipakai di |
|---|---|---|
| `audira-outro-card.svg` | `F:/AUDIRA-ALL-SKILL/assets/brand/` | S6 Outro |
| `AudiraSignature.tsx` | `F:/AUDIRA-ALL-SKILL/assets/brand/` | Overlay sepanjang film |

## Audio

| File | Keterangan | Dibuat di |
|---|---|---|
| `audio/vo.wav` | Voiceover Cartesia (213 kata, ~90 dtk) | Tahap 6 |
| `public/audio/sfx.wav` | SFX mix: whoosh × 2, pop × 5, riser × 2, impact × 1, ding × 1 | `npm run sfx` tahap 7 |

## Fonts

| Font | Dipakai di |
|---|---|
| Inter (Google Fonts) | Subtitle karaoke, HUD cards, Stage label |

## Shader / Material

| Komponen | Parameter |
|---|---|
| `FilmScene` | hdri: sky, envIntensity: 0.55, background: #e8eef0 |
| `Post.tsx` BUILDFORGE | MSAA, GTAO, DOF, UnrealBloom 0.14/0.45/2.2, PBR Neutral, vignette, grain 0.012 |
| Dinding X-ray | opacity: 0.3–0.5 (scene S3–S4) |
| Kolom highlight | emissive amber (scene S5) |

## Belum Tersedia (Perlu Dibuat)

| Item | Keterangan |
|---|---|
| X-ray shader dinding | Custom material semi-transparan untuk S3–S4 |
| Exploded view kolom | Procedural kolom beton 30×30cm di posisi tersembunyi |
| Kabel/pipa network | Procedural tube geometry mengikuti layout rumah |
| `DataCallout.tsx` | Komponen HUD card kinetic (dibuat di tahap 7) |
