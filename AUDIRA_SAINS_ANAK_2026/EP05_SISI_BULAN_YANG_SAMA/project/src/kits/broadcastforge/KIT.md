# BROADCASTFORGE — Kit Guide (Style #82) [GOLD STANDARD BENCHMARK]

> Engine default Remotion + R3F (sejak 2026-11-17): kode TSX di bawah langsung berlaku. Untuk world3d (QISSAH rule 14 / FAKTADUNIA rule 17): terjemahkan resep look ke Three.js di project/world3d.js.

> **Style ID:** 82.  
> **Status:** gold benchmark candidate, re-score pending (see scorecard note).  
> A modern 3D virtual broadcast studio and breaking news environment: an obsidian reflective gloss floor, a sculpted anchor news desk with glowing cyan LED edge strips and an anchor behind it, a curved LED video wall wrapping behind the desk, and high-urgency broadcast graphics with a pulsing `LIVE` bug, a lower third and a continuous ticker marquee. The signature motion is the studio jib descent (from a high establishing wide `[0, 3.4, 8.6]` down to the anchor two-shot `[x, 1.65, 6.6]` over the first 3.5 seconds), paired with a scanline sweeping the video wall and an authoritative, disciplined broadcast presence.

---

## 🏆 Gold Benchmark Scorecard & Audit Metrics

The earlier 20/20 scorecard was recorded before the curved video wall bug was found: a `[0, π, 0]` rotation put the wall between camera and desk and rendered a black frame. The bug was fixed on 2026-11-18 (cylinder offset +r on z, see Materials) together with the FilmScene rewrite. Re-score the kit from a fresh contact sheet before calling it gold again. The guardrails below still apply.

| Audit Dimension | Target | Guardrail |
| :--- | :---: | :--- |
| **Studio Lighting** | `5 / 5` | Warm key with PCF shadow, cool fill, cyan point behind the anchor; AO from FilmScene. |
| **PBR Materials** | `5 / 5` | Obsidian floor clearcoat 0.65 / roughness 0.16; smoked acrylic desk top (transmission 0.45). |
| **Layered Depth** | `5 / 5` | Foreground name bar + desk monitors → midground desk, anchor, riser → background curved LED wall. |
| **Composition & HUD** | `5 / 5` | 9:16 safe zone: nothing above y 180 or below y 1540 on the 1080 × 1920 layout canvas. |
| **Determinism (check:det)** | `100%` | Pure functions of `f` (60 FPS film clock). No unseeded random, no `Date.now()`. |
| **Mute-Test Readiness** | `100%` | Headline, category and ticker understandable with audio off. |
| **Audio Mastering** | `EBU R128` | −14 LUFS, true peak ≤ −1 dBFS, ducking under VO. |

---

## Quick Start

```tsx
import { BroadcastForgeExample, BROADCASTFORGE_EXAMPLE_SECONDS } from "./example/BroadcastForgeExample";
import type { BroadcastForgeExampleProps } from "./example/BroadcastForgeExample";
import { VirtualNewsStudio3D } from "./scene/VirtualNewsStudio3D";
import { BroadcastCurvedScreen3D } from "./scene/BroadcastCurvedScreen3D";
import { LowerThirdTicker3D } from "./scene/LowerThirdTicker3D";
import { getBroadcastForgeCamera, getMultiCamBroadcastCamera } from "./camera/rig";
import type { BroadcastForgeCameraConfig } from "./camera/rig";
import { BroadcastForgeOverlay } from "./camera/Overlay";
import type { BroadcastForgeOverlayProps, MarketIndexItem } from "./camera/Overlay";
import { computeBroadcastForgeState } from "./core/motion";
import type { BroadcastCameraMode, BroadcastForgeState } from "./core/motion";
import { getStudioFloorMaterial, getStudioDeskMaterial, getCurvedScreenMaterial, getNeonStripMaterial, getBreakingBannerMaterial } from "./lib/materials";
import { BROADCASTFORGE_PALETTE } from "./lib/palette";
```

Source of truth is `starter/src/kits/broadcastforge/` (the `kits/broadcastforge/src/` mirror is stale). The kit uses the starter core: `core/scene/FilmScene.tsx`, `core/assets/AssetModel.tsx`, `core/polish/Polish.tsx`, `core/polish/Person.tsx` (`ToyPerson`), `core/type/displayFonts.ts`, `core/film/format.ts`, `core/camera/moves.ts`.

Compositions: `BroadcastForgePreview` (540x960@30), `BroadcastForgeFinal` (1080x1920@60), `BroadcastForgeWidePreview` and `BroadcastForgeWideFinal` (16:9), 12 s (`BROADCASTFORGE_EXAMPLE_SECONDS`). `BroadcastForgeExample` takes `useMultiCam?: boolean` (default `false`).

---

## Palette Tokens

| Name | Hex | Role |
| --- | --- | --- |
| `studioVoid` | `#070A0F` | Deep studio space background (`FilmScene background`), fog, riser |
| `floorGloss` | `#0F1722` | Obsidian reflective studio floor base |
| `breakingRed` | `#D32F2F` | Accent: LIVE bug, category strip, news orb, ticker top border, opening stinger |
| `liveAmber` | `#FFA000` | Sub-accent: location line, FLASH label, waveform bars |
| `broadcastNavy` | `#0B2545` | Dominant: desk body, LED wall emissive |
| `screenBlue` | `#1E88E5` | Video wall panels |
| `cyanAccent` | `#00E5FF` | Floor ring, LED edge strips, scanline, clock, PIP border, headline rule |
| `headlineWhite` | `#FFFFFF` | Headline and channel text |
| `tickerText` | `#ECEFF4` | Marquee ticker, sub-headline, correspondent name |
| `plateDark` | `rgba(12, 18, 28, 0.92)` | Lower-third and PIP backing plate |

---

## Finish Defaults

Source: example (`BroadcastForgeExample.tsx`). Update from motion memory or gold episodes when available.

```json
{
  "finishProfile": "CYBER_NEON_VOID",
  "exposure": 1.0,
  "envIntensity": 0.45,
  "hdri": "studio",
  "ao": true,
  "background": "#070A0F"
}
```

```tsx
<FilmScene
  frame={frame}
  shot={{ pos: cam.position, target: cam.target, fov: cam.fov }}
  background={C.studioVoid}
  profile={COLOR_PROFILES.CYBER_NEON_VOID}
  hdri="studio"
  envIntensity={0.45}
  near={0.05}
  far={80}
  overlay={() => <BroadcastForgeOverlay f={f} showPipCorrespondent />}
>
  {/* lights, studio, wall, ticker, anchor, monitors */}
</FilmScene>
```

`FilmScene` gives dpr 1.5, antialias, PCF shadows and one Finish chain (AO on by default, exposure default 1 on the dark background), and lays the overlay out on the 1080 × 1920 layout canvas scaled by `useFormat()`.

## Depth Recipe

- **Layer 1 (back):** Curved LED video wall at z ≈ −2.2 — emissive navy glow, map panels, data tower, PIP frame, scanline sweep.
- **Layer 2 (mid):** Anchor (`ToyPerson`) behind the desk on the riser; desk with smoked acrylic counter and cyan LED edge strip.
- **Layer 3 (front):** `LowerThirdTicker3D` glass name bar + news orb across the desk front, desk monitors on the wings, HUD overlay.
- **Fog:** Linear `#070A0F` near 8 / far 22 separates planes.
- **Floor reflections:** Obsidian clearcoat mirrors the desk and wall, adding depth without an extra layer.

---

## Materials & Mesh Hierarchy

- **Studio Floor:** 16 × 16 plane, `meshPhysicalMaterial` `#0F1722`, roughness 0.16, metalness 0.42, clearcoat 0.65, clearcoatRoughness 0.12; two floor rings (cyan r 2.8, red r 3.4) and a riser cylinder (r 2.5–2.7).
- **News Anchor Desk:** `RoundedBoxGeo` 2.4 × 0.7 × 0.8 (radius 0.15), physical `#0B2545` roughness 0.22, metalness 0.48, clearcoat 0.45; smoked acrylic counter `RoundedBoxGeo` 2.5 × 0.04 × 0.9 (transmission 0.45, thickness 0.06); embedded cyan tablet, cyan LED edge strip and a pulsing red emblem plate. The desk breathes ±0.04 on y.
- **Curved LED Video Wall:** group at `[0, 1.85, −2.2]`; open cylinders r 5.22 (backing, h 3.25, θ 0.71π…1.29π) and r 5.18 (emissive LED surface, h 3.12), 48 radial segments, both offset **+5.2 on z** so the arc faces −z and sits behind the desk with its wings curving toward camera. Earlier code rotated the wall `[0, π, 0]`, which flipped the arc to +z between camera and desk and rendered a black frame; fixed on 2026-11-18. Content: five pulsing map panels, a radar ping ring, a left data tower, a right PIP frame, a scanline sweep and cyan/red bezel strips.
- **Lower-third bar (`LowerThirdTicker3D`):** takes `position` (default `[0, 0.95, 0.9]`; the example uses `[0, 0.42, 0.97]`, across the desk front); glass name bar (transmission 0.55, clearcoat 0.85) with red and cyan trims, and a spinning red news orb with cyan and amber rings.
- **Overhead trusses:** two truss bars with spotlight heads at x ±2.5, y 3.2.
- `lib/materials.ts` helpers (`getStudioFloorMaterial`, `getStudioDeskMaterial`, `getCurvedScreenMaterial`, `getNeonStripMaterial`, `getBreakingBannerMaterial`) are exported for episodes; the scene components build their materials inline.

## Assets (GLB)

The example loads one Polyfork ID through `<AssetModel>` (local `public/models/polyfork/<id>.glb` first, then CDN):

- `desk-monitor-32cfce` (two desk monitors, size 0.5, at x ±0.95, y 0.86, z 0.55, turned ±0.55 rad toward the anchor, `polish="toyPlastic"`): procedural `MonitorBlock` fallback.

The anchor is procedural: `<ToyPerson seed={21} outfit="formal" pose="stand" expression="neutral" position={[0, 0.1, −0.15]} scale={1.65} />` with a navy suit look.

---

## Lighting & Atmosphere

The example sets its own lights (no `KeyLight`):

- `ambientLight`: intensity `0.35`.
- Key: `directionalLight` `[3.5, 6.0, 5.0]`, intensity `2.2`, warm `#FFF2E2`, `castShadow`, 2048 map, shadow box ±5, bias −0.0004.
- Fill: `directionalLight` `[−4.0, 3.5, 3.0]`, intensity `0.9`, cool `#90CAF9`.
- Rim: `pointLight` `[0, 2.4, −0.9]`, intensity `1.4`, `cyanAccent`, distance `4` (behind the anchor).
- Fog: linear `#070A0F` (`near: 8`, `far: 22`), set in `VirtualNewsStudio3D`.

---

## Camera Choreography (9:16 + 16:9)

- **Continuous jib (default, `getBroadcastForgeCamera(f)`):** one `shotPlan` at 60 FPS with keys at 0, 1, 3, 5.5, 8, 10, 12 s, `alive: { deg: 0.4 }`, no DOF. Framing at second t, with `s = smoothstep(min(1, t / 3.5))`:
  - pos `[sin(t·0.32)·0.9, 3.4 − 1.75·s, 8.6 − 2.0·s]`, target `[0, 1.2 − 0.2·s, −0.4]`, fov `46 − 4·s`.
  - 0 s: high wide `[0, 3.4, 8.6]`, fov 46 → 3.5 s on: anchor two-shot at y 1.65, z 6.6, fov 42, with a slow ±0.9 lateral sway.
  - Framed for 9:16: the 2.5-unit desk needs ~6.5 units of distance at fov 46 to fit the width with margin.
- **Multi-cam director (`getMultiCamBroadcastCamera(f)`, `useMultiCam`):** hard cuts.
  - 0–3 s Cam 1 wide: pos `[~0, 3.1→2.8, 8.4]`, target `[0, 1.25, −0.4]`, fov 46.
  - 3–7 s Cam 2 anchor: pos `[~0, 1.6, 5.2]`, target `[0, 1.25, 0]`, fov 40.
  - 7–10 s Cam 3 over-the-shoulder on the wall: pos `[−1.8→−1.5, 1.5, 5.4]`, target `[0.6, 1.9, −2.2]`, fov 44.
  - 10–12 s Cam 4 low angle: pos `[~0, 0.9, 6.4]`, target `[0, 1.4, 0]`, fov 44.
- **16:9:** handled by `<FormatFov />` inside FilmScene; the 16 × 16 floor and the wall wings fill the sides.

---

## Text & Readability

- Overlay (`BroadcastForgeOverlay`) uses layout pixels on the 1080 × 1920 canvas: nothing above y 180 or below y 1540, sides 60 px (96 in 16:9), all text ≥ 36 px.
- Fonts (`core/type/displayFonts.ts`): `DISPLAY.condensed` (Anton) for LIVE bug, channel name, category, headline, PIP title and FLASH label; `DISPLAY.grotesk` (Space Grotesk) for clock, location, ticker, REC and correspondent; `DISPLAY.body` (Manrope) for the sub-headline.
- Blocks: top bar (LIVE bug + channel 44 px, clock 38 px) at y 192, location line 36 px below it; field-correspondent PIP top right (330 px wide, waveform bars, name 36 px); lower third (category strip 44 px, headline 64 px, sub-headline 36 px) above the ticker; ticker 64 px tall ending exactly on y 1540 with an amber FLASH label and a 36 px marquee.
- Build-in: opening red stinger flash (first 18 frames), top bar 0.2 s, lower third wipe 0.8 s, ticker 1.2 s, PIP 1.6 s.
- Props: `channelName`, `category`, `headline`, `subHeadline`, `location`, `clock` (default `"15:20 WIB"`), `tickerItems`, `marketIndices`, `showPipCorrespondent`, `correspondent` (default `"DR. H. ARISANDI"`).
- The marquee container has `data-layout-ignore`, so `npm run audit:layout` skips the intentionally clipped ticker text.

## Mute-Test Checklist (Strict Visual QA)

| Checkpoint | Requirement | Verification Method |
| :--- | :--- | :--- |
| **Headline Legibility** | 64 px Anton headline on the dark plate with cyan rule; no text under 36 px | Read at 390px mobile viewport width |
| **Urgency Indicators** | Pulsing `LIVE` bug and `BREAKING NEWS` category strip | Top bar visible from 0.2 s, lower third from 0.8 s |
| **Ticker Continuity** | Marquee translation at steady `2.8 layout px / film frame`, looping on one copy | 60 FPS zero-jitter audit |
| **Safe Zone Margin** | Content between y 180 and y 1540 | `npm run audit:layout` (marquee is `data-layout-ignore`) |

---

## 4-Still Audit Timecodes (20% / 45% / 70% / 92%)

- **20% (f=144, 2.4s):** Late descent. Desk rim and floor reflections catch the key light; wall visible behind the anchor (not black).
- **45% (f=324, 5.4s):** Anchor two-shot. Headline fully readable, video wall scanline visible.
- **70% (f=504, 8.4s):** Steady state with lateral sway. Ticker still scrolling.
- **92% (f=662, 11.0s):** All text plates crisp without blur or flicker.

---

## Avoid

- Blurred drop shadows on text plates (use solid plates with crisp borders).
- Handheld / shaky camera motion (broadcast studio cameras use hydraulic pedestals).
- Flooding the studio wall with red (red is only for the LIVE bug and breaking-news accents).
- Ornamental or cartoon fonts: keep Anton / Space Grotesk / Manrope.
- Text outside the safe zone (above y 180 or below y 1540).
- Rotating the curved wall `[0, π, 0]`: it puts the wall between camera and desk (black frame). Offset the cylinder +r on z instead.
- Looking like TRADINGTERMINAL (financial ticker, dark trading UI) or SATELLITEBRIEFING (satellite imagery, map overlays): BROADCASTFORGE is a sculpted 3D news studio with a reflective floor and anchor desk.

## Directing a BROADCASTFORGE film

1. **Jib descent opening:** open with the hydraulic jib descent from the high wide `[0, 3.4, 8.6]` to the anchor two-shot (y 1.65, z 6.6) over 3.5 seconds — this is the signature move.
2. **Continuous ticker:** the overlay marquee scrolls at a steady 2.8 layout px per film frame, never pauses, never jumps.
3. **LIVE pulse:** the red LIVE bug pulses from the opening stinger onward to signal urgency.
4. **Scanline sweep:** the scanline sweeps continuously across the curved LED wall — the wall is never static.
5. **Obsidian floor reflections:** keep the floor clearcoat ~0.65 / roughness ~0.16 for the studio-grade reflection.

## Known Limits

- The curved LED wall (48 radial segments) can cause moiré on very fine grid overlays; keep wall content to solid panels or large text blocks.
- Obsidian floor reflections and transmissive glass (desk counter, name bar) can slow renders on low-end GPUs; reduce clearcoat/transmission for preview compositions if needed.

## Kit Components

| File | What it does |
| --- | --- |
| `example/BroadcastForgeExample.tsx` | Full 12 s example through `FilmScene`; exports `BroadcastForgeExample` (prop `useMultiCam`), `BroadcastForgeExampleProps`, `BROADCASTFORGE_EXAMPLE_SECONDS`; ToyPerson anchor + desk-monitor GLBs |
| `scene/VirtualNewsStudio3D.tsx` | `VirtualNewsStudio3D` (prop `f`): obsidian floor, floor rings, riser, desk with acrylic counter and LED strip, trusses, fog |
| `scene/BroadcastCurvedScreen3D.tsx` | `BroadcastCurvedScreen3D` (prop `f`): curved LED wall (r 5.2, 48 segments, offset +r on z) with panels, radar ring, data tower, PIP frame, scanline |
| `scene/LowerThirdTicker3D.tsx` | `LowerThirdTicker3D` (props `f`, `position`): 3D glass name bar with trims + spinning news orb |
| `camera/rig.ts` | `getBroadcastForgeCamera(f)` (continuous jib, `alive: { deg: 0.4 }`), `getMultiCamBroadcastCamera(f)` (4-cam cuts) → `BroadcastForgeCameraConfig { position, target, fov }` |
| `camera/Overlay.tsx` | `BroadcastForgeOverlay`: stinger, LIVE top bar + clock, location, correspondent PIP, lower third, FLASH ticker; `MarketIndexItem`, `BroadcastForgeOverlayProps` |
| `core/motion.ts` | `computeBroadcastForgeState(f, cameraMode?)`: LIVE pulse, ticker scroll, wall glow, desk breathing, radar wave, waveform levels, market pulse, stinger, active camera index |
| `lib/materials.ts` | `getStudioFloorMaterial`, `getStudioDeskMaterial`, `getCurvedScreenMaterial`, `getNeonStripMaterial`, `getBreakingBannerMaterial` |
| `lib/palette.ts` | `BROADCASTFORGE_PALETTE` tokens, `BroadcastForgePaletteKey` |
