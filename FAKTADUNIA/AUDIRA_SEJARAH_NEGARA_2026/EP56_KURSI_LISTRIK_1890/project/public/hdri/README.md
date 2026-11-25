# HDRI environments

Equirectangular HDR images used as reflection environments by `src/core/render/Finish.tsx`
(`<Finish hdri="studio" | "warmStudio" | "sky" | "night" | "sunset" | "forest" | "city" | "workshop" />`).
They light reflections only; they are not shown as a visible background.

| Key | File | Source | License |
|---|---|---|---|
| `studio` | `studio_small_09_1k.hdr` | [Poly Haven: Studio Small 09](https://polyhaven.com/a/studio_small_09) | CC0 |
| `warmStudio` | `brown_photostudio_02_1k.hdr` | [Poly Haven: Brown Photostudio 02](https://polyhaven.com/a/brown_photostudio_02) | CC0 |
| `sky` | `kloofendal_48d_partly_cloudy_puresky_1k.hdr` | [Poly Haven: Kloofendal 48d Partly Cloudy (Pure Sky)](https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky) | CC0 |
| `night` | `moonless_golf_1k.hdr` | [Poly Haven: Moonless Golf](https://polyhaven.com/a/moonless_golf) | CC0 |
| `sunset` | `venice_sunset_1k.hdr` | [Poly Haven: Venice Sunset](https://polyhaven.com/a/venice_sunset) | CC0 |
| `forest` | `small_empty_room_3_1k.hdr` | [Poly Haven: Small Empty Room 3](https://polyhaven.com/a/small_empty_room_3) | CC0 |
| `city` | `potsdamer_platz_1k.hdr` | [Poly Haven: Potsdamer Platz](https://polyhaven.com/a/potsdamer_platz) | CC0 |
| `workshop` | `adams_place_bridge_1k.hdr` | [Poly Haven: Adams Place Bridge](https://polyhaven.com/a/adams_place_bridge) | CC0 |

All CC0: free for commercial use, no attribution required (credited here anyway).

## Use cases

- **studio** — neutral studio, best for product/tech (metal reads silver)
- **warmStudio** — warm photo studio, skin tones and organic materials
- **sky** — outdoor daylight, landscapes and architecture
- **night** — dark moonless sky, noir/horror/space kits
- **sunset** — golden hour warmth, historical/documentary feels
- **forest** — soft diffuse indoor light, calm/educational kits
- **city** — urban evening with mixed lighting, modern/news kits
- **workshop** — industrial interior with warm practicals, maker/craft kits

## Download

Missing files? Run: `node scripts/download-hdri.mjs`
