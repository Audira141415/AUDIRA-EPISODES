# KIT CONTRACT — AUDIRA-SKILL-MOTION

Every kit (all 82 styles) must follow these rules, no exceptions.
Rules derived from voynann-motion v1.2.0 patterns proven across real MP4 renders.

---

## 1. Post chain — correctness (NaN guard + FX_LAYER)

**Use `FilmScene` or `Post` directly. Never bypass the post chain.**

```tsx
// CORRECT — FilmScene wraps Post internally
import { FilmScene } from "../../core/scene/FilmScene.tsx";

// CORRECT — direct Post usage
import { Post, FX_LAYER } from "../../core/render/Post.tsx";
// or via Finish:
import { Finish } from "../../core/render/Finish.tsx";
```

Any mesh that is additive / volumetric (glow, light shaft, beam, halo) MUST be on FX_LAYER:

```tsx
import { FX_LAYER } from "../../core/render/Post.tsx";
// in JSX:
<mesh ref={r => r && r.layers.set(FX_LAYER)} ... />
// or use FxMesh:
import { FxMesh } from "../../core/fx/FxMesh.tsx";
```

**Why:** one NaN pixel spread by bloom blanks the entire frame with no error message.
Large transparent volumes on the default layer corrupt GTAO and depth-of-field passes.

---

## 2. Camera — no hardcoded positions across time

**Use `track.ts` + `director.ts` for all camera moves.**

```ts
import { keys, sample } from "../../core/motion/track.ts";
import { shotAt } from "../../core/camera/director.ts";

// define once, outside the component
const CAM: Key[] = keys(
  [0,   0, 2, 0,  12, 50, 24],   // frame, tx,ty,tz, az,el,dist,fov
  [120, 0, 2, 0, -18, 55, 38, 28],
);

// inside component:
const shot = shotAt(CAM, frame, { aperture: 0.002, maxBlur: 0.006, exposure: 1.0 });
```

**Never:** `camera.position.lerp(...)` per frame, `useFrame` for animation state,
`Math.sin(frame)` as a camera driver, hardcoded position that ignores VO timing.

**Why:** Catmull-Rom + Fritsch-Carlson monotone clamp = no kinks at keyframe handoffs,
no accidental overshoot. This is what makes motion feel expensive.

---

## 3. Object animation — named easing curves

**Use `ease.*` from `easing.ts` and `seg()` for all timed moves.**

```ts
import { ease, seg, settle } from "../../core/motion/easing.ts";

// eased progress through a window:
const p = seg(frame, startF, endF, ease.glide);  // default: ease.inOut

// after a mechanical stop / snap:
const wobble = settle(frame - impactFrame, 0.08); // critically-damped
```

Named curves and their use:

| Curve | Use |
|---|---|
| `ease.glide` | default object move — decisive start, long settle |
| `ease.inOut` | camera, large objects — symmetric, weighty |
| `ease.release` | magnet-letting-go energy, long deceleration |
| `ease.attract` | magnetic snap/dock — gathers speed, arrives fast |
| `ease.type` | text reveals |
| `ease.sine` | subtle ambient drifts |
| `settle()` | post-impact wobble / spring |

**Never:** `Math.sin(frame * k)` for object position, bare `lerp` with no easing,
linear interpolation for anything visible to the camera.

---

## 4. Determinism — pure functions of frame

**Everything computed from `t = frame / fps` or `frame` directly.**

```tsx
// CORRECT
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const t = frame / fps;
const pos = myAnimation(t);

// WRONG
const pos = useRef(0);
useFrame((_, delta) => { pos.current += delta * speed; }); // NOT deterministic
```

**Never:**
- `Math.random()` at render time — use seeded `rng` from `core/motion/noise.ts` (PIXELSTORY) or a seed derived from frame
- Wall clock (`Date.now()`, `performance.now()`) for animation
- `useFrame` for animation state (only allowed for `Post` composer render call)
- Independent animation loops that drift from VO timing

**Why:** Remotion renders frames out of order and in parallel. Non-deterministic code
produces different results per run; the final MP4 will have flicker or stutters.

---

## 5. Scene structure — multi-scene, not monolithic

**Every 60–90 s video must have ≥ 4 distinct visual scenes.**

```tsx
// CORRECT
{t < 15 && <Scene1_Hook />}
{t >= 15 && t < 45 && <Scene2_Development />}
{t >= 45 && t < 70 && <Scene3_Conflict />}
{t >= 70 && <Scene4_Outro />}

// WRONG — one object the whole duration, camera just rotates around it
<TheOnlyObject position={...} />
```

---

## 6. VO timing — audio master clock

Scene cuts follow VO, not hardcoded seconds.

```ts
// derive cuts from VO word timestamps (audira_generate_voiceover output)
// never from "I think this scene should be ~15 seconds"
const SCENE_CUTS = {
  hook: 0,
  development: voTimestamps.word("kunci").start,
  conflict: voTimestamps.word("akibat").start,
  outro: voTimestamps.word("jadi").start,
};
```

---

---

## 7. 3D Scene QA — before final render

**Run `node scripts/qa-scene.mjs --comp=<PreviewComp> --cuts=s,s,…` on the preview composition.**

It checks for:
- **TEMBUS** — a character's hand through a prop, body through furniture (depth > 1.5% of solid)
- **LONCAT** — a part snapping or flicking for 1–2 frames (> 2% of body size in one frame)
- **KEDIP** — a tagged solid vanishing or blinking for 1–2 frames

Tag every character, held prop, and touched furniture with `<Solid>`:

```tsx
import { Solid, QaProbe, qaNoOverlay } from "../../core/qa/scene-qa.tsx";

// wrap the character
<Solid id="raka" kind="body">
  <MyCharacter />
</Solid>

// wrap a held prop (touch = who holds it)
<Solid id="cangkir" kind="prop" touch={["raka"]}>
  <Cup />
</Solid>

// wrap furniture (set vs set is never checked)
<Solid id="kursi" kind="set" touch={["*"]}>
  <Chair />
</Solid>

// in the overlay, exclude captions from the 3D scan
{qaNoOverlay() ? null : <MyOverlay />}
```

`Stage3D` mounts `<QaProbe />` automatically. Exit 0 = PASS, 1 = FAIL (do not render final), 3 = CHECK.

**Why:** mesh penetration, one-frame jumps and frame blinks make a production look cheap. The video scan
(`qa-video.mjs`) also runs on clean 3D frames automatically, catching z-fighting and shimmer not covered
by the tagged-solid checks.

---

## Checklist before first render

- [ ] Post chain uses `FilmScene`, `Post`, or `Finish` — not bypassed
- [ ] All glow/shaft/halo meshes use `FX_LAYER`
- [ ] Camera uses `track.ts` + `director.ts` keyframes
- [ ] All object moves use `ease.*` or `seg()`
- [ ] No `Math.random()` at render time
- [ ] No `useFrame` for animation state
- [ ] ≥ 4 scenes for 60–90 s video
- [ ] Scene cuts derived from VO timestamps
- [ ] `qa-scene.mjs` PASS before final render (characters/props tagged with `<Solid>`)
