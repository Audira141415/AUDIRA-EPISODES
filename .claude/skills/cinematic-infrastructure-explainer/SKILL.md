---
name: cinematic-infrastructure-explainer
description: "Cinematic 3D mega-infrastructure, civil engineering, tunneling, bridge erection, and geotechnical explainer animations. By AUDIRA (Agus Dwi R)."
version: "4.1.0"
author: "AUDIRA (Agus Dwi R)"
website: "https://audira.my.id/"
license: "Proprietary Commercial"
category: "engineering-3d"
engine: "Remotion + R3F (default since 2026-11-17); world3d only when the user forces it"
style_code: "BUILDFORGE + URBANMASSING"
---

# Cinematic Infrastructure Explainer Skill — AUDIRA (Agus Dwi R)

Specialized motion skill for engineering explainers, megaproject construction timelines, geotechnical cross-sections, tunnel boring machines (TBM), subsea foundations, and high-speed rail viaducts.

## 1. Visual DNA & Engineering Standards

1. **Orthographic & Isometric Precision**:
   - Camera: Isometric tilt (`rotation: [-Math.PI / 6, Math.PI / 4, 0]`) or dramatic cinematic low-angle dolly along viaduct alignment.
   - Scale cues: Always include a metric dimensional ruler, depth markers (`-45m Subsea Level`), or vehicle size benchmarks.
2. **Layered Subsurface & Geology**:
   - Multi-layer geological strata: Topsoil, clay, fractured limestone, solid bedrock represented with distinct textural striations.
   - Cross-section cutaways revealing rebar cages, concrete slurry walls, and prestressed tendon cables.
3. **Phased Construction Sequencing**:
   - Stage 1: Piling & Excavation (Wireframe callout + yellow boundary laser).
   - Stage 2: Substructure & Pier Formwork (Rising volumetric sweep).
   - Stage 3: Superstructure Segment Launching (Crane trolley motion + tension cable tightening).
   - Stage 4: Commissioning & Traffic Flow (Pulse particle trajectories).

## 2. Palette & Industrial Color Tokens

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `SAFETY_ORANGE` | `#FF5722` | Heavy equipment, crane rigs, active construction zone |
| `REBAR_STEEL` | `#708090` | Structural steel, wireframes, tension tendons |
| `CONCRETE_RAW` | `#B0BEC5` | Fresh poured concrete, viaduct girders, tunnel segments |
| `BEDROCK_DARK` | `#263238` | Subsurface rock strata, foundation boundary |
| `MEASUREMENT_CYAN` | `#00E5FF` | Laser levels, dimension annotations, coordinate grids |
| `WARNING_YELLOW` | `#FFD600` | Hazard stripes, exclusion zones, progress bars |

## 3. Kinetic Infrastructure Patterns

- **TBM Tunnel Boring Animation**: Rotating cutter head particle sparks with sequential concrete segmental ring installation behind the shield.
- **Balanced Cantilever Segment Placement**: Equal weight segments sliding onto bridge piers from both sides simultaneously.
- **Geotechnical Cutaway Slice**: A volumetric terrain block smoothly slices open along a designated spline, exposing internal foundations.
- **Strain & Load Telemetry**: Dynamic stress heatmap (Blue = nominal, Green = loaded, Red = maximum yield strength).

## 4. Remotion Three.js Implementation Pattern

> Contoh Remotion — hanya bila engine: remotion; untuk world3d terjemahkan ke world3d.js (fungsi murni dari t)

```tsx
import { useCurrentFrame, interpolate } from 'remotion';
import * as THREE from 'three';

export const InfrastructureSegment: React.FC<{
  index: number;
  totalSegments: number;
}> = ({ index, totalSegments }) => {
  const frame = useCurrentFrame();

  // Sequential segment lowering with pneumatic damping
  const segmentStart = index * 12;
  const progress = interpolate(frame, [segmentStart, segmentStart + 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const posY = interpolate(progress, [0, 1], [8, 0]);
  const opacity = interpolate(progress, [0, 0.4], [0, 1]);

  return (
    <group position={[index * 2.5, posY, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.2, 3.5]} />
        <meshStandardMaterial
          color="#B0BEC5"
          roughness={0.7}
          metalness={0.2}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
};
```

## 5. Anti-Slop Enforcement
- ❌ DILARANG memperlihatkan jembatan atau gedung "melayang" tanpa fondasi yang terhubung ke tanah.
- ❌ DILARANG mengabaikan skala fisik; rebar, manusia, atau truk harus memiliki proporsi yang akurat.
- ✅ WAJIB menyertakan anotasi teks teknis (misal: `C50/60 High-Strength Concrete`, `Dia. 14.2m Slurry TBM`, `Span: 120m`).

