# ASSET MANIFEST — EP67 Borobudur

## 3D Assets

Tidak memerlukan GLB eksternal — PASIRFORGE menggunakan geometri prosedural (CPU-shaped boxes + ellipsoids dari `lib/sculpture.ts`). Tidak ada karakter ToyPerson di episode ini.

## Audio

| File | Keterangan | Sumber |
|------|-----------|--------|
| `audio/vo.mp3` | Voiceover Cartesia | `audira_generate_voiceover` |
| `audio/sfx.wav` | SFX stem prosedural | `npm run sfx` |

## Brand

| File | Keterangan |
|------|-----------|
| `src/brand/AudiraSignature.tsx` | Tanda tangan bergerak anti-reupload |
| `shared/assets/brand/audira-outro-card.svg` | Closing credit 2–3 dtk terakhir |

## Kit Components (dari PASIRFORGE)

| Import | File |
|--------|------|
| `SandMonument3D` | `kits/pasirforge/scene/SandMonument3D.tsx` |
| `Sculpture3D` | `kits/pasirforge/scene/Sculpture3D.tsx` |
| `Beach3D` | `kits/pasirforge/scene/Beach3D.tsx` |
| `Grains3D` | `kits/pasirforge/scene/Grains3D.tsx` |
| `sculptMaterial` | `kits/pasirforge/lib/sandMaterial.ts` |
| `getPasirforgeCamera` | `kits/pasirforge/camera/rig.ts` |
| `PasirforgeOverlay` | `kits/pasirforge/camera/Overlay.tsx` |
| `PASIR_GRADE`, `SAND` | `kits/pasirforge/lib/palette.ts` |

## Fonts (bundled di starter)

Trebuchet MS / Segoe UI (system font, tidak perlu download)
