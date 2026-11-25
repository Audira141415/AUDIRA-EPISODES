---
name: paper-craft-motion
description: "Craft layered paper, origami folding, and tactile stop-motion paper cutout animations in Remotion and 3D WebGL. By AUDIRA (Agus Dwi R)."
version: "4.1.0"
author: "AUDIRA (Agus Dwi R)"
website: "https://audira.my.id/"
license: "Proprietary Commercial"
category: "motion-graphics"
engine: "Remotion + R3F (default since 2026-11-17); world3d only when the user forces it"
style_code: "PAPERCUTOUT"
---

# Paper Craft Motion Skill — AUDIRA (Agus Dwi R)

Specialized motion skill for crafting tactile paper cutout, multi-plane dioramas, origami folding transformations, and stop-motion styled craft aesthetics.

## 1. Visual DNA & Aesthetic Rules

1. **Multi-Plane Cardstock Stacking**:
   - Depth is achieved via discrete physical planes layered along the Z-axis (spacing `Z = 0.05` to `0.3` units).
   - Never use flat gradients without paper fiber texture.
2. **Tactile Paper Material**:
   - Soft directional lighting casting warm, diffuse drop shadows (`shadow-radius: 8px`, opacity `0.25 - 0.40`).
   - Subtle grain / noise overlay (`opacity: 0.04 - 0.08`) emulating 250gsm textured watercolor or kraft paper.
3. **Edge Creasing & Bevels**:
   - Faint highlight on top-left folded edges (`#ffffff` at 15% opacity), dark rim on bottom-right edges.
4. **Motion Cadence**:
   - Stop-motion cadence option: stepping frames at 12–15 fps (`Math.floor(frame / 2) * 2`) with micro-wobble rotation (`±0.5°`).
   - Smooth modern cadence: Spring physics (`damping: 14, stiffness: 120, mass: 0.8`) with paper inertia and hinge pop.

## 2. Color Palette & Craft Tokens

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `PAPER_CREAM` | `#F5F0E6` | Warm base cardstock, unbleached cotton paper |
| `KRAFT_BROWN` | `#C8A882` | Cardboard base, parcel paper, earthy elements |
| `SAGE_CARD` | `#8A9A86` | Organic foliage, botanical cutouts |
| `TERRACOTTA` | `#C9684F` | Accent layers, hero subjects, roofs |
| `DEEP_SLATE` | `#2D3748` | Deep backdrop plane, shadow contrast |
| `GOLD_FOIL` | `#D4AF37` | Metallic foil stamp accents, luxury branding |

## 3. Kinetic Patterns

- **Hinge Unfold**: Elements rotate along an off-center pivot (`transform-origin: bottom center`) from `-90deg` to `0deg`.
- **Origami Crease Morph**: Faces split along triangulated crease lines before flattening into the next subject.
- **Cardboard Slide-Out**: Layered silhouettes sliding in from stage left/right along physical craft tracks.
- **Accordion Book Expand**: Camera pans horizontally across interconnected accordion-folded scenes.

## 4. Remotion Implementation Pattern

> Contoh Remotion — hanya bila engine: remotion; untuk world3d terjemahkan ke world3d.js (fungsi murni dari t)

```tsx
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const PaperLayer: React.FC<{
  depth: number;
  color: string;
  children: React.ReactNode;
}> = ({ depth, color, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy paper pop spring
  const pop = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  const shadowOffset = depth * 6;

  return (
    <div
      style={{
        transform: `scale(${pop}) translateZ(${depth * 20}px)`,
        backgroundColor: color,
        boxShadow: `${shadowOffset}px ${shadowOffset * 1.5}px ${shadowOffset * 2}px rgba(30, 20, 10, 0.22)`,
        borderRadius: 4,
        position: 'relative',
        filter: 'contrast(102%) brightness(99%)',
      }}
    >
      {children}
    </div>
  );
};
```

## 5. Anti-Slop Enforcement
- ❌ DILARANG menggunakan bayangan hitam pekat komputer tanpa warna lingkungan (`rgba(0,0,0,1)`). Wajib menggunakan warm brown/amber ambient shadow (`rgba(35, 25, 15, 0.25)`).
- ❌ DILARANG membuat bidang kertas yang licin tanpa tekstur serat atau lipatan fisik.
- ✅ WAJIB memberikan visual ketebalan kertas (paper caliper thickness) pada tepi yang terbuka.

