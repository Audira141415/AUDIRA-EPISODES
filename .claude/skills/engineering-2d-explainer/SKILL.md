---
name: engineering-2d-explainer
description: "Animated 2D technical engineering explainers: blueprint schematics, exploded CAD diagrams, mechanical gear trains, hydraulic flow, and patent illustrations. By AUDIRA (Agus Dwi R). Dipilih AI bila topik cocok untuk 2D, atau bila pengguna memintanya; default AUDIRA = Remotion + R3F 3D (sejak 2026-11-17)."
version: "4.1.0"
author: "AUDIRA (Agus Dwi R)"
website: "https://audira.my.id/"
license: "Proprietary Commercial"
category: "technical-explainer"
engine: "Remotion + SVG Path Kinetics / Canvas 2D Precision"
style_code: "CIRCUITFORGE + BUILDFORGE"
---

# Animated 2D Engineering Explainer Skill — AUDIRA (Agus Dwi R)

Specialized motion skill for engineering breakdowns: internal combustion engine strokes, planetary gear mechanisms, electronic logic gates, hydraulic valves, heat exchangers, and aerospace patent line-drawings.

## 1. Visual DNA & Drafting Standards

1. **Blueprint & Patent Drafting Aesthetics**:
   - Backgrounds: Classic Prussian blueprint (`#0A1D37` with subtle `#133863` 10mm grid) or German engineering dark slate (`#12151A`).
   - Line weights: Strict technical line hierarchy:
     - Visible outlines: 2.5px solid white/cyan (`#E0F7FA`).
     - Hidden features: 1.5px dashed lines (dasharray `6, 4`).
     - Centerlines / Axes of symmetry: 1.0px center dash-dot (dasharray `12, 3, 2, 3`).
     - Dimension lines: 1.0px with sharp 45° tick marks or filled arrowhead pointers.
2. **Exploded Assembly & Callout Pins**:
   - Numbered callout balloons (e.g. `① Impeller`, `② Mechanical Seal`, `③ Ball Bearing 6205-2RS`).
   - Leader lines connect directly to the component centroid.
3. **Fluid & Power Flow Dynamics**:
   - High-pressure fluid: Vivid electric blue or hydraulic amber with sequential chevron arrows along piping splines.
   - Flow velocity changes based on pipe cross-sectional diameter (Bernoulli effect visualization).

## 2. Color Palette & Schematic Tokens

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `BLUEPRINT_BG` | `#0A1D37` | Technical blueprint background |
| `CAD_CYAN` | `#00F5D4` | Primary active mechanism, selected component |
| `DIMENSION_YELLOW`| `#FEE440` | Measurement dimensions, tolerances, angular callouts |
| `HYDRAULIC_AMBER` | `#FB5607` | Pressurized fluid, combustion heat, friction warning |
| `GRID_SUBTLE` | `#1E3A5F` | Millimeter grid reference lines |
| `CALLOUT_WHITE` | `#FFFFFF` | Text annotations, part numbers, patent labels |

## 3. Kinetic Mechanical Patterns

- **Gear Train Synchronized Meshing**:
  - `Gear A (Radius R1, Teeth N1)` drives `Gear B (Radius R2, Teeth N2)`.
  - Precise mathematical rotation: `rotationB = -rotationA * (N1 / N2)`. Never have teeth overlap or slip!
- **Exploded View Disassembly**:
  - Components displace along their functional axis with staggered cubic bezier easing.
  - Ghost outline remains at original assembled position to maintain spatial context.
- **Sectional Cutaway Sweep**:
  - Hatch lines (`angle: 45°`, spacing 4px) render progressively across cut solid walls.

## 4. Remotion SVG Path Implementation Pattern

```tsx
import { interpolate, useCurrentFrame } from 'remotion';

export const BlueprintDimensionLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}> = ({ x1, y1, x2, y2, label }) => {
  const frame = useCurrentFrame();
  const drawProgress = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g>
      {/* Dimension Line */}
      <line
        x1={x1}
        y1={y1}
        x2={x1 + (x2 - x1) * drawProgress}
        y2={y1 + (y2 - y1) * drawProgress}
        stroke="#FEE440"
        strokeWidth="1.5"
      />
      {/* Dimension Text */}
      {drawProgress > 0.6 && (
        <text
          x={midX}
          y={midY - 8}
          fill="#FEE440"
          fontSize="12"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
};
```

## 5. Anti-Slop Enforcement
- ❌ DILARANG menganimasikan roda gigi yang berputar dengan arah berlawanan dari hukum fisika (dua gigi bersentuhan harus berlawanan arah putaran).
- ❌ DILARANG menggunakan garis buram tanpa resolusi tajam vector SVG.
- ✅ WAJIB memberikan dimensi angka riil atau toleransi (misal: `Ø 45.00 ± 0.02 mm`).

