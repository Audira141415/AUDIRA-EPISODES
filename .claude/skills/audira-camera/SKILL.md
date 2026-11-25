---
name: audira-camera
description: Remotion + R3F camera (default engine sejak 2026-11-17). Plan and build the camera for an AUDIRA Remotion + React Three Fiber film, then measure it. Use when writing a camera rig or shot list for a kit or episode, when a draft or final looks static, parked, jerky or too fast, when the motion score is low, or before scoring motion in motion memory. Covers the shot list in seconds (core/camera/moves.ts), starting from the approved cover pose, framing for 9:16 and 16:9, and npm run audit:camera.
---

# AUDIRA camera (Remotion + R3F)

> world3d (hanya bila dipaksa): kamera = spline `track()` dari `_tools/lib3d.js`, setiap key memakai anchor K / AT (bukan detik absolut); lihat `F:/AUDIRA-EPISODES/shared/world3d/BRIEF.md`. Isi di bawah berlaku untuk engine default Remotion + R3F.

The camera is what makes a 3D film read as a film instead of a slideshow. This skill gives one way to write it (a shot list compiled into one smooth track) and one way to check it (a measured motion score from the rendered video).

HyperFrames films follow `motion-doctrine` instead; this skill is for the starter's React Three Fiber scenes.

## When to use

- Writing or rewriting `src/kits/<kit>/camera/rig.ts` or an episode's camera.
- A draft or final where the picture stops, jerks when one move hands over to the next, or races across the scene.
- Before `audira_style_memory record_score` for a draft or final: motion comes from `audit:camera`, not from looking at stills.

## Workflow

1. **Start from the cover.** The hook opens on the approved cover framing (`style/cover-topic.png`). Render the cover from the film's own composition at the hook frame, save its framing in `style/cover.json`, and use it as `start` in `shotPlan`, so the first frame matches the thumbnail people clicked (rule 07 section 9c). Check it with `npm run audit:cover -- <film.mp4> style/cover-topic.png`: opening SSIM ≥ 0.55 and look distance ≤ 22.
2. **One beat per VO beat.** Take the beat times from the VO timing (audio is the master clock) and give each beat one move. Use 3 to 6 seconds per move in a short and 5 to 12 seconds in a long-form chapter.
3. **Write the shot list** with `shotPlan(fps, start, beats)` from `core/camera/moves.ts`. Moves: `pushIn`, `pullOut`, `orbit`, `crane`, `truck`, `lookAt`, `frame`, `reveal`, `dollyZoom`, `dutch`, plus `hold` / `settle` to land.
4. **Sample it** with `cameraAt(rig, frame, fps, { lens, alive: true })` and pass the Shot to `<CameraRig shot={...} />` and `<Post shot={...} />`. `alive` adds a slow seeded drift, so a held framing still shows parallax without shaking.
5. **Fit the subject** with `fitDistance(height, width, fov, aspect)` instead of guessing a distance. A 9:16 frame is narrow: the width limit usually wins.
6. **Check the rig** before rendering anything. It reads the rig's own maths frame by frame, so parallax cannot fool it:
   ```bash
   npm run audit:rig -- src/kits/<kit>/camera/rig.ts <poseFunction> --frames=<n> --fps=<film fps>
   ```
   It reports jumps (the camera teleports), abrupt speed changes, mid-film stops and peak speed. Aim for 5/5.
7. **Measure the video** on a 15–20 s draft clip (540×960) — draft clips for Remotion rule 13/14 only; world3d uses contact sheet + `look.json`, no MP4 draft — or the whole final:
   ```bash
   npm run audit:camera -- out/draft-clip.mp4 --json=out/camera.json
   ```
   Send `camera.json` as `camera` in `audira_style_memory record_score`. Its score sets and caps `motion` and counts as the motion evidence. A cover is a still and gets no motion score.

## Example

```ts
import { shotPlan, cameraAt, pushIn, orbit, crane, settle, hold, fitDistance } from "../../../core/camera/moves.ts";

const COVER = { target: [0, 1.2, 0] as [number, number, number], az: 28, el: 16, dist: fitDistance(3, 2.4, 32), fov: 32 };
export const RIG = (fps: number) => shotPlan(fps, COVER, [
  { at: 0, move: hold() },          // hook on the cover framing
  { at: 0.9, move: pushIn(0.72) },  // into the subject as the hook line lands
  { at: 4.2, move: orbit(-40) },    // reveal the mechanism side
  { at: 8.0, move: crane(20, 0.6) },// rise for the overview
  { at: 11.5, move: settle() },     // land for the payoff text
]);
// in the scene: const shot = cameraAt(RIG(fps), frame, fps, { lens: LENS, alive: true });
```

## What audit:camera measures

The audit uses ffmpeg `vidstabdetect` motion vectors on the rendered video, finds pan, zoom and roll per step, and skips hard cuts (`scdet`). The score starts at 5 and loses points for:

| Problem | Threshold | Points |
|---|---|---|
| Parked camera (whole seconds without movement) | > 15 % / > 45 % / > 75 % of seconds | −1 / −2 / −3 |
| Longest hold | > 3 s | −1 |
| Jerks and pops (cuts excluded), indicative | > 4 / > 10 per 10 s | −1 / −2 |
| Too fast (> 0.6 frame widths per second) | > 10 % of seconds | −1 |

Short planned stillness is allowed (a payoff hold, the outro card): up to 15 % parked seconds and 3 s holds are free. The per-second strip in the output (`. - = # !`) shows where to fix.

**What it measures well and what it does not.** It measures the picture, so it counts fast-moving foreground objects too: a giant gear spinning past the lens reads as motion, which is also a readability problem. Parked seconds, long holds, speed and pops are reliable. Jerk counts are only indicative in 3D: when the camera passes close to objects at several depths, parallax alone produces velocity changes as large as a real handover jerk. For example, a rig that is mathematically smooth still measured 7.5 per 10 s. For smoothness, trust `audit:rig`.

**Baseline, 2026-11-10.** The 69 kit preview examples averaged 3.4 on `audit:camera`, and 16 kits scored 1 (very fast or chaotic). The usual cause is rigs written as separate eased `lerp` segments: each segment stops dead at its boundary, and the next one sometimes starts from a different position, so the camera teleports. Polyverse is the reference port: `audit:rig` went from 1/5 (jumps at 2.5 s and 5.33 s, peak 18.7 widths/s, 29 abrupt changes) to 5/5 (no jumps, no stops, peak 0.64).

## Pitfalls

- **A rig that never reaches the camera.** `<ThreeCanvas camera={{ position, fov }}>` only sets the camera when the canvas is created, and `onCreated={({ camera }) => camera.lookAt(...)}` runs once. A rig passed that way leaves the camera parked on frame 0. Drive it every frame with `<PoseCamera position target fov />` (`core/camera/PoseCamera.tsx`) or `<CameraRig shot />` (`core/render/Post.tsx`). On 2026-11-10, 13 kit examples had this bug, and `audit:camera` still scored them 5/5 because their scenes moved: the video audit cannot tell a parked camera from a moving scene. So check that the rig is wired before trusting the video score.

- **Separate lerps per beat** stop at each beat and start the next from zero, which reads as a jerk on every handover. Put all beats on one `shotPlan` track.
- **Fast travel across the set** (more than about half the frame width per second) blurs at 30 fps and scores as too fast. Use a cut, a `lookAt` over 1–2 s, or a slower `truck`.
- **Holding the cover framing for long**: the cover is the first frame, not a still shot. Leave it within 1 s.
- **Do not score motion from a contact sheet.** Stills cannot show motion.
- **Roll**: keep `dutch` under about 8° and only for tension beats.
- **16:9 renders**: author the fov for 9:16; `<FormatFov/>` (in `Stage3D` and `Finish`) converts it. Check `fitDistance` with `aspect = 16 / 9` for wide films.

## Files

- `starter/src/core/camera/moves.ts`: shot list, moves, `cameraAt`, `fitDistance`, `coverPose`
- `starter/src/core/camera/director.ts`: the spherical rig the moves are built on
- `starter/src/core/camera/handheld.ts`: optional handheld shake, dolly-zoom fov, whip-pan curve
- `starter/src/core/camera/PoseCamera.tsx`: drives the R3F camera from a pose every frame
- `starter/scripts/camera-audit.mjs` and `scripts/lib/camera-metrics.mjs`: the video measurement (`npm run audit:camera`)
- `starter/scripts/rig-audit.mjs`: the rig measurement (`npm run audit:rig`)
- `starter/src/kits/polyverse/camera/rig.ts`: reference port of a segmented rig to `moves.ts`
